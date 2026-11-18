import { useMemo, useState, type ReactNode } from 'react'
import {
  ButtonGhost,
  ButtonPrimary,
  ButtonTertiary,
  buttonVariants,
  Checkbox,
  Modal,
  SearchBar,
  searchbarWidth,
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
  Tooltip,
  tooltipPlacements,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing, formatDate, type DocSource, type MetadataDocument } from '../workspaces/shared'
import { defineText, useText } from './context'

/**
 * Workspaces 2.0 Versions 19 and 21 — CoPilot's menu after the FigJam "CoPilot" frames (Workspaces 2.0 board, 150:191):
 * - WorkspaceSelector: the current workspace in a clickable container ("Switch or create"), opening a DS Dropdown
 *   with Your workspaces, a dashed Create workspace card and Manage workspaces.
 * - WorkspacesPromo: under the question box, what a workspace adds — the Workspaces empty state's
 *   "your workspace + Haufe knowledge = your answers", side by side.
 */

const MENU_WIDTH = 236

const TEXT = defineText({
  private: 'Private',
  organisation: 'Organisation',
  newChip: 'New',
  yourWorkspaces: 'Your workspaces',
  switchOrCreate: 'Switch or create',
  createWorkspace: 'Create workspace',
  createWorkspaceText: 'Bring a client’s or project’s documents and context together so answers always fit the case.',
  manageWorkspaces: 'Manage workspaces',
  // "Workspaces: answers that fit the case", with "fit the case" in blue.
  promoBefore: 'Workspaces: answers that ',
  promoHighlight: 'fit the case',
  promoAfter: '',
  dismiss: 'Dismiss',
  promoWorkspaceLabel: 'Your workspace',
  promoWorkspaceTitle: 'What you know',
  promoHaufeLabel: 'Haufe knowledge',
  promoHaufeTitle: 'Trusted expertise',
  promoAnswersLabel: 'Your answers',
  promoAnswersTitle: 'Advice that fits the case',
  addDocument: 'Add document',
  uploadDocuments: 'Upload documents',
  uploadToWorkspace: (workspace: string) => `Added to ${workspace}’s documents`,
  uploadToChat: 'Only available in this chat',
  chooseFromWorkspace: (workspace: string, n: number) => `Choose from ${workspace} documents · ${n}`,
  chooseFromMyDocuments: (n: number) => `Choose from My Documents · ${n}`,
  inWorkspaceChats: 'Available in every chat in this workspace',
  inAllChats: 'Available in all chats',
  myDocuments: 'My Documents',
  workspaceDocuments: (workspace: string) => `${workspace} documents`,
  searchWorkspace: (workspace: string) => `Search ${workspace} documents`,
  searchMyDocuments: 'Search My Documents',
  noResults: 'No documents match your search.',
  cancel: 'Cancel',
  attach: 'Attach',
  attachCount: (n: number) => `Attach ${n} document${n === 1 ? '' : 's'}`,
  date: (iso: string) => formatDate(iso),
}, {
  private: 'Privat',
  organisation: 'Organisation',
  newChip: 'Neu',
  yourWorkspaces: 'Ihre Arbeitsbereiche',
  switchOrCreate: 'Wechseln oder erstellen',
  createWorkspace: 'Arbeitsbereich erstellen',
  createWorkspaceText: 'Bündeln Sie Dokumente und Kontext zu einem Kunden oder Projekt, damit die Antworten immer zum Fall passen.',
  manageWorkspaces: 'Arbeitsbereiche verwalten',
  promoBefore: 'Arbeitsbereiche: Antworten, die ',
  promoHighlight: 'zum Fall passen',
  promoAfter: '',
  dismiss: 'Ausblenden',
  promoWorkspaceLabel: 'Ihr Arbeitsbereich',
  promoWorkspaceTitle: 'Ihr Wissen',
  promoHaufeLabel: 'Haufe Wissen',
  promoHaufeTitle: 'Verlässliche Expertise',
  promoAnswersLabel: 'Ihre Antworten',
  promoAnswersTitle: 'Rat, der zum Fall passt',
  addDocument: 'Dokument hinzufügen',
  uploadDocuments: 'Dokumente hochladen',
  uploadToWorkspace: (workspace: string) => `Wird zu den Dokumenten von ${workspace} hinzugefügt`,
  uploadToChat: 'Nur in diesem Chat verfügbar',
  chooseFromWorkspace: (workspace: string, n: number) => `Aus Dokumenten von ${workspace} wählen · ${n}`,
  chooseFromMyDocuments: (n: number) => `Aus Meine Dokumente wählen · ${n}`,
  inWorkspaceChats: 'In jedem Chat dieses Arbeitsbereichs verfügbar',
  inAllChats: 'In allen Chats verfügbar',
  myDocuments: 'Meine Dokumente',
  workspaceDocuments: (workspace: string) => `Dokumente von ${workspace}`,
  searchWorkspace: (workspace: string) => `Dokumente von ${workspace} durchsuchen`,
  searchMyDocuments: 'Meine Dokumente durchsuchen',
  noResults: 'Keine Dokumente zu Ihrer Suche.',
  cancel: 'Abbrechen',
  attach: 'Anhängen',
  attachCount: (n: number) => `${n} ${n === 1 ? 'Dokument' : 'Dokumente'} anhängen`,
  date: (iso: string) => new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' }),
})

