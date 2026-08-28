import { useEffect, useState, type ReactNode } from 'react'
import {
  Banner,
  bannerStyles,
  bannerVariants,
  ButtonGhost,
  buttonShapes,
  ButtonSecondary,
  ButtonTertiary,
  buttonVariants,
  constants,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  Icon,
  iconType,
  Input,
  inputTypes,
  Modal,
  modalVariants,
  Spinner,
  toastPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { INITIAL_SPACES, type ConnectorType } from '../documents/workspaces/shared'
import { useConnections } from '../../contexts/ConnectionsContext'

const { colorPalette, spacing, fontWeight } = constants

// ─── Icons ───────────────────────────────────────────────────────────────────

function MicrosoftIcon({ size = 20 }: { size?: number }) {
  const gap = size * 0.05
  const half = (size - gap) / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width={half} height={half} fill="#F25022" />
      <rect x={half + gap} y="0" width={half} height={half} fill="#7FBA00" />
      <rect x="0" y={half + gap} width={half} height={half} fill="#00A4EF" />
      <rect x={half + gap} y={half + gap} width={half} height={half} fill="#FFB900" />
    </svg>
  )
}

// Same glyph used for the Workspaces "Add Documents" Google Drive source icon
// (pages/documents/workspaces/shared.tsx) — kept in sync for a consistent mark app-wide.
function GoogleDriveIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 -13.5 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.3542312,196.033928 L30.644172,215.534816 C32.9900287,219.64014 36.3622164,222.86588 40.3210929,225.211737 C51.6602421,210.818376 59.5534225,199.772864 64.000634,192.075201 C68.5137119,184.263529 74.0609657,172.045039 80.6423954,155.41973 C62.9064315,153.085282 49.4659974,151.918058 40.3210929,151.918058 C31.545465,151.918058 18.1051007,153.085282 0,155.41973 C0,159.964996 1.17298825,164.510261 3.51893479,168.615586 L19.3542312,196.033928 Z" fill="#0066DA"/>
      <path d="M215.681443,225.211737 C219.64032,222.86588 223.012507,219.64014 225.358364,215.534816 L230.050377,207.470615 L252.483511,168.615586 C254.829368,164.510261 256.002446,159.964996 256.002446,155.41973 C237.79254,153.085282 224.376613,151.918058 215.754667,151.918058 C206.488712,151.918058 193.072785,153.085282 175.506888,155.41973 C182.010479,172.136093 187.484394,184.354584 191.928633,192.075201 C196.412073,199.863919 204.329677,210.909431 215.681443,225.211737 Z" fill="#EA4335"/>
      <path d="M128.001268,73.3111515 C141.121182,57.4655263 150.162898,45.2470011 155.126415,36.6555757 C159.123121,29.7376196 163.521739,18.6920726 168.322271,3.51893479 C164.363395,1.1729583 159.818129,0 155.126415,0 L100.876121,0 C96.1841079,0 91.638842,1.31958557 87.6799655,3.51893479 C93.7861943,20.9210065 98.9675428,33.3058067 103.224011,40.6733354 C107.927832,48.8151881 116.186918,59.6944602 128.001268,73.3111515 Z" fill="#00832D"/>
      <path d="M175.360141,155.41973 L80.6420959,155.41973 L40.3210929,225.211737 C44.2799694,227.557893 48.8252352,228.730672 53.5172481,228.730672 L202.485288,228.730672 C207.177301,228.730672 211.722567,227.411146 215.681443,225.211737 L175.360141,155.41973 Z" fill="#2684FC"/>
      <path d="M128.001268,73.3111515 L87.680265,3.51893479 C83.7213885,5.86488134 80.3489013,9.09044179 78.0030446,13.1960654 L3.51893479,142.223575 C1.17298825,146.329198 0,150.874464 0,155.41973 L80.6423954,155.41973 L128.001268,73.3111515 Z" fill="#00AC47"/>
      <path d="M215.241501,77.7099697 L177.999492,13.1960654 C175.653635,9.09044179 172.281148,5.86488134 168.322271,3.51893479 L128.001268,73.3111515 L175.360141,155.41973 L255.855999,155.41973 C255.855999,150.874464 254.682921,146.329198 252.337064,142.223575 L215.241501,77.7099697 Z" fill="#FFBA00"/>
    </svg>
  )
}

