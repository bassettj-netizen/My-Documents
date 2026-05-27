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
  Icon,
  iconType,
  Input,
  PropertyItem,
  propertyItemVariants,
  Select,
  Skeleton,
  skeletonVariants,
  Tabs,
  TextArea,
  Typography,
  useNotifications,
  toastPlacements,
} from '@goat-ui/goat-ui-core'
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument } from '../bulk-edit/documents'

const { colorPalette, spacing } = constants
const TOP_BAR_BG = '#1e1f2e'
const SUMMARY_MAX = 500

const DOMAIN_OPTIONS = [
  { label: 'HR', value: 'HR' },
  { label: 'HR/Tax', value: 'HR/Tax' },
  { label: 'Tax', value: 'Tax' },
]

type Tag = { text: string; style: string; variant?: string }
type TaskId = 'extract' | 'compliance' | 'related' | 'actions'
type TaskStatus = 'idle' | 'running' | 'done'
interface TaskState { status: TaskStatus; result: ReactNode | null }
interface SelectionPos { text: string; x: number; y: number; bottom: number }
interface InlineEditState { text: string; x: number; y: number }

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

// ─── Task definitions ─────────────────────────────────────────────────────────

const TASK_DEFS: Array<{ id: TaskId; label: string; description: string; icon: string; iconRotation?: string }> = [
  { id: 'extract',    label: 'Extract Key Data',         description: 'Extract entities, dates, amounts and legal citations.',            icon: iconType.LogoutOutlined,     iconRotation: '-90deg' },
  { id: 'compliance', label: 'Check Compliance',          description: 'Verify regulatory compliance status and identify gaps.',            icon: iconType.TaskOutlined },
  { id: 'related',    label: 'Find Related Documents',    description: 'Identify similar documents across your library.',                  icon: iconType.SearchOutlined },
  { id: 'actions',    label: 'Generate Action Items',     description: 'Create a prioritised list of required actions from this document.', icon: iconType.ListOrderedOutlined },
]