// `visibility`: the workspace's access, shown as an icon after its name (My workspace has none).
export type WorkspaceOption = { id: string; name: string; description: string; icon: ReactNode; visibility?: 'private' | 'public' }

/**
 * A workspace's access after its name, as on the workspace pages (shared.tsx VisibilityIcon with organisationAccess):
 * a lock for Private, the company icon for Organisation, with the access in a tooltip.
 */
export function WorkspaceAccessIcon({ visibility, size = 16 }: { visibility?: 'private' | 'public'; size?: 12 | 16 }) {
  const t = useText(TEXT)
  if (!visibility) return null
  const isPrivate = visibility === 'private'
  return (
    <Tooltip title={isPrivate ? t.private : t.organisation} placement={tooltipPlacements.TOP}>
      <span style={{ display: 'inline-flex', flexShrink: 0 }}>
        <Icon type={isPrivate ? iconType.LockOutlined : iconType.CompanyOutlined} size={size} color="neutral-darken2" />
      </span>
    </Tooltip>
  )
}

/** A workspace's name, then its access icon; the name truncates, the icon stays. */
function NameWithAccess({ name, visibility, color }: { name: string; visibility?: 'private' | 'public'; color: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: spacing(1), minWidth: 0 }}>
      <span style={{ minWidth: 0, fontSize: 14, lineHeight: '20px', fontWeight: 600, color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      {/* 12px: smaller than the 14px name, so it reads as a detail of it. */}
      <WorkspaceAccessIcon visibility={visibility} size={12} />
    </span>
  )
}

/** "New" next to a label: the DS Chip, small and blue. */
export function NewChip() {
  const t = useText(TEXT)
  return <Chip label={t.newChip} uppercase={false} size={chipSizes.SMALL} chipStyle={chipStyles.ACCENT_BLUE} variant={chipVariants.SUBTLE} />
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
        <NameWithAccess name={option.name} visibility={option.visibility} color={selected ? colorPalette.blue.base : colorPalette.neutral.darken5} />
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
  const t = useText(TEXT)
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
            <span style={{ fontSize: 14, fontWeight: 600, color: colorPalette.blue.base }}>{t.createWorkspace}</span>
          </div>
          {/* Regular weight: the dropdown's footer is semibold, and this matches the workspace descriptions above. */}
          <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 400, color: colorPalette.neutral.darken3, marginTop: 2 }}>
            {t.createWorkspaceText}
          </div>
        </div>
      </ClickableContainer>
      <ButtonGhost rightIcon={iconType.ChevronRightOutlined} onClick={fromFooter(onManage)}>{t.manageWorkspaces}</ButtonGhost>
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
        header={<span style={{ fontSize: 13, color: colorPalette.neutral.darken2 }}>{t.yourWorkspaces}</span>}
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
              <NameWithAccess name={current?.name ?? ''} visibility={current?.visibility} color={colorPalette.neutral.darken5} />
              <span style={{ fontSize: 12, lineHeight: '16px', color: colorPalette.neutral.darken3 }}>{t.switchOrCreate}</span>
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
 * the question box stays the focus — a light panel, one line of heading with a primary Create workspace, and the
 * equation as three compact steps. Can be dismissed.
 */
