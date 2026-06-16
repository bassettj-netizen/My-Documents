import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type Key } from 'react'
import { useNavigate } from 'react-router-dom'
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
  FileUploader,
  Icon,
  iconType,
  Input,
  LAYOUT_SIDEBAR_ID,
  Modal,
  modalVariants,
  Pagination,
  SearchBar,
  Segmented,
  Select,
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
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument, type FileFormat } from '../bulk-edit/documents'

const { colorPalette, spacing, fontWeight } = constants
const PAGE_SIZE = 10
const UPLOAD_KEY = 'upload-in-progress'
const UPLOAD_FORMATS = new Set<string>(['PDF', 'DOCX', 'XLSX', 'PPTX'])
const NON_EDITABLE_KEYS = new Set(['fileFormat', 'fileSize', 'uploadedDate', 'name'])

const DOMAIN_OPTIONS = [
  { label: 'HR', value: 'HR' },
  { label: 'HR/Tax', value: 'HR/Tax' },
  { label: 'Tax', value: 'Tax' },
]

const FIXED_COLS = [
  { key: 'name',         label: 'Document Name' },
  { key: 'documentType', label: 'Type'          },
  { key: 'tags',         label: 'Tags'          },
  { key: 'uploadedDate', label: 'Uploaded'      },
  { key: 'fileSize',     label: 'Size'          },
  { key: 'fileFormat',   label: 'Format'        },
]

// ─── SharePoint mock data ────────────────────────────────────────────────────

const SHAREPOINT_SITES = [
  { id: 'site-hr',    name: 'HR Portal',        host: 'haufe.sharepoint.com/sites/hr',    docCount: 142 },
  { id: 'site-tax',   name: 'Tax & Compliance',  host: 'haufe.sharepoint.com/sites/tax',   docCount: 87  },
  { id: 'site-legal', name: 'Legal Documents',   host: 'haufe.sharepoint.com/sites/legal', docCount: 234 },
]

type SpFileMeta = { size: string; modified: string; format: FileFormat; name: string }

const SP_FILE_META: Record<string, SpFileMeta> = {
  'sp-emp-handbook':  { name: 'Employee Handbook 2024',           size: '2.3 MB', modified: '2024-03-10', format: 'PDF'  },
  'sp-salary-policy': { name: 'Salary Policy Germany',            size: '1.1 MB', modified: '2024-02-28', format: 'DOCX' },
  'sp-relocation':    { name: 'Relocation Guide EU 2024',         size: '1.8 MB', modified: '2024-01-15', format: 'PDF'  },
  'sp-homeoffice':    { name: 'HomeOffice Policy',                size: '0.9 MB', modified: '2024-03-05', format: 'PDF'  },
  'sp-tax-treaty':    { name: 'Tax Treaty Guide Germany-France',  size: '3.2 MB', modified: '2024-02-12', format: 'PDF'  },
  'sp-183-day':       { name: '183-Day Rule Explanation',         size: '0.7 MB', modified: '2023-11-30', format: 'PDF'  },
  'sp-payroll-tax':   { name: 'Payroll Tax Guidance 2024',        size: '1.4 MB', modified: '2024-03-01', format: 'DOCX' },
  'sp-withholding':   { name: 'Withholding Tax Regulation Guide', size: '2.1 MB', modified: '2024-01-20', format: 'PDF'  },
  'sp-expense':       { name: 'Expense Policy Germany',           size: '0.5 MB', modified: '2024-02-15', format: 'XLSX' },
  'sp-compliance':    { name: 'Compliance Guide 2024',            size: '2.8 MB', modified: '2024-03-08', format: 'PDF'  },
}

const SP_LEAF_KEYS = new Set(Object.keys(SP_FILE_META))

const SHAREPOINT_TREE = [
  {
    key: 'folder-hr',
    title: 'HR Documents',
    children: [
      { key: 'sp-emp-handbook',  title: <SpFileLabel id="sp-emp-handbook" />,  isLeaf: true },
      { key: 'sp-salary-policy', title: <SpFileLabel id="sp-salary-policy" />, isLeaf: true },
      { key: 'sp-relocation',    title: <SpFileLabel id="sp-relocation" />,    isLeaf: true },
      { key: 'sp-homeoffice',    title: <SpFileLabel id="sp-homeoffice" />,    isLeaf: true },
    ],
  },
  {
    key: 'folder-tax',
    title: 'Tax & Compliance',
    children: [
      { key: 'sp-tax-treaty',  title: <SpFileLabel id="sp-tax-treaty" />,  isLeaf: true },
      { key: 'sp-183-day',     title: <SpFileLabel id="sp-183-day" />,     isLeaf: true },
      { key: 'sp-payroll-tax', title: <SpFileLabel id="sp-payroll-tax" />, isLeaf: true },
      { key: 'sp-withholding', title: <SpFileLabel id="sp-withholding" />, isLeaf: true },
    ],
  },
  {
    key: 'folder-policies',
    title: 'Company Policies',
    children: [
      { key: 'sp-expense',    title: <SpFileLabel id="sp-expense" />,    isLeaf: true },
      { key: 'sp-compliance', title: <SpFileLabel id="sp-compliance" />, isLeaf: true },
    ],
  },
]

// ─── Icons ───────────────────────────────────────────────────────────────────

/**
 * Small inline badge for the document table — indicates the file was imported
 * from SharePoint. Wraps in a Tooltip so users can always discover the source.
 * Drawn as a path-based S (not SVG <text>) for pixel-perfect rendering at 14 px.
 */
function SharePointSourceIcon() {
  return (
    <Tooltip title="Imported from SharePoint">
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block', cursor: 'default' }}
        aria-label="SharePoint"
      >
        <rect width="14" height="14" rx="2.5" fill="#0078D4" />
        {/* Stylised S: two opposing arcs meeting at the midline */}
        <path
          d="M 9.5 4 C 9.5 2.8 8.6 2.2 7.4 2.2 C 6.1 2.2 4.7 3 4.7 4.5 C 4.7 6 6 6.6 7.3 7.1 C 8.7 7.7 9.8 8.4 9.8 9.8 C 9.8 11.3 8.4 12 7 12 C 5.6 12 4.5 11.3 4.5 10.2"
          stroke="white"
          strokeWidth="1.45"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </Tooltip>
  )
}

