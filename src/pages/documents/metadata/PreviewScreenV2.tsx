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
  Typography,
} from '@goat-ui/goat-ui-core'
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument, type DocumentStatus } from './documents'

const { colorPalette } = constants
const TOP_BAR_BG = '#1e1f2e'

const STATUS_CHIP_STYLE: Record<DocumentStatus, ChipStyleValue> = {
  Approved: chipStyles.SEMANTIC_SUCCESS,
  Draft: chipStyles.ACCENT_BLUE,
  Superseded: chipStyles.ACCENT_NEUTRAL,
}

const DOMAIN_OPTIONS = [
  { label: 'HR', value: 'HR' },
  { label: 'HR/Tax', value: 'HR/Tax' },
  { label: 'Tax', value: 'Tax' },
]

const STATUS_OPTIONS = [
  { label: 'Approved', value: 'Approved' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Superseded', value: 'Superseded' },
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

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div style={{ paddingBottom: 12, borderBottom: '1px solid #e5e7eb', marginBottom: 2 }}>
      <Typography size="base" weight="semibold" color="neutral-darken5">{children}</Typography>
    </div>
  )
}

const PROP_LABEL = { size: 'base' as const, color: 'neutral-darken2' as const, width: '130px' }
const PROP_VALUE = { size: 'base' as const, color: 'neutral-darken5' as const }

