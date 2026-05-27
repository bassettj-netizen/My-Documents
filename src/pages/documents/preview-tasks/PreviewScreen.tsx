import React, { useEffect, useRef, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
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
  iconType,
  Input,
  PropertyItem,
  propertyItemVariants,
  Select,
  Skeleton,
  skeletonVariants,
  Spinner,
  Tabs,
  TextArea,
  Tooltip,
  Typography,
  useNotifications,
  toastPlacements,
} from '@goat-ui/goat-ui-core'
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument } from '../bulk-edit/documents'

const { colorPalette } = constants
const TOP_BAR_BG = '#1e1f2e'
const SUMMARY_MAX = 500

const DOMAIN_OPTIONS = [
  { label: 'HR', value: 'HR' },
  { label: 'HR/Tax', value: 'HR/Tax' },
  { label: 'Tax', value: 'Tax' },
]

type Tag = { text: string; style: string; variant?: string }
type TaskId = 'summarise' | 'extract' | 'compliance' | 'translate' | 'related' | 'actions'
type TaskStatus = 'idle' | 'running' | 'done'
interface TaskState { status: TaskStatus; result: ReactNode | null }
interface SelectionPos { text: string; x: number; y: number; bottom: number }

const PROP_LABEL = { size: 'base' as const, color: 'neutral-darken2' as const, width: '130px' }
const PROP_VALUE = { size: 'base' as const, color: 'neutral-darken5' as const }

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

