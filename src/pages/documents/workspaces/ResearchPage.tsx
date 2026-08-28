import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Carousel,
  Icon,
  iconType,
  SearchBar,
  searchbarWidth,
  Typography,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, fontWeight } from './shared'

// Served straight from /public rather than imported as ES modules — the dev server's
// import-transform pipeline for these was intermittently dropping requests (images loading
// on some page visits, missing on others); plain static files under /public have no
// transform step to race with, so once loaded they're always there.
const payTransparencyImg = '/research/pay-transparency.png'
const copilotHrImg = '/research/copilot-hr.png'
const employmentLawReformImg = '/research/employment-law-reform.png'
const speakerKaiLitschenImg = '/research/speaker-kai-litschen.jpg'
const jobAdvertisementImg = '/research/job-advertisement.jpg'

// ─── Left navigation ──────────────────────────────────────────────────────

// https://www.svgrepo.com/svg/425374/tools — no DS icon covers "tools/practice aids", so this
// is embedded directly (same treatment as the CoPilot brand mark elsewhere), fill swapped to
// currentColor so it tints via the wrapping div like every other custom sidebar icon here.
export function ToolsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-364 -416)">
        <path d="M385.788,432.722l9.221-9.221a3.471,3.471,0,0,0,0-4.9l-1.627-1.627a3.549,3.549,0,0,0-4.9,0l-8.5,8.5a7.836,7.836,0,0,0-10.791-8.463,1,1,0,0,0-.318,1.628l3.016,3.015-.642,1.584-1.569.648-3.026-3.026a1,1,0,0,0-1.628.318,7.83,7.83,0,0,0,9.422,10.567,3.481,3.481,0,0,0-.1.8,3.439,3.439,0,0,0,.34,1.471l-6.193,6.193-1.224.676c-.009,0-.013.014-.021.018a.963.963,0,0,0-.192.175,1,1,0,0,0-.135.133c0,.006-.01.008-.014.014l-2.772,4.377a1,1,0,0,0,.138,1.243l.863.862a1,1,0,0,0,1.242.137l4.378-2.772c.006,0,.009-.01.014-.014a4.349,4.349,0,0,0,.308-.327c.005-.008.014-.012.019-.02l.675-1.225,6.191-6.191a3.278,3.278,0,0,0,2.479.174l9.055,9.055a3.571,3.571,0,1,0,5.05-5.049Zm-17.669-4.36a5.816,5.816,0,0,1-1.665-4.876l2.286,2.286a1,1,0,0,0,1.089.218l2.573-1.064a1,1,0,0,0,.545-.549l1.048-2.586a1,1,0,0,0-.22-1.083l-2.272-2.272a5.844,5.844,0,0,1,6.125,8.071,1,1,0,0,0,.214,1.1l.007.007-2.22,2.22-.006-.006a1,1,0,0,0-1.1-.214A5.82,5.82,0,0,1,368.119,428.362Zm2.845,13.109-.45-.45,5.434-5.434.449.449Zm-3.036,1.885.045.045.656.655-1.911,1.211Zm10.528-8.109-1.765-1.764a1.451,1.451,0,0,1,.084-1.969L389.9,418.39a1.464,1.464,0,0,1,2.069,0l1.626,1.626a1.467,1.467,0,0,1,0,2.071l-13.126,13.124A1.491,1.491,0,0,1,378.456,435.247Zm14.676,9.868a1.607,1.607,0,0,1-2.221,0l-8.759-8.759,2.221-2.221,8.76,8.76a1.568,1.568,0,0,1,0,2.22Z" fill="currentColor" />
        <path d="M391.108,443.091a.824.824,0,1,0,1.165,0A.823.823,0,0,0,391.108,443.091Z" fill="currentColor" />
        <path d="M391.3,420.688a.578.578,0,0,0-.818,0L379.071,432.1a.579.579,0,0,0,.821.818l11.4-11.406A.578.578,0,0,0,391.3,420.688Z" fill="currentColor" />
      </g>
    </svg>
  )
}