function PropRow({ children }: { children: ReactNode }) {
  return <div style={{ padding: '8px 0' }}>{children}</div>
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

export default function MetadataPreviewScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [localDoc, setLocalDoc] = useState<MetadataDocument | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingValues, setEditingValues] = useState<Record<string, string>>({})
  const [editingCustomTags, setEditingCustomTags] = useState<Tag[]>([])
  const [tagInputVal, setTagInputVal] = useState('')
  const [removedFields, setRemovedFields] = useState<Set<string>>(new Set())

  const foundDoc = documents.find((d) => d._id === id)

  useEffect(() => {
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(t)
  }, [id])

  useEffect(() => {
    setLocalDoc(null)
    setIsEditing(false)
    setEditingValues({})
    setEditingCustomTags([])
    setTagInputVal('')
    setRemovedFields(new Set())
  }, [id])

  if (!foundDoc) return <Navigate to="/projects/metadata/version-2" replace />

  const displayDoc = (localDoc?._id === foundDoc._id ? localDoc : null) ?? foundDoc
  const filename = `${displayDoc.name}.${displayDoc.fileFormat.toLowerCase()}`

  const handleEditChange = (key: string, value: string) =>
    setEditingValues(prev => ({ ...prev, [key]: value }))

  const startEdit = () => {
    setEditingValues({
      name: displayDoc.name,
      domain: displayDoc.domain,
      documentType: displayDoc.documentType,
      status: displayDoc.status,
      year: String(displayDoc.year),
    })
    setEditingCustomTags(displayDoc.tagList ?? [])
    setTagInputVal('')
    setRemovedFields(new Set())
    setIsEditing(true)
  }

  const saveEdit = () => {
    setLocalDoc({
      ...displayDoc,
      name: editingValues.name,
      domain: editingValues.domain,
      documentType: editingValues.documentType,
      status: editingValues.status as DocumentStatus,
      year: Number(editingValues.year) || displayDoc.year,
      tagList: editingCustomTags,
      ...(removedFields.has('namedEntity')     && { namedEntity: '—' }),
      ...(removedFields.has('namedEntityId')   && { namedEntityId: '—' }),
      ...(removedFields.has('jurisdiction')    && { jurisdiction: '—' }),
      ...(removedFields.has('lawType')         && { lawType: '—' }),
      ...(removedFields.has('citations')       && { citations: '—' }),
      ...(removedFields.has('monetaryAmounts') && { monetaryAmounts: 0 }),
      ...(removedFields.has('monetaryTypes')   && { monetaryTypes: 'None' }),
    })
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditingValues({})
    setEditingCustomTags([])
    setTagInputVal('')
    setRemovedFields(new Set())
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
                { key: 'copilot', label: 'Ask CoPilot', onClick: () => console.log('Ask CoPilot') },
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
              <Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 14 }} />
            ) : (
              <>
                <SectionHeading>Document summary</SectionHeading>
                <div style={{ padding: '8px 0 16px' }}>
                  <Typography size="base" color="neutral-darken5">
                    {DOCUMENT_SNIPPETS[displayDoc._id] ?? `${displayDoc.documentType} — ${displayDoc.domain}`}
                  </Typography>
                </div>

                <SectionHeading>Document details</SectionHeading>
                {isEditing ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
                      <Input label="Name" name="name" value={editingValues.name ?? ''} onChange={e => handleEditChange('name', e.target.value)} />
                      <Select label="Domain" name="domain" value={editingValues.domain ?? ''} options={DOMAIN_OPTIONS} onChange={v => handleEditChange('domain', String(v))} />
                      <Input label="Document type" name="documentType" value={editingValues.documentType ?? ''} onChange={e => handleEditChange('documentType', e.target.value)} />
                      <Select
                        label="Status"
                        name="status"
                        value={editingValues.status ?? ''}
                        options={STATUS_OPTIONS}
                        onChange={v => handleEditChange('status', String(v))}
                        optionRender={option => (
                          <Chip label={String(option.label)} chipStyle={STATUS_CHIP_STYLE[option.value as DocumentStatus]} variant={chipVariants.SUBTLE} />
                        )}
                      />
                      <Input label="Year" name="year" value={editingValues.year ?? ''} onChange={e => handleEditChange('year', e.target.value)} />
                    </div>
                  </>
                ) : (
                  <>
                    <PropRow><PropertyItem label="Name" value={displayDoc.name} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} /></PropRow>
                    <PropRow><PropertyItem label="Domain" value={displayDoc.domain} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} /></PropRow>
                    <PropRow><PropertyItem label="Document type" value={displayDoc.documentType} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} /></PropRow>
                    <PropRow>
                      <PropertyItem
                        label="Status"
                        value={<Chip label={displayDoc.status} chipStyle={STATUS_CHIP_STYLE[displayDoc.status]} variant={chipVariants.SUBTLE} />}
                        variant={propertyItemVariants.HORIZONTAL}
                        labelProps={PROP_LABEL}
                      />
                    </PropRow>
                    {displayDoc.label && (
                      <PropRow>
                        <PropertyItem label="Label" value={<Chip label={displayDoc.label} chipStyle={chipStyles.SEMANTIC_WARNING} variant={chipVariants.SUBTLE} />} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} />
                      </PropRow>
                    )}
                    <PropRow><PropertyItem label="Date" value={String(displayDoc.year)} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} /></PropRow>
                    <PropRow><PropertyItem label="Uploaded" value={displayDoc.uploadedDate} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} /></PropRow>
                    <PropRow><PropertyItem label="Format" value={displayDoc.fileFormat} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} /></PropRow>
                  </>
                )}

                <div style={{ marginTop: 24 }} />
                <SectionHeading>Tags</SectionHeading>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <Chip label={editingValues.domain || displayDoc.domain} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
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
                      {displayDoc.namedEntity !== '—' && !removedFields.has('namedEntity') && <Chip label={displayDoc.namedEntity} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => setRemovedFields(prev => new Set(prev).add('namedEntity'))} />}
                      {displayDoc.namedEntityId !== '—' && !removedFields.has('namedEntityId') && <Chip label={displayDoc.namedEntityId} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => setRemovedFields(prev => new Set(prev).add('namedEntityId'))} />}
                      {displayDoc.jurisdiction !== '—' && !removedFields.has('jurisdiction') && <Chip label={displayDoc.jurisdiction} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => setRemovedFields(prev => new Set(prev).add('jurisdiction'))} />}
                      {displayDoc.lawType !== '—' && !removedFields.has('lawType') && <Chip label={displayDoc.lawType} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => setRemovedFields(prev => new Set(prev).add('lawType'))} />}
                      {displayDoc.citations !== '—' && !removedFields.has('citations') && <Chip label={displayDoc.citations} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => setRemovedFields(prev => new Set(prev).add('citations'))} />}
                      {displayDoc.monetaryAmounts > 0 && !removedFields.has('monetaryAmounts') && <Chip label={`${displayDoc.monetaryAmounts.toLocaleString('de-DE')} ${displayDoc.currency}`} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => setRemovedFields(prev => new Set(prev).add('monetaryAmounts'))} />}
                      {displayDoc.monetaryTypes !== 'None' && !removedFields.has('monetaryTypes') && <Chip label={displayDoc.monetaryTypes} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => setRemovedFields(prev => new Set(prev).add('monetaryTypes'))} />}
                    </div>
                    <Input
                      value={tagInputVal}
                      placeholder="Add tag…"
                      onChange={e => setTagInputVal(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const t = tagInputVal.trim()
                          if (t && !editingCustomTags.some(tag => tag.text === t)) {
                            setEditingCustomTags(prev => [...prev, { text: t, style: chipStyles.ACCENT_NEUTRAL, variant: chipVariants.HIGHLIGHT }])
                          }
                          setTagInputVal('')
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 8 }}>
                    {getDocumentTags(displayDoc).map((tag, i) => (
                      <Chip
                        key={i}
                        label={tag.text}
                        chipStyle={tag.style as ChipStyleValue}
                        variant={(tag.variant as typeof chipVariants[keyof typeof chipVariants]) ?? chipVariants.SUBTLE}
                      />
                    ))}
                  </div>
                )}

                {isEditing && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    <ButtonPrimary onClick={saveEdit}>Save</ButtonPrimary>
                    <ButtonTertiary onClick={cancelEdit}>Cancel</ButtonTertiary>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
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

// ─── Section templates ────────────────────────────────────────────────────────

function HRPolicySections({ doc, title: _title, allowanceLabel, allowanceDesc, scopeDesc }: { doc: MetadataDocument; title: string; allowanceLabel: string; allowanceDesc: string; scopeDesc: string }) {
  return <>
    <Section number={1} heading="Geltungsbereich">{scopeDesc}</Section>
    <Section number={2} heading="Grundsätze">
      Die internationale Mobilität von Mitarbeitern wird durch {doc.namedEntity} aktiv gefördert. Die vorliegende Richtlinie regelt die Rahmenbedingungen, Leistungen und Pflichten bei internationalen Versetzungen. Grundlage bildet {doc.citations}.
    </Section>
    <Section number={3} heading={allowanceLabel}>
      {allowanceDesc}
      <br /><br />Voraussetzungen für die Inanspruchnahme:<br />
      • Vorlage eines unterzeichneten Versetzungsvertrages<br />
      • Versetzungsdauer von mindestens 12 Monaten<br />
      • Antragstellung innerhalb von 90 Tagen nach Versetzungsbeginn
    </Section>
    <Section number={4} heading="Pflichten des Arbeitgebers">
      {doc.namedEntity} stellt sicher, dass alle steuerlichen und sozialversicherungsrechtlichen Meldepflichten im Zusammenhang mit der Versetzung in der Jurisdiktion {doc.jurisdiction} erfüllt werden. Dazu gehört insbesondere die Abstimmung mit den zuständigen Behörden sowie die Bereitstellung eines lokalen Ansprechpartners.
    </Section>
    <Section number={5} heading="Pflichten des Mitarbeiters">
      Der versetzte Mitarbeiter ist verpflichtet, alle für die Versetzung relevanten Dokumente rechtzeitig einzureichen, Änderungen der persönlichen Situation unverzüglich zu melden und die geltenden lokalen Gesetze und Vorschriften einzuhalten.
    </Section>
    <Section number={6} heading="Gültigkeitsdauer">
      Diese Richtlinie gilt ab {doc.uploadedDate} und wird jährlich überprüft. Änderungen bedürfen der Genehmigung durch den zuständigen HR-Bereich und werden allen betroffenen Mitarbeitern rechtzeitig bekannt gegeben.
    </Section>
    <Section number={7} heading="Inkrafttreten / Genehmigung">
      _________________________<br />
      Leiterin HR International · {doc.namedEntity}<br />
      [{doc.namedEntityId}] · Datum: {doc.uploadedDate}
    </Section>
  </>
}

function HomeOfficeSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Geltungsbereich">
      Dieser Entwurf regelt die Bedingungen für grenzüberschreitende Homeoffice-Tätigkeiten bei der {doc.namedEntity}. Er gilt für alle Mitarbeiter, die ihren Arbeitsort dauerhaft oder regelmäßig in ein anderes Land als ihren Vertragsarbeitsstaat verlegen möchten.
    </Section>
    <Section number={2} heading="Rechtliche Grundlage">
      Die Regelung stützt sich auf {doc.citations} sowie auf die einschlägigen Bestimmungen des europäischen Arbeitsrechts. Da es sich um ein Entwurfsdokument handelt, sind die Regelungen noch nicht rechtsverbindlich.
    </Section>
    <Section number={3} heading="Genehmigungsverfahren">
      Homeoffice-Tätigkeiten im Ausland bedürfen der schriftlichen Genehmigung durch den zuständigen Vorgesetzten und den HR-Bereich. Anträge sind mindestens 30 Tage vor geplantem Beginn einzureichen. Die Genehmigung gilt für maximal 183 Tage pro Kalenderjahr.
    </Section>
    <Section number={4} heading="Steuerliche und sozialversicherungsrechtliche Aspekte">
      Bei grenzüberschreitender Homeoffice-Tätigkeit sind steuerliche Risiken im Hinblick auf eine mögliche Betriebsstättenbegründung sowie sozialversicherungsrechtliche Konsequenzen zu beachten. Die betroffenen Mitarbeiter werden individuell beraten.
    </Section>
    <Section number={5} heading="Datenschutz und IT-Sicherheit">
      Mitarbeiter im Ausland-Homeoffice sind verpflichtet, die IT-Sicherheitsrichtlinien der {doc.namedEntity} einzuhalten. Der Zugriff auf Unternehmenssysteme erfolgt ausschließlich über zugelassene VPN-Verbindungen.
    </Section>
    <Section number={6} heading="Status und nächste Schritte">
      Dieses Dokument befindet sich im Status „Entwurf" (Stand: {doc.uploadedDate}). Die finale Fassung soll nach Abstimmung mit dem Betriebsrat und der Rechtsabteilung veröffentlicht werden.
    </Section>
  </>
}

