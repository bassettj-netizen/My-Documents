import { useMemo, useState } from 'react'
import {
  Checkbox,
  Icon,
  iconType,
  Select,
  Typography,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, fontWeight } from '../workspaces/shared'

/**
 * Workspaces 2.0 — Haufe Zeugnis Manager: the Zeugnis Manager Premium overview
 * (screenshots/d96d1f79-4ae1-4dcb-a13d-23dc4a747ad5.avif), German copy as drawn.
 *
 * - Left: the product navigation styled like Haufe Office Line's and HR Dokumente's — "HAUFE" over
 *   "Zeugnis Manager Premium", "Zeugnis erstellen", then the overview's filters by status and type with
 *   counts ("Offen" selected), and "Navigation einklappen". It stays in view while the page scrolls.
 * - The search sits in a bar above the table. The original's dark utility bar (messages, help, settings,
 *   the user), its "Support & Feedback" tab and the legal footer are left out, as on HR Dokumente.
 * - Main: Bearbeiter and Unternehmensprofil filters, Sortieren, and the references table — recipient,
 *   quick info (type, and a flag for English references), date issued, company profile, HR owner,
 *   last edited, status and the row actions. Rows can be ticked; clicking a row highlights it.
 * - The first row is the Acme Corp interim reference the Acme workspace links to.
 * - Buttons and actions have no destinations yet.
 */

const ORANGE = '#E8541E'
// The product navigation's title colour, as in PersonalOfficePage (Haufe Office Line).
const NAV_NAVY = '#001344'
const NAVY = '#0B3B73'
const HIGHLIGHT_ROW = '#B9D3EA'
const LINK = '#1F5FA8'

type ReferenceType = 'A' | 'Z' | 'E'
type Reference = {
  id: string
  name: string
  type: ReferenceType
  english?: boolean
  issued: string
  company: string
  owner: string
  edited: string
  status: string
  // A filled comment icon: someone left a comment on this reference.
  commented?: boolean
}

const STATUS_OPEN = 'Zeugnis angelegt'
const STATUS_RATED = 'Bewertung abgeschlossen'

