/** Hackathon Oct '26 — what a workspace holds besides its documents, and what CoPilot is handed from it. */

export type WorkspaceDetail = { id: string; label: string; value: string }
export type Guardrail = { id: string; text: string; enabled: boolean }
export type Bookmark = { id: string; title: string; url: string; app: string }
export type Template = { id: string; name: string; app: string; description: string }
/** A CoPilot chat started in a workspace — what the Haufe knowledge card lists (V4/V5). */
export type WorkspaceChat = { id: string; title: string; createdAt: number }

export type WorkspaceExtras = {
  details: WorkspaceDetail[]
  guardrails: Guardrail[]
  bookmarks: Bookmark[]
  templates: Template[]
  chats: WorkspaceChat[]
}

/** What CoPilot is handed when you ask it about a whole workspace. */
export type WorkspaceReference = {
  id: string
  name: string
  description: string
  // Where the workspace's own page lives, for linking back to it.
  path: string
  documents: number
  hasBackground: boolean
  details: number
  guardrails: string[]
  bookmarks: number
  templates: number
}

export const EMPTY_EXTRAS: WorkspaceExtras = { details: [], guardrails: [], bookmarks: [], templates: [], chats: [] }

export const SUGGESTED_GUARDRAILS = [
  'Only answer from the documents in this workspace',
  'Always cite the source for every statement',
  'Answer in German',
  'Never include personal data such as salaries or health information',
]
