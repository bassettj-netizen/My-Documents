import { Fragment, useMemo, useRef, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import MyDocumentsV1 from '../my-documents/Version1'
import ConnectionsPage from '../../connections/ConnectionsPage'
import {
  ButtonDanger,
  ButtonGhost,
  buttonShapes,
  ButtonPrimary,
  ButtonTertiary,
  buttonVariants,
  Checkbox,
  DatePicker,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  Icon,
  iconType,
  Input,
  Modal,
  modalVariants,
  Pagination,
  PopOver,
  PropertyItem,
  propertyItemVariants,
  popOverPlacements,
  popOverTriggers,
  SearchBar,
  searchbarWidth,
  Table,
  TextArea,
  toastPlacements,
  Tooltip,
  tooltipPlacements,
  tooltipSizes,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import {
  colorPalette,
  computeDocSourceMap,
  formatDate,
  PAGE_SIZE,
  Skeleton,
  skeletonVariants,
  SpaceAvatar,
  SpaceFormModal,
  SpacesListView,
  sourceIcon,
  spaceConnectorLabel,
  spacing,
  stripYear,
  useMountLoading,
  useSidebarWidth,
  useWorkspaceState,
  VisibilityIcon,
  type DocSource,
  type MetadataDocument,
  type Space,
  type SpaceFormValues,
} from '../workspaces/shared'
import { BasicUploadModal, CopilotIcon } from '../workspaces/WorkspacesBasic'
import { seedShortSummary, seedSummaryDetail } from './summaries'

/**
 * Metadata — Version 12: Version 9 with rows as tall as their content, and a short
 * matter reference in the table instead of the summary.
 *
 *   file icon · Name (+ size) · Status · Source · Type · Matter reference · Parties · Dates · Updated
 *
 * - Matter reference: the matter a document belongs to, in as few words as possible
 *   ("VAT return Q2 2026"), edited from the table popover and shown in the preview.
 *   The longer summary lives in the preview only.
 * - Nothing in the table is cut off: Name, Type and Matter reference wrap onto as many lines as they need,
 *   and Dates lists every entry, one per line. Parties lists up to five, then "+N" for the rest; the
 *   cell's tooltip always lists every party with its role. Two documents per space have ten parties.
 * - The Parties tooltip still adds each party's role; other cells have nothing hidden to show.
 * - Column widths: Name 16%, Type 120px, Matter reference 13%; Parties and Dates split the rest equally.
 * - Everything else — the other column widths, popover editors, key-dates-only Dates, the preview —
 *   is as in Version 9.
 */

const BASE = '/projects/metadata/table'

/** Same slug rule as Workspaces Basic, so space URLs match between the two versions. */
function slugify(name: string): string {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ─── Metadata model ───────────────────────────────────────────────────────────

type Party = { id: string; name: string; role: string }
type KeyDate = {
  id: string
  label: string
  date: string
  isDeadline: boolean
  /** An action that was taken on this date (filed, paid, signed…), as opposed to a reference date like the document date. */
  isAction?: boolean
  /** Set (possibly '' while being edited) when this entry is a period running from `date` to `endDate`. */
  endDate?: string
}

const isPeriod = (d: KeyDate) => d.endDate !== undefined
type FieldKey = 'documentType' | 'matterReference' | 'summary' | 'parties' | 'dates'

type ExtractedMetadata = {
  documentType: string
  /** The matter this document belongs to, as concisely as possible — a few words, up to MATTER_MAX characters. */
  matterReference: string
  /** The preview's summary: a paragraph, up to SUMMARY_MAX characters. */
  summary: string
  parties: Party[]
  dates: KeyDate[]
  /** Fields the user has changed by hand, so the UI can tell them apart from AI output. */
  edited: Partial<Record<FieldKey, true>>
}

const FIELD_LABELS: Record<FieldKey, string> = {
  documentType: 'Type',
  matterReference: 'Matter reference',
  summary: 'Summary',
  parties: 'Parties',
  dates: 'Dates',
}

const EMPTY_METADATA: ExtractedMetadata = { documentType: '', matterReference: '', summary: '', parties: [], dates: [], edited: {} }

let idCounter = 0
const newId = (prefix: string) => `${prefix}-${Date.now()}-${++idCounter}`

// ─── Deterministic seed extraction ────────────────────────────────────────────

type MetaTheme = {
  /** Short matter names — a few words each, never a sentence. */
  matters: string[]
  counterparties: { name: string; role: string }[]
  primaryRole: string
  /** Periods a document can refer to (tax year, quarter, plan year…), as ISO start/end dates. */
  periods: { start: string; end: string }[]
  deadlineLabels: string[]
  actionLabels: string[]
}

const META_THEMES: Record<string, MetaTheme> = {
  'space-acme': {
    matters: [
      'VAT return Q2 2026',
      'Annual tax compliance 2025',
      'Tax audit 2022–2024',
      'Organschaft set-up',
      'Brenner Logistik acquisition',
      'Trade tax objection 2024',
      'Year-end closing 2025',
      'Austrian secondments',
    ],
    counterparties: [
      { name: 'Finanzamt München', role: 'Tax authority' },
      { name: 'KPMG AG Wirtschaftsprüfungsgesellschaft', role: 'Auditor' },
      { name: 'Dr. Anna Weber', role: 'Tax advisor' },
      { name: 'Brenner Logistik GmbH', role: 'Target company' },
      { name: 'Commerzbank AG', role: 'Lender' },
    ],
    primaryRole: 'Client',
    periods: [
      { start: '2025-01-01', end: '2025-12-31' },
      { start: '2026-04-01', end: '2026-06-30' },
      { start: '2026-07-01', end: '2026-07-31' },
      { start: '2022-01-01', end: '2024-12-31' },
      { start: '2025-10-01', end: '2026-03-31' },
    ],
    deadlineLabels: ['Filing deadline', 'Objection deadline', 'Payment due', 'Response due'],
    actionLabels: ['Filed with tax office', 'Payment made', 'Objection submitted', 'Signed'],
  },
  'space-alpha': {
    matters: [
      'Cloud tenant migration',
      'Vendor DPA review',
      'Customer pilot rollout',
      'Search outage review',
      'Q4 budget review',
      'OCR vendor evaluation',
    ],
    counterparties: [
      { name: 'Alpha Steering Committee', role: 'Approver' },
      { name: 'Nordlicht Software GmbH', role: 'Vendor' },
      { name: 'Maria Schulz', role: 'Project lead' },
      { name: 'IT Security Office', role: 'Reviewer' },
    ],
    primaryRole: 'Owner',
    periods: [
      { start: '2026-10-01', end: '2026-12-31' },
      { start: '2026-07-01', end: '2026-12-31' },
      { start: '2026-09-01', end: '2026-09-30' },
    ],
    deadlineLabels: ['Go-live', 'Sign-off due', 'Feedback due', 'Milestone'],
    actionLabels: ['Approved', 'Contract signed', 'Sign-off given', 'Budget released'],
  },
  'space-hr': {
    matters: [
      'Hybrid working policy',
      'Parental leave',
      'Benefits enrolment 2026',
      'Freiburg relocation',
      'Applicant data (GDPR)',
    ],
    counterparties: [
      { name: 'Works Council (Betriebsrat)', role: 'Co-determination body' },
      { name: 'Techniker Krankenkasse', role: 'Health insurer' },
      { name: 'Jonas Becker', role: 'HR business partner' },
      { name: 'DATEV eG', role: 'Payroll provider' },
    ],
    primaryRole: 'Employer',
    periods: [
      { start: '2026-01-01', end: '2026-12-31' },
      { start: '2026-01-01', end: '2026-06-30' },
      { start: '2026-11-01', end: '2026-11-30' },
    ],
    deadlineLabels: ['Enrolment deadline', 'Review due', 'Consultation deadline', 'Submission due'],
    actionLabels: ['Agreed with works council', 'Signed', 'Published to staff', 'Submitted'],
  },
}

const TODAY_MS = new Date(new Date().toISOString().slice(0, 10)).getTime()
const DAY_MS = 86400000
const isoFromOffset = (days: number) => new Date(TODAY_MS + days * DAY_MS).toISOString().slice(0, 10)

function pick<T>(pool: T[], n: number): T {
  return pool[((n % pool.length) + pool.length) % pool.length]
}

// Seed positions (per space) of the documents that list ten parties.
const MANY_PARTY_DOCS = [0, 4]

/** More people and organisations per space, so a document can plausibly involve ten parties. */
const EXTRA_PARTIES: Record<string, { name: string; role: string }[]> = {
  'space-acme': [
    { name: 'Deutsche Bank AG', role: 'Lender' },
    { name: 'Hengeler Mueller', role: 'Legal counsel' },
    { name: 'Bundeszentralamt für Steuern', role: 'Tax authority' },
    { name: 'Acme Logistics GmbH', role: 'Subsidiary' },
    { name: 'Acme Services GmbH', role: 'Subsidiary' },
    { name: 'Thomas Richter', role: 'Managing director' },
    { name: 'Sabine Keller', role: 'CFO' },
    { name: 'IHK München', role: 'Chamber of commerce' },
  ],
  'space-alpha': [
    { name: 'Cloudwerk GmbH', role: 'Hosting provider' },
    { name: 'Datenschutz Nord GmbH', role: 'Data protection officer' },
    { name: 'Lukas Hartmann', role: 'Engineering lead' },
    { name: 'Procurement Office', role: 'Buyer' },
    { name: 'Customer Team North', role: 'Pilot customer' },
    { name: 'Customer Team South', role: 'Pilot customer' },
    { name: 'Customer Team West', role: 'Pilot customer' },
    { name: 'Legal Department', role: 'Reviewer' },
  ],
  'space-hr': [
    { name: 'Deutsche Rentenversicherung', role: 'Pension insurer' },
    { name: 'AOK Bayern', role: 'Health insurer' },
    { name: 'JobRad GmbH', role: 'Benefits provider' },
    { name: 'Allianz Lebensversicherungs-AG', role: 'Pension provider' },
    { name: 'Freiburg Office Management', role: 'Site management' },
    { name: 'Anna Schneider', role: 'Payroll specialist' },
    { name: 'Data Protection Officer', role: 'Reviewer' },
    { name: 'Staff Representatives', role: 'Employee body' },
  ],
}

/** What the extraction "found" for a seeded document. Deliberately leaves gaps so every empty state shows up. */
function seedMetadata(doc: MetadataDocument, spaceId: string, index: number): ExtractedMetadata {
  const theme = META_THEMES[spaceId]
  if (!theme) return { ...EMPTY_METADATA, documentType: doc.documentType }

  // Roughly 1 in 13 documents yields nothing at all.
  if (index % 13 === 6) return { ...EMPTY_METADATA }

  const noMatter = index % 11 === 4
  const manyParties = MANY_PARTY_DOCS.includes(index)
  const noParties = index % 7 === 3 && !manyParties
  const noDates = index % 5 === 2

  const parties: Party[] = noParties ? [] : [
    { id: `${doc._id}-p0`, name: doc.namedEntity, role: theme.primaryRole },
    ...Array.from({ length: index % 3 }, (_, k) => {
      const cp = pick(theme.counterparties, index * 3 + k)
      return { id: `${doc._id}-p${k + 1}`, ...cp }
    }),
  ].filter((p, i, arr) => arr.findIndex(q => q.name === p.name) === i)
  if (manyParties) {
    // Top up to ten from the space's counterparties and its wider circle of contacts.
    const pool = [...theme.counterparties, ...(EXTRA_PARTIES[spaceId] ?? [])].filter(cp => !parties.some(p => p.name === cp.name))
    pool.slice(0, 10 - parties.length).forEach((cp, k) => parties.push({ id: `${doc._id}-px${k}`, ...cp }))
  }

  // Every document with dates keeps its document date (a reference date — shown in the
  // preview, not the table). On top of that it gets ONE key item: a period, a deadline or an
  // action taken. About 1 in 4 gets two or three, so a few table cells list several dates.
  // Deadlines land anywhere from ~5 weeks overdue to ~4 months out.
  const docOffset = -((index * 29) % 300) - 60
  const deadlineOffset = Math.max(((index * 17) % 150) - 35, docOffset + 30)
  const period = pick(theme.periods, index * 7 + 1)
  const periodItem: KeyDate = { id: `${doc._id}-per`, label: 'Period', date: period.start, endDate: period.end, isDeadline: false }
  const deadlineItem = (k: number): KeyDate => ({ id: `${doc._id}-dl${k}`, label: pick(theme.deadlineLabels, index * 2 + k), date: isoFromOffset(deadlineOffset + k * 21), isDeadline: true })
  const actionItem: KeyDate = { id: `${doc._id}-act`, label: pick(theme.actionLabels, index * 3 + 1), date: isoFromOffset(Math.min(docOffset + 20 + (index % 25), -1)), isDeadline: false, isAction: true }
  const primary = [periodItem, deadlineItem(0), actionItem][index % 3]
  const extras = index % 4 !== 0 ? [] : index % 8 === 0 ? [periodItem, deadlineItem(0), actionItem] : [deadlineItem(0), deadlineItem(1)]
  const dates: KeyDate[] = noDates ? [] : [
    { id: `${doc._id}-d0`, label: 'Document date', date: isoFromOffset(docOffset), isDeadline: false },
    ...[primary, ...extras].filter((d, i, arr) => arr.findIndex(x => x.id === d.id) === i),
  ]

  return {
    documentType: doc.documentType,
    matterReference: noMatter ? '' : pick(theme.matters, index * 5 + 2),
    summary: composeSummary([seedShortSummary(doc, index), seedSummaryDetail(doc, index)], { parties, dates }),
    parties,
    dates,
    edited: {},
  }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** A period in its most natural form: "2025", "2022–2024", "Q2 2026", "Jul 2026", "Jan – Jun 2026"; falls back to exact dates. */
function formatPeriod(start: string, end: string, fmt: (iso: string) => string = formatDate) {
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  const wholeMonths = sd === 1 && ed === new Date(Date.UTC(ey, em, 0)).getUTCDate()
  if (!wholeMonths) return `${fmt(start)} – ${fmt(end)}`
  if (sm === 1 && em === 12) return sy === ey ? `${sy}` : `${sy}–${ey}`
  if (sy === ey && sm === em) return `${MONTHS[sm - 1]} ${sy}`
  if (sy === ey && em - sm === 2 && sm % 3 === 1) return `Q${(sm + 2) / 3} ${sy}`
  return sy === ey ? `${MONTHS[sm - 1]} – ${MONTHS[em - 1]} ${sy}` : `${MONTHS[sm - 1]} ${sy} – ${MONTHS[em - 1]} ${ey}`
}

/** A date or period as text, using `fmt` for single dates. */
const formatKeyDate = (d: KeyDate, fmt: (iso: string) => string = formatDate) =>
  isPeriod(d) && d.endDate ? formatPeriod(d.date, d.endDate, fmt) : fmt(d.date)

type DeadlineState = { tone: 'overdue' | 'soon' | 'later' | 'past-date'; text: string }

function deadlineState(d: KeyDate): DeadlineState {
  const days = Math.round((new Date(d.date).getTime() - TODAY_MS) / DAY_MS)
  if (!d.isDeadline) return { tone: 'past-date', text: '' }
  if (days < 0) return { tone: 'overdue', text: `Overdue by ${-days} day${days === -1 ? '' : 's'}` }
  if (days === 0) return { tone: 'soon', text: 'Due today' }
  if (days <= 14) return { tone: 'soon', text: `Due in ${days} day${days === 1 ? '' : 's'}` }
  return { tone: 'later', text: `In ${days} days` }
}

/** Chronological, with deadlines ahead of plain dates on the same day. */
function sortDates(dates: KeyDate[]) {
  return [...dates].sort((a, b) => a.date.localeCompare(b.date) || Number(b.isDeadline) - Number(a.isDeadline))
}

// Label fallback for dates entered by hand in the preview, which has no "action" toggle.
const ACTION_LABEL = /sign|fil(ed|ing)|submit|approv|agreed|pa(id|y)|due|deadline|effective|objection|notice|expir|renew|terminat|go-live|milestone|enrol|publish|releas/i

/** Dates worth surfacing in the table: deadlines and actions taken — not reference dates like the document date. */
function isKeyDate(d: KeyDate) {
  return d.isDeadline || isPeriod(d) || !!d.isAction || ACTION_LABEL.test(d.label)
}

/** Key dates in the order that matters: deadlines (overdue, then soonest), then periods, then actions taken, newest first. */
function tableDates(dates: KeyDate[]) {
  const key = dates.filter(isKeyDate)
  const deadlines = key.filter(d => d.isDeadline && !isPeriod(d)).sort((a, b) => a.date.localeCompare(b.date))
  const periods = key.filter(isPeriod).sort((a, b) => a.date.localeCompare(b.date))
  const actions = key.filter(d => !d.isDeadline && !isPeriod(d)).sort((a, b) => b.date.localeCompare(a.date))
  return [...deadlines, ...periods, ...actions]
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type WorkspaceState = ReturnType<typeof useWorkspaceState>

type MetadataStore = {
  get: (doc: MetadataDocument) => ExtractedMetadata
  getOriginal: (doc: MetadataDocument) => ExtractedMetadata
  update: (docId: string, field: FieldKey, patch: Partial<ExtractedMetadata>) => void
}

function useMetadataStore(workspace: WorkspaceState): MetadataStore {
  // The extraction result for every seeded document, computed once — the preview's
  // document body is written from this, so it doesn't change when the user edits.
  const [original] = useState<Record<string, ExtractedMetadata>>(() => {
    const map: Record<string, ExtractedMetadata> = {}
    workspace.spaces.forEach(s => workspace.getSpaceDocs(s.id).forEach((d, i) => { map[d._id] = seedMetadata(d, s.id, i) }))
    return map
  })
  const [overrides, setOverrides] = useState<Record<string, ExtractedMetadata>>({})

  // Freshly uploaded files come back with a type but nothing else yet.
  const getOriginal = (doc: MetadataDocument) => original[doc._id] ?? { ...EMPTY_METADATA, documentType: '' }
  const get = (doc: MetadataDocument) => overrides[doc._id] ?? getOriginal(doc)

  const update = (docId: string, field: FieldKey, patch: Partial<ExtractedMetadata>) => {
    setOverrides(prev => {
      const base = prev[docId] ?? original[docId] ?? EMPTY_METADATA
      return { ...prev, [docId]: { ...base, ...patch, edited: { ...base.edited, [field]: true } } }
    })
  }

  return { get, getOriginal, update }
}

export default function MetadataVersion12() {
  const workspace = useWorkspaceState()
  const store = useMetadataStore(workspace)

  return (
    <Routes>
      <Route index element={<Navigate to="workspaces" replace />} />
      <Route path="workspaces">
        <Route index element={<SpacesListRoute workspace={workspace} />} />
        <Route path=":workspaceSlug" element={<SpaceDetailRoute workspace={workspace} store={store} />} />
        <Route path=":workspaceSlug/:docId" element={<DocumentPreviewRoute workspace={workspace} store={store} />} />
      </Route>
      <Route path="my-documents" element={<MyDocumentsV1 showTitleIcon={false} />} />
      <Route path="connectors" element={<ConnectionsPage />} />
      <Route path="*" element={<Navigate to="workspaces" replace />} />
    </Routes>
  )
}

function SpacesListRoute({ workspace }: { workspace: WorkspaceState }) {
  const navigate = useNavigate()
  return (
    <SpacesListView
      spaces={workspace.spaces}
      getSpaceDocs={workspace.getSpaceDocs}
      onOpenSpace={id => {
        const space = workspace.spaces.find(s => s.id === id)
        navigate(`${BASE}/workspaces/${slugify(space?.name ?? id)}`)
      }}
      onCreateSpace={workspace.createSpace}
      onUpdateSpace={workspace.updateSpace}
      onDeleteSpace={workspace.deleteSpace}
      showTitleIcon={false}
      noun="Space"
    />
  )
}

function SpaceDetailRoute({ workspace, store }: { workspace: WorkspaceState; store: MetadataStore }) {
  const navigate = useNavigate()
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>()
  const isLoading = useMountLoading()

  const space = workspace.spaces.find(s => slugify(s.name) === workspaceSlug) ?? null
  if (!space) return <Navigate to={`${BASE}/workspaces`} replace />

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton variant={skeletonVariants.TEXT} title paragraph={{ rows: 6 }} />
      </div>
    )
  }

  return (
    <SpaceDocumentsTable
      space={space}
      docs={workspace.getSpaceDocs(space.id)}
      store={store}
      onDocsChange={docs => workspace.setSpaceDocs(space.id, docs)}
      onBack={() => navigate(`${BASE}/workspaces`)}
      onOpenDoc={doc => navigate(`${BASE}/workspaces/${workspaceSlug}/${encodeURIComponent(doc._id)}`)}
      onUpdateSpace={values => {
        workspace.updateSpace(space.id, values)
        // Renaming changes the slug, so follow the space to its new URL.
        if (values.name !== space.name) navigate(`${BASE}/workspaces/${slugify(values.name)}`, { replace: true })
      }}
      onDeleteSpace={() => { workspace.deleteSpace(space.id); navigate(`${BASE}/workspaces`) }}
    />
  )
}

function DocumentPreviewRoute({ workspace, store }: { workspace: WorkspaceState; store: MetadataStore }) {
  const navigate = useNavigate()
  const { workspaceSlug, docId } = useParams<{ workspaceSlug: string; docId: string }>()
  const space = workspace.spaces.find(s => slugify(s.name) === workspaceSlug) ?? null
  const docs = space ? workspace.getSpaceDocs(space.id) : []
  const doc = docs.find(d => d._id === docId) ?? null

  if (!space) return <Navigate to={`${BASE}/workspaces`} replace />
  if (!doc) return <Navigate to={`${BASE}/workspaces/${workspaceSlug}`} replace />

  const index = docs.indexOf(doc)
  const source = computeDocSourceMap(docs, space).get(doc._id) ?? 'local'

  return (
    <DocumentPreview
      key={doc._id}
      space={space}
      doc={doc}
      store={store}
      source={source}
      docIndex={index}
      onBack={() => navigate(`${BASE}/workspaces/${workspaceSlug}`)}
      onDelete={() => {
        workspace.setSpaceDocs(space.id, docs.filter(d => d._id !== doc._id))
        navigate(`${BASE}/workspaces/${workspaceSlug}`)
      }}
    />
  )
}

// ─── Shared field editors (used in the table popovers and the preview panel) ──

function EditorActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing(2) }}>
      <ButtonTertiary onClick={onCancel}>Cancel</ButtonTertiary>
      <ButtonPrimary onClick={onSave}>Save</ButtonPrimary>
    </div>
  )
}

