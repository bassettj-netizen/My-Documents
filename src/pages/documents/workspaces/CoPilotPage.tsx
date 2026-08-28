import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ButtonGhost,
  buttonShapes,
  Icon,
  iconType,
  SearchBar,
  searchbarWidth,
  Typography,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, fontWeight, renderLiteMarkdown, type OutgoingAttachment, type MetadataDocument } from './shared'
import { MessageComposer } from './Version6'
import MyDocumentsV1, { type PersonalDoc } from '../my-documents/Version1'

// Personal files here carry a smaller, simpler shape than the Workspaces document model — this
// fills in the rest with reasonable stand-ins so they can flow through the same message-field
// attachment mechanism as workspace documents (mirrors `localFileToDoc` in shared.tsx).
function personalDocToMetadataDoc(doc: PersonalDoc): MetadataDocument {
  return {
    _id: doc._id, name: doc.name, domain: 'Personal', documentType: doc.documentType,
    status: 'Draft', namedEntity: '—', namedEntityId: '—', year: new Date(doc.uploadedDate).getFullYear(),
    monetaryAmounts: 0, currency: 'EUR', monetaryTypes: 'None', lawType: '—', citations: '—',
    jurisdiction: '—', uploadedDate: doc.uploadedDate, fileSize: doc.fileSize, fileFormat: doc.fileFormat,
  }
}

// Outline CoPilot mark (screenshots/copilot_icon 1.svg) — the brand mark isn't a generic UI
// icon with a DS equivalent, so (like HaufeLogo) it's kept as its own asset rather than
// mapped to an iconType; the filled sidebar mark elsewhere in the app is a distinct usage.
export function CoPilotMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="copilot-page-outline-mask" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="3" y="3" width="34" height="34">
        <path d="M36.8421 3.15796H3.1579V36.8422H36.8421V3.15796Z" fill="white" />
      </mask>
      <g mask="url(#copilot-page-outline-mask)">
        {/* #141F29 matches the source asset exactly (screenshots/copilot_icon 1.svg) — a
            near-black navy, not the DS blue this previously (incorrectly) used. */}
        <path d="M20 26.2927C16.5205 26.2927 13.7074 23.4796 13.7074 20.0001C13.7074 16.5206 16.5205 13.7074 20 13.7074C23.4795 13.7074 26.2927 16.5206 26.2927 20.0001C26.2927 23.4796 23.4795 26.2927 20 26.2927ZM20 15.5582C17.557 15.5582 15.5581 17.5571 15.5581 20.0001C15.5581 22.4431 17.557 24.4419 20 24.4419C22.443 24.4419 24.4419 22.4431 24.4419 20.0001C24.4419 17.5571 22.443 15.5582 20 15.5582ZM20.0371 36.8051C16.2244 36.8051 13.5593 33.8439 13.5593 29.6241C13.4482 27.0331 11.7455 26.4778 10.3389 26.4778C8.11799 26.4778 6.15617 25.7375 4.8236 24.3679C3.71313 23.2205 3.1579 21.7028 3.1579 20.0001C3.23193 15.2991 6.93349 13.5594 10.3759 13.5223C11.9306 13.5223 13.5593 12.671 13.5593 10.376C13.5223 6.04517 16.1503 3.15796 20 3.15796C23.8497 3.15796 26.2927 5.97115 26.4777 10.339C26.5888 13.0781 28.5136 13.5223 29.624 13.5223C32.8815 13.5223 36.731 15.262 36.8421 20.0001C36.8421 21.7028 36.2869 23.2205 35.1394 24.3679C33.8068 25.7005 31.808 26.4778 29.624 26.4778C28.2545 26.4778 26.5888 27.0331 26.5148 29.6241C26.3297 33.992 23.8126 36.8051 20.0371 36.8051ZM15.373 10.376C15.373 12.8561 13.8554 15.3361 10.3759 15.3731C8.78427 15.3731 5.08271 15.8543 5.00868 20.0001C5.00868 21.1846 5.37883 22.2581 6.15617 23.0354C7.11857 24.0348 8.63621 24.59 10.3389 24.59C13.3372 24.59 15.262 26.5149 15.4101 29.5131C15.4101 32.2152 16.8536 34.9174 20.0371 34.9174C23.2204 34.9174 24.5159 32.8815 24.6639 29.5131C24.775 26.4778 26.6998 24.59 29.624 24.553C31.3268 24.553 32.8444 23.9978 33.8439 22.9983C34.6212 22.184 35.0283 21.1475 34.9913 19.963C34.9173 15.7062 30.8456 15.3361 29.624 15.3361C27.2921 15.3361 24.775 14.0036 24.627 10.376C24.4789 7.00759 22.7762 4.97172 20 4.97172C17.2238 4.97172 15.373 7.08161 15.373 10.339V10.376Z" fill="#141F29" />
      </g>
    </svg>
  )
}

