import { useMemo, useState, type ReactNode } from 'react'
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
  SpacesListView,
  sourceIcon,
  spaceConnectorLabel,
  spacing,
  stripYear,
  useMountLoading,
  useSidebarWidth,
  useWorkspaceState,
  type MetadataDocument,
  type Space,
} from '../workspaces/shared'
import { BasicUploadModal, CopilotIcon } from '../workspaces/WorkspacesBasic'

/**
 * Metadata — Version 8: built on Workspaces Basic (spaces list → a space's
 * documents table), with the metadata model reduced to the same four fields
 * for every target group:
 *
 *   Document type · Matter reference · Parties · Dates & deadlines
 *
 * Nothing is shown as tags any more — every value is plain, wrapping text under
 * a visible label (the column header in the list, a section label in the
 * preview), so extracted text is never cut off at a chip's character limit.
 * Dates and deadlines share one field: each date carries its own label and a
 * "deadline" flag, and deadlines get an overdue / due-soon state. Every field
 * has an explicit "Not found" empty state with a way to add the value by hand.
 */

const BASE = '/projects/metadata/version-8'

/** Same slug rule as Workspaces Basic, so space URLs match between the two versions. */
function slugify(name: string): string {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ─── Metadata model ───────────────────────────────────────────────────────────

type Party = { id: string; name: string; role: string }
type KeyDate = { id: string; label: string; date: string; isDeadline: boolean }
type FieldKey = 'documentType' | 'matterReference' | 'parties' | 'dates'

type ExtractedMetadata = {
  documentType: string
  matterReference: string
  parties: Party[]
  dates: KeyDate[]
  /** Fields the user has changed by hand, so the UI can tell them apart from AI output. */
  edited: Partial<Record<FieldKey, true>>
}

const FIELD_LABELS: Record<FieldKey, string> = {
  documentType: 'Document type',
  matterReference: 'Matter reference',
  parties: 'Parties',
  dates: 'Dates & deadlines',
}

const EMPTY_METADATA: ExtractedMetadata = { documentType: '', matterReference: '', parties: [], dates: [], edited: {} }

let idCounter = 0
const newId = (prefix: string) => `${prefix}-${Date.now()}-${++idCounter}`

// ─── Deterministic seed extraction ────────────────────────────────────────────

type MetaTheme = {
  matters: string[]
  counterparties: { name: string; role: string }[]
  primaryRole: string
  dateLabels: string[]
  deadlineLabels: string[]
}

const META_THEMES: Record<string, MetaTheme> = {
  'space-acme': {
    matters: [
      'Quarterly VAT return for intra-community supplies, including correction of input tax claimed on the Hamburg warehouse lease',
      'Engagement for annual tax compliance services covering corporate income tax, trade tax and the 2025 financial statements',
      'Tax audit of the 2022–2024 assessment periods by the Munich tax office, focusing on transfer pricing for intra-group services',
      'Restructuring of Acme Holdings GmbH into a tax group (Organschaft) with its two operating subsidiaries',
      'Due diligence on the planned acquisition of Brenner Logistik GmbH, with a focus on loss carry-forwards and VAT exposure',
      'Objection against the 2024 trade tax assessment regarding the add-back of rental expenses',
      'Year-end closing and preparation of the annual financial statements under HGB',
      'Advice on the tax treatment of employee secondments to the Austrian branch',
    ],
    counterparties: [
      { name: 'Finanzamt München', role: 'Tax authority' },
      { name: 'KPMG AG Wirtschaftsprüfungsgesellschaft', role: 'Auditor' },
      { name: 'Dr. Anna Weber', role: 'Tax advisor' },
      { name: 'Brenner Logistik GmbH', role: 'Target company' },
      { name: 'Commerzbank AG', role: 'Lender' },
    ],
    primaryRole: 'Client',
    dateLabels: ['Document date', 'Assessment period start', 'Assessment period end', 'Signed on'],
    deadlineLabels: ['Filing deadline', 'Objection deadline', 'Payment due', 'Response due'],
  },
  'space-alpha': {
    matters: [
      'Charter setting out scope, budget and governance for the migration of the document platform to the new cloud tenant',
      'Security review of the vendor’s data processing agreement ahead of contract signature',
      'Rollout plan for the pilot with three customer teams, including success criteria and fallback steps',
      'Post-incident review of the search outage on 12 August and the follow-up actions agreed',
      'Quarterly budget review with the steering committee and approval of the Q4 forecast',
      'Evaluation of three OCR vendors against accuracy, cost and data residency requirements',
    ],
    counterparties: [
      { name: 'Alpha Steering Committee', role: 'Approver' },
      { name: 'Nordlicht Software GmbH', role: 'Vendor' },
      { name: 'Maria Schulz', role: 'Project lead' },
      { name: 'IT Security Office', role: 'Reviewer' },
    ],
    primaryRole: 'Owner',
    dateLabels: ['Document date', 'Kick-off', 'Review meeting', 'Approved on'],
    deadlineLabels: ['Go-live', 'Sign-off due', 'Feedback due', 'Milestone'],
  },
  'space-hr': {
    matters: [
      'Company policy on remote and hybrid working, including eligibility, equipment allowance and working-time recording',
      'Parental leave entitlements and the process for requesting part-time work during parental leave',
      'Annual benefits enrolment for the company pension scheme and the job bike programme',
      'Relocation support for employees transferring to the Freiburg office',
      'Data protection obligations for employees handling applicant data under GDPR',
    ],
    counterparties: [
      { name: 'Works Council (Betriebsrat)', role: 'Co-determination body' },
      { name: 'Techniker Krankenkasse', role: 'Health insurer' },
      { name: 'Jonas Becker', role: 'HR business partner' },
      { name: 'DATEV eG', role: 'Payroll provider' },
    ],
    primaryRole: 'Employer',
    dateLabels: ['Document date', 'Effective from', 'Last reviewed', 'Agreed on'],
    deadlineLabels: ['Enrolment deadline', 'Review due', 'Consultation deadline', 'Submission due'],
  },
}

const TODAY_MS = new Date(new Date().toISOString().slice(0, 10)).getTime()
const DAY_MS = 86400000
const isoFromOffset = (days: number) => new Date(TODAY_MS + days * DAY_MS).toISOString().slice(0, 10)

function pick<T>(pool: T[], n: number): T {
  return pool[((n % pool.length) + pool.length) % pool.length]
}

/** What the extraction "found" for a seeded document. Deliberately leaves gaps so every empty state shows up. */
function seedMetadata(doc: MetadataDocument, spaceId: string, index: number): ExtractedMetadata {
  const theme = META_THEMES[spaceId]
  if (!theme) return { ...EMPTY_METADATA, documentType: doc.documentType }

  // Roughly 1 in 13 documents yields nothing at all.
  if (index % 13 === 6) return { ...EMPTY_METADATA }

  const noMatter = index % 11 === 4
  const noParties = index % 7 === 3
  const noDates = index % 5 === 2

  const parties: Party[] = noParties ? [] : [
    { id: `${doc._id}-p0`, name: doc.namedEntity, role: theme.primaryRole },
    ...Array.from({ length: index % 3 }, (_, k) => {
      const cp = pick(theme.counterparties, index * 3 + k)
      return { id: `${doc._id}-p${k + 1}`, ...cp }
    }),
  ].filter((p, i, arr) => arr.findIndex(q => q.name === p.name) === i)

  // Document date first, then (sometimes) a later date and a deadline after that —
  // deadlines land anywhere from ~5 weeks overdue to ~4 months out.
  const docOffset = -((index * 29) % 300) - 60
  const deadlineOffset = Math.max(((index * 17) % 150) - 35, docOffset + 30)
  const dates: KeyDate[] = noDates ? [] : [
    { id: `${doc._id}-d0`, label: theme.dateLabels[0], date: isoFromOffset(docOffset), isDeadline: false },
    ...(index % 3 === 0
      ? [{ id: `${doc._id}-d2`, label: pick(theme.dateLabels.slice(1), index), date: isoFromOffset(docOffset + 10 + (index % 15)), isDeadline: false }]
      : []),
    ...(index % 4 !== 1
      ? [{ id: `${doc._id}-d1`, label: pick(theme.deadlineLabels, index * 2), date: isoFromOffset(deadlineOffset), isDeadline: true }]
      : []),
  ]

  return {
    documentType: doc.documentType,
    matterReference: noMatter ? '' : pick(theme.matters, index * 5 + 2),
    parties,
    dates,
    edited: {},
  }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

type DeadlineState = { tone: 'overdue' | 'soon' | 'later' | 'past-date'; text: string }

function deadlineState(d: KeyDate): DeadlineState {
  const days = Math.round((new Date(d.date).getTime() - TODAY_MS) / DAY_MS)
  if (!d.isDeadline) return { tone: 'past-date', text: '' }
  if (days < 0) return { tone: 'overdue', text: `Overdue by ${-days} day${days === -1 ? '' : 's'}` }
  if (days === 0) return { tone: 'soon', text: 'Due today' }
  if (days <= 14) return { tone: 'soon', text: `Due in ${days} day${days === 1 ? '' : 's'}` }
  return { tone: 'later', text: `In ${days} days` }
}

const TONE_COLOR: Record<DeadlineState['tone'], string> = {
  overdue: colorPalette.danger.base,
  soon: colorPalette.orange.darken1,
  later: colorPalette.neutral.darken5,
  'past-date': colorPalette.neutral.darken5,
}

/** Chronological, with deadlines ahead of plain dates on the same day. */
function sortDates(dates: KeyDate[]) {
  return [...dates].sort((a, b) => a.date.localeCompare(b.date) || Number(b.isDeadline) - Number(a.isDeadline))
}

/** The one date worth surfacing in a table row: the most urgent open deadline, else the latest date. */
function primaryDate(dates: KeyDate[]): KeyDate | null {
  if (dates.length === 0) return null
  const deadlines = dates.filter(d => d.isDeadline)
  const upcoming = deadlines.filter(d => d.date >= isoFromOffset(0)).sort((a, b) => a.date.localeCompare(b.date))
  if (upcoming.length) return upcoming[0]
  const overdue = deadlines.sort((a, b) => b.date.localeCompare(a.date))
  if (overdue.length) return overdue[0]
  return [...dates].sort((a, b) => b.date.localeCompare(a.date))[0]
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

export default function MetadataVersion8() {
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

  return (
    <DocumentPreview
      key={doc._id}
      space={space}
      doc={doc}
      store={store}
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

function DocumentTypeEditor({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(value)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      <Input
        label={FIELD_LABELS.documentType}
        value={draft}
        placeholder="e.g. Engagement Letter"
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); onSave(draft.trim()) }
          if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
        }}
      />
      <EditorActions onSave={() => onSave(draft.trim())} onCancel={onCancel} />
    </div>
  )
}

const MATTER_MAX = 300

function MatterEditor({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(value)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      <TextArea
        label={FIELD_LABELS.matterReference}
        value={draft}
        placeholder="What is this document about?"
        maxLength={MATTER_MAX}
        hasCounter
        autoSize={{ minRows: 3, maxRows: 8 }}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onCancel() } }}
      />
      <EditorActions onSave={() => onSave(draft.trim())} onCancel={onCancel} />
    </div>
  )
}

