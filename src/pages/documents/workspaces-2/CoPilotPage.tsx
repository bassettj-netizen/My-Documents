import { useEffect, useMemo, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ButtonGhost,
  ButtonPrimary,
  buttonShapes,
  ButtonTertiary,
  buttonWidth,
  Icon,
  iconType,
  SearchBar,
  searchbarWidth,
  Select,
  Typography,
  buttonSizes,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  Input,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, fontWeight, renderLiteMarkdown, SpaceAvatar, SpaceFormModal, type DocSource, type MetadataDocument, type OutgoingAttachment, type Space, type SpaceFormValues } from '../workspaces/shared'
import { MessageComposer } from '../workspaces/Version6'
import { CoPilotMark } from '../workspaces/CoPilotPage'
import type { WorkspaceReference } from '../hackathon/workspaceModel'
import { useProcessingUpload } from '../hackathon/uploadToasts'
import { AnswerBody, SourceChips, SourcesPanel, SourcesPanelSlot, type SourceFilter } from '../hackathon/AnswerSources'
import { buildSources, placeMarkers, type AnswerSource } from '../hackathon/sourceData'

/**
 * Hackathon Oct '26 — CoPilot for Version 10 (copied from Version 8, itself copied from Version 6, itself copied from Version 4): the shared CoPilot page with the Workspace dropdown
 * directly under the CoPilot HR logo. Everything else as below.
 *
 * Hackathon Oct '26 — CoPilot: the CoPilot HR start page (screenshots/Bildschirmfoto 2026-10-14 um 13.13.19.png).
 * Built from Launch Pad 2's CoPilot HR page, kept as its own copy so the two can diverge.
 *
 * - Chat panel: CoPilot HR, New Chat, title search, Prompt Templates, the Workspace dropdown,
 *   then the current workspace's chats under Today / Yesterday. "My workspace" holds the chats that aren't tied to a workspace.
 * - Welcome: CoPilot mark, "Welcome to CoPilot HR," with the sources note, then the question composer.
 *   In a workspace, the mark, heading and intro become the workspace's avatar, its name and its description,
 *   and a panel on the right sums up its documents, context, guardrails, bookmarks and templates.
 * - Sending a question starts a new chat under Today with a canned reply; the chevron hides the panel.
 * - A question asked on Home arrives as `initialQuestion` in the route state and opens as a new chat.
 * - "Ask CoPilot about this workspace" arrives as `workspaceRef` and selects that workspace; chats
 *   started in a workspace answer from it (shown under the chat title).
 * - Typing @ in either question box lists the workspaces; picking one targets it — attached for a new
 *   chat, or switched to for the open one. ↑/↓ move, Enter or Tab picks, Esc closes.
 * - The dropdown, @ and "Ask CoPilot about this workspace" all set the same thing: the current
 *   workspace. Changing it switches the chat history to that workspace's chats.
 */

const GENERAL = 'general'
const CREATE_WORKSPACE = 'create-workspace'

export type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string; attachmentNames?: string[] }
export type ChatSession = { id: string; title: string; day: string; messages: ChatMsg[]; workspace?: WorkspaceReference }

let idCounter = 0
function nextId(prefix: string) { idCounter += 1; return `${prefix}-home-${idCounter}` }

const SIMULATED = '\n\n(Simulated response for prototyping — connect a real assistant to answer from actual HR records.)'

function session(id: string, day: string, title: string, question: string, answer: string): ChatSession {
  return {
    id, day, title,
    messages: [
      { id: `${id}-u`, role: 'user', content: question },
      { id: `${id}-a`, role: 'assistant', content: answer + SIMULATED },
    ],
  }
}

const INITIAL_SESSIONS: ChatSession[] = [
  session('home-today-1', 'Today', 'Employee onboarding',
    'What should a first-week onboarding plan for a new team member include?',
    'A solid first week covers three things: **the basics** (contract signed, equipment and accounts ready on day one), **people** (a named buddy plus short intro meetings with the team and key contacts), and **a first small task** they can finish by Friday. Close the week with a 30-minute check-in to agree goals for the first 90 days.'),
  session('home-today-2', 'Today', 'Review leave requests',
    'Two people on the same team asked for the same two weeks in August. How should I decide?',
    'Start with your leave policy: many companies give priority by **social criteria** — for example employees with school-age children during school holidays (§ 7 Abs. 1 BUrlG). If neither has priority, talk to both about splitting the period or alternating years, and record the decision and its reason.'),
  session('home-yesterday-1', 'Yesterday', 'Prepare a performance review',
    'How do I prepare for an annual performance review?',
    'Gather **evidence across the whole year**, not just recent weeks: goals set last time, results, feedback from colleagues, and notes from one-to-ones. Draft two or three strengths and one or two development areas with concrete examples, and send the employee a short self-assessment form a week ahead.'),
  session('home-yesterday-2', 'Yesterday', 'Write a job advert',
    'Write a job advert for a payroll accountant (full time, Freiburg).',
    "**Payroll Accountant (m/f/d) — full time, Freiburg**\n\nYou'll run monthly payroll for around 400 employees, handle reports to social insurance funds and tax authorities, and be the first contact for payroll questions. You bring training as a payroll accountant or similar, experience with DATEV or SAP HCM, and care for detail. We offer hybrid working, 30 days' leave and a company pension."),
  session('home-yesterday-3', 'Yesterday', 'Plan an employee appraisal',
    'What is a good structure for a one-hour employee appraisal conversation?',
    "A simple structure: **5 minutes** to set the scene, **20 minutes** for the employee's own view of the year, **15 minutes** for your feedback, **15 minutes** to agree goals and development steps, and **5 minutes** to sum up. Send a written summary afterwards."),
]