const TYPE_REQUIRED = 'Type is required'

function DocumentTypeEditor({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(value)
  // Type is mandatory: an empty save shows the error instead of saving.
  const [tried, setTried] = useState(false)
  const save = () => { if (draft.trim()) onSave(draft.trim()); else setTried(true) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      <Input
        label={FIELD_LABELS.documentType}
        isRequired
        error={tried && !draft.trim() ? TYPE_REQUIRED : undefined}
        value={draft}
        placeholder="e.g. Engagement Letter"
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); save() }
          if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
        }}
      />
      <EditorActions onSave={save} onCancel={onCancel} />
    </div>
  )
}

const SUMMARY_MAX = 500
// A matter reference is a name, not a description — the limit keeps it to a few words.
const MATTER_MAX = 40
const MATTER_PLACEHOLDER = 'e.g. VAT return Q2 2026'

/** Edits the matter reference from the table popover. */
function MatterEditor({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(value)
  const save = () => onSave(draft.trim())
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      <Input
        label={FIELD_LABELS.matterReference}
        value={draft}
        placeholder={MATTER_PLACEHOLDER}
        maxLength={MATTER_MAX}
        hasCounter
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); save() }
          if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
        }}
      />
      <EditorActions onSave={save} onCancel={onCancel} />
    </div>
  )
}

