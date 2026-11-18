import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ButtonGhost,
  ButtonPrimary,
  buttonShapes,
  buttonSizes,
  Icon,
  iconType,
  SearchBar,
  searchbarWidth,
  Typography,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, fontWeight } from '../workspaces/shared'
import { CoPilotMark } from '../workspaces/CoPilotPage'
import { defineText, useArea, useText } from './context'
import { CollapseStrip } from './SidebarChevron'
import type { OfficeBlock, OfficeMedia, OfficeTeaser, OfficeWidget } from './content/types'

/**
 * Workspaces User Testing Nov '26 — the subject area's product start page, modelled on the Haufe Personal Office
 * Platin start page (screenshots/Haufe-haufe-personal-office-platin (1).avif).
 *
 * - Its own product navigation on the left (from the area's `office.navItems`), collapsible.
 * - Search across the top, then three columns of widgets (the area's `office.columns`) with tinted headers.
 *   Widgets with several entries page through them with ‹ dots ›.
 * - The CoPilot widget is highlighted; its button opens the CoPilot page.
 * - Photos in the original are stand-ins here (icons, initials and symbols), except where an area has image assets
 *   (HR: public/user-testing-nov-26/hr/).
 * - Areas with a product screen (screenshots/HR.png, Finance.png, oD.png, Real Estate.png) build their widgets from
 *   blocks (link lists, A–Z grid, intros, notes) and have the keyword search with the Suche | CoPilot toggle.
 */

const TEXT = defineText({
  search: 'Search for…',
  keywordSearch: 'Search by keyword',
  modeSearch: 'Search',
  askAi: 'Ask the AI a question',
  askQuestion: 'Ask question',
  collapseNav: 'Collapse navigation',
  expandNav: 'Expand navigation',
  previous: 'Previous',
  next: 'Next',
}, {
  search: 'Suchen nach…',
  keywordSearch: 'Stichwort suchen',
  modeSearch: 'Suche',
  askAi: 'Frage an KI stellen',
  askQuestion: 'Frage stellen',
  collapseNav: 'Navigation einklappen',
  expandNav: 'Navigation ausklappen',
  previous: 'Zurück',
  next: 'Weiter',
})

const PAGE_BG = colorPalette.neutral.lighten5
// The collapsed navigation shows the product icon in a 32px box, with 16px either side.
const PRODUCT_ICON_BOX = 32
const COLLAPSED_NAV_WIDTH = PRODUCT_ICON_BOX + 2 * 16
const HEADER_BG = '#E4E8F7'
const NAVY = '#001344'
// The near-black circles and badges on the product screens (Gesetzesradar, video play buttons, the HRD logo).
const NAVY_DARK = '#1c212d'

// ─── Building blocks ──────────────────────────────────────────────────────────