const REFERENCES: Reference[] = [
  { id: 'r0', name: 'Wagner, Sophie', type: 'Z', issued: '10.10.2026', company: 'Acme Corp GmbH', owner: 'Alex Mustermensch', edited: '10.10.2026', status: STATUS_OPEN },
  { id: 'r1', name: 'Owner, Michael', type: 'E', issued: '31.10.2020', company: 'Haufe-Lexware GmbH', owner: 'Michael Baur', edited: '22.01.2020', status: 'Zeugnis aus Archiv wieder geöffnet' },
  { id: 'r2', name: 'Aisenpreis, Laurenz', type: 'A', issued: '15.09.2020', company: 'Haufe-Lexware GmbH', owner: 'Laurenz Aisenpreis', edited: '22.01.2020', status: 'Zur Bewertung bei laurenz.aisenpreis@haufe.com' },
  { id: 'r3', name: 'Mett, Carolin', type: 'Z', issued: '14.07.2020', company: 'Haufe-Lexware GmbH', owner: 'Laurenz Aisenpreis', edited: '11.02.2020', status: 'Zur Bewertung bei laurenz.aisenpreis@haufe.com' },
  { id: 'r4', name: 'Beinhardt, Werner', type: 'A', issued: '02.07.2020', company: 'Haufe-Lexware GmbH', owner: 'Magnus Jalner', edited: '22.01.2020', status: STATUS_OPEN },
  { id: 'r5', name: 'Apfel, Christine', type: 'Z', issued: '01.07.2020', company: 'Haufe-Lexware GmbH - Bonn', owner: 'Michael Baur', edited: '22.01.2020', status: STATUS_OPEN },
  { id: 'r6', name: 'Altmann, Jennifer', type: 'A', issued: '01.07.2020', company: 'Haufe-Lexware GmbH', owner: 'Laurenz Aisenpreis', edited: '22.01.2020', status: STATUS_OPEN },
  { id: 'r7', name: 'Uhle, Frank', type: 'A', issued: '30.06.2020', company: 'Haufe-Lexware GmbH', owner: 'Magnus Jalner', edited: '13.02.2020', status: STATUS_OPEN },
  { id: 'r8', name: 'Aisenpreis, Laurenz', type: 'A', issued: '09.06.2020', company: 'Haufe-Lexware GmbH', owner: 'Laurenz Aisenpreis', edited: '22.01.2020', status: 'Zur Bewertung bei laurenz.aisenpreis@haufe.com' },
  { id: 'r9', name: 'Blume, Lars', type: 'A', issued: '14.04.2020', company: 'Haufe-Lexware GmbH', owner: 'Laurenz Aisenpreis', edited: '22.01.2020', status: STATUS_OPEN },
  { id: 'r10', name: 'Doll, Nicole', type: 'A', issued: '12.04.2020', company: 'Haufe-Lexware GmbH', owner: 'Michael Baur', edited: '22.01.2020', status: STATUS_OPEN },
  { id: 'r11', name: 'Altmann, Jennifer', type: 'A', issued: '05.04.2020', company: 'Haufe-Lexware GmbH', owner: 'Laurenz Aisenpreis', edited: '22.01.2020', status: STATUS_OPEN },
  { id: 'r12', name: 'Müller, Thomas', type: 'A', issued: '05.04.2020', company: 'Haufe-Lexware GmbH', owner: 'Michael Baur', edited: '22.01.2020', status: STATUS_OPEN },
  { id: 'r13', name: 'Update, Hans', type: 'A', issued: '26.03.2020', company: 'Haufe-Lexware GmbH', owner: 'Michael Baur', edited: '22.01.2020', status: STATUS_OPEN },
  { id: 'r14', name: 'Vogtsberger, Jasmin', type: 'A', issued: '12.03.2020', company: 'Haufe-Lexware GmbH', owner: 'Madeleine Lehmann', edited: '17.01.2020', status: STATUS_OPEN },
  { id: 'r15', name: 'Mülhaupt, Bernd', type: 'A', english: true, issued: '11.03.2020', company: 'Haufe-Lexware GmbH', owner: 'Laurenz Aisenpreis', edited: '22.01.2020', status: STATUS_OPEN },
  { id: 'r16', name: 'Deployment, Dieter', type: 'Z', issued: '02.03.2020', company: 'Haufe-Lexware GmbH', owner: 'Michael Baur', edited: '22.01.2020', status: STATUS_RATED },
  { id: 'r17', name: 'Mustermann, Max', type: 'Z', issued: '01.03.2020', company: 'Haufe-Lexware GmbH', owner: 'Magnus Jalner', edited: '22.01.2020', status: STATUS_OPEN, commented: true },
  { id: 'r18', name: 'Cert, Flying', type: 'Z', english: true, issued: '29.02.2020', company: 'Future Tool AG - Berlin', owner: 'Michael Baur', edited: '03.02.2020', status: STATUS_OPEN },
  { id: 'r19', name: 'Schulung, Antrag', type: 'Z', issued: '29.02.2020', company: '', owner: 'Michael Baur', edited: '10.02.2020', status: STATUS_OPEN },
  { id: 'r20', name: 'Sicherheit, Schulung', type: 'A', issued: '27.02.2020', company: 'Future Tool AG - Berlin', owner: 'Michael Baur', edited: '22.01.2020', status: STATUS_RATED, commented: true },
  { id: 'r21', name: 'Meier, Ulrica', type: 'A', issued: '27.02.2020', company: 'Haufe-Lexware GmbH', owner: 'Laurenz Aisenpreis', edited: '22.01.2020', status: STATUS_OPEN },
  { id: 'r22', name: 'Altmann, Jennifer', type: 'A', issued: '22.02.2020', company: 'Haufe-Lexware GmbH - FFM', owner: 'Magnus Jalner', edited: '22.01.2020', status: STATUS_RATED },
  { id: 'r23', name: 'Aisenpreis, Laurenz', type: 'Z', issued: '19.02.2020', company: 'Haufe-Lexware GmbH', owner: 'Laurenz Aisenpreis', edited: '22.01.2020', status: STATUS_RATED },
  { id: 'r24', name: 'Hergert, Gabriele', type: 'A', issued: '18.02.2020', company: 'Haufe-Lexware GmbH', owner: 'Anja Kienzler', edited: '22.01.2020', status: STATUS_OPEN },
  { id: 'r25', name: 'Altmann, Jennifer', type: 'A', issued: '18.02.2020', company: 'Future Tool AG - Berlin', owner: 'Laurenz Aisenpreis', edited: '22.01.2020', status: STATUS_RATED },
]

