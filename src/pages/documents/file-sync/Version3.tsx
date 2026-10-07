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
  PropertyItem,
  propertyItemVariants,
  SearchBar,
  searchbarWidth,
  TextArea,
  toastPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import {
  colorPalette,
  computeDocSourceMap,
  formatDate,
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
import { seedShortSummary, seedSummaryDetail } from '../metadata/summaries'
import { SyncProvider, SyncStatusDetail, SyncStatusIcon, syncMenuItem, useSpaceSync, useSync, useSyncStore } from './sync'

/**
 * File Sync — Version 3: Metadata Version 16 with the out-of-sync documents flow from the
 * "Microsoft Integration – Out of Sync Documents" Figma (see ./sync.tsx):
 *
 * - The warning banner above the list (Review · Sync · dismiss), a warning next to the source icon on
 *   rows with a newer version (spinner while syncing), Sync in the document's ⋯ menu and in the
 *   selection bar, and the syncing / successful / unsuccessful toasts. The Status in the details reads the same.
 *
 * Metadata — Version 16: list + details. The cards of Versions 13–15 answered every question
 * for every document at once, so a page held only five or six; here the list is for finding a
 * document and the panel is for reading and editing it.
 *
 *   ☐ 100 documents                                             [⇅ Next deadline] [Upload or sync]
 *   ┌──────────────────────────────────────────────────────┐ ┌──────────────────────────────┐
 *   │▌☐ [xlsx] Q4 Filing — Tax Return.xlsx    Filing deadline ▣│ │ [xlsx] Q4 Filing — Tax Ret…  │
 *   │▌         Tax audit 2022–2024 · Tax Return · Acme +9  Aug 31│ │ [Open preview] [Ask CoPilot] [⋯] │
 *   │ ☐ [pdf]  Year-End Closing — Engagement…  Payment due    ▣│ │ Document Details        ✎   │
 *   │          Austrian secondments · Engagement Letter · …     │ │ Summary · Matter · Parties   │
 *   │  …                                                       │ │ (all ten) · Dates · File     │
 *   └──────────────────────────────────────────────────────┘ └──────────────────────────────┘
 *
 * - Rows are two lines: file name, then matter · type · lead party ("+9" for the rest), with the
 *   most important key date on the right. Rows are one height, so ~12 fit on screen (vs ~6 cards).
 * - Clicking a row shows everything in the side panel — the full summary, every party with its role,
 *   every date, file details — and it's edited there with the same form as the preview. No popovers.
 * - Arrow keys move through the list (across pages), Enter or a double-click opens the preview.
 * - Checkboxes, bulk actions, search and the sort options are as in Version 15; 25 rows per page.
 * - The one trade-off: rows truncate long values with an ellipsis — the panel always has them in full.
 */

const BASE = '/projects/file-sync/version-3'

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

export default function FileSyncVersion3() {
  const workspace = useWorkspaceState()
  const store = useMetadataStore(workspace)
  const sync = useSyncStore(workspace)

  return (
    <SyncProvider store={sync}>
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
    </SyncProvider>
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
    <SpaceDocumentsList
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

// ─── Field limits and form rows (used in the details form) ────────────────────

const TYPE_REQUIRED = 'Type is required'

const SUMMARY_MAX = 500
// A matter reference is a name, not a description — the limit keeps it to a few words.
const MATTER_MAX = 40
const MATTER_PLACEHOLDER = 'e.g. VAT return Q2 2026'

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
function PartiesFields({ rows, onChange }: { rows: Party[]; onChange: (rows: Party[]) => void }) {
  const setRow = (id: string, patch: Partial<Party>) => onChange(rows.map(r => r.id === id ? { ...r, ...patch } : r))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <Typography size="base" weight="semibold" color="neutral-darken5">{FIELD_LABELS.parties}</Typography>
      {rows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 32px', gap: spacing(2), alignItems: 'center' }}>
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

const LIST_CSS = `
  .v16-list {
    position: relative; flex: 1; min-height: 0; overflow-y: auto; outline: none;
    border: 1px solid ${colorPalette.neutral.lighten2}; border-radius: 12px;
  }
  .v16-list:focus-visible { box-shadow: 0 0 0 2px ${colorPalette.blue.lighten3}; }
  .v16-row {
    display: flex; align-items: center; gap: ${spacing(3)}px; padding: ${spacing(2)}px ${spacing(3)}px;
    min-height: 60px; cursor: pointer; border-bottom: 1px solid ${colorPalette.neutral.lighten3};
    border-left: 3px solid transparent;
  }
  .v16-row:last-child { border-bottom: none; }
  .v16-row:hover { background: ${colorPalette.neutral.lighten5}; }
  .v16-row.is-checked { background: #EEF4FF; }
  .v16-row.is-active { background: ${colorPalette.blue.lighten5}; border-left-color: ${colorPalette.blue.base}; }
  .v16-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .v16-panel {
    width: 480px; flex-shrink: 0; overflow-y: auto; display: flex; flex-direction: column; gap: ${spacing(4)}px;
    border: 1px solid ${colorPalette.neutral.lighten2}; border-radius: 12px; padding: ${spacing(4)}px;
  }
`

// ─── Document list: sorting and deadlines ─────────────────────────────────────

/** Earliest open deadline, for sorting; documents without one sort last. */
const nextDeadlineIso = (m: ExtractedMetadata) =>
  m.dates.filter(d => d.isDeadline && !isPeriod(d)).map(d => d.date).sort()[0] ?? '9999'

/** "80 KB" / "4.2 MB" → bytes, for sorting by size. */
function sizeInBytes(size: string) {
  const [num, unit = ''] = size.trim().split(/\s+/)
  const factor = { KB: 1e3, MB: 1e6, GB: 1e9 }[unit.toUpperCase()] ?? 1
  return (parseFloat(num) || 0) * factor
}

type Comparator = (a: MetadataDocument, b: MetadataDocument) => number
const byName: Comparator = (a, b) => stripYear(a.name).localeCompare(stripYear(b.name))
/** A–Z on a text value, with documents that have no value last (then by name, so the order is stable). */
const byText = (value: (d: MetadataDocument) => string): Comparator => (a, b) => {
  const va = value(a).trim(), vb = value(b).trim()
  return Number(!va) - Number(!vb) || va.localeCompare(vb) || byName(a, b)
}

type SortKey = 'deadline' | 'updated' | 'oldest' | 'name' | 'nameDesc' | 'matter' | 'type' | 'party' | 'size'
const DOC_SORTS: Record<SortKey, { label: string; compare: (store: MetadataStore) => Comparator }> = {
  deadline: { label: 'Next deadline', compare: store => (a, b) => nextDeadlineIso(store.get(a)).localeCompare(nextDeadlineIso(store.get(b))) || b.uploadedDate.localeCompare(a.uploadedDate) },
  updated: { label: 'Recently updated', compare: () => (a, b) => b.uploadedDate.localeCompare(a.uploadedDate) },
  oldest: { label: 'Oldest updated', compare: () => (a, b) => a.uploadedDate.localeCompare(b.uploadedDate) },
  name: { label: 'Name (A–Z)', compare: () => byName },
  nameDesc: { label: 'Name (Z–A)', compare: () => (a, b) => byName(b, a) },
  matter: { label: 'Matter reference', compare: store => byText(d => store.get(d).matterReference) },
  type: { label: 'Type', compare: store => byText(d => store.get(d).documentType) },
  party: { label: 'Parties', compare: store => byText(d => store.get(d).parties[0]?.name ?? '') },
  size: { label: 'Largest file', compare: () => (a, b) => sizeInBytes(b.fileSize) - sizeInBytes(a.fileSize) || byName(a, b) },
}

const APP_HEADER_HEIGHT = 80

// Rows are compact, so a page holds more than the cards did.
const LIST_PAGE_SIZE = 25

const fieldLabel: React.CSSProperties = { fontSize: 12, lineHeight: '18px', color: colorPalette.neutral.darken2 }

// ─── Documents list ───────────────────────────────────────────────────────────

function SpaceDocumentsList({ space, docs, store, onDocsChange, onBack, onOpenDoc, onUpdateSpace, onDeleteSpace }: {
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
  const sync = useSync()
  const { banner: syncBanner, visible: syncVisible } = useSpaceSync(sync, space.id, docs, () => setCurrentPage(1))
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [uploadOpen, setUploadOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Set<string> | null>(null)
  // The document open in the details panel.
  const [activeId, setActiveId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [editSpaceOpen, setEditSpaceOpen] = useState(false)
  const [deleteSpaceOpen, setDeleteSpaceOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('deadline')

  const sourceMap = useMemo(() => computeDocSourceMap(docs, space), [docs, space])
  const presentConnectors = useMemo(() => {
    const present = new Set(sourceMap.values())
    return space.connectors.filter(c => present.has(c.type))
  }, [space.connectors, sourceMap])

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return syncVisible(docs)
    return syncVisible(docs).filter(d => {
      const m = store.get(d)
      return d.name.toLowerCase().includes(q) || m.documentType.toLowerCase().includes(q) ||
        m.matterReference.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q) || m.parties.some(p => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)) ||
        m.dates.some(x => x.label.toLowerCase().includes(q))
    })
  }, [docs, search, store, syncVisible])

  const allSelected = filteredDocs.length > 0 && filteredDocs.every(d => selectedKeys.has(d._id))
  const someSelected = filteredDocs.some(d => selectedKeys.has(d._id))
  const selectedDocs = docs.filter(d => selectedKeys.has(d._id))
  const selectedToSync = sync.pending(selectedDocs)
  const allSelectedAreManualUpload = selectedDocs.length > 0 && selectedDocs.every(d => (sourceMap.get(d._id) ?? 'local') === 'local')

  const toggleSelected = (ids: string[], on: boolean) => setSelectedKeys(prev => {
    const next = new Set(prev)
    ids.forEach(id => { if (on) next.add(id); else next.delete(id) })
    return next
  })

  const sorted = [...filteredDocs].sort(DOC_SORTS[sortBy].compare(store))
  const pageCount = Math.max(1, Math.ceil(sorted.length / LIST_PAGE_SIZE))
  const page = Math.min(currentPage, pageCount)
  const pageDocs = sorted.slice((page - 1) * LIST_PAGE_SIZE, page * LIST_PAGE_SIZE)
  // The document shown in the details panel: the one clicked, else the first on the page.
  const activeDoc = pageDocs.find(d => d._id === activeId) ?? pageDocs[0] ?? null

  /** Arrow keys move through the list (and across pages); Enter opens the full preview. */
  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (!activeDoc) return
    const i = sorted.indexOf(activeDoc)
    const target = e.key === 'ArrowDown' ? sorted[i + 1] : e.key === 'ArrowUp' ? sorted[i - 1] : null
    if (e.key === 'Enter') { e.preventDefault(); onOpenDoc(activeDoc); return }
    if (!target) return
    e.preventDefault()
    setActiveId(target._id)
    setCurrentPage(Math.floor(sorted.indexOf(target) / LIST_PAGE_SIZE) + 1)
    // Scroll only the list — scrollIntoView would also scroll the (overflow: hidden) page around it.
    requestAnimationFrame(() => {
      const list = listRef.current
      const row = document.getElementById(`v16-row-${target._id}`)
      if (!list || !row) return
      if (row.offsetTop < list.scrollTop) list.scrollTop = row.offsetTop
      else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight
    })
  }

  const renderRow = (record: MetadataDocument) => {
    const m = store.get(record)
    const src = sourceMap.get(record._id) ?? 'local'
    const keyDate = tableDates(m.dates)[0]
    const checked = selectedKeys.has(record._id)
    const active = activeDoc?._id === record._id
    // Line two: the matter first (how people look for work), then type and the lead party.
    const context = [
      m.matterReference,
      m.documentType,
      m.parties[0] && `${m.parties[0].name}${m.parties.length > 1 ? ` +${m.parties.length - 1}` : ''}`,
    ].filter(Boolean).join('  ·  ')

    return (
      <div
        key={record._id}
        id={`v16-row-${record._id}`}
        className={`v16-row${active ? ' is-active' : ''}${checked ? ' is-checked' : ''}`}
        onClick={() => setActiveId(record._id)}
        onDoubleClick={() => onOpenDoc(record)}
      >
        <div onClick={e => e.stopPropagation()} style={{ display: 'flex' }}>
          <Checkbox checked={checked} onChange={e => toggleSelected([record._id], e.target.checked)} />
        </div>
        <FileTypeIcon format={record.fileFormat} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="v16-ellipsis" style={{ ...cellText, fontWeight: 600 }}>{fileName(record)}</div>
          <div className="v16-ellipsis" style={{ ...fieldLabel, fontSize: 13, lineHeight: '20px' }}>{context || 'No details extracted yet'}</div>
        </div>
        <div style={{ width: 172, flexShrink: 0, textAlign: 'right' }}>
          {keyDate ? (
            <>
              <div className="v16-ellipsis" style={fieldLabel}>{keyDate.label}</div>
              <div style={{ ...cellText, whiteSpace: 'nowrap' }}>{formatKeyDate(keyDate)}</div>
            </>
          ) : <div style={{ ...fieldLabel }}>Updated {formatDate(record.uploadedDate)}</div>}
        </div>
        {/* Only a problem is marked; "up to date" stays unmarked to keep rows quiet. */}
        <div style={{ width: 20, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <SyncStatusIcon sync={sync} id={record._id} connected={src !== 'local'} hours={1} onlyIssues />
        </div>
        <div style={{ width: 20, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          {sourceIcon(src, 18, src !== 'local' ? spaceConnectorLabel(space, src) : undefined)}
        </div>
      </div>
    )
  }

  return (
    // Exactly the viewport below the 80px app header: the Layout's content area has no fixed height, so
    // '100%' would grow with the list and scroll the whole window instead of the list and panel.
    <div style={{ padding: `${spacing(6)}px ${spacing(10)}px`, display: 'flex', flexDirection: 'column', gap: spacing(6), backgroundColor: colorPalette.white, height: `calc(100vh - ${APP_HEADER_HEIGHT}px)`, overflow: 'hidden' }}>
      <style>{LIST_CSS}</style>
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

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(4) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), paddingLeft: 13 }}>
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={e => setSelectedKeys(new Set(e.target.checked ? filteredDocs.map(d => d._id) : []))}
          />
          <Typography size="base" color="neutral-darken2">{filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}</Typography>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(4) }}>
          <Dropdown
            items={(Object.keys(DOC_SORTS) as SortKey[]).map(k => ({
              key: k,
              label: <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(4), minWidth: 160 }}>{DOC_SORTS[k].label}{k === sortBy && <Icon type={iconType.CheckOutlined} size={16} />}</span>,
              onClick: () => { setSortBy(k); setCurrentPage(1); setActiveId(null) },
            }))}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonTertiary leftIcon={iconType.ArrowSwapOutlined}>{DOC_SORTS[sortBy].label}</ButtonTertiary>
          </Dropdown>
          <ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={() => setUploadOpen(true)}>Upload or sync</ButtonPrimary>
        </div>
      </div>

      {syncBanner}

      {/* List on the left, the selected document's full details on the right. */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: spacing(4), paddingBottom: selectedKeys.size > 0 ? 64 : 0 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          <div ref={listRef} className="v16-list" tabIndex={0} onKeyDown={onListKeyDown} aria-label="Documents">
            {filteredDocs.length === 0 && (
              <div style={{ padding: spacing(4) }}><Typography size="base" color="neutral-darken2">No documents match your search.</Typography></div>
            )}
            {pageDocs.map(renderRow)}
          </div>
          {filteredDocs.length > LIST_PAGE_SIZE && (
            <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <Pagination current={page} total={filteredDocs.length} pageSize={LIST_PAGE_SIZE} onChange={p => { setCurrentPage(p); setActiveId(null) }} />
            </div>
          )}
        </div>

        {activeDoc && (
          <aside className="v16-panel">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(3) }}>
              <FileTypeIcon format={activeDoc.fileFormat} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Typography size="base-lg" weight="semibold" color="neutral-darken5">{fileName(activeDoc)}</Typography>
                <div style={fieldLabel}>{activeDoc.fileSize} · Updated {formatDate(activeDoc.uploadedDate)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: spacing(2) }}>
              <ButtonTertiary leftIcon={iconType.ArticleOutlined} onClick={() => onOpenDoc(activeDoc)}>Open preview</ButtonTertiary>
              {/* Same button as the full preview's top bar; its CoPilot mark can't be a leftIcon (goat icon names only). */}
              <ButtonTertiary>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />Ask CoPilot<Icon type={iconType.ExternalLinkOutlined} size={16} /></span>
              </ButtonTertiary>
              <Dropdown
                items={[
                  { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => {} },
                  ...(sync.pending([activeDoc]).length ? [syncMenuItem(() => sync.sync(space.id, [activeDoc]))] : []),
                  { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => setPendingDelete(new Set([activeDoc._id])) },
                ]}
                trigger={dropdownTriggers.CLICK}
                placement={dropdownPlacement.BOTTOM_LEFT}
              >
                <ButtonTertiary shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
              </Dropdown>
            </div>
            <Divider />
            <DetailsCard
              key={activeDoc._id}
              doc={activeDoc}
              space={space}
              store={store}
              source={sourceMap.get(activeDoc._id) ?? 'local'}
              docIndex={docs.indexOf(activeDoc)}
            />
          </aside>
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
            {selectedToSync.length > 0 && (
              <ButtonTertiary leftIcon={iconType.RefreshOutlined} onClick={() => sync.sync(space.id, selectedToSync)}>Sync</ButtonTertiary>
            )}
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

/**
 * The "Document Details" card: read view with an edit button that turns it into the form
 * (Cancel / Save). Shared by the documents list's side panel and the full preview, so a
 * document is edited the same way in both places.
 */
function DetailsCard({ doc, space, store, source, docIndex }: {
  doc: MetadataDocument
  space: Space
  store: MetadataStore
  source: DocSource
  docIndex: number
}) {
  // Non-null while the card is in edit mode.
  const [draft, setDraft] = useState<ExtractedMetadata | null>(null)
  // Set once Save is pressed, so required-field errors only appear after a save attempt.
  const [triedSave, setTriedSave] = useState(false)
  const meta = store.get(doc)

  const startEdit = () => { setTriedSave(false); setDraft({ ...meta, parties: meta.parties.map(p => ({ ...p })), dates: sortDates(meta.dates) }) }
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

  return draft
    ? <EditPanel doc={doc} draft={draft} showErrors={triedSave} onChange={setDraft} onSave={saveEdit} onCancel={() => setDraft(null)} />
    : <ViewPanel doc={doc} space={space} meta={meta} source={source} docIndex={docIndex} onEdit={startEdit} />
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
  const filename = `${stripYear(doc.name)}.${doc.fileFormat.toLowerCase()}`

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
          {isLoading
            ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 10 }} />
            : <DetailsCard doc={doc} space={space} store={store} source={source} docIndex={docIndex} />}
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

      <DetailSection title={FIELD_LABELS.summary}>
        {meta.summary
          ? <div style={{ ...cellText, lineHeight: '22px' }}>{meta.summary}</div>
          : <div style={{ ...cellText, color: colorPalette.neutral.darken2 }}>No summary yet. Use the edit button to add one.</div>}
      </DetailSection>

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
            <SyncStatusDetail id={doc._id} connected={source !== 'local'} hours={hours} />
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
