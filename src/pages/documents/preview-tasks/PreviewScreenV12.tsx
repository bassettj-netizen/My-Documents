import React, { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { theme as antTheme } from 'antd'
import {
  ButtonGhost,
  ButtonPrimary,
  ButtonSecondary,
  ButtonTertiary,
  buttonShapes,
  buttonSizes,
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
  Select,
  Skeleton,
  skeletonVariants,
  Spinner,
  TextArea,
  Toolbar,
  Typography,
  useNotifications,
  toastPlacements,
} from '@goat-ui/goat-ui-core'
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument } from '../bulk-edit/documents'
import { addCopiedDoc, customHtmlMap, extraDocs } from './docStore'

const { colorPalette, spacing } = constants
const TOP_BAR_BG = '#1e1f2e'
const SUMMARY_MAX = 500
const POPUP_W = 400

const DOCUMENT_TYPE_OPTIONS = [
  'Compliance Guide', 'Combined Policy', 'Expense Policy', 'HR Guide', 'HR Policy',
  'Legal Definition Guide', 'Payroll Tax Guidance', 'Salary Policy', 'Tax Compliance Guide',
  'Tax Guidance', 'Tax Regulation Guide', 'Tax Rule Explanation', 'Tax Treaty Guide',
].map(t => ({ label: t, value: t }))

const QUICK_ACTIONS = [
  { label: 'Summarize',           instruction: 'Summarize this content into a concise overview' },
  { label: 'Simplify language',   instruction: 'Rewrite in plain, easy-to-understand language' },
  { label: 'Fix grammar',         instruction: 'Fix any grammar, spelling and punctuation issues' },
  { label: 'Translate to English', instruction: 'Translate this content to English' },
]

type Tag = { text: string; style: string; variant?: string }
type TaskId = 'extract' | 'compliance' | 'related' | 'actions'
type TaskStatus = 'idle' | 'running' | 'done'
type AiPopupPhase = 'idle' | 'instructions' | 'generating' | 'result' | 'summary' | 'crossref'
type AiPopupSource = 'selection' | 'document'
interface AiEditResult { original: string; originalHtml: string; suggested: string; suggestedHtml: string }
interface TaskState { status: TaskStatus; result: ReactNode | null }
interface SelectionPos { text: string; x: number; y: number; bottom: number }
type MarkupType = 'h1' | 'h2' | 'p' | 'pb'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toRoman(n: number): string {
  const vals = [10, 9, 5, 4, 1]; const syms = ['X', 'IX', 'V', 'IV', 'I']
  let result = ''
  for (let i = 0; i < vals.length; i++) { while (n >= vals[i]) { result += syms[i]; n -= vals[i] } }
  return result
}

function simulateGptEdit(content: string, instruction: string): string {
  const lower = instruction.toLowerCase()
  if (lower.includes('summar')) {
    const sentences = content.split(/(?<=[.!?])\s+/)
    return sentences.slice(0, Math.max(2, Math.ceil(sentences.length / 3))).join(' ')
  }
  if (lower.includes('simpl') || lower.includes('plain') || lower.includes('easy')) {
    return content
      .replace(/gemäß/g, 'according to')
      .replace(/nach Maßgabe des?/g, 'as specified by')
      .replace(/im Rahmen des?/g, 'within the scope of')
      .replace(/Mitarbeiterversetzung/g, 'employee relocation')
      .replace(/Auslandsentsendung/g, 'international assignment')
      .replace(/steuerlich(e|en|er)/g, 'tax-related')
  }
  if (lower.includes('translat') || lower.includes('english')) {
    return content
      .replace(/\b(die|der|das|den|dem|des|ein|eine|einen)\b/g, 'the')
      .replace(/\bund\b/g, 'and').replace(/\bfür\b/g, 'for').replace(/\bmit\b/g, 'with')
      .replace(/\bvon\b/g, 'of').replace(/\bnach\b/g, 'to').replace(/\bauf\b/g, 'on').replace(/\bbei\b/g, 'at')
  }
  if (lower.includes('grammar') || lower.includes('fix') || lower.includes('spelling')) {
    return content.replace(/\. ([a-z])/g, (_: string, c: string) => `. ${c.toUpperCase()}`).replace(/\s{2,}/g, ' ')
  }
  return content
}

function applyTransformToHtml(html: string, transform: (text: string) => string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      node.textContent = transform(node.textContent)
    } else {
      node.childNodes.forEach(walk)
    }
  }
  walk(div)
  return div.innerHTML
}

function simulateGptEditHtml(html: string, instruction: string): string {
  const lower = instruction.toLowerCase()
  if (lower.includes('summar')) return ''  // content reduction — fall back to plain text
  if (lower.includes('simpl') || lower.includes('plain') || lower.includes('easy')) {
    return applyTransformToHtml(html, t => t
      .replace(/gemäß/g, 'according to')
      .replace(/nach Maßgabe des?/g, 'as specified by')
      .replace(/im Rahmen des?/g, 'within the scope of')
      .replace(/Mitarbeiterversetzung/g, 'employee relocation')
      .replace(/Auslandsentsendung/g, 'international assignment')
      .replace(/steuerlich(e|en|er)/g, 'tax-related')
    )
  }
  if (lower.includes('translat') || lower.includes('english')) {
    return applyTransformToHtml(html, t => t
      .replace(/\b(die|der|das|den|dem|des|ein|eine|einen)\b/g, 'the')
      .replace(/\bund\b/g, 'and').replace(/\bfür\b/g, 'for').replace(/\bmit\b/g, 'with')
      .replace(/\bvon\b/g, 'of').replace(/\bnach\b/g, 'to').replace(/\bauf\b/g, 'on').replace(/\bbei\b/g, 'at')
    )
  }
  if (lower.includes('grammar') || lower.includes('fix') || lower.includes('spelling')) {
    return applyTransformToHtml(html, t =>
      t.replace(/\. ([a-z])/g, (_: string, c: string) => `. ${c.toUpperCase()}`).replace(/\s{2,}/g, ' ')
    )
  }
  return ''  // custom instructions — fall back to plain text
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CopilotIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.00078 10.687C6.5133 10.687 5.31067 9.48436 5.31067 7.99687C5.31067 6.50939 6.5133 5.30677 8.00078 5.30677C9.48826 5.30677 10.6909 6.50939 10.6909 7.99687C10.6909 9.48436 9.48826 10.687 8.00078 10.687ZM8.00078 6.09797C6.9564 6.09797 6.10188 6.9525 6.10188 7.99687C6.10188 9.04125 6.9564 9.89578 8.00078 9.89578C9.04516 9.89578 9.89969 9.04125 9.89969 7.99687C9.89969 6.9525 9.04516 6.09797 8.00078 6.09797ZM8.01662 15.181C6.38673 15.181 5.24739 13.9151 5.24739 12.1111C5.19991 11.0035 4.47199 10.7661 3.87067 10.7661C2.92122 10.7661 2.08254 10.4496 1.51287 9.86414C1.03814 9.37359 0.800781 8.72479 0.800781 7.99687C0.83243 5.9872 2.41485 5.24348 3.8865 5.22764C4.55111 5.22764 5.24739 4.8637 5.24739 3.88259C5.23155 2.03116 6.35505 0.796875 8.00078 0.796875C9.64651 0.796875 10.6909 1.99951 10.77 3.86677C10.8175 5.03775 11.6403 5.22764 12.1151 5.22764C13.5076 5.22764 15.1533 5.97136 15.2008 7.99687C15.2008 8.72479 14.9634 9.37359 14.4729 9.86414C13.9032 10.4338 13.0487 10.7661 12.1151 10.7661C11.5296 10.7661 10.8175 11.0035 10.7859 12.1111C10.7067 13.9784 9.63067 15.181 8.01662 15.181ZM6.02275 3.88259C6.02275 4.94282 5.37396 6.00304 3.8865 6.01885C3.20605 6.01885 1.62364 6.22458 1.59199 7.99687C1.59199 8.50326 1.75023 8.96217 2.08254 9.29447C2.49397 9.72173 3.14276 9.95906 3.87067 9.95906C5.15242 9.95906 5.97527 10.7819 6.03859 12.0637C6.03859 13.2188 6.65571 14.374 8.01662 14.374C9.3775 14.374 9.93133 13.5037 9.99461 12.0637C10.0421 10.7661 10.8649 9.95906 12.1151 9.94326C12.843 9.94326 13.4918 9.70589 13.919 9.27863C14.2513 8.93049 14.4254 8.48742 14.4096 7.98103C14.3779 6.16125 12.6373 6.00304 12.1151 6.00304C11.1182 6.00304 10.0421 5.43337 9.97881 3.88259C9.91549 2.44259 9.18761 1.57226 8.00078 1.57226C6.81396 1.57226 6.02275 2.47424 6.02275 3.86677V3.88259Z" fill="currentColor" stroke="currentColor" strokeWidth="0.2"/>
    </svg>
  )
}

