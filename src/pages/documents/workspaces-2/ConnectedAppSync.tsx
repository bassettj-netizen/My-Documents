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

/** The note under the document lists (Version 19's FilesDisclaimer), here under the upload area. */
function UploadDisclaimer() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2), marginTop: -spacing(2) }}>
      <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
      <Typography size="base-sm" color="neutral-darken2">
        All files are securely uploaded and scanned for viruses. <span style={{ color: colorPalette.blue.base, textDecoration: 'underline', cursor: 'pointer' }}>Learn more</span>
      </Typography>
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
        belowDropzone={<UploadDisclaimer />}
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

type PickerFile = { id: string; name: string; format: FileFormat; sizeKb: number; modified: string; modifiedBy: string; accountId: string; recency: number; dateIndex: number }

/** An account's files in the app — the same every time, so a synced file is recognised when the picker opens again. */
function filesFor(type: ConnectorType, account: ConnectedAccount, accountIndex: number): PickerFile[] {
  const list = FILES[type]
  return list.map((_, i) => {
    const [name, format] = list[(i + accountIndex * 2) % list.length]
    return {
      id: `sync-${type}-${account.id}-${i}`, name, format, sizeKb: 180 + ((i * 397 + accountIndex * 131) % 2400),
      modified: MODIFIED[i], modifiedBy: MODIFIED_BY[(i + accountIndex) % MODIFIED_BY.length], accountId: account.id, recency: i * 10 + accountIndex, dateIndex: i,
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

type PickerProps = {
  app: ConnectedApp
  existingIds: Set<string>
  onClose: () => void
  onSync: (docs: MetadataDocument[], source: ConnectorType) => void
}

/** Each app's own file picker: Microsoft's (as in Figma), Google Drive's and DATEV's. They share what's in them and how picking works. */
function SyncFilePicker(props: PickerProps) {
  if (props.app.type === 'google-drive') return <GoogleDrivePicker {...props} />
  if (props.app.type === 'datev') return <DatevPicker {...props} />
  return <MicrosoftPicker {...props} />
}

/** The files, where the user is, the search and the selection — the same in every app's picker. */
function usePicker({ app, existingIds, onSync }: PickerProps) {
  const [place, setPlace] = useState<Place>({ kind: 'nav', index: 0 })
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const allFiles = useMemo(() => app.accounts.flatMap((a, i) => filesFor(app.type, a, i)), [app])
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

  const selectable = files.filter(f => !existingIds.has(f.id))
  const allSelected = selectable.length > 0 && selectable.every(f => selected.has(f.id))
  const toggle = (id: string) => { if (!existingIds.has(id)) setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next }) }
  const toggleAll = () => setSelected(prev => {
    const next = new Set(prev)
    selectable.forEach(f => allSelected ? next.delete(f.id) : next.add(f.id))
    return next
  })
  const sync = () => onSync(allFiles.filter(f => selected.has(f.id)).map(toDoc), app.type)
  const isSynced = (id: string) => existingIds.has(id)
  return { place, setPlace, query, setQuery, selected, files, selectable, allSelected, toggle, toggleAll, sync, isSynced }
}

/** Microsoft's picker (SharePoint, OneDrive), as in Figma 5116:94514, inside the DS modal. */
function MicrosoftPicker(props: PickerProps) {
  const { app, existingIds, onClose } = props
  const { place, setPlace, query, setQuery, selected, files, selectable, allSelected, toggle, toggleAll, sync } = usePicker(props)
  const [hovered, setHovered] = useState<string | null>(null)
  const places = PLACES[app.type]
  const title = place.kind === 'account' ? app.accounts.find(a => a.id === place.id)?.name ?? '' : place.index === 0 ? 'Recents' : places.nav[place.index]

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

// ─── Pickers in the other apps' own style ───────────────────────────────────

/** A full-window dim with the app's own dialog centred on it; Escape or a click outside closes it, like the real pickers. */
function PickerOverlay({ onClose, children, label }: { onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div role="dialog" aria-modal aria-label={label} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'rgba(32, 33, 36, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, boxSizing: 'border-box' }}>
      {children}
    </div>
  )
}

/** A small file-type mark in Drive's style: a coloured page with a folded corner and the type's letter. */
function DriveFileIcon({ format }: { format: FileFormat }) {
  const color = format === 'PDF' ? '#ea4335' : format === 'XLSX' ? '#0f9d58' : format === 'PPTX' ? '#f4b400' : '#4285f4'
  const letter = format === 'PDF' ? 'PDF' : format === 'XLSX' ? 'X' : format === 'PPTX' ? 'P' : 'W'
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M4 1h8.5L17 5.5V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2Z" fill={color} />
      <path d="M12.5 1v3a1.5 1.5 0 0 0 1.5 1.5h3Z" fill="white" opacity={0.45} />
      <text x="9.5" y="14.5" textAnchor="middle" fontSize={letter.length > 1 ? 5.2 : 8} fontWeight={700} fill="white" fontFamily="Roboto, Arial, sans-serif">{letter}</text>
    </svg>
  )
}

const gText = (size: number, color = '#1f1f1f', weight = 400): CSSProperties => ({ fontFamily: "'Google Sans', Roboto, Arial, sans-serif", fontSize: size, color, fontWeight: weight })

/** Google Drive's picker: tabs for its places, a search, a list, and Select / Cancel at the bottom left. */
function GoogleDrivePicker(props: PickerProps) {
  const { app, onClose } = props
  const { place, setPlace, query, setQuery, selected, files, toggle, sync, isSynced } = usePicker(props)
  // "Shared drives" lists the connected accounts first; opening one shows its files.
  const [drivesOpen, setDrivesOpen] = useState(false)
  const tabs: { key: string; label: string; active: boolean; onClick: () => void }[] = [
    ...['Recent', 'My Drive', 'Shared with me', 'Starred'].map((label, index) => ({
      key: label, label, active: !drivesOpen && place.kind === 'nav' && place.index === index,
      onClick: () => { setDrivesOpen(false); setPlace({ kind: 'nav', index }) },
    })),
    { key: 'drives', label: 'Shared drives', active: drivesOpen || place.kind === 'account', onClick: () => { setDrivesOpen(true); setPlace({ kind: 'nav', index: 0 }) } },
  ]
  const openDrive = place.kind === 'account' ? app.accounts.find(a => a.id === place.id) : undefined
  const DriveIcon = app.def.icon
  const columns = 'minmax(0, 2.2fr) minmax(0, 1.1fr) minmax(0, 1fr) 90px'

  return (
    <PickerOverlay onClose={onClose} label="Google Drive — select files">
      <div style={{ width: 'min(1050px, 100%)', height: 'min(720px, 100%)', backgroundColor: 'white', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header: the Drive mark and title, search, close. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 16px 8px 24px' }}>
          <span style={{ display: 'inline-flex' }}>{DriveIcon(24)}</span>
          <span style={{ ...gText(22, '#1f1f1f'), whiteSpace: 'nowrap' }}>Select files</span>
          <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, height: 44, padding: '0 16px', borderRadius: 22, backgroundColor: '#e9eef6', marginLeft: 16 }}>
            <Icon type={iconType.SearchOutlined} size={20} color="neutral-darken3" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search in Drive" aria-label="Search in Drive"
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'none', ...gText(16) }} />
          </label>
          <button type="button" onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, border: 'none', borderRadius: 20, background: 'none', cursor: 'pointer', fontSize: 22, color: '#444746' }}>×</button>
        </div>

        {/* Tabs */}
        <div role="tablist" style={{ display: 'flex', gap: 4, padding: '0 16px', borderBottom: '1px solid #e0e3e7' }}>
          {tabs.map(t => (
            <button key={t.key} type="button" role="tab" aria-selected={t.active} onClick={t.onClick}
              style={{ position: 'relative', height: 48, padding: '0 16px', border: 'none', background: 'none', cursor: 'pointer', ...gText(14, t.active ? '#0b57d0' : '#444746', 500) }}>
              {t.label}
              {t.active && <span style={{ position: 'absolute', left: 12, right: 12, bottom: 0, height: 3, borderRadius: '3px 3px 0 0', backgroundColor: '#0b57d0' }} />}
            </button>
          ))}
        </div>

        {/* Where you are, when inside a shared drive. */}
        {openDrive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px 0', ...gText(14, '#444746') }}>
            <button type="button" onClick={() => { setDrivesOpen(true); setPlace({ kind: 'nav', index: 0 }) }} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', ...gText(14, '#0b57d0', 500) }}>Shared drives</button>
            <span>›</span><span style={{ color: '#1f1f1f' }}>{openDrive.name}</span>
          </div>
        )}

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px' }}>
          {drivesOpen && place.kind === 'nav' ? (
            // The connected accounts, as shared drives.
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, padding: 8 }}>
              {app.accounts.map(a => (
                <button key={a.id} type="button" onClick={() => { setDrivesOpen(false); setPlace({ kind: 'account', id: a.id }) }} title={a.domain}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, height: 56, padding: '0 16px', border: '1px solid #c4c7c5', borderRadius: 12, backgroundColor: '#f8fafd', cursor: 'pointer', textAlign: 'left' }}>
                  <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h4l2 2.5h7A2.5 2.5 0 0 1 21 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z" fill="#5f6368" /><circle cx="12" cy="13" r="1.6" fill="white" /><circle cx="8.8" cy="15.4" r="1.2" fill="white" /><circle cx="15.2" cy="15.4" r="1.2" fill="white" /></svg>
                  <span style={{ ...gText(14, '#1f1f1f', 500), ...ellipsis }}>{a.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div role="grid">
              <div style={{ display: 'grid', gridTemplateColumns: columns, alignItems: 'center', gap: 16, height: 48, padding: '0 16px', borderBottom: '1px solid #e0e3e7', ...gText(14, '#444746', 500) }}>
                <span>Name</span><span>Owner</span><span>Last modified</span><span>File size</span>
              </div>
              {files.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', ...gText(14, '#444746') }}>{query ? `No results for “${query.trim()}”` : 'No files here'}</div>
              ) : files.map(f => {
                const synced = isSynced(f.id)
                const isSelected = selected.has(f.id)
                return (
                  <div key={f.id} role="row" aria-selected={isSelected} onClick={() => toggle(f.id)}
                    style={{ display: 'grid', gridTemplateColumns: columns, alignItems: 'center', gap: 16, height: 48, padding: '0 16px', borderBottom: '1px solid #e0e3e7', borderRadius: isSelected ? 0 : undefined, cursor: synced ? 'default' : 'pointer', backgroundColor: isSelected ? '#c2e7ff' : undefined, opacity: synced ? 0.55 : 1 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                      {isSelected
                        ? <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="10" fill="#0b57d0" /><path d="m5.8 10.2 2.8 2.8 5.6-5.8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <DriveFileIcon format={f.format} />}
                      <span style={{ ...gText(14, '#1f1f1f', 500), ...ellipsis }} title={`${f.name}.${f.format.toLowerCase()}`}>{f.name}.{f.format.toLowerCase()}</span>
                      {synced && <span style={{ flexShrink: 0, ...gText(12, '#444746'), padding: '2px 8px', borderRadius: 8, backgroundColor: '#e9eef6' }}>Already synced</span>}
                    </span>
                    <span style={{ ...gText(14, '#444746'), ...ellipsis }}>{f.modifiedBy === CURRENT_USER ? 'me' : f.modifiedBy}</span>
                    <span style={{ ...gText(14, '#444746'), ...ellipsis }}>{f.modified}</span>
                    <span style={{ ...gText(14, '#444746') }}>{fileSize(f.sizeKb)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Select / Cancel bottom left, as in Google's picker. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px 16px', borderTop: '1px solid #e0e3e7' }}>
          <button type="button" disabled={selected.size === 0} onClick={sync}
            style={{ height: 40, padding: '0 24px', border: 'none', borderRadius: 20, cursor: selected.size ? 'pointer' : 'default', backgroundColor: selected.size ? '#0b57d0' : '#1f1f1f1f', ...gText(14, selected.size ? 'white' : '#1f1f1f61', 500) }}>
            Select
          </button>
          <button type="button" onClick={onClose} style={{ height: 40, padding: '0 16px', border: 'none', borderRadius: 20, background: 'none', cursor: 'pointer', ...gText(14, '#0b57d0', 500) }}>Cancel</button>
          {selected.size > 0 && <span style={{ marginLeft: 8, ...gText(14, '#444746') }}>{selected.size} selected</span>}
        </div>
      </div>
    </PickerOverlay>
  )
}

// DATEV shows dates the German way.
const DATEV_DATES = ['09.11.2026', '31.10.2026', '23.06.2026', '23.06.2026', '06.05.2026', '09.04.2026', '09.12.2025', '11.11.2025', '11.11.2025']
const dText = (size: number, color = '#1d1d1b', weight = 400): CSSProperties => ({ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: size, color, fontWeight: weight })

/** A square checkbox in DATEV's green. */
function DatevCheckbox({ checked, disabled = false }: { checked: boolean; disabled?: boolean }) {
  return (
    <span aria-hidden style={{ width: 16, height: 16, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${checked ? '#00a443' : '#8c8c8c'}`, backgroundColor: disabled ? '#e6e6e6' : checked ? '#00a443' : 'white', borderRadius: 2 }}>
      {(checked || disabled) && <svg width={10} height={10} viewBox="0 0 10 10"><path d="m1.5 5.2 2.3 2.3 4.7-5" fill="none" stroke={disabled ? '#8c8c8c' : 'white'} strokeWidth="1.6" /></svg>}
    </span>
  )
}

/** DATEV's document filing (Dokumentenablage): clients on the left, a document table, Übernehmen / Abbrechen. In German, like DATEV. */
function DatevPicker(props: PickerProps) {
  const { app, onClose } = props
  const { place, setPlace, query, setQuery, selected, files, selectable, allSelected, toggle, toggleAll, sync, isSynced } = usePicker(props)
  const DatevIcon = app.def.icon
  const clientNumber = (i: number) => String(10001 + i * 117)
  const accountName = (id: string) => app.accounts.find(a => a.id === id)?.name ?? ''
  const nav = ['Zuletzt verwendet', 'Meine Dokumente', 'Freigegeben', 'Favoriten']
  const title = place.kind === 'account' ? `${clientNumber(app.accounts.findIndex(a => a.id === place.id))} ${accountName(place.id)}` : nav[place.index]
  const columns = '36px minmax(0, 2.4fr) minmax(0, 1.4fr) 100px 90px minmax(0, 1.2fr)'
  const navButton = (label: string, active: boolean, onClick: () => void, key: string, prefix?: ReactNode) => (
    <button key={key} type="button" onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', minHeight: 32, padding: '6px 12px', border: 'none', borderLeft: `3px solid ${active ? '#00a443' : 'transparent'}`, backgroundColor: active ? '#e5f5ec' : 'transparent', cursor: 'pointer', textAlign: 'left', ...dText(13, '#1d1d1b', active ? 700 : 400) }}>
      {prefix}<span style={ellipsis}>{label}</span>
    </button>
  )
  const folder = <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden style={{ flexShrink: 0 }}><path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.6l1.5 1.6h5.9A1.5 1.5 0 0 1 15 5.1v7.4a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5Z" fill="#f2b705" /></svg>

  return (
    <PickerOverlay onClose={onClose} label="DATEV — Dokumente auswählen">
      <div style={{ width: 'min(1100px, 100%)', height: 'min(720px, 100%)', backgroundColor: 'white', borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* DATEV's header bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 52, padding: '0 8px 0 20px', borderBottom: '3px solid #00a443' }}>
          {DatevIcon(28)}
          <span style={dText(16, '#1d1d1b', 700)}>DATEV</span>
          <span style={{ width: 1, height: 20, backgroundColor: '#d0d0d0' }} />
          <span style={dText(15, '#4b4b4b')}>Dokumentenablage</span>
          <span style={{ flex: 1 }} />
          <span style={dText(13, '#4b4b4b')}>{CURRENT_USER}</span>
          <button type="button" onClick={onClose} aria-label="Schließen" style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', fontSize: 22, color: '#4b4b4b' }}>×</button>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          {/* Places and clients (Mandanten) */}
          <nav style={{ width: 250, flexShrink: 0, borderRight: '1px solid #d0d0d0', backgroundColor: '#f7f7f7', padding: '12px 0', overflowY: 'auto' }}>
            {nav.map((label, index) => navButton(label, place.kind === 'nav' && place.index === index, () => setPlace({ kind: 'nav', index }), label))}
            <div style={{ ...dText(12, '#6b6b6b', 700), textTransform: 'uppercase', letterSpacing: 0.4, padding: '18px 15px 6px' }}>Mandanten</div>
            {app.accounts.map((a, i) => navButton(`${clientNumber(i)} ${a.name}`, place.kind === 'account' && place.id === a.id, () => setPlace({ kind: 'account', id: a.id }), a.id, folder))}
          </nav>

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '16px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ flex: 1, minWidth: 0, ...dText(20), ...ellipsis }}>{title}</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, width: 260, height: 32, padding: '0 10px', border: '1px solid #8c8c8c', borderRadius: 2, boxSizing: 'border-box' }}>
                <Icon type={iconType.SearchOutlined} size={16} color="neutral-darken3" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Dokumente durchsuchen" aria-label="Dokumente durchsuchen"
                  style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'none', ...dText(13) }} />
              </label>
            </div>

            <div style={{ flex: 1, minHeight: 0, marginTop: 14, border: '1px solid #d0d0d0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'grid', gridTemplateColumns: columns, alignItems: 'center', gap: 12, height: 36, padding: '0 12px', backgroundColor: '#f2f2f2', borderBottom: '1px solid #d0d0d0', flexShrink: 0, ...dText(13, '#1d1d1b', 700) }}>
                <button type="button" onClick={toggleAll} aria-label="Alle auswählen" style={{ display: 'inline-flex', padding: 0, border: 'none', background: 'none', cursor: selectable.length ? 'pointer' : 'default' }}><DatevCheckbox checked={allSelected} /></button>
                <span>Dokument</span><span>Mandant</span><span>Datum</span><span>Größe</span><span>Bearbeiter</span>
              </div>
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {files.length === 0 ? (
                  <div style={{ padding: 24, ...dText(13, '#4b4b4b') }}>{query ? `Keine Dokumente zu „${query.trim()}“ gefunden.` : 'Keine Dokumente vorhanden.'}</div>
                ) : files.map((f, i) => {
                  const synced = isSynced(f.id)
                  const isSelected = selected.has(f.id)
                  return (
                    <div key={f.id} role="row" aria-selected={isSelected} onClick={() => toggle(f.id)}
                      style={{ display: 'grid', gridTemplateColumns: columns, alignItems: 'center', gap: 12, height: 38, padding: '0 12px', borderBottom: '1px solid #e6e6e6', cursor: synced ? 'default' : 'pointer', backgroundColor: isSelected ? '#e5f5ec' : i % 2 ? '#fafafa' : 'white', color: synced ? '#8c8c8c' : undefined }}>
                      <DatevCheckbox checked={isSelected} disabled={synced} />
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <img src={FILE_ICON[f.format]} alt={f.format} width={20} height={20} style={{ flexShrink: 0, opacity: synced ? 0.5 : 1 }} />
                        <span style={{ ...dText(13, synced ? '#8c8c8c' : '#1d1d1b'), ...ellipsis }} title={`${f.name}.${f.format.toLowerCase()}`}>{f.name}.{f.format.toLowerCase()}</span>
                        {synced && <span style={{ flexShrink: 0, ...dText(11, '#4b4b4b'), padding: '1px 6px', border: '1px solid #c8c8c8', borderRadius: 2 }}>bereits übernommen</span>}
                      </span>
                      <span style={{ ...dText(13, '#4b4b4b'), ...ellipsis }}>{accountName(f.accountId)}</span>
                      <span style={dText(13, '#4b4b4b')}>{DATEV_DATES[f.dateIndex]}</span>
                      <span style={dText(13, '#4b4b4b')}>{fileSize(f.sizeKb).replace('.', ',')}</span>
                      <span style={{ ...dText(13, '#4b4b4b'), ...ellipsis }}>{f.modifiedBy}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0 16px' }}>
              <span style={{ flex: 1, ...dText(13, '#4b4b4b') }}>{selected.size === 0 ? 'Kein Dokument ausgewählt' : selected.size === 1 ? '1 Dokument ausgewählt' : `${selected.size} Dokumente ausgewählt`}</span>
              <button type="button" onClick={onClose} style={{ height: 34, padding: '0 20px', border: '1px solid #8c8c8c', backgroundColor: 'white', cursor: 'pointer', ...dText(14) }}>Abbrechen</button>
              <button type="button" disabled={selected.size === 0} onClick={sync}
                style={{ height: 34, padding: '0 24px', border: 'none', backgroundColor: selected.size ? '#00a443' : '#c8c8c8', cursor: selected.size ? 'pointer' : 'default', ...dText(14, 'white', 700) }}>
                Übernehmen
              </button>
            </div>
          </div>
        </div>
      </div>
    </PickerOverlay>
  )
}
