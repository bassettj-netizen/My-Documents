import { useState, type ReactNode } from 'react'
import {
  ButtonGhost,
  ButtonPrimary,
  buttonShapes,
  buttonSizes,
  ButtonTertiary,
  buttonVariants,
  Checkbox,
  Icon,
  iconType,
  Input,
  Panel,
  panelPlacements,
  panelSizes,
  TextArea,
  Toggle,
  Typography,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, type MetadataDocument, type Space } from '../workspaces/shared'
import type { Bookmark, Guardrail, Template, WorkspaceDetail, WorkspaceExtras } from './workspaceModel'

/**
 * Hackathon Oct '26 — Versions 8/9: a side panel for each kind of My knowledge, instead of a page per area.
 * It opens over the workspace summary (from "Add my content", a row in the card or the set-up checklist),
 * titled with the knowledge type, and only shows that type.
 *
 * - Context: edit the background in place; "Draft from documents" proposes one, and details found in the
 *   documents come up as suggestions to add with one click.
 * - Guardrails: one "Always… / Never…" field, plus ready-made rule sets by workspace type.
 * - Bookmarks: paste a link — the app and a title are worked out from the address; connected sites are suggested.
 * - Templates: pick from a template library (search, recommended for this kind of workspace, multi-select).
 *
 * The suggestions are worked out locally from the workspace's documents and settings — no real AI behind them.
 */

export type KnowledgeSection = 'context' | 'guardrails' | 'bookmarks' | 'templates'
type Lang = 'en' | 'de'

let idCounter = 0
const newId = (prefix: string) => { idCounter += 1; return `${prefix}-${Date.now()}-${idCounter}` }

// ─── Copy ─────────────────────────────────────────────────────────────────────

