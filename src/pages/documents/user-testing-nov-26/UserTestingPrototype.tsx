import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useLocation, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import ConnectionsPageV10 from './ConnectionsPage'
import { PrototypeProvider, defineText, prototypeBase, useArea, usePrototype, useText, type Area, type Lang } from './context'
import type { AreaDocument, AreaUploads } from './content/types'
import { UploadOrSyncFlow } from './ConnectedAppSync'
import { DocumentsIcon } from './CoPilotWorkspaceMenu'
import {
  Avatar,
  ClickableContainer,
  avatarShapeEnum,
  avatarSizeEnum,
  ButtonDanger,
  ButtonGhost,
  buttonShapes,
  buttonSizes,
  ButtonPrimary,
  ButtonSecondary,
  ButtonTertiary,
  buttonVariants,
  Checkbox,
  Chip,
  chipSizes,
  chipStyles,
  chipVariants,
  DatePicker,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  Icon,
  iconType,
  Input,
  Modal,
  modalVariants,
  Pagination,
  Panel,
  panelPlacements,
  panelSizes,
  PopOver,
  PropertyItem,
  propertyItemVariants,
  RadioGroup,
  radioGroupDirection,
  popOverPlacements,
  popOverTriggers,
  SearchBar,
  searchbarWidth,
  Table,
  TextArea,
  Tooltip,
  tooltipPlacements,
  tooltipSizes,
  Typography,
} from '@goat-ui/goat-ui-core'
import {
  colorPalette,
  computeDocSourceMap,
  connectorLabel,
  localFileToDoc,
  PAGE_SIZE,
  Skeleton,
  skeletonVariants,
  SpaceFormModal,
  sourceIcon,
  spaceConnectorLabel,
  spacing,
  stripYear,
  useMountLoading,
  useSidebarWidth,
  useWorkspaceState,
  type DocSource,
  type MetadataDocument,
  type Space,
  type SpaceFormValues,
  getInitials,
  type ConnectorType,
} from '../workspaces/shared'
import { CopilotIcon } from '../workspaces/WorkspacesBasic'
import { HistoryPanel, liveEvent, type HistoryEvent } from './WorkspaceHistory'
import HackathonCoPilotPageV10, { type ChatSession as CoPilotChat } from './CoPilotPage'
import HackathonHomePage from '../hackathon/HomePage'
import { useProcessingUpload } from '../hackathon/uploadToasts'
import PersonalOfficePage from './PersonalOfficePage'
import WorkspacesList from './WorkspacesList'
import { GuardrailsTab, TabEmptyState, TemplatesTab } from './WorkspaceTabs'
import { EMPTY_EXTRAS, type WorkspaceChat, type WorkspaceDetail, type WorkspaceExtras, type WorkspaceReference } from '../hackathon/workspaceModel'

/**
 * Workspaces 2.0 — Version 21: Version 19 with no workspaces yet. A new workspace opens straight on its summary — Profile, Documents,
 * Guardrails and Used in — each container with its own empty state and a way to fill it, instead of the illustration.
 *
 * Workspaces 2.0 — Version 19: Version 15 with My Documents as the user's own documents only — files they've
 * uploaded to look into for themselves (Version 10's My Documents: call notes, drafts, scans, letters to work
 * through), in Version 15's table. They're private and often unfinished, so less metadata was found in them.
 * A workspace's documents are shared with everyone who has access to it and are their source of truth; they
 * live in the workspace, not in My Documents. Sharing one of your documents to a workspace adds it there;
 * deleting it from My Documents leaves the workspace's copy, and removing it from a workspace leaves yours.
 *
 * Workspaces 2.0 — Version 15: Version 14 with My files renamed My Documents and grouped with Workspaces and
 * Connectors under My Knowledge in the sidebar. My Documents lists documents as the Metadata Table does, with a
 * Workspaces column of chips, and a Filters button that opens a panel; applied filters show as clearable chips.
 *
 * Workspaces 2.0 — Version 14: Version 12 reorganised around one library of files. My Documents (the landing page)
 * holds every document — uploaded or synced — and workspaces are built on top of it: a workspace references
 * files from My Documents (one file can be in several workspaces) alongside its profile, guardrails and bookmarks.
 * Removing a file from a workspace leaves it in My Documents; deleting a workspace leaves its files there too.
 *
 * Hackathon Oct '26 — Version 10: a brand-new workspace opens on an animated "workspace is ready" view
 * (WorkspaceReady.tsx) — My knowledge and Haufe knowledge streaming together — until its first content.
 * After that, My knowledge and Haufe knowledge work as in Version 6: rows and Add my content open the area
 * pages (in white containers); no side panels or set-up checklist.
 *
 * Hackathon Oct '26 — Version 8: Version 6 with My knowledge filled in from one side panel (KnowledgePanel.tsx)
 * instead of a page per area: draft context from documents, rule sets for guardrails, paste-a-link
 * bookmarks, a template library picker, and a set-up checklist in the My knowledge card.
 *
 * Hackathon Oct '26 — Version 6: Version 4 populated with Metadata Table's workspaces and documents
 * (Acme Corp, Project A, Internal HR), with all of Version 4's functionality available for them.
 * Version 7 is its German counterpart.
 *
 * Hackathon Oct '26 — Version 4: Version 3 with a lighter header and the summary as two side-by-side
 * knowledge streams.
 * - My knowledge: what you bring — a line on what can be connected, an "Add my content" menu (upload
 *   a document, add a connector via the Connectors page, add instructions via Guardrails), and the
 *   areas as plain rows that open each one — only once something's been added to them.
 * - Haufe knowledge: what's been made with Haufe for this workspace, as a CoPilot container (chats) with a
 *   count, the latest few, and a jump into CoPilot.
 *
 * Hackathon Oct '26 — Version 3: each workspace opens on a summary page — five tiles for Documents,
 * Context, Guardrails, Bookmarks and Templates — and each tile opens that area on a page of its own,
 * with a back button to the summary. URLs: /workspaces/:slug, /workspaces/:slug/<area>, and document
 * previews under /workspaces/:slug/documents/:docId.
 *
 * Hackathon Oct '26 — Version 1: a copy of Metadata Table (Version 12), the starting point for the hackathon.
 *
 * Metadata — Version 12: Version 9 with rows as tall as their content, and a short
 * matter reference in the table instead of the summary.
 *
 *   file icon · Name (+ size) · Status · Source · Type · Matter reference · Parties · Dates · Updated
 *
 * - Matter reference: the matter a document belongs to, in as few words as possible
 *   ("VAT return Q2 2026"), edited from the table popover and shown in the preview.
 *   The longer summary lives in the preview only.
 * - Nothing in the table is cut off: Name, Type and Matter reference wrap onto as many lines as they need,
 *   and Dates lists every entry, one per line. Parties lists up to five, then "+N" for the rest; the
 *   cell's tooltip always lists every party with its role. Two documents per space have ten parties.
 * - The Parties tooltip still adds each party's role; other cells have nothing hidden to show.
 * - Column widths: Name 16%, Type 120px, Matter reference 13%; Parties and Dates split the rest equally.
 * - Everything else — the other column widths, popover editors, key-dates-only Dates, the preview —
 *   is as in Version 9.
 */

// ─── On-screen text, in English and German ────────────────────────────────────
// Every string the prototype shows. `defineText` makes the German side keep exactly the English side's keys and
// function signatures, so nothing added in English builds until it's been written in German too.

const joinEn = (items: string[]) => items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0] ?? ''
const joinDe = (items: string[]) => items.length > 1 ? `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}` : items[0] ?? ''
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const TEXT = defineText({
  dates: {
    /** Short dates ("Jan 5, 2026"), as in the shared workspace views. */
    locale: 'en-US',
    /** Dates in a document's body ("5 Jan 2026"). */
    longLocale: 'en-GB',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    period: 'Period',
    documentDate: 'Document date',
    date: 'Date',
    overdue: (days: number) => `Overdue by ${plural(days, 'day', 'days')}`,
    dueToday: 'Due today',
    dueIn: (days: number) => `Due in ${plural(days, 'day', 'days')}`,
    inDays: (days: number) => `In ${days} days`,
    today: 'Today',
    yesterday: 'Yesterday',
    last7: 'Last 7 days',
    last30: 'Last 30 days',
  },
  extract: {
    document: 'Document',
    // When a file's name gives no type: something that fits its format.
    fallbackTypes: { PDF: ['Letter', 'Notice', 'Report'], DOCX: ['Memo', 'Letter', 'Draft'], XLSX: ['Calculation', 'Spreadsheet'], PPTX: ['Presentation'] },
    /** The generated summary's first sentence: "A payslip on payroll for Jul 2026". */
    opening: (type: string, topic?: string, period?: string) => {
      const kind = inSentence(type)
      const about = topic ? ` on ${inSentence(topic)}${period ? ` for ${period}` : ''}` : ''
      return `${/^[aeiou]/i.test(kind) ? 'An' : 'A'} ${kind}${about}`
    },
    objectionDeadline: 'Objection deadline',
    filingDeadline: 'Filing deadline',
    replyDue: 'Reply due',
    validUntil: 'Valid until',
    paid: 'Paid',
    signed: 'Signed',
  },
  // The rest of a generated summary, after its opening.
  composed: {
    party: (name: string, role: string) => `${name} (${lowerFirst(role)})`,
    involves: (parties: string[]) => `It involves ${joinEn(parties)}.`,
    covers: (period: string) => `It covers the period ${period}.`,
    deadline: (label: string, date: string) => `The ${lowerFirst(label)} is ${date}.`,
    action: (label: string, date: string) => `${label} on ${date}.`,
    notYet: (label: string) => `Not yet ${lowerFirst(label)}.`,
  },
  fields: {
    documentType: 'Type',
    matterReference: 'Matter reference',
    summary: 'Summary',
    parties: 'Parties',
    dates: 'Dates',
  },
  common: {
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    download: 'Download',
    back: 'Back',
    askCopilot: 'Ask CoPilot',
    uploadOrSync: 'Upload or sync',
    history: 'History',
    viewAll: 'View all',
    manage: 'Manage',
    clearAll: 'Clear all',
    selected: (n: number) => `${n} selected`,
    filters: (applied: number) => applied ? `Filters (${applied})` : 'Filters',
    documents: (n: number) => plural(n, 'document', 'documents'),
    searchDocuments: 'Search documents',
    noDocsMatch: 'No documents match',
    noDocsMatchText: 'Try removing a filter or changing your search.',
    clearFiltersAndSearch: 'Clear filters and search',
  },
  // What last changed in a workspace (its card's "Updated" tooltip), and the profile's toast.
  changes: {
    created: 'Workspace created',
    profileUpdated: 'Profile updated',
    settingsUpdated: 'Settings updated',
    guardrailsUpdated: 'Guardrails updated',
    workspaceUpdated: 'Workspace updated',
    profileSaved: 'Profile saved',
  },
  workspace: {
    title: 'Workspaces',
    backToCopilot: 'Back to CoPilot',
    templatePrompt: (name: string, app: string) => `Fill in the template "${name}" (${app}) for this workspace.`,
    areaTitles: { documents: 'Documents', context: 'Context', guardrails: 'Guardrails', bookmarks: 'Bookmarks', templates: 'Templates' },
    guardrailsIntro: 'Rules your apps follow whenever they use this workspace. Switch one off to pause it without deleting it.',
    usedIn: 'Used in',
    profile: 'Profile',
    searchActivity: 'Search activity',
    actions: 'Workspace actions',
    noDocsTitle: 'No documents in this workspace yet',
    noDocsText: 'Upload documents, or share ones from My Documents. Everyone with access to this workspace sees them, and your apps use everything in here for more accurate answers and suggestions.',
    deleteDocsTitle: (n: number): string => n === 1 ? 'Delete Document' : 'Delete Documents',
    deleteDocsBody: (n: number, workspace: string): ReactNode => (
      <>Delete <strong>{plural(n, 'document', 'documents')}</strong> from {workspace}? {n === 1 ? 'It’s' : 'They’re'} deleted for everyone with access to the workspace. Any copy in your My Documents stays. This cannot be undone.</>
    ),
    deleteTitle: 'Delete Workspace',
    deleteBody: (workspace: string, docs: number): ReactNode => (
      <>Delete <strong>{workspace}</strong>? {docs > 0
        ? <>Its profile, guardrails and {plural(docs, 'document', 'documents')} are deleted for everyone with access. Any copies in your My Documents stay. </>
        : <>Its profile and guardrails are deleted for everyone with access. </>}
      This cannot be undone.</>
    ),
  },
  // The empty Workspaces page.
  empty: {
    titleBefore: 'Create your first ',
    titleHighlight: 'workspace',
    titleAfter: '',
    benefits: [
      'One shared source of truth for your team',
      'Answers grounded in your documents and Haufe knowledge',
      'Guardrails so your apps work the way you do',
    ],
    create: 'Create workspace',
    youCreateThis: 'You create this',
    yourWorkspace: 'Your workspace',
    whatYouKnow: 'What you know',
    included: 'Included',
    haufeKnowledge: 'Haufe knowledge',
    trustedExpertise: 'Trusted expertise',
    theResult: 'The result',
    yourAnswers: 'Your answers',
  },
  editors: {
    typeRequired: 'Type is required',
    typePlaceholder: 'e.g. Letter',
    addParty: 'Add party',
    personOrOrganisation: 'Person or organisation',
    rolePlaceholder: (role: string) => `e.g. ${role}`,
    typeHeader: 'Type',
    dateHeader: 'Date',
    addDate: 'Add date',
    addPeriod: 'Add period',
    periodPlaceholder: 'e.g. Term',
    datePlaceholder: (label: string) => `e.g. ${label}`,
    from: 'From',
    to: 'To',
    dateFormat: 'DD/MM/YYYY',
  },
  table: {
    name: 'Name',
    status: 'Status',
    source: 'Source',
    updated: 'Updated',
    upToDate: 'Up to date',
    upToDateSynced: (hours: number) => `Up to date • synced ${plural(hours, 'hour', 'hours')} ago`,
    openPreview: 'Open preview',
  },
  privacy: {
    title: 'Your data is private and secure',
    intro: 'The highest data protection standards are essential for the professional use of our solution. The following information provides an overview of our security architecture.',
    points: [
      { title: 'Secure data storage in Germany', text: 'All data is stored securely on European servers. Our data centre is certified to ISO 27001, 27017, 27018, SOC 2 and C5, making it one of the most secure data centres in the world.' },
      { title: 'Data encryption', text: 'All data is stored in encrypted form in the data centre (AES 256) and transmitted to the data centre in encrypted form (TLS 1.3).' },
      { title: 'Backups', text: 'Regular backups and a disaster recovery strategy protect against data loss.' },
      { title: 'No training with your data', text: 'The uploaded documents are not used to train language models.' },
    ],
    disclaimer: 'All documents are securely uploaded and scanned for viruses.',
    learnMore: 'Learn more',
  },
  // The workspace summary's cards.
  cards: {
    addDocsTitle: 'Add documents your team and apps can rely on',
    guardrailsEmptyTitle: 'Set rules your apps follow, like which sources to use',
    guardrailsEmptyText: 'Guardrails apply to this workspace only.',
    addGuardrail: 'Add guardrail',
    activeOf: (active: number, total: number) => `${active} of ${total} active`,
    profileEmptyTitle: 'Add key details so your apps know who this workspace is for',
    addProfile: 'Add profile',
    usedInEmptyTitle: 'Your Haufe chats and documents appear here, so you can pick up where you left off',
    tryAsking: 'Try asking:',
  },
  profile: {
    title: 'Edit profile',
    background: 'Background',
    details: 'Details',
    removeDetail: 'Remove detail',
    addDetail: 'Add detail',
  },
  // Beside CoPilot, and the workspace cards' footers.
  inWorkspace: {
    title: 'In this workspace',
    addYourContext: 'Add your context',
    addYourContextText: 'For example a profile, documents or guardrails. Your apps use it for answers that fit this workspace.',
    addContext: 'Add context',
    uploaded: (n: number) => `${n} uploaded`,
    fromApp: (n: number, app: string) => `${n} from ${app}`,
    guardrails: (n: number) => plural(n, 'guardrail', 'guardrails'),
    active: (n: number) => `${n} active`,
    chatsInWorkspace: (n: number) => `${plural(n, 'chat', 'chats')} in this workspace`,
    nothingYet: 'Nothing added yet',
  },
  lastUpdated: {
    documentAdded: (name: string) => `Document added: ${name}`,
    copilotChat: (title: string) => `CoPilot chat: ${title}`,
    updated: (when: string) => `Updated ${when}`,
    today: 'today',
    yesterday: 'yesterday',
    daysAgo: (n: number) => `${n} days ago`,
    weeksAgo: (n: number) => `${plural(n, 'week', 'weeks')} ago`,
    on: (date: string) => `on ${date}`,
  },
  activity: {
    copilotChat: 'CoPilot chat',
    chats: (n: number) => plural(n, 'chat', 'chats'),
    chat: 'Chat',
    openCopilot: 'Open CoPilot',
    noMatchTitle: 'No matching activity',
    noMatchText: (query: string) => `Nothing here matches “${query}”. Try another word, or clear the search.`,
    emptyTitle: 'No activity yet',
    emptyText: 'Anything made with this app for the workspace shows up here.',
  },
  preview: {
    details: 'Document Details',
    noSummary: 'No summary yet. Use the edit button to add one.',
    file: 'File',
    name: 'Name',
    type: 'Type',
    format: 'Format',
    size: 'Size',
    uploaded: 'Uploaded',
    updated: 'Updated',
    status: 'Status',
    source: 'Source',
    manualUpload: 'Manual upload',
    upToDateSynced: (hours: number) => `Up to date • Synced ${plural(hours, 'hour', 'hours')} ago`,
    workspace: 'Workspace',
    workspaces: 'Workspaces',
    documentName: 'Document name',
    summaryPlaceholder: 'What is this document about?',
  },
  // The preview's generated document.
  body: {
    uploadedFile: 'Uploaded document',
    parties: 'Parties',
    madeBetween: 'This document is made between ',
    role: (role: string) => ` (the “${role}”)`,
    and: ' and ',
    background: 'Background',
    backgroundP1: 'The purpose of this document is to record the facts, obligations and agreed next steps relevant to the matter described above. It should be read together with any related correspondence and prior versions held in this space.',
    backgroundP2: 'Unless stated otherwise, all amounts are in EUR and all references to statutory provisions refer to the version in force on the date of this document.',
    keyDates: 'Key dates',
    deadlinesBinding: 'Deadlines stated above are binding. Where a deadline falls on a weekend or public holiday, it moves to the next working day.',
    closing: 'Closing remarks',
    closingText: 'Please direct any questions about this document to the responsible contact. Changes to this document are only valid if made in writing.',
  },
  myDocs: {
    title: 'My Documents',
    intro: 'Documents you’ve uploaded for your own research — only you can see them. Share one to a workspace when it’s ready for everyone there to rely on.',
    viewDocument: 'View document',
    addToWorkspaceMenu: 'Add to workspace…',
    addToWorkspace: 'Add to workspace',
    sendToCopilot: 'Send to CoPilot',
    notInWorkspace: 'Not in a workspace',
    openWorkspace: (name: string) => `Open ${name}`,
    deleteBody: (n: number): ReactNode => (
      <>Delete <strong>{plural(n, 'document', 'documents')}</strong> from My Documents? Workspaces you’ve shared {n === 1 ? 'it' : 'them'} to keep their copy. This cannot be undone.</>
    ),
  },
  filters: {
    title: 'Filters',
    uploaded: 'Uploaded',
    updatedLabels: { any: 'Any time', '7': 'Last 7 days', '30': 'Last 30 days', '365': 'Last 12 months' },
    workspace: 'Workspace',
    alsoIn: 'Also in',
    source: 'Source',
    updated: 'Updated',
    chip: (label: string, value: string) => `${label}: ${value}`,
    show: (n: number) => `Show ${plural(n, 'document', 'documents')}`,
  },
  // Sharing documents from My Documents to workspaces.
  share: {
    titleOne: 'Add to workspace',
    titleMany: (n: number) => `Add ${n} documents to workspaces`,
    one: (name: string, mine: boolean): ReactNode => (
      <>Everyone with access to the workspace will see <strong>{name}</strong> and can rely on it.{mine && ' It stays in your My Documents too.'}</>
    ),
    many: (mine: boolean) => `Everyone with access to the workspace will see these documents and can rely on them.${mine ? ' They stay in your My Documents too.' : ''}`,
    newWorkspaceWith: (one: boolean) => `New workspace with ${one ? 'this document' : 'these documents'}`,
  },
}, {
  dates: {
    locale: 'de-DE',
    longLocale: 'de-DE',
    months: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'],
    period: 'Zeitraum',
    documentDate: 'Dokumentdatum',
    date: 'Datum',
    overdue: (days: number) => `Seit ${plural(days, 'Tag', 'Tagen')} überfällig`,
    dueToday: 'Heute fällig',
    dueIn: (days: number) => `Fällig in ${plural(days, 'Tag', 'Tagen')}`,
    inDays: (days: number) => `In ${days} Tagen`,
    today: 'Heute',
    yesterday: 'Gestern',
    last7: 'Letzte 7 Tage',
    last30: 'Letzte 30 Tage',
  },
  extract: {
    document: 'Dokument',
    fallbackTypes: { PDF: ['Schreiben', 'Mitteilung', 'Bericht'], DOCX: ['Notiz', 'Schreiben', 'Entwurf'], XLSX: ['Berechnung', 'Tabelle'], PPTX: ['Präsentation'] },
    opening: (type: string, topic?: string, period?: string) => `${type}${topic ? ` zum Thema ${topic}${period ? ` für ${period}` : ''}` : ''}`,
    objectionDeadline: 'Einspruchsfrist',
    filingDeadline: 'Abgabefrist',
    replyDue: 'Antwort fällig',
    validUntil: 'Gültig bis',
    paid: 'Bezahlt',
    signed: 'Unterzeichnet',
  },
  composed: {
    party: (name: string, role: string) => `${name} (${role})`,
    involves: (parties: string[]) => `Beteiligt sind ${joinDe(parties)}.`,
    covers: (period: string) => `Es betrifft den Zeitraum ${period}.`,
    deadline: (label: string, date: string) => `${label}: ${date}.`,
    action: (label: string, date: string) => `${label} am ${date}.`,
    notYet: (label: string) => `Noch offen: ${label}.`,
  },
  fields: {
    documentType: 'Typ',
    matterReference: 'Vorgang',
    summary: 'Zusammenfassung',
    parties: 'Beteiligte',
    dates: 'Termine',
  },
  common: {
    cancel: 'Abbrechen',
    save: 'Speichern',
    close: 'Schließen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    download: 'Herunterladen',
    back: 'Zurück',
    askCopilot: 'CoPilot fragen',
    uploadOrSync: 'Hochladen oder synchronisieren',
    history: 'Verlauf',
    viewAll: 'Alle anzeigen',
    manage: 'Verwalten',
    clearAll: 'Alle entfernen',
    selected: (n: number) => `${n} ausgewählt`,
    filters: (applied: number) => applied ? `Filter (${applied})` : 'Filter',
    documents: (n: number) => plural(n, 'Dokument', 'Dokumente'),
    searchDocuments: 'Dokumente durchsuchen',
    noDocsMatch: 'Keine passenden Dokumente',
    noDocsMatchText: 'Entfernen Sie einen Filter oder ändern Sie Ihre Suche.',
    clearFiltersAndSearch: 'Filter und Suche zurücksetzen',
  },
  changes: {
    created: 'Arbeitsbereich erstellt',
    profileUpdated: 'Profil aktualisiert',
    settingsUpdated: 'Einstellungen aktualisiert',
    guardrailsUpdated: 'Leitplanken aktualisiert',
    workspaceUpdated: 'Arbeitsbereich aktualisiert',
    profileSaved: 'Profil gespeichert',
  },
  workspace: {
    title: 'Arbeitsbereiche',
    backToCopilot: 'Zurück zu CoPilot',
    templatePrompt: (name: string, app: string) => `Füllen Sie die Vorlage „${name}“ (${app}) für diesen Arbeitsbereich aus.`,
    areaTitles: { documents: 'Dokumente', context: 'Kontext', guardrails: 'Leitplanken', bookmarks: 'Lesezeichen', templates: 'Vorlagen' },
    guardrailsIntro: 'Regeln, die Ihre Apps immer befolgen, wenn sie diesen Arbeitsbereich nutzen. Schalten Sie eine Regel aus, um sie zu pausieren, ohne sie zu löschen.',
    usedIn: 'Verwendet in',
    profile: 'Profil',
    searchActivity: 'Aktivitäten durchsuchen',
    actions: 'Aktionen für den Arbeitsbereich',
    noDocsTitle: 'Noch keine Dokumente in diesem Arbeitsbereich',
    noDocsText: 'Laden Sie Dokumente hoch oder teilen Sie welche aus „Meine Dokumente“. Alle mit Zugriff auf diesen Arbeitsbereich sehen sie, und Ihre Apps nutzen alles hier für genauere Antworten und Vorschläge.',
    deleteDocsTitle: (n: number) => n === 1 ? 'Dokument löschen' : 'Dokumente löschen',
    deleteDocsBody: (n: number, workspace: string): ReactNode => (
      <><strong>{plural(n, 'Dokument', 'Dokumente')}</strong> aus {workspace} löschen? {n === 1 ? 'Es wird' : 'Sie werden'} für alle mit Zugriff auf den Arbeitsbereich gelöscht. Kopien in Ihren „Meine Dokumente“ bleiben erhalten. Dies kann nicht rückgängig gemacht werden.</>
    ),
    deleteTitle: 'Arbeitsbereich löschen',
    deleteBody: (workspace: string, docs: number): ReactNode => (
      <><strong>{workspace}</strong> löschen? {docs > 0
        ? <>Profil, Leitplanken und {plural(docs, 'Dokument', 'Dokumente')} werden für alle mit Zugriff gelöscht. Kopien in Ihren „Meine Dokumente“ bleiben erhalten. </>
        : <>Profil und Leitplanken werden für alle mit Zugriff gelöscht. </>}
      Dies kann nicht rückgängig gemacht werden.</>
    ),
  },
  empty: {
    titleBefore: 'Erstellen Sie Ihren ersten ',
    titleHighlight: 'Arbeitsbereich',
    titleAfter: '',
    benefits: [
      'Eine gemeinsame, verlässliche Quelle für Ihr Team',
      'Antworten auf Basis Ihrer Dokumente und des Haufe-Wissens',
      'Leitplanken, damit Ihre Apps so arbeiten wie Sie',
    ],
    create: 'Arbeitsbereich erstellen',
    youCreateThis: 'Das erstellen Sie',
    yourWorkspace: 'Ihr Arbeitsbereich',
    whatYouKnow: 'Ihr Wissen',
    included: 'Inklusive',
    haufeKnowledge: 'Haufe-Wissen',
    trustedExpertise: 'Verlässliche Expertise',
    theResult: 'Das Ergebnis',
    yourAnswers: 'Ihre Antworten',
  },
  editors: {
    typeRequired: 'Typ ist erforderlich',
    typePlaceholder: 'z. B. Schreiben',
    addParty: 'Beteiligte hinzufügen',
    personOrOrganisation: 'Person oder Organisation',
    rolePlaceholder: (role: string) => `z. B. ${role}`,
    typeHeader: 'Art',
    dateHeader: 'Datum',
    addDate: 'Datum hinzufügen',
    addPeriod: 'Zeitraum hinzufügen',
    periodPlaceholder: 'z. B. Laufzeit',
    datePlaceholder: (label: string) => `z. B. ${label}`,
    from: 'Von',
    to: 'Bis',
    dateFormat: 'TT.MM.JJJJ',
  },
  table: {
    name: 'Name',
    status: 'Status',
    source: 'Quelle',
    updated: 'Aktualisiert',
    upToDate: 'Aktuell',
    upToDateSynced: (hours: number) => `Aktuell • vor ${plural(hours, 'Stunde', 'Stunden')} synchronisiert`,
    openPreview: 'Vorschau öffnen',
  },
  privacy: {
    title: 'Ihre Daten sind privat und sicher',
    intro: 'Höchste Datenschutzstandards sind für den professionellen Einsatz unserer Lösung unerlässlich. Die folgenden Informationen geben einen Überblick über unsere Sicherheitsarchitektur.',
    points: [
      { title: 'Sichere Datenspeicherung in Deutschland', text: 'Alle Daten werden sicher auf europäischen Servern gespeichert. Unser Rechenzentrum ist nach ISO 27001, 27017, 27018, SOC 2 und C5 zertifiziert und gehört damit zu den sichersten Rechenzentren der Welt.' },
      { title: 'Datenverschlüsselung', text: 'Alle Daten werden im Rechenzentrum verschlüsselt gespeichert (AES 256) und verschlüsselt an das Rechenzentrum übertragen (TLS 1.3).' },
      { title: 'Datensicherung', text: 'Regelmäßige Backups und eine Disaster-Recovery-Strategie schützen vor Datenverlust.' },
      { title: 'Kein Training mit Ihren Daten', text: 'Die hochgeladenen Dokumente werden nicht zum Training von Sprachmodellen verwendet.' },
    ],
    disclaimer: 'Alle Dokumente werden sicher hochgeladen und auf Viren geprüft.',
    learnMore: 'Mehr erfahren',
  },
  cards: {
    addDocsTitle: 'Fügen Sie Dokumente hinzu, auf die sich Ihr Team und Ihre Apps verlassen können',
    guardrailsEmptyTitle: 'Legen Sie Regeln fest, die Ihre Apps befolgen – etwa welche Quellen sie nutzen',
    guardrailsEmptyText: 'Leitplanken gelten nur für diesen Arbeitsbereich.',
    addGuardrail: 'Leitplanke hinzufügen',
    activeOf: (active: number, total: number) => `${active} von ${total} aktiv`,
    profileEmptyTitle: 'Ergänzen Sie wichtige Angaben, damit Ihre Apps wissen, für wen dieser Arbeitsbereich ist',
    addProfile: 'Profil hinzufügen',
    usedInEmptyTitle: 'Hier erscheinen Ihre Haufe-Chats und Dokumente, damit Sie dort weitermachen können, wo Sie aufgehört haben',
    tryAsking: 'Fragen Sie zum Beispiel:',
  },
  profile: {
    title: 'Profil bearbeiten',
    background: 'Hintergrund',
    details: 'Angaben',
    removeDetail: 'Angabe entfernen',
    addDetail: 'Angabe hinzufügen',
  },
  inWorkspace: {
    title: 'In diesem Arbeitsbereich',
    addYourContext: 'Ergänzen Sie Ihren Kontext',
    addYourContextText: 'Zum Beispiel ein Profil, Dokumente oder Leitplanken. Ihre Apps nutzen ihn für Antworten, die zu diesem Arbeitsbereich passen.',
    addContext: 'Kontext hinzufügen',
    uploaded: (n: number) => `${n} hochgeladen`,
    fromApp: (n: number, app: string) => `${n} aus ${app}`,
    guardrails: (n: number) => plural(n, 'Leitplanke', 'Leitplanken'),
    active: (n: number) => `${n} aktiv`,
    chatsInWorkspace: (n: number) => `${plural(n, 'Chat', 'Chats')} in diesem Arbeitsbereich`,
    nothingYet: 'Noch nichts hinzugefügt',
  },
  lastUpdated: {
    documentAdded: (name: string) => `Dokument hinzugefügt: ${name}`,
    copilotChat: (title: string) => `CoPilot-Chat: ${title}`,
    updated: (when: string) => `Aktualisiert ${when}`,
    today: 'heute',
    yesterday: 'gestern',
    daysAgo: (n: number) => `vor ${n} Tagen`,
    weeksAgo: (n: number) => `vor ${plural(n, 'Woche', 'Wochen')}`,
    on: (date: string) => `am ${date}`,
  },
  activity: {
    copilotChat: 'CoPilot-Chat',
    chats: (n: number) => plural(n, 'Chat', 'Chats'),
    chat: 'Chat',
    openCopilot: 'CoPilot öffnen',
    noMatchTitle: 'Keine passenden Aktivitäten',
    noMatchText: (query: string) => `Nichts passt zu „${query}“. Versuchen Sie ein anderes Wort oder setzen Sie die Suche zurück.`,
    emptyTitle: 'Noch keine Aktivitäten',
    emptyText: 'Alles, was Sie mit dieser App für den Arbeitsbereich erstellen, erscheint hier.',
  },
  preview: {
    details: 'Dokumentdetails',
    noSummary: 'Noch keine Zusammenfassung. Fügen Sie über die Bearbeiten-Schaltfläche eine hinzu.',
    file: 'Datei',
    name: 'Name',
    type: 'Typ',
    format: 'Format',
    size: 'Größe',
    uploaded: 'Hochgeladen',
    updated: 'Aktualisiert',
    status: 'Status',
    source: 'Quelle',
    manualUpload: 'Manuell hochgeladen',
    upToDateSynced: (hours: number) => `Aktuell • vor ${plural(hours, 'Stunde', 'Stunden')} synchronisiert`,
    workspace: 'Arbeitsbereich',
    workspaces: 'Arbeitsbereiche',
    documentName: 'Dokumentname',
    summaryPlaceholder: 'Worum geht es in diesem Dokument?',
  },
  body: {
    uploadedFile: 'Hochgeladenes Dokument',
    parties: 'Beteiligte',
    madeBetween: 'Dieses Dokument wird geschlossen zwischen ',
    role: (role: string) => ` („${role}“)`,
    and: ' und ',
    background: 'Hintergrund',
    backgroundP1: 'Dieses Dokument hält die Sachverhalte, Pflichten und vereinbarten nächsten Schritte zum oben genannten Vorgang fest. Es ist zusammen mit der zugehörigen Korrespondenz und früheren Fassungen in diesem Arbeitsbereich zu lesen.',
    backgroundP2: 'Sofern nicht anders angegeben, verstehen sich alle Beträge in EUR, und alle Verweise auf gesetzliche Vorschriften beziehen sich auf die am Datum dieses Dokuments geltende Fassung.',
    keyDates: 'Wichtige Termine',
    deadlinesBinding: 'Die oben genannten Fristen sind verbindlich. Fällt eine Frist auf ein Wochenende oder einen Feiertag, verschiebt sie sich auf den nächsten Werktag.',
    closing: 'Schlussbemerkungen',
    closingText: 'Fragen zu diesem Dokument richten Sie bitte an die zuständige Ansprechperson. Änderungen dieses Dokuments bedürfen der Schriftform.',
  },
  myDocs: {
    title: 'Meine Dokumente',
    intro: 'Dokumente, die Sie für Ihre eigene Recherche hochgeladen haben – nur Sie können sie sehen. Teilen Sie ein Dokument mit einem Arbeitsbereich, sobald sich dort alle darauf verlassen können.',
    viewDocument: 'Dokument ansehen',
    addToWorkspaceMenu: 'Zu Arbeitsbereich hinzufügen …',
    addToWorkspace: 'Zu Arbeitsbereich hinzufügen',
    sendToCopilot: 'An CoPilot senden',
    notInWorkspace: 'In keinem Arbeitsbereich',
    openWorkspace: (name: string) => `${name} öffnen`,
    deleteBody: (n: number): ReactNode => (
      <><strong>{plural(n, 'Dokument', 'Dokumente')}</strong> aus „Meine Dokumente“ löschen? Arbeitsbereiche, mit denen Sie {n === 1 ? 'es' : 'sie'} geteilt haben, behalten ihre Kopie. Dies kann nicht rückgängig gemacht werden.</>
    ),
  },
  filters: {
    title: 'Filter',
    uploaded: 'Hochgeladen',
    updatedLabels: { any: 'Beliebig', '7': 'Letzte 7 Tage', '30': 'Letzte 30 Tage', '365': 'Letzte 12 Monate' },
    workspace: 'Arbeitsbereich',
    alsoIn: 'Auch in',
    source: 'Quelle',
    updated: 'Aktualisiert',
    chip: (label: string, value: string) => `${label}: ${value}`,
    show: (n: number) => `${plural(n, 'Dokument', 'Dokumente')} anzeigen`,
  },
  share: {
    titleOne: 'Zu Arbeitsbereich hinzufügen',
    titleMany: (n: number) => `${n} Dokumente zu Arbeitsbereichen hinzufügen`,
    one: (name: string, mine: boolean): ReactNode => (
      <>Alle mit Zugriff auf den Arbeitsbereich sehen <strong>{name}</strong> und können sich darauf verlassen.{mine && ' Es bleibt auch in Ihren „Meine Dokumente“.'}</>
    ),
    many: (mine: boolean) => `Alle mit Zugriff auf den Arbeitsbereich sehen diese Dokumente und können sich darauf verlassen.${mine ? ' Sie bleiben auch in Ihren „Meine Dokumente“.' : ''}`,
    newWorkspaceWith: (one: boolean) => `Neuer Arbeitsbereich mit ${one ? 'diesem Dokument' : 'diesen Dokumenten'}`,
  },
})
type Text = typeof TEXT.en

