import { stripYear, type MetadataDocument } from '../workspaces/shared'

/**
 * Seeded, document-specific summaries for Metadata versions 9–11.
 *
 * Every document gets its own wording: a sentence pattern per document type, filled in from the
 * document's title subject ("Q4 Filing", "Remote Work"…), its client/owner and year, plus figures
 * (amounts, counts, weeks…) derived from its position in the space. The figures matter: the demo
 * data repeats titles every 60 documents, and they keep those summaries distinct too.
 *
 *   short  — one sentence for the documents table (≤ 200 characters)
 *   detail — one more sentence the preview adds after the short one
 */

type Facts = {
  /** Title subject in sentence case, e.g. "Q4 filing", "M&A due diligence", "remote work". */
  s: string
  /** Client / owner, e.g. "Acme Holdings GmbH", "Alpha Workstream", "People Team". */
  e: string
  year: number
  /** A plausible euro amount, e.g. "€48,210". */
  amount: string
  /** A second, smaller amount. */
  amount2: string
  /** A small count (2–9). */
  count: number
  /** A percentage (3–27). */
  pct: number
  /** A number of weeks (2–12). */
  weeks: number
  /** A headcount (12–240). */
  people: number
}

type Template = { short: (f: Facts) => string; detail: (f: Facts) => string }