const T = {
  en: {
    sections: { context: 'Context', guardrails: 'Guardrails', bookmarks: 'Bookmarks', templates: 'Templates' } as Record<KnowledgeSection, string>,
    done: 'Done',
    // context
    background: 'Background',
    backgroundHelp: 'What CoPilot should know about this client, department or project.',
    backgroundPlaceholder: 'e.g. Mid-size manufacturing client, prefers short written summaries, fiscal year ends in June…',
    save: 'Save', cancel: 'Cancel',
    draft: 'Draft from documents',
    draftTitle: 'Suggested background',
    useThis: 'Use this', dismiss: 'Dismiss',
    draftText: (name: string, n: number, types: string[], latest: string) =>
      n === 0
        ? `${name} has no documents yet. Upload some and CoPilot can draft a background from them.`
        : `${name} holds ${n} document${n === 1 ? '' : 's'}, mostly ${types.join(', ')}. The most recent was added on ${latest}. CoPilot should answer from these documents first and say when something isn't covered by them.`,
    details: 'Details',
    detailsHelp: 'Facts about the workspace, such as client number or contact person.',
    detailLabel: 'Label', detailValue: 'Value', add: 'Add',
    foundInDocs: 'Found in the documents',
    suggestedDetails: (docs: MetadataDocument[], types: string[], latest: string) => [
      { label: 'Documents', value: String(docs.length) },
      ...(types[0] ? [{ label: 'Main document type', value: types[0] }] : []),
      ...(latest ? [{ label: 'Latest upload', value: latest }] : []),
    ],
    // guardrails
    rulePlaceholder: 'Always… / Never… e.g. Never give tax advice — refer to the tax team',
    ruleSets: 'Rule sets',
    ruleSetsHelp: 'Ready-made rules for common kinds of workspace. Add a whole set, then switch off what you don\'t need.',
    recommended: 'Recommended',
    addSet: 'Add set', added: 'Added',
    yourRules: 'Rules in this workspace',
    noRules: 'No rules yet.',
    sets: {
      Client: { name: 'Client', rules: ['Only answer from the documents in this workspace', 'Always cite the source for every statement', 'Never mention figures from other clients'] },
      Internal: { name: 'HR', rules: ['Never include personal data such as salaries or health information', 'Point to the relevant works agreement where one exists', 'Always cite the source for every statement'] },
      Project: { name: 'Project', rules: ['Follow the company style guide', 'Flag anything that needs works council consultation', 'Keep answers short and list open questions'] },
    } as Record<string, { name: string; rules: string[] }>,
    // bookmarks
    pastePlaceholder: 'Paste a link — e.g. a SharePoint site, Confluence page or Jira board',
    pasteHelp: 'The app and a name are worked out from the link. You can rename it afterwards.',
    fromConnectors: 'From your connected apps',
    yourBookmarks: 'Bookmarks in this workspace',
    noBookmarks: 'No bookmarks yet.',
    rename: 'Rename',
    // templates
    searchTemplates: 'Search templates',
    recommendedFor: (type: string) => `Recommended for ${type} workspaces`,
    allTemplates: 'All templates',
    addTemplates: (n: number) => n === 0 ? 'Add templates' : `Add ${n} template${n === 1 ? '' : 's'}`,
    yourTemplates: 'Templates in this workspace',
    noTemplates: 'No templates yet.',
    remove: 'Remove',
    website: 'Website',
  },
  de: {
    sections: { context: 'Kontext', guardrails: 'Leitplanken', bookmarks: 'Lesezeichen', templates: 'Vorlagen' } as Record<KnowledgeSection, string>,
    done: 'Fertig',
    background: 'Hintergrund',
    backgroundHelp: 'Was CoPilot über diesen Mandanten, diese Abteilung oder dieses Projekt wissen sollte.',
    backgroundPlaceholder: 'z. B. Mittelständischer Fertigungsmandant, bevorzugt kurze schriftliche Zusammenfassungen, Wirtschaftsjahr endet im Juni …',
    save: 'Speichern', cancel: 'Abbrechen',
    draft: 'Aus Dokumenten entwerfen',
    draftTitle: 'Vorgeschlagener Hintergrund',
    useThis: 'Übernehmen', dismiss: 'Verwerfen',
    draftText: (name: string, n: number, types: string[], latest: string) =>
      n === 0
        ? `${name} enthält noch keine Dokumente. Laden Sie welche hoch, dann kann CoPilot daraus einen Hintergrund entwerfen.`
        : `${name} enthält ${n} ${n === 1 ? 'Dokument' : 'Dokumente'}, vor allem ${types.join(', ')}. Das neueste wurde am ${latest} hinzugefügt. CoPilot sollte zuerst aus diesen Dokumenten antworten und sagen, wenn etwas darin nicht abgedeckt ist.`,
    details: 'Details',
    detailsHelp: 'Fakten zum Arbeitsbereich, etwa Mandantennummer oder Ansprechperson.',
    detailLabel: 'Bezeichnung', detailValue: 'Wert', add: 'Hinzufügen',
    foundInDocs: 'In den Dokumenten gefunden',
    suggestedDetails: (docs: MetadataDocument[], types: string[], latest: string) => [
      { label: 'Dokumente', value: String(docs.length) },
      ...(types[0] ? [{ label: 'Häufigster Dokumenttyp', value: types[0] }] : []),
      ...(latest ? [{ label: 'Letzter Upload', value: latest }] : []),
    ],
    rulePlaceholder: 'Immer … / Niemals … z. B. Niemals Steuerberatung geben – an das Steuerteam verweisen',
    ruleSets: 'Regelsätze',
    ruleSetsHelp: 'Fertige Regeln für typische Arbeitsbereiche. Fügen Sie einen ganzen Satz hinzu und schalten Sie aus, was Sie nicht brauchen.',
    recommended: 'Empfohlen',
    addSet: 'Satz hinzufügen', added: 'Hinzugefügt',
    yourRules: 'Regeln in diesem Arbeitsbereich',
    noRules: 'Noch keine Regeln.',
    sets: {
      Client: { name: 'Mandant', rules: ['Nur aus den Dokumenten dieses Arbeitsbereichs antworten', 'Für jede Aussage immer die Quelle angeben', 'Niemals Zahlen anderer Mandanten nennen'] },
      Internal: { name: 'HR', rules: ['Niemals personenbezogene Daten wie Gehälter oder Gesundheitsdaten nennen', 'Auf die passende Betriebsvereinbarung verweisen, wo es eine gibt', 'Für jede Aussage immer die Quelle angeben'] },
      Project: { name: 'Projekt', rules: ['Formulierungen nach dem Styleguide des Unternehmens', 'Auf alles hinweisen, was eine Beteiligung des Betriebsrats erfordert', 'Kurz antworten und offene Fragen auflisten'] },
    } as Record<string, { name: string; rules: string[] }>,
    pastePlaceholder: 'Link einfügen – z. B. SharePoint-Website, Confluence-Seite oder Jira-Board',
    pasteHelp: 'App und Name werden aus dem Link ermittelt. Sie können ihn danach umbenennen.',
    fromConnectors: 'Aus Ihren verbundenen Apps',
    yourBookmarks: 'Lesezeichen in diesem Arbeitsbereich',
    noBookmarks: 'Noch keine Lesezeichen.',
    rename: 'Umbenennen',
    searchTemplates: 'Vorlagen durchsuchen',
    recommendedFor: (type: string) => `Empfohlen für ${type}-Arbeitsbereiche`,
    allTemplates: 'Alle Vorlagen',
    addTemplates: (n: number) => n === 0 ? 'Vorlagen hinzufügen' : `${n} ${n === 1 ? 'Vorlage' : 'Vorlagen'} hinzufügen`,
    yourTemplates: 'Vorlagen in diesem Arbeitsbereich',
    noTemplates: 'Noch keine Vorlagen.',
    remove: 'Entfernen',
    website: 'Website',
  },
}

