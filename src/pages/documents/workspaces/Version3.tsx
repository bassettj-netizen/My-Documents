import { useState } from 'react'
import {
  ChatPanel,
  DocumentsPanel,
  Skeleton,
  skeletonVariants,
  SpaceDetailHeader,
  SpacesListView,
  colorPalette,
  spacing,
  useMountLoading,
  useSidebarWidth,
  useWorkspaceState,
} from './shared'

const CHAT_COLUMN_WIDTH = 420

/**
 * Workspaces — Version 3: "Side-by-side split".
 * Documents table on the left, a persistent chat panel on the right —
 * both visible at once, no tab switching required.
 */
export default function WorkspacesVersion3() {
  const {
    spaces, createSpace, updateSpace, deleteSpace,
    getSpaceDocs, setSpaceDocs,
    sessionsBySpace, activeSessionBySpace, newChat, selectChat, deleteChat, sendMessage,
  } = useWorkspaceState()

  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)
  const isLoading = useMountLoading()
  const sidebarWidth = useSidebarWidth()

  const selectedSpace = spaces.find(s => s.id === selectedSpaceId) ?? null

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton variant={skeletonVariants.TEXT} title paragraph={{ rows: 6 }} />
      </div>
    )
  }

  if (view === 'detail' && selectedSpace) {
    const docs = getSpaceDocs(selectedSpace.id)
    const sessions = sessionsBySpace[selectedSpace.id] ?? []
    const activeSessionId = activeSessionBySpace[selectedSpace.id] ?? null

    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: colorPalette.white, height: '100%', overflow: 'hidden' }}>
        <SpaceDetailHeader
          space={selectedSpace}
          onBack={() => { setView('list'); setSelectedSpaceId(null) }}
        />

        <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: spacing(5) }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <DocumentsPanel
              space={selectedSpace}
              docs={docs}
              onDocsChange={d => setSpaceDocs(selectedSpace.id, d)}
              sidebarWidth={sidebarWidth}
            />
          </div>
          <div style={{ width: CHAT_COLUMN_WIDTH, flexShrink: 0, borderLeft: '1px solid #eee', paddingLeft: spacing(5) }}>
            <ChatPanel
              space={selectedSpace}
              docs={docs}
              sessions={sessions}
              activeSessionId={activeSessionId}
              onNewChat={() => newChat(selectedSpace.id)}
              onSelectSession={id => selectChat(selectedSpace.id, id)}
              onDeleteSession={id => deleteChat(selectedSpace.id, id)}
              onSend={(text, files) => sendMessage(selectedSpace.id, docs, activeSessionId, text, files.map(file => ({ kind: 'file' as const, file })))}
              emptyStateSize="compact"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <SpacesListView
      spaces={spaces}
      getSpaceDocs={getSpaceDocs}
      onOpenSpace={id => { setSelectedSpaceId(id); setView('detail') }}
      onCreateSpace={createSpace}
      onUpdateSpace={updateSpace}
      onDeleteSpace={deleteSpace}
    />
  )
}
