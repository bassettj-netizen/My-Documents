import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import {
  ButtonGhost,
  buttonShapes,
  ButtonTertiary,
  Icon,
  iconType,
  Spinner,
  toastPlacements,
  Tooltip,
  tooltipPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import {
  colorPalette,
  computeDocSourceMap,
  spacing,
  stripYear,
  useWorkspaceState,
  type MetadataDocument,
} from '../workspaces/shared'

/**
 * File Sync — documents whose source app (SharePoint, OneDrive…) has a newer version.
 * From the "Microsoft Integration – Out of Sync Documents" Figma (node 4885:18969):
 *
 * - A warning banner above the documents: "4 documents have newer versions available from your
 *   connected apps. Sync to update." with Review (show only those documents), Sync and dismiss.
 *   With one left it reads "1 document has a newer version…" and the button says "Sync 1 document".
 * - Out-of-sync documents show a warning in place of the green "Up to date" check.
 * - Sync from the banner, from a document's ⋯ menu, or for a selection from the selection bar.
 *   While it runs a "Syncing documents…" toast (bottom right) shows a spinner; then
 *   "Document sync successful" and/or "Document sync unsuccessful" (bottom left).
 * - One document per space fails its first sync, so the partial-failure state can be seen; trying
 *   again succeeds.
 */

type WorkspaceState = ReturnType<typeof useWorkspaceState>

/** How many documents per space start out of sync. */
const OUT_OF_SYNC_PER_SPACE = 4
const SYNC_DURATION_MS = 2500

const todayIso = () => new Date().toISOString().slice(0, 10)
const syncFileName = (doc: MetadataDocument) => `${stripYear(doc.name)}.${doc.fileFormat.toLowerCase()}`
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

export type SyncStore = {
  isOutOfSync: (id: string) => boolean
  isSyncing: (id: string) => boolean
  /** Synced in this session, so its status reads "synced just now". */
  justSynced: (id: string) => boolean
  /** Out of sync and not already syncing. */
  pending: (docs: MetadataDocument[]) => MetadataDocument[]
  sync: (spaceId: string, docs: MetadataDocument[]) => void
  isDismissed: (spaceId: string) => boolean
  dismiss: (spaceId: string) => void
}

export function useSyncStore(workspace: WorkspaceState): SyncStore {
  const { notification } = useNotifications()

  // The first few connector documents in every space have a newer version in their source app;
  // the last of them fails on its first sync.
  const [seed] = useState(() => {
    const outOfSync = new Set<string>()
    const failOnce = new Set<string>()
    workspace.spaces.forEach(space => {
      const docs = workspace.getSpaceDocs(space.id)
      const sources = computeDocSourceMap(docs, space)
      const connected = docs.filter(d => sources.get(d._id) !== 'local').slice(0, OUT_OF_SYNC_PER_SPACE)
      connected.forEach(d => outOfSync.add(d._id))
      if (connected.length > 1) failOnce.add(connected[connected.length - 1]._id)
    })
    return { outOfSync, failOnce }
  })
  const failOnce = useRef(seed.failOnce)

  const [outOfSync, setOutOfSync] = useState<Set<string>>(seed.outOfSync)
  const [syncing, setSyncing] = useState<Set<string>>(new Set())
  const [synced, setSynced] = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const pending = (docs: MetadataDocument[]) => docs.filter(d => outOfSync.has(d._id) && !syncing.has(d._id))

  const sync = (spaceId: string, docs: MetadataDocument[]) => {
    const targets = pending(docs)
    if (!targets.length) return
    const ids = new Set(targets.map(d => d._id))
    setSyncing(prev => new Set([...prev, ...ids]))

    const one = targets.length === 1
    const key = `file-sync-${Date.now()}`
    notification.default({
      key,
      title: one ? 'Syncing document...' : 'Syncing documents...',
      content: (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <Spinner size="small" />
          <Typography size="base" color="neutral-darken3">{one ? syncFileName(targets[0]) : `${targets.length} documents`}</Typography>
        </div>
      ),
      leadingIcon: false,
      dismissible: false,
      placement: toastPlacements.BOTTOM_RIGHT,
      duration: 0,
    })

    window.setTimeout(() => {
      notification.destroy(key)
      const failed = targets.filter(d => failOnce.current.has(d._id))
      const done = targets.filter(d => !failOnce.current.has(d._id))
      failed.forEach(d => failOnce.current.delete(d._id))
      const doneIds = new Set(done.map(d => d._id))

      setSyncing(prev => new Set([...prev].filter(id => !ids.has(id))))
      setOutOfSync(prev => new Set([...prev].filter(id => !doneIds.has(id))))
      setSynced(prev => new Set([...prev, ...doneIds]))
      // The newer version is now the one here, so it was updated today.
      if (done.length) workspace.updateSpaceDocs(spaceId, all => all.map(d => (doneIds.has(d._id) ? { ...d, uploadedDate: todayIso() } : d)))

      if (done.length) {
        notification.success({
          title: 'Document sync successful',
          content: done.length === 1 ? syncFileName(done[0]) : `${done.length} documents`,
          placement: toastPlacements.BOTTOM_LEFT,
          duration: 4,
        })
      }
      if (failed.length) {
        notification.error({
          title: 'Document sync unsuccessful',
          content: failed.length === 1 ? syncFileName(failed[0]) : `${failed.length} documents`,
          placement: toastPlacements.BOTTOM_LEFT,
          duration: 6,
        })
      }
    }, SYNC_DURATION_MS)
  }

  return {
    isOutOfSync: id => outOfSync.has(id),
    isSyncing: id => syncing.has(id),
    justSynced: id => synced.has(id),
    pending,
    sync,
    isDismissed: spaceId => dismissed.has(spaceId),
    dismiss: spaceId => setDismissed(prev => new Set([...prev, spaceId])),
  }
}

const SyncContext = createContext<SyncStore | null>(null)

/** Shares one sync store with every page of a version, so sync state survives opening a preview. */
export function SyncProvider({ store, children }: { store: SyncStore; children: ReactNode }) {
  return <SyncContext.Provider value={store}>{children}</SyncContext.Provider>
}

export function useSync(): SyncStore {
  const store = useContext(SyncContext)
  if (!store) throw new Error('useSync must be used inside a SyncProvider')
  return store
}

// ─── Banner ───────────────────────────────────────────────────────────────────

/**
 * The warning banner from the Figma's "Toolbar" (warning) — goat-ui's Toolbar only has
 * default/contrast variants, so it's laid out here with goat-ui buttons.
 */
export function SyncBanner({ count, reviewing, onReview, onSync, onDismiss }: {
  count: number
  reviewing: boolean
  onReview: () => void
  onSync: () => void
  onDismiss: () => void
}) {
  const one = count === 1
  return (
    <div
      role="status"
      style={{
        flexShrink: 0, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(4),
        padding: `${spacing(3)}px ${spacing(2)}px ${spacing(3)}px ${spacing(4)}px`,
        backgroundColor: '#feecc8', borderRadius: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), minWidth: 0 }}>
        <Icon type={iconType.AlertFilled} size={20} color="warning-base" />
        <span style={{ fontSize: 14, lineHeight: '20px', color: colorPalette.neutral.darken5 }}>
          <strong style={{ fontWeight: 600 }}>{count} {plural(count, 'document', 'documents')}</strong>
          {one
            ? ' has a newer version available from your connected apps. Sync to update it.'
            : ' have newer versions available from your connected apps. Sync to update.'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(4), flexShrink: 0 }}>
        {!one && (
          <ButtonGhost leftIcon={reviewing ? iconType.EyeSlashOutlined : iconType.EyeOutlined} onClick={onReview}>
            {reviewing ? 'Show all' : 'Review'}
          </ButtonGhost>
        )}
        <ButtonTertiary leftIcon={iconType.RefreshOutlined} onClick={onSync}>{one ? 'Sync 1 document' : 'Sync'}</ButtonTertiary>
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={onDismiss} />
      </div>
    </div>
  )
}

