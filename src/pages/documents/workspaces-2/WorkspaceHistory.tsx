/**
 * Workspace document history — the History panel from History Version 6 (/projects/history/version-6),
 * shared so Workspaces 2.0 Version 19 can add it to its workspace document views. History Version 6
 * keeps its own copy. In a workspace documents are removed (not deleted), so those events read "removed".
 */
import { useState } from 'react'
import {
  Chip,
  chipStyles,
  chipVariants,
  EmptyState,
  emptyStateSizes,
  emptyStateVariants,
  Icon,
  iconType,
  Pagination,
  Panel,
  panelPlacements,
  SearchBar,
  searchbarWidth,
  Tabs,
  Tooltip,
  tooltipPlacements,
  Typography,
} from '@goat-ui/goat-ui-core'
import {
  colorPalette,
  computeDocSourceMap,
  connectorIcon,
  connectorLabel,
  fontWeight,
  spacing,
  stripYear,
  type Connector,
  type DocSource,
  type MetadataDocument,
  type Space,
} from '../workspaces/shared'

function slugify(name: string): string {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ─── History ──────────────────────────────────────────────────────────────────

type HistoryFile = { name: string; status?: 'failed' | 'removed' }

type HistoryEventKind = 'upload' | 'delete' | 'sync' | 'connected' | 'disconnected'

export type HistoryEvent = {
  id: string
  kind: HistoryEventKind
  at: string
  actor: string
  /** Sync and connector events — the provider and the realistic connected-app name (e.g. its domain). */
  connector?: Connector
  files: HistoryFile[]
}

const HISTORY_PAGE_SIZE = 20
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


// Extra file names for seeded uploads, so the mock log isn't limited to what's in the table.
const MOCK_UPLOAD_NAMES = [
  'Anlage_GvE_Beteiligungen_2024.pdf',
  'Berechnung_Körperschaftsteuer_Vorauszahlungen_2025.pdf',
  'Gewerbesteuererklärung_2024.pdf',
  'Nachweis_Innergemeinschaftliche_Lieferungen_Q4_2024.xlsx',
  'Nachweis_Sozialversicherung_Juli_2025.pdf',
  'St-Erklärung_2024.pdf',
  'Steuerliche_Beratervereinbarung_2025.pdf',
  'Umsatzsteuer-Jahreserklärung_2024.pdf',
  'Umsatzsteuer-Voranmeldung_Jan_2025.xml',
  'USt-Prüfung_Protokoll_2023.pdf',
  'Lohnjournal_August_2025.xlsx',
  'Bilanz_2024_Entwurf.pdf',
  'Betriebsprüfungsbericht_2025.pdf',
  'Kassenbuch_Q2_2025.xlsx',
  'Reisekostenabrechnung_Juni_2025.pdf',
  'Mietvertrag_Büro_Hamburg.pdf',
]

// Topped up into the 50-file batch upload, for spaces with fewer distinct document names than that.
const BATCH_UPLOAD_EXTRA_NAMES = [
  'Arbeitsvertrag_Muster_2025.docx',
  'Gehaltsabrechnung_September_2025.pdf',
  'Urlaubsplanung_2026.xlsx',
  'Datenschutzerklärung_Mitarbeiter.pdf',
  'Onboarding_Checkliste.docx',
  'Zeiterfassung_Q3_2025.xlsx',
  'Betriebsvereinbarung_Homeoffice.pdf',
  'Fortbildungsnachweise_2025.pdf',
]

const TEAMMATES =['Petra Neumann', 'Jonas Weber', 'Lena Hoffmann']

function docFileName(d: MetadataDocument) {
  return `${stripYear(d.name)}.${d.fileFormat.toLowerCase()}`
}

function daysAgo(n: number, hour = 10, minute = 0) {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

/** "3 Sep, 2026" — the date format used in the History Figma. */
function formatHistoryDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}

/** Which heading an entry sits under: Today, This week, This month, then one heading per earlier month. */
function historyGroupLabel(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.floor((startOfToday.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days < 7) return 'This week'
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return 'This month'
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function liveEvent(kind: 'upload' | 'delete', docs: MetadataDocument[]): HistoryEvent {
  return {
    id: `${kind}-${Date.now()}`,
    kind,
    at: new Date().toISOString(),
    actor: 'You',
    files: docs.map(d => ({ name: docFileName(d) })),
  }
}

/** Small deterministic PRNG (mulberry32), seeded per space, so a space's mock log is stable across renders. */
function seededRandom(seedText: string) {
  let seed = [...seedText].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0
  return () => {
    seed = (seed + 0x6D2B79F5) >>> 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * A plausible few months of activity for a space, derived from what's actually in it,
 * covering every event type in the Figma's "Events" sheet:
 * - each connector was connected, then synced on and off since (some syncs with failures);
 * - the first connector was disconnected (removing its documents) and reconnected, with a re-sync;
 * - one app was connected by mistake, synced a few files, and was disconnected again — removing them;
 * - regular manual uploads — single files, batches, a few failures — and some deletes.
 * Deterministic, since it's recomputed until the space's log is first written to.
 */
export function seedHistory(space: Space, docs: MetadataDocument[]): HistoryEvent[] {
  const rand = seededRandom(space.id)
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)]
  const sourceMap = computeDocSourceMap(docs, space)
  const namesFrom = (src: DocSource) => docs.filter(d => (sourceMap.get(d._id) ?? 'local') === src).map(docFileName)
  const pool = [...namesFrom('local'), ...MOCK_UPLOAD_NAMES]
  const takeNames = (from: string[], n: number) => {
    const start = Math.floor(rand() * Math.max(1, from.length))
    return Array.from({ length: n }, (_, i) => from[(start + i) % from.length])
  }
  const withFailures = (names: string[], failed: number, status: HistoryFile['status'] = 'failed'): HistoryFile[] =>
    names.map((name, i) => (i < failed ? { name, status } : { name }))

  const events: HistoryEvent[] = []
  let n = 0
  const add = (e: Omit<HistoryEvent, 'id'>) => events.push({ ...e, id: `${space.id}-h${n++}` })

  const [first, ...rest] = space.connectors
  if (first) {
    const synced = namesFrom(first.type)
    add({ kind: 'connected', at: daysAgo(118, 9), actor: 'Petra Neumann', connector: first, files: [] })
    add({ kind: 'sync', at: daysAgo(118, 11), actor: 'Petra Neumann', connector: first, files: withFailures(synced, 0) })
    add({ kind: 'disconnected', at: daysAgo(26, 16), actor: 'Petra Neumann', connector: first, files: withFailures(synced, synced.length, 'removed') })
    add({ kind: 'connected', at: daysAgo(24, 9), actor: 'Petra Neumann', connector: first, files: [] })
    add({ kind: 'sync', at: daysAgo(24, 10), actor: 'Petra Neumann', connector: first, files: withFailures(synced, 2) })
  }
  rest.forEach((c, i) => {
    add({ kind: 'connected', at: daysAgo(96 - i * 11, 9), actor: pick(TEAMMATES), connector: c, files: [] })
    add({ kind: 'sync', at: daysAgo(96 - i * 11, 12), actor: pick(TEAMMATES), connector: c, files: withFailures(namesFrom(c.type), 0) })
  })
  // An app someone connected by mistake: its first sync pulled a handful of files in,
  // and disconnecting it an hour later removed them again — a disconnect always
  // removes every file that came from that connector. (Fixed names rather than
  // takeNames, so the rest of the seeded log stays as it was.)
  const unused = (['google-drive', 'onedrive', 'datev', 'sharepoint'] as const).find(t => !space.connectors.some(c => c.type === t))
  if (unused) {
    const slug = slugify(space.name)
    const strayLabel = { 'google-drive': `drive.google.com/${slug}`, onedrive: `onedrive.live.com/${slug}`, datev: 'DATEV Unternehmen online', sharepoint: `${slug}.sharepoint.com` }[unused]
    const stray: Connector = { id: `${space.id}-stray`, type: unused, label: strayLabel }
    const strayFiles = MOCK_UPLOAD_NAMES.slice(0, 7)
    add({ kind: 'connected', at: daysAgo(71, 14), actor: 'Jonas Weber', connector: stray, files: [] })
    add({ kind: 'sync', at: daysAgo(71, 14, 5), actor: 'Jonas Weber', connector: stray, files: withFailures(strayFiles, 0) })
    add({ kind: 'disconnected', at: daysAgo(71, 15), actor: 'Jonas Weber', connector: stray, files: withFailures(strayFiles, strayFiles.length, 'removed') })
  }

  // Routine incremental syncs: mostly small and clean, now and then a partial failure.
  if (space.connectors.length > 0) {
    for (let day = 1; day < 110; day += 3 + Math.floor(rand() * 5)) {
      const c = pick(space.connectors)
      const names = namesFrom(c.type)
      if (names.length === 0 || (c === first && day > 24 && day < 26)) continue
      const count = rand() < 0.35 ? 1 : 2 + Math.floor(rand() * Math.min(14, names.length))
      const failed = count > 3 && rand() < 0.3 ? 1 + Math.floor(rand() * Math.min(3, count - 1)) : 0
      add({ kind: 'sync', at: daysAgo(day, 6 + Math.floor(rand() * 12)), actor: rand() < 0.5 ? 'You' : pick(TEAMMATES), connector: c, files: withFailures(takeNames(names, Math.min(count, names.length)), failed) })
    }
  }

  // Manual uploads and deletes.
  for (let day = 0; day < 115; day += 2 + Math.floor(rand() * 6)) {
    const actor = rand() < 0.6 ? 'You' : pick(TEAMMATES)
    const roll = rand()
    if (roll < 0.45) {
      add({ kind: 'upload', at: daysAgo(day, 8 + Math.floor(rand() * 9)), actor, files: withFailures(takeNames(pool, 1), 0) })
    } else if (roll < 0.8) {
      const count = 3 + Math.floor(rand() * 12)
      add({ kind: 'upload', at: daysAgo(day, 8 + Math.floor(rand() * 9)), actor, files: withFailures(takeNames(pool, count), rand() < 0.4 ? 1 + Math.floor(rand() * 2) : 0) })
    } else {
      add({ kind: 'delete', at: daysAgo(day, 8 + Math.floor(rand() * 9)), actor, files: withFailures(takeNames(pool, rand() < 0.6 ? 1 : 2 + Math.floor(rand() * 4)), 0) })
    }
  }

  // One large batch upload this week, so the first page shows how a long file list reads in full.
  const allNames = [...new Set([...docs.map(docFileName), ...MOCK_UPLOAD_NAMES, ...BATCH_UPLOAD_EXTRA_NAMES])]
  add({ kind: 'upload', at: daysAgo(2, 15), actor: 'You', files: withFailures(takeNames(allNames, 50), 3) })

  return events.sort((a, b) => b.at.localeCompare(a.at))
}

function documentsLabel(count: number, verb: string) {
  return `${count} document${count !== 1 ? 's' : ''} ${verb}`
}

function historyTitle(e: HistoryEvent) {
  if (e.kind === 'upload') return documentsLabel(e.files.length, 'uploaded')
  if (e.kind === 'delete') return documentsLabel(e.files.length, 'removed')
  if (e.kind === 'sync') return documentsLabel(e.files.length, 'synced')
  const provider = connectorLabel(e.connector!.type)
  return e.kind === 'connected' ? `${provider} connected` : `${provider} disconnected`
}

/** Only problems get a chip — failed uploads/syncs, and files a disconnect took out of the space. */
function historyChip(e: HistoryEvent) {
  const failed = e.files.filter(f => f.status === 'failed').length
  if ((e.kind === 'upload' || e.kind === 'sync') && failed > 0) return <Chip label={`${failed} Unsuccessful`} chipStyle={chipStyles.SEMANTIC_DANGER} variant={chipVariants.SUBTLE} leftIcon={iconType.AlertFilled} uppercase />
  if (e.kind === 'disconnected' && e.files.length > 0) return <Chip label={`${e.files.length} Removed`} chipStyle={chipStyles.SEMANTIC_WARNING} variant={chipVariants.SUBTLE} leftIcon={iconType.AlertFilled} uppercase />
  return null
}

// goat has no plug icon, so connect / disconnect events use the Figma's connector marks (as in V1–V5).
const CONNECTOR_ICON = '/history/connector.svg'
const CONNECTOR_DISCONNECTED_ICON = '/history/connector-disconnected.svg'

function HistoryEventIcon({ kind }: { kind: HistoryEventKind }) {
  if (kind === 'connected' || kind === 'disconnected') {
    return <img src={kind === 'connected' ? CONNECTOR_ICON : CONNECTOR_DISCONNECTED_ICON} width={20} height={20} alt="" style={{ display: 'block', flexShrink: 0 }} />
  }
  const type =
    kind === 'upload' ? iconType.UploadOutlined :
    kind === 'delete' ? iconType.TrashOutlined :
    iconType.RefreshOutlined
  return <Icon type={type} size={20} color="neutral-darken2" />
}

// An expanded file list shows about this many rows, then scrolls within the entry.
const VISIBLE_FILE_ROWS = 10
const FILE_ROW_HEIGHT = 18 // base-sm line height
const FILE_ROW_GAP = 6
// Half of the next row peeks out at the bottom, so it's clear the list scrolls (macOS hides scrollbars until you scroll).
const FILE_LIST_MAX_HEIGHT = VISIBLE_FILE_ROWS * (FILE_ROW_HEIGHT + FILE_ROW_GAP) + FILE_ROW_HEIGHT / 2

/**
 * One history entry, laid out as in the "Events" sheet of the SharePoint Integration Figma
 * (node 7509:10221) — goat components and icons, plus the Figma's connector marks and the provider's logo:
 *
 *   [icon]  12 documents synced  [⚠ 2 UNSUCCESSFUL]
 *           👤 Petra Neumann  •  14 Aug, 2026
 *           ⊞ acmecorp.sharepoint.com/sites/tax      ← sync and connector events (provider logo)
 *           Q4 Filing — Tax Return.xlsx               ← when there's a single file, or…
 *           View more ⌄                               ← …when there are files to list
 *
 * No card or border: an 8px-padded block with an 8px radius. "View more" lists the affected documents below (failed / removed first,
 * with a filled alert icon, then A–Z) one per line, scrolling when long; "View less" hides them.
 */
function HistoryEventItem({ event, expanded, onToggle }: { event: HistoryEvent; expanded: boolean; onToggle: () => void }) {
  const isConnectorEvent = event.kind === 'connected' || event.kind === 'disconnected'
  const files = [...event.files].sort((a, b) =>
    Number(!a.status) - Number(!b.status) || a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }))
  const singleFile = !isConnectorEvent && files.length === 1 ? files[0] : null
  // A single file is already named above, unless it needs its alert icon shown in the list.
  const hasList = files.length > 1 || (files.length === 1 && !!files[0].status) || (isConnectorEvent && files.length > 0)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(3), padding: spacing(2), borderRadius: 8 }}>
      <HistoryEventIcon kind={event.kind} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: spacing(2) }}>
            <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{historyTitle(event)}</Typography>
            {historyChip(event)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
            <Icon type={iconType.UserOutlined} size={12} color="neutral-darken2" />
            <Typography size="base-sm" color="neutral-darken2">{event.actor}&nbsp;&nbsp;•&nbsp;&nbsp;{formatHistoryDate(event.at)}</Typography>
          </div>
          {event.connector && (
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
              {connectorIcon(event.connector.type, 12)}
              <Typography size="base-sm" color="neutral-darken2">{event.connector.label}</Typography>
            </div>
          )}
          {singleFile && <Typography size="base-sm" color="neutral-darken2">{singleFile.name}</Typography>}
          {hasList && (
            <button type="button" className="history-view-more" onClick={onToggle} aria-expanded={expanded}>
              <Typography size="base-sm" color="primary-base">{expanded ? 'View less' : 'View more'}</Typography>
              <Icon type={expanded ? iconType.ChevronUpOutlined : iconType.ChevronDownOutlined} size={12} color="primary-base" />
            </button>
          )}
        </div>

        {hasList && expanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: FILE_ROW_GAP, maxHeight: FILE_LIST_MAX_HEIGHT, overflowY: 'auto', overscrollBehavior: 'contain' }}>
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
                {f.status && (
                  <Tooltip title={f.status === 'failed' ? (event.kind === 'sync' ? 'Sync failed' : 'Upload failed') : 'Removed from this space'} placement={tooltipPlacements.TOP}>
                    <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                      <Icon type={iconType.AlertFilled} size={16} color={f.status === 'failed' ? 'danger-darken1' : 'warning-darken2'} />
                    </span>
                  </Tooltip>
                )}
                <Typography size="base-sm" color="neutral-darken2">{f.name}</Typography>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

