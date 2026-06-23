import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type Key } from 'react'
import {
  ButtonDanger,
  ButtonGhost,
  buttonShapes,
  ButtonPrimary,
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
  Select,
  SearchBar,
  SIDEBAR_COLLAPSED_WIDTH,
  Skeleton,
  skeletonVariants,
  Spinner,
  Table,
  toastPlacements,
  Tooltip,
  Tree,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { documents, type MetadataDocument, type FileFormat } from '../bulk-edit/documents'

const { colorPalette, spacing, fontWeight } = constants
const PAGE_SIZE = 10

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnectorType = 'sharepoint' | 'onedrive' | 'datev' | 'google-drive'

type Connector = {
  id: string
  type: ConnectorType
  label: string
  syncedCount: number
  lastSync: string
}

type Space = {
  id: string
  name: string
  description: string
  color: string
  connectors: Connector[]
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MY_DOCS_SPACE_ID = 'space-my-docs'

const SPACE_COLORS = ['#0066cc', '#7c3aed', '#059669', '#d97706', '#dc2626']

type IntegrationFileMeta = { name: string; size: string; format: FileFormat; modified: string }

const INTEGRATION_FILE_META: Record<string, IntegrationFileMeta> = {
  // SharePoint
  'sp-emp-handbook':  { name: 'Employee Handbook 2024',          size: '2.3 MB', format: 'PDF',  modified: '2024-03-10' },
  'sp-salary-policy': { name: 'Salary Policy Germany',           size: '1.1 MB', format: 'DOCX', modified: '2024-02-28' },
  'sp-relocation':    { name: 'Relocation Guide EU 2024',        size: '1.8 MB', format: 'PDF',  modified: '2024-01-15' },
  'sp-homeoffice':    { name: 'HomeOffice Policy',               size: '0.9 MB', format: 'PDF',  modified: '2024-03-05' },
  'sp-tax-treaty':    { name: 'Tax Treaty Guide Germany-France', size: '3.2 MB', format: 'PDF',  modified: '2024-02-12' },
  'sp-payroll-tax':   { name: 'Payroll Tax Guidance 2024',       size: '1.4 MB', format: 'DOCX', modified: '2024-03-01' },
  'sp-compliance':    { name: 'Compliance Guide 2024',           size: '2.8 MB', format: 'PDF',  modified: '2024-03-08' },
  // OneDrive
  'od-charter':       { name: 'Project Charter',      size: '0.8 MB', format: 'DOCX', modified: '2024-02-15' },
  'od-budget':        { name: 'Budget Overview Q1',   size: '1.2 MB', format: 'XLSX', modified: '2024-03-20' },
  'od-meeting':       { name: 'Meeting Notes March',  size: '0.3 MB', format: 'DOCX', modified: '2024-03-28' },
  'od-risk':          { name: 'Risk Assessment 2024', size: '0.7 MB', format: 'PDF',  modified: '2024-01-10' },
  'od-timeline':      { name: 'Project Timeline',     size: '0.5 MB', format: 'XLSX', modified: '2024-03-15' },
  // Google Drive
  'gd-proposal':      { name: 'Client Proposal 2024',     size: '1.5 MB', format: 'PDF',  modified: '2024-01-20' },
  'gd-review':        { name: 'Q1 Review Presentation',   size: '4.2 MB', format: 'PDF',  modified: '2024-04-01' },
  'gd-legal':         { name: 'Legal Framework Overview', size: '0.9 MB', format: 'DOCX', modified: '2024-02-08' },
  'gd-onboarding':    { name: 'Client Onboarding Guide',  size: '1.1 MB', format: 'PDF',  modified: '2024-03-12' },
  // Datev
  'dv-lohn-mar':      { name: 'Lohnabrechnung März 2024',    size: '0.4 MB', format: 'PDF', modified: '2024-03-31' },
  'dv-lohn-feb':      { name: 'Lohnabrechnung Februar 2024', size: '0.4 MB', format: 'PDF', modified: '2024-02-29' },
  'dv-buchung-q1':    { name: 'Buchungsjournal Q1 2024',     size: '1.1 MB', format: 'PDF', modified: '2024-04-05' },
  'dv-jahres-2023':   { name: 'Jahresabschluss 2023',        size: '2.3 MB', format: 'PDF', modified: '2024-01-31' },
}

const FOLDER_LABELS: Record<string, string> = {
  'sp-folder-hr':         'HR Documents',
  'sp-folder-tax':        'Tax & Compliance',
  'sp-folder-compliance': 'Compliance',
  'od-folder-docs':       'Documents',
  'od-folder-planning':   'Planning',
  'gd-folder-clients':    'Client Files',
  'gd-folder-shared':     'Shared Drive',
  'dv-folder-2024':       '2024',
  'dv-folder-2023':       '2023',
}

type RawNode = { key: string; children?: RawNode[] }

const CONNECTOR_TREE: Record<ConnectorType, RawNode[]> = {
  'sharepoint': [
    { key: 'sp-folder-hr', children: [
      { key: 'sp-emp-handbook' }, { key: 'sp-salary-policy' }, { key: 'sp-relocation' }, { key: 'sp-homeoffice' },
    ]},
    { key: 'sp-folder-tax', children: [
      { key: 'sp-tax-treaty' }, { key: 'sp-payroll-tax' },
    ]},
    { key: 'sp-folder-compliance', children: [
      { key: 'sp-compliance' },
    ]},
  ],
  'onedrive': [
    { key: 'od-folder-docs', children: [
      { key: 'od-charter' }, { key: 'od-budget' }, { key: 'od-timeline' },
    ]},
    { key: 'od-folder-planning', children: [
      { key: 'od-meeting' }, { key: 'od-risk' },
    ]},
  ],
  'google-drive': [
    { key: 'gd-folder-clients', children: [
      { key: 'gd-proposal' }, { key: 'gd-onboarding' },
    ]},
    { key: 'gd-folder-shared', children: [
      { key: 'gd-review' }, { key: 'gd-legal' },
    ]},
  ],
  'datev': [
    { key: 'dv-folder-2024', children: [
      { key: 'dv-lohn-mar' }, { key: 'dv-lohn-feb' }, { key: 'dv-buchung-q1' },
    ]},
    { key: 'dv-folder-2023', children: [
      { key: 'dv-jahres-2023' },
    ]},
  ],
}

function collectLeafKeys(nodes: RawNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.children) collectLeafKeys(n.children, acc)
    else acc.push(n.key)
  }
  return acc
}