function plural(n: number, word: string) { return `${n} ${word}${n === 1 ? '' : 's'}` }

/** Short list of what the workspace hands CoPilot, e.g. "3 documents · background · 2 guardrails". */
function workspaceSummary(ws: WorkspaceReference): string {
  return [
    plural(ws.documents, 'document'),
    (ws.hasBackground || ws.details > 0) && 'context',
    ws.guardrails.length > 0 && plural(ws.guardrails.length, 'guardrail'),
    ws.bookmarks > 0 && plural(ws.bookmarks, 'bookmark'),
    ws.templates > 0 && plural(ws.templates, 'template'),
  ].filter(Boolean).join(' · ')
}

function makeCannedReply(question: string, ws?: WorkspaceReference): string {
  if (ws) {
    const rules = ws.guardrails.length ? ` Following this workspace's guardrails: ${ws.guardrails.map(g => `*${g}*`).join('; ')}.` : ''
    return `Answering from the **${ws.name}** workspace (${workspaceSummary(ws)}).${rules}\n\n${makeCannedReply(question)}`
  }
  return `Based on your question — "${question.length > 80 ? `${question.slice(0, 80)}…` : question}" — here's a starting point: I'd check the relevant employment law provisions and any internal HR policy on file, then confirm against the employee's actual record before finalizing anything.${SIMULATED}`
}

// ─── Small building blocks ────────────────────────────────────────────────────

function PanelRow({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: spacing(2),
        padding: `${spacing(2)}px`, borderRadius: 6, cursor: 'pointer',
        backgroundColor: hovered ? colorPalette.neutral.lighten4 : undefined,
      }}
    >
      <Icon type={icon as never} size={16} color="neutral-darken3" />
      <span style={{ fontSize: 14, color: colorPalette.neutral.darken5 }}>{label}</span>
    </div>
  )
}

function ChatHistoryRow({ title, active, onClick }: { title: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: `${spacing(2)}px`, borderRadius: 6, cursor: 'pointer',
        backgroundColor: active ? colorPalette.blue.lighten5 : hovered ? colorPalette.neutral.lighten4 : undefined,
      }}
    >
      <span style={{
        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontSize: 14, fontWeight: active ? 600 : 400, color: active ? colorPalette.blue.darken2 : colorPalette.neutral.darken5,
      }}>{title}</span>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ padding: `0 ${spacing(2)}px ${spacing(1)}px` }}>
      <Typography size="base-small" color="blue-darken2" weight={fontWeight.SEMIBOLD}>{children}</Typography>
    </div>
  )
}