export function WorkspacesPromo({ onCreate, onDismiss }: { onCreate: () => void; onDismiss: () => void }) {
  const t = useText(TEXT)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3), padding: `${spacing(3)}px ${spacing(4)}px ${spacing(4)}px`, borderRadius: 16, backgroundColor: colorPalette.neutral.lighten5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
        <NewChip />
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: '20px', fontWeight: 600, color: colorPalette.neutral.darken5 }}>
          {t.promoBefore}<span style={{ color: colorPalette.blue.base }}>{t.promoHighlight}</span>{t.promoAfter}
        </span>
        <ButtonPrimary size={buttonSizes.SMALL} leftIcon={iconType.PlusOutlined} onClick={onCreate}>{t.createWorkspace}</ButtonPrimary>
        <ButtonGhost size={buttonSizes.SMALL} shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={onDismiss} ariaLabel={t.dismiss} />
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: spacing(2) }}>
        <PromoCard focus icon="your-workspace.svg" label={t.promoWorkspaceLabel} title={t.promoWorkspaceTitle} />
        <Operator>+</Operator>
        <PromoCard icon="haufe-logo.svg" iconSize={18} label={t.promoHaufeLabel} title={t.promoHaufeTitle} />
        <Operator>=</Operator>
        <PromoCard tinted icon="copilot.svg" label={t.promoAnswersLabel} title={t.promoAnswersTitle} />
      </div>
    </div>
  )
}

// ─── Add document ───────────────────────────────────────────────────────────

export type PickableDocument = { doc: MetadataDocument; source: DocSource }

// The document lists' file type icons (Version 19's FileTypeIcon), so a document looks the same here as there.
const FILE_ICON_SRC: Partial<Record<string, string>> = {
  DOCX: '/metadata-v9/file-word.png',
  PDF: '/metadata-v9/file-pdf.png',
  XLSX: '/metadata-v9/file-excel.png',
  PPTX: '/metadata-v9/file-pptx.png',
}
function FileTypeIcon({ format }: { format: string }) {
  return <img src={FILE_ICON_SRC[format] ?? '/metadata-v9/file-generic.png'} alt={format} width={24} height={24} style={{ display: 'block', flexShrink: 0, objectFit: 'contain' }} />
}

/**
 * The sidebar's My Documents icon (two files, one in front of the other — App.tsx's FileGlyph) at 16px, for document
 * counts: workspace cards, CoPilot's In this workspace card and Add document. Takes the text colour, like the DS icons.
 */
export function DocumentsIcon({ size = 16 }: { size?: 16 | 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ display: 'block', flexShrink: 0 }}>
      <path d="M8.75 6.5V5a2 2 0 0 1 2-2h5.5l3 3v9.5a2 2 0 0 1-2 2h-2" />
      <path d="M16 3.25v2c0 .41.34.75.75.75H19" />
      <path d="M4.75 8.5a2 2 0 0 1 2-2h5.5l3 3V19a2 2 0 0 1-2 2h-6.5a2 2 0 0 1-2-2V8.5Z" />
      <path d="M12 6.75v2c0 .41.34.75.75.75H15" />
      <path d="M7.75 14h4.5M7.75 17h3" />
    </svg>
  )
}

/** A menu option: an icon, then what it does and a line on where the documents end up. */
function AddOption({ icon, title, description }: { icon: ReactNode; title: ReactNode; description: string }) {
  return (
    // className: the menu's rows are given more room (see AddDocumentMenu's style).
    <span className="copilot-add-option" style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(3), padding: `${spacing(2)}px 0`, whiteSpace: 'normal' }}>
      <span style={{ display: 'inline-flex', marginTop: 0, color: colorPalette.neutral.darken3 }}>{icon}</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(1), fontSize: 14, lineHeight: '20px', fontWeight: 600, color: colorPalette.neutral.darken5 }}>{title}</span>
        <span style={{ fontSize: 12, lineHeight: '16px', color: colorPalette.neutral.darken3 }}>{description}</span>
      </span>
    </span>
  )
}

/**
 * CoPilot's Add document (after CoPilot Finance): a DS Dropdown with Upload documents (this composer's file picker)
 * or Choose from My Documents (opens MyDocumentsPicker). `workspaceName`: in a workspace, uploads are added to its
 * documents, so the line under Upload says so.
 */
