import { useState, type ReactNode } from 'react'
import {
  ButtonGhost,
  ButtonPrimary,
  buttonShapes,
  buttonSizes,
  ButtonTertiary,
  buttonVariants,
  Icon,
  iconType,
  Input,
  Modal,
  Select,
  TextArea,
  Toggle,
  Typography,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, type Space } from '../workspaces/shared'
import type { Bookmark, Guardrail, Template, WorkspaceDetail } from './workspaceModel'

/**
 * Hackathon Oct '26 — Version 5: the German copy of WorkspaceTabs (Kontext, Leitplanken, Lesezeichen,
 * Vorlagen). Same components and exports; only the copy and the suggested guardrails differ.
 * Everything here is what CoPilot gets alongside the documents when you ask it about the whole workspace.
 */

let idCounter = 0
const newId = (prefix: string) => { idCounter += 1; return `${prefix}-${Date.now()}-${idCounter}` }

const BOOKMARK_APPS = ['SharePoint', 'Confluence', 'Jira', 'Microsoft Teams', 'Personal Office', 'Website', 'Andere']
const TEMPLATE_APPS = ['Personal Office', 'Microsoft Word', 'SharePoint', 'Outlook', 'Andere']

const SUGGESTED_GUARDRAILS = [
  'Nur aus den Dokumenten dieses Arbeitsbereichs antworten',
  'Für jede Aussage immer die Quelle angeben',
  'Auf Deutsch antworten',
  'Niemals personenbezogene Daten wie Gehälter oder Gesundheitsdaten nennen',
]

const toOptions = (values: string[]) => values.map(v => ({ label: v, value: v }))

// ─── Shared bits ──────────────────────────────────────────────────────────────

/** Empty state used by every tab: icon, one line of what it is, one line of why, one action. */
export function TabEmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(3), padding: `${spacing(12)}px ${spacing(4)}px`, textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: colorPalette.blue.lighten5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1), maxWidth: 440 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">{title}</Typography>
        <Typography size="base-sm" color="neutral-darken2">{text}</Typography>
      </div>
      {action}
    </div>
  )
}

function TabIntro({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing(4) }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1), maxWidth: 640 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">{title}</Typography>
        <Typography size="base-sm" color="neutral-darken2">{text}</Typography>
      </div>
      {action}
    </div>
  )
}

function AppLabel({ app }: { app: string }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: colorPalette.neutral.darken3, backgroundColor: colorPalette.neutral.lighten4, borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>
      {app}
    </span>
  )
}

const cardStyle = { border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 8, backgroundColor: colorPalette.white }

// ─── Context ──────────────────────────────────────────────────────────────────

export function ContextTab({ space, details, onDetailsChange, onSaveBackground }: {
  space: Space
  details: WorkspaceDetail[]
  onDetailsChange: (details: WorkspaceDetail[]) => void
  onSaveBackground: (text: string) => void
}) {
  const [background, setBackground] = useState(space.context ?? '')
  const dirty = background.trim() !== (space.context ?? '').trim()
  const updateDetail = (id: string, patch: Partial<WorkspaceDetail>) => onDetailsChange(details.map(d => d.id === id ? { ...d, ...patch } : d))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(8), maxWidth: 760 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <TabIntro title="Hintergrund" text="Was CoPilot über diesen Kunden, diese Abteilung oder dieses Projekt wissen sollte – wer es ist, worauf es ankommt, wie Sie arbeiten möchten." />
        <TextArea
          value={background}
          autoSize={{ minRows: 4, maxRows: 12 }}
          placeholder="z. B. Mittelständischer Fertigungskunde, Zusammenarbeit seit 3 Jahren, bevorzugt kurze schriftliche Zusammenfassungen, Geschäftsjahr endet im Juni…"
          onChange={e => setBackground(e.target.value)}
        />
        {dirty && (
          <div style={{ display: 'flex', gap: spacing(2), justifyContent: 'flex-end' }}>
            <ButtonTertiary onClick={() => setBackground(space.context ?? '')}>Abbrechen</ButtonTertiary>
            <ButtonPrimary onClick={() => onSaveBackground(background.trim())}>Speichern</ButtonPrimary>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <TabIntro
          title="Details"
          text="Fakten zum Arbeitsbereich selbst, etwa Kundennummer, Kostenstelle oder Ansprechperson."
        />
        {details.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 32px', gap: spacing(2), alignItems: 'center' }}>
            {details.map(d => (
              <DetailRow key={d.id} detail={d} onChange={patch => updateDetail(d.id, patch)} onRemove={() => onDetailsChange(details.filter(x => x.id !== d.id))} />
            ))}
          </div>
        )}
        <div>
          <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => onDetailsChange([...details, { id: newId('detail'), label: '', value: '' }])}>Detail hinzufügen</ButtonGhost>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ detail, onChange, onRemove }: { detail: WorkspaceDetail; onChange: (patch: Partial<WorkspaceDetail>) => void; onRemove: () => void }) {
  return (
    <>
      <Input name={`${detail.id}-label`} value={detail.label} placeholder="z. B. Kundennummer" onChange={e => onChange({ label: e.target.value })} />
      <Input name={`${detail.id}-value`} value={detail.value} placeholder="z. B. 10442" onChange={e => onChange({ value: e.target.value })} />
      <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={onRemove} ariaLabel="Detail entfernen" />
    </>
  )
}

