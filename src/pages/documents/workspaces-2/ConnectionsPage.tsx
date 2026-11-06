/**
 * Hackathon Oct '26 — Connectors for Version 4: the shared Connectors page laid out like the rest of
 * Version 4 (and Version 5's German Konnektoren page) — the page on neutral-lighten5, the connector types in a white container on the
 * left, and the selected type's accounts (or its set-up prompt) in a white container on the right.
 */
import { useState } from 'react'
import {
  Banner,
  bannerStyles,
  bannerVariants,
  ButtonGhost,
  buttonShapes,
  ButtonSecondary,
  ButtonPrimary,
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
import { CONNECTOR_TYPE, CONNECTORS, initialAccountsFor, isSpaceAccount, PERSONIO, type ConnectedAccount, type ConnectorDef, type ListedConnectorDef, type ListedConnectorId } from './connectorDefs'
import { useConnections } from '../../../contexts/ConnectionsContext'

const { colorPalette, spacing, fontWeight } = constants

type FieldKey = 'clientId' | 'tenantId' | 'domain' | 'clientSecret'

// ─── Set Up Connector modal ────────────────────────────────────────────────────

export function SetUpConnectorModal({ visible, connector, onClose, onVerified }: {
  visible: boolean
  connector: Pick<ConnectorDef, 'name' | 'shortName'>
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

// White containers on the tinted page — the same treatment as Version 4's cards.
const PANEL = { backgroundColor: colorPalette.white, border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 12 } as const


// `background`: the page's background (Workspaces 2.0 Version 2 uses white).
// `startEmpty`: leave out the workspaces' accounts, for a first-run state (Workspaces 2.0 Version 11).
// `plain`: laid out like Metadata Table's Connectors page (projects/metadata/table/connectors) — no containers: the
// connector types as a plain list, a full-height divider, and the accounts as plain rows — with the Workspaces
// list's margins (24px all round, 24px under the header) and description, and Add connector as a primary button
// (Workspaces 2.0 Version 15).
// `showCount` (Workspaces 2.0 Version 21): "Connectors · 3" in the heading — every connected account, across the connector types.
// `compactMenu` (Version 21, with plain): the connector list as in Workspaces 2.0 Version 18 — a narrow column of 40px rows
// with each type's account count, a lighter divider, and "Active Connectors" for the accounts. It also lists Personio (not
// connected — nothing is seeded for it) and puts the connector types in alphabetical order (Versions 19 and 21).
export default function ConnectionsPageV10({ background = colorPalette.neutral.lighten5, startEmpty = false, plain = false, showCount = false, compactMenu = false }: { background?: string; startEmpty?: boolean; plain?: boolean; showCount?: boolean; compactMenu?: boolean } = {}) {
  const connectors: ListedConnectorDef[] = compactMenu
    ? [...CONNECTORS, PERSONIO].sort((a, b) => a.name.localeCompare(b.name))
    : CONNECTORS
  const [selectedId, setSelectedId] = useState<ListedConnectorId>('microsoft-365')
  // Accounts manually added via "Set up connector" / "Add connector" — accounts
  // seeded from real workspace connectors (below) aren't stored here, since
  // their connected/disconnected status lives in ConnectionsContext instead.
  const [manualAccounts, setManualAccounts] = useState<Record<ListedConnectorId, ConnectedAccount[]>>({
    'microsoft-365': [],
    'google-drive': [],
    'datev': [],
    'personio': [],
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingDisconnect, setPendingDisconnect] = useState<ConnectedAccount | null>(null)
  const { notification } = useNotifications()
  const { isWorkspaceConnectorDisconnected, disconnectWorkspaceConnector } = useConnections()

  const selected = connectors.find(c => c.id === selectedId)!
  // Accounts from the workspaces' connectors — none for Personio, which has no workspace connector type.
  const seededFor = (id: ListedConnectorId) => id === 'personio' || startEmpty ? [] : initialAccountsFor(id).filter(a => !isWorkspaceConnectorDisconnected(a.id, CONNECTOR_TYPE[id]))
  const accountsFor = (id: ListedConnectorId) => [...seededFor(id), ...manualAccounts[id]]
  const accounts = accountsFor(selectedId)
  const totalAccounts = connectors.reduce((n, c) => n + accountsFor(c.id).length, 0)

  const handleVerified = (account: Omit<ConnectedAccount, 'id'>) => {
    setManualAccounts(prev => ({ ...prev, [selectedId]: [...prev[selectedId], { id: `manual-${Date.now()}`, ...account }] }))
    setModalOpen(false)
    notification.success({ title: 'Connection Successful', content: selected.name, placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
  }

  const handleConfirmDisconnect = () => {
    if (!pendingDisconnect) return
    if (selectedId !== 'personio' && isSpaceAccount(pendingDisconnect.id)) {
      disconnectWorkspaceConnector(pendingDisconnect.id, CONNECTOR_TYPE[selectedId])
    } else {
      setManualAccounts(prev => ({ ...prev, [selectedId]: prev[selectedId].filter(a => a.id !== pendingDisconnect.id) }))
    }
    notification.default({ title: `Disconnected from ${selected.name}`, placement: toastPlacements.BOTTOM_LEFT, duration: 3 })
    setPendingDisconnect(null)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: background }}>
      {/* Same margins and description size as the Workspaces list. */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(1), padding: `${spacing(6)}px ${spacing(6)}px 0` }}>
        <Typography size="heading-lg" weight={fontWeight.BOLD}>{showCount && totalAccounts > 0 ? `Connectors · ${totalAccounts}` : 'Connectors'}</Typography>
        <Typography size="base" color="neutral-darken2">
          Manage external apps connected to workspaces. Changes here will affect anyone who has access to these workspaces.
        </Typography>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', alignItems: plain ? 'stretch' : 'flex-start', gap: compactMenu ? spacing(6) : spacing(4), padding: spacing(6) }}>
        {compactMenu && <style>{`
          .v21-connector { display: flex; align-items: center; gap: ${spacing(3)}px; height: 40px; padding: 0 ${spacing(3)}px; border-radius: 8px; cursor: pointer; font-size: 14px; color: ${colorPalette.neutral.darken5}; }
          .v21-connector:hover { background-color: ${colorPalette.neutral.lighten5}; }
          .v21-connector.is-selected { background-color: ${colorPalette.neutral.lighten4}; font-weight: 600; }
        `}</style>}
        {/* Connector types, in their own white container like a sub-menu (plain: just the list). */}
        {compactMenu ? (
          <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
            {connectors.map(connector => (
              <div
                key={connector.id}
                className={`v21-connector${connector.id === selectedId ? ' is-selected' : ''}`}
                onClick={() => setSelectedId(connector.id)}
              >
                <span style={{ display: 'inline-flex', flexShrink: 0 }}>{connector.icon(20)}</span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{connector.name}</span>
                <span style={{ fontSize: 13, fontWeight: 400, color: colorPalette.neutral.darken2 }}>{accountsFor(connector.id).length}</span>
              </div>
            ))}
          </div>
        ) : (
        <div style={plain
          ? { width: 450, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }
          : { ...PANEL, width: 300, flexShrink: 0, padding: spacing(2), display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
          {!plain && (
            <div style={{ padding: `${spacing(2)}px ${spacing(3)}px` }}>
              <Typography size="base-sm" color="neutral-darken2" weight={fontWeight.SEMIBOLD}>Connector types</Typography>
            </div>
          )}
          {connectors.map(connector => {
            const isSelected = connector.id === selectedId
            return (
              <div
                key={connector.id}
                onClick={() => setSelectedId(connector.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: spacing(3),
                  padding: plain ? spacing(4) : `${spacing(3)}px ${spacing(3)}px`, borderRadius: plain ? 8 : 6, cursor: 'pointer',
                  backgroundColor: isSelected ? colorPalette.neutral.lighten4 : undefined,
                }}
              >
                {connector.icon(20)}
                <span style={{ flex: 1 }}>
                  <Typography size="base" color="neutral-darken5" weight={isSelected ? fontWeight.SEMIBOLD : undefined}>
                    {connector.name}
                  </Typography>
                </span>
                {!plain && <Icon type={iconType.ChevronRightOutlined} size={16} color={isSelected ? 'neutral-darken4' : 'neutral-lighten1'} />}
              </div>
            )
          })}
        </div>
        )}

        {plain && <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: compactMenu ? colorPalette.neutral.lighten2 : colorPalette.neutral.lighten1 }} />}

        {/* The selected type: its connected accounts, or how to set it up. */}
        <div style={plain
          ? { flex: 1, minWidth: 0, paddingTop: spacing(1), display: 'flex', flexDirection: 'column' }
          : { ...PANEL, flex: 1, minWidth: 0, padding: spacing(6), display: 'flex', flexDirection: 'column' }}>
          {/* compactMenu: as tall as the Add connector button even without it (a type with no accounts, e.g. Personio),
              so the heading doesn't shift when moving between types. */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(3), minHeight: compactMenu ? 32 : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
              {selected.icon(24)}
              <Typography size="base-lg" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{selected.name}</Typography>
            </div>
            {/* Version 21 (compactMenu) also has it here, on the connector type's heading row. */}
            {accounts.length > 0 && (plain ? (
              <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={() => setModalOpen(true)}>Add connector</ButtonPrimary>
            ) : (
              <ButtonTertiary leftIcon={iconType.PlusOutlined} onClick={() => setModalOpen(true)}>
                Add connector
              </ButtonTertiary>
            ))}
          </div>

          {accounts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3), marginTop: plain ? spacing(4) : spacing(5) }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(3) }}>
                <Typography size="base-sm" color="neutral-darken2" weight={fontWeight.SEMIBOLD}>
                  {/* Version 21 calls them active connectors. */}
                  {compactMenu
                    ? (accounts.length === 1 ? 'Active Connector' : 'Active Connectors')
                    : (accounts.length === 1 ? 'Connected Account' : 'Connected Accounts')}
                </Typography>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', ...(plain ? {} : { border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 8 }) }}>
                {accounts.map((account, i) => (
                  <div key={account.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(3), padding: `${spacing(3)}px ${spacing(4)}px`, borderTop: i && !plain ? `1px solid ${colorPalette.neutral.lighten3}` : undefined }}>
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
          ) : (
            <div style={{ minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing(4) }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{selected.icon(40)}</div>
              <Typography size="base" color="neutral-darken3" align="center">
                <span style={{ display: 'block', maxWidth: 340 }}>
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

      {/* Remounted on each open so the form always starts empty. */}
      <SetUpConnectorModal
        key={modalOpen ? 'open' : 'closed'}
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