const blankParty = (): Party => ({ id: newId('party'), name: '', role: '' })
const blankDate = (): KeyDate => ({ id: newId('date'), label: '', date: '', isDeadline: false })
const cleanParties = (rows: Party[]) => rows.map(r => ({ ...r, name: r.name.trim(), role: r.role.trim() })).filter(r => r.name)
const cleanDates = (rows: KeyDate[]) => sortDates(rows.filter(r => r.date).map(r => ({ ...r, label: r.label.trim() || (r.isDeadline ? 'Deadline' : 'Date') })))

/** Controlled list of party rows — wrapped with its own Save/Cancel in the table popover, bare in the preview's edit panel. */
function PartiesFields({ rows, onChange }: { rows: Party[]; onChange: (rows: Party[]) => void }) {
  const setRow = (id: string, patch: Partial<Party>) => onChange(rows.map(r => r.id === id ? { ...r, ...patch } : r))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <Typography size="base" weight="semibold" color="neutral-darken5">{FIELD_LABELS.parties}</Typography>
      {rows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 32px', gap: spacing(2), alignItems: 'center' }}>
          <Typography size="base-sm" color="neutral-darken2">Name</Typography>
          <Typography size="base-sm" color="neutral-darken2">Role (optional)</Typography>
          <span />
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
      <PartiesFields rows={rows} onChange={setRows} />
      <EditorActions onSave={() => onSave(cleanParties(rows))} onCancel={onCancel} />
    </div>
  )
}