/** The template library the picker browses — made up, grouped by where the templates live. */
const LIBRARY: Record<Lang, (Omit<Template, 'id'> & { for: string[] })[]> = {
  en: [
    { name: 'Employment contract (permanent)', app: 'Personal Office', description: 'Standard contract for permanent employees', for: ['Internal'] },
    { name: 'Fixed-term employment contract', app: 'Personal Office', description: 'With and without objective reason', for: ['Internal', 'Client'] },
    { name: 'Warning letter', app: 'Personal Office', description: 'Formal warning with the facts and consequences', for: ['Internal'] },
    { name: 'Job reference letter', app: 'Haufe Zeugnismanager', description: 'Qualified reference with rating scale', for: ['Internal'] },
    { name: 'Works council information letter', app: 'Personal Office', description: 'Informing the works council about a change', for: ['Internal', 'Project'] },
    { name: 'Tax advisory engagement letter', app: 'Microsoft Word', description: 'Scope, fees and responsibilities', for: ['Client'] },
    { name: 'Monthly compliance report', app: 'SharePoint', description: 'Open items, deadlines and changes in the law', for: ['Client'] },
    { name: 'Meeting minutes', app: 'Microsoft Word', description: 'Attendees, decisions and actions', for: ['Project', 'Client'] },
    { name: 'Policy document', app: 'Microsoft Word', description: 'House layout for policies', for: ['Project', 'Internal'] },
    { name: 'Project status report', app: 'SharePoint', description: 'Progress, risks and next steps', for: ['Project'] },
  ],
  de: [
    { name: 'Arbeitsvertrag (unbefristet)', app: 'Personal Office', description: 'Standardvertrag für unbefristet Beschäftigte', for: ['Internal'] },
    { name: 'Befristeter Arbeitsvertrag', app: 'Personal Office', description: 'Mit und ohne Sachgrund', for: ['Internal', 'Client'] },
    { name: 'Abmahnung', app: 'Personal Office', description: 'Förmliche Abmahnung mit Sachverhalt und Konsequenzen', for: ['Internal'] },
    { name: 'Arbeitszeugnis', app: 'Haufe Zeugnismanager', description: 'Qualifiziertes Zeugnis mit Bewertungsskala', for: ['Internal'] },
    { name: 'Information an den Betriebsrat', app: 'Personal Office', description: 'Den Betriebsrat über eine Änderung informieren', for: ['Internal', 'Project'] },
    { name: 'Auftragsbestätigung Steuerberatung', app: 'Microsoft Word', description: 'Umfang, Honorar und Pflichten', for: ['Client'] },
    { name: 'Monatlicher Compliance-Bericht', app: 'SharePoint', description: 'Offene Punkte, Fristen und Gesetzesänderungen', for: ['Client'] },
    { name: 'Besprechungsprotokoll', app: 'Microsoft Word', description: 'Teilnehmende, Entscheidungen und Aufgaben', for: ['Project', 'Client'] },
    { name: 'Richtliniendokument', app: 'Microsoft Word', description: 'Hauslayout für Richtlinien', for: ['Project', 'Internal'] },
    { name: 'Projektstatusbericht', app: 'SharePoint', description: 'Fortschritt, Risiken und nächste Schritte', for: ['Project'] },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Works out the app and a readable name from a pasted link. */
function readLink(raw: string, websiteLabel: string): { url: string; title: string; app: string } | null {
  const text = raw.trim()
  if (!text) return null
  let url: URL
  try { url = new URL(/^https?:\/\//.test(text) ? text : `https://${text}`) } catch { return null }
  if (!url.hostname.includes('.')) return null
  const host = url.hostname.toLowerCase()
  const path = url.pathname.toLowerCase()
  const app =
    host.includes('sharepoint.com') ? 'SharePoint'
    : host.includes('atlassian.net') && (path.includes('/jira') || path.includes('/browse')) ? 'Jira'
    : host.includes('atlassian.net') || host.includes('confluence') ? 'Confluence'
    : host.includes('teams.microsoft.com') ? 'Microsoft Teams'
    : host.includes('haufe.de') && path.includes('personal-office') ? 'Personal Office'
    : host.includes('drive.google.com') ? 'Google Drive'
    : websiteLabel
  const lastSegment = url.pathname.split('/').filter(Boolean).pop()
  const words = (lastSegment ?? host.replace(/^www\./, '').split('.')[0]).replace(/[-_+]/g, ' ').replace(/%20/g, ' ')
  const title = words.charAt(0).toUpperCase() + words.slice(1)
  return { url: url.toString(), title, app }
}

function docStats(docs: MetadataDocument[], formatDate: (iso: string) => string) {
  const counts = new Map<string, number>()
  docs.forEach(d => counts.set(d.documentType, (counts.get(d.documentType) ?? 0) + 1))
  const types = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([type]) => type)
  const latestIso = docs.reduce<string>((max, d) => (d.uploadedDate > max ? d.uploadedDate : max), '')
  return { types, latest: latestIso ? formatDate(latestIso) : '' }
}

// ─── Building blocks ──────────────────────────────────────────────────────────

function SectionHeading({ title, help }: { title: string; help?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography size="base" weight="semibold" color="neutral-darken5">{title}</Typography>
      {help && <Typography size="base-sm" color="neutral-darken2">{help}</Typography>}
    </div>
  )
}

/** A suggestion the user can take with one click: dashed outline, "+" and the text. */
function SuggestionChip({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: spacing(1), padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
        border: `1px dashed ${hovered ? colorPalette.blue.base : colorPalette.neutral.lighten1}`, backgroundColor: hovered ? colorPalette.blue.lighten5 : colorPalette.white,
        fontFamily: 'inherit', fontSize: 13, color: colorPalette.neutral.darken5, textAlign: 'left',
      }}
    >
      <Icon type={iconType.PlusOutlined} size={12} color="blue-base" />
      {children}
    </button>
  )
}

function ItemRow({ children, onRemove, removeLabel }: { children: ReactNode; onRemove: () => void; removeLabel: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px ${spacing(3)}px`, borderTop: `1px solid ${colorPalette.neutral.lighten3}` }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: spacing(2) }}>{children}</div>
      <ButtonGhost size={buttonSizes.SMALL} shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={onRemove} ariaLabel={removeLabel} />
    </div>
  )
}

function ItemList({ title, empty, children, count }: { title: string; empty: string; children: ReactNode; count: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <Typography size="base-sm" weight="semibold" color="neutral-darken2">{title}</Typography>
      {count === 0
        ? <Typography size="base-sm" color="neutral-darken1">{empty}</Typography>
        : <div style={{ border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 8, overflow: 'hidden', marginTop: -1 }}>{children}</div>}
    </div>
  )
}

function AppTag({ app }: { app: string }) {
  return <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: colorPalette.neutral.darken3, backgroundColor: colorPalette.neutral.lighten4, borderRadius: 4, padding: '1px 6px' }}>{app}</span>
}

const ellipsis = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const

// ─── Sections ─────────────────────────────────────────────────────────────────

function ContextSection({ lang, space, docs, details, formatDate, onSaveBackground, onDetailsChange }: {
  lang: Lang
  space: Space
  docs: MetadataDocument[]
  details: WorkspaceDetail[]
  formatDate: (iso: string) => string
  onSaveBackground: (text: string) => void
  onDetailsChange: (details: WorkspaceDetail[]) => void
}) {
  const t = T[lang]
  const [background, setBackground] = useState(space.context ?? '')
  const [draft, setDraft] = useState<string | null>(null)
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const dirty = background.trim() !== (space.context ?? '').trim()
  const { types, latest } = docStats(docs, formatDate)
  const suggestions = t.suggestedDetails(docs, types, latest)
    .filter(s => !details.some(d => d.label === s.label))
  const addDetail = (l: string, v: string) => onDetailsChange([...details, { id: newId('detail'), label: l, value: v }])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(3) }}>
          <div style={{ flex: 1 }}><SectionHeading title={t.background} help={t.backgroundHelp} /></div>
          <ButtonTertiary size={buttonSizes.SMALL} leftIcon={iconType.SparksOutlined} onClick={() => setDraft(t.draftText(space.name, docs.length, types, latest))}>{t.draft}</ButtonTertiary>
        </div>
        {draft && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2), padding: spacing(3), borderRadius: 8, backgroundColor: colorPalette.blue.lighten5, border: `1px solid ${colorPalette.blue.lighten4}` }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
              <Icon type={iconType.SparksOutlined} size={16} color="blue-base" />
              <Typography size="base-sm" weight="semibold" color="blue-darken2">{t.draftTitle}</Typography>
            </span>
            <Typography size="base-sm" color="neutral-darken5">{draft}</Typography>
            <div style={{ display: 'flex', gap: spacing(2) }}>
              <ButtonPrimary size={buttonSizes.SMALL} onClick={() => { setBackground(draft); onSaveBackground(draft); setDraft(null) }}>{t.useThis}</ButtonPrimary>
              <ButtonGhost size={buttonSizes.SMALL} onClick={() => setDraft(null)}>{t.dismiss}</ButtonGhost>
            </div>
          </div>
        )}
        <TextArea value={background} autoSize={{ minRows: 3, maxRows: 10 }} placeholder={t.backgroundPlaceholder} onChange={e => setBackground(e.target.value)} />
        {dirty && (
          <div style={{ display: 'flex', gap: spacing(2), justifyContent: 'flex-end' }}>
            <ButtonTertiary size={buttonSizes.SMALL} onClick={() => setBackground(space.context ?? '')}>{t.cancel}</ButtonTertiary>
            <ButtonPrimary size={buttonSizes.SMALL} onClick={() => onSaveBackground(background.trim())}>{t.save}</ButtonPrimary>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <SectionHeading title={t.details} help={t.detailsHelp} />
        {details.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2) }}>
            {details.map(d => (
              <span key={d.id} style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(1), padding: '2px 4px 2px 10px', borderRadius: 999, backgroundColor: colorPalette.neutral.lighten4, fontSize: 13, color: colorPalette.neutral.darken5 }}>
                <span style={{ color: colorPalette.neutral.darken2 }}>{d.label}:</span> {d.value}
                <ButtonGhost size={buttonSizes.SMALL} shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => onDetailsChange(details.filter(x => x.id !== d.id))} ariaLabel={t.remove} />
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: spacing(2) }}
          onKeyDown={e => { if (e.key === 'Enter' && label.trim() && value.trim()) { addDetail(label.trim(), value.trim()); setLabel(''); setValue('') } }}>
          <div style={{ flex: 1 }}><Input name="detail-label" value={label} placeholder={t.detailLabel} onChange={e => setLabel(e.target.value)} /></div>
          <div style={{ flex: 1.4 }}><Input name="detail-value" value={value} placeholder={t.detailValue} onChange={e => setValue(e.target.value)} /></div>
          <ButtonTertiary disabled={!label.trim() || !value.trim()} onClick={() => { addDetail(label.trim(), value.trim()); setLabel(''); setValue('') }}>{t.add}</ButtonTertiary>
        </div>
        {suggestions.length > 0 && docs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <Typography size="base-sm" color="neutral-darken2">{t.foundInDocs}</Typography>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2) }}>
              {suggestions.map(s => <SuggestionChip key={s.label} onClick={() => addDetail(s.label, s.value)}>{s.label}: {s.value}</SuggestionChip>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function GuardrailsSection({ lang, spaceType, guardrails, onChange }: {
  lang: Lang
  spaceType: string
  guardrails: Guardrail[]
  onChange: (guardrails: Guardrail[]) => void
}) {
  const t = T[lang]
  const [text, setText] = useState('')
  const has = (rule: string) => guardrails.some(g => g.text === rule)
  const addRules = (rules: string[]) => onChange([...guardrails, ...rules.filter(r => !has(r)).map(r => ({ id: newId('guardrail'), text: r, enabled: true }))])
  const add = () => { if (text.trim()) { addRules([text.trim()]); setText('') } }
  // The recommended set comes first.
  const setKeys = Object.keys(t.sets).sort((a, b) => (a === spaceType ? -1 : b === spaceType ? 1 : 0))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
      <div style={{ display: 'flex', gap: spacing(2) }} onKeyDown={e => { if (e.key === 'Enter') add() }}>
        <div style={{ flex: 1 }}><Input name="new-rule" value={text} placeholder={t.rulePlaceholder} onChange={e => setText(e.target.value)} /></div>
        <ButtonPrimary leftIcon={iconType.PlusOutlined} disabled={!text.trim()} onClick={add}>{t.add}</ButtonPrimary>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <SectionHeading title={t.ruleSets} help={t.ruleSetsHelp} />
        {setKeys.map(key => {
          const set = t.sets[key]
          const missing = set.rules.filter(r => !has(r))
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: spacing(2), padding: spacing(3), borderRadius: 8, border: `1px solid ${key === spaceType ? colorPalette.blue.lighten3 : colorPalette.neutral.lighten2}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                <Typography size="base" weight="semibold" color="neutral-darken5">{set.name}</Typography>
                {key === spaceType && <span style={{ fontSize: 11, fontWeight: 600, color: colorPalette.blue.darken1, backgroundColor: colorPalette.blue.lighten5, borderRadius: 4, padding: '1px 6px' }}>{t.recommended}</span>}
                <div style={{ flex: 1 }} />
                {missing.length === 0
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: colorPalette.neutral.darken2 }}><Icon type={iconType.CheckOutlined} size={12} color="neutral-darken2" />{t.added}</span>
                  : <ButtonTertiary size={buttonSizes.SMALL} onClick={() => addRules(set.rules)}>{t.addSet}</ButtonTertiary>}
              </div>
              <ul style={{ margin: 0, paddingLeft: spacing(5), display: 'flex', flexDirection: 'column', gap: 2 }}>
                {set.rules.map(r => <li key={r}><Typography size="base-sm" color={has(r) ? 'neutral-darken1' : 'neutral-darken4'}>{r}</Typography></li>)}
              </ul>
            </div>
          )
        })}
      </div>

      <ItemList title={t.yourRules} empty={t.noRules} count={guardrails.length}>
        {guardrails.map(g => (
          <ItemRow key={g.id} removeLabel={t.remove} onRemove={() => onChange(guardrails.filter(x => x.id !== g.id))}>
            <Toggle checked={g.enabled} onChange={enabled => onChange(guardrails.map(x => x.id === g.id ? { ...x, enabled } : x))} />
            <Typography size="base-sm" color={g.enabled ? 'neutral-darken5' : 'neutral-darken2'}>{g.text}</Typography>
          </ItemRow>
        ))}
      </ItemList>
    </div>
  )
}