function PropRow({ children }: { children: ReactNode }) {
  return <div style={{ padding: '6px 0' }}>{children}</div>
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconSummarise() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1.5" y="1.5" width="12" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="1.5" y="5" width="9" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="1.5" y="8.5" width="10.5" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="1.5" y="12" width="6" height="1.6" rx="0.8" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function IconExtract() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="1" width="13" height="3.2" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="5.9" width="13" height="3.2" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="10.8" width="13" height="3.2" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function IconCompliance() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1.5L2 4v4.5c0 3 2.2 5.5 5.5 6.5 3.3-1 5.5-3.5 5.5-6.5V4L7.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5 7.5l1.8 1.8 3.2-3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTranslate() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="7.5" cy="7.5" rx="2.8" ry="6" stroke="currentColor" strokeWidth="1.2" />
      <line x1="1.5" y1="7.5" x2="13.5" y2="7.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function IconRelated() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="3.5" cy="7.5" r="2.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11.5" cy="3.5" r="1.8" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11.5" cy="11.5" r="1.8" stroke="currentColor" strokeWidth="1.2" />
      <line x1="5.6" y1="6.6" x2="9.8" y2="4.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5.6" y1="8.4" x2="9.8" y2="10.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function IconActions() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="1" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 7.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCrossRef() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M6.5 2H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9 2h4v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="13" y1="2" x2="7" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function IconAnnotate() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 11.5l2-2L10.5 3l2 2L6 11.5l-2 2H2v-2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8.5" y1="3.5" x2="11.5" y2="6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function IconCopy() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 10.5V3a1 1 0 011-1h6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function IconChevronDown({ rotated = false }: { rotated?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ transition: 'transform 0.2s', transform: rotated ? 'rotate(180deg)' : 'none', display: 'block' }}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Task definitions & mock results ─────────────────────────────────────────

const TASK_DEFS: Array<{ id: TaskId; label: string; description: string; icon: ReactNode }> = [
  { id: 'summarise',  label: 'Summarise Document',   description: 'Generate a concise AI summary of the document content.',          icon: <IconSummarise /> },
  { id: 'extract',   label: 'Extract Key Data',      description: 'Extract entities, dates, amounts and legal citations.',          icon: <IconExtract /> },
  { id: 'compliance',label: 'Check Compliance',      description: 'Verify regulatory compliance status and identify gaps.',          icon: <IconCompliance /> },
  { id: 'translate', label: 'Translate to English',  description: 'Produce an English translation of the full document.',            icon: <IconTranslate /> },
  { id: 'related',   label: 'Find Related Documents',description: 'Identify similar documents across your library.',                icon: <IconRelated /> },
  { id: 'actions',   label: 'Generate Action Items', description: 'Create a prioritised list of required actions from this document.',icon: <IconActions /> },
]

function getMockResult(taskId: TaskId, doc: MetadataDocument): ReactNode {
  const gap8 = { display: 'flex', flexDirection: 'column' as const, gap: 8 }

  switch (taskId) {
    case 'summarise':
      return (
        <div style={gap8}>
          <Typography size="base-sm" color="neutral-darken2">AI SUMMARY</Typography>
          <Typography size="base" color="neutral-darken5">
            {DOCUMENT_SNIPPETS[doc._id] ?? `${doc.documentType} published by ${doc.namedEntity}, covering ${doc.domain} obligations under ${doc.citations} in ${doc.jurisdiction}.`}
          </Typography>
        </div>
      )

    case 'extract': {
      const rows: [string, string][] = [
        ['Entity', doc.namedEntity],
        ['Entity ID', doc.namedEntityId !== '—' ? doc.namedEntityId : '—'],
        ['Type', doc.documentType],
        ['Jurisdiction', doc.jurisdiction !== '—' ? doc.jurisdiction : '—'],
        ['Citations', doc.citations !== '—' ? doc.citations : '—'],
        ['Law type', doc.lawType !== '—' ? doc.lawType : '—'],
        ...(doc.monetaryAmounts > 0 ? [['Amount', `${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency} — ${doc.monetaryTypes}`] as [string, string]] : []),
        ['Year', String(doc.year)],
        ['Uploaded', formatDate(doc.uploadedDate)],
      ]
      return (
        <div style={gap8}>
          {rows.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 88, flexShrink: 0 }}>
                <Typography size="base-sm" color="neutral-darken2">{label}</Typography>
              </div>
              <Typography size="base-sm" color="neutral-darken5">{value}</Typography>
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
          {doc.citations !== '—' && (
            <Typography size="base-sm" color="neutral-darken2">Applicable regulation: {doc.citations}</Typography>
          )}
        </div>
      )
    }

    case 'translate': {
      const map: Partial<Record<string, string>> = {
        'HR Policy': `This HR policy by ${doc.namedEntity} governs conditions for international employee assignments, including relocation allowances, social security obligations, and applicable requirements under ${doc.citations}.`,
        'Tax Guidance': `This tax guidance from ${doc.namedEntity} explains the tax treatment of international assignments under ${doc.citations}, covering withholding obligations and applicable thresholds in ${doc.jurisdiction}.`,
        'Compliance Guide': `This compliance guide by ${doc.namedEntity} outlines regulatory requirements for cross-border employment under ${doc.citations}, covering risk exposure and recommended procedures.`,
        'Payroll Tax Guidance': `This payroll tax guidance from ${doc.namedEntity} describes employer withholding obligations for international assignments under ${doc.citations}.`,
        'Tax Treaty Guide': `This guide from ${doc.namedEntity} explains the provisions of the double taxation agreement (${doc.citations}), covering income allocation and residence determination rules.`,
        'Analytical Report': `This analytical report by ${doc.namedEntity} examines the tax and HR implications of temporary employee transfers, with a total cost impact of ${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}.`,
      }
      const translated = map[doc.documentType] ?? `English translation of: ${doc.name}. Document type: ${doc.documentType}. Published by ${doc.namedEntity} covering ${doc.domain} matters.`
      return (
        <div style={gap8}>
          <Typography size="base-sm" color="neutral-darken2">ENGLISH TRANSLATION (excerpt)</Typography>
          <Typography size="base" color="neutral-darken5">{translated}</Typography>
        </div>
      )
    }

    case 'related': {
      const related = documents.filter(d => d._id !== doc._id && d.domain === doc.domain).slice(0, 3)
      return (
        <div style={gap8}>
          <Typography size="base-sm" color="neutral-darken2">RELATED DOCUMENTS ({related.length} found)</Typography>
          {related.length === 0
            ? <Typography size="base" color="neutral-darken2">No closely related documents found.</Typography>
            : related.map(r => (
              <div key={r._id} style={{ padding: '8px 12px', backgroundColor: '#f8f9fd', borderRadius: 6 }}>
                <Typography size="base-sm" weight="semibold" color="neutral-darken5">{r.name}</Typography>
                <Typography size="base-sm" color="neutral-darken2">{r.documentType} · {r.namedEntity}</Typography>
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
              <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                <Typography size="base-sm" color="neutral-darken5">{i + 1}</Typography>
              </div>
              <Typography size="base" color="neutral-darken5">{action}</Typography>
            </div>
          ))}
        </div>
      )
    }

    default:
      return <Typography>No result available.</Typography>
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PreviewTasksPreviewScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notification } = useNotifications()

  const [isLoading, setIsLoading] = useState(true)
  const [localDoc, setLocalDoc] = useState<MetadataDocument | null>(null)
  const [localSummary, setLocalSummary] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingDomain, setEditingDomain] = useState('')
  const [editingCustomTags, setEditingCustomTags] = useState<Tag[]>([])
  const [editingRemovedFields, setEditingRemovedFields] = useState<Set<string>>(new Set())
  const [editingSummary, setEditingSummary] = useState('')
  const [tagInputVal, setTagInputVal] = useState('')
  const [activeTab, setActiveTab] = useState('details')
  const [textSelection, setTextSelection] = useState<SelectionPos | null>(null)
  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>({})
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const docBodyRef = useRef<HTMLDivElement>(null)
  const selToolbarRef = useRef<HTMLDivElement>(null)

  const foundDoc = documents.find(d => d._id === id)

  useEffect(() => {
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(t)
  }, [id])

  useEffect(() => {
    setLocalDoc(null); setLocalSummary(null); setIsEditing(false)
    setEditingDomain(''); setEditingCustomTags([]); setEditingRemovedFields(new Set())
    setEditingSummary(''); setTagInputVal(''); setTextSelection(null)
    setTaskStates({}); setExpandedTasks(new Set())
  }, [id])

  useEffect(() => {
    const onMouseUp = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return
      if (!docBodyRef.current?.contains(sel.anchorNode)) { setTextSelection(null); return }
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setTextSelection({
        text: sel.toString().trim().slice(0, 200),
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
  }, [])

  if (!foundDoc) return <Navigate to="/my-documents/preview-tasks/version-1" replace />

  const displayDoc = (localDoc?._id === foundDoc._id ? localDoc : null) ?? foundDoc
  const displaySummary = localSummary ?? DOCUMENT_SNIPPETS[displayDoc._id] ?? `${displayDoc.documentType} — ${displayDoc.domain}`
  const filename = `${displayDoc.name}.${displayDoc.fileFormat.toLowerCase()}`

  const startEdit = () => {
    setEditingDomain(displayDoc.domain)
    setEditingCustomTags(displayDoc.tagList ?? [])
    setEditingRemovedFields(new Set())
    setEditingSummary(displaySummary)
    setTagInputVal('')
    setIsEditing(true)
  }

  const saveEdit = () => {
    setLocalDoc({
      ...displayDoc, domain: editingDomain, tagList: editingCustomTags,
      ...(editingRemovedFields.has('namedEntity')     && { namedEntity: '—' }),
      ...(editingRemovedFields.has('namedEntityId')   && { namedEntityId: '—' }),
      ...(editingRemovedFields.has('jurisdiction')    && { jurisdiction: '—' }),
      ...(editingRemovedFields.has('lawType')         && { lawType: '—' }),
      ...(editingRemovedFields.has('citations')       && { citations: '—' }),
      ...(editingRemovedFields.has('monetaryAmounts') && { monetaryAmounts: 0 }),
      ...(editingRemovedFields.has('monetaryTypes')   && { monetaryTypes: 'None' }),
    })
    setLocalSummary(editingSummary)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false); setEditingDomain(''); setEditingCustomTags([])
    setEditingRemovedFields(new Set()); setEditingSummary(''); setTagInputVal('')
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
  }

  const runTask = (taskId: string) => {
    setTaskStates(prev => ({ ...prev, [taskId]: { status: 'running', result: null } }))
    setExpandedTasks(prev => new Set(prev).add(taskId))
    setTimeout(() => {
      setTaskStates(prev => ({ ...prev, [taskId]: { status: 'done', result: getMockResult(taskId as TaskId, displayDoc) } }))
    }, 1800)
  }

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId); else next.add(taskId)
      return next
    })
  }

  const selectionAction = (action: string) => {
    const text = textSelection?.text ?? ''
    const short = text.length > 40 ? text.slice(0, 40) + '…' : text
    if (action === 'copy') {
      navigator.clipboard.writeText(text).catch(() => {})
      notification.success({ title: 'Copied to clipboard', placement: toastPlacements.BOTTOM_RIGHT, duration: 3 })
      return
    }
    const labels: Record<string, string> = {
      edit: 'Edit task created',
      crossref: 'Cross-referencing',
      copilot: 'Sent to CoPilot',
      annotate: 'Annotation added',
    }
    notification.default({
      title: labels[action] ?? action,
      content: <Typography size="base" color="neutral-darken5">"{short}"</Typography>,
      placement: toastPlacements.BOTTOM_RIGHT,
      duration: 4,
    })
  }

  const toolbarAboveY = (textSelection?.y ?? 0) - 52
  const showToolbarBelow = toolbarAboveY < 60
  const toolbarY = showToolbarBelow ? (textSelection?.bottom ?? 0) + 10 : toolbarAboveY
  const toolbarX = Math.max(100, Math.min((typeof window !== 'undefined' ? window.innerWidth : 1200) - 100, textSelection?.x ?? 0))

  const tabs = [
    {
      key: 'details',
      label: 'Details',
      content: (
        <div style={{ paddingTop: 16 }}>
          {isEditing
            ? <EditPanel
                displayDoc={displayDoc}
                editingDomain={editingDomain} setEditingDomain={setEditingDomain}
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
      label: 'AI Tasks',
      content: (
        <div style={{ paddingTop: 16 }}>
          <TasksPanel
            doc={displayDoc}
            taskStates={taskStates}
            expandedTasks={expandedTasks}
            onRun={runTask}
            onToggle={toggleExpand}
          />
        </div>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F5F9FF' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: TOP_BAR_BG, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <ButtonGhost mode="contrast" leftIcon={iconType.ChevronLeftOutlined} onClick={() => navigate(-1)}>Back</ButtonGhost>
        <Typography weight="bold" color="white">{filename}</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ButtonTertiary mode="contrast" rightIcon={iconType.ExternalLinkOutlined}>Ask CoPilot</ButtonTertiary>
          <Dropdown
            items={[
              { key: 'edit', label: 'Edit document info', onClick: startEdit },
              { key: 'download', label: 'Download', onClick: () => {} },
              { key: 'delete', label: 'Delete', onClick: () => {} },
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
        {/* Document body — text selection is captured here */}
        <div
          ref={docBodyRef}
          style={{ flex: '0 0 62%', backgroundColor: colorPalette.white, borderRadius: 8, padding: '32px 40px', minHeight: 640 }}
        >
          {isLoading
            ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '60%' }} paragraph={{ rows: 16 }} />
            : <DocumentBody doc={displayDoc} />}
        </div>

        {/* Right panel — tabs */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ backgroundColor: colorPalette.white, borderRadius: 8, padding: '0 24px 24px' }}>
            {isLoading
              ? <div style={{ padding: '24px 0' }}><Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 10 }} /></div>
              : <Tabs options={tabs} activeKey={activeTab} onChange={handleTabChange} />
            }
          </div>
        </div>
      </div>

      {/* Text selection floating toolbar */}
      {textSelection && (
        <div
          ref={selToolbarRef}
          style={{
            position: 'fixed',
            left: toolbarX,
            top: toolbarY,
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: TOP_BAR_BG,
            borderRadius: 8,
            padding: '4px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.32)',
            userSelect: 'none',
          }}
        >
          <Tooltip title="Edit Task">
            <ButtonGhost mode="contrast" shape={buttonShapes.SQUARE} leftIcon={iconType.EditOutlined} onClick={() => selectionAction('edit')} />
          </Tooltip>
          <Tooltip title="Cross-reference">
            <ButtonGhost mode="contrast" shape={buttonShapes.SQUARE} onClick={() => selectionAction('crossref')}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}><IconCrossRef /></span>
            </ButtonGhost>
          </Tooltip>
          <Tooltip title="Send to CoPilot">
            <ButtonGhost mode="contrast" shape={buttonShapes.SQUARE} leftIcon={iconType.ExternalLinkOutlined} onClick={() => selectionAction('copilot')} />
          </Tooltip>
          <Tooltip title="Annotate">
            <ButtonGhost mode="contrast" shape={buttonShapes.SQUARE} onClick={() => selectionAction('annotate')}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}><IconAnnotate /></span>
            </ButtonGhost>
          </Tooltip>
          <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 2px' }} />
          <Tooltip title="Copy">
            <ButtonGhost mode="contrast" shape={buttonShapes.SQUARE} onClick={() => selectionAction('copy')}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}><IconCopy /></span>
            </ButtonGhost>
          </Tooltip>

          {/* Caret pointer */}
          {!showToolbarBelow && (
            <div style={{
              position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
              borderTop: `6px solid ${TOP_BAR_BG}`,
            }} />
          )}
          {showToolbarBelow && (
            <div style={{
              position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
              borderBottom: `6px solid ${TOP_BAR_BG}`,
            }} />
          )}
        </div>
      )}
    </div>
  )
}

