import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import MyDocumentsV1 from '../my-documents/Version1'
import ConnectionsPage from '../../connections/ConnectionsPage'
import {
  ButtonDanger,
  ButtonGhost,
  buttonShapes,
  ButtonPrimary,
  ButtonTertiary,
  buttonVariants,
  Checkbox,
  Chip,
  chipStyles,
  chipVariants,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  Icon,
  iconType,
  Input,
  Modal,
  modalVariants,
  Pagination,
  SearchBar,
  searchbarWidth,
  Table,
  toastPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import {
  colorPalette,
  computeDocSourceMap,
  connectorIcon,
  fontWeight,
  formatDate,
  getDocumentTags,
  guessFormat,
  localFileToDoc,
  PAGE_SIZE,
  Skeleton,
  skeletonVariants,
  SpaceAvatar,
  SpaceContextModal,
  SpacesListView,
  sourceIcon,
  spaceConnectorLabel,
  spacing,
  stripYear,
  TagsCellInner,
  useMountLoading,
  useSidebarWidth,
  useWorkspaceState,
  type Connector,
  type MetadataDocument,
  type Space,
} from './shared'

const WORKSPACES_BASIC_BASE = '/projects/workspaces/workspaces-basic'

type WorkspaceState = ReturnType<typeof useWorkspaceState>

/** Turns a workspace's name into a readable URL segment, e.g. "Steuerkanzlei Meier & Schmidt" -> "steuerkanzlei-meier-and-schmidt". */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Workspaces — Basic: the same spaces list as Version 6 ("nuvio"), but
 * opening a space skips the chat layer entirely — there's no assistant here,
 * just the space's documents table, shown directly. Layout follows the
 * "Microsoft Integration" Figma mock: a back/avatar/title row with the search
 * bar on the same line, a plain description underneath, and a document count
 * + upload action row above the table (no status column, no per-row file icon).
 */
export default function WorkspacesBasic() {
  const workspace = useWorkspaceState()

  return (
    <Routes>
      <Route index element={<Navigate to="workspaces" replace />} />
      <Route path="workspaces">
        <Route index element={<SpacesListRoute workspace={workspace} />} />
        <Route path=":workspaceSlug" element={<SpaceDetailRoute workspace={workspace} />} />
      </Route>
      <Route path="my-documents" element={<MyDocumentsV1 showTitleIcon={false} />} />
      <Route path="connectors" element={<ConnectionsPage />} />
      <Route path="*" element={<Navigate to="workspaces" replace />} />
    </Routes>
  )
}

function SpacesListRoute({ workspace }: { workspace: WorkspaceState }) {
  const navigate = useNavigate()
  return (
    <SpacesListView
      spaces={workspace.spaces}
      getSpaceDocs={workspace.getSpaceDocs}
      onOpenSpace={id => {
        const space = workspace.spaces.find(s => s.id === id)
        navigate(`${WORKSPACES_BASIC_BASE}/workspaces/${slugify(space?.name ?? id)}`)
      }}
      onCreateSpace={workspace.createSpace}
      onUpdateSpace={workspace.updateSpace}
      onDeleteSpace={workspace.deleteSpace}
      showTitleIcon={false}
    />
  )
}

function SpaceDetailRoute({ workspace }: { workspace: WorkspaceState }) {
  const navigate = useNavigate()
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>()
  const { spaces, getSpaceDocs, setSpaceDocs, updateSpaceContext } = workspace
  const isLoading = useMountLoading()

  const selectedSpace = spaces.find(s => slugify(s.name) === workspaceSlug) ?? null
  if (!selectedSpace) return <Navigate to={`${WORKSPACES_BASIC_BASE}/workspaces`} replace />

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton variant={skeletonVariants.TEXT} title paragraph={{ rows: 6 }} />
      </div>
    )
  }

  return (
    <BasicSpaceDetail
      space={selectedSpace}
      docs={getSpaceDocs(selectedSpace.id)}
      onDocsChange={docs => setSpaceDocs(selectedSpace.id, docs)}
      onSaveContext={context => updateSpaceContext(selectedSpace.id, context)}
      onBack={() => navigate(`${WORKSPACES_BASIC_BASE}/workspaces`)}
    />
  )
}