function BookmarksSection({ lang, space, bookmarks, onChange }: {
  lang: Lang
  space: Space
  bookmarks: Bookmark[]
  onChange: (bookmarks: Bookmark[]) => void
}) {
  const t = T[lang]
  const [link, setLink] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const addLink = (raw: string) => {
    const read = readLink(raw, t.website)
    if (!read) return
    const bookmark = { id: newId('bookmark'), ...read }
    onChange([bookmark, ...bookmarks])
    setLink('')
    setRenamingId(bookmark.id)
  }
  const fromConnectors = space.connectors
    .map(c => readLink(c.label, t.website))
    .filter((b): b is NonNullable<typeof b> => !!b && !bookmarks.some(x => x.url === b.url))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
        <div
          onPaste={e => { const pasted = e.clipboardData.getData('text'); if (readLink(pasted, t.website)) { e.preventDefault(); addLink(pasted) } }}
          onKeyDown={e => { if (e.key === 'Enter') addLink(link) }}
        >
          <Input name="bookmark-link" value={link} placeholder={t.pastePlaceholder} onChange={e => setLink(e.target.value)} />
        </div>
        <Typography size="base-sm" color="neutral-darken2">{t.pasteHelp}</Typography>
      </div>

      {fromConnectors.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <Typography size="base-sm" weight="semibold" color="neutral-darken2">{t.fromConnectors}</Typography>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2) }}>
            {fromConnectors.map(b => <SuggestionChip key={b.url} onClick={() => addLink(b.url)}>{b.app} · {new URL(b.url).hostname}</SuggestionChip>)}
          </div>
        </div>
      )}

      <ItemList title={t.yourBookmarks} empty={t.noBookmarks} count={bookmarks.length}>
        {bookmarks.map(b => (
          <ItemRow key={b.id} removeLabel={t.remove} onRemove={() => onChange(bookmarks.filter(x => x.id !== b.id))}>
            <Icon type={iconType.LinkOutlined} size={16} color="blue-base" />
            {renamingId === b.id ? (
              <div style={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setRenamingId(null) }}>
                <Input name={`rename-${b.id}`} value={b.title} onChange={e => onChange(bookmarks.map(x => x.id === b.id ? { ...x, title: e.target.value } : x))} onBlur={() => setRenamingId(null)} />
              </div>
            ) : (
              <span title={t.rename} onClick={() => setRenamingId(b.id)} style={{ flex: 1, minWidth: 0, fontSize: 14, color: colorPalette.neutral.darken5, cursor: 'text', ...ellipsis }}>{b.title}</span>
            )}
            <AppTag app={b.app} />
          </ItemRow>
        ))}
      </ItemList>
    </div>
  )
}

