import { type ReactNode } from 'react'
import { Avatar, avatarShapeEnum, avatarSizeEnum, ButtonPrimary, Dropdown, dropdownPlacement, dropdownTriggers, Icon, iconType, Typography } from '@goat-ui/goat-ui-core'
import { colorPalette, getInitials, spacing, type Space } from '../workspaces/shared'
import { CopilotIcon } from '../workspaces/WorkspacesBasic'
import { AppGlyph, HR_DOKUMENTE_GLYPH, ZEUGNIS_MANAGER_GLYPH } from './appGlyphs'

/**
 * Workspaces 2.0 Version 11 — the summary of a workspace with nothing in it yet. It explains what a
 * workspace is for with a picture, with one way to start: Add content.
 *
 * - The picture: what you add (documents, context, instructions, connected sources) flows into this
 *   workspace, and from there into the Haufe apps that use it (CoPilot, HR Dokumente, Zeugnis Manager).
 *   The lines carry a slow moving dash so the direction reads at a glance.
 * - One call to action under the intro, "Add content": a menu of every kind of content a workspace takes,
 *   each with a line on what it's for.
 * - `animate={false}` skips the entrance (for repeat visits); reduced motion stops the dashes and the entrance.
 */

// The diagram is drawn on a fixed 800 × 320 grid; the cards and the SVG lines share its coordinates.
const W = 800
const H = 320
const SIDE_W = 236
const HUB = { cx: W / 2, cy: H / 2, size: 128 }

const INPUTS = [
  { icon: iconType.FolderOutlined, title: 'Documents', text: 'Contracts, letters, records' },
  { icon: iconType.InfoCircleOutlined, title: 'Context', text: 'Background and key facts' },
  { icon: iconType.ShieldCheckOutlined, title: 'Instructions', text: 'Tone, language, rules' },
  { icon: iconType.LinkOutlined, title: 'Connected sources', text: 'SharePoint, DATEV and more' },
]
const INPUT_H = 56
const INPUT_GAP = 16
const inputY = (i: number) => (H - (INPUTS.length * INPUT_H + (INPUTS.length - 1) * INPUT_GAP)) / 2 + i * (INPUT_H + INPUT_GAP)

const OUTPUTS: { icon: ReactNode; title: string; text: string }[] = [
  { icon: <CopilotIcon />, title: 'CoPilot', text: 'Context-aware answers' },
  { icon: <AppGlyph d={HR_DOKUMENTE_GLYPH} />, title: 'HR Dokumente', text: 'Letters and contracts' },
  { icon: <AppGlyph d={ZEUGNIS_MANAGER_GLYPH} />, title: 'Zeugnis Manager', text: 'Job references' },
]
const OUTPUT_H = 64
const OUTPUT_GAP = 20
const outputY = (i: number) => (H - (OUTPUTS.length * OUTPUT_H + (OUTPUTS.length - 1) * OUTPUT_GAP)) / 2 + i * (OUTPUT_H + OUTPUT_GAP)

const CSS = `
@keyframes ws-empty-flow { to { stroke-dashoffset: -24; } }
@keyframes ws-empty-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes ws-empty-pulse { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(1.45); opacity: 0; } }
.ws-empty-flow { stroke-dasharray: 4 8; animation: ws-empty-flow 1.2s linear infinite; }
.ws-empty-in { animation: ws-empty-in .5s ease-out both; }
.ws-empty-pulse { animation: ws-empty-pulse 2.4s ease-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .ws-empty-flow, .ws-empty-in, .ws-empty-pulse { animation: none; }
}
`

