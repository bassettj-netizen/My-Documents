import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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
  toastPlacements,
  Tooltip,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument, type FileFormat } from '../bulk-edit/documents'
import { useConnections } from '../../../contexts/ConnectionsContext'

const { colorPalette, spacing } = constants
const PAGE_SIZE = 10
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

// ─── Mock data ────────────────────────────────────────────────────────────────

const SHAREPOINT_SITES = [
  { id: 'site-hr',     name: 'HR Portal',        host: 'haufe.sharepoint.com/sites/hr',    docCount: 142 },
  { id: 'site-tax',    name: 'Tax & Compliance',  host: 'haufe.sharepoint.com/sites/tax',   docCount: 87  },
  { id: 'site-legal',  name: 'Legal Documents',   host: 'haufe.sharepoint.com/sites/legal', docCount: 234 },
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

const SP_FILE_SITE: Record<string, string> = {
  'sp-emp-handbook':  'site-hr',
  'sp-salary-policy': 'site-hr',
  'sp-relocation':    'site-hr',
  'sp-homeoffice':    'site-hr',
  'sp-tax-treaty':    'site-tax',
  'sp-183-day':       'site-tax',
  'sp-payroll-tax':   'site-tax',
  'sp-withholding':   'site-tax',
  'sp-expense':       'site-legal',
  'sp-compliance':    'site-legal',
}

type SpBrowseRow = { key: string; name: string; siteId: string; siteName: string; size: string; modified: string; format: FileFormat; alreadyImported: boolean }


// ─── Helpers ─────────────────────────────────────────────────────────────────


function formatDate(dateStr: string): string {
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
  if (/treaty/.test(lower))          documentType = 'Tax Treaty Guide'
  else if (/183/.test(lower))        documentType = 'Tax Rule Explanation'
  else if (/payroll/.test(lower))    documentType = 'Payroll Tax Guidance'
  else if (/salary/.test(lower))     documentType = 'Salary Policy'
  else if (/expense/.test(lower))    documentType = 'Expense Policy'
  else if (/compliance/.test(lower)) documentType = 'Compliance Guide'
  else if (/relocation/.test(lower)) documentType = 'HR Guide'
  let jurisdiction = '—'
  if (/germany|german/.test(lower))    jurisdiction = 'Germany'
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

// ─── Icons ───────────────────────────────────────────────────────────────────

function SharePointSourceIcon({ siteName }: { siteName?: string }) {
  return (
    <Tooltip title={siteName ? `Imported from SharePoint — ${siteName}` : 'Imported from SharePoint'}>
      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block', cursor: 'default' }}
        aria-label="SharePoint"
      >
        <rect width="14" height="14" rx="2.5" fill="#0078D4" />
        <path
          d="M 9.5 4 C 9.5 2.8 8.6 2.2 7.4 2.2 C 6.1 2.2 4.7 3 4.7 4.5 C 4.7 6 6 6.6 7.3 7.1 C 8.7 7.7 9.8 8.4 9.8 9.8 C 9.8 11.3 8.4 12 7 12 C 5.6 12 4.5 11.3 4.5 10.2"
          stroke="white" strokeWidth="1.45" strokeLinecap="round" fill="none"
        />
      </svg>
    </Tooltip>
  )
}

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

// ─── Main page ────────────────────────────────────────────────────────────────

type SearchResult = { doc: MetadataDocument; nameMatch: boolean; relevantMentions: number; excerpt: string }

export default function SharepointVersion3() {
  const navigate = useNavigate()
  const { connectedSiteIds } = useConnections()

  // Upload (device)
  const [isUploading] = useState(false)
  const [tempDocs, setTempDocs] = useState<MetadataDocument[]>([])

  // SharePoint — browse mode
  const [viewMode, setViewMode] = useState<'library' | 'sharepoint'>('library')
  const [spBrowseSelected, setSpBrowseSelected] = useState<Set<string>>(new Set())
  const [spBrowseSiteFilter, setSpBrowseSiteFilter] = useState('all')
  const [importedSpKeys, setImportedSpKeys] = useState<Set<string>>(new Set())
  const [spDocs, setSpDocs] = useState<MetadataDocument[]>([])
  const [spDocSiteIds, setSpDocSiteIds] = useState<Record<string, string>>({})
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

  const connectedSites = useMemo(
    () => SHAREPOINT_SITES.filter(s => connectedSiteIds.includes(s.id)),
    [connectedSiteIds],
  )

  const spBrowseRows = useMemo((): SpBrowseRow[] =>
    Object.entries(SP_FILE_META)
      .filter(([key]) => {
        const siteId = SP_FILE_SITE[key]
        return connectedSiteIds.includes(siteId) &&
               (spBrowseSiteFilter === 'all' || spBrowseSiteFilter === siteId)
      })
      .map(([key, meta]) => {
        const siteId = SP_FILE_SITE[key]
        const site = SHAREPOINT_SITES.find(s => s.id === siteId)
        return { key, name: meta.name, siteId, siteName: site?.name ?? '', size: meta.size, modified: meta.modified, format: meta.format, alreadyImported: importedSpKeys.has(key) }
      }),
    [connectedSiteIds, spBrowseSiteFilter, importedSpKeys],
  )

  const spBrowseColumns = useMemo(() => {
    const available = spBrowseRows.filter(r => !r.alreadyImported)
    const allBrowseSelected = available.length > 0 && available.every(r => spBrowseSelected.has(r.key))
    const someBrowseSelected = available.some(r => spBrowseSelected.has(r.key))
    return [
      {
        title: () => (
          <Checkbox
            checked={allBrowseSelected}
            indeterminate={someBrowseSelected && !allBrowseSelected}
            onChange={e => setSpBrowseSelected(prev => {
              const next = new Set(prev)
              available.forEach(r => e.target.checked ? next.add(r.key) : next.delete(r.key))
              return next
            })}
          />
        ),
        key: 'checkbox', width: 48,
        onCell: () => ({ onClick: (e: React.MouseEvent) => e.stopPropagation() }),
        render: (_: unknown, row: SpBrowseRow) => (
          <Checkbox
            checked={spBrowseSelected.has(row.key)}
            disabled={row.alreadyImported}
            onChange={e => setSpBrowseSelected(prev => { const next = new Set(prev); if (e.target.checked) next.add(row.key); else next.delete(row.key); return next })}
            onClick={e => e.stopPropagation()}
          />
        ),
      },
      {
        title: 'Document Name', key: 'name', dataIndex: 'name', ellipsis: true, width: '35%',
        render: (name: string, row: SpBrowseRow) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', opacity: row.alreadyImported ? 0.5 : 1 }}>
            <SharePointSourceIcon />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{name}</span>
            {row.alreadyImported && <div style={{ flexShrink: 0 }}><Chip label="Imported" chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} /></div>}
          </div>
        ),
      },
      {
        title: 'Site', key: 'siteName', dataIndex: 'siteName', width: 180,
        render: (siteName: string, row: SpBrowseRow) => (
          <div style={{ opacity: row.alreadyImported ? 0.5 : 1 }}>
            <Chip label={siteName} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
          </div>
        ),
      },
      {
        title: 'Modified', key: 'modified', dataIndex: 'modified', width: 120,
        render: (val: string, row: SpBrowseRow) => <span style={{ opacity: row.alreadyImported ? 0.5 : 1 }}>{formatDate(val)}</span>,
      },
      {
        title: 'Size', key: 'size', dataIndex: 'size', width: 90,
        render: (val: string, row: SpBrowseRow) => <span style={{ opacity: row.alreadyImported ? 0.5 : 1 }}>{val}</span>,
      },
      {
        title: 'Format', key: 'format', dataIndex: 'format', width: 90,
        render: (val: string, row: SpBrowseRow) => <span style={{ opacity: row.alreadyImported ? 0.5 : 1 }}>{val}</span>,
      },
    ]
  }, [spBrowseRows, spBrowseSelected])

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

  // ── SharePoint ───────────────────────────────────────────────────────────

  const handleBrowseImport = useCallback(() => {
    const toImport = [...spBrowseSelected].map(key => ({ key, siteId: SP_FILE_SITE[key] }))
    if (!toImport.length) return
    setViewMode('library')
    setSpBrowseSelected(new Set())
    setSpBrowseSiteFilter('all')
    notification.default({ key: 'sp-import', title: 'Importing from SharePoint…', placement: toastPlacements.BOTTOM_RIGHT, duration: 0, content: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size="small" /><Typography>{toImport.length} file{toImport.length > 1 ? 's' : ''}</Typography></div> })
    setTimeout(() => {
      const newDocs = toImport.map(({ key }) => spFileToDoc(key))
      const newMapping: Record<string, string> = {}
      toImport.forEach(({ siteId }, i) => { spDocIds.current.add(newDocs[i]._id); newMapping[newDocs[i]._id] = siteId })
      setSpDocs(prev => [...newDocs, ...prev])
      setSpDocSiteIds(prev => ({ ...prev, ...newMapping }))
      setImportedSpKeys(prev => new Set([...prev, ...toImport.map(({ key }) => key)]))
      notification.destroy('sp-import')
      notification.success({ title: `${toImport.length} document${toImport.length > 1 ? 's' : ''} imported`, placement: toastPlacements.BOTTOM_LEFT, duration: 5, content: <Typography>From SharePoint</Typography> })
    }, 1800)
  }, [spBrowseSelected, notification])

  // ── Table logic ──────────────────────────────────────────────────────────

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
          onClick: editingKey === record._id ? undefined : () => navigate(`/my-documents/sharepoint/version-3/${record._id}`),
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
            {isSpDoc(record._id) && (
              <SharePointSourceIcon siteName={SHAREPOINT_SITES.find(s => s.id === spDocSiteIds[record._id])?.name} />
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{stripYear(name)}</span>
            {record.label && <div style={{ flexShrink: 0 }}><Chip label={record.label} chipStyle={chipStyles.SEMANTIC_WARNING} variant={chipVariants.SUBTLE} /></div>}
          </div>
        )
        col.onCell = (record: MetadataDocument) => ({
          onClick: editingKey === record._id ? undefined : () => navigate(`/my-documents/sharepoint/version-3/${record._id}`),
          style: { cursor: editingKey === record._id ? 'default' : 'pointer', verticalAlign: 'top', maxWidth: 0, backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined },
        })
      }

      if (key === 'documentType') {
        col.width = 160
        col.onCell = (record: MetadataDocument) => ({
          onClick: editingKey === record._id ? undefined : () => navigate(`/my-documents/sharepoint/version-3/${record._id}`),
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
  }, [navigate, editingKey, selectedKeys, handleCellChange, startEdit, saveEdit, cancelEdit, filteredDocs, allSelected, someSelected, spDocSiteIds])

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
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', backgroundColor: colorPalette.white }}>

      {/* ── Main content column ────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>

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
                        onClick={() => { navigate(`/my-documents/sharepoint/version-3/${doc._id}`); setShowDropdown(false) }}
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

        {/* Table toolbar */}
        {viewMode === 'sharepoint' ? (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(3) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
              <ButtonGhost
                leftIcon={iconType.ChevronLeftOutlined}
                onClick={() => { setViewMode('library'); setSpBrowseSelected(new Set()); setSpBrowseSiteFilter('all') }}
              >
                Back to library
              </ButtonGhost>
              {connectedSites.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                  <div style={{ cursor: 'pointer' }} onClick={() => setSpBrowseSiteFilter('all')}>
                    <Chip label="All sites" chipStyle={spBrowseSiteFilter === 'all' ? chipStyles.ACCENT_BLUE : chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
                  </div>
                  {connectedSites.map(site => (
                    <div key={site.id} style={{ cursor: 'pointer' }} onClick={() => setSpBrowseSiteFilter(site.id)}>
                      <Chip label={site.name} chipStyle={spBrowseSiteFilter === site.id ? chipStyles.ACCENT_BLUE : chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ButtonPrimary
              leftIcon={iconType.DownloadOutlined}
              onClick={handleBrowseImport}
              disabled={spBrowseSelected.size === 0}
            >
              {spBrowseSelected.size > 0 ? `Import ${spBrowseSelected.size} document${spBrowseSelected.size > 1 ? 's' : ''}` : 'Import documents'}
            </ButtonPrimary>
          </div>
        ) : (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {appliedQuery && (
                <Typography size="base-sm" color="neutral-darken2">
                  {filteredDocs.length} result{filteredDocs.length !== 1 ? 's' : ''} for "{appliedQuery}"
                </Typography>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              <ButtonTertiary leftIcon={iconType.UploadOutlined}>
                Upload document
              </ButtonTertiary>
              <ButtonTertiary
                leftIcon={iconType.FolderFilled}
                onClick={() => {
                  if (connectedSiteIds.length > 0) setViewMode('sharepoint')
                  else navigate('/my-documents/sharepoint/version-3/connections')
                }}
              >
                Import from SharePoint
              </ButtonTertiary>
            </div>
          </div>
        )}

        {/* Document table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {viewMode === 'sharepoint' ? (
              <Table
                dataSource={spBrowseRows}
                columns={spBrowseColumns as never}
                pagination={false}
                {...({ onRow: (row: SpBrowseRow) => ({
                  style: { height: 56, cursor: row.alreadyImported ? 'default' : 'pointer' },
                  onClick: () => {
                    if (row.alreadyImported) return
                    setSpBrowseSelected(prev => { const next = new Set(prev); if (next.has(row.key)) next.delete(row.key); else next.add(row.key); return next })
                  },
                }) } as any)}
              />
            ) : isInitialLoading ? (
              <Skeleton variant={skeletonVariants.TEXT} title paragraph={{ rows: PAGE_SIZE }} />
            ) : (
              <Table
                dataSource={pagedDocs}
                columns={columns as never}
                pagination={false}
                innerLoading={isSearching || isUploading}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...({ components: { body: { cell: EditableCell } }, onRow: (record: MetadataDocument) => ({
                  style: { height: 72, ...(editingKey === record._id ? { backgroundColor: '#F5F9FF' } : selectedKeys.has(record._id) ? { backgroundColor: '#EEF4FF' } : {}) },
                }) } as any)}
              />
            )}
          </div>
          {viewMode === 'library' && (
            <div style={{ flexShrink: 0 }}>
              <Pagination current={currentPage} total={filteredDocs.length} pageSize={PAGE_SIZE} onChange={page => setCurrentPage(page)} />
            </div>
          )}
        </div>

        {/* Security footer */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2) }}>
          <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
          <Typography size="base" color="neutral-darken2">All files are securely stored and scanned for viruses.</Typography>
        </div>
      </div>


{/* ── Bulk action bar ────────────────────────────────────────────── */}
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

    </div>
  )
}
