import { type ReactNode } from 'react'
import { Typography } from '@goat-ui/goat-ui-core'
import { colorPalette, spacing } from '../workspaces/shared'

/**
 * Workspaces 2.0 Versions 4 and 5 — the summary of a workspace with nothing in it yet, from the
 * "Empty state" Figma (Workspaces 2.0, node 79:8819): what you know + Haufe knowledge = your answers,
 * as three cards, then "Your workspace is currently empty" and the page's Add content menu.
 * The two inputs are quiet white cards with grey borders; the answer is the one solid-blue card.
 */

const CARD = 250
const ICON_DIR = '/workspaces-2/empty-state'

const CARDS: {
  key: string
  icon: ReactNode
  label: string
  title: string
  text: string
  border?: string
  background: string
  labelColor: string
  titleColor: string
  textColor: string
}[] = [
  {
    key: 'workspace',
    icon: <img src={`${ICON_DIR}/your-workspace.svg`} alt="" width={40} height={40} style={{ display: 'block' }} />,
    label: 'Your workspace', title: 'What you know',
    text: 'Client details, contracts, correspondence and how you like to work.',
    border: colorPalette.neutral.lighten2, background: colorPalette.white,
    labelColor: colorPalette.pink.base, titleColor: colorPalette.neutral.darken4, textColor: colorPalette.neutral.darken2,
  },
  {
    key: 'haufe',
    icon: <img src={`${ICON_DIR}/haufe-logo.svg`} alt="" width={32} height={32} style={{ display: 'block', marginTop: 4 }} />,
    label: 'Haufe knowledge', title: 'Trusted expertise',
    text: 'Legislation, commentary and expert guidance from your Haufe apps.',
    border: colorPalette.neutral.lighten2, background: colorPalette.white,
    labelColor: colorPalette.blue.lighten1, titleColor: colorPalette.neutral.darken4, textColor: colorPalette.neutral.darken2,
  },
  {
    key: 'answers',
    icon: <img src={`${ICON_DIR}/copilot.svg`} alt="" width={36} height={36} style={{ display: 'block', marginTop: 2 }} />,
    label: 'Your answers', title: 'Advice that fits the case',
    text: 'Accurate, sourced responses – without re-uploading or re-explaining.',
    background: colorPalette.blue.base,
    labelColor: colorPalette.blue.lighten4, titleColor: colorPalette.white, textColor: colorPalette.blue.lighten4,
  },
]

// The + and = between the cards.
const OPERATORS = ['+', '=']

export function EmptyWorkspace({ action }: { action: ReactNode }) {
  return (
    // Fills the summary's scroll area and sits in its vertical centre; scrolls when the area is shorter.
    <div style={{ minHeight: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `${spacing(6)}px 0` }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {CARDS.map((card, i) => (
          <div key={card.key} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <div aria-hidden style={{ width: 50, textAlign: 'center', fontSize: 36, lineHeight: '44px', color: colorPalette.neutral.base }}>{OPERATORS[i - 1]}</div>
            )}
            <EquationCard card={card} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 64 }}>
        <Typography size="heading-xl" weight="bold" color="neutral-darken5" align="center">Your workspace is currently empty</Typography>
      </div>
      <div style={{ marginTop: spacing(6), maxWidth: 671 }}>
        <Typography size="base" color="neutral-darken2" align="center">
          Let’s start to build your workspace content. Knowledge from your Haufe apps is already connected.
        </Typography>
      </div>
      <div style={{ marginTop: spacing(6) }}>{action}</div>
    </div>
  )
}

function EquationCard({ card }: { card: (typeof CARDS)[number] }) {
  return (
    <div style={{
      width: CARD, height: CARD, boxSizing: 'border-box', flexShrink: 0, borderRadius: 16, padding: '25px 24px',
      backgroundColor: card.background, border: `1px solid ${card.border ?? card.background}`,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ height: 40 }}>{card.icon}</div>
      <div style={{ marginTop: 19, fontSize: 12, lineHeight: '18px', fontWeight: 600, textTransform: 'uppercase', color: card.labelColor }}>{card.label}</div>
      <div style={{ marginTop: 23, fontSize: 16, lineHeight: '24px', fontWeight: 600, color: card.titleColor }}>{card.title}</div>
      <div style={{ marginTop: 8, fontSize: 14, lineHeight: '20px', color: card.textColor }}>{card.text}</div>
    </div>
  )
}