function TaxGuidanceSections({ doc, threshold, rule }: { doc: MetadataDocument; threshold: string; rule: string }) {
  return <>
    <Section number={1} heading="Einleitung">
      Dieser Leitfaden der {doc.namedEntity} erläutert die steuerliche Behandlung von Auslandseinsätzen für in Deutschland ansässige Mitarbeiter und Unternehmen. Er basiert auf {doc.citations} und richtet sich an HR- und Steuerverantwortliche.
    </Section>
    <Section number={2} heading="Rechtliche Grundlage">
      Die steuerliche Behandlung von Auslandseinsätzen richtet sich nach dem deutschen Einkommensteuergesetz sowie den einschlägigen Doppelbesteuerungsabkommen. Maßgeblich ist insbesondere {doc.citations}.
    </Section>
    <Section number={3} heading="Einkommensgrenze und Steuerpflicht">
      {rule}
      <br /><br />
      Maßgeblicher Schwellenwert: <strong>{threshold}</strong>
    </Section>
    <Section number={4} heading="Berechnungsbeispiel">
      Ein Mitarbeiter mit einem Jahreseinkommen von {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency} aus einem Auslandseinsatz unterliegt der regulären deutschen Steuerpflicht. Der Arbeitgeber hat die Lohnsteuer entsprechend einzubehalten und abzuführen. Steuerfreie Zulagen sind separat auszuweisen.
    </Section>
    <Section number={5} heading="Meldepflichten">
      Arbeitgeber sind verpflichtet, die zuständigen Finanzbehörden über bestehende Auslandseinsätze zu informieren. Die Meldung hat elektronisch zu erfolgen und muss die steuerrelevanten Vergütungsbestandteile vollständig ausweisen.
    </Section>
    <Section number={6} heading="Gültigkeitsdauer und Überprüfung">
      Dieser Leitfaden wurde am {doc.uploadedDate} veröffentlicht und gilt für das Steuerjahr {doc.year}. Eine Aktualisierung erfolgt bei Änderungen der Rechtslage oder spätestens nach 12 Monaten.
    </Section>
  </>
}

