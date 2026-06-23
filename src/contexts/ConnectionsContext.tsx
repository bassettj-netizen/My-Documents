import { createContext, useContext, useState, type ReactNode } from 'react'

interface ConnectionsContextValue {
  connectedSiteIds: string[]
  connectSites: (ids: string[]) => void
  disconnectSite: (id: string) => void
}

const ConnectionsContext = createContext<ConnectionsContextValue>({
  connectedSiteIds: [],
  connectSites: () => {},
  disconnectSite: () => {},
})

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const [connectedSiteIds, setConnectedSiteIds] = useState<string[]>([])

  const connectSites = (ids: string[]) => {
    setConnectedSiteIds(prev => [...prev, ...ids.filter(id => !prev.includes(id))])
  }

  const disconnectSite = (id: string) => {
    setConnectedSiteIds(prev => prev.filter(sid => sid !== id))
  }

  return (
    <ConnectionsContext.Provider value={{ connectedSiteIds, connectSites, disconnectSite }}>
      {children}
    </ConnectionsContext.Provider>
  )
}

export function useConnections() {
  return useContext(ConnectionsContext)
}