const blankParty = (): Party => ({ id: newId('party'), name: '', role: '' })
const blankDate = (): KeyDate => ({ id: newId('date'), label: '', date: '', isDeadline: false })
const cleanParties = (rows: Party[]) => rows.map(r => ({ ...r, name: r.name.trim(), role: r.role.trim() })).filter(r => r.name)
/** There's no deadline toggle in the editors, so a date counts as a deadline when its label says so. */
const DEADLINE_LABEL = /deadline|\bdue\b|go-live|milestone|expir/i
const blankPeriod = (): KeyDate => ({ id: newId('period'), label: 'Period', date: '', endDate: '', isDeadline: false })
/** Drops incomplete rows, fills empty labels, marks deadlines by their label, and puts a period's ends the right way round. */
const cleanDates = (rows: KeyDate[]) => sortDates(rows
  .filter(r => r.date && (!isPeriod(r) || r.endDate))
  .map(r => {
    const label = r.label.trim() || (isPeriod(r) ? 'Period' : 'Date')
    if (!isPeriod(r)) return { ...r, label, isDeadline: DEADLINE_LABEL.test(label) }
    const [date, endDate] = [r.date, r.endDate!].sort()
    return { ...r, label, date, endDate, isDeadline: false }
  }))
const toIso = (d: Date | null) => d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : ''

