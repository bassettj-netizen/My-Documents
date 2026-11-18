/**
 * Workspaces User Testing Nov '26 (from Hackathon Oct '26 Versions 10/11): the sources behind a CoPilot answer in a
 * workspace chat. Each answer cites three articles of Haufe expert knowledge (the subject area's, from
 * AreaContent.copilot.articles) and two files from the workspace. All made up, but picked deterministically: the Haufe articles by
 * the question's topic, the files by the message, so the same answer always shows the same sources.
 */

import type { AreaArticle } from './content/types'

export type AnswerSource = {
  n: number
  kind: 'haufe' | 'file'
  title: string
  excerpt: string
}

function hash(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

/**
 * Three Haufe articles (best topic matches first) and up to two workspace files, numbered [1]…[5]. `articles` and
 * `fileExcerpts` are the prototype's subject area's (AreaContent.copilot), in its language.
 */
export function buildSources(messageId: string, question: string, documentNames: string[], articles: AreaArticle[], fileExcerpts: string[]): AnswerSource[] {
  const h = hash(messageId + question)
  const matching = articles.filter(a => a.keywords.test(question))
  // Then the area's general articles that suit most questions, then the rest.
  const general = articles.filter(a => !matching.includes(a) && a.general)
  const rest = [...general, ...articles.filter(a => !matching.includes(a) && !general.includes(a))]
  const cited = [...matching, ...rest].slice(0, 3)
  const files = documentNames.length === 0 ? [] : [0, 1]
    .map(i => documentNames[(h + i * 7) % documentNames.length])
    .filter((name, i, all) => all.indexOf(name) === i)

  const sources: AnswerSource[] = cited.map((a, i) => ({ n: i + 1, kind: 'haufe', title: a.title, excerpt: a.excerpt }))
  files.forEach((name, i) => sources.push({
    n: sources.length + 1, kind: 'file', title: name,
    excerpt: fileExcerpts.length ? fileExcerpts[(h + i) % fileExcerpts.length] : '',
  }))
  return sources
}

export const MARKER = /⟦(\d+)⟧/

// Words that end in a full stop without ending the sentence ("§ 622 Abs. 3", "z. B.", "e.g.").
const ABBREVIATIONS = new Set(['Abs', 'Nr', 'Art', 'bzw', 'ca', 'vgl', 'ggf', 'Vz', 'eg', 'ie', 'No', 'approx', 'etc'])

/**
 * Puts citation markers ⟦n⟧ at the ends of the answer's sentences, spreading the sources evenly over them
 * in order (so with two sentences and five sources: ⟦1⟧⟦2⟧⟦3⟧ after the first, ⟦4⟧⟦5⟧ after the second).
 * The "(Simulated response…)" note gets none.
 */
export function placeMarkers(content: string, sourceCount: number): string {
  if (sourceCount === 0) return content
  const noteAt = content.lastIndexOf('\n\n(')
  const body = noteAt >= 0 ? content.slice(0, noteAt) : content
  const note = noteAt >= 0 ? content.slice(noteAt) : ''

  // Where sentences end: a full stop (outside bold) followed by a space, line break or the end —
  // but not after a number or an abbreviation like "Abs." or "e.g.".
  const ends: number[] = []
  let bold = false
  for (let i = 0; i < body.length; i++) {
    if (body.startsWith('**', i)) { bold = !bold; i++; continue }
    if (body[i] !== '.' || bold) continue
    if (i < body.length - 1 && !/\s/.test(body[i + 1])) continue
    const wordBefore = /([\p{L}]+)$/u.exec(body.slice(0, i))?.[1] ?? ''
    if (/\d/.test(body[i - 1] ?? '') || ABBREVIATIONS.has(wordBefore) || wordBefore.length === 1) continue
    ends.push(i + 1)
  }
  if (ends.length === 0) ends.push(body.length)

  // Spread sources 1…n over the sentence ends, earlier sentences taking any extra.
  const perEnd = ends.map((_, k) => Math.floor(sourceCount / ends.length) + (k < sourceCount % ends.length ? 1 : 0))
  let n = 1
  let out = ''
  let from = 0
  ends.forEach((end, k) => {
    out += body.slice(from, end)
    for (let j = 0; j < perEnd[k]; j++) out += `⟦${n++}⟧`
    from = end
  })
  return out + body.slice(from) + note
}
