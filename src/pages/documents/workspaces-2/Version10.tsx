import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import MyDocumentsV1 from '../my-documents/Version1'
import ConnectionsPageV10 from './ConnectionsPage'
import {
  Avatar,
  avatarShapeEnum,
  avatarSizeEnum,
  ButtonDanger,
  ButtonGhost,
  buttonShapes,
  buttonSizes,
  ButtonPrimary,
  ButtonSecondary,
  ButtonTertiary,
  buttonVariants,
  Checkbox,
  Chip,
  chipSizes,
  chipStyles,
  chipVariants,
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
  Panel,
  panelPlacements,
  panelSizes,
  PopOver,
  PropertyItem,
  RadioGroup,
  radioGroupDirection,
  propertyItemVariants,
  popOverPlacements,
  popOverTriggers,
  SearchBar,
  searchbarWidth,
  Select,
  Table,
  Tabs,
  TextArea,
  Toggle,
  Toolbar,
  Tooltip,
  tooltipPlacements,
  tooltipSizes,
  Typography,
} from '@goat-ui/goat-ui-core'
import {
  colorPalette,
  computeDocSourceMap,
  connectorLabel,
  formatDate,
  localFileToDoc,
  PAGE_SIZE,
  Skeleton,
  skeletonVariants,
  SpaceFormModal,
  sourceIcon,
  spaceConnectorLabel,
  spacing,
  stripYear,
  useMountLoading,
  useSidebarWidth,
  useWorkspaceState,
  type Connector,
  type DocSource,
  type MetadataDocument,
  type Space,
  type SpaceFormValues,
  INITIAL_SPACES,
  CLIENT_EXAMPLE_SPACE,
  getInitials,
  VisibilityIcon,
} from '../workspaces/shared'
import { BasicUploadModal, CopilotIcon } from '../workspaces/WorkspacesBasic'
import HackathonCoPilotPageV10, { type ChatSession as CoPilotChat } from './CoPilotPage'
import HackathonHomePage from '../hackathon/HomePage'
import { useProcessingUpload } from '../hackathon/uploadToasts'
import PersonalOfficePage from '../hackathon/PersonalOfficePage'
import HrDokumentePage from './HrDokumentePage'
import ZeugnisManagerPage from './ZeugnisManagerPage'
import WorkspacesList from './WorkspacesList'
import { AppGlyph, HR_DOKUMENTE_GLYPH, ZEUGNIS_MANAGER_GLYPH } from './appGlyphs'
import { AppLabel, BOOKMARK_APPS, BookmarksTab, GuardrailsTab, TabEmptyState, TemplatesTab, TEMPLATE_APPS } from '../hackathon/WorkspaceTabs'
import { EMPTY_EXTRAS, SUGGESTED_GUARDRAILS, type Bookmark, type Guardrail, type HaufeDocument, type Template, type WorkspaceChat, type WorkspaceDetail, type WorkspaceExtras, type WorkspaceReference } from '../hackathon/workspaceModel'
import { seedBackground } from '../hackathon/seedWorkspaceContent'
import { agedChats, agedDocs, agedExtras } from './seedAges'
import { WorkspaceReady } from '../hackathon/WorkspaceReady'
import { seedShortSummary, seedSummaryDetail } from '../metadata/summaries'

/**
 * Hackathon Oct '26 — Version 10: a brand-new workspace opens on an animated "workspace is ready" view
 * (WorkspaceReady.tsx) — My knowledge and Haufe knowledge streaming together — until its first content.
 * After that, My knowledge and Haufe knowledge work as in Version 6: rows and Add my content open the area
 * pages (in white containers); no side panels or set-up checklist.
 *
 * Hackathon Oct '26 — Version 8: Version 6 with My knowledge filled in from one side panel (KnowledgePanel.tsx)
 * instead of a page per area: draft context from documents, rule sets for guardrails, paste-a-link
 * bookmarks, a template library picker, and a set-up checklist in the My knowledge card.
 *
 * Hackathon Oct '26 — Version 6: Version 4 populated with Metadata Table's workspaces and documents
 * (Acme Corp, Project Alpha, Internal HR), with all of Version 4's functionality available for them.
 * Version 7 is its German counterpart.
 *
 * Hackathon Oct '26 — Version 4: Version 3 with a lighter header and the summary as two side-by-side
 * knowledge streams.
 * - My knowledge: what you bring — a line on what can be connected, an "Add my content" menu (upload
 *   a document, add a connector via the Connectors page, add instructions via Guardrails), and the
 *   areas as plain rows that open each one — only once something's been added to them.
 * - Haufe knowledge: what's been made with Haufe for this workspace, as a CoPilot container (chats) and
 *   an HR Dokumente container (warning letters, job references, contracts…), each with a count, the
 *   latest few, and a jump into the application. Sample entries for now.
 *
 * Hackathon Oct '26 — Version 3: each workspace opens on a summary page — five tiles for Documents,
 * Context, Guardrails, Bookmarks and Templates — and each tile opens that area on a page of its own,
 * with a back button to the summary. URLs: /workspaces/:slug, /workspaces/:slug/<area>, and document
 * previews under /workspaces/:slug/documents/:docId.
 *
 * Hackathon Oct '26 — Version 1: a copy of Metadata Table (Version 12), the starting point for the hackathon.
 *
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

// Workspaces 2.0 Version 10: Version 9 with the context out of the In this workspace list, shown as Version 4's Profile card above
// the activity on the workspace page.
// Version 9: Version 4 with the workspaces list as a DS table instead of cards — one row per workspace,
// with its type, what's in it, where it's been used and when it was last updated as columns.
const BASE = '/projects/workspaces-2/version-10'
// Every page in Version 2 is white; cards keep their borders to stand apart.
const CONTENT_BG = colorPalette.white

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
  'space-bergmann': {
    matters: [
      'Monthly payroll 2026',
      'Annual accounts 2025',
      'Exemption certificate renewal',
      'Reverse charge review',
      'Wage tax audit 2023–2025',
      'Stadtquartier Ost project',
    ],
    counterparties: [
      { name: 'Finanzamt Stuttgart II', role: 'Tax authority' },
      { name: 'SOKA-BAU', role: 'Social fund' },
      { name: 'Markus Bergmann', role: 'Managing director' },
      { name: 'Kraus Trockenbau GmbH', role: 'Subcontractor' },
      { name: 'BW-Bank', role: 'Lender' },
    ],
    primaryRole: 'Client',
    periods: [
      { start: '2025-01-01', end: '2025-12-31' },
      { start: '2026-09-01', end: '2026-09-30' },
      { start: '2023-01-01', end: '2025-12-31' },
      { start: '2026-07-01', end: '2026-09-30' },
    ],
    deadlineLabels: ['Filing deadline', 'Payment due', 'Certificate expires', 'Response due'],
    actionLabels: ['Filed with tax office', 'Payroll approved', 'Certificate received', 'Signed'],
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
  'space-bergmann': [
    { name: 'Bergmann Tiefbau GmbH', role: 'Subsidiary' },
    { name: 'BG BAU', role: 'Accident insurer' },
    { name: 'AOK Baden-Württemberg', role: 'Health insurer' },
    { name: 'Elektro Haas GmbH', role: 'Subcontractor' },
    { name: 'Stadt Stuttgart', role: 'Building authority' },
    { name: 'Petra Lang', role: 'Head of accounting' },
    { name: 'Deutsche Rentenversicherung', role: 'Pension insurer' },
    { name: 'Wohnbau Neckar AG', role: 'Customer' },
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

export default function Workspaces2Version10() {
  // Starts with Metadata Table's workspaces (Acme Corp, Project Alpha, Internal HR) plus a second client, Bergmann Bau, and their documents,
  // dated so some were updated recently and some a while ago (seedAges.ts).
  const workspace = useWorkspaceState([...INITIAL_SPACES, CLIENT_EXAMPLE_SPACE].map(space => ({ ...space, context: seedBackground('en', space.id) })), 'en', agedDocs)
  const store = useMetadataStore(workspace)
  // The prefilled chats as CoPilot conversations, in their workspaces (CoPilot only reads these once).
  const dayLabel = (days: number) => days === 0 ? 'Today' : days === 1 ? 'Yesterday' : 'Earlier'
  // Context details, guardrails, bookmarks and templates per workspace — kept here so they survive leaving the page.
  // Prefilled My knowledge and Haufe knowledge for Metadata Table's workspaces (seedWorkspaceContent.ts).
  const [extrasBySpace, setExtrasBySpace] = useState<Record<string, WorkspaceExtras>>(() => withMoreActivity(seedProfileDetails(agedExtras())))
  // CoPilot's chats live here, so leaving CoPilot doesn't lose them and a chat can be reopened from a workspace.
  const [copilotSessions, setCopilotSessions] = useState<CoPilotChat[] | null>(null)
  // Workspaces whose "ready" animation has already played.
  const [readySeen, setReadySeen] = useState<Set<string>>(new Set())
  const markReadySeen = (spaceId: string) => setReadySeen(prev => prev.has(spaceId) ? prev : new Set(prev).add(spaceId))
  const extras: ExtrasStore = {
    get: id => extrasBySpace[id] ?? EMPTY_EXTRAS,
    update: (id, patch) => setExtrasBySpace(prev => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_EXTRAS), ...patch } })),
  }
  const prefilledChats: CoPilotChat[] = agedChats().flatMap(chat => {
    const space = workspace.spaces.find(sp => sp.id === chat.spaceId)
    if (!space) return []
    return [{
      id: chat.id, title: chat.title, day: dayLabel(chat.daysAgo), workspace: workspaceReference(space, workspace, extras),
      messages: [
        { id: `${chat.id}-q`, role: 'user' as const, content: chat.question },
        { id: `${chat.id}-a`, role: 'assistant' as const, content: chat.answer },
      ],
    }]
  })

  return (
    <Routes>
      <Route index element={<Navigate to="workspaces" replace />} />
      <Route path="workspaces">
        <Route index element={<SpacesListRoute workspace={workspace} extras={extras} />} />
        <Route path=":workspaceSlug" element={<SpaceDetailRoute workspace={workspace} store={store} extras={extras} area="summary" readySeen={readySeen} markReadySeen={markReadySeen} />} />
        {WORKSPACE_AREAS.map(area => (
          <Route key={area} path={`:workspaceSlug/${area}`} element={<SpaceDetailRoute workspace={workspace} store={store} extras={extras} area={area} readySeen={readySeen} markReadySeen={markReadySeen} />} />
        ))}
        <Route path=":workspaceSlug/activity" element={<SpaceDetailRoute workspace={workspace} store={store} extras={extras} area="activity" readySeen={readySeen} markReadySeen={markReadySeen} />} />
        <Route path=":workspaceSlug/documents/:docId" element={<DocumentPreviewRoute workspace={workspace} store={store} />} />
      </Route>
      <Route path="home" element={<HackathonHomePage copilotPath={`${BASE}/copilot`} />} />
      <Route path="copilot" element={<HackathonCoPilotPageV10
        extraSessions={prefilledChats}
        savedSessions={copilotSessions}
        onSessionsChange={setCopilotSessions}
        background={CONTENT_BG}
        onChatStarted={(workspaceId, chat) => setExtrasBySpace(prev => {
          const current = prev[workspaceId] ?? EMPTY_EXTRAS
          if (current.chats.some(c => c.id === chat.id)) return prev
          return { ...prev, [workspaceId]: { ...current, chats: [{ ...chat, createdAt: Date.now() }, ...current.chats] } }
        })}
        workspaces={workspace.spaces.map(space => workspaceReference(space, workspace, extras))}
        onCreateWorkspace={workspace.createSpace}
        onSaveDocuments={(id, files) => workspace.addDocsToSpace(id, files.map(localFileToDoc))}
      />} />
      <Route path="personal-office" element={<PersonalOfficePage copilotPath={`${BASE}/copilot`} background={CONTENT_BG} />} />
      <Route path="hr-dokumente" element={<HrDokumentePage background={CONTENT_BG} />} />
      <Route path="zeugnis-manager" element={<ZeugnisManagerPage background={CONTENT_BG} />} />
      <Route path="my-documents" element={<MyDocumentsV1 showTitleIcon={false} title="Meine Dokumente" description="Your own documents in one place — ready to use in any workspace or CoPilot chat." />} />
      <Route path="connectors" element={<ConnectionsPageV10 background={CONTENT_BG} />} />
      <Route path="*" element={<Navigate to="workspaces" replace />} />
    </Routes>
  )
}

// The type chip's colour, from the DS chip styles, so Clients, Projects and Internal workspaces tell apart at a glance.
const TYPE_CHIP_STYLES: Record<NonNullable<Space['type']>, (typeof chipStyles)[keyof typeof chipStyles]> = {
  Client: chipStyles.ACCENT_BLUE,
  Project: chipStyles.ACCENT_PURPLE,
  Internal: chipStyles.ACCENT_CYAN,
}

function SpacesListRoute({ workspace, extras }: { workspace: WorkspaceState; extras: ExtrasStore }) {
  const navigate = useNavigate()
  const openSpace = (id: string) => {
    const space = workspace.spaces.find(s => s.id === id)
    navigate(`${BASE}/workspaces/${slugify(space?.name ?? id)}`)
  }
  return (
    <WorkspacesList
      spaces={workspace.spaces}
      getSpaceDocs={workspace.getSpaceDocs}
      // The newest chat or Haufe document made in the workspace.
      getLastUsed={id => { const e = extras.get(id); return Math.max(0, ...e.chats.map(c => c.createdAt), ...e.haufeDocuments.map(d => d.createdAt)) }}
      renderUsedIn={() => null}
      // The table's headings sort instead of the dropdown.
      showSort={false}
      renderList={(spaces, actions) => <WorkspacesTable spaces={spaces} workspace={workspace} extras={extras} {...actions} />}
      onOpenSpace={openSpace}
      // Land in the new workspace straight away.
      onCreateSpace={values => { workspace.createSpace(values); navigate(`${BASE}/workspaces/${slugify(values.name)}`) }}
      onUpdateSpace={workspace.updateSpace}
      onDeleteSpace={workspace.deleteSpace}
      // Only once there's a workspace — the empty state explains workspaces on its own.
      description={workspace.spaces.length > 0 ? 'Everything about a client or project in one place — for accurate, in-context answers.' : undefined}
      renderEmptyState={openCreate => <WorkspacesEmptyState onCreate={openCreate} />}
    />
  )
}

const WORKSPACES_TABLE_CSS = `
  .v9-workspaces thead th { text-transform: none !important; white-space: nowrap; }
  .v9-workspaces tbody tr { cursor: pointer; }
  .v9-workspaces tbody tr:hover .v9-workspace-name { color: ${colorPalette.blue.base}; text-decoration: underline; }
`

/**
 * The workspaces as a DS table, one row each: the workspace (initials, name, access and a line of description),
 * its type chip, what's in it, the apps it's been used in and when it last changed. Clicking a row opens the
 * workspace; the row's DS actions menu edits or deletes it. Name, type, documents and last updated sort from
 * their headings, newest first to start with; the tabs and search above still filter.
 */
