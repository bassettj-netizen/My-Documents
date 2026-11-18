import { useEffect, useMemo, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ButtonGhost,
  ButtonPrimary,
  buttonShapes,
  buttonWidth,
  Icon,
  iconType,
  SearchBar,
  searchbarWidth,
  Typography,
  buttonSizes,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  dropdownItemTypes,
  Input,
  Avatar,
  avatarShapeEnum,
  avatarSizeEnum,
  Modal,
  modalVariants,
  buttonVariants,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, fontWeight, renderLiteMarkdown, SpaceAvatar, SpaceFormModal, getInitials, type DocSource, type MetadataDocument, type OutgoingAttachment, type Space, type SpaceFormValues } from '../workspaces/shared'
import type { AreaContent } from './content/types'
import { defineText, useArea, usePrototype, useText } from './context'
import { MessageComposer } from '../workspaces/Version6'
import { CoPilotMark } from '../workspaces/CoPilotPage'
import type { WorkspaceReference } from '../hackathon/workspaceModel'
import { useProcessingUpload } from '../hackathon/uploadToasts'
import { AnswerBody, SourceChips, SourcesPanel, SourcesPanelSlot, type SourceFilter } from './AnswerSources'
import { buildSources, placeMarkers, type AnswerSource } from './sourceData'
import { AddDocumentMenu, MyDocumentsPicker, NewChip, WorkspaceAccessIcon, WorkspaceSelector, WorkspacesPromo, type PickableDocument } from './CoPilotWorkspaceMenu'
import { CollapseStrip } from './SidebarChevron'

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
 *
 * Workspaces User Testing Nov '26: always the Versions 19/21 ("generic") CoPilot — the older CoPilot HR branches are
 * gone. Every string is in TEXT (English and German); the sample chats, canned advice and sources come from the
 * subject area (useArea().copilot).
 */

const GENERAL = 'general'
// The workspaces promotion stays dismissed while the prototype is open (Workspaces 2.0 Versions 19 and 21).
let promoDismissed = false

export type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string; attachmentNames?: string[] }
export type ChatSession = { id: string; title: string; day: string; messages: ChatMsg[]; workspace?: WorkspaceReference }

let idCounter = 0
function nextId(prefix: string) { idCounter += 1; return `${prefix}-home-${idCounter}` }