/** Banner state for one space's documents: what's out of sync, the Review filter, and dismissal. */
export function useSpaceSync(sync: SyncStore, spaceId: string, docs: MetadataDocument[], onFilterChange?: () => void) {
  const [reviewing, setReviewingState] = useState(false)
  const setReviewing = (update: boolean | ((r: boolean) => boolean)) => { setReviewingState(update); onFilterChange?.() }
  const pendingDocs = sync.pending(docs)
  const showBanner = pendingDocs.length > 0 && !sync.isDismissed(spaceId)
  // Review shows just the out-of-sync documents; it ends once they're synced.
  const filtering = reviewing && pendingDocs.length > 0
  const visible = (list: MetadataDocument[]) => (filtering ? list.filter(d => sync.isOutOfSync(d._id)) : list)

  const banner = showBanner ? (
    <SyncBanner
      count={pendingDocs.length}
      reviewing={filtering}
      onReview={() => setReviewing(r => !r)}
      onSync={() => { setReviewing(false); sync.sync(spaceId, docs) }}
      onDismiss={() => { setReviewing(false); sync.dismiss(spaceId) }}
    />
  ) : null

  return { banner, visible, filtering }
}

// ─── Status ───────────────────────────────────────────────────────────────────

export const OUT_OF_SYNC_TOOLTIP = 'Newer version available • sync to update'