function SparkleIcon({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2L9.2 5.8H13.2L10 8.1L11.2 11.9L8 9.6L4.8 11.9L6 8.1L2.8 5.8H6.8L8 2Z" fill={color} />
      <circle cx="13" cy="3" r="0.9" fill={color} opacity="0.6"/>
      <circle cx="3" cy="13" r="0.75" fill={color} opacity="0.4"/>
    </svg>
  )
}

// ─── DataRow ──────────────────────────────────────────────────────────────────

function DataRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div style={{ padding: '6px 0', display: 'flex', alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, width: '130px' }}>
        <Typography size="base" color="neutral-darken2">{label}</Typography>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {typeof value === 'string'
          ? <Typography size="base" color="neutral-darken5">{value}</Typography>
          : value}
      </div>
    </div>
  )
}

// ─── Task definitions ─────────────────────────────────────────────────────────

const TASK_DEFS: Array<{ id: TaskId; label: string; description: string; icon: string; iconRotation?: string }> = [
  { id: 'extract',    label: 'Extract Key Data',         description: 'Extract entities, dates, amounts and legal citations.',            icon: iconType.LogoutOutlined,     iconRotation: '-90deg' },
  { id: 'compliance', label: 'Check Compliance',          description: 'Verify regulatory compliance status and identify gaps.',            icon: iconType.TaskOutlined },
  { id: 'related',    label: 'Find Related Documents',    description: 'Identify similar documents across your library.',                  icon: iconType.SearchOutlined },
  { id: 'actions',    label: 'Generate Action Items',     description: 'Create a prioritised list of required actions from this document.', icon: iconType.ListOrderedOutlined },
]

function getMockResult(taskId: TaskId, doc: MetadataDocument): ReactNode {
  const gap8 = { display: 'flex', flexDirection: 'column' as const, gap: 8 }
  switch (taskId) {
    case 'extract': {
      const rows: [string, string][] = [
        ['Entity', doc.namedEntity], ['Entity ID', doc.namedEntityId !== '—' ? doc.namedEntityId : '—'],
        ['Type', doc.documentType], ['Jurisdiction', doc.jurisdiction !== '—' ? doc.jurisdiction : '—'],
        ['Citations', doc.citations !== '—' ? doc.citations : '—'], ['Law type', doc.lawType !== '—' ? doc.lawType : '—'],
        ...(doc.monetaryAmounts > 0 ? [['Amount', `${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}`] as [string, string]] : []),
        ['Year', String(doc.year)], ['Uploaded', formatDate(doc.uploadedDate)],
      ]
      return (
        <div style={gap8}>
          {rows.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 88, flexShrink: 0 }}><Typography size="base" color="neutral-darken2">{label}</Typography></div>
              <Typography size="base" color="neutral-darken5">{value}</Typography>
            </div>
          ))}
        </div>
      )
    }
    case 'compliance': {
      const isOk = doc.status === 'Approved'; const isWarn = doc.status === 'Draft'
      const color = isOk ? '#16a34a' : isWarn ? '#ea580c' : '#dc2626'
      const message = isOk ? 'Document is approved and current. No compliance issues identified.'
        : isWarn ? 'Document is in draft status and requires review and approval before operational use.'
        : 'This document has been superseded. A newer version may be available — do not rely on this version.'
      return (
        <div style={gap8}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
            <Typography size="base" weight="semibold" color="neutral-darken5">{doc.status}</Typography>
          </div>
          <Typography size="base" color="neutral-darken5">{message}</Typography>
          {doc.citations !== '—' && <Typography size="base" color="neutral-darken2">Applicable regulation: {doc.citations}</Typography>}
        </div>
      )
    }
    case 'related': {
      const related = documents.filter(d => d._id !== doc._id && d.domain === doc.domain).slice(0, 3)
      return (
        <div style={gap8}>
          {related.length === 0 && <Typography size="base" color="neutral-darken2">No closely related documents found.</Typography>}
          {related.map(r => (
            <div key={r._id} onClick={() => window.open(`/my-documents/preview-tasks/version-12/${r._id}`, '_blank', 'noopener,noreferrer')} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <Typography size="base" color="primary-base">{r.name}</Typography>
              <Icon type={iconType.ExternalLinkOutlined} size={12} color="primary-base" />
            </div>
          ))}
        </div>
      )
    }
    case 'actions': {
      const actionMap: Partial<Record<string, string[]>> = {
        'HR Policy': ['Review policy with HR team and obtain sign-off from HR Director.', 'Distribute to all affected employees and collect acknowledgment forms.', `Update employee records to reflect compliance with ${doc.citations}.`, `Schedule annual review for ${doc.year + 1}.`],
        'Tax Guidance': ['Share guidance with payroll team to ensure correct tax withholding.', `Review affected assignments against thresholds defined in ${doc.citations}.`, 'File required notifications with the relevant tax authority by year-end.', `Consult advisor for cases approaching the ${doc.monetaryAmounts > 0 ? `${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}` : 'applicable'} threshold.`],
        'Compliance Guide': ['Conduct an internal audit against the compliance requirements listed.', 'Identify employees at risk of creating a permanent establishment.', 'Update A1 certificate tracking for all EU cross-border assignments.', 'Report findings to compliance officer by end of quarter.'],
      }
      const actions = actionMap[doc.documentType] ?? [`Review ${doc.name} with the relevant stakeholders.`, `Ensure all requirements under ${doc.citations !== '—' ? doc.citations : 'applicable law'} are met.`, `File documentation with appropriate authorities in ${doc.jurisdiction !== '—' ? doc.jurisdiction : 'applicable jurisdiction'}.`, `Schedule follow-up review for Q2 ${doc.year}.`]
      return (
        <div style={gap8}>
          {actions.map((action, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Typography size="base" color="neutral-darken5">{i + 1}.</Typography>
              <Typography size="base" color="neutral-darken5">{action}</Typography>
            </div>
          ))}
        </div>
      )
    }
    default: return <Typography>No result available.</Typography>
  }
}

// ─── Markup helpers ───────────────────────────────────────────────────────────

function applyFontSizePx(px: string) {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return
  const range = sel.getRangeAt(0)
  const span = document.createElement('span')
  span.style.fontSize = px
  span.appendChild(range.extractContents())
  range.insertNode(span)
  const newRange = document.createRange()
  newRange.selectNodeContents(span)
  sel.removeAllRanges()
  sel.addRange(newRange)
}

function getFirstTextNode(el: Node): Text | null {
  if (el.nodeType === Node.TEXT_NODE && (el.textContent ?? '').trim().length > 0) return el as Text
  for (let i = 0; i < el.childNodes.length; i++) {
    const found = getFirstTextNode(el.childNodes[i])
    if (found) return found
  }
  return null
}

const MARKUP_BUTTONS: Array<{ type: MarkupType; label: string }> = [
  { type: 'h1', label: 'Heading' }, { type: 'h2', label: 'Sub-heading' },
  { type: 'p', label: 'Paragraph' }, { type: 'pb', label: 'Bold' },
]