// ─── Example chat sessions (translated from the Figma) ──────────────────────

type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string; attachmentNames?: string[] }
export type ChatSession = { id: string; title: string; month: string; messages: ChatMsg[] }

let sessionCounter = 0
function nextId(prefix: string) { sessionCounter += 1; return `${prefix}-${sessionCounter}` }

function session(id: string, month: string, title: string, question: string, answer: string): ChatSession {
  return {
    id, month, title,
    messages: [
      { id: `${id}-u`, role: 'user', content: question },
      { id: `${id}-a`, role: 'assistant', content: answer },
    ],
  }
}

export const INITIAL_SESSIONS: ChatSession[] = [
  session('feb-1', 'February', 'Company Car 1% Rule vs. Logbook',
    'Which is more cost-effective for our GmbH: the 1% flat-rate rule or a logbook for company cars?',
    "It depends on how much the car is actually used privately. **The 1% rule** taxes 1% of the car's gross list price per month regardless of actual use — simplest to administer, but expensive for low private mileage. **A logbook** (Fahrtenbuch) taxes only the real private-use share of total costs, but every trip must be logged consistently — any gap and the tax office can reject it in favor of the 1% rule retroactively.\n\nFor a car with under ~20% private use and detailed trip records already being kept, the logbook is usually cheaper. Above that, the 1% rule tends to win on cost *and* admin overhead.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual client data.)"),
  session('feb-2', 'February', 'Applying the Home Office Allowance Correctly',
    'What are the current rules for the home office allowance (Homeoffice-Pauschale), and how many days can be claimed?',
    'The home office allowance is **€6 per day**, up to a maximum of **€1,260 per year** (210 days), for any day worked predominantly from home — a dedicated home office room is no longer required. It can be claimed alongside other work-related expenses, but not on top of an existing home-office-room deduction for the same days.\n\nKeep a simple log of qualifying days — the tax office can request evidence, and estimates without records are routinely rejected on audit.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual client data.)'),
  session('feb-3', 'February', 'Managing Director Salary Appropriateness Review',
    "Our GmbH managing director's salary increased 18% this year. Could this trigger a hidden profit distribution (verdeckte Gewinnausschüttung) risk?",
    "Possibly — a raise well above what an external, non-shareholder manager would receive for comparable responsibilities is exactly what triggers a **verdeckte Gewinnausschüttung (vGA)** finding on audit. The tax office benchmarks against comparable-company salary surveys, factoring in company size, industry, and the director's actual duties.\n\nI'd recommend documenting the business justification for the increase now (expanded responsibilities, comparable market data, profitability trend) rather than reconstructing it during an audit.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual client data.)"),
  session('feb-4', 'February', 'Client Letter on the Property Tax Reform',
    'Draft a short client-facing letter explaining how the property tax reform (Grundsteuerreform) affects their upcoming valuations.',
    "Draft:\n\n\"Dear [Client], as part of the property tax reform, all real estate in Germany has been revalued using the new federal (or, where applicable, state-specific) valuation model. This will affect your assessed value and, from 2026, your municipal property tax rate (Hebesatz) may also change independently. We are reviewing your assessment notice for accuracy and will flag any figures that look out of line with comparable properties before the appeal deadline. Please send us your latest notice as soon as it arrives.\"\n\n(Simulated response for prototyping — connect a real assistant to answer from actual client data.)"),
  session('feb-5', 'February', 'Drafting a Deadline Extension Request',
    'Draft a deadline extension request (Fristverlängerungsantrag) for a corporate tax return, citing missing third-party documentation.',
    'Draft:\n\n"To the tax office — we represent [Client GmbH] (tax number [xxx]) and respectfully request an extension of the filing deadline for the 2025 corporate income tax return, currently due [date]. Certain third-party supporting documentation (bank confirmations, investment statements) has not yet been received despite timely requests. We anticipate being able to file within [X weeks] of receipt. We would appreciate confirmation of the extended deadline."\n\n(Simulated response for prototyping — connect a real assistant to answer from actual client data.)'),
  session('feb-6', 'February', 'VAT Registration Status for the New Subsidiary',
    'Has the VAT registration for the new subsidiary been completed, and is it able to issue invoices with a VAT ID yet?',
    "Based on the filings we have on record, the registration application was submitted but the VAT ID (USt-IdNr.) hasn't been confirmed yet — typical turnaround is 2–6 weeks. Until it's issued, the subsidiary can still invoice, but should note \"VAT ID applied for\" rather than leaving the field blank, and should hold off on any intra-EU reverse-charge invoicing until the ID is active.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual client data.)"),
  session('jan-1', 'January', 'External Audit — Typical Focus Areas 2026',
    'What are tax offices typically focusing on in external audits (Betriebsprüfung) for the 2026 cycle?',
    "Based on recent audit patterns, the recurring focus areas are: **intercompany transfer pricing** documentation (especially for cross-border groups), **managing director compensation** appropriateness, **home office and travel expense** substantiation post-pandemic, and **VAT treatment of digital services**. Cash-intensive businesses continue to see closer scrutiny of till/POS records.\n\nWorth doing a light internal review of these four areas before an audit notice arrives, rather than after.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual client data.)"),
  session('jan-2', 'January', 'Germany–US DTA — Withholding Tax on Dividends',
    'Under the Germany–US double taxation agreement, what withholding tax rate applies to dividends paid to a US parent company?',
    "Under the **Germany–US DTA**, the standard withholding rate on dividends is **15%**, reduced to **5%** if the US parent holds at least 10% of the German subsidiary's voting stock (and to as low as 0% for qualifying pension funds under the 2006 protocol). The reduced rate requires the US recipient to file a refund/exemption application (Freistellungsantrag) with the German Federal Central Tax Office (BZSt) — it isn't automatic at source.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual client data.)"),
  session('jan-3', 'January', 'Company Pension Plan — Tax Implications',
    'What are the tax implications for employees and the company when setting up a company pension plan (betriebliche Altersvorsorge)?',
    'Employer contributions to a qualifying **bAV** are tax- and largely social-security-free up to **8% of the pension contribution ceiling** (4% fully SI-free, the next 4% income-tax-free only). Employees can additionally direct part of their own salary into it via deferred compensation (Entgeltumwandlung), which lowers current taxable income but reduces state pension entitlement slightly since SI contributions drop too. For the company, contributions are a deductible business expense, and since 2019 employers must pass through 15% of the saved SI contributions to the employee\'s plan for new agreements.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual client data.)'),
]