/** Controlled list of party rows — wrapped with its own Save/Cancel in the table popover, bare in the preview's edit panel. */
/** `maxRowsHeight` caps the rows and scrolls them — for the table popover, where ten parties would push Save off-screen. */
function PartiesFields({ rows, onChange, maxRowsHeight }: { rows: Party[]; onChange: (rows: Party[]) => void; maxRowsHeight?: number }) {
  const setRow = (id: string, patch: Partial<Party>) => onChange(rows.map(r => r.id === id ? { ...r, ...patch } : r))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <Typography size="base" weight="semibold" color="neutral-darken5">{FIELD_LABELS.parties}</Typography>
      {rows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 32px', gap: spacing(2), alignItems: 'center', maxHeight: maxRowsHeight, overflowY: maxRowsHeight ? 'auto' : undefined, overscrollBehavior: 'contain', paddingRight: maxRowsHeight ? 4 : undefined }}>
          {rows.map(r => (
            <PartyRow key={r.id} party={r} onChange={patch => setRow(r.id, patch)} onRemove={() => onChange(rows.filter(x => x.id !== r.id))} />
          ))}
        </div>
      )}
      <div style={{ marginLeft: -8 }}>
        <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => onChange([...rows, blankParty()])}>Add party</ButtonGhost>
      </div>
    </div>
  )
}

function PartiesEditor({ value, onSave, onCancel }: { value: Party[]; onSave: (v: Party[]) => void; onCancel: () => void }) {
  const [rows, setRows] = useState<Party[]>(value.length ? value : [blankParty()])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      {/* Six rows (40px + 8px gap each) before the list scrolls. */}
      <PartiesFields rows={rows} onChange={setRows} maxRowsHeight={6 * 48 - 8} />
      <EditorActions onSave={() => onSave(cleanParties(rows))} onCancel={onCancel} />
    </div>
  )
}

function PartyRow({ party, onChange, onRemove }: { party: Party; onChange: (patch: Partial<Party>) => void; onRemove: () => void }) {
  return (
    <>
      <Input value={party.name} placeholder="Person or organisation" onChange={e => onChange({ name: e.target.value })} />
      <Input value={party.role} placeholder="e.g. Client" onChange={e => onChange({ role: e.target.value })} />
      <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={onRemove} />
    </>
  )
}

/** Controlled list of date rows; see PartiesFields. */
function DatesFields({ rows, onChange }: { rows: KeyDate[]; onChange: (rows: KeyDate[]) => void }) {
  const setRow = (id: string, patch: Partial<KeyDate>) => onChange(rows.map(r => r.id === id ? { ...r, ...patch } : r))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <Typography size="base" weight="semibold" color="neutral-darken5">{FIELD_LABELS.dates}</Typography>
      {rows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 32px', gap: spacing(2), alignItems: 'start' }}>
          <Typography size="base-sm" color="neutral-darken2">Type</Typography>
          <Typography size="base-sm" color="neutral-darken2">Date</Typography>
          <span />
          {rows.map(r => (
            <DateRow key={r.id} row={r} onChange={patch => setRow(r.id, patch)} onRemove={() => onChange(rows.filter(x => x.id !== r.id))} />
          ))}
        </div>
      )}
      <div style={{ marginLeft: -8, display: 'flex' }}>
        <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => onChange([...rows, blankDate()])}>Add date</ButtonGhost>
        <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => onChange([...rows, blankPeriod()])}>Add period</ButtonGhost>
      </div>
    </div>
  )
}

function DatesEditor({ value, onSave, onCancel }: { value: KeyDate[]; onSave: (v: KeyDate[]) => void; onCancel: () => void }) {
  const [rows, setRows] = useState<KeyDate[]>(value.length ? sortDates(value) : [blankDate()])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      <DatesFields rows={rows} onChange={setRows} />
      <EditorActions onSave={() => onSave(cleanDates(rows))} onCancel={onCancel} />
    </div>
  )
}

function DateRow({ row, onChange, onRemove }: { row: KeyDate; onChange: (patch: Partial<KeyDate>) => void; onRemove: () => void }) {
  return (
    <>
      <Input value={row.label} placeholder={isPeriod(row) ? 'e.g. Tax period' : 'e.g. Filing deadline'} onChange={e => onChange({ label: e.target.value })} />
      {isPeriod(row) ? (
        // No range picker in goat-ui, so a period stacks a From and a To picker.
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <DatePicker value={row.date ? new Date(row.date) : undefined} placeholder="From" onChange={d => onChange({ date: toIso(d) })} />
          <DatePicker value={row.endDate ? new Date(row.endDate) : undefined} placeholder="To" minDate={row.date ? new Date(row.date) : undefined} onChange={d => onChange({ endDate: toIso(d) })} />
        </div>
      ) : (
        <DatePicker value={row.date ? new Date(row.date) : undefined} placeholder="DD/MM/YYYY" onChange={d => onChange({ date: toIso(d) })} />
      )}
      <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={onRemove} />
    </>
  )
}

// ─── Read-only field displays ─────────────────────────────────────────────────

const cellText: React.CSSProperties = { fontSize: 14, lineHeight: '20px', color: colorPalette.neutral.darken5 }
/** Cell text that wraps onto as many lines as it needs. */
const wrap: React.CSSProperties = { ...cellText, wordBreak: 'break-word' }

/** Empty metadata value in the table. */
const Dash = () => <span style={cellText}>-</span>

const FILE_ICON_SRC: Partial<Record<string, string>> = {
  DOCX: '/metadata-v9/file-word.png',
  PDF: '/metadata-v9/file-pdf.png',
  XLSX: '/metadata-v9/file-excel.png',
  PPTX: '/metadata-v9/file-pptx.png',
}
/** Any other format gets a plain document icon. */
const GENERIC_FILE_ICON = '/metadata-v9/file-generic.png'

function FileTypeIcon({ format, size = 24 }: { format: string; size?: 20 | 24 }) {
  const src = FILE_ICON_SRC[format] ?? GENERIC_FILE_ICON
  return <img src={src} alt={format} width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} />
}

const fileName = (doc: MetadataDocument) => `${stripYear(doc.name)}.${doc.fileFormat.toLowerCase()}`

/**
 * Wraps a one- or two-line clamped value and shows its full text in a tooltip
 * on hover — only when the text is actually cut off, unless `always` is set
 * (for values like parties, whose tooltip adds roles the cell doesn't show).
 */
function TruncationTooltip({ title, always = false, disabled = false, children }: {
  title: string
  always?: boolean
  disabled?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  const onEnter = () => {
    const el = ref.current?.firstElementChild as HTMLElement | null
    // The cell itself or any line inside it (e.g. one party or date) being cut off counts.
    const nodes = el ? [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))] : []
    const truncated = nodes.some(n => n.scrollWidth > n.clientWidth + 1 || n.scrollHeight > n.clientHeight + 1)
    setShow(always || truncated)
  }
  return (
    <Tooltip title={title} size={title.length > 60 ? tooltipSizes.LARGE : tooltipSizes.SMALL} placement={tooltipPlacements.TOP} visible={show && !disabled && !!title}>
      <div ref={ref} onMouseEnter={onEnter} onMouseLeave={() => setShow(false)} style={{ minWidth: 0 }}>{children}</div>
    </Tooltip>
  )
}