type HistoryFilter = 'all' | 'upload' | 'sync' | 'delete' | 'connector'

const FILTER_OPTIONS: { label: string; value: HistoryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Uploads', value: 'upload' },
  { label: 'Syncs', value: 'sync' },
  { label: 'Removals', value: 'delete' },
  { label: 'Connectors', value: 'connector' },
]

function matchesFilter(e: HistoryEvent, filter: HistoryFilter) {
  if (filter === 'all') return true
  if (filter === 'connector') return e.kind === 'connected' || e.kind === 'disconnected'
  return e.kind === filter
}

/**
 * History panel built only from goat-ui components and icons:
 * - Tabs to narrow the log to one event type, SearchBar to find a file, person or app.
 * - Date groups of entries laid out as in the Figma "Events" sheet (see HistoryEventItem): type,
 *   app, user and date, a semantic Chip for problems, and "View more" for the affected documents.
 * - Pagination for the log (20 per page), EmptyState when filters match nothing.
 */
// `textOnlyNoResults` (Workspaces 2.0 Version 21): no illustration when nothing matches — just the text.
export function HistoryPanel({ visible, events, onClose, textOnlyNoResults = false }: { visible: boolean; events: HistoryEvent[]; onClose: () => void; textOnlyNoResults?: boolean }) {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<HistoryFilter>('all')
  const [query, setQuery] = useState('')
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  const q = query.trim().toLowerCase()
  const filtered = events.filter(e =>
    matchesFilter(e, filter) &&
    (!q || e.actor.toLowerCase().includes(q) || historyTitle(e).toLowerCase().includes(q) ||
      (e.connector?.label.toLowerCase().includes(q) ?? false) || e.files.some(f => f.name.toLowerCase().includes(q)))
  )
  const paged = filtered.slice((page - 1) * HISTORY_PAGE_SIZE, page * HISTORY_PAGE_SIZE)
  const groups: { label: string; events: HistoryEvent[] }[] = []
  paged.forEach(e => {
    const label = historyGroupLabel(e.at)
    const last = groups[groups.length - 1]
    if (last?.label === label) last.events.push(e); else groups.push({ label, events: [e] })
  })

  const toggle = (id: string) => setOpenIds(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  return (
    <Panel
      visible={visible}
      onClose={() => { setPage(1); onClose() }}
      placement={panelPlacements.RIGHT}
      width={556}
      title={
        <span style={{ fontSize: 20, lineHeight: '32px', fontWeight: 600, color: colorPalette.neutral.darken5 }}>History</span>
      }
    >
      <style>{HISTORY_PANEL_CSS}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4), paddingBottom: spacing(6) }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          <SearchBar placeholder="Search files, people, or connected apps" value={query} onChange={v => { setQuery(v); setPage(1) }} width={searchbarWidth.EXPANDED} />
          {/* Event types as tabs, with the search above. */}
          <Tabs options={FILTER_OPTIONS.map(o => ({ key: o.value, label: o.label, content: null }))} activeKey={filter} onChange={key => { setFilter(key as HistoryFilter); setPage(1) }} />
        </div>

        {filtered.length === 0 ? (
          textOnlyNoResults ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(1), padding: `${spacing(8)}px 0`, textAlign: 'center' }}>
              <Typography size="base" weight="semibold" color="neutral-darken5" align="center">No matching activity</Typography>
              <Typography size="base-sm" color="neutral-darken2" align="center">Try another tab, or change your search.</Typography>
            </div>
          ) : (
            <EmptyState variant={emptyStateVariants.EMPTY} size={emptyStateSizes.SMALL} description="No activity matches these filters." />
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
            {groups.map(group => (
              <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
                <Typography size="base-sm" color="neutral-darken2" weight={fontWeight.SEMIBOLD}>{group.label}</Typography>
                {group.events.map(e => (
                  <HistoryEventItem key={e.id} event={e} expanded={openIds.has(e.id)} onToggle={() => toggle(e.id)} />
                ))}
              </div>
            ))}
          </div>
        )}

        {filtered.length > HISTORY_PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination current={page} total={filtered.length} pageSize={HISTORY_PAGE_SIZE} onChange={setPage} />
          </div>
        )}
      </div>
    </Panel>
  )
}

// "View more" is a bare text button (a link in the Figma).
const HISTORY_PANEL_CSS = `
  .history-view-more {
    display: inline-flex; align-items: center; gap: 4px; align-self: flex-start;
    padding: 0; border: none; background: none; cursor: pointer;
  }
  .history-view-more:hover p { text-decoration: underline; }
  .history-view-more:focus-visible { outline: 2px solid ${colorPalette.blue.lighten3}; outline-offset: 2px; border-radius: 2px; }
`
