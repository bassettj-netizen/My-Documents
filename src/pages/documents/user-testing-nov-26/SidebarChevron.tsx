import { colorPalette } from '../workspaces/shared'

/**
 * The app sidebar's collapse chevron (the DS Layout's trigger draws Ant Design's left/right outline at 14px), so the
 * prototype's own collapsible panels — CoPilot's chat panel and the product start page's navigation — match it exactly.
 * The DS Icon chevron is a smaller glyph.
 */
const SIDEBAR_CHEVRON_PATHS = {
  left: 'M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z',
  right: 'M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z',
}

export function SidebarChevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="64 64 896 896" width={14} height={14} fill={colorPalette.neutral.darken2} aria-hidden focusable="false">
      <path d={SIDEBAR_CHEVRON_PATHS[direction]} />
    </svg>
  )
}

/** The collapse control at a panel's foot: a 48px strip with only a centred chevron, like the app sidebar's. */
export function CollapseStrip({ open, onToggle, collapseLabel, expandLabel }: { open: boolean; onToggle: () => void; collapseLabel: string; expandLabel: string }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }}
      title={open ? undefined : expandLabel}
      aria-label={open ? collapseLabel : expandLabel}
      style={{ flexShrink: 0, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
    >
      <SidebarChevron direction={open ? 'left' : 'right'} />
    </div>
  )
}