/** Status text for a document's details: matches the table's Status tooltip. */
export function syncStatusText(sync: SyncStore, id: string, connected: boolean, hours: number): string {
  if (!connected) return 'Up to date'
  if (sync.isSyncing(id)) return 'Syncing…'
  if (sync.isOutOfSync(id)) return 'Newer version available'
  if (sync.justSynced(id)) return 'Up to date • Synced just now'
  return `Up to date • Synced ${hours} hour${hours === 1 ? '' : 's'} ago`
}

/**
 * The Status cell: a spinner while syncing, a warning when a newer version is waiting, otherwise
 * the green check (unless `onlyIssues`, for layouts that don't show an "all good" mark).
 */
export function SyncStatusIcon({ sync, id, connected, hours, onlyIssues = false, size = 20 }: {
  sync: SyncStore
  id: string
  connected: boolean
  hours: number
  onlyIssues?: boolean
  size?: 16 | 20
}): ReactNode {
  const wrapper = (title: string, icon: ReactNode) => (
    <Tooltip title={title} placement={tooltipPlacements.TOP}>
      <div style={{ display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
    </Tooltip>
  )
  if (connected && sync.isSyncing(id)) return wrapper('Syncing…', <Spinner size="small" />)
  if (connected && sync.isOutOfSync(id)) return wrapper(OUT_OF_SYNC_TOOLTIP, <Icon type={iconType.AlertFilled} size={size} color="warning-base" />)
  if (onlyIssues) return null
  const title = !connected ? 'Up to date'
    : sync.justSynced(id) ? 'Up to date • synced just now'
    : `Up to date • synced ${hours} hour${hours === 1 ? '' : 's'} ago`
  return wrapper(title, <Icon type={iconType.CheckCircleFilled} size={size} color="success-base" />)
}

/** The "Sync" entry for a document's ⋯ menu. */
export const syncMenuItem = (onClick: () => void) => ({
  key: 'sync',
  label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.RefreshOutlined} size={16} />Sync</span>,
  onClick,
})

/** The Status line in a document's details: icon and text, matching the list's status. */
export function SyncStatusDetail({ id, connected, hours }: { id: string; connected: boolean; hours: number }) {
  const sync = useSync()
  const icon = connected && sync.isSyncing(id) ? <Spinner size="small" />
    : connected && sync.isOutOfSync(id) ? <Icon type={iconType.AlertFilled} size={16} color="warning-base" />
    : <Icon type={iconType.CheckCircleFilled} size={16} color="success-base" />
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(1) }}>
      {icon}
      {syncStatusText(sync, id, connected, hours)}
    </span>
  )
}