function MarkupButtons({ onApply }: { onApply: (type: MarkupType) => void }) {
  return (
    <>
      {MARKUP_BUTTONS.map(({ type, label }) => (
        <ButtonGhost key={type} onMouseDown={e => { e.preventDefault(); onApply(type) }}>{label}</ButtonGhost>
      ))}
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PreviewTasksPreviewScreenV12() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notification } = useNotifications()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [localDoc, setLocalDoc] = useState<MetadataDocument | null>(null)
  const [localSummary, setLocalSummary] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingName, setEditingName] = useState('')
  const [editingDomain, setEditingDomain] = useState('')
  const [editingDocumentType, setEditingDocumentType] = useState('')
  const [editingCustomTags, setEditingCustomTags] = useState<Tag[]>([])
  const [editingRemovedFields, setEditingRemovedFields] = useState<Set<string>>(new Set())
  const [editingSummary, setEditingSummary] = useState('')
  const [tagInputVal, setTagInputVal] = useState('')
  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>({})
  const [docHtml, setDocHtml] = useState<string | null>(() => (id ? customHtmlMap.get(id) ?? null : null))
  const [isDocEditing, setIsDocEditing] = useState(false)
  const [hasDocChanges, setHasDocChanges] = useState(false)
  const [docToolbarStyle, setDocToolbarStyle] = useState<{ left: number; width: number } | null>(null)
  const [hasAiChanges, setHasAiChanges] = useState(false)
  const [isApplyingChanges, setIsApplyingChanges] = useState(false)

  // AI popup state
  const [aiPopupOpen, setAiPopupOpen] = useState(false)
  const [aiPopupPhase, setAiPopupPhase] = useState<AiPopupPhase>('idle')
  const [aiPopupSource, setAiPopupSource] = useState<AiPopupSource>('selection')
  const [aiPopupSelectedText, setAiPopupSelectedText] = useState('')
  const [aiPopupInstruction, setAiPopupInstruction] = useState('')
  const [aiPopupPos, setAiPopupPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [aiPopupResult, setAiPopupResult] = useState<AiEditResult | null>(null)
  const [aiPopupSelectedHtml, setAiPopupSelectedHtml] = useState('')

  const { token } = antTheme.useToken()

  const docBodyRef = useRef<HTMLDivElement>(null)
  const docContentRef = useRef<HTMLDivElement>(null)
  const editToolbarRef = useRef<HTMLDivElement>(null)
  const isDocEditingRef = useRef(false)
  const aiPopupOpenRef = useRef(false)
  const aiPopupPhaseRef = useRef<AiPopupPhase>('idle')
  const preAiDocHtmlRef = useRef<string | null>(null)
  const aiPopupRef = useRef<HTMLDivElement>(null)
  const docHtmlInitialized = useRef(id ? customHtmlMap.has(id) : false)
  const savedDocHtmlRef = useRef<string>(id ? customHtmlMap.get(id) ?? '' : '')
  const savedSelRangeRef = useRef<Range | null>(null)

  const allDocs = [...extraDocs, ...documents]
  const foundDoc = allDocs.find(d => d._id === id)

  useEffect(() => {
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(t)
  }, [id])

  useEffect(() => {
    setLocalDoc(null); setLocalSummary(null); setIsEditing(false); setIsSaving(false)
    setEditingName(''); setEditingDomain(''); setEditingCustomTags([])
    setEditingRemovedFields(new Set()); setEditingSummary(''); setTagInputVal('')
    setTaskStates({})
    const stored = id ? customHtmlMap.get(id) ?? null : null
    setDocHtml(stored); setIsDocEditing(false); setHasDocChanges(false)
    docHtmlInitialized.current = stored !== null
    savedDocHtmlRef.current = stored ?? ''
    setDocToolbarStyle(null)
    setAiPopupOpen(false)
    setHasAiChanges(false)
    setIsApplyingChanges(false)
    preAiDocHtmlRef.current = null
  }, [id])

  useLayoutEffect(() => {
    if (!isLoading && docContentRef.current && !docHtmlInitialized.current) {
      setDocHtml(docContentRef.current.innerHTML)
      docHtmlInitialized.current = true
    }
  }, [isLoading])

  useEffect(() => {
    if (!isDocEditing || !docContentRef.current) return
    const el = docContentRef.current
    el.focus({ preventScroll: true })
    if (savedSelRangeRef.current) {
      const sel = window.getSelection()
      if (sel) { sel.removeAllRanges(); sel.addRange(savedSelRangeRef.current) }
      savedSelRangeRef.current = null
      return
    }
    const firstText = getFirstTextNode(el)
    const range = document.createRange()
    const sel = window.getSelection()
    if (firstText) { range.setStart(firstText, 0) } else { range.setStart(el, 0) }
    range.collapse(true)
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, [isDocEditing])

  useEffect(() => {
    if (!isDocEditing && !hasAiChanges) { setDocToolbarStyle(null); return }
    const update = () => {
      const rect = docBodyRef.current?.getBoundingClientRect()
      if (rect) setDocToolbarStyle({ left: rect.left, width: rect.width })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [isDocEditing, hasAiChanges])

  useEffect(() => { isDocEditingRef.current = isDocEditing }, [isDocEditing])
  useEffect(() => { aiPopupOpenRef.current = aiPopupOpen }, [aiPopupOpen])
  useEffect(() => { aiPopupPhaseRef.current = aiPopupPhase }, [aiPopupPhase])

  useEffect(() => {
    if (!isDocEditing || hasDocChanges) return
    const cancel = (e: MouseEvent) => {
      if (!docBodyRef.current?.contains(e.target as Node) && !editToolbarRef.current?.contains(e.target as Node)) {
        setIsDocEditing(false)
      }
    }
    document.addEventListener('mousedown', cancel)
    return () => document.removeEventListener('mousedown', cancel)
  }, [isDocEditing, hasDocChanges])

  // Close AI popup on outside click
  useEffect(() => {
    if (!aiPopupOpen) return
    const onDown = (e: MouseEvent) => {
      if (aiPopupRef.current && !aiPopupRef.current.contains(e.target as Node)) {
        setAiPopupOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [aiPopupOpen])

  useEffect(() => {
    const onMouseUp = () => {
      if (isDocEditingRef.current) return
      if (aiPopupOpenRef.current) {
        // While the popup is open in idle phase, a new selection transitions to instructions
        if (aiPopupPhaseRef.current !== 'idle') return
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed || !sel.toString().trim()) return
        if (!docBodyRef.current?.contains(sel.anchorNode)) return
        const range = sel.getRangeAt(0)
        const frag = range.cloneContents()
        let selectedText = ''
        const BLOCK_TAGS = new Set(['DIV', 'P', 'SECTION', 'H1', 'H2', 'H3', 'H4', 'LI', 'TR'])
        const walk = (node: Node) => {
          if (node.nodeType === Node.TEXT_NODE) { selectedText += node.textContent ?? '' }
          else {
            const tag = (node as Element).tagName ?? ''
            if (tag === 'BR') { selectedText += '\n' }
            else {
              const isBlock = BLOCK_TAGS.has(tag)
              if (isBlock && selectedText.length > 0 && !selectedText.endsWith('\n')) selectedText += '\n'
              node.childNodes.forEach(walk)
              if (isBlock && selectedText.length > 0 && !selectedText.endsWith('\n')) selectedText += '\n'
            }
          }
        }
        walk(frag)
        if (!selectedText.trim()) return
        const selHtmlDiv = document.createElement('div')
        selHtmlDiv.appendChild(range.cloneContents())
        setAiPopupSelectedHtml(selHtmlDiv.innerHTML)
        setAiPopupSelectedText(selectedText)
        setAiPopupSource('selection')
        setAiPopupInstruction('')
        setAiPopupResult(null)
        setAiPopupPhase('instructions')
        return
      }
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return
      if (!docBodyRef.current?.contains(sel.anchorNode)) return
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const frag = range.cloneContents()
      let selectedText = ''
      const BLOCK_TAGS = new Set(['DIV', 'P', 'SECTION', 'H1', 'H2', 'H3', 'H4', 'LI', 'TR'])
      const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          selectedText += node.textContent ?? ''
        } else {
          const tag = (node as Element).tagName ?? ''
          if (tag === 'BR') {
            selectedText += '\n'
          } else {
            const isBlock = BLOCK_TAGS.has(tag)
            if (isBlock && selectedText.length > 0 && !selectedText.endsWith('\n')) selectedText += '\n'
            node.childNodes.forEach(walk)
            if (isBlock && selectedText.length > 0 && !selectedText.endsWith('\n')) selectedText += '\n'
          }
        }
      }
      walk(frag)
      if (!selectedText.trim()) return
      const selHtmlDiv = document.createElement('div')
      selHtmlDiv.appendChild(range.cloneContents())
      setAiPopupSelectedHtml(selHtmlDiv.innerHTML)
      const docRect = docBodyRef.current?.getBoundingClientRect()
      if (!docRect) return
      const selTop = Math.round(rect.top)
      const selBottom = Math.round(rect.bottom)
      const POPUP_H = 390
      const BTN_SIZE = 52
      const MARGIN = spacing(4)
      const top = Math.max(60, window.innerHeight - BTN_SIZE - MARGIN - spacing(2) - POPUP_H)
      const left = Math.max(8, window.innerWidth - POPUP_W - MARGIN)
      setAiPopupPos({ top, left })
      setAiPopupSource('selection')
      setAiPopupSelectedText(selectedText)
      setAiPopupInstruction('')
      setAiPopupPhase('instructions')
      setAiPopupResult(null)
      setAiPopupOpen(true)
    }
    document.addEventListener('mouseup', onMouseUp)
    return () => document.removeEventListener('mouseup', onMouseUp)
  }, [])

  if (!foundDoc) return <Navigate to="/my-documents/preview-tasks/version-12" replace />

  const displayDoc = (localDoc?._id === foundDoc._id ? localDoc : null) ?? foundDoc
  const displaySummary = localSummary ?? DOCUMENT_SNIPPETS[displayDoc._id] ?? `${displayDoc.documentType} — ${displayDoc.domain}`
  const filename = `${displayDoc.name}.${displayDoc.fileFormat.toLowerCase()}`

  // ─── Details handlers ──────────────────────────────────────────────────────

  const startEdit = () => {
    setEditingName(displayDoc.name); setEditingDomain(displayDoc.domain)
    setEditingDocumentType(displayDoc.documentType); setEditingCustomTags(displayDoc.tagList ?? [])
    setEditingRemovedFields(new Set()); setEditingSummary(displaySummary); setTagInputVal(''); setIsEditing(true)
  }

  const saveEdit = () => {
    const updatedDoc: MetadataDocument = {
      ...displayDoc, name: editingName, domain: editingDomain, documentType: editingDocumentType, tagList: editingCustomTags,
      ...(editingRemovedFields.has('namedEntity')     && { namedEntity: '—' }),
      ...(editingRemovedFields.has('namedEntityId')   && { namedEntityId: '—' }),
      ...(editingRemovedFields.has('jurisdiction')    && { jurisdiction: '—' }),
      ...(editingRemovedFields.has('lawType')         && { lawType: '—' }),
      ...(editingRemovedFields.has('citations')       && { citations: '—' }),
      ...(editingRemovedFields.has('monetaryAmounts') && { monetaryAmounts: 0 }),
      ...(editingRemovedFields.has('monetaryTypes')   && { monetaryTypes: 'None' }),
    }
    setIsEditing(false); setIsSaving(true)
    setTimeout(() => {
      setLocalDoc(updatedDoc); setLocalSummary(editingSummary); setIsSaving(false)
      notification.success({ title: 'Document details updated successfully', placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
    }, 1000)
  }

  const cancelEdit = () => {
    setIsEditing(false); setEditingName(''); setEditingDomain(''); setEditingDocumentType('')
    setEditingCustomTags([]); setEditingRemovedFields(new Set()); setEditingSummary(''); setTagInputVal('')
  }

  const addTag = () => {
    const t = tagInputVal.trim()
    if (t && !editingCustomTags.some(tag => tag.text === t)) setEditingCustomTags(prev => [...prev, { text: t, style: chipStyles.ACCENT_NEUTRAL, variant: chipVariants.HIGHLIGHT }])
    setTagInputVal('')
  }

  const runTask = (taskId: string) => {
    setTaskStates(prev => ({ ...prev, [taskId]: { status: 'running', result: null } }))
    setTimeout(() => {
      setTaskStates(prev => ({ ...prev, [taskId]: { status: 'done', result: getMockResult(taskId as TaskId, displayDoc) } }))
    }, 1800)
  }

  // ─── Doc editing handlers ──────────────────────────────────────────────────

  const applyMarkup = (type: MarkupType) => {
    const el = docContentRef.current
    if (!el || !isDocEditing) return
    switch (type) {
      case 'h1': document.execCommand('fontSize', false, '5'); if (!document.queryCommandState('bold')) document.execCommand('bold'); break
      case 'h2': applyFontSizePx('15px'); if (!document.queryCommandState('bold')) document.execCommand('bold'); break
      case 'p': document.execCommand('removeFormat'); break
      case 'pb': if (!document.queryCommandState('bold')) document.execCommand('bold'); break
    }
    if (el) setHasDocChanges(el.innerHTML !== savedDocHtmlRef.current)
  }

  const enterDocEdit = () => { savedDocHtmlRef.current = docHtml ?? ''; setHasDocChanges(false); setIsDocEditing(true) }
  const enterDocEditFromSelection = () => { savedDocHtmlRef.current = docHtml ?? ''; setHasDocChanges(false); setIsDocEditing(true) }
  const saveDocEdit = () => { if (docContentRef.current) setDocHtml(docContentRef.current.innerHTML); setHasDocChanges(false); setIsDocEditing(false) }
  const discardDocEdit = () => { if (docContentRef.current) docContentRef.current.innerHTML = savedDocHtmlRef.current; setHasDocChanges(false); setIsDocEditing(false) }

  const saveAsCopy = () => {
    const html = (isDocEditing && docContentRef.current) ? docContentRef.current.innerHTML : (docHtml ?? docContentRef.current?.innerHTML ?? '')
    const copyId = `copy-${displayDoc._id}-${Date.now()}`
    const copyDoc: MetadataDocument = { ...displayDoc, _id: copyId, name: `${displayDoc.name} (Copy)`, uploadedDate: new Date().toISOString().slice(0, 10) }
    addCopiedDoc(copyDoc, html)
    notification.success({ title: 'Copy saved', content: <Typography size="base" color="neutral-darken5">{copyDoc.name}</Typography>, placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
    navigate(`/my-documents/preview-tasks/version-12/${copyId}`, { replace: true })
  }

  // ─── AI popup handlers ────────────────────────────────────────────────────

  const executeAiEdit = (instruction: string) => {
    if (!instruction.trim()) return
    const docText = docContentRef.current?.innerText?.trim() || `${displayDoc.documentType} — ${displayDoc.namedEntity}`
    const isSelection = aiPopupSource === 'selection'
    const original = isSelection ? aiPopupSelectedText : docText
    const originalHtml = isSelection
      ? aiPopupSelectedHtml
      : (docHtml ?? docContentRef.current?.innerHTML ?? '')
    setAiPopupInstruction(instruction)
    setAiPopupPhase('generating')
    setTimeout(() => {
      const suggested = simulateGptEdit(original, instruction)
      const suggestedHtml = originalHtml ? simulateGptEditHtml(originalHtml, instruction) : ''
      setAiPopupResult({ original, originalHtml, suggested, suggestedHtml })
      setAiPopupPhase(instruction.toLowerCase().includes('summar') ? 'summary' : 'result')
    }, 1600)
  }

  const applyAiEdit = () => {
    if (!aiPopupResult) return
    const source = aiPopupSource
    const currentDocHtml = docHtml
    const { originalHtml, suggestedHtml, suggested } = aiPopupResult

    preAiDocHtmlRef.current = currentDocHtml
    setAiPopupOpen(false)
    setIsApplyingChanges(true)

    setTimeout(() => {
      let newDocHtml: string

      if (source === 'document') {
        newDocHtml = suggestedHtml || (() => {
          const escaped = suggested.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')
          return `<div style="font-family:'Open Sans',sans-serif;font-size:14px;line-height:1.8">${escaped}</div>`
        })()
      } else {
        const html = currentDocHtml ?? ''
        const replacement = suggestedHtml || (() => {
          const escaped = suggested.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')
          return escaped
        })()
        newDocHtml = (originalHtml && html.includes(originalHtml))
          ? html.replace(originalHtml, replacement)
          : html
      }

      setDocHtml(newDocHtml)
      setIsApplyingChanges(false)
      setHasAiChanges(true)
    }, 800)
  }

  const discardAiChanges = () => {
    if (preAiDocHtmlRef.current !== null) setDocHtml(preAiDocHtmlRef.current)
    preAiDocHtmlRef.current = null
    setHasAiChanges(false)
  }

  const saveAiChanges = () => {
    if (id && docHtml !== null) customHtmlMap.set(id, docHtml)
    preAiDocHtmlRef.current = null
    setHasAiChanges(false)
    notification.success({ title: 'Changes saved', placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
  }

  const handleAiCrossRef = () => setAiPopupPhase('crossref')

  const handleFloatingTasksClick = () => {
    if (isDocEditing) return
    if (aiPopupOpen) { setAiPopupOpen(false); return }

    const POPUP_H = 390
    const BTN_SIZE = 56 // large circle button
    const MARGIN = spacing(4)
    const top = Math.max(60, window.innerHeight - BTN_SIZE - MARGIN - spacing(2) - POPUP_H)
    const left = Math.max(8, window.innerWidth - POPUP_W - MARGIN)
    setAiPopupPos({ top, left })

    // If there's already a valid selection in the doc body, go straight to instructions
    const sel = window.getSelection()
    const hasSelection = !!(sel && !sel.isCollapsed && sel.toString().trim() && docBodyRef.current?.contains(sel.anchorNode))

    if (hasSelection) {
      const range = sel!.getRangeAt(0)
      const frag = range.cloneContents()
      let selectedText = ''
      const BLOCK_TAGS = new Set(['DIV', 'P', 'SECTION', 'H1', 'H2', 'H3', 'H4', 'LI', 'TR'])
      const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) { selectedText += node.textContent ?? '' }
        else {
          const tag = (node as Element).tagName ?? ''
          if (tag === 'BR') { selectedText += '\n' }
          else {
            const isBlock = BLOCK_TAGS.has(tag)
            if (isBlock && selectedText.length > 0 && !selectedText.endsWith('\n')) selectedText += '\n'
            node.childNodes.forEach(walk)
            if (isBlock && selectedText.length > 0 && !selectedText.endsWith('\n')) selectedText += '\n'
          }
        }
      }
      walk(frag)
      const selHtmlDiv = document.createElement('div')
      selHtmlDiv.appendChild(range.cloneContents())
      setAiPopupSelectedHtml(selHtmlDiv.innerHTML)
      setAiPopupSelectedText(selectedText.trim())
      setAiPopupSource('selection')
      setAiPopupInstruction('')
      setAiPopupResult(null)
      setAiPopupPhase('instructions')
    } else {
      setAiPopupSource('document')
      setAiPopupSelectedText('')
      setAiPopupInstruction('')
      setAiPopupResult(null)
      setAiPopupPhase('idle')
    }

    setAiPopupOpen(true)
  }

  const relatedDocs = allDocs
    .filter(d => d._id !== displayDoc._id && (
      d.domain === displayDoc.domain ||
      (d.namedEntity !== '—' && d.namedEntity === displayDoc.namedEntity)
    ))
    .slice(0, 5)

  const handleAiCopilot = () => {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F5F9FF' }}>
      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: TOP_BAR_BG, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <ButtonGhost mode="contrast" leftIcon={iconType.ChevronLeftOutlined} onClick={() => navigate(-1)}>Back</ButtonGhost>
        <Typography weight="bold" color="white">{filename}</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ButtonTertiary mode="contrast">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />Ask CoPilot<Icon type={iconType.ExternalLinkOutlined} size={16} /></span>
          </ButtonTertiary>
          <Dropdown
            items={[
              { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => {} },
              { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => {} },
            ]}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonTertiary mode="contrast" shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
          </Dropdown>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Document body */}
        <div
          ref={docBodyRef}
          style={{
            position: 'relative',
            flex: '0 0 62%',
            backgroundColor: colorPalette.white,
            borderRadius: 8,
            padding: '32px 40px',
            minHeight: 640,
            border: isDocEditing ? `1px solid ${token.colorPrimary}` : '1px solid transparent',
            transition: 'border-color 0.2s',
          }}
        >
          {isLoading || isApplyingChanges
            ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '60%' }} paragraph={{ rows: 16 }} />
            : docHtml !== null
            ? <div ref={docContentRef} contentEditable={isDocEditing} suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: docHtml }} style={{ outline: 'none' }} onInput={() => { if (docContentRef.current) setHasDocChanges(docContentRef.current.innerHTML !== savedDocHtmlRef.current) }} />
            : <div ref={docContentRef}><DocumentBody doc={displayDoc} /></div>
          }
        </div>

        {/* Right panel — two stacked cards */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ backgroundColor: colorPalette.white, borderRadius: 8, padding: `${spacing(4)}px` }}>
            {isLoading
              ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 10 }} />
              : isSaving
              ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '55%' }} paragraph={{ rows: 8 }} />
              : isEditing
              ? <EditPanel
                  displayDoc={displayDoc}
                  editingName={editingName} setEditingName={setEditingName}
                  editingDomain={editingDomain} setEditingDomain={setEditingDomain}
                  editingDocumentType={editingDocumentType} setEditingDocumentType={setEditingDocumentType}
                  editingCustomTags={editingCustomTags} setEditingCustomTags={setEditingCustomTags}
                  editingRemovedFields={editingRemovedFields} setEditingRemovedFields={setEditingRemovedFields}
                  editingSummary={editingSummary} setEditingSummary={setEditingSummary}
                  tagInputVal={tagInputVal} setTagInputVal={setTagInputVal}
                  addTag={addTag} onSave={saveEdit} onCancel={cancelEdit}
                />
              : <ViewPanel displayDoc={displayDoc} displaySummary={displaySummary} onEdit={startEdit} />
            }
          </div>
        </div>
      </div>

      {/* AI edit popup */}
      {aiPopupOpen && (
        <AiEditPopup
          ref={aiPopupRef}
          phase={aiPopupPhase}
          source={aiPopupSource}
          selectedText={aiPopupSelectedText}
          instruction={aiPopupInstruction}
          result={aiPopupResult}
          pos={aiPopupPos}
          onInstructionChange={v => setAiPopupInstruction(v)}
          onExecute={executeAiEdit}
          onCrossRef={handleAiCrossRef}
          onCopilot={handleAiCopilot}
          onSubmit={() => executeAiEdit(aiPopupInstruction)}
          onDiscard={() => { setAiPopupPhase(aiPopupSource === 'document' ? 'idle' : 'instructions'); setAiPopupResult(null); setAiPopupInstruction('') }}
          onGoBack={() => { setAiPopupPhase(aiPopupSource === 'document' ? 'idle' : 'instructions'); setAiPopupResult(null) }}
          relatedDocs={relatedDocs}
          onApply={applyAiEdit}
          onClose={() => setAiPopupOpen(false)}
          onRunTask={runTask}
          taskStates={taskStates}
        />
      )}

      {/* Doc editing bottom toolbar */}
      {isDocEditing && docToolbarStyle && (
        <div ref={editToolbarRef} style={{ position: 'fixed', bottom: spacing(2), left: docToolbarStyle.left + spacing(2), width: docToolbarStyle.width - spacing(2) * 2, zIndex: 200 }}>
          <Toolbar
            visible
            leftItems={[
              hasDocChanges
                ? <Typography key="msg" color="neutral-darken5">You have unsaved changes</Typography>
                : <Typography key="msg" color="neutral-darken2">Editing document content</Typography>,
            ]}
            rightItems={[
              <div key="actions" style={{ display: 'flex', gap: spacing(2) }}>
                <ButtonTertiary onClick={discardDocEdit}>Discard</ButtonTertiary>
                {hasDocChanges && <ButtonTertiary onClick={saveAsCopy} leftIcon={iconType.CopyOutlined}>Save as copy</ButtonTertiary>}
                {hasDocChanges && <ButtonPrimary onClick={saveDocEdit}>Save</ButtonPrimary>}
              </div>,
            ]}
          />
        </div>
      )}

      {/* Floating Tasks button */}
      {!isLoading && !isApplyingChanges && !isDocEditing && (
        <button
          onClick={handleFloatingTasksClick}
          style={{
            position: 'fixed', bottom: spacing(4), right: spacing(4), zIndex: 50,
            width: 52, height: 52, borderRadius: '50%',
            border: `1.5px solid ${colorPalette.neutral.lighten1}`,
            backgroundColor: colorPalette.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', outline: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.14)',
            transition: 'box-shadow 0.15s, border-color 0.15s',
            color: colorPalette.neutral.darken5,
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'; e.currentTarget.style.borderColor = colorPalette.neutral.base }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.14)'; e.currentTarget.style.borderColor = colorPalette.neutral.lighten1 }}
        >
          <SparkleIcon size={22} color={colorPalette.blue.darken1} />
        </button>
      )}

      {/* AI changes toolbar */}
      {hasAiChanges && docToolbarStyle && (
        <div style={{ position: 'fixed', bottom: spacing(2), left: docToolbarStyle.left + spacing(2), width: docToolbarStyle.width - spacing(2) * 2, zIndex: 200 }}>
          <Toolbar
            visible
            leftItems={[
              <Typography key="msg" color="neutral-darken5">AI changes applied — review before saving</Typography>,
            ]}
            rightItems={[
              <div key="actions" style={{ display: 'flex', gap: spacing(2) }}>
                <ButtonTertiary onClick={discardAiChanges}>Discard</ButtonTertiary>
                <ButtonPrimary onClick={saveAiChanges}>Save</ButtonPrimary>
              </div>,
            ]}
          />
        </div>
      )}
    </div>
  )
}

