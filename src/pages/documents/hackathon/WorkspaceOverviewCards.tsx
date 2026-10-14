import { useState, type ReactNode } from 'react'
import {
  ButtonGhost,
  buttonShapes,
  buttonSizes,
  ButtonTertiary,
  buttonVariants,
  Icon,
  iconType,
  Input,
  Modal,
  TextArea,
  Toggle,
  Typography,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, type Space } from '../workspaces/shared'
import { AddBookmarkModal, AddTemplateModal } from './WorkspaceTabs'
import { SUGGESTED_GUARDRAILS, type Bookmark, type Guardrail, type Template, type WorkspaceDetail } from './workspaceModel'

/**
 * Hackathon Oct '26 — Version 2: the workspace's context, guardrails, bookmarks and templates as four
 * compact cards, so they sit on the same screen as the documents. Adding and editing happen in dialogs.
 */

let idCounter = 0
const newId = (prefix: string) => { idCounter += 1; return `${prefix}-${Date.now()}-${idCounter}` }

const CARD_HEIGHT = 240

// ─── Card shell ───────────────────────────────────────────────────────────────

function OverviewCard({ icon, title, count, action, children }: {
  icon: string
  title: string
  count?: number
  action: ReactNode
  children: ReactNode
}) {
  return (
    <div style={{
      height: CARD_HEIGHT, display: 'flex', flexDirection: 'column', minWidth: 0,
      border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 8, backgroundColor: colorPalette.white,
    }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px ${spacing(2)}px ${spacing(2)}px ${spacing(4)}px`, borderBottom: `1px solid ${colorPalette.neutral.lighten2}` }}>
        <Icon type={icon as never} size={16} color="neutral-darken3" />
        <Typography size="base" weight="semibold" color="neutral-darken5">{title}</Typography>
        {!!count && <Typography size="base-sm" color="neutral-darken2">{count}</Typography>}
        <div style={{ flex: 1 }} />
        {action}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: `${spacing(2)}px ${spacing(4)}px` }}>{children}</div>
    </div>
  )
}

function EmptyHint({ children }: { children: string }) {
  return <div style={{ paddingTop: spacing(2) }}><Typography size="base-sm" color="neutral-darken2">{children}</Typography></div>
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <ButtonGhost size={buttonSizes.SMALL} shape={buttonShapes.SQUARE} leftIcon={iconType.PlusOutlined} onClick={onClick} ariaLabel={label} />
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <ButtonGhost size={buttonSizes.SMALL} shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={onClick} ariaLabel={label} />
}

function Row({ children, first }: { children: ReactNode; first: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(2)}px 0`, borderTop: first ? undefined : `1px solid ${colorPalette.neutral.lighten3}` }}>
      {children}
    </div>
  )
}

function AppLabel({ app }: { app: string }) {
  return (
    <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: colorPalette.neutral.darken3, backgroundColor: colorPalette.neutral.lighten4, borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap' }}>
      {app}
    </span>
  )
}

const ellipsis = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const

// ─── Context ──────────────────────────────────────────────────────────────────

