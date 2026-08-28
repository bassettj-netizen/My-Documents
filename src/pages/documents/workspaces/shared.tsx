import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Avatar,
  avatarShapeEnum,
  avatarSizeEnum,
  ButtonDanger,
  ButtonGhost,
  buttonShapes,
  ButtonPrimary,
  ButtonSecondary,
  ButtonTertiary,
  buttonVariants,
  Checkbox,
  Chip,
  chipStyles,
  chipVariants,
  type ChipStyleValue,
  constants,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  Icon,
  iconType,
  Input,
  LAYOUT_SIDEBAR_ID,
  Modal,
  modalVariants,
  Pagination,
  SearchBar,
  Select,
  SIDEBAR_COLLAPSED_WIDTH,
  Skeleton,
  skeletonVariants,
  Spinner,
  Table,
  TextArea,
  toastPlacements,
  Tooltip,
  tooltipPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { type MetadataDocument, type FileFormat, type DocumentStatus } from '../bulk-edit/documents'

export const { colorPalette, spacing, fontWeight } = constants
export const PAGE_SIZE = 10

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConnectorType = 'sharepoint' | 'onedrive' | 'datev' | 'google-drive'
export type DocSource = ConnectorType | 'local'

export type Connector = {
  id: string
  type: ConnectorType
  label: string
}

export type SpaceVisibility = 'public' | 'private'

export const SPACE_TYPE_OPTIONS = [
  { label: 'Client', value: 'Client' },
  { label: 'Internal', value: 'Internal' },
  { label: 'Project', value: 'Project' },
]

export type Space = {
  id: string
  name: string
  description: string
  type: string
  connectors: Connector[]
  visibility: SpaceVisibility
  // Data URL for a custom-uploaded workspace avatar — falls back to initials (SpaceAvatar) when unset.
  avatarUrl?: string
  // Freeform background on this space — sector, company size, relationship, preferred
  // communication style, etc. — kept separate from the create/edit form so it stays a
  // quick, no-friction add rather than another required field.
  context?: string
}

export type Tag = { text: string; style: string; variant?: string }

export type ChatAttachment = { id: string; name: string; format: FileFormat; size: string; source: DocSource }

/** Something being sent along with a chat message — either a freshly picked local file,
 *  or an existing document from the space's library (already has a real source/size). */
export type OutgoingAttachment =
  | { kind: 'file'; file: File }
  | { kind: 'doc'; doc: MetadataDocument; source: DocSource }

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachments?: ChatAttachment[]
  citedDocIds?: string[]
  pending?: boolean
}

export type ChatSession = {
  id: string
  title: string
  messages: ChatMessage[]
  updatedAt: number
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MY_DOCS_SPACE_ID = 'space-my-docs'

export const INITIAL_SPACES: Space[] = [
  {
    id: 'space-acme',
    name: 'Acme Corp',
    description: 'Client documents for Acme Corp — tax advisory and compliance',
    type: 'Client',
    visibility: 'public',
    connectors: [
      { id: 'c1', type: 'sharepoint', label: 'acmecorp.sharepoint.com/sites/tax' },
      { id: 'c2', type: 'google-drive', label: 'drive.google.com/shared/acme-corp' },
    ],
  },
  {
    id: 'space-alpha',
    name: 'Project Alpha',
    description: 'Internal project workspace — policy documentation and guidelines',
    type: 'Project',
    visibility: 'public',
    connectors: [
      { id: 'c3', type: 'google-drive', label: 'drive.google.com/shared/project-alpha' },
    ],
  },
  {
    id: 'space-hr',
    name: 'Internal HR',
    description: 'HR policies, compliance guides, and employee documentation',
    type: 'Internal',
    visibility: 'private',
    connectors: [
      { id: 'c4', type: 'sharepoint', label: 'haufe.sharepoint.com/sites/hr' },
      { id: 'c5', type: 'datev', label: 'apps.datev.de/payroll-exports' },
    ],
  },
]

// ─── Synthetic document generation (deterministic — same input always yields the same output) ─

type DocTheme = {
  domain: string
  jurisdiction: string
  docTypes: string[]
  subjects: string[]
  entities: string[]
  tags: string[]
}

const SPACE_DOC_THEMES: Record<string, DocTheme> = {
  'space-acme': {
    domain: 'Tax',
    jurisdiction: 'Germany',
    docTypes: ['Tax Return', 'Engagement Letter', 'Financial Statement', 'Audit Report', 'VAT Filing', 'Invoice', 'Compliance Memo', 'Client Agreement', 'Advisory Note', 'Payroll Summary'],
    subjects: ['Q1 Filing', 'Q2 Filing', 'Q3 Filing', 'Q4 Filing', 'Annual Review', 'Client Onboarding', 'Cross-Border Advisory', 'Corporate Restructuring', 'M&A Due Diligence', 'Transfer Pricing', 'Year-End Closing', 'Audit Preparation'],
    entities: ['Acme Corp', 'Acme Holdings GmbH', 'Acme Industrie AG'],
    tags: ['CLIENT', 'COMPLIANCE', 'FINANCE', 'AUDIT', 'ADVISORY', 'YEAR-END'],
  },
  'space-alpha': {
    domain: 'Project',
    jurisdiction: '—',
    docTypes: ['Project Charter', 'Policy', 'Guideline', 'Meeting Notes', 'Risk Assessment', 'Status Report', 'Design Spec', 'Runbook', 'Retrospective', 'Roadmap'],
    subjects: ['Sprint Planning', 'Architecture Review', 'Team Onboarding', 'Security Review', 'Vendor Evaluation', 'Rollout Plan', 'Incident Postmortem', 'Budget Review', 'Stakeholder Update', 'Compliance Checklist', 'Release Plan', 'Discovery Phase'],
    entities: ['Project Alpha', 'Alpha Workstream', 'Alpha Steering Committee'],
    tags: ['PLANNING', 'RISK', 'ARCHITECTURE', 'ROLLOUT', 'SECURITY', 'BUDGET'],
  },
  'space-hr': {
    domain: 'HR',
    jurisdiction: 'Germany',
    docTypes: ['HR Policy', 'Onboarding Guide', 'Compliance Guide', 'Benefits Summary', 'Employee Handbook', 'Training Material', 'Performance Review', 'Payroll Export', 'Leave Policy', 'Code of Conduct'],
    subjects: ['New Hire Orientation', 'Remote Work', 'Parental Leave', 'Annual Enrollment', 'Diversity and Inclusion', 'Data Protection', 'Workplace Safety', 'Performance Cycle', 'Exit Process', 'Relocation', 'Compensation Review', 'Health and Safety'],
    entities: ['Internal HR', 'People Team', 'HR Operations'],
    tags: ['ONBOARDING', 'BENEFITS', 'COMPLIANCE', 'TRAINING', 'PAYROLL', 'POLICY'],
  },
}

const SPACE_DOC_COUNTS: Record<string, number> = {
  'space-acme': 100,
  'space-alpha': 56,
  'space-hr': 29,
}

const GENERATED_FILE_FORMATS: FileFormat[] = ['PDF', 'DOCX', 'XLSX', 'PPTX']
const GENERATED_STATUSES: DocumentStatus[] = ['Approved', 'Approved', 'Draft', 'Approved', 'Superseded']
const SEED_ANCHOR_MS = new Date('2026-08-20').getTime()

function pick<T>(pool: T[], n: number): T {
  return pool[((n % pool.length) + pool.length) % pool.length]
}

function generateDocsForSpace(spaceId: string, count: number): MetadataDocument[] {
  const theme = SPACE_DOC_THEMES[spaceId]
  if (!theme || count <= 0) return []
  const docs: MetadataDocument[] = []
  for (let i = 0; i < count; i++) {
    const docType = pick(theme.docTypes, i)
    const subject = pick(theme.subjects, i * 7 + 3)
    const entity = pick(theme.entities, i * 5 + 1)
    const year = 2024 + (i % 3)
    const daysAgo = (i * 37 + 11) % 640
    const uploadedDate = new Date(SEED_ANCHOR_MS - daysAgo * 86400000).toISOString().slice(0, 10)
    const sizeKb = 80 + ((i * 53) % 4800)
    const fileFormat = pick(GENERATED_FILE_FORMATS, i * 3 + docType.length)
    const status = pick(GENERATED_STATUSES, i * 11)
    const tagTexts = [...new Set([pick(theme.tags, i * 3), pick(theme.tags, i * 3 + 2)])]
    docs.push({
      _id: `${spaceId}-doc-${i + 1}`,
      name: `${subject} — ${docType} (${year})`,
      domain: theme.domain,
      documentType: docType,
      status,
      namedEntity: entity,
      namedEntityId: `NE-${spaceId}-${(i % theme.entities.length) + 1}`,
      year,
      monetaryAmounts: 0,
      currency: 'EUR',
      monetaryTypes: 'None',
      lawType: '—',
      citations: '—',
      jurisdiction: theme.jurisdiction,
      uploadedDate,
      fileSize: sizeKb < 1024 ? `${sizeKb} KB` : `${(sizeKb / 1024).toFixed(1)} MB`,
      fileFormat,
      tagList: tagTexts.map(t => ({ text: t, style: chipStyles.ACCENT_NEUTRAL })),
    })
  }
  return docs
}

export function seedDocsForSpace(spaceId: string): MetadataDocument[] {
  return generateDocsForSpace(spaceId, SPACE_DOC_COUNTS[spaceId] ?? 8)
}

// ─── Synthetic chat history generation ───────────────────────────────────────

const SPACE_CHAT_PROMPTS: Record<string, string[]> = {
  'space-acme': [
    'Summarize the Q3 tax filings and flag anything that looks off',
    'Which client agreements are up for renewal this year?',
    'Compare VAT filings this year against last year',
    'Draft a client-facing summary of the audit findings',
    'What deductions were missed in the latest financial statement?',
    'Reconcile the payroll summary against the general ledger',
    'Prepare a due diligence checklist for the upcoming M&A review',
    'Which compliance memos mention transfer pricing?',
    'Summarize outstanding invoices older than 60 days',
    'Draft an advisory note on the new corporate restructuring',
    "What's the status of the VAT registration for the new subsidiary?",
    'Summarize the correspondence with the Finanzamt this quarter',
    "Draft a response to the tax office's information request",
    'Which invoices are missing supporting documentation?',
    "Compare depreciation methods used across the client's asset classes",
    'Summarize the findings from the last internal audit',
    'What are the filing deadlines for the next two months?',
    'Draft talking points for the year-end client review call',
    'Which transactions triggered the transfer pricing flag?',
    "Summarize changes in the client's corporate structure this year",
  ],
  'space-alpha': [
    'Summarize the latest architecture review decisions',
    'What risks were raised in the last risk assessment?',
    'Draft a stakeholder status update from the latest notes',
    'Compare the rollout plan against the original roadmap',
    'What follow-ups came out of the incident postmortem?',
    'Summarize the vendor evaluation scorecards',
    'Draft an onboarding checklist for new team members',
    'What is still open from the last sprint planning session?',
    'Summarize the budget review for this quarter',
    'Prepare talking points for the steering committee update',
  ],
  'space-hr': [
    'Summarize the remote work policy for new hires',
    'What changed in the latest employee handbook update?',
    'Draft a parental leave explainer for managers',
    'Summarize open items from the last performance cycle',
    'What does the data protection policy say about contractor access?',
    'Draft onboarding talking points for new hire orientation',
    'Summarize the annual enrollment changes for benefits',
    'What is the current exit process checklist?',
    'Compare diversity and inclusion goals year over year',
    'Summarize the workplace safety training requirements',
  ],
}

const SPACE_CHAT_SESSION_COUNTS: Record<string, number> = {
  'space-acme': 18,
  'space-alpha': 6,
  'space-hr': 7,
}

const SPACE_CHAT_UPLOADS: Record<string, string[]> = {
  'space-acme': ['Q3_Draft_Figures.xlsx', 'Signed_Engagement_Letter.pdf', 'Client_Correspondence.docx'],
  'space-alpha': ['Meeting_Notes_Draft.docx', 'Architecture_Diagram.pptx', 'Vendor_Quote.pdf'],
  'space-hr': ['Signed_Offer_Letter.pdf', 'Benefits_Comparison.xlsx', 'Policy_Draft_v2.docx'],
}

function generateSessionsForSpace(space: Space, docs: MetadataDocument[]): ChatSession[] {
  const spaceId = space.id
  const prompts = SPACE_CHAT_PROMPTS[spaceId] ?? []
  const uploads = SPACE_CHAT_UPLOADS[spaceId] ?? []
  const count = Math.min(SPACE_CHAT_SESSION_COUNTS[spaceId] ?? 5, prompts.length)
  const sessions: ChatSession[] = []
  // A message attachment always comes from exactly one source — cycle through whichever
  // integrations this space actually has connected, plus manual upload.
  const availableSources: DocSource[] = [...space.connectors.map(c => c.type), 'local']
  let attachmentIndex = 0

  for (let i = 0; i < count; i++) {
    const question = prompts[i]
    // Roughly a third of the chats include a file uploaded directly via the message field.
    const includesUpload = uploads.length > 0 && i % 3 === 0
    const uploadName = includesUpload ? pick(uploads, i) : null
    const attachments: ChatAttachment[] | undefined = uploadName ? [{
      id: `${spaceId}-att-${i + 1}`,
      name: uploadName,
      format: guessFormat(uploadName),
      size: `${((i * 37 + 240) % 4800 / 1024 + 0.2).toFixed(1)} MB`,
      source: pick(availableSources, attachmentIndex++),
    }] : undefined

    const userMsg: ChatMessage = {
      id: `${spaceId}-msg-${i + 1}-user`,
      role: 'user',
      content: question,
      attachments,
    }
    const reply = generateAssistantReply(question, docs)
    const assistantMsg: ChatMessage = {
      id: `${spaceId}-msg-${i + 1}-assistant`,
      role: 'assistant',
      content: reply.content,
      citedDocIds: reply.citedDocIds,
    }
    const hoursAgo = 4 + i * 21 + (i % 2 === 0 ? 6 : 0)

    sessions.push({
      id: `${spaceId}-chat-${i + 1}`,
      title: question.length > 48 ? `${question.slice(0, 48)}…` : question,
      messages: [userMsg, assistantMsg],
      updatedAt: SEED_ANCHOR_MS - hoursAgo * 3600000,
    })
  }

  return sessions
}

// ─── Provider icons ───────────────────────────────────────────────────────────

// The official Datev logo (icons8.com/icon/5B9GVkwCevp5/datev) — embedded inline, no runtime fetch.
const DATEV_ICON_BASE64 = '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'

function SharePointIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
      <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
    </svg>
  )
}

function OneDriveIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="4" fill="#0078D4"/>
      <path d="M3 13.5 Q5 9 9 10 Q10 7 14 8 Q18 8 17 13.5Z" fill="white" fillOpacity="0.9"/>
    </svg>
  )
}

const DATEV_ICON_SRC = `data:image/png;base64,${DATEV_ICON_BASE64}`

function DatevIcon({ size = 20 }: { size?: number }) {
  return <img src={DATEV_ICON_SRC} alt="" width={size} height={size} style={{ objectFit: 'contain' }} />
}

function GoogleDriveIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 -13.5 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.3542312,196.033928 L30.644172,215.534816 C32.9900287,219.64014 36.3622164,222.86588 40.3210929,225.211737 C51.6602421,210.818376 59.5534225,199.772864 64.000634,192.075201 C68.5137119,184.263529 74.0609657,172.045039 80.6423954,155.41973 C62.9064315,153.085282 49.4659974,151.918058 40.3210929,151.918058 C31.545465,151.918058 18.1051007,153.085282 0,155.41973 C0,159.964996 1.17298825,164.510261 3.51893479,168.615586 L19.3542312,196.033928 Z" fill="#0066DA"/>
      <path d="M215.681443,225.211737 C219.64032,222.86588 223.012507,219.64014 225.358364,215.534816 L230.050377,207.470615 L252.483511,168.615586 C254.829368,164.510261 256.002446,159.964996 256.002446,155.41973 C237.79254,153.085282 224.376613,151.918058 215.754667,151.918058 C206.488712,151.918058 193.072785,153.085282 175.506888,155.41973 C182.010479,172.136093 187.484394,184.354584 191.928633,192.075201 C196.412073,199.863919 204.329677,210.909431 215.681443,225.211737 Z" fill="#EA4335"/>
      <path d="M128.001268,73.3111515 C141.121182,57.4655263 150.162898,45.2470011 155.126415,36.6555757 C159.123121,29.7376196 163.521739,18.6920726 168.322271,3.51893479 C164.363395,1.1729583 159.818129,0 155.126415,0 L100.876121,0 C96.1841079,0 91.638842,1.31958557 87.6799655,3.51893479 C93.7861943,20.9210065 98.9675428,33.3058067 103.224011,40.6733354 C107.927832,48.8151881 116.186918,59.6944602 128.001268,73.3111515 Z" fill="#00832D"/>
      <path d="M175.360141,155.41973 L80.6420959,155.41973 L40.3210929,225.211737 C44.2799694,227.557893 48.8252352,228.730672 53.5172481,228.730672 L202.485288,228.730672 C207.177301,228.730672 211.722567,227.411146 215.681443,225.211737 L175.360141,155.41973 Z" fill="#2684FC"/>
      <path d="M128.001268,73.3111515 L87.680265,3.51893479 C83.7213885,5.86488134 80.3489013,9.09044179 78.0030446,13.1960654 L3.51893479,142.223575 C1.17298825,146.329198 0,150.874464 0,155.41973 L80.6423954,155.41973 L128.001268,73.3111515 Z" fill="#00AC47"/>
      <path d="M215.241501,77.7099697 L177.999492,13.1960654 C175.653635,9.09044179 172.281148,5.86488134 168.322271,3.51893479 L128.001268,73.3111515 L175.360141,155.41973 L255.855999,155.41973 C255.855999,150.874464 254.682921,146.329198 252.337064,142.223575 L215.241501,77.7099697 Z" fill="#FFBA00"/>
    </svg>
  )
}