function ChatBubbleUser({ message }: { message: ChatMsg }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: spacing(2) }}>
      {message.attachmentNames && message.attachmentNames.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2), alignItems: 'flex-end' }}>
          {message.attachmentNames.map(name => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px ${spacing(3)}px`, border: `1px solid ${colorPalette.neutral.lighten1}`, borderRadius: 8, backgroundColor: colorPalette.white }}>
              <Icon type={iconType.PaperclipOutlined} size={16} color="neutral-darken2" />
              <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{name}</Typography>
            </div>
          ))}
        </div>
      )}
      {message.content && (
        <div style={{ maxWidth: '70%', backgroundColor: '#eef2fc', borderRadius: 16, padding: `${spacing(3)}px ${spacing(4)}px` }}>
          <Typography size="base" color="neutral-darken5">{message.content}</Typography>
        </div>
      )}
    </div>
  )
}

function ChatBubbleAssistant({ message, sources, onOpenSources }: {
  message: ChatMsg
  // Sources behind the answer (workspace chats only): cited inline and listed as chips underneath.
  sources?: AnswerSource[]
  onOpenSources?: (filter: SourceFilter, focus: number | null) => void
}) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <Typography size="base" color="neutral-darken5">
        {sources && sources.length > 0
          ? <AnswerBody content={placeMarkers(message.content, sources.length)} sources={sources} lang="en" onMarker={n => onOpenSources?.('all', n)} />
          : renderLiteMarkdown(message.content)}
      </Typography>
      {sources && sources.length > 0 && <SourceChips sources={sources} lang="en" onOpen={filter => onOpenSources?.(filter, null)} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThumbsUpOutlined} />
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThumbsDownOutlined} />
        <ButtonGhost
          shape={buttonShapes.SQUARE}
          leftIcon={copied ? iconType.CheckOutlined : iconType.CopyOutlined}
          onClick={() => { navigator.clipboard?.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
        />
      </div>
    </div>
  )
}

/** The "@query" being typed at the end of the field, if any — the @ must start the field or follow a space. */
function mentionQuery(text: string): string | null {
  const match = /(?:^|\s)@([^@\n]{0,40})$/.exec(text)
  return match ? match[1] : null
}

type SeedAttachment = { doc: MetadataDocument; source: DocSource }
const NO_ATTACHMENTS: SeedAttachment[] = []
const noop = () => {}

/**
 * The CoPilot question box plus an @ picker: typing @ lists the workspaces above the box, filtered by
 * what follows it. Keys are caught on the way down to the field so ↑/↓/Enter drive the list while it's open.
 */
function MentionComposer({ value, onChange, workspaces, onPick, seedAttachments, onSeedAttachmentsConsumed, ...composer }: Omit<ComponentProps<typeof MessageComposer>, 'seedAttachments' | 'onSeedAttachmentsConsumed' | 'autoSize'> & {
  workspaces: WorkspaceReference[]
  onPick: (ws: WorkspaceReference) => void
  // Documents to attach to the question, e.g. sent from a workspace (Workspaces 2.0 Version 9).
  seedAttachments?: SeedAttachment[]
  onSeedAttachmentsConsumed?: () => void
}) {
  const [highlight, setHighlight] = useState(0)
  const [dismissed, setDismissed] = useState<string | null>(null)
  const query = mentionQuery(value)
  const open = query !== null && dismissed !== value
  const matches = open ? workspaces.filter(w => w.name.toLowerCase().includes(query.trim().toLowerCase())) : []
  const active = Math.min(highlight, Math.max(matches.length - 1, 0))

  const pick = (ws: WorkspaceReference) => {
    onChange(value.replace(/@[^@\n]*$/, '').trimEnd())
    onPick(ws)
    setHighlight(0)
  }

  const handleKeyDownCapture = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setDismissed(value); return }
    if (matches.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); setHighlight((active + 1) % matches.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); setHighlight((active - 1 + matches.length) % matches.length) }
    else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); pick(matches[active]) }
  }

  return (
    <div style={{ position: 'relative' }} onKeyDownCapture={handleKeyDownCapture}>
      {open && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 'calc(100% + 8px)', zIndex: 10, maxHeight: 280, overflowY: 'auto',
          backgroundColor: colorPalette.white, border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0, 19, 68, 0.12)', padding: spacing(1),
        }}>
          <div style={{ padding: `${spacing(1)}px ${spacing(2)}px` }}>
            <Typography size="base-small" color="neutral-darken2" weight={fontWeight.SEMIBOLD}>Workspaces</Typography>
          </div>
          {matches.length === 0 ? (
            <div style={{ padding: `${spacing(2)}px` }}>
              <Typography size="base-sm" color="neutral-darken2">
                {workspaces.length === 0 ? 'No workspaces yet — create one under Workspaces.' : 'No workspace matches.'}
              </Typography>
            </div>
          ) : matches.map((ws, i) => (
            <div
              key={ws.id}
              // mousedown, not click, so the field doesn't lose focus first.
              onMouseDown={e => { e.preventDefault(); pick(ws) }}
              onMouseEnter={() => setHighlight(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px`, borderRadius: 6, cursor: 'pointer',
                backgroundColor: i === active ? colorPalette.blue.lighten5 : undefined,
              }}
            >
              <Icon type={iconType.ElementsOutlined} size={16} color="blue-darken1" />
              <span style={{ fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken5 }}>{ws.name}</span>
              <span style={{ fontSize: 12, color: colorPalette.neutral.darken2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workspaceSummary(ws)}</span>
            </div>
          ))}
        </div>
      )}
      <MessageComposer
        {...composer}
        value={value}
        onChange={v => { onChange(v); setHighlight(0) }}
        seedAttachments={seedAttachments ?? NO_ATTACHMENTS}
        onSeedAttachmentsConsumed={onSeedAttachmentsConsumed ?? noop}
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
    </div>
  )
}

/** A workspace dropdown option: a 20px avatar or icon, then the name. */
function OptionLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="copilot-ws-option" style={{ display: 'flex', alignItems: 'center', gap: spacing(2), minWidth: 0 }}>
      <span
        className="copilot-ws-option-icon"
        style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
    </span>
  )
}