// Past this many, the Parties cell lists the first few and sums up the rest as "+N" (all of them are in its tooltip).
const VISIBLE_PARTIES = 5

/** Every item, one per line; a long item wraps onto further lines rather than being cut off. */
function FullList({ items }: { items: { key: string; content: ReactNode }[] }) {
  return (
    <div style={{ minWidth: 0 }}>
      {items.map(item => <div key={item.key} style={wrap}>{item.content}</div>)}
    </div>
  )
}

// ─── Table cell with popover editor ───────────────────────────────────────────

/**
 * An editable metadata cell: hovering outlines it, clicking opens the field's
 * editor in a popover anchored below it; while open the outline turns primary.
 */
function EditableCell({ open, onOpenChange, editor, children, width }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editor: ReactNode
  children: ReactNode
  width: number
}) {
  return (
    <PopOver
      trigger={popOverTriggers.CLICK}
      placement={popOverPlacements.BOTTOM_LEFT}
      open={open}
      onOpenChange={onOpenChange}
      maxWidth={600}
      content={open ? <div onClick={e => e.stopPropagation()} style={{ width }}>{editor}</div> : null}
    >
      <div className={`v12-editable${open ? ' is-open' : ''}`}>{children}</div>
    </PopOver>
  )
}

const TABLE_CSS = `
  .v12-editable {
    cursor: pointer; min-height: 24px; border-radius: 8px; border: 1px solid transparent;
    margin: -3px -7px; padding: 2px 6px; transition: border-color 0.12s, background-color 0.12s;
  }
  .v12-editable:hover { border-color: ${colorPalette.neutral.lighten2}; background-color: ${colorPalette.white}; }
  .v12-editable.is-open { border-color: ${colorPalette.blue.base}; background-color: ${colorPalette.neutral.lighten5}; }
  .v12-doc-link { color: ${colorPalette.neutral.darken5}; cursor: pointer; }
  .v12-doc-link:hover { color: ${colorPalette.blue.base}; text-decoration: underline; }
  .goat-tooltip-inner p { white-space: pre-line; }
  /* goat-ui's Tooltip has no width prop and caps at ~200px, which breaks the all-parties
     tooltip's "Name (Role)" lines mid-name; wider is fine for this page's other tooltips too. */
  .goat-tooltip { max-width: 400px !important; }
  .v12-table thead th { text-transform: none !important; white-space: nowrap; }
`

// ─── Documents table ──────────────────────────────────────────────────────────

