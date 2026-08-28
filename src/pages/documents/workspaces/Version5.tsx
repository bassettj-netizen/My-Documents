import { useEffect, useLayoutEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import {
  Breadcrumbs,
  ButtonDanger,
  ButtonGhost,
  ButtonPrimary,
  ButtonSecondary,
  ButtonTertiary,
  buttonShapes,
  buttonSizes,
  buttonVariants,
  Checkbox,
  Chip,
  type ChipStyleValue,
  chipStyles,
  chipVariants,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  Icon,
  iconType,
  Modal,
  modalVariants,
  Overflow,
  Pagination,
  Panel,
  panelPlacements,
  panelSizes,
  PropertyItem,
  RadioGroup,
  radioGroupDirection,
  SearchBar,
  searchbarWidth,
  Spinner,
  Table,
  TextArea,
  toastPlacements,
  Toolbar,
  Tooltip,
  tooltipPlacements,
  Typography,
  useNotifications,
} from '@goat-ui/goat-ui-core'
import { DOCUMENT_SNIPPETS, type FileFormat } from '../bulk-edit/documents'
import {
  colorPalette,
  computeDocSourceMap,
  connectorIcon,
  formatDate,
  fontWeight,
  getDocumentTags,
  guessFormat,
  localFileToDoc,
  relativeTime,
  renderLiteMarkdown,
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
  useWorkspaceState,
  VisibilityIcon,
  type ChatAttachment,
  type ChatMessage,
  type ChatSession,
  type DocSource,
  type MetadataDocument,
  type OutgoingAttachment,
  type Space,
} from './shared'

type DetailView = 'landing' | 'chat' | 'docPreview' | 'documentsTable'
type DrawerMode = null | 'documents' | 'filter' | 'add'
type SortValue = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'

function sourceLabel(space: Space, source: DocSource) {
  return source === 'local' ? 'Manual Upload' : spaceConnectorLabel(space, source)
}

/**
 * Workspaces — Version 5: "Chat-first with a documents drawer, breadcrumb-driven full page".
 * Same as Version 4, but expanding the documents drawer opens a full page that
 * matches the chat detail page's structure — Workspaces / Space / Documents
 * breadcrumbs instead of a standalone panel-style header.
 */
export default function WorkspacesVersion5() {
  const {
    spaces, createSpace, updateSpace, deleteSpace,
    getSpaceDocs, setSpaceDocs, addDocsToSpace,
    sessionsBySpace, activeSessionBySpace, selectChat, deleteChat, sendMessage,
  } = useWorkspaceState()

  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)
  const [detailView, setDetailView] = useState<DetailView>('landing')
  const [drawer, setDrawer] = useState<DrawerMode>(null)
  const [previewDocId, setPreviewDocId] = useState<string | null>(null)
  // Remembers whether the document preview was opened from the side drawer or
  // the full-page table, so "Back" returns to wherever the user actually was.
  const [previewOrigin, setPreviewOrigin] = useState<'drawer' | 'table'>('drawer')
  const [chatAttachmentSeed, setChatAttachmentSeed] = useState<{ doc: MetadataDocument; source: DocSource }[]>([])
  const [sortValue, setSortValue] = useState<SortValue>('date-desc')
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [formatFilter, setFormatFilter] = useState<string[]>([])
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [highlightDocIds, setHighlightDocIds] = useState<Set<string>>(new Set())
  // Shared between the Documents drawer and its full-page table view, so
  // search/selection/pagination carry over when a user expands or collapses.
  const [docsSearch, setDocsSearch] = useState('')
  const [docsSelected, setDocsSelected] = useState<Set<string>>(new Set())
  const [docsPage, setDocsPage] = useState(1)
  const isLoading = useMountLoading()

  // The app's page layout has no fixed viewport height of its own — content
  // just grows the page — so a plain `height: 100%` on the detail view never
  // resolves. Measure the real remaining viewport space so each detail view
  // (chat, doc preview, documents table) can scroll internally instead.
  const detailRef = useRef<HTMLDivElement>(null)
  const [detailHeight, setDetailHeight] = useState<number>()
  useLayoutEffect(() => {
    const el = detailRef.current
    if (!el) return
    const update = () => setDetailHeight(window.innerHeight - el.getBoundingClientRect().top)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [view])

  const selectedSpace = spaces.find(s => s.id === selectedSpaceId) ?? null

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton variant={skeletonVariants.TEXT} title paragraph={{ rows: 6 }} />
      </div>
    )
  }

  const goToLanding = () => { setDetailView('landing'); setDrawer(null); setPreviewDocId(null); setDocsSelected(new Set()) }

  if (view === 'detail' && selectedSpace) {
    const docs = getSpaceDocs(selectedSpace.id)
    const sessions = sessionsBySpace[selectedSpace.id] ?? []
    const activeSessionId = activeSessionBySpace[selectedSpace.id] ?? null
    const activeSession = sessions.find(s => s.id === activeSessionId) ?? null
    const previewDoc = docs.find(d => d._id === previewDocId) ?? null
    const sourceMap = computeDocSourceMap(docs, selectedSpace)

    // Filter/Sort and Add Documents are opened from either the side drawer or
    // the full-page table — return to whichever one was showing.
    const closeSecondaryDrawer = () => setDrawer(detailView === 'documentsTable' ? null : 'documents')

    // The document preview is opened from either the side drawer or the
    // full-page table — return to whichever one was showing.
    const closePreview = () => {
      if (previewOrigin === 'table') setDetailView('documentsTable')
      else { setDetailView('landing'); setDrawer('documents') }
    }

    // Documents sent to chat land in the composer as attachment chips — the same
    // representation as picking a file via the composer's own "Add document" button.
    const sendToChat = (docsToSend: MetadataDocument[]) => {
      setChatAttachmentSeed(docsToSend.map(d => ({ doc: d, source: sourceMap.get(d._id) ?? 'local' })))
      goToLanding()
    }

    const filteredDocs = docs
      .filter(d => typeFilter.length === 0 || typeFilter.includes(d.documentType))
      .filter(d => formatFilter.length === 0 || formatFilter.includes(d.fileFormat))
      .filter(d => tagFilter.length === 0 || getDocumentTags(d).some(t => tagFilter.includes(t.text)))
      .sort((a, b) => {
        if (sortValue === 'name-asc') return stripYear(a.name).localeCompare(stripYear(b.name))
        if (sortValue === 'name-desc') return stripYear(b.name).localeCompare(stripYear(a.name))
        return sortValue === 'date-desc' ? b.uploadedDate.localeCompare(a.uploadedDate) : a.uploadedDate.localeCompare(b.uploadedDate)
      })

    return (
      <div ref={detailRef} style={{ height: detailHeight ?? '100%', overflow: 'hidden', position: 'relative', backgroundColor: colorPalette.white }}>
        {detailView === 'landing' && (
          <LandingView
            space={selectedSpace}
            docs={docs}
            sessions={sessions}
            seedAttachments={chatAttachmentSeed}
            onSeedAttachmentsConsumed={() => setChatAttachmentSeed([])}
            onBackToList={() => { setView('list'); setSelectedSpaceId(null) }}
            onOpenDocuments={() => setDrawer('documents')}
            onSend={(text, attachments) => { sendMessage(selectedSpace.id, docs, null, text, attachments); setDetailView('chat') }}
            onOpenSession={id => { selectChat(selectedSpace.id, id); setDetailView('chat') }}
            onDeleteSession={id => deleteChat(selectedSpace.id, id)}
          />
        )}

        {detailView === 'chat' && activeSession && (
          <ChatDetailView
            space={selectedSpace}
            docs={docs}
            session={activeSession}
            onBack={goToLanding}
            onSend={(text, attachments) => sendMessage(selectedSpace.id, docs, activeSessionId, text, attachments)}
          />
        )}

        {detailView === 'docPreview' && previewDoc && (
          <DocPreviewView
            space={selectedSpace}
            doc={previewDoc}
            source={sourceMap.get(previewDoc._id) ?? 'local'}
            onBack={closePreview}
            onSendToChat={() => sendToChat([previewDoc])}
          />
        )}

        {detailView === 'documentsTable' && (
          <DocumentsTableView
            space={selectedSpace}
            docs={filteredDocs}
            sourceMap={sourceMap}
            highlightDocIds={highlightDocIds}
            typeFilter={typeFilter}
            formatFilter={formatFilter}
            tagFilter={tagFilter}
            search={docsSearch}
            setSearch={setDocsSearch}
            selected={docsSelected}
            setSelected={setDocsSelected}
            page={docsPage}
            setPage={setDocsPage}
            onBack={goToLanding}
            onOpenFilter={() => setDrawer('filter')}
            onOpenAdd={() => setDrawer('add')}
            onOpenDoc={id => { setPreviewDocId(id); setPreviewOrigin('table'); setDetailView('docPreview') }}
            onSendToChat={sendToChat}
            onDeleteDocs={ids => setSpaceDocs(selectedSpace.id, docs.filter(d => !ids.has(d._id)))}
            onClearFilter={(category, value) => {
              if (category === 'type') setTypeFilter(prev => prev.filter(v => v !== value))
              if (category === 'format') setFormatFilter(prev => prev.filter(v => v !== value))
              if (category === 'tag') setTagFilter(prev => prev.filter(v => v !== value))
            }}
            onClearAllFilters={() => { setTypeFilter([]); setFormatFilter([]); setTagFilter([]) }}
          />
        )}

        <DocumentsDrawer
          visible={drawer === 'documents'}
          space={selectedSpace}
          docs={filteredDocs}
          sourceMap={sourceMap}
          highlightDocIds={highlightDocIds}
          typeFilter={typeFilter}
          formatFilter={formatFilter}
          tagFilter={tagFilter}
          search={docsSearch}
          setSearch={setDocsSearch}
          selected={docsSelected}
          setSelected={setDocsSelected}
          page={docsPage}
          setPage={setDocsPage}
          onClose={() => { setDrawer(null); setDocsSelected(new Set()) }}
          onOpenFilter={() => setDrawer('filter')}
          onOpenAdd={() => setDrawer('add')}
          onOpenDoc={id => { setPreviewDocId(id); setPreviewOrigin('drawer'); setDetailView('docPreview'); setDrawer(null) }}
          onSendToChat={sendToChat}
          onDeleteDocs={ids => setSpaceDocs(selectedSpace.id, docs.filter(d => !ids.has(d._id)))}
          onClearFilter={(category, value) => {
            if (category === 'type') setTypeFilter(prev => prev.filter(v => v !== value))
            if (category === 'format') setFormatFilter(prev => prev.filter(v => v !== value))
            if (category === 'tag') setTagFilter(prev => prev.filter(v => v !== value))
          }}
          onClearAllFilters={() => { setTypeFilter([]); setFormatFilter([]); setTagFilter([]) }}
          onExpand={() => { setDetailView('documentsTable'); setDrawer(null) }}
        />

        <FilterSortDrawer
          visible={drawer === 'filter'}
          docs={docs}
          sortValue={sortValue}
          typeFilter={typeFilter}
          formatFilter={formatFilter}
          tagFilter={tagFilter}
          onBack={closeSecondaryDrawer}
          onClose={closeSecondaryDrawer}
          onApply={(next) => { setSortValue(next.sortValue); setTypeFilter(next.typeFilter); setFormatFilter(next.formatFilter); setTagFilter(next.tagFilter); closeSecondaryDrawer() }}
        />

        <AddDocumentsDrawer
          visible={drawer === 'add'}
          space={selectedSpace}
          onClose={closeSecondaryDrawer}
          onUpload={newDocs => {
            addDocsToSpace(selectedSpace.id, newDocs)
            setSortValue('date-desc'); setTypeFilter([]); setFormatFilter([]); setTagFilter([])
            setHighlightDocIds(new Set(newDocs.map(d => d._id)))
            closeSecondaryDrawer()
            setTimeout(() => setHighlightDocIds(new Set()), 3000)
          }}
        />
      </div>
    )
  }

  return (
    <SpacesListView
      spaces={spaces}
      getSpaceDocs={getSpaceDocs}
      onOpenSpace={id => { setSelectedSpaceId(id); setView('detail'); setDetailView('landing') }}
      onCreateSpace={createSpace}
      onUpdateSpace={updateSpace}
      onDeleteSpace={deleteSpace}
    />
  )
}

