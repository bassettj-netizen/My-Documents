import { useCallback, useEffect, useState } from 'react'
import {
  ButtonGhost,
  buttonShapes,
  ButtonPrimary,
  ButtonTertiary,
  buttonVariants,
  Checkbox,
  Chip,
  chipStyles,
  chipVariants,
  constants,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  Icon,
  iconType,
  Modal,
  Spinner,
  toastPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { useConnections } from '../../contexts/ConnectionsContext'

const { colorPalette, spacing, fontWeight } = constants

// ─── Mock data ────────────────────────────────────────────────────────────────

const SHAREPOINT_SITES = [
  { id: 'site-hr',     name: 'HR Portal',        host: 'haufe.sharepoint.com/sites/hr',    docCount: 142 },
  { id: 'site-tax',    name: 'Tax & Compliance',  host: 'haufe.sharepoint.com/sites/tax',   docCount: 87  },
  { id: 'site-legal',  name: 'Legal Documents',   host: 'haufe.sharepoint.com/sites/legal', docCount: 234 },
]

// ─── Icons ───────────────────────────────────────────────────────────────────

function SharePointIcon({ size = 20 }: { size?: number }) {
  const r = Math.round(size * 0.22)
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx={r} fill="#0078D4" />
      <path
        d="M 13.5 5.5 C 13.5 4 12.3 3 10.8 3 C 9.2 3 7.3 4 7.3 6 C 7.3 8 9 8.8 10.5 9.5 C 12.3 10.3 14 11.3 14 13.3 C 14 15.3 12.3 16.5 10.5 16.5 C 8.7 16.5 7 15.5 7 14"
        stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"
      />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <rect x="1"    y="1"    width="8.5" height="8.5" fill="#F25022" />
      <rect x="10.5" y="1"    width="8.5" height="8.5" fill="#7FBA00" />
      <rect x="1"    y="10.5" width="8.5" height="8.5" fill="#00A4EF" />
      <rect x="10.5" y="10.5" width="8.5" height="8.5" fill="#FFB900" />
    </svg>
  )
}

// ─── Connect modal (multi-site) ───────────────────────────────────────────────

type ConnectStep = 'sign-in' | 'authenticating' | 'site-selection'