const TEXT = defineText({
  today: 'Today',
  yesterday: 'Yesterday',
  newChat: 'New chat',
  thinking: 'CoPilot is working on an answer…',
  searchTitles: 'Search titles',
  promptTemplates: 'Prompt templates',
  workspace: 'Workspace',
  myWorkspace: 'My workspace',
  myWorkspaceDescription: 'Your default space for all chats',
  noChatsMatch: 'No chats match your search.',
  noChatsIn: (workspace: string) => `No chats in ${workspace} yet.`,
  noChats: 'No chats yet.',
  expand: 'Expand',
  collapse: 'Collapse',
  // Chat menu and header
  moveToWorkspace: 'Move to workspace',
  savePdf: 'Save PDF',
  saveAsPdf: 'Save as PDF',
  rename: 'Rename',
  delete: 'Delete',
  actions: 'Actions',
  actionsFor: (title: string) => `Actions for ${title}`,
  // @ picker
  workspaces: 'Workspaces',
  noWorkspacesYet: 'No workspaces yet — create one under Workspaces.',
  noWorkspaceMatches: 'No workspace matches.',
  // Welcome
  welcome: 'Welcome to CoPilot',
  welcomeText: 'As an AI assistant, I base my answers on Haufe’s current, legally sound knowledge and back them up with sources.',
  noDescription: 'This workspace has no description yet.',
  note: 'Note',
  noteText: 'The AI can make mistakes. Check the answer against the cited sources and your own expertise.',
  askPlaceholder: 'Ask a question, or type @ to target a workspace',
  askAboutPlaceholder: (workspace: string) => `Ask about ${workspace}`,
  followUpPlaceholder: 'Ask a follow-up question, or type @ to target a workspace',
  // Privacy
  privacyNote: 'Your data is private and secure.',
  learnMore: 'Learn more',
  privacyTitle: 'Your data is private and secure',
  privacyIntro: 'The highest data protection standards are essential for using our AI assistant professionally. Here’s an overview of our security architecture.',
  privacyPoints: [
    { title: 'Secure data storage in Germany', text: 'All data is stored securely on European servers. Our data centre is certified to ISO 27001, 27017 and 27018, SOC 2 and C5, making it one of the most secure data centres in the world.' },
    { title: 'Data encryption', text: 'All data is stored encrypted in the data centre (AES-256) and transferred to it encrypted (TLS 1.3).' },
    { title: 'No training on your data', text: 'Your chats are not used to train language models.' },
  ],
  close: 'Close',
  // What a workspace hands CoPilot, e.g. "3 documents · context · 2 guardrails"
  documents: (n: number) => `${n} document${n === 1 ? '' : 's'}`,
  context: 'context',
  guardrails: (n: number) => `${n} guardrail${n === 1 ? '' : 's'}`,
  bookmarks: (n: number) => `${n} bookmark${n === 1 ? '' : 's'}`,
  templates: (n: number) => `${n} template${n === 1 ? '' : 's'}`,
  // The canned reply
  answeringFrom: (workspace: string, summary: string) => `Answering from the **${workspace}** workspace (${summary}).`,
  followingGuardrails: (rules: string) => ` Following this workspace's guardrails: ${rules}.`,
  basedOnQuestion: (question: string, advice: string) => `Based on your question — "${question}" — here's a starting point: ${advice}`,
}, {
  today: 'Heute',
  yesterday: 'Gestern',
  newChat: 'Neuer Chat',
  thinking: 'CoPilot erstellt eine Antwort…',
  searchTitles: 'Titel durchsuchen',
  promptTemplates: 'Prompt-Vorlagen',
  workspace: 'Arbeitsbereich',
  myWorkspace: 'Mein Arbeitsbereich',
  myWorkspaceDescription: 'Ihr Standardbereich für alle Chats',
  noChatsMatch: 'Keine Chats zu Ihrer Suche.',
  noChatsIn: (workspace: string) => `Noch keine Chats in ${workspace}.`,
  noChats: 'Noch keine Chats.',
  expand: 'Ausklappen',
  collapse: 'Einklappen',
  moveToWorkspace: 'In Arbeitsbereich verschieben',
  savePdf: 'Als PDF speichern',
  saveAsPdf: 'Als PDF speichern',
  rename: 'Umbenennen',
  delete: 'Löschen',
  actions: 'Aktionen',
  actionsFor: (title: string) => `Aktionen für ${title}`,
  workspaces: 'Arbeitsbereiche',
  noWorkspacesYet: 'Noch keine Arbeitsbereiche – legen Sie einen unter Arbeitsbereiche an.',
  noWorkspaceMatches: 'Kein passender Arbeitsbereich.',
  welcome: 'Willkommen bei CoPilot',
  welcomeText: 'Als KI-Assistent stütze ich meine Antworten auf das aktuelle, rechtssichere Wissen von Haufe und belege sie mit Quellen.',
  noDescription: 'Dieser Arbeitsbereich hat noch keine Beschreibung.',
  note: 'Hinweis',
  noteText: 'Die KI kann sich irren. Prüfen Sie die Antwort anhand der angegebenen Quellen und Ihrer eigenen Expertise.',
  askPlaceholder: 'Frage stellen oder mit @ einen Arbeitsbereich wählen',
  askAboutPlaceholder: (workspace: string) => `Fragen zu ${workspace} stellen`,
  followUpPlaceholder: 'Folgefrage stellen oder mit @ einen Arbeitsbereich wählen',
  privacyNote: 'Ihre Daten sind privat und sicher.',
  learnMore: 'Mehr erfahren',
  privacyTitle: 'Ihre Daten sind privat und sicher',
  privacyIntro: 'Für den professionellen Einsatz unseres KI-Assistenten sind höchste Datenschutzstandards unerlässlich. Die folgenden Informationen zeigen Ihnen unsere Sicherheitsarchitektur im Überblick.',
  privacyPoints: [
    { title: 'Sichere Speicherung der Daten in Deutschland', text: 'Alle Daten liegen sicher auf europäischen Servern. Unser Rechenzentrum hat Zertifizierungen nach ISO 27001, 27017, 27018, SOC 2 sowie C5 und ist damit eines der sichersten Rechenzentren der Welt.' },
    { title: 'Verschlüsselung der Daten', text: 'Alle Daten werden verschlüsselt im Rechenzentrum gespeichert (AES 256) und verschlüsselt ins Rechenzentrum übertragen (TLS 1.3).' },
    { title: 'Kein Training mit Ihren Daten', text: 'Ihre Chats werden nicht zum Training von Sprachmodellen genutzt.' },
  ],
  close: 'Schließen',
  documents: (n: number) => `${n} ${n === 1 ? 'Dokument' : 'Dokumente'}`,
  context: 'Kontext',
  guardrails: (n: number) => `${n} ${n === 1 ? 'Leitplanke' : 'Leitplanken'}`,
  bookmarks: (n: number) => `${n} Lesezeichen`,
  templates: (n: number) => `${n} ${n === 1 ? 'Vorlage' : 'Vorlagen'}`,
  answeringFrom: (workspace: string, summary: string) => `Antwort aus dem Arbeitsbereich **${workspace}** (${summary}).`,
  followingGuardrails: (rules: string) => ` Unter Beachtung der Leitplanken dieses Arbeitsbereichs: ${rules}.`,
  basedOnQuestion: (question: string, advice: string) => `Zu Ihrer Frage – „${question}“ – ein erster Ansatz: ${advice}`,
})
type Text = typeof TEXT.en

function session(id: string, day: string, title: string, question: string, answer: string): ChatSession {
  return {
    id, day, title,
    messages: [
      { id: `${id}-u`, role: 'user', content: question },
      { id: `${id}-a`, role: 'assistant', content: answer },
    ],
  }
}

/** The area's sample chats, under Today / Yesterday, each answer ending in the simulated-response note. */
function initialSessions(copilot: AreaContent['copilot'], t: Text): ChatSession[] {
  return copilot.chats.map(c => session(c.id, c.day === 'today' ? t.today : t.yesterday, c.title, c.question, `${c.answer}\n\n(${copilot.simulatedNote})`))
}

/** Short list of what the workspace hands CoPilot, e.g. "3 documents · context · 2 guardrails". */
function workspaceSummary(ws: WorkspaceReference, t: Text): string {
  return [
    t.documents(ws.documents),
    (ws.hasBackground || ws.details > 0) && t.context,
    ws.guardrails.length > 0 && t.guardrails(ws.guardrails.length),
    ws.bookmarks > 0 && t.bookmarks(ws.bookmarks),
    ws.templates > 0 && t.templates(ws.templates),
  ].filter(Boolean).join(' · ')
}