// Workspaces 2.0 Version 4: Version 2 with the workspace cards' files and apps summarised as text.
// A new, empty workspace opens on the Figma empty state (EmptyWorkspace.tsx).
// Every page in Version 2 is white; cards keep their borders to stand apart.
const CONTENT_BG = colorPalette.white

/** Same slug rule as Workspaces Basic, so space URLs match between the two versions. */
function slugify(name: string): string {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ─── Metadata model ───────────────────────────────────────────────────────────

type Party = { id: string; name: string; role: string }
type KeyDate = {
  id: string
  label: string
  date: string
  isDeadline: boolean
  /** An action that was taken on this date (filed, paid, signed…), as opposed to a reference date like the document date. */
  isAction?: boolean
  /** Set (possibly '' while being edited) when this entry is a period running from `date` to `endDate`. */
  endDate?: string
}

const isPeriod = (d: KeyDate) => d.endDate !== undefined
type FieldKey = 'documentType' | 'matterReference' | 'summary' | 'parties' | 'dates'

type ExtractedMetadata = {
  documentType: string
  /** The matter this document belongs to, as concisely as possible — a few words, up to MATTER_MAX characters. */
  matterReference: string
  /** The preview's summary: a paragraph, up to SUMMARY_MAX characters. */
  summary: string
  parties: Party[]
  dates: KeyDate[]
  /** Fields the user has changed by hand, so the UI can tell them apart from AI output. */
  edited: Partial<Record<FieldKey, true>>
}

const EMPTY_METADATA: ExtractedMetadata = { documentType: '', matterReference: '', summary: '', parties: [], dates: [], edited: {} }

let idCounter = 0
const newId = (prefix: string) => `${prefix}-${Date.now()}-${++idCounter}`

// ─── Extraction helpers ───────────────────────────────────────────────────────

const TODAY_MS = new Date(new Date().toISOString().slice(0, 10)).getTime()
const DAY_MS = 86400000
const isoFromOffset = (days: number) => new Date(TODAY_MS + days * DAY_MS).toISOString().slice(0, 10)

/** One of `pool`, chosen by `n`; undefined when the pool is empty. */
function pick<T>(pool: readonly T[], n: number): T | undefined {
  return pool[((n % pool.length) + pool.length) % pool.length]
}

// ─── Extraction for uploaded and synced files ─────────────────────────────────
//
// There's no real extraction service behind the prototype, so this reads what it can from the file name — the
// document type, the topic, the period or year, and any party it names — and, for demoing, fills whatever the
// name doesn't give with plausible values from the subject area's upload theme (content/<area>.ts, `uploads`).

const MONTH_NAMES: [RegExp, number][] = [
  [/januar|january|(^|[^a-z])jan([^a-z]|$)/i, 1], [/februar|february|(^|[^a-z])feb([^a-z]|$)/i, 2], [/m(ä|ae)rz|march/i, 3], [/april/i, 4],
  [/(^|[^a-z])(mai|may)([^a-z]|$)/i, 5], [/juni|june/i, 6], [/juli|july/i, 7], [/august/i, 8], [/september|(^|[^a-z])sept?([^a-z]|$)/i, 9],
  [/oktober|october/i, 10], [/november/i, 11], [/dezember|december/i, 12],
]
// Lower-cases words for running text but keeps acronyms: "VAT Return" → "VAT return", "Tax Assessment" → "tax assessment".
const inSentence = (text: string) => text.split(' ').map(w => /^[A-ZÄÖÜ][a-zäöü]/.test(w) ? w.toLowerCase() : w).join(' ')
const nameHash = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate()
const isoDate = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

/** The period a file name refers to: a quarter, a month, a span of years or one year. */
function periodFromName(name: string): { start: string; end: string } | undefined {
  const quarter = name.match(/q([1-4])[\s_-]*(20\d\d)/i)
  if (quarter) { const q = +quarter[1], y = +quarter[2]; return { start: isoDate(y, q * 3 - 2, 1), end: isoDate(y, q * 3, lastDay(y, q * 3)) } }
  const year = name.match(/(20\d\d)(?!\d)/)
  const month = MONTH_NAMES.find(([re]) => re.test(name))?.[1] ?? +(name.match(/(?:^|[^\d])(0[1-9]|1[0-2])[\s_./-](20\d\d)/)?.[1] ?? 0)
  if (year && month) { const y = +year[1]; return { start: isoDate(y, month, 1), end: isoDate(y, month, lastDay(y, month)) } }
  const span = name.match(/(20\d\d)\s*[-–]\s*(20\d\d)/)
  if (span) return { start: isoDate(+span[1], 1, 1), end: isoDate(+span[2], 12, 31) }
  if (year) return { start: isoDate(+year[1], 1, 1), end: isoDate(+year[1], 12, 31) }
  return undefined
}

/** What extraction "finds" in an uploaded or synced file — from its name where possible, made up where not. */
function extractUploadMetadata(doc: MetadataDocument, uploads: AreaUploads, t: Text, space?: Space): ExtractedMetadata {
  const name = doc.name.replace(/[_]+/g, ' ')
  const seed = nameHash(doc._id + doc.name)

  const fallbackTypes = (t.extract.fallbackTypes as Record<string, readonly string[]>)[doc.fileFormat] ?? [t.extract.document]
  const documentType = uploads.typeRules.find(([re]) => re.test(name))?.[1] ?? pick(fallbackTypes, seed) ?? t.extract.document
  const topic = uploads.topics.find(([re]) => re.test(name))?.[1]
  const period = periodFromName(name)
  const periodLabel = period ? formatPeriod(period.start, period.end, t) : ''
  const matterReference = topic ? `${topic}${periodLabel ? ` ${periodLabel}` : ''}`.slice(0, MATTER_MAX) : pick(uploads.matters, seed) ?? ''

  // The workspace's client first, then anyone the name mentions; if nobody is named, one of the usual counterparties.
  const named = uploads.parties.filter(([re]) => re.test(name)).map(([, p]) => p)
  const fallback = named.length ? undefined : pick(uploads.counterparties, seed)
  const found = [
    ...(space ? [{ name: space.name, role: uploads.primaryRole }] : []),
    ...named,
    ...(fallback ? [fallback] : []),
  ].filter((p, i, all) => all.findIndex(q => q.name === p.name) === i)
  const parties: Party[] = found.map((p, i) => ({ id: `${doc._id}-xp${i}`, ...p }))

  // The document date, the period it covers, and one key date that fits its type (types may be English or German).
  const dates: KeyDate[] = [{ id: `${doc._id}-xd0`, label: t.dates.documentDate, date: isoFromOffset(-(seed % 20) - 1), isDeadline: false }]
  if (period) dates.push({ id: `${doc._id}-xper`, label: t.dates.period, date: period.start, endDate: period.end, isDeadline: false })
  const deadline = (label: string, days: number) => dates.push({ id: `${doc._id}-xdl`, label, date: isoFromOffset(days), isDeadline: true })
  const action = (label: string, days: number) => dates.push({ id: `${doc._id}-xact`, label, date: isoFromOffset(days), isDeadline: false, isAction: true })
  const otherDeadline = pick(uploads.deadlineLabels, seed)
  if (/assessment|objection|bescheid|einspruch/i.test(documentType)) deadline(t.extract.objectionDeadline, 20 + (seed % 12))
  else if (/vat return|tax return|erkl(ä|ae)rung|voranmeldung/i.test(documentType)) deadline(t.extract.filingDeadline, 5 + (seed % 25))
  else if (/audit|pr(ü|ue)fung/i.test(documentType)) deadline(t.extract.replyDue, 7 + (seed % 14))
  else if (/offer|quote|angebot/i.test(documentType)) deadline(t.extract.validUntil, 30)
  else if (/payslip|payroll|certificate|abrechnung|lohnjournal/i.test(documentType)) action(t.extract.paid, -(seed % 10) - 2)
  else if (/contract|agreement|power of attorney|vertrag|vereinbarung|vollmacht/i.test(documentType)) action(t.extract.signed, -(seed % 20) - 3)
  else if (!period && otherDeadline) deadline(otherDeadline, 10 + (seed % 40))

  const opening = t.extract.opening(documentType, topic, periodLabel || undefined)
  return { documentType, matterReference, summary: composeSummary([opening], { parties, dates }, t), parties, dates, edited: {} }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** A date as the table and cards show it: "Jan 5, 2026" / "5. Jan. 2026". */
const shortDate = (iso: string, t: Text) => new Date(iso).toLocaleDateString(t.dates.locale, { month: 'short', day: 'numeric', year: 'numeric' })

/** A date in a document's body: "5 Jan 2026" / "5. Jan. 2026". */
function formatLongDate(iso: string, t: Text) {
  return new Date(iso).toLocaleDateString(t.dates.longLocale, { day: 'numeric', month: 'short', year: 'numeric' })
}

/** A period in its most natural form: "2025", "2022–2024", "Q2 2026", "Jul 2026", "Jan – Jun 2026"; falls back to exact dates. */
function formatPeriod(start: string, end: string, t: Text, fmt: (iso: string) => string = iso => shortDate(iso, t)) {
  const months = t.dates.months
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  const wholeMonths = sd === 1 && ed === new Date(Date.UTC(ey, em, 0)).getUTCDate()
  if (!wholeMonths) return `${fmt(start)} – ${fmt(end)}`
  if (sm === 1 && em === 12) return sy === ey ? `${sy}` : `${sy}–${ey}`
  if (sy === ey && sm === em) return `${months[sm - 1]} ${sy}`
  if (sy === ey && em - sm === 2 && sm % 3 === 1) return `Q${(sm + 2) / 3} ${sy}`
  return sy === ey ? `${months[sm - 1]} – ${months[em - 1]} ${sy}` : `${months[sm - 1]} ${sy} – ${months[em - 1]} ${ey}`
}

/** A date or period as text, using `fmt` for single dates. */
const formatKeyDate = (d: KeyDate, t: Text, fmt: (iso: string) => string = iso => shortDate(iso, t)) =>
  isPeriod(d) && d.endDate ? formatPeriod(d.date, d.endDate, t, fmt) : fmt(d.date)

type DeadlineState = { tone: 'overdue' | 'soon' | 'later' | 'past-date'; text: string }

function deadlineState(d: KeyDate, t: Text): DeadlineState {
  const days = Math.round((new Date(d.date).getTime() - TODAY_MS) / DAY_MS)
  if (!d.isDeadline) return { tone: 'past-date', text: '' }
  if (days < 0) return { tone: 'overdue', text: t.dates.overdue(-days) }
  if (days === 0) return { tone: 'soon', text: t.dates.dueToday }
  if (days <= 14) return { tone: 'soon', text: t.dates.dueIn(days) }
  return { tone: 'later', text: t.dates.inDays(days) }
}

/** Chronological, with deadlines ahead of plain dates on the same day. */
function sortDates(dates: KeyDate[]) {
  return [...dates].sort((a, b) => a.date.localeCompare(b.date) || Number(b.isDeadline) - Number(a.isDeadline))
}

// Label fallback for dates entered by hand in the preview, which has no "action" toggle.
const ACTION_LABEL = /sign|fil(ed|ing)|submit|approv|agreed|pa(id|y)|due|deadline|effective|objection|notice|expir|renew|terminat|go-live|milestone|enrol|publish|releas|unterzeichn|unterschri|eingereicht|abgegeben|genehmigt|vereinbart|bezahlt|gezahlt|fällig|frist|wirksam|einspruch|kündig|verlänger|ablauf|veröffentlicht/i

/** Dates worth surfacing in the table: deadlines and actions taken — not reference dates like the document date. */
function isKeyDate(d: KeyDate) {
  return d.isDeadline || isPeriod(d) || !!d.isAction || ACTION_LABEL.test(d.label)
}

/** Key dates in the order that matters: deadlines (overdue, then soonest), then periods, then actions taken, newest first. */
function tableDates(dates: KeyDate[]) {
  const key = dates.filter(isKeyDate)
  const deadlines = key.filter(d => d.isDeadline && !isPeriod(d)).sort((a, b) => a.date.localeCompare(b.date))
  const periods = key.filter(isPeriod).sort((a, b) => a.date.localeCompare(b.date))
  const actions = key.filter(d => !d.isDeadline && !isPeriod(d)).sort((a, b) => b.date.localeCompare(a.date))
  return [...deadlines, ...periods, ...actions]
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type WorkspaceState = ReturnType<typeof useWorkspaceState>

type MetadataStore = {
  get: (doc: MetadataDocument) => ExtractedMetadata
  getOriginal: (doc: MetadataDocument) => ExtractedMetadata
  update: (docId: string, field: FieldKey, patch: Partial<ExtractedMetadata>) => void
  /** Runs "extraction" on uploaded or synced files (in a workspace, it draws on that workspace). */
  extract: (docs: MetadataDocument[], space?: Space) => void
}

function useMetadataStore(myDocuments: MyDocuments): MetadataStore {
  const t = useText(TEXT)
  const { uploads } = useArea()
  // What extraction found in the user's own documents when the prototype opened (there are no workspaces yet) —
  // the preview's document body is written from this, so it doesn't change when the user edits.
  const [original] = useState<Record<string, ExtractedMetadata>>(() => ({ ...myDocuments.meta }))
  const [overrides, setOverrides] = useState<Record<string, ExtractedMetadata>>({})
  // What extraction found for files uploaded or synced since.
  const [extracted, setExtracted] = useState<Record<string, ExtractedMetadata>>({})

  // Uploaded and synced files get what extractUploadMetadata finds (until it has run, nothing); the user’s own files in My Documents keep their type.
  const getOriginal = (doc: MetadataDocument) => original[doc._id] ?? extracted[doc._id] ?? { ...EMPTY_METADATA, documentType: doc._id.startsWith('my-file-') ? doc.documentType : '' }
  const get = (doc: MetadataDocument) => overrides[doc._id] ?? getOriginal(doc)

  const update = (docId: string, field: FieldKey, patch: Partial<ExtractedMetadata>) => {
    setOverrides(prev => {
      const base = prev[docId] ?? original[docId] ?? extracted[docId] ?? EMPTY_METADATA
      return { ...prev, [docId]: { ...base, ...patch, edited: { ...base.edited, [field]: true } } }
    })
  }

  const extract = (docs: MetadataDocument[], space?: Space) =>
    setExtracted(prev => ({ ...prev, ...Object.fromEntries(docs.map(d => [d._id, extractUploadMetadata(d, uploads, t, space)])) }))

  return { get, getOriginal, update, extract }
}

/** Workspaces User Testing Nov '26: one subject area in one language (see context.tsx). */
export default function UserTestingPrototype({ area, lang }: { area: Area; lang: Lang }) {
  return (
    // Keyed so switching prototypes starts the new one fresh.
    <PrototypeProvider key={prototypeBase(area, lang)} area={area} lang={lang}>
      <PrototypeRoutes />
    </PrototypeProvider>
  )
}

function PrototypeRoutes() {
  const BASE = usePrototype().base
  const navigate = useNavigate()
  const { lang } = usePrototype()
  const content = useArea()
  const t = useText(TEXT)
  // Version 21: no workspaces yet — the first one is still to be created.
  const workspace = useWorkspaceState([], lang)
  // My Documents when the prototype opens: this subject area's working documents (content/<area>.ts).
  const [myDocuments] = useState(() => buildMyDocuments(content.myDocuments))
  const store = useMetadataStore(myDocuments)
  const library = useLibrary(workspace, myDocuments.files)
  // Context details, guardrails, bookmarks and templates per workspace — kept here so they survive leaving the page.
  const [extrasBySpace, setExtrasBySpace] = useState<Record<string, WorkspaceExtras>>({})
  // CoPilot's chats live here, so leaving CoPilot doesn't lose them and a chat can be reopened from a workspace.
  const [copilotSessions, setCopilotSessions] = useState<CoPilotChat[] | null>(null)
  // Each workspace's document history (History Version 6's log), seeded the first time it's written to.
  const [historyBySpace, setHistoryBySpace] = useState<Record<string, HistoryEvent[]>>({})
  const history: HistoryStore = {
    // New workspaces start with an empty history.
    get: space => historyBySpace[space.id] ?? [],
    add: (space, _docs, event) => setHistoryBySpace(prev => ({ ...prev, [space.id]: [event, ...(prev[space.id] ?? [])] })),
  }
  // Workspaces whose "ready" animation has already played.
  const [readySeen, setReadySeen] = useState<Set<string>>(new Set())
  const markReadySeen = (spaceId: string) => setReadySeen(prev => prev.has(spaceId) ? prev : new Set(prev).add(spaceId))
  // When each workspace was last changed itself — created, its settings or profile edited, its guardrails changed —
  // so even an empty workspace has an "Updated" time on its card.
  const [spaceChanges, setSpaceChanges] = useState<Record<string, SpaceChange>>({})
  const noteChange = (id: string, what: string) => setSpaceChanges(prev => ({ ...prev, [id]: { at: Date.now(), what } }))
  const previousSpaces = useRef(workspace.spaces)
  useEffect(() => {
    const before = new Map(previousSpaces.current.map(s => [s.id, s]))
    workspace.spaces.forEach(s => {
      const old = before.get(s.id)
      if (!old) noteChange(s.id, t.changes.created)
      else if (old !== s) noteChange(s.id, old.context !== s.context ? t.changes.profileUpdated : t.changes.settingsUpdated)
    })
    previousSpaces.current = workspace.spaces
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace.spaces])
  const extras: ExtrasStore = {
    get: id => extrasBySpace[id] ?? EMPTY_EXTRAS,
    update: (id, patch) => {
      setExtrasBySpace(prev => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_EXTRAS), ...patch } }))
      noteChange(id, patch.guardrails ? t.changes.guardrailsUpdated : patch.details ? t.changes.profileUpdated : t.changes.workspaceUpdated)
    },
  }

  return (
    <Routes>
      <Route index element={<Navigate to="my-documents" replace />} />
      {/* My Documents is the landing page: the user's own documents, with the workspaces each one is shared to. */}
      <Route path="my-documents" element={<MyDocumentsRoute workspace={workspace} library={library} store={store} />} />
      <Route path="my-documents/:docId" element={<MyDocumentPreviewRoute library={library} store={store} />} />
      <Route path="workspaces">
        <Route index element={<SpacesListRoute workspace={workspace} extras={extras} library={library} spaceChanges={spaceChanges} />} />
        <Route path=":workspaceSlug" element={<SpaceDetailRoute workspace={workspace} library={library} store={store} extras={extras} history={history} area="summary" readySeen={readySeen} markReadySeen={markReadySeen} />} />
        {WORKSPACE_AREAS.map(area => (
          <Route key={area} path={`:workspaceSlug/${area}`} element={<SpaceDetailRoute workspace={workspace} library={library} store={store} extras={extras} history={history} area={area} readySeen={readySeen} markReadySeen={markReadySeen} />} />
        ))}
        <Route path=":workspaceSlug/activity" element={<SpaceDetailRoute workspace={workspace} library={library} store={store} extras={extras} history={history} area="activity" readySeen={readySeen} markReadySeen={markReadySeen} />} />
        <Route path=":workspaceSlug/documents/:docId" element={<DocumentPreviewRoute workspace={workspace} store={store} />} />
      </Route>
      <Route path="home" element={<HackathonHomePage copilotPath={`${BASE}/copilot`} />} />
      <Route path="copilot" element={<HackathonCoPilotPageV10
        workspaceMenu={{ workspacesPath: `${BASE}/workspaces`, myDocuments: library.files.map(doc => ({ doc, source: library.sourceOf(doc._id) })), workspaceDocuments: id => workspace.getSpaceDocs(id).map(doc => ({ doc, source: library.sourceOf(doc._id) })) }}
        savedSessions={copilotSessions}
        onSessionsChange={setCopilotSessions}
        background={CONTENT_BG}
        dsAvatars
        createWorkspaceIntro={content.workspaces.createIntro}
        renderSummary={(ref, activeChatId) => {
          const space = workspace.spaces.find(s => s.id === ref.id)
          // The workspace page then offers "Back to CoPilot", to this chat (or the workspace's welcome).
          const fromCopilot: FromCopilot = { chatId: activeChatId }
          return space && <CopilotWorkspaceSummary space={space} docs={workspace.getSpaceDocs(space.id)} extras={extras.get(space.id)} onOpen={() => navigate(ref.path, { state: { fromCopilot } })} />
        }}
        onChatStarted={(workspaceId, chat) => setExtrasBySpace(prev => {
          const current = prev[workspaceId] ?? EMPTY_EXTRAS
          if (current.chats.some(c => c.id === chat.id)) return prev
          return { ...prev, [workspaceId]: { ...current, chats: [{ ...chat, createdAt: Date.now() }, ...current.chats] } }
        })}
        workspaces={workspace.spaces.map(space => workspaceReference(space, workspace, extras, BASE))}
        onCreateWorkspace={workspace.createSpace}
        onSaveDocuments={(id, files) => workspace.addDocsToSpace(id, files.map(localFileToDoc))}
      />} />
      <Route path="personal-office" element={<PersonalOfficePage copilotPath={`${BASE}/copilot`} background={CONTENT_BG} />} />
      <Route path="connectors" element={<ConnectionsPageV10 background={CONTENT_BG} plain showCount compactMenu sharedAccounts accountName={toProjectA} />} />
      <Route path="*" element={<Navigate to="my-documents" replace />} />
    </Routes>
  )
}

