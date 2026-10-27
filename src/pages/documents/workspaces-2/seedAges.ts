import type { MetadataDocument } from '../bulk-edit/documents'
import type { WorkspaceExtras } from '../hackathon/workspaceModel'
import { seedChats, seedExtras } from '../hackathon/seedWorkspaceContent'

/**
 * Workspaces 2.0 — how long ago each seeded workspace was last touched, in days, so the list shows a
 * mix of recently and not so recently updated workspaces. Every seeded date in a workspace (documents,
 * CoPilot chats, Haufe documents) moves back by its age; the spacing between them stays the same.
 */
const SPACE_AGE_DAYS: Record<string, number> = {
  'space-acme': 0,
  'space-hr': 2,
  'space-bergmann': 16,
  'space-alpha': 74,
}

const DAY_MS = 86_400_000
const ageOf = (spaceId: string) => SPACE_AGE_DAYS[spaceId] ?? 0

/** The seeded documents, moved so the newest was uploaded `age` days ago. */
export function agedDocs(spaceId: string, docs: MetadataDocument[]): MetadataDocument[] {
  if (docs.length === 0) return docs
  const newest = Math.max(...docs.map(d => new Date(d.uploadedDate).getTime()))
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime()
  const shift = today - ageOf(spaceId) * DAY_MS - newest
  return docs.map(d => ({ ...d, uploadedDate: new Date(new Date(d.uploadedDate).getTime() + shift).toISOString().slice(0, 10) }))
}

/** seedExtras('en') with each workspace's chats and Haufe documents moved back by its age. */
export function agedExtras(): Record<string, WorkspaceExtras> {
  return Object.fromEntries(Object.entries(seedExtras('en')).map(([spaceId, extras]) => {
    const shift = ageOf(spaceId) * DAY_MS
    return [spaceId, {
      ...extras,
      chats: extras.chats.map(c => ({ ...c, createdAt: c.createdAt - shift })),
      haufeDocuments: extras.haufeDocuments.map(d => ({ ...d, createdAt: d.createdAt - shift })),
    }]
  }))
}

/** seedChats('en') with each chat moved back by its workspace's age. */
export function agedChats() {
  return seedChats('en').map(c => ({ ...c, daysAgo: c.daysAgo + ageOf(c.spaceId) }))
}
