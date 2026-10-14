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
  toastPlacements,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, fontWeight, renderLiteMarkdown, SpaceAvatar, SpaceFormModal, type OutgoingAttachment, type Space, type SpaceFormValues } from '../workspaces/shared'
import { MessageComposer } from '../workspaces/Version6'
import { CoPilotMark } from '../workspaces/CoPilotPage'
import type { WorkspaceReference } from './workspaceModel'

/**
 * Hackathon Oct '26 — CoPilot for Version 5: the German version of Version 4's CoPilot page
 * ("Arbeitsbereich" for workspace). Code comments stay in English; everything on screen is German.
 * Note: the question box itself (MessageComposer from workspaces/Version6) is shared and keeps its
 * own English button labels.
 *
 * Hackathon Oct '26 — CoPilot for Version 4: the shared CoPilot page with the Workspace dropdown
 * directly under the CoPilot HR logo. Everything else as below.
 *
 * Hackathon Oct '26 — CoPilot: the CoPilot HR start page (screenshots/Bildschirmfoto 2026-10-14 um 13.13.19.png).
 * Built from Launch Pad 2's CoPilot HR page, kept as its own copy so the two can diverge.
 *
 * - Chat panel: CoPilot HR, New Chat, title search, Prompt Templates, the Workspace dropdown,
 *   then the current workspace's chats under Today / Yesterday. "My Chats" holds the chats that aren't tied to a workspace.
 * - Welcome: CoPilot mark, "Welcome to CoPilot HR," with the sources note, then the question composer.
 *   In a workspace, the mark, heading and intro become the workspace icon, its name and its description,
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

const SIMULATED = '\n\n(Simulierte Antwort für den Prototyp — für echte Antworten einen Assistenten mit den tatsächlichen HR-Daten verbinden.)'

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
  session('home-today-1', 'Heute', 'Mitarbeiter-Onboarding',
    'Was sollte ein Onboarding-Plan für die erste Woche eines neuen Teammitglieds enthalten?',
    'Eine gute erste Woche deckt drei Dinge ab: **die Grundlagen** (Vertrag unterschrieben, Arbeitsmittel und Zugänge am ersten Tag bereit), **die Menschen** (eine feste Ansprechperson als Pate sowie kurze Kennenlerntermine mit dem Team und wichtigen Kontakten) und **eine erste kleine Aufgabe**, die bis Freitag erledigt werden kann. Schließen Sie die Woche mit einem 30-minütigen Gespräch ab, in dem Sie die Ziele für die ersten 90 Tage vereinbaren.'),
  session('home-today-2', 'Heute', 'Urlaubsanträge prüfen',
    'Zwei Personen aus demselben Team haben für dieselben zwei Wochen im August Urlaub beantragt. Wie entscheide ich?',
    'Beginnen Sie mit Ihrer Urlaubsregelung: Viele Unternehmen geben nach **sozialen Gesichtspunkten** Vorrang – etwa Beschäftigten mit schulpflichtigen Kindern während der Schulferien (§ 7 Abs. 1 BUrlG). Hat niemand Vorrang, sprechen Sie mit beiden über eine Aufteilung des Zeitraums oder einen jährlichen Wechsel und dokumentieren Sie die Entscheidung samt Begründung.'),
  session('home-yesterday-1', 'Gestern', 'Leistungsbeurteilung vorbereiten',
    'Wie bereite ich mich auf eine jährliche Leistungsbeurteilung vor?',
    'Sammeln Sie **Belege über das ganze Jahr**, nicht nur aus den letzten Wochen: die zuletzt vereinbarten Ziele, Ergebnisse, Feedback von Kolleginnen und Kollegen sowie Notizen aus Einzelgesprächen. Formulieren Sie zwei bis drei Stärken und ein bis zwei Entwicklungsfelder mit konkreten Beispielen und schicken Sie der Person eine Woche vorher einen kurzen Selbsteinschätzungsbogen.'),
  session('home-yesterday-2', 'Gestern', 'Stellenanzeige formulieren',
    'Schreibe eine Stellenanzeige für eine Lohnbuchhaltung (Vollzeit, Freiburg).',
    "**Lohnbuchhalter (m/w/d) — Vollzeit, Freiburg**\n\nSie verantworten die monatliche Entgeltabrechnung für rund 400 Beschäftigte, übernehmen die Meldungen an Sozialversicherungsträger und Finanzbehörden und sind erste Ansprechperson für Fragen rund um die Abrechnung. Sie bringen eine Ausbildung als Lohnbuchhalter oder eine vergleichbare Qualifikation, Erfahrung mit DATEV oder SAP HCM und eine sorgfältige Arbeitsweise mit. Wir bieten hybrides Arbeiten, 30 Tage Urlaub und eine betriebliche Altersvorsorge."),
  session('home-yesterday-3', 'Gestern', 'Mitarbeitergespräch planen',
    'Wie strukturiere ich ein einstündiges Mitarbeitergespräch sinnvoll?',
    "Eine einfache Struktur: **5 Minuten** zum Einstieg, **20 Minuten** für die Sicht der Mitarbeiterin oder des Mitarbeiters auf das Jahr, **15 Minuten** für Ihr Feedback, **15 Minuten**, um Ziele und Entwicklungsschritte zu vereinbaren, und **5 Minuten** für die Zusammenfassung. Schicken Sie anschließend ein schriftliches Protokoll."),
]

/** German count + noun, e.g. plural(1, 'Dokument', 'Dokumente') → "1 Dokument". */
function plural(n: number, one: string, many: string) { return `${n} ${n === 1 ? one : many}` }