function ConnectModal({ open, onClose, onConnected, alreadyConnectedIds }: {
  open: boolean
  onClose: () => void
  onConnected: (siteIds: string[]) => void
  alreadyConnectedIds: string[]
}) {
  const [step, setStep] = useState<ConnectStep>('sign-in')
  const [selectedSiteIds, setSelectedSiteIds] = useState<Set<string>>(new Set())

  useEffect(() => { if (!open) { setStep('sign-in'); setSelectedSiteIds(new Set()) } }, [open])

  const toggleSite = (id: string) => {
    setSelectedSiteIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const availableSites = SHAREPOINT_SITES.filter(s => !alreadyConnectedIds.includes(s.id))
  const selectionCount = selectedSiteIds.size
  const connectLabel = selectionCount > 1 ? `Connect ${selectionCount} sites` : 'Connect site'

  return (
    <Modal
      visible={open}
      title={
        step === 'sign-in' ? 'Connect to SharePoint' :
        step === 'authenticating' ? 'Connecting…' :
        'Select SharePoint Sites'
      }
      onClose={step !== 'authenticating' ? onClose : undefined}
      footer={step === 'authenticating' ? undefined : {
        buttons: step === 'sign-in' ? [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
        ] : [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
          {
            variant: buttonVariants.PRIMARY,
            props: {
              children: connectLabel,
              disabled: selectionCount === 0,
              onClick: () => onConnected([...selectedSiteIds]),
            },
          },
        ],
      }}
    >
      {step === 'sign-in' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(5), padding: `${spacing(4)}px 0` }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SharePointIcon size={28} />
          </div>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Sign in with your Microsoft account</Typography>
            <Typography size="base" color="neutral-darken2">Grant access to browse and import documents from your SharePoint sites.</Typography>
          </div>
          <div
            style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: `${spacing(3)}px ${spacing(5)}px`, display: 'flex', alignItems: 'center', gap: spacing(3), cursor: 'pointer', backgroundColor: colorPalette.white, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', width: '100%', maxWidth: 280 }}
            onClick={() => { setStep('authenticating'); setTimeout(() => setStep('site-selection'), 1800) }}
          >
            <MicrosoftIcon />
            <Typography size="base" color="neutral-darken5">Sign in with Microsoft</Typography>
          </div>
          <div style={{ textAlign: 'center', maxWidth: 320 }}>
            <Typography size="base-sm" color="neutral-darken2">You'll be redirected to Microsoft's login page. Your credentials are never stored by this app.</Typography>
          </div>
        </div>
      )}

      {step === 'authenticating' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(4), padding: `${spacing(6)}px 0` }}>
          <Spinner />
          <Typography size="base" color="neutral-darken2">Signing in to Microsoft…</Typography>
        </div>
      )}

      {step === 'site-selection' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px ${spacing(3)}px`, backgroundColor: '#F0FAF0', borderRadius: 8 }}>
            <Icon type={iconType.CheckCircleFilled} color="success-base" size={16} />
            <Typography size="base-sm" color="neutral-darken5">Connected as <strong>james.bassett@haufe.com</strong></Typography>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
            <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Choose SharePoint sites</Typography>
            <Typography size="base-sm" color="neutral-darken2">Select one or more sites to connect to this library.</Typography>
          </div>
          {availableSites.length === 0 ? (
            <div style={{ padding: `${spacing(4)}px`, textAlign: 'center', backgroundColor: '#FAFAFA', borderRadius: 8 }}>
              <Typography size="base-sm" color="neutral-darken2">All available sites are already connected.</Typography>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
              {availableSites.map(site => {
                const isSelected = selectedSiteIds.has(site.id)
                return (
                  <div
                    key={site.id}
                    onClick={() => toggleSite(site.id)}
                    style={{
                      border: `1.5px solid ${isSelected ? colorPalette.blue.base : '#e0e0e0'}`,
                      borderRadius: 8,
                      padding: `${spacing(3)}px ${spacing(4)}px`,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#F0F7FF' : colorPalette.white,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing(3),
                      transition: 'border-color 0.15s, background-color 0.15s',
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSite(site.id)}
                      onClick={e => e.stopPropagation()}
                    />
                    <SharePointIcon size={20} />
                    <div style={{ flex: 1 }}>
                      <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{site.name}</Typography>
                      <Typography size="base-sm" color="neutral-darken2">{site.host}</Typography>
                    </div>
                    <Typography size="base-sm" color="neutral-darken2">{site.docCount} docs</Typography>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConnectionsPage() {
  const { connectedSiteIds, connectSites, disconnectSite } = useConnections()
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const [syncingSiteId, setSyncingSiteId] = useState<string | null>(null)
  const { notification } = useNotifications()

  const connectedSites = SHAREPOINT_SITES.filter(s => connectedSiteIds.includes(s.id))

  const handleConnected = useCallback((newSiteIds: string[]) => {
    connectSites(newSiteIds)
    setConnectModalOpen(false)
    const names = newSiteIds.map(id => SHAREPOINT_SITES.find(s => s.id === id)?.name).filter(Boolean).join(', ')
    const label = newSiteIds.length > 1 ? `Connected to ${newSiteIds.length} sites` : `Connected to ${names}`
    notification.success({ title: label, placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
  }, [connectSites, notification])

  const handleDisconnect = useCallback((siteId: string) => {
    const siteName = SHAREPOINT_SITES.find(s => s.id === siteId)?.name
    disconnectSite(siteId)
    notification.default({ title: `Disconnected from ${siteName}`, placement: toastPlacements.BOTTOM_LEFT, duration: 3 })
  }, [disconnectSite, notification])

  const handleSync = useCallback((siteId: string) => {
    const siteName = SHAREPOINT_SITES.find(s => s.id === siteId)?.name
    setSyncingSiteId(siteId)
    notification.default({ key: 'sp-sync', title: `Syncing ${siteName}…`, placement: toastPlacements.BOTTOM_RIGHT, duration: 0, content: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size="small" /><Typography>Checking for updates…</Typography></div> })
    setTimeout(() => {
      setSyncingSiteId(null)
      notification.destroy('sp-sync')
      notification.success({ title: 'Sync complete', placement: toastPlacements.BOTTOM_LEFT, duration: 4, content: <Typography>All documents are up to date</Typography> })
    }, 2000)
  }, [notification])

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24, backgroundColor: colorPalette.white, height: '100%', overflowY: 'auto' }}>

      {/* Page header */}
      <div>
        <Typography size="heading-lg" weight="bold">Connections</Typography>
        <div style={{ marginTop: spacing(1) }}>
          <Typography size="base" color="neutral-darken2">Manage external services connected to your document library.</Typography>
        </div>
      </div>

      {/* SharePoint section */}
      <div style={{ border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden', maxWidth: 720 }}>

        {/* Section header */}
        <div style={{
          padding: `${spacing(4)}px ${spacing(5)}px`,
          borderBottom: connectedSites.length > 0 ? '1px solid #e0e0e0' : 'none',
          backgroundColor: '#FAFAFA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SharePointIcon size={20} />
            </div>
            <div>
              <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>SharePoint</Typography>
              <Typography size="base-sm" color="neutral-darken2">Microsoft SharePoint Online</Typography>
            </div>
            {connectedSites.length > 0 && (
              <Chip
                label={`${connectedSites.length} site${connectedSites.length > 1 ? 's' : ''} connected`}
                chipStyle={chipStyles.SEMANTIC_SUCCESS}
                variant={chipVariants.SUBTLE}
              />
            )}
          </div>
          {connectedSites.length > 0 && SHAREPOINT_SITES.some(s => !connectedSiteIds.includes(s.id)) && (
            <ButtonTertiary leftIcon={iconType.PlusOutlined} onClick={() => setConnectModalOpen(true)}>
              Add site
            </ButtonTertiary>
          )}
        </div>

        {/* Empty state */}
        {connectedSites.length === 0 && (
          <div style={{ padding: `${spacing(8)}px ${spacing(5)}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(4), textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SharePointIcon size={30} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1), maxWidth: 380 }}>
              <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>No SharePoint sites connected</Typography>
              <Typography size="base" color="neutral-darken2">
                Connect your Microsoft SharePoint account to browse and import documents directly into your library.
              </Typography>
            </div>
            <ButtonPrimary onClick={() => setConnectModalOpen(true)}>Connect to SharePoint</ButtonPrimary>
            <Typography size="base-sm" color="neutral-darken2">
              You'll sign in with your Microsoft account. Your credentials are never stored by this app.
            </Typography>
          </div>
        )}

        {/* Connected site cards */}
        {connectedSites.map((site, idx) => (
          <div
            key={site.id}
            style={{
              padding: `${spacing(4)}px ${spacing(5)}px`,
              borderTop: idx > 0 ? '1px solid #f0f0f0' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing(4),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), minWidth: 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <SharePointIcon size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                  <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{site.name}</Typography>
                  <Icon type={iconType.CheckCircleFilled} color="success-base" size={14} />
                </div>
                <Typography size="base-sm" color="neutral-darken2">{site.host}</Typography>
                <div style={{ marginTop: 2 }}>
                  <Typography size="base-sm" color="neutral-darken2">
                    james.bassett@haufe.com · {site.docCount} docs available · Last synced just now
                  </Typography>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), flexShrink: 0 }}>
              <ButtonTertiary
                onClick={() => handleSync(site.id)}
                leftIcon={syncingSiteId === site.id ? undefined : iconType.RefreshOutlined}
                disabled={syncingSiteId !== null}
              >
                {syncingSiteId === site.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                    <Spinner size="small" />
                    <span>Syncing…</span>
                  </div>
                ) : 'Sync now'}
              </ButtonTertiary>
              <Dropdown
                items={[
                  {
                    key: 'disconnect',
                    label: <span style={{ color: colorPalette.danger.darken2 }}>Disconnect</span>,
                    onClick: () => handleDisconnect(site.id),
                  },
                ]}
                trigger={dropdownTriggers.CLICK}
                placement={dropdownPlacement.BOTTOM_RIGHT}
              >
                <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
              </Dropdown>
            </div>
          </div>
        ))}

        {/* Add site footer row (when all sites are already connected) */}
        {connectedSites.length > 0 && !SHAREPOINT_SITES.some(s => !connectedSiteIds.includes(s.id)) && (
          <div style={{ padding: `${spacing(3)}px ${spacing(5)}px`, borderTop: '1px solid #f0f0f0', backgroundColor: '#FAFAFA' }}>
            <Typography size="base-sm" color="neutral-darken2">All available SharePoint sites are connected.</Typography>
          </div>
        )}
      </div>

      <ConnectModal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnected={handleConnected}
        alreadyConnectedIds={connectedSiteIds}
      />
    </div>
  )
}
