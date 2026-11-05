import type { CSSProperties, ReactNode } from 'react'
import { SearchBar, searchbarWidth, Tabs, Typography } from '@goat-ui/goat-ui-core'
import { spacing } from '../workspaces/shared'

/**
 * Workspaces 2.0 Version 17: the frame shared by My Documents, Workspaces and Connectors, so the three line up.
 *
 * - 24px all round, 24px between header, toolbar and content.
 * - Header: title and description on the left, the page's one primary action top right.
 * - Toolbar: tabs with counts on the left; search (always 320px) and any secondary controls on the right.
 */
export function KnowledgePage({ style, children }: { style?: CSSProperties; children: ReactNode }) {
  return <div style={{ padding: spacing(6), display: 'flex', flexDirection: 'column', gap: spacing(6), ...style }}>{children}</div>
}

export function KnowledgePageHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start', gap: spacing(6) }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
        <Typography size="heading-lg" weight="bold">{title}</Typography>
        {description && <Typography size="base" color="neutral-darken2">{description}</Typography>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

export function KnowledgeToolbar<K extends string>({ tabs, activeTab, onTab, search, onSearch, searchPlaceholder, children }: {
  tabs: { key: K; label: string; count: number }[]
  activeTab: K
  onTab: (key: K) => void
  search: string
  onSearch: (value: string) => void
  searchPlaceholder: string
  /** Secondary controls after the search (Filters, Sort). */
  children?: ReactNode
}) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: spacing(3) }}>
      <Tabs options={tabs.map(t => ({ key: t.key, label: `${t.label} (${t.count})`, content: null }))} activeKey={activeTab} onChange={key => onTab(key as K)} />
      <div style={{ flex: 1 }} />
      <div style={{ width: 320 }}>
        <SearchBar placeholder={searchPlaceholder} value={search} onChange={onSearch} width={searchbarWidth.EXPANDED} />
      </div>
      {children}
    </div>
  )
}
