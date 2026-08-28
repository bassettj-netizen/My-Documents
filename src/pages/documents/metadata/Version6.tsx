import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ButtonGhost,
  buttonShapes,
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
  Pagination,
  Select,
  selectModeVariants,
  SearchBar,
  Skeleton,
  skeletonVariants,
  Spinner,
  Table,
  toastPlacements,
  Tooltip,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument, type FileFormat } from './documents'

const { colorPalette, spacing } = constants
const PAGE_SIZE = 10

const UPLOAD_FORMATS = new Set<string>(['PDF', 'DOCX', 'XLSX', 'TXT'])
const UPLOAD_KEY = 'upload-in-progress'

const FIXED_COLS = [
  { key: 'name',         label: 'Name'     },
  { key: 'documentType', label: 'Type'     },
  { key: 'tags',         label: 'Tags'     },
  { key: 'uploadedDate', label: 'Uploaded' },
  { key: 'fileSize',     label: 'Size'     },
  { key: 'fileFormat',   label: 'Format'   },
]

type Tag = { text: string; style: string; variant?: string }

function getDocumentTags(doc: MetadataDocument): Tag[] {
  const tags: Tag[] = []
  tags.push({ text: doc.domain, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.tagList?.length) {
    tags.push(...doc.tagList.map(t => ({ text: t.text, style: chipStyles.ACCENT_NEUTRAL })))
  }
  if (doc.namedEntity !== '—') tags.push({ text: doc.namedEntity, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.namedEntityId !== '—') tags.push({ text: doc.namedEntityId, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.jurisdiction !== '—') tags.push({ text: doc.jurisdiction, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.lawType !== '—') tags.push({ text: doc.lawType, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.citations !== '—') tags.push({ text: doc.citations, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.monetaryAmounts > 0) tags.push({ text: `${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}`, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.monetaryTypes !== 'None') tags.push({ text: doc.monetaryTypes, style: chipStyles.ACCENT_NEUTRAL })
  return tags
}

function buildTagOptions(docs: MetadataDocument[]) {
  const set = new Set<string>()
  for (const doc of docs) {
    doc.tagList?.forEach(t => set.add(t.text))
    if (doc.namedEntity !== '—') set.add(doc.namedEntity)
    if (doc.namedEntityId !== '—') set.add(doc.namedEntityId)
    if (doc.jurisdiction !== '—') set.add(doc.jurisdiction)
    if (doc.lawType !== '—') set.add(doc.lawType)
    if (doc.citations !== '—') set.add(doc.citations)
    if (doc.monetaryAmounts > 0) set.add(`${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}`)
    if (doc.monetaryTypes !== 'None') set.add(doc.monetaryTypes)
  }
  return Array.from(set).sort().map(t => ({ label: t, value: t }))
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

function TagsCell({ tags }: { tags: Tag[] }) {
  return <TagsCellInner key={tags.map(t => t.text).join('|')} tags={tags} />
}

function CopilotIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.00078 10.687C6.5133 10.687 5.31067 9.48436 5.31067 7.99687C5.31067 6.50939 6.5133 5.30677 8.00078 5.30677C9.48826 5.30677 10.6909 6.50939 10.6909 7.99687C10.6909 9.48436 9.48826 10.687 8.00078 10.687ZM8.00078 6.09797C6.9564 6.09797 6.10188 6.9525 6.10188 7.99687C6.10188 9.04125 6.9564 9.89578 8.00078 9.89578C9.04516 9.89578 9.89969 9.04125 9.89969 7.99687C9.89969 6.9525 9.04516 6.09797 8.00078 6.09797ZM8.01662 15.181C6.38673 15.181 5.24739 13.9151 5.24739 12.1111C5.19991 11.0035 4.47199 10.7661 3.87067 10.7661C2.92122 10.7661 2.08254 10.4496 1.51287 9.86414C1.03814 9.37359 0.800781 8.72479 0.800781 7.99687C0.83243 5.9872 2.41485 5.24348 3.8865 5.22764C4.55111 5.22764 5.24739 4.8637 5.24739 3.88259C5.23155 2.03116 6.35505 0.796875 8.00078 0.796875C9.64651 0.796875 10.6909 1.99951 10.77 3.86677C10.8175 5.03775 11.6403 5.22764 12.1151 5.22764C13.5076 5.22764 15.1533 5.97136 15.2008 7.99687C15.2008 8.72479 14.9634 9.37359 14.4729 9.86414C13.9032 10.4338 13.0487 10.7661 12.1151 10.7661C11.5296 10.7661 10.8175 11.0035 10.7859 12.1111C10.7067 13.9784 9.63067 15.181 8.01662 15.181ZM6.02275 3.88259C6.02275 4.94282 5.37396 6.00304 3.8865 6.01885C3.20605 6.01885 1.62364 6.22458 1.59199 7.99687C1.59199 8.50326 1.75023 8.96217 2.08254 9.29447C2.49397 9.72173 3.14276 9.95906 3.87067 9.95906C5.15242 9.95906 5.97527 10.7819 6.03859 12.0637C6.03859 13.2188 6.65571 14.374 8.01662 14.374C9.3775 14.374 9.93133 13.5037 9.99461 12.0637C10.0421 10.7661 10.8649 9.95906 12.1151 9.94326C12.843 9.94326 13.4918 9.70589 13.919 9.27863C14.2513 8.93049 14.4254 8.48742 14.4096 7.98103C14.3779 6.16125 12.6373 6.00304 12.1151 6.00304C11.1182 6.00304 10.0421 5.43337 9.97881 3.88259C9.91549 2.44259 9.18761 1.57226 8.00078 1.57226C6.81396 1.57226 6.02275 2.47424 6.02275 3.86677V3.88259Z" fill="currentColor" stroke="currentColor" strokeWidth="0.2"/>
    </svg>
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

export default function MetadataUserTestingV6() {
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
  const [editingCell, setEditingCell] = useState<{ id: string; key: string } | null>(null)
  const [cellValue, setCellValue] = useState('')
  const [editingTags, setEditingTags] = useState<string[]>([])
  const allDocs = useMemo(() => [...tempDocs, ...localDocs], [tempDocs, localDocs])
  const tagOptions = useMemo(() => buildTagOptions(allDocs), [allDocs])
  const searchBarWrapperRef = useRef<HTMLDivElement>(null)
  const tagsEditRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (editingCell?.key !== 'tags') return
    const t = setTimeout(() => {
      tagsEditRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    }, 0)
    return () => clearTimeout(t)
  }, [editingCell])

  useEffect(() => {
    if (editingCell?.key !== 'tags') return
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element
      if (tagsEditRef.current?.contains(target)) return
      if (target.closest('.goat-select-dropdown')) return
      const record = allDocs.find(d => d._id === editingCell.id)
      if (record) {
        handleSave({
          ...record,
          tagList: editingTags.map(t => ({ text: t, style: chipStyles.ACCENT_NEUTRAL, variant: chipVariants.SUBTLE })),
          namedEntity: '—', namedEntityId: '—', jurisdiction: '—', lawType: '—', citations: '—',
          monetaryAmounts: 0, monetaryTypes: 'None',
        })
      }
      setEditingCell(null)
      setEditingTags([])
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [editingCell, editingTags, allDocs]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = useCallback((file: File | Blob) => {
    if (!(file instanceof File)) return
    pendingFilesRef.current.push(file)
    if (batchTimerRef.current) clearTimeout(batchTimerRef.current)
    batchTimerRef.current = setTimeout(() => {
      const files = [...pendingFilesRef.current]
      pendingFilesRef.current = []
      setIsUploading(true)

      const label = files.length === 1 ? files[0].name : `${files.length} Dokumente`
      const toastContent = (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Spinner size="small" />
          <Typography>{text}</Typography>
        </div>
      )

      notification.default({
        key: UPLOAD_KEY,
        title: 'Wird hochgeladen...',
        placement: toastPlacements.BOTTOM_RIGHT,
        duration: 0,
        leadingIcon: false,
        content: toastContent(label),
      })

      setTimeout(() => {
        notification.default({
          key: UPLOAD_KEY,
          title: 'Metadaten werden extrahiert...',
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
            uploadedDate: today,
            fileSize: formatFileSize(f.size),
            fileFormat: (UPLOAD_FORMATS.has(ext) ? ext : 'PDF') as FileFormat,
          }
        })
        setTempDocs(prev => [...newDocs, ...prev])

        const successLabel = files.length === 1 ? '1 Dokument' : `${files.length} Dokumente`
        notification.success({
          title: 'Upload erfolgreich',
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
          style: { verticalAlign: 'top', backgroundColor: editingCell?.id === record._id ? '#F5F9FF' : undefined },
        }),
      }

      if (key === 'uploadedDate') col.width = 110
      if (key === 'fileSize') col.width = 80
      if (key === 'fileFormat') col.width = 90

      if (key === 'name') {
        col.width = '25%'
        col.onCell = (record: MetadataDocument) => ({
          onClick: record._id.startsWith('temp-') ? undefined : () => navigate(`/projects/metadata/version-6/${record._id}`),
          style: {
            cursor: record._id.startsWith('temp-') ? 'default' : 'pointer',
            verticalAlign: 'top',
            maxWidth: 0,
            backgroundColor: editingCell?.id === record._id ? '#F5F9FF' : undefined,
          },
        })
        col.render = (name: string) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
              {stripYear(name)}
            </span>
          </div>
        )
      }

      if (key === 'documentType') {
        col.width = 160
        col.onCell = (record: MetadataDocument) => ({
          style: {
            verticalAlign: 'top',
            backgroundColor: editingCell?.id === record._id ? '#F5F9FF' : undefined,
            cursor: editingCell?.id === record._id && editingCell.key === 'documentType' ? 'default' : 'text',
          },
        })
        col.render = (val: string, record: MetadataDocument) => {
          if (editingCell?.id === record._id && editingCell.key === 'documentType') {
            const doSave = () => {
              handleSave({ ...record, documentType: cellValue })
              setEditingCell(null)
              setCellValue('')
            }
            return (
              <div onClick={e => e.stopPropagation()}>
                <Input
                  {...({ autoFocus: true } as any)}
                  value={cellValue}
                  onChange={e => setCellValue(e.target.value)}
                  onBlur={doSave}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); doSave() }
                    if (e.key === 'Escape') { e.stopPropagation(); setEditingCell(null); setCellValue('') }
                  }}
                />
              </div>
            )
          }
          return (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 22, cursor: 'text', borderRadius: 3, border: '1px dashed transparent', padding: '1px 6px 1px 4px' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#EBF0FF'
                e.currentTarget.style.borderColor = '#D0D8EE'
                const pencil = e.currentTarget.querySelector<HTMLElement>('[data-pencil]')
                if (pencil) pencil.style.opacity = '1'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = ''
                e.currentTarget.style.borderColor = 'transparent'
                const pencil = e.currentTarget.querySelector<HTMLElement>('[data-pencil]')
                if (pencil) pencil.style.opacity = '0'
              }}
              onClick={e => {
                e.stopPropagation()
                e.currentTarget.style.backgroundColor = ''
                e.currentTarget.style.borderColor = 'transparent'
                const pencil = e.currentTarget.querySelector<HTMLElement>('[data-pencil]')
                if (pencil) pencil.style.opacity = '0'
                setCellValue(val)
                setEditingCell({ id: record._id, key: 'documentType' })
              }}
            >
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
              <span data-pencil style={{ opacity: 0, transition: 'opacity 0.15s', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <Icon type={iconType.EditRecOutlined} size={12} color="neutral-darken2" />
              </span>
            </div>
          )
        }
      }

      if (key === 'tags') {
        col.render = (_: unknown, record: MetadataDocument) => {
          if (editingCell?.id === record._id && editingCell.key === 'tags') {
            const doSave = () => {
              handleSave({
                ...record,
                tagList: editingTags.map(t => ({ text: t, style: chipStyles.ACCENT_NEUTRAL, variant: chipVariants.SUBTLE })),
                namedEntity: '—',
                namedEntityId: '—',
                jurisdiction: '—',
                lawType: '—',
                citations: '—',
                monetaryAmounts: 0,
                monetaryTypes: 'None',
              })
              setEditingCell(null)
              setEditingTags([])
            }
            return (
              <div
                ref={tagsEditRef}
                onClick={e => e.stopPropagation()}
                onKeyDownCapture={e => {
                  if (e.key === 'Enter' && !(e.target as HTMLInputElement).value) { e.preventDefault(); doSave() }
                  if (e.key === 'Escape') { setEditingCell(null); setEditingTags([]) }
                }}
              >
                <Select
                  name="tags"
                  mode={selectModeVariants.TAGS}
                  open
                  value={editingTags}
                  options={tagOptions}
                  onChange={vals => {
                    const newVals = vals as string[]
                    if (newVals.length < editingTags.length) return
                    setEditingTags(newVals)
                  }}
                  tagRender={props => (
                    <span
                      onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
                      style={{ display: 'inline-flex', marginRight: 2 }}
                    >
                      <Chip
                        label={String(props.label)}
                        chipStyle={chipStyles.ACCENT_NEUTRAL}
                        variant={chipVariants.HIGHLIGHT}
                        closable
                        onClose={() => setEditingTags(prev => prev.filter(t => t !== String(props.value)))}
                      />
                    </span>
                  )}
                />
              </div>
            )
          }
          return (
            <div
              style={{ display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer', minHeight: 22, borderRadius: 3, border: '1px dashed transparent', padding: '2px 6px 2px 4px' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#EBF0FF'
                e.currentTarget.style.borderColor = '#D0D8EE'
                const pencil = e.currentTarget.querySelector<HTMLElement>('[data-pencil]')
                if (pencil) pencil.style.opacity = '1'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = ''
                e.currentTarget.style.borderColor = 'transparent'
                const pencil = e.currentTarget.querySelector<HTMLElement>('[data-pencil]')
                if (pencil) pencil.style.opacity = '0'
              }}
              onClick={e => {
                e.stopPropagation()
                e.currentTarget.style.backgroundColor = ''
                e.currentTarget.style.borderColor = 'transparent'
                const pencil = e.currentTarget.querySelector<HTMLElement>('[data-pencil]')
                if (pencil) pencil.style.opacity = '0'
                setEditingTags(getDocumentTags(record).slice(1).map(t => t.text))
                setEditingCell({ id: record._id, key: 'tags' })
              }}
            >
              <div style={{ flex: 1 }}>
                <TagsCell tags={getDocumentTags(record)} />
              </div>
              <span data-pencil style={{ opacity: 0, transition: 'opacity 0.15s', flexShrink: 0, display: 'flex', alignItems: 'center', paddingTop: 2 }}>
                <Icon type={iconType.EditRecOutlined} size={12} color="neutral-darken2" />
              </span>
            </div>
          )
        }
      }

      return col
    })

    visible.push({
      title: '',
      key: 'actions',
      width: 56,
      onCell: (record: MetadataDocument) => ({
        style: { verticalAlign: 'top', backgroundColor: editingCell?.id === record._id ? '#F5F9FF' : undefined },
      }),
      render: (_: unknown, record: MetadataDocument) => (
        <Dropdown
          items={[
            { key: 'copilot', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />Ask CoPilot</span>, onClick: () => console.log('Ask CoPilot', record.name) },
            { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => console.log('Download', record.name) },
            { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => console.log('Delete', record.name) },
          ]}
          trigger={dropdownTriggers.CLICK}
          placement={dropdownPlacement.BOTTOM_RIGHT}
        >
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
        </Dropdown>
      ),
    })

    return visible
  }, [navigate, editingCell, editingTags, cellValue, tagOptions, handleSave])

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
            placeholder="Dokumente durchsuchen"
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
                  if (relevantMentions > 1) footerParts.push(`${relevantMentions} relevante Treffer`)
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
                        navigate(`/projects/metadata/version-6/${doc._id}`)
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
                  Ergebnisse anzeigen
                </ButtonGhost>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ flexShrink: 0, width: '100%' }}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <FileUploader onUpload={handleUpload} accept={['.pdf', '.docx', '.xlsx', '.txt']} {...({ multiple: true } as any)}>
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
              backgroundColor: isUploading ? '#F0F0F0' : undefined,
              pointerEvents: isUploading ? 'none' : 'auto',
              transition: 'background-color 0.2s ease',
            }}
          >
            <Icon type={iconType.UploadOutlined} color={isUploading ? 'disabled-lighten1' : 'neutral-darken4'} />
            <Typography color={isUploading ? 'disabled-lighten1' : 'neutral-darken5'}>Klicken Sie, um ein Dokument auszuwählen, oder ziehen Sie es hierher.</Typography>
            <Typography size="base-sm" color={isUploading ? 'disabled-lighten1' : 'neutral-darken2'}>PDF-, DOCX-, XLSX- und TXT-Formate, max. Größe 10 MB</Typography>
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
        <Typography size="base" color="neutral-darken2">Alle Dateien werden sicher hochgeladen und auf Viren geprüft.</Typography>
      </div>
    </div>
  )
}
