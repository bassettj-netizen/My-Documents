/**
 * What changes between the user-testing prototypes' subject areas (HR, Law, Finance, OD, Real estate). Each area
 * file exports `{ en: AreaContent, de: AreaContent }`; the German side is the same content written for German users
 * (German names, documents and sources), not a word-for-word translation.
 *
 * Icons are GOAT `iconType` values (e.g. iconType.FolderOutlined), written as their string values.
 */

/** One of the user's own documents in My Documents: their working files, often drafts and scans. */
export type AreaDocument = {
  /** Unique within the area, e.g. 'p1'. */
  id: string
  /** Without the extension, e.g. 'Call notes - onboarding Lisa Brandt'. */
  name: string
  /** e.g. 'Meeting Notes', 'Employment Contract'. */
  documentType: string
  fileFormat: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX'
  /** e.g. '312 KB', '1.4 MB'. */
  fileSize: string
  /** Days since it was uploaded (0 = today). */
  age: number
  /** What extraction found — patchy on purpose: scans and untitled files have none of these. */
  matterReference?: string
  summary?: string
  /** [name, role] */
  parties?: [string, string][]
  /** [label, days from today (negative = past), kind] */
  dates?: [string, number, 'deadline' | 'action'][]
}

export type AreaGuardrailExample = { category: string; icon: string; text: string; why: string }

/** A CoPilot chat already in the history when the prototype opens. */
export type AreaChat = { id: string; day: 'today' | 'yesterday'; title: string; question: string; answer: string }

/** A Haufe article CoPilot cites. `keywords` matches the question (in either language); `general` ones back most answers. */
export type AreaArticle = { keywords: RegExp; title: string; excerpt: string; general?: boolean }

/**
 * A picture on the start page. The product screens use photos; with no image assets these are stand-ins: an icon or
 * symbol in a soft circle (`tone: 'dark'` for the black circles, e.g. Gesetzesradar), initials for people, a play
 * button for videos, or a dark rounded badge with a short text (an app logo such as "HRD").
 * `image`: a real picture from public/ (e.g. /user-testing-nov-26/hr/…), cropped to a circle; `plain` shows it as it
 * is (for logos that bring their own shape, such as the HRD badge). `position` is the CSS object-position of the crop.
 */
export type OfficeMedia =
  | { icon: string; tone?: 'neutral' | 'dark' } | { initials: string } | { symbol: string } | { play: true } | { badge: string }
  | { image: string; plain?: boolean; position?: string }
  /** A book cover stand-in: a coloured cover with a short title (e.g. "BGB"), in a soft circle as on the product screens. */
  | { book: string; color: string }
/** `kicker`: a small bold line above the title, e.g. "Urteil". */
export type OfficeTeaser = { media: OfficeMedia; kicker?: string; title: string; text?: string; meta?: string; cta: string }
/** One part of a widget, top to bottom. */
export type OfficeBlock =
  /** Entries paged with ‹ ● ○ ›; `perPage` shows several at once, with a line between them (e.g. Handapparat). */
  | { kind: 'carousel'; teasers: OfficeTeaser[]; perPage?: number }
  /** Plain rows with a line between them. */
  | { kind: 'links'; links: string[] }
  /** A blue link with a chevron, e.g. "Zur Gesamtübersicht". */
  | { kind: 'more'; label: string }
  /** The A–Z letter grid; `disabled` letters are greyed out. */
  | { kind: 'alphabet'; disabled?: string[] }
  /** A picture with a paragraph, on the widget's tinted background. */
  | { kind: 'intro'; media: OfficeMedia; text: string }
  /** Small grey text, e.g. "Weitere e-Learning Angebote"; `italic` for "nothing here" notes. */
  | { kind: 'note'; text: string; italic?: boolean }
  /** The CoPilot teaser on a tinted background; its button opens CoPilot. `image` replaces the CoPilot mark in the circle. */
  | { kind: 'copilot'; text: string; cta: string; image?: string }
export type OfficeWidget =
  | { kind: 'teasers'; title: string; teasers: OfficeTeaser[]; links?: string[] }
  /** The highlighted CoPilot widget; its button opens CoPilot. */
  | { kind: 'copilot'; title: string; teaserTitle: string; text: string; cta: string; links: string[] }
  /** A widget built from blocks, as on the product screens (screenshots/HR.png, Finance.png, oD.png, Real Estate.png). */
  | { kind: 'blocks'; title: string; subtitle?: string; blocks: OfficeBlock[] }
/** A product navigation item. `copilot` opens CoPilot (with its mark as the icon); a line follows `dividerAfter`. */
export type OfficeNavItem = { label: string; icon: string; copilot?: boolean; dividerAfter?: boolean }

/** Made-up metadata for documents the user uploads during a test, worked out from the file name. */
export type AreaUploads = {
  /** File name pattern → document type, most specific first. */
  typeRules: [RegExp, string][]
  /** File name pattern → topic, used in the generated summary. */
  topics: [RegExp, string][]
  /** File name pattern → a party it names. */
  parties: [RegExp, { name: string; role: string }][]
  /** What fills in whatever the name doesn't give. */
  matters: string[]
  counterparties: { name: string; role: string }[]
  /** The role of the person or organisation a document is about, e.g. 'Employee', 'Client', 'Tenant'. */
  primaryRole: string
  deadlineLabels: string[]
  actionLabels: string[]
}

