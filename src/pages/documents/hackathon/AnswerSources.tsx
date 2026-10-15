import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ButtonGhost, buttonShapes, Icon, iconType, Typography } from '@goat-ui/goat-ui-core'
import { colorPalette, spacing } from '../workspaces/shared'
import { MARKER, type AnswerSource, type SourceLang } from './sourceData'

/**
 * Hackathon Oct '26 — Versions 10/11: sources on CoPilot answers in workspace chats, after the
 * "Chatseite / Quellen" design.
 * - In the answer: a small numbered marker after the sentences each source backs — click it to open that source.
 * - Under the answer: two chips, "Haufe expert knowledge 3" and "Workspace files 2", that open the panel on that kind.
 * - The panel: "Sources from Haufe Personal Office Platin", the same two chips as filters, and the sources
 *   as an accordion — [n] title, then the cited passage and "Open full source" when expanded.
 */

const TEXT = {
  en: {
    haufe: 'Haufe expert knowledge', files: 'Workspace files',
    title: 'Sources from Haufe Personal Office Platin', subtitle: 'Legally sound and up to date',
    open: 'Open full source', close: 'Close sources', source: 'Source',
  },
  de: {
    haufe: 'Haufe Fachwissen', files: 'Dateien im Arbeitsbereich',
    title: 'Quellen aus Haufe Personal Office Platin', subtitle: 'Rechtssicher und aktuell',
    open: 'Vollständige Quelle öffnen', close: 'Quellen schließen', source: 'Quelle',
  },
}

export type SourceFilter = 'all' | 'haufe' | 'file'

/** The small square "H" for Haufe content, as in the design. */
function HaufeMark() {
  return (
    <span style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#001344', color: colorPalette.white, fontSize: 9, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>H</span>
  )
}

function KindIcon({ kind }: { kind: AnswerSource['kind'] }) {
  return kind === 'haufe' ? <HaufeMark /> : <Icon type={iconType.ArticleOutlined} size={12} color="neutral-darken3" />
}

// ─── In the answer ────────────────────────────────────────────────────────────

/** A citation in the text: the source's number, clickable. */
function Marker({ n, source, lang, onClick }: { n: number; source?: AnswerSource; lang: SourceLang; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={source ? `${TEXT[lang].source} ${n}: ${source.title}` : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 4px', margin: '0 1px 0 3px',
        borderRadius: 9, border: 'none', cursor: 'pointer', verticalAlign: 'text-top', fontFamily: 'inherit',
        fontSize: 11, fontWeight: 600, lineHeight: 1, color: colorPalette.blue.base, backgroundColor: colorPalette.blue.lighten5,
      }}
    >{n}</button>
  )
}

/** The answer text (same light markdown as elsewhere: **bold** and line breaks) with its citation markers. */
export function AnswerBody({ content, sources, lang, onMarker }: { content: string; sources: AnswerSource[]; lang: SourceLang; onMarker: (n: number) => void }) {
  const renderChunk = (text: string, key: string): ReactNode[] =>
    text.split(/(⟦\d+⟧)/).map((part, i) => {
      const m = MARKER.exec(part)
      if (m) { const n = Number(m[1]); return <Marker key={`${key}-${i}`} n={n} source={sources.find(s => s.n === n)} lang={lang} onClick={() => onMarker(n)} /> }
      return <span key={`${key}-${i}`}>{part}</span>
    })
  return (
    <>
      {content.split('\n').map((line, li) => (
        <div key={li} style={{ minHeight: line ? undefined : 8 }}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((chunk, ci) =>
            chunk.startsWith('**') && chunk.endsWith('**')
              ? <strong key={ci}>{renderChunk(chunk.slice(2, -2), `${li}-${ci}`)}</strong>
              : <span key={ci}>{renderChunk(chunk, `${li}-${ci}`)}</span>,
          )}
        </div>
      ))}
    </>
  )
}

/** The two chips under an answer — Haufe expert knowledge and workspace files, with counts. */
export function SourceChips({ sources, lang, onOpen }: { sources: AnswerSource[]; lang: SourceLang; onOpen: (filter: SourceFilter) => void }) {
  const t = TEXT[lang]
  const groups = [
    { kind: 'haufe' as const, label: t.haufe, count: sources.filter(s => s.kind === 'haufe').length },
    { kind: 'file' as const, label: t.files, count: sources.filter(s => s.kind === 'file').length },
  ].filter(g => g.count > 0)
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2) }}>
      {groups.map(g => <SourceChip key={g.kind} kind={g.kind} label={g.label} count={g.count} onClick={() => onOpen(g.kind)} />)}
    </div>
  )
}