// ─── AI Tasks panel ───────────────────────────────────────────────────────────

function TasksPanel({ doc, taskStates, expandedTasks, onRun, onToggle }: {
  doc: MetadataDocument
  taskStates: Record<string, TaskState>
  expandedTasks: Set<string>
  onRun: (taskId: string) => void
  onToggle: (taskId: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ marginBottom: 4 }}>
        <Typography size="base-sm" color="neutral-darken2">Run AI tasks on <strong>{doc.name}</strong></Typography>
      </div>
      {TASK_DEFS.map(task => {
        const state = taskStates[task.id]
        const isRunning = state?.status === 'running'
        const isDone = state?.status === 'done'
        const isExpanded = expandedTasks.has(task.id)

        return (
          <div key={task.id} style={{
            border: `1px solid ${isDone ? '#c7d2fe' : '#e5e7eb'}`,
            borderRadius: 8,
            overflow: 'hidden',
            transition: 'border-color 0.2s',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
              backgroundColor: isDone ? '#f5f3ff' : colorPalette.white,
            }}>
              <div style={{ color: isDone ? '#7c3aed' : '#6b7280', flexShrink: 0 }}>
                {task.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Typography size="base" weight="semibold" color="neutral-darken5">{task.label}</Typography>
                <Typography size="base-sm" color="neutral-darken2">{task.description}</Typography>
              </div>
              <div style={{ flexShrink: 0, display: 'flex', gap: 6, alignItems: 'center' }}>
                {isRunning
                  ? <Spinner size="small" />
                  : isDone
                  ? <>
                      <ButtonGhost shape={buttonShapes.SQUARE} onClick={() => onToggle(task.id)}>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <IconChevronDown rotated={isExpanded} />
                        </span>
                      </ButtonGhost>
                      <ButtonTertiary onClick={() => onRun(task.id)}>Re-run</ButtonTertiary>
                    </>
                  : <ButtonPrimary onClick={() => onRun(task.id)}>Run</ButtonPrimary>
                }
              </div>
            </div>

            {isDone && isExpanded && state.result && (
              <div style={{ padding: '12px 14px', borderTop: '1px solid #e5e7eb', backgroundColor: colorPalette.white }}>
                {state.result}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Details panels ───────────────────────────────────────────────────────────

function ViewPanel({ displayDoc, displaySummary, onEdit }: {
  displayDoc: MetadataDocument; displaySummary: string; onEdit: () => void
}) {
  const tags = getDocumentTags(displayDoc)
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">Document Details</Typography>
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.EditOutlined} onClick={onEdit} />
      </div>
      <Typography size="base" color="neutral-darken5">{displaySummary}</Typography>
      <div style={{ borderBottom: '1px solid #e5e7eb', margin: '16px 0' }} />
      <PropRow><PropertyItem label="Document name" value={displayDoc.name} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} /></PropRow>
      <PropRow><PropertyItem label="Domain" value={displayDoc.domain} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} /></PropRow>
      {displayDoc.label && (
        <PropRow><PropertyItem label="Label" value={<Chip label={displayDoc.label} chipStyle={chipStyles.SEMANTIC_WARNING} variant={chipVariants.SUBTLE} />} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} /></PropRow>
      )}
      <PropRow><PropertyItem label="Uploaded" value={formatDate(displayDoc.uploadedDate)} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} /></PropRow>
      <PropRow><PropertyItem label="Format" value={displayDoc.fileFormat} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} /></PropRow>
      <PropRow>
        <PropertyItem
          label="Tags"
          value={<div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{tags.map((tag, i) => <Chip key={i} label={tag.text} chipStyle={tag.style as ChipStyleValue} variant={(tag.variant as typeof chipVariants[keyof typeof chipVariants]) ?? chipVariants.SUBTLE} />)}</div>}
          variant={propertyItemVariants.HORIZONTAL}
          labelProps={{ ...PROP_LABEL }}
        />
      </PropRow>
    </>
  )
}

function EditPanel({
  displayDoc, editingDomain, setEditingDomain, editingCustomTags, setEditingCustomTags,
  editingRemovedFields, setEditingRemovedFields, editingSummary, setEditingSummary,
  tagInputVal, setTagInputVal, addTag, onSave, onCancel,
}: {
  displayDoc: MetadataDocument
  editingDomain: string; setEditingDomain: (v: string) => void
  editingCustomTags: Tag[]; setEditingCustomTags: React.Dispatch<React.SetStateAction<Tag[]>>
  editingRemovedFields: Set<string>; setEditingRemovedFields: React.Dispatch<React.SetStateAction<Set<string>>>
  editingSummary: string; setEditingSummary: (v: string) => void
  tagInputVal: string; setTagInputVal: (v: string) => void
  addTag: () => void; onSave: () => void; onCancel: () => void
}) {
  const removeField = (key: string) => setEditingRemovedFields(prev => new Set(prev).add(key))
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">Document Details</Typography>
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonTertiary onClick={onCancel}>Cancel</ButtonTertiary>
          <ButtonPrimary onClick={onSave}>Save</ButtonPrimary>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextArea label="Summary" value={editingSummary} maxLength={SUMMARY_MAX} hasCounter autoSize={{ minRows: 4, maxRows: 8 }} onChange={e => setEditingSummary(e.target.value)} />
        <Input label="Document Name" name="name" value={displayDoc.name} disabled />
        <Select label="Domain" name="domain" value={editingDomain} options={DOMAIN_OPTIONS} onChange={v => setEditingDomain(String(v))} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Typography size="base" weight="semibold" color="neutral-darken5">Tags</Typography>
          <div style={{ position: 'relative' }}>
            <Input placeholder="Add tag…" value={tagInputVal} onChange={e => setTagInputVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
            {tagInputVal.length > 0 && (
              <span style={{ position: 'absolute', right: 12, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 12, color: '#9ca3af', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>Enter ↵</span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {editingCustomTags.map((tag, i) => (
              <Chip key={i} label={tag.text} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.HIGHLIGHT} closable onClose={() => setEditingCustomTags(prev => prev.filter((_, j) => j !== i))} />
            ))}
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