/** Larger variant used in the connection panel and modals */
function SharePointIcon({ size = 20 }: { size?: number }) {
  const s = size
  const r = Math.round(s * 0.22)
  return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx={r} fill="#0078D4" />
      <path
        d="M 13.5 5.5 C 13.5 4 12.3 3 10.8 3 C 9.2 3 7.3 4 7.3 6 C 7.3 8 9 8.8 10.5 9.5 C 12.3 10.3 14 11.3 14 13.3 C 14 15.3 12.3 16.5 10.5 16.5 C 8.7 16.5 7 15.5 7 14"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <rect x="1"    y="1"    width="8.5" height="8.5" fill="#F25022" />
      <rect x="10.5" y="1"    width="8.5" height="8.5" fill="#7FBA00" />
      <rect x="1"    y="10.5" width="8.5" height="8.5" fill="#00A4EF" />
      <rect x="10.5" y="10.5" width="8.5" height="8.5" fill="#FFB900" />
    </svg>
  )
}

function CopilotIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.00078 10.687C6.5133 10.687 5.31067 9.48436 5.31067 7.99687C5.31067 6.50939 6.5133 5.30677 8.00078 5.30677C9.48826 5.30677 10.6909 6.50939 10.6909 7.99687C10.6909 9.48436 9.48826 10.687 8.00078 10.687ZM8.00078 6.09797C6.9564 6.09797 6.10188 6.9525 6.10188 7.99687C6.10188 9.04125 6.9564 9.89578 8.00078 9.89578C9.04516 9.89578 9.89969 9.04125 9.89969 7.99687C9.89969 6.9525 9.04516 6.09797 8.00078 6.09797ZM8.01662 15.181C6.38673 15.181 5.24739 13.9151 5.24739 12.1111C5.19991 11.0035 4.47199 10.7661 3.87067 10.7661C2.92122 10.7661 2.08254 10.4496 1.51287 9.86414C1.03814 9.37359 0.800781 8.72479 0.800781 7.99687C0.83243 5.9872 2.41485 5.24348 3.8865 5.22764C4.55111 5.22764 5.24739 4.8637 5.24739 3.88259C5.23155 2.03116 6.35505 0.796875 8.00078 0.796875C9.64651 0.796875 10.6909 1.99951 10.77 3.86677C10.8175 5.03775 11.6403 5.22764 12.1151 5.22764C13.5076 5.22764 15.1533 5.97136 15.2008 7.99687C15.2008 8.72479 14.9634 9.37359 14.4729 9.86414C13.9032 10.4338 13.0487 10.7661 12.1151 10.7661C11.5296 10.7661 10.8175 11.0035 10.7859 12.1111C10.7067 13.9784 9.63067 15.181 8.01662 15.181ZM6.02275 3.88259C6.02275 4.94282 5.37396 6.00304 3.8865 6.01885C3.20605 6.01885 1.62364 6.22458 1.59199 7.99687C1.59199 8.50326 1.75023 8.96217 2.08254 9.29447C2.49397 9.72173 3.14276 9.95906 3.87067 9.95906C5.15242 9.95906 5.97527 10.7819 6.03859 12.0637C6.03859 13.2188 6.65571 14.374 8.01662 14.374C9.3775 14.374 9.93133 13.5037 9.99461 12.0637C10.0421 10.7661 10.8649 9.95906 12.1151 9.94326C12.843 9.94326 13.4918 9.70589 13.919 9.27863C14.2513 8.93049 14.4254 8.48742 14.4096 7.98103C14.3779 6.16125 12.6373 6.00304 12.1151 6.00304C11.1182 6.00304 10.0421 5.43337 9.97881 3.88259C9.91549 2.44259 9.18761 1.57226 8.00078 1.57226C6.81396 1.57226 6.02275 2.47424 6.02275 3.86677V3.88259Z" fill="currentColor" stroke="currentColor" strokeWidth="0.2"/>
    </svg>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SpFileLabel({ id }: { id: string }) {
  const meta = SP_FILE_META[id]
  if (!meta) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
      <span style={{ flex: 1, fontSize: 13 }}>{meta.name}.{meta.format.toLowerCase()}</span>
      <span style={{ fontSize: 12, color: colorPalette.neutral.darken2, flexShrink: 0 }}>{meta.size}</span>
      <span style={{ fontSize: 12, color: colorPalette.neutral.darken2, flexShrink: 0, minWidth: 70 }}>{formatDate(meta.modified)}</span>
    </div>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <span key={i} style={{ fontWeight: 700 }}>{part}</span>
          : part
      )}
    </>
  )
}

function getRelevantExcerpt(text: string, query: string, windowSize = 130): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text.length > windowSize ? text.slice(0, windowSize) + '...' : text
  const start = Math.max(0, idx - 50)
  const end = Math.min(text.length, idx + query.length + (windowSize - 50))
  let excerpt = text.slice(start, end)
  if (start > 0) excerpt = '..' + excerpt
  if (end < text.length) excerpt += '..'
  return excerpt
}

function countOccurrences(text: string, query: string): number {
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  let count = 0, pos = 0
  while ((pos = lower.indexOf(q, pos)) !== -1) { count++; pos += q.length }
  return count
}

function simulateExtraction(name: string): { domain: string; documentType: string; year: number; jurisdiction: string } {
  const lower = name.toLowerCase()
  const yearMatch = name.match(/\b(20\d{2})\b/)
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear()
  const hrSignals  = /\b(hr|employ|relocation|salary|homeoffice|payroll)\b/.test(lower)
  const taxSignals = /\b(tax|steuer|dba|withholding|treaty|compliance|183)\b/.test(lower)
  const domain = hrSignals && taxSignals ? 'HR/Tax' : taxSignals ? 'Tax' : 'HR'
  let documentType = domain === 'Tax' ? 'Tax Guidance' : 'HR Policy'
  if (/treaty/.test(lower))       documentType = 'Tax Treaty Guide'
  else if (/183/.test(lower))     documentType = 'Tax Rule Explanation'
  else if (/payroll/.test(lower)) documentType = 'Payroll Tax Guidance'
  else if (/salary/.test(lower))  documentType = 'Salary Policy'
  else if (/expense/.test(lower)) documentType = 'Expense Policy'
  else if (/compliance/.test(lower)) documentType = 'Compliance Guide'
  else if (/relocation/.test(lower)) documentType = 'HR Guide'
  let jurisdiction = '—'
  if (/germany|german/.test(lower)) jurisdiction = 'Germany'
  else if (/france|french/.test(lower)) jurisdiction = 'France'
  else if (/\b(eu|europe)\b/.test(lower)) jurisdiction = 'EU'
  return { domain, documentType, year, jurisdiction }
}