const FILTER_GROUPS: { title?: string; items: string[] }[] = [
  { items: ['Zeugnisanträge (1)'] },
  { title: 'Zeugnisübersicht', items: ['Offen (82)', 'Archiviert (18)', 'Alle (100)'] },
  { title: 'Bei HR', items: ['Neu angelegt (69)', 'Bewertet (8)', 'Freigegeben (1)', 'Bedingt freigegeben (1)', 'Nicht freigegeben (0)'] },
  { title: 'Beim Vorgesetzten', items: ['Zur Bewertung (3)', 'Zur Freigabe (0)', 'Termin überschritten (0)'] },
  { title: 'Zeugnisart', items: ['Abschlusszeugnisse (63)', 'Zwischenzeugnisse (17)', 'Einfache Zeugnisse (2)'] },
]

// Fixed widths, as in the original; Status takes what's left and wraps.
const COLUMNS: { key: string; label: string; width?: number | string }[] = [
  { key: 'name', label: 'Zeugnisempfänger', width: '13%' },
  { key: 'quick', label: 'Quickinfo', width: 64 },
  { key: 'issued', label: 'Ausstellungsdatum', width: 130 },
  { key: 'company', label: 'Unternehmensprofil', width: '14%' },
  { key: 'owner', label: 'Aktueller HR Bearbeiter', width: '13%' },
  { key: 'edited', label: 'Zuletzt bearbeitet', width: 88 },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', width: 140 },
]

const ACTIONS: { icon: string; label: string }[] = [
  { icon: iconType.EditOutlined, label: 'Bearbeiten' },
  { icon: iconType.TrashOutlined, label: 'Löschen' },
  { icon: iconType.SignatureOutlined, label: 'Freigeben' },
  { icon: iconType.CommentOutlined, label: 'Kommentare' },
  { icon: iconType.InfoCircleOutlined, label: 'Info' },
]

const ALL = 'Alle'