// ─── Shared message composer (landing + chat detail use the identical field) ───

const PROMPT_TEMPLATES = [
  'Summarize this document',
  'Draft a client-facing summary',
  'Compare these documents',
  'What are the key risks or deadlines?',
]

/** PDF file glyph for attachment chips — https://www.svgrepo.com/svg/373961/pdf2 */
function PdfFileIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M24.1,2.072h0l5.564,5.8V29.928H8.879V30H29.735V7.945L24.1,2.072" fill="#909090" />
      <path d="M24.031,2H8.808V29.928H29.664V7.873L24.03,2" fill="#f4f4f4" />
      <path d="M8.655,3.5H2.265v6.827h20.1V3.5H8.655" fill="#7a7b7c" />
      <path d="M22.472,10.211H2.395V3.379H22.472v6.832" fill="#dd2025" />
      <path d="M9.052,4.534h-.03l-.207,0H7.745v4.8H8.773V7.715L9,7.728a2.042,2.042,0,0,0,.647-.117,1.427,1.427,0,0,0,.493-.291,1.224,1.224,0,0,0,.335-.454,2.13,2.13,0,0,0,.105-.908,2.237,2.237,0,0,0-.114-.644,1.173,1.173,0,0,0-.687-.65A2.149,2.149,0,0,0,9.37,4.56a2.232,2.232,0,0,0-.319-.026M8.862,6.828l-.089,0V5.348h.193a.57.57,0,0,1,.459.181.92.92,0,0,1,.183.558c0,.246,0,.469-.222.626a.942.942,0,0,1-.524.114" fill="#464648" />
      <path d="M12.533,4.521c-.111,0-.219.008-.295.011L12,4.538h-.78v4.8h.918a2.677,2.677,0,0,0,1.028-.175,1.71,1.71,0,0,0,.68-.491,1.939,1.939,0,0,0,.373-.749,3.728,3.728,0,0,0,.114-.949,4.416,4.416,0,0,0-.087-1.127,1.777,1.777,0,0,0-.4-.733,1.63,1.63,0,0,0-.535-.4,2.413,2.413,0,0,0-.549-.178,1.282,1.282,0,0,0-.228-.017m-.182,3.937-.1,0V5.392h.013a1.062,1.062,0,0,1,.6.107,1.2,1.2,0,0,1,.324.4,1.3,1.3,0,0,1,.142.526c.009.22,0,.4,0,.549a2.926,2.926,0,0,1-.033.513,1.756,1.756,0,0,1-.169.5,1.13,1.13,0,0,1-.363.36.673.673,0,0,1-.416.106" fill="#464648" />
      <path d="M17.43,4.538H15v4.8h1.028V7.434h1.3V6.542h-1.3V5.43h1.4V4.538" fill="#464648" />
      <path d="M21.781,20.255s3.188-.578,3.188.511S22.994,21.412,21.781,20.255Zm-2.357.083a7.543,7.543,0,0,0-1.473.489l.4-.9c.4-.9.815-2.127.815-2.127a14.216,14.216,0,0,0,1.658,2.252,13.033,13.033,0,0,0-1.4.288Zm-1.262-6.5c0-.949.307-1.208.546-1.208s.508.115.517.939a10.787,10.787,0,0,1-.517,2.434A4.426,4.426,0,0,1,18.161,13.841ZM13.513,24.354c-.978-.585,2.051-2.386,2.6-2.444C16.11,21.911,14.537,24.966,13.513,24.354ZM25.9,20.895c-.01-.1-.1-1.207-2.07-1.16a14.228,14.228,0,0,0-2.453.173,12.542,12.542,0,0,1-2.012-2.655,11.76,11.76,0,0,0,.623-3.1c-.029-1.2-.316-1.888-1.236-1.878s-1.054.815-.933,2.013a9.309,9.309,0,0,0,.665,2.338s-.425,1.323-.987,2.639-.946,2.006-.946,2.006a9.622,9.622,0,0,0-2.725,1.4c-.824.767-1.159,1.356-.725,1.945.374.508,1.683.623,2.853-.91a22.549,22.549,0,0,0,1.7-2.492s1.784-.489,2.339-.623,1.226-.24,1.226-.24,1.629,1.639,3.2,1.581,1.495-.939,1.485-1.035" fill="#dd2025" />
      <path d="M23.954,2.077V7.95h5.633L23.954,2.077Z" fill="#909090" />
      <path d="M24.031,2V7.873h5.633L24.031,2Z" fill="#f4f4f4" />
      <path d="M8.975,4.457h-.03l-.207,0H7.668v4.8H8.7V7.639l.228.013a2.042,2.042,0,0,0,.647-.117,1.428,1.428,0,0,0,.493-.291A1.224,1.224,0,0,0,10.4,6.79a2.13,2.13,0,0,0,.105-.908,2.237,2.237,0,0,0-.114-.644,1.173,1.173,0,0,0-.687-.65,2.149,2.149,0,0,0-.411-.105,2.232,2.232,0,0,0-.319-.026M8.785,6.751l-.089,0V5.271H8.89a.57.57,0,0,1,.459.181.92.92,0,0,1,.183.558c0,.246,0,.469-.222.626a.942.942,0,0,1-.524.114" fill="#fff" />
      <path d="M12.456,4.444c-.111,0-.219.008-.295.011l-.235.006h-.78v4.8h.918a2.677,2.677,0,0,0,1.028-.175,1.71,1.71,0,0,0,.68-.491,1.939,1.939,0,0,0,.373-.749,3.728,3.728,0,0,0,.114-.949,4.416,4.416,0,0,0-.087-1.127,1.777,1.777,0,0,0-.4-.733,1.63,1.63,0,0,0-.535-.4,2.413,2.413,0,0,0-.549-.178,1.282,1.282,0,0,0-.228-.017m-.182,3.937-.1,0V5.315h.013a1.062,1.062,0,0,1,.6.107,1.2,1.2,0,0,1,.324.4,1.3,1.3,0,0,1,.142.526c.009.22,0,.4,0,.549a2.926,2.926,0,0,1-.033.513,1.756,1.756,0,0,1-.169.5,1.13,1.13,0,0,1-.363.36.673.673,0,0,1-.416.106" fill="#fff" />
      <path d="M17.353,4.461h-2.43v4.8h1.028V7.357h1.3V6.465h-1.3V5.353h1.4V4.461" fill="#fff" />
    </svg>
  )
}