function TemplatesSection({ lang, spaceType, templates, onChange }: {
  lang: Lang
  spaceType: string
  templates: Template[]
  onChange: (templates: Template[]) => void
}) {
  const t = T[lang]
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const inWorkspace = (name: string) => templates.some(x => x.name === name)
  const q = query.trim().toLowerCase()
  const library = LIBRARY[lang].filter(item => !q || `${item.name} ${item.app} ${item.description}`.toLowerCase().includes(q))
  const recommended = library.filter(item => item.for.includes(spaceType))
  const others = library.filter(item => !item.for.includes(spaceType))
  const typeName = t.sets[spaceType]?.name ?? ''
  const toggle = (name: string) => setPicked(prev => { const next = new Set(prev); if (next.has(name)) next.delete(name); else next.add(name); return next })
  const addPicked = () => {
    const toAdd = LIBRARY[lang].filter(item => picked.has(item.name) && !inWorkspace(item.name))
    onChange([...templates, ...toAdd.map(({ name, app, description }) => ({ id: newId('template'), name, app, description }))])
    setPicked(new Set())
  }

  const renderGroup = (title: string, items: typeof library) => items.length > 0 && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
      <Typography size="base-sm" weight="semibold" color="neutral-darken2">{title}</Typography>
      {items.map(item => {
        const added = inWorkspace(item.name)
        return (
          <label key={item.name} style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(3), padding: `${spacing(2)}px ${spacing(2)}px`, borderRadius: 6, cursor: added ? 'default' : 'pointer' }}>
            <Checkbox checked={added || picked.has(item.name)} disabled={added} onChange={() => toggle(item.name)} />
            <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken5 }}>{item.name}</span>
                <AppTag app={item.app} />
              </span>
              <span style={{ fontSize: 12, color: colorPalette.neutral.darken2 }}>{item.description}</span>
            </span>
          </label>
        )
      })}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
      <Input name="template-search" value={query} placeholder={t.searchTemplates} onChange={e => setQuery(e.target.value)} />
      {renderGroup(typeName ? t.recommendedFor(typeName) : t.allTemplates, typeName ? recommended : library)}
      {typeName && renderGroup(t.allTemplates, others)}
      <div>
        <ButtonPrimary leftIcon={iconType.PlusOutlined} disabled={picked.size === 0} onClick={addPicked}>{t.addTemplates(picked.size)}</ButtonPrimary>
      </div>
      <ItemList title={t.yourTemplates} empty={t.noTemplates} count={templates.length}>
        {templates.map(x => (
          <ItemRow key={x.id} removeLabel={t.remove} onRemove={() => onChange(templates.filter(y => y.id !== x.id))}>
            <Icon type={iconType.ArticleOutlined} size={16} color="neutral-darken3" />
            <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: colorPalette.neutral.darken5, ...ellipsis }}>{x.name}</span>
            <AppTag app={x.app} />
          </ItemRow>
        ))}
      </ItemList>
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