/** One of a row's actions: a small icon button, as compact as the original's (no destination yet). */
function RowAction({ label, icon }: { label: string; icon: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={label}
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, cursor: 'pointer', backgroundColor: hovered ? colorPalette.neutral.lighten4 : undefined }}
    >
      <Icon type={icon as never} size={16} color="blue-darken1" />
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// `background`: the page's background (Workspaces 2.0 Version 2 uses white).
export default function ZeugnisManagerPage({ background = colorPalette.white }: { background?: string }) {
  const [navOpen, setNavOpen] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Offen (82)')
  const [owner, setOwner] = useState(ALL)
  const [company, setCompany] = useState(ALL)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [highlighted, setHighlighted] = useState<string | null>(null)

  const ownerOptions = useMemo(() => [ALL, ...new Set(REFERENCES.map(r => r.owner))].map(v => ({ label: v, value: v })), [])
  const companyOptions = useMemo(() => [ALL, ...new Set(REFERENCES.map(r => r.company).filter(Boolean))].map(v => ({ label: v, value: v })), [])
  const rows = REFERENCES.filter(r => (owner === ALL || r.owner === owner) && (company === ALL || r.company === company))
  const allSelected = rows.length > 0 && rows.every(r => selected.has(r.id))

  const toggle = (id: string, on: boolean) => setSelected(prev => {
    const next = new Set(prev)
    if (on) next.add(id); else next.delete(id)
    return next
  })

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: '100%', backgroundColor: background }}>
      {/* Product navigation, as on Haufe Office Line and HR Dokumente — sticky and as tall as the window. */}
      <div style={{
        position: 'sticky', top: 0, height: '100vh', width: navOpen ? 220 : 56, flexShrink: 0, display: 'flex', flexDirection: 'column',
        backgroundColor: colorPalette.white, borderRight: `1px solid ${colorPalette.neutral.lighten2}`, transition: 'width 0.15s',
      }}>
        <div style={{ height: 64, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `0 ${spacing(4)}px` }}>
          {navOpen ? (
            <>
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.5, color: NAV_NAVY }}>HAUFE</span>
              <span style={{ fontSize: 15, color: NAV_NAVY, whiteSpace: 'nowrap' }}>Zeugnis Manager Premium</span>
            </>
          ) : (
            <img src="/hackathon/zeugnis-manager.svg" alt="Haufe Zeugnis Manager" width={24} height={24} />
          )}
        </div>
        <div style={{ flexShrink: 0, padding: `${spacing(1)}px ${spacing(2)}px ${spacing(2)}px` }}>
          <button
            type="button"
            title={navOpen ? undefined : 'Zeugnis erstellen'}
            style={{
              width: '100%', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing(2), border: 'none', borderRadius: 4,
              backgroundColor: ORANGE, color: colorPalette.white, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Icon type={iconType.PlusCircleFilled} size={16} color="white" />
            {navOpen && 'Zeugnis erstellen'}
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: `0 ${spacing(2)}px ${spacing(2)}px` }}>
          {navOpen && FILTER_GROUPS.map((group, gi) => (
            <div key={gi}>
              {/* As on Haufe Office Line, a thin line separates the groups. */}
              {gi > 0 && <div style={{ height: 1, margin: `${spacing(1)}px 0`, backgroundColor: colorPalette.neutral.lighten3 }} />}
              {group.title && (
                <div style={{ padding: `${spacing(2)}px ${spacing(2)}px ${spacing(1)}px` }}>
                  <Typography size="base-sm" weight={fontWeight.SEMIBOLD} color="neutral-darken2">{group.title}</Typography>
                </div>
              )}
              {group.items.map(item => {
                const active = item === activeFilter
                return (
                  <div
                    key={item}
                    onClick={() => setActiveFilter(item)}
                    style={{ padding: `${spacing(2)}px ${spacing(2)}px`, borderRadius: 4, cursor: 'pointer', backgroundColor: active ? colorPalette.blue.lighten5 : undefined }}
                  >
                    <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? colorPalette.blue.base : colorPalette.neutral.darken5, whiteSpace: 'nowrap' }}>{item}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div
          onClick={() => setNavOpen(v => !v)}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(3)}px ${spacing(4)}px`, borderTop: `1px solid ${colorPalette.neutral.lighten3}`, cursor: 'pointer' }}
        >
          <Icon type={navOpen ? iconType.ChevronLeftOutlined : iconType.ChevronRightOutlined} size={16} color="neutral-darken4" />
          {navOpen && <span style={{ fontSize: 13, color: colorPalette.neutral.darken5, whiteSpace: 'nowrap' }}>Navigation einklappen</span>}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Search, on the right as in the original. */}
        <div style={{ height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: `0 ${spacing(4)}px`, borderBottom: `1px solid ${colorPalette.neutral.lighten2}` }}>
          <div style={{ width: 300, height: 32, display: 'flex', alignItems: 'center', border: `1px solid ${colorPalette.neutral.lighten1}`, borderRadius: 2, overflow: 'hidden' }}>
            <input placeholder="Suchbegriff eingeben" style={{ flex: 1, minWidth: 0, height: '100%', border: 'none', outline: 'none', padding: `0 ${spacing(2)}px`, fontFamily: 'inherit', fontSize: 13 }} />
            <div style={{ width: 32, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: NAVY, cursor: 'pointer' }}>
              <Icon type={iconType.SearchOutlined} size={16} color="white" />
            </div>
          </div>
        </div>

        {/* Filters and the references */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(3), padding: spacing(4) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
            <Typography size="base-sm" color="neutral-darken4">Bearbeiter:</Typography>
            <div style={{ width: 220 }}><Select value={owner} options={ownerOptions} onChange={v => setOwner(v as string)} /></div>
            <Typography size="base-sm" color="neutral-darken4">Unternehmensprofil:</Typography>
            <div style={{ width: 220 }}><Select value={company} options={companyOptions} onChange={v => setCompany(v as string)} /></div>
            <span onClick={() => { setOwner(ALL); setCompany(ALL) }} style={{ fontSize: 13, color: LINK, cursor: 'pointer' }}>Filter zurücksetzen</span>
            <div style={{ flex: 1 }} />
            <button type="button" style={{ height: 32, display: 'flex', alignItems: 'center', gap: spacing(2), padding: `0 ${spacing(3)}px`, border: 'none', borderRadius: 2, backgroundColor: NAVY, color: colorPalette.white, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Sortieren
              <Icon type={iconType.ChevronDownOutlined} size={12} color="white" />
            </button>
          </div>

          {/* Very narrow windows scroll the table sideways rather than squeeze it. */}
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: 12 }}>
            <colgroup>
              <col style={{ width: 32 }} />
              {COLUMNS.map(c => <col key={c.key} style={{ width: c.width }} />)}
            </colgroup>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colorPalette.neutral.lighten1}` }}>
                <th style={{ padding: `${spacing(2)}px ${spacing(1)}px`, textAlign: 'left' }}>
                  <Checkbox checked={allSelected} onChange={e => setSelected(e.target.checked ? new Set(rows.map(r => r.id)) : new Set())} />
                </th>
                {COLUMNS.map(c => (
                  <th
                    key={c.key}
                    style={{
                      padding: `${spacing(2)}px 6px`, textAlign: 'left', fontWeight: 400, color: colorPalette.neutral.darken4,
                      // The table is sorted by date issued, newest first.
                      backgroundColor: c.key === 'issued' ? colorPalette.neutral.lighten3 : undefined,
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {c.label}
                      {c.key === 'issued' && <Icon type={iconType.ChevronDownOutlined} size={12} color="neutral-darken4" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const isHighlighted = highlighted === r.id
                // One line per cell, cut with "…" (the full text is in the tooltip); Status wraps instead.
                const cell: React.CSSProperties = { padding: `${spacing(2)}px 6px`, color: colorPalette.neutral.darken4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
                return (
                  <tr
                    key={r.id}
                    onClick={() => setHighlighted(r.id)}
                    style={{ height: 44, borderBottom: `1px solid ${colorPalette.neutral.lighten3}`, cursor: 'pointer', backgroundColor: isHighlighted ? HIGHLIGHT_ROW : undefined }}
                  >
                    <td style={{ padding: `0 ${spacing(1)}px` }} onClick={e => e.stopPropagation()}>
                      <Checkbox checked={selected.has(r.id)} onChange={e => toggle(r.id, e.target.checked)} />
                    </td>
                    <td style={{ ...cell, color: LINK }} title={r.name}>{r.name}</td>
                    <td style={cell}>
                      <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2 }}>
                        <Icon type={iconType.UserFilled} size={20} color="blue-darken3" />
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                          {r.english && <Icon type={iconType.FlagEN} size={12} />}
                          <span style={{ fontSize: 11, fontWeight: 700, color: colorPalette.blue.darken3 }}>{r.type}</span>
                        </span>
                      </span>
                    </td>
                    <td style={cell}>{r.issued}</td>
                    <td style={cell} title={r.company}>{r.company}</td>
                    <td style={cell} title={r.owner}>{r.owner}</td>
                    <td style={cell}>{r.edited}</td>
                    <td style={{ ...cell, whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{r.status}</td>
                    {/* The row actions stay together on one line, as narrow as they can be. */}
                    <td style={{ padding: `0 ${spacing(1)}px` }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {ACTIONS.map(a => (
                          <RowAction key={a.label} label={a.label} icon={a.icon === iconType.CommentOutlined && r.commented ? iconType.CommentFilled : a.icon} />
                        ))}
                        <RowAction label="Mehr" icon={iconType.ThreeDotsVerFilled} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  )
}
