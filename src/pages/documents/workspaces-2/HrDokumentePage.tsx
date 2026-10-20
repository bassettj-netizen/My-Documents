import { useState, type ReactNode } from 'react'
import {
  Banner,
  bannerStyles,
  bannerVariants,
  ButtonSecondary,
  Icon,
  iconType,
  Typography,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, fontWeight } from '../workspaces/shared'

/**
 * Workspaces 2.0 — HR Dokumente: the Haufe HR Dokumente start page
 * (screenshots/Screenshot 2026-10-19 at 16.01.55.png), German copy as drawn.
 *
 * - Its own product navigation on the left (Startseite, Dokumente, Admin; Einstellungen and FAQ at the
 *   foot), styled like Haufe Office Line's (PersonalOfficePage): white, "HAUFE" over the product name,
 *   the same item colours, and "Navigation einklappen". It stays in view while the page scrolls.
 * - The original's "Feedback & Support" tab is left out.
 * - No top bar: the original's "HAUFE" header with the user's avatar is left out, so the page starts
 *   with the feedback banner.
 * - "Jetzt starten" (Dokumente, Vorlagen), "Mehr entdecken" (four tiles) and "Weitere Informationen"
 *   with a video. The video still is a stand-in, since there's no image asset for it.
 * - Buttons and links have no destinations yet.
 */

// As in PersonalOfficePage (Haufe Office Line).
const NAVY = '#001344'

const NAV_ITEMS: { label: string; icon: string; children?: boolean }[] = [
  { label: 'Startseite', icon: iconType.HouseOutlined },
  { label: 'Dokumente', icon: iconType.ArticleOutlined, children: true },
  { label: 'Admin', icon: iconType.LockOutlined, children: true },
]

const FOOT_ITEMS: { label: string; icon: string }[] = [
  { label: 'Einstellungen', icon: iconType.GearOutlined },
  { label: 'FAQ', icon: iconType.HelpCircleOutlined },
]

const DISCOVER: { title: string; text: string; link: string }[] = [
  { title: 'Produkt-Updates', text: 'Alle Neuerungen zu HR Dokumente finden Sie ab sofort gebündelt im HR Dokumente Portal. Schauen Sie regelmäßig vorbei, um nichts zu verpassen. So verpassen Sie keine neue Funktion.', link: 'Zu den Produkt-Updates' },
  { title: 'Importieren Sie Ihre Layout-Vorlage', text: 'Importieren Sie Ihre Layout-Vorlage im DOCX-Format. So werden Layoutelemente wie Logo, Fußzeile, Schriftart und Abstände automatisch übernommen. Erfahren Sie mehr über diese Funktion.', link: 'Zum Artikel' },
  { title: 'Haufe-Vorlage anpassen', text: 'Passen Sie Haufe-Vorlagen aus der Vorlagenbibliothek an, um daraus später Ihre HR-Dokumente zu erstellen. Speichern Sie die Haufe-Vorlage dafür als Kopie.', link: 'Haufe-Vorlagen entdecken' },
  { title: 'Video-Tutorials', text: 'Lernen Sie mit den Video-Tutorials die verschiedenen Funktionen von HR Dokumente kennen.', link: 'Video-Tutorials ansehen' },
]

// ─── Building blocks ──────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: ReactNode }) {
  return <Typography size="heading-sm" weight={fontWeight.SEMIBOLD} color="neutral-darken3">{children}</Typography>
}

/** A "Jetzt starten" card: a coloured tile, a title and line about it, and one action. */
function StartCard({ tile, title, text, action }: { tile: ReactNode; title: string; text: string; action: string }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', gap: spacing(4), padding: spacing(4),
      backgroundColor: colorPalette.white, border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 12,
    }}>
      {tile}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography size="base" weight={fontWeight.SEMIBOLD} color="neutral-darken5">{title}</Typography>
        <Typography size="base" color="neutral-darken3">{text}</Typography>
      </div>
      <ButtonSecondary>{action}</ButtonSecondary>
    </div>
  )
}

function Tile({ background, icon }: { background: string; icon: string }) {
  return (
    <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 10, background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon type={icon as never} size={32} color="white" />
    </div>
  )
}

function ExternalLink({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2), color: colorPalette.blue.darken1, fontSize: 14, cursor: 'pointer' }}>
      <Icon type={iconType.ExternalLinkOutlined} size={16} color="inherit" />
      {children}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// `background`: the page's background (Workspaces 2.0 Version 2 uses white).
