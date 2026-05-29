import type { MetadataDocument } from '../bulk-edit/documents'

export const extraDocs: MetadataDocument[] = []
export const customHtmlMap = new Map<string, string>()

export function addCopiedDoc(doc: MetadataDocument, html: string) {
  extraDocs.unshift(doc)
  customHtmlMap.set(doc._id, html)
}