function SourceChip({ kind, label, count, active, onClick }: { kind: AnswerSource['kind']; label: string; count: number; active?: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: spacing(2), padding: '4px 10px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
        border: `1px solid ${active ? colorPalette.blue.lighten3 : 'transparent'}`,
        backgroundColor: active || hovered ? colorPalette.blue.lighten5 : colorPalette.neutral.lighten4,
        fontSize: 12, fontWeight: 600, color: colorPalette.neutral.darken5,
      }}
    >
      <KindIcon kind={kind} />
      {label}
      <span style={{ fontWeight: 400, color: colorPalette.neutral.darken2 }}>{count}</span>
    </button>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

const PANEL_WIDTH = 360

/**
 * Slides the panel in from the right: its slot grows from nothing to the panel's width (so the chat
 * narrows smoothly) while the panel moves in. It stays mounted while the panel is open, so switching to
 * another source inside the open panel doesn't slide it in again.
 */
export function SourcesPanelSlot({ children }: { children: ReactNode }) {
  return (
    <div className="sources-slot" style={{ width: PANEL_WIDTH, flexShrink: 0, height: '100%', overflow: 'hidden' }}>
      <style>{`
        .sources-slot { animation: sources-grow .28s cubic-bezier(.2, .8, .2, 1); }
        .sources-slot > div { animation: sources-slide .28s cubic-bezier(.2, .8, .2, 1); }
        @keyframes sources-grow { from { width: 0 } to { width: ${PANEL_WIDTH}px } }
        @keyframes sources-slide { from { transform: translateX(40%); opacity: .4 } to { transform: none; opacity: 1 } }
        @media (prefers-reduced-motion: reduce) { .sources-slot, .sources-slot > div { animation: none } }
      `}</style>
      {children}
    </div>
  )
}

/** The sources of one answer, docked on the right: filters, then an accordion of [n] title → passage. */
export function SourcesPanel({ sources, lang, focus, filter, onFilter, onClose }: {
  sources: AnswerSource[]
  lang: SourceLang
  // The source to open (and scroll to) — e.g. the marker that was clicked.
  focus: number | null
  filter: SourceFilter
  onFilter: (filter: SourceFilter) => void
  onClose: () => void
}) {
  const t = TEXT[lang]
  const [open, setOpen] = useState<number | null>(focus ?? sources.find(s => filter === 'all' || s.kind === filter)?.n ?? null)
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({})
  useEffect(() => {
    if (focus != null) itemRefs.current[focus]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [focus])
  const visible = sources.filter(s => filter === 'all' || s.kind === filter)
  const counts = { haufe: sources.filter(s => s.kind === 'haufe').length, file: sources.filter(s => s.kind === 'file').length }

  return (
    <div style={{
      width: PANEL_WIDTH, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column',
      backgroundColor: colorPalette.white, borderLeft: `1px solid ${colorPalette.neutral.lighten1}`,
    }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start', gap: spacing(2), padding: `${spacing(5)}px ${spacing(5)}px ${spacing(4)}px`, borderBottom: `1px solid ${colorPalette.neutral.lighten2}` }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography size="base" weight="semibold" color="neutral-darken5">{t.title}</Typography>
          <Typography size="base-sm" color="neutral-darken2">{t.subtitle}</Typography>
        </div>
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={onClose} ariaLabel={t.close} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: spacing(5), display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2) }}>
          {counts.haufe > 0 && <SourceChip kind="haufe" label={t.haufe} count={counts.haufe} active={filter === 'haufe'} onClick={() => onFilter(filter === 'haufe' ? 'all' : 'haufe')} />}
          {counts.file > 0 && <SourceChip kind="file" label={t.files} count={counts.file} active={filter === 'file'} onClick={() => onFilter(filter === 'file' ? 'all' : 'file')} />}
        </div>

        {visible.map(source => {
          const expanded = open === source.n
          return (
            <div key={source.n} ref={el => { itemRefs.current[source.n] = el }} style={{ border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 8, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : source.n)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'flex-start', gap: spacing(2), padding: `${spacing(3)}px ${spacing(3)}px`, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  backgroundColor: expanded ? colorPalette.neutral.lighten4 : colorPalette.white,
                }}
              >
                <span style={{ paddingTop: 2 }}><KindIcon kind={source.kind} /></span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: colorPalette.neutral.darken5 }}>[{source.n}] {source.title}</span>
                <Icon type={expanded ? iconType.ChevronUpOutlined : iconType.ChevronDownOutlined} size={16} color="neutral-darken3" />
              </button>
              {expanded && (
                <div style={{ padding: `${spacing(3)}px ${spacing(4)}px ${spacing(4)}px`, display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
                  <Typography size="base-sm" color="neutral-darken5">{source.excerpt}</Typography>
                  {/* Prototype: nowhere to open the full source yet. */}
                  <span style={{ alignSelf: 'flex-start', fontSize: 13, fontWeight: 600, color: colorPalette.blue.base, cursor: 'pointer' }}>{t.open}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
