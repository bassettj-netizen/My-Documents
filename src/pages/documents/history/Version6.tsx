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
  EmptyState,
  emptyStateSizes,
  emptyStateVariants,
  dropdownTriggers,
  Icon,
  iconType,
  Input,
  Modal,
  modalVariants,
  Pagination,
  Panel,
  panelPlacements,
  SearchBar,
  searchbarWidth,
  Segmented,
  Table,
  toastPlacements,
  Tooltip,
  tooltipPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import {
  colorPalette,
  computeDocSourceMap,
  connectorIcon,
  connectorLabel,
  fontWeight,
  formatDate,
  getDocumentTags,
  PAGE_SIZE,
  Skeleton,
  skeletonVariants,
  SpaceAvatar,
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
  type DocSource,
  type MetadataDocument,
  type Space,
} from '../workspaces/shared'
import { BasicUploadModal, CopilotIcon } from '../workspaces/WorkspacesBasic'

const BASE = '/projects/history/version-6'

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
 * History — Version 6: Version 5 without the Collapsible — each entry always shows the event
 * type, the user, the date and (for syncs and connector events) the connected app, laid out as in
 * the Figma "Events" sheet, with "View more" to reveal the affected documents. Design-system
 * components and icons, except the Figma's connector marks on connect / disconnect events and the
 * provider's logo (Microsoft, Google Drive…) beside the app name.
 *
 * Version 5: Version 4 with an entry's long file list scrolling
 * inside its card instead of being paged.
 *
 * Version 4: Version 3 with an entry's files as a plain list
 * (small regular text, filled alert icon on failed/removed files) instead of
 * a Table with status chips — still paged 10 at a time.
 *
 * Version 3: the same history data as Version 2, with the panel
 * rebuilt from goat-ui components — goat icons except the connector marks,
 * Segmented/SearchBar filters, who/when in the collapsed header,
 * PropertyItems and a paged Table for an entry's files (see HistoryPanel).
 *
 * Version 2: same as Version 1, but an entry lists every file
 * involved — no "+ N" cut-off on long uploads, syncs or removals.
 *
 * Version 1: Workspaces Basic (spaces list → a space's documents
 * table) with a History button next to "Upload or sync". It opens a side
 * panel, from the SharePoint Integration Figma, listing the space's file uploads
 * and connector connections/disconnections, grouped by when they happened.
 * Each entry expands to show who did it, when, and the files involved,
 * with failed uploads and files removed by a disconnect flagged.
 */
export default function HistoryVersion6() {
  const workspace = useWorkspaceState()
  // Per-space history, seeded the first time a space is opened and kept here
  // so new uploads stay in the log when you move between spaces.
  const [historyBySpace, setHistoryBySpace] = useState<Record<string, HistoryEvent[]>>({})

  return (
    <Routes>
      <Route index element={<Navigate to="workspaces" replace />} />
      <Route path="workspaces">
        <Route index element={<SpacesListRoute workspace={workspace} />} />
        <Route path=":workspaceSlug" element={<SpaceDetailRoute workspace={workspace} historyBySpace={historyBySpace} setHistoryBySpace={setHistoryBySpace} />} />
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
        navigate(`${BASE}/workspaces/${slugify(space?.name ?? id)}`)
      }}
      onCreateSpace={workspace.createSpace}
      onUpdateSpace={workspace.updateSpace}
      onDeleteSpace={workspace.deleteSpace}
      showTitleIcon={false}
      noun="Space"
    />
  )
}