/**
 * Workspaces 2.0 Version 5 — the empty workspace from the "Empty state" Figma (node 80:9043): the
 * message and Add content on the left; on the right, what goes into the workspace (documents,
 * guardrails, references) in a dashed frame labelled with the workspace's name, plus Haufe knowledge below it.
 * The message is centred on that frame, not the whole stack, so the two sides balance.
 * The rows are a picture of what the workspace takes, not actions — Add content is the one way in.
 */

const STACK_W = 458
// The Haufe knowledge copy is as it stands in the Figma (the same line as Save references).
const WORKSPACE_ROWS = [
  { key: 'documents', icon: 'add-documents.svg', title: 'Add documents', text: 'Client details, contracts, correspondence, etc.' },
  { key: 'guardrails', icon: 'guardrails.svg', title: 'Provide Guardrails', text: 'State rules and how you’d like to work.' },
  { key: 'references', icon: 'references.svg', title: 'Save references', text: 'Bookmark data and information from other apps.' },
]

export function EmptyWorkspaceStack({ name, action }: { name: string; action: ReactNode }) {
  return (
    // Fills the summary's scroll area and sits in its vertical centre; scrolls when the area is shorter.
    <div style={{ minHeight: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `${spacing(6)}px 0` }}>
      {/* A grid so the message can centre on the workspace frame (rows 1–2) rather than the whole stack,
          which the Haufe knowledge card below would otherwise pull downwards. */}
      <div style={{ display: 'grid', gridTemplateColumns: `430px ${STACK_W}px`, columnGap: 64 }}>
        <div style={{ gridColumn: 1, gridRow: '1 / 3', alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 36, lineHeight: '44px', fontWeight: 700, color: colorPalette.neutral.darken5 }}>Your workspace is currently empty</div>
          <div style={{ marginTop: spacing(6), fontSize: 16, lineHeight: '24px', color: colorPalette.neutral.darken2 }}>
            Everything you add to your workspace is combined with Haufe knowledge to give you advice that fits your case.
          </div>
          <div style={{ marginTop: spacing(6) }}>{action}</div>
        </div>

        {/* The frame is labelled with the workspace's own name. */}
        <div title={name} style={{
          gridColumn: 2, gridRow: 1, padding: '0 22px', fontSize: 12, lineHeight: '18px', fontWeight: 600, textTransform: 'uppercase',
          color: colorPalette.blue.lighten1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </div>
        <div style={{
          gridColumn: 2, gridRow: 2, marginTop: 6, padding: 12, borderRadius: 24, border: `1px dashed ${colorPalette.blue.lighten2}`,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {WORKSPACE_ROWS.map(row => (
            <StackRow key={row.key} icon={row.icon} title={row.title} text={row.text} />
          ))}
        </div>
        <div aria-hidden style={{ gridColumn: 2, gridRow: 3, textAlign: 'center', fontSize: 36, lineHeight: '44px', color: colorPalette.neutral.base, marginTop: 4 }}>+</div>
        <div style={{ gridColumn: 2, gridRow: 4, margin: '6px 12px 0' }}>
          <StackRow icon="haufe-logo-strong.svg" title="Haufe knowledge" text="Bookmark data and information from other apps." haufe />
        </div>
      </div>
    </div>
  )
}

function StackRow({ icon, title, text, haufe = false }: { icon: string; title: string; text: string; haufe?: boolean }) {
  return (
    <div style={{
      height: 94, boxSizing: 'border-box', borderRadius: 16, padding: '0 24px 0 28px', display: 'flex', alignItems: 'center', gap: 21,
      backgroundColor: haufe ? colorPalette.blue.lighten4 : colorPalette.white,
      border: `1px solid ${haufe ? colorPalette.blue.lighten4 : colorPalette.neutral.lighten2}`,
    }}>
      <img src={`${ICON_DIR}/${icon}`} alt="" width={32} height={32} style={{ display: 'block', flexShrink: 0 }} />
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 16, lineHeight: '24px', fontWeight: 600, color: haufe ? colorPalette.blue.base : colorPalette.neutral.darken4 }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: '20px', color: haufe ? colorPalette.neutral.darken4 : colorPalette.neutral.darken2 }}>{text}</div>
      </div>
    </div>
  )
}