// ─── Mock task results ────────────────────────────────────────────────────────

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
              <div style={{ minWidth: 88, flexShrink: 0 }}>
                <Typography size="base" color="neutral-darken2">{label}</Typography>
              </div>
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
          {doc.citations !== '—' && (
            <Typography size="base" color="neutral-darken2">Applicable regulation: {doc.citations}</Typography>
          )}
        </div>
      )
    }

    case 'related': {
      const related = documents.filter(d => d._id !== doc._id && d.domain === doc.domain).slice(0, 3)
      return (
        <div style={gap8}>
          <Typography size="base" color="neutral-darken2">RELATED DOCUMENTS ({related.length} found)</Typography>
          {related.length === 0
            ? <Typography size="base" color="neutral-darken2">No closely related documents found.</Typography>
            : related.map(r => (
              <div key={r._id} style={{ padding: '8px 12px', backgroundColor: '#f8f9fd', borderRadius: 6 }}>
                <Typography size="base" weight="semibold" color="neutral-darken5">{r.name}</Typography>
                <Typography size="base" color="neutral-darken2">{r.documentType} · {r.namedEntity}</Typography>
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

export default function PreviewTasksPreviewScreenV2() {
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
  const [editingCustomTags, setEditingCustomTags] = useState<Tag[]>([])
  const [editingRemovedFields, setEditingRemovedFields] = useState<Set<string>>(new Set())
  const [editingSummary, setEditingSummary] = useState('')
  const [tagInputVal, setTagInputVal] = useState('')
  const [activeTab, setActiveTab] = useState('details')
  const [textSelection, setTextSelection] = useState<SelectionPos | null>(null)
  const [inlineEditState, setInlineEditState] = useState<InlineEditState | null>(null)
  const [inlineEditText, setInlineEditText] = useState('')
  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>({})

  const [docHtmlOverride, setDocHtmlOverride] = useState<string | null>(null)

  const docBodyRef = useRef<HTMLDivElement>(null)
  const docContentRef = useRef<HTMLDivElement>(null)
  const selToolbarRef = useRef<HTMLDivElement>(null)
  const inlineEditRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)

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
    setTextSelection(null); setInlineEditState(null); setInlineEditText('')
    setTaskStates({}); setDocHtmlOverride(null); savedRangeRef.current = null
  }, [id])

  useEffect(() => {
    const onMouseUp = () => {
      if (inlineEditState) return
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return
      if (!docBodyRef.current?.contains(sel.anchorNode)) { setTextSelection(null); return }
      const range = sel.getRangeAt(0)
      savedRangeRef.current = range.cloneRange()
      const rect = range.getBoundingClientRect()
      const frag = range.cloneContents()
      let selectedText = ''
      const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          selectedText += node.textContent ?? ''
        } else if ((node as Element).tagName === 'BR') {
          selectedText += '\n'
        } else {
          node.childNodes.forEach(walk)
        }
      }
      walk(frag)
      setTextSelection({
        text: selectedText,
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
      })
    }
    const onMouseDown = (e: MouseEvent) => {
      if (selToolbarRef.current?.contains(e.target as Node)) return
      if (inlineEditRef.current?.contains(e.target as Node)) return
      if (!docBodyRef.current?.contains(e.target as Node)) {
        setTextSelection(null)
        if (!inlineEditRef.current?.contains(e.target as Node)) setInlineEditState(null)
      }
    }
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousedown', onMouseDown)
    return () => { document.removeEventListener('mouseup', onMouseUp); document.removeEventListener('mousedown', onMouseDown) }
  }, [inlineEditState])

  if (!foundDoc) return <Navigate to="/my-documents/preview-tasks/version-2" replace />

  const displayDoc = (localDoc?._id === foundDoc._id ? localDoc : null) ?? foundDoc
  const displaySummary = localSummary ?? DOCUMENT_SNIPPETS[displayDoc._id] ?? `${displayDoc.documentType} — ${displayDoc.domain}`
  const filename = `${displayDoc.name}.${displayDoc.fileFormat.toLowerCase()}`

  const startEdit = () => {
    setEditingName(displayDoc.name)
    setEditingDomain(displayDoc.domain)
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
      tagList: editingCustomTags,
      ...(editingRemovedFields.has('namedEntity')     && { namedEntity: '—' }),
      ...(editingRemovedFields.has('namedEntityId')   && { namedEntityId: '—' }),
      ...(editingRemovedFields.has('jurisdiction')    && { jurisdiction: '—' }),
      ...(editingRemovedFields.has('lawType')         && { lawType: '—' }),
      ...(editingRemovedFields.has('citations')       && { citations: '—' }),
      ...(editingRemovedFields.has('monetaryAmounts') && { monetaryAmounts: 0 }),
      ...(editingRemovedFields.has('monetaryTypes')   && { monetaryTypes: 'None' }),
    }
    const updatedSummary = editingSummary
    setIsEditing(false)
    setIsSaving(true)
    setTimeout(() => {
      setLocalDoc(updatedDoc)
      setLocalSummary(updatedSummary)
      setIsSaving(false)
      notification.success({
        title: 'Document details updated successfully',
        placement: toastPlacements.BOTTOM_LEFT,
        duration: 4,
      })
    }, 1000)
  }

  const cancelEdit = () => {
    setIsEditing(false); setEditingName(''); setEditingDomain(''); setEditingCustomTags([])
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
    setTimeout(() => {
      setTaskStates(prev => ({ ...prev, [taskId]: { status: 'done', result: getMockResult(taskId as TaskId, displayDoc) } }))
    }, 1800)
  }

  const toolbarAboveY = (textSelection?.y ?? 0) - 52
  const showToolbarBelow = toolbarAboveY < 60
  const toolbarY = showToolbarBelow ? (textSelection?.bottom ?? 0) + 10 : toolbarAboveY
  const toolbarX = Math.max(200, Math.min((typeof window !== 'undefined' ? window.innerWidth : 1200) - 200, textSelection?.x ?? 0))

  const selectionAction = (action: string) => {
    if (action === 'edit') {
      setInlineEditState({ text: textSelection!.text, x: toolbarX, y: toolbarY })
      setInlineEditText(textSelection!.text)
      setTextSelection(null)
      return
    }
    const labels: Record<string, string> = {
      crossref: 'Cross-referencing…',
      copilot: 'Sent to CoPilot',
    }
    const short = (textSelection?.text ?? '').slice(0, 40)
    notification.default({
      title: labels[action] ?? action,
      content: <Typography size="base" color="neutral-darken5">"{short}"</Typography>,
      placement: toastPlacements.BOTTOM_RIGHT,
      duration: 4,
    })
    setTextSelection(null)
  }

  const saveInlineEdit = () => {
    if (savedRangeRef.current && docContentRef.current) {
      const range = savedRangeRef.current
      range.deleteContents()
      const fragment = document.createDocumentFragment()
      inlineEditText.split('\n').forEach((line, i) => {
        if (i > 0) fragment.appendChild(document.createElement('br'))
        if (line) fragment.appendChild(document.createTextNode(line))
      })
      range.insertNode(fragment)
      window.getSelection()?.removeAllRanges()
      savedRangeRef.current = null
      setDocHtmlOverride(docContentRef.current.innerHTML)
    }
    notification.success({
      title: 'Text updated successfully',
      placement: toastPlacements.BOTTOM_LEFT,
      duration: 3,
    })
    setInlineEditState(null)
    setInlineEditText('')
  }

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
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F5F9FF' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: TOP_BAR_BG, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <ButtonGhost mode="contrast" leftIcon={iconType.ChevronLeftOutlined} onClick={() => navigate(-1)}>Back</ButtonGhost>
        <Typography weight="bold" color="white">{filename}</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ButtonTertiary mode="contrast" leftIcon={iconType.SparksOutlined} rightIcon={iconType.ExternalLinkOutlined}>Ask CoPilot</ButtonTertiary>
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
        {/* Document body */}
        <div
          ref={docBodyRef}
          style={{ flex: '0 0 62%', backgroundColor: colorPalette.white, borderRadius: 8, padding: '32px 40px', minHeight: 640 }}
        >
          {isLoading
            ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '60%' }} paragraph={{ rows: 16 }} />
            : docHtmlOverride !== null
            ? <div ref={docContentRef} dangerouslySetInnerHTML={{ __html: docHtmlOverride }} />
            : <div ref={docContentRef}><DocumentBody doc={displayDoc} /></div>
          }
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ backgroundColor: colorPalette.white, borderRadius: 8, padding: '0 24px 24px' }}>
            {isLoading
              ? <div style={{ padding: '24px 0' }}><Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 10 }} /></div>
              : <Tabs options={tabs} activeKey={activeTab} onChange={handleTabChange} />
            }
          </div>
        </div>
      </div>

      {/* Text selection toolbar */}
      {textSelection && !inlineEditState && (
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
          <ButtonGhost leftIcon={iconType.SparksOutlined} rightIcon={iconType.ExternalLinkOutlined} onClick={() => selectionAction('copilot')}>Ask CoPilot</ButtonGhost>
        </div>
      )}

      {/* Inline edit popup */}
      {inlineEditState && (
        <div
          ref={inlineEditRef}
          style={{
            position: 'fixed',
            left: inlineEditState.x,
            top: inlineEditState.y,
            transform: 'translateX(-50%)',
            zIndex: 1001,
            backgroundColor: colorPalette.white,
            borderRadius: 8,
            padding: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.16)',
            border: '1px solid #e5e7eb',
            width: 400,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(2) }}>
            <Typography size="heading-sm" weight="semibold" color="neutral-darken5">Edit Document Content</Typography>
            <ButtonGhost
              shape={buttonShapes.SQUARE}
              leftIcon={iconType.CrossOutlined}
              onClick={() => { setInlineEditState(null); setInlineEditText(''); savedRangeRef.current = null }}
            />
          </div>
          <TextArea
            value={inlineEditText}
            onChange={e => setInlineEditText(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: spacing(2) }}>
            <ButtonTertiary onClick={() => { setInlineEditState(null); setInlineEditText(''); savedRangeRef.current = null }}>Cancel</ButtonTertiary>
            <ButtonPrimary onClick={saveInlineEdit}>Save</ButtonPrimary>
          </div>
        </div>
      )}
    </div>
  )
}

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
      style={{
        border: `1px solid ${isDone ? '#c7d2fe' : '#e5e7eb'}`,
        borderRadius: 8,
        overflow: 'hidden',
        cursor: isIdle ? 'pointer' : 'default',
        transition: 'border-color 0.15s',
        backgroundColor: isDone ? colorPalette.neutral.lighten5 : colorPalette.white,
      }}
      onClick={isIdle ? () => onRun(task.id) : undefined}
      onMouseEnter={isIdle ? e => { e.currentTarget.style.borderColor = '#a5b4fc' } : undefined}
      onMouseLeave={isIdle ? e => { e.currentTarget.style.borderColor = '#e5e7eb' } : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px' }}>
        <span style={{ flexShrink: 0, marginTop: 2, display: 'inline-flex', transform: task.iconRotation ? `rotate(${task.iconRotation})` : undefined }}>
          <Icon
            type={task.icon}
            size={16}
            color="neutral-darken4"
          />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography size="base" weight="semibold" color="neutral-darken5">{task.label}</Typography>
          <Typography size="base-sm" color="neutral-darken2">{task.description}</Typography>
        </div>
        {isDone && (
          <div style={{ flexShrink: 0 }}>
            <ButtonTertiary
              shape={buttonShapes.SQUARE}
              leftIcon={iconType.RefreshOutlined}
              onClick={e => { e.stopPropagation(); onRun(task.id) }}
            />
          </div>
        )}
      </div>

      {isRunning && (
        <div style={{ padding: '0 14px 14px' }}>
          <Skeleton variant={skeletonVariants.TEXT} paragraph={{ rows: 3 }} />
        </div>
      )}

      {isDone && state?.result && (
        <div style={{ padding: '14px 14px 14px', borderTop: '1px solid #ede9fe' }}>
          {state.result}
        </div>
      )}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(2) }}>
        <Typography size="base" color="neutral-darken2">Document Details</Typography>
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.EditOutlined} onClick={onEdit} />
      </div>
      <div style={{ marginBottom: spacing(4) }}>
        <Typography size="base" color="neutral-darken5">{displaySummary}</Typography>
      </div>
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
  displayDoc, editingName, setEditingName: _setEditingName, editingDomain, setEditingDomain,
  editingCustomTags, setEditingCustomTags, editingRemovedFields, setEditingRemovedFields,
  editingSummary, setEditingSummary, tagInputVal, setTagInputVal, addTag, onSave, onCancel,
}: {
  displayDoc: MetadataDocument
  editingName: string; setEditingName: (_v: string) => void
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
        <Typography size="base" color="neutral-darken2">Document Details</Typography>
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonTertiary onClick={onCancel}>Cancel</ButtonTertiary>
          <ButtonPrimary onClick={onSave}>Save</ButtonPrimary>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <TextArea label="Summary" value={editingSummary} maxLength={SUMMARY_MAX} hasCounter autoSize={{ minRows: 4, maxRows: 8 }} onChange={e => setEditingSummary(e.target.value)} />
        <Input label="Document Name" name="name" value={editingName} disabled />
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
