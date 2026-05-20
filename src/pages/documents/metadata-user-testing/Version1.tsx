import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ButtonGhost,
  buttonShapes,
  ButtonPrimary,
  ButtonTertiary,
  Checkbox,
  Chip,
  chipStyles,
  chipVariants,
  constants,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  FileUploader,
  Icon,
  iconType,
  Input,
  Pagination,
  Select,
  PopOver,
  popOverPlacements,
  popOverTriggers,
  SearchBar,
  Skeleton,
  skeletonVariants,
  Spinner,
  Table,
  toastPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument, type DocumentStatus, type FileFormat } from './documents'

const { colorPalette, spacing } = constants
const PAGE_SIZE = 10
const SELECTOR_MARGIN = 16
// Approximate height consumed by PopOver chrome (border, padding) + footer button
const SELECTOR_CHROME = 80

const STATUS_CHIP_STYLE: Record<DocumentStatus, string> = {
  Approved: chipStyles.SEMANTIC_SUCCESS,
  Draft: chipStyles.ACCENT_BLUE,
  Superseded: chipStyles.ACCENT_NEUTRAL,
}

const ALL_COLUMNS: { key: string; label: string }[] = [
  { key: 'name', label: 'Document Name' },
  { key: 'domain', label: 'Domain' },
  { key: 'documentType', label: 'Document Type' },
  { key: 'status', label: 'Status' },
  { key: 'namedEntity', label: 'Named Entity' },
  { key: 'namedEntityId', label: 'Named Entity ID' },
  { key: 'jurisdiction', label: 'Jurisdiction' },
  { key: 'year', label: 'Year' },
  { key: 'lawType', label: 'Law Type' },
  { key: 'citations', label: 'Citations' },
  { key: 'monetaryAmounts', label: 'Amount' },
  { key: 'monetaryTypes', label: 'Monetary Type' },
  { key: 'fileFormat', label: 'Format' },
  { key: 'fileSize', label: 'File Size' },
  { key: 'uploadedDate', label: 'Uploaded' },
]

const INITIAL_VISIBLE = new Set([
  'name', 'domain', 'status', 'namedEntity', 'jurisdiction', 'year', 'fileFormat', 'uploadedDate',
])

const UPLOAD_FORMATS = new Set<string>(['PDF', 'DOCX', 'XLSX', 'PPTX'])
const UPLOAD_KEY = 'upload-in-progress'
const NON_EDITABLE_KEYS = new Set(['fileFormat', 'fileSize', 'uploadedDate'])

const DOMAIN_OPTIONS = [
  { label: 'HR', value: 'HR' },
  { label: 'HR/Tax', value: 'HR/Tax' },
  { label: 'Tax', value: 'Tax' },
]