function makeCannedReply(question: string, ws: WorkspaceReference | undefined, t: Text, copilot: AreaContent['copilot']): string {
  if (ws) {
    const rules = ws.guardrails.length ? t.followingGuardrails(ws.guardrails.map(g => `*${g}*`).join('; ')) : ''
    return `${t.answeringFrom(ws.name, workspaceSummary(ws, t))}${rules}\n\n${makeCannedReply(question, undefined, t, copilot)}`
  }
  const quoted = question.length > 80 ? `${question.slice(0, 80)}…` : question
  return `${t.basedOnQuestion(quoted, copilot.genericAdvice)}\n\n(${copilot.simulatedNote})`
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

/** Where a chat can be moved to (Workspaces 2.0 Versions 19 and 21): My workspace or another workspace. */
type MoveTarget = { id: string; name: string; icon: ReactNode }

/** A menu item's label: a 16px icon, then the text (as in the chat header's Actions). */
function MenuLabel({ icon, children, danger = false }: { icon: ReactNode; children: ReactNode; danger?: boolean }) {
  return (
    <span className="copilot-chat-menu-label" style={{ display: 'flex', alignItems: 'center', gap: spacing(2), whiteSpace: 'nowrap', color: danger ? colorPalette.danger.darken2 : undefined }}>
      <span style={{ display: 'inline-flex', width: 16, justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
      {children}
    </span>
  )
}

type ChatMenuActions = { moveTargets: MoveTarget[]; onMove: (id: string) => void; onRename: () => void; onDelete: () => void }

/**
 * A chat's menu (Workspaces 2.0 Versions 19 and 21): Move to workspace, Save PDF, Rename and Delete — the same in the
 * chat panel's three-dot menu and the open chat's Actions. `onRename` starts renaming where the menu was opened. The
 * open chat leaves out Save PDF (`pdf: false`): its header has its own Save as PDF button.
 */
function chatMenuItems(actions: ChatMenuActions, t: Text, { pdf = true }: { pdf?: boolean } = {}) {
  return [
    {
      key: 'move',
      label: <MenuLabel icon={<Icon type={iconType.FolderOutlined} size={16} />}>{t.moveToWorkspace}</MenuLabel>,
      children: actions.moveTargets.map(t => ({
        key: `move-${t.id}`,
        label: <MenuLabel icon={t.icon}>{t.name}</MenuLabel>,
        onClick: () => actions.onMove(t.id),
      })),
    },
    { key: 'divider', type: dropdownItemTypes.DIVIDER },
    // Prototype: exporting isn't wired up yet.
    ...(pdf ? [{ key: 'pdf', label: <MenuLabel icon={<Icon type={iconType.DownloadOutlined} size={16} />}>{t.savePdf}</MenuLabel> }] : []),
    { key: 'rename', label: <MenuLabel icon={<Icon type={iconType.EditOutlined} size={16} />}>{t.rename}</MenuLabel>, onClick: actions.onRename },
    { key: 'delete', label: <MenuLabel danger icon={<Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />}>{t.delete}</MenuLabel>, onClick: actions.onDelete },
  ]
}

/** The DS gives a submenu's title only 16px on the right, so its label ran under the chevron: 16px + the 16px chevron + 8px between them. */
const CHAT_MENU_STYLE = `.goat-dropdown-menu-submenu-title:has(.copilot-chat-menu-label) { padding-right: 40px !important; }`

/**
 * A chat in the panel's history. `actions` (Workspaces 2.0 Versions 19 and 21, after the CoPilot Finance design):
 * a three-dot button on hover (or while its menu is open) with Move to workspace, Save PDF, Rename and Delete.
 */
function ChatHistoryRow({ title, active, onClick, actions }: {
  title: string
  active: boolean
  onClick: () => void
  actions?: Omit<ChatMenuActions, 'onRename'> & { onRename: (title: string) => void }
}) {
  const t = useText(TEXT)
  const [hovered, setHovered] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(title)
  const commit = () => { if (draft.trim() && actions) actions.onRename(draft.trim()); setRenaming(false) }
  if (renaming) {
    return (
      <div ref={el => el?.querySelector('input')?.focus()} style={{ padding: `${spacing(1)}px 0` }} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(title); setRenaming(false) } }}>
        <Input name="chat-title" value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit} />
      </div>
    )
  }
  return (
    <div
      className={actions ? 'copilot-chat-row' : undefined}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: spacing(1),
        // The button gets the same 6.5px on its right as above and below it (24px in a 37px row).
        padding: actions ? `0 6.5px 0 ${spacing(2)}px` : `${spacing(2)}px`, minHeight: actions ? 37 : undefined, borderRadius: 6, cursor: 'pointer',
        backgroundColor: active ? colorPalette.blue.lighten5 : hovered ? colorPalette.neutral.lighten4 : undefined,
      }}
    >
      <span style={{
        flex: 1, minWidth: 0, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontSize: 14, fontWeight: active ? 600 : 400, color: active ? colorPalette.blue.darken2 : colorPalette.neutral.darken5,
      }}>{title}</span>
      {actions && (
        // Stops the row's click, so opening the menu doesn't open the chat. Kept in the layout (hidden) so the title
        // doesn't reflow when the button appears.
        // The button shows on hover, and stays while its menu is open (the DS Dropdown marks its trigger "…dropdown-open").
        <span className="copilot-chat-row-actions" onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
          <style>{`
            .copilot-chat-row .copilot-chat-row-actions { visibility: hidden; }
            .copilot-chat-row:hover .copilot-chat-row-actions,
            .copilot-chat-row .copilot-chat-row-actions:has([class*="dropdown-open"]) { visibility: visible; }
            ${CHAT_MENU_STYLE}
            .copilot-chat-row:has([class*="dropdown-open"]) { background-color: ${active ? colorPalette.blue.lighten5 : colorPalette.neutral.lighten4}; }
          `}</style>
          <Dropdown
            items={chatMenuItems({ ...actions, onRename: () => { setDraft(title); setRenaming(true) } }, t)}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_LEFT}
          >
            <ButtonGhost shape={buttonShapes.SQUARE} size={buttonSizes.SMALL} leftIcon={iconType.ThreeDotsVerFilled} ariaLabel={t.actionsFor(title)} />
          </Dropdown>
        </span>
      )}
    </div>
  )
}