// ─── Inline tag input (no dropdown) ───────────────────────────────────────────
// Adapted from /projects/metadata/version-7's metadata editing: chips + a text
// field in one row, comma/Enter to add a tag, Backspace to pop the last one,
// Enter on an empty field or a click outside to save, Escape to cancel.

function InlineTagInput({ tags, onTagsChange, onSave, onCancel, containerRef }: {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  onSave: () => void
  onCancel: () => void
  containerRef: React.RefObject<HTMLDivElement>
}) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const addTag = (raw: string) => {
    const trimmed = raw.trim().replace(/,$/, '')
    if (!trimmed || tags.includes(trimmed)) return
    onTagsChange([...tags, trimmed])
    setInputValue('')
  }

  return (
    <div ref={containerRef} onClick={e => e.stopPropagation()}>
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center',
          padding: '4px 8px', border: `1px solid ${colorPalette.blue.base}`,
          borderRadius: 6, backgroundColor: '#fff', minHeight: 36, cursor: 'text',
          boxShadow: `0 0 0 2px ${colorPalette.blue.lighten3}`,
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map(tag => (
          <span key={tag} onMouseDown={e => e.preventDefault()}>
            <Chip label={tag} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.HIGHLIGHT} closable onClose={() => onTagsChange(tags.filter(t => t !== tag))} />
          </span>
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) { e.preventDefault(); addTag(inputValue); return }
            if (e.key === 'Enter' && !inputValue.trim()) { e.preventDefault(); onSave(); return }
            if (e.key === 'Backspace' && !inputValue && tags.length > 0) { onTagsChange(tags.slice(0, -1)); return }
            if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
          }}
          placeholder={tags.length === 0 ? 'Add tags...' : ''}
          style={{ border: 'none', outline: 'none', flex: '1 1 80px', minWidth: 80, fontSize: 13, padding: '2px 2px', backgroundColor: 'transparent', fontFamily: 'inherit' }}
        />
      </div>
    </div>
  )
}

