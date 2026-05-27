import React, { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ButtonGhost,
  ButtonPrimary,
  ButtonTertiary,
  buttonShapes,
  Chip,
  chipStyles,
  chipVariants,
  type ChipStyleValue,
  constants,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  iconType,
  Input,
  PropertyItem,
  Select,
  propertyItemVariants,
  Skeleton,
  skeletonVariants,
  TextArea,
  Typography,
} from '@goat-ui/goat-ui-core'
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument, type DocumentStatus } from './documents'

const { colorPalette, spacing } = constants
const TOP_BAR_BG = '#1e1f2e'
const SUMMARY_MAX = 500

const DOMAIN_OPTIONS = [
  { label: 'HR', value: 'HR' },
  { label: 'HR/Tax', value: 'HR/Tax' },
  { label: 'Tax', value: 'Tax' },
]

type Tag = { text: string; style: string; variant?: string }

function getDocumentTags(doc: MetadataDocument): Tag[] {
  const tags: Tag[] = []
  tags.push({ text: doc.domain, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.tagList?.length) {
    tags.push(...doc.tagList.map(t => ({ ...t, variant: chipVariants.HIGHLIGHT })))
  }
  if (doc.namedEntity !== '—') tags.push({ text: doc.namedEntity, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.namedEntityId !== '—') tags.push({ text: doc.namedEntityId, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.jurisdiction !== '—') tags.push({ text: doc.jurisdiction, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.lawType !== '—') tags.push({ text: doc.lawType, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.citations !== '—') tags.push({ text: doc.citations, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.monetaryAmounts > 0) tags.push({ text: `${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}`, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.monetaryTypes !== 'None') tags.push({ text: doc.monetaryTypes, style: chipStyles.ACCENT_NEUTRAL })
  return tags
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const PROP_LABEL = { size: 'base' as const, color: 'neutral-darken2' as const, width: '130px' }
const PROP_VALUE = { size: 'base' as const, color: 'neutral-darken5' as const }

function PropRow({ children }: { children: ReactNode }) {
  return <div style={{ padding: '6px 0' }}>{children}</div>
}

function toRoman(n: number): string {
  const vals = [10, 9, 5, 4, 1]
  const syms = ['X', 'IX', 'V', 'IV', 'I']
  let result = ''
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i] }
  }
  return result
}

export default function PreviewScreenV3() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [localDoc, setLocalDoc] = useState<MetadataDocument | null>(null)
  const [localSummary, setLocalSummary] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingDomain, setEditingDomain] = useState('')
  const [editingCustomTags, setEditingCustomTags] = useState<Tag[]>([])
  const [editingRemovedFields, setEditingRemovedFields] = useState<Set<string>>(new Set())
  const [editingSummary, setEditingSummary] = useState('')
  const [tagInputVal, setTagInputVal] = useState('')

  const foundDoc = documents.find((d) => d._id === id)

  useEffect(() => {
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(t)
  }, [id])

  useEffect(() => {
    setLocalDoc(null)
    setLocalSummary(null)
    setIsEditing(false)
    setEditingDomain('')
    setEditingCustomTags([])
    setEditingRemovedFields(new Set())
    setEditingSummary('')
    setTagInputVal('')
  }, [id])

  if (!foundDoc) return <Navigate to="/my-documents/bulk-edit/version-1" replace />

  const displayDoc = (localDoc?._id === foundDoc._id ? localDoc : null) ?? foundDoc
  const displaySummary = localSummary ?? DOCUMENT_SNIPPETS[displayDoc._id] ?? `${displayDoc.documentType} — ${displayDoc.domain}`
  const filename = `${displayDoc.name}.${displayDoc.fileFormat.toLowerCase()}`

  const startEdit = () => {
    setEditingDomain(displayDoc.domain)
    setEditingCustomTags(displayDoc.tagList ?? [])
    setEditingRemovedFields(new Set())
    setEditingSummary(displaySummary)
    setTagInputVal('')
    setIsEditing(true)
  }

  const saveEdit = () => {
    setLocalDoc({
      ...displayDoc,
      domain: editingDomain,
      tagList: editingCustomTags,
      ...(editingRemovedFields.has('namedEntity')     && { namedEntity: '—' }),
      ...(editingRemovedFields.has('namedEntityId')   && { namedEntityId: '—' }),
      ...(editingRemovedFields.has('jurisdiction')    && { jurisdiction: '—' }),
      ...(editingRemovedFields.has('lawType')         && { lawType: '—' }),
      ...(editingRemovedFields.has('citations')       && { citations: '—' }),
      ...(editingRemovedFields.has('monetaryAmounts') && { monetaryAmounts: 0 }),
      ...(editingRemovedFields.has('monetaryTypes')   && { monetaryTypes: 'None' }),
    })
    setLocalSummary(editingSummary)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditingDomain('')
    setEditingCustomTags([])
    setEditingRemovedFields(new Set())
    setEditingSummary('')
    setTagInputVal('')
  }

  const addTag = () => {
    const t = tagInputVal.trim()
    if (t && !editingCustomTags.some(tag => tag.text === t)) {
      setEditingCustomTags(prev => [...prev, { text: t, style: chipStyles.ACCENT_NEUTRAL, variant: chipVariants.HIGHLIGHT }])
    }
    setTagInputVal('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F5F9FF' }}>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: TOP_BAR_BG, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <ButtonGhost mode="contrast" leftIcon={iconType.ChevronLeftOutlined} onClick={() => navigate(-1)}>Back</ButtonGhost>
        <Typography weight="bold" color="white">{filename}</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ButtonTertiary mode="contrast" rightIcon={iconType.ExternalLinkOutlined}>Ask CoPilot</ButtonTertiary>
          <Dropdown
            items={[
              { key: 'edit', label: 'Edit document info', onClick: startEdit },
              { key: 'download', label: 'Download', onClick: () => console.log('Download') },
              { key: 'delete', label: 'Delete', onClick: () => console.log('Delete') },
            ]}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonTertiary mode="contrast" shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
          </Dropdown>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Document body */}
        <div style={{ flex: '0 0 62%', backgroundColor: colorPalette.white, borderRadius: 8, padding: '32px 40px', minHeight: 640 }}>
          {isLoading
            ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '60%' }} paragraph={{ rows: 16 }} />
            : <DocumentBody doc={displayDoc} />}
        </div>

        {/* Metadata panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ backgroundColor: colorPalette.white, borderRadius: 8, padding: 24 }}>
            {isLoading ? (
              <Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 10 }} />
            ) : isEditing ? (
              <EditPanel
                displayDoc={displayDoc}
                editingDomain={editingDomain}
                setEditingDomain={setEditingDomain}
                editingCustomTags={editingCustomTags}
                setEditingCustomTags={setEditingCustomTags}
                editingRemovedFields={editingRemovedFields}
                setEditingRemovedFields={setEditingRemovedFields}
                editingSummary={editingSummary}
                setEditingSummary={setEditingSummary}
                tagInputVal={tagInputVal}
                setTagInputVal={setTagInputVal}
                addTag={addTag}
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
            ) : (
              <ViewPanel
                displayDoc={displayDoc}
                displaySummary={displaySummary}
                onEdit={startEdit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ViewPanel({ displayDoc, displaySummary, onEdit }: {
  displayDoc: MetadataDocument
  displaySummary: string
  onEdit: () => void
}) {
  const tags = getDocumentTags(displayDoc)
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">Document Details</Typography>
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.EditOutlined} onClick={onEdit} />
      </div>

      <div style={{ marginBottom: spacing(4) }}>
        <Typography size="base" color="neutral-darken5">{displaySummary}</Typography>
      </div>

      <PropRow>
        <PropertyItem label="Document name" value={displayDoc.name} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      <PropRow>
        <PropertyItem label="Domain" value={displayDoc.domain} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      {displayDoc.label && (
        <PropRow>
          <PropertyItem
            label="Label"
            value={<Chip label={displayDoc.label} chipStyle={chipStyles.SEMANTIC_WARNING} variant={chipVariants.SUBTLE} />}
            variant={propertyItemVariants.HORIZONTAL}
            labelProps={PROP_LABEL}
          />
        </PropRow>
      )}
      <PropRow>
        <PropertyItem label="Uploaded" value={formatDate(displayDoc.uploadedDate)} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      <PropRow>
        <PropertyItem label="Format" value={displayDoc.fileFormat} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      <PropRow>
        <PropertyItem
          label="Tags"
          value={
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {tags.map((tag, i) => (
                <Chip
                  key={i}
                  label={tag.text}
                  chipStyle={tag.style as ChipStyleValue}
                  variant={(tag.variant as typeof chipVariants[keyof typeof chipVariants]) ?? chipVariants.SUBTLE}
                />
              ))}
            </div>
          }
          variant={propertyItemVariants.HORIZONTAL}
          labelProps={{ ...PROP_LABEL, style: { alignSelf: 'flex-start' } }}
        />
      </PropRow>
    </>
  )
}

function EditPanel({
  displayDoc,
  editingDomain,
  setEditingDomain,
  editingCustomTags,
  setEditingCustomTags,
  editingRemovedFields,
  setEditingRemovedFields,
  editingSummary,
  setEditingSummary,
  tagInputVal,
  setTagInputVal,
  addTag,
  onSave,
  onCancel,
}: {
  displayDoc: MetadataDocument
  editingDomain: string
  setEditingDomain: (v: string) => void
  editingCustomTags: Tag[]
  setEditingCustomTags: React.Dispatch<React.SetStateAction<Tag[]>>
  editingRemovedFields: Set<string>
  setEditingRemovedFields: React.Dispatch<React.SetStateAction<Set<string>>>
  editingSummary: string
  setEditingSummary: (v: string) => void
  tagInputVal: string
  setTagInputVal: (v: string) => void
  addTag: () => void
  onSave: () => void
  onCancel: () => void
}) {
  const removeField = (key: string) => setEditingRemovedFields(prev => new Set(prev).add(key))

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">Document Details</Typography>
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonTertiary onClick={onCancel}>Cancel</ButtonTertiary>
          <ButtonPrimary onClick={onSave}>Save</ButtonPrimary>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextArea
          label="Summary"
          value={editingSummary}
          maxLength={SUMMARY_MAX}
          hasCounter
          autoSize={{ minRows: 4, maxRows: 8 }}
          onChange={e => setEditingSummary(e.target.value)}
        />

        <Input
          label="Document Name"
          name="name"
          value={displayDoc.name}
          disabled
        />

        <Select
          label="Domain"
          name="domain"
          value={editingDomain}
          options={DOMAIN_OPTIONS}
          onChange={v => setEditingDomain(String(v))}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography size="base" weight="semibold" color="neutral-darken5">Tags</Typography>
          <div style={{ position: 'relative' }}>
            <Input
              placeholder="Add tag…"
              value={tagInputVal}
              onChange={e => setTagInputVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); addTag() }
              }}
            />
            {tagInputVal.length > 0 && (
              <span style={{
                position: 'absolute',
                right: 12,
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                fontSize: 12,
                color: '#9ca3af',
                pointerEvents: 'none',
                userSelect: 'none',
                whiteSpace: 'nowrap',
              }}>
                Enter ↵
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {editingCustomTags.map((tag, i) => (
              <Chip
                key={i}
                label={tag.text}
                chipStyle={chipStyles.ACCENT_NEUTRAL}
                variant={chipVariants.HIGHLIGHT}
                closable
                onClose={() => setEditingCustomTags(prev => prev.filter((_, j) => j !== i))}
              />
            ))}
            {displayDoc.namedEntity !== '—' && !editingRemovedFields.has('namedEntity') && (
              <Chip label={displayDoc.namedEntity} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('namedEntity')} />
            )}
            {displayDoc.namedEntityId !== '—' && !editingRemovedFields.has('namedEntityId') && (
              <Chip label={displayDoc.namedEntityId} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('namedEntityId')} />
            )}
            {displayDoc.jurisdiction !== '—' && !editingRemovedFields.has('jurisdiction') && (
              <Chip label={displayDoc.jurisdiction} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('jurisdiction')} />
            )}
            {displayDoc.lawType !== '—' && !editingRemovedFields.has('lawType') && (
              <Chip label={displayDoc.lawType} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('lawType')} />
            )}
            {displayDoc.citations !== '—' && !editingRemovedFields.has('citations') && (
              <Chip label={displayDoc.citations} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('citations')} />
            )}
            {displayDoc.monetaryAmounts > 0 && !editingRemovedFields.has('monetaryAmounts') && (
              <Chip label={`${displayDoc.monetaryAmounts.toLocaleString('de-DE')} ${displayDoc.currency}`} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('monetaryAmounts')} />
            )}
            {displayDoc.monetaryTypes !== 'None' && !editingRemovedFields.has('monetaryTypes') && (
              <Chip label={displayDoc.monetaryTypes} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('monetaryTypes')} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Document body ────────────────────────────────────────────────────────────

function Section({ number, heading, children }: { number: number; heading: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{toRoman(number)}. {heading}</div>
      <div>{children}</div>
    </section>
  )
}

function DocumentBody({ doc }: { doc: MetadataDocument }) {
  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", lineHeight: 1.8, color: '#1a1a1a', fontSize: 14 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1.25 }}>{doc.name.toUpperCase()}</div>
        <div style={{ color: '#555', marginTop: 8, fontSize: 13, fontWeight: 600 }}>{doc.documentType} · {doc.namedEntityId}</div>
      </div>
      {getDocumentSections(doc)}
    </div>
  )
}

function getDocumentSections(doc: MetadataDocument) {
  switch (doc._id) {
    case '1': return <HRPolicySections doc={doc} title="Internationale Mitarbeiterversetzung" allowanceLabel="Versetzungspauschale" allowanceDesc="Mitarbeiter, die international versetzt werden, erhalten eine einmalige Versetzungspauschale in Höhe von 5.000 EUR zur Deckung von Umzugs- und Einrichtungskosten am neuen Standort." scopeDesc="Diese Richtlinie gilt für alle Mitarbeiter der Siemens AG, die im Rahmen einer internationalen Versetzung ihren Arbeitsort dauerhaft in ein anderes Land verlegen." />
    case '2': return <HRPolicySections doc={doc} title="Internationale Mitarbeiterversetzung (Vorgängerversion)" allowanceLabel="Versetzungspauschale" allowanceDesc="Mitarbeiter, die international versetzt werden, erhielten eine einmalige Versetzungspauschale in Höhe von 4.000 EUR. Diese Richtlinie wurde durch die Version 2025 abgelöst." scopeDesc="Diese Richtlinie galt für alle Mitarbeiter der Siemens AG mit einem internationalen Versetzungsauftrag. Sie ist seit dem 12.03.2025 nicht mehr gültig." />
    case '3': return <HRPolicySections doc={doc} title="Mitarbeiter-Umzugsrichtlinie für Auslandsentsendungen" allowanceLabel="Umzugskostenzuschuss" allowanceDesc="Entsandte Mitarbeiter erhalten einen Umzugskostenzuschuss von bis zu 3.000 EUR für durch den Auslandseinsatz entstehende Umzugs- und Einlagerungskosten. Der Zuschuss wird auf Nachweis erstattet." scopeDesc="Diese Richtlinie gilt für alle Mitarbeiter der Allianz SE, die im Rahmen einer grenzüberschreitenden Entsendung ihren Wohnsitz temporär ins EU-Ausland verlegen." />
    case '4': return <HomeOfficeSections doc={doc} />
    case '5': return <TaxGuidanceSections doc={doc} threshold="75.000 EUR" rule="Auslandseinsätze, deren steuerlich relevante Vergütung den Betrag von 75.000 EUR überschreitet, unterliegen der vollständigen deutschen Steuerpflicht nach § 1 EStG. Betroffene Arbeitgeber sind verpflichtet, die entsprechenden Lohnsteuerabzüge vorzunehmen." />
    case '6': return <TaxGuidanceSections doc={doc} threshold="60.000 EUR (Vorgängergrenze, abgelöst 2024)" rule="Diese Version der Steuerlichen Behandlung von Auslandseinsätzen definierte eine Einkommensgrenze von 60.000 EUR. Die aktuell gültige Fassung aus dem Jahr 2024 hat diese Grenze auf 75.000 EUR angehoben." />
    case '7': return <TaxTreatySections doc={doc} />
    case '8': return <PayrollTaxSections doc={doc} />
    case '9': return <Rule183Sections doc={doc} />
    case '10': return <SocialInsuranceSections doc={doc} />
    case '11': return <CombinedPolicySections doc={doc} />
    case '12': return <CrossBorderComplianceSections doc={doc} />
    case '13': return <SalarySections doc={doc} />
    case '14': return <ExpensePolicySections doc={doc} />
    case '15': return <TaxReportingObligationSections doc={doc} />
    case '16': return <TaxResidencySections doc={doc} />
    case '17': return <WithholdingTaxSections doc={doc} />
    case '18': return <EUPostingGuideSections doc={doc} />
    case '19': return <ComplianceLeitfadenSections doc={doc} />
    case '20': return <AnalyticalReportSections doc={doc} />
    default: return null
  }
}

function HRPolicySections({ doc, title: _title, allowanceLabel, allowanceDesc, scopeDesc }: { doc: MetadataDocument; title: string; allowanceLabel: string; allowanceDesc: string; scopeDesc: string }) {
  return <>
    <Section number={1} heading="Geltungsbereich">{scopeDesc}</Section>
    <Section number={2} heading="Grundsätze">Die internationale Mobilität von Mitarbeitern wird durch {doc.namedEntity} aktiv gefördert. Die vorliegende Richtlinie regelt die Rahmenbedingungen, Leistungen und Pflichten bei internationalen Versetzungen. Grundlage bildet {doc.citations}.</Section>
    <Section number={3} heading={allowanceLabel}>{allowanceDesc}<br /><br />Voraussetzungen:<br />• Vorlage eines unterzeichneten Versetzungsvertrages<br />• Versetzungsdauer von mindestens 12 Monaten<br />• Antragstellung innerhalb von 90 Tagen nach Versetzungsbeginn</Section>
    <Section number={4} heading="Pflichten des Arbeitgebers">{doc.namedEntity} stellt sicher, dass alle steuerlichen und sozialversicherungsrechtlichen Meldepflichten in der Jurisdiktion {doc.jurisdiction} erfüllt werden.</Section>
    <Section number={5} heading="Pflichten des Mitarbeiters">Der versetzte Mitarbeiter ist verpflichtet, alle für die Versetzung relevanten Dokumente rechtzeitig einzureichen und die geltenden lokalen Gesetze einzuhalten.</Section>
    <Section number={6} heading="Gültigkeitsdauer">Diese Richtlinie gilt ab {doc.uploadedDate} und wird jährlich überprüft.</Section>
    <Section number={7} heading="Inkrafttreten">_________________________<br />Leiterin HR International · {doc.namedEntity}<br />[{doc.namedEntityId}] · Datum: {doc.uploadedDate}</Section>
  </>
}

function HomeOfficeSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Geltungsbereich">Dieser Entwurf regelt die Bedingungen für grenzüberschreitende Homeoffice-Tätigkeiten bei der {doc.namedEntity}.</Section>
    <Section number={2} heading="Rechtliche Grundlage">Die Regelung stützt sich auf {doc.citations} sowie auf die einschlägigen Bestimmungen des europäischen Arbeitsrechts.</Section>
    <Section number={3} heading="Genehmigungsverfahren">Homeoffice-Tätigkeiten im Ausland bedürfen der schriftlichen Genehmigung. Anträge sind mindestens 30 Tage vor Beginn einzureichen.</Section>
    <Section number={4} heading="Steuerliche Aspekte">Bei grenzüberschreitender Homeoffice-Tätigkeit sind steuerliche Risiken im Hinblick auf eine mögliche Betriebsstättenbegründung zu beachten.</Section>
    <Section number={5} heading="Datenschutz und IT-Sicherheit">Mitarbeiter im Ausland-Homeoffice sind verpflichtet, die IT-Sicherheitsrichtlinien der {doc.namedEntity} einzuhalten.</Section>
    <Section number={6} heading="Status">Dieses Dokument befindet sich im Status „Entwurf" (Stand: {doc.uploadedDate}).</Section>
  </>
}

function TaxGuidanceSections({ doc, threshold, rule }: { doc: MetadataDocument; threshold: string; rule: string }) {
  return <>
    <Section number={1} heading="Einleitung">Dieser Leitfaden der {doc.namedEntity} erläutert die steuerliche Behandlung von Auslandseinsätzen. Er basiert auf {doc.citations}.</Section>
    <Section number={2} heading="Rechtliche Grundlage">Die steuerliche Behandlung richtet sich nach dem deutschen Einkommensteuergesetz sowie den einschlägigen Doppelbesteuerungsabkommen.</Section>
    <Section number={3} heading="Einkommensgrenze">{rule}<br /><br />Maßgeblicher Schwellenwert: <strong>{threshold}</strong></Section>
    <Section number={4} heading="Berechnungsbeispiel">Ein Mitarbeiter mit einem Jahreseinkommen von {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency} unterliegt der regulären deutschen Steuerpflicht.</Section>
    <Section number={5} heading="Meldepflichten">Arbeitgeber sind verpflichtet, die zuständigen Finanzbehörden über bestehende Auslandseinsätze zu informieren.</Section>
    <Section number={6} heading="Gültigkeitsdauer">Dieser Leitfaden wurde am {doc.uploadedDate} veröffentlicht und gilt für das Steuerjahr {doc.year}.</Section>
  </>
}

function TaxTreatySections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Vertragsparteien">Dieser Leitfaden des {doc.namedEntity} erläutert das Doppelbesteuerungsabkommen. Rechtsgrundlage ist {doc.citations}.</Section>
    <Section number={2} heading="Anwendungsbereich">Das DBA gilt für Personen, die in einem oder beiden Vertragsstaaten ansässig sind und Einkünfte aus dem jeweils anderen Vertragsstaat beziehen.</Section>
    <Section number={3} heading="Zuteilung des Besteuerungsrechts">Einkünfte aus nichtselbstständiger Arbeit werden grundsätzlich im Tätigkeitsstaat besteuert, sofern der Arbeitnehmer dort länger als 183 Tage tätig ist.</Section>
    <Section number={4} heading="Vermeidung der Doppelbesteuerung">Deutschland vermeidet die Doppelbesteuerung durch die Freistellungsmethode oder subsidiär durch die Anrechnungsmethode.</Section>
    <Section number={5} heading="Verständigungsverfahren">Bei Auslegungskonflikten können betroffene Steuerpflichtige ein Verständigungsverfahren beantragen.</Section>
    <Section number={6} heading="Inkrafttreten">Dieser Leitfaden wurde am {doc.uploadedDate} veröffentlicht. Zuständige Behörde: {doc.namedEntity} ({doc.namedEntityId}).</Section>
  </>
}

function PayrollTaxSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Einleitung">Dieser Leitfaden von {doc.namedEntity} beschreibt die lohnsteuerlichen Pflichten bei der Entsendung von Mitarbeitern ins Ausland.</Section>
    <Section number={2} heading="Lohnsteuerabzug">Arbeitgeber sind verpflichtet, den Lohnsteuerabzug nach § 38 EStG vorzunehmen. Bemessungsgrundlage: {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency}.</Section>
    <Section number={3} heading="Freistellungsvoraussetzungen">Eine Freistellung kommt in Betracht, wenn der Arbeitnehmer im Tätigkeitsstaat der lokalen Besteuerung unterliegt und die 183-Tage-Grenze überschritten ist.</Section>
    <Section number={4} heading="Dokumentation">Arbeitgeber haben die Entsendung dem zuständigen Betriebsstättenfinanzamt zu melden.</Section>
    <Section number={5} heading="Sonderregelungen">Bei Langzeitentsendungen können besondere Lohnsteuerregelungen greifen.</Section>
    <Section number={6} heading="Gültigkeitsdauer">Dieser Leitfaden gilt ab {doc.uploadedDate} für das Steuerjahr {doc.year}.</Section>
  </>
}

function Rule183Sections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Einleitung">Dieser Leitfaden der {doc.namedEntity} erläutert die 183-Tage-Regelung gemäß {doc.citations}.</Section>
    <Section number={2} heading="Grundregel">Das Besteuerungsrecht für Einkünfte aus nichtselbstständiger Arbeit wird dem Tätigkeitsstaat nur dann zugewiesen, wenn der Arbeitnehmer dort mehr als 183 Tage anwesend ist.</Section>
    <Section number={3} heading="Berechnung">Als Anwesenheitstage zählen alle Tage physischer Präsenz einschließlich An- und Abreisetag, Samstage, Sonntage und Feiertage.</Section>
    <Section number={4} heading="Ausnahmen">Die Regelung gilt nicht für Vorstandsmitglieder unter bestimmten Bedingungen. Jurisdiktion: {doc.jurisdiction}.</Section>
    <Section number={5} heading="Praxisempfehlungen">{doc.namedEntity} empfiehlt, bei einer erwarteten Anwesenheit von mehr als 150 Tagen frühzeitig steuerliche Beratung einzuholen.</Section>
    <Section number={6} heading="Quelle">Herausgeber: {doc.namedEntity} ({doc.namedEntityId}) · Veröffentlicht: {doc.uploadedDate}</Section>
  </>
}

function SocialInsuranceSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Überblick">Dieser Leitfaden der {doc.namedEntity} behandelt die sozialversicherungsrechtliche Absicherung auf Basis von {doc.citations}.</Section>
    <Section number={2} heading="Grundprinzip">Grundsätzlich gilt das Recht des Staates, in dem die Tätigkeit ausgeübt wird.</Section>
    <Section number={3} heading="A1-Bescheinigung">Für entsandte Mitarbeiter ist vor Beginn der Tätigkeit im EU-Ausland eine A1-Bescheinigung zu beantragen.</Section>
    <Section number={4} heading="Beitragspflicht">Während der Entsendung bleibt die Beitragspflicht gegenüber dem deutschen Sozialversicherungssystem bestehen.</Section>
    <Section number={5} heading="Grenzgänger">Grenzgänger unterliegen besonderen Regelungen. {doc.namedEntity} empfiehlt eine individuelle Prüfung.</Section>
    <Section number={6} heading="Gültigkeitsdauer">Stand: {doc.uploadedDate} · Herausgeber: {doc.namedEntity} ({doc.namedEntityId}) · Jurisdiktion: {doc.jurisdiction}</Section>
  </>
}

function CombinedPolicySections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Geltungsbereich">Diese kombinierte HR- und Steuerrichtlinie der {doc.namedEntity} gilt für kurzfristige Auslandsentsendungen bis zu 183 Tage.</Section>
    <Section number={2} heading="HR-Regelungen">Tagegeld: {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency} pro Tag · Unterkunft wird gestellt · Weiterhin Geltung des deutschen Arbeitsvertrages.</Section>
    <Section number={3} heading="Steuerliche Behandlung">Steuerliche Aspekte richten sich nach {doc.citations} sowie den einschlägigen DBA-Regelungen.</Section>
    <Section number={4} heading="Sozialversicherung">Während der Entsendung bleibt die Sozialversicherungspflicht in Deutschland grundsätzlich erhalten.</Section>
    <Section number={5} heading="Genehmigungsverfahren">Kurzfristige Entsendungen sind mindestens 14 Tage vor Beginn beim HR-Bereich von {doc.namedEntity} anzumelden.</Section>
    <Section number={6} heading="Inkrafttreten">Gültig ab {doc.uploadedDate}. Herausgeber: {doc.namedEntity} ({doc.namedEntityId}).</Section>
  </>
}

function CrossBorderComplianceSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Überblick">Dieser Compliance-Leitfaden von {doc.namedEntity} identifiziert rechtliche Risiken bei grenzüberschreitender Beschäftigung (Stand: {doc.uploadedDate}).</Section>
    <Section number={2} heading="Risikobereiche">Geschätztes Risikoexposure: {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency}. Hauptrisiken: nicht angemeldete Betriebsstätten, fehlende A1-Bescheinigungen.</Section>
    <Section number={3} heading="Rechtliche Anforderungen">Unternehmen müssen sicherstellen, dass alle Anforderungen der {doc.citations} eingehalten werden.</Section>
    <Section number={4} heading="Maßnahmen">{doc.namedEntity} empfiehlt die Einführung eines zentralen Mobilitäts-Tracking-Systems und jährliche Compliance-Reviews.</Section>
    <Section number={5} heading="Nächste Schritte">Zieldatum für Verabschiedung: Q4 {doc.year}.</Section>
  </>
}

function SalarySections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Grundsätze">Diese Gehaltsrichtlinie der {doc.namedEntity} regelt die Vergütungsstruktur für Mitarbeiter im internationalen Einsatz.</Section>
    <Section number={2} heading="Vergütungskomponenten">Grundgehalt bis {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency} p.a. · Mobilitätszulage · Leistungsabhängige Variable · Sachleistungen.</Section>
    <Section number={3} heading="Gehaltsanpassungen">Die Vergütung wird bei Auslandseinsätzen auf Basis des Purchasing Power Index des Ziellandes angepasst.</Section>
    <Section number={4} heading="Betriebsrat">Die Richtlinie wurde in Abstimmung mit dem Betriebsrat gemäß § 87 BetrVG entwickelt.</Section>
    <Section number={5} heading="Genehmigungsverfahren">Abweichungen bedürfen der Genehmigung durch HR International und den zuständigen Bereichsvorstand.</Section>
    <Section number={6} heading="Inkrafttreten">Gültig ab: {doc.uploadedDate} · Herausgeber: {doc.namedEntity} ({doc.namedEntityId})</Section>
  </>
}

function ExpensePolicySections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Geltungsbereich">Diese Spesenrichtlinie der {doc.namedEntity} gilt für alle Mitarbeiter, die dienstliche Reisen unternehmen.</Section>
    <Section number={2} heading="Erstattungsfähige Ausgaben">Tagegeld: bis zu {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency}/Tag (gemäß EStG § 9) · Unterkunft bis 150 {doc.currency}/Nacht.</Section>
    <Section number={3} heading="Obergrenzen">Beträge oberhalb der Pauschalsätze des EStG sind lohnsteuerpflichtig.</Section>
    <Section number={4} heading="Einreichungsfristen">Spesenberichte sind innerhalb von 30 Tagen nach Abschluss der Dienstreise einzureichen.</Section>
    <Section number={5} heading="Genehmigung">Reisen unter 1.000 {doc.currency} werden durch den direkten Vorgesetzten genehmigt.</Section>
    <Section number={6} heading="Inkrafttreten">Gültig ab: {doc.uploadedDate} · Rechtsgrundlage: {doc.citations}</Section>
  </>
}

function TaxReportingObligationSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Einleitung">Dieser Leitfaden des {doc.namedEntity} beschreibt die steuerlichen Meldepflichten für Unternehmen mit international tätigen Mitarbeitern.</Section>
    <Section number={2} heading="Anzeigepflicht">Gemäß {doc.citations} sind Steuerpflichtige verpflichtet, die Aufnahme einer Tätigkeit im Ausland dem Finanzamt anzuzeigen.</Section>
    <Section number={3} heading="Inhalt der Meldung">Name, Steuernummer, Art und Beginn der Auslandstätigkeit sowie Angaben zur ausländischen Gesellschaft.</Section>
    <Section number={4} heading="Sanktionen">Verstöße können als Steuerstraftat oder Steuerordnungswidrigkeit geahndet werden.</Section>
    <Section number={5} heading="Elektronische Übermittlung">Meldungen sind grundsätzlich elektronisch über das ELSTER-Portal zu übermitteln.</Section>
    <Section number={6} heading="Gültigkeitsdauer">Stand: {doc.uploadedDate} · Steuerjahr: {doc.year} · Herausgeber: {doc.namedEntity}</Section>
  </>
}

function TaxResidencySections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Überblick">Dieser Leitfaden des {doc.namedEntity} definiert die Kriterien der steuerlichen Ansässigkeit in Deutschland auf Basis von {doc.citations}.</Section>
    <Section number={2} heading="Wohnsitz (§ 8 AO)">Als Wohnsitz gilt eine Wohnung, über die eine Person unter Umständen verfügt, die auf ein Beibehalten schließen lassen.</Section>
    <Section number={3} heading="Gewöhnlicher Aufenthalt">Den gewöhnlichen Aufenthalt hat eine Person dort, wo sie sich nicht nur vorübergehend aufhält (in der Regel über 6 Monate).</Section>
    <Section number={4} heading="Steuerpflicht">Personen mit Wohnsitz in Deutschland sind unbeschränkt einkommensteuerpflichtig (Welteinkommensprinzip).</Section>
    <Section number={5} heading="Rechtsprechung">Der {doc.namedEntity} hat klargestellt, dass die Beibehaltung einer Wohnung in Deutschland die unbeschränkte Steuerpflicht begründen kann.</Section>
    <Section number={6} heading="Gültigkeitsdauer">Veröffentlicht: {doc.uploadedDate} · Instanz: {doc.namedEntity} ({doc.namedEntityId})</Section>
  </>
}

function WithholdingTaxSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Einleitung">Dieser Leitfaden von {doc.namedEntity} erläutert die Quellensteuerregelungen gemäß {doc.citations}.</Section>
    <Section number={2} heading="Quellensteuer gemäß § 49 EStG">Beschränkt Steuerpflichtige unterliegen mit bestimmten inländischen Einkünften der beschränkten Steuerpflicht.</Section>
    <Section number={3} heading="Steuerabzugsverfahren">Die Quellensteuer wird durch den inländischen Schuldner einbehalten. Bemessungsgrundlage: {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency}.</Section>
    <Section number={4} heading="Freistellung">Auf Antrag kann eine Freistellung gewährt werden, wenn ein einschlägiges DBA niedrigere Steuersätze vorsieht.</Section>
    <Section number={5} heading="Dokumentationspflichten">Inländische Schuldner haben ausgezahlte Beträge, einbehaltene Steuern und Empfänger zu dokumentieren.</Section>
    <Section number={6} heading="Gültigkeitsdauer">Gültig ab: {doc.uploadedDate} · Steuerjahr: {doc.year} · Herausgeber: {doc.namedEntity} ({doc.namedEntityId})</Section>
  </>
}

function EUPostingGuideSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Zweck">Dieser Leitfaden der {doc.namedEntity} beschreibt die Anforderungen der überarbeiteten Entsenderichtlinie ({doc.citations}).</Section>
    <Section number={2} heading="Wesentliche Änderungen">Anspruch auf vollständiges lokales Lohnniveau ab Tag 1 · Beschränkung der Langzeitentsendung auf 12 Monate (verlängerbar auf 18).</Section>
    <Section number={3} heading="Meldepflichten">Entsendende Unternehmen sind verpflichtet, die Entsendung vor Beginn bei der zuständigen Behörde zu melden.</Section>
    <Section number={4} heading="Dokumentation">A1-Bescheinigung · Entsendungsvereinbarung · Lohn- und Arbeitszeitnachweise sind aufzubewahren.</Section>
    <Section number={5} heading="Sanktionen">Verstöße können in den EU-Mitgliedstaaten mit erheblichen Bußgeldern belegt werden.</Section>
    <Section number={6} heading="Gültigkeitsdauer">Stand: {doc.uploadedDate} · Herausgeber: {doc.namedEntity} ({doc.namedEntityId}) · Jurisdiktion: {doc.jurisdiction}</Section>
  </>
}

function ComplianceLeitfadenSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Überblick (abgelöste Version)">Dieser Compliance-Leitfaden von {doc.namedEntity} aus dem Jahr {doc.year} wurde durch eine aktuellere Fassung abgelöst.</Section>
    <Section number={2} heading="Damaliger regulatorischer Rahmen">Bezog sich auf {doc.citations}. Das Compliance-Risikoexposure wurde mit {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency} beziffert.</Section>
    <Section number={3} heading={`Wesentliche Anforderungen (Stand ${doc.year})`}>• Voranmeldung entsandter Mitarbeiter · Einhaltung lokaler Mindestlohnvorschriften · Führung von Arbeitszeitnachweisen.</Section>
    <Section number={4} heading="Grund für Ablösung">Durch das Inkrafttreten der überarbeiteten EU-Entsenderichtlinie wurden wesentliche Teile obsolet.</Section>
    <Section number={5} heading="Archiviert">Dieses Dokument ist als „Superseded" archiviert. Gültigkeitsende: 2021 · Herausgeber: {doc.namedEntity} ({doc.namedEntityId})</Section>
  </>
}

function AnalyticalReportSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Zusammenfassung">Dieser analytische Bericht von {doc.namedEntity} untersucht steuerliche Auswirkungen temporärer Mitarbeiterversetzungen. Gesamtkostenauswirkung: {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency}.</Section>
    <Section number={2} heading="Methodik">Die Analyse basiert auf Daten aus 45 deutschen Unternehmen im Zeitraum {doc.year - 2}–{doc.year}.</Section>
    <Section number={3} heading="Steuerliche Auswirkungen">Im Durchschnitt entstehen pro temporärer Versetzung Mehrkosten von ca. 8.200 {doc.currency}. Grundlage: {doc.citations}.</Section>
    <Section number={4} heading="HR-seitige Auswirkungen">HR-Prozesskosten betragen im Median 3.400 {doc.currency} pro Einsatz.</Section>
    <Section number={5} heading="Empfehlungen">{doc.namedEntity} empfiehlt: Einführung eines zentralen Mobility-Management-Systems · Standardisierung der Voranmeldungsprozesse.</Section>
    <Section number={6} heading="Status">Dieser Bericht befindet sich im Status „Entwurf" (Stand: {doc.uploadedDate}). Finale Freigabe: {doc.namedEntity} ({doc.namedEntityId})</Section>
  </>
}