function WorkspacesTable({ spaces, workspace, extras, onOpen, onEdit, onDelete }: {
  spaces: Space[]
  workspace: WorkspaceState
  extras: ExtrasStore
  onOpen: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  // Every cell opens the workspace; the DS actions column handles its own clicks.
  const updatedAt = (space: Space) => latestChange(workspace.getSpaceDocs(space.id), extras.get(space.id))?.at ?? 0
  const rowCell = (record: Space) => ({ onClick: () => onOpen(record.id), style: { verticalAlign: 'middle' as const, height: 64 } })
  const columns = [
    {
      title: 'Name',
      key: 'name',
      width: '38%',
      sorter: (a: Space, b: Space) => a.name.localeCompare(b.name),
      onCell: rowCell,
      render: (_: unknown, record: Space) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), minWidth: 0 }}>
          <Avatar shape={avatarShapeEnum.SQUARE} size={avatarSizeEnum.SMALL} src={record.avatarUrl} srcPlaceholder={getInitials(record.name)} />
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span className="v9-workspace-name" style={{ ...cellText, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.name}</span>
              <VisibilityIcon space={record} organisationAccess />
            </div>
            <Typography size="base-sm" color="neutral-darken2" maxLines={1}>{record.description}</Typography>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      width: 112,
      sorter: (a: Space, b: Space) => (a.type ?? '').localeCompare(b.type ?? ''),
      onCell: rowCell,
      render: (_: unknown, record: Space) => record.type
        ? <Chip label={record.type} size={chipSizes.SMALL} chipStyle={TYPE_CHIP_STYLES[record.type]} variant={chipVariants.SUBTLE} uppercase={false} />
        : <Dash />,
    },
    {
      title: 'In this workspace',
      key: 'content',
      // By document count, the biggest part of what's in a workspace.
      sorter: (a: Space, b: Space) => workspace.getSpaceDocs(a.id).length - workspace.getSpaceDocs(b.id).length,
      onCell: rowCell,
      render: (_: unknown, record: Space) => <CardSummary part="content" space={record} docs={workspace.getSpaceDocs(record.id)} extras={extras.get(record.id)} />,
    },
    {
      title: 'Used in',
      key: 'usedIn',
      onCell: rowCell,
      render: (_: unknown, record: Space) => <CardSummary part="apps" space={record} docs={workspace.getSpaceDocs(record.id)} extras={extras.get(record.id)} />,
    },
    {
      title: 'Last updated',
      key: 'updated',
      width: 140,
      sorter: (a: Space, b: Space) => updatedAt(a) - updatedAt(b),
      defaultSortOrder: 'descend' as const,
      onCell: rowCell,
      render: (_: unknown, record: Space) => <LastUpdated bare docs={workspace.getSpaceDocs(record.id)} extras={extras.get(record.id)} />,
    },
  ]
  const iconLabel = (icon: string, label: string, danger = false) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: danger ? colorPalette.danger.darken2 : undefined }}>
      <Icon type={icon as never} size={16} color={danger ? 'danger-darken2' : undefined} />{label}
    </span>
  )
  return (
    <div className="v9-workspaces">
      <style>{WORKSPACES_TABLE_CSS}</style>
      <Table
        dataSource={spaces}
        rowKey="id"
        columns={columns as never}
        pagination={false}
        rowHoverable
        actions={record => [
          { key: 'edit', label: iconLabel(iconType.GearOutlined, 'Edit settings'), props: { onClick: () => onEdit(record.id) } },
          { key: 'delete', label: iconLabel(iconType.TrashOutlined, 'Delete', true), props: { onClick: () => onDelete(record.id) } },
        ]}
      />
    </div>
  )
}

/** First-run state for the Workspaces page: what a workspace is for, and one way in. */
function WorkspacesEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing(8), padding: `${spacing(10)}px 0` }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(4), maxWidth: 480, textAlign: 'center' }}>
        {/* Illustration from the My Documents Figma (node 5116:93493). */}
        <img src="/hackathon/workspace-empty-state.svg" alt="" width={128} height={128} style={{ display: 'block' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <Typography size="heading-sm" weight="bold" color="neutral-darken5" align="center">Create your first workspace</Typography>
          <Typography size="base" color="neutral-darken2" align="center">
            A workspace gives CoPilot the context it needs. Create one for a client, a department, or a project, and everything you ask or do within it stays grounded in the right information.
          </Typography>
        </div>
        <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={onCreate}>Create workspace</ButtonPrimary>
      </div>
    </div>
  )
}

type ExtrasStore = {
  get: (spaceId: string) => WorkspaceExtras
  update: (spaceId: string, patch: Partial<WorkspaceExtras>) => void
}

/** Everything CoPilot is handed about one workspace. */
function workspaceReference(space: Space, workspace: WorkspaceState, extras: ExtrasStore): WorkspaceReference {
  const e = extras.get(space.id)
  return {
    id: space.id,
    name: space.name,
    description: space.description,
    path: `${BASE}/workspaces/${slugify(space.name)}`,
    documentNames: workspace.getSpaceDocs(space.id).slice(0, 12).map(fileName),
    documents: workspace.getSpaceDocs(space.id).length,
    hasBackground: !!space.context?.trim(),
    details: e.details.filter(d => d.label.trim() && d.value.trim()).length,
    guardrails: e.guardrails.filter(g => g.enabled).map(g => g.text),
    bookmarks: e.bookmarks.length,
    templates: e.templates.length,
  }
}

const WORKSPACE_AREAS = ['documents', 'context', 'guardrails', 'bookmarks', 'templates'] as const
type WorkspaceArea = typeof WORKSPACE_AREAS[number]
// 'activity': everything made with Haufe apps in the workspace (the Used in card's View all).
type WorkspacePageArea = 'summary' | 'activity' | WorkspaceArea

const AREA_TITLES: Record<WorkspaceArea, string> = {
  documents: 'Documents', context: 'Context', guardrails: 'Guardrails', bookmarks: 'Bookmarks', templates: 'Templates',
}

function SpaceDetailRoute({ workspace, store, extras, area, readySeen, markReadySeen }: { workspace: WorkspaceState; store: MetadataStore; extras: ExtrasStore; area: WorkspacePageArea; readySeen: Set<string>; markReadySeen: (spaceId: string) => void }) {
  const navigate = useNavigate()
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>()
  const isLoading = useMountLoading()

  const space = workspace.spaces.find(s => slugify(s.name) === workspaceSlug) ?? null
  if (!space) return <Navigate to={`${BASE}/workspaces`} replace />
  // Context is edited in its panel on the summary now; the old Profile page's URL lands there.
  if (area === 'context') return <Navigate to={`${BASE}/workspaces/${workspaceSlug}`} replace />

  // Only the summary loads in; drilling into an area and back should feel instant.
  if (isLoading && area === 'summary') {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton variant={skeletonVariants.TEXT} title paragraph={{ rows: 6 }} />
      </div>
    )
  }

  const summaryPath = `${BASE}/workspaces/${workspaceSlug}`
  return (
    <SpaceDocumentsTable
      readySeen={readySeen.has(space.id)}
      onReadySeen={() => markReadySeen(space.id)}
      area={area}
      onOpenArea={a => navigate(`${summaryPath}/${a}`)}
      onOpenConnectors={() => navigate(`${BASE}/connectors`)}
      onOpenHrDocuments={() => navigate(`${BASE}/hr-dokumente`)}
      onOpenZeugnisManager={() => navigate(`${BASE}/zeugnis-manager`)}
      space={space}
      docs={workspace.getSpaceDocs(space.id)}
      store={store}
      onDocsChange={docs => workspace.setSpaceDocs(space.id, docs)}
      onAddDocs={newDocs => workspace.addDocsToSpace(space.id, newDocs)}
      // From an area, back goes to the workspace's summary; from the summary, to the list.
      onBack={() => navigate(area === 'summary' ? `${BASE}/workspaces` : summaryPath)}
      // Opened from the Documents panel, the preview's back button returns to the panel (see DocumentsPanelReturn).
      onOpenDoc={(doc, fromPanel) => navigate(`${summaryPath}/documents/${encodeURIComponent(doc._id)}`, { state: fromPanel ? { documentsPanel: fromPanel } : undefined })}
      onUpdateSpace={values => {
        workspace.updateSpace(space.id, values)
        // Renaming changes the slug, so follow the space to its new URL.
        if (values.name !== space.name) navigate(`${BASE}/workspaces/${slugify(values.name)}${area === 'summary' ? '' : `/${area}`}`, { replace: true })
      }}
      onDeleteSpace={() => { workspace.deleteSpace(space.id); navigate(`${BASE}/workspaces`) }}
      extras={extras.get(space.id)}
      onExtrasChange={patch => extras.update(space.id, patch)}
      onSaveBackground={text => workspace.updateSpaceContext(space.id, text, 'Profile saved')}
      onAskCopilot={initialQuestion => {
        const workspaceRef = workspaceReference(space, workspace, extras)
        navigate(`${BASE}/copilot`, { state: { workspaceRef, initialQuestion } })
      }}
      onOpenChat={openChatId => navigate(`${BASE}/copilot`, { state: { workspaceRef: workspaceReference(space, workspace, extras), openChatId } })}
      // CoPilot opens in this workspace with the documents attached to the question.
      onSendToCopilot={selected => {
        const sources = computeDocSourceMap(workspace.getSpaceDocs(space.id), space)
        navigate(`${BASE}/copilot`, { state: {
          workspaceRef: workspaceReference(space, workspace, extras),
          attachDocs: selected.map(doc => ({ doc, source: sources.get(doc._id) ?? 'local' })),
        } })
      }}
    />
  )
}

/** A document opened from the In this workspace Documents panel: where to return to (full screen or not). */
type DocumentsPanelReturn = { expanded: boolean }