function PartyRow({ party, onChange, onRemove }: { party: Party; onChange: (patch: Partial<Party>) => void; onRemove: () => void }) {
  return (
    <>
      <Input value={party.name} placeholder="Person or organisation" onChange={e => onChange({ name: e.target.value })} />
      <Input value={party.role} placeholder="e.g. Client" onChange={e => onChange({ role: e.target.value })} />
      <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={onRemove} />
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto 32px', gap: spacing(2), alignItems: 'center' }}>
          <Typography size="base-sm" color="neutral-darken2">What it is</Typography>
          <Typography size="base-sm" color="neutral-darken2">Date</Typography>
          <Typography size="base-sm" color="neutral-darken2">Deadline</Typography>
          <span />
          {rows.map(r => (
            <DateRow key={r.id} row={r} onChange={patch => setRow(r.id, patch)} onRemove={() => onChange(rows.filter(x => x.id !== r.id))} />
          ))}
        </div>
      )}
      <div style={{ marginLeft: -8 }}>
        <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => onChange([...rows, blankDate()])}>Add date</ButtonGhost>
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
      <Input value={row.label} placeholder="e.g. Filing deadline" onChange={e => onChange({ label: e.target.value })} />
      <DatePicker
        value={row.date ? new Date(row.date) : undefined}
        placeholder="DD/MM/YYYY"
        onChange={d => onChange({ date: d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : '' })}
      />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Checkbox checked={row.isDeadline} onChange={e => onChange({ isDeadline: e.target.checked })} />
      </div>
      <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={onRemove} />
    </>
  )
}

