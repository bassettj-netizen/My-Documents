import { useState, type ReactNode } from 'react'
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

/**
 * Hackathon Oct '26 — Personal Office: the Haufe Personal Office Platin start page
 * (screenshots/Haufe-haufe-personal-office-platin (1).avif), German copy as drawn.
 *
 * - Its own product navigation on the left (Startseite, Meine Favoriten, … Onlinetraining & Videos),
 *   collapsible with "Navigation einklappen".
 * - Search across the top, then three columns of widgets with tinted headers. Widgets with several
 *   entries page through them with ‹ dots ›.
 * - The CoPilot HR widget is highlighted; "Jetzt chatten!" opens the CoPilot page.
 * - Photos in the original are stand-ins here (icons and initials), since there are no image assets.
 */

const NAV_ITEMS: { label: string; icon: string }[] = [
  { label: 'Startseite', icon: iconType.HouseOutlined },
  { label: 'Meine Favoriten', icon: iconType.StarOutlined },
  { label: 'Themenseiten', icon: iconType.TreeDiagramOutlined },
  { label: 'Arbeitshilfen', icon: iconType.ClipboardOutlined },
  { label: 'Smarte Anwendungen', icon: iconType.SparksOutlined },
  { label: 'Lexikon', icon: iconType.OpenBookOutlined },
  { label: 'Fachbeiträge', icon: iconType.ArticleOutlined },
  { label: 'Kommentare', icon: iconType.CommentOutlined },
  { label: 'Rechtsquellen', icon: iconType.HashtagOutlined },
  { label: 'Gerichtsentscheidungen', icon: iconType.MuseumOutlined },
  { label: 'Newsletter', icon: iconType.EmailOutlined },
  { label: 'Personalmagazin', icon: iconType.NoteOutlined },
  { label: 'Marktgehaltsanalysen', icon: iconType.BarChartOutlined },
  { label: 'Onlinetraining & Videos', icon: iconType.VideoOutlined },
]

const PAGE_BG = colorPalette.neutral.lighten5
const HEADER_BG = '#E4E8F7'
const NAVY = '#001344'

// ─── Building blocks ──────────────────────────────────────────────────────────