function DocumentPreviewRoute({ workspace, store }: { workspace: WorkspaceState; store: MetadataStore }) {
  const navigate = useNavigate()
  const { workspaceSlug, docId } = useParams<{ workspaceSlug: string; docId: string }>()
  const fromPanel = (useLocation().state as { documentsPanel?: DocumentsPanelReturn } | null)?.documentsPanel
  const space = workspace.spaces.find(s => slugify(s.name) === workspaceSlug) ?? null
  const docs = space ? workspace.getSpaceDocs(space.id) : []
  const doc = docs.find(d => d._id === docId) ?? null

  if (!space) return <Navigate to={`${BASE}/workspaces`} replace />
  if (!doc) return <Navigate to={`${BASE}/workspaces/${workspaceSlug}/documents`} replace />

  const index = docs.indexOf(doc)
  const source = computeDocSourceMap(docs, space).get(doc._id) ?? 'local'
  const back = () => fromPanel
    ? navigate(`${BASE}/workspaces/${workspaceSlug}`, { state: { documentsPanel: fromPanel } })
    : navigate(`${BASE}/workspaces/${workspaceSlug}/documents`)

  return (
    <DocumentPreview
      key={doc._id}
      space={space}
      doc={doc}
      store={store}
      source={source}
      docIndex={index}
      onBack={back}
      onDelete={() => {
        workspace.setSpaceDocs(space.id, docs.filter(d => d._id !== doc._id))
        back()
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
  /* The selection toolbar's buttons sit 8px apart (the DS spaces them 16px); clear (×) keeps its 16px. */
  .v9-selection-toolbar > div > div { gap: 8px; }
  .v9-selection-toolbar > div > div:first-child > :first-child { margin-right: 8px; }
`

// ─── Documents table ──────────────────────────────────────────────────────────

/**
 * A workspace page: the summary (full header and one tile per area), or one area on its own
 * with a back button to the summary.
 */
function SpaceDocumentsTable({ readySeen, onReadySeen, area, onOpenArea, onOpenHrDocuments, onOpenZeugnisManager, space, docs, store, onDocsChange, onAddDocs, onBack, onOpenDoc, onUpdateSpace, onDeleteSpace, extras, onExtrasChange, onSaveBackground, onAskCopilot, onOpenChat, onSendToCopilot }: {
  // Whether this workspace's ready view has played before.
  readySeen: boolean
  onReadySeen: () => void
  area: WorkspacePageArea
  onOpenArea: (area: WorkspaceArea | 'activity') => void
  onOpenConnectors: () => void
  // HR Dokumente has no page of its own here, so this opens Personal Office, where documents are generated.
  onOpenHrDocuments: () => void
  // Haufe Zeugnis Manager, where the workspace's job references open.
  onOpenZeugnisManager: () => void
  space: Space
  docs: MetadataDocument[]
  store: MetadataStore
  onDocsChange: (docs: MetadataDocument[]) => void
  // Adds to whatever the workspace holds at the time — uploads land a moment after they start.
  onAddDocs: (docs: MetadataDocument[]) => void
  onBack: () => void
  onOpenDoc: (doc: MetadataDocument, fromPanel?: DocumentsPanelReturn) => void
  onSendToCopilot: (docs: MetadataDocument[]) => void
  onUpdateSpace: (values: SpaceFormValues) => void
  onDeleteSpace: () => void
  extras: WorkspaceExtras
  onExtrasChange: (patch: Partial<WorkspaceExtras>) => void
  onSaveBackground: (text: string) => void
  // Opens CoPilot with the whole workspace referenced, optionally with a first question.
  onAskCopilot: (initialQuestion?: string) => void
  // Opens CoPilot on one of this workspace's existing chats.
  onOpenChat: (chatId: string) => void
}) {
  // "Add my content" — in the My knowledge card, and on the workspace-ready view of a new workspace.
  // The Used in page's search — in the page title row, filtering the list below.
  const [activitySearch, setActivitySearch] = useState('')
  // The Profile modal (Edit on the Profile card, or "Add context").
  // The In this workspace area open in the side panel; kept while it closes so the panel doesn't empty mid-slide.
  // Back from a document opened in the Documents panel, the panel is open again, as it was (full screen or not).
  const location = useLocation()
  const navigate = useNavigate()
  const returnTo = (location.state as { documentsPanel?: DocumentsPanelReturn } | null)?.documentsPanel
  const [panelArea, setPanelArea] = useState<WorkspaceArea | null>(returnTo ? 'documents' : null)
  const [panelOpen, setPanelOpen] = useState(!!returnTo)
  // Full screen or side panel; the user switches with the button in the panel's header.
  const [panelExpanded, setPanelExpanded] = useState(returnTo?.expanded ?? false)
  // Only once: a reload or a later visit opens the summary as usual.
  useEffect(() => { if (returnTo) navigate(location.pathname, { replace: true, state: null }) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Bumped on every open, so the area's panel starts afresh (and, from Add context, straight in edit mode).
  const [panelSession, setPanelSession] = useState(0)
  const [panelStartsEditing, setPanelStartsEditing] = useState(false)
  const openPanel = (a: WorkspaceArea, editing = false) => {
    // Search and filters start afresh with each opening.
    setDocFilters({}); setDocSort('date-desc'); setSearch(''); setCurrentPage(1)
    setPanelArea(a); setPanelExpanded(false); setPanelStartsEditing(editing); setPanelSession(n => n + 1); setPanelOpen(true)
  }
  // Documents opened from the panel remember it, so the preview's back button comes back here.
  const openDoc = (doc: MetadataDocument) => onOpenDoc(doc, panelOpen && panelArea === 'documents' ? { expanded: panelExpanded } : undefined)
  // The table's selection belongs to the panel while it's open, so it goes when the panel closes.
  const closePanel = () => { setPanelOpen(false); setSelectedKeys(new Set()); setDocFilters({}); setSearch('') }
  const addContentMenu = (trigger: ReactNode) => (
        <Dropdown
          items={[
            // Guardrails, bookmarks and templates open in their panel, already editing with a new one to fill in.
            { key: 'upload', label: <MenuLabel icon={iconType.UploadOutlined}>Upload document</MenuLabel>, onClick: () => setUploadOpen(true) },
            { key: 'guardrail', label: <MenuLabel icon={iconType.ShieldCheckOutlined}>Add a guardrail</MenuLabel>, onClick: () => openPanel('guardrails', true) },
            { key: 'bookmark', label: <MenuLabel icon={iconType.BookmarkOutlined}>Add a bookmark</MenuLabel>, onClick: () => openPanel('bookmarks', true) },
            { key: 'template', label: <MenuLabel icon={iconType.ArticleOutlined}>Add a template</MenuLabel>, onClick: () => openPanel('templates', true) },
          ]}
          trigger={dropdownTriggers.CLICK}
          placement={dropdownPlacement.BOTTOM_RIGHT}
        >
          {trigger}
        </Dropdown>
  )
  const addContentButton = addContentMenu(<ButtonPrimary leftIcon={iconType.PlusOutlined}>Add my content</ButtonPrimary>)
  // A workspace with nothing in it yet opens on the animated "ready" view instead of the two cards.
  const isEmptyWorkspace = docs.length === 0 && !space.context?.trim() && extras.details.length === 0 && extras.guardrails.length === 0
    && extras.bookmarks.length === 0 && extras.templates.length === 0 && extras.chats.length === 0 && extras.haufeDocuments.length === 0
  // It plays in full on the first visit only; afterwards it shows the finished picture.
  const [playReady] = useState(() => !readySeen)
  useEffect(() => {
    if (area === 'summary' && isEmptyWorkspace && !readySeen) onReadySeen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const runUpload = useProcessingUpload('en')
  const sidebarWidth = useSidebarWidth()

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  // Filter/Sort in the Documents panel; the full-screen table sorts by its column headings instead.
  const [docFilters, setDocFilters] = useState<FilterValues>({})
  const [docSort, setDocSort] = useState<DocSort>('date-desc')
  const [docFilterOpen, setDocFilterOpen] = useState(false)
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

  // The filters follow the details the list shows — in the panel's cards and the full-screen table alike —
  // each reading a document's values the same way they're displayed.
  const docFilterFields: DocFilterField[] = [
    { key: 'type', label: FIELD_LABELS.documentType, values: d => [store.get(d).documentType].filter(Boolean) },
    { key: 'updated', label: 'Updated', values: d => updatedRanges(d.uploadedDate), order: UPDATED_RANGES },
    { key: 'source', label: 'Source', values: d => { const src = sourceMap.get(d._id) ?? 'local'; return [src === 'local' ? 'Uploaded' : connectorLabel(src)] } },
    { key: 'matter', label: FIELD_LABELS.matterReference, values: d => [store.get(d).matterReference].filter(Boolean) },
    { key: 'parties', label: FIELD_LABELS.parties, values: d => store.get(d).parties.map(p => p.name), byCount: true },
    { key: 'dates', label: FIELD_LABELS.dates, values: d => [...new Set(tableDates(store.get(d).dates).map(x => x.label))], byCount: true },
    { key: 'format', label: 'File type', values: d => [d.fileFormat] },
  ]
  const docFilterGroups: FilterGroup[] = docFilterFields.map(f => ({ key: f.key, label: f.label, options: filterOptions(docs, f) }))
  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase()
    // A document stays when, in every group with something picked, one of its values is picked.
    const matching = docs.filter(d => docFilterFields.every(f => !docFilters[f.key]?.length || f.values(d).some(v => docFilters[f.key].includes(v))))
    if (!q) return matching
    return matching.filter(d => {
      const m = store.get(d)
      return d.name.toLowerCase().includes(q) || m.documentType.toLowerCase().includes(q) ||
        m.matterReference.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q) || m.parties.some(p => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)) ||
        m.dates.some(x => x.label.toLowerCase().includes(q))
    })
  }, [docs, search, store, docFilters]) // eslint-disable-line react-hooks/exhaustive-deps
  // The panel's list, in the Filter/Sort order.
  const sortedDocs = [...filteredDocs].sort((a, b) =>
    docSort === 'name-asc' ? stripYear(a.name).localeCompare(stripYear(b.name))
      : docSort === 'name-desc' ? stripYear(b.name).localeCompare(stripYear(a.name))
        : docSort === 'date-asc' ? a.uploadedDate.localeCompare(b.uploadedDate) : b.uploadedDate.localeCompare(a.uploadedDate))
  const docFilterButton = (
    <ButtonSecondary leftIcon={iconType.FilterOutlined} onClick={() => setDocFilterOpen(true)}>{panelExpanded ? 'Filter' : 'Filter/Sort'}</ButtonSecondary>
  )
  const docActiveFilters = (
    <ActiveFilters
      values={docFilters}
      onChange={next => { setDocFilters(next); setCurrentPage(1) }}
    />
  )

  const pagedDocs = filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const allSelected = filteredDocs.length > 0 && filteredDocs.every(d => selectedKeys.has(d._id))
  const someSelected = filteredDocs.some(d => selectedKeys.has(d._id))
  const selectedDocs = docs.filter(d => selectedKeys.has(d._id))
  const allSelectedAreManualUpload = selectedDocs.length > 0 && selectedDocs.every(d => (sourceMap.get(d._id) ?? 'local') === 'local')
  // What can be done with the selected documents — the same on the Documents page and in the panel, either size.
  const selectionToolbar = (
    <Toolbar
      visible
      leftItems={[
        <ButtonGhost key="clear" shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} ariaLabel="Clear selection" onClick={() => setSelectedKeys(new Set())} />,
        // The CoPilot mark isn't a DS icon, so it sits in the label.
        <ButtonTertiary key="copilot" onClick={() => onSendToCopilot(selectedDocs)}><SendToCopilotLabel count={selectedKeys.size} /></ButtonTertiary>,
        ...(allSelectedAreManualUpload ? [<ButtonTertiary key="download" leftIcon={iconType.DownloadOutlined} onClick={() => {}}>Download ({selectedKeys.size})</ButtonTertiary>] : []),
      ]}
      rightItems={[<ButtonDanger key="delete" leftIcon={iconType.TrashOutlined} onClick={() => setPendingDelete(selectedKeys)}>Delete</ButtonDanger>]}
    />
  )

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
            <div style={{ ...wrap, fontWeight: 500 }}><span className="v12-doc-link" onClick={() => openDoc(record)}>{fileName(record)}</span></div>
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
              { key: 'open', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.ArticleOutlined} size={16} />Open preview</span>, onClick: () => openDoc(record) },
              { key: 'copilot', label: <SendToCopilotLabel />, onClick: () => onSendToCopilot([record]) },
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

  // The documents table, on the Documents page and in the In this workspace panel at full screen.
  const documentsTable = (
    <>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: spacing(4) }}>
        <Typography size="base" color="neutral-darken2">{filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}</Typography>
        <div style={{ flex: 1 }} />
        <div style={{ width: 320 }}>
          <SearchBar placeholder="Search documents" value={search} onChange={v => { setSearch(v); setCurrentPage(1) }} width={searchbarWidth.EXPANDED} />
        </div>
        {panelOpen && docFilterButton}
        <ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={() => setUploadOpen(true)}>Upload or sync</ButtonPrimary>
      </div>
      {panelOpen && <div style={{ flexShrink: 0, marginTop: -spacing(2) }}>{docActiveFilters}</div>}

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
    </>
  )

  return (
    <div style={{ padding: `${spacing(6)}px ${spacing(10)}px`, display: 'flex', flexDirection: 'column', gap: spacing(6), backgroundColor: CONTENT_BG, height: '100%', overflow: 'hidden' }}>
      <style>{TABLE_CSS}</style>
      {area === 'summary' ? (
        <WorkspaceHero space={space} onBack={onBack} onAskCopilot={() => onAskCopilot()}
          actions={!isEmptyWorkspace && addContentMenu(<ButtonSecondary leftIcon={iconType.PlusOutlined} rightIcon={iconType.ChevronDownOutlined}>Add content</ButtonSecondary>)} />
      ) : (
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          {/* Back to the workspace's summary, named so it's clear where it goes. */}
          <div style={{ marginLeft: -spacing(2) }}>
            <ButtonGhost leftIcon={iconType.ChevronLeftOutlined} onClick={onBack}>{space.name}</ButtonGhost>
          </div>
          {/* Used in (all activity) is a centred column; its title (with the search on the right) lines up with it, the back link stays on the left. */}
          {area === 'activity' ? (
            <div style={{ ...ACTIVITY_COLUMN, display: 'flex', alignItems: 'center', gap: spacing(4) }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Typography size="heading-lg" weight="bold">Used in</Typography>
              </div>
              <div style={{ width: 260, flexShrink: 0 }}>
                <SearchBar placeholder="Search activity" value={activitySearch} onChange={setActivitySearch} width={searchbarWidth.EXPANDED} />
              </div>
            </div>
          ) : (
            <Typography size="heading-lg" weight="bold">{AREA_TITLES[area]}</Typography>
          )}
        </div>
      )}

      {area === 'summary' ? (
        // Padding so the tiles' hover shadow isn't clipped by the scroll area.
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: spacing(1), margin: -spacing(1) }}>
          {isEmptyWorkspace ? (
            <WorkspaceReady
              lang="en"
              animate={playReady}
              actions={<>
                {addContentButton}
                {/* Placeholder for now — no destination yet. */}
                <ButtonTertiary leftIcon={iconType.CompassOutlined}>Explore Haufe content</ButtonTertiary>
              </>}
            />
          ) : (
          /* Inspired by the Workspaces 2.0 Figma (6:544): the workspace's profile (Version 4's card), then everything that
             happened in it, on the left; what's in it and where its documents come from on the right. */
          <div style={{ display: 'flex', gap: spacing(5), alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
            <div style={{ display: 'flex' }}>
              <ProfileCard
                space={space}
                extras={extras}
                onSave={(background, details) => { onExtrasChange({ details }); onSaveBackground(background) }}
              />
            </div>
            <ActivityFeed
              space={space}
              docs={docs}
              chats={extras.chats}
              documents={extras.haufeDocuments}
              onOpenDocuments={() => onOpenArea('documents')}
              onOpenChat={onOpenChat}
              onOpenHrDocuments={onOpenHrDocuments}
              onOpenZeugnisManager={onOpenZeugnisManager}
            />
            </div>
            <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
              <DossierCard title="In this workspace" gap={spacing(2)}>
                <WorkspaceContents space={space} docs={docs} extras={extras} onOpen={openPanel} />
              </DossierCard>
              <DossierCard title="Connected sources" gap={spacing(2)}>
                <ConnectedSources space={space} />
              </DossierCard>
            </div>
          </div>
          )}
        </div>
      ) : area === 'activity' ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div style={ACTIVITY_COLUMN}>
            <AllActivity search={activitySearch} chats={extras.chats} documents={extras.haufeDocuments} onOpenChat={onOpenChat} onOpenHrDocuments={onOpenHrDocuments} onOpenZeugnisManager={onOpenZeugnisManager} />
          </div>
        </div>
      ) : area === 'documents' ? (
        docs.length === 0 ? (
          <TabEmptyState
            icon={<Icon type={iconType.UploadOutlined} size={24} color="blue-base" />}
            title="No documents yet"
            text="Upload files from your computer or sync them from SharePoint, OneDrive or DATEV. CoPilot answers from everything in here."
            action={<ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={() => setUploadOpen(true)}>Upload or sync</ButtonPrimary>}
          />
        ) : (
          documentsTable
        )
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {/* Each knowledge type sits in a white container on the tinted page, as in Version 6. */}
          <div style={{ backgroundColor: colorPalette.white, border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 12, padding: spacing(6) }}>
          {area === 'guardrails' && <GuardrailsTab guardrails={extras.guardrails} onChange={guardrails => onExtrasChange({ guardrails })} />}
          {area === 'bookmarks' && <BookmarksTab bookmarks={extras.bookmarks} onChange={bookmarks => onExtrasChange({ bookmarks })} />}
          {area === 'templates' && (
            <TemplatesTab
              templates={extras.templates}
              onChange={templates => onExtrasChange({ templates })}
              onUse={t => onAskCopilot(`Fill in the template "${t.name}" (${t.app}) for this workspace.`)}
            />
          )}
          </div>
        </div>
      )}

      {selectedKeys.size > 0 && !panelOpen && (
        <div className="v9-selection-toolbar" style={{ position: 'fixed', bottom: spacing(2), left: sidebarWidth + spacing(2), right: spacing(2), zIndex: 500 }}>{selectionToolbar}</div>
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
        noun="Workspace"
        showPhotoUpload={false}
        showType={false}
        organisationAccess
        accessRadios
        initialValues={space}
        onClose={() => setEditSpaceOpen(false)}
        onSubmit={values => { onUpdateSpace(values); setEditSpaceOpen(false) }}
      />

      <Panel
        visible={panelOpen}
        onClose={closePanel}
        placement={panelPlacements.RIGHT}
        size={panelExpanded ? panelSizes.FULL_SIZE : panelSizes.MEDIUM}
        title={panelArea && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              <Icon type={AREA_ICONS[panelArea] as never} size={20} color="neutral-darken5" />
              <span style={{ fontSize: 20, fontWeight: 600, color: colorPalette.neutral.darken5 }}>{AREA_TITLES[panelArea]}</span>
            </div>
            {/* Only the documents switch to full screen — as the documents table. */}
            {panelArea === 'documents' && (
              <Tooltip title={panelExpanded ? 'Collapse to panel' : 'Expand to full screen'}>
                <ButtonGhost
                  shape={buttonShapes.SQUARE}
                  leftIcon={panelExpanded ? iconType.ArrowsCompressOutlined : iconType.ArrowsExpandOutlined}
                  ariaLabel={panelExpanded ? 'Collapse to panel' : 'Expand to full screen'}
                  onClick={() => setPanelExpanded(e => !e)}
                />
              </Tooltip>
            )}
          </div>
        )}
      >
        {/* Full screen, the documents show as the table; in the panel, as cards. */}
        {panelArea === 'documents' && panelExpanded && docs.length > 0 && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
            {documentsTable}
            {selectedKeys.size > 0 && <div className="v9-selection-toolbar" style={PANEL_TOOLBAR}>{selectionToolbar}</div>}
          </div>
        )}
        {panelArea === 'documents' && (!panelExpanded || docs.length === 0) && (
          <DocumentsPanelBody
            space={space}
            docs={sortedDocs}
            total={docs.length}
            sourceMap={sourceMap}
            search={search}
            onSearch={v => setSearch(v)}
            filterButton={docFilterButton}
            activeFilters={docActiveFilters}
            getMeta={store.get}
            selectedIds={selectedKeys}
            onSelectedIdsChange={setSelectedKeys}
            toolbar={selectedKeys.size > 0 ? selectionToolbar : null}
            onOpenDoc={openDoc}
            onSendToCopilot={doc => onSendToCopilot([doc])}
            onUpload={() => setUploadOpen(true)}
            onDelete={ids => setPendingDelete(new Set(ids))}
          />
        )}
        {panelArea === 'context' && (
          <ContextPanelBody
            key={panelSession}
            startEditing={panelStartsEditing}
            space={space}
            extras={extras}
            onSave={(background, details) => { onExtrasChange({ details }); onSaveBackground(background) }}
          />
        )}
        {panelArea === 'guardrails' && <GuardrailsPanelBody key={panelSession} startAdding={panelStartsEditing} guardrails={extras.guardrails} onSave={guardrails => onExtrasChange({ guardrails })} />}
        {panelArea === 'bookmarks' && <BookmarksPanelBody key={panelSession} startAdding={panelStartsEditing} bookmarks={extras.bookmarks} onSave={bookmarks => onExtrasChange({ bookmarks })} />}
        {panelArea === 'templates' && (
          <TemplatesPanelBody
            key={panelSession}
            startAdding={panelStartsEditing}
            templates={extras.templates}
            onSave={templates => onExtrasChange({ templates })}
            onUse={t => onAskCopilot(`Fill in the template "${t.name}" (${t.app}) for this workspace.`)}
          />
        )}
      </Panel>

      <FilterSortPanel
        visible={docFilterOpen}
        title={panelExpanded ? 'Filter' : 'Filter/Sort'}
        // Full screen, the table's column headings sort.
        sortOptions={panelExpanded ? undefined : DOC_SORT_OPTIONS}
        sort={docSort}
        groups={docFilterGroups}
        values={docFilters}
        onClose={() => setDocFilterOpen(false)}
        onApply={(sort, values) => { setDocSort(sort as DocSort); setDocFilters(values); setCurrentPage(1); setDocFilterOpen(false) }}
      />
      <Modal
        visible={deleteSpaceOpen}
        variant={modalVariants.DANGER}
        title="Delete Workspace"
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
        // New workspaces have no connected apps yet, so offer the ones Acme Corp has in Metadata Table.
        connectors={presentConnectors.length > 0 ? presentConnectors : PRESET_CONNECTORS}
        uploadImmediately
        onClose={() => setUploadOpen(false)}
        // Bulk Edit V3's processing toasts; the documents appear once "extraction" is done.
        onUpload={newDocs => runUpload(newDocs.map(d => d.name), () => onAddDocs(newDocs))}
      />
    </div>
  )
}

// ─── Workspace summary ────────────────────────────────────────────────────────

// Kept calm on purpose: neutral greys throughout, with the app's blue only for actions and focus.
const AREA_ICONS: Record<WorkspaceArea, string> = {
  documents: iconType.FolderOutlined,
  context: iconType.InfoCircleOutlined,
  guardrails: iconType.ShieldCheckOutlined,
  bookmarks: iconType.BookmarkOutlined,
  templates: iconType.ArticleOutlined,
}

const pluralise = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** Summary header: back to Workspaces, the workspace's name, type chip (as on its list card) and description, and Ask CoPilot. */
function WorkspaceHero({ space, onBack, onAskCopilot, actions }: {
  space: Space
  onBack: () => void
  onAskCopilot: () => void
  // Beside Ask CoPilot (Add content).
  actions?: ReactNode
}) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <div style={{ marginLeft: -spacing(3) }}>
        <ButtonGhost leftIcon={iconType.ChevronLeftOutlined} onClick={onBack}>Workspaces</ButtonGhost>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(4) }}>
        <Avatar shape={avatarShapeEnum.SQUARE} size={avatarSizeEnum.MEDIUM} src={space.avatarUrl} srcPlaceholder={getInitials(space.name)} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), minWidth: 0 }}>
            <Typography size="heading-xl" weight="bold" color="neutral-darken5">{space.name}</Typography>
            {space.type && <Chip label={space.type} chipStyle={TYPE_CHIP_STYLES[space.type]} variant={chipVariants.SUBTLE} uppercase={false} />}
          </div>
          {space.description && <Typography size="base" color="neutral-darken3">{space.description}</Typography>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
          {actions}
          {/* The button's icon slot only takes DS icons, so the CoPilot mark sits in the label; it takes the label's colour. */}
          <ButtonPrimary onClick={onAskCopilot}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />Ask CoPilot</span>
          </ButtonPrimary>
        </div>
      </div>
    </div>
  )
}

/** A white card on the summary: a title with an optional action on the right, then its content. */
function DossierCard({ title, action, gap = spacing(4), children }: { title: string; action?: ReactNode; gap?: number; children: ReactNode }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap, padding: spacing(6),
      borderRadius: 12, border: `1px solid ${colorPalette.neutral.lighten2}`, backgroundColor: colorPalette.white,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), minHeight: 32 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography size="heading-sm" weight="semibold" color="neutral-darken5">{title}</Typography>
        </div>
        {action && <div style={{ marginRight: -spacing(3) }}>{action}</div>}
      </div>
      {children}
    </div>
  )
}

let profileDetailCounter = 0
const newDetailId = () => { profileDetailCounter += 1; return `detail-${Date.now()}-${profileDetailCounter}` }


/** A fact about the client. */
type ProfileFact = { label: string; value: string }

// What CoPilot has read from a workspace's documents. They seed the workspace's details (see
// seedProfileDetails), so the Profile card shows — and its modal edits — the same list.
const PROFILE_FACTS: Record<string, ProfileFact[]> = {
  'space-acme': [
    { label: 'Legal form', value: 'GmbH' },
    { label: 'Tax number', value: '143/226/50417' },
    { label: 'VAT ID', value: 'DE 287 341 905' },
    { label: 'Fiscal year', value: 'Calendar year' },
    { label: 'Employees', value: '240' },
    { label: 'Locations', value: 'Munich · Vienna' },
    { label: 'Industry', value: 'Electronics wholesale' },
    { label: 'Main contact', value: 'Jana Weber, CFO' },
  ],
  'space-bergmann': [
    { label: 'Legal form', value: 'GmbH' },
    { label: 'Tax number', value: '99/052/31877' },
    { label: 'VAT ID', value: 'DE 311 908 442' },
    { label: 'Fiscal year', value: 'Calendar year' },
    { label: 'Employees', value: '180' },
    { label: 'Locations', value: 'Stuttgart · Esslingen' },
    { label: 'Industry', value: 'Construction' },
    { label: 'Main contact', value: 'Markus Bergmann, MD' },
  ],
}

// More made-up Haufe documents for Acme, so its Used in card has more than three per app to preview
// and the Used in page has a longer history to show.
const MORE_ACTIVITY: Record<string, HaufeDocument[]> = {
  'space-acme': [
    { id: 'acme-h3', app: 'hr-dokumente', kind: 'letter', title: 'Confirmation of employment — M. Becker (Acme payroll)', createdAt: Date.now() - 1 * DAY_MS },
    { id: 'acme-h4', app: 'hr-dokumente', kind: 'contract', title: 'Amendment to working hours — part-time bookkeeper', createdAt: Date.now() - 5 * DAY_MS },
    { id: 'acme-h5', app: 'hr-dokumente', kind: 'warning', title: 'Warning letter — missed payroll deadline', createdAt: Date.now() - 12 * DAY_MS },
    { id: 'acme-h6', app: 'hr-dokumente', kind: 'letter', title: 'Information letter — new travel expense policy', createdAt: Date.now() - 34 * DAY_MS },
    { id: 'acme-h7', app: 'zeugnismanager', kind: 'reference', title: 'Final reference — T. Krüger (tax assistant)', createdAt: Date.now() - 6 * DAY_MS },
    { id: 'acme-h8', app: 'zeugnismanager', kind: 'reference', title: 'Interim reference — L. Fischer (audit senior)', createdAt: Date.now() - 21 * DAY_MS },
    { id: 'acme-h9', app: 'zeugnismanager', kind: 'reference', title: 'Final reference — J. Braun (working student)', createdAt: Date.now() - 48 * DAY_MS },
  ],
}

function withMoreActivity(extrasBySpace: Record<string, WorkspaceExtras>): Record<string, WorkspaceExtras> {
  return Object.fromEntries(Object.entries(extrasBySpace).map(([spaceId, extras]) =>
    [spaceId, { ...extras, haufeDocuments: [...extras.haufeDocuments, ...(MORE_ACTIVITY[spaceId] ?? [])] }]))
}

/** The seeded extras, with each workspace's profile facts (where it has some) as its details. */
function seedProfileDetails(extrasBySpace: Record<string, WorkspaceExtras>): Record<string, WorkspaceExtras> {
  return Object.fromEntries(Object.entries(extrasBySpace).map(([spaceId, extras]) => {
    const facts = PROFILE_FACTS[spaceId]
    return [spaceId, facts ? { ...extras, details: facts.map((f, i) => ({ id: `${spaceId}-fact-${i + 1}`, ...f })) } : extras]
  }))
}


const PRESET_CONNECTORS: Connector[] = [
  { id: 'preset-sharepoint', type: 'sharepoint', label: 'SharePoint' },
  { id: 'preset-google-drive', type: 'google-drive', label: 'Google Drive' },
]

const NONE_YET = 'None yet'



function KnowledgeRow({ area, status, first, onClick, extra }: { area: WorkspaceArea; status: string; first: boolean; onClick: () => void; extra?: ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(3)}px ${spacing(2)}px`, cursor: 'pointer',
        borderTop: first ? undefined : `1px solid ${colorPalette.neutral.lighten3}`,
        backgroundColor: hovered ? colorPalette.neutral.lighten5 : undefined,
      }}
    >
      <Icon type={AREA_ICONS[area] as never} size={20} color="neutral-darken3" />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken5 }}>{AREA_TITLES[area]}</span>
      {extra}
      <span style={{ fontSize: 14, color: colorPalette.neutral.darken3 }}>{status}</span>
      <Icon type={iconType.ChevronRightOutlined} size={16} color={hovered ? 'blue-base' : 'neutral-darken2'} />
    </div>
  )
}