/** Styled like the labels on a workspace's Profile card (Workspaces 2.0 Versions 19 and 21). */
function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ padding: `0 ${spacing(2)}px ${spacing(1)}px` }}>
      <span style={{ fontSize: 13, color: colorPalette.neutral.darken2 }}>{children}</span>
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

function ChatBubbleAssistant({ message, sources, onOpenSources, streaming = false }: {
  message: ChatMsg
  // While the answer is still being written: just the text so far, without sources or actions.
  streaming?: boolean
  // Sources behind the answer (workspace chats only): cited inline and listed as chips underneath.
  sources?: AnswerSource[]
  onOpenSources?: (filter: SourceFilter, focus: number | null) => void
}) {
  const [copied, setCopied] = useState(false)
  if (streaming) {
    return <Typography size="base" color="neutral-darken5">{renderLiteMarkdown(message.content)}</Typography>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <Typography size="base" color="neutral-darken5">
        {sources && sources.length > 0
          ? <AnswerBody content={placeMarkers(message.content, sources.length)} sources={sources} onMarker={n => onOpenSources?.('all', n)} />
          : renderLiteMarkdown(message.content)}
      </Typography>
      {sources && sources.length > 0 && <SourceChips sources={sources} onOpen={filter => onOpenSources?.(filter, null)} />}
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

/** Shown while CoPilot "thinks" about a handed-over question, before the answer starts to appear: three pulsing dots. */
function ThinkingIndicator({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
      <style>{'@keyframes ut-thinking { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.8) } 40% { opacity: 1; transform: scale(1) } }'}</style>
      <span style={{ display: 'inline-flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colorPalette.blue.base, animation: `ut-thinking 1.2s ${i * 0.15}s infinite ease-in-out` }} />
        ))}
      </span>
      <Typography size="base-sm" color="neutral-darken3">{label}</Typography>
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
  const t = useText(TEXT)
  const { lang } = usePrototype()
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
            <Typography size="base-small" color="neutral-darken2" weight={fontWeight.SEMIBOLD}>{t.workspaces}</Typography>
          </div>
          {matches.length === 0 ? (
            <div style={{ padding: `${spacing(2)}px` }}>
              <Typography size="base-sm" color="neutral-darken2">
                {workspaces.length === 0 ? t.noWorkspacesYet : t.noWorkspaceMatches}
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
              <span style={{ fontSize: 12, color: colorPalette.neutral.darken2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workspaceSummary(ws, t)}</span>
            </div>
          ))}
        </div>
      )}
      <MessageComposer
        {...composer}
        lang={lang}
        value={value}
        onChange={v => { onChange(v); setHighlight(0) }}
        seedAttachments={seedAttachments ?? NO_ATTACHMENTS}
        onSeedAttachmentsConsumed={onSeedAttachmentsConsumed ?? noop}
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
    </div>
  )
}

/**
 * A workspace's avatar. With dsAvatars (Workspaces 2.0 Version 19) it's the DS square Avatar, as on the workspace
 * list and summary; otherwise the older SpaceAvatar at the given pixel size.
 */
function WorkspaceAvatar({ workspace, size, ds }: { workspace: WorkspaceReference; size: number; ds: boolean }) {
  if (!ds) return <SpaceAvatar space={{ id: workspace.id, name: workspace.name } as Space} size={size} />
  const avatar = <Avatar shape={avatarShapeEnum.SQUARE} size={avatarSizeEnum.SMALL} srcPlaceholder={getInitials(workspace.name)} />
  if (size >= 32) return avatar
  // The DS's smallest Avatar is 32px; the dropdown and chat header need it smaller, so only its size is overridden.
  return (
    <span className={`copilot-ds-avatar-${size}`} style={{ display: 'inline-flex', width: size, height: size, flexShrink: 0 }}>
      <style>{`.copilot-ds-avatar-${size} .goat-avatar { width: ${size}px !important; height: ${size}px !important; line-height: ${size - 2}px !important; }
        .copilot-ds-avatar-${size} .goat-avatar-string, .copilot-ds-avatar-${size} .goat-avatar-string * { font-size: ${size <= 20 ? 9 : 10}px !important; line-height: ${size - 2}px !important; }`}</style>
      {avatar}
    </span>
  )
}

/**
 * Top bar of an open chat, after the CoPilot Finance design: the workspace's avatar, name and access, then the chat
 * title, and Save as PDF / Actions on the right. Chats outside a workspace show "My workspace" in the workspace's
 * place. Centred on the app's H logo (40px down), like the CoPilot menu's title (Workspaces 2.0 Versions 19 and 21).
 */