// Same asset used for the Workspaces "Add Documents" Datev source icon
// (pages/documents/workspaces/shared.tsx) — kept in sync for a consistent mark app-wide.
const DATEV_ICON_BASE64 = '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'
const DATEV_ICON_SRC = `data:image/png;base64,${DATEV_ICON_BASE64}`

function DatevIcon({ size = 20 }: { size?: number }) {
  return <img src={DATEV_ICON_SRC} alt="" width={size} height={size} style={{ objectFit: 'contain' }} />
}

// ─── Connector definitions ─────────────────────────────────────────────────────

type ConnectorId = 'microsoft-365' | 'google-drive' | 'datev'

type ConnectorDef = {
  id: ConnectorId
  name: string
  shortName: string
  icon: (size: number) => ReactNode
}

const CONNECTORS: ConnectorDef[] = [
  { id: 'microsoft-365', name: 'Microsoft Office 365', shortName: 'Microsoft', icon: size => <MicrosoftIcon size={size} /> },
  { id: 'google-drive', name: 'Google Drive', shortName: 'Google', icon: size => <GoogleDriveIcon size={size} /> },
  { id: 'datev', name: 'Datev', shortName: 'Datev', icon: size => <DatevIcon size={size} /> },
]

// Microsoft 365 is the SharePoint connector type under the hood — every other
// connector id maps 1:1 onto its workspace ConnectorType.
const CONNECTOR_TYPE: Record<ConnectorId, ConnectorType> = {
  'microsoft-365': 'sharepoint',
  'google-drive': 'google-drive',
  'datev': 'datev',
}

type ConnectedAccount = { id: string; name: string; domain: string }

type FieldKey = 'clientId' | 'tenantId' | 'domain' | 'clientSecret'

// Workspaces already have real connectors set up (pages/documents/workspaces/shared.tsx
// is the source of truth) — surface those same accounts here rather than starting empty,
// so this page reflects what's actually connected across the app's workspaces.
function initialAccountsFor(connectorId: ConnectorId): ConnectedAccount[] {
  const type = CONNECTOR_TYPE[connectorId]
  return INITIAL_SPACES
    .filter(space => space.connectors.some(c => c.type === type))
    .map(space => ({
      id: space.id,
      name: space.name,
      domain: space.connectors.find(c => c.type === type)!.label,
    }))
}

// ─── Set Up Connector modal ────────────────────────────────────────────────────