export type AreaContent = {
  /** The area's name, e.g. 'HR' / 'Personal'. */
  areaLabel: string
  /** The Haufe product for this area: the sidebar's app item, its start page and the CoPilot sources panel. */
  /**
   * `icon`: the product's app icon, shown when the start page's navigation is collapsed (a path under public/).
   * `mark`: the letters on that icon's tile (e.g. 'FI', 'TVÖD'), redrawn as the app sidebar's outlined menu icon;
   * without it, the menu shows Haufe Office Line's "P".
   * `nameSize`: the start page header's product name size in px (default 20), smaller for long names that would be cut off.
   * `publisher`: a second imprint shown small beside the Haufe wordmark (e.g. 'DeutscherAnwaltVerlag').
   */
  product: { name: string; shortName: string; icon: string; mark?: string; publisher?: string; nameSize?: number }

  /** My Documents when the prototype opens: about 30 of the user's own working files. */
  myDocuments: AreaDocument[]

  workspaces: {
    /** Under "Create your first workspace" and in the Create workspace modal. */
    createIntro: string
    /** The "Your workspace + Haufe knowledge = Your answers" cards on the empty Workspaces page. */
    equation: { workspaceText: string; haufeText: string; resultTitle: string; resultText: string }
    /** Examples on an empty Guardrails page. */
    guardrailExamples: AreaGuardrailExample[]
    /** Three rules shown faintly in the Guardrails container's empty state. */
    previewGuardrails: string[]
    /** Six labels shown faintly in the Profile container's empty state, e.g. 'Legal form', 'Employees'. */
    profileLabels: string[]
    /** The matter/reference field's placeholder, e.g. 'e.g. Onboarding Q1 2026'. */
    matterPlaceholder: string
    /** An example question for a workspace's CoPilot container. */
    tryAsking: (workspaceName: string) => string
  }

  copilot: {
    /** Five chats: two today, three yesterday. */
    chats: AreaChat[]
    /** The canned reply's advice after "Based on your question — "…" — here's a starting point: ". */
    genericAdvice: string
    /** Ends every canned reply, in brackets, e.g. 'Simulated response for prototyping — …'. */
    simulatedNote: string
    /** About nine articles; two or three `general`. */
    articles: AreaArticle[]
    /** Three excerpts quoted from the user's own documents when they're cited. */
    fileExcerpts: string[]
    /**
     * The Musterfirma test task's answer (content/musterfirma.ts): given to every question asked in a workspace that
     * `match` relates to — by its name or one of its documents' — and that has documents. Anywhere else, the canned answer.
     */
    fixedReply?: FixedReply
  }

  /** The product's start page (the sidebar's app item). */
  office: {
    /** Without `dividerAfter` on any item, a line follows the second one. */
    navItems: OfficeNavItem[]
    /** The keyword search across the top ("Stichwort suchen"); `modes` adds the Suche | CoPilot toggle. Without it, the older "Search for…" bar. */
    search?: { modes: boolean }
    /** Three columns of widgets; one widget is the CoPilot one. */
    columns: OfficeWidget[][]
  }

  uploads: AreaUploads

  /** What a workspace is about, in the area's words (Workspaces page description and the workspace Profile modal). */
  profile: {
    /** Under the Workspaces heading once there are workspaces. */
    listDescription: string
    /** Above the Profile modal's background field. */
    backgroundDescription: string
    backgroundPlaceholder: string
    /** Above the Profile modal's details. */
    detailsDescription: string
    detailLabelPlaceholder: string
    detailValuePlaceholder: string
  }

  /** Documents in each connected app's file picker when syncing: nine per app, names without extension. */
  syncFiles: Record<'sharepoint' | 'googleDrive' | 'datev', [string, 'PDF' | 'DOCX' | 'XLSX'][]>
}

/** Builds an area's sync files from [English name, German name, format] rows. */
export function syncFilesFor(rows: Record<'sharepoint' | 'googleDrive' | 'datev', [string, string, 'PDF' | 'DOCX' | 'XLSX'][]>, lang: 'en' | 'de'): AreaContent['syncFiles'] {
  const pick = (list: [string, string, 'PDF' | 'DOCX' | 'XLSX'][]) => list.map(([en, de, format]) => [lang === 'en' ? en : de, format] as [string, 'PDF' | 'DOCX' | 'XLSX'])
  return { sharepoint: pick(rows.sharepoint), googleDrive: pick(rows.googleDrive), datev: pick(rows.datev) }
}

/**
 * A fixed CoPilot answer. In `text`, ⟦F⟧ cites the workspace's latest matching document (or else its latest one),
 * quoted with `fileExcerpt`, and ⟦1⟧… the Haufe `articles`.
 */
export type FixedReply = { match: RegExp; text: string; articles: { title: string; excerpt: string }[]; fileExcerpt: string }