// https://www.svgrepo.com/svg/450084/dashboard — no DS icon covers this exact 4-tile
// dashboard look, so this is embedded directly, matching the same currentColor-fill
// treatment as every other custom sidebar icon here.
export function DashboardIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M3 2C2.44772 2 2 2.44772 2 3V6C2 6.55228 2.44772 7 3 7H6C6.55228 7 7 6.55228 7 6V3C7 2.44772 6.55228 2 6 2H3ZM3 0H6C7.65685 0 9 1.34315 9 3V6C9 7.65685 7.65685 9 6 9H3C1.34315 9 0 7.65685 0 6V3C0 1.34315 1.34315 0 3 0ZM14 16H21C22.6569 16 24 17.3431 24 19V21C24 22.6569 22.6569 24 21 24H14C12.3431 24 11 22.6569 11 21V19C11 17.3431 12.3431 16 14 16ZM14 18C13.4477 18 13 18.4477 13 19V21C13 21.5523 13.4477 22 14 22H21C21.5523 22 22 21.5523 22 21V19C22 18.4477 21.5523 18 21 18H14ZM3 11H6C7.65685 11 9 12.3431 9 14V21C9 22.6569 7.65685 24 6 24H3C1.34315 24 0 22.6569 0 21V14C0 12.3431 1.34315 11 3 11ZM3 13C2.44772 13 2 13.4477 2 14V21C2 21.5523 2.44772 22 3 22H6C6.55228 22 7 21.5523 7 21V14C7 13.4477 6.55228 13 6 13H3ZM21 0C22.6569 0 24 1.34315 24 3V11C24 12.6569 22.6569 14 21 14H14C12.3431 14 11 12.6569 11 11V3C11 1.34315 12.3431 0 14 0H21ZM13 3V11C13 11.5523 13.4477 12 14 12H21C21.5523 12 22 11.5523 22 11V3C22 2.44772 21.5523 2 21 2H14C13.4477 2 13 2.44772 13 3Z" fill="currentColor" />
    </svg>
  )
}

const NAV_ITEMS: { key: string; label: string; icon?: string; customIcon?: React.ReactNode }[] = [
  // "Overview" rather than "Home" — the global Launch Pad rail already has its own Home,
  // and reusing the same name for a second, different destination read as a duplicate.
  { key: 'overview', label: 'Overview', customIcon: <DashboardIcon size={20} /> },
  { key: 'favorites', label: 'My Favorites', icon: iconType.StarOutlined },
  { key: 'lexicon', label: 'Lexicon & Articles', icon: iconType.OpenBookOutlined },
  { key: 'sources', label: 'Legal Sources', icon: iconType.ArticleOutlined },
  { key: 'agreements', label: 'Collective Agreements', icon: iconType.SignatureOutlined },
  { key: 'caselaw', label: 'Case Law', icon: iconType.TaskOutlined },
  { key: 'tools', label: 'Tools', customIcon: <ToolsIcon size={20} /> },
]

export function NavRow({ label, icon, customIcon, active, onClick }: { label: string; icon?: string; customIcon?: React.ReactNode; active?: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: spacing(3),
        padding: `${spacing(3)}px ${spacing(4)}px`, cursor: onClick ? 'pointer' : 'default',
        backgroundColor: active ? colorPalette.blue.lighten5 : hovered ? colorPalette.neutral.lighten4 : undefined,
        borderLeft: `3px solid ${active ? colorPalette.blue.base : 'transparent'}`,
      }}
    >
      {customIcon ? (
        <div style={{ display: 'flex', color: active ? colorPalette.blue.base : colorPalette.neutral.darken4 }}>{customIcon}</div>
      ) : icon ? (
        <Icon type={icon as never} size={20} color={active ? 'blue-base' : 'neutral-darken4'} />
      ) : null}
      {/* Plain span, not Typography — 14px/medium(500), matching CoPilot's own nav items;
          Typography's `size` enum has no 14px-medium combination to reach directly. */}
      <span style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? colorPalette.blue.darken2 : colorPalette.neutral.darken5 }}>{label}</span>
    </div>
  )
}

// ─── Small building blocks ───────────────────────────────────────────────────