export function ContextCard({ space, details, onSave }: {
  space: Space
  details: WorkspaceDetail[]
  onSave: (background: string, details: WorkspaceDetail[]) => void
}) {
  const [editing, setEditing] = useState(false)
  const filled = details.filter(d => d.label.trim() && d.value.trim())
  const background = space.context?.trim()

  return (
    <OverviewCard
      icon={iconType.InfoCircleOutlined}
      title="Context"
      action={<ButtonGhost size={buttonSizes.SMALL} shape={buttonShapes.SQUARE} leftIcon={iconType.EditOutlined} onClick={() => setEditing(true)} ariaLabel="Edit context" />}
    >
      {!background && filled.length === 0 ? (
        <EmptyHint>What CoPilot should know about this client, department or project.</EmptyHint>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3), paddingTop: spacing(2) }}>
          {background && <Typography size="base-sm" color="neutral-darken5" maxLines={4}>{background}</Typography>}
          {filled.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: spacing(3), rowGap: spacing(1) }}>
              {filled.map(d => (
                <div key={d.id} style={{ display: 'contents' }}>
                  <span style={{ fontSize: 12, color: colorPalette.neutral.darken2, ...ellipsis }}>{d.label}</span>
                  <span style={{ fontSize: 12, color: colorPalette.neutral.darken5, ...ellipsis }}>{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <EditContextModal
        open={editing}
        background={space.context ?? ''}
        details={details}
        onClose={() => setEditing(false)}
        onSave={(b, d) => { onSave(b, d); setEditing(false) }}
      />
    </OverviewCard>
  )
}

function EditContextModal({ open, background, details, onClose, onSave }: {
  open: boolean
  background: string
  details: WorkspaceDetail[]
  onClose: () => void
  onSave: (background: string, details: WorkspaceDetail[]) => void
}) {
  const [draftBackground, setDraftBackground] = useState(background)
  const [draftDetails, setDraftDetails] = useState(details)
  // Start from what's saved each time the dialog opens.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) { setDraftBackground(background); setDraftDetails(details) }
  }
  const updateDetail = (id: string, patch: Partial<WorkspaceDetail>) => setDraftDetails(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d))

  return (
    <Modal
      visible={open}
      title="Context"
      withIcon={false}
      onClose={onClose}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: onClose } },
        { variant: buttonVariants.PRIMARY, props: { children: 'Save', onClick: () => onSave(draftBackground.trim(), draftDetails.filter(d => d.label.trim() || d.value.trim())) } },
      ] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
        <TextArea
          label="Background"
          value={draftBackground}
          autoSize={{ minRows: 4, maxRows: 10 }}
          placeholder="e.g. Mid-size manufacturing client, 3-year relationship, prefers short written summaries, fiscal year ends in June…"
          onChange={e => setDraftBackground(e.target.value)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <Typography size="base" weight="semibold" color="neutral-darken5">Details</Typography>
          {draftDetails.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 32px', gap: spacing(2), alignItems: 'center' }}>
              {draftDetails.map(d => (
                <div key={d.id} style={{ display: 'contents' }}>
                  <Input name={`${d.id}-label`} value={d.label} placeholder="e.g. Client number" onChange={e => updateDetail(d.id, { label: e.target.value })} />
                  <Input name={`${d.id}-value`} value={d.value} placeholder="e.g. 10442" onChange={e => updateDetail(d.id, { value: e.target.value })} />
                  <RemoveButton label="Remove detail" onClick={() => setDraftDetails(prev => prev.filter(x => x.id !== d.id))} />
                </div>
              ))}
            </div>
          )}
          <div>
            <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => setDraftDetails(prev => [...prev, { id: newId('detail'), label: '', value: '' }])}>Add detail</ButtonGhost>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Guardrails ───────────────────────────────────────────────────────────────

export function GuardrailsCard({ guardrails, onChange }: { guardrails: Guardrail[]; onChange: (guardrails: Guardrail[]) => void }) {
  const [adding, setAdding] = useState(false)
  return (
    <OverviewCard icon={iconType.ShieldCheckOutlined} title="Guardrails" count={guardrails.length} action={<AddButton label="Add guardrail" onClick={() => setAdding(true)} />}>
      {guardrails.length === 0 ? (
        <EmptyHint>Rules CoPilot always follows in this workspace.</EmptyHint>
      ) : guardrails.map((g, i) => (
        <Row key={g.id} first={i === 0}>
          <Toggle checked={g.enabled} onChange={enabled => onChange(guardrails.map(x => x.id === g.id ? { ...x, enabled } : x))} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography size="base-sm" color={g.enabled ? 'neutral-darken5' : 'neutral-darken2'} maxLines={2}>{g.text}</Typography>
          </div>
          <RemoveButton label="Delete guardrail" onClick={() => onChange(guardrails.filter(x => x.id !== g.id))} />
        </Row>
      ))}
      <AddGuardrailModal
        open={adding}
        existing={guardrails.map(g => g.text)}
        onClose={() => setAdding(false)}
        onAdd={text => { onChange([...guardrails, { id: newId('guardrail'), text, enabled: true }]); setAdding(false) }}
      />
    </OverviewCard>
  )
}