/** One knowledge stream: an icon, title and line about it, an optional action, then its content. */
/** Empty state inside a knowledge card: a dashed box with a headline and one line, centred. */
function formatCreated(ts: number) {
  const d = new Date(ts)
  return d.toDateString() === new Date().toDateString() ? 'Today' : formatDate(d.toISOString())
}

function DashedEmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing(1), padding: spacing(6), borderRadius: 8, border: `1px dashed ${colorPalette.neutral.lighten1}` }}>
      <Typography size="base" weight="semibold" color="neutral-darken5" align="center">{title}</Typography>
      <Typography size="base-sm" color="neutral-darken2" align="center">{text}</Typography>
    </div>
  )
}

/**
 * The card footer in Version 4: what's in the workspace as [icon][count] pairs, using the same icons
 * as the workspace page — documents, guardrails and bookmarks, then the Haufe apps it's been used in.
 * Everything is one neutral grey; the apps' marks drop their pink tiles to match. A pair only shows
 * once there's something to count, and hovering one says what it is.
 */
// `part` shows only the content or only the apps, for the table's separate columns.
function CardSummary({ space, docs, extras, part }: { space: Space; docs: MetadataDocument[]; extras: WorkspaceExtras; part?: 'content' | 'apps' }) {
  const bySource = new Map<DocSource, number>()
  computeDocSourceMap(docs, space).forEach(source => bySource.set(source, (bySource.get(source) ?? 0) + 1))
  // Connected apps first, uploads last.
  const sources = [...new Set<DocSource>([...space.connectors.map(c => c.type), 'local'])]
    .filter(source => bySource.has(source))
    .map(source => `${bySource.get(source)} ${source === 'local' ? 'uploaded' : `from ${connectorLabel(source)}`}`)
  const activeGuardrails = extras.guardrails.filter(g => g.enabled).length
  const references = extras.haufeDocuments.filter(doc => doc.app === 'zeugnismanager').length
  const hrDocuments = extras.haufeDocuments.filter(doc => doc.app === 'hr-dokumente').length
  const areaIcon = (area: WorkspaceArea) => <Icon type={AREA_ICONS[area] as never} size={16} color="neutral-darken3" />

  type Stat = { key: string; icon: ReactNode; count: number; title: string; description: string }
  const content: Stat[] = [
    { key: 'documents', icon: areaIcon('documents'), count: docs.length, title: pluralise(docs.length, 'document'), description: sources.join(' · ') },
    { key: 'guardrails', icon: areaIcon('guardrails'), count: extras.guardrails.length, title: pluralise(extras.guardrails.length, 'guardrail'), description: `${activeGuardrails} active` },
    { key: 'bookmarks', icon: areaIcon('bookmarks'), count: extras.bookmarks.length, title: pluralise(extras.bookmarks.length, 'bookmark'), description: 'Saved in this workspace' },
  ]
  const apps: Stat[] = [
    { key: 'copilot', icon: <CopilotIcon />, count: extras.chats.length, title: 'CoPilot', description: `${pluralise(extras.chats.length, 'chat')} in this workspace` },
    { key: 'zeugnis', icon: <AppGlyph d={ZEUGNIS_MANAGER_GLYPH} />, count: references, title: 'Haufe Zeugnis Manager', description: `${pluralise(references, 'reference')} in this workspace` },
    { key: 'hr', icon: <AppGlyph d={HR_DOKUMENTE_GLYPH} />, count: hrDocuments, title: 'HR Dokumente', description: `${pluralise(hrDocuments, 'document')} in this workspace` },
  ]
  const groups = (part === 'content' ? [content] : part === 'apps' ? [apps] : [content, apps]).map(group => group.filter(stat => stat.count > 0)).filter(group => group.length > 0)
  if (groups.length === 0) return <span style={{ fontSize: 13, color: colorPalette.neutral.darken2 }}>{part === 'apps' ? 'Not used yet' : 'Nothing added yet'}</span>

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), color: colorPalette.neutral.darken3 }}>
      {groups.map((group, i) => (
        <Fragment key={i}>
          {/* Content on the left, the apps it's been used in on the right of a thin divider. */}
          {i > 0 && <span aria-hidden style={{ width: 1, height: 16, backgroundColor: colorPalette.neutral.lighten2 }} />}
          {group.map(stat => (
            <Tooltip key={stat.key} title={stat.title} description={stat.description} size={tooltipSizes.LARGE} placement={tooltipPlacements.TOP}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(1), cursor: 'default' }}>
                {stat.icon}
                <span style={{ fontSize: 13, fontWeight: 600 }}>{stat.count}</span>
              </span>
            </Tooltip>
          ))}
        </Fragment>
      ))}
    </div>
  )
}