// ─── AI Edit Popup ────────────────────────────────────────────────────────────

const AiEditPopup = React.forwardRef<HTMLDivElement, {
  phase: AiPopupPhase
  source: AiPopupSource
  selectedText: string
  instruction: string
  result: AiEditResult | null
  pos: { top: number; left: number }
  relatedDocs: MetadataDocument[]
  onInstructionChange: (v: string) => void
  onExecute: (instruction: string) => void
  onCrossRef: () => void
  onCopilot: () => void
  onSubmit: () => void
  onDiscard: () => void
  onApply: () => void
  onGoBack: () => void
  onClose: () => void
  onRunTask: (taskId: string) => void
  taskStates: Record<string, TaskState>
}>(function AiEditPopup({ phase, source, selectedText, instruction, result, pos, relatedDocs, onInstructionChange, onExecute, onCrossRef, onCopilot, onSubmit, onDiscard, onApply, onGoBack, onClose, onRunTask, taskStates }, ref) {
  const isIdle = phase === 'idle'
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const isResult = phase === 'result'
  const isGenerating = phase === 'generating'
  const isCrossRef = phase === 'crossref'
  const isSummary = phase === 'summary'
  const [copied, setCopied] = useState(false)

  const [localPos, setLocalPos] = useState({ top: pos.top, left: pos.left })
  const dragRef = useRef<{ startX: number; startY: number; startTop: number; startLeft: number } | null>(null)

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startY: e.clientY, startTop: localPos.top, startLeft: localPos.left }
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      setLocalPos({
        top: dragRef.current.startTop + (ev.clientY - dragRef.current.startY),
        left: dragRef.current.startLeft + (ev.clientX - dragRef.current.startX),
      })
    }
    const onUp = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: localPos.top,
        left: localPos.left,
        width: POPUP_W,
        height: 520,
        backgroundColor: colorPalette.white,
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
        border: '1px solid #e5e7eb',
        zIndex: 1001,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header — drag handle */}
      <div
        onMouseDown={handleHeaderMouseDown}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${spacing(3)}px ${spacing(4)}px`, borderBottom: '1px solid #f0f0f0', cursor: 'grab', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <Typography size="base" weight="semibold" color="neutral-darken5">Tasks</Typography>
          <Chip label="BETA" chipStyle={chipStyles.SEMANTIC_INFO} variant={chipVariants.SUBTLE} />
        </div>
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={onClose} />
      </div>

      {/* Scrollable content area */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: `${spacing(3)}px ${spacing(4)}px`, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>

        {/* Generating */}
        {isGenerating && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing(2), flex: 1 }}>
            <Spinner size="small" />
            <Typography size="base-sm" color="neutral-darken3">Generating…</Typography>
          </div>
        )}

        {/* Idle — task list or active task state */}
        {isIdle && (() => {
          const activeTask = activeTaskId ? TASK_DEFS.find(t => t.id === activeTaskId) : null
          const activeState = activeTaskId ? taskStates[activeTaskId] : null
          const isRunning = activeState?.status === 'running'
          const isDone = activeState?.status === 'done'

          if (activeTask && isRunning) {
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing(2), flex: 1 }}>
                <Spinner size="small" />
                <Typography size="base-sm" color="neutral-darken3">{activeTask.label}…</Typography>
              </div>
            )
          }
          if (activeTask && isDone && activeState?.result) {
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
                  <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ChevronLeftOutlined} onClick={() => setActiveTaskId(null)} />
                  <Typography size="base" weight="semibold" color="neutral-darken5">{activeTask.label}</Typography>
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: spacing(2) }}>{activeState.result}</div>
              </>
            )
          }
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TASK_DEFS.map(task => (
                <div
                  key={task.id}
                  onClick={() => { setActiveTaskId(task.id); onRunTask(task.id) }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', transition: 'border-color 0.15s', backgroundColor: colorPalette.white }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#a5b4fc' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb' }}
                >
                  <span style={{ flexShrink: 0, marginTop: 2, display: 'inline-flex', transform: task.iconRotation ? `rotate(${task.iconRotation})` : undefined }}>
                    <Icon type={task.icon} size={16} color="neutral-darken4" />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography size="base" weight="semibold" color="neutral-darken5">{task.label}</Typography>
                    <Typography size="base-sm" color="neutral-darken2">{task.description}</Typography>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Instructions — quick action cards */}
        {!isIdle && !isResult && !isGenerating && !isCrossRef && !isSummary && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_ACTIONS.map(action => (
                <div
                  key={action.label}
                  onClick={() => onExecute(action.instruction)}
                  style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', transition: 'border-color 0.15s', backgroundColor: colorPalette.white }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#a5b4fc' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb' }}
                >
                  <Typography size="base" color="neutral-darken5">{action.label}</Typography>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: spacing(2) }}>
              <ButtonTertiary size="small" onClick={onCrossRef}>Cross-reference</ButtonTertiary>
              <ButtonTertiary size="small" rightIcon={iconType.ExternalLinkOutlined} onClick={onCopilot}>Ask CoPilot</ButtonTertiary>
            </div>
          </>
        )}

        {/* Result */}
        {isResult && result && (
          <>
            <Typography size="base" color="neutral-darken5">
              {QUICK_ACTIONS.find(a => a.instruction === instruction)?.label ?? instruction}
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
              <Typography size="base-sm" weight="semibold" color="neutral-darken3">Before</Typography>
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: spacing(3), maxHeight: 120, overflowY: 'auto' }}>
                {result.originalHtml
                  ? <div dangerouslySetInnerHTML={{ __html: result.originalHtml }} style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 14, lineHeight: 1.8, color: colorPalette.neutral.darken5, wordBreak: 'break-word' }} />
                  : <div style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 14, lineHeight: 1.8, color: colorPalette.neutral.darken5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{result.original}</div>
                }
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
              <Typography size="base-sm" weight="semibold" color="neutral-darken3">After</Typography>
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: spacing(3), maxHeight: 120, overflowY: 'auto' }}>
                {result.suggestedHtml
                  ? <div dangerouslySetInnerHTML={{ __html: result.suggestedHtml }} style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 14, lineHeight: 1.8, color: colorPalette.neutral.darken5, wordBreak: 'break-word' }} />
                  : <div style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 14, lineHeight: 1.8, color: colorPalette.neutral.darken5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{result.suggested}</div>
                }
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing(2), marginTop: 'auto' }}>
              <ButtonTertiary onClick={onDiscard}>Discard</ButtonTertiary>
              <ButtonPrimary onClick={onApply}>Apply changes</ButtonPrimary>
            </div>
          </>
        )}

        {/* Summary */}
        {isSummary && result && (
          <>
            <Typography size="base-sm" weight="semibold" color="neutral-darken3">Summary</Typography>
            <div style={{ flex: 1, fontFamily: "'Open Sans', sans-serif", fontSize: 14, lineHeight: 1.8, color: colorPalette.neutral.darken5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {result.suggested}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <ButtonTertiary onClick={onGoBack}>Back</ButtonTertiary>
              <ButtonPrimary onClick={() => { navigator.clipboard.writeText(result.suggested); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                {copied ? 'Copied!' : 'Copy'}
              </ButtonPrimary>
            </div>
          </>
        )}

        {/* Cross-reference */}
        {isCrossRef && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
              <Typography size="base" weight="semibold" color="neutral-darken5">Cross-Reference</Typography>
              <Typography size="base-sm" color="neutral-darken2">
                {selectedText ? `Documents related to "${selectedText.slice(0, 50)}${selectedText.length > 50 ? '…' : ''}"` : 'Documents that may be relevant to this content'}
              </Typography>
            </div>
            {relatedDocs.length === 0
              ? <Typography size="base" color="neutral-darken2">No related documents found in your library.</Typography>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {relatedDocs.map(doc => (
                    <div key={doc._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 8, backgroundColor: colorPalette.white }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Typography size="base" weight="semibold" color="neutral-darken5">{doc.name.replace(/\s*\(\d{4}\)\s*/g, '').trim()}</Typography>
                        <Typography size="base-sm" color="neutral-darken2">{doc.documentType} · {doc.domain}</Typography>
                      </div>
                      <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ExternalLinkOutlined} onClick={() => window.open(`/my-documents/preview-tasks/version-12/${doc._id}`, '_blank', 'noopener,noreferrer')} />
                    </div>
                  ))}
                </div>
              )
            }
            <div style={{ marginTop: 'auto' }}><ButtonTertiary onClick={onGoBack}>Back</ButtonTertiary></div>
          </>
        )}
      </div>

      {/* Fixed bottom — instructions textarea, shown for idle (task list) and instructions phases */}
      {(isIdle && !activeTaskId) || (!isIdle && !isGenerating && !isResult && !isSummary && !isCrossRef) ? (
        <div style={{ flexShrink: 0, borderTop: '1px solid #f0f0f0', padding: `${spacing(3)}px ${spacing(4)}px`, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <Typography size="base-sm" weight="semibold" color="neutral-darken5">Instructions</Typography>
          <TextArea
            name="ai-instruction"
            value={instruction}
            onChange={e => onInstructionChange(e.target.value)}
            placeholder="Describe what you'd like to do"
            rows={3}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing(2) }}>
            <ButtonTertiary onClick={onClose}>Cancel</ButtonTertiary>
            <ButtonPrimary disabled={!instruction.trim()} onClick={onSubmit}>Submit</ButtonPrimary>
          </div>
        </div>
      ) : null}
    </div>
  )
})

// ─── Tasks panel ──────────────────────────────────────────────────────────────

function TasksPanel({ taskStates, onRun }: {
  taskStates: Record<string, TaskState>
  onRun: (taskId: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {TASK_DEFS.map(task => (
        <TaskCard key={task.id} task={task} state={taskStates[task.id] ?? null} onRun={onRun} />
      ))}
    </div>
  )
}

function TaskCard({ task, state, onRun }: {
  task: { id: TaskId; label: string; description: string; icon: string; iconRotation?: string }
  state: TaskState | null
  onRun: (taskId: string) => void
}) {
  const isRunning = state?.status === 'running'
  const isDone = state?.status === 'done'
  const isIdle = !isRunning && !isDone
  return (
    <div
      style={{ border: `1px solid ${isDone ? colorPalette.neutral.lighten1 : '#e5e7eb'}`, borderRadius: 8, overflow: 'hidden', cursor: isIdle ? 'pointer' : 'default', transition: 'border-color 0.15s', backgroundColor: colorPalette.white }}
      onClick={isIdle ? () => onRun(task.id) : undefined}
      onMouseEnter={isIdle ? e => { e.currentTarget.style.borderColor = '#a5b4fc' } : undefined}
      onMouseLeave={isIdle ? e => { e.currentTarget.style.borderColor = '#e5e7eb' } : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px' }}>
        <span style={{ flexShrink: 0, marginTop: 2, display: 'inline-flex', transform: task.iconRotation ? `rotate(${task.iconRotation})` : undefined }}>
          <Icon type={task.icon} size={16} color="neutral-darken4" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography size="base" weight="semibold" color="neutral-darken5">{task.label}</Typography>
          <Typography size="base-sm" color="neutral-darken2">{task.description}</Typography>
        </div>
        {isDone && <div style={{ flexShrink: 0 }}><ButtonTertiary shape={buttonShapes.SQUARE} leftIcon={iconType.RefreshOutlined} onClick={e => { e.stopPropagation(); onRun(task.id) }} /></div>}
      </div>
      {isRunning && <div style={{ padding: '0 14px 14px' }}><Skeleton variant={skeletonVariants.TEXT} paragraph={{ rows: 3 }} /></div>}
      {isDone && state?.result && <div style={{ padding: '0 14px 14px', borderTop: '1px solid #e5e7eb' }}><div style={{ paddingTop: 14 }}>{state.result}</div></div>}
    </div>
  )
}

// ─── Details panels ───────────────────────────────────────────────────────────

function ViewPanel({ displayDoc, displaySummary, onEdit }: { displayDoc: MetadataDocument; displaySummary: string; onEdit: () => void }) {
  const tags = getDocumentTags(displayDoc)
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(3) }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">Document Details</Typography>
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.EditOutlined} onClick={onEdit} />
      </div>
      <DataRow label="Name" value={displayDoc.name} />
      <DataRow label="Summary" value={displaySummary} />
      <DataRow label="Type" value={displayDoc.documentType} />
      {displayDoc.label && <DataRow label="Label" value={<Chip label={displayDoc.label} chipStyle={chipStyles.SEMANTIC_WARNING} variant={chipVariants.SUBTLE} />} />}
      <DataRow label="Uploaded" value={formatDate(displayDoc.uploadedDate)} />
      <DataRow label="Format" value={displayDoc.fileFormat} />
      <DataRow label="Tags" value={<div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{tags.map((tag, i) => <Chip key={i} label={tag.text} chipStyle={tag.style as ChipStyleValue} variant={(tag.variant as typeof chipVariants[keyof typeof chipVariants]) ?? chipVariants.SUBTLE} />)}</div>} />
    </>
  )
}

function EditPanel({
  displayDoc, editingName, setEditingName: _setEditingName, editingDomain: _editingDomain, setEditingDomain: _setEditingDomain,
  editingDocumentType, setEditingDocumentType, editingCustomTags, setEditingCustomTags,
  editingRemovedFields, setEditingRemovedFields, editingSummary, setEditingSummary,
  tagInputVal, setTagInputVal, addTag, onSave, onCancel,
}: {
  displayDoc: MetadataDocument; editingName: string; setEditingName: (_v: string) => void
  editingDomain: string; setEditingDomain: (v: string) => void; editingDocumentType: string; setEditingDocumentType: (v: string) => void
  editingCustomTags: Tag[]; setEditingCustomTags: React.Dispatch<React.SetStateAction<Tag[]>>
  editingRemovedFields: Set<string>; setEditingRemovedFields: React.Dispatch<React.SetStateAction<Set<string>>>
  editingSummary: string; setEditingSummary: (v: string) => void; tagInputVal: string; setTagInputVal: (v: string) => void
  addTag: () => void; onSave: () => void; onCancel: () => void
}) {
  const removeField = (key: string) => setEditingRemovedFields(prev => new Set(prev).add(key))
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(3) }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">Document Details</Typography>
        <div style={{ display: 'flex', gap: 8 }}><ButtonTertiary onClick={onCancel}>Cancel</ButtonTertiary><ButtonPrimary onClick={onSave}>Save</ButtonPrimary></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="Name" name="name" value={editingName} disabled />
        <TextArea label="Summary" value={editingSummary} maxLength={SUMMARY_MAX} hasCounter autoSize={{ minRows: 4, maxRows: 8 }} onChange={e => setEditingSummary(e.target.value)} />
        <Select label="Type" name="documentType" value={editingDocumentType} options={DOCUMENT_TYPE_OPTIONS} onChange={v => setEditingDocumentType(String(v))} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography size="base" weight="semibold" color="neutral-darken5">Tags</Typography>
          <div style={{ position: 'relative' }}>
            <Input placeholder="Add tag…" value={tagInputVal} onChange={e => setTagInputVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
            {tagInputVal.length > 0 && <span style={{ position: 'absolute', right: 12, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 12, color: '#9ca3af', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>Enter ↵</span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {editingCustomTags.map((tag, i) => <Chip key={i} label={tag.text} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.HIGHLIGHT} closable onClose={() => setEditingCustomTags(prev => prev.filter((_, j) => j !== i))} />)}
            {displayDoc.namedEntity !== '—' && !editingRemovedFields.has('namedEntity') && <Chip label={displayDoc.namedEntity} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('namedEntity')} />}
            {displayDoc.namedEntityId !== '—' && !editingRemovedFields.has('namedEntityId') && <Chip label={displayDoc.namedEntityId} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('namedEntityId')} />}
            {displayDoc.jurisdiction !== '—' && !editingRemovedFields.has('jurisdiction') && <Chip label={displayDoc.jurisdiction} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('jurisdiction')} />}
            {displayDoc.lawType !== '—' && !editingRemovedFields.has('lawType') && <Chip label={displayDoc.lawType} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('lawType')} />}
            {displayDoc.citations !== '—' && !editingRemovedFields.has('citations') && <Chip label={displayDoc.citations} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('citations')} />}
            {displayDoc.monetaryAmounts > 0 && !editingRemovedFields.has('monetaryAmounts') && <Chip label={`${displayDoc.monetaryAmounts.toLocaleString('de-DE')} ${displayDoc.currency}`} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('monetaryAmounts')} />}
            {displayDoc.monetaryTypes !== 'None' && !editingRemovedFields.has('monetaryTypes') && <Chip label={displayDoc.monetaryTypes} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} closable onClose={() => removeField('monetaryTypes')} />}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Document body ────────────────────────────────────────────────────────────

function Section({ number, heading, children }: { number: number; heading: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{toRoman(number)}. {heading}</div>
      <div>{children}</div>
    </section>
  )
}

function DocumentBody({ doc }: { doc: MetadataDocument }) {
  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", lineHeight: 1.8, color: '#1a1a1a', fontSize: 14 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1.25 }}>{doc.name.toUpperCase()}</div>
        <div style={{ color: '#555', marginTop: 8, fontSize: 13, fontWeight: 600 }}>{doc.documentType} · {doc.namedEntityId}</div>
      </div>
      {getDocumentSections(doc)}
    </div>
  )
}

function getDocumentSections(doc: MetadataDocument) {
  switch (doc._id) {
    case '1': return <HRPolicySections doc={doc} allowanceLabel="Versetzungspauschale" allowanceDesc="Mitarbeiter, die international versetzt werden, erhalten eine einmalige Versetzungspauschale in Höhe von 5.000 EUR zur Deckung von Umzugs- und Einrichtungskosten am neuen Standort." scopeDesc="Diese Richtlinie gilt für alle Mitarbeiter der Siemens AG, die im Rahmen einer internationalen Versetzung ihren Arbeitsort dauerhaft in ein anderes Land verlegen." />
    case '2': return <HRPolicySections doc={doc} allowanceLabel="Versetzungspauschale" allowanceDesc="Mitarbeiter, die international versetzt werden, erhielten eine einmalige Versetzungspauschale in Höhe von 4.000 EUR. Diese Richtlinie wurde durch die Version 2025 abgelöst." scopeDesc="Diese Richtlinie galt für alle Mitarbeiter der Siemens AG mit einem internationalen Versetzungsauftrag. Sie ist seit dem 12.03.2025 nicht mehr gültig." />
    case '3': return <HRPolicySections doc={doc} allowanceLabel="Umzugskostenzuschuss" allowanceDesc="Entsandte Mitarbeiter erhalten einen Umzugskostenzuschuss von bis zu 3.000 EUR für Umzugs- und Einlagerungskosten. Der Zuschuss wird auf Nachweis erstattet." scopeDesc="Diese Richtlinie gilt für alle Mitarbeiter der Allianz SE, die im Rahmen einer grenzüberschreitenden Entsendung ihren Wohnsitz temporär ins EU-Ausland verlegen." />
    case '4': return <HomeOfficeSections doc={doc} />
    case '5': return <TaxGuidanceSections doc={doc} threshold="75.000 EUR" rule="Auslandseinsätze, deren steuerlich relevante Vergütung den Betrag von 75.000 EUR überschreitet, unterliegen der vollständigen deutschen Steuerpflicht nach § 1 EStG." />
    case '6': return <TaxGuidanceSections doc={doc} threshold="60.000 EUR (Vorgängergrenze, abgelöst 2024)" rule="Diese Version definierte eine Einkommensgrenze von 60.000 EUR. Die aktuell gültige Fassung hat diese Grenze auf 75.000 EUR angehoben." />
    default:  return <GenericSections doc={doc} />
  }
}

function HRPolicySections({ doc, allowanceLabel, allowanceDesc, scopeDesc }: { doc: MetadataDocument; allowanceLabel: string; allowanceDesc: string; scopeDesc: string }) {
  return <>
    <Section number={1} heading="Geltungsbereich">{scopeDesc}</Section>
    <Section number={2} heading="Grundsätze">Die internationale Mobilität von Mitarbeitern wird durch {doc.namedEntity} aktiv gefördert. Die vorliegende Richtlinie regelt die Rahmenbedingungen, Leistungen und Pflichten bei internationalen Versetzungen. Grundlage bildet {doc.citations}.</Section>
    <Section number={3} heading={allowanceLabel}>{allowanceDesc}<br /><br />Voraussetzungen:<br />• Vorlage eines unterzeichneten Versetzungsvertrages<br />• Versetzungsdauer von mindestens 12 Monaten<br />• Antragstellung innerhalb von 90 Tagen nach Versetzungsbeginn</Section>
    <Section number={4} heading="Pflichten des Arbeitgebers">{doc.namedEntity} stellt sicher, dass alle steuerlichen und sozialversicherungsrechtlichen Meldepflichten in der Jurisdiktion {doc.jurisdiction} erfüllt werden.</Section>
    <Section number={5} heading="Pflichten des Mitarbeiters">Der versetzte Mitarbeiter ist verpflichtet, alle für die Versetzung relevanten Dokumente rechtzeitig einzureichen und die geltenden lokalen Gesetze einzuhalten.</Section>
    <Section number={6} heading="Gültigkeitsdauer">Diese Richtlinie gilt ab {doc.uploadedDate} und wird jährlich überprüft.</Section>
    <Section number={7} heading="Inkrafttreten">_________________________<br />Leiterin HR International · {doc.namedEntity}<br />[{doc.namedEntityId}] · Datum: {doc.uploadedDate}</Section>
  </>
}

function HomeOfficeSections({ doc }: { doc: MetadataDocument }) {
  return <>
    <Section number={1} heading="Geltungsbereich">Dieser Entwurf regelt die Bedingungen für grenzüberschreitende Homeoffice-Tätigkeiten bei der {doc.namedEntity}.</Section>
    <Section number={2} heading="Rechtliche Grundlage">Die Regelung stützt sich auf {doc.citations} sowie auf die einschlägigen Bestimmungen des europäischen Arbeitsrechts.</Section>
    <Section number={3} heading="Genehmigungsverfahren">Homeoffice-Tätigkeiten im Ausland bedürfen der schriftlichen Genehmigung. Anträge sind mindestens 30 Tage vor Beginn einzureichen.</Section>
    <Section number={4} heading="Steuerliche Aspekte">Bei grenzüberschreitender Homeoffice-Tätigkeit sind steuerliche Risiken im Hinblick auf eine mögliche Betriebsstättenbegründung zu beachten.</Section>
    <Section number={5} heading="Datenschutz und IT-Sicherheit">Mitarbeiter im Ausland-Homeoffice sind verpflichtet, die IT-Sicherheitsrichtlinien der {doc.namedEntity} einzuhalten.</Section>
    <Section number={6} heading="Status">Dieses Dokument befindet sich im Status „Entwurf" (Stand: {doc.uploadedDate}).</Section>
  </>
}

function TaxGuidanceSections({ doc, threshold, rule }: { doc: MetadataDocument; threshold: string; rule: string }) {
  return <>
    <Section number={1} heading="Einleitung">Dieser Leitfaden der {doc.namedEntity} erläutert die steuerliche Behandlung von Auslandseinsätzen. Er basiert auf {doc.citations}.</Section>
    <Section number={2} heading="Rechtliche Grundlage">Die steuerliche Behandlung richtet sich nach dem deutschen Einkommensteuergesetz sowie den einschlägigen Doppelbesteuerungsabkommen.</Section>
    <Section number={3} heading="Einkommensgrenze">{rule}<br /><br />Maßgeblicher Schwellenwert: <strong>{threshold}</strong></Section>
    <Section number={4} heading="Berechnungsbeispiel">Ein Mitarbeiter mit einem Jahreseinkommen von {doc.monetaryAmounts.toLocaleString('de-DE')} {doc.currency} unterliegt der regulären deutschen Steuerpflicht.</Section>
    <Section number={5} heading="Meldepflichten">Arbeitgeber sind verpflichtet, die zuständigen Finanzbehörden über bestehende Auslandseinsätze zu informieren.</Section>
    <Section number={6} heading="Gültigkeitsdauer">Dieser Leitfaden wurde am {doc.uploadedDate} veröffentlicht und gilt für das Steuerjahr {doc.year}.</Section>
  </>
}

function GenericSections({ doc }: { doc: MetadataDocument }) {
  const isHR = doc.domain === 'HR' || doc.domain === 'HR/Tax'
  const isTax = doc.domain === 'Tax' || doc.domain === 'HR/Tax'
  return <>
    <Section number={1} heading="Einleitung">Dieses Dokument von {doc.namedEntity} ({doc.namedEntityId}) befasst sich mit {doc.documentType}-Anforderungen im Bereich {doc.domain}. Rechtsgrundlage: {doc.citations !== '—' ? doc.citations : 'einschlägige gesetzliche Bestimmungen'}.</Section>
    <Section number={2} heading="Geltungsbereich">Die vorliegenden Regelungen gelten für alle betroffenen Mitarbeiter und Arbeitgeber in der Jurisdiktion {doc.jurisdiction !== '—' ? doc.jurisdiction : 'Deutschland'}. Der Geltungszeitraum beginnt am {doc.uploadedDate}.</Section>
    {isTax && <Section number={3} heading="Steuerliche Grundsätze">Die steuerlichen Pflichten orientieren sich an den geltenden Vorschriften gemäß {doc.citations !== '—' ? doc.citations : 'nationalem Steuerrecht'}. {doc.monetaryAmounts > 0 ? `Maßgeblicher Schwellenwert: ${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency} (${doc.monetaryTypes}).` : ''}</Section>}
    {isHR && <Section number={isTax ? 4 : 3} heading="HR-Regelungen">Arbeitgeber sind verpflichtet, die in diesem Dokument aufgeführten HR-Anforderungen einzuhalten und gegenüber den zuständigen Behörden nachzuweisen. {doc.monetaryAmounts > 0 ? `Relevante Beträge: ${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}.` : ''}</Section>}
    <Section number={isTax && isHR ? 5 : 4} heading="Dokumentationspflichten">Alle relevanten Unterlagen sind vollständig und fristgerecht einzureichen. Verstöße können zu behördlichen Sanktionen führen. Aufbewahrungsfrist: 10 Jahre.</Section>
    <Section number={isTax && isHR ? 6 : 5} heading="Inkrafttreten">Dieses Dokument tritt am {doc.uploadedDate} in Kraft und wird regelmäßig überprüft. Status: {doc.status}. Herausgeber: {doc.namedEntity} ({doc.namedEntityId}).</Section>
  </>
}
