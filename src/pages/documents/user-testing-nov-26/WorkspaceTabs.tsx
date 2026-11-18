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
import type { Bookmark, Guardrail, Template, WorkspaceDetail } from '../hackathon/workspaceModel'
import { defineText, useArea, useText } from './context'

/**
 * Workspaces User Testing Nov '26 — the workspace's non-document tabs: Context, Guardrails, Bookmarks and Templates.
 * Everything here is what your apps get alongside the documents when they use the whole workspace.
 */

let idCounter = 0
const newId = (prefix: string) => { idCounter += 1; return `${prefix}-${Date.now()}-${idCounter}` }

const TEXT = defineText({
  cancel: 'Cancel',
  save: 'Save',
  add: 'Add',
  // Applications a bookmark or template comes from; the area's product is added by name.
  appWebsite: 'Website',
  appOther: 'Other',
  // Context
  backgroundTitle: 'Background',
  backgroundText: 'What your apps should know about this client, department or project — who it is, what matters, how you like to work.',
  backgroundPlaceholder: 'e.g. Mid-size manufacturing client, 3-year relationship, prefers short written summaries, fiscal year ends in June…',
  detailsTitle: 'Details',
  detailsText: 'Facts about the workspace itself, such as client number, cost centre or contact person.',
  addDetail: 'Add detail',
  detailLabelPlaceholder: 'e.g. Client number',
  detailValuePlaceholder: 'e.g. 10442',
  removeDetail: 'Remove detail',
  // Guardrails
  guardrailsTitle: 'Guardrails',
  guardrailsIntro: 'Rules your apps always follow when they use this workspace. Switch one off to pause it without deleting it.',
  guardrailPlaceholder: 'e.g. Don’t give tax advice — refer to the tax team',
  examplesTitle: 'Start with an example',
  examplesText: 'Guardrails apply to this workspace only. Add an example as it is, or write your own above. You can switch any rule off or delete it later.',
  moreExamples: 'More examples',
  noGuardrailsTitle: 'No guardrails yet',
  noGuardrailsText: 'Add one above, or start with a suggestion below.',
  deleteGuardrail: 'Delete guardrail',
  suggestionsTitle: 'Suggestions',
  suggestedGuardrails: [
    'Only answer from the documents in this workspace',
    'Always cite the source for every statement',
    'Answer in German',
    'Never include personal data such as salaries or health information',
  ],
  // Bookmarks
  bookmarksTitle: 'Bookmarks',
  bookmarksText: (product: string) => `Pages from other applications that belong to this workspace — a SharePoint site, a Confluence space, a ${product} topic.`,
  addBookmark: 'Add bookmark',
  noBookmarksTitle: 'No bookmarks yet',
  noBookmarksText: 'Keep the links you need for this workspace in one place, and let your apps know where else to look.',
  deleteBookmark: 'Delete bookmark',
  linkLabel: 'Link',
  nameLabel: 'Name',
  bookmarkNamePlaceholder: 'e.g. Client SharePoint site',
  applicationLabel: 'Application',
  // Templates
  templatesTitle: 'Templates',
  templatesText: 'Letters, contracts and prompts from other applications that this workspace uses. Your apps can fill them in with what they know here.',
  addTemplate: 'Add template',
  noTemplatesTitle: 'No templates yet',
  noTemplatesText: (product: string) => `Bring in templates from ${product}, Word or SharePoint so the right ones are always at hand.`,
  useInCopilot: 'Use in CoPilot',
  deleteTemplate: 'Delete template',
  fromLabel: 'From',
  templateNamePlaceholder: 'e.g. Fixed-term employment contract',
  whatFor: 'What it’s for',
  optional: 'Optional',
}, {
  cancel: 'Abbrechen',
  save: 'Speichern',
  add: 'Hinzufügen',
  appWebsite: 'Website',
  appOther: 'Sonstige',
  backgroundTitle: 'Hintergrund',
  backgroundText: 'Was Ihre Apps über diesen Mandanten, diese Abteilung oder dieses Projekt wissen sollten – wer es ist, worauf es ankommt, wie Sie arbeiten möchten.',
  backgroundPlaceholder: 'z. B. Mittelständischer Fertigungskunde, Zusammenarbeit seit 3 Jahren, bevorzugt kurze schriftliche Zusammenfassungen, Geschäftsjahr endet im Juni…',
  detailsTitle: 'Details',
  detailsText: 'Fakten zum Arbeitsbereich selbst, etwa Mandantennummer, Kostenstelle oder Ansprechperson.',
  addDetail: 'Detail hinzufügen',
  detailLabelPlaceholder: 'z. B. Mandantennummer',
  detailValuePlaceholder: 'z. B. 10442',
  removeDetail: 'Detail entfernen',
  guardrailsTitle: 'Leitplanken',
  guardrailsIntro: 'Regeln, die Ihre Apps immer befolgen, wenn sie diesen Arbeitsbereich nutzen. Schalten Sie eine Regel aus, um sie zu pausieren, ohne sie zu löschen.',
  guardrailPlaceholder: 'z. B. Keine Steuerberatung – an das Steuerteam verweisen',
  examplesTitle: 'Mit einem Beispiel beginnen',
  examplesText: 'Leitplanken gelten nur für diesen Arbeitsbereich. Übernehmen Sie ein Beispiel unverändert oder formulieren Sie oben Ihre eigene Regel. Sie können jede Regel später ausschalten oder löschen.',
  moreExamples: 'Weitere Beispiele',
  noGuardrailsTitle: 'Noch keine Leitplanken',
  noGuardrailsText: 'Fügen Sie oben eine hinzu oder starten Sie mit einem Vorschlag unten.',
  deleteGuardrail: 'Leitplanke löschen',
  suggestionsTitle: 'Vorschläge',
  suggestedGuardrails: [
    'Nur mit den Dokumenten in diesem Arbeitsbereich antworten',
    'Für jede Aussage immer die Quelle angeben',
    'Auf Deutsch antworten',
    'Niemals personenbezogene Daten wie Gehälter oder Gesundheitsdaten nennen',
  ],
  bookmarksTitle: 'Lesezeichen',
  bookmarksText: (product: string) => `Seiten aus anderen Anwendungen, die zu diesem Arbeitsbereich gehören – eine SharePoint-Website, ein Confluence-Bereich, ein Thema in ${product}.`,
  addBookmark: 'Lesezeichen hinzufügen',
  noBookmarksTitle: 'Noch keine Lesezeichen',
  noBookmarksText: 'Behalten Sie die Links für diesen Arbeitsbereich an einem Ort und zeigen Sie Ihren Apps, wo sie sonst noch suchen sollen.',
  deleteBookmark: 'Lesezeichen löschen',
  linkLabel: 'Link',
  nameLabel: 'Name',
  bookmarkNamePlaceholder: 'z. B. SharePoint-Website des Mandanten',
  applicationLabel: 'Anwendung',
  templatesTitle: 'Vorlagen',
  templatesText: 'Schreiben, Verträge und Prompts aus anderen Anwendungen, die dieser Arbeitsbereich nutzt. Ihre Apps können sie mit dem Wissen von hier ausfüllen.',
  addTemplate: 'Vorlage hinzufügen',
  noTemplatesTitle: 'Noch keine Vorlagen',
  noTemplatesText: (product: string) => `Holen Sie Vorlagen aus ${product}, Word oder SharePoint hierher, damit Sie immer die richtigen zur Hand haben.`,
  useInCopilot: 'In CoPilot verwenden',
  deleteTemplate: 'Vorlage löschen',
  fromLabel: 'Aus',
  templateNamePlaceholder: 'z. B. Befristeter Arbeitsvertrag',
  whatFor: 'Wofür sie gedacht ist',
  optional: 'Optional',
})