type SpaceChange = { at: number; what: string }

function SpacesListRoute({ workspace, extras, library, spaceChanges }: { workspace: WorkspaceState; extras: ExtrasStore; library: Library; spaceChanges: Record<string, SpaceChange> }) {
  const BASE = usePrototype().base
  const navigate = useNavigate()
  const content = useArea()
  return (
    <WorkspacesList
      spaces={workspace.spaces}
      getSpaceDocs={workspace.getSpaceDocs}
      // The newest chat or Haufe document made in the workspace.
      getLastUsed={id => { const e = extras.get(id); return Math.max(0, ...e.chats.map(c => c.createdAt)) }}
      renderUsedIn={() => null}
      renderFooter={(space, docs) => <CardSummary space={space} docs={docs} extras={extras.get(space.id)} />}
      renderMeta={(space, docs) => <LastUpdated docs={docs} extras={extras.get(space.id)} change={spaceChanges[space.id]} />}
      onOpenSpace={id => {
        const space = workspace.spaces.find(s => s.id === id)
        navigate(`${BASE}/workspaces/${slugify(space?.name ?? id)}`)
      }}
      // Land in the new workspace straight away.
      onCreateSpace={values => { workspace.createSpace(values); navigate(`${BASE}/workspaces/${slugify(values.name)}`) }}
      onUpdateSpace={workspace.updateSpace}
      // Its files go with it; documents the user shared from My Documents stay there.
      onDeleteSpace={library.deleteWorkspace}
      // Only once there's a workspace — the empty state explains workspaces on its own.
      description={workspace.spaces.length > 0 ? content.profile.listDescription : undefined}
      renderEmptyState={openCreate => <WorkspacesEmptyState onCreate={openCreate} />}
      createInToolbar
      createIntro={content.workspaces.createIntro}
      accessFilters
      showCount
      myDocumentsToolbar
      hideHeaderWhenEmpty
    />
  )
}

/**
 * First-run state for the Workspaces page (FigJam "A6", Workspaces 2.0 board): what a workspace is and why on the
 * left, with Create workspace under the benefits; on the right, what you know + Haufe knowledge = your answers.
 * The workspace card is the one in focus ("You create this"); the other two are quieter — Haufe knowledge is
 * included and the answers are the result. Everything uses the CoPilot blue, so the button stays the one solid blue.
 */
const EMPTY_STATE_ICONS = '/workspaces-2/empty-state'

function WorkspacesEmptyState({ onCreate }: { onCreate: () => void }) {
  const t = useText(TEXT)
  const { workspaces } = useArea()
  const e = t.empty
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 72, padding: `${spacing(6)}px ${spacing(12)}px` }}>
      <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <div style={{ fontSize: 32, lineHeight: 1.25, fontWeight: 700, color: colorPalette.neutral.darken5 }}>
          {e.titleBefore}<span style={{ color: colorPalette.blue.base }}>{e.titleHighlight}</span>{e.titleAfter}
        </div>
        <Typography size="base" color="neutral-darken2">{workspaces.createIntro}</Typography>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: spacing(1) }}>
          {e.benefits.map(benefit => (
            <div key={benefit} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ display: 'inline-flex', marginTop: 2 }}><Icon type={iconType.CheckOutlined} size={16} color="blue-base" /></span>
              <Typography size="base-sm" color="neutral-darken4">{benefit}</Typography>
            </div>
          ))}
        </div>
        <div style={{ marginTop: spacing(2) }}>
          <ButtonPrimary leftIcon={iconType.PlusOutlined} onClick={onCreate}>{e.create}</ButtonPrimary>
        </div>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(1), padding: 28, borderRadius: 24, backgroundColor: colorPalette.neutral.lighten5 }}>
        <EquationCard
          focus
          tag={e.youCreateThis}
          icon="your-workspace.svg"
          label={e.yourWorkspace}
          title={e.whatYouKnow}
          text={workspaces.equation.workspaceText}
        />
        <EquationOperator>+</EquationOperator>
        <EquationCard
          tag={e.included}
          icon="haufe-logo.svg"
          iconSize={24}
          label={e.haufeKnowledge}
          title={e.trustedExpertise}
          text={workspaces.equation.haufeText}
        />
        <EquationOperator>=</EquationOperator>
        <EquationCard
          tinted
          tag={e.theResult}
          icon="copilot.svg"
          label={e.yourAnswers}
          title={workspaces.equation.resultTitle}
          text={workspaces.equation.resultText}
        />
      </div>
    </div>
  )
}

/** The + and = between the cards. */
function EquationOperator({ children }: { children: ReactNode }) {
  return <div aria-hidden style={{ fontSize: 24, lineHeight: '28px', color: colorPalette.neutral.base }}>{children}</div>
}

/**
 * One card of the equation. `focus`: the workspace — blue border, shadow and a tag on its top edge. Otherwise the
 * card is quieter, with its tag in the corner; `tinted` gives the answers card its light blue fill.
 */
function EquationCard({ focus = false, tinted = false, tag, icon, iconSize = 28, label, title, text }: {
  focus?: boolean
  tinted?: boolean
  tag: string
  icon: string
  iconSize?: number
  label: string
  title: string
  text: string
}) {
  const blue = colorPalette.blue.base
  return (
    <div style={{
      position: 'relative', width: focus ? 372 : 340, boxSizing: 'border-box', display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: focus ? '22px 20px 20px' : '14px 16px', borderRadius: focus ? 16 : 14, opacity: focus ? 1 : 0.72,
      backgroundColor: tinted ? colorPalette.blue.lighten5 : colorPalette.white,
      border: focus ? `2px solid ${blue}` : `1px solid ${tinted ? colorPalette.blue.lighten2 : colorPalette.neutral.lighten2}`,
      boxShadow: focus ? '0 10px 28px rgba(51, 51, 255, 0.14)' : undefined,
    }}>
      {focus ? (
        <span style={{ position: 'absolute', top: -11, left: 18, padding: '2px 10px', borderRadius: 999, backgroundColor: blue, color: colorPalette.white, fontSize: 11, lineHeight: '18px', fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>{tag}</span>
      ) : (
        <span style={{ position: 'absolute', top: 10, right: 12, padding: '1px 8px', borderRadius: 999, backgroundColor: tinted ? colorPalette.white : colorPalette.neutral.lighten5, color: tinted ? blue : colorPalette.neutral.darken2, fontSize: 11, fontWeight: 600 }}>{tag}</span>
      )}
      {/* The illustration's icons, recoloured to the CoPilot blue (a mask keeps their shape, the token gives the colour). */}
      <div style={{ width: 32, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        <span aria-hidden style={{
          width: focus ? 32 : iconSize, height: focus ? 32 : iconSize, backgroundColor: blue,
          WebkitMask: `url(${EMPTY_STATE_ICONS}/${icon}) center / contain no-repeat`, mask: `url(${EMPTY_STATE_ICONS}/${icon}) center / contain no-repeat`,
        }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, lineHeight: '16px', fontWeight: 600, textTransform: 'uppercase', color: blue }}>{label}</div>
        <div style={{ marginTop: 2, fontSize: focus ? 17 : 15, lineHeight: '24px', fontWeight: focus ? 700 : 600, color: colorPalette.neutral.darken5 }}>{title}</div>
        <div style={{ fontSize: 13, lineHeight: '18px', color: colorPalette.neutral.darken2 }}>{text}</div>
      </div>
    </div>
  )
}

/** How a workspace page was reached from CoPilot's "In this workspace" card: the chat to return to, if one was open. */
type FromCopilot = { chatId: string | null }

type ExtrasStore = {
  get: (spaceId: string) => WorkspaceExtras
  update: (spaceId: string, patch: Partial<WorkspaceExtras>) => void
}

/** Everything CoPilot is handed about one workspace. */
/** `base`: this prototype's URL (usePrototype().base). */
function workspaceReference(space: Space, workspace: WorkspaceState, extras: ExtrasStore, base: string): WorkspaceReference {
  const e = extras.get(space.id)
  return {
    id: space.id,
    name: space.name,
    description: space.description,
    path: `${base}/workspaces/${slugify(space.name)}`,
    visibility: space.visibility,
    documentNames: workspace.getSpaceDocs(space.id).slice(0, 12).map(fileName),
    documents: workspace.getSpaceDocs(space.id).length,
    hasBackground: !!space.context?.trim(),
    details: e.details.filter(d => d.label.trim() && d.value.trim()).length,
    guardrails: e.guardrails.filter(g => g.enabled).map(g => g.text),
    bookmarks: e.bookmarks.length,
    templates: e.templates.length,
  }
}

// What a workspace is and why, at the top of every Create workspace dialog, is the area's `workspaces.createIntro` —
// the same line as the empty Workspaces page, so the page and the dialog explain a workspace in the same words.

const WORKSPACE_AREAS = ['documents', 'context', 'guardrails', 'bookmarks', 'templates'] as const
type WorkspaceArea = typeof WORKSPACE_AREAS[number]
// 'activity': everything made with Haufe apps in the workspace (the Used in card's View all).
type WorkspacePageArea = 'summary' | 'activity' | WorkspaceArea

type HistoryStore = {
  get: (space: Space, docs: MetadataDocument[]) => HistoryEvent[]
  add: (space: Space, docs: MetadataDocument[], event: HistoryEvent) => void
}

function SpaceDetailRoute({ workspace, library, store, extras, history, area, readySeen, markReadySeen }: { workspace: WorkspaceState; library: Library; store: MetadataStore; extras: ExtrasStore; history: HistoryStore; area: WorkspacePageArea; readySeen: Set<string>; markReadySeen: (spaceId: string) => void }) {
  const BASE = usePrototype().base
  const navigate = useNavigate()
  const t = useText(TEXT)
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>()
  const isLoading = useMountLoading()
  // Opened from CoPilot's "In this workspace" card: kept while moving around the workspace, so its summary leads back.
  const fromCopilot = (useLocation().state as { fromCopilot?: FromCopilot } | null)?.fromCopilot
  const keepFrom = fromCopilot ? { state: { fromCopilot } } : undefined

  const space = workspace.spaces.find(s => slugify(s.name) === workspaceSlug) ?? null
  if (!space) return <Navigate to={`${BASE}/workspaces`} replace />
  // The profile is edited in a modal from the summary now; the old Profile page's URL lands there.
  // The profile is edited from the summary, and bookmarks are gone from this version: both land there.
  if (area === 'context' || area === 'bookmarks') return <Navigate to={`${BASE}/workspaces/${workspaceSlug}`} replace />

  // Only the summary loads in; drilling into an area and back should feel instant.
  if (isLoading && area === 'summary') {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton variant={skeletonVariants.TEXT} title paragraph={{ rows: 6 }} />
      </div>
    )
  }

  const summaryPath = `${BASE}/workspaces/${workspaceSlug}`
  const spaceDocs = workspace.getSpaceDocs(space.id)
  return (
    <SpaceDocumentsTable
      readySeen={readySeen.has(space.id)}
      onReadySeen={() => markReadySeen(space.id)}
      area={area}
      onOpenArea={a => navigate(`${summaryPath}/${a}`, keepFrom)}
      onOpenConnectors={() => navigate(`${BASE}/connectors`)}
      space={space}
      spaces={workspace.spaces}
      docs={spaceDocs}
      library={library}
      store={store}
      history={history.get(space, spaceDocs)}
      // Every change to the workspace's documents is logged in its history.
      onDocsChange={docs => {
        const removed = spaceDocs.filter(d => !docs.some(n => n._id === d._id))
        if (removed.length) history.add(space, spaceDocs, liveEvent('delete', removed))
        library.setWorkspaceFiles(space.id, docs)
      }}
      onAddDocs={newDocs => {
        history.add(space, spaceDocs, liveEvent('upload', newDocs))
        workspace.addDocsToSpace(space.id, newDocs)
      }}
      // From an area, back goes to the workspace's summary; from the summary, to the list — or, when the workspace was
      // opened from CoPilot, back to CoPilot in this workspace (on the chat that was open).
      onBack={() => area !== 'summary' ? navigate(summaryPath, keepFrom)
        : fromCopilot ? navigate(`${BASE}/copilot`, { state: { workspaceRef: workspaceReference(space, workspace, extras, BASE), openChatId: fromCopilot.chatId ?? undefined } })
        : navigate(`${BASE}/workspaces`)}
      backLabel={fromCopilot ? t.workspace.backToCopilot : undefined}
      onOpenDoc={doc => navigate(`${summaryPath}/documents/${encodeURIComponent(doc._id)}`)}
      onUpdateSpace={values => {
        workspace.updateSpace(space.id, values)
        // Renaming changes the slug, so follow the space to its new URL.
        if (values.name !== space.name) navigate(`${BASE}/workspaces/${slugify(values.name)}${area === 'summary' ? '' : `/${area}`}`, { replace: true })
      }}
      onDeleteSpace={() => { library.deleteWorkspace(space.id); navigate(`${BASE}/workspaces`) }}
      extras={extras.get(space.id)}
      onExtrasChange={patch => extras.update(space.id, patch)}
      onSaveBackground={text => workspace.updateSpaceContext(space.id, text, t.changes.profileSaved)}
      onAskCopilot={initialQuestion => {
        const workspaceRef = workspaceReference(space, workspace, extras, BASE)
        navigate(`${BASE}/copilot`, { state: { workspaceRef, initialQuestion } })
      }}
      onOpenChat={openChatId => navigate(`${BASE}/copilot`, { state: { workspaceRef: workspaceReference(space, workspace, extras, BASE), openChatId } })}
      // A document's "Ask CoPilot": a new chat in this workspace with the document attached.
      onAskAboutDoc={(doc, source) => navigate(`${BASE}/copilot`, { state: { workspaceRef: workspaceReference(space, workspace, extras, BASE), attachDocs: [{ doc, source }] } })}
    />
  )
}

function DocumentPreviewRoute({ workspace, store }: { workspace: WorkspaceState; store: MetadataStore }) {
  const BASE = usePrototype().base
  const navigate = useNavigate()
  const { workspaceSlug, docId } = useParams<{ workspaceSlug: string; docId: string }>()
  const space = workspace.spaces.find(s => slugify(s.name) === workspaceSlug) ?? null
  const docs = space ? workspace.getSpaceDocs(space.id) : []
  const doc = docs.find(d => d._id === docId) ?? null

  if (!space) return <Navigate to={`${BASE}/workspaces`} replace />
  if (!doc) return <Navigate to={`${BASE}/workspaces/${workspaceSlug}/documents`} replace />

  const index = docs.indexOf(doc)
  const source = computeDocSourceMap(docs, space).get(doc._id) ?? 'local'

  return (
    <DocumentPreview
      key={doc._id}
      space={space}
      doc={doc}
      store={store}
      source={source}
      docIndex={index}
      onBack={() => navigate(`${BASE}/workspaces/${workspaceSlug}/documents`)}
      onDelete={() => {
        workspace.setSpaceDocs(space.id, docs.filter(d => d._id !== doc._id))
        navigate(`${BASE}/workspaces/${workspaceSlug}/documents`)
      }}
    />
  )
}

// ─── Shared field editors (used in the table popovers and the preview panel) ──

function EditorActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const t = useText(TEXT)
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing(2) }}>
      <ButtonTertiary onClick={onCancel}>{t.common.cancel}</ButtonTertiary>
      <ButtonPrimary onClick={onSave}>{t.common.save}</ButtonPrimary>
    </div>
  )
}