function Widget({ title, subtitle, highlighted = false, children }: { title: string; subtitle?: string; highlighted?: boolean; children: ReactNode }) {
  return (
    <div style={{ backgroundColor: colorPalette.white, borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0, 19, 68, 0.06)' }}>
      <div style={{ padding: `${spacing(2)}px ${spacing(3)}px`, backgroundColor: HEADER_BG }}>
        <Typography size="base-sm" weight={fontWeight.SEMIBOLD} color="neutral-darken5">{title}</Typography>
        {subtitle && <div style={{ marginTop: spacing(2), fontSize: 12, color: colorPalette.neutral.darken3 }}>{subtitle}</div>}
      </div>
      <div style={{ backgroundColor: highlighted ? colorPalette.blue.lighten5 : undefined }}>{children}</div>
    </div>
  )
}

/** A media + text entry: picture on the left, heading, a line or two, and a "Jetzt …" link. */
function Teaser({ media, kicker, title, text, meta, cta, onCta }: { media: ReactNode; kicker?: string; title: string; text?: string; meta?: string; cta: string; onCta?: () => void }) {
  return (
    <div style={{ display: 'flex', gap: spacing(3), alignItems: 'center' }}>
      <div style={{ flexShrink: 0, width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{media}</div>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {kicker && <span style={{ fontSize: 12, fontWeight: 600, color: colorPalette.neutral.darken5 }}>{kicker}</span>}
        <Typography size="base-sm" weight={fontWeight.SEMIBOLD} color="neutral-darken5">{title}</Typography>
        {text && <Typography size="base-sm" color="neutral-darken4">{text}</Typography>}
        {meta && <Typography size="base-small" color="neutral-darken2">{meta}</Typography>}
        <CtaLink label={cta} onClick={onCta} />
      </div>
    </div>
  )
}

function CtaLink({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <span onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginTop: spacing(1), fontSize: 12, fontWeight: 600, color: colorPalette.blue.base, cursor: 'pointer' }}>
      {label}<Icon type={iconType.ChevronRightOutlined} size={12} color="inherit" />
    </span>
  )
}

/** Pages through a widget's entries with ‹ ● ○ ○ ›. */
function Carousel({ items, perPage = 1 }: { items: ReactNode[]; perPage?: number }) {
  const t = useText(TEXT)
  const [index, setIndex] = useState(0)
  const pages = Array.from({ length: Math.ceil(items.length / perPage) }, (_, i) => items.slice(i * perPage, (i + 1) * perPage))
  const step = (d: number) => setIndex(i => (i + d + pages.length) % pages.length)
  return (
    <div style={{ padding: `${spacing(3)}px ${spacing(3)}px ${spacing(2)}px`, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      {pages[index]?.map((item, i) => (
        <div key={i} style={i > 0 ? { borderTop: `1px solid ${colorPalette.neutral.lighten3}`, paddingTop: spacing(4), marginTop: spacing(2) } : undefined}>{item}</div>
      ))}
      {pages.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1), paddingLeft: 84 }}>
          <ButtonGhost size={buttonSizes.SMALL} shape={buttonShapes.SQUARE} leftIcon={iconType.ChevronLeftOutlined} onClick={() => step(-1)} ariaLabel={t.previous} />
          {pages.map((_, i) => (
            <span
              key={i}
              onClick={() => setIndex(i)}
              style={{
                width: 7, height: 7, borderRadius: '50%', cursor: 'pointer',
                backgroundColor: i === index ? colorPalette.blue.base : colorPalette.white,
                border: `1px solid ${i === index ? colorPalette.blue.base : colorPalette.neutral.lighten1}`,
              }}
            />
          ))}
          <ButtonGhost size={buttonSizes.SMALL} shape={buttonShapes.SQUARE} leftIcon={iconType.ChevronRightOutlined} onClick={() => step(1)} ariaLabel={t.next} />
        </div>
      )}
    </div>
  )
}

function LinkRow({ label, onClick }: { label: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ padding: `${spacing(2)}px ${spacing(3)}px`, borderTop: `1px solid ${colorPalette.neutral.lighten3}`, cursor: 'pointer', backgroundColor: hovered ? colorPalette.neutral.lighten5 : undefined }}
    >
      <Typography size="base-sm" color="neutral-darken5">{label}</Typography>
    </div>
  )
}

/** Stand-in for the original's pictures: a soft circle with an icon, initials or a symbol. */
function Medallion({ children, tone = 'blue', square = false }: { children: ReactNode; tone?: 'blue' | 'neutral' | 'dark'; square?: boolean }) {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: square ? 8 : '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: tone === 'blue' ? colorPalette.blue.lighten5 : tone === 'dark' ? NAVY_DARK : colorPalette.neutral.lighten4,
      border: `1px solid ${tone === 'blue' ? colorPalette.blue.lighten4 : tone === 'dark' ? NAVY_DARK : colorPalette.neutral.lighten2}`,
      color: tone === 'dark' ? colorPalette.white : colorPalette.blue.darken1, fontSize: 22, fontWeight: 700,
    }}>
      {children}
    </div>
  )
}