/** Where a bookmark can point: the area's product sits among the usual apps. */
function useBookmarkApps() {
  const t = useText(TEXT)
  const { product } = useArea()
  return ['SharePoint', 'Confluence', 'Jira', 'Microsoft Teams', product.shortName, t.appWebsite, t.appOther]
}

/** Where a template comes from: the area's product first. */
function useTemplateApps() {
  const t = useText(TEXT)
  const { product } = useArea()
  return [product.shortName, 'Microsoft Word', 'SharePoint', 'Outlook', t.appOther]
}

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
        <Typography size="base" weight="semibold" color="neutral-darken5" align="center">{title}</Typography>
        <Typography size="base-sm" color="neutral-darken2" align="center">{text}</Typography>
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

export function AppLabel({ app }: { app: string }) {
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
  const t = useText(TEXT)
  const [background, setBackground] = useState(space.context ?? '')
  const dirty = background.trim() !== (space.context ?? '').trim()
  const updateDetail = (id: string, patch: Partial<WorkspaceDetail>) => onDetailsChange(details.map(d => d.id === id ? { ...d, ...patch } : d))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(8), maxWidth: 760 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <TabIntro title={t.backgroundTitle} text={t.backgroundText} />
        <TextArea
          value={background}
          autoSize={{ minRows: 4, maxRows: 12 }}
          placeholder={t.backgroundPlaceholder}
          onChange={e => setBackground(e.target.value)}
        />
        {dirty && (
          <div style={{ display: 'flex', gap: spacing(2), justifyContent: 'flex-end' }}>
            <ButtonTertiary onClick={() => setBackground(space.context ?? '')}>{t.cancel}</ButtonTertiary>
            <ButtonPrimary onClick={() => onSaveBackground(background.trim())}>{t.save}</ButtonPrimary>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <TabIntro
          title={t.detailsTitle}
          text={t.detailsText}
        />
        {details.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 32px', gap: spacing(2), alignItems: 'center' }}>
            {details.map(d => (
              <DetailRow key={d.id} detail={d} onChange={patch => updateDetail(d.id, patch)} onRemove={() => onDetailsChange(details.filter(x => x.id !== d.id))} />
            ))}
          </div>
        )}
        <div>
          <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => onDetailsChange([...details, { id: newId('detail'), label: '', value: '' }])}>{t.addDetail}</ButtonGhost>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ detail, onChange, onRemove }: { detail: WorkspaceDetail; onChange: (patch: Partial<WorkspaceDetail>) => void; onRemove: () => void }) {
  const t = useText(TEXT)
  return (
    <>
      <Input name={`${detail.id}-label`} value={detail.label} placeholder={t.detailLabelPlaceholder} onChange={e => onChange({ label: e.target.value })} />
      <Input name={`${detail.id}-value`} value={detail.value} placeholder={t.detailValuePlaceholder} onChange={e => onChange({ value: e.target.value })} />
      <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={onRemove} ariaLabel={t.removeDetail} />
    </>
  )
}