function SpaceDetailRoute({ workspace, historyBySpace, setHistoryBySpace }: {
  workspace: WorkspaceState
  historyBySpace: Record<string, HistoryEvent[]>
  setHistoryBySpace: React.Dispatch<React.SetStateAction<Record<string, HistoryEvent[]>>>
}) {
  const navigate = useNavigate()
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>()
  const { spaces, getSpaceDocs, setSpaceDocs } = workspace
  const isLoading = useMountLoading()

  const selectedSpace = spaces.find(s => slugify(s.name) === workspaceSlug) ?? null
  if (!selectedSpace) return <Navigate to={`${BASE}/workspaces`} replace />

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton variant={skeletonVariants.TEXT} title paragraph={{ rows: 6 }} />
      </div>
    )
  }

  const docs = getSpaceDocs(selectedSpace.id)
  const history = historyBySpace[selectedSpace.id] ?? seedHistory(selectedSpace, docs)

  return (
    <BasicSpaceDetail
      space={selectedSpace}
      docs={docs}
      onDocsChange={next => setSpaceDocs(selectedSpace.id, next)}
      onBack={() => navigate(`${BASE}/workspaces`)}
      history={history}
      onAddHistory={event => setHistoryBySpace(prev => ({ ...prev, [selectedSpace.id]: [event, ...history] }))}
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

function BasicSpaceDetail({ space, docs, onDocsChange, onBack, history, onAddHistory }: {
  space: Space
  docs: MetadataDocument[]
  onDocsChange: (docs: MetadataDocument[]) => void
  onBack: () => void
  history: HistoryEvent[]
  onAddHistory: (event: HistoryEvent) => void
}) {
  const { notification } = useNotifications()
  const sidebarWidth = useSidebarWidth()

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [uploadOpen, setUploadOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
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
  const selectedDocs = docs.filter(d => selectedKeys.has(d._id))
  const allSelectedAreManualUpload = selectedDocs.length > 0 && selectedDocs.every(d => (sourceMap.get(d._id) ?? 'local') === 'local')

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
          <div style={{ width: 320 }}>
            <SearchBar placeholder="Dokumente durchsuchen" value={search} onChange={v => { setSearch(v); setCurrentPage(1) }} width={searchbarWidth.EXPANDED} />
          </div>
        </div>
        <Typography size="base" color="neutral-darken2">{space.description}</Typography>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography size="base" color="neutral-darken2">{filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tooltip title="History" placement={tooltipPlacements.TOP}>
            <ButtonTertiary shape={buttonShapes.SQUARE} leftIcon={iconType.HistoryOutlined} ariaLabel="History" onClick={() => setHistoryOpen(true)} />
          </Tooltip>
          <ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={() => setUploadOpen(true)}>Upload or sync</ButtonPrimary>
        </div>
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
            {/* Display only — no destination exists for this yet, so it deliberately has no onClick.
                Styled to match ButtonTertiary (e.g. Download below) exactly, since it can't
                actually be one — its leftIcon has to be this custom CoPilot mark, and
                ButtonTertiary's leftIcon/rightIcon only accept goat-ui's own icon names. */}
            <div style={{ display: 'flex', alignItems: 'center', height: 32, padding: '4px 12px', border: '1px solid #BFCAE8', borderRadius: 8, backgroundColor: colorPalette.white, color: '#374058', fontSize: 14, fontWeight: 600, cursor: 'default' }}>
              <span style={{ display: 'flex', marginRight: 8 }}><CopilotIcon /></span>
              Ask CoPilot
              <span style={{ display: 'flex', marginLeft: 8 }}><Icon type={iconType.ExternalLinkOutlined} size={16} color="inherit" /></span>
            </div>
            {allSelectedAreManualUpload && (
              <ButtonTertiary leftIcon={iconType.DownloadOutlined} onClick={() => {}}>Download</ButtonTertiary>
            )}
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
            onAddHistory(liveEvent('delete', docs.filter(d => pendingDelete.has(d._id))))
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

      <HistoryPanel visible={historyOpen} events={history} onClose={() => setHistoryOpen(false)} />

      <BasicUploadModal
        open={uploadOpen}
        connectors={presentConnectors}
        onClose={() => setUploadOpen(false)}
        onUpload={newDocs => {
          onDocsChange([...newDocs, ...docs])
          onAddHistory(liveEvent('upload', newDocs))
          notification.success({ title: `${newDocs.length} document${newDocs.length !== 1 ? 's' : ''} uploaded`, placement: toastPlacements.BOTTOM_LEFT, duration: 4 })
        }}
      />
    </div>
  )
}

// ─── History ──────────────────────────────────────────────────────────────────

type HistoryFile = { name: string; status?: 'failed' | 'removed' }

type HistoryEventKind = 'upload' | 'delete' | 'sync' | 'connected' | 'disconnected'

type HistoryEvent = {
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

function liveEvent(kind: 'upload' | 'delete', docs: MetadataDocument[]): HistoryEvent {
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
function seedHistory(space: Space, docs: MetadataDocument[]): HistoryEvent[] {
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
  if (e.kind === 'delete') return documentsLabel(e.files.length, 'deleted')
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
 * No card or border: an 8px-padded block with an 8px radius, tinted amber for a disconnect that
 * removed documents. "View more" lists the affected documents below (failed / removed first,
 * with a filled alert icon, then A–Z) one per line, scrolling when long; "View less" hides them.
 */
function HistoryEventItem({ event, expanded, onToggle }: { event: HistoryEvent; expanded: boolean; onToggle: () => void }) {
  const isConnectorEvent = event.kind === 'connected' || event.kind === 'disconnected'
  const files = [...event.files].sort((a, b) =>
    Number(!a.status) - Number(!b.status) || a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }))
  const singleFile = !isConnectorEvent && files.length === 1 ? files[0] : null
  // A single file is already named above, unless it needs its alert icon shown in the list.
  const hasList = files.length > 1 || (files.length === 1 && !!files[0].status) || (isConnectorEvent && files.length > 0)
  const warning = event.kind === 'disconnected' && files.length > 0

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(3), padding: spacing(2), borderRadius: 8, backgroundColor: warning ? colorPalette.warning.lighten5 : undefined }}>
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
  { label: 'Deletes', value: 'delete' },
  { label: 'Connectors', value: 'connector' },
]

function matchesFilter(e: HistoryEvent, filter: HistoryFilter) {
  if (filter === 'all') return true
  if (filter === 'connector') return e.kind === 'connected' || e.kind === 'disconnected'
  return e.kind === filter
}

/**
 * History panel built only from goat-ui components and icons:
 * - Segmented to narrow the log to one event type, SearchBar to find a file, person or app.
 * - Date groups of entries laid out as in the Figma "Events" sheet (see HistoryEventItem): type,
 *   app, user and date, a semantic Chip for problems, and "View more" for the affected documents.
 * - Pagination for the log (20 per page), EmptyState when filters match nothing.
 */
function HistoryPanel({ visible, events, onClose }: { visible: boolean; events: HistoryEvent[]; onClose: () => void }) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
          <Icon type={iconType.HistoryOutlined} size={24} color="neutral-darken5" />
          <span style={{ fontSize: 20, lineHeight: '32px', fontWeight: 600, color: colorPalette.neutral.darken5 }}>History</span>
        </div>
      }
    >
      <style>{HISTORY_PANEL_CSS}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4), paddingBottom: spacing(6) }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          <SearchBar placeholder="Search files, people, or connected apps" value={query} onChange={v => { setQuery(v); setPage(1) }} width={searchbarWidth.EXPANDED} />
          {/* Full width: goat-ui 24.13's Segmented has no width prop, but forwards extra props to antd's Segmented, whose `block` stretches it. */}
          <div className="history-filters">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Segmented {...({ block: true } as any)} options={FILTER_OPTIONS} value={filter} onChange={v => { setFilter(v as HistoryFilter); setPage(1) }} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState variant={emptyStateVariants.EMPTY} size={emptyStateSizes.SMALL} description="No activity matches these filters." />
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

// The stretched filter tabs need centred labels; "View more" is a bare text button (a link in the Figma).
const HISTORY_PANEL_CSS = `
  .history-view-more {
    display: inline-flex; align-items: center; gap: 4px; align-self: flex-start;
    padding: 0; border: none; background: none; cursor: pointer;
  }
  .history-view-more:hover p { text-decoration: underline; }
  .history-view-more:focus-visible { outline: 2px solid ${colorPalette.blue.lighten3}; outline-offset: 2px; border-radius: 2px; }
  /* Stretched tabs: centre each label, and trim goat's 16px side padding so "Connectors" fits its fifth of the width. */
  .history-filters .goat-segmented .goat-segmented-item { padding-left: 4px; padding-right: 4px; }
  .history-filters .goat-segmented .goat-segmented-item-label { justify-content: center; }
`
