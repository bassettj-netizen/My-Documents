import React, { useEffect, useRef, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { theme as antTheme } from 'antd'
import {
  ButtonGhost,
  ButtonPrimary,
  ButtonTertiary,
  buttonShapes,
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
  buttonVariants,
  Modal,
  Skeleton,
  skeletonVariants,
  Tabs,
  TextArea,
  Typography,
  useNotifications,
  toastPlacements,
  Spinner,
} from '@goat-ui/goat-ui-core'
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument } from '../bulk-edit/documents'

const { colorPalette, spacing, fontWeight } = constants
const TOP_BAR_BG = '#1e1f2e'
const SUMMARY_MAX = 500

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
type AiEditMode = 'entire' | 'section'
type AiEditResult = { original: string; suggested: string }
interface TaskState { status: TaskStatus; result: ReactNode | null }
interface SelectionPos { text: string; x: number; y: number; bottom: number }

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

function getDocumentContentFallback(doc: MetadataDocument): string {
  const snippet = DOCUMENT_SNIPPETS[doc._id]
  const base = snippet ?? `${doc.documentType} – ${doc.namedEntity}`
  return (
    base +
    '\n\nThis document applies to all employees and contractors engaged in cross-border activities. ' +
    'Compliance with these provisions is mandatory and applies in conjunction with applicable local ' +
    'legislation, collective agreements, and internal guidelines.\n\n' +
    `Document Type: ${doc.documentType} · Jurisdiction: ${doc.jurisdiction} · Domain: ${doc.domain} · ` +
    `Last Updated: ${new Date(doc.uploadedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  )
}

function simulateGptEdit(content: string, instruction: string): string {
  const lower = instruction.toLowerCase()
  if (lower.includes('summar')) {
    const sentences = content.split(/(?<=[.!?])\s+/)
    return sentences.slice(0, Math.max(2, Math.ceil(sentences.length / 3))).join(' ') +
      '\n\n[AI Summary: Content condensed to key points only]'
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
      .replace(/\bund\b/g, 'and').replace(/\bfür\b/g, 'for').replace(/\bmit\b/g, 'with')
      .replace(/\bvon\b/g, 'of').replace(/\bnach\b/g, 'to').replace(/\bauf\b/g, 'on').replace(/\bbei\b/g, 'at')
      + '\n\n[AI: Auto-translated to English — professional review recommended]'
  }
  if (lower.includes('grammar') || lower.includes('fix') || lower.includes('spelling')) {
    return content.replace(/\. ([a-z])/g, (_: string, c: string) => `. ${c.toUpperCase()}`).replace(/\s{2,}/g, ' ') +
      '\n\n[AI: Grammar and punctuation reviewed — corrections applied]'
  }
  return content + `\n\n[AI applied: "${instruction}" — please review and apply if appropriate]`
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CopilotIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.00078 10.687C6.5133 10.687 5.31067 9.48436 5.31067 7.99687C5.31067 6.50939 6.5133 5.30677 8.00078 5.30677C9.48826 5.30677 10.6909 6.50939 10.6909 7.99687C10.6909 9.48436 9.48826 10.687 8.00078 10.687ZM8.00078 6.09797C6.9564 6.09797 6.10188 6.9525 6.10188 7.99687C6.10188 9.04125 6.9564 9.89578 8.00078 9.89578C9.04516 9.89578 9.89969 9.04125 9.89969 7.99687C9.89969 6.9525 9.04516 6.09797 8.00078 6.09797ZM8.01662 15.181C6.38673 15.181 5.24739 13.9151 5.24739 12.1111C5.19991 11.0035 4.47199 10.7661 3.87067 10.7661C2.92122 10.7661 2.08254 10.4496 1.51287 9.86414C1.03814 9.37359 0.800781 8.72479 0.800781 7.99687C0.83243 5.9872 2.41485 5.24348 3.8865 5.22764C4.55111 5.22764 5.24739 4.8637 5.24739 3.88259C5.23155 2.03116 6.35505 0.796875 8.00078 0.796875C9.64651 0.796875 10.6909 1.99951 10.77 3.86677C10.8175 5.03775 11.6403 5.22764 12.1151 5.22764C13.5076 5.22764 15.1533 5.97136 15.2008 7.99687C15.2008 8.72479 14.9634 9.37359 14.4729 9.86414C13.9032 10.4338 13.0487 10.7661 12.1151 10.7661C11.5296 10.7661 10.8175 11.0035 10.7859 12.1111C10.7067 13.9784 9.63067 15.181 8.01662 15.181ZM6.02275 3.88259C6.02275 4.94282 5.37396 6.00304 3.8865 6.01885C3.20605 6.01885 1.62364 6.22458 1.59199 7.99687C1.59199 8.50326 1.75023 8.96217 2.08254 9.29447C2.49397 9.72173 3.14276 9.95906 3.87067 9.95906C5.15242 9.95906 5.97527 10.7819 6.03859 12.0637C6.03859 13.2188 6.65571 14.374 8.01662 14.374C9.3775 14.374 9.93133 13.5037 9.99461 12.0637C10.0421 10.7661 10.8649 9.95906 12.1151 9.94326C12.843 9.94326 13.4918 9.70589 13.919 9.27863C14.2513 8.93049 14.4254 8.48742 14.4096 7.98103C14.3779 6.16125 12.6373 6.00304 12.1151 6.00304C11.1182 6.00304 10.0421 5.43337 9.97881 3.88259C9.91549 2.44259 9.18761 1.57226 8.00078 1.57226C6.81396 1.57226 6.02275 2.47424 6.02275 3.86677V3.88259Z" fill="currentColor" stroke="currentColor" strokeWidth="0.2"/>
    </svg>
  )
}

function SparkleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2L9.2 5.8H13.2L10 8.1L11.2 11.9L8 9.6L4.8 11.9L6 8.1L2.8 5.8H6.8L8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="13" cy="3" r="1" fill="currentColor" opacity="0.6"/>
      <circle cx="3" cy="13" r="0.8" fill="currentColor" opacity="0.4"/>
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
        ['Entity', doc.namedEntity],
        ['Entity ID', doc.namedEntityId !== '—' ? doc.namedEntityId : '—'],
        ['Type', doc.documentType],
        ['Jurisdiction', doc.jurisdiction !== '—' ? doc.jurisdiction : '—'],
        ['Citations', doc.citations !== '—' ? doc.citations : '—'],
        ['Law type', doc.lawType !== '—' ? doc.lawType : '—'],
        ...(doc.monetaryAmounts > 0 ? [['Amount', `${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}`] as [string, string]] : []),
        ['Year', String(doc.year)],
        ['Uploaded', formatDate(doc.uploadedDate)],
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
      const isOk = doc.status === 'Approved'
      const isWarn = doc.status === 'Draft'
      const color = isOk ? '#16a34a' : isWarn ? '#ea580c' : '#dc2626'
      const message = isOk
        ? 'Document is approved and current. No compliance issues identified.'
        : isWarn
        ? 'Document is in draft status and requires review and approval before operational use.'
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
            <div key={r._id} onClick={() => window.open(`/my-documents/preview-tasks/version-9/${r._id}`, '_blank', 'noopener,noreferrer')} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <Typography size="base" color="primary-base">{r.name}</Typography>
              <Icon type={iconType.ExternalLinkOutlined} size={12} color="primary-base" />
            </div>
          ))}
        </div>
      )
    }
    case 'actions': {
      const actionMap: Partial<Record<string, string[]>> = {
        'HR Policy': [
          'Review policy with HR team and obtain sign-off from HR Director.',
          'Distribute to all affected employees and collect acknowledgment forms.',
          `Update employee records to reflect compliance with ${doc.citations}.`,
          `Schedule annual review for ${doc.year + 1}.`,
        ],
        'Tax Guidance': [
          'Share guidance with payroll team to ensure correct tax withholding.',
          `Review affected assignments against thresholds defined in ${doc.citations}.`,
          'File required notifications with the relevant tax authority by year-end.',
          `Consult advisor for cases approaching the ${doc.monetaryAmounts > 0 ? `${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}` : 'applicable'} threshold.`,
        ],
        'Compliance Guide': [
          'Conduct an internal audit against the compliance requirements listed.',
          'Identify employees at risk of creating a permanent establishment.',
          'Update A1 certificate tracking for all EU cross-border assignments.',
          'Report findings to compliance officer by end of quarter.',
        ],
      }
      const actions = actionMap[doc.documentType] ?? [
        `Review ${doc.name} with the relevant stakeholders.`,
        `Ensure all requirements under ${doc.citations !== '—' ? doc.citations : 'applicable law'} are met.`,
        `File documentation with appropriate authorities in ${doc.jurisdiction !== '—' ? doc.jurisdiction : 'applicable jurisdiction'}.`,
        `Schedule follow-up review for Q2 ${doc.year}.`,
      ]
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function PreviewTasksPreviewScreenV9() {
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
  const [activeTab, setActiveTab] = useState('details')
  const [textSelection, setTextSelection] = useState<SelectionPos | null>(null)
  const [inlineEditOpen, setInlineEditOpen] = useState(false)
  const [inlineEditHtml, setInlineEditHtml] = useState('')
  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>({})
  const [docHtmlOverride, setDocHtmlOverride] = useState<string | null>(null)
  const [editFocused, setEditFocused] = useState(false)

  // AI edit state
  const [aiEditMode, setAiEditMode] = useState<AiEditMode>('entire')
  const [aiEditInstruction, setAiEditInstruction] = useState('')
  const [aiEditSelectedText, setAiEditSelectedText] = useState('')
  const [aiEditIsGenerating, setAiEditIsGenerating] = useState(false)
  const [aiEditResult, setAiEditResult] = useState<AiEditResult | null>(null)

  const { token } = antTheme.useToken()

  const docBodyRef = useRef<HTMLDivElement>(null)
  const docContentRef = useRef<HTMLDivElement>(null)
  const selToolbarRef = useRef<HTMLDivElement>(null)
  const dialogEditRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)

  // Refs to read current tab/mode inside stable event listener
  const activeTabRef = useRef(activeTab)
  const aiEditModeRef = useRef(aiEditMode)
  useEffect(() => { activeTabRef.current = activeTab }, [activeTab])
  useEffect(() => { aiEditModeRef.current = aiEditMode }, [aiEditMode])

  const foundDoc = documents.find(d => d._id === id)

  useEffect(() => {
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(t)
  }, [id])

  useEffect(() => {
    setLocalDoc(null); setLocalSummary(null); setIsEditing(false); setIsSaving(false)
    setEditingName(''); setEditingDomain(''); setEditingCustomTags([])
    setEditingRemovedFields(new Set()); setEditingSummary(''); setTagInputVal('')
    setTextSelection(null); setInlineEditOpen(false); setInlineEditHtml('')
    setTaskStates({}); setDocHtmlOverride(null); savedRangeRef.current = null
    setAiEditMode('entire'); setAiEditInstruction(''); setAiEditSelectedText('')
    setAiEditIsGenerating(false); setAiEditResult(null)
  }, [id])

  useEffect(() => {
    const onMouseUp = () => {
      if (inlineEditOpen) return
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return
      if (!docBodyRef.current?.contains(sel.anchorNode)) { setTextSelection(null); return }
      const range = sel.getRangeAt(0)
      savedRangeRef.current = range.cloneRange()
      const rect = range.getBoundingClientRect()
      const frag = range.cloneContents()
      let selectedText = ''
      const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) selectedText += node.textContent ?? ''
        else if ((node as Element).tagName === 'BR') selectedText += '\n'
        else node.childNodes.forEach(walk)
      }
      walk(frag)

      // If the AI edit tab is active in "section" mode, capture for AI edit
      if (activeTabRef.current === 'ai-edit' && aiEditModeRef.current === 'section') {
        setAiEditSelectedText(selectedText.trim())
        setAiEditResult(null)
        return
      }

      // Otherwise show the regular floating toolbar
      setTextSelection({
        text: selectedText,
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
      })
    }
    const onMouseDown = (e: MouseEvent) => {
      if (selToolbarRef.current?.contains(e.target as Node)) return
      if (!docBodyRef.current?.contains(e.target as Node)) setTextSelection(null)
    }
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousedown', onMouseDown)
    return () => { document.removeEventListener('mouseup', onMouseUp); document.removeEventListener('mousedown', onMouseDown) }
  }, [inlineEditOpen])

  if (!foundDoc) return <Navigate to="/my-documents/preview-tasks/version-9" replace />

  const displayDoc = (localDoc?._id === foundDoc._id ? localDoc : null) ?? foundDoc
  const displaySummary = localSummary ?? DOCUMENT_SNIPPETS[displayDoc._id] ?? `${displayDoc.documentType} — ${displayDoc.domain}`
  const filename = `${displayDoc.name}.${displayDoc.fileFormat.toLowerCase()}`

  const startEdit = () => {
    setEditingName(displayDoc.name)
    setEditingDomain(displayDoc.domain)
    setEditingDocumentType(displayDoc.documentType)
    setEditingCustomTags(displayDoc.tagList ?? [])
    setEditingRemovedFields(new Set())
    setEditingSummary(displaySummary)
    setTagInputVal('')
    setIsEditing(true)
  }

  const saveEdit = () => {
    const updatedDoc: MetadataDocument = {
      ...displayDoc,
      name: editingName,
      domain: editingDomain,
      documentType: editingDocumentType,
      tagList: editingCustomTags,
      ...(editingRemovedFields.has('namedEntity')     && { namedEntity: '—' }),
      ...(editingRemovedFields.has('namedEntityId')   && { namedEntityId: '—' }),
      ...(editingRemovedFields.has('jurisdiction')    && { jurisdiction: '—' }),
      ...(editingRemovedFields.has('lawType')         && { lawType: '—' }),
      ...(editingRemovedFields.has('citations')       && { citations: '—' }),
      ...(editingRemovedFields.has('monetaryAmounts') && { monetaryAmounts: 0 }),
      ...(editingRemovedFields.has('monetaryTypes')   && { monetaryTypes: 'None' }),
    }
    setIsEditing(false)
    setIsSaving(true)
    setTimeout(() => {
      setLocalDoc(updatedDoc)
      setLocalSummary(editingSummary)
      setIsSaving(false)
      notification.success({ title: 'Document details updated successfully', placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
    }, 1000)
  }

  const cancelEdit = () => {
    setIsEditing(false); setEditingName(''); setEditingDomain(''); setEditingDocumentType('')
    setEditingCustomTags([]); setEditingRemovedFields(new Set()); setEditingSummary(''); setTagInputVal('')
  }

  const addTag = () => {
    const t = tagInputVal.trim()
    if (t && !editingCustomTags.some(tag => tag.text === t)) {
      setEditingCustomTags(prev => [...prev, { text: t, style: chipStyles.ACCENT_NEUTRAL, variant: chipVariants.HIGHLIGHT }])
    }
    setTagInputVal('')
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    if (isEditing) cancelEdit()
    // When leaving ai-edit tab, clear the selection hint
    if (key !== 'ai-edit') {
      setAiEditSelectedText('')
      setAiEditResult(null)
    }
  }

  const runTask = (taskId: string) => {
    setTaskStates(prev => ({ ...prev, [taskId]: { status: 'running', result: null } }))
    setTimeout(() => {
      setTaskStates(prev => ({ ...prev, [taskId]: { status: 'done', result: getMockResult(taskId as TaskId, displayDoc) } }))
    }, 1800)
  }

  // ─── AI edit handlers ────────────────────────────────────────────────────────

  const handleAiGenerate = () => {
    if (!aiEditInstruction.trim()) return
    if (aiEditMode === 'section' && !aiEditSelectedText) return

    const docText = docContentRef.current?.innerText?.trim() || getDocumentContentFallback(displayDoc)
    const original = aiEditMode === 'section' ? aiEditSelectedText : docText

    setAiEditIsGenerating(true)
    setAiEditResult(null)
    setTimeout(() => {
      setAiEditResult({ original, suggested: simulateGptEdit(original, aiEditInstruction) })
      setAiEditIsGenerating(false)
    }, 1600)
  }

  const handleAiApply = () => {
    setAiEditResult(null)
    setAiEditInstruction('')
    setAiEditSelectedText('')
    notification.success({
      title: 'Changes applied',
      placement: toastPlacements.BOTTOM_LEFT,
      duration: 4,
      content: <Typography size="base" color="neutral-darken5">AI edits applied to "{displayDoc.name}"</Typography>,
    })
  }

  // ─── Text selection toolbar actions ─────────────────────────────────────────

  const toolbarAboveY = (textSelection?.y ?? 0) - 52
  const showToolbarBelow = toolbarAboveY < 60
  const toolbarY = showToolbarBelow ? (textSelection?.bottom ?? 0) + 10 : toolbarAboveY
  const toolbarX = Math.max(200, Math.min((typeof window !== 'undefined' ? window.innerWidth : 1200) - 200, textSelection?.x ?? 0))

  useEffect(() => {
    if (inlineEditOpen && dialogEditRef.current) {
      dialogEditRef.current.innerHTML = inlineEditHtml
      dialogEditRef.current.focus()
      const sel = window.getSelection()
      const r = document.createRange()
      r.selectNodeContents(dialogEditRef.current)
      sel?.removeAllRanges()
      sel?.addRange(r)
    }
  }, [inlineEditOpen])

  const openInlineEdit = () => {
    if (!savedRangeRef.current) return
    const frag = savedRangeRef.current.cloneContents()
    const temp = document.createElement('div')
    temp.appendChild(frag)
    setInlineEditHtml(temp.innerHTML)
    setTextSelection(null)
    setInlineEditOpen(true)
  }

  const closeInlineEdit = () => {
    setInlineEditOpen(false)
    setEditFocused(false)
    savedRangeRef.current = null
  }

  const saveInlineEdit = () => {
    if (savedRangeRef.current && docContentRef.current && dialogEditRef.current) {
      const range = savedRangeRef.current
      range.deleteContents()
      const temp = document.createElement('div')
      temp.innerHTML = dialogEditRef.current.innerHTML
      const frag = document.createDocumentFragment()
      while (temp.firstChild) frag.appendChild(temp.firstChild)
      range.insertNode(frag)
      window.getSelection()?.removeAllRanges()
      savedRangeRef.current = null
      setDocHtmlOverride(docContentRef.current.innerHTML)
    }
    notification.success({ title: 'Text updated successfully', placement: toastPlacements.BOTTOM_LEFT, duration: 3 })
    setInlineEditOpen(false)
  }

  const selectionAction = (action: string) => {
    if (action === 'edit') { openInlineEdit(); return }
    if (action === 'ai-edit') {
      // Switch to AI edit tab with the selected text pre-populated as a section
      setAiEditSelectedText(textSelection?.text ?? '')
      setAiEditMode('section')
      setAiEditResult(null)
      setActiveTab('ai-edit')
      setTextSelection(null)
      return
    }
    const labels: Record<string, string> = { crossref: 'Cross-referencing…', copilot: 'Sent to CoPilot' }
    const short = (textSelection?.text ?? '').slice(0, 40)
    notification.default({
      title: labels[action] ?? action,
      content: <Typography size="base" color="neutral-darken5">"{short}"</Typography>,
      placement: toastPlacements.BOTTOM_RIGHT,
      duration: 4,
    })
    setTextSelection(null)
  }

  // ─── Tabs ────────────────────────────────────────────────────────────────────

  const isAiEditTabActive = activeTab === 'ai-edit'
  const isAiSectionMode = isAiEditTabActive && aiEditMode === 'section'

  const tabs = [
    {
      key: 'details',
      label: 'Details',
      content: (
        <div style={{ paddingTop: 16 }}>
          {isSaving
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
      ),
    },
    {
      key: 'tasks',
      label: 'Tasks',
      content: (
        <div style={{ paddingTop: 16 }}>
          <TasksPanel taskStates={taskStates} onRun={runTask} />
        </div>
      ),
    },
    {
      key: 'ai-edit',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <SparkleIcon size={13} />
          Edit with AI
        </span>
      ),
      content: (
        <div style={{ paddingTop: 16 }}>
          <AiEditPanel
            mode={aiEditMode}
            onModeChange={(m) => { setAiEditMode(m); setAiEditSelectedText(''); setAiEditResult(null) }}
            instruction={aiEditInstruction}
            onInstructionChange={(v) => { setAiEditInstruction(v); setAiEditResult(null) }}
            selectedText={aiEditSelectedText}
            onClearSelection={() => { setAiEditSelectedText(''); setAiEditResult(null) }}
            isGenerating={aiEditIsGenerating}
            result={aiEditResult}
            canGenerate={!!aiEditInstruction.trim() && (aiEditMode === 'entire' || !!aiEditSelectedText) && !aiEditIsGenerating}
            onGenerate={handleAiGenerate}
            onApply={handleAiApply}
            onDiscard={() => setAiEditResult(null)}
          />
        </div>
      ),
    },
  ]

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
            flex: '0 0 62%',
            backgroundColor: colorPalette.white,
            borderRadius: 8,
            padding: '32px 40px',
            minHeight: 640,
            // Subtle blue glow when user should select text for AI edit
            outline: isAiSectionMode ? `2px solid ${colorPalette.blue.base}` : 'none',
            outlineOffset: -1,
            transition: 'outline-color 0.2s ease',
          }}
        >
          {/* Section selection hint overlay */}
          {isAiSectionMode && !aiEditSelectedText && (
            <div style={{
              position: 'sticky',
              top: 8,
              zIndex: 10,
              backgroundColor: '#EFF6FF',
              border: `1px solid ${colorPalette.blue.base}`,
              borderRadius: 6,
              padding: `${spacing(2)}px ${spacing(3)}px`,
              marginBottom: spacing(4),
              display: 'flex',
              alignItems: 'center',
              gap: spacing(2),
            }}>
              <SparkleIcon size={14} />
              <Typography size="base-sm" color="primary-base">
                Select text below to define the section you want to edit with AI
              </Typography>
            </div>
          )}
          {isAiSectionMode && aiEditSelectedText && (
            <div style={{
              position: 'sticky',
              top: 8,
              zIndex: 10,
              backgroundColor: '#F0FDF4',
              border: '1px solid #86EFAC',
              borderRadius: 6,
              padding: `${spacing(2)}px ${spacing(3)}px`,
              marginBottom: spacing(4),
              display: 'flex',
              alignItems: 'center',
              gap: spacing(2),
            }}>
              <SparkleIcon size={14} />
              <Typography size="base-sm" color="neutral-darken5">
                Section selected — set your instructions in the panel on the right
              </Typography>
            </div>
          )}
          {isLoading
            ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '60%' }} paragraph={{ rows: 16 }} />
            : docHtmlOverride !== null
            ? <div ref={docContentRef} dangerouslySetInnerHTML={{ __html: docHtmlOverride }} />
            : <div ref={docContentRef}><DocumentBody doc={displayDoc} /></div>
          }
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="preview-right-panel" style={{ backgroundColor: colorPalette.white, borderRadius: 8, padding: `${spacing(2)}px ${spacing(4)}px ${spacing(4)}px` }}>
            {isLoading
              ? <div style={{ padding: '24px 0' }}><Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 10 }} /></div>
              : <Tabs options={tabs} activeKey={activeTab} onChange={handleTabChange} />
            }
          </div>
        </div>
      </div>

      {/* Text selection toolbar — shown when text is selected outside AI-edit section mode */}
      {textSelection && !inlineEditOpen && (
        <div
          ref={selToolbarRef}
          style={{
            position: 'fixed',
            left: toolbarX,
            top: toolbarY,
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: colorPalette.white,
            borderRadius: 8,
            padding: '3px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
            border: '1px solid #e5e7eb',
            userSelect: 'none',
          }}
        >
          <ButtonGhost leftIcon={iconType.EditOutlined} onClick={() => selectionAction('edit')}>Edit</ButtonGhost>
          <ButtonGhost leftIcon={iconType.ArrowSwapOutlined} onClick={() => selectionAction('crossref')}>Cross-reference</ButtonGhost>
          <ButtonGhost onClick={() => selectionAction('ai-edit')}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2) }}>
              <SparkleIcon size={14} />
              Edit with AI
            </span>
          </ButtonGhost>
          <ButtonGhost onClick={() => selectionAction('copilot')}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />Ask CoPilot<Icon type={iconType.ExternalLinkOutlined} size={16} /></span>
          </ButtonGhost>
        </div>
      )}

      {/* Inline edit modal */}
      <style>{`
        .ant-modal.goat-edit-selection-modal { margin-top: ${spacing(6)}px !important; margin-bottom: ${spacing(6)}px !important; }
        .preview-right-panel .ant-tabs-nav { border-bottom: 1px solid ${colorPalette.neutral.lighten3} !important; margin-bottom: 0 !important; }
        .preview-right-panel .ant-tabs-nav::before { border-bottom-color: ${colorPalette.neutral.lighten3} !important; }
      `}</style>
      <Modal
        visible={inlineEditOpen}
        title="Edit Selection"
        onClose={closeInlineEdit}
        withIcon={false}
        minWidth={520}
        className="goat-edit-selection-modal"
        footer={{
          buttons: [
            { variant: buttonVariants.TERTIARY, props: { children: 'Cancel', onClick: closeInlineEdit } },
            { variant: buttonVariants.PRIMARY, props: { children: 'Save', onClick: saveInlineEdit } },
          ],
        }}
      >
        <div
          ref={dialogEditRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setEditFocused(true)}
          onBlur={() => setEditFocused(false)}
          style={{
            minHeight: 80,
            padding: `${spacing(2)}px ${spacing(3)}px`,
            border: `1px solid ${editFocused ? token.colorPrimary : colorPalette.neutral.lighten2}`,
            borderRadius: 6,
            outline: 'none',
            fontFamily: "'Open Sans', sans-serif",
            lineHeight: 1.8,
            fontSize: 14,
            color: colorPalette.neutral.darken5,
            cursor: 'text',
            boxShadow: editFocused ? `0 0 0 ${token.controlOutlineWidth}px ${token.controlOutline}` : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        />
      </Modal>
    </div>
  )
}

// ─── AI Edit panel ────────────────────────────────────────────────────────────

function AiEditPanel({
  mode, onModeChange, instruction, onInstructionChange,
  selectedText, onClearSelection, isGenerating, result,
  canGenerate, onGenerate, onApply, onDiscard,
}: {
  mode: AiEditMode
  onModeChange: (m: AiEditMode) => void
  instruction: string
  onInstructionChange: (v: string) => void
  selectedText: string
  onClearSelection: () => void
  isGenerating: boolean
  result: AiEditResult | null
  canGenerate: boolean
  onGenerate: () => void
  onApply: () => void
  onDiscard: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>

      {/* Scope toggle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
        <Typography size="base" weight={fontWeight.BOLD} color="neutral-darken5">Scope</Typography>
        <div style={{ display: 'flex', gap: spacing(2) }}>
          {(['entire', 'section'] as AiEditMode[]).map(m => (
            <div
              key={m}
              onClick={() => onModeChange(m)}
              style={{
                flex: 1,
                padding: `${spacing(2)}px ${spacing(2)}px`,
                border: `1.5px solid ${mode === m ? colorPalette.blue.base : '#e5e7eb'}`,
                borderRadius: 6,
                cursor: 'pointer',
                backgroundColor: mode === m ? '#EFF6FF' : colorPalette.white,
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <Typography
                size="base-sm"
                color={mode === m ? 'primary-base' : 'neutral-darken3'}
                weight={mode === m ? fontWeight.BOLD : fontWeight.REGULAR}
              >
                {m === 'entire' ? 'Entire document' : 'Selected section'}
              </Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Section selection state */}
      {mode === 'section' && (
        <>
          {!selectedText ? (
            <div style={{
              border: '1px dashed #93C5FD',
              borderRadius: 6,
              padding: spacing(3),
              backgroundColor: '#F8FAFF',
              display: 'flex',
              alignItems: 'flex-start',
              gap: spacing(2),
            }}>
              <Icon type={iconType.InfoCircleOutlined} size={16} color="primary-base" />
              <Typography size="base-sm" color="neutral-darken3">
                Select text in the document to define a section, or use "Edit with AI" from the text selection toolbar.
              </Typography>
            </div>
          ) : (
            <div style={{
              border: '1.5px solid #86EFAC',
              borderRadius: 6,
              padding: spacing(3),
              backgroundColor: '#F0FDF4',
              display: 'flex',
              flexDirection: 'column',
              gap: spacing(2),
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography size="base-sm" weight={fontWeight.BOLD} color="neutral-darken5">Selected section</Typography>
                <ButtonGhost size="small" leftIcon={iconType.CrossOutlined} onClick={onClearSelection} />
              </div>
              <Typography size="base-sm" color="neutral-darken5" maxLines={3}>
                "{selectedText}"
              </Typography>
            </div>
          )}
        </>
      )}

      {/* Quick actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
        <Typography size="base" weight={fontWeight.BOLD} color="neutral-darken5">Quick actions</Typography>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(1) }}>
          {QUICK_ACTIONS.map(action => {
            const active = instruction === action.instruction
            return (
              <div
                key={action.label}
                onClick={() => onInstructionChange(action.instruction)}
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
          value={instruction}
          onChange={e => onInstructionChange(e.target.value)}
          placeholder="Describe what you'd like to change or improve…"
          rows={3}
        />
      </div>

      {/* Generate button */}
      <ButtonPrimary disabled={!canGenerate} onClick={onGenerate}>
        {isGenerating ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Spinner size="small" />
            Generating…
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <SparkleIcon size={14} />
            Generate with AI
          </span>
        )}
      </ButtonPrimary>

      {/* Diff result */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3), borderTop: '1px solid #e5e7eb', paddingTop: spacing(4) }}>
          <Typography size="base" weight={fontWeight.BOLD} color="neutral-darken5">Suggested changes</Typography>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#FCA5A5', flexShrink: 0 }} />
              <Typography size="base-sm" weight={fontWeight.BOLD} color="neutral-darken3">Before</Typography>
            </div>
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 6,
              padding: spacing(3),
              maxHeight: 140,
              overflowY: 'auto',
              fontSize: 12,
              lineHeight: '1.6',
              color: colorPalette.neutral.darken5,
              whiteSpace: 'pre-wrap',
            }}>
              {result.original}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#86EFAC', flexShrink: 0 }} />
              <Typography size="base-sm" weight={fontWeight.BOLD} color="neutral-darken3">After</Typography>
            </div>
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 6,
              padding: spacing(3),
              maxHeight: 140,
              overflowY: 'auto',
              fontSize: 12,
              lineHeight: '1.6',
              color: colorPalette.neutral.darken5,
              whiteSpace: 'pre-wrap',
            }}>
              {result.suggested}
            </div>
          </div>

          <div style={{ display: 'flex', gap: spacing(2) }}>
            <div style={{ flex: 1 }}>
              <ButtonTertiary leftIcon={iconType.CrossOutlined} onClick={onDiscard}>Discard</ButtonTertiary>
            </div>
            <ButtonPrimary leftIcon={iconType.EditRecOutlined} onClick={onApply}>Apply</ButtonPrimary>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tasks panel ──────────────────────────────────────────────────────────────

function TasksPanel({ taskStates, onRun }: { taskStates: Record<string, TaskState>; onRun: (taskId: string) => void }) {
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
        {isDone && (
          <div style={{ flexShrink: 0 }}>
            <ButtonTertiary shape={buttonShapes.SQUARE} leftIcon={iconType.RefreshOutlined} onClick={e => { e.stopPropagation(); onRun(task.id) }} />
          </div>
        )}
      </div>
      {isRunning && <div style={{ padding: '0 14px 14px' }}><Skeleton variant={skeletonVariants.TEXT} paragraph={{ rows: 3 }} /></div>}
      {isDone && state?.result && <div style={{ padding: '14px 14px 14px', borderTop: '1px solid #ede9fe' }}>{state.result}</div>}
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
  displayDoc, editingName, setEditingName: _setEditingName,
  editingDomain: _editingDomain, setEditingDomain: _setEditingDomain,
  editingDocumentType, setEditingDocumentType,
  editingCustomTags, setEditingCustomTags, editingRemovedFields, setEditingRemovedFields,
  editingSummary, setEditingSummary, tagInputVal, setTagInputVal, addTag, onSave, onCancel,
}: {
  displayDoc: MetadataDocument
  editingName: string; setEditingName: (_v: string) => void
  editingDomain: string; setEditingDomain: (v: string) => void
  editingDocumentType: string; setEditingDocumentType: (v: string) => void
  editingCustomTags: Tag[]; setEditingCustomTags: React.Dispatch<React.SetStateAction<Tag[]>>
  editingRemovedFields: Set<string>; setEditingRemovedFields: React.Dispatch<React.SetStateAction<Set<string>>>
  editingSummary: string; setEditingSummary: (v: string) => void
  tagInputVal: string; setTagInputVal: (v: string) => void
  addTag: () => void; onSave: () => void; onCancel: () => void
}) {
  const removeField = (key: string) => setEditingRemovedFields(prev => new Set(prev).add(key))
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(3) }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">Document Details</Typography>
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonTertiary onClick={onCancel}>Cancel</ButtonTertiary>
          <ButtonPrimary onClick={onSave}>Save</ButtonPrimary>
        </div>
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