function DocumentTypeEditor({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const t = useText(TEXT)
  const [draft, setDraft] = useState(value)
  // Type is mandatory: an empty save shows the error instead of saving.
  const [tried, setTried] = useState(false)
  const save = () => { if (draft.trim()) onSave(draft.trim()); else setTried(true) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      <Input
        label={t.fields.documentType}
        isRequired
        error={tried && !draft.trim() ? t.editors.typeRequired : undefined}
        value={draft}
        placeholder={t.editors.typePlaceholder}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); save() }
          if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
        }}
      />
      <EditorActions onSave={save} onCancel={onCancel} />
    </div>
  )
}

const SUMMARY_MAX = 500
// A matter reference is a name, not a description — the limit keeps it to a few words.
const MATTER_MAX = 40

/** Edits the matter reference from the table popover. */
function MatterEditor({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const t = useText(TEXT)
  const { workspaces } = useArea()
  const [draft, setDraft] = useState(value)
  const save = () => onSave(draft.trim())
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      <Input
        label={t.fields.matterReference}
        value={draft}
        placeholder={workspaces.matterPlaceholder}
        maxLength={MATTER_MAX}
        hasCounter
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); save() }
          if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
        }}
      />
      <EditorActions onSave={save} onCancel={onCancel} />
    </div>
  )
}

const blankParty = (): Party => ({ id: newId('party'), name: '', role: '' })
const blankDate = (): KeyDate => ({ id: newId('date'), label: '', date: '', isDeadline: false })
const cleanParties = (rows: Party[]) => rows.map(r => ({ ...r, name: r.name.trim(), role: r.role.trim() })).filter(r => r.name)
/** There's no deadline toggle in the editors, so a date counts as a deadline when its label says so. */
const DEADLINE_LABEL = /deadline|\bdue\b|go-live|milestone|expir|frist|fällig|ablauf|termin\b/i
const blankPeriod = (label: string): KeyDate => ({ id: newId('period'), label, date: '', endDate: '', isDeadline: false })
/** Drops incomplete rows, fills empty labels, marks deadlines by their label, and puts a period's ends the right way round. */
const cleanDates = (rows: KeyDate[], t: Text) => sortDates(rows
  .filter(r => r.date && (!isPeriod(r) || r.endDate))
  .map(r => {
    const label = r.label.trim() || (isPeriod(r) ? t.dates.period : t.dates.date)
    if (!isPeriod(r)) return { ...r, label, isDeadline: DEADLINE_LABEL.test(label) }
    const [date, endDate] = [r.date, r.endDate!].sort()
    return { ...r, label, date, endDate, isDeadline: false }
  }))
const toIso = (d: Date | null) => d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : ''

/** Controlled list of party rows — wrapped with its own Save/Cancel in the table popover, bare in the preview's edit panel. */
/** `maxRowsHeight` caps the rows and scrolls them — for the table popover, where ten parties would push Save off-screen. */
function PartiesFields({ rows, onChange, maxRowsHeight }: { rows: Party[]; onChange: (rows: Party[]) => void; maxRowsHeight?: number }) {
  const t = useText(TEXT)
  const setRow = (id: string, patch: Partial<Party>) => onChange(rows.map(r => r.id === id ? { ...r, ...patch } : r))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <Typography size="base" weight="semibold" color="neutral-darken5">{t.fields.parties}</Typography>
      {rows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 32px', gap: spacing(2), alignItems: 'center', maxHeight: maxRowsHeight, overflowY: maxRowsHeight ? 'auto' : undefined, overscrollBehavior: 'contain', paddingRight: maxRowsHeight ? 4 : undefined }}>
          {rows.map(r => (
            <PartyRow key={r.id} party={r} onChange={patch => setRow(r.id, patch)} onRemove={() => onChange(rows.filter(x => x.id !== r.id))} />
          ))}
        </div>
      )}
      <div style={{ marginLeft: -8 }}>
        <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => onChange([...rows, blankParty()])}>{t.editors.addParty}</ButtonGhost>
      </div>
    </div>
  )
}

function PartiesEditor({ value, onSave, onCancel }: { value: Party[]; onSave: (v: Party[]) => void; onCancel: () => void }) {
  const [rows, setRows] = useState<Party[]>(value.length ? value : [blankParty()])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      {/* Six rows (40px + 8px gap each) before the list scrolls. */}
      <PartiesFields rows={rows} onChange={setRows} maxRowsHeight={6 * 48 - 8} />
      <EditorActions onSave={() => onSave(cleanParties(rows))} onCancel={onCancel} />
    </div>
  )
}

function PartyRow({ party, onChange, onRemove }: { party: Party; onChange: (patch: Partial<Party>) => void; onRemove: () => void }) {
  const t = useText(TEXT)
  const { uploads } = useArea()
  return (
    <>
      <Input value={party.name} placeholder={t.editors.personOrOrganisation} onChange={e => onChange({ name: e.target.value })} />
      <Input value={party.role} placeholder={t.editors.rolePlaceholder(uploads.primaryRole)} onChange={e => onChange({ role: e.target.value })} />
      <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={onRemove} />
    </>
  )
}

/** Controlled list of date rows; see PartiesFields. */
function DatesFields({ rows, onChange }: { rows: KeyDate[]; onChange: (rows: KeyDate[]) => void }) {
  const t = useText(TEXT)
  const setRow = (id: string, patch: Partial<KeyDate>) => onChange(rows.map(r => r.id === id ? { ...r, ...patch } : r))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <Typography size="base" weight="semibold" color="neutral-darken5">{t.fields.dates}</Typography>
      {rows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 32px', gap: spacing(2), alignItems: 'start' }}>
          <Typography size="base-sm" color="neutral-darken2">{t.editors.typeHeader}</Typography>
          <Typography size="base-sm" color="neutral-darken2">{t.editors.dateHeader}</Typography>
          <span />
          {rows.map(r => (
            <DateRow key={r.id} row={r} onChange={patch => setRow(r.id, patch)} onRemove={() => onChange(rows.filter(x => x.id !== r.id))} />
          ))}
        </div>
      )}
      <div style={{ marginLeft: -8, display: 'flex' }}>
        <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => onChange([...rows, blankDate()])}>{t.editors.addDate}</ButtonGhost>
        <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => onChange([...rows, blankPeriod(t.dates.period)])}>{t.editors.addPeriod}</ButtonGhost>
      </div>
    </div>
  )
}

function DatesEditor({ value, onSave, onCancel }: { value: KeyDate[]; onSave: (v: KeyDate[]) => void; onCancel: () => void }) {
  const t = useText(TEXT)
  const [rows, setRows] = useState<KeyDate[]>(value.length ? sortDates(value) : [blankDate()])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      <DatesFields rows={rows} onChange={setRows} />
      <EditorActions onSave={() => onSave(cleanDates(rows, t))} onCancel={onCancel} />
    </div>
  )
}

function DateRow({ row, onChange, onRemove }: { row: KeyDate; onChange: (patch: Partial<KeyDate>) => void; onRemove: () => void }) {
  const t = useText(TEXT)
  const { uploads } = useArea()
  return (
    <>
      <Input value={row.label} placeholder={isPeriod(row) ? t.editors.periodPlaceholder : t.editors.datePlaceholder(uploads.deadlineLabels[0] ?? t.extract.replyDue)} onChange={e => onChange({ label: e.target.value })} />
      {isPeriod(row) ? (
        // No range picker in goat-ui, so a period stacks a From and a To picker.
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <DatePicker value={row.date ? new Date(row.date) : undefined} placeholder={t.editors.from} onChange={d => onChange({ date: toIso(d) })} />
          <DatePicker value={row.endDate ? new Date(row.endDate) : undefined} placeholder={t.editors.to} minDate={row.date ? new Date(row.date) : undefined} onChange={d => onChange({ endDate: toIso(d) })} />
        </div>
      ) : (
        <DatePicker value={row.date ? new Date(row.date) : undefined} placeholder={t.editors.dateFormat} onChange={d => onChange({ date: toIso(d) })} />
      )}
      <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={onRemove} />
    </>
  )
}

// ─── Read-only field displays ─────────────────────────────────────────────────

const cellText: React.CSSProperties = { fontSize: 14, lineHeight: '20px', color: colorPalette.neutral.darken5 }
/** Cell text that wraps onto as many lines as it needs. */
const wrap: React.CSSProperties = { ...cellText, wordBreak: 'break-word' }

/** Empty metadata value in the table. */
const Dash = () => <span style={cellText}>-</span>

const FILE_ICON_SRC: Partial<Record<string, string>> = {
  DOCX: '/metadata-v9/file-word.png',
  PDF: '/metadata-v9/file-pdf.png',
  XLSX: '/metadata-v9/file-excel.png',
  PPTX: '/metadata-v9/file-pptx.png',
}
/** Any other format gets a plain document icon. */
const GENERIC_FILE_ICON = '/metadata-v9/file-generic.png'

function FileTypeIcon({ format, size = 24 }: { format: string; size?: 20 | 24 }) {
  const src = FILE_ICON_SRC[format] ?? GENERIC_FILE_ICON
  return <img src={src} alt={format} width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} />
}

const fileName = (doc: MetadataDocument) => `${stripYear(doc.name)}.${doc.fileFormat.toLowerCase()}`

/**
 * Wraps a one- or two-line clamped value and shows its full text in a tooltip
 * on hover — only when the text is actually cut off, unless `always` is set
 * (for values like parties, whose tooltip adds roles the cell doesn't show).
 */
function TruncationTooltip({ title, always = false, disabled = false, children }: {
  title: string
  always?: boolean
  disabled?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  const onEnter = () => {
    const el = ref.current?.firstElementChild as HTMLElement | null
    // The cell itself or any line inside it (e.g. one party or date) being cut off counts.
    const nodes = el ? [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))] : []
    const truncated = nodes.some(n => n.scrollWidth > n.clientWidth + 1 || n.scrollHeight > n.clientHeight + 1)
    setShow(always || truncated)
  }
  return (
    <Tooltip title={title} size={title.length > 60 ? tooltipSizes.LARGE : tooltipSizes.SMALL} placement={tooltipPlacements.TOP} visible={show && !disabled && !!title}>
      <div ref={ref} onMouseEnter={onEnter} onMouseLeave={() => setShow(false)} style={{ minWidth: 0 }}>{children}</div>
    </Tooltip>
  )
}

// Past this many, the Parties cell lists the first few and sums up the rest as "+N" (all of them are in its tooltip).
const VISIBLE_PARTIES = 5

/** Every item, one per line; a long item wraps onto further lines rather than being cut off. */
function FullList({ items }: { items: { key: string; content: ReactNode }[] }) {
  return (
    <div style={{ minWidth: 0 }}>
      {items.map(item => <div key={item.key} style={wrap}>{item.content}</div>)}
    </div>
  )
}

// ─── Table cell with popover editor ───────────────────────────────────────────

/**
 * An editable metadata cell: hovering outlines it, clicking opens the field's
 * editor in a popover anchored below it; while open the outline turns primary.
 */
function EditableCell({ open, onOpenChange, editor, children, width }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editor: ReactNode
  children: ReactNode
  width: number
}) {
  return (
    <PopOver
      trigger={popOverTriggers.CLICK}
      placement={popOverPlacements.BOTTOM_LEFT}
      open={open}
      onOpenChange={onOpenChange}
      maxWidth={600}
      content={open ? <div onClick={e => e.stopPropagation()} style={{ width }}>{editor}</div> : null}
    >
      <div className={`v12-editable${open ? ' is-open' : ''}`}>{children}</div>
    </PopOver>
  )
}

const TABLE_CSS = `
  .v12-editable {
    cursor: pointer; min-height: 24px; border-radius: 8px; border: 1px solid transparent;
    margin: -3px -7px; padding: 2px 6px; transition: border-color 0.12s, background-color 0.12s;
  }
  .v12-editable:hover { border-color: ${colorPalette.neutral.lighten2}; background-color: ${colorPalette.white}; }
  .v12-editable.is-open { border-color: ${colorPalette.blue.base}; background-color: ${colorPalette.neutral.lighten5}; }
  .v12-doc-link { color: ${colorPalette.neutral.darken5}; cursor: pointer; }
  .v12-doc-link:hover { color: ${colorPalette.blue.base}; text-decoration: underline; }
  .goat-tooltip-inner p { white-space: pre-line; }
  /* goat-ui's Tooltip has no width prop and caps at ~200px, which breaks the all-parties
     tooltip's "Name (Role)" lines mid-name; wider is fine for this page's other tooltips too. */
  .goat-tooltip { max-width: 400px !important; }
  .v12-table thead th { text-transform: none !important; white-space: nowrap; }
`

// ─── Documents table ──────────────────────────────────────────────────────────

/**
 * A workspace page: the summary (full header and one tile per area), or one area on its own
 * with a back button to the summary.
 */
