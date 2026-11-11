import { useState, type ReactNode } from 'react'
import {
  ButtonGhost,
  ButtonSecondary,
  buttonSizes,
  buttonShapes,
  Chip,
  chipSizes,
  chipStyles,
  chipVariants,
  ClickableContainer,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  Icon,
  iconType,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing } from '../workspaces/shared'

/**
 * Workspaces 2.0 Versions 19 and 21 — CoPilot's menu after the FigJam "CoPilot" frames (Workspaces 2.0 board, 150:191):
 * - WorkspaceSelector: the current workspace in a clickable container ("Switch or create"), opening a DS Dropdown
 *   with Your workspaces, a dashed Create workspace card and Manage workspaces.
 * - WorkspacesPromo: under the question box, what a workspace adds — the Workspaces empty state's
 *   "your workspace + Haufe knowledge = your answers", side by side.
 */

const MENU_WIDTH = 236

export type WorkspaceOption = { id: string; name: string; description: string; icon: ReactNode }

/** "New" next to a label: the DS Chip, small and blue. */
export function NewChip() {
  return <Chip label="New" uppercase={false} size={chipSizes.SMALL} chipStyle={chipStyles.ACCENT_BLUE} variant={chipVariants.SUBTLE} />
}

/** The DS has no up/down chevron, so the two chevrons are stacked. */
function UpDownChevrons() {
  return (
    <span aria-hidden style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0, flexShrink: 0 }}>
      <Icon type={iconType.ChevronUpOutlined} size={12} color="neutral-darken3" />
      <Icon type={iconType.ChevronDownOutlined} size={12} color="neutral-darken3" />
    </span>
  )
}

/** One workspace in the list: icon, name and a line about it; the current one is blue with a tick. */
function OptionRow({ option, selected }: { option: WorkspaceOption; selected: boolean }) {
  return (
    <span className="copilot-ws-row" style={{ width: MENU_WIDTH - 32, display: 'flex', alignItems: 'flex-start', gap: spacing(2), padding: `${spacing(1)}px 0`, whiteSpace: 'normal' }}>
      <span style={{ width: 24, height: 24, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: colorPalette.white, border: `1px solid ${colorPalette.neutral.lighten2}`, boxSizing: 'border-box', overflow: 'hidden' }}>
        {option.icon}
      </span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600, color: selected ? colorPalette.blue.base : colorPalette.neutral.darken5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.name}</span>
        {option.description && (
          <span style={{ fontSize: 12, lineHeight: '16px', color: colorPalette.neutral.darken3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.description}</span>
        )}
      </span>
      {selected && <span style={{ display: 'inline-flex', marginTop: 4 }}><Icon type={iconType.CheckOutlined} size={16} color="blue-base" /></span>}
    </span>
  )
}

/**
 * The CoPilot menu's workspace selector: a clickable container showing the current workspace, with a DS Dropdown
 * listing the workspaces, then Create workspace (a dashed clickable container) and Manage workspaces.
 */
