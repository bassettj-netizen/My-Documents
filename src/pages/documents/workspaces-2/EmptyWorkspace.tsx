import { type ReactNode } from 'react'
import { Avatar, avatarShapeEnum, avatarSizeEnum, ButtonSecondary, buttonSizes, Chip, chipSizes, chipStyles, chipVariants, Icon, iconType, Typography } from '@goat-ui/goat-ui-core'
import { colorPalette, getInitials, spacing } from '../workspaces/shared'

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
          <StackRow icon="haufe-logo-strong.svg" title="Haufe knowledge" text="Legislation and expert guidance from your apps." haufe />
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

/**
 * Workspaces 2.0 Version 10 — the empty workspace from the "Empty state" Figma (node 82:9025): your
 * content (left) and Haufe knowledge (right) joined by connectors to this workspace in the middle,
 * which explains what the two sides add up to.
 * - The frame is 1192px wide; here the side columns shrink to fit the page (up to 434px each) and the
 *   middle card keeps its 274px, so the connectors always span the 25px gaps.
 * - Made easier to read than the frame: each side says where it stands ("Not added yet" on every card
 *   of yours, "Already connected" on Haufe's), both sides name things rather than actions, and each of
 *   your cards has its own button to add that kind of content. The middle card says it in one line.
 */

const HUB_DIR = 'v10'
// `cta` only on your content: the card's own button.
type HubItem = { key: string; icon: string; title: string; text: string; cta?: { label: string; icon: string; onClick: () => void } }
const HAUFE_CONTENT: HubItem[] = [
  { key: 'laws', icon: `${HUB_DIR}/laws.svg`, title: 'Laws and rulings', text: 'Up-to-date labour, tax, and social law' },
  { key: 'commentary', icon: `${HUB_DIR}/commentary.svg`, title: 'Expert commentary', text: 'Guidance from Haufe editors' },
  { key: 'templates', icon: `${HUB_DIR}/templates.svg`, title: 'Templates and checklists', text: 'Contracts, letters, references, etc' },
]
const HUB_GAP = 25