/**
 * Top bar of an open chat, after the CoPilot Finance design: a breadcrumb that makes the workspace
 * obvious — its avatar and name (a link back to it), then the chat title — and Save as PDF / Actions on
 * the right. Chats outside a workspace show "My workspace" in the workspace's place.
 */
function ChatHeader({ session, workspace, onOpenWorkspace, onRename, onDelete }: {
  session: ChatSession
  workspace: WorkspaceReference | null
  onOpenWorkspace: (ws: WorkspaceReference) => void
  onRename: (title: string) => void
  onDelete: () => void
}) {
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(session.title)
  const commit = () => { if (draft.trim()) onRename(draft.trim()); setRenaming(false) }
  return (
    <div style={{
      // No background or outline — it sits on the page, between the chat panel and the workspace summary.
      flexShrink: 0, height: 56, display: 'flex', alignItems: 'center', gap: spacing(3), padding: `0 ${spacing(6)}px`,
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: spacing(2) }}>
        {workspace ? (
          <button
            type="button"
            onClick={() => onOpenWorkspace(workspace)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2), padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
          >
            <SpaceAvatar space={{ id: workspace.id, name: workspace.name } as Space} size={24} />
            <span style={{ fontSize: 14, fontWeight: 600, color: colorPalette.blue.base }}>{workspace.name}</span>
          </button>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2), flexShrink: 0 }}>
            <Icon type={iconType.UserOutlined} size={16} color="neutral-darken3" />
            <span style={{ fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken3 }}>My workspace</span>
          </span>
        )}
        <Icon type={iconType.ChevronRightOutlined} size={12} color="neutral-darken1" />
        {renaming ? (
          <div style={{ flex: 1, maxWidth: 480 }} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(session.title); setRenaming(false) } }}>
            <Input name="chat-title" value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit} />
          </div>
        ) : (
          <span style={{ minWidth: 0, fontSize: 16, color: colorPalette.neutral.darken5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.title}</span>
        )}
      </div>
      {/* Prototype: exporting isn't wired up yet. */}
      <ButtonGhost rightIcon={iconType.DownloadOutlined}>Save as PDF</ButtonGhost>
      <Dropdown
        items={[
          { key: 'rename', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.EditOutlined} size={16} />Rename</span>, onClick: () => { setDraft(session.title); setRenaming(true) } },
          { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete chat</span>, onClick: onDelete },
        ]}
        trigger={dropdownTriggers.CLICK}
        placement={dropdownPlacement.BOTTOM_RIGHT}
      >
        <ButtonGhost rightIcon={iconType.ThreeDotsVerFilled}>Actions</ButtonGhost>
      </Dropdown>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HackathonCoPilotPageV10({ workspaces, onCreateWorkspace, onSaveDocuments, onChatStarted, savedSessions, onSessionsChange, extraSessions = [], background = colorPalette.neutral.lighten5 }: {
  workspaces: WorkspaceReference[]
  // "Create workspace" at the foot of the workspace dropdown; returns the new workspace's id.
  onCreateWorkspace: (values: SpaceFormValues) => string
  // Files sent with a question while in a workspace are saved to that workspace's documents.
  onSaveDocuments: (workspaceId: string, files: File[]) => void
  // A chat now belongs to a workspace (started there, or moved there with @) — the workspace lists it.
  onChatStarted: (workspaceId: string, chat: { id: string; title: string }) => void
  // Chats are kept by the version, so they're still here after leaving CoPilot (null = the sample chats).
  savedSessions: ChatSession[] | null
  onSessionsChange: (sessions: ChatSession[]) => void
  // The page's background (Workspaces 2.0 Version 2 uses white).
  background?: string
  // Prefilled workspace chats, listed before the sample ones the first time CoPilot opens.
  extraSessions?: ChatSession[]
}) {
  const runUpload = useProcessingUpload('en')
  /** Saves the files sent with a message to the chat's workspace — only once the message has gone. */
  const saveToWorkspace = (ws: WorkspaceReference | null | undefined, attachments: OutgoingAttachment[]) => {
    const files = attachments.flatMap(a => a.kind === 'file' ? [a.file] : [])
    if (!ws || files.length === 0) return
    // Same processing toasts as uploading in the workspace; the files land once "extraction" is done.
    runUpload(files.map(f => f.name), () => onSaveDocuments(ws.id, files))
  }
  const location = useLocation()
  const navigate = useNavigate()
  const [panelOpen, setPanelOpen] = useState(true)
  // The sources panel: which answer's sources, filtered how, opened on which one.
  const [sourcesView, setSourcesView] = useState<{ messageId: string; filter: SourceFilter; focus: number | null; opened: number } | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [question, setQuestion] = useState('')
  // initialQuestion starts a new chat; openChatId (from a workspace's Haufe knowledge) opens an existing one.
  // attachDocs (Version 9's Send to CoPilot) attaches documents to the new question in the workspace.
  const routeState = location.state as { initialQuestion?: string; workspaceRef?: WorkspaceReference; openChatId?: string; attachDocs?: SeedAttachment[] } | null
  const [attachDocs, setAttachDocs] = useState<SeedAttachment[]>(() => routeState?.attachDocs ?? NO_ATTACHMENTS)
  const baseSessions = savedSessions ?? [...extraSessions, ...INITIAL_SESSIONS]
  const openedChat = routeState?.openChatId ? baseSessions.find(s => s.id === routeState.openChatId) ?? null : null
  // The current workspace: whose chats the panel lists and what new chats answer from.
  const [workspaceId, setWorkspaceId] = useState<string>(routeState?.workspaceRef?.id ?? openedChat?.workspace?.id ?? GENERAL)
  const attached = workspaces.find(w => w.id === workspaceId) ?? null
  /** Switch workspace from the dropdown or the chip — back to its welcome screen. */
  const selectWorkspace = (id: string) => { setWorkspaceId(id); setActiveId(null) }
  // A question handed over (from Home, or a workspace template) opens straight away as a new chat.
  const [handedOver] = useState<ChatSession | null>(() => {
    const text = routeState?.initialQuestion?.trim()
    if (!text) return null
    const ws = routeState?.workspaceRef
    return {
      id: nextId('chat'), day: 'Today', title: text.length > 60 ? `${text.slice(0, 60)}…` : text, workspace: ws,
      messages: [
        { id: nextId('msg'), role: 'user', content: text },
        { id: nextId('msg'), role: 'assistant', content: makeCannedReply(text, ws) },
      ],
    }
  })
  const [sessions, setSessions] = useState<ChatSession[]>(() => handedOver ? [handedOver, ...baseSessions] : baseSessions)
  const [activeId, setActiveId] = useState<string | null>(handedOver?.id ?? openedChat?.id ?? null)

  // Hand every change back to the version so the chats survive leaving the page.
  useEffect(() => {
    onSessionsChange(sessions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions])

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const inWorkspace = sessions.filter(s => (s.workspace?.id ?? GENERAL) === workspaceId)
    const days = [...new Set(inWorkspace.map(s => s.day))]
    return days
      .map(day => ({ day, entries: inWorkspace.filter(s => s.day === day && s.title.toLowerCase().includes(q)) }))
      .filter(g => g.entries.length > 0)
  }, [search, sessions, workspaceId])

  const activeSession = activeId ? sessions.find(s => s.id === activeId) ?? null : null

  const reply = (text: string, attachments: OutgoingAttachment[], ws?: WorkspaceReference): ChatMsg[] => {
    const attachmentNames = attachments.map(a => a.kind === 'file' ? a.file.name : a.doc.name)
    return [
      { id: nextId('msg'), role: 'user', content: text, attachmentNames: attachmentNames.length ? attachmentNames : undefined },
      { id: nextId('msg'), role: 'assistant', content: makeCannedReply(text, ws) },
    ]
  }

  const handleWelcomeSend = (attachments: OutgoingAttachment[]) => {
    const text = question.trim()
    if (!text && attachments.length === 0) return
    const id = nextId('chat')
    const title = text.length > 60 ? `${text.slice(0, 60)}…` : text || 'New chat'
    const ws = attached ?? undefined
    setSessions(prev => [{ id, day: 'Today', title, workspace: ws, messages: reply(text, attachments, ws) }, ...prev])
    if (ws) onChatStarted(ws.id, { id, title })
    saveToWorkspace(ws, attachments)
    setActiveId(id)
    setQuestion('')
  }

  // Clear the handed-over question so a reload doesn't ask it again.
  useEffect(() => {
    if (handedOver?.workspace) onChatStarted(handedOver.workspace.id, { id: handedOver.id, title: handedOver.title })
    if (routeState) navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFollowUp = (attachments: OutgoingAttachment[]) => {
    if (!activeSession) return
    const text = question.trim()
    setSessions(prev => prev.map(s => s.id !== activeSession.id ? s : { ...s, messages: [...s.messages, ...reply(text, attachments, s.workspace)] }))
    saveToWorkspace(activeSession.workspace, attachments)
    setQuestion('')
  }

  /** An answer's sources — only in a workspace chat, citing Haufe knowledge and that workspace's files. */
  const answerSources = (message: ChatMsg, question: string): AnswerSource[] | undefined => {
    const ws = activeSession?.workspace ? workspaces.find(w => w.id === activeSession.workspace!.id) ?? activeSession.workspace : null
    return ws ? buildSources(message.id, question, ws.documentNames ?? [], 'en') : undefined
  }
  const sourcesMessage = sourcesView && activeSession ? activeSession.messages.find(m => m.id === sourcesView.messageId) : undefined
  const panelSources = sourcesMessage && activeSession
    ? answerSources(sourcesMessage, activeSession.messages[activeSession.messages.indexOf(sourcesMessage) - 1]?.content ?? '')
    : undefined

  return (
    // Main area on the theme's neutral-lighten5; the chat panel (a menu) stays white.
    <div style={{ display: 'flex', height: '100%', backgroundColor: background }}>
      {/* Chat panel, collapsible from its own foot like the app's other panels: a narrow strip of icons when collapsed. */}
      <div style={{
        width: panelOpen ? 268 : 64, flexShrink: 0, borderRight: `1px solid ${colorPalette.neutral.lighten1}`, backgroundColor: colorPalette.white,
        display: 'flex', flexDirection: 'column', transition: 'width 0.15s',
      }}>
      {panelOpen ? (
        <div style={{
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: `${spacing(4)}px ${spacing(4)}px`, gap: spacing(5), overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <CoPilotMark size={32} />
            <span style={{ fontSize: 18, fontWeight: 600, color: '#001344' }}>CoPilot HR</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
            <SectionLabel>Workspace</SectionLabel>
            {/* Closed dropdown: text and icon keep their colours while it's open or focused, and no focus ring.
                Open list: the selected option's icon and label are blue. */}
            <style>{`
              .copilot-ws-option-icon { color: ${colorPalette.neutral.darken3}; }
              .copilot-workspace-select .goat-select-selection-item,
              .copilot-workspace-select .goat-select-selection-item .copilot-ws-option { color: ${colorPalette.neutral.darken5} !important; opacity: 1 !important; }
              .copilot-workspace-select .goat-select-selection-item .copilot-ws-option-icon { color: ${colorPalette.neutral.darken3} !important; }
              .copilot-workspace-select .goat-select-selector,
              .copilot-workspace-select .goat-select-focused .goat-select-selector,
              .copilot-workspace-select *:focus,
              .copilot-workspace-select *:focus-visible { outline: none !important; box-shadow: none !important; }
              .goat-select-item-option-selected .copilot-ws-option,
              .goat-select-item-option-selected .copilot-ws-option-icon { color: ${colorPalette.blue.base}; }
              .goat-select-item-option-disabled:has(.copilot-create-ws) {
                cursor: default !important; background-color: transparent !important; opacity: 1 !important;
                margin-top: ${spacing(1)}px; padding-top: ${spacing(2)}px; border-top: 1px solid ${colorPalette.neutral.lighten3};
              }
              .goat-select-item-option-disabled:has(.copilot-create-ws) .goat-select-item-option-content { overflow: visible; }
            `}</style>
            {/* The DS Select has no borderless option, so the outline is removed for this one dropdown. */}
            <style>{`.copilot-workspace-select .goat-select-selector { border-color: transparent !important; box-shadow: none !important; padding-left: ${spacing(2)}px !important; }`}</style>
            <div className="copilot-workspace-select">
            <Select
              value={workspaceId}
              options={[
                { label: <OptionLabel icon={<Icon type={iconType.UserOutlined} size={16} color="inherit" />}>My workspace</OptionLabel>, value: GENERAL },
                ...workspaces.map(w => ({
                  // Workspaces here have no photo, so the avatar only needs the name for its initials.
                  label: <OptionLabel icon={<SpaceAvatar space={{ id: w.id, name: w.name } as Space} size={20} />}>{w.name}</OptionLabel>,
                  value: w.id,
                })),
                // Not a workspace but a button at the foot of the list. The DS Select has no footer slot, so it sits in a
                // disabled row (not selectable, no hover — see the style block) and only the button reacts.
                {
                  label: (
                    <span className="copilot-create-ws">
                      <ButtonTertiary size={buttonSizes.SMALL} width={buttonWidth.EXPANDED} leftIcon={iconType.PlusOutlined} onClick={e => { e.stopPropagation(); setCreateOpen(true) }}>Create workspace</ButtonTertiary>
                    </span>
                  ),
                  value: CREATE_WORKSPACE,
                  disabled: true,
                },
              ]}
              onChange={v => v === CREATE_WORKSPACE ? setCreateOpen(true) : selectWorkspace(v as string)}
            />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
            <ButtonPrimary width={buttonWidth.EXPANDED} leftIcon={iconType.CommentOutlined} onClick={() => { setQuestion(''); setActiveId(null) }}>
              New Chat
            </ButtonPrimary>
            <SearchBar placeholder="Search titles" value={search} onChange={setSearch} width={searchbarWidth.EXPANDED} />
          </div>

          <PanelRow icon={iconType.NoteOutlined} label="Prompt Templates" />

          {filteredGroups.length === 0 ? (
            <div style={{ padding: `${spacing(4)}px ${spacing(2)}px` }}>
              <Typography size="base-sm" color="neutral-darken2" align="center">
                {search.trim() ? 'No chats match your search.' : attached ? `No chats in ${attached.name} yet.` : 'No chats yet.'}
              </Typography>
            </div>
          ) : filteredGroups.map(group => (
            <div key={group.day} style={{ display: 'flex', flexDirection: 'column' }}>
              <SectionLabel>{group.day}</SectionLabel>
              {group.entries.map(entry => (
                <ChatHistoryRow key={entry.id} title={entry.title} active={entry.id === activeId} onClick={() => setActiveId(entry.id)} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(4), padding: `${spacing(4)}px 0` }}>
          <CoPilotMark size={32} />
          <ButtonPrimary shape={buttonShapes.SQUARE} leftIcon={iconType.CommentOutlined} onClick={() => { setQuestion(''); setActiveId(null) }} ariaLabel="New Chat" />
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.NoteOutlined} ariaLabel="Prompt Templates" />
        </div>
      )}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setPanelOpen(v => !v)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPanelOpen(v => !v) } }}
          title={panelOpen ? undefined : 'Expand'}
          style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: panelOpen ? 'flex-start' : 'center', gap: spacing(3),
            padding: `${spacing(3)}px ${spacing(4)}px`, borderTop: `1px solid ${colorPalette.neutral.lighten3}`, cursor: 'pointer',
          }}
        >
          <Icon type={panelOpen ? iconType.ChevronLeftOutlined : iconType.ChevronRightOutlined} size={16} color="neutral-darken4" />
          {panelOpen && <span style={{ fontSize: 13, color: colorPalette.neutral.darken5 }}>Collapse</span>}
        </div>
      </div>

      {/* Between the chat panel and the workspace summary: an open chat's header, then the chat or the welcome screen. */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {activeSession && (
            <ChatHeader
              session={activeSession}
              workspace={activeSession.workspace ? workspaces.find(w => w.id === activeSession.workspace!.id) ?? activeSession.workspace : null}
              onOpenWorkspace={ws => navigate(ws.path)}
              onRename={title => setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, title } : s))}
              onDelete={() => { setSessions(prev => prev.filter(s => s.id !== activeSession.id)); setActiveId(null) }}
            />
        )}
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeSession ? (
          <>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div style={{ maxWidth: 840, width: '100%', padding: `${spacing(4)}px ${spacing(8)}px`, display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
                {activeSession.messages.map((m, i) => m.role === 'user'
                  ? <ChatBubbleUser key={m.id} message={m} />
                  : <ChatBubbleAssistant
                      key={m.id}
                      message={m}
                      sources={answerSources(m, activeSession.messages[i - 1]?.content ?? '')}
                      onOpenSources={(filter, focus) => setSourcesView({ messageId: m.id, filter, focus, opened: Date.now() })}
                    />)}
              </div>
            </div>
            <div style={{ flexShrink: 0, padding: `0 ${spacing(8)}px ${spacing(4)}px`, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: 840 }}>
                <MentionComposer
                  value={question}
                  onChange={setQuestion}
                  onSend={handleFollowUp}
                  placeholder="Ask a follow-up question, or type @ to target a workspace"
                  workspaces={workspaces}
                  // The chat moves to the picked workspace, and the panel follows it there.
                  onPick={ws => { setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, workspace: ws } : s)); setWorkspaceId(ws.id); onChatStarted(ws.id, { id: activeSession.id, title: activeSession.title }) }}
                />
              </div>
            </div>
          </>
        ) : (
          <>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `0 ${spacing(10)}px ${spacing(10)}px` }}>
              <div style={{ maxWidth: 650, width: '100%', display: 'flex', flexDirection: 'column', gap: spacing(10) }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
                  {/* In a workspace, the welcome is headed with it instead of CoPilot HR. */}
                  {attached
                    ? <SpaceAvatar space={{ id: attached.id, name: attached.name } as Space} size={40} />
                    : <CoPilotMark size={40} />}
                  <span style={{ fontSize: 24, lineHeight: '1.3', fontWeight: 700, color: '#001344' }}>{attached ? attached.name : 'Welcome to CoPilot HR,'}</span>
                  <Typography size="base" color={attached && !attached.description.trim() ? 'neutral-darken2' : 'neutral-darken5'}>
                    {attached
                      ? attached.description.trim() || 'This workspace has no description yet.'
                      : 'as an artificial intelligence, I base the answers to your questions on the current, legally sound knowledge of Haufe XY Office and back them up with sources.'}
                  </Typography>
                  <div style={{ width: 64, height: 1, backgroundColor: colorPalette.neutral.lighten1 }} />
                  <Typography size="base-sm" color="neutral-darken2">
                    <span style={{ fontWeight: fontWeight.SEMIBOLD }}>Note</span> The AI can make mistakes. Check the answer against the cited sources and your own expertise.
                  </Typography>
                </div>

                <MentionComposer
                  value={question}
                  onChange={setQuestion}
                  onSend={handleWelcomeSend}
                  placeholder={attached ? `Ask about ${attached.name}` : 'Ask a question, or type @ to target a workspace'}
                  workspaces={workspaces}
                  onPick={ws => setWorkspaceId(ws.id)}
                  seedAttachments={attachDocs}
                  onSeedAttachmentsConsumed={() => setAttachDocs(NO_ATTACHMENTS)}
                />
              </div>
            </div>

            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: spacing(4) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
                <Icon type={iconType.LockFilled} size={16} color="blue-base" />
                <Typography size="base-sm" color="neutral-darken3">
                  Your data is private and secure. <span style={{ color: colorPalette.blue.base, cursor: 'pointer' }}>Learn more</span>
                </Typography>
              </div>
            </div>
          </>
        )}
      </div>

      </div>
      </div>

      {/* The sources panel takes the summary's place while it's open. */}
      {panelSources && sourcesView ? (
        <SourcesPanelSlot>
        <SourcesPanel
          key={`${sourcesView.messageId}-${sourcesView.opened}`}
          sources={panelSources}
          lang="en"
          focus={sourcesView.focus}
          filter={sourcesView.filter}
          onFilter={filter => setSourcesView(prev => prev && { ...prev, filter })}
          onClose={() => setSourcesView(null)}
        />
        </SourcesPanelSlot>
      ) : attached && <WorkspaceSummary workspace={attached} />}

      {/* Same dialog as on the Workspaces page; the new workspace becomes the current one. */}
      <SpaceFormModal
        open={createOpen}
        mode="create"
        noun="Workspace"
        showPhotoUpload={false}
        showType={false}
        organisationAccess
        onClose={() => setCreateOpen(false)}
        onSubmit={values => { selectWorkspace(onCreateWorkspace(values)); setCreateOpen(false) }}
      />
    </div>
  )
}