const STATUS_OPTIONS = [
  { label: 'Approved', value: 'Approved' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Superseded', value: 'Superseded' },
]

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EditableCell({ editable, isEditing, dataIndex, initialValue, onValueChange, docLabel, children, ...restProps }: any) {
  const [fieldValue, setFieldValue] = useState('')

  useEffect(() => {
    if (isEditing) setFieldValue(String(initialValue ?? ''))
  }, [isEditing, initialValue])

  if (!editable) return <td {...restProps}>{children}</td>

  const isSelectField = dataIndex === 'domain' || dataIndex === 'status'

  return (
    <td {...restProps}>
      {isEditing ? (
        <div onClick={e => e.stopPropagation()}>
          {isSelectField ? (
            <Select
              name={dataIndex}
              value={fieldValue}
              options={dataIndex === 'domain' ? DOMAIN_OPTIONS : STATUS_OPTIONS}
              optionRender={dataIndex === 'status' ? option => (
                <Chip label={String(option.label)} chipStyle={STATUS_CHIP_STYLE[option.value as DocumentStatus]} variant={chipVariants.SUBTLE} />
              ) : undefined}
              onChange={v => {
                const val = String(v)
                setFieldValue(val)
                onValueChange?.(dataIndex, val)
              }}
            />
          ) : (
            <Input
              name={dataIndex}
              value={fieldValue}
              onChange={e => {
                setFieldValue(e.target.value)
                onValueChange?.(dataIndex, e.target.value)
              }}
            />
          )}
        </div>
      ) : children}
    </td>
  )
}

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

export default function MetadataUserTestingV1() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set(INITIAL_VISIBLE))
  const [selectorMaxHeight, setSelectorMaxHeight] = useState(400)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [tempDocs, setTempDocs] = useState<MetadataDocument[]>([])
  const [localDocs, setLocalDocs] = useState<MetadataDocument[]>(() => [...documents])
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const pendingEditsRef = useRef<Record<string, string>>({})
  const triggerRef = useRef<HTMLDivElement>(null)
  const searchBarWrapperRef = useRef<HTMLDivElement>(null)
  const pendingFilesRef = useRef<File[]>([])
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastAppliedQueryRef = useRef('')
  const { notification } = useNotifications()

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
      if (searchBarWrapperRef.current && !searchBarWrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const toggleKey = useCallback((key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
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

      notification.openNotification({
        key: UPLOAD_KEY,
        title: 'Uploading...',
        placement: toastPlacements.BOTTOM_RIGHT,
        duration: 0,
        leadingIcon: false,
        content: toastContent(label),
      })

      setTimeout(() => {
        notification.openNotification({
          key: UPLOAD_KEY,
          title: 'Extracting metadata...',
          placement: toastPlacements.BOTTOM_RIGHT,
          duration: 0,
          leadingIcon: false,
          content: toastContent(label),
        })
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
            status: 'Draft' as DocumentStatus,
            namedEntity: '—',
            namedEntityId: '—',
            year: extracted.year,
            monetaryAmounts: 0,
            currency: 'EUR',
            monetaryTypes: 'None',
            lawType: '—',
            citations: '—',
            jurisdiction: extracted.jurisdiction,
            uploadedDate: today,
            fileSize: formatFileSize(f.size),
            fileFormat: (UPLOAD_FORMATS.has(ext) ? ext : 'PDF') as FileFormat,
          }
        })
        setTempDocs(prev => [...newDocs, ...prev])

        const successLabel = files.length === 1 ? '1 document' : `${files.length} documents`
        notification.success({
          title: 'Upload successful',
          placement: toastPlacements.BOTTOM_LEFT,
          duration: 5,
          content: <Typography>{successLabel}</Typography>,
        })
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

  const handleCellChange = useCallback((key: string, value: string) => {
    pendingEditsRef.current[key] = value
  }, [])

  const startEdit = useCallback((record: MetadataDocument) => {
    pendingEditsRef.current = {}
    setEditingKey(record._id)
  }, [])

  const saveEdit = useCallback((record: MetadataDocument) => {
    handleSave({ ...record, ...pendingEditsRef.current } as MetadataDocument)
    setEditingKey(null)
    pendingEditsRef.current = {}
  }, [handleSave])

  const cancelEdit = useCallback(() => {
    setEditingKey(null)
    pendingEditsRef.current = {}
  }, [])

  const handleSelectorOpenChange = useCallback((open: boolean) => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const vh = window.innerHeight
    const spaceBelow = vh - rect.bottom - SELECTOR_MARGIN - SELECTOR_CHROME
    const spaceAbove = rect.top - SELECTOR_MARGIN - SELECTOR_CHROME
    // Use whichever direction has more room; antd will have flipped the popup accordingly
    setSelectorMaxHeight(Math.max(80, Math.max(spaceBelow, spaceAbove)))
  }, [])

  const columns = useMemo(() => {
    const visible: object[] = ALL_COLUMNS
      .filter(({ key }) => visibleKeys.has(key))
      .map(({ key, label }) => {
        const col: Record<string, unknown> = {
          title: label,
          key,
          dataIndex: key,
          ellipsis: true,
          sorter: makeSorter(key),
          onCell: (record: MetadataDocument) => ({
            onClick: (editingKey === record._id || record._id.startsWith('temp-')) ? undefined : () => navigate(`/my-documents/mockup/version-1/${record._id}`),
            style: { cursor: (editingKey === record._id || record._id.startsWith('temp-')) ? 'default' : 'pointer', maxWidth: 0, backgroundColor: editingKey === record._id ? '#F5F9FF' : undefined },
            ...(NON_EDITABLE_KEYS.has(key) ? {} : {
              editable: true,
              isEditing: editingKey === record._id,
              dataIndex: key,
              initialValue: record[key as keyof MetadataDocument],
              onValueChange: handleCellChange,
            }),
          }),
        }
        if (key === 'name') {
          col.width = '26%'
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
            onClick: (editingKey === record._id || record._id.startsWith('temp-')) ? undefined : () => navigate(`/my-documents/mockup/version-1/${record._id}`),
            style: { cursor: (editingKey === record._id || record._id.startsWith('temp-')) ? 'default' : 'pointer', maxWidth: 0, backgroundColor: editingKey === record._id ? '#F5F9FF' : undefined },
            editable: true,
            isEditing: editingKey === record._id,
            dataIndex: key,
            initialValue: record[key as keyof MetadataDocument],
            onValueChange: handleCellChange,
            docLabel: record.label,
          })
        }
        if (key === 'status') {
          col.render = (status: DocumentStatus) => (
            <Chip label={status} chipStyle={STATUS_CHIP_STYLE[status]} variant={chipVariants.SUBTLE} />
          )
        }
        if (key === 'monetaryAmounts') {
          col.render = (amount: number) => amount > 0 ? `${amount.toLocaleString('de-DE')} EUR` : '—'
        }
        if (key === 'monetaryTypes') {
          col.render = (t: string) => t === 'None' ? '—' : t
        }
        return col
      })

    const columnSelectorContent = (
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: selectorMaxHeight, overflowY: 'auto' }}>
        {ALL_COLUMNS.map(({ key, label }) => (
          <div key={key} style={{ padding: `${spacing(2)}px ${spacing(3)}px` }}>
            <Checkbox checked={visibleKeys.has(key)} onChange={() => toggleKey(key)}>
              {label}
            </Checkbox>
          </div>
        ))}
      </div>
    )

    const columnSelectorFooter = (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => console.log('New Column')}>
          New Column
        </ButtonGhost>
      </div>
    )

    visible.push({
      title: (
        <div ref={triggerRef} style={{ display: 'inline-block' }}>
          <PopOver
            trigger={popOverTriggers.CLICK}
            placement={popOverPlacements.BOTTOM_RIGHT}
            content={columnSelectorContent}
            footer={columnSelectorFooter}
            onOpenChange={handleSelectorOpenChange}
          >
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.PlusOutlined} />
          </PopOver>
        </div>
      ),
      key: 'actions',
      width: editingKey ? 160 : 56,
      onCell: (record: MetadataDocument) => ({ style: { backgroundColor: editingKey === record._id ? '#F5F9FF' : undefined } }),
      render: (_: unknown, record: MetadataDocument) => {
        if (editingKey === record._id) {
          return (
            <div style={{ display: 'flex', gap: 8 }}>
              <ButtonPrimary onClick={() => saveEdit(record)}>Save</ButtonPrimary>
              <ButtonTertiary onClick={cancelEdit}>Cancel</ButtonTertiary>
            </div>
          )
        }
        return (
          <Dropdown
            items={[
              { key: 'copilot', label: 'Ask CoPilot', onClick: () => console.log('Ask CoPilot', record.name) },
              { key: 'edit', label: 'Edit document info', onClick: () => startEdit(record) },
              { key: 'download', label: 'Download', onClick: () => console.log('Download', record.name) },
              { key: 'delete', label: 'Delete', onClick: () => console.log('Delete', record.name) },
            ]}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
          </Dropdown>
        )
      },
    })

    return visible
  }, [visibleKeys, navigate, toggleKey, selectorMaxHeight, handleSelectorOpenChange, editingKey, handleCellChange, startEdit, saveEdit, cancelEdit])

  const allDocs = useMemo(() => [...tempDocs, ...localDocs], [tempDocs, localDocs])

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

      results.push({
        doc,
        nameMatch,
        relevantMentions: totalHits,
        excerpt: getRelevantExcerpt(snippetText, q),
      })
    }

    results.sort((a, b) => (b.nameMatch ? 1 : 0) - (a.nameMatch ? 1 : 0))
    return results.slice(0, 5)
  }, [searchInput, allDocs])

  const filteredDocs = useMemo(
    () =>
      allDocs.filter((doc) => {
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

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: colorPalette.white, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <Typography size="heading-lg" weight="bold">Meine Dokumente</Typography>

        <div
          ref={searchBarWrapperRef}
          style={{ position: 'relative' }}
          onKeyDown={(e) => {
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
            onChange={(v) => {
              setSearchInput(v)
              setCurrentPage(1)
              if (!v) {
                setSearchQuery('')
                setShowDropdown(false)
              } else {
                setShowDropdown(true)
              }
            }}
            onFocus={() => {
              if (searchInput.length >= 2 && searchResults.length > 0) setShowDropdown(true)
            }}
          />

          {showDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              width: 400,
              backgroundColor: colorPalette.white,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              zIndex: 200,
              overflow: 'hidden',
            }}>
              <div style={{ maxHeight: 420, overflowY: 'auto', overscrollBehavior: 'contain' }}>
              {searchResults.map(({ doc, relevantMentions, excerpt }, idx) => {
                const q = searchInput.trim()
                const footerParts: string[] = []
                if (relevantMentions > 1) footerParts.push(`${relevantMentions} relevant mentions`)
                footerParts.push(formatDate(doc.uploadedDate))

                return (
                  <div
                    key={doc._id}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderTop: idx > 0 ? '1px solid #f0f0f0' : 'none',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F9FF')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    onClick={() => {
                      navigate(`/my-documents/mockup/version-1/${doc._id}`)
                      setShowDropdown(false)
                    }}
                  >
                    <Typography size="base" weight="semibold" color="neutral-darken5">
                      {highlightAll(stripYear(doc.name), q)}
                    </Typography>
                    <div style={{ marginTop: 4 }}>
                      <Typography size="base-sm" color="neutral-darken5" maxLines={2}>
                        {highlightAll(excerpt, q)}
                      </Typography>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Typography size="base-sm" color="neutral-darken2">
                        {footerParts.join(' • ')}
                      </Typography>
                    </div>
                  </div>
                )
              })}

              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', padding: `${spacing(2)}px ${spacing(3)}px`, display: 'flex', justifyContent: 'center' }}>
                <ButtonGhost onClick={() => {
                  setSearchQuery(searchInput.trim())
                  setCurrentPage(1)
                  setShowDropdown(false)
                }}>
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
            style={{
              border: '1.5px dashed #d0d0d0',
              borderRadius: 8,
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: isUploading ? 'not-allowed' : 'pointer',
              width: '100%',
              opacity: isUploading ? 0.5 : 1,
              pointerEvents: isUploading ? 'none' : 'auto',
              transition: 'opacity 0.2s ease',
            }}
          >
            <Icon type={iconType.UploadOutlined} color="neutral-darken4" />
            <Typography color="neutral-darken5">Click to select a document or drag it here.</Typography>
            <Typography size="base-sm" color="neutral-darken2">PDF, DOCX, XLSX and PPTX formats, max. 10 MB</Typography>
          </div>
        </FileUploader>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {isInitialLoading ? (
          <Skeleton
            variant={skeletonVariants.TEXT}
            title
            paragraph={{ rows: PAGE_SIZE }}
          />
        ) : (
          <Table
            dataSource={pagedDocs}
            columns={columns as never}
            pagination={false}
            innerLoading={isUploading || isSearching}
            components={{ body: { cell: EditableCell } } as never}
            onRow={(record: MetadataDocument) => ({
              style: editingKey === record._id ? { backgroundColor: '#F5F9FF' } : undefined,
            })}
          />
        )}
      </div>

      <div style={{ flexShrink: 0 }}>
        <Pagination
          current={currentPage}
          total={filteredDocs.length}
          pageSize={PAGE_SIZE}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>

      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2), paddingTop: spacing(2), paddingBottom: spacing(2) }}>
        <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
        <Typography size="base" color="neutral-darken2">All files are securely uploaded and scanned for viruses.</Typography>
      </div>
    </div>
  )
}
