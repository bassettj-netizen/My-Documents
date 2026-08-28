import { useState } from 'react'
import { colorPalette, spacing } from './shared'
import { NavRow, TOOLS_TABS, ToolsIcon, ToolsResultsPanel, type ToolsTab } from './ResearchPage'

// Top-level Tools screen, reachable directly from the main Launch Pad sidebar — a copy of the
// catalog Tax Office's own "Tools" nav item shows, but given its own full title + side-panel
// treatment (matching CoPilot's/Tax Office's own sidebar headers) rather than living nested
// inside Tax Office's shell.
export default function ToolsPage() {
  const [tab, setTab] = useState<ToolsTab>('az')

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 260, flexShrink: 0, borderRight: `1px solid ${colorPalette.neutral.lighten1}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(5)}px ${spacing(4)}px` }}>
          <div style={{ color: '#141F29', display: 'flex' }}>
            <ToolsIcon size={32} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#001344' }}>Tools</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {TOOLS_TABS.map(t => (
            <NavRow key={t.key} label={t.label} active={t.key === tab} onClick={() => setTab(t.key)} />
          ))}
        </div>
      </div>

      <ToolsResultsPanel tab={tab} />
    </div>
  )
}
