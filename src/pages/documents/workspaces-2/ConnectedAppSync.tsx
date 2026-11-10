import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ButtonTertiary, ClickableContainer, Icon, iconType, Modal, Typography } from '@goat-ui/goat-ui-core'
import { BasicUploadModal } from '../workspaces/WorkspacesBasic'
import { colorPalette, fontWeight, spacing, type Connector, type ConnectorType } from '../workspaces/shared'
import type { FileFormat, MetadataDocument } from '../bulk-edit/documents'
import { useConnections } from '../../../contexts/ConnectionsContext'
import { CONNECTOR_TYPE, CONNECTORS, initialAccountsFor, type ConnectedAccount, type ConnectorDef } from './connectorDefs'

/**
 * Workspaces 2.0 Versions 19 and 21: "Upload or sync" lists the apps connected on the Connectors page. Choosing one
 * follows the Microsoft Integration flow in Figma (My Documents, node 4591:5091): the app's sign-in, then its
 * "Select files to sync" picker. Google Drive and DATEV follow the same steps with their own sign-in and labels.
 */

// ─── Connected apps ─────────────────────────────────────────────────────────

type ConnectedApp = { def: ConnectorDef; type: ConnectorType; accounts: ConnectedAccount[] }

/** Every app with at least one connected account: the workspaces' own (unless disconnected) and any added on the Connectors page. */
function useConnectedApps(accountName: (name: string) => string = name => name): ConnectedApp[] {
  const { isWorkspaceConnectorDisconnected, addedConnectorAccounts } = useConnections()
  return CONNECTORS.map(def => {
    const type = CONNECTOR_TYPE[def.id]
    const seeded = initialAccountsFor(def.id)
      .filter(a => !isWorkspaceConnectorDisconnected(a.id, type))
      .map(a => ({ ...a, name: accountName(a.name) }))
    return { def, type, accounts: [...seeded, ...(addedConnectorAccounts[def.id] ?? [])] }
  }).filter(app => app.accounts.length > 0)
}

