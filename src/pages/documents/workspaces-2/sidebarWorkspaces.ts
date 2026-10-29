import { useSyncExternalStore } from 'react'

// Version 13: the app's sidebar lives in App.tsx, outside the version's routes, so the version publishes
// its workspaces here and the sidebar lists them. Also tracks which were opened last and whether the
// "Find a workspace" switcher is open (the sidebar opens it, the version draws it).

export type SidebarWorkspace = { id: string; name: string; slug: string; type: string; avatarUrl?: string }

type State = { workspaces: SidebarWorkspace[]; recentIds: string[]; switcherOpen: boolean }

let state: State = { workspaces: [], recentIds: [], switcherOpen: false }
const listeners = new Set<() => void>()

function set(patch: Partial<State>) {
  state = { ...state, ...patch }
  listeners.forEach(l => l())
}

export const sidebarWorkspaces = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
  getSnapshot: () => state,
  setWorkspaces(workspaces: SidebarWorkspace[]) {
    set({ workspaces })
  },
  /** Moves a workspace to the top of the recent list. */
  markOpened(id: string) {
    if (state.recentIds[0] === id) return
    set({ recentIds: [id, ...state.recentIds.filter(r => r !== id)] })
  },
  setSwitcherOpen(switcherOpen: boolean) {
    if (state.switcherOpen !== switcherOpen) set({ switcherOpen })
  },
}

export function useSidebarWorkspaces() {
  return useSyncExternalStore(sidebarWorkspaces.subscribe, sidebarWorkspaces.getSnapshot)
}

/** All workspaces, most recently opened first, then the rest in their own order (new ones are at the top of that). */
export function byRecent({ workspaces, recentIds }: Pick<State, 'workspaces' | 'recentIds'>): SidebarWorkspace[] {
  const byId = new Map(workspaces.map(w => [w.id, w]))
  const recent = recentIds.flatMap(id => byId.get(id) ?? [])
  return [...recent, ...workspaces.filter(w => !recentIds.includes(w.id))]
}