export function AddDocumentMenu({ onUpload, onChooseFromMyDocuments, workspaceName, documentCount, placement }: {
  onUpload: () => void
  // How many documents Choose from offers, after its name as on the pages ("My Documents · 38").
  documentCount: number
  onChooseFromMyDocuments: () => void
  workspaceName?: string
  placement: string
}) {
  const t = useText(TEXT)
  return (
    <>
    {/* The DS menu rows have a fixed height; these two-line options need theirs to grow, with a little air between them. */}
    <style>{`.goat-dropdown-menu:has(.copilot-add-option) { padding: ${spacing(2)}px !important; }
      .goat-dropdown-menu:has(.copilot-add-option) .goat-dropdown-menu-item { height: auto !important; line-height: normal !important; padding-top: ${spacing(1)}px !important; padding-bottom: ${spacing(1)}px !important; }
      .goat-dropdown-menu:has(.copilot-add-option) .goat-dropdown-menu-item + .goat-dropdown-menu-item { margin-top: ${spacing(1)}px !important; }`}</style>
    <Dropdown
      trigger={dropdownTriggers.CLICK}
      placement={placement as never}
      items={[
        { key: 'upload', label: <AddOption icon={<Icon type={iconType.UploadOutlined} size={20} color="neutral-darken3" />} title={t.uploadDocuments} description={workspaceName ? t.uploadToWorkspace(workspaceName) : t.uploadToChat} />, onClick: onUpload },
        // In a workspace, its documents rather than My Documents: "Choose from Acme Corp documents".
        {
          key: 'my-documents',
          label: workspaceName
            ? <AddOption icon={<DocumentsIcon size={20} />} title={t.chooseFromWorkspace(workspaceName, documentCount)} description={t.inWorkspaceChats} />
            : <AddOption icon={<DocumentsIcon size={20} />} title={t.chooseFromMyDocuments(documentCount)} description={t.inAllChats} />,
          onClick: onChooseFromMyDocuments,
        },
      ]}
    >
      <ButtonTertiary leftIcon={iconType.PlusOutlined}>{t.addDocument}</ButtonTertiary>
    </Dropdown>
    </>
  )
}

/**
 * Choose from My Documents (DS Modal): the user's documents, newest first, searchable, each a DS Checkbox with its
 * format and date; Attach adds the chosen ones to the question.
 */
export function MyDocumentsPicker({ open, documents, onClose, onAttach, workspaceName }: {
  open: boolean
  // In a workspace: its documents, named after it.
  workspaceName?: string
  documents: PickableDocument[]
  onClose: () => void
  onAttach: (docs: PickableDocument[]) => void
}) {
  const t = useText(TEXT)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const close = () => { setSearch(''); setSelected(new Set()); onClose() }
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? documents.filter(d => d.doc.name.toLowerCase().includes(q)) : documents
  }, [documents, search])
  const toggle = (id: string) => setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  const n = selected.size
  return (
    <Modal
      visible={open}
      withIcon={false}
      maxWidth={720}
      minWidth={560}
      maxHeight={560}
      onClose={close}
      title={
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          {/* The count joins the title, as on the My Documents page ("My Documents · 38") and a workspace's Documents. */}
          <span>{workspaceName ? t.workspaceDocuments(workspaceName) : t.myDocuments} · {documents.length}</span>
          <span style={{ fontSize: 13, fontWeight: 400, color: colorPalette.neutral.darken2 }}>{workspaceName ? t.inWorkspaceChats : t.inAllChats}</span>
        </span>
      }
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: t.cancel, onClick: close } },
        { variant: buttonVariants.PRIMARY, props: { children: n ? t.attachCount(n) : t.attach, disabled: n === 0, onClick: () => { onAttach(documents.filter(d => selected.has(d.doc._id))); close() } } },
      ] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <SearchBar placeholder={workspaceName ? t.searchWorkspace(workspaceName) : t.searchMyDocuments} value={search} onChange={setSearch} width={searchbarWidth.EXPANDED} />
        {shown.length === 0 ? (
          <span style={{ padding: `${spacing(4)}px 0`, fontSize: 14, color: colorPalette.neutral.darken2, textAlign: 'center' }}>{t.noResults}</span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {shown.map(({ doc }) => (
              // The DS Checkbox's own label sits above the box, so the name and date sit beside it; the whole row toggles.
              <div key={doc._id} onClick={() => toggle(doc._id)} style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(2)}px ${spacing(1)}px`, borderBottom: `1px solid ${colorPalette.neutral.lighten3}`, cursor: 'pointer' }}>
                <span onClick={e => e.stopPropagation()} style={{ display: 'inline-flex' }}>
                  <Checkbox name={`my-doc-${doc._id}`} checked={selected.has(doc._id)} onChange={() => toggle(doc._id)} />
                </span>
                <FileTypeIcon format={doc.fileFormat} />
                <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600, color: colorPalette.neutral.darken5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                  <span style={{ fontSize: 12, lineHeight: '16px', color: colorPalette.neutral.darken3 }}>{doc.fileFormat} · {t.date(doc.uploadedDate)}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