const listNames = (names: string[]) => names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`

/** The Upload or Sync modal's "Connected apps" (Figma 4591:29862): one row per app, opening its sync flow. */
function ConnectedAppsSection({ apps, onChoose, onOpenConnectors }: { apps: ConnectedApp[]; onChoose: (app: ConnectedApp) => void; onOpenConnectors: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD} uppercase>Connected apps</Typography>
      {apps.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          {apps.map(app => (
            <ClickableContainer key={app.type} as="div" dashed={false} width="expanded" onClick={() => onChoose(app)}>
              <div style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(4)}px ${spacing(5)}px`, textAlign: 'left' }}>
                <span style={{ display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{app.def.icon(28)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{app.def.name}</Typography>
                  <Typography size="base-sm" color="neutral-darken5">Sync documents from {listNames(app.accounts.map(a => a.name))}.</Typography>
                </div>
                <Icon type={iconType.ChevronRightOutlined} size={24} color="neutral-darken2" />
              </div>
            </ClickableContainer>
          ))}
        </div>
      ) : (
        // Figma's "Not Connected" row: nothing to sync from yet, and a way to the Connectors page.
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(4)}px ${spacing(5)}px`, border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 8, backgroundColor: colorPalette.neutral.lighten5 }}>
          <Icon type={iconType.LinkOutlined} size={24} color="neutral-darken2" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>No connectors configured</Typography>
            <Typography size="base-sm" color="neutral-darken5">Connect an app to sync its documents here.</Typography>
          </div>
          <ButtonTertiary onClick={onOpenConnectors}>Connect</ButtonTertiary>
        </div>
      )}
    </div>
  )
}

// ─── The flow ───────────────────────────────────────────────────────────────

// Each app asks you to sign in the first time you sync from it; after that it goes straight to its files (until reload).
const signedInApps = new Set<ConnectorType>()

type Step = { kind: 'choose' } | { kind: 'sign-in'; app: ConnectedApp } | { kind: 'pick'; app: ConnectedApp }

/**
 * Upload or sync: the upload modal with the connected apps, then (for an app) its sign-in and file picker.
 * Uploaded files go to onUpload; synced files to onSync with the app they came from.
 */
export function UploadOrSyncFlow({ open, onClose, onUpload, onSync, existingIds, connectorsPath, accountName }: {
  open: boolean
  onClose: () => void
  onUpload: (docs: MetadataDocument[]) => void
  onSync: (docs: MetadataDocument[], source: ConnectorType) => void
  /** Files already here — the picker shows them as synced. */
  existingIds: Set<string>
  connectorsPath: string
  accountName?: (name: string) => string
}) {
  const navigate = useNavigate()
  const apps = useConnectedApps(accountName)
  // Every way out (close, cancel, sync) goes back to the first step, so the modal always reopens there.
  const [step, setStep] = useState<Step>({ kind: 'choose' })

  const close = () => { setStep({ kind: 'choose' }); onClose() }
  const choose = (app: ConnectedApp) => setStep(signedInApps.has(app.type) ? { kind: 'pick', app } : { kind: 'sign-in', app })

  return (
    <>
      <BasicUploadModal
        open={open && step.kind === 'choose'}
        connectors={[] as Connector[]}
        uploadImmediately
        onClose={close}
        onUpload={onUpload}
        connectorsSection={<ConnectedAppsSection apps={apps} onChoose={choose} onOpenConnectors={() => { close(); navigate(connectorsPath) }} />}
      />
      {open && step.kind === 'sign-in' && (
        <ProviderSignIn
          type={step.app.type}
          onBack={() => setStep({ kind: 'choose' })}
          onSignedIn={() => { signedInApps.add(step.app.type); setStep({ kind: 'pick', app: step.app }) }}
        />
      )}
      {/* Mounted per app, so each opening starts on Home with nothing selected. */}
      {open && step.kind === 'pick' && (
        <SyncFilePicker
          key={step.app.type}
          app={step.app}
          existingIds={existingIds}
          onClose={close}
          onSync={(docs, source) => { onSync(docs, source); close() }}
        />
      )}
    </>
  )
}

// ─── Sign-in (Figma 4591:31715 for Microsoft) ───────────────────────────────

/** The app's own sign-in page, full screen as in Figma — the step where the user grants Haufe access to their files. */
function ProviderSignIn({ type, onBack, onSignedIn }: { type: ConnectorType; onBack: () => void; onSignedIn: () => void }) {
  const [account, setAccount] = useState('')
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onBack() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])
  const submit = (e: FormEvent) => { e.preventDefault(); onSignedIn() }
  const overlay: CSSProperties = { position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: "'Segoe UI', 'Segoe UI Web', Inter, system-ui, sans-serif" }

  if (type === 'google-drive') {
    return (
      <div style={{ ...overlay, backgroundColor: '#f0f4f9', fontFamily: "'Google Sans', Roboto, Inter, system-ui, sans-serif" }}>
        <form onSubmit={submit} style={{ width: 448, maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box', backgroundColor: 'white', borderRadius: 28, padding: '36px 40px' }}>
          <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.5 }}>
            {[['G', '#4285F4'], ['o', '#EA4335'], ['o', '#FBBC05'], ['g', '#4285F4'], ['l', '#34A853'], ['e', '#EA4335']].map(([c, color], i) => <span key={i} style={{ color }}>{c}</span>)}
          </div>
          <div style={{ fontSize: 32, lineHeight: '40px', color: '#1f1f1f', marginTop: 16 }}>Sign in</div>
          <div style={{ fontSize: 16, color: '#1f1f1f', marginTop: 12 }}>to continue to Haufe</div>
          <input autoFocus value={account} onChange={e => setAccount(e.target.value)} placeholder="Email or phone"
            style={{ width: '100%', boxSizing: 'border-box', marginTop: 32, height: 54, padding: '0 15px', fontSize: 16, border: '1px solid #747775', borderRadius: 4, outline: 'none' }} />
          <div style={{ fontSize: 14, color: '#0b57d0', fontWeight: 500, marginTop: 8 }}>Forgot email?</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 40 }}>
            <button type="button" onClick={onBack} style={{ border: 'none', background: 'none', color: '#0b57d0', fontSize: 14, fontWeight: 500, padding: '10px 16px', borderRadius: 20, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ border: 'none', backgroundColor: '#0b57d0', color: 'white', fontSize: 14, fontWeight: 500, padding: '10px 24px', borderRadius: 20, cursor: 'pointer' }}>Next</button>
          </div>
        </form>
      </div>
    )
  }

  if (type === 'datev') {
    const DatevIcon = CONNECTORS.find(c => c.id === 'datev')!.icon
    return (
      <div style={{ ...overlay, backgroundColor: '#f4f4f4', fontFamily: 'Arial, Helvetica, Inter, system-ui, sans-serif' }}>
        <form onSubmit={submit} style={{ width: 440, maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box', backgroundColor: 'white', borderTop: '4px solid #00a443', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', padding: '32px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{DatevIcon(32)}<span style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1b' }}>DATEV</span></div>
          <div style={{ fontSize: 22, color: '#1d1d1b', marginTop: 24 }}>Anmeldung</div>
          <div style={{ fontSize: 14, color: '#4b4b4b', marginTop: 8 }}>Melden Sie sich mit DATEV SmartLogin oder SmartCard an.</div>
          <label style={{ display: 'block', fontSize: 13, color: '#4b4b4b', marginTop: 24 }}>Benutzername
            <input autoFocus value={account} onChange={e => setAccount(e.target.value)}
              style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 6, height: 40, padding: '0 12px', fontSize: 15, border: '1px solid #8c8c8c', borderRadius: 2, outline: 'none' }} />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 32 }}>
            <button type="button" onClick={onBack} style={{ border: '1px solid #8c8c8c', backgroundColor: 'white', color: '#1d1d1b', fontSize: 14, padding: '9px 20px', cursor: 'pointer' }}>Abbrechen</button>
            <button type="submit" style={{ border: 'none', backgroundColor: '#00a443', color: 'white', fontSize: 14, fontWeight: 700, padding: '10px 24px', cursor: 'pointer' }}>Weiter</button>
          </div>
        </form>
      </div>
    )
  }

  // Microsoft (SharePoint), as in Figma.
  const MicrosoftIcon = CONNECTORS.find(c => c.id === 'microsoft-365')!.icon
  return (
    <div style={{ ...overlay, background: 'radial-gradient(circle at 0% 0%, #f2dcdc 0%, transparent 45%), radial-gradient(circle at 100% 15%, #d6e7dd 0%, transparent 45%), radial-gradient(circle at 0% 100%, #d4e2f3 0%, transparent 50%), radial-gradient(circle at 100% 100%, #f4ecd4 0%, transparent 50%), #e6e9ec' }}>
      <form onSubmit={submit} style={{ width: 440, maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box', backgroundColor: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', padding: 44 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{MicrosoftIcon(21)}<span style={{ fontSize: 19, fontWeight: 600, color: '#737373' }}>Microsoft</span></div>
        <div style={{ fontSize: 24, fontWeight: 600, color: '#1b1b1b', marginTop: 16 }}>Sign in</div>
        <input autoFocus value={account} onChange={e => setAccount(e.target.value)} placeholder="Email, phone, or Skype"
          style={{ width: '100%', boxSizing: 'border-box', marginTop: 16, height: 36, padding: '6px 0', fontSize: 15, border: 'none', borderBottom: '1px solid #0067b8', outline: 'none' }} />
        <div style={{ fontSize: 13, color: '#1b1b1b', marginTop: 16 }}>No account? <span style={{ color: '#0067b8' }}>Create one!</span></div>
        <div style={{ fontSize: 13, color: '#0067b8', marginTop: 16 }}>Sign in with a security key</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 24 }}>
          <button type="button" onClick={onBack} style={{ border: 'none', backgroundColor: '#e6e6e6', color: '#1b1b1b', fontSize: 15, minWidth: 108, height: 32, cursor: 'pointer' }}>Back</button>
          <button type="submit" style={{ border: 'none', backgroundColor: '#0067b8', color: 'white', fontSize: 15, minWidth: 108, height: 32, cursor: 'pointer' }}>Next</button>
        </div>
      </form>
      <div style={{ width: 440, maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box', backgroundColor: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', padding: '12px 44px', display: 'flex', alignItems: 'center', gap: 16, fontSize: 15, color: '#1b1b1b' }}>
        <Icon type={iconType.SearchOutlined} size={20} color="neutral-darken3" />Sign-in options
      </div>
    </div>
  )
}

// ─── File picker (Figma 5116:94514) ─────────────────────────────────────────

const PICKER_HEIGHT = 'calc(100vh - 146px)'
const PICKER_ASSET = (name: string) => `/sync-picker/${name}.svg`
const FILE_ICON: Record<string, string> = { DOCX: PICKER_ASSET('file-docx'), XLSX: PICKER_ASSET('file-xlsx'), PDF: PICKER_ASSET('file-pdf') }
const CURRENT_USER = 'Alex Mustermensch'

// Each app's own words for its places, as its picker would show them.
const PLACES: Record<ConnectorType, { nav: [string, string, string, string]; quickAccess: string }> = {
  'sharepoint': { nav: ['Home', 'My files', 'Shared', 'Favorites'], quickAccess: 'Quick access' },
  'google-drive': { nav: ['Home', 'My Drive', 'Shared with me', 'Starred'], quickAccess: 'Shared drives' },
  'datev': { nav: ['Home', 'My documents', 'Shared', 'Favorites'], quickAccess: 'Clients' },
  'onedrive': { nav: ['Home', 'My files', 'Shared', 'Favorites'], quickAccess: 'Quick access' },
}
const NAV_ICONS = ['home', 'folder', 'people', 'star']

const FILES: Record<ConnectorType, [string, FileFormat][]> = {
  'sharepoint': [
    ['USt-Prüfung_Protokoll_2026', 'DOCX'], ['Bescheid_KSt_2025_Bundesfinanzamt', 'DOCX'], ['Nachweis_Innergemeinschaftliche_Lieferung', 'XLSX'],
    ['Bescheid_KSt_2025_Bundesfinanzamt_Anlage', 'PDF'], ['Anlage_GvE_Beteiligungen_2025', 'DOCX'], ['Jahresabschluss_2025_Bergmann', 'PDF'],
    ['Antwort_Betriebsprüfung_Anforderung', 'DOCX'], ['Betriebsprüfungsbericht_2024', 'DOCX'], ['Gewerbesteuererklärung_2024', 'PDF'],
  ],
  'google-drive': [
    ['Projektplan_2026', 'DOCX'], ['Mandantenliste_Q4', 'XLSX'], ['Protokoll_Kickoff_Steuerberatung', 'DOCX'],
    ['Angebot_Beratung_2026', 'PDF'], ['Budget_Q4_2026', 'XLSX'], ['Checkliste_Jahresabschluss', 'DOCX'],
    ['Vollmacht_Finanzamt_unterschrieben', 'PDF'], ['Fristenübersicht_2026', 'XLSX'], ['Notizen_Mandantengespräch', 'DOCX'],
  ],
  'datev': [
    ['Lohnabrechnung_Oktober_2026', 'PDF'], ['Lohnjournal_Q3_2026', 'XLSX'], ['Buchungsjournal_09_2026', 'XLSX'],
    ['BWA_September_2026', 'PDF'], ['Summen-und-Saldenliste_2026', 'XLSX'], ['Umsatzsteuer-Voranmeldung_09_2026', 'PDF'],
    ['Lohnsteuerbescheinigung_2025', 'PDF'], ['Kassenbuch_Q3_2026', 'XLSX'], ['Anlagenverzeichnis_2025', 'PDF'],
  ],
  'onedrive': [],
}
FILES.onedrive = FILES.sharepoint
const MODIFIED = ['Yesterday', '10 days ago', 'June 23', 'June 23', 'May 06', 'April 09', 'December 09, 2025', 'November 11, 2025', 'November 11, 2025']
const MODIFIED_BY = [CURRENT_USER, 'Albert Berg', 'Sabine Hoffmann', 'Claudia Richter', 'Albert Berg', 'Albert Berg', CURRENT_USER, 'Claudia Richter', 'Albert Berg']
const TILE_COLORS = ['#ee0411', '#04a8ee', '#8a3ffc', '#107c10', '#f7630c']

type PickerFile = { id: string; name: string; format: FileFormat; sizeKb: number; modified: string; modifiedBy: string; accountId: string; recency: number }

/** An account's files in the app — the same every time, so a synced file is recognised when the picker opens again. */
function filesFor(type: ConnectorType, account: ConnectedAccount, accountIndex: number): PickerFile[] {
  const list = FILES[type]
  return list.map((_, i) => {
    const [name, format] = list[(i + accountIndex * 2) % list.length]
    return {
      id: `sync-${type}-${account.id}-${i}`, name, format, sizeKb: 180 + ((i * 397 + accountIndex * 131) % 2400),
      modified: MODIFIED[i], modifiedBy: MODIFIED_BY[(i + accountIndex) % MODIFIED_BY.length], accountId: account.id, recency: i * 10 + accountIndex,
    }
  })
}

const fileSize = (kb: number) => kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(2)} MB`