function Widget({ title, highlighted = false, children }: { title: string; highlighted?: boolean; children: ReactNode }) {
  return (
    <div style={{ backgroundColor: colorPalette.white, borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0, 19, 68, 0.06)' }}>
      <div style={{ padding: `${spacing(2)}px ${spacing(3)}px`, backgroundColor: HEADER_BG }}>
        <Typography size="base-sm" weight={fontWeight.SEMIBOLD} color="neutral-darken5">{title}</Typography>
      </div>
      <div style={{ backgroundColor: highlighted ? colorPalette.blue.lighten5 : undefined }}>{children}</div>
    </div>
  )
}

/** A media + text entry: picture on the left, heading, a line or two, and a "Jetzt …" link. */
function Teaser({ media, title, text, meta, cta, onCta }: { media: ReactNode; title: string; text?: string; meta?: string; cta: string; onCta?: () => void }) {
  return (
    <div style={{ display: 'flex', gap: spacing(3), alignItems: 'center' }}>
      <div style={{ flexShrink: 0, width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{media}</div>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
function Carousel({ items }: { items: ReactNode[] }) {
  const [index, setIndex] = useState(0)
  const step = (d: number) => setIndex(i => (i + d + items.length) % items.length)
  return (
    <div style={{ padding: `${spacing(3)}px ${spacing(3)}px ${spacing(2)}px`, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      {items[index]}
      {items.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1), paddingLeft: 84 }}>
          <ButtonGhost size={buttonSizes.SMALL} shape={buttonShapes.SQUARE} leftIcon={iconType.ChevronLeftOutlined} onClick={() => step(-1)} ariaLabel="Zurück" />
          {items.map((_, i) => (
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
          <ButtonGhost size={buttonSizes.SMALL} shape={buttonShapes.SQUARE} leftIcon={iconType.ChevronRightOutlined} onClick={() => step(1)} ariaLabel="Weiter" />
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
function Medallion({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'neutral' }) {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: tone === 'blue' ? colorPalette.blue.lighten5 : colorPalette.neutral.lighten4,
      border: `1px solid ${tone === 'blue' ? colorPalette.blue.lighten4 : colorPalette.neutral.lighten2}`,
      color: colorPalette.blue.darken1, fontSize: 22, fontWeight: 700,
    }}>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PersonalOfficePage({ copilotPath }: { copilotPath: string }) {
  const navigate = useNavigate()
  const [navOpen, setNavOpen] = useState(true)
  const [activeNav, setActiveNav] = useState('Startseite')
  const [search, setSearch] = useState('')
  const openCopilot = () => navigate(copilotPath)

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: PAGE_BG }}>
      {/* Product navigation */}
      <div style={{
        width: navOpen ? 220 : 56, flexShrink: 0, display: 'flex', flexDirection: 'column', backgroundColor: colorPalette.white,
        borderRight: `1px solid ${colorPalette.neutral.lighten2}`, transition: 'width 0.15s',
      }}>
        <div style={{ height: 64, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `0 ${spacing(4)}px` }}>
          {navOpen ? (
            <>
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.5, color: NAVY }}>HAUFE</span>
              <span style={{ fontSize: 15, color: NAVY, whiteSpace: 'nowrap' }}>Personal Office Platin</span>
            </>
          ) : (
            <img src="/hackathon/personal-office.avif" alt="Personal Office" width={24} height={24} />
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: `${spacing(1)}px ${spacing(2)}px` }}>
          {NAV_ITEMS.map((item, i) => {
            const active = item.label === activeNav
            return (
              <div key={item.label}>
                <div
                  title={navOpen ? undefined : item.label}
                  onClick={() => setActiveNav(item.label)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(2)}px ${spacing(2)}px`, borderRadius: 4, cursor: 'pointer',
                    backgroundColor: active ? colorPalette.blue.lighten5 : undefined,
                  }}
                >
                  <Icon type={item.icon as never} size={16} color={active ? 'blue-base' : 'neutral-darken4'} />
                  {navOpen && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? colorPalette.blue.base : colorPalette.neutral.darken5, whiteSpace: 'nowrap' }}>{item.label}</span>}
                </div>
                {/* The original separates Startseite and Favoriten from the content areas. */}
                {i === 1 && <div style={{ height: 1, margin: `${spacing(1)}px 0`, backgroundColor: colorPalette.neutral.lighten3 }} />}
              </div>
            )
          })}
        </div>
        <div
          onClick={() => setNavOpen(v => !v)}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(3)}px ${spacing(4)}px`, borderTop: `1px solid ${colorPalette.neutral.lighten3}`, cursor: 'pointer' }}
        >
          <Icon type={navOpen ? iconType.ChevronLeftOutlined : iconType.ChevronRightOutlined} size={16} color="neutral-darken4" />
          {navOpen && <span style={{ fontSize: 13, color: colorPalette.neutral.darken5, whiteSpace: 'nowrap' }}>Navigation einklappen</span>}
        </div>
      </div>

      {/* Start page */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: `${spacing(4)}px ${spacing(6)}px` }}>
          <div style={{ width: '100%', maxWidth: 480 }}>
            <SearchBar placeholder="Suchen nach…" value={search} onChange={setSearch} width={searchbarWidth.EXPANDED} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: spacing(3), alignItems: 'start', padding: `0 ${spacing(3)}px ${spacing(16)}px` }}>
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
            <Widget title="Generatoren & Checks">
              <Carousel items={[
                <Teaser key="docplus" media={<Medallion><Icon type={iconType.NoteOutlined} size={32} color="blue-darken1" /></Medallion>} title="Dokumentengenerator DocPlus" text="Dokumente unkompliziert erstellen und eigene Vorlagen anlegen" cta="Jetzt ansehen" />,
                <Teaser key="brutto" media={<Medallion><Icon type={iconType.CalculatorOutlined} size={32} color="blue-darken1" /></Medallion>} title="Brutto-Netto-Rechner" text="Entgelt und Abzüge schnell berechnen" cta="Jetzt ansehen" />,
                <Teaser key="check" media={<Medallion><Icon type={iconType.ClipboardOutlined} size={32} color="blue-darken1" /></Medallion>} title="Arbeitsvertrag-Check" text="Verträge auf aktuelle Rechtsprechung prüfen" cta="Jetzt ansehen" />,
              ]} />
              <LinkRow label="Weitere Anwendungen und Rechner" />
              <LinkRow label="Alle Arbeitshilfen von A–Z" />
            </Widget>

            <Widget title="Haufe Onlinetraining">
              <Carousel items={[
                <Teaser key="urlaub" media={<Medallion tone="neutral">CT</Medallion>} title="Urlaubsrecht: Übertragung und Verfall des Anspruchs, Urlaubsentgelt und Urlaubsabgeltung" text="Dr. Carsten Teschner" meta="Donnerstag, 23.04.2026 | 10:00 Uhr" cta="Jetzt informieren und anmelden" />,
                <Teaser key="lohn" media={<Medallion tone="neutral">SB</Medallion>} title="Lohnsteuer aktuell: Änderungen zum Jahreswechsel" text="Sabine Brandt" meta="Dienstag, 05.05.2026 | 14:00 Uhr" cta="Jetzt informieren und anmelden" />,
                <Teaser key="bem" media={<Medallion tone="neutral">MK</Medallion>} title="Betriebliches Eingliederungsmanagement rechtssicher umsetzen" text="Markus Klein" meta="Mittwoch, 20.05.2026 | 10:00 Uhr" cta="Jetzt informieren und anmelden" />,
              ]} />
              <LinkRow label="Zur Mediathek" />
            </Widget>

            <Widget title="Tipps & Tricks: Schulungen zum Haufe Personal Office">
              <Carousel items={[
                <Teaser key="uptodate" media={<Icon type={iconType.PlayFilled} size={48} color="blue-lighten3" />} title="Up-to-date bleiben und gezielt weiterbilden" meta="Do, 23.4.2026, 13:00 – 13:30" cta="Jetzt ansehen" />,
                <Teaser key="suche" media={<Icon type={iconType.PlayFilled} size={48} color="blue-lighten3" />} title="Schneller finden mit der Suche" meta="Di, 28.4.2026, 13:00 – 13:30" cta="Jetzt ansehen" />,
              ]} />
              <LinkRow label="Übersicht über die zentralen Produktbestandteile" />
              <LinkRow label="Erklärvideos zu Ihrem Produkt" />
            </Widget>
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
            <Widget title="CoPilot HR" highlighted>
              <div style={{ padding: spacing(4) }}>
                <Teaser
                  media={<div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: colorPalette.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CoPilotMark size={44} /></div>}
                  title="Stellen Sie dem KI-Chatbot Ihre HR-Frage."
                  text="Seine Antworten basieren auf dem umfangreichen Fachwissen des Haufe Personal Office."
                  cta="Jetzt chatten!"
                  onCta={openCopilot}
                />
              </div>
              <div style={{ backgroundColor: colorPalette.white }}>
                <LinkRow label="Tipps zum Einstieg & FAQ" />
                <LinkRow label="Schulung zum CoPilot HR (Video)" />
              </div>
            </Widget>

            <Widget title="Nichts verpassen">
              <Carousel items={[
                <Teaser key="radar" media={<Medallion>§</Medallion>} title="Gesetzesradar" text="Aktueller Stand nationaler und europäischer Gesetzesvorhaben" cta="Jetzt ansehen" />,
                <Teaser key="fristen" media={<Medallion><Icon type={iconType.BellOutlined} size={32} color="blue-darken1" /></Medallion>} title="Fristenkalender" text="Alle wichtigen Termine für HR und Lohn" cta="Jetzt ansehen" />,
                <Teaser key="werte" media={<Medallion><Icon type={iconType.BarChartOutlined} size={32} color="blue-darken1" /></Medallion>} title="Sozialversicherungswerte 2026" text="Beitragssätze und Rechengrößen auf einen Blick" cta="Jetzt ansehen" />,
                <Teaser key="checkl" media={<Medallion><Icon type={iconType.ClipboardOutlined} size={32} color="blue-darken1" /></Medallion>} title="Checkliste Jahreswechsel" text="Was HR jetzt erledigen sollte" cta="Jetzt ansehen" />,
              ]} />
            </Widget>
          </div>

          {/* Column 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
            <Widget title="Fokusthema: Entgelttransparenz – Exklusive Seminarreihe">
              <Carousel items={[
                <Teaser key="einblick" media={<Medallion tone="neutral"><Icon type={iconType.VideoOutlined} size={32} color="neutral-darken3" /></Medallion>} title="Einblick in die Seminarreihe" text="Video unserer Expert:innen" cta="Jetzt ansehen" />,
                <Teaser key="termine" media={<Medallion tone="neutral"><Icon type={iconType.CalculatorOutlined} size={32} color="neutral-darken3" /></Medallion>} title="Termine und Anmeldung" text="Fünf Module zur EU-Entgelttransparenzrichtlinie" cta="Jetzt ansehen" />,
              ]} />
            </Widget>

            <Widget title="Aktuelle Themen">
              <Carousel items={[
                <Teaser key="mobile" media={<Medallion tone="neutral"><Icon type={iconType.MobileOutlined} size={32} color="neutral-darken3" /></Medallion>} title="Mobile Version des CoPilot HR" text="Bis zum 30.4. am Gewinnspiel teilnehmen!" cta="Jetzt ansehen" />,
                <Teaser key="mindest" media={<Medallion tone="neutral"><Icon type={iconType.ArticleOutlined} size={32} color="neutral-darken3" /></Medallion>} title="Mindestlohn 2026" text="Was sich für Arbeitgeber ändert" cta="Jetzt ansehen" />,
              ]} />
              <LinkRow label="Neue und geänderte Dokumente Ihres Produkts" />
              <LinkRow label="Alle „Auf den Punkt“-Videos" />
            </Widget>

            <Widget title="Tagesaktuelle News">
              <Carousel items={[
                <Teaser key="ksk" media={<Medallion tone="neutral"><Icon type={iconType.MuseumOutlined} size={32} color="neutral-darken3" /></Medallion>} title="Urteil zur Künstlersozialabgabe" text="Digitaler Musikvertrieb unterliegt der Künstlersozialkasse" meta="21.04.2026" cta="Jetzt ansehen" />,
                <Teaser key="az" media={<Medallion tone="neutral"><Icon type={iconType.MuseumOutlined} size={32} color="neutral-darken3" /></Medallion>} title="BAG zur Arbeitszeiterfassung" text="Neue Anforderungen an die Dokumentation" meta="20.04.2026" cta="Jetzt ansehen" />,
              ]} />
              <LinkRow label="Alle News" />
            </Widget>
          </div>
        </div>

        <div style={{ position: 'sticky', bottom: spacing(4), display: 'flex', justifyContent: 'flex-end', paddingRight: spacing(4), pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <ButtonPrimary size={buttonSizes.SMALL}>Kontakt</ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  )
}