// ─── Guardrails ───────────────────────────────────────────────────────────────

/** An example guardrail with what it's for (Workspaces 2.0 Version 21's empty Guardrails page). */
export type GuardrailExample = { category: string; icon: string; text: string; why: string }

// `plain` (Workspaces 2.0 V15/V16): no intro — the page has its own title — and the rules as plain rows between lines,
// like the Used in page's, instead of in a bordered card.
// `examples` (Version 21): with no guardrails yet, a grid of example cards to add from, instead of the empty state and
// suggestion chips; once there are some, the examples not yet added stay below as the same cards.
export function GuardrailsTab({ guardrails, onChange, plain = false, examples }: { guardrails: Guardrail[]; onChange: (guardrails: Guardrail[]) => void; plain?: boolean; examples?: GuardrailExample[] }) {
  const t = useText(TEXT)
  const [draft, setDraft] = useState('')
  const add = (text: string) => {
    if (!text.trim()) return
    onChange([...guardrails, { id: newId('guardrail'), text: text.trim(), enabled: true }])
    setDraft('')
  }
  const suggestions = (examples ? examples.map(e => e.text) : t.suggestedGuardrails).filter(s => !guardrails.some(g => g.text === s))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6), maxWidth: 760 }}>
      {!plain && <TabIntro title={t.guardrailsTitle} text={t.guardrailsIntro} />}

      <div style={{ display: 'flex', gap: spacing(2), alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter') add(draft) }}>
          <Input name="new-guardrail" value={draft} placeholder={t.guardrailPlaceholder} onChange={e => setDraft(e.target.value)} />
        </div>
        <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={() => add(draft)} disabled={!draft.trim()}>{t.add}</ButtonPrimary>
      </div>

      {guardrails.length === 0 && examples ? (
        <GuardrailExamples examples={examples} onAdd={add} title={t.examplesTitle} text={t.examplesText} />
      ) : guardrails.length === 0 ? (
        <TabEmptyState
          icon={<Icon type={iconType.ShieldCheckOutlined} size={24} color="blue-base" />}
          title={t.noGuardrailsTitle}
          text={t.noGuardrailsText}
        />
      ) : (
        <div style={{ ...(plain ? {} : cardStyle), display: 'flex', flexDirection: 'column' }}>
          {guardrails.map((g, i) => (
            <div key={g.id} style={{
              display: 'flex', alignItems: 'center', gap: spacing(3), padding: plain ? `${spacing(3)}px ${spacing(2)}px` : `${spacing(3)}px ${spacing(4)}px`,
              borderTop: plain ? (i ? `1px solid ${colorPalette.neutral.lighten3}` : undefined) : (i ? `1px solid ${colorPalette.neutral.lighten2}` : undefined),
              borderBottom: plain && i === guardrails.length - 1 ? `1px solid ${colorPalette.neutral.lighten3}` : undefined,
            }}>
              <Toggle checked={g.enabled} onChange={enabled => onChange(guardrails.map(x => x.id === g.id ? { ...x, enabled } : x))} />
              <div style={{ flex: 1 }}>
                <Typography size="base" color={g.enabled ? 'neutral-darken5' : 'neutral-darken2'}>{g.text}</Typography>
              </div>
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={() => onChange(guardrails.filter(x => x.id !== g.id))} ariaLabel={t.deleteGuardrail} />
            </div>
          ))}
        </div>
      )}

      {/* With examples (Version 21): the ones not added yet stay below the rules, as the same cards. */}
      {examples && guardrails.length > 0 && suggestions.length > 0 && (
        <GuardrailExamples examples={examples.filter(e => suggestions.includes(e.text))} onAdd={add} title={t.moreExamples} />
      )}

      {suggestions.length > 0 && !examples && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <Typography size="base-sm" weight="semibold" color="neutral-darken2">{t.suggestionsTitle}</Typography>
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

/**
 * No guardrails yet (Version 21): examples to start from, each a card with its category and icon, the rule, why it
 * helps and Add — so it's clear what a guardrail is and one click adds a first one.
 */
function GuardrailExamples({ examples, onAdd, title, text }: { examples: GuardrailExample[]; onAdd: (text: string) => void; title: string; text?: string }) {
  const t = useText(TEXT)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">{title}</Typography>
        {text && <Typography size="base-sm" color="neutral-darken2">{text}</Typography>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: spacing(3) }}>
        {examples.map(example => (
          <div key={example.text} style={{
            display: 'flex', flexDirection: 'column', gap: spacing(2), padding: spacing(4), borderRadius: 12,
            border: `1px solid ${colorPalette.neutral.lighten2}`, backgroundColor: colorPalette.white,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colorPalette.blue.lighten5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon type={example.icon as never} size={16} color="blue-base" />
              </div>
              <span style={{ fontSize: 11, lineHeight: '16px', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', color: colorPalette.neutral.darken2 }}>{example.category}</span>
            </div>
            <Typography size="base" weight="semibold" color="neutral-darken5">{example.text}</Typography>
            <Typography size="base-sm" color="neutral-darken2">{example.why}</Typography>
            <div style={{ flex: 1 }} />
            <div style={{ marginTop: spacing(1) }}>
              <ButtonTertiary size={buttonSizes.SMALL} leftIcon={iconType.PlusOutlined} onClick={() => onAdd(example.text)}>{t.add}</ButtonTertiary>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export function BookmarksTab({ bookmarks, onChange }: { bookmarks: Bookmark[]; onChange: (bookmarks: Bookmark[]) => void }) {
  const t = useText(TEXT)
  const { product } = useArea()
  const [adding, setAdding] = useState(false)
  const addButton = <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={() => setAdding(true)}>{t.addBookmark}</ButtonPrimary>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
      <TabIntro
        title={t.bookmarksTitle}
        text={t.bookmarksText(product.shortName)}
        action={bookmarks.length > 0 ? addButton : undefined}
      />

      {bookmarks.length === 0 ? (
        <TabEmptyState
          icon={<Icon type={iconType.BookmarkOutlined} size={24} color="blue-base" />}
          title={t.noBookmarksTitle}
          text={t.noBookmarksText}
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
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={() => onChange(bookmarks.filter(x => x.id !== b.id))} ariaLabel={t.deleteBookmark} />
            </div>
          ))}
        </div>
      )}

      <AddBookmarkModal open={adding} onClose={() => setAdding(false)} onAdd={b => { onChange([...bookmarks, b]); setAdding(false) }} />
    </div>
  )
}

export function AddBookmarkModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (b: Bookmark) => void }) {
  const t = useText(TEXT)
  const bookmarkApps = useBookmarkApps()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [app, setApp] = useState(bookmarkApps[0])
  const reset = () => { setTitle(''); setUrl(''); setApp(bookmarkApps[0]) }
  const close = () => { reset(); onClose() }
  const valid = title.trim() && url.trim()

  return (
    <Modal
      visible={open}
      title={t.addBookmark}
      withIcon={false}
      onClose={close}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: t.cancel, onClick: close } },
        { variant: buttonVariants.PRIMARY, props: { children: t.add, disabled: !valid, onClick: () => {
          const href = /^https?:\/\//.test(url.trim()) ? url.trim() : `https://${url.trim()}`
          onAdd({ id: newId('bookmark'), title: title.trim(), url: href, app })
          reset()
        } } },
      ] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <Input label={t.linkLabel} isRequired name="bookmark-url" value={url} placeholder="https://" onChange={e => setUrl(e.target.value)} />
        <Input label={t.nameLabel} isRequired name="bookmark-title" value={title} placeholder={t.bookmarkNamePlaceholder} onChange={e => setTitle(e.target.value)} />
        <Select label={t.applicationLabel} value={app} options={toOptions(bookmarkApps)} onChange={v => setApp(v as string)} />
      </div>
    </Modal>
  )
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function TemplatesTab({ templates, onChange, onUse }: { templates: Template[]; onChange: (templates: Template[]) => void; onUse: (t: Template) => void }) {
  const t = useText(TEXT)
  const { product } = useArea()
  const [adding, setAdding] = useState(false)
  const addButton = <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={() => setAdding(true)}>{t.addTemplate}</ButtonPrimary>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
      <TabIntro
        title={t.templatesTitle}
        text={t.templatesText}
        action={templates.length > 0 ? addButton : undefined}
      />

      {templates.length === 0 ? (
        <TabEmptyState
          icon={<Icon type={iconType.ArticleOutlined} size={24} color="blue-base" />}
          title={t.noTemplatesTitle}
          text={t.noTemplatesText(product.shortName)}
          action={addButton}
        />
      ) : (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
          {templates.map((template, i) => (
            <div key={template.id} style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(3)}px ${spacing(4)}px`, borderTop: i ? `1px solid ${colorPalette.neutral.lighten2}` : undefined }}>
              <Icon type={iconType.ArticleOutlined} size={20} color="neutral-darken3" />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                  <Typography size="base" weight="semibold" color="neutral-darken5">{template.name}</Typography>
                  <AppLabel app={template.app} />
                </div>
                {template.description && <Typography size="base-sm" color="neutral-darken2" maxLines={1}>{template.description}</Typography>}
              </div>
              <ButtonTertiary size={buttonSizes.SMALL} onClick={() => onUse(template)}>{t.useInCopilot}</ButtonTertiary>
              <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={() => onChange(templates.filter(x => x.id !== template.id))} ariaLabel={t.deleteTemplate} />
            </div>
          ))}
        </div>
      )}

      <AddTemplateModal open={adding} onClose={() => setAdding(false)} onAdd={template => { onChange([...templates, template]); setAdding(false) }} />
    </div>
  )
}

export function AddTemplateModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (t: Template) => void }) {
  const t = useText(TEXT)
  const templateApps = useTemplateApps()
  const [name, setName] = useState('')
  const [app, setApp] = useState(templateApps[0])
  const [description, setDescription] = useState('')
  const reset = () => { setName(''); setApp(templateApps[0]); setDescription('') }
  const close = () => { reset(); onClose() }

  return (
    <Modal
      visible={open}
      title={t.addTemplate}
      withIcon={false}
      onClose={close}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: t.cancel, onClick: close } },
        { variant: buttonVariants.PRIMARY, props: { children: t.add, disabled: !name.trim(), onClick: () => {
          onAdd({ id: newId('template'), name: name.trim(), app, description: description.trim() })
          reset()
        } } },
      ] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <Select label={t.fromLabel} value={app} options={toOptions(templateApps)} onChange={v => setApp(v as string)} />
        <Input label={t.nameLabel} isRequired name="template-name" value={name} placeholder={t.templateNamePlaceholder} onChange={e => setName(e.target.value)} />
        <TextArea label={t.whatFor} value={description} autoSize={{ minRows: 2, maxRows: 4 }} placeholder={t.optional} onChange={e => setDescription(e.target.value)} />
      </div>
    </Modal>
  )
}