// ─── Read-only field displays ─────────────────────────────────────────────────

function NotFound({ compact = false }: { compact?: boolean }) {
  return (
    <span style={{ color: colorPalette.neutral.darken2, fontStyle: 'italic', fontSize: compact ? 13 : 14 }}>Not found</span>
  )
}

function DeadlineLine({ d, showLabel = false }: { d: KeyDate; showLabel?: boolean }) {
  const state = deadlineState(d)
  const color = TONE_COLOR[state.tone]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color, fontWeight: d.isDeadline && state.tone !== 'later' ? 600 : 400 }}>
      {d.isDeadline && <Icon type={state.tone === 'overdue' ? iconType.AlertOutlined : iconType.ClockOutlined} size={16} color="inherit" />}
      {formatLongDate(d.date)}
      {showLabel && <span style={{ color: colorPalette.neutral.darken2, fontWeight: 400 }}>· {d.label}</span>}
    </span>
  )
}

const muted: React.CSSProperties = { color: colorPalette.neutral.darken2, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
const clamp2: React.CSSProperties = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '20px' }

// ─── Table cell with popover editor ───────────────────────────────────────────

/**
 * A metadata cell in the documents table: plain text with a pencil on hover.
 * Clicking opens the field's editor in a popover anchored to the cell, so the
 * structured fields (parties, dates) can be edited without leaving the list.
 */