function AddGuardrailModal({ open, existing, onClose, onAdd }: { open: boolean; existing: string[]; onClose: () => void; onAdd: (text: string) => void }) {
  const [text, setText] = useState('')
  const close = () => { setText(''); onClose() }
  const add = (t: string) => { onAdd(t.trim()); setText('') }
  const suggestions = SUGGESTED_GUARDRAILS.filter(s => !existing.includes(s))

  return (
    <Modal
      visible={open}
      title="Add guardrail"
      withIcon={false}
      onClose={close}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Cancel', onClick: close } },
        { variant: buttonVariants.PRIMARY, props: { children: 'Add', disabled: !text.trim(), onClick: () => add(text) } },
      ] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <TextArea
          label="Rule"
          value={text}
          autoSize={{ minRows: 2, maxRows: 4 }}
          placeholder="e.g. Don't give tax advice — refer to the tax team"
          onChange={e => setText(e.target.value)}
        />
        {suggestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            <Typography size="base-sm" weight="semibold" color="neutral-darken2">Or pick a suggestion</Typography>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2) }}>
              {suggestions.map(s => <ButtonTertiary key={s} size={buttonSizes.SMALL} leftIcon={iconType.PlusOutlined} onClick={() => add(s)}>{s}</ButtonTertiary>)}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export function BookmarksCard({ bookmarks, onChange }: { bookmarks: Bookmark[]; onChange: (bookmarks: Bookmark[]) => void }) {
  const [adding, setAdding] = useState(false)
  return (
    <OverviewCard icon={iconType.BookmarkOutlined} title="Bookmarks" count={bookmarks.length} action={<AddButton label="Add bookmark" onClick={() => setAdding(true)} />}>
      {bookmarks.length === 0 ? (
        <EmptyHint>Links to this workspace in other applications.</EmptyHint>
      ) : bookmarks.map((b, i) => (
        <Row key={b.id} first={i === 0}>
          <Icon type={iconType.LinkOutlined} size={16} color="blue-base" />
          <a href={b.url} target="_blank" rel="noopener noreferrer" title={b.url} style={{ flex: 1, minWidth: 0, fontSize: 14, color: colorPalette.neutral.darken5, textDecoration: 'none', ...ellipsis }}>{b.title}</a>
          <AppLabel app={b.app} />
          <RemoveButton label="Delete bookmark" onClick={() => onChange(bookmarks.filter(x => x.id !== b.id))} />
        </Row>
      ))}
      <AddBookmarkModal open={adding} onClose={() => setAdding(false)} onAdd={b => { onChange([...bookmarks, b]); setAdding(false) }} />
    </OverviewCard>
  )
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function TemplatesCard({ templates, onChange, onUse }: { templates: Template[]; onChange: (templates: Template[]) => void; onUse: (t: Template) => void }) {
  const [adding, setAdding] = useState(false)
  return (
    <OverviewCard icon={iconType.ArticleOutlined} title="Templates" count={templates.length} action={<AddButton label="Add template" onClick={() => setAdding(true)} />}>
      {templates.length === 0 ? (
        <EmptyHint>Templates from other applications this workspace uses.</EmptyHint>
      ) : templates.map((t, i) => (
        <Row key={t.id} first={i === 0}>
          <span title={t.description || t.name} style={{ flex: 1, minWidth: 0, fontSize: 14, color: colorPalette.neutral.darken5, ...ellipsis }}>{t.name}</span>
          <AppLabel app={t.app} />
          <ButtonGhost size={buttonSizes.SMALL} onClick={() => onUse(t)}>Use</ButtonGhost>
          <RemoveButton label="Delete template" onClick={() => onChange(templates.filter(x => x.id !== t.id))} />
        </Row>
      ))}
      <AddTemplateModal open={adding} onClose={() => setAdding(false)} onAdd={t => { onChange([...templates, t]); setAdding(false) }} />
    </OverviewCard>
  )
}