function BasicSpaceDetail({ space, docs, onDocsChange, onSaveContext, onBack }: {
  space: Space
  docs: MetadataDocument[]
  onDocsChange: (docs: MetadataDocument[]) => void
  onSaveContext: (context: string) => void
  onBack: () => void
}) {
  const { notification } = useNotifications()
  const [contextModalOpen, setContextModalOpen] = useState(false)
  const sidebarWidth = useSidebarWidth()

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [uploadOpen, setUploadOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Set<string> | null>(null)

  // Metadata editing (Type + Tags cells) — same interaction as /projects/metadata/version-7.
  const [editingCell, setEditingCell] = useState<{ id: string; key: 'documentType' | 'tags' } | null>(null)
  const [cellValue, setCellValue] = useState('')
  const [editingTags, setEditingTags] = useState<string[]>([])
  const tagsEditRef = useRef<HTMLDivElement>(null)

  const handleSaveDoc = (updated: MetadataDocument) => onDocsChange(docs.map(d => d._id === updated._id ? updated : d))

  // Clicking outside the tag editor commits it, same as version-7's metadata table.
  useEffect(() => {
    if (editingCell?.key !== 'tags') return
    const handleMouseDown = (e: MouseEvent) => {
      if (tagsEditRef.current?.contains(e.target as Node)) return
      const record = docs.find(d => d._id === editingCell.id)
      if (record) {
        handleSaveDoc({
          ...record,
          tagList: editingTags.map(t => ({ text: t, style: chipStyles.ACCENT_NEUTRAL, variant: chipVariants.SUBTLE })),
          namedEntity: '—', jurisdiction: '—', lawType: '—',
        })
      }
      setEditingCell(null)
      setEditingTags([])
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [editingCell, editingTags, docs]) // eslint-disable-line react-hooks/exhaustive-deps

  const sourceMap = useMemo(() => computeDocSourceMap(docs, space), [docs, space])

  // Only connectors that actually show up as a Source in this space's table —
  // a configured connector nothing is attributed to yet has nothing to sync from here.
  const presentConnectors = useMemo(() => {
    const present = new Set(sourceMap.values())
    return space.connectors.filter(c => present.has(c.type))
  }, [space.connectors, sourceMap])

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return docs
    return docs.filter(d =>
      d.name.toLowerCase().includes(q) || d.documentType.toLowerCase().includes(q) ||
      d.domain.toLowerCase().includes(q) || d.jurisdiction.toLowerCase().includes(q) ||
      getDocumentTags(d).some(t => t.text.toLowerCase().includes(q))
    )
  }, [docs, search])

  const pagedDocs = useMemo(() => filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredDocs, currentPage])
  const allSelected = filteredDocs.length > 0 && filteredDocs.every(d => selectedKeys.has(d._id))
  const someSelected = filteredDocs.some(d => selectedKeys.has(d._id))

  const columns = useMemo(() => [
    {
      title: (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={e => setSelectedKeys(new Set(e.target.checked ? filteredDocs.map(d => d._id) : []))}
        />
      ),
      key: 'checkbox',
      width: 48,
      onCell: (record: MetadataDocument) => ({
        style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record._id) ? '#EEF4FF' : undefined },
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
      render: (_: unknown, record: MetadataDocument) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Checkbox
            checked={selectedKeys.has(record._id)}
            onChange={e => setSelectedKeys(prev => {
              const next = new Set(prev)
              if (e.target.checked) next.add(record._id); else next.delete(record._id)
              return next
            })}
            onClick={e => e.stopPropagation()}
          />
        </div>
      ),
    },
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
      width: '22%',
      ellipsis: true,
      sorter: (a: MetadataDocument, b: MetadataDocument) => stripYear(a.name).localeCompare(stripYear(b.name)),
      onCell: (record: MetadataDocument) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record._id) ? '#EEF4FF' : undefined } }),
      render: (name: string) => stripYear(name),
    },
    {
      title: 'Source',
      key: 'source',
      width: 64,
      onCell: (record: MetadataDocument) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record._id) ? '#EEF4FF' : undefined } }),
      render: (_: unknown, record: MetadataDocument) => {
        const src = sourceMap.get(record._id) ?? 'local'
        return <div style={{ display: 'flex', justifyContent: 'center' }}>{sourceIcon(src, 18, src !== 'local' ? spaceConnectorLabel(space, src) : undefined)}</div>
      },
    },
    {
      title: 'Type',
      key: 'documentType',
      dataIndex: 'documentType',
      width: 150,
      ellipsis: true,
      sorter: (a: MetadataDocument, b: MetadataDocument) => a.documentType.localeCompare(b.documentType),
      onCell: (record: MetadataDocument) => ({
        style: {
          verticalAlign: 'top',
          backgroundColor: selectedKeys.has(record._id) ? '#EEF4FF' : undefined,
          cursor: editingCell?.id === record._id && editingCell.key === 'documentType' ? 'default' : 'text',
        },
      }),
      render: (val: string, record: MetadataDocument) => {
        if (editingCell?.id === record._id && editingCell.key === 'documentType') {
          const doSave = () => { handleSaveDoc({ ...record, documentType: cellValue }); setEditingCell(null); setCellValue('') }
          return (
            <div onClick={e => e.stopPropagation()}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Input {...({ autoFocus: true } as any)} value={cellValue} onChange={e => setCellValue(e.target.value)} onBlur={doSave}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); doSave() }
                  if (e.key === 'Escape') { e.stopPropagation(); setEditingCell(null); setCellValue('') }
                }}
              />
            </div>
          )
        }
        return (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 22, cursor: 'text', borderRadius: 3, border: '1px dashed transparent', padding: '1px 6px 1px 4px' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EBF0FF'; e.currentTarget.style.borderColor = '#D0D8EE'; const p = e.currentTarget.querySelector<HTMLElement>('[data-pencil]'); if (p) p.style.opacity = '1' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.borderColor = 'transparent'; const p = e.currentTarget.querySelector<HTMLElement>('[data-pencil]'); if (p) p.style.opacity = '0' }}
            onClick={e => { e.stopPropagation(); setCellValue(val); setEditingCell({ id: record._id, key: 'documentType' }) }}
          >
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
            <span data-pencil style={{ opacity: 0, transition: 'opacity 0.15s', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <Icon type={iconType.EditRecOutlined} size={12} color="neutral-darken2" />
            </span>
          </div>
        )
      },
    },
    {
      title: 'Tags',
      key: 'tags',
      sorter: (a: MetadataDocument, b: MetadataDocument) => (getDocumentTags(a)[0]?.text ?? '').localeCompare(getDocumentTags(b)[0]?.text ?? ''),
      onCell: (record: MetadataDocument) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record._id) ? '#EEF4FF' : undefined } }),
      render: (_: unknown, record: MetadataDocument) => {
        if (editingCell?.id === record._id && editingCell.key === 'tags') {
          const doSave = () => {
            handleSaveDoc({
              ...record,
              tagList: editingTags.map(t => ({ text: t, style: chipStyles.ACCENT_NEUTRAL, variant: chipVariants.SUBTLE })),
              namedEntity: '—', jurisdiction: '—', lawType: '—',
            })
            setEditingCell(null)
            setEditingTags([])
          }
          return (
            <InlineTagInput
              tags={editingTags}
              onTagsChange={setEditingTags}
              onSave={doSave}
              onCancel={() => { setEditingCell(null); setEditingTags([]) }}
              containerRef={tagsEditRef}
            />
          )
        }
        return (
          <div
            style={{ display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer', minHeight: 22, borderRadius: 3, border: '1px dashed transparent', padding: '2px 6px 2px 4px' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EBF0FF'; e.currentTarget.style.borderColor = '#D0D8EE'; const p = e.currentTarget.querySelector<HTMLElement>('[data-pencil]'); if (p) p.style.opacity = '1' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.borderColor = 'transparent'; const p = e.currentTarget.querySelector<HTMLElement>('[data-pencil]'); if (p) p.style.opacity = '0' }}
            onClick={e => { e.stopPropagation(); setEditingTags(getDocumentTags(record).slice(1).map(t => t.text)); setEditingCell({ id: record._id, key: 'tags' }) }}
          >
            <div style={{ flex: 1 }}><TagsCellInner tags={getDocumentTags(record)} /></div>
            <span data-pencil style={{ opacity: 0, transition: 'opacity 0.15s', flexShrink: 0, display: 'flex', alignItems: 'center', paddingTop: 2 }}>
              <Icon type={iconType.EditRecOutlined} size={12} color="neutral-darken2" />
            </span>
          </div>
        )
      },
    },
    {
      title: 'Updated',
      key: 'uploadedDate',
      dataIndex: 'uploadedDate',
      width: 110,
      sorter: (a: MetadataDocument, b: MetadataDocument) => a.uploadedDate.localeCompare(b.uploadedDate),
      onCell: (record: MetadataDocument) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record._id) ? '#EEF4FF' : undefined } }),
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Size',
      key: 'fileSize',
      dataIndex: 'fileSize',
      width: 80,
      onCell: (record: MetadataDocument) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record._id) ? '#EEF4FF' : undefined } }),
    },
    {
      title: 'Format',
      key: 'fileFormat',
      dataIndex: 'fileFormat',
      width: 90,
      sorter: (a: MetadataDocument, b: MetadataDocument) => a.fileFormat.localeCompare(b.fileFormat),
      onCell: (record: MetadataDocument) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record._id) ? '#EEF4FF' : undefined } }),
    },
    {
      title: '',
      key: 'actions',
      width: 56,
      onCell: (record: MetadataDocument) => ({ style: { verticalAlign: 'top', backgroundColor: selectedKeys.has(record._id) ? '#EEF4FF' : undefined }, onClick: (e: React.MouseEvent) => e.stopPropagation() }),
      render: (_: unknown, record: MetadataDocument) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Dropdown
            items={[
              { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => {} },
              { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => setPendingDelete(new Set([record._id])) },
            ]}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
          </Dropdown>
        </div>
      ),
    },
  ], [selectedKeys, allSelected, someSelected, filteredDocs, sourceMap, space, editingCell, cellValue, editingTags, docs, onDocsChange])

  return (
    <div style={{ padding: `${spacing(6)}px ${spacing(10)}px`, display: 'flex', flexDirection: 'column', gap: spacing(6), backgroundColor: colorPalette.white, height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ChevronLeftOutlined} onClick={onBack} />
          <SpaceAvatar space={space} size={32} />
          <Typography size="heading-lg" weight="bold">{space.name}</Typography>
          <div style={{ flex: 1 }} />
          <ButtonTertiary leftIcon={iconType.NoteOutlined} onClick={() => setContextModalOpen(true)}>
            Context
          </ButtonTertiary>
          <div style={{ width: 320 }}>
            <SearchBar placeholder="Dokumente durchsuchen" value={search} onChange={v => { setSearch(v); setCurrentPage(1) }} width={searchbarWidth.EXPANDED} />
          </div>
        </div>
        <Typography size="base" color="neutral-darken2">{space.description}</Typography>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography size="base" color="neutral-darken2">{filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}</Typography>
        <ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={() => setUploadOpen(true)}>Upload or sync</ButtonPrimary>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <Table dataSource={pagedDocs} columns={columns as never} pagination={false} rowHoverable />
        </div>
        {filteredDocs.length > PAGE_SIZE && (
          <div style={{ flexShrink: 0 }}>
            <Pagination current={currentPage} total={filteredDocs.length} pageSize={PAGE_SIZE} onChange={setCurrentPage} />
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2) }}>
        <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
        <Typography size="base-sm" color="neutral-darken2">
          All files are securely uploaded and scanned for viruses. <span style={{ color: colorPalette.blue.base, textDecoration: 'underline', cursor: 'pointer' }}>Learn more</span>
        </Typography>
      </div>

      {selectedKeys.size > 0 && (
        <div style={{ position: 'fixed', bottom: spacing(2), left: sidebarWidth + spacing(2), right: spacing(2), height: 56, backgroundColor: colorPalette.neutral.lighten1, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${spacing(6)}px`, zIndex: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(4) }}>
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setSelectedKeys(new Set())} />
            <Typography color="neutral-darken5">{selectedKeys.size} selected</Typography>
          </div>
          <ButtonDanger leftIcon={iconType.TrashOutlined} onClick={() => setPendingDelete(selectedKeys)}>Delete</ButtonDanger>
        </div>
      )}

      <Modal
        visible={pendingDelete !== null}
        variant={modalVariants.DANGER}
        title={pendingDelete?.size === 1 ? 'Delete Document' : 'Delete Documents'}
        onClose={() => setPendingDelete(null)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: () => setPendingDelete(null) } },
          { variant: buttonVariants.DANGER, props: { children: 'Delete', onClick: () => {
            if (!pendingDelete) return
            onDocsChange(docs.filter(d => !pendingDelete.has(d._id)))
            setSelectedKeys(prev => { const next = new Set(prev); pendingDelete.forEach(id => next.delete(id)); return next })
            setPendingDelete(null)
          } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">
          Delete <strong>{pendingDelete?.size ?? 0} document{pendingDelete?.size !== 1 ? 's' : ''}</strong>? This cannot be undone.
        </Typography>
      </Modal>

      <BasicUploadModal
        open={uploadOpen}
        connectors={presentConnectors}
        onClose={() => setUploadOpen(false)}
        onUpload={newDocs => {
          onDocsChange([...newDocs, ...docs])
          notification.success({ title: `${newDocs.length} document${newDocs.length !== 1 ? 's' : ''} uploaded`, placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
        }}
      />

      <SpaceContextModal
        open={contextModalOpen}
        space={space}
        onClose={() => setContextModalOpen(false)}
        onSave={context => { onSaveContext(context); setContextModalOpen(false) }}
      />
    </div>
  )
}

// ─── Upload or sync modal ─────────────────────────────────────────────────────

/**
 * Matches the "Upload or Sync Document" Figma mock: a drag-and-drop zone for
 * local files, plus one row per connector actually present in this space's
 * table, so the user can see where else they could pull documents from.
 */
function BasicUploadModal({ open, connectors, onClose, onUpload }: {
  open: boolean
  connectors: Connector[]
  onClose: () => void
  onUpload: (docs: MetadataDocument[]) => void
}) {
  const [queuedFiles, setQueuedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = (list: FileList | null) => {
    if (!list) return
    setQueuedFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...Array.from(list).filter(f => !existing.has(f.name))]
    })
  }

  const handleClose = () => { setQueuedFiles([]); setIsDragging(false); onClose() }
  const handleUpload = () => { onUpload(queuedFiles.map(localFileToDoc)); handleClose() }

  return (
    <Modal
      visible={open}
      title="Upload or Sync Document"
      withIcon={false}
      onClose={handleClose}
      maxWidth={600}
      footer={queuedFiles.length > 0 ? { buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: handleClose } },
        { variant: buttonVariants.PRIMARY, props: { children: `Upload ${queuedFiles.length} file${queuedFiles.length !== 1 ? 's' : ''}`, onClick: handleUpload } },
      ]} : undefined}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <Typography size="base" color="neutral-darken5">Choose where to upload your document from.</Typography>

        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `1.5px dashed ${isDragging ? colorPalette.blue.base : '#d0d5dd'}`,
            borderRadius: 8, padding: `${spacing(6)}px ${spacing(4)}px`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(2),
            cursor: 'pointer', backgroundColor: isDragging ? '#F0F7FF' : undefined,
            transition: 'border-color 0.15s, background-color 0.15s',
          }}
        >
          <Icon type={iconType.UploadOutlined} size={24} color="neutral-darken3" />
          <Typography color="neutral-darken5">Klicken Sie, um ein Dokument auszuwählen, oder ziehen Sie es hierher.</Typography>
          <Typography size="base-sm" color="neutral-darken2">PDF-, DOCX-, XLSX- und TXT-Formate, max. Größe 10 MB</Typography>
        </div>
        <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={e => { addFiles(e.target.files); e.target.value = '' }} />

        {queuedFiles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            {queuedFiles.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(2)}px ${spacing(3)}px`, border: '1px solid #e0e0e0', borderRadius: 8 }}>
                <Chip label={guessFormat(f.name)} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
                <span style={{ flex: 1 }}><Typography size="base" color="neutral-darken5">{f.name}</Typography></span>
                <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setQueuedFiles(prev => prev.filter((_, j) => j !== i))} />
              </div>
            ))}
          </div>
        )}

        {connectors.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
            <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD} uppercase>Connected apps</Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {connectors.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: spacing(3), border: '1px solid #e5e7eb', borderRadius: 8, padding: spacing(3) }}>
                  {connectorIcon(c.type, 28, c.label)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{c.label}</Typography>
                    <Typography size="base-sm" color="neutral-darken5">Connect to sync documents from external sources.</Typography>
                  </div>
                  <Icon type={iconType.ChevronRightOutlined} size={16} color="neutral-darken2" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(2), marginBottom: spacing(2) }}>
          <Icon type={iconType.LockOutlined} size={16} color="neutral-darken2" />
          <Typography size="base-sm" color="neutral-darken2">Browse and sync documents from your apps. We never modify files without your permission. We never store your credentials.</Typography>
        </div>
      </div>
    </Modal>
  )
}