/** Every connector/source icon is self-tooltipped so every render site gets the label for free.
 *  Pass `label` to tooltip with the specific connected app's realistic name (e.g. its domain)
 *  instead of the generic provider name — use `spaceConnectorLabel` to look it up. */
export function connectorIcon(type: ConnectorType, size = 20, label?: string) {
  const icon =
    type === 'sharepoint' ? <SharePointIcon size={size} /> :
    type === 'onedrive' ? <OneDriveIcon size={size} /> :
    type === 'datev' ? <DatevIcon size={size} /> :
    <GoogleDriveIcon size={size} />
  return (
    <Tooltip title={label ?? connectorLabel(type)} placement={tooltipPlacements.TOP}>
      <div style={{ display: 'inline-flex' }}>{icon}</div>
    </Tooltip>
  )
}

export function sourceIcon(source: DocSource, size = 20, label?: string) {
  if (source === 'local') {
    return (
      <Tooltip title="Manual Upload" placement={tooltipPlacements.TOP}>
        <div style={{ display: 'inline-flex' }}>
          <Icon type={iconType.UploadFilled} size={size as never} color="neutral-base" />
        </div>
      </Tooltip>
    )
  }
  return connectorIcon(source, size, label)
}

export function connectorLabel(type: ConnectorType) {
  if (type === 'sharepoint')  return 'Microsoft'
  if (type === 'onedrive')    return 'OneDrive'
  if (type === 'datev')       return 'Datev'
  return 'Google Drive'
}

/** The realistic, space-specific name for a connected app (e.g. its domain), falling back to the generic provider name when this space has no connector of that type. */
export function spaceConnectorLabel(space: Space, type: ConnectorType) {
  return space.connectors.find(c => c.type === type)?.label ?? connectorLabel(type)
}

/**
 * Single source of truth for which provider "owns" each document — every UI surface
 * (space cards, the documents table, drawers) should derive from this, not reimplement it.
 * A minority of docs are seeded as manually uploaded so every space shows a mix of sources.
 */
export function computeDocSourceMap(docs: MetadataDocument[], space: Space): Map<string, DocSource> {
  const map = new Map<string, DocSource>()
  docs.forEach((d, i) => {
    const isLocalUpload = d._id.startsWith('upload-') || space.connectors.length === 0 || i % 6 === 5
    map.set(d._id, isLocalUpload ? 'local' : space.connectors[i % space.connectors.length].type)
  })
  return map
}