/** The picture for a teaser: a real image, an icon, initials or a symbol in a Medallion, or a play button for videos. */
function TeaserMedia({ media }: { media: OfficeMedia }) {
  if ('image' in media) {
    return (
      <img
        src={media.image}
        alt=""
        width={64}
        height={64}
        style={{ display: 'block', width: 64, height: 64, objectFit: media.plain ? 'contain' : 'cover', objectPosition: media.position, borderRadius: media.plain ? undefined : '50%' }}
      />
    )
  }
  if ('play' in media) return <Medallion tone="dark"><Icon type={iconType.PlayFilled} size={32} color="white" /></Medallion>
  if ('initials' in media) return <Medallion tone="neutral">{media.initials}</Medallion>
  if ('book' in media) {
    return (
      <Medallion tone="neutral">
        <div style={{
          width: 30, height: 42, borderRadius: 2, backgroundColor: media.color, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: colorPalette.white, fontSize: 9, fontWeight: 700, lineHeight: '10px', textAlign: 'center', overflow: 'hidden',
        }}>{media.book}</div>
      </Medallion>
    )
  }
  if ('symbol' in media) return <Medallion>{media.symbol}</Medallion>
  if ('badge' in media) return <Medallion tone="dark" square><span style={{ fontSize: 15, letterSpacing: 0.5 }}>{media.badge}</span></Medallion>
  const tone = media.tone ?? 'blue'
  return (
    <Medallion tone={tone}>
      <Icon type={media.icon as never} size={32} color={tone === 'neutral' ? 'neutral-darken3' : tone === 'dark' ? 'white' : 'blue-darken1'} />
    </Medallion>
  )
}

function teaserItems(teasers: OfficeTeaser[]) {
  return teasers.map((teaser, i) => (
    <Teaser key={`${i}-${teaser.title}`} media={<TeaserMedia media={teaser.media} />} kicker={teaser.kicker} title={teaser.title} text={teaser.text} meta={teaser.meta} cta={teaser.cta} />
  ))
}

/** A row in a block's link list: one line, cut off with "…" as on the product screens. */
function ListRow({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        margin: `0 ${spacing(1)}px`, padding: `${spacing(2)}px ${spacing(3)}px`, borderBottom: `1px solid ${colorPalette.neutral.lighten3}`, cursor: 'pointer',
        backgroundColor: hovered ? colorPalette.neutral.lighten5 : undefined,
        fontSize: 14, color: colorPalette.neutral.darken5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}
    >
      {label}
    </div>
  )
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/** One part of a block-built widget. */
function OfficeBlockView({ block, onOpenCopilot }: { block: OfficeBlock; onOpenCopilot: () => void }) {
  switch (block.kind) {
    case 'carousel':
      return block.teasers.length > 0 ? <Carousel items={teaserItems(block.teasers)} perPage={block.perPage} /> : null
    case 'links':
      return <div>{block.links.map(link => <ListRow key={link} label={link} />)}</div>
    case 'more':
      return <div style={{ padding: `${spacing(2)}px ${spacing(3)}px` }}><CtaLink label={block.label} /></div>
    case 'note':
      return <div style={{ padding: `${spacing(2)}px ${spacing(3)}px`, borderBottom: `1px solid ${colorPalette.neutral.lighten3}`, fontSize: 12, fontStyle: block.italic ? 'italic' : undefined, color: colorPalette.neutral.darken3 }}>{block.text}</div>
    case 'alphabet':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: `${spacing(4)}px ${spacing(3)}px ${spacing(1)}px` }}>
          {ALPHABET.map(letter => {
            const disabled = block.disabled?.includes(letter)
            return (
              <span key={letter} style={{
                width: 26, height: 26, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                border: `1px solid ${disabled ? colorPalette.neutral.lighten2 : colorPalette.neutral.darken3}`,
                color: disabled ? colorPalette.neutral.lighten1 : colorPalette.neutral.darken5, cursor: disabled ? 'default' : 'pointer',
              }}>{letter}</span>
            )
          })}
        </div>
      )
    case 'intro':
      return (
        <div style={{ display: 'flex', gap: spacing(3), alignItems: 'flex-start', padding: `${spacing(4)}px ${spacing(3)}px`, backgroundColor: HEADER_BG }}>
          <div style={{ flexShrink: 0 }}><TeaserMedia media={block.media} /></div>
          <span style={{ fontSize: 13, lineHeight: '18px', color: colorPalette.neutral.darken4 }}>{block.text}</span>
        </div>
      )
    case 'copilot':
      return (
        <div style={{ padding: spacing(4), backgroundColor: HEADER_BG }}>
          <div style={{ display: 'flex', gap: spacing(3), alignItems: 'center' }}>
            <div style={{ flexShrink: 0, width: 88, height: 88, borderRadius: '50%', backgroundColor: colorPalette.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {block.image ? <img src={block.image} alt="" width={64} height={64} style={{ display: 'block' }} /> : <CoPilotMark size={56} />}
            </div>
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
              <span style={{ fontSize: 13, lineHeight: '17px', color: colorPalette.neutral.darken4 }}>{block.text}</span>
              <CtaLink label={block.cta} onClick={onOpenCopilot} />
            </div>
          </div>
        </div>
      )
  }
}