function TaxTreatySections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Vertragsparteien und Zweck">
      Dieser Leitfaden des {doc.namedEntity} erläutert die Anwendung des Doppelbesteuerungsabkommens zwischen Deutschland und dem Vereinigten Königreich. Rechtsgrundlage ist {doc.citations}. Ziel ist die Vermeidung der Doppelbesteuerung von Einkünften natürlicher und juristischer Personen.
    </Section>
    <Section number={2} heading="Anwendungsbereich">
      Das DBA gilt für Personen, die in einem oder beiden Vertragsstaaten ansässig sind und Einkünfte aus dem jeweils anderen Vertragsstaat beziehen. Es erfasst Einkünfte aus nichtselbstständiger Arbeit, Unternehmensgewinne, Zinsen, Dividenden und Veräußerungsgewinne.
    </Section>
    <Section number={3} heading="Zuteilung des Besteuerungsrechts">
      Einkünfte aus nichtselbstständiger Arbeit werden grundsätzlich im Tätigkeitsstaat besteuert, sofern der Arbeitnehmer dort länger als 183 Tage im Kalenderjahr tätig ist. Unterhalb dieser Grenze verbleibt das Besteuerungsrecht beim Ansässigkeitsstaat. Einkommensallokation: bis zu {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency}.
    </Section>
    <Section number={4} heading="Vermeidung der Doppelbesteuerung">
      Deutschland vermeidet die Doppelbesteuerung in der Regel durch die Freistellungsmethode oder — subsidiär — durch die Anrechnungsmethode. Welche Methode zur Anwendung kommt, richtet sich nach der Einkunftsart und den Regelungen des jeweiligen Artikels des DBA.
    </Section>
    <Section number={5} heading="Verständigungsverfahren">
      Bei Auslegungskonflikten können betroffene Steuerpflichtige ein Verständigungsverfahren zwischen den zuständigen Behörden beider Staaten beantragen. Anträge sind an das Bundeszentralamt für Steuern zu richten.
    </Section>
    <Section number={6} heading="Inkrafttreten">
      Dieser Leitfaden wurde am {doc.uploadedDate} veröffentlicht und gilt für Sachverhalte ab dem Steuerjahr {doc.year}. Zuständige Behörde: {doc.namedEntity} ({doc.namedEntityId}).
    </Section>
  </>
}

function PayrollTaxSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Einleitung">
      Dieser Leitfaden von {doc.namedEntity} beschreibt die lohnsteuerlichen Pflichten deutscher Arbeitgeber bei der kurzfristigen Entsendung von Mitarbeitern ins Ausland und richtet sich auf Einsätze bis zu 183 Tagen aus.
    </Section>
    <Section number={2} heading="Lohnsteuerabzug bei Entsendungen">
      Arbeitgeber sind verpflichtet, auch bei kurzfristigen Auslandseinsätzen den Lohnsteuerabzug nach § 38 EStG vorzunehmen, sofern keine Freistellung durch ein einschlägiges DBA besteht. Die Bemessungsgrundlage beträgt im vorliegenden Kontext {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency}.
    </Section>
    <Section number={3} heading="Voraussetzungen der Freistellung">
      Eine Freistellung vom deutschen Lohnsteuerabzug kommt in Betracht, wenn:<br />
      • Der Arbeitnehmer im Tätigkeitsstaat der lokalen Besteuerung unterliegt<br />
      • Ein wirksames DBA eine Zuweisung an den Tätigkeitsstaat vorsieht<br />
      • Die 183-Tage-Grenze überschritten ist
    </Section>
    <Section number={4} heading="Meldung und Dokumentation">
      Arbeitgeber haben die Entsendung dem zuständigen Betriebsstättenfinanzamt zu melden. Die lohnsteuerlich relevanten Unterlagen sind gemäß § 147 AO zehn Jahre aufzubewahren.
    </Section>
    <Section number={5} heading="Sonderregelungen für Expatriates">
      Bei Langzeitentsendungen (über 12 Monate) können besondere Lohnsteuerregelungen greifen. {doc.namedEntity} empfiehlt eine individuelle Abstimmung mit dem zuständigen Finanzamt vor Beginn des Einsatzes.
    </Section>
    <Section number={6} heading="Gültigkeitsdauer">
      Dieser Leitfaden gilt ab {doc.uploadedDate} für das Steuerjahr {doc.year} und wurde von {doc.namedEntity} ({doc.namedEntityId}) herausgegeben.
    </Section>
  </>
}

function Rule183Sections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Einleitung">
      Dieser von der {doc.namedEntity} herausgegebene Leitfaden erläutert die Anwendung der 183-Tage-Regelung gemäß {doc.citations} im Kontext grenzüberschreitender Beschäftigung.
    </Section>
    <Section number={2} heading="Grundregel">
      Nach Art. 15 des OECD-Musterabkommens wird das Besteuerungsrecht für Einkünfte aus nichtselbstständiger Arbeit dem Tätigkeitsstaat nur dann zugewiesen, wenn der Arbeitnehmer dort mehr als 183 Tage im maßgeblichen Zeitraum (Kalenderjahr oder 12-Monats-Zeitraum) anwesend ist.
    </Section>
    <Section number={3} heading="Berechnung der Anwesenheitstage">
      Als Anwesenheitstage zählen alle Tage physischer Präsenz im Tätigkeitsstaat, einschließlich An- und Abreisetag, Samstage, Sonntage und Feiertage. Nicht gezählt werden Transit-Tage ohne Tätigkeitsausübung.<br /><br />
      Beispiele:<br />
      • Projekteinsatz von 120 Werktagen → unter 183 Tagen → Besteuerungsrecht verbleibt im Ansässigkeitsstaat<br />
      • Jahreseinsatz von 200 Tagen → über 183 Tagen → Besteuerungsrecht geht auf Tätigkeitsstaat über
    </Section>
    <Section number={4} heading="Ausnahmen und Besonderheiten">
      Die 183-Tage-Regelung gilt nicht für Vorstandsmitglieder, Aufsichtsräte und Gesellschafter unter bestimmten Bedingungen. Zudem können besondere DBA-Regelungen die Standardregel modifizieren. Jurisdiktion: {doc.jurisdiction}.
    </Section>
    <Section number={5} heading="Praxisempfehlungen">
      Arbeitgeber sollten ein lückenloses Anwesenheitsprotokoll für international tätige Mitarbeiter führen. {doc.namedEntity} empfiehlt, bei einer erwarteten Anwesenheit von mehr als 150 Tagen frühzeitig eine steuerliche Beratung einzuholen.
    </Section>
    <Section number={6} heading="Quelle und Gültigkeit">
      Herausgeber: {doc.namedEntity} ({doc.namedEntityId})<br />
      Veröffentlicht: {doc.uploadedDate} · Gültig für: {doc.year}
    </Section>
  </>
}

function SocialInsuranceSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Überblick">
      Dieser Leitfaden der {doc.namedEntity} behandelt die sozialversicherungsrechtliche Absicherung von Arbeitnehmern bei grenzüberschreitender Tätigkeit innerhalb der EU auf Basis von {doc.citations}.
    </Section>
    <Section number={2} heading="Grundprinzip: Recht des Tätigkeitsstaates">
      Grundsätzlich gilt das Recht des Staates, in dem die Tätigkeit ausgeübt wird. Bei Entsendungen innerhalb der EU kann das Heimatrecht jedoch aufrechterhalten werden, wenn die Voraussetzungen der {doc.citations} erfüllt sind.
    </Section>
    <Section number={3} heading="A1-Bescheinigung">
      Für entsandte Mitarbeiter ist vor Beginn der Tätigkeit im EU-Ausland eine A1-Bescheinigung beim zuständigen Sozialversicherungsträger zu beantragen. Die Bescheinigung belegt die weitere Unterstellung unter das deutsche Sozialversicherungsrecht.
    </Section>
    <Section number={4} heading="Beitragspflicht und Aufzeichnung">
      Während der Entsendung bleibt die Beitragspflicht gegenüber dem deutschen Sozialversicherungssystem bestehen. Beiträge sind weiterhin vom Arbeitgeber und Arbeitnehmer je zur Hälfte zu tragen. Besondere Aufzeichnungspflichten gelten für Unternehmen im Geltungsbereich der {doc.citations}.
    </Section>
    <Section number={5} heading="Grenzgänger und besondere Beschäftigungsformen">
      Grenzgänger, die in einem EU-Mitgliedsstaat wohnen und in einem anderen arbeiten, unterliegen besonderen Regelungen. {doc.namedEntity} empfiehlt eine individuelle Prüfung vor Aufnahme solcher Beschäftigungsverhältnisse.
    </Section>
    <Section number={6} heading="Gültigkeitsdauer">
      Stand: {doc.uploadedDate} · Herausgeber: {doc.namedEntity} ({doc.namedEntityId}) · Jurisdiktion: {doc.jurisdiction}
    </Section>
  </>
}

function CombinedPolicySections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Geltungsbereich">
      Diese kombinierte HR- und Steuerrichtlinie der {doc.namedEntity} gilt für alle Mitarbeiter, die im Rahmen einer kurzfristigen Auslandsentsendung (bis zu 183 Tage) für das Unternehmen tätig sind. Sie fasst die wesentlichen HR- und steuerrechtlichen Regelungen zusammen.
    </Section>
    <Section number={2} heading="HR-Regelungen">
      Für kurzfristige Entsendungen gelten folgende Grundsätze:<br />
      • Tagegeld: {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency} pro Tag<br />
      • Unterkunft: wird vom Unternehmen gestellt oder erstattet<br />
      • Hin- und Rückreise: auf Geschäftsreisebasis organisiert<br />
      • Weiterhin Geltung des deutschen Arbeitsvertrages
    </Section>
    <Section number={3} heading="Steuerliche Behandlung">
      Steuerliche Aspekte richten sich nach {doc.citations} sowie den einschlägigen DBA-Regelungen. Tagegelder bis zu den gesetzlichen Pauschbeträgen sind steuerfrei. Über diese Grenzen hinausgehende Zahlungen unterliegen dem Lohnsteuerabzug.
    </Section>
    <Section number={4} heading="Sozialversicherung">
      Während der kurzfristigen Entsendung bleibt die Sozialversicherungspflicht in Deutschland grundsätzlich erhalten. Für Einsätze im EU-Ausland ist eine A1-Bescheinigung zu beantragen.
    </Section>
    <Section number={5} heading="Genehmigungsverfahren">
      Kurzfristige Entsendungen sind mindestens 14 Tage vor Beginn beim zuständigen HR-Bereich von {doc.namedEntity} anzumelden. Die Genehmigung umfasst gleichzeitig die steuerliche Freigabe.
    </Section>
    <Section number={6} heading="Inkrafttreten">
      Diese Richtlinie ist ab {doc.uploadedDate} gültig und ersetzt alle bisherigen Einzelregelungen für kurzfristige Entsendungen. Herausgeber: {doc.namedEntity} ({doc.namedEntityId}).
    </Section>
  </>
}

function CrossBorderComplianceSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Überblick">
      Dieser Compliance-Leitfaden von {doc.namedEntity} identifiziert rechtliche Risiken und Anforderungen bei grenzüberschreitender Beschäftigung im EU-Raum. Er befindet sich derzeit im Status „Entwurf" (Stand: {doc.uploadedDate}).
    </Section>
    <Section number={2} heading="Wesentliche Risikobereiche">
      Das geschätzte Risikoexposure beläuft sich auf {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency}. Hauptrisiken umfassen:<br />
      • Nicht angemeldete Betriebsstätten<br />
      • Fehlende A1-Bescheinigungen<br />
      • Verstöße gegen die Entsenderichtlinie ({doc.citations})<br />
      • Unzureichende Lohnsteuerabzüge im Tätigkeitsstaat
    </Section>
    <Section number={3} heading="Rechtliche Anforderungen">
      Unternehmen mit grenzüberschreitend tätigen Mitarbeitern müssen sicherstellen, dass alle Anforderungen der {doc.citations} eingehalten werden. Dies schließt Meldepflichten, Mindestlohnvorschriften und Dokumentationsanforderungen im Tätigkeitsstaat ein.
    </Section>
    <Section number={4} heading="Organisatorische Maßnahmen">
      Zur Risikominimierung empfiehlt {doc.namedEntity}:<br />
      • Einführung eines zentralen Mobilitäts-Tracking-Systems<br />
      • Schulungen für HR und Führungskräfte<br />
      • Jährliche Compliance-Reviews<br />
      • Einbindung lokaler Rechtsberatung in den betroffenen Ländern
    </Section>
    <Section number={5} heading="Nächste Schritte (Entwurf)">
      Nach Abschluss der internen Abstimmung wird dieser Leitfaden finalisiert und in die bestehenden Compliance-Prozesse von {doc.namedEntity} integriert. Zieldatum für die Verabschiedung: Q4 {doc.year}.
    </Section>
  </>
}