function makeCannedReply(question: string): string {
  return `Based on your question — "${question.length > 80 ? `${question.slice(0, 80)}…` : question}" — here's a starting point: I'd look at the relevant statute and any recent guidance from the tax office, then cross-check against the client's actual filings before finalizing anything.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual file contents.)`
}

// ─── Small building blocks ───────────────────────────────────────────────────

function SidebarNavRow({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: spacing(2),
        padding: `${spacing(2)}px`, borderRadius: 6, cursor: 'pointer',
        backgroundColor: active ? colorPalette.blue.lighten5 : hovered ? colorPalette.neutral.lighten4 : undefined,
      }}
    >
      <Icon type={icon as never} size={20} color={active ? 'blue-base' : 'neutral-darken3'} />
      {/* Plain span, not Typography — 14px/medium(500) matches Tax Office's own nav items,
          and Typography's `size` enum has no 14px-medium combination to reach directly. */}
      <span style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? colorPalette.blue.darken2 : colorPalette.neutral.darken5 }}>{label}</span>
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
        fontSize: 14, fontWeight: active ? 600 : 500, color: active ? colorPalette.blue.darken2 : colorPalette.neutral.darken4,
      }}>{title}</span>
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

// ─── Page ─────────────────────────────────────────────────────────────────

type View = { kind: 'welcome' } | { kind: 'chat'; id: string } | { kind: 'documents' }