const TEMPLATES: Record<string, Template> = {
  // ── Tax (Acme Corp) ─────────────────────────────────────────────────────────
  'Tax Return': {
    short: f => `Corporate tax return for ${f.e} for fiscal year ${f.year}, prepared as part of the ${f.s} and reporting taxable income of ${f.amount}.`,
    detail: f => `It claims ${f.amount2} in deductible expenses and applies a ${f.pct}% reduction from carried-forward losses.`,
  },
  'Engagement Letter': {
    short: f => `Engagement letter with ${f.e} for the ${f.s}, setting out scope, responsibilities and a fixed fee of ${f.amount}.`,
    detail: f => `Out-of-scope work is billed hourly, and either party may end the engagement with ${f.weeks} weeks' notice.`,
  },
  'Financial Statement': {
    short: f => `Annual financial statements of ${f.e} for ${f.year} under HGB, prepared for the ${f.s} and showing net income of ${f.amount}.`,
    detail: f => `Provisions rose by ${f.pct}% year on year, mainly for pending tax assessments totalling ${f.amount2}.`,
  },
  'Audit Report': {
    short: f => `Auditor's report on the ${f.year} accounts of ${f.e}, prepared during the ${f.s}, with ${f.count} findings.`,
    detail: f => `The largest finding concerns ${f.amount} of unreconciled intercompany balances; the others are presentation issues.`,
  },
  'VAT Filing': {
    short: f => `VAT return for ${f.e} covering intra-community supplies for the ${f.s}, with input tax of ${f.amount} reclaimed.`,
    detail: f => `It corrects ${f.amount2} of input tax claimed in an earlier period on the Hamburg warehouse lease.`,
  },
  'Invoice': {
    short: f => `Invoice to ${f.e} for ${f.amount} in advisory fees on the ${f.s}, payable within 30 days.`,
    detail: f => `It covers ${f.people} hours of partner and associate time, with ${f.amount2} in expenses itemised separately.`,
  },
  'Compliance Memo': {
    short: f => `Memo setting out the ${f.count} compliance obligations ${f.e} faces from the ${f.s}, with recommended next steps.`,
    detail: f => `Two obligations are overdue, and the memo estimates late-filing penalties of up to ${f.amount} if they aren't addressed.`,
  },
  'Client Agreement': {
    short: f => `Agreement with ${f.e} covering the ${f.s}, including a liability cap of ${f.amount} and data processing terms.`,
    detail: f => `It runs for ${f.count} years and renews automatically unless cancelled ${f.weeks} weeks before the end of a term.`,
  },
  'Advisory Note': {
    short: f => `Advisory note for ${f.e} on the tax implications of the ${f.s}, comparing ${f.count} structuring options.`,
    detail: f => `The recommended option lowers the expected tax burden by about ${f.amount} over three years.`,
  },
  'Payroll Summary': {
    short: f => `Payroll summary for ${f.e} for ${f.year}, reconciling wage tax and social security for ${f.people} employees after the ${f.s}.`,
    detail: f => `Total gross pay was ${f.amount}, with ${f.amount2} withheld in wage tax and passed on to the tax office.`,
  },

  // ── Project (Project Alpha) ─────────────────────────────────────────────────
  'Project Charter': {
    short: f => `Charter for the ${f.s} defining scope, a budget of ${f.amount}, milestones and governance for ${f.e}.`,
    detail: f => `Delivery is planned over ${f.weeks} weeks with ${f.count} milestones, each signed off by the steering committee.`,
  },
  'Policy': {
    short: f => `Policy governing the ${f.s}, setting out responsibilities and approval rules for ${f.e}.`,
    detail: f => `Spending above ${f.amount} needs steering committee approval, and exceptions are reviewed every ${f.weeks} weeks.`,
  },
  'Guideline': {
    short: f => `Guideline on how teams in ${f.e} should run the ${f.s}, with ${f.count} checklists and worked examples.`,
    detail: f => `It is aimed at team leads and replaces the earlier guidance, which ${f.pct}% of teams reported as unclear.`,
  },
  'Meeting Notes': {
    short: f => `Notes from the ${f.s} meeting with ${f.e}, recording ${f.count} decisions, open questions and owners.`,
    detail: f => `The main decision was to move the pilot back ${f.weeks} weeks to allow a further security review.`,
  },
  'Risk Assessment': {
    short: f => `Risk assessment for the ${f.s}, rating ${f.count} risks by likelihood and impact with owners in ${f.e}.`,
    detail: f => `The highest-rated risk is vendor lock-in, with a potential cost impact of ${f.amount} if migration is needed.`,
  },
  'Status Report': {
    short: f => `Status report on the ${f.s} for ${f.e}: ${f.pct}% of planned work complete and ${f.amount} of budget spent.`,
    detail: f => `The project is ${f.weeks} weeks behind on one workstream; the others are on track for the next milestone.`,
  },
  'Design Spec': {
    short: f => `Design specification for the ${f.s}, detailing requirements, architecture and ${f.count} open decisions.`,
    detail: f => `It targets ${f.people} concurrent users and puts all personal data in an EU-hosted datastore.`,
  },
  'Runbook': {
    short: f => `Runbook for the ${f.s} with ${f.count} step-by-step procedures, contacts and rollback instructions for ${f.e}.`,
    detail: f => `A full rollback is expected to take under ${f.weeks * 5} minutes and was last rehearsed during the pilot.`,
  },
  'Retrospective': {
    short: f => `Retrospective on the ${f.s}, summarising what went well, what didn't and ${f.count} agreed actions.`,
    detail: f => `Cycle time improved by ${f.pct}% over the period, while unplanned work took up a quarter of capacity.`,
  },
  'Roadmap': {
    short: f => `Roadmap for the ${f.s} showing ${f.count} planned releases and their dependencies for ${f.e} in ${f.year}.`,
    detail: f => `The first release is planned within ${f.weeks} weeks, pending the outcome of the vendor evaluation.`,
  },

  // ── HR (Internal HR) ────────────────────────────────────────────────────────
  'HR Policy': {
    short: f => `Company policy on ${f.s}, covering eligibility, responsibilities and how requests are handled by ${f.e}.`,
    detail: f => `It applies to all ${f.people} employees in Germany and was agreed with the works council.`,
  },
  'Onboarding Guide': {
    short: f => `Guide for new employees on ${f.s}, with first-week tasks, contacts and ${f.count} required forms.`,
    detail: f => `New starters should complete the checklist within ${f.weeks} weeks; the guide is updated each quarter.`,
  },
  'Compliance Guide': {
    short: f => `Guide to the legal obligations around ${f.s} and how ${f.e} meets them, with ${f.count} required controls.`,
    detail: f => `Breaches can lead to fines of up to ${f.amount}, so the guide includes a short self-assessment.`,
  },
  'Benefits Summary': {
    short: f => `Summary of employee benefits related to ${f.s} for ${f.year}, including eligibility and a budget of ${f.amount}.`,
    detail: f => `${f.pct}% of eligible employees took part last year; enrolment closes ${f.weeks} weeks after the announcement.`,
  },
  'Employee Handbook': {
    short: f => `Handbook section on ${f.s}, describing company rules and where the ${f.people} employees can get help.`,
    detail: f => `It replaces the ${f.year - 1} edition and adds ${f.count} new sections on hybrid working arrangements.`,
  },
  'Training Material': {
    short: f => `Training material on ${f.s} for managers and staff, with ${f.count} exercises and a short assessment.`,
    detail: f => `The course takes about ${f.weeks * 10} minutes, and a pass mark of 80% is needed for the certificate.`,
  },
  'Performance Review': {
    short: f => `Performance review template and guidance for ${f.s}, with ${f.count} rating criteria for managers.`,
    detail: f => `Reviews for ${f.people} employees are due within ${f.weeks} weeks of the cycle opening.`,
  },
  'Payroll Export': {
    short: f => `Payroll export for ${f.year} prepared by ${f.e} for ${f.people} employees, reflecting changes from ${f.s}.`,
    detail: f => `Total gross pay in the export is ${f.amount}, including ${f.amount2} in one-off payments.`,
  },
  'Leave Policy': {
    short: f => `Leave policy covering ${f.s}, including ${f.weeks} weeks' notice, entitlements and approval steps.`,
    detail: f => `Requests are approved by line managers, with HR stepping in for leave longer than ${f.count} weeks.`,
  },
  'Code of Conduct': {
    short: f => `Code of conduct section on ${f.s}, setting expected behaviour and ${f.count} ways to report concerns.`,
    detail: f => `Reports can be made anonymously, and ${f.e} commits to acknowledging each one within ${f.count} working days.`,
  },
}