const CONNECTOR_LEAF_KEYS: Record<ConnectorType, Set<string>> = {
  'sharepoint':   new Set(collectLeafKeys(CONNECTOR_TREE['sharepoint'])),
  'onedrive':     new Set(collectLeafKeys(CONNECTOR_TREE['onedrive'])),
  'datev':        new Set(collectLeafKeys(CONNECTOR_TREE['datev'])),
  'google-drive': new Set(collectLeafKeys(CONNECTOR_TREE['google-drive'])),
}

const CONNECTOR_FILE_COUNTS: Record<ConnectorType, number> = {
  'sharepoint':   CONNECTOR_LEAF_KEYS['sharepoint'].size,
  'onedrive':     CONNECTOR_LEAF_KEYS['onedrive'].size,
  'datev':        CONNECTOR_LEAF_KEYS['datev'].size,
  'google-drive': CONNECTOR_LEAF_KEYS['google-drive'].size,
}

function guessFormat(filename: string): FileFormat {
  const ext = filename.split('.').pop()?.toUpperCase() ?? ''
  const known: FileFormat[] = ['PDF', 'DOCX', 'XLSX', 'PPTX']
  return (known.includes(ext as FileFormat) ? ext : 'PDF') as FileFormat
}

function localFileToDoc(file: File): MetadataDocument {
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
    fileSize: file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    fileFormat: guessFormat(file.name),
  }
}

function integrationKeyToDoc(key: string): MetadataDocument {
  const meta = INTEGRATION_FILE_META[key] ?? { name: key, size: '—', format: 'PDF' as FileFormat, modified: new Date().toISOString().split('T')[0] }
  return {
    _id: `int-${key}-${Date.now()}`,
    name: meta.name,
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
    uploadedDate: meta.modified,
    fileSize: meta.size,
    fileFormat: meta.format,
  }
}

const INITIAL_SPACES: Space[] = [
  {
    id: MY_DOCS_SPACE_ID,
    name: 'My documents',
    description: 'Your personal document library — upload and manage files directly',
    color: '#374151',
    connectors: [],
  },
  {
    id: 'space-acme',
    name: 'Acme Corp',
    description: 'Client documents for Acme Corp — tax advisory and compliance',
    color: '#0066cc',
    connectors: [
      { id: 'c1', type: 'sharepoint', label: 'Tax & Compliance', syncedCount: 6, lastSync: '2 hours ago' },
      { id: 'c2', type: 'google-drive', label: 'Shared Drive', syncedCount: 4, lastSync: '1 day ago' },
    ],
  },
  {
    id: 'space-alpha',
    name: 'Project Alpha',
    description: 'Internal project workspace — policy documentation and guidelines',
    color: '#7c3aed',
    connectors: [
      { id: 'c3', type: 'onedrive', label: 'Project Files', syncedCount: 3, lastSync: '30 minutes ago' },
    ],
  },
  {
    id: 'space-hr',
    name: 'Internal HR',
    description: 'HR policies, compliance guides, and employee documentation',
    color: '#059669',
    connectors: [
      { id: 'c4', type: 'sharepoint', label: 'HR Portal', syncedCount: 8, lastSync: '5 minutes ago' },
      { id: 'c5', type: 'datev', label: 'Payroll Exports', syncedCount: 2, lastSync: '3 days ago' },
    ],
  },
]

const SPACE_DOC_SLICES: Record<string, [number, number]> = {
  [MY_DOCS_SPACE_ID]: [0, 6],
  'space-acme':       [2, 10],
  'space-alpha':      [5, 13],
  'space-hr':         [9, 17],
}

const SHAREPOINT_SITES = [
  { id: 'site-hr',    name: 'HR Portal',       host: 'haufe.sharepoint.com/sites/hr',    docCount: 142 },
  { id: 'site-tax',   name: 'Tax & Compliance', host: 'haufe.sharepoint.com/sites/tax',   docCount: 87  },
  { id: 'site-legal', name: 'Legal Documents',  host: 'haufe.sharepoint.com/sites/legal', docCount: 234 },
]

const GDRIVE_FOLDERS = [
  { id: 'gd-shared',   name: 'Shared Drive',      path: 'My Drive / Shared' },
  { id: 'gd-clients',  name: 'Clients',            path: 'My Drive / Clients' },
  { id: 'gd-projects', name: 'Projects',           path: 'My Drive / Projects' },
]

const ONEDRIVE_FOLDERS = [
  { id: 'od-docs',     name: 'Documents',     path: 'OneDrive / Documents' },
  { id: 'od-projects', name: 'Projects',      path: 'OneDrive / Projects' },
]

// ─── Provider icons ───────────────────────────────────────────────────────────

function SharePointIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="4" fill="#0078D4"/>
      <text x="4" y="15" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" fill="white">S</text>
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

function DatevIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="4" fill="#E2001A"/>
      <text x="2" y="15" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="700" fill="white">DATEV</text>
    </svg>
  )
}

function GoogleDriveIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="4" fill="#fff" stroke="#e0e0e0"/>
      <polygon points="10,3 17,15 3,15" fill="none" stroke="#4285F4" strokeWidth="1.5"/>
      <polygon points="3,15 7,8 10,13" fill="#FBBC04" fillOpacity="0.9"/>
      <polygon points="10,13 13,8 17,15" fill="#34A853" fillOpacity="0.9"/>
      <polygon points="3,15 17,15 14.5,11" fill="#EA4335" fillOpacity="0.5"/>
    </svg>
  )
}

function MicrosoftIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <rect x="1"   y="1"   width="8.5" height="8.5" fill="#F25022"/>
      <rect x="10.5" y="1"   width="8.5" height="8.5" fill="#7FBA00"/>
      <rect x="1"   y="10.5" width="8.5" height="8.5" fill="#00A4EF"/>
      <rect x="10.5" y="10.5" width="8.5" height="8.5" fill="#FFB900"/>
    </svg>
  )
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.1 10.2c0-.6-.1-1.2-.2-1.8H10v3.4h4.5c-.2 1-.8 1.8-1.6 2.4v2h2.6c1.5-1.4 2.6-3.5 2.6-6z" fill="#4285F4"/>
      <path d="M10 18c2.2 0 4.1-.7 5.5-2l-2.6-2c-.7.5-1.7.8-2.9.8-2.2 0-4.1-1.5-4.8-3.5H2.5v2.1C3.9 16.3 6.8 18 10 18z" fill="#34A853"/>
      <path d="M5.2 11.3c-.2-.5-.3-1-.3-1.5s.1-1 .3-1.5V6.2H2.5C1.9 7.4 1.5 8.7 1.5 10s.4 2.6 1 3.8l2.7-2.5z" fill="#FBBC05"/>
      <path d="M10 5.3c1.2 0 2.3.4 3.2 1.2l2.4-2.4C14.1 2.7 12.2 2 10 2 6.8 2 3.9 3.7 2.5 6.2l2.7 2.1C5.9 6.8 7.8 5.3 10 5.3z" fill="#EA4335"/>
    </svg>
  )
}