function spFileToDoc(key: string): MetadataDocument {
  const meta = SP_FILE_META[key]
  const extracted = simulateExtraction(meta.name)
  return {
    _id: `sp-${key}-${Date.now()}`,
    name: meta.name,
    domain: extracted.domain,
    documentType: extracted.documentType,
    status: 'Draft',
    namedEntity: '—',
    namedEntityId: '—',
    year: extracted.year,
    monetaryAmounts: 0,
    currency: 'EUR',
    monetaryTypes: 'None',
    lawType: '—',
    citations: '—',
    jurisdiction: extracted.jurisdiction,
    uploadedDate: meta.modified,
    fileSize: meta.size,
    fileFormat: meta.format,
  }
}

function getDocumentTags(doc: MetadataDocument): Tag[] {
  const tags: Tag[] = []
  tags.push({ text: doc.domain, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.tagList?.length) tags.push(...doc.tagList.map(t => ({ ...t, variant: chipVariants.HIGHLIGHT })))
  if (doc.namedEntity !== '—') tags.push({ text: doc.namedEntity, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.jurisdiction !== '—') tags.push({ text: doc.jurisdiction, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.lawType !== '—') tags.push({ text: doc.lawType, style: chipStyles.ACCENT_NEUTRAL })
  return tags
}

type Tag = { text: string; style: string; variant?: string }

// ─── Sub-components ──────────────────────────────────────────────────────────

function TagsCellInner({ tags }: { tags: Tag[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(tags.length)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const children = Array.from(container.children) as HTMLElement[]
    if (!children.length) return
    const baseTop = container.getBoundingClientRect().top
    const rowTops: number[] = []
    for (const el of children) {
      const t = Math.round(el.getBoundingClientRect().top - baseTop)
      if (!rowTops.includes(t)) rowTops.push(t)
    }
    rowTops.sort((a, b) => a - b)
    if (rowTops.length <= 2) return
    const row2Top = rowTops[1]
    let visible = 0
    for (const el of children) {
      if (Math.round(el.getBoundingClientRect().top - baseTop) <= row2Top) visible++
    }
    setVisibleCount(Math.max(1, visible - 1))
  }, [])

  const hidden = tags.slice(visibleCount)
  return (
    <div ref={containerRef} style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {tags.slice(0, visibleCount).map((tag, i) => (
        <Chip key={i} label={tag.text} chipStyle={tag.style as ChipStyleValue} variant={(tag.variant as typeof chipVariants[keyof typeof chipVariants]) ?? chipVariants.SUBTLE} />
      ))}
      {hidden.length > 0 && (
        <Tooltip title={hidden.map(t => t.text).join(', ')}>
          <Chip label={`+${hidden.length}`} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
        </Tooltip>
      )}
    </div>
  )
}

function TagsCell({ tags }: { tags: Tag[] }) {
  return <TagsCellInner key={tags.map(t => t.text).join('|')} tags={tags} />
}

function TagEditCell({ record, onChange, onRemoveDerived }: {
  record: MetadataDocument
  onChange: (tags: Tag[]) => void
  onRemoveDerived?: (fieldKey: string) => void
}) {
  const [customTags, setCustomTags] = useState<Tag[]>(() => record.tagList ?? [])
  const [inputVal, setInputVal] = useState('')
  const [removedDerived, setRemovedDerived] = useState<Set<string>>(new Set())

  const update = (next: Tag[]) => { setCustomTags(next); onChange(next) }
  const addTag = () => {
    const t = inputVal.trim()
    if (t && !customTags.some(tag => tag.text === t)) {
      update([...customTags, { text: t, style: chipStyles.ACCENT_NEUTRAL, variant: chipVariants.HIGHLIGHT }])
    }
    setInputVal('')
  }

  const removeDerived = (fieldKey: string) => {
    setRemovedDerived(prev => new Set(prev).add(fieldKey))
    onRemoveDerived?.(fieldKey)
  }

  type DerivedChip = Tag & { fieldKey: string }
  const derivedChips: DerivedChip[] = []
  if (!removedDerived.has('namedEntity') && record.namedEntity !== '—') derivedChips.push({ text: record.namedEntity, style: chipStyles.ACCENT_NEUTRAL, fieldKey: 'namedEntity' })
  if (!removedDerived.has('jurisdiction') && record.jurisdiction !== '—') derivedChips.push({ text: record.jurisdiction, style: chipStyles.ACCENT_NEUTRAL, fieldKey: 'jurisdiction' })

  return (
    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Input value={inputVal} placeholder="Add tag…" onChange={e => setInputVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); addTag() } }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <Chip label={record.domain} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
        {customTags.map((tag, i) => (
          <Chip key={i} label={tag.text} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.HIGHLIGHT} closable onClose={() => update(customTags.filter((_, j) => j !== i))} />
        ))}
        {derivedChips.map(chip => (
          <Chip key={chip.fieldKey} label={chip.text} chipStyle={chip.style as ChipStyleValue} variant={chipVariants.SUBTLE} closable onClose={() => removeDerived(chip.fieldKey)} />
        ))}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EditableCell({ editable, isEditing, dataIndex, initialValue, onValueChange, children, ...restProps }: any) {
  const [fieldValue, setFieldValue] = useState('')
  useEffect(() => { if (isEditing) setFieldValue(String(initialValue ?? '')) }, [isEditing, initialValue])
  if (!editable) return <td {...restProps}>{children}</td>
  return (
    <td {...restProps}>
      {isEditing ? (
        <div onClick={e => e.stopPropagation()}>
          {dataIndex === 'domain' ? (
            <Select name={dataIndex} value={fieldValue} options={DOMAIN_OPTIONS} onChange={v => { const val = String(v); setFieldValue(val); onValueChange?.(dataIndex, val) }} />
          ) : (
            <Input name={dataIndex} value={fieldValue} onChange={e => { setFieldValue(e.target.value); onValueChange?.(dataIndex, e.target.value) }} />
          )}
        </div>
      ) : children}
    </td>
  )
}

// ─── Connect modal ────────────────────────────────────────────────────────────

type ConnectStep = 'sign-in' | 'authenticating' | 'site-selection'

function ConnectModal({ open, onClose, onConnected }: {
  open: boolean
  onClose: () => void
  onConnected: (siteId: string) => void
}) {
  const [step, setStep] = useState<ConnectStep>('sign-in')
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)

  useEffect(() => { if (!open) { setStep('sign-in'); setSelectedSiteId(null) } }, [open])

  const handleSignIn = () => {
    setStep('authenticating')
    setTimeout(() => setStep('site-selection'), 1800)
  }

  return (
    <Modal
      visible={open}
      title={
        step === 'sign-in' ? 'Connect to SharePoint' :
        step === 'authenticating' ? 'Connecting…' :
        'Select a SharePoint Site'
      }
      onClose={step !== 'authenticating' ? onClose : undefined}
      footer={step === 'authenticating' ? undefined : {
        buttons: step === 'sign-in' ? [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
        ] : [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
          { variant: buttonVariants.PRIMARY, props: { children: 'Connect site', onClick: () => { if (selectedSiteId) onConnected(selectedSiteId) }, disabled: !selectedSiteId } },
        ],
      }}
    >
      {step === 'sign-in' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(5), padding: `${spacing(4)}px 0` }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SharePointIcon size={28} />
          </div>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Sign in with your Microsoft account</Typography>
            <Typography size="base" color="neutral-darken2">Grant access to browse and import documents from your SharePoint sites.</Typography>
          </div>
          <div
            style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: `${spacing(3)}px ${spacing(5)}px`, display: 'flex', alignItems: 'center', gap: spacing(3), cursor: 'pointer', backgroundColor: colorPalette.white, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', width: '100%', maxWidth: 280 }}
            onClick={handleSignIn}
          >
            <MicrosoftIcon />
            <Typography size="base" color="neutral-darken5">Sign in with Microsoft</Typography>
          </div>
          <Typography size="base-sm" color="neutral-darken2" style={{ textAlign: 'center', maxWidth: 320 }}>
            You'll be redirected to Microsoft's login page. Your credentials are never stored by this app.
          </Typography>
        </div>
      )}
      {step === 'authenticating' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(4), padding: `${spacing(6)}px 0` }}>
          <Spinner />
          <Typography size="base" color="neutral-darken2">Signing in to Microsoft…</Typography>
        </div>
      )}
      {step === 'site-selection' && (
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
                onClick={() => setSelectedSiteId(site.id)}
                style={{ border: `1.5px solid ${selectedSiteId === site.id ? colorPalette.blue.base : '#e0e0e0'}`, borderRadius: 8, padding: `${spacing(3)}px ${spacing(4)}px`, cursor: 'pointer', backgroundColor: selectedSiteId === site.id ? '#F0F7FF' : colorPalette.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.15s, background-color 0.15s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
                  <SharePointIcon size={20} />
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
    </Modal>
  )
}

// ─── Browse modal ─────────────────────────────────────────────────────────────

function BrowseModal({ open, siteName, onClose, onImport, alreadyImportedKeys }: {
  open: boolean
  siteName: string
  onClose: () => void
  onImport: (keys: string[]) => void
  alreadyImportedKeys: Set<string>
}) {
  const [checkedKeys, setCheckedKeys] = useState<Key[]>([])
  useEffect(() => { if (!open) setCheckedKeys([]) }, [open])

  const leafChecked = (checkedKeys as string[]).filter(k => SP_LEAF_KEYS.has(k) && !alreadyImportedKeys.has(k))

  const handleCheck = (checked: Key[] | { checked: Key[]; halfChecked: Key[] }) => {
    setCheckedKeys(Array.isArray(checked) ? checked : checked.checked)
  }

  return (
    <Modal
      visible={open}
      title={`Import from SharePoint — ${siteName}`}
      onClose={onClose}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
        { variant: buttonVariants.PRIMARY, props: { children: leafChecked.length > 0 ? `Import selected (${leafChecked.length})` : 'Import selected', onClick: () => onImport(leafChecked), disabled: leafChecked.length === 0 } },
      ]}}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <Typography size="base-sm" color="neutral-darken2">Select files to import. Already-imported files are greyed out.</Typography>
        <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: `${spacing(2)}px ${spacing(1)}px`, minHeight: 200 }}>
          <Tree
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items={SHAREPOINT_TREE as any}
            checkable
            defaultExpandAll
            checkedKeys={checkedKeys as string[]}
            onCheck={handleCheck}
          />
        </div>
        {alreadyImportedKeys.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <Icon type={iconType.InfoCircleOutlined} size={14} color="neutral-darken2" />
            <Typography size="base-sm" color="neutral-darken2">{alreadyImportedKeys.size} file{alreadyImportedKeys.size > 1 ? 's' : ''} already imported</Typography>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── SharePoint tab panel (shown when "From SharePoint" tab is active) ────────

function SharePointTabContent({ connectionStatus, onConnect, connectedSite, spDocCount, onBrowse, onSync, onDisconnect }: {
  connectionStatus: 'disconnected' | 'connected'
  onConnect: () => void
  connectedSite?: { name: string; host: string }
  spDocCount: number
  onBrowse: () => void
  onSync: () => void
  onDisconnect: () => void
}) {
  if (connectionStatus === 'disconnected') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(3), padding: `${spacing(5)}px ${spacing(4)}px`, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SharePointIcon size={26} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
          <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>No SharePoint connection</Typography>
          <Typography size="base-sm" color="neutral-darken2" style={{ maxWidth: 360 }}>
            Connect your Microsoft SharePoint account to browse and import documents directly into this library.
          </Typography>
        </div>
        <ButtonPrimary onClick={onConnect}>Connect to SharePoint</ButtonPrimary>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${spacing(3)}px ${spacing(4)}px`, gap: spacing(4) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <SharePointIcon size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{connectedSite?.name}</Typography>
            <Icon type={iconType.CheckCircleFilled} color="success-base" size={14} />
          </div>
          <Typography size="base-sm" color="neutral-darken2">
            james.bassett@haufe.com · {spDocCount} document{spDocCount !== 1 ? 's' : ''} imported · Last synced just now
          </Typography>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), flexShrink: 0 }}>
        <ButtonTertiary onClick={onBrowse} leftIcon={iconType.FolderFilled}>Browse & Import</ButtonTertiary>
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

// ─── Main page ────────────────────────────────────────────────────────────────

type SearchResult = { doc: MetadataDocument; nameMatch: boolean; relevantMentions: number; excerpt: string }

export default function SharepointVersion2() {
  const navigate = useNavigate()

  // Import source tab
  const [activeTab, setActiveTab] = useState<'device' | 'sharepoint'>('device')

  // Upload (device)
  const [isUploading, setIsUploading] = useState(false)
  const [tempDocs, setTempDocs] = useState<MetadataDocument[]>([])
  const pendingFilesRef = useRef<File[]>([])
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // SharePoint
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected'>('disconnected')
  const [connectedSiteId, setConnectedSiteId] = useState<string | null>(null)
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const [browseModalOpen, setBrowseModalOpen] = useState(false)
  const [syncingState, setSyncingState] = useState(false)
  const [importedSpKeys, setImportedSpKeys] = useState<Set<string>>(new Set())
  const [spDocs, setSpDocs] = useState<MetadataDocument[]>([])
  const spDocIds = useRef(new Set<string>())

  // Document table
  const [localDocs, setLocalDocs] = useState<MetadataDocument[]>(() => [...documents])
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_COLLAPSED_WIDTH)

  // Search
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const pendingEditsRef = useRef<Record<string, string>>({})
  const pendingTagsRef = useRef<Tag[] | null>(null)
  const pendingRemovedDerivedRef = useRef<Set<string>>(new Set())
  const searchBarWrapperRef = useRef<HTMLDivElement>(null)
  const lastAppliedQueryRef = useRef('')
  const { notification } = useNotifications()

  const connectedSite = SHAREPOINT_SITES.find(s => s.id === connectedSiteId)

  useEffect(() => {
    const sidebar = document.getElementById(LAYOUT_SIDEBAR_ID)
    if (!sidebar) return
    setSidebarWidth(sidebar.getBoundingClientRect().width)
    const observer = new ResizeObserver(entries => setSidebarWidth(entries[0].contentRect.width))
    observer.observe(sidebar)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setIsInitialLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (searchQuery === lastAppliedQueryRef.current) return
    setIsSearching(true)
    const t = setTimeout(() => { setAppliedQuery(searchQuery); lastAppliedQueryRef.current = searchQuery; setIsSearching(false) }, 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (searchBarWrapperRef.current && !searchBarWrapperRef.current.contains(e.target as Node)) setShowDropdown(false) }
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowDropdown(false) }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => { document.removeEventListener('mousedown', handleClickOutside); document.removeEventListener('keydown', handleEscape) }
  }, [])

  // ── Upload (device) ──────────────────────────────────────────────────────

  const handleUpload = useCallback((file: File | Blob) => {
    if (!(file instanceof File)) return
    pendingFilesRef.current.push(file)
    if (batchTimerRef.current) clearTimeout(batchTimerRef.current)
    batchTimerRef.current = setTimeout(() => {
      const files = [...pendingFilesRef.current]
      pendingFilesRef.current = []
      setIsUploading(true)
      const label = files.length === 1 ? files[0].name : `${files.length} documents`
      const toastContent = (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size="small" /><Typography>{text}</Typography></div>
      )
      notification.default({ key: UPLOAD_KEY, title: 'Uploading…', placement: toastPlacements.BOTTOM_RIGHT, duration: 0, leadingIcon: false, content: toastContent(label) })
      setTimeout(() => {
        notification.default({ key: UPLOAD_KEY, title: 'Extracting metadata…', placement: toastPlacements.BOTTOM_RIGHT, duration: 0, leadingIcon: false, content: toastContent(label) })
      }, 1000)
      setTimeout(() => {
        notification.destroy(UPLOAD_KEY)
        setIsUploading(false)
        const today = new Date().toISOString().slice(0, 10)
        const newDocs: MetadataDocument[] = files.map((f, i) => {
          const ext = (f.name.split('.').pop() ?? 'PDF').toUpperCase()
          const extracted = simulateExtraction(f.name.replace(/\.[^/.]+$/, ''))
          return {
            _id: `temp-${Date.now()}-${i}`,
            name: f.name.replace(/\.[^/.]+$/, ''),
            domain: extracted.domain,
            documentType: extracted.documentType,
            status: 'Draft' as const,
            namedEntity: '—', namedEntityId: '—',
            year: extracted.year,
            monetaryAmounts: 0, currency: 'EUR', monetaryTypes: 'None',
            lawType: '—', citations: '—',
            jurisdiction: extracted.jurisdiction,
            uploadedDate: today,
            fileSize: formatFileSize(f.size),
            fileFormat: (UPLOAD_FORMATS.has(ext) ? ext : 'PDF') as FileFormat,
          }
        })
        setTempDocs(prev => [...newDocs, ...prev])
        const successLabel = files.length === 1 ? '1 document' : `${files.length} documents`
        notification.success({ title: 'Upload successful', placement: toastPlacements.BOTTOM_LEFT, duration: 5, content: <Typography>{successLabel}</Typography> })
      }, 2000)
    }, 150)
  }, [notification])

  // ── SharePoint ───────────────────────────────────────────────────────────

  const handleConnected = useCallback((siteId: string) => {
    setConnectedSiteId(siteId)
    setConnectionStatus('connected')
    setConnectModalOpen(false)
    const site = SHAREPOINT_SITES.find(s => s.id === siteId)
    notification.success({ title: `Connected to ${site?.name}`, placement: toastPlacements.BOTTOM_LEFT, duration: 4, content: <Typography>SharePoint integration active</Typography> })
  }, [notification])

  const handleDisconnect = useCallback(() => {
    setConnectionStatus('disconnected')
    setConnectedSiteId(null)
    setSpDocs([])
    setImportedSpKeys(new Set())
    spDocIds.current = new Set()
    notification.default({ title: 'SharePoint disconnected', placement: toastPlacements.BOTTOM_LEFT, duration: 3 })
  }, [notification])

  const handleSync = useCallback(() => {
    setSyncingState(true)
    notification.default({ key: 'sp-sync', title: 'Syncing SharePoint…', placement: toastPlacements.BOTTOM_RIGHT, duration: 0, content: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size="small" /><Typography>Checking for updates…</Typography></div> })
    setTimeout(() => {
      setSyncingState(false)
      notification.destroy('sp-sync')
      notification.success({ title: 'SharePoint sync complete', placement: toastPlacements.BOTTOM_LEFT, duration: 4, content: <Typography>All documents are up to date</Typography> })
    }, 2000)
  }, [notification])

  const handleImport = useCallback((keys: string[]) => {
    setBrowseModalOpen(false)
    if (!keys.length) return
    notification.default({ key: 'sp-import', title: 'Importing from SharePoint…', placement: toastPlacements.BOTTOM_RIGHT, duration: 0, content: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size="small" /><Typography>{keys.length} file{keys.length > 1 ? 's' : ''}</Typography></div> })
    setTimeout(() => {
      const newDocs = keys.map(k => spFileToDoc(k))
      newDocs.forEach(d => spDocIds.current.add(d._id))
      setSpDocs(prev => [...newDocs, ...prev])
      setImportedSpKeys(prev => new Set([...prev, ...keys]))
      notification.destroy('sp-import')
      notification.success({ title: `${keys.length} document${keys.length > 1 ? 's' : ''} imported`, placement: toastPlacements.BOTTOM_LEFT, duration: 5, content: <Typography>From SharePoint — {connectedSite?.name}</Typography> })
    }, 1800)
  }, [notification, connectedSite])

  // ── Table logic (same as V1) ─────────────────────────────────────────────

  const handleSave = useCallback((updated: MetadataDocument) => {
    if (spDocIds.current.has(updated._id)) setSpDocs(prev => prev.map(d => d._id === updated._id ? updated : d))
    else if (updated._id.startsWith('temp-')) setTempDocs(prev => prev.map(d => d._id === updated._id ? updated : d))
    else setLocalDocs(prev => prev.map(d => d._id === updated._id ? updated : d))
  }, [])

  const handleCellChange = useCallback((key: string, value: string) => { pendingEditsRef.current[key] = value }, [])

  const startEdit = useCallback((record: MetadataDocument) => {
    pendingEditsRef.current = {}; pendingTagsRef.current = null; pendingRemovedDerivedRef.current = new Set()
    setEditingKey(record._id)
  }, [])

  const saveEdit = useCallback((record: MetadataDocument) => {
    const updated = { ...record, ...pendingEditsRef.current } as MetadataDocument
    if (pendingTagsRef.current !== null) updated.tagList = pendingTagsRef.current
    for (const fieldKey of pendingRemovedDerivedRef.current) {
      (updated as unknown as Record<string, unknown>)[fieldKey] = '—'
    }
    handleSave(updated)
    setEditingKey(null)
    pendingEditsRef.current = {}; pendingTagsRef.current = null; pendingRemovedDerivedRef.current = new Set()
  }, [handleSave])

  const cancelEdit = useCallback(() => {
    setEditingKey(null)
    pendingEditsRef.current = {}; pendingTagsRef.current = null; pendingRemovedDerivedRef.current = new Set()
  }, [])

  const handleBulkDelete = useCallback(() => {
    setSpDocs(prev => prev.filter(d => !selectedKeys.has(d._id)))
    setTempDocs(prev => prev.filter(d => !selectedKeys.has(d._id)))
    setLocalDocs(prev => prev.filter(d => !selectedKeys.has(d._id)))
    setSelectedKeys(new Set())
  }, [selectedKeys])

  const allDocs = useMemo(() => [...spDocs, ...tempDocs, ...localDocs], [spDocs, tempDocs, localDocs])

  const confirmDelete = useCallback(() => {
    const count = selectedKeys.size
    const doc = count === 1 ? allDocs.find(d => selectedKeys.has(d._id)) : undefined
    const name = doc ? `${stripYear(doc.name)}.${doc.fileFormat.toLowerCase()}` : ''
    handleBulkDelete()
    setDeleteModalOpen(false)
    notification.default({ title: count === 1 ? 'Document deleted' : 'Documents deleted', icon: iconType.TrashFilled, content: <Typography size="base" color="neutral-darken5">{count === 1 ? name : `${count} documents`}</Typography>, placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
  }, [selectedKeys, allDocs, handleBulkDelete, notification])

  const filteredDocs = useMemo(
    () => allDocs.filter(doc => {
      const q = appliedQuery.toLowerCase()
      return !q || doc.name.toLowerCase().includes(q) || doc.namedEntity.toLowerCase().includes(q) || doc.domain.toLowerCase().includes(q) || doc.jurisdiction.toLowerCase().includes(q) || doc.documentType.toLowerCase().includes(q)
    }),
    [allDocs, appliedQuery],
  )

  const pagedDocs = useMemo(() => filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredDocs, currentPage])
  const allSelected = filteredDocs.length > 0 && filteredDocs.every(d => selectedKeys.has(d._id))
  const someSelected = filteredDocs.some(d => selectedKeys.has(d._id))

  const columns = useMemo(() => {
    const checkboxCol = {
      title: () => (
        <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={e => {
          setSelectedKeys(prev => { const next = new Set(prev); filteredDocs.forEach(d => { if (e.target.checked) next.add(d._id); else next.delete(d._id) }); return next })
        }} />
      ),
      key: 'checkbox',
      width: 48,
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

    const isSpDoc = (id: string) => spDocIds.current.has(id)

    const visible: object[] = FIXED_COLS.map(({ key, label }) => {
      const isNonEditable = NON_EDITABLE_KEYS.has(key) || key === 'tags'
      const needsEllipsis = key !== 'tags' && key !== 'documentType'
      const col: Record<string, unknown> = {
        title: label, key, dataIndex: key, ellipsis: needsEllipsis,
        sorter: key !== 'tags' ? makeSorter(key) : undefined,
        onCell: (record: MetadataDocument) => ({
          onClick: editingKey === record._id ? undefined : () => navigate(`/my-documents/sharepoint/version-2/${record._id}`),
          style: { cursor: editingKey === record._id ? 'default' : 'pointer', verticalAlign: 'top', backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined },
          ...(isNonEditable ? {} : { editable: true, isEditing: editingKey === record._id, dataIndex: key, initialValue: record[key as keyof MetadataDocument], onValueChange: handleCellChange }),
        }),
      }

      if (key === 'uploadedDate') { col.width = 110; col.render = (val: string) => formatDate(val) }
      if (key === 'fileSize') col.width = 80
      if (key === 'fileFormat') col.width = 90

      if (key === 'name') {
        col.width = '25%'
        col.render = (name: string, record: MetadataDocument) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
            {/* SharePoint source icon — replaces the chip used in Version 1 */}
            {isSpDoc(record._id) && <SharePointSourceIcon />}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{stripYear(name)}</span>
            {record.label && <div style={{ flexShrink: 0 }}><Chip label={record.label} chipStyle={chipStyles.SEMANTIC_WARNING} variant={chipVariants.SUBTLE} /></div>}
          </div>
        )
        col.onCell = (record: MetadataDocument) => ({
          onClick: editingKey === record._id ? undefined : () => navigate(`/my-documents/sharepoint/version-2/${record._id}`),
          style: { cursor: editingKey === record._id ? 'default' : 'pointer', verticalAlign: 'top', maxWidth: 0, backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined },
        })
      }

      if (key === 'documentType') {
        col.width = 160
        col.onCell = (record: MetadataDocument) => ({
          onClick: editingKey === record._id ? undefined : () => navigate(`/my-documents/sharepoint/version-2/${record._id}`),
          style: { cursor: editingKey === record._id ? 'default' : 'pointer', verticalAlign: 'top', backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined },
          editable: true, isEditing: editingKey === record._id, dataIndex: key, initialValue: record[key as keyof MetadataDocument], onValueChange: handleCellChange,
        })
      }

      if (key === 'tags') {
        col.render = (_: unknown, record: MetadataDocument) => {
          if (editingKey === record._id) return <TagEditCell record={record} onChange={tags => { pendingTagsRef.current = tags }} onRemoveDerived={fieldKey => { pendingRemovedDerivedRef.current.add(fieldKey) }} />
          return <TagsCell tags={getDocumentTags(record)} />
        }
      }

      return col
    })

    visible.push({
      title: '',
      key: 'actions',
      width: editingKey ? 160 : 56,
      onCell: (record: MetadataDocument) => ({ style: { verticalAlign: 'top', backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined } }),
      render: (_: unknown, record: MetadataDocument) => {
        if (editingKey === record._id) {
          return <div style={{ display: 'flex', gap: 8 }}><ButtonPrimary onClick={() => saveEdit(record)}>Save</ButtonPrimary><ButtonTertiary onClick={cancelEdit}>Cancel</ButtonTertiary></div>
        }
        return (
          <Dropdown
            items={[
              { key: 'edit', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.EditRecOutlined} size={16} />Edit document info</span>, onClick: () => startEdit(record) },
              { key: 'copilot', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />Ask CoPilot</span>, onClick: () => console.log('Ask CoPilot', record.name) },
              { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => console.log('Download', record.name) },
              ...(isSpDoc(record._id) ? [{ key: 'sync', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.RefreshOutlined} size={16} />Sync from SharePoint</span>, onClick: () => console.log('Sync', record.name) }] : []),
              { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => console.log('Delete', record.name) },
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
  }, [navigate, editingKey, selectedKeys, handleCellChange, startEdit, saveEdit, cancelEdit, filteredDocs, allSelected, someSelected])

  const searchResults = useMemo((): SearchResult[] => {
    const q = searchInput.trim()
    if (q.length < 2) return []
    const qLower = q.toLowerCase()
    const results: SearchResult[] = []
    for (const doc of allDocs) {
      const displayName = stripYear(doc.name)
      const snippetText = DOCUMENT_SNIPPETS[doc._id] ?? `${doc.documentType} – ${doc.namedEntity}`
      const metaStr = [doc.domain, doc.documentType, doc.namedEntity, doc.jurisdiction].join(' ')
      const nameMatch = displayName.toLowerCase().includes(qLower)
      const totalHits = countOccurrences(snippetText, q) + countOccurrences(metaStr, q)
      if (!nameMatch && totalHits === 0) continue
      results.push({ doc, nameMatch, relevantMentions: totalHits, excerpt: getRelevantExcerpt(snippetText, q) })
    }
    results.sort((a, b) => (b.nameMatch ? 1 : 0) - (a.nameMatch ? 1 : 0))
    return results.slice(0, 5)
  }, [searchInput, allDocs])

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: colorPalette.white, height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <Typography size="heading-lg" weight="bold">Meine Dokumente</Typography>
        <div
          ref={searchBarWrapperRef}
          style={{ position: 'relative', width: 300 }}
          onKeyDown={e => { if (e.key === 'Enter' && searchInput.trim()) { setSearchQuery(searchInput.trim()); setCurrentPage(1); setShowDropdown(false) } }}
        >
          <SearchBar
            placeholder="Search by name, entity, domain…"
            value={searchInput}
            onChange={v => { setSearchInput(v); setCurrentPage(1); if (!v) { setSearchQuery(''); setShowDropdown(false) } else setShowDropdown(true) }}
            onFocus={() => { if (searchInput.length >= 2 && searchResults.length > 0) setShowDropdown(true) }}
          />
          {showDropdown && searchResults.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, width: 400, backgroundColor: colorPalette.white, border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
              <div style={{ maxHeight: 420, overflowY: 'auto', overscrollBehavior: 'contain' }}>
                {searchResults.map(({ doc, relevantMentions, excerpt }, idx) => {
                  const q = searchInput.trim()
                  const footerParts: string[] = []
                  if (relevantMentions > 1) footerParts.push(`${relevantMentions} relevant mentions`)
                  footerParts.push(formatDate(doc.uploadedDate))
                  return (
                    <div key={doc._id} style={{ padding: '12px 16px', cursor: 'pointer', borderTop: idx > 0 ? '1px solid #f0f0f0' : 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F9FF')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      onClick={() => { navigate(`/my-documents/sharepoint/version-2/${doc._id}`); setShowDropdown(false) }}
                    >
                      <Typography size="base" color="neutral-darken5">{highlightAll(stripYear(doc.name), q)}</Typography>
                      <div style={{ marginTop: 4 }}><Typography size="base-sm" color="neutral-darken5" maxLines={2}>{excerpt}</Typography></div>
                      <div style={{ marginTop: 4 }}><Typography size="base-sm" color="neutral-darken2">{footerParts.join(' • ')}</Typography></div>
                    </div>
                  )
                })}
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', padding: `${spacing(2)}px ${spacing(3)}px`, display: 'flex', justifyContent: 'center' }}>
                <ButtonGhost onClick={() => { setSearchQuery(searchInput.trim()); setCurrentPage(1); setShowDropdown(false) }}>Show results</ButtonGhost>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabbed import section */}
      <div style={{ flexShrink: 0, border: '1px solid #e0e0e0', borderRadius: 10, overflow: 'hidden' }}>
        {/* Tab switcher */}
        <div style={{ borderBottom: '1px solid #e0e0e0', padding: `${spacing(3)}px ${spacing(4)}px`, backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', gap: spacing(4) }}>
          <Segmented
            options={['From your device', 'From SharePoint']}
            value={activeTab === 'device' ? 'From your device' : 'From SharePoint'}
            onChange={v => setActiveTab(v === 'From your device' ? 'device' : 'sharepoint')}
          />
          {activeTab === 'sharepoint' && connectionStatus === 'connected' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1), marginLeft: 'auto' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E' }} />
              <Typography size="base-sm" color="neutral-darken2">Connected</Typography>
            </div>
          )}
        </div>

        {/* Tab content */}
        {activeTab === 'device' ? (
          <div style={{ padding: `${spacing(4)}px ${spacing(4)}px` }}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <FileUploader onUpload={handleUpload} accept={['.pdf', '.docx', '.xlsx', '.pptx']} {...({ multiple: true } as any)}>
              <div
                style={{ border: '1.5px dashed #d0d0d0', borderRadius: 8, padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: isUploading ? 'not-allowed' : 'pointer', backgroundColor: isUploading ? '#F0F0F0' : undefined, pointerEvents: isUploading ? 'none' : 'auto', transition: 'background-color 0.2s ease' }}
              >
                <Icon type={iconType.UploadOutlined} color={isUploading ? 'disabled-lighten1' : 'neutral-darken4'} />
                <Typography color={isUploading ? 'disabled-lighten1' : 'neutral-darken5'}>Click to select a document or drag it here.</Typography>
                <Typography size="base-sm" color={isUploading ? 'disabled-lighten1' : 'neutral-darken2'}>PDF, DOCX, XLSX and PPTX formats, max. 10 MB</Typography>
              </div>
            </FileUploader>
          </div>
        ) : (
          <SharePointTabContent
            connectionStatus={connectionStatus}
            onConnect={() => setConnectModalOpen(true)}
            connectedSite={connectedSite}
            spDocCount={spDocs.length}
            onBrowse={() => setBrowseModalOpen(true)}
            onSync={handleSync}
            onDisconnect={handleDisconnect}
          />
        )}
      </div>

      {/* Document table */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {isInitialLoading ? (
            <Skeleton variant={skeletonVariants.TEXT} title paragraph={{ rows: PAGE_SIZE }} />
          ) : (
            <Table
              dataSource={pagedDocs}
              columns={columns as never}
              pagination={false}
              innerLoading={isSearching || syncingState || isUploading}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ components: { body: { cell: EditableCell } } } as any)}
              onRow={(record: MetadataDocument) => ({
                style: { height: 72, ...(editingKey === record._id ? { backgroundColor: '#F5F9FF' } : selectedKeys.has(record._id) ? { backgroundColor: '#EEF4FF' } : {}) },
              })}
            />
          )}
        </div>
        <div style={{ flexShrink: 0 }}>
          <Pagination current={currentPage} total={filteredDocs.length} pageSize={PAGE_SIZE} onChange={page => setCurrentPage(page)} />
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedKeys.size > 0 && (
        <div style={{ position: 'fixed', bottom: spacing(2), left: sidebarWidth + spacing(2), right: spacing(2), height: 56, backgroundColor: colorPalette.neutral.lighten1, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${spacing(6)}px`, zIndex: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setSelectedKeys(new Set())} />
              <Typography color="neutral-darken5">{selectedKeys.size} selected</Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), marginLeft: spacing(4) }}>
              <ButtonTertiary leftIcon={iconType.DownloadOutlined} onClick={() => console.log('Download')}>Download</ButtonTertiary>
              {[...selectedKeys].some(id => spDocIds.current.has(id)) && (
                <ButtonTertiary leftIcon={iconType.RefreshOutlined} onClick={() => console.log('Sync selected')}>Sync from SharePoint</ButtonTertiary>
              )}
            </div>
          </div>
          <ButtonDanger leftIcon={iconType.TrashOutlined} onClick={() => setDeleteModalOpen(true)}>Delete</ButtonDanger>
        </div>
      )}

      {/* Security footer */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2) }}>
        <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
        <Typography size="base" color="neutral-darken2">All files are securely stored and scanned for viruses.</Typography>
      </div>

      {/* Delete modal */}
      <Modal
        visible={deleteModalOpen}
        variant={modalVariants.DANGER}
        title={selectedKeys.size === 1 ? 'Delete Document' : 'Delete Documents'}
        onClose={() => setDeleteModalOpen(false)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: () => setDeleteModalOpen(false) } },
          { variant: buttonVariants.DANGER, props: { children: 'Delete', onClick: confirmDelete } },
        ]}}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          <Typography size="base" color="neutral-darken5">
            You are about to <span style={{ color: colorPalette.danger.darken2, fontWeight: 700 }}>DELETE</span>{' '}
            {selectedKeys.size === 1 ? `"${stripYear(allDocs.find(d => selectedKeys.has(d._id))?.name ?? '')}"` : `${selectedKeys.size} documents`}
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <Icon type={iconType.InfoCircleOutlined} size={16} color="neutral-darken2" />
            <Typography size="base-sm" color="neutral-darken2">{selectedKeys.size === 1 ? 'This document' : 'These documents'} will no longer be available</Typography>
          </div>
        </div>
      </Modal>

      <ConnectModal open={connectModalOpen} onClose={() => setConnectModalOpen(false)} onConnected={handleConnected} />
      <BrowseModal open={browseModalOpen} siteName={connectedSite?.name ?? ''} onClose={() => setBrowseModalOpen(false)} onImport={handleImport} alreadyImportedKeys={importedSpKeys} />
    </div>
  )
}