// ─── Guardrails ───────────────────────────────────────────────────────────────

export function GuardrailsTab({ guardrails, onChange }: { guardrails: Guardrail[]; onChange: (guardrails: Guardrail[]) => void }) {
  const [draft, setDraft] = useState('')
  const add = (text: string) => {
    if (!text.trim()) return
    onChange([...guardrails, { id: newId('guardrail'), text: text.trim(), enabled: true }])
    setDraft('')
  }
  const suggestions = SUGGESTED_GUARDRAILS.filter(s => !guardrails.some(g => g.text === s))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6), maxWidth: 760 }}>
      <TabIntro title="Leitplanken" text="Regeln, die CoPilot in diesem Arbeitsbereich immer befolgt. Schalten Sie eine Regel aus, um sie zu pausieren, ohne sie zu löschen." />

      <div style={{ display: 'flex', gap: spacing(2), alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter') add(draft) }}>
          <Input name="new-guardrail" value={draft} placeholder="z. B. Keine Steuerberatung geben – an das Steuerteam verweisen" onChange={e => setDraft(e.target.value)} />
        </div>
        <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={() => add(draft)} disabled={!draft.trim()}>Hinzufügen</ButtonPrimary>
      </div>

      {guardrails.length === 0 ? (
        <TabEmptyState
          icon={<Icon type={iconType.ShieldCheckOutlined} size={24} color="blue-base" />}
          title="Noch keine Leitplanken"
          text="Fügen Sie oben eine hinzu oder starten Sie mit einem Vorschlag unten."
        />
      ) : (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
          {guardrails.map((g, i) => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(3)}px ${spacing(4)}px`, borderTop: i ? `1px solid ${colorPalette.neutral.lighten2}` : undefined }}>
              <Toggle checked={g.enabled} onChange={enabled => onChange(guardrails.map(x => x.id === g.id ? { ...x, enabled } : x))} />
              <div style={{ flex: 1 }}>
                <Typography size="base" color={g.enabled ? 'neutral-darken5' : 'neutral-darken2'}>{g.text}</Typography>
              </div>
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={() => onChange(guardrails.filter(x => x.id !== g.id))} ariaLabel="Leitplanke löschen" />
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <Typography size="base-sm" weight="semibold" color="neutral-darken2">Vorschläge</Typography>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2) }}>
            {suggestions.map(s => (
              <ButtonTertiary key={s} size={buttonSizes.SMALL} leftIcon={iconType.PlusOutlined} onClick={() => add(s)}>{s}</ButtonTertiary>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export function BookmarksTab({ bookmarks, onChange }: { bookmarks: Bookmark[]; onChange: (bookmarks: Bookmark[]) => void }) {
  const [adding, setAdding] = useState(false)
  const addButton = <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={() => setAdding(true)}>Lesezeichen hinzufügen</ButtonPrimary>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
      <TabIntro
        title="Lesezeichen"
        text="Seiten aus anderen Anwendungen, die zu diesem Arbeitsbereich gehören – eine SharePoint-Website, ein Confluence-Bereich, ein Thema in Personal Office."
        action={bookmarks.length > 0 ? addButton : undefined}
      />

      {bookmarks.length === 0 ? (
        <TabEmptyState
          icon={<Icon type={iconType.BookmarkOutlined} size={24} color="blue-base" />}
          title="Noch keine Lesezeichen"
          text="Behalten Sie die Links für diesen Arbeitsbereich an einem Ort und zeigen Sie CoPilot, wo es sonst noch suchen soll."
          action={addButton}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: spacing(4) }}>
          {bookmarks.map(b => (
            <div key={b.id} style={{ ...cardStyle, padding: spacing(4), display: 'flex', gap: spacing(3), alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 8, backgroundColor: colorPalette.blue.lighten5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon type={iconType.LinkOutlined} size={20} color="blue-base" />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
                <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken5, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.title}
                </a>
                <span style={{ fontSize: 12, color: colorPalette.neutral.darken2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.url}</span>
                <div><AppLabel app={b.app} /></div>
              </div>
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={() => onChange(bookmarks.filter(x => x.id !== b.id))} ariaLabel="Lesezeichen löschen" />
            </div>
          ))}
        </div>
      )}

      <AddBookmarkModal open={adding} onClose={() => setAdding(false)} onAdd={b => { onChange([...bookmarks, b]); setAdding(false) }} />
    </div>
  )
}

export function AddBookmarkModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (b: Bookmark) => void }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [app, setApp] = useState(BOOKMARK_APPS[0])
  const reset = () => { setTitle(''); setUrl(''); setApp(BOOKMARK_APPS[0]) }
  const close = () => { reset(); onClose() }
  const valid = title.trim() && url.trim()

  return (
    <Modal
      visible={open}
      title="Lesezeichen hinzufügen"
      withIcon={false}
      onClose={close}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Abbrechen', onClick: close } },
        { variant: buttonVariants.PRIMARY, props: { children: 'Hinzufügen', disabled: !valid, onClick: () => {
          const href = /^https?:\/\//.test(url.trim()) ? url.trim() : `https://${url.trim()}`
          onAdd({ id: newId('bookmark'), title: title.trim(), url: href, app })
          reset()
        } } },
      ] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <Input label="Link" isRequired name="bookmark-url" value={url} placeholder="https://" onChange={e => setUrl(e.target.value)} />
        <Input label="Name" isRequired name="bookmark-title" value={title} placeholder="z. B. SharePoint-Website des Kunden" onChange={e => setTitle(e.target.value)} />
        <Select label="Anwendung" value={app} options={toOptions(BOOKMARK_APPS)} onChange={v => setApp(v as string)} />
      </div>
    </Modal>
  )
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function TemplatesTab({ templates, onChange, onUse }: { templates: Template[]; onChange: (templates: Template[]) => void; onUse: (t: Template) => void }) {
  const [adding, setAdding] = useState(false)
  const addButton = <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={() => setAdding(true)}>Vorlage hinzufügen</ButtonPrimary>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
      <TabIntro
        title="Vorlagen"
        text="Schreiben, Verträge und Prompts aus anderen Anwendungen, die dieser Arbeitsbereich nutzt. CoPilot kann sie mit dem Wissen von hier ausfüllen."
        action={templates.length > 0 ? addButton : undefined}
      />

      {templates.length === 0 ? (
        <TabEmptyState
          icon={<Icon type={iconType.ArticleOutlined} size={24} color="blue-base" />}
          title="Noch keine Vorlagen"
          text="Holen Sie Vorlagen aus Personal Office, Word oder SharePoint, damit die richtigen immer griffbereit sind."
          action={addButton}
        />
      ) : (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
          {templates.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(3)}px ${spacing(4)}px`, borderTop: i ? `1px solid ${colorPalette.neutral.lighten2}` : undefined }}>
              <Icon type={iconType.ArticleOutlined} size={20} color="neutral-darken3" />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                  <Typography size="base" weight="semibold" color="neutral-darken5">{t.name}</Typography>
                  <AppLabel app={t.app} />
                </div>
                {t.description && <Typography size="base-sm" color="neutral-darken2" maxLines={1}>{t.description}</Typography>}
              </div>
              <ButtonTertiary size={buttonSizes.SMALL} onClick={() => onUse(t)}>In CoPilot verwenden</ButtonTertiary>
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={() => onChange(templates.filter(x => x.id !== t.id))} ariaLabel="Vorlage löschen" />
            </div>
          ))}
        </div>
      )}

      <AddTemplateModal open={adding} onClose={() => setAdding(false)} onAdd={t => { onChange([...templates, t]); setAdding(false) }} />
    </div>
  )
}

export function AddTemplateModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (t: Template) => void }) {
  const [name, setName] = useState('')
  const [app, setApp] = useState(TEMPLATE_APPS[0])
  const [description, setDescription] = useState('')
  const reset = () => { setName(''); setApp(TEMPLATE_APPS[0]); setDescription('') }
  const close = () => { reset(); onClose() }

  return (
    <Modal
      visible={open}
      title="Vorlage hinzufügen"
      withIcon={false}
      onClose={close}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: 'Abbrechen', onClick: close } },
        { variant: buttonVariants.PRIMARY, props: { children: 'Hinzufügen', disabled: !name.trim(), onClick: () => {
          onAdd({ id: newId('template'), name: name.trim(), app, description: description.trim() })
          reset()
        } } },
      ] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <Select label="Aus" value={app} options={toOptions(TEMPLATE_APPS)} onChange={v => setApp(v as string)} />
        <Input label="Name" isRequired name="template-name" value={name} placeholder="z. B. Befristeter Arbeitsvertrag" onChange={e => setName(e.target.value)} />
        <TextArea label="Wofür sie gedacht ist" value={description} autoSize={{ minRows: 2, maxRows: 4 }} placeholder="Optional" onChange={e => setDescription(e.target.value)} />
      </div>
    </Modal>
  )
}
