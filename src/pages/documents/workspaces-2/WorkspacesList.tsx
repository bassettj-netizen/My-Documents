import { Fragment, useMemo, useState, type ReactNode } from 'react'
import {
  Avatar,
  avatarShapeEnum,
  avatarSizeEnum,
  ButtonGhost,
  ButtonSecondary,
  buttonShapes,
  buttonSizes,
  buttonVariants,
  Chip,
  chipSizes,
  chipStyles,
  chipVariants,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  Icon,
  iconType,
  Modal,
  modalVariants,
  SearchBar,
  searchbarWidth,
  Tabs,
  Typography,
} from '@goat-ui/goat-ui-core'
import {
  colorPalette,
  computeDocSourceMap,
  fontWeight,
  getInitials,
  SpaceFormModal,
  sourceIcon,
  spaceConnectorLabel,
  spacing,
  VisibilityIcon,
  type DocSource,
  type MetadataDocument,
  type Space,
  type SpaceFormValues,
} from '../workspaces/shared'

/**
 * Workspaces 2.0 Version 2 — the Workspaces list as compact cards (Figma "B · Compact cards", 30:8017).
 *
 * - Tabs filter by type (All, Clients, Projects, Internal) and by Private, with counts; "Recently used"
 *   sorts, and the search matches name and description.
 * - Each card: the workspace's initials, name and access icon, its type as a neutral chip and the row
 *   menu (edit, delete) on a filled three-dot button; two lines of description; then a divider and a
 *   footer with where it's been used, the document count and the document sources.
 */

type Filter = 'all' | 'Client' | 'Project' | 'Internal' | 'private'
type Sort = 'recent' | 'name' | 'documents'

const SORT_LABELS: Record<Sort, string> = { recent: 'Recently used', name: 'Name', documents: 'Most documents' }

function WorkspaceCard({ space, docs, usedIn, onOpen, onEdit, onDelete }: {
  space: Space
  docs: MetadataDocument[]
  usedIn?: ReactNode
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)
  // Every source among the workspace's documents, connected apps first and uploads last.
  const sources = useMemo(() => {
    const present = new Set(computeDocSourceMap(docs, space).values())
    const order: DocSource[] = [...space.connectors.map(c => c.type), 'local']
    return [...new Set(order)].filter(s => present.has(s))
  }, [docs, space])

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: 190, display: 'flex', flexDirection: 'column', gap: spacing(3), padding: `${spacing(5)}px ${spacing(5)}px ${spacing(4)}px`,
        border: `1px solid ${hovered ? colorPalette.blue.base : colorPalette.neutral.lighten2}`, borderRadius: 12,
        backgroundColor: colorPalette.white, cursor: 'pointer', transition: 'border-color 0.15s', minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
        <Avatar shape={avatarShapeEnum.SQUARE} size={avatarSizeEnum.SMALL} src={space.avatarUrl} srcPlaceholder={getInitials(space.name)} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: '100%' }}>
            <Typography size="heading-sm" weight={fontWeight.SEMIBOLD} color="neutral-darken5" maxLines={1}>{space.name}</Typography>
            <VisibilityIcon space={space} organisationAccess />
          </div>
          {space.type && <Chip label={space.type} size={chipSizes.SMALL} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} uppercase={false} />}
        </div>
        <div onClick={e => e.stopPropagation()}>
          <Dropdown
            items={[
              { key: 'edit', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.GearOutlined} size={16} />Edit settings</span>, onClick: onEdit },
              { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: onDelete },
            ]}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonGhost shape={buttonShapes.SQUARE} size={buttonSizes.SMALL} leftIcon={iconType.ThreeDotsHorFilled} ariaLabel="Workspace actions" />
          </Dropdown>
        </div>
      </div>
      <Typography size="base" color="neutral-darken3" maxLines={2}>{space.description}</Typography>
      <div style={{ flex: 1 }} />
      <div style={{ height: 1, backgroundColor: colorPalette.neutral.lighten3 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
        {usedIn}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: colorPalette.neutral.darken3 }}>{docs.length}</span>
        {sources.length > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {sources.map(source => <span key={source} style={{ display: 'inline-flex' }}>{sourceIcon(source, 16, source !== 'local' ? spaceConnectorLabel(space, source) : undefined)}</span>)}
          </span>
        )}
      </div>
    </div>
  )
}