/** Short list of what the workspace hands CoPilot, e.g. "3 Dokumente · Kontext · 2 Leitplanken". */
function workspaceSummary(ws: WorkspaceReference): string {
  return [
    plural(ws.documents, 'Dokument', 'Dokumente'),
    (ws.hasBackground || ws.details > 0) && 'Kontext',
    ws.guardrails.length > 0 && plural(ws.guardrails.length, 'Leitplanke', 'Leitplanken'),
    ws.bookmarks > 0 && plural(ws.bookmarks, 'Lesezeichen', 'Lesezeichen'),
    ws.templates > 0 && plural(ws.templates, 'Vorlage', 'Vorlagen'),
  ].filter(Boolean).join(' · ')
}

function makeCannedReply(question: string, ws?: WorkspaceReference): string {
  if (ws) {
    const rules = ws.guardrails.length ? ` Unter Beachtung der Leitplanken dieses Arbeitsbereichs: ${ws.guardrails.map(g => `*${g}*`).join('; ')}.` : ''
    return `Antwort aus dem Arbeitsbereich **${ws.name}** (${workspaceSummary(ws)}).${rules}\n\n${makeCannedReply(question)}`
  }
  return `Zu Ihrer Frage – „${question.length > 80 ? `${question.slice(0, 80)}…` : question}“ – ein erster Ansatz: Ich würde die einschlägigen arbeitsrechtlichen Vorschriften und vorhandene interne HR-Richtlinien prüfen und das Ergebnis mit der tatsächlichen Personalakte abgleichen, bevor Sie etwas abschließend entscheiden.${SIMULATED}`
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
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThumbsUpOutlined} ariaLabel="Hilfreich" />
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThumbsDownOutlined} ariaLabel="Nicht hilfreich" />
        <ButtonGhost
          shape={buttonShapes.SQUARE}
          ariaLabel={copied ? 'Kopiert' : 'Kopieren'}
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
            <Typography size="base-small" color="neutral-darken2" weight={fontWeight.SEMIBOLD}>Arbeitsbereiche</Typography>
          </div>
          {matches.length === 0 ? (
            <div style={{ padding: `${spacing(2)}px` }}>
              <Typography size="base-sm" color="neutral-darken2">
                {workspaces.length === 0 ? 'Noch keine Arbeitsbereiche – legen Sie einen unter Arbeitsbereiche an.' : 'Kein passender Arbeitsbereich.'}
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
        lang="de"
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
    <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), minWidth: 0 }}>
      <span style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HackathonCoPilotPageV5({ workspaces, onCreateWorkspace, onSaveDocuments }: {
  workspaces: WorkspaceReference[]
  // "Create workspace" at the foot of the workspace dropdown; returns the new workspace's id.
  onCreateWorkspace: (values: SpaceFormValues) => string
  // Files sent with a question while in a workspace are saved to that workspace's documents.
  onSaveDocuments: (workspaceId: string, files: File[]) => void
}) {
  const { notification } = useNotifications()
  /** Saves the files sent with a message to the chat's workspace — only once the message has gone. */
  const saveToWorkspace = (ws: WorkspaceReference | null | undefined, attachments: OutgoingAttachment[]) => {
    const files = attachments.flatMap(a => a.kind === 'file' ? [a.file] : [])
    if (!ws || files.length === 0) return
    onSaveDocuments(ws.id, files)
    notification.success({
      title: files.length === 1 ? `„${files[0].name}“ in ${ws.name} gespeichert` : `${files.length} Dokumente in ${ws.name} gespeichert`,
      placement: toastPlacements.BOTTOM_LEFT,
      duration: 3,
    })
  }
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
      id: nextId('chat'), day: 'Heute', title: text.length > 60 ? `${text.slice(0, 60)}…` : text, workspace: ws,
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
    const title = text.length > 60 ? `${text.slice(0, 60)}…` : text || 'Neuer Chat'
    const ws = attached ?? undefined
    setSessions(prev => [{ id, day: 'Heute', title, workspace: ws, messages: reply(text, attachments, ws) }, ...prev])
    saveToWorkspace(ws, attachments)
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
    saveToWorkspace(activeSession.workspace, attachments)
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
    // Main area on the theme's neutral-lighten5; the chat panel (a menu) stays white.
    <div style={{ display: 'flex', height: '100%', backgroundColor: colorPalette.neutral.lighten5 }}>
      {panelOpen && (
        <div style={{
          width: 268, flexShrink: 0, borderRight: `1px solid ${colorPalette.neutral.lighten1}`, backgroundColor: colorPalette.white,
          display: 'flex', flexDirection: 'column', padding: `${spacing(4)}px ${spacing(4)}px`, gap: spacing(5), overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <CoPilotMark size={32} />
            <span style={{ fontSize: 18, fontWeight: 600, color: '#001344' }}>CoPilot HR</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
            <SectionLabel>Arbeitsbereich</SectionLabel>
            {/* The DS Select has no borderless option, so the outline is removed for this one dropdown. */}
            <style>{`.copilot-workspace-select .goat-select-selector { border-color: transparent !important; box-shadow: none !important; padding-left: ${spacing(2)}px !important; }`}</style>
            <div className="copilot-workspace-select">
            <Select
              value={workspaceId}
              options={[
                { label: <OptionLabel icon={<Icon type={iconType.CommentOutlined} size={16} color="neutral-darken3" />}>Meine Chats</OptionLabel>, value: GENERAL },
                ...workspaces.map(w => ({
                  // Workspaces here have no photo, so the avatar only needs the name for its initials.
                  label: <OptionLabel icon={<SpaceAvatar space={{ id: w.id, name: w.name } as Space} size={20} />}>{w.name}</OptionLabel>,
                  value: w.id,
                })),
                // The last option is an action, so it gets a + and link colour instead of looking like a workspace.
                {
                  label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.blue.base, fontWeight: 600 }}><Icon type={iconType.PlusOutlined} size={16} color="inherit" />Arbeitsbereich erstellen</span>,
                  value: CREATE_WORKSPACE,
                },
              ]}
              onChange={v => v === CREATE_WORKSPACE ? setCreateOpen(true) : selectWorkspace(v as string)}
            />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
            <ButtonPrimary width={buttonWidth.EXPANDED} leftIcon={iconType.CommentOutlined} onClick={() => { setQuestion(''); setActiveId(null) }}>
              Neuer Chat
            </ButtonPrimary>
            <SearchBar placeholder="Titel durchsuchen" value={search} onChange={setSearch} width={searchbarWidth.EXPANDED} />
          </div>

          <PanelRow icon={iconType.NoteOutlined} label="Prompt-Vorlagen" />

          {filteredGroups.length === 0 ? (
            <div style={{ padding: `${spacing(4)}px ${spacing(2)}px` }}>
              <Typography size="base-sm" color="neutral-darken2" align="center">
                {search.trim() ? 'Keine Chats zu Ihrer Suche.' : attached ? `Noch keine Chats in ${attached.name}.` : 'Noch keine Chats.'}
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
                  placeholder="Folgefrage stellen oder mit @ einen Arbeitsbereich wählen"
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
                    ? <div style={{ display: 'flex', color: '#001344' }}><Icon type={iconType.ElementsOutlined} size={40} color="inherit" /></div>
                    : <CoPilotMark size={40} />}
                  <span style={{ fontSize: 24, lineHeight: '1.3', fontWeight: 700, color: '#001344' }}>{attached ? attached.name : 'Willkommen im CoPilot HR,'}</span>
                  <Typography size="base" color={attached && !attached.description.trim() ? 'neutral-darken2' : 'neutral-darken5'}>
                    {attached
                      ? attached.description.trim() || 'Dieser Arbeitsbereich hat noch keine Beschreibung.'
                      : 'als Künstliche Intelligenz basiere ich die Antworten auf Ihre Fragen auf dem aktuellen und rechtssicheren Wissen von Haufe XY Office und belege diese mit Quellen.'}
                  </Typography>
                  <div style={{ width: 64, height: 1, backgroundColor: colorPalette.neutral.lighten1 }} />
                  <Typography size="base-sm" color="neutral-darken2">
                    <span style={{ fontWeight: fontWeight.SEMIBOLD }}>Hinweis</span> Die KI kann sich irren. Prüfen Sie die Antwort mit den angegebenen Quellen und Ihrer eigenen Expertise.
                  </Typography>
                </div>

                <MentionComposer
                  value={question}
                  onChange={setQuestion}
                  onSend={handleWelcomeSend}
                  placeholder={attached ? `Fragen Sie zu ${attached.name}` : 'Frage stellen oder mit @ einen Arbeitsbereich wählen'}
                  workspaces={workspaces}
                  onPick={ws => setWorkspaceId(ws.id)}
                />
              </div>
            </div>

            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: spacing(4) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
                <Icon type={iconType.LockFilled} size={16} color="blue-base" />
                <Typography size="base-sm" color="neutral-darken3">
                  Ihre Daten sind privat und sicher. <span style={{ color: colorPalette.blue.base, cursor: 'pointer' }}>Mehr erfahren</span>
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
        lang="de"
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
    workspace.hasBackground && 'Hintergrund',
    workspace.details > 0 && plural(workspace.details, 'Detail', 'Details'),
  ].filter(Boolean).join(' · ') || 'Keine'
  const rows: { icon: string; label: string; value: string | number; children?: ReactNode }[] = [
    { icon: iconType.FolderOutlined, label: 'Dokumente', value: workspace.documents },
    { icon: iconType.InfoCircleOutlined, label: 'Kontext', value: contextValue },
    {
      icon: iconType.ShieldCheckOutlined, label: 'Leitplanken', value: workspace.guardrails.length,
      children: workspace.guardrails.length > 0 && (
        <ul style={{ margin: `${spacing(1)}px 0 0`, paddingLeft: spacing(5), display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
          {workspace.guardrails.map(g => <li key={g}><Typography size="base-sm" color="neutral-darken3">{g}</Typography></li>)}
        </ul>
      ),
    },
    { icon: iconType.BookmarkOutlined, label: 'Lesezeichen', value: workspace.bookmarks },
    { icon: iconType.ArticleOutlined, label: 'Vorlagen', value: workspace.templates },
  ]

  return (
    // A card floating at the top right of the main view, sized to its content.
    <div style={{
      width: 280, flexShrink: 0, alignSelf: 'flex-start', margin: spacing(4), maxHeight: `calc(100% - ${spacing(8)}px)`, overflowY: 'auto',
      padding: spacing(4), display: 'flex', flexDirection: 'column', gap: spacing(4),
      backgroundColor: colorPalette.white, border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 12,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
        <Typography size="base" weight={fontWeight.SEMIBOLD} color="neutral-darken5">In diesem Arbeitsbereich</Typography>
        <Typography size="base-sm" color="neutral-darken2">CoPilot antwortet auf Basis all dieser Inhalte.</Typography>
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
        Arbeitsbereich öffnen
      </ButtonTertiary>
    </div>
  )
}