function ChatHeader({ session, workspace, onRename, onDelete, dsAvatars, move }: {
  dsAvatars: boolean
  session: ChatSession
  workspace: WorkspaceReference | null
  onRename: (title: string) => void
  onDelete: () => void
  /** Actions has the chat panel's menu — Move to workspace, Rename and Delete. */
  move: { targets: MoveTarget[]; onMove: (id: string) => void }
}) {
  const t = useText(TEXT)
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(session.title)
  const commit = () => { if (draft.trim()) onRename(draft.trim()); setRenaming(false) }
  return (
    <div style={{
      // No background or outline — it sits on the page, between the chat panel and the workspace summary.
      flexShrink: 0, height: 56, marginTop: 12, display: 'flex', alignItems: 'center', gap: spacing(3), padding: `0 ${spacing(6)}px`,
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: spacing(2) }}>
        {workspace ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2), flexShrink: 0 }}>
            <WorkspaceAvatar workspace={workspace} size={24} ds={dsAvatars} />
            <span style={{ fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken3 }}>{workspace.name}</span>
            <WorkspaceAccessIcon visibility={workspace.visibility} />
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2), flexShrink: 0 }}>
            <Icon type={iconType.ElementsOutlined} size={16} color="neutral-darken3" />
            <span style={{ fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken3 }}>{t.myWorkspace}</span>
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
      <ButtonGhost rightIcon={iconType.DownloadOutlined}>{t.saveAsPdf}</ButtonGhost>
      <style>{CHAT_MENU_STYLE}</style>
      <Dropdown
        items={chatMenuItems({ moveTargets: move.targets, onMove: move.onMove, onRename: () => { setDraft(session.title); setRenaming(true) }, onDelete }, t, { pdf: false })}
        trigger={dropdownTriggers.CLICK}
        placement={dropdownPlacement.BOTTOM_RIGHT}
      >
        <ButtonGhost rightIcon={iconType.ThreeDotsVerFilled}>{t.actions}</ButtonGhost>
      </Dropdown>
    </div>
  )
}

/** The privacy modal's icons, one per TEXT.privacyPoints entry, after the German "Ihre Daten sind privat und sicher" design. */
const PRIVACY_ICONS = [
  iconType.ShieldCheckOutlined,
  iconType.LockOutlined,
  // The DS has no "no training" icon; a crossed-out eye stands in for "not used".
  iconType.EyeSlashOutlined,
]