function SalarySections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Grundsätze">
      Diese Gehaltsrichtlinie der {doc.namedEntity} regelt die Vergütungsstruktur für Mitarbeiter im internationalen Einsatz. Sie basiert auf {doc.citations} und gilt für alle tariflich und außertariflich beschäftigten Mitarbeiter mit internationalen Aufgaben.
    </Section>
    <Section number={2} heading="Vergütungskomponenten">
      Das Gesamtvergütungspaket setzt sich zusammen aus:<br />
      • Grundgehalt (Zielwert: bis {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency} p.a.)<br />
      • Mobilitätszulage (standortabhängig)<br />
      • Leistungsabhängige Variable<br />
      • Sachleistungen (Wohnung, Schule, Heimreisen)
    </Section>
    <Section number={3} heading="Gehaltsanpassungen bei Auslandseinsatz">
      Die Vergütung wird bei Auslandseinsätzen auf Basis des Purchasing Power Index des Ziellandes angepasst. Die Anpassungsfaktoren werden jährlich durch die Vergütungsabteilung der {doc.namedEntity} aktualisiert.
    </Section>
    <Section number={4} heading="Betriebsrat und Mitbestimmung">
      Die Richtlinie wurde in Abstimmung mit dem Betriebsrat gemäß § 87 BetrVG entwickelt. Änderungen bedürfen der Zustimmung des zuständigen Betriebsrats. Aktuelle Version: {doc.year}.
    </Section>
    <Section number={5} heading="Genehmigungsverfahren">
      Abweichungen von den Standardvergütungspaketen bedürfen der Genehmigung durch HR International und den zuständigen Bereichsvorstand. Anträge sind über das interne HR-Portal einzureichen.
    </Section>
    <Section number={6} heading="Inkrafttreten">
      Gültig ab: {doc.uploadedDate} · Herausgeber: {doc.namedEntity} ({doc.namedEntityId}) · Format: {doc.fileFormat}
    </Section>
  </>
}

function ExpensePolicySections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Geltungsbereich">
      Diese Reisekosten- und Spesenrichtlinie der {doc.namedEntity} gilt für alle Mitarbeiter, die im Rahmen ihrer Tätigkeit dienstliche Reisen unternehmen. Sie regelt erstattungsfähige Ausgaben, Obergrenzen und das Einreichungsverfahren.
    </Section>
    <Section number={2} heading="Erstattungsfähige Ausgaben">
      Erstattet werden ausschließlich notwendige und angemessene Ausgaben, die im Rahmen der Dienstausübung entstehen:<br />
      • Fahrtkosten (Bahn 1. Klasse, Flug Economy)<br />
      • Tagegeld: bis zu {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency}/Tag (gemäß EStG § 9)<br />
      • Unterkunft: bis zu 150 {doc.currency}/Nacht (Großstädte)<br />
      • Kommunikationskosten: pauschal 10 {doc.currency}/Tag
    </Section>
    <Section number={3} heading="Obergrenzen und Besonderheiten">
      Beträge oberhalb der Pauschalsätze des EStG sind lohnsteuerpflichtig und werden entsprechend verrechnet. Bewirtungskosten sind zu 70 % erstattungsfähig und separat auszuweisen.
    </Section>
    <Section number={4} heading="Einreichungsfristen und -verfahren">
      Spesenberichte sind innerhalb von 30 Tagen nach Abschluss der Dienstreise über das Spesensystem einzureichen. Belege sind zwingend beizufügen; Ausgaben ohne Beleg werden nicht erstattet.
    </Section>
    <Section number={5} heading="Genehmigungsverfahren">
      Reisen unter 1.000 {doc.currency} werden durch den direkten Vorgesetzten genehmigt. Reisen darüber hinaus bedürfen der zusätzlichen Freigabe durch den zuständigen Bereichsleiter.
    </Section>
    <Section number={6} heading="Inkrafttreten">
      Gültig ab: {doc.uploadedDate} · Herausgeber: {doc.namedEntity} ({doc.namedEntityId})<br />
      Rechtsgrundlage: {doc.citations}
    </Section>
  </>
}

function TaxReportingObligationSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Einleitung">
      Dieser Leitfaden des {doc.namedEntity} ({doc.namedEntityId}) beschreibt die steuerlichen Meldepflichten für Unternehmen mit international tätigen Mitarbeitern im Geltungsbereich des deutschen Steuerrechts.
    </Section>
    <Section number={2} heading="Anzeigepflicht gemäß § 138 AO">
      Gemäß {doc.citations} sind Steuerpflichtige verpflichtet, die Aufnahme einer Tätigkeit im Ausland sowie die Beteiligung an ausländischen Gesellschaften dem zuständigen Finanzamt anzuzeigen. Die Anzeige hat innerhalb eines Monats nach dem meldepflichtigen Ereignis zu erfolgen.
    </Section>
    <Section number={3} heading="Inhalt der Meldung">
      Die Meldung muss folgende Angaben enthalten:<br />
      • Name und Steuernummer des meldepflichtigen Unternehmens<br />
      • Art und Beginn der Auslandstätigkeit<br />
      • Angaben zur ausländischen Gesellschaft bzw. Betriebsstätte<br />
      • Beteiligungsquoten (bei Auslandsbeteiligungen)
    </Section>
    <Section number={4} heading="Sanktionen bei Pflichtverletzung">
      Verstöße gegen die Anzeigepflicht können als Steuerstraftat oder Steuerordnungswidrigkeit geahndet werden. In schwerwiegenden Fällen drohen Freiheitsstrafen oder empfindliche Geldbußen.
    </Section>
    <Section number={5} heading="Elektronische Übermittlung">
      Meldungen sind grundsätzlich elektronisch über das ELSTER-Portal zu übermitteln. Papierformulare werden nur in Ausnahmefällen akzeptiert.
    </Section>
    <Section number={6} heading="Gültigkeitsdauer">
      Stand: {doc.uploadedDate} · Steuerjahr: {doc.year} · Herausgeber: {doc.namedEntity}
    </Section>
  </>
}

function TaxResidencySections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Überblick">
      Dieser Leitfaden des {doc.namedEntity} definiert die Kriterien der steuerlichen Ansässigkeit in Deutschland auf Basis von {doc.citations} und erläutert ihre Bedeutung für die internationale Besteuerung.
    </Section>
    <Section number={2} heading="Wohnsitz (§ 8 AO)">
      Als Wohnsitz gilt eine Wohnung, über die eine Person unter Umständen verfügt, die auf ein Beibehalten und Benutzen der Wohnung schließen lassen. Ein formell gemeldeter Wohnsitz ist nicht zwingend erforderlich; maßgeblich ist die tatsächliche Nutzung.
    </Section>
    <Section number={3} heading="Gewöhnlicher Aufenthalt (§ 9 AO)">
      Den gewöhnlichen Aufenthalt hat eine Person dort, wo sie sich unter Umständen aufhält, die erkennen lassen, dass sie an diesem Ort nicht nur vorübergehend verweilt. In der Regel wird ein zusammenhängender Aufenthalt von mehr als 6 Monaten als gewöhnlicher Aufenthalt qualifiziert.
    </Section>
    <Section number={4} heading="Bedeutung für die Steuerpflicht">
      Personen mit Wohnsitz oder gewöhnlichem Aufenthalt in Deutschland sind unbeschränkt einkommensteuerpflichtig (Welteinkommensprinzip). Personen ohne diese Anknüpfungspunkte sind nur mit ihren deutschen Einkünften beschränkt steuerpflichtig.
    </Section>
    <Section number={5} heading="Rechtsprechung des BFH">
      Der {doc.namedEntity} hat in mehreren Entscheidungen klargestellt, dass die Beibehaltung einer Wohnung in Deutschland — auch bei längeren Auslandsaufenthalten — die unbeschränkte Steuerpflicht begründen kann, sofern die Wohnung jederzeit genutzt werden könnte.
    </Section>
    <Section number={6} heading="Gültigkeitsdauer">
      Veröffentlicht: {doc.uploadedDate} · Instanz: {doc.namedEntity} ({doc.namedEntityId}) · Rechtsgrundlage: {doc.citations}
    </Section>
  </>
}

function WithholdingTaxSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Einleitung">
      Dieser Leitfaden von {doc.namedEntity} erläutert die Quellensteuerregelungen für internationale Mitarbeiter und Unternehmen mit Einkünften aus Deutschland gemäß {doc.citations}.
    </Section>
    <Section number={2} heading="Quellensteuer gemäß § 49 EStG">
      Beschränkt Steuerpflichtige (Personen ohne Wohnsitz in Deutschland) unterliegen mit bestimmten inländischen Einkünften der beschränkten Steuerpflicht. Hierzu zählen insbesondere Einkünfte aus Lizenzen, Dividenden und Tätigkeitsvergütungen.
    </Section>
    <Section number={3} heading="Steuerabzugsverfahren">
      Die Quellensteuer wird durch den inländischen Schuldner der Einkünfte einbehalten und an das Bundeszentralamt für Steuern abgeführt. Bemessungsgrundlage im vorliegenden Kontext: {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency}.
    </Section>
    <Section number={4} heading="Freistellung und Ermäßigung">
      Auf Antrag kann eine Freistellung oder Ermäßigung der Quellensteuer gewährt werden, wenn ein einschlägiges DBA niedrigere Steuersätze vorsieht. Der Antrag ist beim Bundeszentralamt für Steuern einzureichen.
    </Section>
    <Section number={5} heading="Dokumentationspflichten">
      Inländische Schuldner haben die ausgezahlten Beträge, einbehaltenen Steuern und Empfänger zu dokumentieren und jährlich zu melden. Bei Pflichtverletzung haften Schuldner für nicht abgeführte Steuerbeträge.
    </Section>
    <Section number={6} heading="Gültigkeitsdauer">
      Gültig ab: {doc.uploadedDate} · Steuerjahr: {doc.year} · Herausgeber: {doc.namedEntity} ({doc.namedEntityId})
    </Section>
  </>
}

function EUPostingGuideSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Zweck des Leitfadens">
      Dieser Leitfaden der {doc.namedEntity} beschreibt die Anforderungen der überarbeiteten Entsenderichtlinie ({doc.citations}) und gibt praktische Hinweise für Arbeitgeber und HR-Verantwortliche bei der Entsendung von Mitarbeitern innerhalb der EU.
    </Section>
    <Section number={2} heading="Wesentliche Änderungen durch die Richtlinie 2018/957">
      Die überarbeitete Entsenderichtlinie führt folgende wesentliche Änderungen ein:<br />
      • Anspruch auf das vollständige lokale Lohnniveau (nicht nur Mindestlohn) ab Tag 1<br />
      • Beschränkung der Langzeitentsendung auf 12 Monate (verlängerbar auf 18)<br />
      • Erweiterung des Gleichbehandlungsgrundsatzes auf nahezu alle Arbeitsbedingungen
    </Section>
    <Section number={3} heading="Meldepflichten im Aufnahmeland">
      Entsendende Unternehmen sind verpflichtet, die Entsendung vor Beginn bei der zuständigen Behörde des Aufnahmelandes zu melden. In Deutschland erfolgt die Meldung über das SOKA-Portal. Dokumente sind auf Anfrage bereitzuhalten.
    </Section>
    <Section number={4} heading="Dokumentation und Aufbewahrung">
      Folgende Dokumente sind für die Dauer der Entsendung und darüber hinaus aufzubewahren:<br />
      • A1-Bescheinigung<br />
      • Entsendungsvereinbarung<br />
      • Lohn- und Arbeitszeitnachweise<br />
      • Nachweis über geleistete Zahlungen
    </Section>
    <Section number={5} heading="Sanktionen">
      Verstöße gegen die Anforderungen der Entsenderichtlinie können in den jeweiligen EU-Mitgliedstaaten mit erheblichen Bußgeldern belegt werden. {doc.namedEntity} empfiehlt eine proaktive Compliance-Prüfung vor jeder Entsendung.
    </Section>
    <Section number={6} heading="Gültigkeitsdauer">
      Stand: {doc.uploadedDate} · Herausgeber: {doc.namedEntity} ({doc.namedEntityId}) · Jurisdiktion: {doc.jurisdiction}
    </Section>
  </>
}

function ComplianceLeitfadenSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Überblick (abgelöste Version)">
      Dieser Compliance-Leitfaden von {doc.namedEntity} aus dem Jahr {doc.year} behandelt die wesentlichen Anforderungen an internationale Mitarbeitermobilität. Er wurde durch eine aktuellere Fassung abgelöst und ist nur noch zu Referenzzwecken verfügbar.
    </Section>
    <Section number={2} heading="Damaliger regulatorischer Rahmen">
      Der Leitfaden bezog sich auf die Anforderungen der {doc.citations} sowie die damals geltenden deutschen und europäischen Arbeitsrechtsbestimmungen. Das Compliance-Risikoexposure wurde mit {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency} beziffert.
    </Section>
    <Section number={3} heading="Wesentliche Anforderungen (Stand {doc.year})">
      • Voranmeldung entsandter Mitarbeiter im EU-Ausland<br />
      • Einhaltung lokaler Mindestlohnvorschriften<br />
      • Führung von Lohn- und Arbeitszeitnachweisen<br />
      • Abstimmung mit lokalen Arbeitsbehörden
    </Section>
    <Section number={4} heading="Grund für Ablösung">
      Durch das Inkrafttreten der überarbeiteten EU-Entsenderichtlinie sowie nationale Gesetzesänderungen wurden wesentliche Teile dieses Leitfadens obsolet. Unternehmen werden auf die aktuelle Fassung verwiesen.
    </Section>
    <Section number={5} heading="Archiviert">
      Dieses Dokument ist als „Superseded" archiviert. Gültigkeitsende: 2021 · Herausgeber: {doc.namedEntity} ({doc.namedEntityId})
    </Section>
  </>
}

function AnalyticalReportSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Zusammenfassung">
      Dieser analytische Bericht von {doc.namedEntity} untersucht die steuerlichen und HR-bezogenen Auswirkungen temporärer Mitarbeiterversetzungen auf Unternehmen mit Sitz in Deutschland. Gesamtkostenauswirkung: {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency}.
    </Section>
    <Section number={2} heading="Methodik">
      Die Analyse basiert auf Daten aus 45 deutschen Unternehmen mit mehr als 500 Mitarbeitern, die im Zeitraum {doc.year - 2}–{doc.year} temporäre Versetzungen durchgeführt haben. Ausgewertet wurden Lohnsteuerakten, HR-Daten und Compliance-Berichte.
    </Section>
    <Section number={3} heading="Steuerliche Auswirkungen">
      Im Durchschnitt entstehen pro temporärer Versetzung Mehrkosten von ca. 8.200 {doc.currency} durch Lohnsteueranpassungen, Doppelbesteuerungsabkommen-Compliance und externe Steuerberatung. Die Hauptkosten entstehen durch den Lohnsteuerabzug gemäß {doc.citations}.
    </Section>
    <Section number={4} heading="HR-seitige Auswirkungen">
      HR-Prozesskosten für Vorbereitung, Dokumentation und Nachbereitung einer temporären Versetzung betragen im Median 3.400 {doc.currency} pro Einsatz. Besonders aufwändig sind Einsätze in Länder ohne einschlägiges DBA mit Deutschland.
    </Section>
    <Section number={5} heading="Empfehlungen">
      {doc.namedEntity} empfiehlt:<br />
      1. Einführung eines zentralen Mobility-Management-Systems<br />
      2. Standardisierung der Voranmeldungsprozesse<br />
      3. Frühzeitige Einbindung von Steuerberatern bei Einsätzen &gt; 60 Tage<br />
      4. Regelmäßiges Training für HR-Verantwortliche
    </Section>
    <Section number={6} heading="Status und Freigabe">
      Dieser Bericht befindet sich im Status „Entwurf" (Stand: {doc.uploadedDate}). Finale Freigabe durch: {doc.namedEntity} ({doc.namedEntityId}) · Jurisdiktion: {doc.jurisdiction}
    </Section>
  </>
}