function SpaceDocumentsTable({ backLabel, readySeen, onReadySeen, area, onOpenArea, space, spaces, docs, library, store, history, onDocsChange, onAddDocs, onBack, onOpenDoc, onUpdateSpace, onDeleteSpace, extras, onExtrasChange, onSaveBackground, onAskCopilot, onOpenChat, onAskAboutDoc }: {
  // Whether this workspace's ready view has played before.
  readySeen: boolean
  onReadySeen: () => void
  area: WorkspacePageArea
  onOpenArea: (area: WorkspaceArea | 'activity') => void
  onOpenConnectors: () => void
  space: Space
  // Every workspace — for the documents' workspace chips, "Also in" filters and the "+" dialog.
  spaces: Space[]
  docs: MetadataDocument[]
  // My Documents: the user's own files, which they can share to this workspace.
  library: Library
  store: MetadataStore
  history: HistoryEvent[]
  onDocsChange: (docs: MetadataDocument[]) => void
  // Adds to whatever the workspace holds at the time — uploads land a moment after they start.
  onAddDocs: (docs: MetadataDocument[]) => void
  onBack: () => void
  // The summary's back link, when it doesn't go to Workspaces (opened from CoPilot: "Back to CoPilot").
  backLabel?: string
  onOpenDoc: (doc: MetadataDocument) => void
  onUpdateSpace: (values: SpaceFormValues) => void
  onDeleteSpace: () => void
  extras: WorkspaceExtras
  onExtrasChange: (patch: Partial<WorkspaceExtras>) => void
  onSaveBackground: (text: string) => void
  // Opens CoPilot with the whole workspace referenced, optionally with a first question.
  onAskCopilot: (initialQuestion?: string) => void
  // Opens CoPilot on one of this workspace's existing chats.
  onOpenChat: (chatId: string) => void
  // Opens CoPilot in this workspace with one document attached.
  onAskAboutDoc: (doc: MetadataDocument, source: DocSource) => void
}) {
  const BASE = usePrototype().base
  const t = useText(TEXT)
  const { lang } = usePrototype()
  const content = useArea()
  // "Add content" — on the empty state of a new workspace.
  // The Used in page's search — in the page title row, filtering the list below.
  const [activitySearch, setActivitySearch] = useState('')
  // The Profile modal (Edit on the Profile card, or "Add context").
  const [profileOpen, setProfileOpen] = useState(false)
  // Upload or sync new documents straight into the workspace (the same button and modal as My Documents).
  const addDocumentsButton = (
    <ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={() => setUploadOpen(true)}>{t.common.uploadOrSync}</ButtonPrimary>
  )
  // Whether the Profile and Used in cards have anything to show (their empty states otherwise) — as ProfileBody and HaufeContent decide.
  const hasProfile = !!space.context?.trim() || extras.details.some(d => d.label.trim() && d.value.trim())
  const hasActivity = extras.chats.length > 0
  // A workspace with nothing in it yet opens on the animated "ready" view instead of the two cards.
  const isEmptyWorkspace = docs.length === 0 && !space.context?.trim() && extras.details.length === 0 && extras.guardrails.length === 0
    && extras.templates.length === 0 && extras.chats.length === 0
  useEffect(() => {
    if (area === 'summary' && isEmptyWorkspace && !readySeen) onReadySeen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const runUpload = useProcessingUpload(lang)
  const sidebarWidth = useSidebarWidth()

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  // A selection belongs to the Documents page: leaving it (or switching workspace) clears it, so its toolbar closes.
  useEffect(() => { setSelectedKeys(new Set()) }, [area, space.id])
  const [uploadOpen, setUploadOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  // The documents' history (as in History Version 6): uploads, syncs, removals and connector changes.
  const historyButton = () => (
    <ButtonTertiary leftIcon={iconType.HistoryOutlined} onClick={() => setHistoryOpen(true)}>{t.common.history}</ButtonTertiary>
  )
  // The documents page's filters (as in My Documents), and the documents whose workspaces are being changed.
  const [filters, setFilters] = useState<DocFilters>(NO_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const typeOf = (d: MetadataDocument) => store.get(d).documentType || d.documentType
  const updateFilters = (patch: Partial<DocFilters>) => { setFilters(prev => ({ ...prev, ...patch })); setCurrentPage(1) }
  const applied = appliedFilters(filters, spaces, updateFilters, t, t.filters.alsoIn)
  const [pendingDelete, setPendingDelete] = useState<Set<string> | null>(null)
  const [editSpaceOpen, setEditSpaceOpen] = useState(false)
  const [deleteSpaceOpen, setDeleteSpaceOpen] = useState(false)

  // A file's source is its own, whichever workspaces it's in.
  const sourceMap = useMemo(() => new Map(docs.map(d => [d._id, library.sourceOf(d._id)])), [docs, library])

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase()
    const inFilters = docs.filter(d => matchesFilters(d, filters, library, d => store.get(d).documentType || d.documentType))
    if (!q) return inFilters
    return inFilters.filter(d => {
      const m = store.get(d)
      return d.name.toLowerCase().includes(q) || m.documentType.toLowerCase().includes(q) ||
        m.matterReference.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q) || m.parties.some(p => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)) ||
        m.dates.some(x => x.label.toLowerCase().includes(q))
    })
  }, [docs, search, store, filters, library])

  const pagedDocs = filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const selectedDocs = docs.filter(d => selectedKeys.has(d._id))
  const allSelectedAreManualUpload = selectedDocs.length > 0 && selectedDocs.every(d => (sourceMap.get(d._id) ?? 'local') === 'local')

  const columns = useMetadataColumns({
    docs, visibleDocs: filteredDocs, store, selectedKeys, setSelectedKeys,
    sourceOf: id => sourceMap.get(id) ?? 'local',
    sourceLabel: src => spaceConnectorLabel(space, src),
    onOpenDoc,
    actions: record => [
      { key: 'open', label: <MenuLabel icon={iconType.EyeOutlined}>{t.table.openPreview}</MenuLabel>, onClick: () => onOpenDoc(record) },
      // The CoPilot mark isn't a DS icon, so it sits in the label like on the Ask CoPilot buttons.
      { key: 'ask', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><span style={{ display: 'inline-flex', width: 16, justifyContent: 'center' }}><CopilotIcon /></span>{t.common.askCopilot}</span>, onClick: () => onAskAboutDoc(record, sourceMap.get(record._id) ?? 'local') },
      { key: 'download', label: <MenuLabel icon={iconType.DownloadOutlined}>{t.common.download}</MenuLabel>, onClick: () => {} },
      // Delete in red with the bin, as everywhere else.
      { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />{t.common.delete}</span>, onClick: () => setPendingDelete(new Set([record._id])) },
    ],
  })

  return (
    // The Workspaces list's margins (24px all round), so every My Knowledge page lines up.
    <div style={{ padding: spacing(6), display: 'flex', flexDirection: 'column', gap: spacing(6), backgroundColor: CONTENT_BG, height: '100%', overflow: 'hidden' }}>
      <style>{TABLE_CSS}</style>
      {area === 'summary' ? (
        // No Ask CoPilot while the workspace is empty — Add content is the one action there.
        <WorkspaceHero space={space} onBack={onBack} backLabel={backLabel} onAskCopilot={isEmptyWorkspace ? undefined : () => onAskCopilot()} onEdit={() => setEditSpaceOpen(true)} onDelete={() => setDeleteSpaceOpen(true)} />
      ) : (
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          {/* Back to the workspace's summary, named so it's clear where it goes. */}
          <div style={{ marginLeft: -spacing(2) }}>
            <ButtonGhost leftIcon={iconType.ChevronLeftOutlined} onClick={onBack}>{space.name}</ButtonGhost>
          </div>
          {/* Used in (all activity) is a centred column; its title (with the search on the right) lines up with it, the back link stays on the left. */}
          {area === 'activity' ? (
            <div style={{ ...ACTIVITY_COLUMN, display: 'flex', alignItems: 'center', gap: spacing(4) }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Typography size="heading-lg" weight="bold">{t.workspace.usedIn}</Typography>
              </div>
              <div style={{ width: 260, flexShrink: 0 }}>
                <SearchBar placeholder={t.workspace.searchActivity} value={activitySearch} onChange={setActivitySearch} width={searchbarWidth.EXPANDED} />
              </div>
            </div>
          ) : area === 'guardrails' ? (
            // As on the Used in page: the title (and its line) in the same centred column as the list.
            <div style={{ ...ACTIVITY_COLUMN, display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
              <Typography size="heading-lg" weight="bold">{t.workspace.areaTitles.guardrails}</Typography>
              <Typography size="base" color="neutral-darken2">{t.workspace.guardrailsIntro}</Typography>
            </div>
          ) : area === 'documents' && docs.length > 0 ? (
            // The count joins the title, as on the summary's Documents card.
            <Typography size="heading-lg" weight="bold">{t.workspace.areaTitles[area]} · {docs.length}</Typography>
          ) : (
            <Typography size="heading-lg" weight="bold">{t.workspace.areaTitles[area]}</Typography>
          )}
        </div>
      )}

      {area === 'summary' ? (
        // Padding so the tiles' hover shadow isn't clipped by the scroll area.
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: spacing(1), margin: -spacing(1) }}>
          {/* Version 21: even an empty workspace shows its containers, each with its own empty state. */}
          {(
          /* Primary on the left — the profile and the workspace's documents. Secondary on the right, narrower and
             quieter — its guardrails and where it's been used. */
          <div style={{ display: 'flex', gap: spacing(5), alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
              {/* Edit, Manage and View all only once a card has something in it — an empty card has its own button. */}
              <DossierCard title={t.workspace.profile} action={hasProfile && <ButtonGhost leftIcon={iconType.EditOutlined} onClick={() => setProfileOpen(true)}>{t.common.edit}</ButtonGhost>}>
                <ProfileBody space={space} extras={extras} onAdd={() => setProfileOpen(true)} />
              </DossierCard>
              <DossierCard
                title={`${t.workspace.areaTitles.documents}${docs.length ? ` · ${docs.length}` : ''}`}
                // Top right, as on the Guardrails and Used in cards — only once there's something to view.
                action={docs.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
                    <ButtonGhost leftIcon={iconType.HistoryOutlined} onClick={() => setHistoryOpen(true)}>{t.common.history}</ButtonGhost>
                    <ButtonGhost onClick={() => onOpenArea('documents')}>{t.common.viewAll}</ButtonGhost>
                  </div>
                )}
              >
                <SummaryDocuments docs={docs} store={store} sourceOf={id => sourceMap.get(id) ?? 'local'} onOpenDoc={onOpenDoc} onUpload={() => setUploadOpen(true)} />
              </DossierCard>
            </div>
            {/* A share of the width rather than a fixed 360px, so Guardrails and Used in get more room on wider screens. */}
            <div style={{ flex: '0 0 40%', minWidth: 380, maxWidth: 480, display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
              <DossierCard secondary title={t.workspace.areaTitles.guardrails} action={extras.guardrails.length > 0 && <ButtonGhost size={buttonSizes.SMALL} onClick={() => onOpenArea('guardrails')}>{t.common.manage}</ButtonGhost>}>
                <SummaryGuardrails guardrails={extras.guardrails} onAdd={() => onOpenArea('guardrails')} />
              </DossierCard>
              {/* A preview — up to three items per app; View all lists everything, across apps. */}
              <DossierCard secondary title={t.workspace.usedIn} action={hasActivity && <ButtonGhost size={buttonSizes.SMALL} onClick={() => onOpenArea('activity')}>{t.common.viewAll}</ButtonGhost>}>
                <HaufeContent spaceName={space.name} onAskCopilotEmpty={() => onAskCopilot()} chats={extras.chats} onAskCopilot={onAskCopilot} onOpenChat={onOpenChat} />
              </DossierCard>
            </div>
          </div>
          )}
        </div>
      ) : area === 'activity' ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div style={ACTIVITY_COLUMN}>
            <AllActivity search={activitySearch} chats={extras.chats} onOpenChat={onOpenChat} />
          </div>
        </div>
      ) : area === 'guardrails' ? (
        // Laid out like the Used in page: straight on the page, in its centred column.
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div style={ACTIVITY_COLUMN}>
            <GuardrailsTab plain guardrails={extras.guardrails} onChange={guardrails => onExtrasChange({ guardrails })} examples={content.workspaces.guardrailExamples} />
          </div>
        </div>
      ) : area === 'documents' ? (
        docs.length === 0 ? (
          <TabEmptyState
            icon={<Icon type={iconType.FolderOutlined} size={24} color="blue-base" />}
            title={t.workspace.noDocsTitle}
            text={t.workspace.noDocsText}
            action={addDocumentsButton}
          />
        ) : (
          <>
            {/* Search and filters together on the left; History and Upload, on the documents as a whole, on the right. */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: spacing(4) }}>
              <div style={{ width: 320 }}>
                <SearchBar placeholder={t.common.searchDocuments} value={search} onChange={v => { setSearch(v); setCurrentPage(1) }} width={searchbarWidth.EXPANDED} />
              </div>
              <ButtonTertiary leftIcon={iconType.FilterOutlined} onClick={() => setFiltersOpen(true)}>
                {t.common.filters(applied.length)}
              </ButtonTertiary>
              <div style={{ flex: 1 }} />
              {historyButton()}
              {addDocumentsButton}
            </div>
            {applied.length > 0 && (
              <div style={{ flexShrink: 0, marginTop: -spacing(3) }}>
                <AppliedFilterChips applied={applied} onClearAll={() => updateFilters(NO_FILTERS)} />
              </div>
            )}

            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              {filteredDocs.length === 0 ? (
                <NoResults title={t.common.noDocsMatch} text={t.common.noDocsMatchText} onClear={() => { updateFilters(NO_FILTERS); setSearch('') }} />
              ) : (
              <div className="v12-table" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <Table dataSource={pagedDocs} rowKey="_id" columns={columns as never} pagination={false} rowHoverable />
              </div>
              )}
              {filteredDocs.length > PAGE_SIZE && (
                <div style={{ flexShrink: 0 }}>
                  <Pagination current={currentPage} total={filteredDocs.length} pageSize={PAGE_SIZE} onChange={setCurrentPage} />
                </div>
              )}
            </div>
            <FilesDisclaimer />
          </>
        )
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {/* Each knowledge type sits in a white container on the tinted page, as in Version 6. */}
          <div style={{ backgroundColor: colorPalette.white, border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 12, padding: spacing(6) }}>
          {area === 'templates' && (
            <TemplatesTab
              templates={extras.templates}
              onChange={templates => onExtrasChange({ templates })}
              onUse={template => onAskCopilot(t.workspace.templatePrompt(template.name, template.app))}
            />
          )}
          </div>
        </div>
      )}

      {area === 'documents' && selectedKeys.size > 0 && (
        <div style={{ position: 'fixed', bottom: spacing(2), left: sidebarWidth + spacing(2), right: spacing(2), height: 56, backgroundColor: colorPalette.neutral.lighten1, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${spacing(6)}px`, zIndex: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(4) }}>
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setSelectedKeys(new Set())} />
            <Typography color="neutral-darken5">{t.common.selected(selectedKeys.size)}</Typography>
            <div style={{ display: 'flex', alignItems: 'center', height: 32, padding: '4px 12px', border: '1px solid #BFCAE8', borderRadius: 8, backgroundColor: colorPalette.white, color: '#374058', fontSize: 14, fontWeight: 600, cursor: 'default' }}>
              <span style={{ display: 'flex', marginRight: 8 }}><CopilotIcon /></span>
              {t.common.askCopilot}
              <span style={{ display: 'flex', marginLeft: 8 }}><Icon type={iconType.ExternalLinkOutlined} size={16} color="inherit" /></span>
            </div>
            {allSelectedAreManualUpload && (
              <ButtonTertiary leftIcon={iconType.DownloadOutlined} onClick={() => {}}>{t.common.download}</ButtonTertiary>
            )}
          </div>
          <ButtonDanger leftIcon={iconType.TrashOutlined} onClick={() => setPendingDelete(selectedKeys)}>{t.common.delete}</ButtonDanger>
        </div>
      )}

      <Modal
        visible={pendingDelete !== null}
        variant={modalVariants.DANGER}
        title={t.workspace.deleteDocsTitle(pendingDelete?.size ?? 0)}
        onClose={() => setPendingDelete(null)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: t.common.cancel, onClick: () => setPendingDelete(null) } },
          { variant: buttonVariants.DANGER, props: { children: t.common.delete, onClick: () => {
            if (!pendingDelete) return
            onDocsChange(docs.filter(d => !pendingDelete.has(d._id)))
            setSelectedKeys(prev => { const next = new Set(prev); pendingDelete.forEach(id => next.delete(id)); return next })
            setPendingDelete(null)
          } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">
          {t.workspace.deleteDocsBody(pendingDelete?.size ?? 0, space.name)}
        </Typography>
      </Modal>

      <SpaceFormModal
        open={editSpaceOpen}
        mode="edit"
        noun="Workspace"
        showPhotoUpload={false}
        showType={false}
        organisationAccess
        accessRadios
        lang={lang}
        initialValues={space}
        onClose={() => setEditSpaceOpen(false)}
        onSubmit={values => { onUpdateSpace(values); setEditSpaceOpen(false) }}
      />

      <ProfileModal
        open={profileOpen}
        space={space}
        details={extras.details}
        onClose={() => setProfileOpen(false)}
        onSave={(background, details) => {
          onExtrasChange({ details })
          onSaveBackground(background)
          setProfileOpen(false)
        }}
      />
      <Modal
        visible={deleteSpaceOpen}
        variant={modalVariants.DANGER}
        title={t.workspace.deleteTitle}
        onClose={() => setDeleteSpaceOpen(false)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: t.common.cancel, onClick: () => setDeleteSpaceOpen(false) } },
          { variant: buttonVariants.DANGER, props: { children: t.common.delete, onClick: () => { setDeleteSpaceOpen(false); onDeleteSpace() } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">
          {t.workspace.deleteBody(space.name, docs.length)}
        </Typography>
      </Modal>

      <HistoryPanel visible={historyOpen} events={history} onClose={() => setHistoryOpen(false)} textOnlyNoResults />

      {/* Upload, or sync from a connected app: its sign-in, then its file picker (Figma: My Documents, Microsoft Integration). */}
      <UploadOrSyncFlow
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        // Bulk Edit V3's processing toasts; the documents appear once "extraction" is done.
        onUpload={newDocs => runUpload(newDocs.map(d => d.name), () => { store.extract(newDocs, space); onAddDocs(newDocs) })}
        onSync={(newDocs, source) => { library.markSynced(newDocs, source); runUpload(newDocs.map(d => d.name), () => { store.extract(newDocs, space); onAddDocs(newDocs) }, 'sync') }}
        existingIds={new Set(docs.map(d => d._id))}
        connectorsPath={`${BASE}/connectors`}
        accountName={toProjectA}
      />

      <FiltersPanel
        open={filtersOpen}
        filters={filters}
        spaces={spaces}
        library={library}
        files={docs}
        inWorkspace={space}
        typeOf={typeOf}
        resultCount={filteredDocs.length}
        onChange={updateFilters}
        onClear={() => updateFilters(NO_FILTERS)}
        onClose={() => setFiltersOpen(false)}
      />
    </div>
  )
}

type ColumnsActionItem = { key: string; label: ReactNode; onClick: () => void }

/**
 * The Metadata Table's columns (as in projects/metadata/table): checkbox, file type, Name (+ size), Status, Source,
 * Type, Matter reference, Parties, Dates and Updated, with Type to Dates editable in place. Used by a workspace's
 * Files page and by My Documents; `nameExtra` sits under the name, `extraColumns` go before Updated, and
 * `actions` is each row's menu.
 */
function useMetadataColumns({ docs, visibleDocs, store, selectedKeys, setSelectedKeys, sourceOf, sourceLabel, onOpenDoc, canOpen = () => true, nameExtra, sizeExtra, extraColumns = [], actions }: {
  docs: MetadataDocument[]
  // The rows on screen (after search and filters) — what the header checkbox selects.
  visibleDocs: MetadataDocument[]
  store: MetadataStore
  selectedKeys: Set<string>
  setSelectedKeys: React.Dispatch<React.SetStateAction<Set<string>>>
  sourceOf: (id: string) => DocSource
  sourceLabel: (src: ConnectorType) => string
  onOpenDoc: (doc: MetadataDocument) => void
  canOpen?: (doc: MetadataDocument) => boolean
  // Shown under the name and size (My Documents: the workspaces a document is in).
  nameExtra?: (doc: MetadataDocument) => ReactNode
  // Inline after the file size (My Documents: "Add to workspace", on row hover).
  sizeExtra?: (doc: MetadataDocument) => ReactNode
  extraColumns?: object[]
  actions: (doc: MetadataDocument) => ColumnsActionItem[]
}) {
  const t = useText(TEXT)
  const [editing, setEditing] = useState<{ id: string; field: FieldKey } | null>(null)
  const allSelected = visibleDocs.length > 0 && visibleDocs.every(d => selectedKeys.has(d._id))
  const someSelected = visibleDocs.some(d => selectedKeys.has(d._id))
  const isEditing = (id: string, field: FieldKey) => editing?.id === id && editing.field === field
  const openChange = (id: string, field: FieldKey) => (o: boolean) => setEditing(o ? { id, field } : null)
  const close = () => setEditing(null)
  const saveField = (id: string, field: FieldKey, patch: Partial<ExtractedMetadata>) => {
    // Saving an untouched editor shouldn't flag the field as "Edited by you".
    const current = store.get(docs.find(d => d._id === id)!)
    const norm = (v: unknown) => JSON.stringify(field === 'dates' ? sortDates(v as KeyDate[]) : v)
    if (norm(patch[field]) !== norm(current[field])) store.update(id, field, patch)
    close()
  }

  const rowStyle = (record: MetadataDocument) => ({ style: { verticalAlign: 'top' as const, height: 64, backgroundColor: selectedKeys.has(record._id) ? '#EEF4FF' : undefined } })

  const columns = [
    {
      title: (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={e => setSelectedKeys(new Set(e.target.checked ? visibleDocs.map(d => d._id) : []))}
        />
      ),
      key: 'checkbox',
      width: 32,
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => (
        <Checkbox
          checked={selectedKeys.has(record._id)}
          onChange={e => setSelectedKeys(prev => {
            const next = new Set(prev)
            if (e.target.checked) next.add(record._id); else next.delete(record._id)
            return next
          })}
        />
      ),
    },
    {
      title: '',
      key: 'fileType',
      width: 32,
      sorter: (a: MetadataDocument, b: MetadataDocument) => a.fileFormat.localeCompare(b.fileFormat),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => <div style={{ display: 'flex', justifyContent: 'center' }}><FileTypeIcon format={record.fileFormat} /></div>,
    },
    {
      title: t.table.name,
      key: 'name',
      width: '16%',
      sorter: (a: MetadataDocument, b: MetadataDocument) => stripYear(a.name).localeCompare(stripYear(b.name)),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => (
        <>
          <TruncationTooltip title={fileName(record)}>
            <div style={{ ...wrap, fontWeight: 500 }}>{canOpen(record) ? <span className="v12-doc-link" onClick={() => onOpenDoc(record)}>{fileName(record)}</span> : fileName(record)}</div>
          </TruncationTooltip>
          <div style={{ ...cellText, color: colorPalette.neutral.darken2, display: 'flex', alignItems: 'center', gap: spacing(2) }}><span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{record.fileSize}</span>{sizeExtra?.(record)}</div>
          {nameExtra?.(record)}
        </>
      ),
    },
    {
      title: t.table.status,
      key: 'status',
      width: 64,
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const synced = sourceOf(record._id) !== 'local'
        const hours = (docs.indexOf(record) % 5) + 1
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title={synced ? t.table.upToDateSynced(hours) : t.table.upToDate} placement={tooltipPlacements.TOP}>
              <div style={{ display: 'inline-flex' }}><Icon type={iconType.CheckCircleFilled} size={20} color="success-base" /></div>
            </Tooltip>
          </div>
        )
      },
    },
    {
      title: t.table.source,
      key: 'source',
      width: 64,
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const src = sourceOf(record._id)
        return <div style={{ display: 'flex', justifyContent: 'center' }}>{docSourceIcon(src, 18, t.preview.manualUpload, src !== 'local' ? sourceLabel(src) : undefined)}</div>
      },
    },
    {
      title: t.fields.documentType,
      key: 'documentType',
      width: 120,
      sorter: (a: MetadataDocument, b: MetadataDocument) => store.get(a).documentType.localeCompare(store.get(b).documentType),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const m = store.get(record)
        const open = isEditing(record._id, 'documentType')
        return (
          <EditableCell
            open={open}
            onOpenChange={openChange(record._id, 'documentType')}
            width={232}
            editor={<DocumentTypeEditor value={m.documentType} onCancel={close} onSave={v => saveField(record._id, 'documentType', { documentType: v })} />}
          >
            {m.documentType
              ? <TruncationTooltip title={m.documentType} disabled={open}><div style={wrap}>{m.documentType}</div></TruncationTooltip>
              : <Dash />}
          </EditableCell>
        )
      },
    },
    {
      title: t.fields.matterReference,
      key: 'matterReference',
      // A few words at most, so a modest share — it no longer soaks up the spare width the summary needed.
      width: '13%',
      sorter: (a: MetadataDocument, b: MetadataDocument) => store.get(a).matterReference.localeCompare(store.get(b).matterReference),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const text = store.get(record).matterReference
        const open = isEditing(record._id, 'matterReference')
        return (
          <EditableCell
            open={open}
            onOpenChange={openChange(record._id, 'matterReference')}
            width={280}
            editor={<MatterEditor value={text} onCancel={close} onSave={v => saveField(record._id, 'matterReference', { matterReference: v })} />}
          >
            {text
              ? <TruncationTooltip title={text} disabled={open}><div style={wrap}>{text}</div></TruncationTooltip>
              : <Dash />}
          </EditableCell>
        )
      },
    },
    {
      title: t.fields.parties,
      key: 'parties',
      // No width on Parties or Dates: they split whatever is left equally, so they stay the same
      // width and get the most room — long party names and multi-date cells need it most.
      sorter: (a: MetadataDocument, b: MetadataDocument) => (store.get(a).parties[0]?.name ?? '').localeCompare(store.get(b).parties[0]?.name ?? ''),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const { parties } = store.get(record)
        const open = isEditing(record._id, 'parties')
        const tooltip = parties.map(p => p.role ? `${p.name} (${p.role})` : p.name).join('\n')
        return (
          <EditableCell
            open={open}
            onOpenChange={openChange(record._id, 'parties')}
            width={446}
            editor={<PartiesEditor value={parties} onCancel={close} onSave={v => saveField(record._id, 'parties', { parties: v })} />}
          >
            {parties.length
              ? (
                <TruncationTooltip title={tooltip} always disabled={open}>
                  <FullList items={[
                    ...parties.slice(0, VISIBLE_PARTIES).map(p => ({ key: p.id, content: p.name })),
                    ...(parties.length > VISIBLE_PARTIES
                      ? [{ key: 'more', content: <span style={{ color: colorPalette.neutral.darken2 }}>+{parties.length - VISIBLE_PARTIES}</span> }]
                      : []),
                  ]} />
                </TruncationTooltip>
              )
              : <Dash />}
          </EditableCell>
        )
      },
    },
    {
      title: t.fields.dates,
      key: 'dates',
      sorter: (a: MetadataDocument, b: MetadataDocument) => (tableDates(store.get(a).dates)[0]?.date ?? '9999').localeCompare(tableDates(store.get(b).dates)[0]?.date ?? '9999'),
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => {
        const all = store.get(record).dates
        const dates = tableDates(all)
        const open = isEditing(record._id, 'dates')
        const tooltip = dates.map(d => {
          const state = deadlineState(d, t)
          return `${d.label}: ${formatKeyDate(d, t)}${d.isDeadline && state.tone !== 'later' ? ` (${state.text})` : ''}`
        }).join('\n')
        return (
          <EditableCell
            open={open}
            onOpenChange={openChange(record._id, 'dates')}
            width={446}
            editor={
              // Edits only the key dates; reference dates (document date etc.) are kept as they are.
              <DatesEditor
                value={dates}
                onCancel={close}
                onSave={v => saveField(record._id, 'dates', {
                  dates: sortDates([...all.filter(d => !isKeyDate(d)), ...v.map(d => d.isDeadline || isPeriod(d) ? d : { ...d, isAction: true })]),
                })}
              />
            }
          >
            {dates.length
              ? (
                <TruncationTooltip title={tooltip} disabled={open}>
                  <FullList items={dates.map(d => ({
                    key: d.id,
                    // Wraps after the label if needed, never inside the date.
                    content: <>{d.label}: <span style={{ whiteSpace: 'nowrap' }}>{formatKeyDate(d, t)}</span></>,
                  }))} />
                </TruncationTooltip>
              )
              : <Dash />}
          </EditableCell>
        )
      },
    },
    ...extraColumns,
    {
      title: t.table.updated,
      key: 'uploadedDate',
      dataIndex: 'uploadedDate',
      width: 108,
      // Any ellipsis column switches antd to a fixed table layout, so the widths are honoured. It lives on
      // this always-one-line column so it doesn't stop the other cells from wrapping.
      ellipsis: { showTitle: false },
      sorter: (a: MetadataDocument, b: MetadataDocument) => a.uploadedDate.localeCompare(b.uploadedDate),
      onCell: rowStyle,
      render: (val: string) => <div style={{ ...cellText, whiteSpace: 'nowrap' }}>{shortDate(val, t)}</div>,
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      onCell: rowStyle,
      render: (_: unknown, record: MetadataDocument) => (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -6 }}>
          <Dropdown
            items={actions(record)}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
          </Dropdown>
        </div>
      ),
    },
  ]
  return columns
}

const SUMMARY_DOCS = 6

/** The documents privacy modal's points (the "Your data is private and secure" design for My Documents and workspaces); their text is in TEXT.privacy.points. */
const DOCUMENTS_PRIVACY_ICONS = [iconType.ShieldOutlined, iconType.LockOutlined, iconType.LayersHorOutlined, iconType.MinusCircleOutlined]

/** "Learn more" from the documents disclaimer: how uploaded documents are kept private and secure. */
function DocumentsPrivacyModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useText(TEXT)
  return (
    <Modal
      visible={visible}
      variant={modalVariants.DEFAULT}
      withIcon={false}
      title={t.privacy.title}
      onClose={onClose}
      footer={{ buttons: [{ variant: buttonVariants.PRIMARY, props: { children: t.common.close, onClick: onClose } }] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <Typography size="base-sm" color="neutral-darken5">{t.privacy.intro}</Typography>
        {t.privacy.points.map((point, i) => (
          <div key={point.title} style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(4) }}>
            <span style={{ flexShrink: 0, paddingTop: 2 }}><Icon type={DOCUMENTS_PRIVACY_ICONS[i] as never} size={20} color="neutral-darken5" /></span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography size="base-sm" color="neutral-darken5" weight="semibold">{point.title}</Typography>
              <Typography size="base-sm" color="neutral-darken5">{point.text}</Typography>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

/** Workspaces Basic's note under its document list (projects/workspaces/workspaces-basic), under every document list here too. */
function FilesDisclaimer() {
  const t = useText(TEXT)
  const [open, setOpen] = useState(false)
  return (
    <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: spacing(2) }}>
      <Icon type={iconType.ShieldCheckFilled} color="primary-base" size={16} />
      <Typography size="base-sm" color="neutral-darken2">
        {t.privacy.disclaimer}{' '}
        <span
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) } }}
          style={{ color: colorPalette.blue.base, textDecoration: 'underline', cursor: 'pointer' }}
        >{t.privacy.learnMore}</span>
      </Typography>
      <DocumentsPrivacyModal visible={open} onClose={() => setOpen(false)} />
    </div>
  )
}

/** The summary's Documents card: the latest few, with less than the full table — name, type, source and date. */
function SummaryDocuments({ docs, store, sourceOf, onOpenDoc, onUpload }: {
  docs: MetadataDocument[]
  store: MetadataStore
  sourceOf: (id: string) => DocSource
  onOpenDoc: (doc: MetadataDocument) => void
  onUpload: () => void
}) {
  const t = useText(TEXT)
  if (docs.length === 0) {
    return (
      <PreviewEmptyState
        preview={<DocumentsPreview />}
        title={t.cards.addDocsTitle}
        action={<ButtonSecondary leftIcon={iconType.UploadOutlined} onClick={onUpload}>{t.common.uploadOrSync}</ButtonSecondary>}
      />
    )
  }
  const latest = [...docs].sort((a, b) => b.uploadedDate.localeCompare(a.uploadedDate)).slice(0, SUMMARY_DOCS)
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {latest.map((doc, i) => {
        const type = store.get(doc).documentType || doc.documentType
        return (
          <div
            key={doc._id}
            className="v15-summary-doc"
            onClick={() => onOpenDoc(doc)}
            style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(3)}px ${spacing(2)}px`, margin: `0 -${spacing(2)}px`, borderTop: i === 0 ? undefined : `1px solid ${colorPalette.neutral.lighten2}`, cursor: 'pointer', borderRadius: 6 }}
          >
            <FileTypeIcon format={doc.fileFormat} size={20} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, lineHeight: '20px', fontWeight: 500, color: colorPalette.neutral.darken5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName(doc)}</div>
              {type && <div style={{ fontSize: 12, lineHeight: '18px', color: colorPalette.neutral.darken2 }}>{type}</div>}
            </div>
            <span style={{ display: 'inline-flex', flexShrink: 0 }}>{docSourceIcon(sourceOf(doc._id), 16, t.preview.manualUpload)}</span>
            <span style={{ width: 96, flexShrink: 0, textAlign: 'right', fontSize: 13, color: colorPalette.neutral.darken2, whiteSpace: 'nowrap' }}>{shortDate(doc.uploadedDate, t)}</span>
          </div>
        )
      })}
      <style>{`.v15-summary-doc:hover { background-color: ${colorPalette.blue.lighten5}; }`}</style>
      <div style={{ marginTop: spacing(4) }}><FilesDisclaimer /></div>
    </div>
  )
}

/** The summary's Guardrails card (secondary): how many are on, and the first few rules. */
function SummaryGuardrails({ guardrails, onAdd }: { guardrails: { id: string; text: string; enabled: boolean }[]; onAdd: () => void }) {
  const t = useText(TEXT)
  if (guardrails.length === 0) {
    return <PreviewEmptyState preview={<GuardrailsPreview />} title={t.cards.guardrailsEmptyTitle} text={t.cards.guardrailsEmptyText} action={<ButtonSecondary leftIcon={iconType.PlusOutlined} onClick={onAdd}>{t.cards.addGuardrail}</ButtonSecondary>} />
  }
  const active = guardrails.filter(g => g.enabled)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <span style={{ fontSize: 13, color: colorPalette.neutral.darken2 }}>{t.cards.activeOf(active.length, guardrails.length)}</span>
      {active.slice(0, 3).map(g => (
        <div key={g.id} style={{ display: 'flex', gap: spacing(2), alignItems: 'flex-start', fontSize: 13, lineHeight: '18px', color: colorPalette.neutral.darken4 }}>
          <span style={{ display: 'inline-flex', marginTop: 1 }}><Icon type={iconType.ShieldCheckOutlined} size={16} color="neutral-darken2" /></span>
          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{g.text}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Workspace summary ────────────────────────────────────────────────────────

// Kept calm on purpose: neutral greys throughout, with the app's blue only for actions and focus.
const AREA_ICONS: Record<WorkspaceArea, string> = {
  documents: iconType.FolderOutlined,
  context: iconType.InfoCircleOutlined,
  guardrails: iconType.ShieldCheckOutlined,
  bookmarks: iconType.BookmarkOutlined,
  templates: iconType.ArticleOutlined,
}

/** Summary header: back to Workspaces, the workspace's name, type chip (as on its list card) and description, and Ask CoPilot. */
function WorkspaceHero({ space, onBack, backLabel, onAskCopilot, onEdit, onDelete }: {
  space: Space
  onBack: () => void
  backLabel?: string
  // Left out on an empty workspace, which hides the button.
  onAskCopilot?: () => void
  // The "⋯" menu at the end of the header: Edit (the workspace's settings) and Delete (with a warning first).
  onEdit: () => void
  onDelete: () => void
}) {
  const t = useText(TEXT)
  return (
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <div style={{ marginLeft: -spacing(3) }}>
        <ButtonGhost leftIcon={iconType.ChevronLeftOutlined} onClick={onBack}>{backLabel ?? t.workspace.title}</ButtonGhost>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(4) }}>
        <Avatar shape={avatarShapeEnum.SQUARE} size={avatarSizeEnum.MEDIUM} src={space.avatarUrl} srcPlaceholder={getInitials(space.name)} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), minWidth: 0 }}>
            <Typography size="heading-xl" weight="bold" color="neutral-darken5">{space.name}</Typography>
          </div>
          {space.description && <Typography size="base" color="neutral-darken3">{space.description}</Typography>}
        </div>
        {/* The button's icon slot only takes DS icons, so the CoPilot mark sits in the label; it takes the label's colour. */}
        {onAskCopilot && (
          <ButtonPrimary onClick={onAskCopilot}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />{t.common.askCopilot}</span>
          </ButtonPrimary>
        )}
        {/* Same items and styling as a workspace card's menu on the Workspaces page. */}
        <Dropdown
          items={[
            { key: 'edit', label: <MenuLabel icon={iconType.EditOutlined}>{t.common.edit}</MenuLabel>, onClick: onEdit },
            { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />{t.common.delete}</span>, onClick: onDelete },
          ]}
          trigger={dropdownTriggers.CLICK}
          placement={dropdownPlacement.BOTTOM_RIGHT}
        >
          <ButtonTertiary shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} ariaLabel={t.workspace.actions} />
        </Dropdown>
      </div>
    </div>
  )
}