/** Word file glyph for attachment chips — https://www.svgrepo.com/svg/374187/word */
function WordFileIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="workspace-composer-word-gradient" x1="4.494" y1="-1712.086" x2="13.832" y2="-1695.914" gradientTransform="translate(0 1720)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2368c4" />
          <stop offset="0.5" stopColor="#1a5dbe" />
          <stop offset="1" stopColor="#1146ac" />
        </linearGradient>
      </defs>
      <path d="M28.806,3H9.705A1.192,1.192,0,0,0,8.512,4.191h0V9.5l11.069,3.25L30,9.5V4.191A1.192,1.192,0,0,0,28.806,3Z" fill="#41a5ee" />
      <path d="M30,9.5H8.512V16l11.069,1.95L30,16Z" fill="#2b7cd3" />
      <path d="M8.512,16v6.5L18.93,23.8,30,22.5V16Z" fill="#185abd" />
      <path d="M9.705,29h19.1A1.192,1.192,0,0,0,30,27.809h0V22.5H8.512v5.309A1.192,1.192,0,0,0,9.705,29Z" fill="#103f91" />
      <path d="M16.434,8.2H8.512V24.45h7.922a1.2,1.2,0,0,0,1.194-1.191V9.391A1.2,1.2,0,0,0,16.434,8.2Z" opacity="0.1" />
      <path d="M15.783,8.85H8.512V25.1h7.271a1.2,1.2,0,0,0,1.194-1.191V10.041A1.2,1.2,0,0,0,15.783,8.85Z" opacity="0.2" />
      <path d="M15.783,8.85H8.512V23.8h7.271a1.2,1.2,0,0,0,1.194-1.191V10.041A1.2,1.2,0,0,0,15.783,8.85Z" opacity="0.2" />
      <path d="M15.132,8.85H8.512V23.8h6.62a1.2,1.2,0,0,0,1.194-1.191V10.041A1.2,1.2,0,0,0,15.132,8.85Z" opacity="0.2" />
      <path d="M3.194,8.85H15.132a1.193,1.193,0,0,1,1.194,1.191V21.959a1.193,1.193,0,0,1-1.194,1.191H3.194A1.192,1.192,0,0,1,2,21.959V10.041A1.192,1.192,0,0,1,3.194,8.85Z" fill="url(#workspace-composer-word-gradient)" />
      <path d="M6.9,17.988c.023.184.039.344.046.481h.028c.01-.13.032-.287.065-.47s.062-.338.089-.465l1.255-5.407h1.624l1.3,5.326a7.761,7.761,0,0,1,.162,1h.022a7.6,7.6,0,0,1,.135-.975l1.039-5.358h1.477l-1.824,7.748H10.591L9.354,14.742q-.054-.222-.122-.578t-.084-.52H9.127q-.021.189-.084.561c-.042.249-.075.432-.1.552L7.78,19.871H6.024L4.19,12.127h1.5l1.131,5.418A4.469,4.469,0,0,1,6.9,17.988Z" fill="#fff" />
    </svg>
  )
}

/** Excel file glyph for attachment chips — https://www.svgrepo.com/svg/373589/excel */
function ExcelFileIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="workspace-composer-excel-gradient" x1="4.494" y1="-2092.086" x2="13.832" y2="-2075.914" gradientTransform="translate(0 2100)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#18884f" />
          <stop offset="0.5" stopColor="#117e43" />
          <stop offset="1" stopColor="#0b6631" />
        </linearGradient>
      </defs>
      <path d="M19.581,15.35,8.512,13.4V27.809A1.192,1.192,0,0,0,9.705,29h19.1A1.192,1.192,0,0,0,30,27.809h0V22.5Z" fill="#185c37" />
      <path d="M19.581,3H9.705A1.192,1.192,0,0,0,8.512,4.191h0V9.5L19.581,16l5.861,1.95L30,16V9.5Z" fill="#21a366" />
      <path d="M8.512,9.5H19.581V16H8.512Z" fill="#107c41" />
      <path d="M16.434,8.2H8.512V24.45h7.922a1.2,1.2,0,0,0,1.194-1.191V9.391A1.2,1.2,0,0,0,16.434,8.2Z" opacity="0.1" />
      <path d="M15.783,8.85H8.512V25.1h7.271a1.2,1.2,0,0,0,1.194-1.191V10.041A1.2,1.2,0,0,0,15.783,8.85Z" opacity="0.2" />
      <path d="M15.783,8.85H8.512V23.8h7.271a1.2,1.2,0,0,0,1.194-1.191V10.041A1.2,1.2,0,0,0,15.783,8.85Z" opacity="0.2" />
      <path d="M15.132,8.85H8.512V23.8h6.62a1.2,1.2,0,0,0,1.194-1.191V10.041A1.2,1.2,0,0,0,15.132,8.85Z" opacity="0.2" />
      <path d="M3.194,8.85H15.132a1.193,1.193,0,0,1,1.194,1.191V21.959a1.193,1.193,0,0,1-1.194,1.191H3.194A1.192,1.192,0,0,1,2,21.959V10.041A1.192,1.192,0,0,1,3.194,8.85Z" fill="url(#workspace-composer-excel-gradient)" />
      <path d="M5.7,19.873l2.511-3.884-2.3-3.862H7.758L9.013,14.6c.116.234.2.408.238.524h.017c.082-.188.169-.369.26-.546l1.342-2.447h1.7l-2.359,3.84,2.419,3.905H10.821l-1.45-2.711A2.355,2.355,0,0,1,9.2,16.8H9.176a1.688,1.688,0,0,1-.168.351L7.515,19.873Z" fill="#fff" />
      <path d="M28.806,3H19.581V9.5H30V4.191A1.192,1.192,0,0,0,28.806,3Z" fill="#33c481" />
      <path d="M19.581,16H30v6.5H19.581Z" fill="#107c41" />
    </svg>
  )
}

/** Picks the right file glyph for a given file format. */
function fileFormatIcon(format: FileFormat, size = 20) {
  if (format === 'DOCX') return <WordFileIcon size={size} />
  if (format === 'XLSX') return <ExcelFileIcon size={size} />
  return <PdfFileIcon size={size} />
}

type PendingAttachment = { id: string; name: string; format: FileFormat; status: 'processing' | 'done' } & (
  | { kind: 'file'; file: File }
  | { kind: 'doc'; doc: MetadataDocument; source: DocSource }
)