function OfficeWidgetView({ widget, onOpenCopilot }: { widget: OfficeWidget; onOpenCopilot: () => void }) {
  if (widget.kind === 'copilot') {
    return (
      <Widget title={widget.title} highlighted>
        <div style={{ padding: spacing(4) }}>
          <Teaser
            media={<div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: colorPalette.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CoPilotMark size={44} /></div>}
            title={widget.teaserTitle}
            text={widget.text}
            cta={widget.cta}
            onCta={onOpenCopilot}
          />
        </div>
        {widget.links.length > 0 && (
          <div style={{ backgroundColor: colorPalette.white }}>
            {widget.links.map(link => <LinkRow key={link} label={link} />)}
          </div>
        )}
      </Widget>
    )
  }
  if (widget.kind === 'blocks') {
    return (
      <Widget title={widget.title} subtitle={widget.subtitle}>
        {widget.blocks.map((block, i) => <OfficeBlockView key={i} block={block} onOpenCopilot={onOpenCopilot} />)}
      </Widget>
    )
  }
  return (
    <Widget title={widget.title}>
      {widget.teasers.length > 0 && <Carousel items={teaserItems(widget.teasers)} />}
      {widget.links?.map(link => <LinkRow key={link} label={link} />)}
    </Widget>
  )
}

/**
 * The product screens' search across the top: a rounded field with "Stichwort suchen" and a search icon, optionally led
 * by a Suche | CoPilot toggle. CoPilot turns the bar into a question panel ("Frage an KI stellen" + "Frage stellen"),
 * screenshots/Screenshot 2026-11-18 at 08.52.15.png; asking opens CoPilot with the question as a new chat.
 */