export function WorkspaceSelector({ options, value, onChange, onCreate, onManage }: {
  options: WorkspaceOption[]
  value: string
  onChange: (id: string) => void
  onCreate: () => void
  onManage: () => void
}) {
  const current = options.find(o => o.id === value) ?? options[0]
  // The DS Dropdown closes itself on picking an item, but not on its footer and has no open prop, so a footer action
  // remounts it (closed).
  const [menuKey, setMenuKey] = useState(0)
  const fromFooter = (action: () => void) => () => { setMenuKey(k => k + 1); action() }

  const footer = (
    <div style={{ width: MENU_WIDTH - 16, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <ClickableContainer as="div" dashed width="expanded" onClick={fromFooter(onCreate)}>
        <div style={{ width: '100%', boxSizing: 'border-box', padding: `${spacing(2)}px ${spacing(3)}px`, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(1) }}>
            <Icon type={iconType.PlusOutlined} size={16} color="blue-base" />
            <span style={{ fontSize: 14, fontWeight: 600, color: colorPalette.blue.base }}>Create workspace</span>
          </div>
          {/* Regular weight: the dropdown's footer is semibold, and this matches the workspace descriptions above. */}
          <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 400, color: colorPalette.neutral.darken3, marginTop: 2 }}>
            Bring a client’s or project’s documents and context together so answers always fit the case.
          </div>
        </div>
      </ClickableContainer>
      <ButtonGhost rightIcon={iconType.ChevronRightOutlined} onClick={fromFooter(onManage)}>Manage workspaces</ButtonGhost>
    </div>
  )

  return (
    <div className="copilot-ws-selector">
      {/* The trigger fills the menu's width; while the list is open its outline is blue. */}
      <style>{`.copilot-ws-selector > * { width: 100%; }
        .copilot-ws-selector .goat-dropdown-open, .copilot-ws-selector .ant-dropdown-open { border-color: ${colorPalette.blue.base} !important; box-shadow: 0 0 0 1px ${colorPalette.blue.base}; }
        .goat-dropdown-menu:has(.copilot-ws-row) { max-height: none !important; }
        .goat-dropdown-menu:has(.copilot-ws-row) .goat-dropdown-menu-item { height: auto !important; line-height: normal !important; padding-top: ${spacing(1)}px !important; padding-bottom: ${spacing(1)}px !important; }
        .goat-dropdown-menu:has(.copilot-ws-row) .goat-dropdown-menu-item-group-title { text-transform: none !important; }`}</style>
      <Dropdown
        key={menuKey}
        trigger={dropdownTriggers.CLICK}
        placement={dropdownPlacement.BOTTOM_LEFT}
        header={<span style={{ fontSize: 13, color: colorPalette.neutral.darken2 }}>Your workspaces</span>}
        selectable
        selectedKeys={[value]}
        items={options.map(o => ({
          key: o.id,
          label: <OptionRow option={o} selected={o.id === value} />,
          onClick: () => onChange(o.id),
        }))}
        footer={footer}
      >
        <ClickableContainer as="div" dashed={false} width="expanded">
          <div style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px ${spacing(3)}px`, textAlign: 'left' }}>
            <span style={{ width: 24, height: 24, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{current?.icon}</span>
            <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600, color: colorPalette.neutral.darken5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current?.name}</span>
              <span style={{ fontSize: 12, lineHeight: '16px', color: colorPalette.neutral.darken3 }}>Switch or create</span>
            </span>
            <UpDownChevrons />
          </div>
        </ClickableContainer>
      </Dropdown>
    </div>
  )
}

// ─── Promotion ──────────────────────────────────────────────────────────────

const EMPTY_STATE_ICONS = '/workspaces-2/empty-state'

/**
 * One step of the Workspaces empty state's equation, in a compact chip: its icon, label and title, no description.
 * `focus` (the workspace, what you create) keeps the empty state's blue outline; `tinted` the answers' light blue.
 */
function PromoCard({ focus = false, tinted = false, icon, iconSize = 20, label, title }: {
  focus?: boolean
  tinted?: boolean
  icon: string
  iconSize?: number
  label: string
  title: string
}) {
  const blue = colorPalette.blue.base
  return (
    <div style={{
      flex: 1, minWidth: 0, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: spacing(2),
      padding: `${spacing(2)}px ${spacing(3)}px`, borderRadius: 10,
      backgroundColor: tinted ? colorPalette.blue.lighten5 : colorPalette.white,
      border: `1px solid ${focus ? blue : tinted ? colorPalette.blue.lighten2 : colorPalette.neutral.lighten2}`,
    }}>
      {/* The empty state's icons, recoloured to the CoPilot blue. */}
      <span aria-hidden style={{
        width: iconSize, height: iconSize, flexShrink: 0, backgroundColor: blue,
        WebkitMask: `url(${EMPTY_STATE_ICONS}/${icon}) center / contain no-repeat`, mask: `url(${EMPTY_STATE_ICONS}/${icon}) center / contain no-repeat`,
      }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, lineHeight: '14px', fontWeight: 600, textTransform: 'uppercase', color: blue }}>{label}</div>
        <div style={{ fontSize: 13, lineHeight: '18px', fontWeight: 600, color: colorPalette.neutral.darken5 }}>{title}</div>
      </div>
    </div>
  )
}

function Operator({ children }: { children: ReactNode }) {
  return <div aria-hidden style={{ alignSelf: 'center', fontSize: 16, lineHeight: '20px', color: colorPalette.neutral.base }}>{children}</div>
}

/**
 * Under CoPilot's question box: what a workspace adds, in the Workspaces empty state's words and look, kept quiet so
 * the question box stays the focus — a light panel, one line of heading with a secondary Create workspace, and the
 * equation as three compact steps. Can be dismissed.
 */
export function WorkspacesPromo({ onCreate, onDismiss }: { onCreate: () => void; onDismiss: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3), padding: `${spacing(3)}px ${spacing(4)}px ${spacing(4)}px`, borderRadius: 16, backgroundColor: colorPalette.neutral.lighten5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
        <NewChip />
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: '20px', fontWeight: 600, color: colorPalette.neutral.darken5 }}>
          Workspaces: answers that <span style={{ color: colorPalette.blue.base }}>fit the case</span>
        </span>
        <ButtonSecondary size={buttonSizes.SMALL} leftIcon={iconType.PlusOutlined} onClick={onCreate}>Create workspace</ButtonSecondary>
        <ButtonGhost size={buttonSizes.SMALL} shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={onDismiss} ariaLabel="Dismiss" />
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: spacing(2) }}>
        <PromoCard focus icon="your-workspace.svg" label="Your workspace" title="What you know" />
        <Operator>+</Operator>
        <PromoCard icon="haufe-logo.svg" iconSize={18} label="Haufe knowledge" title="Trusted expertise" />
        <Operator>=</Operator>
        <PromoCard tinted icon="copilot.svg" label="Your answers" title="Advice that fits the case" />
      </div>
    </div>
  )
}