/** A white card on the summary: a title with an optional action on the right, then its content. */
// `secondary`: the summary's side column — tighter, on the light tint, with a smaller title.
function DossierCard({ title, action, gap = spacing(4), secondary = false, children }: { title: string; action?: ReactNode; gap?: number; secondary?: boolean; children: ReactNode }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: secondary ? spacing(3) : gap, padding: secondary ? spacing(5) : spacing(6),
      borderRadius: 12, border: `1px solid ${colorPalette.neutral.lighten2}`, backgroundColor: secondary ? colorPalette.neutral.lighten5 : colorPalette.white,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), minHeight: secondary ? 24 : 32 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {secondary
            ? <Typography size="base" weight="semibold" color="neutral-darken4">{title}</Typography>
            : <Typography size="heading-sm" weight="semibold" color="neutral-darken5">{title}</Typography>}
        </div>
        {action && <div style={{ marginRight: -spacing(3) }}>{action}</div>}
      </div>
      {children}
    </div>
  )
}

let profileDetailCounter = 0
const newDetailId = () => { profileDetailCounter += 1; return `detail-${Date.now()}-${profileDetailCounter}` }

/**
 * Edit profile, in a modal like Edit settings (SpaceFormModal): the workspace's background and details as
 * one draft, with Cancel and Save in the footer. Save keeps both (dropping empty detail rows); Cancel or
 * closing drops the changes. The draft starts over from the saved profile each time it opens.
 */
function ProfileModal({ open, space, details, onClose, onSave }: {
  open: boolean
  space: Space
  details: WorkspaceDetail[]
  onClose: () => void
  onSave: (background: string, details: WorkspaceDetail[]) => void
}) {
  const t = useText(TEXT)
  const p = t.profile
  const area = useArea()
  const [background, setBackground] = useState('')
  const [draftDetails, setDraftDetails] = useState<WorkspaceDetail[]>([])
  useEffect(() => {
    if (open) { setBackground(space.context ?? ''); setDraftDetails(details) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const updateDetail = (id: string, patch: Partial<WorkspaceDetail>) => setDraftDetails(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d))

  return (
    <Modal
      visible={open}
      title={p.title}
      withIcon={false}
      maxWidth={640}
      onClose={onClose}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: t.common.cancel, onClick: onClose } },
        { variant: buttonVariants.PRIMARY, props: { children: t.common.save, onClick: () => onSave(background.trim(), draftDetails.filter(d => d.label.trim() || d.value.trim())) } },
      ]}}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
        <TextArea
          label={p.background}
          description={area.profile.backgroundDescription}
          value={background}
          autoSize={{ minRows: 4, maxRows: 10 }}
          placeholder={area.profile.backgroundPlaceholder}
          onChange={e => setBackground(e.target.value)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          {/* Styled like the DS field label and description above (Background). */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography size="base" weight="semibold" color="neutral-darken5">{p.details}</Typography>
            <Typography size="base-sm" color="neutral-darken5">{area.profile.detailsDescription}</Typography>
          </div>
          {draftDetails.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 32px', gap: spacing(2), alignItems: 'center' }}>
              {draftDetails.map(d => (
                <Fragment key={d.id}>
                  <Input name={`${d.id}-label`} value={d.label} placeholder={area.profile.detailLabelPlaceholder} onChange={e => updateDetail(d.id, { label: e.target.value })} />
                  <Input name={`${d.id}-value`} value={d.value} placeholder={area.profile.detailValuePlaceholder} onChange={e => updateDetail(d.id, { value: e.target.value })} />
                  <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.TrashOutlined} onClick={() => setDraftDetails(prev => prev.filter(x => x.id !== d.id))} ariaLabel={p.removeDetail} />
                </Fragment>
              ))}
            </div>
          )}
          <div style={{ marginLeft: -spacing(3) }}>
            <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={() => setDraftDetails(prev => [...prev, { id: newDetailId(), label: '', value: '' }])}>{p.addDetail}</ButtonGhost>
          </div>
        </div>
      </div>
    </Modal>
  )
}

/** A fact about the client. */
type ProfileFact = { label: string; value: string }

/** The Profile card's content: the workspace's background, then its details in columns. */
function ProfileBody({ space, extras, onAdd }: { space: Space; extras: WorkspaceExtras; onAdd: () => void }) {
  const t = useText(TEXT)
  const facts: ProfileFact[] = extras.details.filter(d => d.label.trim() && d.value.trim())
  const background = space.context?.trim()
  if (!background && facts.length === 0) {
    return <PreviewEmptyState preview={<ProfilePreview />} title={t.cards.profileEmptyTitle} action={<ButtonSecondary leftIcon={iconType.PlusOutlined} onClick={onAdd}>{t.cards.addProfile}</ButtonSecondary>} />
  }
  return (
    <>
      {background && <Typography size="base" color="neutral-darken5">{background}</Typography>}
      {facts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 196px)', rowGap: 18 }}>
          {facts.map(fact => (
            <div key={fact.label} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              {/* The Guardrails card's "x of x active" style (as in Version 18). */}
              <span style={{ fontSize: 13, color: colorPalette.neutral.darken2 }}>{fact.label}</span>
              <Typography size="base" weight="semibold" color="neutral-darken5">{fact.value}</Typography>
            </div>
          ))}
        </div>
      )}
    </>
  )
}



/** One knowledge stream: an icon, title and line about it, an optional action, then its content. */
/** Empty state inside a knowledge card: a dashed box with a headline and one line, centred. */
function formatCreated(ts: number, t: Text) {
  const d = new Date(ts)
  return d.toDateString() === new Date().toDateString() ? t.dates.today : shortDate(d.toISOString(), t)
}

/**
 * The summary cards' empty states (FigJam "W2"): a faded preview of what the card will hold, fading out
 * downwards, then the title, description and action. The fade is a mask, so it works on the white cards
 * and the tinted side cards alike.
 */
function PreviewEmptyState({ preview, title, text, extra, action }: { preview: ReactNode; title?: string; text?: string; extra?: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div aria-hidden style={{
        alignSelf: 'stretch', pointerEvents: 'none',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 30%, transparent)', maskImage: 'linear-gradient(to bottom, #000 30%, transparent)',
      }}>{preview}</div>
      <div style={{ marginTop: -spacing(4), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(1), maxWidth: 520, textAlign: 'center' }}>
        {title && <Typography size="base" weight="semibold" color="neutral-darken5" align="center">{title}</Typography>}
        {text && <Typography size="base-sm" color="neutral-darken2" align="center">{text}</Typography>}
        {extra && <div style={{ marginTop: spacing(3) }}>{extra}</div>}
        {action && <div style={{ marginTop: spacing(3), display: 'flex', gap: spacing(2), flexWrap: 'wrap', justifyContent: 'center' }}>{action}</div>}
      </div>
    </div>
  )
}

/** "Try asking: …" — an example question as plain text under the heading. */
function TryAsking({ question }: { question: string }) {
  const t = useText(TEXT)
  return (
    <Typography size="base-sm" color="neutral-darken2" align="center">
      <span style={{ fontWeight: 600 }}>{t.cards.tryAsking}</span> “{question}”
    </Typography>
  )
}

// Skeleton colours, from the neutral palette: lighten-4 on the white cards (Profile, Documents),
// lighten-3 on the tinted side cards.
const SKELETON_ON_WHITE = colorPalette.neutral.lighten4
const SKELETON_ON_TINT = colorPalette.neutral.lighten3
// The examples' wording and icons, in the same palette.
const PREVIEW_TEXT = colorPalette.neutral.lighten1

/** A grey placeholder line for the previews. */
function PreviewBar({ width, height = 10, color }: { width: number | string; height?: number; color: string }) {
  return <div style={{ width, height, borderRadius: height / 2, backgroundColor: color }} />
}

// The area's example labels (`workspaces.profileLabels`), shown faintly in the empty Profile card.
function ProfilePreview() {
  const { workspaces } = useArea()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${spacing(4)}px ${spacing(4)}px`, paddingBottom: spacing(6) }}>
      {workspaces.profileLabels.map(label => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
          <span style={{ fontSize: 12, color: PREVIEW_TEXT }}>{label}</span>
          <PreviewBar width="70%" color={SKELETON_ON_WHITE} />
        </div>
      ))}
    </div>
  )
}

function DocumentsPreview() {
  return (
    <div style={{ paddingBottom: spacing(6) }}>
      {(['pdf', 'docx', 'xlsx'] as const).map((format, i) => (
        <div key={format} style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(2)}px 0`, borderTop: i ? `1px solid ${SKELETON_ON_WHITE}` : undefined }}>
          <span style={{ display: 'inline-flex', opacity: 0.4, filter: 'grayscale(1)' }}><FileTypeIcon format={format} size={20} /></span>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <PreviewBar width="55%" color={SKELETON_ON_WHITE} />
            <PreviewBar width="25%" height={8} color={SKELETON_ON_WHITE} />
          </div>
          <PreviewBar width={72} height={8} color={SKELETON_ON_WHITE} />
        </div>
      ))}
    </div>
  )
}

// The area's example rules (`workspaces.previewGuardrails`), shown faintly in the empty Guardrails card.
function GuardrailsPreview() {
  const { workspaces } = useArea()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2), paddingBottom: spacing(6) }}>
      {workspaces.previewGuardrails.map(rule => (
        <div key={rule} style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <span style={{ display: 'inline-flex', color: PREVIEW_TEXT }}><Icon type={iconType.ShieldCheckOutlined} size={16} color="inherit" /></span>
          <span style={{ fontSize: 13, color: PREVIEW_TEXT }}>{rule}</span>
        </div>
      ))}
    </div>
  )
}

function UsedInPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(3), paddingBottom: spacing(6) }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: SKELETON_ON_TINT }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <PreviewBar width="75%" color={SKELETON_ON_TINT} />
            <PreviewBar width="35%" height={8} color={SKELETON_ON_TINT} />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * No results for a search or filter: just text — no illustration or icon — with an optional "Clear filters and
 * search" link.
 */
function NoResults({ title, text, onClear }: { title: string; text: string; onClear?: () => void }) {
  const t = useText(TEXT)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(1), padding: `${spacing(10)}px ${spacing(4)}px`, textAlign: 'center' }}>
      <Typography size="base" weight="semibold" color="neutral-darken5" align="center">{title}</Typography>
      <Typography size="base-sm" color="neutral-darken2" align="center">{text}</Typography>
      {onClear && (
        <button type="button" onClick={onClear} style={{ marginTop: spacing(2), padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: colorPalette.blue.base }}>
          {t.common.clearFiltersAndSearch}
        </button>
      )}
    </div>
  )
}

function DashedEmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing(1), padding: spacing(6), borderRadius: 8, border: `1px dashed ${colorPalette.neutral.lighten1}` }}>
      <Typography size="base" weight="semibold" color="neutral-darken5" align="center">{title}</Typography>
      <Typography size="base-sm" color="neutral-darken2" align="center">{text}</Typography>
      {action && <div style={{ marginTop: spacing(3), display: 'flex', gap: spacing(2), flexWrap: 'wrap', justifyContent: 'center' }}>{action}</div>}
    </div>
  )
}

/**
 * The card footer in Version 4: what's in the workspace as [icon][count] pairs, using the same icons
 * as the workspace page — documents, guardrails and bookmarks, then the Haufe apps it's been used in.
 * Everything is one neutral grey; the apps' marks drop their pink tiles to match. A pair only shows
 * once there's something to count, and hovering one says what it is.
 */
/**
 * Beside CoPilot: kept quiet — a small card, level with the top of the chat, with the workspace's documents and
 * guardrails as on its list card (hover for detail) and an icon button into it.
 */
function CopilotWorkspaceSummary({ space, docs, extras, onOpen }: { space: Space; docs: MetadataDocument[]; extras: WorkspaceExtras; onOpen: () => void }) {
  const t = useText(TEXT)
  // Nothing in it yet (as the workspace page's empty state decides): the card invites you to add context instead.
  const isEmpty = docs.length === 0 && !space.context?.trim() && extras.details.length === 0 && extras.guardrails.length === 0
  return (
    // The whole card opens the workspace (DS ClickableContainer, solid rather than dashed); the chevron says so.
    // Sticky, so it stays in the top right while the chat scrolls.
    <div className="copilot-ws-summary" style={{ width: isEmpty ? 280 : 240, flexShrink: 0, alignSelf: 'flex-start', margin: spacing(4), position: 'sticky', top: spacing(4), zIndex: 1 }}>
      <style>{`.copilot-ws-summary > * { border-radius: 12px; }`}</style>
      <ClickableContainer as="div" dashed={false} width="expanded" onClick={onOpen}>
        {isEmpty ? (
          // A new workspace: what to add and why, and Add context (the card opens the workspace to add it).
          <div style={{ width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: spacing(3), padding: `${spacing(3)}px ${spacing(4)}px ${spacing(4)}px`, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              <div style={{ flex: 1 }}><Typography size="base-sm" weight="semibold" color="neutral-darken2">{t.inWorkspace.title}</Typography></div>
              <Icon type={iconType.ChevronRightOutlined} size={16} color="neutral-darken3" />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing(3) }}>
              <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 8, backgroundColor: colorPalette.blue.lighten5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* The Workspaces empty state's "Your workspace" icon, in the CoPilot blue. */}
                <span aria-hidden style={{ width: 18, height: 18, backgroundColor: colorPalette.blue.base, WebkitMask: `url(${EMPTY_STATE_ICONS}/your-workspace.svg) center / contain no-repeat`, mask: `url(${EMPTY_STATE_ICONS}/your-workspace.svg) center / contain no-repeat` }} />
              </span>
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
                <Typography size="base" weight="semibold" color="neutral-darken5">{t.inWorkspace.addYourContext}</Typography>
                <Typography size="base-sm" color="neutral-darken3">{t.inWorkspace.addYourContextText}</Typography>
                <span style={{ marginTop: spacing(2), display: 'inline-flex', alignItems: 'center', gap: spacing(1), fontSize: 14, fontWeight: 600, color: colorPalette.blue.base }}>
                  <Icon type={iconType.PlusOutlined} size={16} color="blue-base" />{t.inWorkspace.addContext}
                </span>
              </div>
            </div>
          </div>
        ) : (
        <div style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: spacing(2), padding: `${spacing(3)}px ${spacing(4)}px`, textAlign: 'left' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: spacing(2) }}>
            <Typography size="base-sm" weight="semibold" color="neutral-darken2">{t.inWorkspace.title}</Typography>
            <CardSummary space={space} docs={docs} extras={extras} contentOnly />
          </div>
          <Icon type={iconType.ChevronRightOutlined} size={16} color="neutral-darken3" />
        </div>
        )}
      </ClickableContainer>
    </div>
  )
}

function CardSummary({ space, docs, extras, contentOnly = false }: { space: Space; docs: MetadataDocument[]; extras: WorkspaceExtras; contentOnly?: boolean }) {
  const t = useText(TEXT)
  const bySource = new Map<DocSource, number>()
  computeDocSourceMap(docs, space).forEach(source => bySource.set(source, (bySource.get(source) ?? 0) + 1))
  // Connected apps first, uploads last.
  const sources = [...new Set<DocSource>([...space.connectors.map(c => c.type), 'local'])]
    .filter(source => bySource.has(source))
    .map(source => source === 'local' ? t.inWorkspace.uploaded(bySource.get(source) ?? 0) : t.inWorkspace.fromApp(bySource.get(source) ?? 0, connectorLabel(source)))
  const activeGuardrails = extras.guardrails.filter(g => g.enabled).length
  const areaIcon = (area: WorkspaceArea) => <Icon type={AREA_ICONS[area] as never} size={16} color="neutral-darken3" />

  type Stat = { key: string; icon: ReactNode; count: number; title: string; description: string }
  const content: Stat[] = [
    { key: 'documents', icon: <DocumentsIcon />, count: docs.length, title: t.common.documents(docs.length), description: sources.join(' · ') },
    { key: 'guardrails', icon: areaIcon('guardrails'), count: extras.guardrails.length, title: t.inWorkspace.guardrails(extras.guardrails.length), description: t.inWorkspace.active(activeGuardrails) },
  ]
  const apps: Stat[] = [
    { key: 'copilot', icon: <CopilotIcon />, count: extras.chats.length, title: 'CoPilot', description: t.inWorkspace.chatsInWorkspace(extras.chats.length) },
  ]
  // contentOnly (beside CoPilot): just documents and guardrails, without the apps it's been used in.
  const groups = (contentOnly ? [content] : [content, apps]).map(group => group.filter(stat => stat.count > 0)).filter(group => group.length > 0)
  if (groups.length === 0) return <span style={{ fontSize: 13, color: colorPalette.neutral.darken2 }}>{t.inWorkspace.nothingYet}</span>

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3), color: colorPalette.neutral.darken3 }}>
      {groups.map((group, i) => (
        <Fragment key={i}>
          {/* Content on the left, the apps it's been used in on the right of a thin divider. */}
          {i > 0 && <span aria-hidden style={{ width: 1, height: 16, backgroundColor: colorPalette.neutral.lighten2 }} />}
          {group.map(stat => (
            <Tooltip key={stat.key} title={stat.title} description={stat.description} size={tooltipSizes.LARGE} placement={tooltipPlacements.TOP}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(1), cursor: 'default' }}>
                {stat.icon}
                <span style={{ fontSize: 13, fontWeight: 600 }}>{stat.count}</span>
              </span>
            </Tooltip>
          ))}
        </Fragment>
      ))}
    </div>
  )
}

/**
 * When the workspace last changed, beside the type chip on its card: "Updated 2 days ago". It's the
 * newest of its documents and CoPilot chats; the tooltip gives the date and what it was.
 */
function LastUpdated({ docs, extras, change }: { docs: MetadataDocument[]; extras: WorkspaceExtras; change?: SpaceChange }) {
  const t = useText(TEXT)
  const changes = [
    // The workspace's own changes (created, settings, profile, guardrails), so an empty one still shows a time.
    ...(change ? [change] : []),
    ...docs.map(doc => ({ at: new Date(doc.uploadedDate).getTime(), what: t.lastUpdated.documentAdded(doc.name) })),
    ...extras.chats.map(chat => ({ at: chat.createdAt, what: t.lastUpdated.copilotChat(chat.title) })),
  ]
  if (changes.length === 0) return null
  const latest = changes.reduce((a, b) => (b.at > a.at ? b : a))
  return (
    <Tooltip title={shortDate(new Date(latest.at).toISOString(), t)} description={latest.what} size={tooltipSizes.LARGE} placement={tooltipPlacements.TOP}>
      <span style={{ fontSize: 12, color: colorPalette.neutral.darken2, whiteSpace: 'nowrap', cursor: 'default' }}>
        {t.lastUpdated.updated(updatedAgo(latest.at, t))}
      </span>
    </Tooltip>
  )
}

/** "today", "yesterday", "3 days ago", "2 weeks ago", then the date once it's over a month. */
function updatedAgo(ts: number, t: Text) {
  const days = daysSince(ts)
  if (days <= 0) return t.lastUpdated.today
  if (days === 1) return t.lastUpdated.yesterday
  if (days < 14) return t.lastUpdated.daysAgo(days)
  if (days < 31) return t.lastUpdated.weeksAgo(Math.floor(days / 7))
  return t.lastUpdated.on(shortDate(new Date(ts).toISOString(), t))
}


// ─── Haufe content ────────────────────────────────────────────────────────────

type HaufeKind = 'chat'

// Each kind's label is in TEXT.activity (e.g. "CoPilot chat").
const HAUFE_KINDS: Record<HaufeKind, { icon: string }> = {
  chat: { icon: iconType.CommentOutlined },
}

type HaufeItem = { id: string; kind: HaufeKind; title: string; source: string; date: string }


/**
 * What's been made with Haufe for this workspace: its CoPilot chats. With none yet the card shows the empty state.
 */