function SetUpConnectorModal({ visible, connector, onClose, onVerified }: {
  visible: boolean
  connector: ConnectorDef
  onClose: () => void
  onVerified: (account: Omit<ConnectedAccount, 'id'>) => void
}) {
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [domain, setDomain] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [bannerError, setBannerError] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (visible) return
    setName(''); setClientId(''); setTenantId(''); setDomain(''); setClientSecret('')
    setFieldErrors({}); setBannerError(false); setVerifying(false)
  }, [visible])

  const canVerify = [name, clientId, tenantId, domain, clientSecret].every(v => v.trim() !== '')

  // No real backend to verify against, so the outcome is driven by the Client
  // Secret text itself — lets anyone reproduce every state this modal designs
  // for: include "invalid" for field-level errors, "error" for the banner,
  // anything else for a successful connection.
  const handleVerify = () => {
    if (!canVerify || verifying) return
    setVerifying(true)
    setBannerError(false)
    setFieldErrors({})
    setTimeout(() => {
      setVerifying(false)
      const secretLower = clientSecret.toLowerCase()
      if (secretLower.includes('invalid')) {
        setFieldErrors({
          clientId: 'Client ID not recognised',
          tenantId: 'Tenant ID not recognised',
          domain: 'Domain not recognised',
          clientSecret: 'Client Secret not recognised',
        })
      } else if (secretLower.includes('error')) {
        setBannerError(true)
      } else {
        onVerified({ name: name.trim(), domain: domain.trim() })
      }
    }, 900)
  }

  return (
    <Modal
      visible={visible}
      title="Set Up Connector"
      onClose={onClose}
      withIcon={false}
      maxWidth={600}
      minWidth={600}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
        {
          variant: buttonVariants.PRIMARY,
          props: {
            children: verifying ? <Spinner size="small" /> : 'Verify',
            disabled: !canVerify || verifying,
            onClick: handleVerify,
          },
        },
      ] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        {bannerError && (
          <Banner
            variant={bannerVariants.DANGER}
            bannerStyle={bannerStyles.SUBTLE}
            dismissible={false}
            header={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>Connection Unsuccessful</Typography>
                <Typography size="base-sm" color="neutral-darken2">{connector.name}</Typography>
              </div>
            }
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
          <Icon type={iconType.HelpCircleOutlined} size={16} color="neutral-darken5" />
          <Typography size="base-sm" color="neutral-darken2">
            For guidance follow the{' '}
            <span
              style={{ color: colorPalette.blue.base, textDecoration: 'underline', cursor: 'pointer' }}
            >
              {connector.shortName} connector instructions
            </span>
          </Typography>
          <Icon type={iconType.ExternalLinkOutlined} size={12} color="neutral-darken2" />
        </div>

        <Input name="connector-name" label="Connector Name" isRequired placeholder="Add connector name" value={name} onChange={e => setName(e.target.value)} />
        <Input name="client-id" label="Client ID" isRequired placeholder="Add client ID" value={clientId} onChange={e => setClientId(e.target.value)} error={fieldErrors.clientId} />
        <Input name="tenant-id" label="Tenant ID" isRequired placeholder="Add tenant ID" value={tenantId} onChange={e => setTenantId(e.target.value)} error={fieldErrors.tenantId} />
        <Input name="domain" label="Domain" isRequired placeholder="Add domain" value={domain} onChange={e => setDomain(e.target.value)} error={fieldErrors.domain} />
        <Input
          name="client-secret"
          label="Client Secret"
          isRequired
          type={inputTypes.PASSWORD}
          placeholder="Add client secret"
          value={clientSecret}
          onChange={e => setClientSecret(e.target.value)}
          error={fieldErrors.clientSecret}
          helper="For security reasons you won't be able to view the client secret again once saved. Ensure you securely store it in a safe place."
        />
      </div>
    </Modal>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function isSpaceAccount(accountId: string) {
  return INITIAL_SPACES.some(space => space.id === accountId)
}

export default function ConnectionsPage() {
  const [selectedId, setSelectedId] = useState<ConnectorId>('microsoft-365')
  // Accounts manually added via "Set up connector" / "Add connector" — accounts
  // seeded from real workspace connectors (below) aren't stored here, since
  // their connected/disconnected status lives in ConnectionsContext instead.
  const [manualAccounts, setManualAccounts] = useState<Record<ConnectorId, ConnectedAccount[]>>({
    'microsoft-365': [],
    'google-drive': [],
    'datev': [],
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingDisconnect, setPendingDisconnect] = useState<ConnectedAccount | null>(null)
  const { notification } = useNotifications()
  const { isWorkspaceConnectorDisconnected, disconnectWorkspaceConnector } = useConnections()

  const selected = CONNECTORS.find(c => c.id === selectedId)!
  const connectorType = CONNECTOR_TYPE[selectedId]
  const seededAccounts = initialAccountsFor(selectedId).filter(a => !isWorkspaceConnectorDisconnected(a.id, connectorType))
  const accounts = [...seededAccounts, ...manualAccounts[selectedId]]

  const handleVerified = (account: Omit<ConnectedAccount, 'id'>) => {
    setManualAccounts(prev => ({ ...prev, [selectedId]: [...prev[selectedId], { id: `manual-${Date.now()}`, ...account }] }))
    setModalOpen(false)
    notification.success({ title: 'Connection Successful', content: selected.name, placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
  }

  const handleConfirmDisconnect = () => {
    if (!pendingDisconnect) return
    if (isSpaceAccount(pendingDisconnect.id)) {
      disconnectWorkspaceConnector(pendingDisconnect.id, connectorType)
    } else {
      setManualAccounts(prev => ({ ...prev, [selectedId]: prev[selectedId].filter(a => a.id !== pendingDisconnect.id) }))
    }
    notification.default({ title: `Disconnected from ${selected.name}`, placement: toastPlacements.BOTTOM_LEFT, duration: 3 })
    setPendingDisconnect(null)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: colorPalette.white }}>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(1), padding: `${spacing(6)}px ${spacing(10)}px 0` }}>
        <Typography size="heading-lg" weight={fontWeight.BOLD}>Connectors</Typography>
        <Typography size="base-sm" color="neutral-darken2">
          Manage external apps connected to document spaces. Changes here will affect anyone who has access to these spaces.
        </Typography>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', gap: spacing(4), padding: `${spacing(4)}px ${spacing(10)}px ${spacing(6)}px` }}>
        <div style={{ width: 450, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          {CONNECTORS.map(connector => {
            const isSelected = connector.id === selectedId
            return (
              <div
                key={connector.id}
                onClick={() => setSelectedId(connector.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: spacing(3),
                  padding: spacing(4), borderRadius: 8, cursor: 'pointer',
                  backgroundColor: isSelected ? colorPalette.neutral.lighten4 : colorPalette.white,
                }}
              >
                {connector.icon(20)}
                <Typography size="base" color="neutral-darken5" weight={isSelected ? fontWeight.SEMIBOLD : undefined}>
                  {connector.name}
                </Typography>
              </div>
            )
          })}
        </div>

        <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: colorPalette.neutral.lighten1 }} />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {accounts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4), paddingTop: spacing(1) }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(3) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
                  {selected.icon(24)}
                  <Typography size="base-lg" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{selected.name}</Typography>
                </div>
                <ButtonTertiary leftIcon={iconType.PlusOutlined} onClick={() => setModalOpen(true)}>
                  Add connector
                </ButtonTertiary>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
                <Typography size="base-sm" color="neutral-darken2" weight={fontWeight.SEMIBOLD}>
                  Connected Account{accounts.length !== 1 ? 's' : ''}
                </Typography>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {accounts.map(account => (
                    <div key={account.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(3), padding: `${spacing(3)}px ${spacing(4)}px` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), minWidth: 0 }}>
                        {selected.icon(24)}
                        <div style={{ minWidth: 0 }}>
                          <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{account.name}</Typography>
                          <Typography size="base-sm" color="neutral-darken2">{account.domain}</Typography>
                        </div>
                      </div>
                      <Dropdown
                        items={[
                          { key: 'disconnect', label: <span style={{ color: colorPalette.danger.darken2 }}>Disconnect</span>, onClick: () => setPendingDisconnect(account) },
                        ]}
                        trigger={dropdownTriggers.CLICK}
                        placement={dropdownPlacement.BOTTOM_RIGHT}
                      >
                        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
                      </Dropdown>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing(4) }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{selected.icon(40)}</div>
              <Typography size="base" color="neutral-darken3" align="center">
                <span style={{ display: 'block', maxWidth: 320 }}>
                  In order to connect to {selected.shortName}, you need to set up a connector.
                </span>
              </Typography>
              <ButtonSecondary leftIcon={iconType.GearOutlined} onClick={() => setModalOpen(true)}>
                Set up connector
              </ButtonSecondary>
            </div>
          )}
        </div>
    </div>

      <SetUpConnectorModal
        visible={modalOpen}
        connector={selected}
        onClose={() => setModalOpen(false)}
        onVerified={handleVerified}
      />

      <Modal
        visible={pendingDisconnect !== null}
        variant={modalVariants.DANGER}
        title="Disconnect Account"
        onClose={() => setPendingDisconnect(null)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: () => setPendingDisconnect(null) } },
          { variant: buttonVariants.DANGER, props: { children: 'Disconnect', onClick: handleConfirmDisconnect } },
        ] }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          <Typography size="base" color="neutral-darken5">
            You are about to <strong>DISCONNECT</strong> from {pendingDisconnect?.name}
          </Typography>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(2) }}>
            <Icon type={iconType.InfoCircleOutlined} size={16} color="neutral-darken2" />
            <Typography size="base-sm" color="neutral-darken2">
              The connection to this account will no longer be available. This will affect all members of the workspace.
            </Typography>
          </div>
        </div>
      </Modal>
    </div>
  )
}