function MessageComposer({ value, onChange, onSend, placeholder, autoSize, seedAttachments, onSeedAttachmentsConsumed }: {
  value: string
  onChange: (value: string) => void
  onSend: (attachments: OutgoingAttachment[]) => void
  placeholder: string
  autoSize: { minRows: number; maxRows: number }
  seedAttachments: { doc: MetadataDocument; source: DocSource }[]
  onSeedAttachmentsConsumed: () => void
}) {
  const [attachments, setAttachments] = useState<PendingAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const chipRowRef = useRef<HTMLDivElement>(null)
  const [chipRowHeight, setChipRowHeight] = useState(0)
  const hasAttachments = attachments.length > 0

  const handleFilesSelected = (list: FileList | null) => {
    if (!list || list.length === 0) return
    const added = Array.from(list).map(file => ({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      format: guessFormat(file.name),
      status: 'processing' as const,
      kind: 'file' as const,
      file,
    }))
    setAttachments(prev => [...prev, ...added])
    const addedIds = new Set(added.map(a => a.id))
    setTimeout(() => {
      setAttachments(prev => prev.map(a => addedIds.has(a.id) ? { ...a, status: 'done' as const } : a))
    }, 1200)
  }

  // Documents sent here from the Documents list (e.g. the "Add N to chat" toolbar action)
  // are represented exactly like a freshly picked file — as a chip in this same row —
  // rather than as generated text. They're already fully in the system, so unlike a real
  // upload there's no "processing" delay: they land as 'done' immediately. The seed is
  // consumed (cleared by the parent) right after being applied — otherwise, since it lives
  // above this component, a later remount (e.g. leaving and returning to the space) would
  // re-seed the exact same docs even after the user had deliberately removed them.
  useEffect(() => {
    if (seedAttachments.length === 0) return
    setAttachments(prev => {
      const existingDocIds = new Set(prev.filter(a => a.kind === 'doc').map(a => a.doc._id))
      const toAdd = seedAttachments
        .filter(s => !existingDocIds.has(s.doc._id))
        .map(s => ({ id: `att-doc-${s.doc._id}`, name: stripYear(s.doc.name), format: s.doc.fileFormat, status: 'done' as const, kind: 'doc' as const, doc: s.doc, source: s.source }))
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev
    })
    onSeedAttachmentsConsumed()
  }, [seedAttachments, onSeedAttachmentsConsumed])

  // The DS TextArea's auto-resize only recalculates off its own value/minRows/maxRows —
  // it doesn't notice the chip row's height (and therefore the field's needed size)
  // shrinking via CSS alone, so it never shrinks back down on its own. Remounting it
  // (via `key`) forces a fresh measurement on every attachment change, in either
  // direction. Refocus after, so the field is ready to type in right away either way —
  // skipped on first mount so the composer doesn't steal focus just from loading.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    textAreaRef.current?.focus()
  }, [attachments.length])

  const isProcessing = attachments.some(a => a.status === 'processing')
  const canSend = (value.trim().length > 0 || attachments.length > 0) && !isProcessing

  const triggerSend = () => {
    if (!canSend) return
    onSend(attachments.map(a => a.kind === 'file' ? { kind: 'file' as const, file: a.file } : { kind: 'doc' as const, doc: a.doc, source: a.source }))
    setAttachments([])
  }

  // The chip row can wrap to more than one line once several files are attached, so its
  // real height is measured rather than assumed — the textarea's top padding (below) is
  // driven by this via a CSS var, and the field's own auto-resize (which measures its
  // actual content box, padding included) takes care of growing the field to fit while
  // always leaving room for `autoSize.minRows` of typing underneath.
  useLayoutEffect(() => {
    if (!hasAttachments) { setChipRowHeight(0); return }
    const el = chipRowRef.current
    if (!el) return
    setChipRowHeight(el.getBoundingClientRect().height)
    const observer = new ResizeObserver(entries => setChipRowHeight(entries[0].contentRect.height))
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasAttachments])

  // Only raises the ceiling so wrapped chip rows have room to grow into — actual height
  // stays driven by real content (chips + minRows of text), never forced taller than needed.
  // The ceiling itself scales with the measured chip row height so it still fits when
  // several files wrap the chips onto two (or more) lines — a fixed row bump doesn't.
  const chipRowsNeeded = hasAttachments ? Math.ceil((chipRowHeight + 24) / 20) : 0
  const effectiveAutoSize = hasAttachments ? { minRows: autoSize.minRows, maxRows: autoSize.maxRows + chipRowsNeeded } : autoSize

  return (
    <div
      className={`workspace-composer-field${hasAttachments ? ' has-attachment' : ''}`}
      style={{ position: 'relative', ...(hasAttachments ? { '--attachment-row-height': `${chipRowHeight}px` } : {}) } as React.CSSProperties}
    >
      {hasAttachments && (
        <div ref={chipRowRef} style={{ position: 'absolute', top: spacing(2), left: spacing(2), right: spacing(2), display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing(2), zIndex: 2 }}>
          {attachments.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px ${spacing(3)}px`, border: `1px solid ${colorPalette.neutral.lighten1}`, borderRadius: 8, backgroundColor: colorPalette.white }}>
              {fileFormatIcon(a.format)}
              <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD} maxLines={1}>{a.name}</Typography>
              {a.status === 'processing'
                ? <Spinner size="small" />
                : <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setAttachments(prev => prev.filter(x => x.id !== a.id))} />}
            </div>
          ))}
          {attachments.length > 1 && (
            <ButtonGhost leftIcon={iconType.CrossOutlined} onClick={() => setAttachments([])}>Remove all</ButtonGhost>
          )}
        </div>
      )}
      <TextArea
        key={attachments.length}
        ref={textAreaRef}
        name="workspace-composer-input"
        value={value}
        placeholder={placeholder}
        autoSize={effectiveAutoSize}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); triggerSend() } }}
      />
      <div style={{ position: 'absolute', left: spacing(2), bottom: spacing(2), display: 'flex', gap: spacing(2) }}>
        <ButtonTertiary leftIcon={iconType.PlusOutlined} onClick={() => fileInputRef.current?.click()}>Add document</ButtonTertiary>
        <Dropdown
          items={PROMPT_TEMPLATES.map((t, i) => ({ key: String(i), label: t, onClick: () => onChange(t) }))}
          trigger={dropdownTriggers.CLICK}
          placement={dropdownPlacement.TOP_LEFT}
        >
          <ButtonTertiary leftIcon={iconType.NoteOutlined}>Prompt templates</ButtonTertiary>
        </Dropdown>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.xlsx,.txt"
        style={{ display: 'none' }}
        onChange={e => { handleFilesSelected(e.target.files); e.target.value = '' }}
      />
      <div className="workspace-composer-send" style={{ position: 'absolute', right: spacing(2), bottom: spacing(2) }}>
        <ButtonPrimary shape={buttonShapes.SQUARE} leftIcon={iconType.SendOutlined} onClick={triggerSend} disabled={!canSend} />
      </div>
    </div>
  )
}

// ─── Landing (chat-first) view ────────────────────────────────────────────────

function LandingView({ space, docs, sessions, seedAttachments, onSeedAttachmentsConsumed, onBackToList, onOpenDocuments, onSend, onOpenSession, onDeleteSession }: {
  space: Space
  docs: MetadataDocument[]
  sessions: ChatSession[]
  seedAttachments: { doc: MetadataDocument; source: DocSource }[]
  onSeedAttachmentsConsumed: () => void
  onBackToList: () => void
  onOpenDocuments: () => void
  onSend: (text: string, attachments: OutgoingAttachment[]) => void
  onOpenSession: (id: string) => void
  onDeleteSession: (id: string) => void
}) {
  const [input, setInput] = useState('')
  const [sortDesc, setSortDesc] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSend = (attachments: OutgoingAttachment[]) => {
    const text = input.trim()
    if (!text && attachments.length === 0) return
    onSend(text, attachments)
    setInput('')
  }

  const sorted = [...sessions]
    .filter(s => !searchQuery.trim() || s.title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    .sort((a, b) => sortDesc ? b.updatedAt - a.updatedAt : a.updatedAt - b.updatedAt)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, padding: `${spacing(6)}px ${spacing(4)}px 0` }}>
        <Breadcrumbs items={[
          { title: 'Workspaces', onClick: onBackToList },
          { title: space.name },
        ]} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 840, margin: '0 auto', padding: `${spacing(4)}px ${spacing(10)}px ${spacing(10)}px`, display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(3) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
                <SpaceAvatar space={space} size={32} />
                <Typography size="heading-lg" weight="bold">{space.name}</Typography>
                <VisibilityIcon space={space} />
              </div>
              <ButtonTertiary leftIcon={iconType.FolderOutlined} onClick={onOpenDocuments}>
                {docs.length} document{docs.length !== 1 ? 's' : ''}
              </ButtonTertiary>
            </div>
            <Typography size="base-sm" color="neutral-darken2">{space.description}</Typography>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <MessageComposer
              value={input}
              onChange={setInput}
              onSend={handleSend}
              seedAttachments={seedAttachments}
              onSeedAttachmentsConsumed={onSeedAttachmentsConsumed}
              placeholder="Describe a task, or ask about a document"
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
            <Typography size="base-sm" color="neutral-darken2" align="center">
              CoPilot can make mistakes. Always check important information.
            </Typography>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <SearchBar placeholder="Search chats" value={searchQuery} onChange={setSearchQuery} width={searchbarWidth.EXPANDED} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Dropdown
                items={[
                  { key: 'newest', label: 'Newest first', onClick: () => setSortDesc(true) },
                  { key: 'oldest', label: 'Oldest first', onClick: () => setSortDesc(false) },
                ]}
                trigger={dropdownTriggers.CLICK}
                placement={dropdownPlacement.BOTTOM_RIGHT}
              >
                <ButtonGhost leftIcon={iconType.ArrowSwapOutlined}>Sort</ButtonGhost>
              </Dropdown>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
              {sorted.length === 0 ? (
                <div style={{ padding: `${spacing(8)}px 0`, textAlign: 'center' }}>
                  <Typography size="base-sm" color="neutral-darken2">
                    {searchQuery.trim() ? 'No chats match your search.' : 'No requests yet — describe a task above to get started.'}
                  </Typography>
                </div>
              ) : sorted.map(s => (
                <TaskCard key={s.id} session={s} onOpen={() => onOpenSession(s.id)} onDelete={() => onDeleteSession(s.id)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ session, onOpen, onDelete }: { session: ChatSession; onOpen: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)
  const hasAttachments = session.messages.some(m => m.attachments && m.attachments.length > 0)
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(3),
        padding: `${spacing(2)}px ${spacing(3)}px`, borderRadius: 8, cursor: 'pointer',
        border: `1px solid ${hovered ? colorPalette.blue.base : '#e5e7eb'}`, backgroundColor: colorPalette.white,
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
          <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{session.title}</Typography>
          {hasAttachments && (
            <Tooltip title="References an attached file" placement={tooltipPlacements.TOP}>
              <div style={{ display: 'flex' }}>
                <Icon type={iconType.PaperclipOutlined} size={12} color="neutral-darken2" />
              </div>
            </Tooltip>
          )}
        </div>
        <Typography size="base-sm" color="neutral-darken2">{relativeTime(session.updatedAt)}</Typography>
      </div>
      <div onClick={e => e.stopPropagation()}>
        <Dropdown
          items={[
            { key: 'open', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.CommentOutlined} size={16} />Open request</span>, onClick: onOpen },
            { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: onDelete },
          ]}
          trigger={dropdownTriggers.CLICK}
          placement={dropdownPlacement.BOTTOM_RIGHT}
        >
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
        </Dropdown>
      </div>
    </div>
  )
}

// ─── Chat detail (full thread) view ───────────────────────────────────────────

function ChatAttachmentCard({ space, attachment }: { space: Space; attachment: ChatAttachment }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: spacing(2), width: 360, maxWidth: '100%',
      padding: `${spacing(2)}px ${spacing(3)}px`, borderRadius: 8, border: '1px solid #beceed', backgroundColor: colorPalette.white,
    }}>
      {fileFormatIcon(attachment.format, 20)}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Typography as="span" size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{attachment.name}</Typography>
        </span>
        <Typography size="base-sm" color="neutral-base">{attachment.format} · {attachment.size}</Typography>
      </div>
      {sourceIcon(attachment.source, 20, attachment.source !== 'local' ? spaceConnectorLabel(space, attachment.source) : undefined)}
    </div>
  )
}

function ChatUserBubble({ space, message }: { space: Space; message: ChatMessage }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: spacing(2) }}>
      {message.attachments && message.attachments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2), alignItems: 'flex-end' }}>
          {message.attachments.map(a => <ChatAttachmentCard key={a.id} space={space} attachment={a} />)}
        </div>
      )}
      {message.content && (
        <div style={{ maxWidth: '70%', backgroundColor: '#eef2fc', borderRadius: 16, padding: `${spacing(3)}px ${spacing(4)}px` }}>
          <Typography size="base" color="neutral-darken5">{message.content}</Typography>
        </div>
      )}
    </div>
  )
}

function ChatAssistantBlock({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      {message.pending ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <Spinner size="small" />
          <Typography size="base" color="neutral-darken2">Thinking…</Typography>
        </div>
      ) : (
        <>
          <Typography size="base" color="neutral-darken5">{renderLiteMarkdown(message.content)}</Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThumbsUpOutlined} />
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThumbsDownOutlined} />
            <ButtonGhost
              shape={buttonShapes.SQUARE}
              leftIcon={copied ? iconType.CheckOutlined : iconType.CopyOutlined}
              onClick={() => { navigator.clipboard?.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
            />
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.RefreshOutlined} />
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.LinkOutlined} />
          </div>
        </>
      )}
    </div>
  )
}

function ChatDetailView({ space, session, onBack, onSend }: {
  space: Space
  docs: MetadataDocument[]
  session: ChatSession
  onBack: () => void
  onSend: (text: string, attachments: OutgoingAttachment[]) => void
}) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [session.messages.length, session.messages[session.messages.length - 1]?.content])

  const handleSend = (attachments: OutgoingAttachment[]) => {
    const text = input.trim()
    if (!text && attachments.length === 0) return
    onSend(text, attachments)
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, padding: `${spacing(6)}px ${spacing(4)}px 0` }}>
        <Breadcrumbs items={[
          { title: 'Workspaces', onClick: onBack },
          { title: space.name, onClick: onBack },
          { title: session.title },
        ]} />
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 840, width: '100%', padding: `${spacing(4)}px ${spacing(8)}px`, display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
          {session.messages.map(m => m.role === 'user' ? <ChatUserBubble key={m.id} space={space} message={m} /> : <ChatAssistantBlock key={m.id} message={m} />)}
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: `0 ${spacing(8)}px ${spacing(4)}px`, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 840, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <MessageComposer
            value={input}
            onChange={setInput}
            onSend={handleSend}
            seedAttachments={[]}
            onSeedAttachmentsConsumed={() => {}}
            placeholder="Describe a task"
            autoSize={{ minRows: 2, maxRows: 5 }}
          />
          <Typography size="base-sm" color="neutral-darken2" align="center">
            CoPilot can make mistakes. Always check important information.
          </Typography>
        </div>
      </div>
    </div>
  )
}

// ─── Documents drawer ─────────────────────────────────────────────────────────

function DocCard({ space, doc, source, selected, isNew, onToggle, onOpen, onSendToChat, onDelete }: {
  space: Space
  doc: MetadataDocument
  source: DocSource
  selected: boolean
  isNew?: boolean
  onToggle: () => void
  onOpen: () => void
  onSendToChat: () => void
  onDelete: () => void
}) {
  return (
    <div onClick={onOpen} className={isNew ? 'doc-card-new' : undefined} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: spacing(3), cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: spacing(2), backgroundColor: selected ? colorPalette.neutral.lighten4 : undefined }}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div onClick={e => e.stopPropagation()} style={{ paddingTop: 2 }}><Checkbox checked={selected} onChange={onToggle} /></div>
        <div style={{ flexShrink: 0, paddingTop: 2 }}>{fileFormatIcon(doc.fileFormat, 20)}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(2) }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography size="base" color="neutral-darken5" weight={fontWeight.SEMIBOLD} maxLines={1}>{stripYear(doc.name)}</Typography>
            <Typography size="base-sm" color="neutral-darken2">{doc.documentType} · {formatDate(doc.uploadedDate)} · {doc.fileSize}</Typography>
          </div>
          <div onClick={e => e.stopPropagation()}>
            <Dropdown
              items={[
                { key: 'chat', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.SendOutlined} size={16} />Send to chat</span>, onClick: onSendToChat },
                { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => {} },
                { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: onDelete },
              ]}
              trigger={dropdownTriggers.CLICK}
              placement={dropdownPlacement.BOTTOM_RIGHT}
            >
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
            </Dropdown>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(2) }}>
          <div onClick={e => e.stopPropagation()} style={{ flex: 1, minWidth: 0 }}>
            <Overflow
              items={getDocumentTags(doc).map((t, i) => <Chip key={i} label={t.text} chipStyle={t.style as ChipStyleValue} variant={(t.variant as typeof chipVariants[keyof typeof chipVariants]) ?? chipVariants.SUBTLE} />)}
              trigger="click"
            />
          </div>
          <div onClick={e => e.stopPropagation()}>{sourceIcon(source, 20, source !== 'local' ? spaceConnectorLabel(space, source) : undefined)}</div>
        </div>
      </div>
    </div>
  )
}

const DOCS_PAGE_SIZE = 20

type FilterCategory = 'type' | 'format' | 'tag'

function computeActiveFilters(typeFilter: string[], formatFilter: string[], tagFilter: string[]): { category: FilterCategory; value: string }[] {
  return [
    ...typeFilter.map(value => ({ category: 'type' as const, value })),
    ...formatFilter.map(value => ({ category: 'format' as const, value })),
    ...tagFilter.map(value => ({ category: 'tag' as const, value })),
  ]
}

function DocumentsDrawer({ visible, space, docs, sourceMap, highlightDocIds, typeFilter, formatFilter, tagFilter, search, setSearch, selected, setSelected, page, setPage, onClose, onOpenFilter, onOpenAdd, onOpenDoc, onSendToChat, onDeleteDocs, onClearFilter, onClearAllFilters, onExpand }: {
  visible: boolean
  space: Space
  docs: MetadataDocument[]
  sourceMap: Map<string, DocSource>
  highlightDocIds: Set<string>
  typeFilter: string[]
  formatFilter: string[]
  tagFilter: string[]
  search: string
  setSearch: Dispatch<SetStateAction<string>>
  selected: Set<string>
  setSelected: Dispatch<SetStateAction<Set<string>>>
  page: number
  setPage: Dispatch<SetStateAction<number>>
  onClose: () => void
  onOpenFilter: () => void
  onOpenAdd: () => void
  onOpenDoc: (id: string) => void
  onSendToChat: (docs: MetadataDocument[]) => void
  onDeleteDocs: (ids: Set<string>) => void
  onClearFilter: (category: FilterCategory, value: string) => void
  onClearAllFilters: () => void
  onExpand: () => void
}) {
  const [pendingDelete, setPendingDelete] = useState<Set<string> | null>(null)
  const filtered = docs.filter(d => !search || stripYear(d.name).toLowerCase().includes(search.toLowerCase()))
  const allSelected = filtered.length > 0 && filtered.every(d => selected.has(d._id))
  const pageDocs = filtered.slice((page - 1) * DOCS_PAGE_SIZE, page * DOCS_PAGE_SIZE)
  const selectedDocs = docs.filter(d => selected.has(d._id))
  const allSelectedManual = selectedDocs.length > 0 && selectedDocs.every(d => (sourceMap.get(d._id) ?? 'local') === 'local')
  const activeFilters = computeActiveFilters(typeFilter, formatFilter, tagFilter)

  useEffect(() => { setPage(1) }, [search, docs.length, setPage])

  // The Panel body wraps children in an auto-height container, so a plain
  // `height: 100%` column never resolves and the doc list can't bound its own
  // scroll — measure the real drawer body height so the list scrolls
  // internally instead of pushing the toolbar/footer off-screen.
  const columnRef = useRef<HTMLDivElement>(null)
  const [bodyHeight, setBodyHeight] = useState<number>()
  useLayoutEffect(() => {
    if (!visible) return
    const el = columnRef.current?.closest('.goat-drawer-body')
    if (!(el instanceof HTMLElement)) return
    const update = () => {
      const cs = getComputedStyle(el)
      setBodyHeight(el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [visible])

  return (
    <Panel
      visible={visible}
      onClose={onClose}
      placement={panelPlacements.RIGHT}
      size={panelSizes.MEDIUM}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <Icon type={iconType.FolderOutlined} size={20} color="neutral-darken5" />
            <span style={{ fontSize: 20, fontWeight: 600, color: colorPalette.neutral.darken5 }}>Documents</span>
          </div>
          <Tooltip title="View as full page">
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ExternalLinkOutlined} onClick={onExpand} />
          </Tooltip>
        </div>
      }
    >
      <div ref={columnRef} style={{ display: 'flex', flexDirection: 'column', gap: spacing(4), height: bodyHeight ?? '100%' }}>
        <SearchBar placeholder="Search documents" value={search} onChange={setSearch} width={searchbarWidth.EXPANDED} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(2) }}>
          {selected.size > 0 ? (
            <Checkbox checked={allSelected} indeterminate={!allSelected} onChange={() => setSelected(new Set())}>
              {selected.size} selected
            </Checkbox>
          ) : (
            <Checkbox
              checked={allSelected}
              onChange={e => setSelected(new Set(e.target.checked ? filtered.map(d => d._id) : []))}
            >
              Select all ({filtered.length})
            </Checkbox>
          )}
          <div style={{ display: 'flex', gap: spacing(2) }}>
            <ButtonSecondary leftIcon={iconType.FilterOutlined} onClick={onOpenFilter}>Filter/Sort</ButtonSecondary>
            <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={onOpenAdd}>Add</ButtonPrimary>
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(2) }}>
            <div style={{ flexShrink: 0, paddingTop: 2 }}>
              <Typography size="base-sm" color="neutral-darken2" weight={fontWeight.SEMIBOLD}>Filters:</Typography>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing(2) }}>
              {activeFilters.map(f => (
                <Chip
                  key={`${f.category}-${f.value}`}
                  label={f.value}
                  chipStyle={chipStyles.ACCENT_NEUTRAL}
                  variant={chipVariants.HIGHLIGHT}
                  closable
                  onClose={() => onClearFilter(f.category, f.value)}
                />
              ))}
              <ButtonTertiary size={buttonSizes.SMALL} leftIcon={iconType.CrossOutlined} onClick={onClearAllFilters}>Clear all</ButtonTertiary>
            </div>
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          {pageDocs.length === 0 ? (
            <Typography size="base-sm" color="neutral-darken2">No documents match your search.</Typography>
          ) : pageDocs.map(doc => (
            <DocCard
              key={doc._id}
              space={space}
              doc={doc}
              source={sourceMap.get(doc._id) ?? 'local'}
              selected={selected.has(doc._id)}
              isNew={highlightDocIds.has(doc._id)}
              onToggle={() => setSelected(prev => { const next = new Set(prev); if (next.has(doc._id)) next.delete(doc._id); else next.add(doc._id); return next })}
              onOpen={() => onOpenDoc(doc._id)}
              onSendToChat={() => onSendToChat([doc])}
              onDelete={() => setPendingDelete(new Set([doc._id]))}
            />
          ))}
          {filtered.length > DOCS_PAGE_SIZE && (
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
              <Pagination current={page} total={filtered.length} pageSize={DOCS_PAGE_SIZE} onChange={setPage} />
            </div>
          )}
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px 0` }}>
            <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
            <Typography size="base-sm" color="neutral-darken2">
              All files are securely uploaded and scanned for viruses. <span style={{ color: colorPalette.blue.base, textDecoration: 'underline', cursor: 'pointer' }}>Learn more</span>
            </Typography>
          </div>
        </div>
        {selected.size > 0 && (
          <div style={{ flexShrink: 0, marginTop: -spacing(4), marginLeft: -spacing(6), marginRight: -spacing(6), paddingLeft: spacing(2), paddingRight: spacing(2), marginBottom: spacing(2) }}>
            <Toolbar
              visible
              position="sticky"
              leftItems={[
                <ButtonGhost key="clear" shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setSelected(new Set())} />,
                <ButtonTertiary key="send-to-chat" leftIcon={iconType.SendOutlined} onClick={() => onSendToChat(selectedDocs)}>
                  Send {selected.size} to chat
                </ButtonTertiary>,
                ...(allSelectedManual ? [
                  <ButtonTertiary key="download" leftIcon={iconType.DownloadOutlined} onClick={() => {}}>
                    Download {selected.size}
                  </ButtonTertiary>,
                ] : []),
              ]}
              rightItems={[
                <ButtonDanger key="delete" leftIcon={iconType.TrashOutlined} onClick={() => setPendingDelete(selected)}>Delete</ButtonDanger>,
              ]}
            />
          </div>
        )}
      </div>

      <Modal
        visible={pendingDelete !== null}
        variant={modalVariants.DANGER}
        title={pendingDelete?.size === 1 ? 'Delete Document' : 'Delete Documents'}
        onClose={() => setPendingDelete(null)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: () => setPendingDelete(null) } },
          { variant: buttonVariants.DANGER, props: { children: 'Delete', onClick: () => {
            if (!pendingDelete) return
            onDeleteDocs(pendingDelete)
            setSelected(prev => { const next = new Set(prev); pendingDelete.forEach(id => next.delete(id)); return next })
            setPendingDelete(null)
          } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">
          {pendingDelete?.size === 1 ? (
            <>Delete <strong>{stripYear(docs.find(d => d._id === [...pendingDelete][0])?.name ?? 'this document')}</strong>? This cannot be undone.</>
          ) : (
            <>Delete <strong>{pendingDelete?.size ?? 0} document{pendingDelete?.size !== 1 ? 's' : ''}</strong>? This cannot be undone.</>
          )}
        </Typography>
      </Modal>
    </Panel>
  )
}