export function WorkspaceEmptyState({ space, animate = true, onUpload, onConnect, onAddContext, onAddInstructions, onAddBookmark, onAddTemplate }: {
  space: Space
  animate?: boolean
  onUpload: () => void
  onConnect: () => void
  onAddContext: () => void
  onAddInstructions: () => void
  onAddBookmark: () => void
  onAddTemplate: () => void
}) {
  // Each piece fades in a little after the one before, on the first visit only.
  const enter = (step: number) => animate ? { className: 'ws-empty-in', style: { animationDelay: `${step * 70}ms` } } : {}
  // Every kind of content a workspace takes, in the order the diagram shows them, then bookmarks and templates.
  const contentTypes = [
    { key: 'documents', icon: iconType.UploadOutlined, title: 'Documents', text: 'Upload contracts, letters and records', onClick: onUpload },
    { key: 'connector', icon: iconType.LinkOutlined, title: 'Connected source', text: 'Sync from SharePoint, OneDrive or DATEV', onClick: onConnect },
    { key: 'context', icon: iconType.InfoCircleOutlined, title: 'Context', text: 'Background and key facts', onClick: onAddContext },
    { key: 'instructions', icon: iconType.ShieldCheckOutlined, title: 'Instructions', text: 'How CoPilot should answer here', onClick: onAddInstructions },
    { key: 'bookmark', icon: iconType.BookmarkOutlined, title: 'Bookmark', text: 'Links to sources you trust', onClick: onAddBookmark },
    { key: 'template', icon: iconType.ArticleOutlined, title: 'Template', text: 'Documents you reuse', onClick: onAddTemplate },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(8), padding: `${spacing(4)}px 0 ${spacing(8)}px` }}>
      <style>{CSS}</style>

      <div {...enter(0)} style={{ ...enter(0).style, maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(2), textAlign: 'center' }}>
        <Typography size="heading-lg" weight="bold" color="neutral-darken5" align="center">One place for everything about {space.name}</Typography>
        <Typography size="base" color="neutral-darken2" align="center">
          Add what you know once. CoPilot and your Haufe apps use it every time you work here — so answers and documents fit, without explaining the background again.
        </Typography>
        <div style={{ marginTop: spacing(3) }}>
          <Dropdown
            items={contentTypes.map(t => ({ key: t.key, label: <ContentTypeLabel icon={t.icon} title={t.title} text={t.text} />, onClick: t.onClick }))}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_LEFT}
          >
            <ButtonPrimary leftIcon={iconType.PlusOutlined}>Add content</ButtonPrimary>
          </Dropdown>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <Diagram space={space} enter={enter} />
      </div>
    </div>
  )
}

/** A row in the Add content menu: icon, the kind of content, and a line on what it's for. */
function ContentTypeLabel({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(3), padding: `${spacing(1)}px 0`, minWidth: 260 }}>
      <span style={{ paddingTop: 2, display: 'inline-flex' }}><Icon type={icon} size={16} color="neutral-darken3" /></span>
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">{title}</Typography>
        <Typography size="base-sm" color="neutral-darken2">{text}</Typography>
      </span>
    </span>
  )
}

type Enter = (step: number) => { className?: string; style?: React.CSSProperties }

