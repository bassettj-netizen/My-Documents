import { useState } from 'react'
import { ButtonTertiary, iconType } from '@goat-ui/goat-ui-core'
import {
  ChatPanel,
  DocumentsPanel,
  Skeleton,
  skeletonVariants,
  SpaceDetailHeader,
  SpacesListView,
  colorPalette,
  useMountLoading,
  useSidebarWidth,
  useWorkspaceState,
} from './shared'

/**
 * Workspaces — Version 1: "Chat-first", Claude Projects style.
 * Opening a space lands on the chat composer + suggested questions + recent chats.
 * Documents are one click away via the pill in the header, not an equal-weight tab.
 */
export default function WorkspacesVersion1() {
  const {
    spaces, createSpace, updateSpace, deleteSpace,
    getSpaceDocs, setSpaceDocs,
    sessionsBySpace, activeSessionBySpace, newChat, selectChat, deleteChat, sendMessage,
  } = useWorkspaceState()

  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)
  const [showDocs, setShowDocs] = useState(false)
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
          onBack={() => { setView('list'); setSelectedSpaceId(null); setShowDocs(false) }}
          right={
            <ButtonTertiary
              leftIcon={showDocs ? iconType.ChevronLeftOutlined : iconType.FolderFilled}
              onClick={() => setShowDocs(v => !v)}
            >
              {showDocs ? 'Back to chat' : `${docs.length} document${docs.length !== 1 ? 's' : ''}`}
            </ButtonTertiary>
          }
        />
        <div style={{ flex: 1, minHeight: 0 }}>
          {showDocs ? (
            <DocumentsPanel
              space={selectedSpace}
              docs={docs}
              onDocsChange={d => setSpaceDocs(selectedSpace.id, d)}
              sidebarWidth={sidebarWidth}
            />
          ) : (
            <ChatPanel
              space={selectedSpace}
              docs={docs}
              sessions={sessions}
              activeSessionId={activeSessionId}
              onNewChat={() => newChat(selectedSpace.id)}
              onSelectSession={id => selectChat(selectedSpace.id, id)}
              onDeleteSession={id => deleteChat(selectedSpace.id, id)}
              onSend={(text, files) => sendMessage(selectedSpace.id, docs, activeSessionId, text, files.map(file => ({ kind: 'file' as const, file })))}
              emptyStateSize="large"
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <SpacesListView
      spaces={spaces}
      getSpaceDocs={getSpaceDocs}
      onOpenSpace={id => { setSelectedSpaceId(id); setView('detail'); setShowDocs(false) }}
      onCreateSpace={createSpace}
      onUpdateSpace={updateSpace}
      onDeleteSpace={deleteSpace}
    />
  )
}