// A plain bordered container, not the DS Card — Card's own visual boundary reads too subtly
// for the bordered-tile look the source design uses. Title gets its own breathing room
// (padding-bottom, plus a divider) before the content starts, rather than sitting flush above it.
export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 8, backgroundColor: colorPalette.white, overflow: 'hidden' }}>
      <div style={{ padding: `${spacing(4)}px ${spacing(4)}px ${spacing(3)}px` }}>
        <Typography size="base-lg" weight={fontWeight.SEMIBOLD} color="neutral-darken5">{title}</Typography>
      </div>
      <div style={{ borderTop: `1px solid ${colorPalette.neutral.lighten2}` }}>
        {children}
      </div>
    </div>
  )
}

// Same circular crop the source design uses for every photo/logo slot.
function CircleImage({ src, size = 96, padding }: { src: string; size?: number; padding?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      backgroundColor: padding ? colorPalette.white : undefined,
      border: padding ? `1px solid ${colorPalette.neutral.lighten2}` : undefined,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <img
        src={src}
        alt=""
        style={{ width: padding ? size - padding * 2 : size, height: padding ? size - padding * 2 : size, objectFit: 'cover', borderRadius: padding ? undefined : '50%' }}
      />
    </div>
  )
}

export function LinkRow({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ padding: `${spacing(3)}px ${spacing(4)}px`, borderBottom: last ? undefined : `1px solid ${colorPalette.neutral.lighten2}`, cursor: 'pointer' }}>
      <Typography size="base" color="neutral-darken5">{children}</Typography>
    </div>
  )
}

export function ViewAllLink({ children = 'View full overview', onClick }: { children?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ padding: `${spacing(3)}px ${spacing(4)}px`, display: 'flex', alignItems: 'center', gap: spacing(1), cursor: 'pointer', borderTop: `1px solid ${colorPalette.neutral.lighten2}` }}>
      <Typography size="base" color="blue-base" weight={fontWeight.SEMIBOLD}>{children}</Typography>
      <Icon type={iconType.ChevronRightOutlined} size={12} color="blue-base" />
    </div>
  )
}

function SlideLink({ children = 'View now' }: { children?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1), cursor: 'pointer' }}>
      <Typography size="base" color="blue-base" weight={fontWeight.SEMIBOLD}>{children}</Typography>
      <Icon type={iconType.ChevronRightOutlined} size={12} color="blue-base" />
    </div>
  )
}

export type NewsSlide = { image: string; title: string; subtitle: string; date?: string }

function NewsCarouselSlide({ slide }: { slide: NewsSlide }) {
  return (
    <div style={{ display: 'flex', gap: spacing(4), padding: `${spacing(2)}px ${spacing(4)}px`, alignItems: 'center' }}>
      <CircleImage src={slide.image} size={100} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
        <Typography size="base-lg" weight={fontWeight.SEMIBOLD} color="neutral-darken5">{slide.title}</Typography>
        <Typography size="base-sm" color="neutral-darken3">{slide.subtitle}</Typography>
        {slide.date && <Typography size="base-sm" color="neutral-darken3">{slide.date}</Typography>}
        <SlideLink />
      </div>
    </div>
  )
}

// One real slide per carousel — only these five photos were provided; fabricating more
// slides to fill the carousel out would mean pairing invented copy with no matching image.
export const NEWS_SLIDES: NewsSlide[] = [
  { image: payTransparencyImg, title: 'Pay Transparency', subtitle: 'What public-sector employers need to observe' },
]

const VIDEO_SLIDES: NewsSlide[] = [
  { image: employmentLawReformImg, title: 'Changes in Employment Law', subtitle: 'Reform package from the federal government' },
]

const HAUFE_NET_SLIDES: NewsSlide[] = [
  { image: jobAdvertisementImg, title: 'Job Advertisement', subtitle: 'Liability for discriminatory job postings on job portals', date: '27 Aug 2026' },
]

// Exported for reuse on the Home screen's "Latest from Tax Office" feed — real content,
// not a second, parallel set of invented headlines.
export const CASE_LAW_HIGHLIGHTS = [
  "Involvement of the severely disabled employees' representative…",
  'No general contact ban during…',
  'Employer must grant contiguous le…',
]