/** You add → this workspace → used across Haufe. */
function Diagram({ space, enter }: { space: Space; enter: Enter }) {
  const hubLeft = HUB.cx - HUB.size / 2
  const hubRight = HUB.cx + HUB.size / 2
  const mid = (a: number, b: number) => (a + b) / 2
  return (
    <div style={{ position: 'relative', width: W, height: H + 32, flexShrink: 0 }}>
      {/* Column labels */}
      <ColumnLabel x={0} width={SIDE_W}>You add</ColumnLabel>
      <ColumnLabel x={hubLeft - 20} width={HUB.size + 40} center>This workspace</ColumnLabel>
      <ColumnLabel x={W - SIDE_W} width={SIDE_W}>Used across Haufe</ColumnLabel>

      <div style={{ position: 'absolute', top: 32, left: 0, width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
          {INPUTS.map((_, i) => {
            const y = inputY(i) + INPUT_H / 2
            const x1 = SIDE_W, x2 = hubLeft
            const d = `M ${x1} ${y} C ${mid(x1, x2)} ${y}, ${mid(x1, x2)} ${HUB.cy}, ${x2} ${HUB.cy}`
            return <FlowLine key={i} d={d} />
          })}
          {OUTPUTS.map((_, i) => {
            const y = outputY(i) + OUTPUT_H / 2
            const x1 = hubRight, x2 = W - SIDE_W
            const d = `M ${x1} ${HUB.cy} C ${mid(x1, x2)} ${HUB.cy}, ${mid(x1, x2)} ${y}, ${x2} ${y}`
            return <FlowLine key={i} d={d} />
          })}
        </svg>

        {INPUTS.map((item, i) => (
          <div key={item.title} {...enter(1 + i)} style={{ ...enter(1 + i).style, position: 'absolute', left: 0, top: inputY(i), width: SIDE_W, height: INPUT_H }}>
            <DiagramCard icon={<Icon type={item.icon} size={16} color="neutral-darken3" />} title={item.title} text={item.text} />
          </div>
        ))}

        <div {...enter(5)} style={{ ...enter(5).style, position: 'absolute', left: hubLeft, top: HUB.cy - HUB.size / 2, width: HUB.size, height: HUB.size }}>
          <Hub space={space} />
        </div>

        {OUTPUTS.map((item, i) => (
          <div key={item.title} {...enter(6 + i)} style={{ ...enter(6 + i).style, position: 'absolute', left: W - SIDE_W, top: outputY(i), width: SIDE_W, height: OUTPUT_H }}>
            <DiagramCard icon={<span style={{ color: colorPalette.blue.base, display: 'inline-flex' }}>{item.icon}</span>} title={item.title} text={item.text} accent />
          </div>
        ))}
      </div>
    </div>
  )
}

function ColumnLabel({ x, width, center = false, children }: { x: number; width: number; center?: boolean; children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: x, width, textAlign: center ? 'center' : 'left' }}>
      <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: colorPalette.neutral.darken2 }}>{children}</span>
    </div>
  )
}

/** A faint track with a slow dash running along it, towards the right. */
function FlowLine({ d }: { d: string }) {
  return (
    <>
      <path d={d} fill="none" stroke={colorPalette.neutral.lighten2} strokeWidth={2} />
      <path d={d} fill="none" stroke={colorPalette.blue.lighten3} strokeWidth={2} strokeLinecap="round" className="ws-empty-flow" />
    </>
  )
}

function DiagramCard({ icon, title, text, accent = false }: { icon: ReactNode; title: string; text: string; accent?: boolean }) {
  return (
    <div style={{
      height: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: spacing(3), padding: `0 ${spacing(3)}px`,
      borderRadius: 10, backgroundColor: colorPalette.white,
      border: `1px ${accent ? 'solid' : 'dashed'} ${accent ? colorPalette.neutral.lighten2 : colorPalette.neutral.lighten1}`,
    }}>
      <div style={{
        width: 32, height: 32, flexShrink: 0, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: accent ? colorPalette.blue.lighten5 : colorPalette.neutral.lighten4,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Typography size="base-sm" weight="semibold" color="neutral-darken5">{title}</Typography>
        <Typography size="base-sm" color="neutral-darken2">{text}</Typography>
      </div>
    </div>
  )
}

/** The workspace itself, with a soft pulse around it. */
function Hub({ space }: { space: Space }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="ws-empty-pulse" style={{ position: 'absolute', inset: 0, borderRadius: 24, border: `2px solid ${colorPalette.blue.lighten3}` }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 24, backgroundColor: colorPalette.white,
        border: `2px solid ${colorPalette.blue.base}`, boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing(2), padding: spacing(3),
      }}>
        <Avatar shape={avatarShapeEnum.SQUARE} size={avatarSizeEnum.MEDIUM} src={space.avatarUrl} srcPlaceholder={getInitials(space.name)} />
        <div style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14, lineHeight: '20px', fontWeight: 600, color: colorPalette.neutral.darken5 }}>
          {space.name}
        </div>
      </div>
    </div>
  )
}
