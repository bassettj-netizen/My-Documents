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
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, fontWeight, renderLiteMarkdown, SpaceAvatar, SpaceFormModal, type OutgoingAttachment, type Space, type SpaceFormValues } from '../workspaces/shared'
import { MessageComposer } from '../workspaces/Version6'
import { CoPilotMark } from '../workspaces/CoPilotPage'
import type { WorkspaceReference } from './workspaceModel'

/**
 * Hackathon Oct '26 — CoPilot: the CoPilot HR start page (screenshots/Bildschirmfoto 2026-10-14 um 13.13.19.png).
 * Built from Launch Pad 2's CoPilot HR page, kept as its own copy so the two can diverge.
 *
 * - Chat panel: CoPilot HR, New Chat, title search, Prompt Templates, the Workspace dropdown,
 *   then the current workspace's chats under Today / Yesterday. "My Chats" holds the chats that aren't tied to a workspace.
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

type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string; attachmentNames?: string[] }
type ChatSession = { id: string; title: string; day: string; messages: ChatMsg[]; workspace?: WorkspaceReference }

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

function ChatBubbleAssistant({ message }: { message: ChatMsg }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <Typography size="base" color="neutral-darken5">{renderLiteMarkdown(message.content)}</Typography>
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

/** The workspace a chat answers from: name plus what it hands CoPilot. */
function WorkspaceChip({ workspace }: { workspace: WorkspaceReference }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: spacing(2), alignSelf: 'flex-start', maxWidth: '100%',
      padding: `${spacing(1)}px ${spacing(3)}px`,
      borderRadius: 8, backgroundColor: colorPalette.blue.lighten5, border: `1px solid ${colorPalette.blue.lighten3}`,
    }}>
      <Icon type={iconType.ElementsOutlined} size={16} color="blue-darken1" />
      <span style={{ fontSize: 14, color: colorPalette.neutral.darken5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <strong>{workspace.name}</strong>
        <span style={{ color: colorPalette.neutral.darken2 }}> · {workspaceSummary(workspace)}</span>
      </span>
    </div>
  )
}

/** The "@query" being typed at the end of the field, if any — the @ must start the field or follow a space. */
function mentionQuery(text: string): string | null {
  const match = /(?:^|\s)@([^@\n]{0,40})$/.exec(text)
  return match ? match[1] : null
}

/**
 * The CoPilot question box plus an @ picker: typing @ lists the workspaces above the box, filtered by
 * what follows it. Keys are caught on the way down to the field so ↑/↓/Enter drive the list while it's open.
 */