function HaufeContent({ chats, onAskCopilot, onOpenChat, onAskCopilotEmpty, spaceName }: {
  onAskCopilotEmpty: () => void
  // For the empty state's example question.
  spaceName: string
  chats: WorkspaceChat[]
  onAskCopilot: (initialQuestion?: string) => void
  onOpenChat: (chatId: string) => void
}) {
  const t = useText(TEXT)
  const { workspaces } = useArea()
  const newestFirst = <T extends { createdAt: number }>(items: T[]) => [...items].sort((a, b) => b.createdAt - a.createdAt)
  const chatItems: HaufeItem[] = newestFirst(chats).map(c => ({ id: c.id, kind: 'chat', title: c.title, source: 'CoPilot', date: formatCreated(c.createdAt, t) }))
  if (chatItems.length === 0) {
    return (
      <PreviewEmptyState
        preview={<UsedInPreview />}
        title={t.cards.usedInEmptyTitle}
        // An example question to start with (FigJam "W4"), from the subject area.
        extra={<TryAsking question={workspaces.tryAsking(spaceName)} />}
        action={<ButtonSecondary onClick={onAskCopilotEmpty}><span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />{t.common.askCopilot}</span></ButtonSecondary>}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
      {chatItems.length > 0 && <AppContainer
        icon={<AppTile app="copilot" />}
        name="CoPilot"
        countLabel={t.activity.chats(chatItems.length)}
        items={chatItems}
        openLabel={t.activity.openCopilot}
        onOpen={() => onAskCopilot()}
        onOpenItem={item => onOpenChat(item.id)}
      />}
    </div>
  )
}

function daysSince(ts: number) {
  const startOfDay = (t: number) => new Date(new Date(t).toDateString()).getTime()
  return Math.round((startOfDay(Date.now()) - startOfDay(ts)) / 86400000)
}

type ActivityApp = 'copilot'

// The Used in page's column: centred, straight on the page.
const ACTIVITY_COLUMN: CSSProperties = { width: '100%', maxWidth: 760, margin: '0 auto' }

const ACTIVITY_APPS: Record<ActivityApp, { name: string; icon: ReactNode }> = {
  copilot: { name: 'CoPilot', icon: <CopilotIcon /> },
}

/** When an item happened, as the heading of its group. */
function activityPeriod(ts: number, t: Text) {
  const days = daysSince(ts)
  if (days <= 0) return t.dates.today
  if (days === 1) return t.dates.yesterday
  if (days < 7) return t.dates.last7
  if (days < 31) return t.dates.last30
  return new Date(ts).toLocaleDateString(t.dates.locale, { month: 'long', year: 'numeric' })
}

/**
 * The Used in page (the card's View all): everything made with Haufe apps in this workspace in one timeline,
 * newest first — where the Used in card only previews three per app. Tabs narrow it to one app and the search box (beside the
 * page title) to items whose title, app or type matches (the tab counts follow the search); items are grouped by when they
 * happened, and open in their app as on the card.
 */
function AllActivity({ search, chats, onOpenChat }: {
  // From the search box beside the page title.
  search: string
  chats: WorkspaceChat[]
  onOpenChat: (chatId: string) => void
}) {
  const t = useText(TEXT)
  const allItems = [
    ...chats.map(c => ({ app: 'copilot' as const, at: c.createdAt, item: { id: c.id, kind: 'chat' as const, title: c.title, source: 'CoPilot', date: formatCreated(c.createdAt, t) } })),
  ].sort((a, b) => b.at - a.at)
  const query = search.trim().toLowerCase()
  const items = allItems.filter(i => !query || [i.item.title, ACTIVITY_APPS[i.app].name, t.activity.chat].some(text => text.toLowerCase().includes(query)))
  const shown = items
  const groups: { period: string; entries: typeof shown }[] = []
  shown.forEach(entry => {
    const period = activityPeriod(entry.at, t)
    const last = groups[groups.length - 1]
    if (last?.period === period) last.entries.push(entry)
    else groups.push({ period, entries: [entry] })
  })
  const open = (entry: (typeof allItems)[number]) => onOpenChat(entry.item.id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
      {shown.length === 0 ? (
        query
          ? <NoResults title={t.activity.noMatchTitle} text={t.activity.noMatchText(search.trim())} />
          : <DashedEmptyState title={t.activity.emptyTitle} text={t.activity.emptyText} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(5) }}>
          {groups.map(group => (
            <div key={group.period} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Same type as the app titles on the Used in card. */}
              <span style={{ fontSize: 12, fontWeight: 600, color: colorPalette.neutral.darken2, padding: `0 0 ${spacing(1)}px ${spacing(2)}px` }}>{group.period}</span>
              {group.entries.map((entry, i) => (
                <HaufeRow
                  key={entry.item.id}
                  item={entry.item}
                  first={i === 0}
                  closed={i === group.entries.length - 1}
                  icon={<span style={{ display: 'inline-flex', width: 20, justifyContent: 'center', color: colorPalette.neutral.darken3 }}>{ACTIVITY_APPS[entry.app].icon}</span>}
                  meta={`${ACTIVITY_APPS[entry.app].name} · ${t.activity.chat} · ${entry.item.date}`}
                  onOpen={() => open(entry)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * One Haufe application's share of the workspace, in a light container: a small label with the app and
 * its count plus a way into the app, then the latest three as plain rows like the In this workspace list.
 */
/**
 * An app's mark on a tile, so each Used in group is recognisable at a glance. Neutral for now — a light grey tile
 * with the app's glyph in grey — rather than the apps' own colours.
 */
function AppTile({ app }: { app: ActivityApp }) {
  return (
    <span style={{
      width: 24, height: 24, flexShrink: 0, borderRadius: 4, backgroundColor: colorPalette.neutral.lighten3, color: colorPalette.neutral.darken3,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {ACTIVITY_APPS[app].icon}
    </span>
  )
}

// `divided`: a line and some room above every group after the first, so the apps read as separate sections.
function AppContainer({ icon, name, countLabel, items, openLabel, onOpen, onOpenItem, divided = false }: {
  divided?: boolean
  icon: ReactNode
  name: string
  // How many there are, e.g. "3 chats".
  countLabel: string
  items: HaufeItem[]
  openLabel: string
  onOpen: () => void
  onOpenItem: (item: HaufeItem) => void
}) {
  return (
    // No outline of its own: the app's label and rows sit straight on the card, nudged out so the text lines up with the card title.
    <div style={{
      display: 'flex', flexDirection: 'column', margin: `0 -${spacing(2)}px`,
      ...(divided ? { borderTop: `1px solid ${colorPalette.neutral.lighten2}`, paddingTop: spacing(4) } : {}),
    }}>
      {/* The app on one line — its logo, name (cut short if it must), how many, then an icon button into the app. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), minHeight: 32, padding: `0 0 ${spacing(2)}px ${spacing(2)}px`, color: colorPalette.neutral.darken3 }}>
        <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>
        <span style={{ minWidth: 0, fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        <span style={{ flexShrink: 0, fontSize: 12, color: colorPalette.neutral.darken2, whiteSpace: 'nowrap' }}>{countLabel}</span>
        <span style={{ flex: 1 }} />
        <Tooltip title={openLabel} placement={tooltipPlacements.TOP}>
          <span style={{ display: 'inline-flex' }}>
            <ButtonGhost size={buttonSizes.SMALL} shape={buttonShapes.SQUARE} leftIcon={iconType.ExternalLinkOutlined} onClick={onOpen} ariaLabel={openLabel} />
          </span>
        </Tooltip>
      </div>
      {items.slice(0, 3).map((item, i) => (
        <HaufeRow key={item.id} item={item} first={i === 0} onOpen={() => onOpenItem(item)} />
      ))}
    </div>
  )
}

/**
 * A row like KnowledgeRow: the kind's icon, the title, then kind · date, and a chevron. The Used in page swaps
 * in the app's icon and "App · kind · date", since its rows mix apps.
 */
// `closed`: a stroke under the row too, so every group on the Used in page ends on one — single rows included.
function HaufeRow({ item, first, closed = false, onOpen, icon, meta }: { item: HaufeItem; first: boolean; closed?: boolean; onOpen?: () => void; icon?: ReactNode; meta?: string }) {
  const t = useText(TEXT)
  const [hovered, setHovered] = useState(false)
  const kind = HAUFE_KINDS[item.kind]
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => { if (onOpen && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpen() } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(3)}px ${spacing(2)}px`, cursor: 'pointer',
        borderTop: first ? undefined : `1px solid ${colorPalette.neutral.lighten3}`,
        borderBottom: closed ? `1px solid ${colorPalette.neutral.lighten3}` : undefined,
        backgroundColor: hovered ? colorPalette.neutral.lighten5 : undefined,
      }}
    >
      {icon ?? <Icon type={kind.icon as never} size={20} color="neutral-darken3" />}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
        <span style={{ fontSize: 12, color: colorPalette.neutral.darken2 }}>{meta ?? `${t.activity.copilotChat} · ${item.date}`}</span>
      </div>
      <Icon type={iconType.ChevronRightOutlined} size={16} color={hovered ? 'blue-base' : 'neutral-darken2'} />
    </div>
  )
}

function MenuLabel({ icon, children }: { icon: string; children: ReactNode }) {
  return <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={icon as never} size={16} />{children}</span>
}

// ─── Document preview ─────────────────────────────────────────────────────────
// Layout from the "Metadata" Figma (node 2352:49615): dark top bar, the document in a
// card on the left, and a 512px "Document Details" card on the right, regrouped the same
// way as Version 10 (see ViewPanel). The edit button in the card header turns it into a
// form with Cancel / Save.

const TOP_BAR_BG = '#2f384a'
const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)
/**
 * Seeds a document's summary: its own opening sentences (see summaries.ts), then what the
 * extracted parties and dates say, as prose.
 * Only used to create the sample data — after that the summary is plain text the user can edit.
 */
function composeSummary(openings: string[], m: Pick<ExtractedMetadata, 'parties' | 'dates'>, t: Text): string {
  const dates = tableDates(m.dates)
  const sentences = openings.filter(Boolean).map(text => `${text.replace(/\.$/, '')}.`)

  const parties = m.parties.map(p => p.role ? t.composed.party(p.name, p.role) : p.name)
  if (parties.length) sentences.push(t.composed.involves(parties))

  const period = dates.find(isPeriod)
  if (period) sentences.push(t.composed.covers(formatKeyDate(period, t)))
  dates.filter(d => d.isDeadline).slice(0, 2).forEach(d => sentences.push(t.composed.deadline(d.label, formatKeyDate(d, t))))
  dates.filter(d => !d.isDeadline && !isPeriod(d)).forEach(d => {
    sentences.push(d.date ? t.composed.action(d.label, formatKeyDate(d, t)) : t.composed.notYet(d.label))
  })
  // Whole sentences only, within the preview's limit.
  return sentences.reduce((text, next) => !text ? next : `${text} ${next}`.length <= SUMMARY_MAX ? `${text} ${next}` : text, '')
}

function DocumentPreview({ space, workspaceLabel, doc, store, source, docIndex, onBack, onDelete }: {
  space: Space
  // What the Workspace detail says — My Documents lists every workspace the document is in.
  workspaceLabel?: string
  doc: MetadataDocument
  store: MetadataStore
  source: DocSource
  docIndex: number
  onBack: () => void
  onDelete: () => void
}) {
  const t = useText(TEXT)
  const isLoading = useMountLoading(1500)
  // Non-null while the details card is in edit mode.
  const [draft, setDraft] = useState<ExtractedMetadata | null>(null)
  // Set once Save is pressed, so required-field errors only appear after a save attempt.
  const [triedSave, setTriedSave] = useState(false)
  const meta = store.get(doc)
  const filename = `${stripYear(doc.name)}.${doc.fileFormat.toLowerCase()}`

  const startEdit = () => { setTriedSave(false); setDraft({ ...meta, parties: meta.parties.map(p => ({ ...p })), dates: sortDates(meta.dates) }) }
  const cancelEdit = () => setDraft(null)
  const saveEdit = () => {
    if (!draft) return
    if (!draft.documentType.trim()) { setTriedSave(true); return }
    const next: Pick<ExtractedMetadata, FieldKey> = {
      documentType: draft.documentType.trim(),
      matterReference: draft.matterReference.trim(),
      summary: draft.summary.trim(),
      parties: cleanParties(draft.parties),
      dates: cleanDates(draft.dates, t),
    }
    // Only fields that actually changed get marked as edited.
    ;(Object.keys(next) as FieldKey[]).forEach(field => {
      if (JSON.stringify(next[field]) !== JSON.stringify(meta[field])) store.update(doc._id, field, { [field]: next[field] })
    })
    setDraft(null)
  }

  const card: React.CSSProperties = { backgroundColor: colorPalette.white, borderRadius: 16, padding: spacing(4), border: `1px solid ${colorPalette.neutral.lighten2}` }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: CONTENT_BG }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: TOP_BAR_BG, boxShadow: '0 4px 4px rgba(130, 138, 155, 0.2)', padding: `0 ${spacing(4)}px`, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <ButtonGhost mode="contrast" leftIcon={iconType.ChevronLeftOutlined} onClick={onBack}>{t.common.back}</ButtonGhost>
        <Typography weight="bold" color="white">{filename}</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          <ButtonTertiary mode="contrast">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />{t.common.askCopilot}<Icon type={iconType.ExternalLinkOutlined} size={16} /></span>
          </ButtonTertiary>
          <Dropdown
            items={[
              { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />{t.common.download}</span>, onClick: () => {} },
              { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />{t.common.delete}</span>, onClick: onDelete },
            ]}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonTertiary mode="contrast" shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
          </Dropdown>
        </div>
      </div>

      <div style={{ flex: 1, padding: spacing(6), display: 'flex', gap: spacing(4), alignItems: 'flex-start' }}>
        <div style={{ ...card, flex: 1, minWidth: 0, minHeight: 640 }}>
          {isLoading
            ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '60%' }} paragraph={{ rows: 16 }} />
            : <GeneratedDocumentBody doc={doc} meta={store.getOriginal(doc)} />}
        </div>

        <div style={{ ...card, width: 512, flexShrink: 0 }}>
          {isLoading ? (
            <Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 10 }} />
          ) : draft ? (
            <EditPanel doc={doc} draft={draft} showErrors={triedSave} onChange={setDraft} onSave={saveEdit} onCancel={cancelEdit} />
          ) : (
            <ViewPanel doc={doc} space={space} workspaceLabel={workspaceLabel} meta={meta} source={source} docIndex={docIndex} onEdit={startEdit} />
          )}
        </div>
      </div>
    </div>
  )
}

/** A titled block in the details card; sections are separated by a divider. */
function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
      <Typography size="base-sm" weight="semibold" color="neutral-darken2" uppercase>{title}</Typography>
      {children}
    </section>
  )
}

/** Label/value rows that share one 124px label column across the whole card, so every value lines up. */
function DetailRows({ rows }: { rows: { key: string; label: string; value: ReactNode }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '124px minmax(0, 1fr)', columnGap: spacing(2), rowGap: spacing(2) }}>
      {rows.map(r => (
        <Fragment key={r.key}>
          <span style={{ ...cellText, color: colorPalette.neutral.darken2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
          <div style={{ ...cellText, wordBreak: 'break-word' }}>{r.value}</div>
        </Fragment>
      ))}
    </div>
  )
}

const FILE_LABEL = { size: 'base' as const, color: 'neutral-darken2' as const, width: '124px' }
const FILE_VALUE = { size: 'base' as const, color: 'neutral-darken5' as const }

/** A file detail as a horizontal PropertyItem, its label in the same 124px column as the rows above. */
function FileDetail({ label, children }: { label: string; children: ReactNode }) {
  return <PropertyItem label={label} value={children} variant={propertyItemVariants.HORIZONTAL} labelProps={FILE_LABEL} valueProps={FILE_VALUE} />
}

const Divider = () => <div style={{ borderTop: `1px solid ${colorPalette.neutral.lighten3}` }} />

/**
 * The details card (same design as Version 10) — same information as the Figma card, regrouped:
 * the summary, then Matter reference, Parties, Dates and File, each under a small heading. Parties and dates use the
 * table's role/type-beside-value layout; File lists horizontal property items (Name, Type, Format
 * with the file-type icon, Size, Uploaded, Updated, Status, Source, Space).
 */
function ViewPanel({ doc, space, workspaceLabel, meta, source, docIndex, onEdit }: {
  doc: MetadataDocument
  space: Space
  workspaceLabel?: string
  meta: ExtractedMetadata
  source: DocSource
  docIndex: number
  onEdit: () => void
}) {
  const t = useText(TEXT)
  const dates = tableDates(meta.dates)
  // Same sync time as the table's Status tooltip; the upload itself happened a little before the last update.
  const hours = (docIndex % 5) + 1
  const uploaded = new Date(new Date(doc.uploadedDate).getTime() - (((docIndex * 7) % 20) + 2) * DAY_MS).toISOString().slice(0, 10)
  const dash = <span style={{ color: colorPalette.neutral.darken2 }}>-</span>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">{t.preview.details}</Typography>
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.EditOutlined} onClick={onEdit} />
      </div>

      {meta.summary
        ? <div style={{ ...cellText, lineHeight: '22px' }}>{meta.summary}</div>
        : <div style={{ ...cellText, color: colorPalette.neutral.darken2 }}>{t.preview.noSummary}</div>}

      <Divider />

      <DetailSection title={t.fields.matterReference}>
        {meta.matterReference ? <div style={cellText}>{meta.matterReference}</div> : dash}
      </DetailSection>

      <Divider />

      <DetailSection title={t.fields.parties}>
        {meta.parties.length
          ? <DetailRows rows={meta.parties.map(p => ({ key: p.id, label: p.role || '—', value: p.name }))} />
          : dash}
      </DetailSection>

      <Divider />

      <DetailSection title={t.fields.dates}>
        {dates.length
          ? <DetailRows rows={dates.map(d => ({ key: d.id, label: d.label, value: formatKeyDate(d, t) }))} />
          : dash}
      </DetailSection>

      <Divider />

      <DetailSection title={t.preview.file}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
          <FileDetail label={t.preview.name}>{`${stripYear(doc.name)}.${doc.fileFormat.toLowerCase()}`}</FileDetail>
          <FileDetail label={t.preview.type}>{meta.documentType || dash}</FileDetail>
          <FileDetail label={t.preview.format}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(1) }}>
              <FileTypeIcon format={doc.fileFormat} size={20} />
              {doc.fileFormat}
            </span>
          </FileDetail>
          <FileDetail label={t.preview.size}>{doc.fileSize}</FileDetail>
          <FileDetail label={t.preview.uploaded}>{shortDate(uploaded, t)}</FileDetail>
          <FileDetail label={t.preview.updated}>{shortDate(doc.uploadedDate, t)}</FileDetail>
          <FileDetail label={t.preview.status}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(1) }}>
              <Icon type={iconType.CheckCircleFilled} size={16} color="success-base" />
              {source === 'local' ? t.table.upToDate : t.preview.upToDateSynced(hours)}
            </span>
          </FileDetail>
          <FileDetail label={t.preview.source}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(1), maxWidth: '100%' }}>
              {docSourceIcon(source, 16, t.preview.manualUpload, source !== 'local' ? spaceConnectorLabel(space, source) : undefined)}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source === 'local' ? t.preview.manualUpload : spaceConnectorLabel(space, source)}</span>
            </span>
          </FileDetail>
          <FileDetail label={workspaceLabel?.includes(',') ? t.preview.workspaces : t.preview.workspace}>{workspaceLabel ?? space.name}</FileDetail>
        </div>
      </DetailSection>
    </div>
  )
}

function EditPanel({ doc, draft, showErrors, onChange, onSave, onCancel }: {
  doc: MetadataDocument
  draft: ExtractedMetadata
  showErrors: boolean
  onChange: (next: ExtractedMetadata) => void
  onSave: () => void
  onCancel: () => void
}) {
  const t = useText(TEXT)
  const { workspaces } = useArea()
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">{t.preview.details}</Typography>
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonTertiary onClick={onCancel}>{t.common.cancel}</ButtonTertiary>
          <ButtonPrimary onClick={onSave}>{t.common.save}</ButtonPrimary>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input label={t.preview.documentName} name="name" value={stripYear(doc.name)} disabled />
        <Input
          label={t.fields.documentType}
          name="documentType"
          isRequired
          error={showErrors && !draft.documentType.trim() ? t.editors.typeRequired : undefined}
          value={draft.documentType}
          placeholder={t.editors.typePlaceholder}
          onChange={e => onChange({ ...draft, documentType: e.target.value })}
        />
        <Input
          label={t.fields.matterReference}
          name="matterReference"
          value={draft.matterReference}
          placeholder={workspaces.matterPlaceholder}
          maxLength={MATTER_MAX}
          hasCounter
          onChange={e => onChange({ ...draft, matterReference: e.target.value })}
        />
        <TextArea
          label={t.fields.summary}
          name="summary"
          value={draft.summary}
          placeholder={t.preview.summaryPlaceholder}
          maxLength={SUMMARY_MAX}
          hasCounter
          autoSize={{ minRows: 4, maxRows: 12 }}
          onChange={e => onChange({ ...draft, summary: e.target.value })}
        />
        <PartiesFields rows={draft.parties} onChange={parties => onChange({ ...draft, parties })} />
        <DatesFields rows={draft.dates} onChange={dates => onChange({ ...draft, dates })} />
      </div>
    </>
  )
}

/** A plausible body for the synthetic document, written from what extraction found so the preview and panel agree. */
function GeneratedDocumentBody({ doc, meta }: { doc: MetadataDocument; meta: ExtractedMetadata }) {
  const t = useText(TEXT)
  const b = t.body
  const p: React.CSSProperties = { margin: '0 0 16px' }
  const h: React.CSSProperties = { fontSize: 15, fontWeight: 700, margin: '28px 0 8px' }
  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", lineHeight: 1.75, color: '#1a1a1a', fontSize: 14, maxWidth: 720 }}>
      <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.25 }}>{stripYear(doc.name)}</div>
      <div style={{ color: '#555', marginTop: 8, marginBottom: 28, fontSize: 13, fontWeight: 600 }}>{meta.documentType || t.extract.document} · {doc.namedEntity && doc.namedEntity !== '—' ? doc.namedEntity : b.uploadedFile}</div>

      {meta.summary && <p style={p}>{meta.summary}</p>}

      {meta.parties.length > 0 && (
        <>
          <div style={h}>1. {b.parties}</div>
          <p style={p}>{b.madeBetween}{meta.parties.map((x, i) => (
            <span key={x.id}>{i > 0 ? (i === meta.parties.length - 1 ? b.and : ', ') : ''}<strong>{x.name}</strong>{x.role ? b.role(x.role) : ''}</span>
          ))}.</p>
        </>
      )}

      <div style={h}>{meta.parties.length ? '2' : '1'}. {b.background}</div>
      <p style={p}>{b.backgroundP1}</p>
      <p style={p}>{b.backgroundP2}</p>

      {meta.dates.length > 0 && (
        <>
          <div style={h}>{meta.parties.length ? '3' : '2'}. {b.keyDates}</div>
          <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
            {sortDates(meta.dates).map(d => <li key={d.id}>{d.label}: <strong>{formatKeyDate(d, t, iso => formatLongDate(iso, t))}</strong></li>)}
          </ul>
          <p style={p}>{b.deadlinesBinding}</p>
        </>
      )}

      <div style={h}>{b.closing}</div>
      <p style={p}>{b.closingText}</p>
    </div>
  )
}

// ─── My Documents: the user's own files, shared to workspaces when ready ─────────────

/** The shared connector seed calls the sample project "Project Alpha"; this version calls it "Project A", so every "Alpha" in an account name becomes "A". */
const toProjectA = (text: string) => text.replace(/\bAlpha\b/g, 'A').replace(/\/ALPHA\b/g, '/A')

const daysAgo = (n: number) => new Date(TODAY_MS - n * DAY_MS).toISOString().slice(0, 10)
const myFile = (d: AreaDocument): MetadataDocument => ({
  _id: `my-file-${d.id}`, name: d.name, domain: 'General', documentType: d.documentType, status: 'Approved', namedEntity: '', namedEntityId: '', year: 2026,
  monetaryAmounts: 0, currency: 'EUR', monetaryTypes: '', lawType: '', citations: '', jurisdiction: 'DE', uploadedDate: daysAgo(d.age), fileSize: d.fileSize, fileFormat: d.fileFormat,
})

/** My Documents when the prototype opens, and what extraction found in each document. */
type MyDocuments = { files: MetadataDocument[]; meta: Record<string, ExtractedMetadata> }

/**
 * The user's own working files (Version 10's My Documents, projects/workspaces-2/version-10/my-documents) — call notes,
 * drafts, stray scans and letters they're looking into — from the subject area's content (content/<area>.ts). Only
 * they see these. Unlike a workspace's documents, which everyone with access shares and relies on, they're often
 * unfinished, so extraction found less in them: scans and untitled files have nothing but their type.
 */
function buildMyDocuments(docs: AreaDocument[]): MyDocuments {
  const meta: Record<string, ExtractedMetadata> = {}
  docs.forEach(d => {
    const id = `my-file-${d.id}`
    meta[id] = {
      documentType: d.documentType,
      matterReference: d.matterReference ?? '',
      summary: d.summary ?? '',
      parties: (d.parties ?? []).map(([name, role]) => ({ id: `${id}-${name}`, name, role })),
      dates: (d.dates ?? []).map(([label, days, kind]) => ({ id: `${id}-${label}`, label, date: daysAgo(-days), isDeadline: kind === 'deadline', isAction: kind === 'action' })),
      edited: {},
    }
  })
  return { files: docs.map(myFile), meta }
}

type Library = {
  /** The user's own files — My Documents — newest first. Workspace files aren't in here; they belong to their workspace. */
  files: MetadataDocument[]
  sourceOf: (id: string) => DocSource
  /** The workspaces a file has been shared to. */
  workspacesOf: (id: string) => Space[]
  upload: (docs: MetadataDocument[]) => void
  /** Records where synced files came from, so they show their app's icon wherever they're listed. */
  markSynced: (docs: MetadataDocument[], source: DocSource) => void
  addToWorkspace: (spaceId: string, docs: MetadataDocument[]) => void
  removeFromWorkspace: (spaceId: string, ids: Set<string>) => void
  /** A workspace's new file list. Files taken out are gone from the workspace; the user's own copies stay in My Documents. */
  setWorkspaceFiles: (spaceId: string, docs: MetadataDocument[]) => void
  /** Deletes the workspace and its files; the user's own copies stay in My Documents. */
  deleteWorkspace: (spaceId: string) => void
  /** Deletes files from My Documents only — workspaces they were shared to keep theirs. */
  deleteFiles: (ids: Set<string>) => void
}

function useLibrary(workspace: WorkspaceState, initialFiles: MetadataDocument[]): Library {
  // My Documents: only the user's own files. Each workspace's files are listed from the workspace itself.
  const [ownFiles, setOwnFiles] = useState<MetadataDocument[]>(initialFiles)
  const { spaces, getSpaceDocs, addDocsToSpace, updateSpaceDocs, setSpaceDocs, deleteSpace } = workspace
  // Files synced from a connected app, and which app.
  const [syncedSources, setSyncedSources] = useState<Map<string, DocSource>>(new Map())

  const membership = useMemo(() => {
    const map = new Map<string, Space[]>()
    spaces.forEach(s => getSpaceDocs(s.id).forEach(d => map.set(d._id, [...(map.get(d._id) ?? []), s])))
    return map
  }, [spaces, getSpaceDocs])

  const files = useMemo(() => [...ownFiles].sort((a, b) => b.uploadedDate.localeCompare(a.uploadedDate)), [ownFiles])

  return {
    files,
    sourceOf: id => syncedSources.get(id) ?? 'local',
    markSynced: (docs, source) => setSyncedSources(prev => { const next = new Map(prev); docs.forEach(d => next.set(d._id, source)); return next }),
    workspacesOf: id => membership.get(id) ?? [],
    upload: docs => setOwnFiles(prev => {
      const have = new Set(prev.map(d => d._id))
      return [...docs.filter(d => !have.has(d._id)), ...prev]
    }),
    addToWorkspace: (spaceId, docs) => {
      const have = new Set(getSpaceDocs(spaceId).map(d => d._id))
      const fresh = docs.filter(d => !have.has(d._id))
      if (fresh.length) addDocsToSpace(spaceId, fresh)
    },
    removeFromWorkspace: (spaceId, ids) => updateSpaceDocs(spaceId, docs => docs.filter(d => !ids.has(d._id))),
    setWorkspaceFiles: (spaceId, next) => setSpaceDocs(spaceId, next),
    deleteWorkspace: spaceId => deleteSpace(spaceId),
    deleteFiles: ids => setOwnFiles(prev => prev.filter(d => !ids.has(d._id))),
  }
}

function MyDocumentsRoute({ workspace, library, store }: { workspace: WorkspaceState; library: Library; store: MetadataStore }) {
  const BASE = usePrototype().base
  const navigate = useNavigate()
  const spacePath = (space: Space) => `${BASE}/workspaces/${slugify(space.name)}`
  return (
    <MyDocumentsPage
      library={library}
      spaces={workspace.spaces}
      store={store}
      onOpenWorkspace={space => navigate(spacePath(space))}
      onOpenDoc={doc => navigate(`${BASE}/my-documents/${encodeURIComponent(doc._id)}`)}
      onSendToCopilot={docs => navigate(`${BASE}/copilot`, { state: { attachDocs: docs.map(doc => ({ doc, source: library.sourceOf(doc._id) })) } })}
      onCreateWorkspace={(values, docs) => {
        const id = workspace.createSpace(values)
        library.addToWorkspace(id, docs)
        navigate(`${BASE}/workspaces/${slugify(values.name)}`)
      }}
    />
  )
}

// My Documents' preview of a document that's in no workspace: the preview needs a space, so it gets this one (named My Documents).
const MY_DOCUMENTS_SPACE: Space = { id: 'my-documents', name: '', description: '', type: '', connectors: [], visibility: 'private' }

function MyDocumentPreviewRoute({ library, store }: { library: Library; store: MetadataStore }) {
  const BASE = usePrototype().base
  const navigate = useNavigate()
  const t = useText(TEXT)
  const { docId } = useParams<{ docId: string }>()
  const doc = library.files.find(d => d._id === docId) ?? null
  if (!doc) return <Navigate to={`${BASE}/my-documents`} replace />
  const spaces = library.workspacesOf(doc._id)
  return (
    <DocumentPreview
      key={doc._id}
      space={spaces[0] ?? { ...MY_DOCUMENTS_SPACE, name: t.myDocs.title }}
      workspaceLabel={spaces.length ? spaces.map(s => s.name).join(', ') : t.myDocs.notInWorkspace}
      doc={doc}
      store={store}
      source={library.sourceOf(doc._id)}
      docIndex={library.files.indexOf(doc)}
      onBack={() => navigate(`${BASE}/my-documents`)}
      onDelete={() => { library.deleteFiles(new Set([doc._id])); navigate(`${BASE}/my-documents`) }}
    />
  )
}

/** The shared sourceIcon, with the uploaded documents' tooltip in this prototype's language (the shared one is English only). */
function docSourceIcon(src: DocSource, size: number, uploadLabel: string, label?: string) {
  if (src !== 'local') return sourceIcon(src, size, label)
  return (
    <Tooltip title={uploadLabel} placement={tooltipPlacements.TOP}>
      <div style={{ display: 'inline-flex' }}>
        <Icon type={iconType.UploadFilled} size={size as never} color="neutral-base" />
      </div>
    </Tooltip>
  )
}

const sourceFilterLabel = (src: DocSource, t: Text) => src === 'local' ? t.filters.uploaded : connectorLabel(src as ConnectorType)

// Their labels are in TEXT.filters.updatedLabels.
type UpdatedWithin = 'any' | '7' | '30' | '365'
/** Whether a document passes the filters (shared by My Documents and a workspace's documents page). */
function matchesFilters(d: MetadataDocument, f: DocFilters, library: Library, typeOf: (d: MetadataDocument) => string) {
  const inSpaces = library.workspacesOf(d._id)
  if (f.workspaces.length && !f.workspaces.some(w => w === NOT_IN_A_WORKSPACE ? inSpaces.length === 0 : inSpaces.some(s => s.id === w))) return false
  if (f.sources.length && !f.sources.includes(library.sourceOf(d._id))) return false
  if (f.types.length && !f.types.includes(typeOf(d))) return false
  if (f.updated !== 'any' && TODAY_MS - new Date(d.uploadedDate).getTime() > Number(f.updated) * DAY_MS) return false
  return true
}

type AppliedFilter = { key: string; label: string; clear: () => void }
/** The applied filters as chips, each removing just itself. `workspaceLabel` names the workspace filter ("Workspace" or "Also in"). */
function appliedFilters(filters: DocFilters, spaces: Space[], update: (patch: Partial<DocFilters>) => void, t: Text, workspaceLabel = t.filters.workspace): AppliedFilter[] {
  const f = t.filters
  return [
    ...filters.workspaces.map(w => ({
      key: `ws-${w}`,
      label: w === NOT_IN_A_WORKSPACE ? t.myDocs.notInWorkspace : f.chip(workspaceLabel, spaces.find(s => s.id === w)?.name ?? w),
      clear: () => update({ workspaces: filters.workspaces.filter(x => x !== w) }),
    })),
    ...filters.sources.map(src => ({ key: `src-${src}`, label: f.chip(f.source, sourceFilterLabel(src, t)), clear: () => update({ sources: filters.sources.filter(x => x !== src) }) })),
    ...filters.types.map(type => ({ key: `type-${type}`, label: f.chip(t.fields.documentType, type), clear: () => update({ types: filters.types.filter(x => x !== type) }) })),
    ...(filters.updated !== 'any' ? [{ key: 'updated', label: f.chip(f.updated, f.updatedLabels[filters.updated]), clear: () => update({ updated: 'any' as const }) }] : []),
  ]
}

function AppliedFilterChips({ applied, onClearAll }: { applied: AppliedFilter[]; onClearAll: () => void }) {
  const t = useText(TEXT)
  if (applied.length === 0) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing(2) }}>
      {applied.map(f => (
        <Chip key={f.key} label={f.label} chipStyle={chipStyles.ACCENT_BLUE} variant={chipVariants.SUBTLE} uppercase={false} closable onClose={f.clear} />
      ))}
      <ButtonGhost size={buttonSizes.SMALL} onClick={onClearAll}>{t.common.clearAll}</ButtonGhost>
    </div>
  )
}

/** What the Filters panel narrows My Documents to. Empty lists mean "any". 'none' in workspaces = not in a workspace. */
type DocFilters = { workspaces: string[]; sources: DocSource[]; types: string[]; updated: UpdatedWithin }
const NO_FILTERS: DocFilters = { workspaces: [], sources: [], types: [], updated: 'any' }
const NOT_IN_A_WORKSPACE = 'none'

/**
 * My Documents: the user's own documents in the Metadata Table's layout (projects/metadata/table) — editable Type, Matter
 * reference, Parties and Dates — plus a Workspaces column with a chip per workspace the document is in. Filters
 * open a side panel with every option; what's applied shows as chips above the table, each one clearable.
 * The workspace chips sit under each document's name rather than in a column of their own, so Parties and
 * Dates keep the room they have in the Metadata Table.
 */
function MyDocumentsPage({ library, spaces, store, onOpenWorkspace, onOpenDoc, onCreateWorkspace, onSendToCopilot }: {
  library: Library
  spaces: Space[]
  store: MetadataStore
  onOpenWorkspace: (space: Space) => void
  onOpenDoc: (doc: MetadataDocument) => void
  onCreateWorkspace: (values: SpaceFormValues, docs: MetadataDocument[]) => void
  onSendToCopilot: (docs: MetadataDocument[]) => void
}) {
  const BASE = usePrototype().base
  const t = useText(TEXT)
  const { lang } = usePrototype()
  const content = useArea()
  const runUpload = useProcessingUpload(lang)
  const sidebarWidth = useSidebarWidth()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<DocFilters>(NO_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [uploadOpen, setUploadOpen] = useState(false)
  // Documents whose workspaces are being changed (one row, or the selection).
  const [managing, setManaging] = useState<MetadataDocument[] | null>(null)
  const [creatingWith, setCreatingWith] = useState<MetadataDocument[] | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Set<string> | null>(null)

  const typeOf = (d: MetadataDocument) => store.get(d).documentType || d.documentType
  const q = search.trim().toLowerCase()
  const filtered = library.files.filter(d => {
    if (!matchesFilters(d, filters, library, typeOf)) return false
    if (!q) return true
    const m = store.get(d)
    return d.name.toLowerCase().includes(q) || typeOf(d).toLowerCase().includes(q) || m.matterReference.toLowerCase().includes(q)
      || m.parties.some(p => p.name.toLowerCase().includes(q)) || library.workspacesOf(d._id).some(s => s.name.toLowerCase().includes(q))
  })
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const selectedDocs = library.files.filter(d => selectedKeys.has(d._id))
  const update = (patch: Partial<DocFilters>) => { setFilters(prev => ({ ...prev, ...patch })); setCurrentPage(1) }

  const applied = appliedFilters(filters, spaces, update, t)

  const columns = useMetadataColumns({
    docs: library.files, visibleDocs: filtered, store, selectedKeys, setSelectedKeys,
    sourceOf: library.sourceOf,
    sourceLabel: connectorLabel,
    onOpenDoc,
    // The workspaces a document is in sit under its name, so the Metadata Table's columns keep their widths.
    // Only documents in a workspace get the line; sharing is from the row menu or the selection bar.
    nameExtra: record => {
      const spaces = library.workspacesOf(record._id)
      return spaces.length > 0 ? (
        <div style={{ marginTop: spacing(2) }}>
          <WorkspaceChips spaces={spaces} onOpen={onOpenWorkspace} />
        </div>
      ) : null
    },
    actions: record => [
      { key: 'view', label: <MenuLabel icon={iconType.ArticleOutlined}>{t.myDocs.viewDocument}</MenuLabel>, onClick: () => onOpenDoc(record) },
      { key: 'workspaces', label: <MenuLabel icon={iconType.ElementsOutlined}>{t.myDocs.addToWorkspaceMenu}</MenuLabel>, onClick: () => setManaging([record]) },
      { key: 'download', label: <MenuLabel icon={iconType.DownloadOutlined}>{t.common.download}</MenuLabel>, onClick: () => {} },
      { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />{t.common.delete}</span>, onClick: () => setPendingDelete(new Set([record._id])) },
    ],
  })

  return (
    // The Workspaces list's margins (24px all round) and gap, so every My Knowledge page lines up.
    <div style={{ padding: spacing(6), display: 'flex', flexDirection: 'column', gap: spacing(6), backgroundColor: CONTENT_BG, height: '100%', overflow: 'hidden' }}>
      <style>{TABLE_CSS}</style>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-start', gap: spacing(4) }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
          <Typography size="heading-lg" weight="bold">{t.myDocs.title} · {library.files.length}</Typography>
          <Typography size="base" color="neutral-darken2">{t.myDocs.intro}</Typography>
        </div>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: spacing(3) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing(4) }}>
          {/* Search and filters on the left, Upload on the right (as on a workspace's Documents page). */}
          <div style={{ width: 320 }}>
            <SearchBar placeholder={t.common.searchDocuments} value={search} onChange={v => { setSearch(v); setCurrentPage(1) }} width={searchbarWidth.EXPANDED} />
          </div>
          <ButtonTertiary leftIcon={iconType.FilterOutlined} onClick={() => setFiltersOpen(true)}>
            {t.common.filters(applied.length)}
          </ButtonTertiary>
          <div style={{ flex: 1 }} />
          <ButtonPrimary leftIcon={iconType.UploadOutlined} onClick={() => setUploadOpen(true)}>{t.common.uploadOrSync}</ButtonPrimary>
        </div>
        <AppliedFilterChips applied={applied} onClearAll={() => update(NO_FILTERS)} />
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {filtered.length === 0 ? (
          <NoResults title={t.common.noDocsMatch} text={t.common.noDocsMatchText} onClear={() => { update(NO_FILTERS); setSearch('') }} />
        ) : (
          <>
            <div className="v12-table" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <Table dataSource={paged} rowKey="_id" columns={columns as never} pagination={false} rowHoverable />
            </div>
            {filtered.length > PAGE_SIZE && (
              <div style={{ flexShrink: 0 }}>
                <Pagination current={currentPage} total={filtered.length} pageSize={PAGE_SIZE} onChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>

      <FilesDisclaimer />

      <FiltersPanel
        open={filtersOpen}
        filters={filters}
        spaces={spaces}
        library={library}
        typeOf={typeOf}
        resultCount={filtered.length}
        onChange={update}
        onClear={() => update(NO_FILTERS)}
        onClose={() => setFiltersOpen(false)}
      />

      {selectedKeys.size > 0 && (
        <div style={{ position: 'fixed', bottom: spacing(2), left: sidebarWidth + spacing(2), right: spacing(2), height: 56, backgroundColor: colorPalette.neutral.lighten1, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${spacing(6)}px`, zIndex: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(4) }}>
            <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.CrossOutlined} onClick={() => setSelectedKeys(new Set())} />
            <Typography color="neutral-darken5">{t.common.selected(selectedKeys.size)}</Typography>
            {/* Opens a new CoPilot chat with the selected documents attached. */}
            <ButtonTertiary onClick={() => onSendToCopilot(selectedDocs)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />{t.myDocs.sendToCopilot}</span>
            </ButtonTertiary>
            <ButtonTertiary leftIcon={iconType.DownloadOutlined} onClick={() => {}}>{t.common.download}</ButtonTertiary>
            <ButtonTertiary leftIcon={iconType.ElementsOutlined} onClick={() => setManaging(selectedDocs)}>{t.myDocs.addToWorkspace}</ButtonTertiary>
          </div>
          <ButtonDanger leftIcon={iconType.TrashOutlined} onClick={() => setPendingDelete(new Set(selectedKeys))}>{t.common.delete}</ButtonDanger>
        </div>
      )}

      {managing && (
        <FileWorkspacesModal
          files={managing}
          spaces={spaces}
          library={library}
          onClose={() => setManaging(null)}
          onNewWorkspace={() => { setCreatingWith(managing); setManaging(null) }}
          onSaved={() => setSelectedKeys(new Set())}
        />
      )}

      <SpaceFormModal
        open={creatingWith !== null}
        mode="create"
        noun="Workspace"
        showPhotoUpload={false}
        showType={false}
        organisationAccess
        accessRadios
        lang={lang}
        intro={content.workspaces.createIntro}
        onClose={() => setCreatingWith(null)}
        onSubmit={values => { if (creatingWith) onCreateWorkspace(values, creatingWith); setCreatingWith(null); setSelectedKeys(new Set()) }}
      />

      <Modal
        visible={pendingDelete !== null}
        variant={modalVariants.DANGER}
        title={t.workspace.deleteDocsTitle(pendingDelete?.size ?? 0)}
        onClose={() => setPendingDelete(null)}
        footer={{ buttons: [
          { variant: buttonVariants.GHOST, props: { children: t.common.cancel, onClick: () => setPendingDelete(null) } },
          { variant: buttonVariants.DANGER, props: { children: t.common.delete, onClick: () => {
            if (!pendingDelete) return
            library.deleteFiles(pendingDelete)
            setSelectedKeys(prev => { const next = new Set(prev); pendingDelete.forEach(id => next.delete(id)); return next })
            setPendingDelete(null)
          } } },
        ]}}
      >
        <Typography size="base" color="neutral-darken5">
          {t.myDocs.deleteBody(pendingDelete?.size ?? 0)}
        </Typography>
      </Modal>

      <UploadOrSyncFlow
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={newDocs => runUpload(newDocs.map(d => d.name), () => { store.extract(newDocs); library.upload(newDocs) })}
        onSync={(newDocs, source) => { library.markSynced(newDocs, source); runUpload(newDocs.map(d => d.name), () => { store.extract(newDocs); library.upload(newDocs) }, 'sync') }}
        existingIds={new Set(library.files.map(d => d._id))}
        connectorsPath={`${BASE}/connectors`}
        accountName={toProjectA}
      />
    </div>
  )
}

/** Every filter for My Documents in one side panel. Changes apply straight away; the footer shows how many match. */
function FiltersPanel({ open, filters, spaces, library, files = library.files, inWorkspace, typeOf, resultCount, onChange, onClear, onClose }: {
  open: boolean
  // The documents the options and counts are for (a workspace's documents page passes its own).
  files?: MetadataDocument[]
  // On a workspace's documents page: the workspace filter becomes "Also in" — the other workspaces.
  inWorkspace?: Space
  filters: DocFilters
  spaces: Space[]
  library: Library
  typeOf: (d: MetadataDocument) => string
  resultCount: number
  onChange: (patch: Partial<DocFilters>) => void
  onClear: () => void
  onClose: () => void
}) {
  const t = useText(TEXT)
  const toggle = <T,>(list: T[], value: T) => list.includes(value) ? list.filter(v => v !== value) : [...list, value]
  const count = (pred: (d: MetadataDocument) => boolean) => files.filter(pred).length
  const sources = [...new Set(files.map(d => library.sourceOf(d._id)))].sort((a, b) => (a === 'local' ? -1 : 0) - (b === 'local' ? -1 : 0))
  const types = [...new Set(files.map(typeOf).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  const otherSpaces = inWorkspace ? spaces.filter(s => s.id !== inWorkspace.id && count(d => library.workspacesOf(d._id).some(x => x.id === s.id)) > 0) : spaces
  const section = (title: string, children: ReactNode) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
      <div style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600, color: colorPalette.neutral.darken5 }}>{title}</div>
      {children}
    </div>
  )
  const option = (key: string, label: ReactNode, checked: boolean, onToggle: () => void, n: number) => (
    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: spacing(2), cursor: 'pointer', fontSize: 14, color: colorPalette.neutral.darken4 }}>
      <Checkbox checked={checked} onChange={onToggle} />
      <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: spacing(2) }}>{label}</span>
      <span style={{ fontSize: 12, color: colorPalette.neutral.darken2 }}>{n}</span>
    </label>
  )
  return (
    <Panel
      visible={open}
      onClose={onClose}
      placement={panelPlacements.RIGHT}
      size={panelSizes.SMALL}
      title={t.filters.title}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: t.common.clearAll, onClick: onClear } },
        { variant: buttonVariants.PRIMARY, props: { children: t.filters.show(resultCount), onClick: onClose } },
      ] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(6) }}>
        {/* My Documents has no Workspace filter; a workspace's documents page keeps "Also in" (its other workspaces). */}
        {inWorkspace && otherSpaces.length > 0 && section(t.filters.alsoIn, <>
          {otherSpaces.map(s => option(s.id, s.name, filters.workspaces.includes(s.id), () => onChange({ workspaces: toggle(filters.workspaces, s.id) }), count(d => library.workspacesOf(d._id).some(x => x.id === s.id))))}
        </>)}
        {section(t.filters.source, <>
          {sources.map(src => option(src, <>{docSourceIcon(src, 16, t.preview.manualUpload)}{sourceFilterLabel(src, t)}</>, filters.sources.includes(src), () => onChange({ sources: toggle(filters.sources, src) }), count(d => library.sourceOf(d._id) === src)))}
        </>)}
        {section(t.filters.updated, (
          <RadioGroup
            name="my-documents-updated"
            direction={radioGroupDirection.COLUMN}
            value={filters.updated}
            onChange={e => onChange({ updated: e.target.value as UpdatedWithin })}
            options={(['any', '7', '30', '365'] as UpdatedWithin[]).map(k => ({ label: t.filters.updatedLabels[k], value: k }))}
          />
        ))}
        {section(t.fields.documentType, (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(2) }}>
            {types.map(type => option(type, type, filters.types.includes(type), () => onChange({ types: toggle(filters.types, type) }), count(d => typeOf(d) === type)))}
          </div>
        ))}
      </div>
    </Panel>
  )
}