function KeywordSearch({ modes, value, onChange, onAsk }: { modes: boolean; value: string; onChange: (v: string) => void; onAsk: (question: string) => void }) {
  const t = useText(TEXT)
  // "CoPilot" in the toggle opens the question panel over the page; "Suche" (or clicking away with nothing typed) closes it.
  const [copilotMode, setCopilotMode] = useState(false)
  const [question, setQuestion] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canAsk = question.trim().length > 0

  const openCopilot = () => {
    // Whatever was typed as a keyword carries over as the start of the question.
    setQuestion(q => q || value)
    setCopilotMode(true)
  }
  const closeCopilot = () => {
    if (question.trim() && !value) onChange(question.trim())
    setCopilotMode(false)
  }
  const ask = () => { if (canAsk) onAsk(question.trim()) }

  useEffect(() => {
    if (!copilotMode) return
    const el = textareaRef.current
    if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length) }
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && !question.trim()) setCopilotMode(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [copilotMode, question])

  const pill = (active: boolean): React.CSSProperties => ({
    padding: '2px 8px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    backgroundColor: active ? colorPalette.blue.lighten5 : undefined, color: active ? colorPalette.blue.base : colorPalette.neutral.darken5,
  })
  const toggle = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: 2, borderRadius: 14, backgroundColor: colorPalette.neutral.lighten5, flexShrink: 0 }}>
      <span style={pill(!copilotMode)} onClick={copilotMode ? closeCopilot : undefined}>{t.modeSearch}</span>
      <span style={pill(copilotMode)} onClick={copilotMode ? undefined : openCopilot}>CoPilot</span>
    </span>
  )
  return (
    // 80px high like the navigation's header, so the search centres on the same line as the product name (40px down).
    <div style={{ position: 'relative', zIndex: 2, height: 80, boxSizing: 'border-box', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: `0 ${spacing(6)}px`, backgroundColor: colorPalette.white }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 690 }}>
        <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: spacing(2), padding: `0 ${spacing(3)}px 0 ${spacing(2)}px`, border: `1px solid ${colorPalette.neutral.darken1}`, borderRadius: 20, visibility: copilotMode ? 'hidden' : undefined }}>
          {modes && toggle}
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={t.keywordSearch}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: 14, fontStyle: value ? undefined : 'italic', fontFamily: 'inherit', background: 'none' }}
          />
          <Icon type={iconType.SearchOutlined} size={20} color="neutral-darken5" />
        </div>
        {/* The CoPilot question panel: opens in place of the bar and over the page below, as on the product screens. */}
        {copilotMode && (
          <div
            ref={panelRef}
            style={{
              position: 'absolute', top: -6, left: -6, right: -6, padding: `${spacing(2)}px ${spacing(2)}px ${spacing(3)}px`, display: 'flex', flexDirection: 'column', gap: spacing(2),
              backgroundColor: colorPalette.white, border: `1px solid ${colorPalette.blue.base}`, borderRadius: 16, boxShadow: '0 4px 16px rgba(0, 19, 68, 0.12)',
            }}
          >
            <div>{toggle}</div>
            <textarea
              ref={textareaRef}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask() }
                if (e.key === 'Escape') closeCopilot()
              }}
              placeholder={t.askAi}
              rows={3}
              style={{ resize: 'none', border: 'none', outline: 'none', padding: `0 ${spacing(1)}px`, fontSize: 14, lineHeight: '20px', fontStyle: question ? undefined : 'italic', fontFamily: 'inherit', color: colorPalette.neutral.darken5, background: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ButtonPrimary rightIcon={iconType.ExternalLinkOutlined} disabled={!canAsk} onClick={ask}>{t.askQuestion}</ButtonPrimary>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** The header's product name: "Haufe" sits above it as the brand, so a leading "Haufe " is dropped. */
function productLine(name: string) {
  return name.replace(/^Haufe\s+/i, '')
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// `background`: the page's background (Workspaces 2.0 Version 2 uses white).
export default function PersonalOfficePage({ copilotPath, background = PAGE_BG }: { copilotPath: string; background?: string }) {
  const t = useText(TEXT)
  const { office, product } = useArea()
  const navigate = useNavigate()
  const [navOpen, setNavOpen] = useState(true)
  // The first item (the start page) is active until another is picked.
  const [activeNav, setActiveNav] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const openCopilot = () => navigate(copilotPath)
  const activeLabel = activeNav ?? office.navItems[0]?.label
  const hasDividers = office.navItems.some(item => item.dividerAfter)

  return (
    // The viewport's height, not 100%: the layout around it doesn't fix its height, so a start page taller than the window
    // (e.g. Law's) would stretch the whole page and push the navigation's collapse strip out of view. The start page scrolls instead.
    <div style={{ display: 'flex', height: '100vh', backgroundColor: background }}>
      {/* Product navigation */}
      <div style={{
        width: navOpen ? 300 : COLLAPSED_NAV_WIDTH, flexShrink: 0, display: 'flex', flexDirection: 'column', backgroundColor: colorPalette.white,
        borderRight: `1px solid ${colorPalette.neutral.lighten2}`, transition: 'width 0.15s',
      }}>
        {/* 80px high with the content centred, so the wordmark and product name centre on the app's H logo (40px down) —
            as CoPilot's title does. */}
        <div style={{ height: 80, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `0 ${spacing(4)}px` }}>
          {navOpen ? (
            <>
              {/* The Haufe wordmark (icons/haufe.svg), 67px wide as on the product screens. */}
              {/* The publisher sits on the wordmark's foot with a tight line height, so the row is only as tall as the
                  wordmark and the gap to the product name matches the areas without one. */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: spacing(2) }}>
                <img src="/user-testing-nov-26/haufe.svg" alt="Haufe" width={67} style={{ display: 'block', height: 'auto' }} />
                {product.publisher && <span style={{ fontSize: 10, lineHeight: '10px', color: NAVY, whiteSpace: 'nowrap' }}>{product.publisher}</span>}
              </div>
              <span style={{ marginTop: 4, fontSize: product.nameSize ?? 20, lineHeight: `${(product.nameSize ?? 20) + 4}px`, color: NAVY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={product.name}>{productLine(product.name)}</span>
            </>
          ) : (
            // Fits a 32px box at its own width:height ratio (the product icons are slightly taller than wide), centred.
            <img src={product.icon} alt={product.name} style={{ display: 'block', alignSelf: 'center', width: 'auto', height: 'auto', maxWidth: PRODUCT_ICON_BOX, maxHeight: PRODUCT_ICON_BOX, objectFit: 'contain' }} />
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: `${spacing(1)}px ${spacing(2)}px` }}>
          {office.navItems.map((item, i) => {
            const active = item.label === activeLabel
            return (
              <div key={item.label}>
                <div
                  title={navOpen ? undefined : item.label}
                  onClick={() => item.copilot ? openCopilot() : setActiveNav(item.label)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: navOpen ? undefined : 'center', gap: spacing(3), padding: `${spacing(2)}px ${spacing(2)}px`, borderRadius: 4, cursor: 'pointer',
                    backgroundColor: active ? colorPalette.blue.lighten5 : undefined,
                  }}
                >
                  {item.copilot
                    ? <span style={{ display: 'inline-flex', width: 16, justifyContent: 'center' }}><CoPilotMark size={16} /></span>
                    : <Icon type={item.icon as never} size={16} color={active ? 'blue-base' : 'neutral-darken4'} />}
                  {navOpen && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? colorPalette.blue.base : colorPalette.neutral.darken5, whiteSpace: 'nowrap' }}>{item.label}</span>}
                </div>
                {/* The original separates the start page and favourites from the content areas. */}
                {(hasDividers ? item.dividerAfter : i === 1) && <div style={{ height: 1, margin: `${spacing(1)}px 0`, backgroundColor: colorPalette.neutral.lighten3 }} />}
              </div>
            )
          })}
        </div>
        {/* The same collapse as CoPilot's chat panel and the app sidebar: a 48px strip with only a centred chevron. */}
        <CollapseStrip open={navOpen} onToggle={() => setNavOpen(v => !v)} collapseLabel={t.collapseNav} expandLabel={t.expandNav} />
      </div>

      {/* Start page */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', position: 'relative' }}>
        {office.search ? (
          <KeywordSearch modes={office.search.modes} value={search} onChange={setSearch} onAsk={question => navigate(copilotPath, { state: { initialQuestion: question } })} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: `${spacing(4)}px ${spacing(6)}px` }}>
            <div style={{ width: '100%', maxWidth: 480 }}>
              <SearchBar placeholder={t.search} value={search} onChange={setSearch} width={searchbarWidth.EXPANDED} />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: spacing(3), alignItems: 'start', padding: `0 ${spacing(3)}px ${spacing(16)}px` }}>
          {office.columns.map((column, c) => (
            <div key={c} style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
              {column.map((widget, w) => <OfficeWidgetView key={`${w}-${widget.title}`} widget={widget} onOpenCopilot={openCopilot} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