function MentionComposer({ value, onChange, workspaces, onPick, ...composer }: Omit<ComponentProps<typeof MessageComposer>, 'seedAttachments' | 'onSeedAttachmentsConsumed' | 'autoSize'> & {
  workspaces: WorkspaceReference[]
  onPick: (ws: WorkspaceReference) => void
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
        seedAttachments={[]}
        onSeedAttachmentsConsumed={() => {}}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HackathonCoPilotPage({ workspaces, onCreateWorkspace }: {
  workspaces: WorkspaceReference[]
  // "Create workspace" at the foot of the workspace dropdown; returns the new workspace's id.
  onCreateWorkspace: (values: SpaceFormValues) => string
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [panelOpen, setPanelOpen] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [question, setQuestion] = useState('')
  const routeState = location.state as { initialQuestion?: string; workspaceRef?: WorkspaceReference } | null
  // The current workspace: whose chats the panel lists and what new chats answer from.
  const [workspaceId, setWorkspaceId] = useState<string>(routeState?.workspaceRef?.id ?? GENERAL)
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
  const [sessions, setSessions] = useState<ChatSession[]>(() => handedOver ? [handedOver, ...INITIAL_SESSIONS] : INITIAL_SESSIONS)
  const [activeId, setActiveId] = useState<string | null>(handedOver?.id ?? null)

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
    setActiveId(id)
    setQuestion('')
  }

  // Clear the handed-over question so a reload doesn't ask it again.
  useEffect(() => {
    if (routeState) navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFollowUp = (attachments: OutgoingAttachment[]) => {
    if (!activeSession) return
    const text = question.trim()
    setSessions(prev => prev.map(s => s.id !== activeSession.id ? s : { ...s, messages: [...s.messages, ...reply(text, attachments, s.workspace)] }))
    setQuestion('')
  }

  const panelToggle = (
    <ButtonGhost
      shape={buttonShapes.SQUARE}
      leftIcon={panelOpen ? iconType.ChevronLeftOutlined : iconType.ChevronRightOutlined}
      onClick={() => setPanelOpen(v => !v)}
    />
  )

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: colorPalette.white }}>
      {panelOpen && (
        <div style={{
          width: 268, flexShrink: 0, borderRight: `1px solid ${colorPalette.neutral.lighten1}`,
          display: 'flex', flexDirection: 'column', padding: `${spacing(4)}px ${spacing(4)}px`, gap: spacing(5), overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <CoPilotMark size={32} />
            <span style={{ fontSize: 18, fontWeight: 600, color: '#001344' }}>CoPilot HR</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
            <ButtonPrimary width={buttonWidth.EXPANDED} leftIcon={iconType.CommentOutlined} onClick={() => { setQuestion(''); setActiveId(null) }}>
              New Chat
            </ButtonPrimary>
            <SearchBar placeholder="Search titles" value={search} onChange={setSearch} width={searchbarWidth.EXPANDED} />
          </div>

          <PanelRow icon={iconType.NoteOutlined} label="Prompt Templates" />

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
            `}</style>
            <div className="copilot-workspace-select">
            <Select
              value={workspaceId}
              options={[
                { label: <OptionLabel icon={<Icon type={iconType.CommentOutlined} size={16} color="inherit" />}>My Chats</OptionLabel>, value: GENERAL },
                ...workspaces.map(w => ({
                  // Workspaces here have no photo, so the avatar only needs the name for its initials.
                  label: <OptionLabel icon={<SpaceAvatar space={{ id: w.id, name: w.name } as Space} size={20} />}>{w.name}</OptionLabel>,
                  value: w.id,
                })),
                // The last option is an action, so it gets a + and link colour instead of looking like a workspace.
                {
                  label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.blue.base, fontWeight: 600 }}><Icon type={iconType.PlusOutlined} size={16} color="inherit" />Create workspace</span>,
                  value: CREATE_WORKSPACE,
                },
              ]}
              onChange={v => v === CREATE_WORKSPACE ? setCreateOpen(true) : selectWorkspace(v as string)}
            />
            </div>
          </div>

          {filteredGroups.length === 0 ? (
            <div style={{ padding: `0 ${spacing(2)}px` }}>
              <Typography size="base-sm" color="neutral-darken2">
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
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeSession ? (
          <>
            <div style={{ flexShrink: 0, padding: `${spacing(4)}px`, display: 'flex', alignItems: 'center', gap: spacing(3) }}>
              {panelToggle}
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
                <Typography size="base-lg" weight={fontWeight.SEMIBOLD} color="neutral-darken5" maxLines={1}>{activeSession.title}</Typography>
                {activeSession.workspace && <WorkspaceChip workspace={activeSession.workspace} />}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div style={{ maxWidth: 840, width: '100%', padding: `${spacing(4)}px ${spacing(8)}px`, display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
                {activeSession.messages.map(m => m.role === 'user' ? <ChatBubbleUser key={m.id} message={m} /> : <ChatBubbleAssistant key={m.id} message={m} />)}
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
                  onPick={ws => { setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, workspace: ws } : s)); setWorkspaceId(ws.id) }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ flexShrink: 0, padding: `${spacing(4)}px` }}>{panelToggle}</div>

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

      {attached && <WorkspaceSummary workspace={attached} />}

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

/** Right-hand panel in a workspace: everything CoPilot answers from, at a glance. */
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
    // A card floating at the top right of the main view, sized to its content.
    <div style={{
      width: 280, flexShrink: 0, alignSelf: 'flex-start', margin: spacing(4), maxHeight: `calc(100% - ${spacing(8)}px)`, overflowY: 'auto',
      padding: spacing(4), display: 'flex', flexDirection: 'column', gap: spacing(4),
      backgroundColor: colorPalette.white, border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 12,
      boxShadow: '0 8px 24px rgba(0, 19, 68, 0.10)',
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