function EditableCell({ open, onOpenChange, editor, children, minWidth = 320 }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editor: ReactNode
  children: ReactNode
  minWidth?: number
}) {
  return (
    <PopOver
      trigger={popOverTriggers.CLICK}
      placement={popOverPlacements.BOTTOM_LEFT}
      open={open}
      onOpenChange={onOpenChange}
      maxWidth={600}
      content={open ? <div onClick={e => e.stopPropagation()} style={{ padding: spacing(1), minWidth }}>{editor}</div> : null}
    >
      <div
        className="v8-editable"
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer', minHeight: 24,
          borderRadius: 4, border: `1px dashed ${open ? '#D0D8EE' : 'transparent'}`, padding: '2px 6px 2px 4px',
          backgroundColor: open ? '#EBF0FF' : undefined,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        <span className="v8-pencil" style={{ opacity: open ? 1 : 0, transition: 'opacity 0.15s', flexShrink: 0, display: 'flex', alignItems: 'center', paddingTop: 3 }}>
          <Icon type={iconType.EditRecOutlined} size={12} color="neutral-darken2" />
        </span>
      </div>
    </PopOver>
  )
}

const HOVER_CSS = `
  .v8-editable:hover { background-color: #EBF0FF; border-color: #D0D8EE !important; }
  .v8-editable:hover .v8-pencil { opacity: 1 !important; }
  .v8-doc-link { color: ${colorPalette.neutral.darken5}; cursor: pointer; font-weight: 600; }
  .v8-doc-link:hover { color: ${colorPalette.blue.base}; text-decoration: underline; }
`

// ─── Documents table ──────────────────────────────────────────────────────────

