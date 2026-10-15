/**
 * Hackathon Oct '26 — Versions 10/11: the sources behind a CoPilot answer in a workspace chat, for the demo.
 * Each answer cites three articles of Haufe expert knowledge (what the user's Personal Office licence gives
 * CoPilot) and two files from the workspace. All made up, but picked deterministically: the Haufe articles by
 * the question's topic, the files by the message, so the same answer always shows the same sources.
 */

export type SourceLang = 'en' | 'de'

export type AnswerSource = {
  n: number
  kind: 'haufe' | 'file'
  title: string
  excerpt: string
}

type Article = { keywords: RegExp; title: Record<SourceLang, string>; excerpt: Record<SourceLang, string> }

const ARTICLES: Article[] = [
  {
    keywords: /probation|probezeit/i,
    title: { en: 'Probation period — length, notice and extension | Lexicon', de: 'Probezeit – Dauer, Kündigung und Verlängerung | Lexikon' },
    excerpt: {
      en: 'A probation period of up to six months can be agreed; during it, either side may give two weeks\' notice (§ 622 Abs. 3 BGB). Extending it beyond six months does not extend the shortened notice period. Where more time is needed to assess the employee, a fixed-term contract with its own review date is the usual alternative.',
      de: 'Eine Probezeit von bis zu sechs Monaten kann vereinbart werden; in dieser Zeit können beide Seiten mit einer Frist von zwei Wochen kündigen (§ 622 Abs. 3 BGB). Eine Verlängerung über sechs Monate hinaus verlängert die verkürzte Kündigungsfrist nicht. Braucht es mehr Zeit zur Erprobung, ist eine Befristung mit eigenem Prüfzeitpunkt die übliche Alternative.',
    },
  },
  {
    keywords: /notice|kündigung|frist|dismiss/i,
    title: { en: '§ 622 BGB — notice periods for employment relationships | Commentary', de: '§ 622 BGB – Kündigungsfristen bei Arbeitsverhältnissen | Kommentar' },
    excerpt: {
      en: 'The basic notice period is four weeks to the 15th or the end of a calendar month. For notice given by the employer it increases with length of service, up to seven months after 20 years. Shorter periods can only be agreed in a collective agreement or for temporary help of up to three months.',
      de: 'Die Grundkündigungsfrist beträgt vier Wochen zum 15. oder zum Ende eines Kalendermonats. Bei Kündigung durch den Arbeitgeber verlängert sie sich mit der Betriebszugehörigkeit, bis zu sieben Monate nach 20 Jahren. Kürzere Fristen sind nur per Tarifvertrag oder bei Aushilfen bis zu drei Monaten zulässig.',
    },
  },
  {
    keywords: /reference|zeugnis/i,
    title: { en: 'Job reference letter: entitlement, form and wording | Article', de: 'Arbeitszeugnis: Anspruch, Form und Formulierungen | Fachbeitrag' },
    excerpt: {
      en: 'Employees are entitled to a written reference when they leave (§ 109 GewO), and can ask for a qualified one covering performance and conduct. It must be truthful and benevolent; coded wording that is negative on closer reading is not allowed.',
      de: 'Beschäftigte haben beim Ausscheiden Anspruch auf ein schriftliches Zeugnis (§ 109 GewO) und können ein qualifiziertes Zeugnis über Leistung und Verhalten verlangen. Es muss wahr und wohlwollend sein; verschlüsselte, bei genauem Lesen negative Formulierungen sind unzulässig.',
    },
  },
  {
    keywords: /warning|abmahnung|lateness|verspät/i,
    title: { en: 'Warning letter — requirements and template | Work aid', de: 'Abmahnung – Voraussetzungen und Muster | Arbeitshilfe' },
    excerpt: {
      en: 'A valid warning names the specific breach with date and facts, asks the employee to comply in future, and states that a repeat may lead to dismissal. A general complaint without these elements does not count as a warning.',
      de: 'Eine wirksame Abmahnung benennt den konkreten Pflichtverstoß mit Datum und Sachverhalt, fordert zu künftig vertragstreuem Verhalten auf und kündigt für den Wiederholungsfall arbeitsrechtliche Konsequenzen an. Eine allgemeine Beanstandung ohne diese Elemente ist keine Abmahnung.',
    },
  },
  {
    keywords: /parental|eltern/i,
    title: { en: 'Parental leave: request, deadlines and protection against dismissal | Lexicon', de: 'Elternzeit: Antrag, Fristen und Kündigungsschutz | Lexikon' },
    excerpt: {
      en: 'Parental leave must be requested in writing seven weeks before it starts in the child\'s first three years, and thirteen weeks before for later periods (§ 16 BEEG). From the request onwards, the employee is protected against dismissal.',
      de: 'Elternzeit muss für die ersten drei Lebensjahre sieben Wochen, für spätere Zeiträume dreizehn Wochen vor Beginn schriftlich verlangt werden (§ 16 BEEG). Ab dem Verlangen besteht Sonderkündigungsschutz.',
    },
  },
  {
    keywords: /works council|betriebsrat|policy|richtlinie|co-determination|mitbestimm/i,
    title: { en: 'Co-determination of the works council under § 87 BetrVG | Commentary', de: 'Mitbestimmung des Betriebsrats nach § 87 BetrVG | Kommentar' },
    excerpt: {
      en: 'In the matters listed in § 87 BetrVG — including working time, technical monitoring and mobile work — the employer may only act with the works council\'s agreement. Measures introduced without it are invalid towards employees.',
      de: 'In den Angelegenheiten des § 87 BetrVG – darunter Arbeitszeit, technische Überwachung und mobile Arbeit – darf der Arbeitgeber nur mit Zustimmung des Betriebsrats handeln. Ohne sie eingeführte Maßnahmen sind gegenüber den Beschäftigten unwirksam.',
    },
  },
  {
    keywords: /remote|mobile|homeoffice|mobiles/i,
    title: { en: 'Mobile work and working from home — the legal framework | Article', de: 'Mobiles Arbeiten und Homeoffice – rechtliche Rahmenbedingungen | Fachbeitrag' },
    excerpt: {
      en: 'There is no general legal right to work from home. Where it is offered, working time recording, health and safety and data protection still apply, and the arrangement should be set out in a works agreement or individual agreement.',
      de: 'Einen allgemeinen Rechtsanspruch auf Homeoffice gibt es nicht. Wird es angeboten, gelten Arbeitszeiterfassung, Arbeitsschutz und Datenschutz weiter; die Regelung sollte in einer Betriebs- oder Einzelvereinbarung festgehalten werden.',
    },
  },
  {
    keywords: /vat|umsatzsteuer|tax|steuer/i,
    title: { en: 'VAT: intra-community supplies | Lexicon', de: 'Umsatzsteuer: Innergemeinschaftliche Lieferungen | Lexikon' },
    excerpt: {
      en: 'Deliveries to businesses in another EU member state are tax-free if the customer has a valid VAT ID and the goods demonstrably leave Germany (§ 6a UStG). The supplier must report them in the recapitulative statement.',
      de: 'Lieferungen an Unternehmer in einem anderen EU-Mitgliedstaat sind steuerfrei, wenn der Abnehmer eine gültige USt-IdNr. hat und die Ware nachweislich Deutschland verlässt (§ 6a UStG). Sie sind in der Zusammenfassenden Meldung anzugeben.',
    },
  },
  {
    keywords: /contract|vertrag|fixed-term|befrist/i,
    title: { en: 'Fixed-term employment contracts under the TzBfG | Commentary', de: 'Befristete Arbeitsverträge nach dem TzBfG | Kommentar' },
    excerpt: {
      en: 'Without an objective reason, a contract can be fixed-term for up to two years and extended up to three times within that period (§ 14 Abs. 2 TzBfG). The fixed term must be agreed in writing before work starts.',
      de: 'Ohne Sachgrund ist eine Befristung bis zu zwei Jahren zulässig, innerhalb dieser Zeit bis zu dreimal verlängerbar (§ 14 Abs. 2 TzBfG). Die Befristung muss vor Arbeitsantritt schriftlich vereinbart werden.',
    },
  },
]