export function EmptyWorkspaceHub({ name, avatarUrl, onAddDocuments, onAddGuardrails, onAddReferences }: {
  name: string
  avatarUrl?: string
  onAddDocuments: () => void
  onAddGuardrails: () => void
  onAddReferences: () => void
}) {
  const yourContent: HubItem[] = [
    { key: 'documents', icon: `${HUB_DIR}/add-documents.svg`, title: 'Documents', text: 'Client details, contracts, correspondence, etc.', cta: { label: 'Upload', icon: iconType.UploadOutlined, onClick: onAddDocuments } },
    { key: 'guardrails', icon: `${HUB_DIR}/guardrails.svg`, title: 'Guardrails', text: 'State rules and how you’d like to work.', cta: { label: 'Add', icon: iconType.PlusOutlined, onClick: onAddGuardrails } },
    { key: 'references', icon: `${HUB_DIR}/references.svg`, title: 'References', text: 'Bookmark data and information from other apps.', cta: { label: 'Add', icon: iconType.PlusOutlined, onClick: onAddReferences } },
  ]
  return (
    // From the top of the summary area, just under the workspace's header.
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${spacing(6)}px 0` }}>
      {/* Named after the workspace; wraps onto a second line for long names. */}
      <div style={{ maxWidth: 900, fontSize: 36, lineHeight: '44px', fontWeight: 700, color: colorPalette.neutral.darken5, textAlign: 'center', overflowWrap: 'anywhere' }}>
        Let’s start building your {name} workspace
      </div>

      <div style={{
        marginTop: 68, width: '100%', maxWidth: 434 * 2 + 274 + HUB_GAP * 2,
        display: 'grid', gridTemplateColumns: `minmax(0, 434px) 274px minmax(0, 434px)`, columnGap: HUB_GAP, rowGap: 18, alignItems: 'start',
      }}>
        <HubLabel color={colorPalette.pink.lighten1} inset={10}>Your content</HubLabel>
        {/* No label over the workspace card: its name says what it is. */}
        <div />
        <HubLabel color={colorPalette.blue.lighten1} inset={10}>
          Haufe knowledge
          {/* Says outright what the solid cards only hint at. */}
          <span style={{ marginLeft: spacing(3), display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'none', fontWeight: 400, color: colorPalette.neutral.darken2 }}>
            <Icon type={iconType.CheckCircleFilled} size={12} color="blue-lighten1" />Already connected
          </span>
        </HubLabel>

        <HubColumn items={yourContent} connector="connector-pink.svg" side="left" />
        <div style={{
          height: 324, boxSizing: 'border-box', borderRadius: 16, padding: '0 25px', justifyContent: 'center',
          backgroundImage: 'linear-gradient(134.95deg, rgba(255, 191, 220, 0.5) 2.59%, rgba(173, 200, 255, 0.5) 96.4%)',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        }}>
          {/* The workspace's own avatar, as in the page header. */}
          <Avatar shape={avatarShapeEnum.SQUARE} size={avatarSizeEnum.MEDIUM} src={avatarUrl} srcPlaceholder={getInitials(name)} />
          {/* The workspace's own name; long names wrap. */}
          <div style={{ marginTop: 24, maxWidth: '100%', fontSize: 20, lineHeight: '28px', fontWeight: 700, color: colorPalette.neutral.darken5, overflowWrap: 'anywhere' }}>{name}</div>
          <div style={{ marginTop: 8, fontSize: 16, lineHeight: '24px', fontWeight: 600, color: colorPalette.neutral.darken4 }}>All context in one place</div>
          <div style={{ marginTop: 13, fontSize: 16, lineHeight: '24px', color: colorPalette.neutral.darken3 }}>
            Get answers that combine your content and Haufe knowledge.
          </div>
        </div>
        <HubColumn items={HAUFE_CONTENT} connector="connector-blue.svg" side="right" />
      </div>
    </div>
  )
}

function HubLabel({ color, inset, children }: { color: string; inset: number; children: ReactNode }) {
  return <div style={{ paddingLeft: inset, fontSize: 12, lineHeight: '18px', fontWeight: 600, textTransform: 'uppercase', color, display: 'flex', alignItems: 'center' }}>{children}</div>
}

/** Three rows, each joined to the middle card by a connector (a line with a dot at each end) across the gap. */
function HubColumn({ items, connector, side }: { items: HubItem[]; connector: string; side: 'left' | 'right' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map(item => (
        <div key={item.key} style={{ position: 'relative' }}>
          <HubRow item={item} />
          <img
            src={`${ICON_DIR}/${HUB_DIR}/${connector}`} alt="" aria-hidden width={31.3333} height={5.33333}
            style={{ position: 'absolute', top: 'calc(50% - 2.67px)', ...(side === 'left' ? { right: -(HUB_GAP + 3.17) } : { left: -(HUB_GAP + 3.17) }) }}
          />
        </div>
      ))}
    </div>
  )
}

/** One card. Yours are dashed, tagged "Not added yet" and carry their own button; Haufe's are plain, solid cards. */
function HubRow({ item }: { item: HubItem }) {
  const yours = !!item.cta
  return (
    <div style={{
      height: 94, boxSizing: 'border-box', borderRadius: 16, padding: '0 20px 0 28px', display: 'flex', alignItems: 'center', gap: 21,
      backgroundColor: colorPalette.white,
      border: `1px ${yours ? 'dashed' : 'solid'} ${yours ? colorPalette.neutral.lighten1 : colorPalette.neutral.lighten2}`,
    }}>
      <img src={`${ICON_DIR}/${item.icon}`} alt="" width={32} height={32} style={{ display: 'block', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <span style={{ fontSize: 16, lineHeight: '24px', fontWeight: 600, color: colorPalette.neutral.darken4 }}>{item.title}</span>
          {yours && <Chip label="Not added yet" size={chipSizes.SMALL} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.DASHED} uppercase={false} />}
        </div>
        <span style={{ fontSize: 14, lineHeight: '20px', color: colorPalette.neutral.darken2 }}>{item.text}</span>
      </div>
      {item.cta && (
        <div style={{ flexShrink: 0 }}>
          <ButtonSecondary size={buttonSizes.SMALL} leftIcon={item.cta.icon} onClick={item.cta.onClick}>{item.cta.label}</ButtonSecondary>
        </div>
      )}
    </div>
  )
}