/** The workspaces a document is in, as chips that open the workspace. */
function WorkspaceChips({ spaces, onOpen }: { spaces: Space[]; onOpen: (space: Space) => void }) {
  const t = useText(TEXT)
  const MAX = 2
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(1), alignItems: 'center', minHeight: 20 }}>
      {spaces.slice(0, MAX).map(s => (
        <span key={s.id} style={{ cursor: 'pointer', display: 'inline-flex' }} onClick={() => onOpen(s)} title={t.myDocs.openWorkspace(s.name)}>
          <Chip label={s.name} size={chipSizes.SMALL} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} uppercase={false} />
        </span>
      ))}
      {spaces.length > MAX && (
        <Tooltip title={spaces.slice(MAX).map(s => s.name).join(', ')} placement={tooltipPlacements.TOP}>
          <span style={{ fontSize: 12, color: colorPalette.neutral.darken2 }}>+{spaces.length - MAX}</span>
        </Tooltip>
      )}
    </div>
  )
}

/** Which workspaces one or more files are shared to: tick to add, untick to remove. Your copies stay in My Documents either way. */
function FileWorkspacesModal({ files, spaces, library, onClose, onNewWorkspace, onSaved }: {
  files: MetadataDocument[]
  spaces: Space[]
  library: Library
  onClose: () => void
  onNewWorkspace?: () => void
  onSaved: () => void
}) {
  const t = useText(TEXT)
  type Mark = 'all' | 'some' | 'none'
  const initial = (spaceId: string): Mark => {
    const count = files.filter(f => library.workspacesOf(f._id).some(s => s.id === spaceId)).length
    return count === 0 ? 'none' : count === files.length ? 'all' : 'some'
  }
  const [marks, setMarks] = useState<Record<string, Mark>>(() => Object.fromEntries(spaces.map(s => [s.id, initial(s.id)])))
  const save = () => {
    spaces.forEach(s => {
      const from = initial(s.id), to = marks[s.id]
      if (to === from || to === 'some') return
      if (to === 'all') library.addToWorkspace(s.id, files)
      else library.removeFromWorkspace(s.id, new Set(files.map(f => f._id)))
    })
    onSaved()
    onClose()
  }
  const one = files.length === 1
  // From My Documents, the user's copies stay there; from a workspace, there's no copy of theirs to mention.
  const mine = files.every(f => library.files.some(d => d._id === f._id))
  return (
    <Modal
      visible
      title={one ? t.share.titleOne : t.share.titleMany(files.length)}
      withIcon={false}
      onClose={onClose}
      footer={{ buttons: [
        { variant: buttonVariants.GHOST, props: { children: t.common.cancel, onClick: onClose } },
        { variant: buttonVariants.PRIMARY, props: { children: t.common.save, onClick: save } },
      ] }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing(4) }}>
        <Typography size="base" color="neutral-darken2">
          {one ? t.share.one(fileName(files[0]), mine) : t.share.many(mine)}
        </Typography>
        <div style={{ display: 'flex', flexDirection: 'column', border: `1px solid ${colorPalette.neutral.lighten2}`, borderRadius: 8, maxHeight: 300, overflowY: 'auto' }}>
          {spaces.map((s, i) => (
            <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: spacing(3), padding: `${spacing(2)}px ${spacing(3)}px`, cursor: 'pointer', borderTop: i === 0 ? undefined : `1px solid ${colorPalette.neutral.lighten2}` }}>
              <Checkbox
                checked={marks[s.id] === 'all'}
                indeterminate={marks[s.id] === 'some'}
                onChange={e => setMarks(prev => ({ ...prev, [s.id]: e.target.checked ? 'all' : 'none' }))}
              />
              <Avatar shape={avatarShapeEnum.SQUARE} size={avatarSizeEnum.SMALL} src={s.avatarUrl} srcPlaceholder={getInitials(s.name)} />
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: colorPalette.neutral.darken4 }}>{s.name}</span>
            </label>
          ))}
        </div>
        <div style={{ marginLeft: -spacing(2) }}>
          {onNewWorkspace && <ButtonGhost leftIcon={iconType.PlusOutlined} onClick={onNewWorkspace}>{t.share.newWorkspaceWith(one)}</ButtonGhost>}
        </div>
      </div>
    </Modal>
  )
}
