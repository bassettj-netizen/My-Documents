import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Icon,
  iconType,
  Typography,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, fontWeight } from './shared'
import { NEWS_SLIDES, CASE_LAW_HIGHLIGHTS, TOOLS_SHORTCUTS, SectionCard } from './ResearchPage'
import { CoPilotMark, INITIAL_SESSIONS } from './CoPilotPage'
import { MessageComposer } from './Version6'

const LAUNCH_PAD_BASE = '/projects/workspaces/launch-pad-2'

// Front door into every real product in the suite — Home's job is getting people into the
// right one fast, not duplicating what's already built inside each of them. Ordered as the
// two office+CoPilot pairs (matching the sidebar's own grouping), then Workspaces.
const QUICK_LAUNCH: { key: string; label: string; description: string; icon?: string; customIcon?: React.ReactNode; path: string }[] = [
  { key: 'copilot', label: 'CoPilot Tax', description: 'Ask a tax question and get sourced answers', customIcon: <CoPilotMark size={20} />, path: `${LAUNCH_PAD_BASE}/copilot` },
  { key: 'research', label: 'Tax Office', description: 'News, case law, and practice aids', icon: iconType.OpenBookOutlined, path: `${LAUNCH_PAD_BASE}/research` },
  { key: 'copilot-hr', label: 'CoPilot HR', description: 'Ask an HR question and get sourced answers', customIcon: <CoPilotMark size={20} />, path: `${LAUNCH_PAD_BASE}/hr-office/copilot` },
  { key: 'hr-office', label: 'HR Office', description: 'Policies, onboarding, and employee relations', icon: iconType.UsersOutlined, path: `${LAUNCH_PAD_BASE}/hr-office` },
  { key: 'workspaces', label: 'Workspaces', description: 'Client spaces, chats, and documents', icon: iconType.ElementsOutlined, path: `${LAUNCH_PAD_BASE}/workspaces` },
]

function QuickLaunchTile({ item, onClick }: { item: typeof QUICK_LAUNCH[number]; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? colorPalette.blue.base : colorPalette.neutral.lighten2}`, borderRadius: 8,
        padding: spacing(5), cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: spacing(2),
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colorPalette.blue.lighten5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.customIcon ?? <Icon type={item.icon as never} size={20} color="blue-base" />}
      </div>
      <Typography size="base-lg" weight={fontWeight.SEMIBOLD} color="neutral-darken5">{item.label}</Typography>
      <Typography size="base-sm" color="neutral-darken3">{item.description}</Typography>
    </div>
  )
}

function RailLinkRow({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ padding: `${spacing(2)}px ${spacing(3)}px`, borderRadius: 6, cursor: onClick ? 'pointer' : 'default', backgroundColor: hovered ? colorPalette.neutral.lighten4 : undefined }}
    >
      <Typography size="base-sm" color="neutral-darken5" maxLines={1}>{children}</Typography>
    </div>
  )
}

export default function HomePage2() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')

  // Same nav-state handoff CoPilot's own composer produces internally — arriving there
  // starts the chat immediately instead of landing on its welcome screen unanswered.
  // No attachments are offered from Home, so MessageComposer's onSend payload is unused.
  const handleAsk = () => {
    const text = question.trim()
    if (!text) return
    navigate(`${LAUNCH_PAD_BASE}/copilot`, { state: { initialQuestion: text } })
  }

  const latestNews = NEWS_SLIDES[0]
  const recentChats = INITIAL_SESSIONS.slice(0, 4)

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: `${spacing(10)}px ${spacing(5)}px ${spacing(12)}px`, display: 'flex', flexDirection: 'column', gap: spacing(9) }}>

        {/* Greeting + unified ask bar — the same composer CoPilot and Workspaces use, minus
            its "Add document"/"Prompt templates" actions, which don't apply from Home. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5), alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: colorPalette.neutral.darken5 }}>Welcome back, Alex</span>
          <div style={{ width: '100%', maxWidth: 640 }}>
            <MessageComposer
              value={question}
              onChange={setQuestion}
              onSend={handleAsk}
              seedAttachments={[]}
              onSeedAttachmentsConsumed={() => {}}
              // Generic on purpose — with both CoPilot Tax and CoPilot HR now in the suite,
              // naming one specific CoPilot here would misrepresent where the question goes.
              placeholder="What's on your mind?"
              autoSize={{ minRows: 2, maxRows: 6 }}
              hideActions
            />
          </div>
        </div>

        {/* Quick launch into every real product — the two office+CoPilot pairs read together
            as adjacent tiles, echoing the sidebar's own grouping. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing(4) }}>
          {QUICK_LAUNCH.map(item => (
            <QuickLaunchTile key={item.key} item={item} onClick={() => navigate(item.path)} />
          ))}
        </div>

        {/* Latest from Tax Office + right rail — bordered SectionCards throughout, same
            treatment as Tax Office itself, so Home reads as part of the same product family
            rather than a differently-styled landing page bolted on top. */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: spacing(6), alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
            <SectionCard title="Latest from Tax Office">
              <div
                onClick={() => navigate(`${LAUNCH_PAD_BASE}/research`)}
                style={{ padding: spacing(4), display: 'flex', gap: spacing(4), alignItems: 'center', cursor: 'pointer' }}
              >
                <img src={latestNews.image} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
                  <Typography size="base-lg" weight={fontWeight.SEMIBOLD} color="neutral-darken5">{latestNews.title}</Typography>
                  <Typography size="base-sm" color="neutral-darken3">{latestNews.subtitle}</Typography>
                </div>
              </div>
              <div onClick={() => navigate(`${LAUNCH_PAD_BASE}/research`)} style={{ padding: `${spacing(3)}px ${spacing(4)}px`, display: 'flex', alignItems: 'center', gap: spacing(1), cursor: 'pointer', borderTop: `1px solid ${colorPalette.neutral.lighten2}` }}>
                <Typography size="base" color="blue-base" weight={fontWeight.SEMIBOLD}>Go to Tax Office</Typography>
                <Icon type={iconType.ChevronRightOutlined} size={12} color="blue-base" />
              </div>
            </SectionCard>

            <SectionCard title="Notes on Current Case Law">
              {CASE_LAW_HIGHLIGHTS.map((item, i) => (
                <div key={item} style={{ padding: `${spacing(3)}px ${spacing(4)}px`, borderBottom: i === CASE_LAW_HIGHLIGHTS.length - 1 ? undefined : `1px solid ${colorPalette.neutral.lighten2}` }}>
                  <Typography size="base-sm" color="neutral-darken5">{item}</Typography>
                </div>
              ))}
            </SectionCard>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
            <SectionCard title="Recent Chats">
              {recentChats.map(session => (
                <RailLinkRow
                  key={session.id}
                  onClick={() => navigate(`${LAUNCH_PAD_BASE}/copilot`, { state: { openChatId: session.id } })}
                >
                  {session.title}
                </RailLinkRow>
              ))}
            </SectionCard>

            <SectionCard title="Tools">
              {TOOLS_SHORTCUTS.map(item => (
                <RailLinkRow key={item} onClick={() => navigate(`${LAUNCH_PAD_BASE}/research`, { state: { initialView: 'tools' } })}>{item}</RailLinkRow>
              ))}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}