/** Small custom "assistant" mark — kept distinct from provider icons so it reads as the AI, not a file source. */
export function AssistantMark({ size = 22 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.00078 10.687C6.5133 10.687 5.31067 9.48436 5.31067 7.99687C5.31067 6.50939 6.5133 5.30677 8.00078 5.30677C9.48826 5.30677 10.6909 6.50939 10.6909 7.99687C10.6909 9.48436 9.48826 10.687 8.00078 10.687ZM8.01662 15.181C6.38673 15.181 5.24739 13.9151 5.24739 12.1111C5.19991 11.0035 4.47199 10.7661 3.87067 10.7661C2.92122 10.7661 2.08254 10.4496 1.51287 9.86414C1.03814 9.37359 0.800781 8.72479 0.800781 7.99687C0.83243 5.9872 2.41485 5.24348 3.8865 5.22764C4.55111 5.22764 5.24739 4.8637 5.24739 3.88259C5.23155 2.03116 6.35505 0.796875 8.00078 0.796875C9.64651 0.796875 10.6909 1.99951 10.77 3.86677C10.8175 5.03775 11.6403 5.22764 12.1151 5.22764C13.5076 5.22764 15.1533 5.97136 15.2008 7.99687C15.2008 8.72479 14.9634 9.37359 14.4729 9.86414C13.9032 10.4338 13.0487 10.7661 12.1151 10.7661C11.5296 10.7661 10.8175 11.0035 10.7859 12.1111C10.7067 13.9784 9.63067 15.181 8.01662 15.181Z" fill="white"/>
      </svg>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function stripYear(name: string) {
  return name.replace(/\s*\(\d{4}\)\s*/g, '').trim()
}

export function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

export function getLastUpload(docs: MetadataDocument[]) {
  if (!docs.length) return '—'
  const latest = docs.reduce((a, b) => (a.uploadedDate > b.uploadedDate ? a : b))
  return formatDate(latest.uploadedDate)
}

export function relativeTime(ts: number) {
  const diffMs = Date.now() - ts
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  return `${day}d ago`
}

function makeSorter(key: string) {
  return (a: MetadataDocument, b: MetadataDocument) => {
    const av = a[key as keyof MetadataDocument]
    const bv = b[key as keyof MetadataDocument]
    if (typeof av === 'number' && typeof bv === 'number') return av - bv
    return String(av ?? '').localeCompare(String(bv ?? ''), 'de')
  }
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightAll(text: string, query: string): ReactNode {
  if (!query || !text.toLowerCase().includes(query.toLowerCase())) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'))
  return <>{parts.map((p, i) => p.toLowerCase() === query.toLowerCase() ? <span key={i} style={{ fontWeight: 700 }}>{p}</span> : p)}</>
}

export function getDocumentTags(doc: MetadataDocument): Tag[] {
  const tags: Tag[] = []
  tags.push({ text: doc.domain, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.tagList?.length) tags.push(...doc.tagList.map(t => ({ ...t })))
  if (doc.namedEntity !== '—') tags.push({ text: doc.namedEntity, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.jurisdiction !== '—') tags.push({ text: doc.jurisdiction, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.lawType !== '—') tags.push({ text: doc.lawType, style: chipStyles.ACCENT_NEUTRAL })
  return tags
}

export function guessFormat(filename: string): FileFormat {
  const ext = filename.split('.').pop()?.toUpperCase() ?? ''
  const known: FileFormat[] = ['PDF', 'DOCX', 'XLSX', 'PPTX']
  return (known.includes(ext as FileFormat) ? ext : 'PDF') as FileFormat
}

export function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function localFileToDoc(file: File): MetadataDocument {
  return {
    _id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: file.name.replace(/\.[^/.]+$/, ''),
    domain: 'HR',
    documentType: 'Document',
    status: 'Draft',
    namedEntity: '—',
    namedEntityId: '—',
    year: new Date().getFullYear(),
    monetaryAmounts: 0,
    currency: 'EUR',
    monetaryTypes: 'None',
    lawType: '—',
    citations: '—',
    jurisdiction: '—',
    uploadedDate: new Date().toISOString().split('T')[0],
    fileSize: formatFileSize(file.size),
    fileFormat: guessFormat(file.name),
  }
}

/** Very small **bold** + newline renderer — enough for the canned assistant replies, no markdown lib needed. */
export function renderLiteMarkdown(text: string): ReactNode {
  return (
    <>
      {text.split('\n').map((line, li) => (
        <div key={li} style={{ minHeight: line ? undefined : 8 }}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((chunk, ci) =>
            chunk.startsWith('**') && chunk.endsWith('**')
              ? <strong key={ci}>{chunk.slice(2, -2)}</strong>
              : <span key={ci}>{chunk}</span>
          )}
        </div>
      ))}
    </>
  )
}

// ─── Chat "intelligence" (canned, deterministic — no backend) ────────────────

export function getSuggestedPrompts(space: Space, docs: MetadataDocument[]): string[] {
  if (docs.length === 0) {
    return [
      `What can I ask about documents in ${space.name}?`,
      'Attach a file to get started',
    ]
  }
  const sorted = [...docs].sort((a, b) => b.uploadedDate.localeCompare(a.uploadedDate))
  const recent = sorted[0]

  const typeCounts = new Map<string, number>()
  docs.forEach(d => typeCounts.set(d.documentType, (typeCounts.get(d.documentType) ?? 0) + 1))
  const topType = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

  const tagCounts = new Map<string, number>()
  docs.forEach(d => getDocumentTags(d).forEach(t => {
    if (t.text && t.text !== '—') tagCounts.set(t.text, (tagCounts.get(t.text) ?? 0) + 1)
  }))
  const topTag = [...tagCounts.entries()].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1])[0]?.[0]

  const sameType = docs.filter(d => d.documentType === topType)

  const prompts: string[] = [`Summarize ${stripYear(recent.name)}`]
  if (topType) prompts.push(`What are the key points across all ${topType} documents?`)
  if (topTag) prompts.push(`Which documents mention ${topTag}?`)
  if (sameType.length >= 2) prompts.push(`Compare ${stripYear(sameType[0].name)} and ${stripYear(sameType[1].name)}`)
  if (prompts.length < 4) prompts.push('What documents were added most recently?')
  return prompts.slice(0, 4)
}

function scoreDoc(doc: MetadataDocument, queryWords: string[]) {
  const hay = (doc.name + ' ' + doc.documentType + ' ' + getDocumentTags(doc).map(t => t.text).join(' ')).toLowerCase()
  return queryWords.reduce((score, w) => score + (hay.includes(w) ? 1 : 0), 0)
}

export function generateAssistantReply(question: string, docs: MetadataDocument[]): { content: string; citedDocIds: string[] } {
  if (docs.length === 0) {
    return {
      citedDocIds: [],
      content: `There aren't any documents in this space yet. Attach a file or upload one to Documents, and I'll be able to answer questions about it.`,
    }
  }
  const words = question.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const scored = docs.map(d => ({ d, score: scoreDoc(d, words) })).sort((a, b) => b.score - a.score)
  const relevant = scored[0]?.score > 0 ? scored.filter(s => s.score > 0).slice(0, 3).map(s => s.d) : docs.slice(0, 2)
  const names = relevant.map(d => stripYear(d.name))
  const citedDocIds = relevant.map(d => d._id)
  const tagSample = getDocumentTags(relevant[0]).slice(0, 3).map(t => t.text).join(', ')
  const content =
    `Based on ${names.map(n => `**${n}**`).join(' and ')}, here's what's relevant to your question:\n\n` +
    `${names.length > 1 ? 'Together these documents cover' : 'This document covers'} ${relevant[0].documentType.toLowerCase()} topics` +
    `${tagSample ? ` tagged ${tagSample}` : ''}. Tell me what to look for — a figure, a date, a clause — and I'll point to the exact source.\n\n` +
    `(Simulated response for prototyping — connect a real assistant to answer from actual file contents.)`
  return { content, citedDocIds }
}

export function generateAttachmentReply(fileNames: string[]): string {
  const list = fileNames.map(n => `**${n}**`).join(', ')
  const pronoun = fileNames.length > 1 ? "they're" : "it's"
  return `I've received ${list} — ${pronoun} attached to this chat. Ask me anything about ${fileNames.length > 1 ? 'them' : 'it'}.`
}

// ─── Avatar (uniform badge style used across cards & header) ────────────────

const AVATAR_BG = '#EAEDFB'
const AVATAR_BORDER = '#C9D0F0'
const AVATAR_TEXT = '#3A44A0'

export function SpaceAvatar({ space, size = 36 }: { space: Space; size?: number }) {
  const isMyDocs = space.id === MY_DOCS_SPACE_ID
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      backgroundColor: AVATAR_BG, border: `1px solid ${AVATAR_BORDER}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
    }}>
      {space.avatarUrl
        ? <img src={space.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : isMyDocs
        ? <Icon type={iconType.FolderFilled} size={16} color="neutral-darken3" />
        : <span style={{ fontSize: size * 0.34, fontWeight: 700, color: AVATAR_TEXT, letterSpacing: 0.2 }}>{getInitials(space.name)}</span>
      }
    </div>
  )
}

/** Public/private badge shown next to a space's name — private spaces get a lock, public spaces a globe. */
export function VisibilityIcon({ space, size = 16 }: { space: Space; size?: number }) {
  if (space.id === MY_DOCS_SPACE_ID) return null
  const isPrivate = space.visibility === 'private'
  return (
    <Tooltip title={isPrivate ? 'Private' : 'Public'} placement={tooltipPlacements.TOP}>
      <div style={{ display: 'flex' }}>
        <Icon type={isPrivate ? iconType.LockOutlined : iconType.CompanyOutlined} size={size as never} color="neutral-darken2" />
      </div>
    </Tooltip>
  )
}

export function SpaceDetailHeader({ space, onBack, right }: { space: Space; onBack: () => void; right?: ReactNode }) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(3) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), minWidth: 0 }}>
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ChevronLeftOutlined} onClick={onBack} />
          <SpaceAvatar space={space} size={32} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <Typography size="heading-lg" weight="bold">{space.name}</Typography>
            <VisibilityIcon space={space} />
          </div>
        </div>
        {right}
      </div>
      <div style={{ marginLeft: 44 }}>
        <Typography size="base-sm" color="neutral-darken2">{space.description}</Typography>
      </div>
    </div>
  )
}

// ─── Tags cell (smart overflow) ──────────────────────────────────────────────

export function TagsCellInner({ tags }: { tags: Tag[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(tags.length)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const kids = Array.from(el.children) as HTMLElement[]
    if (!kids.length) return
    const base = el.getBoundingClientRect().top
    const rows: number[] = []
    for (const k of kids) {
      const t = Math.round(k.getBoundingClientRect().top - base)
      if (!rows.includes(t)) rows.push(t)
    }
    rows.sort((a, b) => a - b)
    if (rows.length <= 2) return
    const row2 = rows[1]
    let vis = 0
    for (const k of kids) {
      if (Math.round(k.getBoundingClientRect().top - base) <= row2) vis++
    }
    setVisibleCount(Math.max(1, vis - 1))
  }, [])

  const hidden = tags.slice(visibleCount)
  return (
    <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {tags.slice(0, visibleCount).map((t, i) => (
        <Chip key={i} label={t.text} chipStyle={t.style as ChipStyleValue} variant={(t.variant as typeof chipVariants[keyof typeof chipVariants]) ?? chipVariants.SUBTLE} />
      ))}
      {hidden.length > 0 && (
        <Tooltip title={hidden.map(t => t.text).join(', ')}>
          <Chip label={`+${hidden.length}`} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
        </Tooltip>
      )}
    </div>
  )
}

// ─── Editable cell ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EditableCell({ editable, isEditing, dataIndex, initialValue, onValueChange, children, ...rest }: any) {
  const [val, setVal] = useState('')
  useEffect(() => { if (isEditing) setVal(String(initialValue ?? '')) }, [isEditing, initialValue])
  if (!editable) return <td {...rest}>{children}</td>
  return (
    <td {...rest}>
      {isEditing ? (
        <div onClick={e => e.stopPropagation()}>
          <Input name={dataIndex} value={val} onChange={e => { setVal(e.target.value); onValueChange?.(dataIndex, e.target.value) }} />
        </div>
      ) : children}
    </td>
  )
}

// ─── Space form modal (create + edit settings share one design) ─────────────

export type SpaceFormValues = { name: string; description: string; type: string; visibility: SpaceVisibility; avatarUrl?: string }

const ACCESS_OPTIONS = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
]

const EMPTY_SPACE_FORM: SpaceFormValues = { name: '', description: '', type: '', visibility: 'public', avatarUrl: undefined }

/** Click-to-upload workspace avatar — used by SpaceFormModal. Falls back to name initials until an image is picked. */
function AvatarPicker({ avatarUrl, name, onChange }: { avatarUrl?: string; name: string; onChange: (url: string | undefined) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (list: FileList | null) => {
    const file = list?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing(4) }}>
      <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
        <Avatar
          src={avatarUrl}
          srcPlaceholder={getInitials(name) || '—'}
          shape={avatarShapeEnum.SQUARE}
          size={avatarSizeEnum.LARGE}
          displayMask
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
        <ButtonTertiary onClick={() => fileInputRef.current?.click()}>
          {avatarUrl ? 'Change photo' : 'Upload photo'}
        </ButtonTertiary>
        {avatarUrl && (
          <ButtonGhost onClick={() => onChange(undefined)}>Remove</ButtonGhost>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { handleFile(e.target.files); e.target.value = '' }}
      />
    </div>
  )
}

export function SpaceFormModal({ open, mode, initialValues, onClose, onSubmit }: {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: SpaceFormValues
  onClose: () => void
  onSubmit: (values: SpaceFormValues) => void
}) {
  const [values, setValues] = useState<SpaceFormValues>(EMPTY_SPACE_FORM)

  useEffect(() => {
    if (open) setValues(mode === 'edit' && initialValues ? initialValues : EMPTY_SPACE_FORM)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Modal
      visible={open}
      title={mode === 'create' ? 'Create New Workspace' : 'Edit settings'}
      withIcon={false}
      onClose={onClose}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
        {
          variant: buttonVariants.PRIMARY,
          props: {
            children: 'Save',
            disabled: !values.name.trim() || !values.type,
            onClick: () => onSubmit({ ...values, name: values.name.trim(), description: values.description.trim() }),
          },
        },
      ]}}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <AvatarPicker
          avatarUrl={values.avatarUrl}
          name={values.name}
          onChange={avatarUrl => setValues(v => ({ ...v, avatarUrl }))}
        />
        <Input
          label="Name" isRequired
          value={values.name}
          placeholder="Give your workspace a name"
          onChange={e => setValues(v => ({ ...v, name: e.target.value }))}
        />
        <TextArea
          label="Description" hasCounter maxCount={500}
          currentCount={values.description.length}
          value={values.description}
          maxLength={500}
          autoSize={{ minRows: 2, maxRows: 4 }}
          placeholder="Describe the purpose of this workspace"
          onChange={e => setValues(v => ({ ...v, description: e.target.value }))}
        />
        <Select
          label="Type" isRequired
          value={values.type || undefined}
          placeholder="Select how the workspace will be used"
          options={SPACE_TYPE_OPTIONS}
          onChange={v => setValues(prev => ({ ...prev, type: v as string }))}
        />
        <Select
          label="Access"
          value={values.visibility}
          options={ACCESS_OPTIONS}
          helper="Private = Only you have access, Public = Others have access."
          onChange={v => setValues(prev => ({ ...prev, visibility: v as SpaceVisibility }))}
        />
      </div>
    </Modal>
  )
}

// ─── Space context modal ──────────────────────────────────────────────────────

/**
 * A single freeform notes box for background on this space — sector, company size,
 * relationship, preferred communication style, whatever's useful — kept deliberately
 * to one field so adding it is quick rather than another multi-field form to fill in.
 */
export function SpaceContextModal({ open, space, onClose, onSave }: {
  open: boolean
  space: Space
  onClose: () => void
  onSave: (context: string) => void
}) {
  const [value, setValue] = useState(space.context ?? '')

  useEffect(() => { if (open) setValue(space.context ?? '') }, [open, space.context])

  return (
    <Modal
      visible={open}
      title="Workspace Context"
      withIcon={false}
      onClose={onClose}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
        { variant: buttonVariants.PRIMARY, props: { children: 'Save', onClick: () => onSave(value.trim()) } },
      ] }}
    >
      <TextArea
        label="Additional context"
        value={value}
        onChange={e => setValue(e.target.value)}
        autoSize={{ minRows: 6, maxRows: 14 }}
        placeholder="e.g. Mid-size manufacturing client, 3-year relationship, prefers concise written summaries over calls, fiscal year ends in June..."
        helper="Background that helps tailor how this space is worked with — sector, company size, relationship, preferred communication style, or anything else worth knowing."
        helperMaxLines={3}
      />
    </Modal>
  )
}

// ─── Upload modal (computer only) ────────────────────────────────────────────

function UploadModal({ open, onClose, onUpload }: {
  open: boolean
  onClose: () => void
  onUpload: (docs: MetadataDocument[]) => void
}) {
  const [queuedFiles, setQueuedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (!open) { setQueuedFiles([]); setIsDragging(false) } }, [open])

  const addFiles = (list: FileList | null) => {
    if (!list) return
    setQueuedFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...Array.from(list).filter(f => !existing.has(f.name))]
    })
  }

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }
  const handleUpload = () => { onUpload(queuedFiles.map(localFileToDoc)); onClose() }

  return (
    <Modal
      visible={open}
      title="Upload or sync documents"
      onClose={onClose}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
        { variant: buttonVariants.PRIMARY, props: { children: queuedFiles.length > 0 ? `Upload ${queuedFiles.length} file${queuedFiles.length !== 1 ? 's' : ''}` : 'Upload', onClick: handleUpload, disabled: queuedFiles.length === 0 } },
      ]}}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? colorPalette.blue.base : '#d0d5dd'}`,
            borderRadius: 10, padding: `${spacing(8)}px ${spacing(4)}px`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(2),
            cursor: 'pointer', backgroundColor: isDragging ? '#F0F7FF' : '#FAFAFA',
            transition: 'border-color 0.15s, background-color 0.15s',
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={iconType.UploadOutlined} size={20} color="neutral-darken3" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Drag files here</Typography>
            <Typography size="base-sm" color="neutral-darken2">or <span style={{ color: colorPalette.blue.base, textDecoration: 'underline' }}>browse your computer</span></Typography>
          </div>
          <Typography size="base-sm" color="neutral-darken2">PDF, DOCX, XLSX, PPTX — up to 50 MB each</Typography>
        </div>
        <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
        {queuedFiles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            {queuedFiles.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(2)}px ${spacing(3)}px`, border: '1px solid #e0e0e0', borderRadius: 8 }}>
                <Chip label={guessFormat(f.name)} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
                <span style={{ flex: 1 }}><Typography size="base" color="neutral-darken5">{f.name}</Typography></span>
                <Typography size="base-sm" color="neutral-darken2">
                  {f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)} KB` : `${(f.size / 1024 / 1024).toFixed(1)} MB`}
                </Typography>
                <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setQueuedFiles(prev => prev.filter((_, j) => j !== i))} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── Space card + Spaces list view ───────────────────────────────────────────

function SpaceCard({ space, docs, lastUpload, onClick, onRequestEdit, onRequestDelete }: {
  space: Space
  docs: MetadataDocument[]
  lastUpload: string
  onClick: () => void
  onRequestEdit: (id: string) => void
  onRequestDelete: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const isMyDocs = space.id === MY_DOCS_SPACE_ID
  const docCount = docs.length
  // Every source actually present among this space's documents — not just the primary connector.
  const presentSources = useMemo(() => {
    const sourceMap = computeDocSourceMap(docs, space)
    const order = [...space.connectors.map(c => c.type), 'local' as DocSource]
    const present = new Set(sourceMap.values())
    return order.filter(s => present.has(s))
  }, [docs, space])

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        border: `1px solid ${hovered ? colorPalette.blue.base : '#e5e7eb'}`,
        borderRadius: 8, padding: `${spacing(5)}px`, backgroundColor: colorPalette.white,
        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: spacing(3),
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <SpaceAvatar space={space} />
        {isMyDocs ? (
          <Chip label="Personal library" chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
        ) : (
          <div onClick={e => e.stopPropagation()}>
            <Dropdown
              items={[
                { key: 'edit', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.GearOutlined} size={16} />Edit settings</span>, onClick: () => onRequestEdit(space.id) },
                { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => onRequestDelete(space.id) },
              ]}
              trigger={dropdownTriggers.CLICK}
              placement={dropdownPlacement.BOTTOM_RIGHT}
            >
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
            </Dropdown>
          </div>
        )}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{space.name}</Typography>
          <VisibilityIcon space={space} />
        </div>
        <Typography size="base-sm" color="neutral-darken2" maxLines={2}>{space.description}</Typography>
      </div>
      <Typography size="base-sm" color="neutral-darken2">
        {docCount} {docCount === 1 ? 'document' : 'documents'} • Last upload {lastUpload}
      </Typography>
      {!isMyDocs && presentSources.length > 0 && (
        <div style={{ position: 'absolute', bottom: spacing(4), right: spacing(4), display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {presentSources.map(source => <span key={source}>{sourceIcon(source, 20, source !== 'local' ? spaceConnectorLabel(space, source) : undefined)}</span>)}
        </div>
      )}
    </div>
  )
}

export function SpacesListView({ spaces, getSpaceDocs, onOpenSpace, onCreateSpace, onUpdateSpace, onDeleteSpace, showTitleIcon = true }: {
  spaces: Space[]
  getSpaceDocs: (id: string) => MetadataDocument[]
  onOpenSpace: (id: string) => void
  onCreateSpace: (values: SpaceFormValues) => void
  onUpdateSpace: (id: string, values: SpaceFormValues) => void
  onDeleteSpace: (id: string) => void
  showTitleIcon?: boolean
}) {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editSpaceId, setEditSpaceId] = useState<string | null>(null)
  const [deleteSpaceId, setDeleteSpaceId] = useState<string | null>(null)
  const editTargetSpace = spaces.find(s => s.id === editSpaceId) ?? null
  const deleteTargetSpace = spaces.find(s => s.id === deleteSpaceId) ?? null

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: spacing(6), backgroundColor: colorPalette.white, minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
          {showTitleIcon && (
            <div style={{ color: '#141F29', display: 'flex' }}>
              <Icon type={iconType.ElementsOutlined} size={32} color="inherit" />
            </div>
          )}
          <Typography size="heading-lg" weight="bold">Workspaces</Typography>
        </div>
        <ButtonSecondary leftIcon={iconType.PlusOutlined} onClick={() => setCreateModalOpen(true)}>Workspace</ButtonSecondary>
      </div>

      {spaces.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing(4), padding: `${spacing(12)}px 0`, color: colorPalette.neutral.darken2 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={iconType.FolderFilled} size={24} color="neutral-darken2" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>No spaces yet</Typography>
            <Typography size="base" color="neutral-darken2">Create a space for a client or project to get started.</Typography>
          </div>
          <ButtonPrimary onClick={() => setCreateModalOpen(true)}>Create your first space</ButtonPrimary>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: spacing(5) }}>
          {spaces.map(space => {
            const spaceDocs = getSpaceDocs(space.id)
            return (
              <SpaceCard
                key={space.id}
                space={space}
                docs={spaceDocs}
                lastUpload={getLastUpload(spaceDocs)}
                onClick={() => onOpenSpace(space.id)}
                onRequestEdit={setEditSpaceId}
                onRequestDelete={setDeleteSpaceId}
              />
            )
          })}
        </div>
      )}

      <SpaceFormModal
        open={createModalOpen}
        mode="create"
        onClose={() => setCreateModalOpen(false)}
        onSubmit={values => { onCreateSpace(values); setCreateModalOpen(false) }}
      />

      <SpaceFormModal
        open={!!editTargetSpace}
        mode="edit"
        initialValues={editTargetSpace ?? undefined}
        onClose={() => setEditSpaceId(null)}
        onSubmit={values => { if (editTargetSpace) onUpdateSpace(editTargetSpace.id, values); setEditSpaceId(null) }}
      />

      <Modal
        visible={!!deleteTargetSpace}
        variant={modalVariants.DANGER}
        title="Delete space"
        onClose={() => setDeleteSpaceId(null)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: () => setDeleteSpaceId(null) } },
          { variant: buttonVariants.DANGER, props: { children: 'Delete', onClick: () => { if (deleteTargetSpace) onDeleteSpace(deleteTargetSpace.id); setDeleteSpaceId(null) } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">
          Delete <strong>{deleteTargetSpace?.name}</strong>? This cannot be undone.
        </Typography>
      </Modal>
    </div>
  )
}

