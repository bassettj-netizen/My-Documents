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
import { CoPilotMark } from './CoPilotPage'
import MyDocumentsV1, { type PersonalDoc } from '../my-documents/Version1'

// Same shape-filling as CoPilotPage's own personalDocToMetadataDoc — kept as its own copy
// rather than a shared export since the two pages' document models could reasonably diverge.
function personalDocToMetadataDoc(doc: PersonalDoc): MetadataDocument {
  return {
    _id: doc._id, name: doc.name, domain: 'Personal', documentType: doc.documentType,
    status: 'Draft', namedEntity: '—', namedEntityId: '—', year: new Date(doc.uploadedDate).getFullYear(),
    monetaryAmounts: 0, currency: 'EUR', monetaryTypes: 'None', lawType: '—', citations: '—',
    jurisdiction: '—', uploadedDate: doc.uploadedDate, fileSize: doc.fileSize, fileFormat: doc.fileFormat,
  }
}

// ─── Example chat sessions (HR-flavored, same shape as CoPilot Tax's own) ───────────────────

type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string; attachmentNames?: string[] }
type ChatSession = { id: string; title: string; month: string; messages: ChatMsg[] }

let sessionCounter = 0
function nextId(prefix: string) { sessionCounter += 1; return `${prefix}-hr-${sessionCounter}` }

function session(id: string, month: string, title: string, question: string, answer: string): ChatSession {
  return {
    id, month, title,
    messages: [
      { id: `${id}-u`, role: 'user', content: question },
      { id: `${id}-a`, role: 'assistant', content: answer },
    ],
  }
}

const INITIAL_SESSIONS_HR: ChatSession[] = [
  session('hr-feb-1', 'February', 'Probation Period Extension Rules',
    "Can we extend an employee's probation period (Probezeit) if we're still unsure after 6 months?",
    "No — under German law the probationary period is capped at **6 months maximum** (§ 622 Abs. 3 BGB) and cannot be extended, even by mutual agreement, if the goal is simply to keep the shortened 2-week notice period alive longer. If more time is genuinely needed to assess fit, options are: agree a new fixed-term contract with its own review point, or make the decision within the existing window using whatever performance signal you have.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual HR records.)"),
  session('hr-feb-2', 'February', 'Works Council Consultation for a Reorg',
    'Do we need to consult the works council (Betriebsrat) before restructuring a department of 12 people?',
    "Yes — a restructuring affecting a department of this size very likely qualifies as a **Betriebsänderung** under § 111 BetrVG (the threshold is lower once the company has 20+ eligible employees), which requires consulting the works council on both a reconciliation of interests (Interessenausgleich) and a social plan (Sozialplan) before implementation. Acting first and informing after is a common and costly mistake — it can expose the company to disadvantage compensation claims (Nachteilsausgleich).\n\n(Simulated response for prototyping — connect a real assistant to answer from actual HR records.)"),
  session('hr-feb-3', 'February', 'Parental Leave Notice Period',
    'What notice period does an employee need to give before starting parental leave (Elternzeit)?',
    "**7 weeks** before the start date for leave taken during a child's first 3 years, and **13 weeks** for leave taken between the child's 3rd and 8th birthday. The request must be in writing (text form is sufficient since 2022) and should state which specific years of leave are being claimed, since only 24 months can be deferred past the child's 3rd birthday without the employer's consent.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual HR records.)"),
  session('hr-feb-4', 'February', 'Drafting a Warning Letter',
    'Draft a formal warning letter (Abmahnung) for repeated unexcused lateness.',
    "Draft:\n\n\"Dear [Employee], we have observed that you arrived after your scheduled start time on [dates] without prior notice or an approved reason. This constitutes a breach of your obligations under your employment contract. We formally warn you that any further unexcused lateness may result in further disciplinary steps, up to and including termination of your employment. Please contact HR if there are circumstances we should be aware of.\"\n\n(Simulated response for prototyping — connect a real assistant to answer from actual HR records.)"),
  session('hr-feb-5', 'February', 'Remote Work Agreement — Equipment Liability',
    'Who is liable if company equipment is damaged at an employee’s home office under our remote work agreement?',
    "Under a standard remote work agreement (mobiles Arbeiten), the company typically remains liable for its own equipment as the owner, but the agreement should specify that the employee is expected to take reasonable care and report damage or theft promptly — gross negligence or intentional damage can shift liability to the employee under general civil liability principles (§ 823 BGB), but ordinary wear or accidental damage stays with the employer.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual HR records.)"),
  session('hr-jan-1', 'January', 'Exit Interview — Common Themes This Quarter',
    'Summarize the recurring themes from this quarter’s exit interviews.',
    "Based on the exit interview notes on file, the three most recurring themes are: **limited internal growth visibility** (several respondents felt promotion criteria weren't transparent), **workload during peak filing season**, and **compensation lagging market rate** for mid-level roles specifically. None flagged management or team culture as a primary driver this quarter, which is a shift from last year.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual HR records.)"),
  session('hr-jan-2', 'January', 'GDPR — Retention Period for Applicant Data',
    'How long can we retain rejected job applicants’ personal data under GDPR?',
    "Generally **up to 6 months** after the rejection decision is considered defensible without separate consent, to cover the window in which a rejected candidate could bring a discrimination claim under the AGG (typically 2 months to file, plus processing time). Retaining longer requires the candidate's explicit consent — e.g. for a talent pool — and that consent should be requested and recorded separately from the original application.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual HR records.)"),
  session('hr-jan-3', 'January', 'Performance Review Calibration Approach',
    'What’s a fair way to calibrate performance ratings across five different team managers?',
    "A cross-manager calibration session before ratings are finalized is the standard approach — each manager presents their proposed ratings with supporting examples, and outliers (a manager rating everyone unusually high or low relative to peers) get discussed openly against a shared rubric. This catches leniency/severity bias before it reaches the employee, and creates a paper trail showing ratings were checked for consistency, which matters if a rating is ever challenged.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual HR records.)"),
]

function makeCannedReply(question: string): string {
  return `Based on your question — "${question.length > 80 ? `${question.slice(0, 80)}…` : question}" — here's a starting point: I'd check the relevant employment law provisions and any internal HR policy on file, then confirm against the employee's actual record before finalizing anything.\n\n(Simulated response for prototyping — connect a real assistant to answer from actual HR records.)`
}

// ─── Small building blocks (same treatment as CoPilot Tax's own) ────────────

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

export default function CoPilotHrPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [question, setQuestion] = useState('')
  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS_HR)
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
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
            <CoPilotMark size={40} />
            <span style={{ fontSize: 20, fontWeight: 700, color: '#001344' }}>CoPilot HR</span>
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
                  <span style={{ fontSize: 24, lineHeight: '1.3', fontWeight: 700, color: colorPalette.neutral.darken5 }}>How can I help?</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
                    <Typography size="base" color="neutral-darken5">
                      As an AI, I base my answers to your questions on current, legally sound knowledge from Haufe HR, and back them up with sources.
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