function toDoc(f: PickerFile): MetadataDocument {
  return {
    _id: f.id, name: f.name, domain: 'General', documentType: 'Document', status: 'Draft',
    namedEntity: '—', namedEntityId: '—', year: new Date().getFullYear(), monetaryAmounts: 0, currency: 'EUR', monetaryTypes: 'None',
    lawType: '—', citations: '—', jurisdiction: '—', uploadedDate: new Date().toISOString().slice(0, 10),
    fileSize: fileSize(f.sizeKb).replace('.00 MB', ' MB'), fileFormat: f.format,
  }
}

const pickerText = (size: number, color = '#1c212d', weight = 400): CSSProperties => ({ fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif", fontSize: size, lineHeight: '20px', color, fontWeight: weight, letterSpacing: -0.25 })
const ellipsis: CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }

/** Fluent's filled check circle, for a selected row (the design shows only the empty one). */
function SelectedCheck({ muted = false }: { muted?: boolean }) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="8" fill={muted ? '#bdbdbd' : '#0f6cbd'} />
      <path d="M6.6 10.2 9 12.5l4.4-4.6" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type Place = { kind: 'nav'; index: number } | { kind: 'account'; id: string }

function SyncFilePicker({ app, existingIds, onClose, onSync }: {
  app: ConnectedApp
  existingIds: Set<string>
  onClose: () => void
  onSync: (docs: MetadataDocument[], source: ConnectorType) => void
}) {
  const [place, setPlace] = useState<Place>({ kind: 'nav', index: 0 })
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [hovered, setHovered] = useState<string | null>(null)

  const allFiles = useMemo(() => app.accounts.flatMap((a, i) => filesFor(app.type, a, i)), [app])
  const places = PLACES[app.type]
  const files = useMemo(() => {
    let list = allFiles
    if (place.kind === 'account') list = list.filter(f => f.accountId === place.id)
    else if (place.index === 1) list = list.filter(f => f.modifiedBy === CURRENT_USER)
    else if (place.index === 2) list = list.filter(f => f.modifiedBy !== CURRENT_USER)
    else if (place.index === 3) list = list.filter((_, i) => i % 4 === 0)
    // Home is Recents: the newest few from every account, each file name once.
    else list = [...list].sort((a, b) => a.recency - b.recency).filter((f, i, all) => all.findIndex(g => g.name === f.name) === i).slice(0, 12)
    const q = query.trim().toLowerCase()
    return q ? list.filter(f => f.name.toLowerCase().includes(q)) : list
  }, [allFiles, place, query])

  const title = place.kind === 'account' ? app.accounts.find(a => a.id === place.id)?.name ?? '' : place.index === 0 ? 'Recents' : places.nav[place.index]
  const selectable = files.filter(f => !existingIds.has(f.id))
  const allSelected = selectable.length > 0 && selectable.every(f => selected.has(f.id))
  const toggle = (id: string) => setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  const toggleAll = () => setSelected(prev => {
    const next = new Set(prev)
    selectable.forEach(f => allSelected ? next.delete(f.id) : next.add(f.id))
    return next
  })
  const sync = () => onSync(allFiles.filter(f => selected.has(f.id)).map(toDoc), app.type)

  const navItem = (label: ReactNode, active: boolean, onClick: () => void, icon: ReactNode, key: string) => (
    <button key={key} type="button" onClick={onClick} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 36, padding: '0 0 0 18px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
      {active && <span style={{ position: 'absolute', left: -20, top: 10, width: 3, height: 16, borderRadius: 30, backgroundColor: '#006fc3' }} />}
      <span style={{ display: 'inline-flex', marginLeft: -18, width: 20 }}>{icon}</span>
      <span style={{ ...pickerText(14, '#1c212d', active ? 500 : 400), ...ellipsis }}>{label}</span>
    </button>
  )
  const headerCell = (label: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...pickerText(13, '#616161', 600) }}>{label}<img src={PICKER_ASSET('chevron-sort')} alt="" width={12} height={12} /></span>
  )
  const columns = '36px 45px minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1.2fr)'

  return (
    // The picker fills the modal edge to edge, and the modal is as tall as the window allows (less a 40px margin and its header).
    <Modal visible title="Select files to sync" withIcon={false} onClose={onClose} maxWidth={1150} minWidth={720} maxHeight={PICKER_HEIGHT}>
      {/* The DS modal doesn't render its id, so the body is found by the picker inside it. */}
      <style>{`.goat-modal-body:has(> .sync-file-picker) { padding: 0; }`}</style>
      <div className="sync-file-picker" style={{ display: 'flex', gap: 24, height: PICKER_HEIGHT, backgroundColor: '#f6f6f6', padding: '26px 24px 24px', boxSizing: 'border-box' }}>
        {/* Places: the signed-in user, the app's own places, then each connected account. */}
        <nav style={{ width: 195, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...pickerText(14, '#1c212d', 600), ...ellipsis, padding: '7px 0 11px 1px' }}>{CURRENT_USER}</div>
          <div style={{ paddingLeft: 20 }}>
            {places.nav.map((label, i) => navItem(label, place.kind === 'nav' && place.index === i, () => setPlace({ kind: 'nav', index: i }), <img src={PICKER_ASSET(NAV_ICONS[i])} alt="" width={20} height={20} />, label))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 20, ...pickerText(14, '#1c212d', 600) }}>
            {places.quickAccess}<img src={PICKER_ASSET('info')} alt="" width={20} height={20} />
          </div>
          <div style={{ marginTop: 6 }}>
            {app.accounts.map((a, i) => (
              <button key={a.id} type="button" onClick={() => setPlace({ kind: 'account', id: a.id })} title={a.domain}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 36, padding: 0, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ width: 20, height: 20, borderRadius: 1.68, flexShrink: 0, backgroundColor: TILE_COLORS[i % TILE_COLORS.length], color: 'white', fontSize: 7, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {a.name.split(/\s+/).filter(w => /^[A-Za-zÄÖÜ]/.test(w)).slice(0, 2).map(w => w[0].toUpperCase()).join('')}
                </span>
                <span style={{ ...pickerText(14, '#1c212d', place.kind === 'account' && place.id === a.id ? 500 : 400), ...ellipsis }}>{a.name}</span>
              </button>
            ))}
          </div>
          <span style={{ ...pickerText(14, '#0060a8', 500), marginTop: 6 }}>More places...</span>
        </nav>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 30 }}>
            <span style={{ flex: 1, minWidth: 0, ...pickerText(18, '#1c212d', 500), ...ellipsis }}>{title}</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, width: 217, height: 30, boxSizing: 'border-box', padding: '0 14px', borderRadius: 50, backgroundColor: 'white' }}>
              <img src={PICKER_ASSET('search')} alt="" width={16} height={16} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search in current library" aria-label="Search in current library"
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'none', padding: 0, ...pickerText(13, '#1c212d', 500) }} />
            </label>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><img src={PICKER_ASSET('list')} alt="" width={20} height={20} /><img src={PICKER_ASSET('chevron-down-12')} alt="" width={12} height={12} /></span>
          </div>

          <div style={{ flex: 1, minHeight: 0, marginTop: 25, display: 'flex', flexDirection: 'column', backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: columns, alignItems: 'center', height: 47, padding: '0 7px 0 13px', borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
              <button type="button" onClick={toggleAll} aria-label="Select all" style={{ display: 'inline-flex', padding: 0, border: 'none', background: 'none', cursor: selectable.length ? 'pointer' : 'default', opacity: selected.size > 0 || hovered === 'all' ? 1 : 0 }}
                onMouseEnter={() => setHovered('all')} onMouseLeave={() => setHovered(null)}>
                {allSelected ? <SelectedCheck /> : <img src={PICKER_ASSET('check-circle-header')} alt="" width={20} height={20} />}
              </button>
              <img src={PICKER_ASSET('document')} alt="" width={20} height={20} style={{ marginLeft: 6 }} />
              {headerCell('Name')}
              {headerCell('Modified')}
              {headerCell('Modified By')}
            </div>
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {files.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', ...pickerText(14, '#616161') }}>{query ? `No files match “${query.trim()}”.` : 'No files here.'}</div>
              ) : files.map(f => {
                const synced = existingIds.has(f.id)
                const isSelected = selected.has(f.id)
                return (
                  <div key={f.id} role="row" aria-selected={isSelected} onClick={() => !synced && toggle(f.id)}
                    onMouseEnter={() => setHovered(f.id)} onMouseLeave={() => setHovered(null)}
                    style={{ position: 'relative', display: 'grid', gridTemplateColumns: columns, alignItems: 'center', height: 57, padding: '0 7px 0 13px', cursor: synced ? 'default' : 'pointer', backgroundColor: isSelected ? '#ebf3fc' : hovered === f.id && !synced ? '#f5f5f5' : undefined }}>
                    <span style={{ display: 'inline-flex', opacity: synced || isSelected || hovered === f.id ? 1 : 0 }}>
                      {synced ? <SelectedCheck muted /> : isSelected ? <SelectedCheck /> : <img src={PICKER_ASSET('check-circle-header')} alt="" width={20} height={20} />}
                    </span>
                    <img src={FILE_ICON[f.format]} alt={f.format} width={32} height={32} style={{ opacity: synced ? 0.5 : 1 }} />
                    <span style={{ display: 'flex', alignItems: 'flex-start', gap: 8, minWidth: 0, paddingRight: 12 }}>
                      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ ...pickerText(14, synced ? '#8a8a8a' : '#1c212d'), ...ellipsis }} title={`${f.name}.${f.format.toLowerCase()}`}>{f.name}.{f.format.toLowerCase()}</span>
                        <span style={pickerText(12, '#616161')}>{fileSize(f.sizeKb)}{synced ? ' · Already synced' : ''}</span>
                      </span>
                      <img src={PICKER_ASSET('read-only-12')} alt="Read only" title="Read only — we never change your files" width={12} height={12} style={{ marginTop: 4, flexShrink: 0 }} />
                    </span>
                    <span style={{ ...pickerText(12, '#616161'), ...ellipsis }}>{f.modified}</span>
                    <span style={{ ...pickerText(12, '#616161'), ...ellipsis }}>{f.modifiedBy}</span>
                    <span style={{ position: 'absolute', left: 56, right: 0, bottom: 0, height: 1, backgroundColor: '#e0e0e0' }} />
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
            <button type="button" disabled={selected.size === 0} onClick={sync}
              style={{ ...pickerText(14, selected.size ? 'white' : '#bdbdbd', 600), padding: '5px 12px', borderRadius: 4, cursor: selected.size ? 'pointer' : 'default', border: `1px solid ${selected.size ? '#0f6cbd' : '#e0e0e0'}`, backgroundColor: selected.size ? '#0f6cbd' : '#f0f0f0' }}>
              {selected.size > 1 ? `Sync ${selected.size} files` : 'Sync'}
            </button>
            <button type="button" onClick={onClose} style={{ ...pickerText(14, '#242424', 600), padding: '5px 12px', borderRadius: 4, cursor: 'pointer', border: '1px solid #d1d1d1', backgroundColor: 'white' }}>Cancel</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