// ─── Documents panel ──────────────────────────────────────────────────────────

const FIXED_COLS = [
  { key: 'name',         label: 'Name'     },
  { key: 'status',       label: 'Status'   },
  { key: 'source',       label: 'Source'   },
  { key: 'documentType', label: 'Type'     },
  { key: 'tags',         label: 'Tags'     },
  { key: 'uploadedDate', label: 'Updated'  },
  { key: 'fileSize',     label: 'Size'     },
  { key: 'fileFormat',   label: 'Format'   },
]
const NON_EDITABLE_KEYS = new Set(['fileFormat', 'fileSize', 'uploadedDate', 'name', 'tags', 'status', 'source'])

export function DocumentsPanel({ space, docs, onDocsChange, sidebarWidth }: {
  space: Space
  docs: MetadataDocument[]
  onDocsChange: (docs: MetadataDocument[]) => void
  sidebarWidth: number
}) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const pendingEditsRef = useRef<Record<string, string>>({})
  const pendingTagsRef = useRef<Tag[] | null>(null)
  const pendingRemovedDerivedRef = useRef<Set<string>>(new Set())
  const searchBarWrapperRef = useRef<HTMLDivElement>(null)
  const lastQueryRef = useRef('')
  const { notification } = useNotifications()

  useEffect(() => {
    if (searchInput === lastQueryRef.current) return
    setIsSearching(true)
    const t = setTimeout(() => { setAppliedQuery(searchInput); lastQueryRef.current = searchInput; setIsSearching(false) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchBarWrapperRef.current && !searchBarWrapperRef.current.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSave = useCallback((updated: MetadataDocument) => {
    onDocsChange(docs.map(d => d._id === updated._id ? updated : d))
  }, [docs, onDocsChange])

  const handleCellChange = useCallback((key: string, value: string) => { pendingEditsRef.current[key] = value }, [])

  const startEdit = useCallback((record: MetadataDocument) => {
    pendingEditsRef.current = {}; pendingTagsRef.current = null; pendingRemovedDerivedRef.current = new Set()
    setEditingKey(record._id)
  }, [])

  const saveEdit = useCallback((record: MetadataDocument) => {
    const updated = { ...record, ...pendingEditsRef.current } as MetadataDocument
    if (pendingTagsRef.current !== null) updated.tagList = pendingTagsRef.current
    for (const k of pendingRemovedDerivedRef.current) (updated as unknown as Record<string, unknown>)[k] = '—'
    handleSave(updated)
    setEditingKey(null); pendingEditsRef.current = {}; pendingTagsRef.current = null; pendingRemovedDerivedRef.current = new Set()
  }, [handleSave])

  const cancelEdit = useCallback(() => {
    setEditingKey(null); pendingEditsRef.current = {}; pendingTagsRef.current = null; pendingRemovedDerivedRef.current = new Set()
  }, [])

  const filteredDocs = useMemo(() => {
    const q = appliedQuery.toLowerCase()
    return !q ? docs : docs.filter(d =>
      d.name.toLowerCase().includes(q) || d.documentType.toLowerCase().includes(q) ||
      d.domain.toLowerCase().includes(q) || d.jurisdiction.toLowerCase().includes(q)
    )
  }, [docs, appliedQuery])

  const pagedDocs = useMemo(() => filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredDocs, currentPage])
  const allSelected = filteredDocs.length > 0 && filteredDocs.every(d => selectedKeys.has(d._id))
  const someSelected = filteredDocs.some(d => selectedKeys.has(d._id))

  const searchResults = useMemo(() => {
    const q = searchInput.trim()
    if (q.length < 2) return []
    const ql = q.toLowerCase()
    return docs.filter(d => d.name.toLowerCase().includes(ql) || d.documentType.toLowerCase().includes(ql)).slice(0, 5)
  }, [searchInput, docs])

  const docSourceMap = useMemo(() => computeDocSourceMap(docs, space), [docs, space])

  const columns = useMemo(() => {
    const checkboxCol = {
      title: () => <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={e => {
        setSelectedKeys(prev => { const next = new Set(prev); filteredDocs.forEach(d => { if (e.target.checked) next.add(d._id); else next.delete(d._id) }); return next })
      }} />,
      key: 'checkbox', width: 48,
      onCell: (record: MetadataDocument) => ({
        style: { verticalAlign: 'top', backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined },
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
      render: (_: unknown, record: MetadataDocument) => (
        <Checkbox checked={selectedKeys.has(record._id)} onChange={e => {
          setSelectedKeys(prev => { const next = new Set(prev); if (e.target.checked) next.add(record._id); else next.delete(record._id); return next })
        }} onClick={e => e.stopPropagation()} />
      ),
    }

    const visible: object[] = FIXED_COLS.map(({ key, label }) => {
      const isNonEditable = NON_EDITABLE_KEYS.has(key)
      const col: Record<string, unknown> = {
        title: label, key, dataIndex: key, ellipsis: key !== 'tags' && key !== 'documentType',
        sorter: (key !== 'tags' && key !== 'status' && key !== 'source') ? makeSorter(key) : undefined,
        onCell: (record: MetadataDocument) => ({
          style: { cursor: 'pointer', verticalAlign: 'top', backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined },
          ...(isNonEditable ? {} : { editable: true, isEditing: editingKey === record._id, dataIndex: key, initialValue: record[key as keyof MetadataDocument], onValueChange: handleCellChange }),
        }),
      }

      if (key === 'uploadedDate') { col.width = 110; col.render = (v: string) => formatDate(v) }
      if (key === 'fileSize') col.width = 80
      if (key === 'fileFormat') col.width = 90
      if (key === 'status') { col.width = 64; col.render = () => <Icon type={iconType.CheckCircleFilled} size={20} color="success-base" /> }
      if (key === 'source') {
        col.width = 64
        col.render = (_: unknown, record: MetadataDocument) => {
          const source = docSourceMap.get(record._id) ?? 'local'
          return sourceIcon(source, 20, source !== 'local' ? spaceConnectorLabel(space, source) : undefined)
        }
      }
      if (key === 'name') {
        col.width = '24%'
        col.render = (name: string) => (
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{stripYear(name)}</span>
        )
      }
      if (key === 'documentType') { col.width = 150 }

      if (key === 'tags') {
        col.render = (_: unknown, record: MetadataDocument) => {
          if (editingKey === record._id) {
            return (
              <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Input placeholder="Add tag…" onChange={() => {}} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  <Chip label={record.domain} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
                  {(record.tagList ?? []).map((t, i) => (
                    <Chip key={i} label={t.text} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.HIGHLIGHT} closable onClose={() => {
                      pendingTagsRef.current = (record.tagList ?? []).filter((_, j) => j !== i)
                    }} />
                  ))}
                </div>
              </div>
            )
          }
          return <TagsCellInner key={getDocumentTags(record).map(t => t.text).join('|')} tags={getDocumentTags(record)} />
        }
      }

      return col
    })

    visible.push({
      title: '', key: 'actions', width: editingKey ? 160 : 56,
      onCell: (record: MetadataDocument) => ({ style: { verticalAlign: 'top', backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined } }),
      render: (_: unknown, record: MetadataDocument) => {
        if (editingKey === record._id) {
          return <div style={{ display: 'flex', gap: 8 }}><ButtonPrimary onClick={() => saveEdit(record)}>Save</ButtonPrimary><ButtonTertiary onClick={cancelEdit}>Cancel</ButtonTertiary></div>
        }
        return (
          <Dropdown
            items={[
              { key: 'edit', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.EditRecOutlined} size={16} />Edit</span>, onClick: () => startEdit(record) },
              { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => {} },
              { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => onDocsChange(docs.filter(d => d._id !== record._id)) },
            ]}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
          </Dropdown>
        )
      },
    })

    return [checkboxCol, ...visible]
  }, [editingKey, selectedKeys, handleCellChange, startEdit, saveEdit, cancelEdit, filteredDocs, allSelected, someSelected, docSourceMap, docs, onDocsChange, space])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(3) }}>
        <Typography size="base" color="neutral-darken2">{filteredDocs.length} documents</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <div ref={searchBarWrapperRef} style={{ position: 'relative', width: 220 }}>
            <SearchBar
              placeholder="Dokumente durchsuchen"
              value={searchInput}
              onChange={v => { setSearchInput(v); setCurrentPage(1); if (!v) setShowDropdown(false); else setShowDropdown(true) }}
              onFocus={() => { if (searchInput.length >= 2) setShowDropdown(true) }}
            />
            {showDropdown && searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, width: 340, backgroundColor: colorPalette.white, border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
                {searchResults.map((doc, idx) => (
                  <div key={doc._id} style={{ padding: '10px 14px', cursor: 'pointer', borderTop: idx > 0 ? '1px solid #f0f0f0' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F9FF')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    onClick={() => { setAppliedQuery(searchInput); setShowDropdown(false) }}
                  >
                    <Typography size="base" color="neutral-darken5">{highlightAll(stripYear(doc.name), searchInput)}</Typography>
                    <Typography size="base-sm" color="neutral-darken2">{doc.documentType} · {formatDate(doc.uploadedDate)}</Typography>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={() => setUploadModalOpen(true)}>Upload or sync</ButtonPrimary>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <Table
            dataSource={pagedDocs}
            columns={columns as never}
            pagination={false}
            innerLoading={isSearching}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ components: { body: { cell: EditableCell } } } as any)}
            onRow={(record: MetadataDocument) => ({
              style: {
                height: 72,
                ...(editingKey === record._id ? { backgroundColor: '#F5F9FF' } : selectedKeys.has(record._id) ? { backgroundColor: '#EEF4FF' } : {}),
              },
            })}
          />
        </div>
        <div style={{ flexShrink: 0 }}>
          <Pagination current={currentPage} total={filteredDocs.length} pageSize={PAGE_SIZE} onChange={p => setCurrentPage(p)} />
        </div>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px 0` }}>
        <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
        <Typography size="base" color="neutral-darken2">
          All files are securely uploaded and scanned for viruses. <span style={{ color: colorPalette.blue.base, textDecoration: 'underline', cursor: 'pointer' }}>Learn more</span>
        </Typography>
      </div>

      {selectedKeys.size > 0 && (
        <div style={{ position: 'fixed', bottom: spacing(2), left: sidebarWidth + spacing(2), right: spacing(2), height: 56, backgroundColor: colorPalette.neutral.lighten1, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${spacing(6)}px`, zIndex: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(4) }}>
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setSelectedKeys(new Set())} />
            <Typography color="neutral-darken5">{selectedKeys.size} selected</Typography>
            <ButtonTertiary leftIcon={iconType.DownloadOutlined} onClick={() => {}}>Download</ButtonTertiary>
          </div>
          <ButtonDanger leftIcon={iconType.TrashOutlined} onClick={() => setDeleteModalOpen(true)}>Delete</ButtonDanger>
        </div>
      )}

      <Modal
        visible={deleteModalOpen}
        variant={modalVariants.DANGER}
        title={selectedKeys.size === 1 ? 'Delete Document' : 'Delete Documents'}
        onClose={() => setDeleteModalOpen(false)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: () => setDeleteModalOpen(false) } },
          { variant: buttonVariants.DANGER, props: { children: 'Delete', onClick: () => { onDocsChange(docs.filter(d => !selectedKeys.has(d._id))); setSelectedKeys(new Set()); setDeleteModalOpen(false); notification.default({ title: 'Documents deleted', placement: toastPlacements.BOTTOM_LEFT, duration: 3 }) } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">
          Delete <strong>{selectedKeys.size} document{selectedKeys.size !== 1 ? 's' : ''}</strong>? This cannot be undone.
        </Typography>
      </Modal>

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={newDocs => {
          onDocsChange([...newDocs, ...docs])
          notification.success({ title: `${newDocs.length} document${newDocs.length !== 1 ? 's' : ''} uploaded`, placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
        }}
      />
    </div>
  )
}

// ─── Chat panel ───────────────────────────────────────────────────────────────

function ChatBubble({ message, docs }: { message: ChatMessage; docs: MetadataDocument[] }) {
  const isUser = message.role === 'user'
  const citedDocs = (message.citedDocIds ?? []).map(id => docs.find(d => d._id === id)).filter(Boolean) as MetadataDocument[]

  return (
    <div style={{ display: 'flex', gap: spacing(3), flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
      {!isUser && <AssistantMark />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2), maxWidth: '78%', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        {message.attachments && message.attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
            {message.attachments.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, border: '1px solid #e0e0e0', backgroundColor: colorPalette.white }}>
                <Icon type={iconType.PaperclipOutlined} size={12} color="neutral-darken2" />
                <Typography size="base-sm" color="neutral-darken5">{a.name}</Typography>
              </div>
            ))}
          </div>
        )}
        {(message.content || message.pending) && (
          <div style={{
            padding: `${spacing(3)}px ${spacing(4)}px`,
            borderRadius: 12,
            backgroundColor: isUser ? colorPalette.blue.base : '#F3F4F6',
            color: isUser ? colorPalette.white : colorPalette.neutral.darken5,
          }}>
            {message.pending ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                <Spinner size="small" />
                <Typography size="base" color="neutral-darken2">Thinking…</Typography>
              </div>
            ) : (
              <Typography size="base" color={isUser ? 'white' : 'neutral-darken5'}>{renderLiteMarkdown(message.content)}</Typography>
            )}
          </div>
        )}
        {citedDocs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {citedDocs.map(d => (
              <Tooltip key={d._id} title={stripYear(d.name)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, border: '1px solid #e5e7eb', backgroundColor: '#FAFAFA', maxWidth: 220 }}>
                  <Icon type={iconType.NoteOutlined} size={12} color="neutral-darken2" />
                  <span style={{ fontSize: 12, color: colorPalette.neutral.darken3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stripYear(d.name)}</span>
                </div>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ChatPanel({ space, docs, sessions, activeSessionId, onNewChat, onSelectSession, onDeleteSession, onSend, emptyStateSize = 'large' }: {
  space: Space
  docs: MetadataDocument[]
  sessions: ChatSession[]
  activeSessionId: string | null
  onNewChat: () => void
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
  onSend: (text: string, files: File[]) => void
  emptyStateSize?: 'large' | 'compact'
}) {
  const activeSession = sessions.find(s => s.id === activeSessionId) ?? null
  const [input, setInput] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const historyWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [activeSession?.messages.length, activeSession?.messages[activeSession.messages.length - 1]?.content])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (historyWrapperRef.current && !historyWrapperRef.current.contains(e.target as Node)) setHistoryOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSend = (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text && pendingFiles.length === 0) return
    onSend(text, pendingFiles)
    setInput(''); setPendingFiles([])
  }

  const suggested = useMemo(() => getSuggestedPrompts(space, docs), [space, docs])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Top bar: history + new chat */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing(3), borderBottom: '1px solid #eee' }}>
        <div ref={historyWrapperRef} style={{ position: 'relative' }}>
          <ButtonTertiary leftIcon={iconType.HistoryOutlined} onClick={() => setHistoryOpen(o => !o)}>
            Recent chats{sessions.length > 0 ? ` (${sessions.length})` : ''}
          </ButtonTertiary>
          {historyOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, width: 300, maxHeight: 320, overflowY: 'auto', backgroundColor: colorPalette.white, border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200 }}>
              {sessions.length === 0 ? (
                <div style={{ padding: spacing(4) }}>
                  <Typography size="base-sm" color="neutral-darken2">No chats yet in this space.</Typography>
                </div>
              ) : sessions.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => { onSelectSession(s.id); setHistoryOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(2),
                    padding: '10px 14px', cursor: 'pointer', borderTop: idx > 0 ? '1px solid #f0f0f0' : 'none',
                    backgroundColor: s.id === activeSessionId ? '#F5F9FF' : 'transparent',
                  }}
                  onMouseEnter={e => { if (s.id !== activeSessionId) e.currentTarget.style.backgroundColor = '#FAFAFA' }}
                  onMouseLeave={e => { if (s.id !== activeSessionId) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{s.title}</Typography>
                    </div>
                    <Typography size="base-sm" color="neutral-darken2">{s.messages.filter(m => !m.pending).length} messages · {relativeTime(s.updatedAt)}</Typography>
                  </div>
                  <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={e => { e.stopPropagation(); onDeleteSession(s.id) }} />
                </div>
              ))}
            </div>
          )}
        </div>
        <ButtonSecondary leftIcon={iconType.PlusOutlined} onClick={onNewChat}>New chat</ButtonSecondary>
      </div>

      {/* Message area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: `${spacing(4)}px 0`, display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        {!activeSession || activeSession.messages.length === 0 ? (
          <div style={{
            flex: emptyStateSize === 'large' ? 1 : undefined,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            gap: spacing(3), padding: `${spacing(emptyStateSize === 'large' ? 8 : 4)}px ${spacing(4)}px`,
          }}>
            <AssistantMark size={emptyStateSize === 'large' ? 40 : 28} />
            <div>
              <Typography size={emptyStateSize === 'large' ? 'heading-md' : 'base'} weight={fontWeight.SEMIBOLD}>Ask anything about {space.name}</Typography>
              <Typography size="base-sm" color="neutral-darken2">
                I can summarize, compare, or find details across the {docs.length} document{docs.length !== 1 ? 's' : ''} in this space.
              </Typography>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2), justifyContent: 'center', maxWidth: 520 }}>
              {suggested.map((p, i) => (
                <div
                  key={i}
                  onClick={() => handleSend(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, border: '1px solid #e0e0e0', cursor: 'pointer', backgroundColor: colorPalette.white, transition: 'border-color 0.15s, background-color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = colorPalette.blue.base; e.currentTarget.style.backgroundColor = '#F5F9FF' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.backgroundColor = colorPalette.white }}
                >
                  <Icon type={iconType.CommentOutlined} size={16} color="primary-base" />
                  <Typography size="base-sm" color="neutral-darken5">{p}</Typography>
                </div>
              ))}
            </div>
          </div>
        ) : (
          activeSession.messages.map(m => <ChatBubble key={m.id} message={m} docs={docs} />)
        )}
      </div>

      {/* Composer */}
      <div style={{ flexShrink: 0, borderTop: '1px solid #eee', paddingTop: spacing(3), display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
        {pendingFiles.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {pendingFiles.map((f, i) => (
              <Chip key={i} label={f.name} closable onClose={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: spacing(2) }}>
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.PaperclipOutlined} onClick={() => fileInputRef.current?.click()} />
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={e => {
            if (e.target.files) setPendingFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])
            e.target.value = ''
          }} />
          <div style={{ flex: 1 }}>
            <TextArea
              name="chat-input"
              value={input}
              placeholder={`Ask a question about ${space.name}…`}
              autoSize={{ minRows: 1, maxRows: 5 }}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            />
          </div>
          <ButtonPrimary shape={buttonShapes.SQUARE} leftIcon={iconType.SendOutlined} onClick={() => handleSend()} disabled={!input.trim() && pendingFiles.length === 0} />
        </div>
      </div>
    </div>
  )
}