// ─── Documents table (full-page) ───────────────────────────────────────────

function DocumentsTableView({ space, docs, sourceMap, highlightDocIds, typeFilter, formatFilter, tagFilter, search, setSearch, selected, setSelected, page, setPage, onBack, onOpenFilter, onOpenAdd, onOpenDoc, onSendToChat, onDeleteDocs, onClearFilter, onClearAllFilters }: {
  space: Space
  docs: MetadataDocument[]
  sourceMap: Map<string, DocSource>
  highlightDocIds: Set<string>
  typeFilter: string[]
  formatFilter: string[]
  tagFilter: string[]
  search: string
  setSearch: Dispatch<SetStateAction<string>>
  selected: Set<string>
  setSelected: Dispatch<SetStateAction<Set<string>>>
  page: number
  setPage: Dispatch<SetStateAction<number>>
  onBack: () => void
  onOpenFilter: () => void
  onOpenAdd: () => void
  onOpenDoc: (id: string) => void
  onSendToChat: (docs: MetadataDocument[]) => void
  onDeleteDocs: (ids: Set<string>) => void
  onClearFilter: (category: FilterCategory, value: string) => void
  onClearAllFilters: () => void
}) {
  const [pendingDelete, setPendingDelete] = useState<Set<string> | null>(null)
  const filtered = docs.filter(d => !search || stripYear(d.name).toLowerCase().includes(search.toLowerCase()))
  const allSelected = filtered.length > 0 && filtered.every(d => selected.has(d._id))
  const someSelected = filtered.some(d => selected.has(d._id))
  const pageDocs = filtered.slice((page - 1) * DOCS_PAGE_SIZE, page * DOCS_PAGE_SIZE)
  const selectedDocs = docs.filter(d => selected.has(d._id))
  const allSelectedManual = selectedDocs.length > 0 && selectedDocs.every(d => (sourceMap.get(d._id) ?? 'local') === 'local')
  const activeFilters = computeActiveFilters(typeFilter, formatFilter, tagFilter)

  const columns = useMemo(() => {
    const rowStyle = (record: MetadataDocument) => ({
      cursor: 'pointer',
      verticalAlign: 'middle',
      backgroundColor: highlightDocIds.has(record._id) ? '#F0F7FF' : selected.has(record._id) ? '#EEF4FF' : undefined,
    })

    const checkboxCol = {
      title: () => (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={e => {
            setSelected(prev => {
              const next = new Set(prev)
              filtered.forEach(d => { if (e.target.checked) next.add(d._id); else next.delete(d._id) })
              return next
            })
          }}
        />
      ),
      key: 'checkbox',
      width: 48,
      onCell: (record: MetadataDocument) => ({ style: { backgroundColor: rowStyle(record).backgroundColor }, onClick: (e: React.MouseEvent) => e.stopPropagation() }),
      render: (_: unknown, record: MetadataDocument) => (
        <Checkbox
          checked={selected.has(record._id)}
          onChange={e => {
            setSelected(prev => {
              const next = new Set(prev)
              if (e.target.checked) next.add(record._id); else next.delete(record._id)
              return next
            })
          }}
          onClick={e => e.stopPropagation()}
        />
      ),
    }

    const nameCol = {
      title: 'Document Name',
      key: 'name',
      dataIndex: 'name',
      ellipsis: true,
      sorter: (a: MetadataDocument, b: MetadataDocument) => stripYear(a.name).localeCompare(stripYear(b.name)),
      onCell: (record: MetadataDocument) => ({ onClick: () => onOpenDoc(record._id), style: rowStyle(record) }),
      render: (name: string, record: MetadataDocument) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), overflow: 'hidden' }}>
          {fileFormatIcon(record.fileFormat, 18)}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stripYear(name)}</span>
        </div>
      ),
    }

    const typeCol = {
      title: 'Type',
      key: 'documentType',
      dataIndex: 'documentType',
      width: 170,
      sorter: (a: MetadataDocument, b: MetadataDocument) => a.documentType.localeCompare(b.documentType),
      onCell: (record: MetadataDocument) => ({ onClick: () => onOpenDoc(record._id), style: rowStyle(record) }),
    }

    const tagsCol = {
      title: 'Tags',
      key: 'tags',
      width: 260,
      onCell: (record: MetadataDocument) => ({ style: rowStyle(record) }),
      render: (_: unknown, record: MetadataDocument) => <TagsCellInner tags={getDocumentTags(record)} />,
    }

    const sourceCol = {
      title: 'Source',
      key: 'source',
      width: 72,
      onCell: (record: MetadataDocument) => ({ style: rowStyle(record) }),
      render: (_: unknown, record: MetadataDocument) => {
        const src = sourceMap.get(record._id) ?? 'local'
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sourceIcon(src, 18, src !== 'local' ? spaceConnectorLabel(space, src) : undefined)}</div>
      },
    }

    const uploadedCol = {
      title: 'Uploaded',
      key: 'uploadedDate',
      dataIndex: 'uploadedDate',
      width: 120,
      sorter: (a: MetadataDocument, b: MetadataDocument) => a.uploadedDate.localeCompare(b.uploadedDate),
      onCell: (record: MetadataDocument) => ({ onClick: () => onOpenDoc(record._id), style: rowStyle(record) }),
      render: (val: string) => formatDate(val),
    }

    const sizeCol = {
      title: 'Size',
      key: 'fileSize',
      dataIndex: 'fileSize',
      width: 90,
      onCell: (record: MetadataDocument) => ({ onClick: () => onOpenDoc(record._id), style: rowStyle(record) }),
    }

    const actionsCol = {
      title: '',
      key: 'actions',
      width: 56,
      onCell: (record: MetadataDocument) => ({ style: rowStyle(record), onClick: (e: React.MouseEvent) => e.stopPropagation() }),
      render: (_: unknown, record: MetadataDocument) => (
        <Dropdown
          items={[
            { key: 'chat', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.SendOutlined} size={16} />Send to chat</span>, onClick: () => onSendToChat([record]) },
            { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => {} },
            { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => setPendingDelete(new Set([record._id])) },
          ]}
          trigger={dropdownTriggers.CLICK}
          placement={dropdownPlacement.BOTTOM_RIGHT}
        >
          <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
        </Dropdown>
      ),
    }

    return [checkboxCol, nameCol, typeCol, tagsCol, sourceCol, uploadedCol, sizeCol, actionsCol]
  }, [allSelected, someSelected, filtered, selected, setSelected, highlightDocIds, onOpenDoc, onSendToChat, sourceMap, space])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: colorPalette.white, overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, padding: `${spacing(6)}px ${spacing(6)}px 0` }}>
        <Breadcrumbs items={[
          { title: 'Workspaces', onClick: onBack },
          { title: space.name, onClick: onBack },
          { title: 'Documents' },
        ]} />
      </div>
      <div style={{ flexShrink: 0, padding: `${spacing(4)}px ${spacing(6)}px ${spacing(5)}px`, display: 'flex', flexDirection: 'column', gap: spacing(4), borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing(2) }}>
          <Typography size="heading-lg" weight={fontWeight.BOLD}>Documents</Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
            <SearchBar placeholder="Search documents" value={search} onChange={setSearch} />
            <ButtonSecondary leftIcon={iconType.FilterOutlined} onClick={onOpenFilter}>Filter/Sort</ButtonSecondary>
            <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={onOpenAdd}>Add</ButtonPrimary>
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(2) }}>
            <div style={{ flexShrink: 0, paddingTop: 2 }}>
              <Typography size="base-sm" color="neutral-darken2" weight={fontWeight.SEMIBOLD}>Filters:</Typography>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing(2) }}>
              {activeFilters.map(f => (
                <Chip
                  key={`${f.category}-${f.value}`}
                  label={f.value}
                  chipStyle={chipStyles.ACCENT_NEUTRAL}
                  variant={chipVariants.HIGHLIGHT}
                  closable
                  onClose={() => onClearFilter(f.category, f.value)}
                />
              ))}
              <ButtonTertiary size={buttonSizes.SMALL} leftIcon={iconType.CrossOutlined} onClick={onClearAllFilters}>Clear all</ButtonTertiary>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: `0 ${spacing(6)}px` }}>
        <div className="docs-table-sticky-header" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {pageDocs.length === 0 ? (
            <div style={{ padding: spacing(6) }}>
              <Typography size="base-sm" color="neutral-darken2">No documents match your search.</Typography>
            </div>
          ) : (
            <>
              <Table dataSource={pageDocs} columns={columns as never} pagination={false} rowHoverable />
              {filtered.length > DOCS_PAGE_SIZE && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: `${spacing(3)}px 0` }}>
                  <Pagination current={page} total={filtered.length} pageSize={DOCS_PAGE_SIZE} onChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selected.size > 0 && (
        <div style={{ flexShrink: 0, padding: `0 ${spacing(2)}px ${spacing(2)}px` }}>
          <Toolbar
            visible
            position="sticky"
            leftItems={[
              <ButtonGhost key="clear" shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setSelected(new Set())} />,
              <ButtonTertiary key="send-to-chat" leftIcon={iconType.SendOutlined} onClick={() => onSendToChat(selectedDocs)}>
                Send {selected.size} to chat
              </ButtonTertiary>,
              ...(allSelectedManual ? [
                <ButtonTertiary key="download" leftIcon={iconType.DownloadOutlined} onClick={() => {}}>
                  Download {selected.size}
                </ButtonTertiary>,
              ] : []),
            ]}
            rightItems={[
              <ButtonDanger key="delete" leftIcon={iconType.TrashOutlined} onClick={() => setPendingDelete(selected)}>Delete</ButtonDanger>,
            ]}
          />
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
            onDeleteDocs(pendingDelete)
            setSelected(prev => { const next = new Set(prev); pendingDelete.forEach(id => next.delete(id)); return next })
            setPendingDelete(null)
          } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">
          {pendingDelete?.size === 1 ? (
            <>Delete <strong>{stripYear(docs.find(d => d._id === [...pendingDelete][0])?.name ?? 'this document')}</strong>? This cannot be undone.</>
          ) : (
            <>Delete <strong>{pendingDelete?.size ?? 0} document{pendingDelete?.size !== 1 ? 's' : ''}</strong>? This cannot be undone.</>
          )}
        </Typography>
      </Modal>
    </div>
  )
}

