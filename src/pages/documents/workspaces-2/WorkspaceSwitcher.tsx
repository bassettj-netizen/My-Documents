import { useEffect, useRef, useState } from 'react'
import { Avatar, avatarShapeEnum, avatarSizeEnum, Icon, iconType, Input, Modal } from '@goat-ui/goat-ui-core'
import { colorPalette, getInitials, spacing } from '../workspaces/shared'
import type { SidebarWorkspace } from './sidebarWorkspaces'

/**
 * Version 13's "Find a workspace" switcher, opened from the sidebar or with ⌘K / Ctrl+K: type to filter
 * every workspace (most recently opened first), arrow keys to move, Enter to open.
 */
export function WorkspaceSwitcher({ open, workspaces, onClose, onSelect }: {
  open: boolean
  workspaces: SidebarWorkspace[]
  onClose: () => void
  onSelect: (workspace: SidebarWorkspace) => void
}) {
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  // Starts empty each time it opens.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) { setQuery(''); setHighlight(0) }
  }

  // Ready to type as soon as it opens (after the modal has mounted its contents).
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open])

  const q = query.trim().toLowerCase()
  const results = q ? workspaces.filter(w => w.name.toLowerCase().includes(q) || w.type.toLowerCase().includes(q)) : workspaces
  const active = Math.min(highlight, Math.max(results.length - 1, 0))

  // Keeps the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    document.getElementById(`workspace-switcher-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const choose = (w: SidebarWorkspace | undefined) => { if (w) { onSelect(w); onClose() } }

  return (
    <Modal visible={open} title="Find a workspace" withIcon={false} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <Input
          ref={inputRef}
          value={query}
          placeholder="Search by name or type"
          onChange={e => { setQuery(e.target.value); setHighlight(0) }}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(Math.min(active + 1, results.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(Math.max(active - 1, 0)) }
            if (e.key === 'Enter') { e.preventDefault(); choose(results[active]) }
          }}
        />
        <div role="listbox" aria-label="Workspaces" style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {results.length === 0 && (
            <div style={{ padding: `${spacing(4)}px 0`, textAlign: 'center', fontSize: 14, color: colorPalette.neutral.darken2 }}>
              No workspaces match “{query.trim()}”
            </div>
          )}
          {results.map((w, i) => (
            <div
              key={w.id}
              id={`workspace-switcher-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => choose(w)}
              style={{
                display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(2)}px ${spacing(3)}px`, borderRadius: 8, cursor: 'pointer',
                backgroundColor: i === active ? colorPalette.blue.lighten5 : 'transparent',
              }}
            >
              <Avatar shape={avatarShapeEnum.SQUARE} size={avatarSizeEnum.SMALL} src={w.avatarUrl} srcPlaceholder={getInitials(w.name)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600, color: colorPalette.neutral.darken4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</div>
                <div style={{ fontSize: 12, lineHeight: '18px', color: colorPalette.neutral.darken2 }}>{w.type}</div>
              </div>
              {i === active && <Icon type={iconType.ChevronRightOutlined} size={16} color="neutral-darken2" />}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, lineHeight: '18px', color: colorPalette.neutral.darken2 }}>
          ↑↓ to move · Enter to open · ⌘K or Ctrl+K opens this from anywhere
        </div>
      </div>
    </Modal>
  )
}