export const SHORT_SUMMARY_MAX = 200

/** "Q4 Filing" → "Q4 filing", "M&A Due Diligence" → "M&A due diligence" — acronyms keep their case. */
const inSentence = (t: string) => t.split(' ').map(w => w.length > 1 && w === w.toUpperCase() ? w : w.toLowerCase()).join(' ')

const euro = (n: number) => `€${n.toLocaleString('en-GB')}`

/** Deterministic figures for the document at `index` — different for every position in the space. */
function factsFor(doc: MetadataDocument, index: number): Facts {
  return {
    s: inSentence(stripYear(doc.name).split(' — ')[0]),
    e: doc.namedEntity,
    year: doc.year,
    amount: euro(Math.round(((index * 7919) % 90000 + 12000) / 10) * 10),
    amount2: euro(Math.round(((index * 3571) % 18000 + 1500) / 10) * 10),
    count: (index % 8) + 2,
    pct: ((index * 7) % 25) + 3,
    weeks: ((index * 5) % 11) + 2,
    people: ((index * 37) % 229) + 12,
  }
}

/** The table's one-sentence summary for a seeded document. */
export function seedShortSummary(doc: MetadataDocument, index: number): string {
  const t = TEMPLATES[doc.documentType]
  const f = factsFor(doc, index)
  const text = t ? t.short(f) : `${doc.documentType} for ${f.e} relating to the ${f.s}.`
  return text.slice(0, SHORT_SUMMARY_MAX)
}

/** The extra sentence the preview's summary adds after the short one. */
export function seedSummaryDetail(doc: MetadataDocument, index: number): string {
  const t = TEMPLATES[doc.documentType]
  return t ? t.detail(factsFor(doc, index)) : ''
}