/** "Learn more" from the privacy note: how CoPilot keeps your data private and secure. */
function PrivacyModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useText(TEXT)
  return (
    <Modal
      visible={visible}
      variant={modalVariants.DEFAULT}
      withIcon={false}
      title={t.privacyTitle}
      onClose={onClose}
      footer={{ buttons: [{ variant: buttonVariants.PRIMARY, props: { children: t.close, onClick: onClose } }] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <Typography size="base" color="neutral-darken5">{t.privacyIntro}</Typography>
        {t.privacyPoints.map((point, i) => (
          <div key={point.title} style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(4) }}>
            <span style={{ width: 40, height: 40, borderRadius: 4, backgroundColor: colorPalette.blue.lighten5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon type={PRIVACY_ICONS[i]} size={20} color="blue-darken2" />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{point.title}</Typography>
              <Typography size="base-sm" color="neutral-darken5">{point.text}</Typography>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

/** "Your data is private and secure" under the question box. `compact`: in an open chat, closer to the box above it. */
function PrivacyNote({ compact = false }: { compact?: boolean }) {
  const t = useText(TEXT)
  const [open, setOpen] = useState(false)
  return (
    <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: compact ? `0 ${spacing(4)}px ${spacing(4)}px` : spacing(4) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
        <Icon type={iconType.ShieldCheckFilled} size={16} color="primary-base" />
        <Typography size="base-sm" color="neutral-darken3">
          {t.privacyNote}{' '}
          <span
            role="button"
            tabIndex={0}
            onClick={() => setOpen(true)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) } }}
            style={{ color: colorPalette.blue.base, cursor: 'pointer' }}
          >{t.learnMore}</span>
        </Typography>
      </div>
      <PrivacyModal visible={open} onClose={() => setOpen(false)} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HackathonCoPilotPageV10({ workspaces, onCreateWorkspace, onSaveDocuments, onChatStarted, savedSessions, onSessionsChange, extraSessions = [], background = colorPalette.neutral.lighten5, renderSummary, dsAvatars = false, createWorkspaceIntro, workspaceMenu }: {
  workspaces: WorkspaceReference[]
  // Workspaces 2.0 Versions 19 and 21: CoPilot without HR or Tax, the workspace selector (a clickable container with a
  // DS Dropdown) and, under the question box, the workspaces promotion (FigJam CoPilot frames, 150:191).
  // workspacesPath is where Manage workspaces goes; myDocuments are what Add document's Choose from My Documents lists.
  // workspaceDocuments(id): a workspace's documents, which Add document lists in place of My Documents there.
  workspaceMenu?: { workspacesPath: string; myDocuments: PickableDocument[]; workspaceDocuments: (workspaceId: string) => PickableDocument[] }
  // The workspace's summary beside the chat (Workspaces 2.0 Version 19's); without it, nothing is shown there.
  // activeChatId: the open chat in that workspace, if any — so the workspace can lead back to it.
  renderSummary?: (workspace: WorkspaceReference, activeChatId: string | null) => ReactNode
  // Workspace avatars in the DS square style, as on the workspace list (Workspaces 2.0 Version 19).
  dsAvatars?: boolean
  // Shown at the top of the Create workspace dialog.
  createWorkspaceIntro?: ReactNode
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
  const { lang } = usePrototype()
  const { copilot } = useArea()
  const t = useText(TEXT)
  const runUpload = useProcessingUpload(lang)
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
  const [showPromo, setShowPromo] = useState(!promoDismissed)
  // Add document → Choose from My Documents (Versions 19 and 21).
  const [myDocsOpen, setMyDocsOpen] = useState(false)
  // The workspace the question goes to: the open chat's, or the current one on the welcome screen.
  const pickerWorkspace = () => activeSession ? activeSession.workspace ?? null : attached
  // What Choose from offers: that workspace's documents, or My Documents.
  const pickerDocuments = () => { const ws = pickerWorkspace(); return !workspaceMenu ? [] : ws ? workspaceMenu.workspaceDocuments(ws.id) : workspaceMenu.myDocuments }
  const addDocument = (placement: string) => workspaceMenu ? (openFilePicker: () => void) => (
    <AddDocumentMenu
      placement={placement}
      onUpload={openFilePicker}
      onChooseFromMyDocuments={() => setMyDocsOpen(true)}
      workspaceName={pickerWorkspace()?.name}
      documentCount={pickerDocuments().length}
    />
  ) : undefined
  const [search, setSearch] = useState('')
  const [question, setQuestion] = useState('')
  // initialQuestion starts a new chat; openChatId (from a workspace's Haufe knowledge) opens an existing one.
  // attachDocs (Version 9's Send to CoPilot) attaches documents to the new question in the workspace.
  const routeState = location.state as { initialQuestion?: string; workspaceRef?: WorkspaceReference; openChatId?: string; attachDocs?: SeedAttachment[] } | null
  const [attachDocs, setAttachDocs] = useState<SeedAttachment[]>(() => routeState?.attachDocs ?? NO_ATTACHMENTS)
  const baseSessions = savedSessions ?? [...extraSessions, ...initialSessions(copilot, t)]
  const openedChat = routeState?.openChatId ? baseSessions.find(s => s.id === routeState.openChatId) ?? null : null
  // The current workspace: whose chats the panel lists and what new chats answer from.
  const [workspaceId, setWorkspaceId] = useState<string>(routeState?.workspaceRef?.id ?? openedChat?.workspace?.id ?? GENERAL)
  const attached = workspaces.find(w => w.id === workspaceId) ?? null
  /** Switch workspace from the dropdown or the chip — back to its welcome screen. */
  const selectWorkspace = (id: string) => { setWorkspaceId(id); setActiveId(null) }
  // A question handed over (from Home, or a workspace template) opens straight away as a new chat.
  // It opens with only the question; the answer follows (see the answering effect below), so it's seen being written.
  const [handedOver] = useState<(ChatSession & { answer: string }) | null>(() => {
    const text = routeState?.initialQuestion?.trim()
    if (!text) return null
    const ws = routeState?.workspaceRef
    return {
      id: nextId('chat'), day: t.today, title: text.length > 60 ? `${text.slice(0, 60)}…` : text, workspace: ws,
      messages: [{ id: nextId('msg'), role: 'user', content: text }],
      answer: makeCannedReply(text, ws, t, copilot),
    }
  })
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (!handedOver) return baseSessions
    const { answer: _answer, ...session } = handedOver
    return [session, ...baseSessions]
  })
  // The handed-over question's answer: a short "thinking" pause, then the text appears a few words at a time.
  const [thinkingId, setThinkingId] = useState<string | null>(handedOver?.id ?? null)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const sessionsRef = useRef(sessions)
  sessionsRef.current = sessions
  useEffect(() => {
    if (!handedOver) return
    const messageId = nextId('msg')
    const parts = handedOver.answer.split(/(\s+)/)
    let shown = 0
    let interval: ReturnType<typeof setInterval> | undefined
    const setAnswer = (content: string) => setSessions(prev => prev.map(s => s.id !== handedOver.id ? s : {
      ...s, messages: s.messages.some(m => m.id === messageId)
        ? s.messages.map(m => m.id === messageId ? { ...m, content } : m)
        : [...s.messages, { id: messageId, role: 'assistant', content }],
    }))
    const timeout = setTimeout(() => {
      setThinkingId(null)
      setStreamingId(messageId)
      interval = setInterval(() => {
        shown = Math.min(parts.length, shown + 4)
        setAnswer(parts.slice(0, shown).join(''))
        if (shown >= parts.length) { clearInterval(interval); setStreamingId(null) }
      }, 40)
    }, 1400)
    return () => {
      clearTimeout(timeout)
      if (interval) clearInterval(interval)
      // Leaving mid-answer: hand the finished chat back, so it isn't left half-written.
      if (shown < parts.length) {
        const done = sessionsRef.current.map(s => s.id !== handedOver.id ? s : {
          ...s, messages: [...s.messages.filter(m => m.id !== messageId), { id: messageId, role: 'assistant' as const, content: handedOver.answer }],
        })
        onSessionsChange(done)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
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

  // A chat's Move to workspace — My workspace and every workspace (the chat's own is left out).
  const moveTargets: MoveTarget[] = [
    { id: GENERAL, name: t.myWorkspace, icon: <Icon type={iconType.ElementsOutlined} size={16} color="neutral-darken3" /> },
    ...workspaces.map(w => ({ id: w.id, name: w.name, icon: <WorkspaceAvatar workspace={w} size={16} ds={dsAvatars} /> })),
  ]
  // Moves a chat to another workspace: it leaves this list (which shows the selected workspace's chats) and is listed
  // in the target workspace's chats.
  const moveChat = (chat: ChatSession, targetId: string) => {
    const target = targetId === GENERAL ? undefined : workspaces.find(w => w.id === targetId)
    setSessions(prev => prev.map(s => s.id === chat.id ? { ...s, workspace: target } : s))
    if (target) onChatStarted(target.id, { id: chat.id, title: chat.title })
    if (chat.id === activeId) setActiveId(null)
  }

  const reply = (text: string, attachments: OutgoingAttachment[], ws?: WorkspaceReference): ChatMsg[] => {
    const attachmentNames = attachments.map(a => a.kind === 'file' ? a.file.name : a.doc.name)
    return [
      { id: nextId('msg'), role: 'user', content: text, attachmentNames: attachmentNames.length ? attachmentNames : undefined },
      { id: nextId('msg'), role: 'assistant', content: makeCannedReply(text, ws, t, copilot) },
    ]
  }

  const handleWelcomeSend = (attachments: OutgoingAttachment[]) => {
    const text = question.trim()
    if (!text && attachments.length === 0) return
    const id = nextId('chat')
    const title = text.length > 60 ? `${text.slice(0, 60)}…` : text || t.newChat
    const ws = attached ?? undefined
    setSessions(prev => [{ id, day: t.today, title, workspace: ws, messages: reply(text, attachments, ws) }, ...prev])
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
    return ws ? buildSources(message.id, question, ws.documentNames ?? [], copilot.articles, copilot.fileExcerpts) : undefined
  }
  const sourcesMessage = sourcesView && activeSession ? activeSession.messages.find(m => m.id === sourcesView.messageId) : undefined
  const panelSources = sourcesMessage && activeSession
    ? answerSources(sourcesMessage, activeSession.messages[activeSession.messages.indexOf(sourcesMessage) - 1]?.content ?? '')
    : undefined

  return (
    // Main area on the theme's neutral-lighten5; the chat panel (a menu) stays white.
    // The window's height, so a long chat scrolls in its own area (the app shell only has a minimum height, so 100%
    // let a long thread grow the whole page and scroll the menu and chat header away).
    <div style={{ display: 'flex', height: '100vh', backgroundColor: background }}>
      {/* Chat panel, collapsible from its own foot like the app's other panels: a narrow strip of icons when collapsed. */}
      <div style={{
        width: panelOpen ? 268 : 64, flexShrink: 0, borderRight: `1px solid ${colorPalette.neutral.lighten1}`, backgroundColor: colorPalette.white,
        display: 'flex', flexDirection: 'column', transition: 'width 0.15s',
      }}>
      {panelOpen ? (
        <div style={{
          // 24px at the top, so the CoPilot mark and title (32px high) centre on the app's H logo.
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: `24px ${spacing(4)}px ${spacing(4)}px`, gap: spacing(5), overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <CoPilotMark size={32} />
            <span style={{ fontSize: 18, fontWeight: 600, color: '#001344' }}>CoPilot</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: spacing(1) }}>
              <SectionLabel>{t.workspace}</SectionLabel>
              <NewChip />
            </div>
            <WorkspaceSelector
              value={workspaceId}
              options={[
                { id: GENERAL, name: t.myWorkspace, description: t.myWorkspaceDescription, icon: <Icon type={iconType.ElementsOutlined} size={16} color="neutral-darken3" /> },
                ...workspaces.map(w => ({ id: w.id, name: w.name, description: w.description.trim(), visibility: w.visibility, icon: <WorkspaceAvatar workspace={w} size={24} ds={dsAvatars} /> })),
              ]}
              onChange={selectWorkspace}
              onCreate={() => setCreateOpen(true)}
              onManage={() => { if (workspaceMenu) navigate(workspaceMenu.workspacesPath) }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
            <ButtonPrimary width={buttonWidth.EXPANDED} leftIcon={iconType.CommentOutlined} onClick={() => { setQuestion(''); setActiveId(null) }}>
              {t.newChat}
            </ButtonPrimary>
            <SearchBar placeholder={t.searchTitles} value={search} onChange={setSearch} width={searchbarWidth.EXPANDED} />
          </div>

          <PanelRow icon={iconType.NoteOutlined} label={t.promptTemplates} />

          {filteredGroups.length === 0 ? (
            <div style={{ padding: `${spacing(4)}px ${spacing(2)}px` }}>
              <Typography size="base-sm" color="neutral-darken2" align="center">
                {search.trim() ? t.noChatsMatch : attached ? t.noChatsIn(attached.name) : t.noChats}
              </Typography>
            </div>
          ) : filteredGroups.map(group => (
            <div key={group.day} style={{ display: 'flex', flexDirection: 'column' }}>
              <SectionLabel>{group.day}</SectionLabel>
              {group.entries.map(entry => (
                <ChatHistoryRow
                  key={entry.id}
                  title={entry.title}
                  active={entry.id === activeId}
                  onClick={() => setActiveId(entry.id)}
                  actions={{
                    moveTargets: moveTargets.filter(m => m.id !== (entry.workspace?.id ?? GENERAL)),
                    onMove: id => moveChat(entry, id),
                    onRename: title => setSessions(prev => prev.map(s => s.id === entry.id ? { ...s, title } : s)),
                    onDelete: () => { setSessions(prev => prev.filter(s => s.id !== entry.id)); if (entry.id === activeId) setActiveId(null) },
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(4), padding: `24px 0 ${spacing(4)}px` }}>
          <CoPilotMark size={32} />
          <ButtonPrimary shape={buttonShapes.SQUARE} leftIcon={iconType.CommentOutlined} onClick={() => { setQuestion(''); setActiveId(null) }} ariaLabel={t.newChat} />
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.NoteOutlined} ariaLabel={t.promptTemplates} />
        </div>
      )}
        {/* Like the app sidebar's collapse — a 48px strip at the foot with only a centred chevron. */}
        <CollapseStrip open={panelOpen} onToggle={() => setPanelOpen(v => !v)} collapseLabel={t.collapse} expandLabel={t.expand} />
      </div>

      {/* Between the chat panel and the workspace summary: an open chat's header, then the chat or the welcome screen. */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {activeSession && (
            <ChatHeader
              session={activeSession}
              workspace={activeSession.workspace ? workspaces.find(w => w.id === activeSession.workspace!.id) ?? activeSession.workspace : null}
              dsAvatars={dsAvatars}
              move={{ targets: moveTargets.filter(m => m.id !== (activeSession.workspace?.id ?? GENERAL)), onMove: id => moveChat(activeSession, id) }}
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
                      streaming={m.id === streamingId}
                    />)}
                {thinkingId === activeSession.id && <ThinkingIndicator label={t.thinking} />}
              </div>
            </div>
            <div style={{ flexShrink: 0, padding: `0 ${spacing(8)}px ${spacing(4)}px`, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: 840 }}>
                <MentionComposer
                  value={question}
                  onChange={setQuestion}
                  onSend={handleFollowUp}
                  placeholder={t.followUpPlaceholder}
                  renderAddDocument={addDocument(dropdownPlacement.TOP_LEFT)}
                  seedAttachments={attachDocs}
                  onSeedAttachmentsConsumed={() => setAttachDocs(NO_ATTACHMENTS)}
                  workspaces={workspaces}
                  // The chat moves to the picked workspace, and the panel follows it there.
                  onPick={ws => { setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, workspace: ws } : s)); setWorkspaceId(ws.id); onChatStarted(ws.id, { id: activeSession.id, title: activeSession.title }) }}
                />
              </div>
            </div>
            {/* The start page's privacy note under every chat too (Workspaces 2.0 Versions 19 and 21). */}
            <PrivacyNote compact />
          </>
        ) : (
          <>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `0 ${spacing(10)}px ${spacing(10)}px` }}>
              <div style={{ maxWidth: 650, width: '100%', display: 'flex', flexDirection: 'column', gap: spacing(10) }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
                  {/* In a workspace, the welcome is headed with it instead of CoPilot. */}
                  {attached
                    ? <WorkspaceAvatar workspace={attached} size={40} ds={dsAvatars} />
                    : <CoPilotMark size={40} />}
                  {/* The workspace's access after its name. */}
                  <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                    <span style={{ fontSize: 24, lineHeight: '1.3', fontWeight: 700, color: '#001344' }}>{attached ? attached.name : t.welcome}</span>
                    {attached && <WorkspaceAccessIcon visibility={attached.visibility} />}
                  </span>
                  <Typography size="base" color={attached && !attached.description.trim() ? 'neutral-darken2' : 'neutral-darken5'}>
                    {attached ? attached.description.trim() || t.noDescription : t.welcomeText}
                  </Typography>
                  <div style={{ width: 64, height: 1, backgroundColor: colorPalette.neutral.lighten1 }} />
                  <Typography size="base-sm" color="neutral-darken2">
                    <span style={{ fontWeight: fontWeight.SEMIBOLD }}>{t.note}</span> {t.noteText}
                  </Typography>
                </div>

                <MentionComposer
                  value={question}
                  onChange={setQuestion}
                  onSend={handleWelcomeSend}
                  placeholder={attached ? t.askAboutPlaceholder(attached.name) : t.askPlaceholder}
                  renderAddDocument={addDocument(dropdownPlacement.BOTTOM_LEFT)}
                  workspaces={workspaces}
                  onPick={ws => setWorkspaceId(ws.id)}
                  seedAttachments={attachDocs}
                  onSeedAttachmentsConsumed={() => setAttachDocs(NO_ATTACHMENTS)}
                />
                {/* In My workspace only: what a workspace adds, until it's dismissed. */}
                {workspaceMenu && !attached && showPromo && (
                  <div style={{ marginTop: -spacing(4) }}>
                    <WorkspacesPromo
                      onCreate={() => setCreateOpen(true)}
                      onDismiss={() => { promoDismissed = true; setShowPromo(false) }}
                    />
                  </div>
                )}
              </div>
            </div>

            <PrivacyNote />
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
          focus={sourcesView.focus}
          filter={sourcesView.filter}
          onFilter={filter => setSourcesView(prev => prev && { ...prev, filter })}
          onClose={() => setSourcesView(null)}
        />
        </SourcesPanelSlot>
      ) : attached && renderSummary?.(attached, activeSession?.workspace?.id === attached.id ? activeSession.id : null)}

      {workspaceMenu && (
        <MyDocumentsPicker
          open={myDocsOpen}
          documents={pickerDocuments()}
          workspaceName={pickerWorkspace()?.name}
          onClose={() => setMyDocsOpen(false)}
          onAttach={docs => setAttachDocs(docs)}
        />
      )}

      {/* Same dialog as on the Workspaces page; the new workspace becomes the current one. */}
      <SpaceFormModal
        open={createOpen}
        mode="create"
        noun="Workspace"
        showPhotoUpload={false}
        showType={false}
        lang={lang}
        organisationAccess
        accessRadios
        onClose={() => setCreateOpen(false)}
        intro={createWorkspaceIntro}
        onSubmit={values => { selectWorkspace(onCreateWorkspace(values)); setCreateOpen(false) }}
      />
    </div>
  )
}
