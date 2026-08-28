import { createContext, useContext, useState, type ReactNode } from 'react'

interface ConnectionsContextValue {
  connectedSiteIds: string[]
  connectSites: (ids: string[]) => void
  disconnectSite: (id: string) => void
  // Workspace connector accounts (Microsoft 365, Google Drive, ...) — keyed by
  // `${spaceId}:${connectorType}`. Unrelated to the SharePoint "sites" above:
  // this is what the Connectors page's "Disconnect Account" flow marks, and
  // what Workspaces' document lists read to flag documents whose connector
  // has since been disconnected.
  disconnectedWorkspaceConnectors: Set<string>
  disconnectWorkspaceConnector: (spaceId: string, connectorType: string) => void
  isWorkspaceConnectorDisconnected: (spaceId: string, connectorType: string) => boolean
}

const ConnectionsContext = createContext<ConnectionsContextValue>({
  connectedSiteIds: [],
  connectSites: () => {},
  disconnectSite: () => {},
  disconnectedWorkspaceConnectors: new Set(),
  disconnectWorkspaceConnector: () => {},
  isWorkspaceConnectorDisconnected: () => false,
})

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const [connectedSiteIds, setConnectedSiteIds] = useState<string[]>([])
  const [disconnectedWorkspaceConnectors, setDisconnectedWorkspaceConnectors] = useState<Set<string>>(new Set())

  const connectSites = (ids: string[]) => {
    setConnectedSiteIds(prev => [...prev, ...ids.filter(id => !prev.includes(id))])
  }

  const disconnectSite = (id: string) => {
    setConnectedSiteIds(prev => prev.filter(sid => sid !== id))
  }

  const disconnectWorkspaceConnector = (spaceId: string, connectorType: string) => {
    setDisconnectedWorkspaceConnectors(prev => new Set(prev).add(`${spaceId}:${connectorType}`))
  }

  const isWorkspaceConnectorDisconnected = (spaceId: string, connectorType: string) =>
    disconnectedWorkspaceConnectors.has(`${spaceId}:${connectorType}`)

  return (
    <ConnectionsContext.Provider value={{
      connectedSiteIds, connectSites, disconnectSite,
      disconnectedWorkspaceConnectors, disconnectWorkspaceConnector, isWorkspaceConnectorDisconnected,
    }}>
      {children}
    </ConnectionsContext.Provider>
  )
}

export function useConnections() {
  return useContext(ConnectionsContext)
}