// ─── Workspace state hook (spaces + docs + chat sessions, shared by all layouts) ─

let msgCounter = 0
function nextId(prefix: string) { msgCounter += 1; return `${prefix}-${Date.now()}-${msgCounter}` }

export function useWorkspaceState() {
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES)
  const [docsBySpace, setDocsBySpace] = useState<Record<string, MetadataDocument[]>>(() => {
    const map: Record<string, MetadataDocument[]> = {}
    INITIAL_SPACES.forEach(s => { map[s.id] = seedDocsForSpace(s.id) })
    return map
  })
  const [sessionsBySpace, setSessionsBySpace] = useState<Record<string, ChatSession[]>>(() => {
    const map: Record<string, ChatSession[]> = {}
    INITIAL_SPACES.forEach(s => { map[s.id] = generateSessionsForSpace(s, docsBySpace[s.id] ?? seedDocsForSpace(s.id)) })
    return map
  })
  const [activeSessionBySpace, setActiveSessionBySpace] = useState<Record<string, string | null>>({})
  const { notification } = useNotifications()

  const getSpaceDocs = useCallback((id: string) => docsBySpace[id] ?? [], [docsBySpace])

  const setSpaceDocs = useCallback((spaceId: string, docs: MetadataDocument[]) => {
    setDocsBySpace(prev => ({ ...prev, [spaceId]: docs }))
  }, [])

  const addDocsToSpace = useCallback((spaceId: string, newDocs: MetadataDocument[]) => {
    setDocsBySpace(prev => ({ ...prev, [spaceId]: [...newDocs, ...(prev[spaceId] ?? [])] }))
  }, [])

  const createSpace = useCallback((values: SpaceFormValues) => {
    const id = nextId('space')
    setSpaces(prev => [...prev, { id, connectors: [], ...values }])
    setDocsBySpace(prev => ({ ...prev, [id]: [] }))
    notification.success({ title: `"${values.name}" created`, placement: toastPlacements.BOTTOM_LEFT, duration: 3 })
    return id
  }, [notification])

  const updateSpace = useCallback((id: string, values: SpaceFormValues) => {
    setSpaces(prev => prev.map(s => s.id === id ? { ...s, ...values } : s))
    notification.success({ title: `"${values.name}" updated`, placement: toastPlacements.BOTTOM_LEFT, duration: 3 })
  }, [notification])

  const updateSpaceContext = useCallback((id: string, context: string) => {
    setSpaces(prev => prev.map(s => s.id === id ? { ...s, context } : s))
    notification.success({ title: 'Context saved', placement: toastPlacements.BOTTOM_LEFT, duration: 3 })
  }, [notification])

  const deleteSpace = useCallback((id: string) => {
    setSpaces(prev => prev.filter(s => s.id !== id))
    setDocsBySpace(prev => { const next = { ...prev }; delete next[id]; return next })
    setSessionsBySpace(prev => { const next = { ...prev }; delete next[id]; return next })
    setActiveSessionBySpace(prev => { const next = { ...prev }; delete next[id]; return next })
  }, [])

  const newChat = useCallback((spaceId: string) => {
    const id = nextId('chat')
    const session: ChatSession = { id, title: 'New chat', messages: [], updatedAt: Date.now() }
    setSessionsBySpace(prev => ({ ...prev, [spaceId]: [session, ...(prev[spaceId] ?? [])] }))
    setActiveSessionBySpace(prev => ({ ...prev, [spaceId]: id }))
  }, [])

  const selectChat = useCallback((spaceId: string, chatId: string) => {
    setActiveSessionBySpace(prev => ({ ...prev, [spaceId]: chatId }))
  }, [])

  const deleteChat = useCallback((spaceId: string, chatId: string) => {
    setSessionsBySpace(prev => ({ ...prev, [spaceId]: (prev[spaceId] ?? []).filter(s => s.id !== chatId) }))
    setActiveSessionBySpace(prev => (prev[spaceId] === chatId ? { ...prev, [spaceId]: null } : prev))
  }, [])

  const updateSession = useCallback((spaceId: string, chatId: string, updater: (s: ChatSession) => ChatSession) => {
    setSessionsBySpace(prev => ({ ...prev, [spaceId]: (prev[spaceId] ?? []).map(s => s.id === chatId ? updater(s) : s) }))
  }, [])

  /** docs: the space's CURRENT doc list (as known by the caller) — avoids stale-closure lookups inside the async reply. */
  /**
   * activeSessionId is passed in explicitly (rather than read from state inside this
   * callback) so this never has to call one state setter from inside another
   * setter's updater — that pattern can starve React's scheduler.
   */
  const sendMessage = useCallback((spaceId: string, docs: MetadataDocument[], activeSessionId: string | null, text: string, outgoing: OutgoingAttachment[]) => {
    const chatId = activeSessionId ?? nextId('chat')

    const attachmentNames = outgoing.map(a => a.kind === 'file' ? a.file.name : stripYear(a.doc.name))
    const attachments: ChatAttachment[] = outgoing.map(a => a.kind === 'file'
      ? { id: nextId('att'), name: a.file.name, format: guessFormat(a.file.name), size: formatFileSize(a.file.size), source: 'local' }
      : { id: nextId('att'), name: stripYear(a.doc.name), format: a.doc.fileFormat, size: a.doc.fileSize, source: a.source })
    const userMsg: ChatMessage = { id: nextId('msg'), role: 'user', content: text, attachments: attachments.length ? attachments : undefined }
    const pendingMsg: ChatMessage = { id: nextId('msg'), role: 'assistant', content: '', pending: true }

    setSessionsBySpace(prev => {
      const existing = prev[spaceId] ?? []
      const base = existing.find(s => s.id === chatId) ?? { id: chatId, title: 'New chat', messages: [], updatedAt: Date.now() }
      const updated: ChatSession = {
        ...base,
        title: base.messages.length === 0 ? (text ? text.slice(0, 48) : (attachmentNames[0] ?? 'New chat')) : base.title,
        messages: [...base.messages, userMsg, pendingMsg],
        updatedAt: Date.now(),
      }
      return { ...prev, [spaceId]: [updated, ...existing.filter(s => s.id !== chatId)] }
    })

    if (!activeSessionId) setActiveSessionBySpace(prev => ({ ...prev, [spaceId]: chatId }))

    setTimeout(() => {
      const reply = generateAssistantReply(text || `About ${attachmentNames.join(', ')}`, docs)
      const content = outgoing.length > 0
        ? generateAttachmentReply(attachmentNames) + (text ? '\n\n' + reply.content : '')
        : reply.content
      updateSession(spaceId, chatId, s => ({
        ...s,
        messages: s.messages.map(m => m.id === pendingMsg.id ? { ...m, content, pending: false, citedDocIds: reply.citedDocIds } : m),
        updatedAt: Date.now(),
      }))
    }, 1100)

    return chatId
  }, [updateSession])

  return {
    spaces, createSpace, updateSpace, updateSpaceContext, deleteSpace,
    getSpaceDocs, setSpaceDocs, addDocsToSpace,
    sessionsBySpace, activeSessionBySpace, newChat, selectChat, deleteChat, sendMessage,
  }
}

/** Tracks the live Layout sidebar width so fixed-position bars (bulk action bar) line up next to it. */
export function useSidebarWidth() {
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_COLLAPSED_WIDTH)
  useEffect(() => {
    const sidebar = document.getElementById(LAYOUT_SIDEBAR_ID)
    if (!sidebar) return
    setSidebarWidth(sidebar.getBoundingClientRect().width)
    const observer = new ResizeObserver(e => setSidebarWidth(e[0].contentRect.width))
    observer.observe(sidebar)
    return () => observer.disconnect()
  }, [])
  return sidebarWidth
}

export function useMountLoading(delayMs = 600) {
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), delayMs)
    return () => clearTimeout(t)
  }, [])
  return isLoading
}

export { Skeleton, skeletonVariants, type MetadataDocument }