// ─── Filter / Sort drawer ─────────────────────────────────────────────────────

function FilterSortDrawer({ visible, docs, sortValue, typeFilter, formatFilter, tagFilter, onBack, onClose, onApply }: {
  visible: boolean
  docs: MetadataDocument[]
  sortValue: SortValue
  typeFilter: string[]
  formatFilter: string[]
  tagFilter: string[]
  onBack: () => void
  onClose: () => void
  onApply: (next: { sortValue: SortValue; typeFilter: string[]; formatFilter: string[]; tagFilter: string[] }) => void
}) {
  const [localSort, setLocalSort] = useState<SortValue>(sortValue)
  const [localTypes, setLocalTypes] = useState<string[]>(typeFilter)
  const [localFormats, setLocalFormats] = useState<string[]>(formatFilter)
  const [localTags, setLocalTags] = useState<string[]>(tagFilter)

  useEffect(() => {
    if (visible) { setLocalSort(sortValue); setLocalTypes(typeFilter); setLocalFormats(formatFilter); setLocalTags(tagFilter) }
  }, [visible, sortValue, typeFilter, formatFilter, tagFilter])

  const uniqueTypes = [...new Set(docs.map(d => d.documentType))]
  const uniqueFormats = [...new Set(docs.map(d => d.fileFormat))]
  const uniqueTags = [...new Set(docs.flatMap(d => getDocumentTags(d).map(t => t.text)))].filter(t => t && t !== '—').slice(0, 10)

  return (
    <Panel
      visible={visible}
      onClose={onClose}
      placement={panelPlacements.RIGHT}
      size={panelSizes.MEDIUM}
      title="Filter/Sort"
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onBack } },
        { variant: buttonVariants.PRIMARY, props: { children: 'Apply', onClick: () => onApply({ sortValue: localSort, typeFilter: localTypes, formatFilter: localFormats, tagFilter: localTags }) } },
      ] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
        {(localTypes.length + localFormats.length + localTags.length) > 0 && (
          <ButtonTertiary leftIcon={iconType.CrossOutlined} onClick={() => { setLocalTypes([]); setLocalFormats([]); setLocalTags([]) }}>
            Clear all filters
          </ButtonTertiary>
        )}
        <RadioGroup
          name="doc-sort"
          label="Sort by"
          direction={radioGroupDirection.COLUMN}
          value={localSort}
          onChange={e => setLocalSort(e.target.value as SortValue)}
          options={[
            { label: 'Date modified (newest first)', value: 'date-desc' },
            { label: 'Date modified (oldest first)', value: 'date-asc' },
            { label: 'Name (A–Z)', value: 'name-asc' },
            { label: 'Name (Z–A)', value: 'name-desc' },
          ]}
        />
        {uniqueTypes.length > 0 && (
          <CheckboxFilterGroup label="Document type" options={uniqueTypes} value={localTypes} onChange={setLocalTypes} />
        )}
        {uniqueFormats.length > 0 && (
          <CheckboxFilterGroup label="Format" options={uniqueFormats} value={localFormats} onChange={setLocalFormats} />
        )}
        {uniqueTags.length > 0 && (
          <CheckboxFilterGroup label="Tags" options={uniqueTags} value={localTags} onChange={setLocalTags} />
        )}
      </div>
    </Panel>
  )
}