/** Workspace summary beside the chat: everything CoPilot answers from, at a glance. */
function WorkspaceSummary({ workspace }: { workspace: WorkspaceReference }) {
  const navigate = useNavigate()
  const contextValue = [
    workspace.hasBackground && 'Background',
    workspace.details > 0 && plural(workspace.details, 'detail'),
  ].filter(Boolean).join(' · ') || 'None'
  const rows: { icon: string; label: string; value: string | number; children?: ReactNode }[] = [
    { icon: iconType.FolderOutlined, label: 'Documents', value: workspace.documents },
    { icon: iconType.InfoCircleOutlined, label: 'Context', value: contextValue },
    {
      icon: iconType.ShieldCheckOutlined, label: 'Guardrails', value: workspace.guardrails.length,
      children: workspace.guardrails.length > 0 && (
        <ul style={{ margin: `${spacing(1)}px 0 0`, paddingLeft: spacing(5), display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
          {workspace.guardrails.map(g => <li key={g}><Typography size="base-sm" color="neutral-darken3">{g}</Typography></li>)}
        </ul>
      ),
    },
    { icon: iconType.BookmarkOutlined, label: 'Bookmarks', value: workspace.bookmarks },
    { icon: iconType.ArticleOutlined, label: 'Templates', value: workspace.templates },
  ]

  return (
    // A container at the top right, beside the header and chat, as tall as its content (scrolls inside if needed).
    <div style={{
      width: 300, flexShrink: 0, alignSelf: 'flex-start', margin: spacing(4), maxHeight: `calc(100% - ${spacing(8)}px)`, overflowY: 'auto',
      padding: spacing(5), display: 'flex', flexDirection: 'column', gap: spacing(4),
      backgroundColor: colorPalette.white, border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 12,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
        <Typography size="base" weight={fontWeight.SEMIBOLD} color="neutral-darken5">In this workspace</Typography>
        <Typography size="base-sm" color="neutral-darken2">CoPilot answers from all of this.</Typography>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((row, i) => (
          <div key={row.label} style={{ padding: `${spacing(3)}px 0`, borderTop: i ? `1px solid ${colorPalette.neutral.lighten2}` : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              <Icon type={row.icon as never} size={16} color="neutral-darken3" />
              <span style={{ flex: 1, fontSize: 14, color: colorPalette.neutral.darken5 }}>{row.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken5 }}>{row.value}</span>
            </div>
            {row.children}
          </div>
        ))}
      </div>
      <ButtonTertiary width={buttonWidth.EXPANDED} rightIcon={iconType.ChevronRightOutlined} onClick={() => navigate(workspace.path)}>
        Open workspace
      </ButtonTertiary>
    </div>
  )
}