// Broad employment-law articles that back most HR answers.
const GENERAL = /§ 622 BGB|Fixed-term|Co-determination/

const FILE_EXCERPTS: Record<SourceLang, string[]> = {
  en: [
    'Section 3.2 sets out the internal rule that applies here and who has to approve exceptions.',
    'The relevant paragraph records what was agreed with the employee representatives and from when it applies.',
    'Page 4 summarises the facts of the case and the deadlines that were noted at the time.',
  ],
  de: [
    'Abschnitt 3.2 regelt die hier geltende interne Vorgabe und wer Ausnahmen freigeben muss.',
    'Der einschlägige Absatz hält fest, was mit der Arbeitnehmervertretung vereinbart wurde und ab wann es gilt.',
    'Seite 4 fasst den Sachverhalt und die damals notierten Fristen zusammen.',
  ],
}

function hash(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

/** Three Haufe articles (best topic matches first) and up to two workspace files, numbered [1]…[5]. */
export function buildSources(messageId: string, question: string, documentNames: string[], lang: SourceLang): AnswerSource[] {
  const h = hash(messageId + question)
  const matching = ARTICLES.filter(a => a.keywords.test(question))
  // Then the general employment-law articles that suit most HR questions, then the rest.
  const general = ARTICLES.filter(a => !matching.includes(a) && GENERAL.test(a.title.en))
  const rest = [...general, ...ARTICLES.filter(a => !matching.includes(a) && !general.includes(a))]
  const articles = [...matching, ...rest].slice(0, 3)
  const files = documentNames.length === 0 ? [] : [0, 1]
    .map(i => documentNames[(h + i * 7) % documentNames.length])
    .filter((name, i, all) => all.indexOf(name) === i)

  const sources: AnswerSource[] = articles.map((a, i) => ({ n: i + 1, kind: 'haufe', title: a.title[lang], excerpt: a.excerpt[lang] }))
  files.forEach((name, i) => sources.push({ n: sources.length + 1, kind: 'file', title: name, excerpt: FILE_EXCERPTS[lang][(h + i) % FILE_EXCERPTS[lang].length] }))
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