function CheckboxFilterGroup({ label, options, value, onChange }: {
  label: string
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD}>{label}</Typography>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
        {options.map(opt => (
          <Checkbox
            key={opt}
            checked={value.includes(opt)}
            onChange={e => onChange(e.target.checked ? [...value, opt] : value.filter(v => v !== opt))}
          >
            {opt}
          </Checkbox>
        ))}
      </div>
    </div>
  )
}

// ─── Add documents drawer ─────────────────────────────────────────────────────

function AddDocumentsDrawer({ visible, space, onClose, onUpload }: {
  visible: boolean
  space: Space
  onClose: () => void
  onUpload: (docs: MetadataDocument[]) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { notification } = useNotifications()

  useEffect(() => { if (!visible) setIsDragging(false) }, [visible])

  const startUpload = (list: FileList | null) => {
    const files = list ? Array.from(list) : []
    if (files.length === 0) return
    onClose()
    const count = files.length
    const fileLabel = count === 1 ? files[0].name : `${count} files`
    const key = `add-documents-upload-${Date.now()}`
    notification.default({
      key,
      title: 'Uploading ...',
      leadingIcon: false,
      dismissible: false,
      content: <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Spinner size="small" /><Typography size="base" color="neutral-darken5">{fileLabel}</Typography></div>,
      placement: toastPlacements.BOTTOM_RIGHT,
      duration: 0,
    })
    setTimeout(() => {
      notification.destroy(key)
      notification.success({
        title: count === 1 ? 'File uploaded successfully' : 'Files uploaded successfully',
        content: fileLabel,
        placement: toastPlacements.BOTTOM_LEFT,
        duration: 4,
      })
      onUpload(files.map(localFileToDoc))
    }, 1800)
  }

  return (
    <Panel
      visible={visible}
      onClose={onClose}
      placement={panelPlacements.RIGHT}
      size={panelSizes.MEDIUM}
      title="Add Documents"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
        <Typography size="base" color="neutral-darken5">Choose where to add your document from.</Typography>

        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); startUpload(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `1px dashed ${isDragging ? colorPalette.blue.base : colorPalette.neutral.base}`,
            borderRadius: 10, padding: `${spacing(8)}px ${spacing(4)}px`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(2),
            cursor: 'pointer', backgroundColor: isDragging ? '#F0F7FF' : colorPalette.white,
            transition: 'border-color 0.15s, background-color 0.15s', textAlign: 'center',
          }}
        >
          <Icon type={iconType.UploadOutlined} size={24} color="neutral-darken3" />
          <Typography size="base" color="neutral-darken2">Click to select a document, or drag and drop it here.</Typography>
          <Typography size="base-sm" color="neutral-base">PDF, DOCX, XLSX, and TXT formats, max size 10 MB</Typography>
        </div>
        <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={e => startUpload(e.target.files)} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
          <Typography size="base-sm" color="neutral-darken5" weight={fontWeight.SEMIBOLD} uppercase>Connected apps</Typography>
          {space.connectors.length === 0 ? (
            <Typography size="base-sm" color="neutral-darken2">No connected apps for this space yet.</Typography>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {space.connectors.map(c => (
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
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(2), padding: `${spacing(3)}px ${spacing(4)}px`, backgroundColor: '#F5F9FF', borderRadius: 8 }}>
          <Icon type={iconType.ShieldCheckFilled} size={16} color="primary-base" />
          <Typography size="base-sm" color="neutral-darken2">Browse and sync documents from your apps. We never modify files without your permission. We never store your credentials.</Typography>
        </div>
      </div>
    </Panel>
  )
}

// ─── Document preview (full page) ────────────────────────────────────────────

function MockDocumentBody({ doc }: { doc: MetadataDocument }) {
  const title = stripYear(doc.name).toUpperCase()
  const summary = DOCUMENT_SNIPPETS[doc._id] ?? `This ${doc.documentType.toLowerCase()} document covers ${doc.domain} matters relevant to ${doc.namedEntity !== '—' ? doc.namedEntity : 'the organization'}.`
  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", lineHeight: 1.8, color: '#1a1a1a', fontSize: 14 }}>
      <div style={{ marginBottom: 24 }}>
        <strong style={{ fontSize: 15 }}>{title}</strong>
        <div style={{ color: '#888', marginTop: 4, fontSize: 13 }}>(Musterdokument / Beispielinhalt)</div>
      </div>
      <section style={{ marginBottom: 20 }}><strong>1. Ausstellende Stelle</strong><div style={{ marginTop: 8 }}>Musterbehörde GmbH<br />Abteilung Verwaltungsservice<br />Musterstraße 25, 10115 Berlin<br />Telefon: +49 30 12345678</div></section>
      <section style={{ marginBottom: 20 }}><strong>2. Referenznummer</strong><div style={{ marginTop: 8 }}>UB-2026-{String(Math.abs(doc.name.length * 1247) % 90000 + 10000)}</div></section>
      <section style={{ marginBottom: 20 }}><strong>3. Ausstellungsdatum</strong><div style={{ marginTop: 8 }}>{formatDate(doc.uploadedDate)}</div></section>
      <section style={{ marginBottom: 20 }}><strong>4. Betreffende Organisation</strong><div style={{ marginTop: 8 }}>{doc.namedEntity !== '—' ? doc.namedEntity : 'Musterunternehmen Verwaltungsservice GmbH'}<br />Beispielallee 14, 80331 München</div></section>
      <section><strong>5. Gegenstand des Dokuments</strong><div style={{ marginTop: 8 }}>{summary}</div></section>
    </div>
  )
}

function DocPreviewView({ space, doc, source, onBack, onSendToChat }: {
  space: Space
  doc: MetadataDocument
  source: DocSource
  onBack: () => void
  onSendToChat: () => void
}) {
  const summary = DOCUMENT_SNIPPETS[doc._id] ?? `This ${doc.documentType.toLowerCase()} document covers ${doc.domain} matters relevant to ${doc.namedEntity !== '—' ? doc.namedEntity : 'the organization'}.`

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', backgroundColor: colorPalette.neutral.lighten3 }}>
      <div style={{ flexShrink: 0, position: 'relative', backgroundColor: '#2f384a', boxShadow: '0px 4px 8px rgba(130,138,155,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: spacing(4) }}>
        <ButtonGhost mode="contrast" leftIcon={iconType.ChevronLeftOutlined} onClick={onBack}>Back</ButtonGhost>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <Typography weight="bold" color="white">{stripYear(doc.name)}.{doc.fileFormat.toLowerCase()}</Typography>
        </div>
        <div style={{ display: 'flex', gap: spacing(2) }}>
          <ButtonTertiary leftIcon={iconType.SendOutlined} onClick={onSendToChat}>Send to chat</ButtonTertiary>
          <Dropdown
            items={[
              { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => {} },
              { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => {} },
            ]}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonTertiary shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorOutlined} />
          </Dropdown>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <div style={{ flex: '0 0 61.67%', minWidth: 0, overflowY: 'auto', padding: `${spacing(6)}px 0 ${spacing(6)}px ${spacing(6)}px` }}>
          <div style={{ backgroundColor: colorPalette.white, borderRadius: 16, padding: spacing(4) }}>
            <MockDocumentBody doc={doc} />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: `${spacing(6)}px ${spacing(6)}px ${spacing(6)}px ${spacing(4)}px` }}>
          <div style={{ backgroundColor: colorPalette.white, borderRadius: 16, padding: spacing(4) }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography weight="bold">Document Details</Typography>
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.EditRecOutlined} />
            </div>
            <div style={{ marginTop: spacing(4) }}>
              <Typography size="base" color="neutral-darken5">{summary}</Typography>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3), marginTop: spacing(3) }}>
              <PropertyItem label="Name" value={stripYear(doc.name)} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
              <PropertyItem label="Type" value={doc.documentType} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
              <PropertyItem label="Uploaded" value={formatDate(doc.uploadedDate)} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
              <PropertyItem label="Format" value={<Chip label={doc.fileFormat} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
              <PropertyItem label="Tags" value={<TagsCellInner tags={getDocumentTags(doc)} />} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
              <PropertyItem
                label="Source"
                value={<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{sourceIcon(source, 16, source !== 'local' ? spaceConnectorLabel(space, source) : undefined)}<Typography size="base" color="neutral-darken5">{sourceLabel(space, source)}</Typography></div>}
                labelProps={{ size: 'base-sm', color: 'neutral-darken2' }}
              />
              <PropertyItem
                label="Status"
                value={<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon type={iconType.CheckCircleFilled} color="success-base" size={16} /><Typography size="base" color="neutral-darken5">{doc.status}</Typography></div>}
                labelProps={{ size: 'base-sm', color: 'neutral-darken2' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
