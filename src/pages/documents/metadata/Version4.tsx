import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ButtonGhost,
  buttonShapes,
  buttonVariants,
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
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument, type FileFormat } from '../bulk-edit/documents'

const { colorPalette, spacing } = constants
const PAGE_SIZE = 10

const UPLOAD_FORMATS = new Set<string>(['PDF', 'DOCX', 'XLSX', 'PPTX'])
const UPLOAD_KEY = 'upload-in-progress'

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

function getDocumentTags(doc: MetadataDocument): Tag[] {
  const tags: Tag[] = []
  tags.push({ text: doc.domain, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.tagList?.length) tags.push(...doc.tagList.map(t => ({ ...t, variant: chipVariants.HIGHLIGHT })))
  if (doc.namedEntity !== '—') tags.push({ text: doc.namedEntity, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.namedEntityId !== '—') tags.push({ text: doc.namedEntityId, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.jurisdiction !== '—') tags.push({ text: doc.jurisdiction, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.lawType !== '—') tags.push({ text: doc.lawType, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.citations !== '—') tags.push({ text: doc.citations, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.monetaryAmounts > 0) tags.push({ text: `${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}`, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.monetaryTypes !== 'None') tags.push({ text: doc.monetaryTypes, style: chipStyles.ACCENT_NEUTRAL })
  return tags
}

function stripYear(name: string) {
  return name.replace(/\s*\(\d{4}\)\s*/g, '').trim()
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function makeSorter(key: string) {
  return (a: MetadataDocument, b: MetadataDocument) => {
    const av = a[key as keyof MetadataDocument]
    const bv = b[key as keyof MetadataDocument]
    if (typeof av === 'number' && typeof bv === 'number') return av - bv
    return String(av ?? '').localeCompare(String(bv ?? ''), 'de')
  }
}

const NEUTRAL_LIGHTEN3 = '#E5E9F6'

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightAll(text: string, query: string): ReactNode {
  if (!query || !text.toLowerCase().includes(query.toLowerCase())) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <span key={i} style={{ backgroundColor: NEUTRAL_LIGHTEN3, borderRadius: 2, padding: '0 1px' }}>{part}</span>
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function countOccurrences(text: string, query: string): number {
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  let count = 0
  let pos = 0
  while ((pos = lower.indexOf(q, pos)) !== -1) { count++; pos += q.length }
  return count
}

type SearchResult = {
  doc: MetadataDocument
  nameMatch: boolean
  relevantMentions: number
  excerpt: string
}

function TagsCellInner({ tags }: { tags: { text: string; style: string; variant?: string }[] }) {
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
    <div ref={containerRef} style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'flex-start' }}>
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

function TagsCell({ tags }: { tags: { text: string; style: string; variant?: string }[] }) {
  return <TagsCellInner key={tags.map(t => t.text).join('|')} tags={tags} />
}

type Tag = { text: string; style: string; variant?: string }

function simulateExtraction(nameWithoutExt: string): { domain: string; documentType: string; year: number; jurisdiction: string } {
  const lower = nameWithoutExt.toLowerCase()
  const yearMatch = nameWithoutExt.match(/\b(20\d{2})\b/)
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear()
  const hrSignals  = /\b(hr|human.?resource|employ|mitarbeiter|relocation|versetzung|entsend|salary|gehalt|homeoffice|posting|payroll)\b/.test(lower)
  const taxSignals = /\b(tax|steuer|dba|fiscal|withholding|quellensteuer|lohnsteuer|treaty|abkommen|compliance|183)\b/.test(lower)
  const domain = hrSignals && taxSignals ? 'HR/Tax' : taxSignals ? 'Tax' : 'HR'
  let documentType: string
  if      (/treaty|abkommen/.test(lower))             documentType = 'Tax Treaty Guide'
  else if (/183.?day|183.?tage/.test(lower))          documentType = 'Tax Rule Explanation'
  else if (/withholding|quellensteuer/.test(lower))   documentType = 'Tax Regulation Guide'
  else if (/payroll|lohnsteuer/.test(lower))          documentType = 'Payroll Tax Guidance'
  else if (/social.?insur|sozialvers/.test(lower))    documentType = 'Social Insurance Guide'
  else if (/compliance/.test(lower))                  documentType = domain === 'Tax' ? 'Tax Compliance Guide' : 'Compliance Guide'
  else if (/salary|gehalt/.test(lower))               documentType = 'Salary Policy'
  else if (/expense|spesen|reisekosten/.test(lower))  documentType = 'Expense Policy'
  else if (/report|bericht|analyt/.test(lower))       documentType = 'Analytical Report'
  else if (/legal.?defin/.test(lower))                documentType = 'Legal Definition Guide'
  else if (/(guide|leitfaden|guidance)/.test(lower))  documentType = domain === 'HR' ? 'HR Guide' : 'Tax Guidance'
  else if (/policy|richtlinie/.test(lower))           documentType = domain === 'Tax' ? 'Tax Guidance' : 'HR Policy'
  else                                                documentType = domain === 'Tax' ? 'Tax Guidance' : 'HR Policy'
  let jurisdiction = '—'
  if      (/\b(germany|deutschland|german)\b/.test(lower)) jurisdiction = 'Germany'
  else if (/\b(uk|britain|british|england)\b/.test(lower)) jurisdiction = 'UK'
  else if (/\b(france|frankreich)\b/.test(lower))          jurisdiction = 'France'
  else if (/\b(eu|europe|european)\b/.test(lower))         jurisdiction = 'EU'
  else if (/\b(us|usa|united.?states)\b/.test(lower))      jurisdiction = 'US'
  return { domain, documentType, year, jurisdiction }
}

export default function MetadataVersion4() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [tempDocs, setTempDocs] = useState<MetadataDocument[]>([])
  const [localDocs, setLocalDocs] = useState<MetadataDocument[]>(() => [...documents])
  const [, setSidebarWidth] = useState(SIDEBAR_COLLAPSED_WIDTH)

  const [modalDoc, setModalDoc] = useState<MetadataDocument | null>(null)
  const [editingDomain, setEditingDomain] = useState('')
  const [editingCustomTags, setEditingCustomTags] = useState<Tag[]>([])
  const [editingRemovedFields, setEditingRemovedFields] = useState<Set<string>>(new Set())
  const [tagInputVal, setTagInputVal] = useState('')

  const searchBarWrapperRef = useRef<HTMLDivElement>(null)
  const pendingFilesRef = useRef<File[]>([])
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastAppliedQueryRef = useRef('')
  const { notification } = useNotifications()

  useEffect(() => {
    const sidebar = document.getElementById(LAYOUT_SIDEBAR_ID)
    if (!sidebar) return
    setSidebarWidth(sidebar.getBoundingClientRect().width)
    const observer = new ResizeObserver(entries => { setSidebarWidth(entries[0].contentRect.width) })
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
    const t = setTimeout(() => {
      setAppliedQuery(searchQuery)
      lastAppliedQueryRef.current = searchQuery
      setIsSearching(false)
    }, 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBarWrapperRef.current && !searchBarWrapperRef.current.contains(e.target as Node)) setShowDropdown(false)
    }
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowDropdown(false) }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => { document.removeEventListener('mousedown', handleClickOutside); document.removeEventListener('keydown', handleEscape) }
  }, [])

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Spinner size="small" />
          <Typography>{text}</Typography>
        </div>
      )
      notification.default({ key: UPLOAD_KEY, title: 'Uploading...', placement: toastPlacements.BOTTOM_RIGHT, duration: 0, leadingIcon: false, content: toastContent(label) })
      setTimeout(() => {
        notification.default({ key: UPLOAD_KEY, title: 'Extracting metadata...', placement: toastPlacements.BOTTOM_RIGHT, duration: 0, leadingIcon: false, content: toastContent(label) })
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

  const handleSave = useCallback((updated: MetadataDocument) => {
    if (updated._id.startsWith('temp-')) {
      setTempDocs(prev => prev.map(d => d._id === updated._id ? updated : d))
    } else {
      setLocalDocs(prev => prev.map(d => d._id === updated._id ? updated : d))
    }
  }, [])

  const openModal = useCallback((record: MetadataDocument) => {
    setModalDoc(record)
    setEditingDomain(record.domain)
    setEditingCustomTags(record.tagList ?? [])
    setEditingRemovedFields(new Set())
    setTagInputVal('')
  }, [])

  const closeModal = useCallback(() => {
    setModalDoc(null)
    setEditingDomain('')
    setEditingCustomTags([])
    setEditingRemovedFields(new Set())
    setTagInputVal('')
  }, [])

  const addTag = useCallback(() => {
    const t = tagInputVal.trim()
    if (t && !editingCustomTags.some(tag => tag.text === t)) {
      setEditingCustomTags(prev => [...prev, { text: t, style: chipStyles.ACCENT_NEUTRAL, variant: chipVariants.HIGHLIGHT }])
    }
    setTagInputVal('')
  }, [tagInputVal, editingCustomTags])

  const removeField = useCallback((key: string) => {
    setEditingRemovedFields(prev => new Set(prev).add(key))
  }, [])

  const saveModal = useCallback(() => {
    if (!modalDoc) return
    const updated: MetadataDocument = {
      ...modalDoc,
      domain: editingDomain,
      tagList: editingCustomTags,
      ...(editingRemovedFields.has('namedEntity')     && { namedEntity: '—' }),
      ...(editingRemovedFields.has('namedEntityId')   && { namedEntityId: '—' }),
      ...(editingRemovedFields.has('jurisdiction')    && { jurisdiction: '—' }),
      ...(editingRemovedFields.has('lawType')         && { lawType: '—' }),
      ...(editingRemovedFields.has('citations')       && { citations: '—' }),
      ...(editingRemovedFields.has('monetaryAmounts') && { monetaryAmounts: 0 }),
      ...(editingRemovedFields.has('monetaryTypes')   && { monetaryTypes: 'None' }),
    }
    handleSave(updated)
    closeModal()
    notification.success({
      title: 'Document details updated successfully',
      placement: toastPlacements.BOTTOM_LEFT,
      duration: 4,
    })
  }, [modalDoc, editingDomain, editingCustomTags, editingRemovedFields, handleSave, closeModal, notification])

  const allDocs = useMemo(() => [...tempDocs, ...localDocs], [tempDocs, localDocs])

  const filteredDocs = useMemo(
    () => allDocs.filter(doc => {
      const q = appliedQuery.toLowerCase()
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.namedEntity.toLowerCase().includes(q) ||
        doc.domain.toLowerCase().includes(q) ||
        doc.jurisdiction.toLowerCase().includes(q) ||
        doc.documentType.toLowerCase().includes(q)
      )
    }),
    [allDocs, appliedQuery],
  )

  const pagedDocs = useMemo(
    () => filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredDocs, currentPage],
  )

  const columns = useMemo(() => {
    const visible: object[] = FIXED_COLS.map(({ key, label }) => {
      const needsEllipsis = key !== 'tags' && key !== 'documentType'
      const col: Record<string, unknown> = {
        title: label,
        key,
        dataIndex: key,
        ellipsis: needsEllipsis,
        sorter: key !== 'tags' ? makeSorter(key) : undefined,
        onCell: (record: MetadataDocument) => ({
          onClick: () => navigate(`/my-documents/metadata/version-4/${record._id}`),
          style: { cursor: 'pointer', verticalAlign: 'top' },
        }),
      }

      if (key === 'uploadedDate') { col.width = 110; col.render = (val: string) => formatDate(val) }
      if (key === 'fileSize') col.width = 80
      if (key === 'fileFormat') col.width = 90

      if (key === 'name') {
        col.width = '25%'
        col.render = (name: string, record: MetadataDocument) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
              {stripYear(name)}
            </span>
            {record.label && (
              <div style={{ flexShrink: 0 }}>
                <Chip label={record.label} chipStyle={chipStyles.SEMANTIC_WARNING} variant={chipVariants.SUBTLE} />
              </div>
            )}
          </div>
        )
        col.onCell = (record: MetadataDocument) => ({
          onClick: () => navigate(`/my-documents/metadata/version-4/${record._id}`),
          style: { cursor: 'pointer', verticalAlign: 'top', maxWidth: 0 },
        })
      }

      if (key === 'documentType') {
        col.width = 160
        col.onCell = (record: MetadataDocument) => ({
          onClick: () => navigate(`/my-documents/metadata/version-4/${record._id}`),
          style: { cursor: 'pointer', verticalAlign: 'top' },
        })
      }

      if (key === 'tags') {
        col.render = (_: unknown, record: MetadataDocument) => <TagsCell tags={getDocumentTags(record)} />
      }

      return col
    })

    visible.push({
      title: '',
      key: 'actions',
      width: 56,
      onCell: () => ({ style: { verticalAlign: 'top' } }),
      render: (_: unknown, record: MetadataDocument) => (
        <Dropdown
          items={[
            { key: 'copilot', label: 'Ask CoPilot', onClick: () => console.log('Ask CoPilot', record.name) },
            { key: 'edit', label: 'Edit document info', onClick: () => openModal(record) },
            { key: 'download', label: 'Download', onClick: () => console.log('Download', record.name) },
            { key: 'delete', label: 'Delete', onClick: () => console.log('Delete', record.name) },
          ]}
          trigger={dropdownTriggers.CLICK}
          placement={dropdownPlacement.BOTTOM_RIGHT}
        >
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
        </Dropdown>
      ),
    })

    return visible
  }, [navigate, openModal])

  const searchResults = useMemo((): SearchResult[] => {
    const q = searchInput.trim()
    if (q.length < 2) return []
    const qLower = q.toLowerCase()
    const results: SearchResult[] = []
    for (const doc of allDocs) {
      const displayName = stripYear(doc.name)
      const snippetText = DOCUMENT_SNIPPETS[doc._id] ?? `${doc.documentType} – ${doc.namedEntity}`
      const metaStr = [doc.domain, doc.documentType, doc.namedEntity, doc.lawType, doc.citations, doc.jurisdiction].join(' ')
      const nameMatch = displayName.toLowerCase().includes(qLower)
      const snippetHits = countOccurrences(snippetText, q)
      const metaHits = countOccurrences(metaStr, q)
      const totalHits = snippetHits + metaHits
      if (!nameMatch && totalHits === 0) continue
      results.push({ doc, nameMatch, relevantMentions: totalHits, excerpt: getRelevantExcerpt(snippetText, q) })
    }
    results.sort((a, b) => (b.nameMatch ? 1 : 0) - (a.nameMatch ? 1 : 0))
    return results.slice(0, 5)
  }, [searchInput, allDocs])

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: colorPalette.white, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <Typography size="heading-lg" weight="bold">Meine Dokumente</Typography>

        <div
          ref={searchBarWrapperRef}
          style={{ position: 'relative' }}
          onKeyDown={e => {
            if (e.key === 'Enter' && searchInput.trim()) {
              setSearchQuery(searchInput.trim())
              setCurrentPage(1)
              setShowDropdown(false)
            }
          }}
        >
          <SearchBar
            placeholder="Search by name, entity, domain…"
            value={searchInput}
            onChange={v => {
              setSearchInput(v)
              setCurrentPage(1)
              if (!v) { setSearchQuery(''); setShowDropdown(false) }
              else setShowDropdown(true)
            }}
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
                    <div
                      key={doc._id}
                      style={{ padding: '12px 16px', cursor: 'pointer', borderTop: idx > 0 ? '1px solid #f0f0f0' : 'none', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F9FF')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      onClick={() => { navigate(`/my-documents/metadata/version-4/${doc._id}`); setShowDropdown(false) }}
                    >
                      <Typography size="base" weight="semibold" color="neutral-darken5">{highlightAll(stripYear(doc.name), q)}</Typography>
                      <div style={{ marginTop: 4 }}>
                        <Typography size="base-sm" color="neutral-darken5" maxLines={2}>{highlightAll(excerpt, q)}</Typography>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Typography size="base-sm" color="neutral-darken2">{footerParts.join(' • ')}</Typography>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', padding: `${spacing(2)}px ${spacing(3)}px`, display: 'flex', justifyContent: 'center' }}>
                <ButtonGhost onClick={() => { setSearchQuery(searchInput.trim()); setCurrentPage(1); setShowDropdown(false) }}>
                  Show results
                </ButtonGhost>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ flexShrink: 0, width: '100%' }}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <FileUploader onUpload={handleUpload} accept={['.pdf', '.docx', '.xlsx', '.pptx']} {...({ multiple: true } as any)}>
          <div
            className="upload-zone"
            style={{ border: '1.5px dashed #d0d0d0', borderRadius: 8, padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: isUploading ? 'not-allowed' : 'pointer', width: '100%', backgroundColor: isUploading ? '#F0F0F0' : undefined, pointerEvents: isUploading ? 'none' : 'auto', transition: 'background-color 0.2s ease' }}
          >
            <Icon type={iconType.UploadOutlined} color={isUploading ? 'disabled-base' : 'neutral-darken4'} />
            <Typography color={isUploading ? 'disabled-base' : 'neutral-darken5'}>Click to select a document or drag it here.</Typography>
            <Typography size="base-sm" color={isUploading ? 'disabled-base' : 'neutral-darken2'}>PDF, DOCX, XLSX and PPTX formats, max. 10 MB</Typography>
          </div>
        </FileUploader>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {isInitialLoading ? (
            <Skeleton variant={skeletonVariants.TEXT} title paragraph={{ rows: PAGE_SIZE }} />
          ) : (
            <Table
              dataSource={pagedDocs}
              columns={columns as never}
              pagination={false}
              innerLoading={isUploading || isSearching}
            />
          )}
        </div>

        <div style={{ flexShrink: 0 }}>
          <Pagination current={currentPage} total={filteredDocs.length} pageSize={PAGE_SIZE} onChange={page => setCurrentPage(page)} />
        </div>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2), paddingTop: spacing(2), paddingBottom: spacing(2) }}>
        <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
        <Typography size="base" color="neutral-darken2">All files are securely uploaded and scanned for viruses.</Typography>
      </div>

      <Modal
        title="Edit Document Info"
        visible={!!modalDoc}
        onClose={closeModal}
        minWidth={480}
        withIcon={false}
        footer={{
          buttons: [
            { variant: buttonVariants.TERTIARY, props: { children: 'Cancel', onClick: closeModal } },
            { variant: buttonVariants.PRIMARY, props: { children: 'Save', onClick: saveModal } },
          ],
        }}
      >
        {modalDoc && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Document Name" name="name" value={modalDoc.name} disabled />
            <Select label="Domain" name="domain" value={editingDomain} options={DOMAIN_OPTIONS} onChange={v => setEditingDomain(String(v))} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Typography size="base" weight="semibold" color="neutral-darken5">Tags</Typography>
              <div style={{ position: 'relative' }}>
                <Input
                  placeholder="Add tag…"
                  value={tagInputVal}
                  onChange={e => setTagInputVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                />
                {tagInputVal.length > 0 && (
                  <span style={{ position: 'absolute', right: 12, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 12, color: '#9ca3af', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>Enter ↵</span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {editingCustomTags.map((tag, i) => (
                  <Chip key={i} label={tag.text} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.HIGHLIGHT} closable onClose={() => setEditingCustomTags(prev => prev.filter((_, j) => j !== i))} />
                ))}
                {modalDoc.namedEntity !== '—' && !editingRemovedFields.has('namedEntity') && <Chip label={modalDoc.namedEntity} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('namedEntity')} />}
                {modalDoc.namedEntityId !== '—' && !editingRemovedFields.has('namedEntityId') && <Chip label={modalDoc.namedEntityId} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('namedEntityId')} />}
                {modalDoc.jurisdiction !== '—' && !editingRemovedFields.has('jurisdiction') && <Chip label={modalDoc.jurisdiction} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('jurisdiction')} />}
                {modalDoc.lawType !== '—' && !editingRemovedFields.has('lawType') && <Chip label={modalDoc.lawType} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('lawType')} />}
                {modalDoc.citations !== '—' && !editingRemovedFields.has('citations') && <Chip label={modalDoc.citations} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('citations')} />}
                {modalDoc.monetaryAmounts > 0 && !editingRemovedFields.has('monetaryAmounts') && <Chip label={`${modalDoc.monetaryAmounts.toLocaleString('de-DE')} ${modalDoc.currency}`} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('monetaryAmounts')} />}
                {modalDoc.monetaryTypes !== 'None' && !editingRemovedFields.has('monetaryTypes') && <Chip label={modalDoc.monetaryTypes} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('monetaryTypes')} />}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