function connectorIcon(type: ConnectorType, size = 20) {
  if (type === 'sharepoint')   return <SharePointIcon size={size} />
  if (type === 'onedrive')     return <OneDriveIcon size={size} />
  if (type === 'datev')        return <DatevIcon size={size} />
  return <GoogleDriveIcon size={size} />
}

function connectorLabel(type: ConnectorType) {
  if (type === 'sharepoint')  return 'SharePoint'
  if (type === 'onedrive')    return 'OneDrive'
  if (type === 'datev')       return 'Datev'
  return 'Google Drive'
}

const CONNECTOR_CHIP_STYLE: Record<ConnectorType, ChipStyleValue> = {
  'sharepoint':   chipStyles.ACCENT_BLUE,
  'onedrive':     chipStyles.ACCENT_BLUE,
  'datev':        chipStyles.ACCENT_PURPLE,
  'google-drive': chipStyles.ACCENT_NEUTRAL,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function stripYear(name: string) {
  return name.replace(/\s*\(\d{4}\)\s*/g, '').trim()
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

function getDocumentTags(doc: MetadataDocument) {
  const tags: { text: string; style: string }[] = []
  tags.push({ text: doc.domain, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.tagList?.length) tags.push(...doc.tagList.map(t => ({ ...t })))
  if (doc.namedEntity !== '—') tags.push({ text: doc.namedEntity, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.jurisdiction !== '—') tags.push({ text: doc.jurisdiction, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.lawType !== '—') tags.push({ text: doc.lawType, style: chipStyles.ACCENT_NEUTRAL })
  return tags
}

// ─── Tags cell ────────────────────────────────────────────────────────────────

type Tag = { text: string; style: string; variant?: string }

function TagsCellInner({ tags }: { tags: Tag[] }) {
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

const DOMAIN_OPTIONS = [
  { label: 'HR', value: 'HR' },
  { label: 'HR/Tax', value: 'HR/Tax' },
  { label: 'Tax', value: 'Tax' },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EditableCell({ editable, isEditing, dataIndex, initialValue, onValueChange, children, ...rest }: any) {
  const [val, setVal] = useState('')
  useEffect(() => { if (isEditing) setVal(String(initialValue ?? '')) }, [isEditing, initialValue])
  if (!editable) return <td {...rest}>{children}</td>
  return (
    <td {...rest}>
      {isEditing ? (
        <div onClick={e => e.stopPropagation()}>
          {dataIndex === 'domain'
            ? <Select name={dataIndex} value={val} options={DOMAIN_OPTIONS} onChange={v => { setVal(String(v)); onValueChange?.(dataIndex, String(v)) }} />
            : <Input name={dataIndex} value={val} onChange={e => { setVal(e.target.value); onValueChange?.(dataIndex, e.target.value) }} />
          }
        </div>
      ) : children}
    </td>
  )
}

// ─── Connector banner ─────────────────────────────────────────────────────────

function ConnectorBanner({ connector, onSync, onDisconnect }: {
  connector: Connector
  onSync: () => void
  onDisconnect: () => void
}) {
  return (
    <div style={{
      border: '1px solid #C3E6CB',
      borderRadius: 8,
      padding: `${spacing(3)}px ${spacing(4)}px`,
      backgroundColor: '#F0FAF3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing(3),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
        <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
          {connectorIcon(connector.type, 18)}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>
                {connectorLabel(connector.type)} — {connector.label}
              </Typography>
              <Chip label={`${connector.syncedCount} synced`} chipStyle={chipStyles.SEMANTIC_SUCCESS} variant={chipVariants.SUBTLE} />
            </div>
            <Typography size="base-sm" color="neutral-darken2">Last synced {connector.lastSync}</Typography>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
        <ButtonTertiary onClick={onSync} leftIcon={iconType.RefreshOutlined}>Sync now</ButtonTertiary>
        <Dropdown
          items={[{ key: 'disconnect', label: <span style={{ color: colorPalette.danger.darken2 }}>Disconnect</span>, onClick: onDisconnect }]}
          trigger={dropdownTriggers.CLICK}
          placement={dropdownPlacement.BOTTOM_RIGHT}
        >
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
        </Dropdown>
      </div>
    </div>
  )
}

// ─── Create space modal ───────────────────────────────────────────────────────

function CreateSpaceModal({ open, onClose, onCreate }: {
  open: boolean
  onClose: () => void
  onCreate: (name: string, description: string, color: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(SPACE_COLORS[0])

  useEffect(() => { if (!open) { setName(''); setDescription(''); setColor(SPACE_COLORS[0]) } }, [open])

  return (
    <Modal
      visible={open}
      title="Create a new space"
      onClose={onClose}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
        { variant: buttonVariants.PRIMARY, props: { children: 'Create space', onClick: () => onCreate(name.trim(), description.trim(), color), disabled: !name.trim() } },
      ]}}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Space name</Typography>
          <Input value={name} placeholder="e.g. Acme Corp, Project Alpha" onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Description <span style={{ fontWeight: 400, color: colorPalette.neutral.darken2 }}>(optional)</span></Typography>
          <Input value={description} placeholder="What is this space for?" onChange={e => setDescription(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Colour</Typography>
          <div style={{ display: 'flex', gap: spacing(2) }}>
            {SPACE_COLORS.map(c => (
              <div
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', backgroundColor: c, cursor: 'pointer',
                  outline: color === c ? `3px solid ${c}` : 'none',
                  outlineOffset: 2,
                  transition: 'outline 0.1s',
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(3)}px ${spacing(4)}px`, backgroundColor: '#F5F9FF', borderRadius: 8 }}>
          <Icon type={iconType.InfoCircleOutlined} size={16} color="primary-base" />
          <Typography size="base-sm" color="neutral-darken5">You can connect integrations after creating the space.</Typography>
        </div>
      </div>
    </Modal>
  )
}

// ─── Add connector modal ──────────────────────────────────────────────────────

type AddConnectorStep = 'pick' | 'auth-microsoft' | 'auth-google' | 'auth-datev' | 'authenticating' | 'configure-sp' | 'configure-od' | 'configure-gd' | 'configure-datev'

const PROVIDER_CARDS: { type: ConnectorType; name: string; description: string; icon: ReactNode }[] = [
  { type: 'sharepoint',   name: 'SharePoint',   description: 'Import and sync documents from Microsoft SharePoint sites', icon: <SharePointIcon size={28} /> },
  { type: 'onedrive',     name: 'OneDrive',     description: 'Access files stored in personal or shared OneDrive folders', icon: <OneDriveIcon size={28} /> },
  { type: 'datev',        name: 'Datev',        description: 'Connect to Datev for payroll and accounting exports', icon: <DatevIcon size={28} /> },
  { type: 'google-drive', name: 'Google Drive', description: 'Import documents from Google Drive folders', icon: <GoogleDriveIcon size={28} /> },
]

function AddConnectorModal({ open, onClose, onConnected }: {
  open: boolean
  onClose: () => void
  onConnected: (connector: Omit<Connector, 'id'>) => void
}) {
  const [step, setStep] = useState<AddConnectorStep>('pick')
  const [selectedType, setSelectedType] = useState<ConnectorType | null>(null)
  const [selectedSite, setSelectedSite] = useState<string | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [datevApiKey, setDatevApiKey] = useState('')
  const [datevOrg, setDatevOrg] = useState('')

  useEffect(() => {
    if (!open) {
      setStep('pick'); setSelectedType(null); setSelectedSite(null)
      setSelectedFolder(null); setDatevApiKey(''); setDatevOrg('')
    }
  }, [open])

  const handlePickProvider = (type: ConnectorType) => {
    setSelectedType(type)
    if (type === 'sharepoint' || type === 'onedrive') setStep('auth-microsoft')
    else if (type === 'google-drive') setStep('auth-google')
    else setStep('auth-datev')
  }

  const handleAuth = () => {
    setStep('authenticating')
    setTimeout(() => {
      if (selectedType === 'sharepoint') setStep('configure-sp')
      else if (selectedType === 'onedrive') setStep('configure-od')
      else if (selectedType === 'google-drive') setStep('configure-gd')
      else setStep('configure-datev')
    }, 1800)
  }

  const handleConnect = () => {
    let label = ''
    if (selectedType === 'sharepoint') label = SHAREPOINT_SITES.find(s => s.id === selectedSite)?.name ?? ''
    else if (selectedType === 'onedrive') label = ONEDRIVE_FOLDERS.find(f => f.id === selectedFolder)?.name ?? ''
    else if (selectedType === 'google-drive') label = GDRIVE_FOLDERS.find(f => f.id === selectedFolder)?.name ?? ''
    else label = datevOrg || 'Datev'
    onConnected({ type: selectedType!, label, syncedCount: 0, lastSync: 'just now' })
  }

  const canConnect =
    (selectedType === 'sharepoint' && !!selectedSite) ||
    (selectedType === 'onedrive' && !!selectedFolder) ||
    (selectedType === 'google-drive' && !!selectedFolder) ||
    (selectedType === 'datev' && !!datevApiKey && !!datevOrg)

  const title =
    step === 'pick'            ? 'Add an integration' :
    step === 'auth-microsoft'  ? `Connect ${connectorLabel(selectedType!)}` :
    step === 'auth-google'     ? 'Connect Google Drive' :
    step === 'auth-datev'      ? 'Connect Datev' :
    step === 'authenticating'  ? 'Connecting…' :
    step === 'configure-sp'    ? 'Select a SharePoint site' :
    step === 'configure-od'    ? 'Select an OneDrive folder' :
    step === 'configure-gd'    ? 'Select a Google Drive folder' :
    'Configure Datev'

  return (
    <Modal
      visible={open}
      title={title}
      onClose={step !== 'authenticating' ? onClose : undefined}
      footer={step === 'authenticating' || step === 'pick' ? undefined : {
        buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Back', onClick: () => setStep('pick') } },
          step === 'auth-microsoft' || step === 'auth-google'
            ? { variant: buttonVariants.PRIMARY, props: { children: `Sign in`, onClick: handleAuth } }
            : step === 'auth-datev'
            ? { variant: buttonVariants.PRIMARY, props: { children: 'Verify & connect', onClick: handleAuth, disabled: !datevApiKey || !datevOrg } }
            : { variant: buttonVariants.PRIMARY, props: { children: 'Connect', onClick: handleConnect, disabled: !canConnect } },
        ],
      }}
    >
      {/* Step: pick provider */}
      {step === 'pick' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing(3) }}>
          {PROVIDER_CARDS.map(p => (
            <div
              key={p.type}
              onClick={() => handlePickProvider(p.type)}
              style={{
                border: '1.5px solid #e0e0e0', borderRadius: 10, padding: `${spacing(4)}px`,
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: spacing(3),
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#0066cc'; (e.currentTarget as HTMLDivElement).style.backgroundColor = '#F5F9FF' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e0e0e0'; (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.icon}
              </div>
              <div>
                <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{p.name}</Typography>
                <Typography size="base-sm" color="neutral-darken2">{p.description}</Typography>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step: Microsoft auth */}
      {(step === 'auth-microsoft') && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(5), padding: `${spacing(4)}px 0` }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {connectorIcon(selectedType!, 28)}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Sign in with Microsoft</Typography>
            <Typography size="base" color="neutral-darken2">Grant access to your {connectorLabel(selectedType!)} account.</Typography>
          </div>
          <div style={{
            border: '1px solid #e0e0e0', borderRadius: 8, padding: `${spacing(3)}px ${spacing(5)}px`,
            display: 'flex', alignItems: 'center', gap: spacing(3),
            cursor: 'pointer', backgroundColor: colorPalette.white,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', width: '100%', maxWidth: 280,
          }} onClick={handleAuth}>
            <MicrosoftIcon />
            <Typography size="base" color="neutral-darken5">Sign in with Microsoft</Typography>
          </div>
          <Typography size="base-sm" color="neutral-darken2">Your credentials are never stored by this app.</Typography>
        </div>
      )}

      {/* Step: Google auth */}
      {step === 'auth-google' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(5), padding: `${spacing(4)}px 0` }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GoogleDriveIcon size={28} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Sign in with Google</Typography>
            <Typography size="base" color="neutral-darken2">Grant access to browse your Google Drive folders.</Typography>
          </div>
          <div style={{
            border: '1px solid #e0e0e0', borderRadius: 8, padding: `${spacing(3)}px ${spacing(5)}px`,
            display: 'flex', alignItems: 'center', gap: spacing(3),
            cursor: 'pointer', backgroundColor: colorPalette.white,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', width: '100%', maxWidth: 280,
          }} onClick={handleAuth}>
            <GoogleIcon />
            <Typography size="base" color="neutral-darken5">Sign in with Google</Typography>
          </div>
          <Typography size="base-sm" color="neutral-darken2">Your credentials are never stored by this app.</Typography>
        </div>
      )}

      {/* Step: Datev credentials */}
      {step === 'auth-datev' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
            <DatevIcon size={28} />
            <Typography size="base" color="neutral-darken2">Enter your Datev API credentials to connect this space.</Typography>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Organisation / Mandant</Typography>
            <Input value={datevOrg} placeholder="e.g. Haufe Group 12345" onChange={e => setDatevOrg(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>API Key</Typography>
            <Input value={datevApiKey} placeholder="Paste your Datev API key" onChange={e => setDatevApiKey(e.target.value)} />
          </div>
        </div>
      )}

      {/* Step: authenticating */}
      {step === 'authenticating' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(4), padding: `${spacing(6)}px 0` }}>
          <Spinner />
          <Typography size="base" color="neutral-darken2">Authenticating…</Typography>
        </div>
      )}

      {/* Step: configure SharePoint */}
      {step === 'configure-sp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px ${spacing(3)}px`, backgroundColor: '#F0FAF0', borderRadius: 8 }}>
            <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
            <Typography size="base-sm" color="neutral-darken5">Connected as <strong>james.bassett@haufe.com</strong></Typography>
          </div>
          <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Choose a SharePoint site</Typography>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            {SHAREPOINT_SITES.map(site => (
              <div
                key={site.id}
                onClick={() => setSelectedSite(site.id)}
                style={{
                  border: `1.5px solid ${selectedSite === site.id ? colorPalette.blue.base : '#e0e0e0'}`,
                  borderRadius: 8, padding: `${spacing(3)}px ${spacing(4)}px`, cursor: 'pointer',
                  backgroundColor: selectedSite === site.id ? '#F0F7FF' : colorPalette.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
                  <SharePointIcon />
                  <div>
                    <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{site.name}</Typography>
                    <Typography size="base-sm" color="neutral-darken2">{site.host}</Typography>
                  </div>
                </div>
                <Typography size="base-sm" color="neutral-darken2">{site.docCount} docs</Typography>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: configure OneDrive */}
      {step === 'configure-od' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px ${spacing(3)}px`, backgroundColor: '#F0FAF0', borderRadius: 8 }}>
            <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
            <Typography size="base-sm" color="neutral-darken5">Connected as <strong>james.bassett@haufe.com</strong></Typography>
          </div>
          <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Select a folder</Typography>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            {ONEDRIVE_FOLDERS.map(f => (
              <div
                key={f.id}
                onClick={() => setSelectedFolder(f.id)}
                style={{
                  border: `1.5px solid ${selectedFolder === f.id ? colorPalette.blue.base : '#e0e0e0'}`,
                  borderRadius: 8, padding: `${spacing(3)}px ${spacing(4)}px`, cursor: 'pointer',
                  backgroundColor: selectedFolder === f.id ? '#F0F7FF' : colorPalette.white,
                  display: 'flex', alignItems: 'center', gap: spacing(3),
                }}
              >
                <OneDriveIcon />
                <div>
                  <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{f.name}</Typography>
                  <Typography size="base-sm" color="neutral-darken2">{f.path}</Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: configure Google Drive */}
      {step === 'configure-gd' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px ${spacing(3)}px`, backgroundColor: '#F0FAF0', borderRadius: 8 }}>
            <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
            <Typography size="base-sm" color="neutral-darken5">Connected as <strong>james.bassett@gmail.com</strong></Typography>
          </div>
          <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Select a folder</Typography>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            {GDRIVE_FOLDERS.map(f => (
              <div
                key={f.id}
                onClick={() => setSelectedFolder(f.id)}
                style={{
                  border: `1.5px solid ${selectedFolder === f.id ? colorPalette.blue.base : '#e0e0e0'}`,
                  borderRadius: 8, padding: `${spacing(3)}px ${spacing(4)}px`, cursor: 'pointer',
                  backgroundColor: selectedFolder === f.id ? '#F0F7FF' : colorPalette.white,
                  display: 'flex', alignItems: 'center', gap: spacing(3),
                }}
              >
                <GoogleDriveIcon />
                <div>
                  <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{f.name}</Typography>
                  <Typography size="base-sm" color="neutral-darken2">{f.path}</Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: configure Datev */}
      {step === 'configure-datev' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px ${spacing(3)}px`, backgroundColor: '#F0FAF0', borderRadius: 8 }}>
            <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
            <Typography size="base-sm" color="neutral-darken5">Datev API verified — <strong>{datevOrg}</strong></Typography>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Sync frequency</Typography>
            <Select
              name="sync-freq"
              value="daily"
              options={[
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Manual only', value: 'manual' },
              ]}
              onChange={() => {}}
            />
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Integration file tree helpers ───────────────────────────────────────────

function IntegrationFileLabel({ id }: { id: string }) {
  const meta = INTEGRATION_FILE_META[id]
  if (!meta) return <span>{id}</span>
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', paddingRight: 8 }}>
      <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {meta.name}.{meta.format.toLowerCase()}
      </span>
      <span style={{ fontSize: 12, color: colorPalette.neutral.darken2, flexShrink: 0 }}>{meta.size}</span>
      <span style={{ fontSize: 12, color: colorPalette.neutral.darken2, flexShrink: 0, minWidth: 72 }}>
        {new Date(meta.modified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    </div>
  )
}

function buildTreeItems(nodes: RawNode[]): object[] {
  return nodes.map(n => {
    if (n.children) {
      return { key: n.key, title: FOLDER_LABELS[n.key] ?? n.key, children: buildTreeItems(n.children) }
    }
    return { key: n.key, title: <IntegrationFileLabel id={n.key} />, isLeaf: true }
  })
}

// ─── Upload modal ─────────────────────────────────────────────────────────────

type UploadTab = 'computer' | 'integration'

function UploadModal({ open, onClose, connectors, onUpload }: {
  open: boolean
  onClose: () => void
  connectors: Connector[]
  onUpload: (docs: MetadataDocument[]) => void
}) {
  const [tab, setTab] = useState<UploadTab>('computer')
  const [queuedFiles, setQueuedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [browsingConnector, setBrowsingConnector] = useState<Connector | null>(null)
  const [checkedTreeKeys, setCheckedTreeKeys] = useState<Key[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setTab('computer'); setQueuedFiles([]); setBrowsingConnector(null); setCheckedTreeKeys([]); setIsDragging(false)
    }
  }, [open])

  const addFiles = (list: FileList | null) => {
    if (!list) return
    setQueuedFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...Array.from(list).filter(f => !existing.has(f.name))]
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files)
  }

  const handleUploadComputer = () => {
    onUpload(queuedFiles.map(localFileToDoc))
    onClose()
  }

  const handleCheck = (checked: Key[] | { checked: Key[]; halfChecked: Key[] }) => {
    setCheckedTreeKeys(Array.isArray(checked) ? checked : checked.checked)
  }

  const leafKeys = browsingConnector ? CONNECTOR_LEAF_KEYS[browsingConnector.type] : new Set<string>()
  const selectedLeafKeys = (checkedTreeKeys as string[]).filter(k => leafKeys.has(k))

  const handleImportIntegration = () => {
    onUpload(selectedLeafKeys.map(integrationKeyToDoc))
    onClose()
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: `${spacing(2)}px ${spacing(4)}px`,
    borderBottom: `2px solid ${active ? colorPalette.blue.base : 'transparent'}`,
    color: active ? colorPalette.blue.base : colorPalette.neutral.darken3,
    fontWeight: active ? fontWeight.SEMIBOLD : fontWeight.REGULAR,
    cursor: 'pointer',
    fontSize: 14,
    userSelect: 'none',
  })

  const footerButtons = tab === 'computer'
    ? [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
        { variant: buttonVariants.PRIMARY, props: { children: queuedFiles.length > 0 ? `Upload ${queuedFiles.length} file${queuedFiles.length !== 1 ? 's' : ''}` : 'Upload', onClick: handleUploadComputer, disabled: queuedFiles.length === 0 } },
      ]
    : browsingConnector
    ? [
        { variant: buttonVariants.GHOST, props: { children: 'Back', onClick: () => { setBrowsingConnector(null); setCheckedTreeKeys([]) } } },
        { variant: buttonVariants.PRIMARY, props: { children: selectedLeafKeys.length > 0 ? `Import ${selectedLeafKeys.length} file${selectedLeafKeys.length !== 1 ? 's' : ''}` : 'Import', onClick: handleImportIntegration, disabled: selectedLeafKeys.length === 0 } },
      ]
    : [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
      ]

  return (
    <Modal
      visible={open}
      title="Upload documents"
      onClose={onClose}
      footer={{ buttons: footerButtons }}
    >
      {/* Tabs — only show if space has connectors */}
      {connectors.length > 0 && (
        <div style={{ display: 'flex', borderBottom: `1px solid #e0e0e0`, marginBottom: spacing(4), gap: 0 }}>
          <div style={tabStyle(tab === 'computer')} onClick={() => { setTab('computer'); setBrowsingConnector(null) }}>
            From your computer
          </div>
          <div style={tabStyle(tab === 'integration')} onClick={() => setTab('integration')}>
            From integration
          </div>
        </div>
      )}

      {/* ── Tab: computer ── */}
      {tab === 'computer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? colorPalette.blue.base : '#d0d5dd'}`,
              borderRadius: 10,
              padding: `${spacing(8)}px ${spacing(4)}px`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(2),
              cursor: 'pointer',
              backgroundColor: isDragging ? '#F0F7FF' : '#FAFAFA',
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

          {/* File list */}
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
      )}

      {/* ── Tab: integration — connector list ── */}
      {tab === 'integration' && !browsingConnector && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          <Typography size="base-sm" color="neutral-darken2">Choose an integration to browse and select files to import.</Typography>
          {connectors.map(c => (
            <div
              key={c.id}
              onClick={() => { setBrowsingConnector(c); setCheckedTreeKeys([]) }}
              style={{
                border: '1.5px solid #e0e0e0', borderRadius: 10, padding: `${spacing(3)}px ${spacing(4)}px`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#0066cc'; (e.currentTarget as HTMLDivElement).style.backgroundColor = '#F5F9FF' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e0e0e0'; (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
                {connectorIcon(c.type, 20)}
                <div>
                  <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{connectorLabel(c.type)} — {c.label}</Typography>
                  <Typography size="base-sm" color="neutral-darken2">{CONNECTOR_FILE_COUNTS[c.type]} files available</Typography>
                </div>
              </div>
              <Icon type={iconType.ChevronRightOutlined} size={16} color="neutral-darken2" />
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: integration — file tree ── */}
      {tab === 'integration' && browsingConnector && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <button
              onClick={() => { setBrowsingConnector(null); setCheckedTreeKeys([]) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: spacing(1), color: colorPalette.blue.base }}
            >
              <Icon type={iconType.ChevronLeftOutlined} size={12} color="primary-base" />
              <Typography size="base-sm" color="primary-base">All integrations</Typography>
            </button>
            <Typography size="base-sm" color="neutral-darken2">›</Typography>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              {connectorIcon(browsingConnector.type, 16)}
              <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{browsingConnector.label}</Typography>
            </div>
          </div>

          {/* File tree */}
          <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: `${spacing(2)}px ${spacing(1)}px`, minHeight: 200, maxHeight: 340, overflowY: 'auto' }}>
            <Tree
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items={buildTreeItems(CONNECTOR_TREE[browsingConnector.type]) as any}
              checkable
              defaultExpandAll
              checkedKeys={checkedTreeKeys as string[]}
              onCheck={handleCheck}
            />
          </div>

          {/* Selection summary */}
          {selectedLeafKeys.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px ${spacing(3)}px`, backgroundColor: '#F0F7FF', borderRadius: 8 }}>
              <Icon type={iconType.CheckCircleFilled} color="primary-base" size={16} />
              <Typography size="base-sm" color="neutral-darken5">
                <strong>{selectedLeafKeys.length}</strong> file{selectedLeafKeys.length !== 1 ? 's' : ''} selected
              </Typography>
              <button
                onClick={() => setCheckedTreeKeys([])}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 'auto', color: colorPalette.neutral.darken2, fontSize: 12 }}
              >
                Clear
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              <Icon type={iconType.InfoCircleOutlined} size={16} color="neutral-darken2" />
              <Typography size="base-sm" color="neutral-darken2">Check files or folders to select them for import</Typography>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

// ─── Space card ───────────────────────────────────────────────────────────────

function SpaceCard({ space, docCount, onClick }: { space: Space; docCount: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const isMyDocs = space.id === MY_DOCS_SPACE_ID
  const hoverColor = isMyDocs ? '#374151' : space.color
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1.5px solid ${hovered ? hoverColor : isMyDocs ? '#d1d5db' : '#e0e0e0'}`,
        borderRadius: 12,
        padding: `${spacing(5)}px`,
        backgroundColor: hovered ? (isMyDocs ? '#F9FAFB' : '#FAFCFF') : colorPalette.white,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing(4),
        transition: 'border-color 0.15s, background-color 0.15s',
        ...(isMyDocs ? { gridColumn: '1 / -1' } : {}),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          backgroundColor: isMyDocs ? '#f3f4f6' : space.color + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isMyDocs
            ? <Icon type={iconType.FolderFilled} size={20} color="neutral-darken3" />
            : <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: space.color }} />
          }
        </div>
        {!isMyDocs && (
          <div style={{ display: 'flex', gap: 4 }}>
            {space.connectors.map(c => (
              <Tooltip key={c.id} title={`${connectorLabel(c.type)}: ${c.label}`}>
                <div>{connectorIcon(c.type, 16)}</div>
              </Tooltip>
            ))}
          </div>
        )}
        {isMyDocs && (
          <Chip label="Personal library" chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
        )}
      </div>
      <div>
        <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{space.name}</Typography>
        <Typography size="base-sm" color="neutral-darken2" maxLines={2}>{space.description}</Typography>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), marginTop: 'auto' }}>
        <Typography size="base-sm" color="neutral-darken2">{docCount} documents</Typography>
        {!isMyDocs && (
          <>
            <span style={{ color: '#ccc' }}>·</span>
            <Typography size="base-sm" color="neutral-darken2">{space.connectors.length} integration{space.connectors.length !== 1 ? 's' : ''}</Typography>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Space detail ─────────────────────────────────────────────────────────────

const FIXED_COLS = [
  { key: 'name',         label: 'Document Name' },
  { key: 'documentType', label: 'Type'          },
  { key: 'tags',         label: 'Tags'          },
  { key: 'uploadedDate', label: 'Uploaded'      },
  { key: 'fileSize',     label: 'Size'          },
  { key: 'fileFormat',   label: 'Format'        },
]
const NON_EDITABLE_KEYS = new Set(['fileFormat', 'fileSize', 'uploadedDate', 'name', 'tags'])

function SpaceDetail({ space, docs, sidebarWidth, onBack, onAddConnector, onConnectorSync, onConnectorDisconnect }: {
  space: Space
  docs: MetadataDocument[]
  sidebarWidth: number
  onBack: () => void
  onAddConnector: () => void
  onConnectorSync: (connectorId: string) => void
  onConnectorDisconnect: (connectorId: string) => void
}) {
  const isMyDocs = space.id === MY_DOCS_SPACE_ID
  const [localDocs, setLocalDocs] = useState<MetadataDocument[]>(docs)
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
    setLocalDocs(prev => prev.map(d => d._id === updated._id ? updated : d))
  }, [])

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
    return !q ? localDocs : localDocs.filter(d =>
      d.name.toLowerCase().includes(q) || d.documentType.toLowerCase().includes(q) ||
      d.domain.toLowerCase().includes(q) || d.jurisdiction.toLowerCase().includes(q)
    )
  }, [localDocs, appliedQuery])

  const pagedDocs = useMemo(() => filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredDocs, currentPage])
  const allSelected = filteredDocs.length > 0 && filteredDocs.every(d => selectedKeys.has(d._id))
  const someSelected = filteredDocs.some(d => selectedKeys.has(d._id))

  const searchResults = useMemo(() => {
    const q = searchInput.trim()
    if (q.length < 2) return []
    const ql = q.toLowerCase()
    return localDocs
      .filter(d => d.name.toLowerCase().includes(ql) || d.documentType.toLowerCase().includes(ql))
      .slice(0, 5)
  }, [searchInput, localDocs])

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
        sorter: key !== 'tags' ? makeSorter(key) : undefined,
        onCell: (record: MetadataDocument) => ({
          style: { cursor: 'pointer', verticalAlign: 'top', backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined },
          ...(isNonEditable ? {} : { editable: true, isEditing: editingKey === record._id, dataIndex: key, initialValue: record[key as keyof MetadataDocument], onValueChange: handleCellChange }),
        }),
      }

      if (key === 'uploadedDate') { col.width = 110; col.render = (v: string) => formatDate(v) }
      if (key === 'fileSize') col.width = 80
      if (key === 'fileFormat') col.width = 90

      if (key === 'name') {
        col.width = '25%'
        col.render = (name: string, record: MetadataDocument) => {
          const sourceConnector = space.connectors.find(c =>
            record._id.includes(c.type.replace('-', '')) || Math.random() > 0.7
          )
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{stripYear(name)}</span>
              {sourceConnector && (
                <div style={{ flexShrink: 0 }}>
                  <Chip label={connectorLabel(sourceConnector.type)} chipStyle={CONNECTOR_CHIP_STYLE[sourceConnector.type]} variant={chipVariants.SUBTLE} />
                </div>
              )}
            </div>
          )
        }
      }

      if (key === 'documentType') { col.width = 160 }

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
              { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => {} },
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
  }, [editingKey, selectedKeys, handleCellChange, startEdit, saveEdit, cancelEdit, filteredDocs, allSelected, someSelected, space.connectors])

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: colorPalette.white, height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ChevronLeftOutlined} onClick={onBack} />
          <div style={{ width: 1, height: 20, backgroundColor: '#e0e0e0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: space.color }} />
            <Typography size="heading-lg" weight="bold">{space.name}</Typography>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <div ref={searchBarWrapperRef} style={{ position: 'relative', width: 280 }}>
            <SearchBar
              placeholder="Search documents…"
              value={searchInput}
              onChange={v => { setSearchInput(v); setCurrentPage(1); if (!v) setShowDropdown(false); else setShowDropdown(true) }}
              onFocus={() => { if (searchInput.length >= 2) setShowDropdown(true) }}
            />
            {showDropdown && searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, width: 360, backgroundColor: colorPalette.white, border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
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
          {!isMyDocs && space.connectors.length < 4 && (
            <ButtonTertiary leftIcon={iconType.PlusOutlined} onClick={onAddConnector}>Add integration</ButtonTertiary>
          )}
          <ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={() => setUploadModalOpen(true)}>Upload</ButtonPrimary>
        </div>
      </div>

      {/* Connector banners — not shown for My Documents */}
      {!isMyDocs && space.connectors.length > 0 && (
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          {space.connectors.map(c => (
            <ConnectorBanner
              key={c.id}
              connector={c}
              onSync={() => onConnectorSync(c.id)}
              onDisconnect={() => onConnectorDisconnect(c.id)}
            />
          ))}
        </div>
      )}

      {!isMyDocs && space.connectors.length === 0 && (
        <div style={{
          flexShrink: 0, border: '1.5px dashed #c8d8f0', borderRadius: 10,
          padding: `${spacing(4)}px ${spacing(5)}px`, backgroundColor: '#F8FBFF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>No integrations connected</Typography>
            <Typography size="base-sm" color="neutral-darken2">Connect SharePoint, OneDrive, Datev, or Google Drive to sync documents automatically.</Typography>
          </div>
          <ButtonTertiary leftIcon={iconType.PlusOutlined} onClick={onAddConnector}>Add integration</ButtonTertiary>
        </div>
      )}

      {/* Document table */}
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

      {/* Bulk action bar */}
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

      {/* Delete modal */}
      <Modal
        visible={deleteModalOpen}
        variant={modalVariants.DANGER}
        title={selectedKeys.size === 1 ? 'Delete Document' : 'Delete Documents'}
        onClose={() => setDeleteModalOpen(false)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: () => setDeleteModalOpen(false) } },
          { variant: buttonVariants.DANGER, props: { children: 'Delete', onClick: () => { setLocalDocs(prev => prev.filter(d => !selectedKeys.has(d._id))); setSelectedKeys(new Set()); setDeleteModalOpen(false); notification.default({ title: 'Documents deleted', placement: toastPlacements.BOTTOM_LEFT, duration: 3 }) } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">
          Delete <strong>{selectedKeys.size} document{selectedKeys.size !== 1 ? 's' : ''}</strong>? This cannot be undone.
        </Typography>
      </Modal>

      {/* Upload modal */}
      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        connectors={isMyDocs ? [] : space.connectors}
        onUpload={newDocs => {
          setLocalDocs(prev => [...newDocs, ...prev])
          notification.success({
            title: `${newDocs.length} document${newDocs.length !== 1 ? 's' : ''} uploaded`,
            placement: toastPlacements.BOTTOM_LEFT,
            duration: 4,
          })
        }}
      />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SharepointVersion4() {
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES)
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [addConnectorOpen, setAddConnectorOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_COLLAPSED_WIDTH)
  const { notification } = useNotifications()

  useEffect(() => {
    const sidebar = document.getElementById(LAYOUT_SIDEBAR_ID)
    if (!sidebar) return
    setSidebarWidth(sidebar.getBoundingClientRect().width)
    const observer = new ResizeObserver(e => setSidebarWidth(e[0].contentRect.width))
    observer.observe(sidebar)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const selectedSpace = spaces.find(s => s.id === selectedSpaceId) ?? null

  const getSpaceDocs = (spaceId: string) => {
    const [start, end] = SPACE_DOC_SLICES[spaceId] ?? [0, 8]
    return documents.slice(start, end)
  }

  const handleCreateSpace = (name: string, description: string, color: string) => {
    const newSpace: Space = {
      id: `space-${Date.now()}`,
      name, description, color, connectors: [],
    }
    setSpaces(prev => [...prev, newSpace])
    setCreateModalOpen(false)
    notification.success({ title: `"${name}" created`, placement: toastPlacements.BOTTOM_LEFT, duration: 3 })
  }

  const handleConnectorAdded = (partial: Omit<Connector, 'id'>) => {
    if (!selectedSpaceId) return
    const newConnector: Connector = { id: `c-${Date.now()}`, ...partial }
    setSpaces(prev => prev.map(s =>
      s.id === selectedSpaceId ? { ...s, connectors: [...s.connectors, newConnector] } : s
    ))
    setAddConnectorOpen(false)
    notification.success({
      title: `${connectorLabel(newConnector.type)} connected`,
      placement: toastPlacements.BOTTOM_LEFT,
      duration: 4,
    })
  }

  const handleConnectorSync = (connectorId: string) => {
    notification.default({ key: 'sync', title: 'Syncing…', placement: toastPlacements.BOTTOM_RIGHT, duration: 0, content: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size="small" /><Typography>Checking for updates…</Typography></div> })
    setTimeout(() => {
      notification.destroy('sync')
      notification.success({ title: 'Sync complete', placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
      setSpaces(prev => prev.map(s => ({
        ...s,
        connectors: s.connectors.map(c => c.id === connectorId ? { ...c, lastSync: 'just now' } : c),
      })))
    }, 2000)
  }

  const handleConnectorDisconnect = (connectorId: string) => {
    if (!selectedSpaceId) return
    setSpaces(prev => prev.map(s =>
      s.id === selectedSpaceId ? { ...s, connectors: s.connectors.filter(c => c.id !== connectorId) } : s
    ))
    notification.default({ title: 'Integration disconnected', placement: toastPlacements.BOTTOM_LEFT, duration: 3 })
  }

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton variant={skeletonVariants.TEXT} title paragraph={{ rows: 6 }} />
      </div>
    )
  }

  if (view === 'detail' && selectedSpace) {
    return (
      <>
        <SpaceDetail
          space={selectedSpace}
          docs={getSpaceDocs(selectedSpace.id)}
          sidebarWidth={sidebarWidth}
          onBack={() => { setView('list'); setSelectedSpaceId(null) }}
          onAddConnector={() => setAddConnectorOpen(true)}
          onConnectorSync={handleConnectorSync}
          onConnectorDisconnect={handleConnectorDisconnect}
        />
        <AddConnectorModal
          open={addConnectorOpen}
          onClose={() => setAddConnectorOpen(false)}
          onConnected={handleConnectorAdded}
        />
      </>
    )
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: spacing(6), backgroundColor: colorPalette.white, minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Typography size="heading-lg" weight="bold">Spaces</Typography>
          <Typography size="base" color="neutral-darken2">Organise documents by client or project, with connected integrations.</Typography>
        </div>
        <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={() => setCreateModalOpen(true)}>New space</ButtonPrimary>
      </div>

      {/* Spaces grid */}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: spacing(4) }}>
          {spaces.map(space => (
            <SpaceCard
              key={space.id}
              space={space}
              docCount={getSpaceDocs(space.id).length}
              onClick={() => { setSelectedSpaceId(space.id); setView('detail') }}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2) }}>
        <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
        <Typography size="base" color="neutral-darken2">All files are securely stored and scanned for viruses.</Typography>
      </div>

      <CreateSpaceModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreate={handleCreateSpace} />
    </div>
  )
}
