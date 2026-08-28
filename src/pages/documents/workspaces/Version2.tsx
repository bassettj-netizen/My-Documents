import { useState } from 'react'
import { Segmented } from '@goat-ui/goat-ui-core'
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

type Tab = 'documents' | 'chat'

/**
 * Workspaces — Version 2: "Documents-first, chat as a tab".
 * Keeps today's document-table landing behaviour and adds Chat as a second,
 * equal-weight tab — lower risk, easy to compare against the existing flows.
 */
export default function WorkspacesVersion2() {
  const {
    spaces, createSpace, updateSpace, deleteSpace,
    getSpaceDocs, setSpaceDocs,
    sessionsBySpace, activeSessionBySpace, newChat, selectChat, deleteChat, sendMessage,
  } = useWorkspaceState()

  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('documents')
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
          onBack={() => { setView('list'); setSelectedSpaceId(null); setTab('documents') }}
        />

        <div style={{ flexShrink: 0 }}>
          <Segmented
            options={[
              { label: 'Documents', value: 'documents' },
              { label: `Chat${sessions.length ? ` (${sessions.length})` : ''}`, value: 'chat' },
            ]}
            value={tab}
            onChange={v => setTab(v as Tab)}
          />
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          {tab === 'documents' ? (
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
      onOpenSpace={id => { setSelectedSpaceId(id); setView('detail'); setTab('documents') }}
      onCreateSpace={createSpace}
      onUpdateSpace={updateSpace}
      onDeleteSpace={deleteSpace}
    />
  )
}