export default function HrDokumentePage({ background = colorPalette.neutral.lighten5 }: { background?: string }) {
  const [navOpen, setNavOpen] = useState(true)
  const [activeNav, setActiveNav] = useState('Startseite')
  const [bannerOpen, setBannerOpen] = useState(true)

  const navRow = (item: { label: string; icon: string; children?: boolean }) => {
    const active = item.label === activeNav
    return (
      <div
        key={item.label}
        title={navOpen ? undefined : item.label}
        onClick={() => setActiveNav(item.label)}
        style={{
          display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(2)}px ${spacing(2)}px`, borderRadius: 4, cursor: 'pointer',
          backgroundColor: active ? colorPalette.blue.lighten5 : undefined,
        }}
      >
        <Icon type={item.icon as never} size={16} color={active ? 'blue-base' : 'neutral-darken4'} />
        {navOpen && <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 600 : 400, color: active ? colorPalette.blue.base : colorPalette.neutral.darken5, whiteSpace: 'nowrap' }}>{item.label}</span>}
        {navOpen && item.children && <Icon type={iconType.ChevronDownOutlined} size={16} color="neutral-darken4" />}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: '100%', backgroundColor: background }}>
      {/* Product navigation — sticky and as tall as the window, so it stays put while the page scrolls. */}
      <div style={{
        position: 'sticky', top: 0, height: '100vh', width: navOpen ? 220 : 56, flexShrink: 0, display: 'flex', flexDirection: 'column',
        backgroundColor: colorPalette.white, borderRight: `1px solid ${colorPalette.neutral.lighten2}`, transition: 'width 0.15s',
      }}>
        <div style={{ height: 64, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `0 ${spacing(4)}px` }}>
          {navOpen ? (
            <>
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.5, color: NAVY }}>HAUFE</span>
              <span style={{ fontSize: 15, color: NAVY, whiteSpace: 'nowrap' }}>HR Dokumente</span>
            </>
          ) : (
            <img src="/hackathon/hr-dokumente.svg" alt="HR Dokumente" width={24} height={24} />
          )}
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: `${spacing(1)}px ${spacing(2)}px` }}>
          {NAV_ITEMS.map(navRow)}
        </div>
        <div style={{ flexShrink: 0, padding: `${spacing(1)}px ${spacing(2)}px` }}>
          {FOOT_ITEMS.map(navRow)}
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
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {bannerOpen && (
          <Banner
            variant={bannerVariants.INFO}
            bannerStyle={bannerStyles.SUBTLE}
            icon={iconType.InfoCircleFilled}
            onClose={() => setBannerOpen(false)}
            header={<Typography size="base" weight={fontWeight.SEMIBOLD} color="neutral-darken5">Jetzt bewerten &amp; 20 € Wunschgutschein sichern!</Typography>}
            content={
              <Typography size="base" color="neutral-darken3">
                Ihre Erfahrung mit Haufe HR-Dokumente ist Gold wert. Teilen Sie ihr Feedback und erhalten Sie einen 20 € Wunschgutschein. Die Bewertung dauert nur 2 Minuten.{' '}
                <span style={{ color: colorPalette.blue.darken1, cursor: 'pointer' }}>Gutschein sichern</span>
              </Typography>
            }
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6), padding: `${spacing(6)}px ${spacing(6)}px ${spacing(10)}px` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <Typography size="heading-xl" weight={fontWeight.BOLD} color="neutral-darken5">Willkommen bei HR Dokumente!</Typography>
            <Typography size="base" color="neutral-darken3">HR-Dokumente schnell, einfach und automatisiert erstellen - mit dem intelligenten HR-Tool von Haufe.</Typography>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
            <SectionTitle>Jetzt starten</SectionTitle>
            <div style={{ display: 'flex', gap: spacing(3) }}>
              <StartCard
                tile={<Tile background={`linear-gradient(135deg, ${colorPalette.purple.lighten3}, ${colorPalette.purple.base})`} icon={iconType.ArticleFilled} />}
                title="Dokumente"
                text="Erstellen Sie Ihre HR-Dokumente unkompliziert, indem Sie Fragen beantworten und Eingabefelder ausfüllen. Laden Sie die Datei dann im bevorzugten Format herunter."
                action="Neues Dokument"
              />
              <StartCard
                tile={<Tile background={`linear-gradient(135deg, ${colorPalette.cyan.lighten3}, ${colorPalette.blue.lighten1})`} icon={iconType.LayersHorFilled} />}
                title="Vorlagen"
                text="Importieren oder erstellen Sie eine eigene Vorlage und verwenden Sie diese künftig bei der Dokumentenerstellung."
                action="Neue Vorlage"
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
            <SectionTitle>Mehr entdecken</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: spacing(4), padding: spacing(4), border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 12 }}>
              {DISCOVER.map(item => (
                <div key={item.title} style={{ display: 'flex', flexDirection: 'column', gap: spacing(2), padding: spacing(4), borderRadius: 8, backgroundColor: colorPalette.neutral.lighten5 }}>
                  <Typography size="base" weight={fontWeight.SEMIBOLD} color="neutral-darken5">{item.title}</Typography>
                  <div style={{ flex: 1 }}>
                    <Typography size="base" color="neutral-darken3">{item.text}</Typography>
                  </div>
                  <div style={{ paddingTop: spacing(4) }}><ExternalLink>{item.link}</ExternalLink></div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
            <SectionTitle>Weitere Informationen</SectionTitle>
            <Typography size="base" color="neutral-darken3">
              Sehen Sie sich unsere Videos an, um das Beste aus den HR Dokumente-Funktionen herauszuholen. Besuchen Sie das{' '}
              <span style={{ fontWeight: 700, color: colorPalette.blue.darken2, cursor: 'pointer' }}>HR Dokumente Portal</span>
              {' '}für weitere Informationen oder kontaktieren Sie uns für Unterstützung.
            </Typography>
            <div style={{ padding: spacing(4), border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 12 }}>
              {/* Stand-in for the video still. */}
              <div style={{ width: 208 * 2, maxWidth: '100%', aspectRatio: '16 / 9', borderRadius: 8, backgroundColor: colorPalette.neutral.lighten3, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon type={iconType.PlayFilled} size={32} color="neutral-darken4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