export default function CoPilotPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [question, setQuestion] = useState('')
  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS)
  const [view, setView] = useState<View>({ kind: 'welcome' })
  const [seedAttachments, setSeedAttachments] = useState<{ doc: MetadataDocument; source: 'local' }[]>([])

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const months = [...new Set(sessions.map(s => s.month))]
    return months
      .map(month => ({ month, entries: sessions.filter(s => s.month === month && s.title.toLowerCase().includes(q)) }))
      .filter(g => g.entries.length > 0)
  }, [search, sessions])

  const activeSession = view.kind === 'chat' ? sessions.find(s => s.id === view.id) ?? null : null

  const appendToSession = (sessionId: string, userText: string, attachments: OutgoingAttachment[]) => {
    const attachmentNames = attachments.map(a => a.kind === 'file' ? a.file.name : a.doc.name)
    setSessions(prev => prev.map(s => s.id !== sessionId ? s : {
      ...s,
      messages: [
        ...s.messages,
        { id: nextId('msg'), role: 'user', content: userText, attachmentNames: attachmentNames.length ? attachmentNames : undefined },
        { id: nextId('msg'), role: 'assistant', content: makeCannedReply(userText) },
      ],
    }))
  }

  const createChatFromText = (text: string, attachmentNames: string[] = []) => {
    const id = nextId('chat')
    const title = text.length > 60 ? `${text.slice(0, 60)}…` : text || 'New chat'
    const newSession: ChatSession = {
      id, month: 'Today', title,
      messages: [
        { id: nextId('msg'), role: 'user', content: text, attachmentNames: attachmentNames.length ? attachmentNames : undefined },
        { id: nextId('msg'), role: 'assistant', content: makeCannedReply(text) },
      ],
    }
    setSessions(prev => [newSession, ...prev])
    setView({ kind: 'chat', id })
  }

  const handleWelcomeSend = (attachments: OutgoingAttachment[]) => {
    const text = question.trim()
    if (!text && attachments.length === 0) return
    const attachmentNames = attachments.map(a => a.kind === 'file' ? a.file.name : a.doc.name)
    createChatFromText(text, attachmentNames)
    setQuestion('')
  }

  // Arriving here from Home — either with a question already typed into its own ask bar
  // (start that chat immediately, rather than landing on the welcome screen and making the
  // user resubmit it) or from a "Recent Chats" link (deep-link straight into that thread).
  // The nav state is cleared right after so navigating back here later (or refreshing) doesn't
  // re-trigger it.
  useEffect(() => {
    const state = location.state as { initialQuestion?: string; openChatId?: string } | null
    if (state?.initialQuestion?.trim()) {
      createChatFromText(state.initialQuestion.trim())
    } else if (state?.openChatId && sessions.some(s => s.id === state.openChatId)) {
      setView({ kind: 'chat', id: state.openChatId })
    } else {
      return
    }
    navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // "Send to chat" from My Documents — the selected files land as attachment chips in the
  // message field of a new chat, exactly like picking them from the composer's own "Add
  // document" button (same seedAttachments mechanism MessageComposer already supports).
  const handleSendToChat = (docs: PersonalDoc[]) => {
    setSeedAttachments(docs.map(doc => ({ doc: personalDocToMetadataDoc(doc), source: 'local' as const })))
    setQuestion('')
    setView({ kind: 'welcome' })
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {sidebarOpen && (
        <div style={{
          width: 340, flexShrink: 0, borderRight: `1px solid ${colorPalette.neutral.lighten1}`,
          display: 'flex', flexDirection: 'column', padding: spacing(4), gap: spacing(5), overflowY: 'auto',
        }}>
          {/* Matches the Figma's own "CoPilot Logo" sidebar header (node 265:78183) — just the
              mark and "CoPilot", not the separate Haufe lockup that used to sit above it. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
            <CoPilotMark size={40} />
            {/* Plain span, not Typography (no `style` prop / arbitrary color support there) —
                #001344 matches the source exactly, distinct from the icon's own #141F29. */}
            <span style={{ fontSize: 20, fontWeight: 700, color: '#001344' }}>CoPilot Tax</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <div
              onClick={() => { setQuestion(''); setView({ kind: 'welcome' }) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing(2),
                height: 40, borderRadius: 4, cursor: 'pointer', backgroundColor: colorPalette.blue.base,
              }}
            >
              <Icon type={iconType.PlusOutlined} size={16} color="white" />
              <Typography size="base" color="white" weight={fontWeight.SEMIBOLD}>New Chat</Typography>
            </div>
            <SearchBar placeholder="Search titles" value={search} onChange={setSearch} width={searchbarWidth.EXPANDED} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SidebarNavRow icon={iconType.FolderOutlined} label="My Documents" active={view.kind === 'documents'} onClick={() => setView({ kind: 'documents' })} />
            <SidebarNavRow icon={iconType.NoteOutlined} label="Prompt Templates" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography size="base-small" color="neutral-darken2" weight={fontWeight.BOLD}>FOLDERS</Typography>
            <SidebarNavRow icon={iconType.FolderOutlined} label="New Folder" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
            {filteredGroups.length === 0 ? (
              <Typography size="base-sm" color="neutral-darken2">No chats match your search.</Typography>
            ) : filteredGroups.map(group => (
              <div key={group.month} style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography size="base-small" color="neutral-darken2" weight={fontWeight.BOLD}>{group.month.toUpperCase()}</Typography>
                {group.entries.map(entry => (
                  <ChatHistoryRow
                    key={entry.id}
                    title={entry.title}
                    active={view.kind === 'chat' && view.id === entry.id}
                    onClick={() => setView({ kind: 'chat', id: entry.id })}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {view.kind === 'documents' ? (
          <>
            <div style={{ height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', padding: `0 ${spacing(4)}px` }}>
              <ButtonGhost
                shape={buttonShapes.SQUARE}
                leftIcon={sidebarOpen ? iconType.ChevronLeftOutlined : iconType.ChevronRightOutlined}
                onClick={() => setSidebarOpen(v => !v)}
              />
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <MyDocumentsV1 onSendToChat={handleSendToChat} />
            </div>
          </>
        ) : view.kind === 'chat' && activeSession ? (
          <>
            <div style={{ flexShrink: 0, padding: `${spacing(6)}px ${spacing(4)}px 0`, display: 'flex', alignItems: 'center', gap: spacing(3) }}>
              <ButtonGhost
                shape={buttonShapes.SQUARE}
                leftIcon={sidebarOpen ? iconType.ChevronLeftOutlined : iconType.ChevronRightOutlined}
                onClick={() => setSidebarOpen(v => !v)}
              />
              <Typography size="base-lg" weight={fontWeight.SEMIBOLD} color="neutral-darken5" maxLines={1}>{activeSession.title}</Typography>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div style={{ maxWidth: 840, width: '100%', padding: `${spacing(4)}px ${spacing(8)}px`, display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
                {activeSession.messages.map(m => m.role === 'user' ? <ChatBubbleUser key={m.id} message={m} /> : <ChatBubbleAssistant key={m.id} message={m} />)}
              </div>
            </div>
            <div style={{ flexShrink: 0, padding: `0 ${spacing(8)}px ${spacing(4)}px`, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: 840 }}>
                <MessageComposer
                  value={question}
                  onChange={setQuestion}
                  onSend={attachments => { appendToSession(activeSession.id, question.trim(), attachments); setQuestion('') }}
                  seedAttachments={[]}
                  onSeedAttachmentsConsumed={() => {}}
                  placeholder="Ask a follow-up question"
                  autoSize={{ minRows: 2, maxRows: 6 }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', padding: `0 ${spacing(4)}px` }}>
              <ButtonGhost
                shape={buttonShapes.SQUARE}
                leftIcon={sidebarOpen ? iconType.ChevronLeftOutlined : iconType.ChevronRightOutlined}
                onClick={() => setSidebarOpen(v => !v)}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `0 ${spacing(10)}px ${spacing(20)}px` }}>
              <div style={{ maxWidth: 824, width: '100%', display: 'flex', flexDirection: 'column', gap: spacing(7) }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
                  {/* Typography's `size` enum has no 24px step, so this bypasses it for the
                      exact size rather than settling for the nearest enum step. */}
                  <span style={{ fontSize: 24, lineHeight: '1.3', fontWeight: 700, color: colorPalette.neutral.darken5 }}>How can I help?</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
                    <Typography size="base" color="neutral-darken5">
                      As an AI, I base my answers to your questions on current, legally sound knowledge from Haufe Office, and back them up with sources.
                    </Typography>
                    <div style={{ width: 80, height: 1, backgroundColor: colorPalette.neutral.lighten1 }} />
                    <Typography size="base-sm" color="neutral-darken2">
                      <span style={{ fontWeight: fontWeight.SEMIBOLD }}>Note</span> The AI can make mistakes. Check the answer against the cited sources and your own expertise.
                    </Typography>
                  </div>
                </div>

                <MessageComposer
                  value={question}
                  onChange={setQuestion}
                  onSend={handleWelcomeSend}
                  seedAttachments={seedAttachments}
                  onSeedAttachmentsConsumed={() => setSeedAttachments([])}
                  placeholder="Ask a question"
                  autoSize={{ minRows: 2, maxRows: 6 }}
                />
              </div>
            </div>

            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: spacing(4) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
                <Icon type={iconType.ShieldCheckFilled} size={16} color="blue-darken1" />
                <Typography size="base-sm" color="blue-darken2">
                  Your data is private and secure. <span style={{ color: colorPalette.blue.base, textDecoration: 'underline', cursor: 'pointer' }}>Learn more</span>
                </Typography>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