export default function WorkspacesList({ spaces, getSpaceDocs, getLastUsed, renderUsedIn, renderCard, minCardWidth = 320, onOpenSpace, onCreateSpace, onUpdateSpace, onDeleteSpace, description, renderEmptyState }: {
  spaces: Space[]
  getSpaceDocs: (id: string) => MetadataDocument[]
  // When the workspace was last used (a chat or Haufe document made in it), for "Recently used".
  getLastUsed: (id: string) => number
  // Where the workspace has been used, for the card footer.
  renderUsedIn: (space: Space) => ReactNode
  // A different card for each workspace (Version 3 uses Version 1's); gets the open, edit and delete actions.
  renderCard?: (space: Space, actions: { onOpen: () => void; onEdit: () => void; onDelete: () => void }) => ReactNode
  // The narrowest a card may get before the grid drops a column.
  minCardWidth?: number
  onOpenSpace: (id: string) => void
  onCreateSpace: (values: SpaceFormValues) => void
  onUpdateSpace: (id: string, values: SpaceFormValues) => void
  onDeleteSpace: (id: string) => void
  description?: ReactNode
  // Replaces the list when there are no workspaces; gets a callback that opens the create dialog.
  renderEmptyState: (openCreate: () => void) => ReactNode
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('recent')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const editTarget = spaces.find(s => s.id === editId) ?? null
  const deleteTarget = spaces.find(s => s.id === deleteId) ?? null

  const matches = (space: Space, f: Filter) => f === 'all' || (f === 'private' ? space.visibility === 'private' : space.type === f)
  const count = (f: Filter) => spaces.filter(s => matches(s, f)).length
  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: `All (${count('all')})` },
    { key: 'Client', label: `Clients (${count('Client')})` },
    { key: 'Project', label: `Projects (${count('Project')})` },
    { key: 'Internal', label: `Internal (${count('Internal')})` },
    { key: 'private', label: `Private (${count('private')})` },
  ]

  const query = search.trim().toLowerCase()
  const shown = spaces
    .filter(s => matches(s, filter))
    .filter(s => !query || s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query))
    .sort((a, b) =>
      sort === 'name' ? a.name.localeCompare(b.name)
        : sort === 'documents' ? getSpaceDocs(b.id).length - getSpaceDocs(a.id).length
          : getLastUsed(b.id) - getLastUsed(a.id))

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: spacing(6), backgroundColor: colorPalette.white, minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing(6) }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1), minWidth: 0 }}>
          <Typography size="heading-lg" weight="bold">Workspaces</Typography>
          {description && <Typography size="base" color="neutral-darken2">{description}</Typography>}
        </div>
        <ButtonSecondary leftIcon={iconType.PlusOutlined} onClick={() => setCreateOpen(true)}>Workspace</ButtonSecondary>
      </div>

      {spaces.length === 0 ? renderEmptyState(() => setCreateOpen(true)) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
            <Tabs options={tabs.map(t => ({ key: t.key, label: t.label, content: null }))} activeKey={filter} onChange={key => setFilter(key as Filter)} />
            <div style={{ flex: 1 }} />
            <Dropdown
              items={(Object.keys(SORT_LABELS) as Sort[]).map(key => ({ key, label: SORT_LABELS[key], onClick: () => setSort(key) }))}
              trigger={dropdownTriggers.CLICK}
              placement={dropdownPlacement.BOTTOM_RIGHT}
            >
              <ButtonGhost rightIcon={iconType.ChevronDownOutlined}>{SORT_LABELS[sort]}</ButtonGhost>
            </Dropdown>
            <div style={{ width: 300 }}>
              <SearchBar placeholder="Search workspaces" value={search} onChange={setSearch} width={searchbarWidth.EXPANDED} />
            </div>
          </div>

          {shown.length === 0 ? (
            <Typography size="base" color="neutral-darken2">No workspaces match.</Typography>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`, gap: spacing(5) }}>
              {shown.map(space => renderCard ? (
                <Fragment key={space.id}>{renderCard(space, { onOpen: () => onOpenSpace(space.id), onEdit: () => setEditId(space.id), onDelete: () => setDeleteId(space.id) })}</Fragment>
              ) : (
                <WorkspaceCard
                  key={space.id}
                  space={space}
                  docs={getSpaceDocs(space.id)}
                  usedIn={renderUsedIn(space)}
                  onOpen={() => onOpenSpace(space.id)}
                  onEdit={() => setEditId(space.id)}
                  onDelete={() => setDeleteId(space.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <SpaceFormModal
        open={createOpen}
        mode="create"
        noun="Workspace"
        showPhotoUpload={false}
        showType={false}
        organisationAccess
        onClose={() => setCreateOpen(false)}
        onSubmit={values => { onCreateSpace(values); setCreateOpen(false) }}
      />
      <SpaceFormModal
        open={!!editTarget}
        mode="edit"
        noun="Workspace"
        initialValues={editTarget ?? undefined}
        showPhotoUpload={false}
        showType={false}
        organisationAccess
        onClose={() => setEditId(null)}
        onSubmit={values => { if (editTarget) onUpdateSpace(editTarget.id, values); setEditId(null) }}
      />
      <Modal
        visible={!!deleteTarget}
        variant={modalVariants.DANGER}
        title="Delete Workspace"
        onClose={() => setDeleteId(null)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: () => setDeleteId(null) } },
          { variant: buttonVariants.DANGER, props: { children: 'Delete', onClick: () => { if (deleteTarget) onDeleteSpace(deleteTarget.id); setDeleteId(null) } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</Typography>
      </Modal>
    </div>
  )
}