const SECTION_ICONS: Record<KnowledgeSection, string> = {
  context: iconType.InfoCircleOutlined,
  guardrails: iconType.ShieldCheckOutlined,
  bookmarks: iconType.BookmarkOutlined,
  templates: iconType.ArticleOutlined,
}

export function KnowledgePanel({ lang, open, section, onClose, space, docs, extras, formatDate, onExtrasChange, onSaveBackground }: {
  lang: Lang
  open: boolean
  section: KnowledgeSection
  onClose: () => void
  space: Space
  docs: MetadataDocument[]
  extras: WorkspaceExtras
  formatDate: (iso: string) => string
  onExtrasChange: (patch: Partial<WorkspaceExtras>) => void
  onSaveBackground: (text: string) => void
}) {
  const t = T[lang]
  return (
    <Panel
      visible={open}
      onClose={onClose}
      placement={panelPlacements.RIGHT}
      size={panelSizes.MEDIUM}
      // One panel per knowledge type, titled with it — no switching between types inside the panel.
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <Icon type={SECTION_ICONS[section] as never} size={20} color="neutral-darken5" />
          <span style={{ fontSize: 20, fontWeight: 600, color: colorPalette.neutral.darken5 }}>{t.sections[section]}</span>
        </span>
      }
      footer={{ buttons: [{ variant: buttonVariants.PRIMARY, props: { children: t.done, onClick: () => onClose() } }] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
        {/* Keyed by workspace and section so each opens fresh. */}
        {section === 'context' && (
          <ContextSection key={`${space.id}-context`} lang={lang} space={space} docs={docs} details={extras.details} formatDate={formatDate}
            onSaveBackground={onSaveBackground} onDetailsChange={details => onExtrasChange({ details })} />
        )}
        {section === 'guardrails' && (
          <GuardrailsSection key={`${space.id}-guardrails`} lang={lang} spaceType={space.type} guardrails={extras.guardrails} onChange={guardrails => onExtrasChange({ guardrails })} />
        )}
        {section === 'bookmarks' && (
          <BookmarksSection key={`${space.id}-bookmarks`} lang={lang} space={space} bookmarks={extras.bookmarks} onChange={bookmarks => onExtrasChange({ bookmarks })} />
        )}
        {section === 'templates' && (
          <TemplatesSection key={`${space.id}-templates`} lang={lang} spaceType={space.type} templates={extras.templates} onChange={templates => onExtrasChange({ templates })} />
        )}
      </div>
    </Panel>
  )
}