/**
 * When the workspace last changed, beside the type chip on its card: "Updated 2 days ago". It's the
 * newest of its documents, CoPilot chats and Haufe documents; the tooltip gives the date and what it was.
 */
// `bare` drops "Updated" for the table, whose column header already says it.
function LastUpdated({ docs, extras, bare = false }: { docs: MetadataDocument[]; extras: WorkspaceExtras; bare?: boolean }) {
  const latest = latestChange(docs, extras)
  if (!latest) return null
  return (
    <Tooltip title={formatDate(new Date(latest.at).toISOString())} description={latest.what} size={tooltipSizes.LARGE} placement={tooltipPlacements.TOP}>
      <span style={bare ? { ...cellText, whiteSpace: 'nowrap' } : { fontSize: 12, color: colorPalette.neutral.darken2, whiteSpace: 'nowrap', cursor: 'default' }}>
        {bare ? capitalise(updatedAgo(latest.at).replace(/^on /, '')) : `Updated ${updatedAgo(latest.at)}`}
      </span>
    </Tooltip>
  )
}

/** The workspace's newest change — a document, CoPilot chat or Haufe document — and what it was. */
function latestChange(docs: MetadataDocument[], extras: WorkspaceExtras) {
  const changes = [
    ...docs.map(doc => ({ at: new Date(doc.uploadedDate).getTime(), what: `Document added: ${doc.name}` })),
    ...extras.chats.map(chat => ({ at: chat.createdAt, what: `CoPilot chat: ${chat.title}` })),
    ...extras.haufeDocuments.map(doc => ({ at: doc.createdAt, what: `${doc.app === 'zeugnismanager' ? 'Zeugnis Manager' : 'HR Dokumente'}: ${doc.title}` })),
  ]
  return changes.length === 0 ? null : changes.reduce((a, b) => (b.at > a.at ? b : a))
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** "today", "yesterday", "3 days ago", "2 weeks ago", then the date once it's over a month. */
function updatedAgo(ts: number) {
  const startOfDay = (t: number) => new Date(new Date(t).toDateString()).getTime()
  const days = Math.round((startOfDay(Date.now()) - startOfDay(ts)) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 14) return `${days} days ago`
  if (days < 31) return `${Math.floor(days / 7)} weeks ago`
  return `on ${formatDate(new Date(ts).toISOString())}`
}


// ─── Haufe content ────────────────────────────────────────────────────────────

type HaufeKind = 'chat' | 'warning' | 'reference' | 'contract' | 'letter'

const HAUFE_KINDS: Record<HaufeKind, { label: string; icon: string }> = {
  chat: { label: 'CoPilot chat', icon: iconType.CommentOutlined },
  warning: { label: 'Warning letter', icon: iconType.AlertOutlined },
  reference: { label: 'Job reference letter', icon: iconType.ArticleOutlined },
  contract: { label: 'Contract', icon: iconType.SignatureOutlined },
  letter: { label: 'Letter', icon: iconType.EmailOutlined },
}

type HaufeItem = { id: string; kind: HaufeKind; title: string; source: string; date: string }



const daysSince = (ts: number) => {
  const startOfDay = (t: number) => new Date(new Date(t).toDateString()).getTime()
  return Math.round((startOfDay(Date.now()) - startOfDay(ts)) / 86400000)
}

type ActivityApp = 'copilot' | 'zeugnismanager' | 'hr-dokumente'

// The Used in page's column: centred, straight on the page.
const ACTIVITY_COLUMN: CSSProperties = { width: '100%', maxWidth: 760, margin: '0 auto' }

const ACTIVITY_APPS: Record<ActivityApp, { name: string; icon: ReactNode }> = {
  copilot: { name: 'CoPilot', icon: <CopilotIcon /> },
  zeugnismanager: { name: 'Haufe Zeugnis Manager', icon: <AppGlyph d={ZEUGNIS_MANAGER_GLYPH} /> },
  'hr-dokumente': { name: 'HR Dokumente', icon: <AppGlyph d={HR_DOKUMENTE_GLYPH} /> },
}

/** When an item happened, as the heading of its group. */
function activityPeriod(ts: number) {
  const days = daysSince(ts)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return 'Last 7 days'
  if (days < 31) return 'Last 30 days'
  return new Date(ts).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * The Used in page (the card's View all): everything made with Haufe apps in this workspace in one timeline,
 * newest first — where the Used in card only previews three per app. Tabs narrow it to one app and the search box (beside the
 * page title) to items whose title, app or type matches (the tab counts follow the search); items are grouped by when they
 * happened, and open in their app as on the card.
 */
function AllActivity({ search, chats, documents, onOpenChat, onOpenHrDocuments, onOpenZeugnisManager }: {
  // From the search box beside the page title.
  search: string
  chats: WorkspaceChat[]
  documents: HaufeDocument[]
  onOpenChat: (chatId: string) => void
  onOpenHrDocuments: () => void
  onOpenZeugnisManager: () => void
}) {
  const [filter, setFilter] = useState<'all' | ActivityApp>('all')
  const kindLabel = (kind: HaufeKind) => kind === 'chat' ? 'Chat' : HAUFE_KINDS[kind].label
  const allItems = [
    ...chats.map(c => ({ app: 'copilot' as const, at: c.createdAt, item: { id: c.id, kind: 'chat' as const, title: c.title, source: 'CoPilot', date: formatCreated(c.createdAt) } })),
    ...documents.map(d => ({ app: d.app, at: d.createdAt, item: { id: d.id, kind: d.kind, title: d.title, source: ACTIVITY_APPS[d.app].name, date: formatCreated(d.createdAt) } })),
  ].sort((a, b) => b.at - a.at)
  const query = search.trim().toLowerCase()
  const items = allItems.filter(i => !query || [i.item.title, ACTIVITY_APPS[i.app].name, kindLabel(i.item.kind)].some(t => t.toLowerCase().includes(query)))
  const count = (app: ActivityApp) => items.filter(i => i.app === app).length
  const shown = filter === 'all' ? items : items.filter(i => i.app === filter)
  const groups: { period: string; entries: typeof shown }[] = []
  shown.forEach(entry => {
    const period = activityPeriod(entry.at)
    const last = groups[groups.length - 1]
    if (last?.period === period) last.entries.push(entry)
    else groups.push({ period, entries: [entry] })
  })
  const open = (entry: (typeof allItems)[number]) =>
    entry.app === 'copilot' ? onOpenChat(entry.item.id) : entry.app === 'zeugnismanager' ? onOpenZeugnisManager() : onOpenHrDocuments()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
      <Tabs
        options={[
          { key: 'all', label: `All (${items.length})`, content: null },
          ...(Object.keys(ACTIVITY_APPS) as ActivityApp[]).map(app => ({ key: app, label: `${ACTIVITY_APPS[app].name} (${count(app)})`, content: null })),
        ]}
        activeKey={filter}
        onChange={key => setFilter(key as 'all' | ActivityApp)}
      />
      {shown.length === 0 ? (
        query
          ? <DashedEmptyState title="No matching activity" text={`Nothing here matches “${search.trim()}”. Try another word, or clear the search.`} />
          : <DashedEmptyState title="No activity yet" text="Anything made with this app for the workspace shows up here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
          {groups.map(group => (
            <div key={group.period} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Same type as the app titles on the Used in card. */}
              <span style={{ fontSize: 12, fontWeight: 600, color: colorPalette.neutral.darken2, padding: `0 0 ${spacing(1)}px ${spacing(2)}px` }}>{group.period}</span>
              {group.entries.map((entry, i) => (
                <HaufeRow
                  key={entry.item.id}
                  item={entry.item}
                  first={i === 0}
                  closed={i === group.entries.length - 1}
                  icon={<span style={{ display: 'inline-flex', width: 20, justifyContent: 'center', color: colorPalette.neutral.darken3 }}>{ACTIVITY_APPS[entry.app].icon}</span>}
                  meta={`${ACTIVITY_APPS[entry.app].name} · ${kindLabel(entry.item.kind)} · ${entry.item.date}`}
                  onOpen={() => open(entry)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


/**
 * A row like KnowledgeRow: the kind's icon, the title, then kind · date, and a chevron. The Used in page swaps
 * in the app's icon and "App · kind · date", since its rows mix apps.
 */
// `closed`: a stroke under the row too, so every group on the Used in page ends on one — single rows included.
function HaufeRow({ item, first, closed = false, onOpen, icon, meta }: { item: HaufeItem; first: boolean; closed?: boolean; onOpen?: () => void; icon?: ReactNode; meta?: string }) {
  const [hovered, setHovered] = useState(false)
  const kind = HAUFE_KINDS[item.kind]
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => { if (onOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpen() } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(3)}px ${spacing(2)}px`, cursor: 'pointer',
        borderTop: first ? undefined : `1px solid ${colorPalette.neutral.lighten3}`,
        borderBottom: closed ? `1px solid ${colorPalette.neutral.lighten3}` : undefined,
        backgroundColor: hovered ? colorPalette.neutral.lighten5 : undefined,
      }}
    >
      {icon ?? <Icon type={kind.icon as never} size={20} color="neutral-darken3" />}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
        <span style={{ fontSize: 12, color: colorPalette.neutral.darken2 }}>{meta ?? `${kind.label} · ${item.date}`}</span>
      </div>
      <Icon type={iconType.ChevronRightOutlined} size={16} color={hovered ? 'blue-base' : 'neutral-darken2'} />
    </div>
  )
}

// ─── Activity feed (summary) ─────────────────────────────────────────────────

type FeedFilter = 'all' | 'documents' | ActivityApp

const FEED_FILTER_LABELS: Record<FeedFilter, string> = {
  all: 'All', documents: 'Documents', copilot: 'CoPilot', zeugnismanager: 'Haufe Zeugnis Manager', 'hr-dokumente': 'HR Dokumente',
}

type FeedEntry = {
  id: string
  filter: Exclude<FeedFilter, 'all'>
  at: number
  // Documents only carry a date, so they show the date even today.
  hasTime: boolean
  icon: ReactNode
  title: string
  description: string
  // Where the row leads, and what it says to screen readers.
  open: () => void
  openLabel: string
}

const FEED_PAGE = 8

/**
 * Everything that happened in the workspace, newest first: documents added (one entry per source and day),
 * CoPilot chats and documents made in Haufe apps. DS chips filter by kind; entries are grouped by when they
 * happened and each has one way in. Paged, eight to a page.
 */
function ActivityFeed({ space, docs, chats, documents, onOpenDocuments, onOpenChat, onOpenHrDocuments, onOpenZeugnisManager }: {
  space: Space
  docs: MetadataDocument[]
  chats: WorkspaceChat[]
  documents: HaufeDocument[]
  onOpenDocuments: () => void
  onOpenChat: (chatId: string) => void
  onOpenHrDocuments: () => void
  onOpenZeugnisManager: () => void
}) {
  // Filter/Sort, as for documents: kinds of activity (none picked shows everything) and the order.
  const [feedFilters, setFeedFilters] = useState<FilterValues>({})
  const [feedSort, setFeedSort] = useState<'newest' | 'oldest'>('newest')
  const [feedFilterOpen, setFeedFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const entries = useMemo(() => {
    const sourceMap = computeDocSourceMap(docs, space)
    const batches = new Map<string, { source: DocSource; date: string; docs: MetadataDocument[] }>()
    docs.forEach(doc => {
      const source = sourceMap.get(doc._id) ?? 'local'
      const key = `${doc.uploadedDate}|${source}`
      const batch = batches.get(key) ?? { source, date: doc.uploadedDate, docs: [] }
      batch.docs.push(doc)
      batches.set(key, batch)
    })
    const docEntries: FeedEntry[] = [...batches.entries()].map(([key, b]) => {
      const n = b.docs.length
      const names = b.docs.map(doc => stripYear(doc.name))
      const files = n === 1 ? `“${names[0]}”` : `${n} files`
      return {
        id: `docs-${key}`, filter: 'documents', at: new Date(b.date).getTime(), hasTime: false,
        icon: sourceIcon(b.source, 20),
        title: b.source === 'local' ? `${files} uploaded` : `${files} added from ${connectorLabel(b.source)}`,
        description: n === 1 ? `${b.docs[0].fileFormat.toUpperCase()} · ${b.docs[0].fileSize}` : `${names.slice(0, 2).join(', ')}${n > 2 ? ` and ${n - 2} more` : ''}`,
        open: onOpenDocuments, openLabel: 'View documents',
      }
    })
    const chatEntries: FeedEntry[] = chats.map(c => ({
      id: c.id, filter: 'copilot', at: c.createdAt, hasTime: true, icon: <CopilotIcon />,
      title: c.title, description: 'CoPilot chat in this workspace',
      open: () => onOpenChat(c.id), openLabel: 'Open chat',
    }))
    const haufeEntries: FeedEntry[] = documents.map(d => ({
      id: d.id, filter: d.app, at: d.createdAt, hasTime: true,
      icon: <AppGlyph d={d.app === 'zeugnismanager' ? ZEUGNIS_MANAGER_GLYPH : HR_DOKUMENTE_GLYPH} />,
      title: d.title, description: `${HAUFE_KINDS[d.kind].label} · ${ACTIVITY_APPS[d.app].name}`,
      open: d.app === 'zeugnismanager' ? onOpenZeugnisManager : onOpenHrDocuments,
      openLabel: d.app === 'zeugnismanager' ? 'Open in Zeugnis Manager' : 'Open in HR Dokumente',
    }))
    return [...docEntries, ...chatEntries, ...haufeEntries].sort((a, b) => b.at - a.at)
  }, [space, docs, chats, documents, onOpenDocuments, onOpenChat, onOpenHrDocuments, onOpenZeugnisManager])

  // Only the kinds this workspace has, so no option leads to an empty list.
  const kindOptions = (['documents', 'copilot', 'zeugnismanager', 'hr-dokumente'] as const).filter(f => entries.some(e => e.filter === f))
  const kinds = feedFilters.kind ?? []
  const query = search.trim().toLowerCase()
  const matching = (feedSort === 'oldest' ? [...entries].reverse() : entries)
    .filter(e => kinds.length === 0 || kinds.includes(FEED_FILTER_LABELS[e.filter]))
    .filter(e => !query || [e.title, e.description, FEED_FILTER_LABELS[e.filter]].some(t => t.toLowerCase().includes(query)))
  const shown = matching.slice((page - 1) * FEED_PAGE, page * FEED_PAGE)
  const groups: { period: string; entries: FeedEntry[] }[] = []
  shown.forEach(entry => {
    const period = activityPeriod(entry.at)
    const last = groups[groups.length - 1]
    if (last?.period === period) last.entries.push(entry)
    else groups.push({ period, entries: [entry] })
  })

  return (
    <DossierCard title="Activity">
      {entries.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(3) }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SearchBar placeholder="Search activity" value={search} onChange={v => { setSearch(v); setPage(1) }} width={searchbarWidth.EXPANDED} />
          </div>
          <ButtonTertiary leftIcon={iconType.FilterOutlined} onClick={() => setFeedFilterOpen(true)}>Filter/Sort</ButtonTertiary>
        </div>
      )}
      {entries.length > 0 && <ActiveFilters values={feedFilters} onChange={next => { setFeedFilters(next); setPage(1) }} />}
      <FilterSortPanel
        visible={feedFilterOpen}
        title="Filter/Sort"
        sortOptions={[{ label: 'Newest first', value: 'newest' }, { label: 'Oldest first', value: 'oldest' }]}
        sort={feedSort}
        groups={[{ key: 'kind', label: 'Activity', options: kindOptions.map(k => FEED_FILTER_LABELS[k]) }]}
        values={feedFilters}
        onClose={() => setFeedFilterOpen(false)}
        onApply={(sort, values) => { setFeedSort(sort as 'newest' | 'oldest'); setFeedFilters(values); setPage(1); setFeedFilterOpen(false) }}
      />
      {entries.length === 0 ? (
        <DashedEmptyState title="No activity yet" text="Documents you add, CoPilot chats and anything made with Haufe apps for this workspace show up here." />
      ) : matching.length === 0 ? (
        <DashedEmptyState title="No matching activity" text={query ? `Nothing here matches “${search.trim()}”. Try another word, or clear the search.` : 'Nothing of this kind yet.'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
          {groups.map(group => (
            <div key={group.period} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: colorPalette.neutral.darken2, paddingBottom: spacing(1) }}>{group.period}</span>
              {group.entries.map((entry, i) => <FeedRow key={entry.id} entry={entry} first={i === 0} last={i === group.entries.length - 1} />)}
            </div>
          ))}
          {matching.length > FEED_PAGE && (
            <Pagination current={page} total={matching.length} pageSize={FEED_PAGE} onChange={setPage} />
          )}
        </div>
      )}
    </DossierCard>
  )
}

// `last`: a stroke under the row too, so every group ends on one — single rows included.
function FeedRow({ entry, first, last }: { entry: FeedEntry; first: boolean; last: boolean }) {
  const [hovered, setHovered] = useState(false)
  const d = new Date(entry.at)
  const today = d.toDateString() === new Date().toDateString()
  const when = entry.hasTime && today
    ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return (
    // The whole row opens the item; the title shows it's a link on hover.
    <div
      role="link"
      tabIndex={0}
      aria-label={`${entry.title} — ${entry.openLabel}`}
      onClick={entry.open}
      onKeyDown={e => { if (e.key === 'Enter') entry.open() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: spacing(4), padding: `${spacing(4)}px ${spacing(2)}px`, margin: `0 -${spacing(2)}px`, cursor: 'pointer',
        borderTop: first ? undefined : `1px solid ${colorPalette.neutral.lighten3}`,
        borderBottom: last ? `1px solid ${colorPalette.neutral.lighten3}` : undefined,
        backgroundColor: hovered ? colorPalette.neutral.lighten5 : undefined,
      }}
    >
      {/* The kind's mark on a soft tile, all in one grey. */}
      <span style={{ width: 36, height: 36, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: hovered ? colorPalette.white : colorPalette.neutral.lighten5, color: colorPalette.neutral.darken3 }}>
        {entry.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: hovered ? colorPalette.blue.base : colorPalette.neutral.darken5, textDecoration: hovered ? 'underline' : undefined }}>{entry.title}</span>
        <Typography size="base-sm" color="neutral-darken3" maxLines={2}>{entry.description}</Typography>
      </div>
      <span style={{ flexShrink: 0, fontSize: 12, color: colorPalette.neutral.darken2, paddingTop: 2 }}>{when}</span>
    </div>
  )
}

/**
 * The In this workspace list, as in the Figma: every area with its count and a chevron, including empty ones
 * ("None yet") so it's clear what can be added. Context isn't listed — it's the Profile card above the activity.
 */
function WorkspaceContents({ space, docs, extras, onOpen }: {
  space: Space
  docs: MetadataDocument[]
  extras: WorkspaceExtras
  onOpen: (area: WorkspaceArea) => void
}) {
  const details = extras.details.filter(d => d.label.trim() && d.value.trim()).length
  const activeGuardrails = extras.guardrails.filter(g => g.enabled).length
  const status: Record<WorkspaceArea, string> = {
    documents: docs.length ? String(docs.length) : NONE_YET,
    context: details > 0 ? pluralise(details, 'detail') : space.context?.trim() ? 'Background' : NONE_YET,
    guardrails: extras.guardrails.length ? `${activeGuardrails} of ${extras.guardrails.length} on` : NONE_YET,
    bookmarks: extras.bookmarks.length ? String(extras.bookmarks.length) : NONE_YET,
    templates: extras.templates.length ? String(extras.templates.length) : NONE_YET,
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: `0 -${spacing(2)}px` }}>
      {WORKSPACE_AREAS.filter(area => area !== 'context').map((area, i) => (
        <KnowledgeRow key={area} area={area} status={status[area]} first={i === 0} onClick={() => onOpen(area)} />
      ))}
    </div>
  )
}

/** Haufe Office Line's mark as a line icon (its logo is a raster image), like the product menu draws it. */
function OfficeLineGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15.5" cy="8.5" r="2" fill="currentColor" />
      <path d="M7.75 17V11.25H9.75C10.716 11.25 11.5 12.034 11.5 13S10.716 14.75 9.75 14.75H7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Where the workspace's knowledge comes from, read-only: its connectors (each connected app with its site or
 * folder), then the Haufe apps the user has access to; each group has a Manage link.
 */
function ConnectedSources({ space }: { space: Space }) {
  const connectors = [...new Set(space.connectors.map(c => c.type))]
  const apps: { key: string; icon: ReactNode; name: string }[] = [
    { key: 'copilot', icon: <CopilotIcon />, name: 'CoPilot' },
    { key: 'zeugnis', icon: <AppGlyph d={ZEUGNIS_MANAGER_GLYPH} />, name: 'Haufe Zeugnis Manager' },
    { key: 'hr', icon: <AppGlyph d={HR_DOKUMENTE_GLYPH} />, name: 'HR Dokumente' },
    { key: 'office-line', icon: <OfficeLineGlyph />, name: 'Haufe Office Line' },
  ]
  const groupTitle = (text: string) => <span style={{ fontSize: 12, fontWeight: 600, color: colorPalette.neutral.darken2 }}>{text}</span>
  const name = (text: string) => <span style={{ fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken5 }}>{text}</span>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        {/* Manage (here and for Haufe apps) is a placeholder for now — no destination yet. */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(2), marginBottom: -spacing(1) }}>
          {groupTitle('Connectors')}
          <div style={{ marginRight: -spacing(2) }}>
            <ButtonGhost size={buttonSizes.SMALL} rightIcon={iconType.ChevronRightOutlined}>Manage</ButtonGhost>
          </div>
        </div>
        {connectors.length === 0 ? (
          <Typography size="base-sm" color="neutral-darken2">No connectors yet. Connect SharePoint, OneDrive or DATEV to sync documents.</Typography>
        ) : connectors.map(type => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
            <span style={{ display: 'inline-flex' }}>{sourceIcon(type, 20)}</span>
            {/* The app's name, with the connected site or folder underneath. */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              {name(connectorLabel(type))}
              <span title={spaceConnectorLabel(space, type)} style={{ fontSize: 12, color: colorPalette.neutral.darken2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{spaceConnectorLabel(space, type)}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(2), marginBottom: -spacing(1) }}>
          {groupTitle('Haufe apps')}
          <div style={{ marginRight: -spacing(2) }}>
            <ButtonGhost size={buttonSizes.SMALL} rightIcon={iconType.ChevronRightOutlined}>Manage</ButtonGhost>
          </div>
        </div>
        {apps.map(app => (
          <div key={app.key} style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
            {/* One grey for every app's mark, as elsewhere on the page. */}
            <span style={{ width: 20, display: 'inline-flex', justifyContent: 'center', color: colorPalette.neutral.darken3 }}>{app.icon}</span>
            {name(app.name)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── In this workspace panel ─────────────────────────────────────────────────

const PANEL_DOCS_PAGE = 20

/**
 * The workspace's documents in the side panel, after Launch Pad's Documents drawer: search, select all (or how
 * many are selected, with Delete), Add, then one card per document — file icon, name, type · date · size, its
 * tags and where it came from — 20 to a page. A card opens the document's preview; its menu opens or deletes it.
 */
function DocumentsPanelBody({ space, docs, total, sourceMap, search, onSearch, filterButton, activeFilters, getMeta, selectedIds, onSelectedIdsChange, toolbar, onOpenDoc, onSendToCopilot, onUpload, onDelete }: {
  space: Space
  // Already searched, filtered and sorted (shared with the full-screen table); `total` is before any of that.
  docs: MetadataDocument[]
  total: number
  // Where each document came from, worked out over all the workspace's documents (not just the ones shown).
  sourceMap: Map<string, DocSource>
  search: string
  onSearch: (value: string) => void
  filterButton: ReactNode
  activeFilters: ReactNode
  getMeta: (doc: MetadataDocument) => ExtractedMetadata
  // Shared with the full-screen table, so the selection and its toolbar are the same in both.
  selectedIds: Set<string>
  onSelectedIdsChange: (ids: Set<string>) => void
  // The selection toolbar, kept in view at the bottom of the panel.
  toolbar: ReactNode
  onOpenDoc: (doc: MetadataDocument) => void
  onSendToCopilot: (doc: MetadataDocument) => void
  onUpload: () => void
  onDelete: (ids: string[]) => void
}) {
  const setSelectedIds = (update: (prev: Set<string>) => Set<string>) => onSelectedIdsChange(update(selectedIds))
  const [page, setPage] = useState(1)
  const filtered = docs
  // Back to the first page when a search or filter leaves fewer pages than the one showing.
  if (page > Math.max(1, Math.ceil(filtered.length / PANEL_DOCS_PAGE))) setPage(1)
  const pageDocs = filtered.slice((page - 1) * PANEL_DOCS_PAGE, page * PANEL_DOCS_PAGE)
  // Deleted documents drop out of the selection.
  const selected = filtered.filter(doc => selectedIds.has(doc._id))
  const allSelected = filtered.length > 0 && selected.length === filtered.length
  const toggle = (id: string) => setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })

  if (total === 0) {
    return (
      <TabEmptyState
        icon={<Icon type={iconType.UploadOutlined} size={24} color="blue-base" />}
        title="No documents yet"
        text="Upload files from your computer or sync them from SharePoint, OneDrive or DATEV. CoPilot answers from everything in here."
        action={<ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={onUpload}>Upload or sync</ButtonPrimary>}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
      <SearchBar placeholder="Search documents" value={search} onChange={v => { onSearch(v); setPage(1) }} width={searchbarWidth.EXPANDED} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(2) }}>
        {selected.length > 0 ? (
          <Checkbox checked={allSelected} indeterminate={!allSelected} onChange={() => onSelectedIdsChange(new Set())}>{selected.length} selected</Checkbox>
        ) : (
          <Checkbox checked={false} disabled={filtered.length === 0} onChange={() => onSelectedIdsChange(new Set(filtered.map(d => d._id)))}>Select all ({filtered.length})</Checkbox>
        )}
        <div style={{ display: 'flex', gap: spacing(2) }}>
          {filterButton}
          <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={onUpload}>Add</ButtonPrimary>
        </div>
      </div>
      {activeFilters}
      {filtered.length === 0 ? (
        <Typography size="base-sm" color="neutral-darken2">No documents match your search or filters.</Typography>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          {pageDocs.map(doc => (
            <PanelDocCard
              key={doc._id}
              space={space}
              doc={doc}
              meta={getMeta(doc)}
              source={sourceMap.get(doc._id) ?? 'local'}
              selected={selectedIds.has(doc._id)}
              onToggle={() => toggle(doc._id)}
              onOpen={() => onOpenDoc(doc)}
              onSendToCopilot={() => onSendToCopilot(doc)}
              onDelete={() => onDelete([doc._id])}
            />
          ))}
          {filtered.length > PANEL_DOCS_PAGE && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: spacing(2) }}>
              <Pagination current={page} total={filtered.length} pageSize={PANEL_DOCS_PAGE} onChange={setPage} />
            </div>
          )}
        </div>
      )}
      {/* Sticks to the bottom of the panel while the list scrolls under it. */}
      {toolbar && <div className="v9-selection-toolbar" style={PANEL_TOOLBAR}>{toolbar}</div>}
    </div>
  )
}

/**
 * A document in the panel, distilled from the documents table for the narrower width: name and menu, then
 * type · updated · size with the source on the right, then the matter, parties and the key date as short
 * labelled lines (a line only shows when there's something to say). Status is left out — it's always up to date.
 */
function PanelDocCard({ space, doc, meta, source, selected, onToggle, onOpen, onSendToCopilot, onDelete }: {
  space: Space
  doc: MetadataDocument
  meta: ExtractedMetadata
  source: DocSource
  selected: boolean
  onToggle: () => void
  onOpen: () => void
  onSendToCopilot: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const dates = tableDates(meta.dates)
  const keyDate = dates.find(d => d.isDeadline) ?? dates[0]
  const parties = meta.parties.map(p => p.name)
  const facts: { label: string; value: string }[] = [
    ...(meta.matterReference ? [{ label: FIELD_LABELS.matterReference, value: meta.matterReference }] : []),
    ...(parties.length ? [{ label: FIELD_LABELS.parties, value: `${parties.slice(0, 2).join(', ')}${parties.length > 2 ? ` +${parties.length - 2}` : ''}` }] : []),
    ...(keyDate ? [{ label: keyDate.label, value: formatKeyDate(keyDate) }] : []),
  ]
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? colorPalette.blue.base : colorPalette.neutral.lighten2}`, borderRadius: 8, padding: spacing(3),
        cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: spacing(2), transition: 'border-color 0.15s',
        backgroundColor: selected ? colorPalette.neutral.lighten5 : colorPalette.white,
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ paddingTop: 2 }}><Checkbox checked={selected} onChange={onToggle} /></div>
      <div style={{ flexShrink: 0 }}><FileTypeIcon format={doc.fileFormat} size={24} /></div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(2) }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography size="base" color="neutral-darken5" weight="semibold" maxLines={1}>{stripYear(doc.name)}</Typography>
            <Typography size="base-sm" color="neutral-darken2">{[meta.documentType, `Updated ${formatDate(doc.uploadedDate)}`, doc.fileSize].filter(Boolean).join(' · ')}</Typography>
          </div>
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            {sourceIcon(source, 20, source !== 'local' ? spaceConnectorLabel(space, source) : undefined)}
            <Dropdown
              items={[
                { key: 'open', label: <MenuLabel icon={iconType.ArticleOutlined}>Open preview</MenuLabel>, onClick: onOpen },
                { key: 'copilot', label: <SendToCopilotLabel />, onClick: onSendToCopilot },
                { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: onDelete },
              ]}
              trigger={dropdownTriggers.CLICK}
              placement={dropdownPlacement.BOTTOM_RIGHT}
            >
              <ButtonGhost shape={buttonShapes.SQUARE} size={buttonSizes.SMALL} leftIcon={iconType.ThreeDotsHorFilled} ariaLabel="Document actions" />
            </Dropdown>
          </div>
        </div>
        {facts.length > 0 && (
          // One label width for every card, so the values line up down the list.
          <div style={{ display: 'grid', gridTemplateColumns: '112px minmax(0, 1fr)', columnGap: spacing(3), rowGap: 2 }}>
            {facts.map(f => (
              <Fragment key={f.label}>
                <span title={f.label} style={{ fontSize: 12, lineHeight: '18px', color: colorPalette.neutral.darken2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.label}</span>
                <span style={{ fontSize: 12, lineHeight: '18px', color: colorPalette.neutral.darken5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.value}</span>
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * One area in the side panel: what it's for (medium text) with Edit under it, then its content. Edit turns the
 * content into a form in place, with Cancel and Save under it (as when editing elsewhere in these versions).
 */
function PanelArea({ description, editing, onEdit, onCancel, onSave, children }: {
  description: string
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  children: ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: spacing(3) }}>
        <Typography size="base" color="neutral-darken3">{description}</Typography>
        {!editing && <ButtonSecondary leftIcon={iconType.EditOutlined} onClick={onEdit}>Edit</ButtonSecondary>}
      </div>
      {children}
      {editing && <EditorActions onCancel={onCancel} onSave={onSave} />}
    </div>
  )
}

const panelHeading = (text: string) => <Typography size="base" weight="semibold" color="neutral-darken5">{text}</Typography>
const panelEmpty = (text: string) => <Typography size="base" color="neutral-darken2">{text}</Typography>
// A light list, one item per row with a stroke between — the read view of guardrails, bookmarks and templates.
const panelRow = (first: boolean): CSSProperties => ({ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(3)}px 0`, borderTop: first ? undefined : `1px solid ${colorPalette.neutral.lighten3}` })

/**
 * The workspace's profile, as Version 4's Profile card shows it: the background, then the details in a grid of
 * label-over-value pairs, with Edit in the card's header. Edit opens a modal, as Edit settings does.
 */
function ProfileCard({ space, extras, onSave }: {
  space: Space
  extras: WorkspaceExtras
  onSave: (background: string, details: WorkspaceDetail[]) => void
}) {
  const [editing, setEditing] = useState(false)
  const facts = extras.details.filter(d => d.label.trim() && d.value.trim())
  const savedBackground = space.context?.trim()

  return (
    <DossierCard title="Profile" action={<ButtonGhost leftIcon={iconType.EditOutlined} onClick={() => setEditing(true)}>Edit</ButtonGhost>}>
      {!savedBackground && facts.length === 0 ? (
        <Typography size="base" color="neutral-darken2">No profile yet — add a background and details so CoPilot knows who this client is.</Typography>
      ) : (
        <>
          {savedBackground && <Typography size="base" color="neutral-darken5">{savedBackground}</Typography>}
          {facts.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 196px)', rowGap: 18 }}>
              {facts.map(fact => (
                <div key={fact.id} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <Typography size="base-sm" weight="semibold" color="neutral-darken2">{fact.label}</Typography>
                  <Typography size="base" weight="semibold" color="neutral-darken5">{fact.value}</Typography>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <ProfileModal
        open={editing}
        space={space}
        details={extras.details}
        onClose={() => setEditing(false)}
        onSave={(background, details) => { onSave(background, details); setEditing(false) }}
      />
    </DossierCard>
  )
}

/** Edit profile, laid out like Edit settings: the background and the detail rows, with Cancel and Save. */
function ProfileModal({ open, space, details, onClose, onSave }: {
  open: boolean
  space: Space
  details: WorkspaceDetail[]
  onClose: () => void
  onSave: (background: string, details: WorkspaceDetail[]) => void
}) {
  const [background, setBackground] = useState('')
  const [draftDetails, setDraftDetails] = useState<WorkspaceDetail[]>([])
  // Each opening starts from what's saved.
  useEffect(() => { if (open) { setBackground(space.context ?? ''); setDraftDetails(details) } }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const updateDetail = (id: string, patch: Partial<WorkspaceDetail>) => setDraftDetails(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d))

  return (
    <Modal
      visible={open}
      title="Edit profile"
      withIcon={false}
      maxWidth={640}
      onClose={onClose}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
        { variant: buttonVariants.PRIMARY, props: { children: 'Save', onClick: () => onSave(background.trim(), draftDetails.filter(d => d.label.trim() || d.value.trim())) } },
      ]}}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
        <TextArea
          label="Background"
          description="What CoPilot should know about this client, department or project — who it is, what matters, how you like to work."
          value={background}
          autoSize={{ minRows: 4, maxRows: 10 }}
          placeholder="e.g. Mid-size manufacturing client, 3-year relationship, prefers short written summaries, fiscal year ends in June…"
          onChange={e => setBackground(e.target.value)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          {/* Styled like the DS field label and description above (Background). */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography size="base" weight="semibold" color="neutral-darken5">Details</Typography>
            <Typography size="base-sm" color="neutral-darken5">Facts about the workspace itself, such as client number, cost centre or contact person.</Typography>
          </div>
          {draftDetails.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 32px', gap: spacing(2), alignItems: 'center' }}>
              {draftDetails.map(d => (
                <Fragment key={d.id}>
                  <Input name={`${d.id}-label`} value={d.label} placeholder="e.g. Client number" onChange={e => updateDetail(d.id, { label: e.target.value })} />
                  <Input name={`${d.id}-value`} value={d.value} placeholder="e.g. 10442" onChange={e => updateDetail(d.id, { value: e.target.value })} />
                  <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={() => setDraftDetails(prev => prev.filter(x => x.id !== d.id))} ariaLabel="Remove detail" />
                </Fragment>
              ))}
            </div>
          )}
          <div style={{ marginLeft: -spacing(3) }}>
            <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => setDraftDetails(prev => [...prev, { id: newDetailId(), label: '', value: '' }])}>Add detail</ButtonGhost>
          </div>
        </div>
      </div>
    </Modal>
  )
}

/** The workspace's context: its background and details, edited in place. */
function ContextPanelBody({ space, extras, startEditing, onSave }: {
  space: Space
  extras: WorkspaceExtras
  startEditing: boolean
  onSave: (background: string, details: WorkspaceDetail[]) => void
}) {
  const [editing, setEditing] = useState(startEditing)
  const [background, setBackground] = useState(space.context ?? '')
  const [details, setDetails] = useState(extras.details)
  const startEdit = () => { setBackground(space.context ?? ''); setDetails(extras.details); setEditing(true) }
  const updateDetail = (id: string, patch: Partial<WorkspaceDetail>) => setDetails(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d))
  const facts = extras.details.filter(d => d.label.trim() && d.value.trim())
  const savedBackground = space.context?.trim()

  return (
    <PanelArea
      description="What CoPilot knows about this workspace, used in every answer."
      editing={editing}
      onEdit={startEdit}
      onCancel={() => setEditing(false)}
      onSave={() => { onSave(background.trim(), details.filter(d => d.label.trim() || d.value.trim())); setEditing(false) }}
    >
      {editing ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            {panelHeading('Background')}
            <TextArea
              value={background}
              autoSize={{ minRows: 4, maxRows: 12 }}
              placeholder="e.g. Mid-size manufacturing client, 3-year relationship, prefers short written summaries, fiscal year ends in June…"
              onChange={e => setBackground(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            {panelHeading('Details')}
            {details.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 32px', gap: spacing(2), alignItems: 'center' }}>
                {details.map(d => (
                  <Fragment key={d.id}>
                    <Input name={`${d.id}-label`} value={d.label} placeholder="e.g. Client number" onChange={e => updateDetail(d.id, { label: e.target.value })} />
                    <Input name={`${d.id}-value`} value={d.value} placeholder="e.g. 10442" onChange={e => updateDetail(d.id, { value: e.target.value })} />
                    <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={() => setDetails(prev => prev.filter(x => x.id !== d.id))} ariaLabel="Remove detail" />
                  </Fragment>
                ))}
              </div>
            )}
            <div style={{ marginLeft: -spacing(3) }}>
              <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => setDetails(prev => [...prev, { id: newDetailId(), label: '', value: '' }])}>Add detail</ButtonGhost>
            </div>
          </div>
        </>
      ) : !savedBackground && facts.length === 0 ? (
        panelEmpty('No context yet — add a background and details so CoPilot knows who this client is.')
      ) : (
        <>
          {savedBackground && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
              {panelHeading('Background')}
              <Typography size="base" color="neutral-darken5">{savedBackground}</Typography>
            </div>
          )}
          {facts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
              {panelHeading('Details')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', rowGap: 18, columnGap: spacing(6) }}>
                {facts.map(fact => <PropertyItem key={fact.id} label={fact.label} value={fact.value} variant={propertyItemVariants.VERTICAL} />)}
              </div>
            </div>
          )}
        </>
      )}
    </PanelArea>
  )
}

/** The workspace's guardrails: each rule, on or off. Editing switches them, rewrites, removes and adds rules. */
// `startAdding` (from Add content): open editing, with a new guardrail to fill in.
function GuardrailsPanelBody({ guardrails, startAdding = false, onSave }: { guardrails: Guardrail[]; startAdding?: boolean; onSave: (guardrails: Guardrail[]) => void }) {
  const [editing, setEditing] = useState(startAdding)
  const [draft, setDraft] = useState(() => startAdding ? [...guardrails, { id: newId('guardrail'), text: '', enabled: true }] : guardrails)
  const update = (id: string, patch: Partial<Guardrail>) => setDraft(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g))
  const add = (text = '') => setDraft(prev => [...prev, { id: newId('guardrail'), text, enabled: true }])
  const suggestions = SUGGESTED_GUARDRAILS.filter(s => !draft.some(g => g.text === s))

  return (
    <PanelArea
      description="Rules CoPilot always follows when it works with this workspace. Switch one off to pause it without deleting it."
      editing={editing}
      onEdit={() => { setDraft(guardrails); setEditing(true) }}
      onCancel={() => setEditing(false)}
      onSave={() => { onSave(draft.map(g => ({ ...g, text: g.text.trim() })).filter(g => g.text)); setEditing(false) }}
    >
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          {draft.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
              <Toggle checked={g.enabled} onChange={enabled => update(g.id, { enabled })} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Input name={`${g.id}-text`} value={g.text} placeholder="e.g. Don't give tax advice — refer to the tax team" onChange={e => update(g.id, { text: e.target.value })} />
              </div>
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={() => setDraft(prev => prev.filter(x => x.id !== g.id))} ariaLabel="Remove guardrail" />
            </div>
          ))}
          <div style={{ marginLeft: -spacing(3) }}>
            <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => add()}>Add guardrail</ButtonGhost>
          </div>
          {suggestions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
              <Typography size="base-sm" weight="semibold" color="neutral-darken2">Suggestions</Typography>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2) }}>
                {suggestions.map(s => <ButtonTertiary key={s} size={buttonSizes.SMALL} leftIcon={iconType.PlusOutlined} onClick={() => add(s)}>{s}</ButtonTertiary>)}
              </div>
            </div>
          )}
        </div>
      ) : guardrails.length === 0 ? panelEmpty('No guardrails yet.') : (
        <div>
          {guardrails.map((g, i) => (
            <div key={g.id} style={panelRow(i === 0)}>
              <Icon type={iconType.ShieldCheckOutlined as never} size={20} color={g.enabled ? 'neutral-darken3' : 'neutral-lighten1'} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Typography size="base" color={g.enabled ? 'neutral-darken5' : 'neutral-darken2'}>{g.text}</Typography>
              </div>
              <span style={{ fontSize: 12, color: colorPalette.neutral.darken2 }}>{g.enabled ? 'On' : 'Off'}</span>
            </div>
          ))}
        </div>
      )}
    </PanelArea>
  )
}

const appOptions = (apps: string[]) => apps.map(a => ({ value: a, label: a }))

/** The workspace's bookmarks: links to pages in other applications. Editing changes, removes and adds them. */
function BookmarksPanelBody({ bookmarks, startAdding = false, onSave }: { bookmarks: Bookmark[]; startAdding?: boolean; onSave: (bookmarks: Bookmark[]) => void }) {
  const [editing, setEditing] = useState(startAdding)
  const [draft, setDraft] = useState(() => startAdding ? [...bookmarks, { id: newId('bookmark'), title: '', url: '', app: BOOKMARK_APPS[0] }] : bookmarks)
  const update = (id: string, patch: Partial<Bookmark>) => setDraft(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))
  const save = () => {
    const href = (url: string) => /^https?:\/\//.test(url) ? url : `https://${url}`
    onSave(draft.map(b => ({ ...b, title: b.title.trim(), url: b.url.trim() })).filter(b => b.title && b.url).map(b => ({ ...b, url: href(b.url) })))
    setEditing(false)
  }

  return (
    <PanelArea
      description="Pages from other applications that belong to this workspace — a SharePoint site, a Confluence space, a Personal Office topic."
      editing={editing}
      onEdit={() => { setDraft(bookmarks); setEditing(true) }}
      onCancel={() => setEditing(false)}
      onSave={save}
    >
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          {draft.map((b, i) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(2), paddingTop: i ? spacing(3) : 0, borderTop: i ? `1px solid ${colorPalette.neutral.lighten3}` : undefined }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
                <Input name={`${b.id}-title`} value={b.title} placeholder="Name, e.g. Client SharePoint site" onChange={e => update(b.id, { title: e.target.value })} />
                <Input name={`${b.id}-url`} value={b.url} placeholder="https://" onChange={e => update(b.id, { url: e.target.value })} />
                <Select value={b.app} options={appOptions(BOOKMARK_APPS)} onChange={v => update(b.id, { app: v as string })} />
              </div>
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={() => setDraft(prev => prev.filter(x => x.id !== b.id))} ariaLabel="Remove bookmark" />
            </div>
          ))}
          <div style={{ marginLeft: -spacing(3) }}>
            <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => setDraft(prev => [...prev, { id: newId('bookmark'), title: '', url: '', app: BOOKMARK_APPS[0] }])}>Add bookmark</ButtonGhost>
          </div>
        </div>
      ) : bookmarks.length === 0 ? panelEmpty('No bookmarks yet.') : (
        <div>
          {bookmarks.map((b, i) => (
            <div key={b.id} style={panelRow(i === 0)}>
              <Icon type={iconType.LinkOutlined} size={20} color="neutral-darken3" />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken5, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</a>
                <span style={{ fontSize: 12, color: colorPalette.neutral.darken2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.url}</span>
              </div>
              <AppLabel app={b.app} />
            </div>
          ))}
        </div>
      )}
    </PanelArea>
  )
}

/** The workspace's templates, each usable in CoPilot. Editing changes, removes and adds them. */
function TemplatesPanelBody({ templates, startAdding = false, onSave, onUse }: { templates: Template[]; startAdding?: boolean; onSave: (templates: Template[]) => void; onUse: (t: Template) => void }) {
  const [editing, setEditing] = useState(startAdding)
  const [draft, setDraft] = useState(() => startAdding ? [...templates, { id: newId('template'), name: '', description: '', app: TEMPLATE_APPS[0] }] : templates)
  const update = (id: string, patch: Partial<Template>) => setDraft(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))

  return (
    <PanelArea
      description="Letters, contracts and prompts from other applications that this workspace uses. CoPilot can fill them in with what it knows here."
      editing={editing}
      onEdit={() => { setDraft(templates); setEditing(true) }}
      onCancel={() => setEditing(false)}
      onSave={() => { onSave(draft.map(t => ({ ...t, name: t.name.trim(), description: t.description.trim() })).filter(t => t.name)); setEditing(false) }}
    >
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          {draft.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(2), paddingTop: i ? spacing(3) : 0, borderTop: i ? `1px solid ${colorPalette.neutral.lighten3}` : undefined }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
                <Input name={`${t.id}-name`} value={t.name} placeholder="Name, e.g. Engagement letter" onChange={e => update(t.id, { name: e.target.value })} />
                <Input name={`${t.id}-description`} value={t.description} placeholder="What it's for (optional)" onChange={e => update(t.id, { description: e.target.value })} />
                <Select value={t.app} options={appOptions(TEMPLATE_APPS)} onChange={v => update(t.id, { app: v as string })} />
              </div>
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={() => setDraft(prev => prev.filter(x => x.id !== t.id))} ariaLabel="Remove template" />
            </div>
          ))}
          <div style={{ marginLeft: -spacing(3) }}>
            <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => setDraft(prev => [...prev, { id: newId('template'), name: '', description: '', app: TEMPLATE_APPS[0] }])}>Add template</ButtonGhost>
          </div>
        </div>
      ) : templates.length === 0 ? panelEmpty('No templates yet.') : (
        <div>
          {templates.map((t, i) => (
            <div key={t.id} style={panelRow(i === 0)}>
              <Icon type={iconType.ArticleOutlined} size={20} color="neutral-darken3" />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                  <Typography size="base" weight="semibold" color="neutral-darken5">{t.name}</Typography>
                  <AppLabel app={t.app} />
                </div>
                {t.description && <Typography size="base-sm" color="neutral-darken2" maxLines={1}>{t.description}</Typography>}
              </div>
              <ButtonTertiary size={buttonSizes.SMALL} onClick={() => onUse(t)}>Use in CoPilot</ButtonTertiary>
            </div>
          ))}
        </div>
      )}
    </PanelArea>
  )
}

// The selection toolbar in the panel: across the panel's full width, kept at the bottom while the list scrolls.
const PANEL_TOOLBAR: CSSProperties = { position: 'sticky', bottom: spacing(2), zIndex: 3, flexShrink: 0, margin: `0 -${spacing(4)}px ${spacing(2)}px` }

type DocSort = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'
const DOC_SORT_OPTIONS = [
  { label: 'Updated (newest first)', value: 'date-desc' },
  { label: 'Updated (oldest first)', value: 'date-asc' },
  { label: 'Name (A–Z)', value: 'name-asc' },
  { label: 'Name (Z–A)', value: 'name-desc' },
]

type FilterGroup = { key: string; label: string; options: string[] }

// A document filter: the values a document shows for it, and how to order the options (as listed, most
// common first, or alphabetically).
type DocFilterField = { key: string; label: string; values: (doc: MetadataDocument) => string[]; order?: string[]; byCount?: boolean }

function filterOptions(docs: MetadataDocument[], field: DocFilterField): string[] {
  const counts = new Map<string, number>()
  docs.forEach(d => field.values(d).forEach(v => counts.set(v, (counts.get(v) ?? 0) + 1)))
  const options = [...counts.keys()]
  if (field.order) return field.order.filter(o => counts.has(o))
  if (field.byCount) return options.sort((a, b) => (counts.get(b)! - counts.get(a)!) || a.localeCompare(b))
  return options.sort((a, b) => a.localeCompare(b))
}

// When a document was updated, as the ranges it falls in (the shorter ones sit inside the longer).
const UPDATED_RANGES = ['Last 7 days', 'Last 30 days', 'Last 12 months', 'Over a year ago']
function updatedRanges(iso: string): string[] {
  const days = daysSince(new Date(iso).getTime())
  if (days > 365) return ['Over a year ago']
  return [days <= 7 && 'Last 7 days', days <= 30 && 'Last 30 days', 'Last 12 months'].filter(Boolean) as string[]
}
// The values picked in each group, by group key; an empty or missing group doesn't filter.
type FilterValues = Record<string, string[]>

/**
 * Filter/Sort as in Launch Pad's documents: a panel over the current one with Sort by (when the list has an
 * order to choose) and a group of checkboxes per filter, Clear all filters, and Cancel / Apply in the footer.
 * Nothing changes until Apply.
 */
function FilterSortPanel({ visible, title, sortOptions, sort, groups, values, onClose, onApply }: {
  visible: boolean
  title: string
  sortOptions?: { label: string; value: string }[]
  sort: string
  groups: FilterGroup[]
  values: FilterValues
  onClose: () => void
  onApply: (sort: string, values: FilterValues) => void
}) {
  const [localSort, setLocalSort] = useState(sort)
  const [localValues, setLocalValues] = useState(values)
  // Each opening starts from what's applied.
  useEffect(() => { if (visible) { setLocalSort(sort); setLocalValues(values) } }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps
  const anyPicked = Object.values(localValues).some(v => v.length > 0)

  return (
    <Panel
      visible={visible}
      onClose={onClose}
      placement={panelPlacements.RIGHT}
      size={panelSizes.MEDIUM}
      title={title}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
        { variant: buttonVariants.PRIMARY, props: { children: 'Apply', onClick: () => onApply(localSort, localValues) } },
      ] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
        {anyPicked && (
          <div>
            <ButtonTertiary leftIcon={iconType.CrossOutlined} onClick={() => setLocalValues({})}>Clear all filters</ButtonTertiary>
          </div>
        )}
        {sortOptions && (
          <RadioGroup
            name={`${title}-sort`}
            label="Sort by"
            direction={radioGroupDirection.COLUMN}
            value={localSort}
            onChange={e => setLocalSort(e.target.value as string)}
            options={sortOptions}
          />
        )}
        {groups.filter(g => g.options.length > 0).map(group => (
          <div key={group.key} style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <Typography size="base-sm" color="neutral-darken5" weight="semibold">{group.label}</Typography>
            {group.options.map(opt => {
              const picked = localValues[group.key] ?? []
              return (
                <Checkbox
                  key={opt}
                  checked={picked.includes(opt)}
                  onChange={e => setLocalValues(prev => ({ ...prev, [group.key]: e.target.checked ? [...picked, opt] : picked.filter(v => v !== opt) }))}
                >
                  {opt}
                </Checkbox>
              )
            })}
          </div>
        ))}
      </div>
    </Panel>
  )
}

/** The applied filters as removable chips under the list's search, with Clear all — as in Launch Pad. */
function ActiveFilters({ values, onChange }: { values: FilterValues; onChange: (values: FilterValues) => void }) {
  const active = Object.entries(values).flatMap(([key, picked]) => picked.map(value => ({ key, value })))
  if (active.length === 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(2) }}>
      <div style={{ flexShrink: 0, paddingTop: 2 }}>
        <Typography size="base-sm" color="neutral-darken2" weight="semibold">Filters:</Typography>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing(2) }}>
        {active.map(f => (
          <Chip
            key={`${f.key}-${f.value}`}
            label={f.value}
            chipStyle={chipStyles.ACCENT_NEUTRAL}
            variant={chipVariants.HIGHLIGHT}
            uppercase={false}
            closable
            onClose={() => onChange({ ...values, [f.key]: values[f.key].filter(v => v !== f.value) })}
          />
        ))}
        <ButtonTertiary size={buttonSizes.SMALL} leftIcon={iconType.CrossOutlined} onClick={() => onChange({})}>Clear all</ButtonTertiary>
      </div>
    </div>
  )
}

/** "Send to CoPilot" with CoPilot's own mark — in the selection toolbar and the documents' menus. */
function SendToCopilotLabel({ count }: { count?: number }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />Send to CoPilot{count ? ` (${count})` : ''}</span>
}

function MenuLabel({ icon, children }: { icon: string; children: ReactNode }) {
  return <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={icon as never} size={16} />{children}</span>
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

  const card: React.CSSProperties = { backgroundColor: colorPalette.white, borderRadius: 16, padding: spacing(4), border: `1px solid ${colorPalette.neutral.lighten2}` }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: CONTENT_BG }}>
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
          <FileDetail label="Workspace">{space.name}</FileDetail>
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