function SpaceDocumentsTable({ space, docs, store, onDocsChange, onBack, onOpenDoc, onUpdateSpace, onDeleteSpace }: {
  space: Space
  docs: MetadataDocument[]
  store: MetadataStore
  onDocsChange: (docs: MetadataDocument[]) => void
  onBack: () => void
  onOpenDoc: (doc: MetadataDocument) => void
  onUpdateSpace: (values: SpaceFormValues) => void
  onDeleteSpace: () => void
}) {
  const { notification } = useNotifications()
  const sidebarWidth = useSidebarWidth()

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [uploadOpen, setUploadOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Set<string> | null>(null)
  const [editing, setEditing] = useState<{ id: string; field: FieldKey } | null>(null)
  const [editSpaceOpen, setEditSpaceOpen] = useState(false)
  const [deleteSpaceOpen, setDeleteSpaceOpen] = useState(false)

  const sourceMap = useMemo(() => computeDocSourceMap(docs, space), [docs, space])
  const presentConnectors = useMemo(() => {
    const present = new Set(sourceMap.values())
    return space.connectors.filter(c => present.has(c.type))
  }, [space.connectors, sourceMap])

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return docs
    return docs.filter(d => {
      const m = store.get(d)
      return d.name.toLowerCase().includes(q) || m.documentType.toLowerCase().includes(q) ||
        m.matterReference.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q) || m.parties.some(p => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)) ||
        m.dates.some(x => x.label.toLowerCase().includes(q))
    })
  }, [docs, search, store])

  const pagedDocs = filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const allSelected = filteredDocs.length > 0 && filteredDocs.every(d => selectedKeys.has(d._id))
  const someSelected = filteredDocs.some(d => selectedKeys.has(d._id))
  const selectedDocs = docs.filter(d => selectedKeys.has(d._id))
  const allSelectedAreManualUpload = selectedDocs.length > 0 && selectedDocs.every(d => (sourceMap.get(d._id) ?? 'local') === 'local')

  const isEditing = (id: string, field: FieldKey) => editing?.id === id && editing.field === field
  const openChange = (id: string, field: FieldKey) => (o: boolean) => setEditing(o ? { id, field } : null)
  const close = () => setEditing(null)
  const saveField = (id: string, field: FieldKey, patch: Partial<ExtractedMetadata>) => {
    // Saving an untouched editor shouldn't flag the field as "Edited by you".
    const current = store.get(docs.find(d => d._id === id)!)
    const norm = (v: unknown) => JSON.stringify(field === 'dates' ? sortDates(v as KeyDate[]) : v)
    if (norm(patch[field]) !== norm(current[field])) store.update(id, field, patch)
    close()
  }

  const rowStyle = (record: MetadataDocument) => ({ style: { verticalAlign: 'top' as const, height: 64, backgroundColor: selectedKeys.has(record._id) ? '#EEF4FF' : undefined } })

  const columns = [
    {
      title: (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={e => setSelectedKeys(new Set(e.target.checked ? filteredDocs.map(d => d._id) : []))}
        />
      ),
      key: 'checkbox',
      width: 32,
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => (
        <Checkbox
          checked={selectedKeys.has(record._id)}
          onChange={e => setSelectedKeys(prev => {
            const next = new Set(prev)
            if (e.target.checked) next.add(record._id); else next.delete(record._id)
            return next
          })}
        />
      ),
    },
    {
      title: '',
      key: 'fileType',
      width: 32,
      sorter: (a: MetadataDocument, b: MetadataDocument) => a.fileFormat.localeCompare(b.fileFormat),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => <div style={{ display: 'flex', justifyContent: 'center' }}><FileTypeIcon format={record.fileFormat} /></div>,
    },
    {
      title: 'Name',
      key: 'name',
      width: '16%',
      sorter: (a: MetadataDocument, b: MetadataDocument) => stripYear(a.name).localeCompare(stripYear(b.name)),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => (
        <>
          <TruncationTooltip title={fileName(record)}>
            <div style={{ ...wrap, fontWeight: 500 }}><span className="v12-doc-link" onClick={() => onOpenDoc(record)}>{fileName(record)}</span></div>
          </TruncationTooltip>
          <div style={{ ...cellText, color: colorPalette.neutral.darken2 }}>{record.fileSize}</div>
        </>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 64,
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const synced = (sourceMap.get(record._id) ?? 'local') !== 'local'
        const hours = (docs.indexOf(record) % 5) + 1
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title={synced ? `Up to date • synced ${hours} hour${hours === 1 ? '' : 's'} ago` : 'Up to date'} placement={tooltipPlacements.TOP}>
              <div style={{ display: 'inline-flex' }}><Icon type={iconType.CheckCircleFilled} size={20} color="success-base" /></div>
            </Tooltip>
          </div>
        )
      },
    },
    {
      title: 'Source',
      key: 'source',
      width: 64,
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const src = sourceMap.get(record._id) ?? 'local'
        return <div style={{ display: 'flex', justifyContent: 'center' }}>{sourceIcon(src, 18, src !== 'local' ? spaceConnectorLabel(space, src) : undefined)}</div>
      },
    },
    {
      title: FIELD_LABELS.documentType,
      key: 'documentType',
      width: 120,
      sorter: (a: MetadataDocument, b: MetadataDocument) => store.get(a).documentType.localeCompare(store.get(b).documentType),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const m = store.get(record)
        const open = isEditing(record._id, 'documentType')
        return (
          <EditableCell
            open={open}
            onOpenChange={openChange(record._id, 'documentType')}
            width={232}
            editor={<DocumentTypeEditor value={m.documentType} onCancel={close} onSave={v => saveField(record._id, 'documentType', { documentType: v })} />}
          >
            {m.documentType
              ? <TruncationTooltip title={m.documentType} disabled={open}><div style={wrap}>{m.documentType}</div></TruncationTooltip>
              : <Dash />}
          </EditableCell>
        )
      },
    },
    {
      title: FIELD_LABELS.matterReference,
      key: 'matterReference',
      // A few words at most, so a modest share — it no longer soaks up the spare width the summary needed.
      width: '13%',
      sorter: (a: MetadataDocument, b: MetadataDocument) => store.get(a).matterReference.localeCompare(store.get(b).matterReference),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const text = store.get(record).matterReference
        const open = isEditing(record._id, 'matterReference')
        return (
          <EditableCell
            open={open}
            onOpenChange={openChange(record._id, 'matterReference')}
            width={280}
            editor={<MatterEditor value={text} onCancel={close} onSave={v => saveField(record._id, 'matterReference', { matterReference: v })} />}
          >
            {text
              ? <TruncationTooltip title={text} disabled={open}><div style={wrap}>{text}</div></TruncationTooltip>
              : <Dash />}
          </EditableCell>
        )
      },
    },
    {
      title: FIELD_LABELS.parties,
      key: 'parties',
      // No width on Parties or Dates: they split whatever is left equally, so they stay the same
      // width and get the most room — long party names and multi-date cells need it most.
      sorter: (a: MetadataDocument, b: MetadataDocument) => (store.get(a).parties[0]?.name ?? '').localeCompare(store.get(b).parties[0]?.name ?? ''),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const { parties } = store.get(record)
        const open = isEditing(record._id, 'parties')
        const tooltip = parties.map(p => p.role ? `${p.name} (${p.role})` : p.name).join('\n')
        return (
          <EditableCell
            open={open}
            onOpenChange={openChange(record._id, 'parties')}
            width={446}
            editor={<PartiesEditor value={parties} onCancel={close} onSave={v => saveField(record._id, 'parties', { parties: v })} />}
          >
            {parties.length
              ? (
                <TruncationTooltip title={tooltip} always disabled={open}>
                  <FullList items={[
                    ...parties.slice(0, VISIBLE_PARTIES).map(p => ({ key: p.id, content: p.name })),
                    ...(parties.length > VISIBLE_PARTIES
                      ? [{ key: 'more', content: <span style={{ color: colorPalette.neutral.darken2 }}>+{parties.length - VISIBLE_PARTIES}</span> }]
                      : []),
                  ]} />
                </TruncationTooltip>
              )
              : <Dash />}
          </EditableCell>
        )
      },
    },
    {
      title: FIELD_LABELS.dates,
      key: 'dates',
      sorter: (a: MetadataDocument, b: MetadataDocument) => (tableDates(store.get(a).dates)[0]?.date ?? '9999').localeCompare(tableDates(store.get(b).dates)[0]?.date ?? '9999'),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const all = store.get(record).dates
        const dates = tableDates(all)
        const open = isEditing(record._id, 'dates')
        const tooltip = dates.map(d => {
          const state = deadlineState(d)
          return `${d.label}: ${formatKeyDate(d)}${d.isDeadline && state.tone !== 'later' ? ` (${state.text})` : ''}`
        }).join('\n')
        return (
          <EditableCell
            open={open}
            onOpenChange={openChange(record._id, 'dates')}
            width={446}
            editor={
              // Edits only the key dates; reference dates (document date etc.) are kept as they are.
              <DatesEditor
                value={dates}
                onCancel={close}
                onSave={v => saveField(record._id, 'dates', {
                  dates: sortDates([...all.filter(d => !isKeyDate(d)), ...v.map(d => d.isDeadline || isPeriod(d) ? d : { ...d, isAction: true })]),
                })}
              />
            }
          >
            {dates.length
              ? (
                <TruncationTooltip title={tooltip} disabled={open}>
                  <FullList items={dates.map(d => ({
                    key: d.id,
                    // Wraps after the label if needed, never inside the date.
                    content: <>{d.label}: <span style={{ whiteSpace: 'nowrap' }}>{formatKeyDate(d)}</span></>,
                  }))} />
                </TruncationTooltip>
              )
              : <Dash />}
          </EditableCell>
        )
      },
    },
    {
      title: 'Updated',
      key: 'uploadedDate',
      dataIndex: 'uploadedDate',
      width: 108,
      // Any ellipsis column switches antd to a fixed table layout, so the widths are honoured. It lives on
      // this always-one-line column so it doesn't stop the other cells from wrapping.
      ellipsis: { showTitle: false },
      sorter: (a: MetadataDocument, b: MetadataDocument) => a.uploadedDate.localeCompare(b.uploadedDate),
      onCell: rowStyle,
      render: (val: string) => <div style={{ ...cellText, whiteSpace: 'nowrap' }}>{formatDate(val)}</div>,
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -6 }}>
          <Dropdown
            items={[
              { key: 'open', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.ArticleOutlined} size={16} />Open preview</span>, onClick: () => onOpenDoc(record) },
              { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => {} },
              { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => setPendingDelete(new Set([record._id])) },
            ]}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
          </Dropdown>
        </div>
      ),
    },
  ]

  return (
    <div style={{ padding: `${spacing(6)}px ${spacing(10)}px`, display: 'flex', flexDirection: 'column', gap: spacing(6), backgroundColor: colorPalette.white, height: '100%', overflow: 'hidden' }}>
      <style>{TABLE_CSS}</style>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ChevronLeftOutlined} onClick={onBack} />
          <SpaceAvatar space={space} size={32} />
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1), minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), minWidth: 0 }}>
              <Typography size="heading-lg" weight="bold">{space.name}</Typography>
              <VisibilityIcon space={space} />
            </div>
            <Dropdown
              items={[
                { key: 'edit', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.EditOutlined} size={16} />Edit Space</span>, onClick: () => setEditSpaceOpen(true) },
                { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete Space</span>, onClick: () => setDeleteSpaceOpen(true) },
              ]}
              trigger={dropdownTriggers.CLICK}
              placement={dropdownPlacement.BOTTOM_LEFT}
            >
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
            </Dropdown>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 320 }}>
            <SearchBar placeholder="Search documents" value={search} onChange={v => { setSearch(v); setCurrentPage(1) }} width={searchbarWidth.EXPANDED} />
          </div>
        </div>
        <Typography size="base" color="neutral-darken2">{space.description}</Typography>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography size="base" color="neutral-darken2">{filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}</Typography>
        <ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={() => setUploadOpen(true)}>Upload or sync</ButtonPrimary>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="v12-table" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <Table dataSource={pagedDocs} rowKey="_id" columns={columns as never} pagination={false} rowHoverable />
        </div>
        {filteredDocs.length > PAGE_SIZE && (
          <div style={{ flexShrink: 0 }}>
            <Pagination current={currentPage} total={filteredDocs.length} pageSize={PAGE_SIZE} onChange={setCurrentPage} />
          </div>
        )}
      </div>

      {selectedKeys.size > 0 && (
        <div style={{ position: 'fixed', bottom: spacing(2), left: sidebarWidth + spacing(2), right: spacing(2), height: 56, backgroundColor: colorPalette.neutral.lighten1, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${spacing(6)}px`, zIndex: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(4) }}>
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setSelectedKeys(new Set())} />
            <Typography color="neutral-darken5">{selectedKeys.size} selected</Typography>
            <div style={{ display: 'flex', alignItems: 'center', height: 32, padding: '4px 12px', border: '1px solid #BFCAE8', borderRadius: 8, backgroundColor: colorPalette.white, color: '#374058', fontSize: 14, fontWeight: 600, cursor: 'default' }}>
              <span style={{ display: 'flex', marginRight: 8 }}><CopilotIcon /></span>
              Ask CoPilot
              <span style={{ display: 'flex', marginLeft: 8 }}><Icon type={iconType.ExternalLinkOutlined} size={16} color="inherit" /></span>
            </div>
            {allSelectedAreManualUpload && (
              <ButtonTertiary leftIcon={iconType.DownloadOutlined} onClick={() => {}}>Download</ButtonTertiary>
            )}
          </div>
          <ButtonDanger leftIcon={iconType.TrashOutlined} onClick={() => setPendingDelete(selectedKeys)}>Delete</ButtonDanger>
        </div>
      )}

      <Modal
        visible={pendingDelete !== null}
        variant={modalVariants.DANGER}
        title={pendingDelete?.size === 1 ? 'Delete Document' : 'Delete Documents'}
        onClose={() => setPendingDelete(null)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: () => setPendingDelete(null) } },
          { variant: buttonVariants.DANGER, props: { children: 'Delete', onClick: () => {
            if (!pendingDelete) return
            onDocsChange(docs.filter(d => !pendingDelete.has(d._id)))
            setSelectedKeys(prev => { const next = new Set(prev); pendingDelete.forEach(id => next.delete(id)); return next })
            setPendingDelete(null)
          } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">
          Delete <strong>{pendingDelete?.size ?? 0} document{pendingDelete?.size !== 1 ? 's' : ''}</strong>? This cannot be undone.
        </Typography>
      </Modal>

      <SpaceFormModal
        open={editSpaceOpen}
        mode="edit"
        noun="Space"
        initialValues={space}
        onClose={() => setEditSpaceOpen(false)}
        onSubmit={values => { onUpdateSpace(values); setEditSpaceOpen(false) }}
      />

      <Modal
        visible={deleteSpaceOpen}
        variant={modalVariants.DANGER}
        title="Delete Space"
        onClose={() => setDeleteSpaceOpen(false)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: () => setDeleteSpaceOpen(false) } },
          { variant: buttonVariants.DANGER, props: { children: 'Delete', onClick: () => { setDeleteSpaceOpen(false); onDeleteSpace() } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">
          Delete <strong>{space.name}</strong> and its {docs.length} document{docs.length !== 1 ? 's' : ''}? This cannot be undone.
        </Typography>
      </Modal>

      <BasicUploadModal
        open={uploadOpen}
        connectors={presentConnectors}
        onClose={() => setUploadOpen(false)}
        onUpload={newDocs => {
          onDocsChange([...newDocs, ...docs])
          notification.success({ title: `${newDocs.length} document${newDocs.length !== 1 ? 's' : ''} uploaded`, placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
        }}
      />
    </div>
  )
}

// ─── Document preview ─────────────────────────────────────────────────────────
// Layout from the "Metadata" Figma (node 2352:49615): dark top bar, the document in a
// card on the left, and a 512px "Document Details" card on the right, regrouped the same
// way as Version 10 (see ViewPanel). The edit button in the card header turns it into a
// form with Cancel / Save.

const TOP_BAR_BG = '#2f384a'
const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)
/**
 * Seeds a document's summary: its own opening sentences (see summaries.ts), then what the
 * extracted parties and dates say, as prose.
 * Only used to create the sample data — after that the summary is plain text the user can edit.
 */
function composeSummary(openings: string[], m: Pick<ExtractedMetadata, 'parties' | 'dates'>): string {
  const dates = tableDates(m.dates)
  const sentences = openings.filter(Boolean).map(t => `${t.replace(/\.$/, '')}.`)

  const parties = m.parties.map(p => p.role ? `${p.name} (${lowerFirst(p.role)})` : p.name)
  const partyText = parties.length > 1 ? `${parties.slice(0, -1).join(', ')} and ${parties[parties.length - 1]}` : parties[0]
  if (partyText) sentences.push(`It involves ${partyText}.`)

  const period = dates.find(isPeriod)
  if (period) sentences.push(`It covers the period ${formatKeyDate(period)}.`)
  dates.filter(d => d.isDeadline).slice(0, 2).forEach(d => sentences.push(`The ${lowerFirst(d.label)} is ${formatKeyDate(d)}.`))
  dates.filter(d => !d.isDeadline && !isPeriod(d)).forEach(d => {
    sentences.push(d.date ? `${d.label} on ${formatKeyDate(d)}.` : `Not yet ${lowerFirst(d.label)}.`)
  })
  // Whole sentences only, within the preview's limit.
  return sentences.reduce((text, next) => !text ? next : `${text} ${next}`.length <= SUMMARY_MAX ? `${text} ${next}` : text, '')
}

function DocumentPreview({ space, doc, store, source, docIndex, onBack, onDelete }: {
  space: Space
  doc: MetadataDocument
  store: MetadataStore
  source: DocSource
  docIndex: number
  onBack: () => void
  onDelete: () => void
}) {
  const isLoading = useMountLoading(1500)
  // Non-null while the details card is in edit mode.
  const [draft, setDraft] = useState<ExtractedMetadata | null>(null)
  // Set once Save is pressed, so required-field errors only appear after a save attempt.
  const [triedSave, setTriedSave] = useState(false)
  const meta = store.get(doc)
  const filename = `${stripYear(doc.name)}.${doc.fileFormat.toLowerCase()}`

  const startEdit = () => { setTriedSave(false); setDraft({ ...meta, parties: meta.parties.map(p => ({ ...p })), dates: sortDates(meta.dates) }) }
  const cancelEdit = () => setDraft(null)
  const saveEdit = () => {
    if (!draft) return
    if (!draft.documentType.trim()) { setTriedSave(true); return }
    const next: Pick<ExtractedMetadata, FieldKey> = {
      documentType: draft.documentType.trim(),
      matterReference: draft.matterReference.trim(),
      summary: draft.summary.trim(),
      parties: cleanParties(draft.parties),
      dates: cleanDates(draft.dates),
    }
    // Only fields that actually changed get marked as edited.
    ;(Object.keys(next) as FieldKey[]).forEach(field => {
      if (JSON.stringify(next[field]) !== JSON.stringify(meta[field])) store.update(doc._id, field, { [field]: next[field] })
    })
    setDraft(null)
  }

  const card: React.CSSProperties = { backgroundColor: colorPalette.white, borderRadius: 16, padding: spacing(4) }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: colorPalette.neutral.lighten5 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: TOP_BAR_BG, boxShadow: '0 4px 4px rgba(130, 138, 155, 0.2)', padding: `0 ${spacing(4)}px`, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <ButtonGhost mode="contrast" leftIcon={iconType.ChevronLeftOutlined} onClick={onBack}>Back</ButtonGhost>
        <Typography weight="bold" color="white">{filename}</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <ButtonTertiary mode="contrast">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />Ask CoPilot<Icon type={iconType.ExternalLinkOutlined} size={16} /></span>
          </ButtonTertiary>
          <Dropdown
            items={[
              { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => {} },
              { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: onDelete },
            ]}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonTertiary mode="contrast" shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
          </Dropdown>
        </div>
      </div>

      <div style={{ flex: 1, padding: spacing(6), display: 'flex', gap: spacing(4), alignItems: 'flex-start' }}>
        <div style={{ ...card, flex: 1, minWidth: 0, minHeight: 640 }}>
          {isLoading
            ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '60%' }} paragraph={{ rows: 16 }} />
            : <GeneratedDocumentBody doc={doc} meta={store.getOriginal(doc)} />}
        </div>

        <div style={{ ...card, width: 512, flexShrink: 0 }}>
          {isLoading ? (
            <Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 10 }} />
          ) : draft ? (
            <EditPanel doc={doc} draft={draft} showErrors={triedSave} onChange={setDraft} onSave={saveEdit} onCancel={cancelEdit} />
          ) : (
            <ViewPanel doc={doc} space={space} meta={meta} source={source} docIndex={docIndex} onEdit={startEdit} />
          )}
        </div>
      </div>
    </div>
  )
}

/** A titled block in the details card; sections are separated by a divider. */
function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      <Typography size="base-sm" weight="semibold" color="neutral-darken2" uppercase>{title}</Typography>
      {children}
    </section>
  )
}

/** Label/value rows that share one 124px label column across the whole card, so every value lines up. */
function DetailRows({ rows }: { rows: { key: string; label: string; value: ReactNode }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '124px minmax(0, 1fr)', columnGap: spacing(2), rowGap: spacing(2) }}>
      {rows.map(r => (
        <Fragment key={r.key}>
          <span style={{ ...cellText, color: colorPalette.neutral.darken2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
          <div style={{ ...cellText, wordBreak: 'break-word' }}>{r.value}</div>
        </Fragment>
      ))}
    </div>
  )
}

const FILE_LABEL = { size: 'base' as const, color: 'neutral-darken2' as const, width: '124px' }
const FILE_VALUE = { size: 'base' as const, color: 'neutral-darken5' as const }

/** A file detail as a horizontal PropertyItem, its label in the same 124px column as the rows above. */
function FileDetail({ label, children }: { label: string; children: ReactNode }) {
  return <PropertyItem label={label} value={children} variant={propertyItemVariants.HORIZONTAL} labelProps={FILE_LABEL} valueProps={FILE_VALUE} />
}

const Divider = () => <div style={{ borderTop: `1px solid ${colorPalette.neutral.lighten3}` }} />

/**
 * The details card (same design as Version 10) — same information as the Figma card, regrouped:
 * the summary, then Matter reference, Parties, Dates and File, each under a small heading. Parties and dates use the
 * table's role/type-beside-value layout; File lists horizontal property items (Name, Type, Format
 * with the file-type icon, Size, Uploaded, Updated, Status, Source, Space).
 */
function ViewPanel({ doc, space, meta, source, docIndex, onEdit }: {
  doc: MetadataDocument
  space: Space
  meta: ExtractedMetadata
  source: DocSource
  docIndex: number
  onEdit: () => void
}) {
  const dates = tableDates(meta.dates)
  // Same sync time as the table's Status tooltip; the upload itself happened a little before the last update.
  const hours = (docIndex % 5) + 1
  const uploaded = new Date(new Date(doc.uploadedDate).getTime() - (((docIndex * 7) % 20) + 2) * DAY_MS).toISOString().slice(0, 10)
  const dash = <span style={{ color: colorPalette.neutral.darken2 }}>-</span>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">Document Details</Typography>
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.EditOutlined} onClick={onEdit} />
      </div>

      {meta.summary
        ? <div style={{ ...cellText, lineHeight: '22px' }}>{meta.summary}</div>
        : <div style={{ ...cellText, color: colorPalette.neutral.darken2 }}>No summary yet. Use the edit button to add one.</div>}

      <Divider />

      <DetailSection title={FIELD_LABELS.matterReference}>
        {meta.matterReference ? <div style={cellText}>{meta.matterReference}</div> : dash}
      </DetailSection>

      <Divider />

      <DetailSection title="Parties">
        {meta.parties.length
          ? <DetailRows rows={meta.parties.map(p => ({ key: p.id, label: p.role || '—', value: p.name }))} />
          : dash}
      </DetailSection>

      <Divider />

      <DetailSection title="Dates">
        {dates.length
          ? <DetailRows rows={dates.map(d => ({ key: d.id, label: d.label, value: formatKeyDate(d) }))} />
          : dash}
      </DetailSection>

      <Divider />

      <DetailSection title="File">
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <FileDetail label="Name">{`${stripYear(doc.name)}.${doc.fileFormat.toLowerCase()}`}</FileDetail>
          <FileDetail label="Type">{meta.documentType || dash}</FileDetail>
          <FileDetail label="Format">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(1) }}>
              <FileTypeIcon format={doc.fileFormat} size={20} />
              {doc.fileFormat}
            </span>
          </FileDetail>
          <FileDetail label="Size">{doc.fileSize}</FileDetail>
          <FileDetail label="Uploaded">{formatDate(uploaded)}</FileDetail>
          <FileDetail label="Updated">{formatDate(doc.uploadedDate)}</FileDetail>
          <FileDetail label="Status">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(1) }}>
              <Icon type={iconType.CheckCircleFilled} size={16} color="success-base" />
              {source === 'local' ? 'Up to date' : `Up to date • Synced ${hours} hour${hours === 1 ? '' : 's'} ago`}
            </span>
          </FileDetail>
          <FileDetail label="Source">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(1), maxWidth: '100%' }}>
              {sourceIcon(source, 16, source !== 'local' ? spaceConnectorLabel(space, source) : undefined)}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source === 'local' ? 'Manual upload' : spaceConnectorLabel(space, source)}</span>
            </span>
          </FileDetail>
          <FileDetail label="Space">{space.name}</FileDetail>
        </div>
      </DetailSection>
    </div>
  )
}

function EditPanel({ doc, draft, showErrors, onChange, onSave, onCancel }: {
  doc: MetadataDocument
  draft: ExtractedMetadata
  showErrors: boolean
  onChange: (next: ExtractedMetadata) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">Document Details</Typography>
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonTertiary onClick={onCancel}>Cancel</ButtonTertiary>
          <ButtonPrimary onClick={onSave}>Save</ButtonPrimary>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input label="Document name" name="name" value={stripYear(doc.name)} disabled />
        <Input
          label={FIELD_LABELS.documentType}
          name="documentType"
          isRequired
          error={showErrors && !draft.documentType.trim() ? TYPE_REQUIRED : undefined}
          value={draft.documentType}
          placeholder="e.g. Engagement Letter"
          onChange={e => onChange({ ...draft, documentType: e.target.value })}
        />
        <Input
          label={FIELD_LABELS.matterReference}
          name="matterReference"
          value={draft.matterReference}
          placeholder={MATTER_PLACEHOLDER}
          maxLength={MATTER_MAX}
          hasCounter
          onChange={e => onChange({ ...draft, matterReference: e.target.value })}
        />
        <TextArea
          label={FIELD_LABELS.summary}
          name="summary"
          value={draft.summary}
          placeholder="What is this document about?"
          maxLength={SUMMARY_MAX}
          hasCounter
          autoSize={{ minRows: 4, maxRows: 12 }}
          onChange={e => onChange({ ...draft, summary: e.target.value })}
        />
        <PartiesFields rows={draft.parties} onChange={parties => onChange({ ...draft, parties })} />
        <DatesFields rows={draft.dates} onChange={dates => onChange({ ...draft, dates })} />
      </div>
    </>
  )
}

/** A plausible body for the synthetic document, written from what extraction found so the preview and panel agree. */
function GeneratedDocumentBody({ doc, meta }: { doc: MetadataDocument; meta: ExtractedMetadata }) {
  const p: React.CSSProperties = { margin: '0 0 16px' }
  const h: React.CSSProperties = { fontSize: 15, fontWeight: 700, margin: '28px 0 8px' }
  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", lineHeight: 1.75, color: '#1a1a1a', fontSize: 14, maxWidth: 720 }}>
      <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.25 }}>{stripYear(doc.name)}</div>
      <div style={{ color: '#555', marginTop: 8, marginBottom: 28, fontSize: 13, fontWeight: 600 }}>{meta.documentType || 'Document'} · {doc.namedEntity !== '—' ? doc.namedEntity : 'Uploaded file'}</div>

      {meta.summary && <p style={p}>{meta.summary}</p>}

      {meta.parties.length > 0 && (
        <>
          <div style={h}>1. Parties</div>
          <p style={p}>This document is made between {meta.parties.map((x, i) => (
            <span key={x.id}>{i > 0 ? (i === meta.parties.length - 1 ? ' and ' : ', ') : ''}<strong>{x.name}</strong>{x.role ? ` (the “${x.role}”)` : ''}</span>
          ))}.</p>
        </>
      )}

      <div style={h}>{meta.parties.length ? '2' : '1'}. Background</div>
      <p style={p}>The purpose of this document is to record the facts, obligations and agreed next steps relevant to the matter described above. It should be read together with any related correspondence and prior versions held in this space.</p>
      <p style={p}>Unless stated otherwise, all amounts are in EUR and all references to statutory provisions refer to the version in force on the date of this document.</p>

      {meta.dates.length > 0 && (
        <>
          <div style={h}>{meta.parties.length ? '3' : '2'}. Key dates</div>
          <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
            {sortDates(meta.dates).map(d => <li key={d.id}>{d.label}: <strong>{formatKeyDate(d, formatLongDate)}</strong></li>)}
          </ul>
          <p style={p}>Deadlines stated above are binding. Where a deadline falls on a weekend or public holiday, it moves to the next working day.</p>
        </>
      )}

      <div style={h}>Closing remarks</div>
      <p style={p}>Please direct any questions about this document to the responsible contact. Changes to this document are only valid if made in writing.</p>
    </div>
  )
}