function SpaceDocumentsTable({ space, docs, store, onDocsChange, onBack, onOpenDoc }: {
  space: Space
  docs: MetadataDocument[]
  store: MetadataStore
  onDocsChange: (docs: MetadataDocument[]) => void
  onBack: () => void
  onOpenDoc: (doc: MetadataDocument) => void
}) {
  const { notification } = useNotifications()
  const sidebarWidth = useSidebarWidth()

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [uploadOpen, setUploadOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Set<string> | null>(null)
  const [editing, setEditing] = useState<{ id: string; field: FieldKey } | null>(null)

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
        m.matterReference.toLowerCase().includes(q) || m.parties.some(p => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)) ||
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
  const saveField = (id: string, field: FieldKey, patch: Partial<ExtractedMetadata>) => { store.update(id, field, patch); close() }

  const rowStyle = (record: MetadataDocument) => ({ style: { verticalAlign: 'top' as const, backgroundColor: selectedKeys.has(record._id) ? '#EEF4FF' : undefined } })

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
      width: 48,
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 2 }}>
          <Checkbox
            checked={selectedKeys.has(record._id)}
            onChange={e => setSelectedKeys(prev => {
              const next = new Set(prev)
              if (e.target.checked) next.add(record._id); else next.delete(record._id)
              return next
            })}
          />
        </div>
      ),
    },
    {
      title: 'Name',
      key: 'name',
      width: 230,
      sorter: (a: MetadataDocument, b: MetadataDocument) => stripYear(a.name).localeCompare(stripYear(b.name)),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => (
        <div style={{ paddingTop: 3 }}>
          <div style={clamp2}><span className="v8-doc-link" onClick={() => onOpenDoc(record)}>{stripYear(record.name)}</span></div>
          <div style={muted}>{record.fileFormat} · {record.fileSize}</div>
        </div>
      ),
    },
    {
      title: 'Source',
      key: 'source',
      width: 80,
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const src = sourceMap.get(record._id) ?? 'local'
        return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>{sourceIcon(src, 18, src !== 'local' ? spaceConnectorLabel(space, src) : undefined)}</div>
      },
    },
    {
      title: FIELD_LABELS.documentType,
      key: 'documentType',
      width: 160,
      sorter: (a: MetadataDocument, b: MetadataDocument) => store.get(a).documentType.localeCompare(store.get(b).documentType),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const m = store.get(record)
        return (
          <EditableCell
            open={isEditing(record._id, 'documentType')}
            onOpenChange={openChange(record._id, 'documentType')}
            editor={<DocumentTypeEditor value={m.documentType} onCancel={close} onSave={v => saveField(record._id, 'documentType', { documentType: v })} />}
          >
            {m.documentType ? <div style={clamp2}>{m.documentType}</div> : <NotFound compact />}
          </EditableCell>
        )
      },
    },
    {
      title: FIELD_LABELS.matterReference,
      key: 'matterReference',
      sorter: (a: MetadataDocument, b: MetadataDocument) => store.get(a).matterReference.localeCompare(store.get(b).matterReference),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const m = store.get(record)
        const text = m.matterReference
        return (
          <EditableCell
            open={isEditing(record._id, 'matterReference')}
            onOpenChange={openChange(record._id, 'matterReference')}
            minWidth={420}
            editor={<MatterEditor value={text} onCancel={close} onSave={v => saveField(record._id, 'matterReference', { matterReference: v })} />}
          >
            {!text ? <NotFound compact /> : text.length > 90 && !isEditing(record._id, 'matterReference')
              ? <Tooltip title={text} size={tooltipSizes.LARGE}><div style={clamp2}>{text}</div></Tooltip>
              : <div style={clamp2}>{text}</div>}
          </EditableCell>
        )
      },
    },
    {
      title: FIELD_LABELS.parties,
      key: 'parties',
      width: 210,
      sorter: (a: MetadataDocument, b: MetadataDocument) => (store.get(a).parties[0]?.name ?? '').localeCompare(store.get(b).parties[0]?.name ?? ''),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const { parties } = store.get(record)
        const [first, ...rest] = parties
        return (
          <EditableCell
            open={isEditing(record._id, 'parties')}
            onOpenChange={openChange(record._id, 'parties')}
            minWidth={460}
            editor={<PartiesEditor value={parties} onCancel={close} onSave={v => saveField(record._id, 'parties', { parties: v })} />}
          >
            {!first ? <NotFound compact /> : (
              <>
                <div style={{ ...muted, fontSize: 14, color: colorPalette.neutral.darken5 }}>{first.name}</div>
                <div style={muted}>
                  {first.role}{first.role && rest.length ? ' · ' : ''}{rest.length ? `+${rest.length} more` : ''}
                </div>
              </>
            )}
          </EditableCell>
        )
      },
    },
    {
      title: FIELD_LABELS.dates,
      key: 'dates',
      width: 220,
      sorter: (a: MetadataDocument, b: MetadataDocument) => (primaryDate(store.get(a).dates)?.date ?? '9999').localeCompare(primaryDate(store.get(b).dates)?.date ?? '9999'),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const { dates } = store.get(record)
        const main = primaryDate(dates)
        return (
          <EditableCell
            open={isEditing(record._id, 'dates')}
            onOpenChange={openChange(record._id, 'dates')}
            minWidth={540}
            editor={<DatesEditor value={dates} onCancel={close} onSave={v => saveField(record._id, 'dates', { dates: v })} />}
          >
            {!main ? <NotFound compact /> : (
              <>
                <div style={{ fontSize: 14 }}><DeadlineLine d={main} /></div>
                <div style={muted}>{main.label}{dates.length > 1 ? ` · +${dates.length - 1} more` : ''}</div>
              </>
            )}
          </EditableCell>
        )
      },
    },
    {
      title: 'Updated',
      key: 'uploadedDate',
      dataIndex: 'uploadedDate',
      width: 120,
      sorter: (a: MetadataDocument, b: MetadataDocument) => a.uploadedDate.localeCompare(b.uploadedDate),
      onCell: rowStyle,
      render: (val: string) => <div style={{ paddingTop: 3 }}>{formatDate(val)}</div>,
    },
    {
      title: '',
      key: 'actions',
      width: 56,
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
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
      <style>{HOVER_CSS}</style>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ChevronLeftOutlined} onClick={onBack} />
          <SpaceAvatar space={space} size={32} />
          <Typography size="heading-lg" weight="bold">{space.name}</Typography>
          <div style={{ flex: 1 }} />
          <div style={{ width: 320 }}>
            <SearchBar placeholder="Search documents, matters, parties" value={search} onChange={v => { setSearch(v); setCurrentPage(1) }} width={searchbarWidth.EXPANDED} />
          </div>
        </div>
        <Typography size="base" color="neutral-darken2">{space.description}</Typography>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography size="base" color="neutral-darken2">{filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}</Typography>
        <ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={() => setUploadOpen(true)}>Upload or sync</ButtonPrimary>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
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
// Same layout as /projects/bulk-edit/version-3/:id: dark sticky top bar, the
// document on the left (62%), and a "Document Details" card on the right with
// one edit button that turns the whole card into a form with Cancel / Save.