// Curated shortcut list for the Overview dashboard's "Tools" card and Home's right rail —
// the full, browsable catalog lives in TOOLS_CATALOG / ToolsView below.
export const TOOLS_SHORTCUTS = [
  'TV-L Pay Tables',
  'Employment Contract Templates',
  'Calculations',
  'Works and Service Agreements',
]

// ─── A–Z article index ────────────────────────────────────────────────────

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const DISABLED_LETTERS = new Set(['X', 'Y'])

function LetterGrid() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2) }}>
      {ALPHABET.map(letter => {
        const disabled = DISABLED_LETTERS.has(letter)
        return (
          <div
            key={letter}
            style={{
              width: 32, height: 32, borderRadius: '50%', border: `1px solid ${disabled ? colorPalette.neutral.lighten2 : colorPalette.neutral.lighten1}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: disabled ? 'default' : 'pointer', backgroundColor: colorPalette.white,
            }}
          >
            <Typography size="base-sm" color={disabled ? 'neutral-lighten1' : 'neutral-darken4'}>{letter}</Typography>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tools (full catalog — node reached via the sidebar's Tools item) ───────

type ToolItem = { title: string; type: string }

const TOOLS_CATALOG: ToolItem[] = [
  { title: 'Active pension, employee confirmation', type: 'Sample template' },
  { title: 'Amendment to the contract', type: 'Contract' },
  { title: 'Active pension, information letter for employees', type: 'Sample template' },
  { title: 'Bonus agreement', type: 'Contract' },
  { title: 'Company car policy', type: 'Sample template' },
  { title: 'Certificate of employment', type: 'Sample template' },
  { title: 'Deadline extension request', type: 'Letter' },
  { title: 'Employment contract, standard', type: 'Contract' },
  { title: 'Exit interview checklist', type: 'Checklist' },
  { title: 'Home office agreement', type: 'Contract' },
  { title: 'Medical certificate of pregnancy for submission to the employer', type: 'Sample template' },
  { title: 'Notice of change, salary', type: 'Sample template' },
  { title: 'Notice of termination, general', type: 'Sample template' },
  { title: 'Parental leave request', type: 'Sample template' },
  { title: 'Severance agreement', type: 'Contract' },
  { title: 'Termination checklist', type: 'Checklist' },
  { title: 'Warning letter, general', type: 'Sample template' },
  { title: 'Works agreement template', type: 'Contract' },
]

export const TOOLS_TABS = [
  { key: 'az', label: 'A–Z' },
  { key: 'top10', label: 'Top 10' },
  { key: 'bytype', label: 'By type' },
] as const
export type ToolsTab = typeof TOOLS_TABS[number]['key']

// The letter-filter/search/grouped-list content — shared by the compact view embedded in
// Tax Office's own dashboard and the standalone top-level Tools screen, so both stay in sync
// instead of maintaining two copies of the same filtering logic.
export function ToolsResultsPanel({ tab }: { tab: ToolsTab }) {
  const [search, setSearch] = useState('')
  const [activeLetter, setActiveLetter] = useState<string | null>(null)

  useEffect(() => setActiveLetter(null), [tab])

  const filtered = useMemo(
    () => TOOLS_CATALOG.filter(item => item.title.toLowerCase().includes(search.trim().toLowerCase())),
    [search],
  )
  const availableLetters = useMemo(() => new Set(filtered.map(item => item.title[0].toUpperCase())), [filtered])

  const groups = useMemo(() => {
    if (tab === 'top10') return [{ heading: 'Top 10', items: filtered.slice(0, 10) }]
    if (tab === 'bytype') {
      return [...new Set(filtered.map(item => item.type))].sort()
        .map(type => ({ heading: type, items: filtered.filter(item => item.type === type) }))
    }
    return [...availableLetters].sort()
      .filter(letter => !activeLetter || letter === activeLetter)
      .map(letter => ({
        heading: letter,
        items: filtered.filter(item => item.title[0].toUpperCase() === letter).sort((a, b) => a.title.localeCompare(b.title)),
      }))
  }, [tab, filtered, activeLetter, availableLetters])

  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: spacing(5), display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
      {tab === 'az' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2) }}>
          {ALPHABET.map(letter => {
            const has = availableLetters.has(letter)
            const active = activeLetter === letter
            return (
              <div
                key={letter}
                onClick={() => has && setActiveLetter(active ? null : letter)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: `1px solid ${active ? colorPalette.blue.base : has ? colorPalette.neutral.lighten1 : colorPalette.neutral.lighten2}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: has ? 'pointer' : 'default', backgroundColor: active ? colorPalette.blue.base : colorPalette.white,
                }}
              >
                <Typography size="base-sm" color={active ? 'white' : has ? 'neutral-darken4' : 'neutral-lighten1'}>{letter}</Typography>
              </div>
            )
          })}
        </div>
      )}

      <SearchBar placeholder="Narrow down list" value={search} onChange={setSearch} width={searchbarWidth.EXPANDED} />

      <div style={{ border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 8, overflow: 'hidden' }}>
        {groups.filter(g => g.items.length > 0).length === 0 ? (
          <div style={{ padding: spacing(6) }}>
            <Typography size="base-sm" color="neutral-darken2">No items match your search.</Typography>
          </div>
        ) : groups.filter(g => g.items.length > 0).map(group => (
          <div key={group.heading}>
            <div style={{ padding: `${spacing(2)}px ${spacing(4)}px`, backgroundColor: colorPalette.blue.lighten5 }}>
              <Typography size="base-sm" weight={fontWeight.SEMIBOLD} color="blue-darken2">{group.heading}</Typography>
            </div>
            {group.items.map((item, i) => (
              <div
                key={item.title}
                style={{
                  padding: `${spacing(3)}px ${spacing(4)}px`, cursor: 'pointer',
                  borderBottom: i === group.items.length - 1 ? undefined : `1px solid ${colorPalette.neutral.lighten2}`,
                }}
              >
                <Typography size="base" weight={fontWeight.SEMIBOLD} color="neutral-darken5">{item.title}</Typography>
                <Typography size="base-sm" color="neutral-darken3">{item.type}</Typography>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ToolsView() {
  const [tab, setTab] = useState<ToolsTab>('az')

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${colorPalette.neutral.lighten1}`, padding: spacing(5), display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <Typography size="base-lg" weight={fontWeight.SEMIBOLD} color="neutral-darken5">Tools</Typography>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {TOOLS_TABS.map(t => (
            <div
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ padding: `${spacing(2)}px ${spacing(3)}px`, borderRadius: 6, cursor: 'pointer', backgroundColor: tab === t.key ? colorPalette.blue.lighten5 : undefined }}
            >
              <Typography size="base-sm" color={tab === t.key ? 'blue-base' : 'neutral-darken5'} weight={tab === t.key ? fontWeight.SEMIBOLD : undefined}>{t.label}</Typography>
            </div>
          ))}
        </div>
      </div>

      <ToolsResultsPanel tab={tab} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────

type ResearchView = 'overview' | 'tools'

export default function ResearchPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [view, setView] = useState<ResearchView>('overview')

  // Arriving here from the global rail's own "Tools" item — deep-link straight into the
  // Tools view rather than landing on Overview and making the user click in again. The nav
  // state is cleared right after, matching the same pattern CoPilotPage uses.
  useEffect(() => {
    const initialView = (location.state as { initialView?: ResearchView } | null)?.initialView
    if (!initialView) return
    setView(initialView)
    navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 260, flexShrink: 0, borderRight: `1px solid ${colorPalette.neutral.lighten1}`, display: 'flex', flexDirection: 'column' }}>
        {/* Matches CoPilotPage's own sidebar header: icon + name, no separate Haufe lockup.
            The icon's color has to be set via a wrapping div (color: 'inherit' + CSS
            currentColor) rather than Icon's own `color` prop, which only accepts DS tokens —
            #141F29 matches the CoPilot mark's exact color, which isn't one of them. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(5)}px ${spacing(4)}px` }}>
          <div style={{ color: '#141F29', display: 'flex' }}>
            <Icon type={iconType.OpenBookOutlined} size={32} color="inherit" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#001344' }}>Tax Office</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => (
            <NavRow
              key={item.key}
              label={item.label}
              icon={item.icon}
              customIcon={item.customIcon}
              active={item.key === view}
              onClick={item.key === 'overview' || item.key === 'tools' ? () => setView(item.key as ResearchView) : undefined}
            />
          ))}
        </div>
      </div>

      {view === 'tools' ? <ToolsView /> : (
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', position: 'relative' }}>
        <div style={{ padding: spacing(5) }}>
          <SearchBar placeholder="Search keyword" width={searchbarWidth.EXPANDED} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing(5), padding: `0 ${spacing(5)}px ${spacing(10)}px` }}>
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5), minWidth: 0 }}>
            <SectionCard title="Latest News">
              <Carousel items={NEWS_SLIDES.map((slide, i) => <NewsCarouselSlide key={i} slide={slide} />)} arrows={false} />
              <div style={{ borderTop: `1px solid ${colorPalette.neutral.lighten2}` }}>
                <LinkRow>Collective Bargaining / Case Law / Legislation</LinkRow>
                <LinkRow>2026 Case Law Overview</LinkRow>
                <LinkRow last>New and Updated Documents</LinkRow>
              </div>
            </SectionCard>

            <SectionCard title="Notes on Current Case Law">
              {CASE_LAW_HIGHLIGHTS.map((item, i) => (
                <LinkRow key={item} last={i === CASE_LAW_HIGHLIGHTS.length - 1}>{item}</LinkRow>
              ))}
              <ViewAllLink />
            </SectionCard>
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5), minWidth: 0 }}>
            <SectionCard title="CoPilot HR Public Sector">
              <div style={{ display: 'flex', gap: spacing(4), padding: spacing(4), alignItems: 'center' }}>
                <CircleImage src={copilotHrImg} size={64} padding={12} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
                  <Typography size="base" color="neutral-darken5">
                    Ask the AI chatbot your HR questions. Its answers are based on the extensive expertise of Haufe Research.
                  </Typography>
                  <SlideLink>Start chatting!</SlideLink>
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${colorPalette.neutral.lighten2}` }}>
                <LinkRow>Getting Started Tips &amp; FAQ</LinkRow>
                <LinkRow last>CoPilot HR Training</LinkRow>
              </div>
            </SectionCard>

            <SectionCard title="TV-L Articles">
              <div style={{ padding: spacing(4) }}>
                <LetterGrid />
              </div>
              <ViewAllLink />
            </SectionCard>

            <SectionCard title="Tools">
              {TOOLS_SHORTCUTS.map((item, i) => (
                <LinkRow key={item} last={i === TOOLS_SHORTCUTS.length - 1}>{item}</LinkRow>
              ))}
              <ViewAllLink onClick={() => setView('tools')} />
            </SectionCard>
          </div>

          {/* Column 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5), minWidth: 0 }}>
            <SectionCard title="Video Series: To the Point">
              <Carousel items={VIDEO_SLIDES.map((slide, i) => <NewsCarouselSlide key={i} slide={slide} />)} arrows={false} />
            </SectionCard>

            <SectionCard title="Haufe Online Training">
              <div style={{ padding: `0 ${spacing(4)}px ${spacing(4)}px` }}>
                <Typography size="base-sm" color="neutral-darken3">Live online seminars</Typography>
              </div>
              <div style={{ display: 'flex', gap: spacing(4), padding: `0 ${spacing(4)}px ${spacing(4)}px` }}>
                <CircleImage src={speakerKaiLitschenImg} size={90} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
                  <Typography size="base" weight={fontWeight.SEMIBOLD} color="neutral-darken5">
                    Structuring Public-Sector Compensation Strategically
                  </Typography>
                  <Typography size="base-sm" color="neutral-darken3">Prof. Dr. Kai Litschen</Typography>
                  <Typography size="base-sm" color="neutral-darken3">Thursday, 10 Sep 2026 | 10:30 AM | Paid</Typography>
                  <SlideLink>Learn more and register</SlideLink>
                </div>
              </div>
              <ViewAllLink>Go to Media Library</ViewAllLink>
            </SectionCard>

            <SectionCard title="haufe.de/public-sector">
              <Carousel items={HAUFE_NET_SLIDES.map((slide, i) => <NewsCarouselSlide key={i} slide={slide} />)} arrows={false} />
            </SectionCard>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
