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
  FileUploader,
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
  TextArea,
  toastPlacements,
  Tooltip,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument, type FileFormat } from '../bulk-edit/documents'

const { colorPalette, spacing, fontWeight } = constants
const PAGE_SIZE = 10

const UPLOAD_FORMATS = new Set<string>(['PDF', 'DOCX', 'XLSX', 'PPTX'])
const UPLOAD_KEY = 'upload-in-progress'
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

const QUICK_ACTIONS = [
  { label: 'Summarize',          instruction: 'Summarize this content into a concise overview' },
  { label: 'Simplify language',  instruction: 'Rewrite in plain, easy-to-understand language' },
  { label: 'Fix grammar',        instruction: 'Fix any grammar, spelling and punctuation issues' },
  { label: 'Translate to English', instruction: 'Translate this content to English' },
]

function getDocumentContent(doc: MetadataDocument): string {
  const snippet = DOCUMENT_SNIPPETS[doc._id]
  const base = snippet ?? `${doc.documentType} – ${doc.namedEntity}`
  return (
    base +
    '\n\nThis document applies to all employees and contractors engaged in cross-border activities. ' +
    'Compliance with these provisions is mandatory and applies in conjunction with applicable local ' +
    'legislation, collective agreements, and internal guidelines.\n\n' +
    'For questions regarding interpretation or application, please contact the HR Legal Department ' +
    'or the Global Mobility team. Violations may result in disciplinary action and/or legal liability.\n\n' +
    `Document Type: ${doc.documentType} · Jurisdiction: ${doc.jurisdiction} · Domain: ${doc.domain} · ` +
    `Last Updated: ${new Date(doc.uploadedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  )
}

function simulateGptEdit(content: string, instruction: string): string {
  const lower = instruction.toLowerCase()

  if (lower.includes('summar')) {
    const sentences = content.split(/(?<=[.!?])\s+/)
    const keep = sentences.slice(0, Math.max(2, Math.ceil(sentences.length / 3)))
    return keep.join(' ') + '\n\n[AI Summary: Content condensed to key points only]'
  }

  if (lower.includes('simpl') || lower.includes('plain') || lower.includes('easy')) {
    return content
      .replace(/gemäß/g, 'according to')
      .replace(/nach Maßgabe des?/g, 'as specified by')
      .replace(/im Rahmen des?/g, 'within the scope of')
      .replace(/Mitarbeiterversetzung/g, 'employee relocation')
      .replace(/Auslandsentsendung/g, 'international assignment')
      .replace(/steuerlich(e|en|er)/g, 'tax-related')
      + '\n\n[AI: Language simplified — technical terms replaced with plain equivalents]'
  }

  if (lower.includes('translat') || lower.includes('english')) {
    return content
      .replace(/\b(die|der|das|den|dem|des|ein|eine|einen)\b/g, 'the')
      .replace(/\bund\b/g, 'and')
      .replace(/\bfür\b/g, 'for')
      .replace(/\bmit\b/g, 'with')
      .replace(/\bvon\b/g, 'of')
      .replace(/\bnach\b/g, 'to')
      .replace(/\bauf\b/g, 'on')
      .replace(/\bbei\b/g, 'at')
      + '\n\n[AI: Auto-translated to English — professional review recommended]'
  }

  if (lower.includes('grammar') || lower.includes('fix') || lower.includes('spelling')) {
    return (
      content.replace(/\. ([a-z])/g, (_: string, c: string) => `. ${c.toUpperCase()}`).replace(/\s{2,}/g, ' ') +
      '\n\n[AI: Grammar and punctuation reviewed — corrections applied]'
    )
  }

  return content + `\n\n[AI applied: "${instruction}" — please review and apply if appropriate]`
}

function getDocumentTags(doc: MetadataDocument): Tag[] {
  const tags: Tag[] = []
  tags.push({ text: doc.domain, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.tagList?.length) {
    tags.push(...doc.tagList.map(t => ({ ...t, variant: chipVariants.HIGHLIGHT })))
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

function TagEditCell({ record, onChange, onRemoveDerived }: {
  record: MetadataDocument
  onChange: (tags: Tag[]) => void
  onRemoveDerived?: (fieldKey: string) => void
}) {
  const [customTags, setCustomTags] = useState<Tag[]>(() => record.tagList ?? [])
  const [inputVal, setInputVal] = useState('')
  const [removedDerived, setRemovedDerived] = useState<Set<string>>(new Set())

  const update = (next: Tag[]) => {
    setCustomTags(next)
    onChange(next)
  }

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
  if (!removedDerived.has('namedEntityId') && record.namedEntityId !== '—') derivedChips.push({ text: record.namedEntityId, style: chipStyles.ACCENT_NEUTRAL, fieldKey: 'namedEntityId' })
  if (!removedDerived.has('jurisdiction') && record.jurisdiction !== '—') derivedChips.push({ text: record.jurisdiction, style: chipStyles.ACCENT_NEUTRAL, fieldKey: 'jurisdiction' })
  if (!removedDerived.has('lawType') && record.lawType !== '—') derivedChips.push({ text: record.lawType, style: chipStyles.ACCENT_NEUTRAL, fieldKey: 'lawType' })
  if (!removedDerived.has('citations') && record.citations !== '—') derivedChips.push({ text: record.citations, style: chipStyles.ACCENT_NEUTRAL, fieldKey: 'citations' })
  if (!removedDerived.has('monetaryAmounts') && record.monetaryAmounts > 0) derivedChips.push({ text: `${record.monetaryAmounts.toLocaleString('de-DE')} ${record.currency}`, style: chipStyles.ACCENT_NEUTRAL, fieldKey: 'monetaryAmounts' })
  if (!removedDerived.has('monetaryTypes') && record.monetaryTypes !== 'None') derivedChips.push({ text: record.monetaryTypes, style: chipStyles.ACCENT_NEUTRAL, fieldKey: 'monetaryTypes' })

  return (
    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Input
        value={inputVal}
        placeholder="Add tag…"
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.stopPropagation(); addTag() }
        }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'flex-start' }}>
        <Chip label={record.domain} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
        {customTags.map((tag, i) => (
          <Chip
            key={i}
            label={tag.text}
            chipStyle={chipStyles.ACCENT_NEUTRAL}
            variant={chipVariants.HIGHLIGHT}
            closable
            onClose={() => update(customTags.filter((_, j) => j !== i))}
          />
        ))}
        {derivedChips.map((chip) => (
          <Chip
            key={chip.fieldKey}
            label={chip.text}
            chipStyle={chip.style as ChipStyleValue}
            variant={chipVariants.SUBTLE}
            closable
            onClose={() => removeDerived(chip.fieldKey)}
          />
        ))}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EditableCell({ editable, isEditing, dataIndex, initialValue, onValueChange, docLabel, children, ...restProps }: any) {
  const [fieldValue, setFieldValue] = useState('')

  useEffect(() => {
    if (isEditing) setFieldValue(String(initialValue ?? ''))
  }, [isEditing, initialValue])

  if (!editable) return <td {...restProps}>{children}</td>

  const isSelectField = dataIndex === 'domain'

  return (
    <td {...restProps}>
      {isEditing ? (
        <div onClick={e => e.stopPropagation()}>
          {isSelectField ? (
            <Select
              name={dataIndex}
              value={fieldValue}
              options={DOMAIN_OPTIONS}
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

function CopilotIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.00078 10.687C6.5133 10.687 5.31067 9.48436 5.31067 7.99687C5.31067 6.50939 6.5133 5.30677 8.00078 5.30677C9.48826 5.30677 10.6909 6.50939 10.6909 7.99687C10.6909 9.48436 9.48826 10.687 8.00078 10.687ZM8.00078 6.09797C6.9564 6.09797 6.10188 6.9525 6.10188 7.99687C6.10188 9.04125 6.9564 9.89578 8.00078 9.89578C9.04516 9.89578 9.89969 9.04125 9.89969 7.99687C9.89969 6.9525 9.04516 6.09797 8.00078 6.09797ZM8.01662 15.181C6.38673 15.181 5.24739 13.9151 5.24739 12.1111C5.19991 11.0035 4.47199 10.7661 3.87067 10.7661C2.92122 10.7661 2.08254 10.4496 1.51287 9.86414C1.03814 9.37359 0.800781 8.72479 0.800781 7.99687C0.83243 5.9872 2.41485 5.24348 3.8865 5.22764C4.55111 5.22764 5.24739 4.8637 5.24739 3.88259C5.23155 2.03116 6.35505 0.796875 8.00078 0.796875C9.64651 0.796875 10.6909 1.99951 10.77 3.86677C10.8175 5.03775 11.6403 5.22764 12.1151 5.22764C13.5076 5.22764 15.1533 5.97136 15.2008 7.99687C15.2008 8.72479 14.9634 9.37359 14.4729 9.86414C13.9032 10.4338 13.0487 10.7661 12.1151 10.7661C11.5296 10.7661 10.8175 11.0035 10.7859 12.1111C10.7067 13.9784 9.63067 15.181 8.01662 15.181ZM6.02275 3.88259C6.02275 4.94282 5.37396 6.00304 3.8865 6.01885C3.20605 6.01885 1.62364 6.22458 1.59199 7.99687C1.59199 8.50326 1.75023 8.96217 2.08254 9.29447C2.49397 9.72173 3.14276 9.95906 3.87067 9.95906C5.15242 9.95906 5.97527 10.7819 6.03859 12.0637C6.03859 13.2188 6.65571 14.374 8.01662 14.374C9.3775 14.374 9.93133 13.5037 9.99461 12.0637C10.0421 10.7661 10.8649 9.95906 12.1151 9.94326C12.843 9.94326 13.4918 9.70589 13.919 9.27863C14.2513 8.93049 14.4254 8.48742 14.4096 7.98103C14.3779 6.16125 12.6373 6.00304 12.1151 6.00304C11.1182 6.00304 10.0421 5.43337 9.97881 3.88259C9.91549 2.44259 9.18761 1.57226 8.00078 1.57226C6.81396 1.57226 6.02275 2.47424 6.02275 3.86677V3.88259Z" fill="currentColor" stroke="currentColor" strokeWidth="0.2"/>
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1" />
      <rect x="9" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2L9.2 5.8H13.2L10 8.1L11.2 11.9L8 9.6L4.8 11.9L6 8.1L2.8 5.8H6.8L8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="13" cy="3" r="1" fill="currentColor" opacity="0.6"/>
      <circle cx="3" cy="13" r="0.8" fill="currentColor" opacity="0.4"/>
    </svg>
  )
}

type AiEditMode = 'entire' | 'section'
type AiEditResult = { original: string; suggested: string }

export default function PreviewTasksV8() {
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
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [securityModalOpen, setSecurityModalOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_COLLAPSED_WIDTH)

  // AI edit state
  const [aiEditDoc, setAiEditDoc] = useState<MetadataDocument | null>(null)
  const [aiEditMode, setAiEditMode] = useState<AiEditMode>('entire')
  const [aiEditInstruction, setAiEditInstruction] = useState('')
  const [aiEditSelectedText, setAiEditSelectedText] = useState('')
  const [aiEditIsGenerating, setAiEditIsGenerating] = useState(false)
  const [aiEditResult, setAiEditResult] = useState<AiEditResult | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const pendingEditsRef = useRef<Record<string, string>>({})
  const pendingTagsRef = useRef<Tag[] | null>(null)
  const pendingRemovedDerivedRef = useRef<Set<string>>(new Set())
  const searchBarWrapperRef = useRef<HTMLDivElement>(null)
  const pendingFilesRef = useRef<File[]>([])
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastAppliedQueryRef = useRef('')
  const { notification } = useNotifications()

  useEffect(() => {
    const sidebar = document.getElementById(LAYOUT_SIDEBAR_ID)
    if (!sidebar) return
    setSidebarWidth(sidebar.getBoundingClientRect().width)
    const observer = new ResizeObserver(entries => {
      setSidebarWidth(entries[0].contentRect.width)
    })
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

  const openAiEdit = useCallback((record: MetadataDocument) => {
    setAiEditDoc(record)
    setAiEditMode('entire')
    setAiEditInstruction('')
    setAiEditSelectedText('')
    setAiEditResult(null)
    setAiEditIsGenerating(false)
  }, [])

  const closeAiEdit = useCallback(() => {
    setAiEditDoc(null)
    setAiEditInstruction('')
    setAiEditSelectedText('')
    setAiEditResult(null)
    setAiEditIsGenerating(false)
  }, [])

  const handleTextSelection = useCallback(() => {
    if (aiEditMode !== 'section') return
    const sel = window.getSelection()?.toString().trim()
    if (sel) {
      setAiEditSelectedText(sel)
      setAiEditResult(null)
    }
  }, [aiEditMode])

  const handleGenerate = useCallback(() => {
    if (!aiEditDoc || !aiEditInstruction.trim()) return
    if (aiEditMode === 'section' && !aiEditSelectedText) return

    const original = aiEditMode === 'section'
      ? aiEditSelectedText
      : getDocumentContent(aiEditDoc)

    setAiEditIsGenerating(true)
    setAiEditResult(null)

    setTimeout(() => {
      const suggested = simulateGptEdit(original, aiEditInstruction)
      setAiEditResult({ original, suggested })
      setAiEditIsGenerating(false)
    }, 1600)
  }, [aiEditDoc, aiEditInstruction, aiEditMode, aiEditSelectedText])

  const handleApplyChanges = useCallback(() => {
    if (!aiEditDoc || !aiEditResult) return
    closeAiEdit()
    notification.success({
      title: 'Changes applied',
      placement: toastPlacements.BOTTOM_LEFT,
      duration: 4,
      content: (
        <Typography size="base" color="neutral-darken5">
          AI edits applied to "{stripYear(aiEditDoc.name)}"
        </Typography>
      ),
    })
  }, [aiEditDoc, aiEditResult, closeAiEdit, notification])

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

      notification.default({
        key: UPLOAD_KEY,
        title: 'Uploading...',
        placement: toastPlacements.BOTTOM_RIGHT,
        duration: 0,
        leadingIcon: false,
        content: toastContent(label),
      })

      setTimeout(() => {
        notification.default({
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
            status: 'Draft' as const,
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
    pendingTagsRef.current = null
    pendingRemovedDerivedRef.current = new Set()
    setEditingKey(record._id)
  }, [])

  const saveEdit = useCallback((record: MetadataDocument) => {
    const updated = { ...record, ...pendingEditsRef.current } as MetadataDocument
    if (pendingTagsRef.current !== null) updated.tagList = pendingTagsRef.current
    for (const fieldKey of pendingRemovedDerivedRef.current) {
      if (fieldKey === 'monetaryAmounts') updated.monetaryAmounts = 0
      else if (fieldKey === 'monetaryTypes') updated.monetaryTypes = 'None'
      else (updated as unknown as Record<string, unknown>)[fieldKey] = '—'
    }
    handleSave(updated)
    setEditingKey(null)
    pendingEditsRef.current = {}
    pendingTagsRef.current = null
    pendingRemovedDerivedRef.current = new Set()
  }, [handleSave])

  const cancelEdit = useCallback(() => {
    setEditingKey(null)
    pendingEditsRef.current = {}
    pendingTagsRef.current = null
    pendingRemovedDerivedRef.current = new Set()
  }, [])

  const handleBulkDelete = useCallback(() => {
    setTempDocs(prev => prev.filter(d => !selectedKeys.has(d._id)))
    setLocalDocs(prev => prev.filter(d => !selectedKeys.has(d._id)))
    setSelectedKeys(new Set())
  }, [selectedKeys])

  const allDocs = useMemo(() => [...tempDocs, ...localDocs], [tempDocs, localDocs])

  const confirmDelete = useCallback(() => {
    const count = selectedKeys.size
    const doc = count === 1 ? allDocs.find(d => selectedKeys.has(d._id)) : undefined
    const name = doc ? `${stripYear(doc.name)}.${doc.fileFormat.toLowerCase()}` : ''
    handleBulkDelete()
    setDeleteModalOpen(false)
    notification.default({
      title: count === 1 ? 'Document deleted' : 'Documents deleted',
      icon: iconType.TrashFilled,
      content: <Typography size="base" color="neutral-darken5">{count === 1 ? name : `${count} documents`}</Typography>,
      placement: toastPlacements.BOTTOM_LEFT,
      duration: 4,
    })
  }, [selectedKeys, allDocs, handleBulkDelete, notification])

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

  const allSelected = filteredDocs.length > 0 && filteredDocs.every(d => selectedKeys.has(d._id))
  const someSelected = filteredDocs.some(d => selectedKeys.has(d._id))

  const columns = useMemo(() => {
    const checkboxCol = {
      title: () => (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={e => {
            setSelectedKeys(prev => {
              const next = new Set(prev)
              filteredDocs.forEach(d => {
                if (e.target.checked) next.add(d._id)
                else next.delete(d._id)
              })
              return next
            })
          }}
        />
      ),
      key: 'checkbox',
      width: 48,
      onCell: (record: MetadataDocument) => ({
        style: { verticalAlign: 'top', backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined },
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
      render: (_: unknown, record: MetadataDocument) => (
        <Checkbox
          checked={selectedKeys.has(record._id)}
          onChange={e => {
            setSelectedKeys(prev => {
              const next = new Set(prev)
              if (e.target.checked) next.add(record._id)
              else next.delete(record._id)
              return next
            })
          }}
          onClick={e => e.stopPropagation()}
        />
      ),
    }

    const visible: object[] = FIXED_COLS.map(({ key, label }) => {
      const isNonEditable = NON_EDITABLE_KEYS.has(key) || key === 'tags'
      const needsEllipsis = key !== 'tags' && key !== 'documentType'
      const col: Record<string, unknown> = {
        title: label,
        key,
        dataIndex: key,
        ellipsis: needsEllipsis,
        sorter: key !== 'tags' ? makeSorter(key) : undefined,
        onCell: (record: MetadataDocument) => ({
          onClick: (editingKey === record._id || record._id.startsWith('temp-')) ? undefined : () => navigate(`/my-documents/preview-tasks/version-8/${record._id}`),
          style: { cursor: (editingKey === record._id || record._id.startsWith('temp-')) ? 'default' : 'pointer', verticalAlign: 'top', backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined },
          ...(isNonEditable ? {} : {
            editable: true,
            isEditing: editingKey === record._id,
            dataIndex: key,
            initialValue: record[key as keyof MetadataDocument],
            onValueChange: handleCellChange,
          }),
        }),
      }

      if (key === 'uploadedDate') {
        col.width = 110
        col.render = (val: string) => formatDate(val)
      }
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
          onClick: (editingKey === record._id || record._id.startsWith('temp-')) ? undefined : () => navigate(`/my-documents/preview-tasks/version-8/${record._id}`),
          style: { cursor: (editingKey === record._id || record._id.startsWith('temp-')) ? 'default' : 'pointer', verticalAlign: 'top', maxWidth: 0, backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined },
        })
      }

      if (key === 'documentType') {
        col.width = 160
        col.onCell = (record: MetadataDocument) => ({
          onClick: (editingKey === record._id || record._id.startsWith('temp-')) ? undefined : () => navigate(`/my-documents/preview-tasks/version-8/${record._id}`),
          style: { cursor: (editingKey === record._id || record._id.startsWith('temp-')) ? 'default' : 'pointer', verticalAlign: 'top', backgroundColor: editingKey === record._id ? '#F5F9FF' : selectedKeys.has(record._id) ? '#EEF4FF' : undefined },
          editable: true,
          isEditing: editingKey === record._id,
          dataIndex: key,
          initialValue: record[key as keyof MetadataDocument],
          onValueChange: handleCellChange,
        })
      }

      if (key === 'tags') {
        col.render = (_: unknown, record: MetadataDocument) => {
          if (editingKey === record._id) {
            return (
              <TagEditCell
                record={record}
                onChange={tags => { pendingTagsRef.current = tags }}
                onRemoveDerived={fieldKey => { pendingRemovedDerivedRef.current.add(fieldKey) }}
              />
            )
          }
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
              { key: 'copilot', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />Ask CoPilot</span>, onClick: () => console.log('Ask CoPilot', record.name) },
              { key: 'ai-edit', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><SparkleIcon />Edit content with AI</span>, onClick: () => openAiEdit(record) },
              { key: 'edit', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.EditRecOutlined} size={16} />Edit document info</span>, onClick: () => startEdit(record) },
              { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => console.log('Download', record.name) },
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
  }, [navigate, editingKey, selectedKeys, handleCellChange, startEdit, saveEdit, cancelEdit, filteredDocs, allSelected, someSelected, openAiEdit])

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

  const canGenerate = !!aiEditInstruction.trim() && (aiEditMode === 'entire' || !!aiEditSelectedText) && !aiEditIsGenerating

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: colorPalette.white, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <Typography size="heading-lg" weight="bold">Meine Dokumente</Typography>

        <div
          ref={searchBarWrapperRef}
          style={{ position: 'relative', width: 300 }}
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
                        navigate(`/my-documents/preview-tasks/version-8/${doc._id}`)
                        setShowDropdown(false)
                      }}
                    >
                      <Typography size="base" color="neutral-darken5">
                        {highlightAll(stripYear(doc.name), q)}
                      </Typography>
                      <div style={{ marginTop: 4 }}>
                        <Typography size="base-sm" color="neutral-darken5" maxLines={2}>
                          {excerpt}
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ components: { body: { cell: EditableCell } } } as any)}
              onRow={(record: MetadataDocument) => ({
                style: {
                  height: 72,
                  ...(editingKey === record._id ? { backgroundColor: '#F5F9FF' } : selectedKeys.has(record._id) ? { backgroundColor: '#EEF4FF' } : {}),
                },
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
      </div>

      {selectedKeys.size > 0 && (
        <div style={{
          position: 'fixed',
          bottom: spacing(2),
          left: sidebarWidth + spacing(2),
          right: spacing(2),
          height: 56,
          backgroundColor: colorPalette.neutral.lighten1,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${spacing(6)}px`,
          zIndex: 500,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setSelectedKeys(new Set())} />
              <Typography color="neutral-darken5">{selectedKeys.size} selected</Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), marginLeft: spacing(4) }}>
              <ButtonTertiary onClick={() => console.log('Ask CoPilot')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CopilotIcon />
                  Ask CoPilot
                </span>
              </ButtonTertiary>
              {selectedKeys.size > 1 && (
                <ButtonTertiary onClick={() => console.log('Compare')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <CompareIcon />
                    Compare
                  </span>
                </ButtonTertiary>
              )}
              <ButtonTertiary leftIcon={iconType.DownloadOutlined} onClick={() => console.log('Download')}>Download</ButtonTertiary>
            </div>
          </div>
          <ButtonDanger leftIcon={iconType.TrashOutlined} onClick={() => setDeleteModalOpen(true)}>Delete</ButtonDanger>
        </div>
      )}

      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2), paddingTop: spacing(2), paddingBottom: spacing(2) }}>
        <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
        <Typography size="base" color="neutral-darken2">All files are securely uploaded and scanned for viruses. <span style={{ color: colorPalette.blue.base, cursor: 'pointer' }} onClick={() => setSecurityModalOpen(true)}>Learn more</span></Typography>
      </div>

      {/* Delete modal */}
      <Modal
        visible={deleteModalOpen}
        variant={modalVariants.DANGER}
        title={selectedKeys.size === 1 ? 'Delete Document' : 'Delete Documents'}
        onClose={() => setDeleteModalOpen(false)}
        footer={{
          buttons: [
            {
              variant: buttonVariants.GHOST,
              props: { children: 'Cancel', onClick: () => setDeleteModalOpen(false) },
            },
            {
              variant: buttonVariants.DANGER,
              props: { children: 'Delete', onClick: confirmDelete },
            },
          ],
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          <Typography size="base" color="neutral-darken5">
            You are about to{' '}
            <span style={{ color: colorPalette.danger.darken2, fontWeight: 700 }}>DELETE</span>{' '}
            {selectedKeys.size === 1
              ? `"${stripYear(allDocs.find(d => selectedKeys.has(d._id))?.name ?? '')}"`
              : `${selectedKeys.size} documents`
            }
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <Icon type={iconType.InfoCircleOutlined} size={16} color="neutral-darken2" />
            <Typography size="base-sm" color="neutral-darken2">{selectedKeys.size === 1 ? 'This document' : 'These documents'} will no longer be available</Typography>
          </div>
        </div>
      </Modal>

      {/* Security modal */}
      <Modal
        visible={securityModalOpen}
        title="Your data is private and secure"
        onClose={() => setSecurityModalOpen(false)}
        footer={{
          buttons: [
            {
              variant: buttonVariants.PRIMARY,
              props: { children: 'Close', onClick: () => setSecurityModalOpen(false) },
            },
          ],
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
          <Typography size="base" color="neutral-darken5">The highest data protection standards are essential for the professional use of our solution. The following information provides an overview of our security architecture.</Typography>
          {[
            { icon: iconType.ShieldCheckOutlined, title: 'Secure data storage in Germany', body: 'All data is stored securely on European servers. Our data centre is certified to ISO 27001, 27017, 27018, SOC 2 and CS, making it one of the most secure data centres in the world.' },
            { icon: iconType.LockOutlined, title: 'Data encryption', body: 'All data is stored in encrypted form in the data centre (AES 256) and transmitted to the data centre in encrypted form (TLS 1.3).' },
            { icon: iconType.LayersHorOutlined, title: 'Backups', body: 'Regular backups and a disaster recovery strategy protect against data loss.' },
            { icon: iconType.MinusCircleOutlined, title: 'No training with your data', body: 'The uploaded files are not used to train language models.' },
          ].map(({ icon, title, body }) => (
            <div key={title} style={{ display: 'flex', gap: spacing(3), alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <Icon type={icon} color="neutral-darken5" size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
                <Typography size="base" color="neutral-darken5" weight={fontWeight.BOLD}>{title}</Typography>
                <Typography size="base" color="neutral-darken5">{body}</Typography>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* AI Edit modal */}
      <Modal
        visible={!!aiEditDoc}
        title="Edit content with AI"
        maxWidth={880}
        onClose={closeAiEdit}
      >
        {aiEditDoc && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>

            {/* Document name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              <Icon type={iconType.EditRecOutlined} size={12} color="neutral-darken3" />
              <Typography size="base-sm" color="neutral-darken3">{stripYear(aiEditDoc.name)}</Typography>
            </div>

            {/* Two-column layout: document | AI panel */}
            <div style={{ display: 'flex', gap: spacing(5), alignItems: 'flex-start' }}>

              {/* Left: document content */}
              <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography size="base" weight={fontWeight.BOLD} color="neutral-darken5">Document content</Typography>
                  {aiEditMode === 'section' && (
                    <Typography size="base-sm" color="primary-base">
                      Select text to define a section
                    </Typography>
                  )}
                </div>

                <div
                  ref={contentRef}
                  onMouseUp={handleTextSelection}
                  style={{
                    border: `1.5px solid ${aiEditMode === 'section' ? colorPalette.blue.base : '#e5e7eb'}`,
                    borderRadius: 6,
                    padding: spacing(3),
                    maxHeight: 260,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    userSelect: aiEditMode === 'section' ? 'text' : 'none',
                    cursor: aiEditMode === 'section' ? 'text' : 'default',
                    fontSize: 13,
                    lineHeight: '1.65',
                    color: colorPalette.neutral.darken5,
                    backgroundColor: aiEditMode === 'section' ? '#FAFBFF' : colorPalette.white,
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  }}
                >
                  {getDocumentContent(aiEditDoc)}
                </div>

                {aiEditMode === 'section' && aiEditSelectedText && (
                  <div style={{
                    border: '1.5px solid #3B82F6',
                    borderRadius: 6,
                    padding: spacing(3),
                    backgroundColor: '#EFF6FF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing(2),
                  }}>
                    <Typography size="base-sm" weight={fontWeight.BOLD} color="neutral-darken5">Selected section</Typography>
                    <Typography size="base-sm" color="neutral-darken5" maxLines={3}>
                      "{aiEditSelectedText}"
                    </Typography>
                    <div>
                      <ButtonGhost
                        size="small"
                        leftIcon={iconType.CrossOutlined}
                        onClick={() => { setAiEditSelectedText(''); setAiEditResult(null) }}
                      >
                        Clear selection
                      </ButtonGhost>
                    </div>
                  </div>
                )}

                {aiEditMode === 'section' && !aiEditSelectedText && (
                  <div style={{
                    border: '1px dashed #d0d0d0',
                    borderRadius: 6,
                    padding: spacing(3),
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: spacing(2),
                  }}>
                    <Icon type={iconType.InfoCircleOutlined} size={16} color="neutral-darken2" />
                    <Typography size="base-sm" color="neutral-darken2">
                      Highlight a portion of the text above to edit only that section with AI.
                    </Typography>
                  </div>
                )}
              </div>

              {/* Vertical divider */}
              <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: '#e5e7eb', flexShrink: 0 }} />

              {/* Right: AI panel */}
              <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(4) }}>

                {/* Scope toggle */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
                  <Typography size="base" weight={fontWeight.BOLD} color="neutral-darken5">Scope</Typography>
                  <div style={{ display: 'flex', gap: spacing(2) }}>
                    {(['entire', 'section'] as AiEditMode[]).map(mode => (
                      <div
                        key={mode}
                        onClick={() => {
                          setAiEditMode(mode)
                          setAiEditSelectedText('')
                          setAiEditResult(null)
                        }}
                        style={{
                          flex: 1,
                          padding: `${spacing(2)}px ${spacing(3)}px`,
                          border: `1.5px solid ${aiEditMode === mode ? colorPalette.blue.base : '#e5e7eb'}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          backgroundColor: aiEditMode === mode ? '#EFF6FF' : colorPalette.white,
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Typography
                          size="base-sm"
                          color={aiEditMode === mode ? 'primary-base' : 'neutral-darken3'}
                          weight={aiEditMode === mode ? fontWeight.BOLD : fontWeight.REGULAR}
                        >
                          {mode === 'entire' ? 'Entire document' : 'Selected section'}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
                  <Typography size="base" weight={fontWeight.BOLD} color="neutral-darken5">Quick actions</Typography>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(1) }}>
                    {QUICK_ACTIONS.map(action => {
                      const active = aiEditInstruction === action.instruction
                      return (
                        <div
                          key={action.label}
                          onClick={() => {
                            setAiEditInstruction(action.instruction)
                            setAiEditResult(null)
                          }}
                          style={{
                            padding: `${spacing(1)}px ${spacing(2)}px`,
                            border: `1.5px solid ${active ? colorPalette.blue.base : '#e5e7eb'}`,
                            borderRadius: 16,
                            cursor: 'pointer',
                            backgroundColor: active ? '#EFF6FF' : colorPalette.white,
                            fontSize: 12,
                            lineHeight: '20px',
                            color: active ? colorPalette.blue.base : colorPalette.neutral.darken3,
                            fontWeight: active ? 600 : 400,
                            transition: 'all 0.15s ease',
                            userSelect: 'none',
                          }}
                        >
                          {action.label}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Instruction input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
                  <Typography size="base" weight={fontWeight.BOLD} color="neutral-darken5">Instructions</Typography>
                  <TextArea
                    name="ai-instruction"
                    value={aiEditInstruction}
                    onChange={e => { setAiEditInstruction(e.target.value); setAiEditResult(null) }}
                    placeholder="Describe what you'd like to change or improve…"
                    rows={3}
                  />
                </div>

                {/* Generate button */}
                <ButtonPrimary
                  disabled={!canGenerate}
                  onClick={handleGenerate}
                >
                  {aiEditIsGenerating ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Spinner size="small" />
                      Generating…
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <SparkleIcon />
                      Generate with AI
                    </span>
                  )}
                </ButtonPrimary>

              </div>
            </div>

            {/* Diff result */}
            {aiEditResult && (
              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: spacing(4),
                display: 'flex',
                flexDirection: 'column',
                gap: spacing(3),
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                  <CopilotIcon />
                  <Typography size="base" weight={fontWeight.BOLD} color="neutral-darken5">Suggested changes</Typography>
                  {aiEditMode === 'section' && (
                    <Typography size="base-sm" color="neutral-darken2">— selected section only</Typography>
                  )}
                </div>

                <div style={{ display: 'flex', gap: spacing(3) }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#FCA5A5' }} />
                      <Typography size="base-sm" weight={fontWeight.BOLD} color="neutral-darken3">Before</Typography>
                    </div>
                    <div style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 6,
                      padding: spacing(3),
                      maxHeight: 180,
                      overflowY: 'auto',
                      fontSize: 13,
                      lineHeight: '1.65',
                      color: colorPalette.neutral.darken5,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {aiEditResult.original}
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#86EFAC' }} />
                      <Typography size="base-sm" weight={fontWeight.BOLD} color="neutral-darken3">After</Typography>
                    </div>
                    <div style={{
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: 6,
                      padding: spacing(3),
                      maxHeight: 180,
                      overflowY: 'auto',
                      fontSize: 13,
                      lineHeight: '1.65',
                      color: colorPalette.neutral.darken5,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {aiEditResult.suggested}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: spacing(2), justifyContent: 'flex-end' }}>
                  <ButtonTertiary
                    leftIcon={iconType.CrossOutlined}
                    onClick={() => setAiEditResult(null)}
                  >
                    Discard
                  </ButtonTertiary>
                  <ButtonPrimary
                    leftIcon={iconType.EditRecOutlined}
                    onClick={handleApplyChanges}
                  >
                    Apply changes
                  </ButtonPrimary>
                </div>
              </div>
            )}

          </div>
        )}
      </Modal>

    </div>
  )
}