const TOP_BAR_BG = '#1e1f2e'
const PROP_LABEL = { size: 'base' as const, color: 'neutral-darken2' as const, width: '140px' }
const PROP_VALUE = { size: 'base' as const, color: 'neutral-darken5' as const }

function PropRow({ children }: { children: ReactNode }) {
  return <div className="v8-prop" style={{ padding: '6px 0' }}>{children}</div>
}

// PropertyItem centres its label vertically; multi-line values (parties, dates) read better with it top-aligned.
const PROP_CSS = `.v8-prop > * { align-items: flex-start !important; }`

function DocumentPreview({ space, doc, store, onBack, onDelete }: {
  space: Space
  doc: MetadataDocument
  store: MetadataStore
  onBack: () => void
  onDelete: () => void
}) {
  const isLoading = useMountLoading(1500)
  // Non-null while the details card is in edit mode.
  const [draft, setDraft] = useState<ExtractedMetadata | null>(null)
  const meta = store.get(doc)
  const filename = `${stripYear(doc.name)}.${doc.fileFormat.toLowerCase()}`

  const startEdit = () => setDraft({ ...meta, parties: meta.parties.map(p => ({ ...p })), dates: sortDates(meta.dates) })
  const cancelEdit = () => setDraft(null)
  const saveEdit = () => {
    if (!draft) return
    const next: Pick<ExtractedMetadata, FieldKey> = {
      documentType: draft.documentType.trim(),
      matterReference: draft.matterReference.trim(),
      parties: cleanParties(draft.parties),
      dates: cleanDates(draft.dates),
    }
    // Only fields that actually changed get marked as edited.
    ;(Object.keys(next) as FieldKey[]).forEach(field => {
      if (JSON.stringify(next[field]) !== JSON.stringify(meta[field])) store.update(doc._id, field, { [field]: next[field] })
    })
    setDraft(null)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F9FF' }}>
      <style>{PROP_CSS}</style>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: TOP_BAR_BG, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <ButtonGhost mode="contrast" leftIcon={iconType.ChevronLeftOutlined} onClick={onBack}>Back</ButtonGhost>
        <Typography weight="bold" color="white">{filename}</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

      <div style={{ flex: 1, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 62%', backgroundColor: colorPalette.white, borderRadius: 8, padding: '32px 40px', minHeight: 640 }}>
          {isLoading
            ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '60%' }} paragraph={{ rows: 16 }} />
            : <GeneratedDocumentBody doc={doc} meta={store.getOriginal(doc)} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ backgroundColor: colorPalette.white, borderRadius: 8, padding: 24 }}>
            {isLoading ? (
              <Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 10 }} />
            ) : draft ? (
              <EditPanel doc={doc} draft={draft} onChange={setDraft} onSave={saveEdit} onCancel={cancelEdit} />
            ) : (
              <ViewPanel doc={doc} space={space} meta={meta} onEdit={startEdit} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ViewPanel({ doc, space, meta, onEdit }: { doc: MetadataDocument; space: Space; meta: ExtractedMetadata; onEdit: () => void }) {
  const nothingFound = !meta.documentType && !meta.matterReference && meta.parties.length === 0 && meta.dates.length === 0

  /** Empty value: says so plainly, with a shortcut into edit mode. */
  const empty = (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
      <NotFound />
      <span onClick={onEdit} style={{ color: colorPalette.blue.base, cursor: 'pointer', fontSize: 14 }}>Add</span>
    </span>
  )
  const withEdited = (field: FieldKey, node: ReactNode) => (
    <div>
      {node}
      {meta.edited[field] && <div style={{ fontSize: 12, color: colorPalette.neutral.darken2, marginTop: 2 }}>Edited by you</div>}
    </div>
  )

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">Document Details</Typography>
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.EditOutlined} onClick={onEdit} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: spacing(4) }}>
        <Icon type={iconType.SparksOutlined} size={16} color="neutral-darken2" />
        <Typography size="base-sm" color="neutral-darken2">Extracted automatically. Check before relying on it.</Typography>
      </div>

      {nothingFound && (
        <div style={{ display: 'flex', gap: spacing(2), padding: spacing(3), marginBottom: spacing(3), borderRadius: 8, backgroundColor: colorPalette.neutral.lighten5, border: `1px solid ${colorPalette.neutral.lighten3}` }}>
          <Icon type={iconType.InfoCircleOutlined} size={16} color="neutral-darken3" />
          <Typography size="base-sm" color="neutral-darken5">We couldn't find any details in this document. Use the edit button to add them yourself.</Typography>
        </div>
      )}

      <PropRow>
        <PropertyItem label={FIELD_LABELS.documentType} value={withEdited('documentType', meta.documentType || empty)} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      <PropRow>
        <PropertyItem label={FIELD_LABELS.matterReference} value={withEdited('matterReference', meta.matterReference || empty)} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      <PropRow>
        <PropertyItem
          label={FIELD_LABELS.parties}
          value={withEdited('parties', meta.parties.length === 0 ? empty : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
              {meta.parties.map(p => (
                <div key={p.id}>
                  <div>{p.name}</div>
                  {p.role && <div style={{ fontSize: 13, color: colorPalette.neutral.darken2 }}>{p.role}</div>}
                </div>
              ))}
            </div>
          ))}
          variant={propertyItemVariants.HORIZONTAL}
          labelProps={PROP_LABEL}
          valueProps={PROP_VALUE}
        />
      </PropRow>
      <PropRow>
        <PropertyItem
          label={FIELD_LABELS.dates}
          value={withEdited('dates', meta.dates.length === 0 ? empty : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
              {sortDates(meta.dates).map(d => {
                const state = deadlineState(d)
                return (
                  <div key={d.id}>
                    <DeadlineLine d={d} />
                    <div style={{ fontSize: 13, color: colorPalette.neutral.darken2 }}>
                      {d.label}
                      {d.isDeadline && state.tone !== 'later' && <span style={{ color: TONE_COLOR[state.tone], fontWeight: 600 }}> · {state.text}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          variant={propertyItemVariants.HORIZONTAL}
          labelProps={PROP_LABEL}
          valueProps={PROP_VALUE}
        />
      </PropRow>

      <div style={{ borderTop: `1px solid ${colorPalette.neutral.lighten3}`, margin: `${spacing(3)}px 0` }} />

      <PropRow>
        <PropertyItem label="Document name" value={stripYear(doc.name)} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      <PropRow>
        <PropertyItem label="Space" value={space.name} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      <PropRow>
        <PropertyItem label="Uploaded" value={formatDate(doc.uploadedDate)} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      <PropRow>
        <PropertyItem label="Format" value={`${doc.fileFormat} · ${doc.fileSize}`} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
    </>
  )
}

function EditPanel({ doc, draft, onChange, onSave, onCancel }: {
  doc: MetadataDocument
  draft: ExtractedMetadata
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
          value={draft.documentType}
          placeholder="e.g. Engagement Letter"
          onChange={e => onChange({ ...draft, documentType: e.target.value })}
        />
        <TextArea
          label={FIELD_LABELS.matterReference}
          name="matterReference"
          value={draft.matterReference}
          placeholder="What is this document about?"
          maxLength={MATTER_MAX}
          hasCounter
          autoSize={{ minRows: 3, maxRows: 8 }}
          onChange={e => onChange({ ...draft, matterReference: e.target.value })}
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

      {meta.matterReference && <p style={p}><strong>Re:</strong> {meta.matterReference}.</p>}

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
            {sortDates(meta.dates).map(d => <li key={d.id}>{d.label}: <strong>{formatLongDate(d.date)}</strong></li>)}
          </ul>
          <p style={p}>Deadlines stated above are binding. Where a deadline falls on a weekend or public holiday, it moves to the next working day.</p>
        </>
      )}

      <div style={h}>Closing remarks</div>
      <p style={p}>Please direct any questions about this document to the responsible contact. Changes to this document are only valid if made in writing.</p>
    </div>
  )
}
