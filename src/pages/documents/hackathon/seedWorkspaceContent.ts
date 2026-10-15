import type { WorkspaceExtras } from './workspaceModel'

/**
 * Hackathon Oct '26 — prefilled content for Metadata Table's workspaces in Versions 6 (English) and 7
 * (German): a background and details, guardrails, bookmarks and templates for My knowledge, and CoPilot
 * chats, Haufe Zeugnismanager references and HR Dokumente for Haufe knowledge. All made up.
 *
 * The chats are real CoPilot conversations (`chatSessions`) with the same ids as the workspace's chat
 * list, so opening one from Haufe knowledge lands on it in CoPilot.
 */

export type SeedLang = 'en' | 'de'

const DAY = 86_400_000
const ago = (days: number) => Date.now() - days * DAY

type SeedChat = { id: string; spaceId: string; daysAgo: number; title: string; question: string; answer: string }

type SeedContent = {
  // Background text per workspace id (the workspace's own `context` field).
  backgroundBySpace: Record<string, string>
  extrasBySpace: Record<string, WorkspaceExtras>
  chats: SeedChat[]
}

const SIMULATED = {
  en: '\n\n(Simulated response for prototyping — connect a real assistant to answer from actual HR records.)',
  de: '\n\n(Simulierte Antwort für den Prototyp – verbinden Sie einen echten Assistenten, um aus echten HR-Daten zu antworten.)',
}

const CONTENT: Record<SeedLang, SeedContent> = {
  en: {
    backgroundBySpace: {
      'space-acme': 'Mid-size manufacturing client since 2021. We handle tax advisory and compliance for the German entity; the fiscal year ends on 30 June. Prefers short written summaries over calls — the main contact is the CFO.',
      'space-alpha': 'Internal project to rewrite the company\'s HR policy handbook by the end of Q1 2027. Owned by People Operations; every draft goes to the works council for review before it\'s published.',
      'space-hr': 'The HR team\'s workspace for policies, compliance guides and employee documentation. Around 400 employees in Germany, with a works council in place.',
    },
    extrasBySpace: {
      'space-acme': {
        details: [
          { id: 'acme-d1', label: 'Client number', value: '10442' },
          { id: 'acme-d2', label: 'Contact person', value: 'Dr. Lena Hoffmann (CFO)' },
          { id: 'acme-d3', label: 'Fiscal year end', value: '30 June' },
          { id: 'acme-d4', label: 'Tax office', value: 'Finanzamt Freiburg-Stadt' },
        ],
        guardrails: [
          { id: 'acme-g1', text: 'Only answer from the documents in this workspace', enabled: true },
          { id: 'acme-g2', text: 'Always cite the source for every statement', enabled: true },
          { id: 'acme-g3', text: 'Never mention figures from other clients', enabled: true },
          { id: 'acme-g4', text: 'Answer in German', enabled: false },
        ],
        bookmarks: [
          { id: 'acme-b1', title: 'Acme tax SharePoint site', url: 'https://acmecorp.sharepoint.com/sites/tax', app: 'SharePoint' },
          { id: 'acme-b2', title: 'Compliance calendar', url: 'https://acme.atlassian.net/wiki/spaces/COMP', app: 'Confluence' },
          { id: 'acme-b3', title: 'Open tax queries', url: 'https://acme.atlassian.net/jira/software/projects/TAX', app: 'Jira' },
        ],
        templates: [
          { id: 'acme-t1', name: 'Tax advisory engagement letter', app: 'Microsoft Word', description: 'Scope, fees and responsibilities for the annual engagement' },
          { id: 'acme-t2', name: 'Monthly compliance report', app: 'Personal Office', description: 'Open items, deadlines and changes in the law' },
        ],
        chats: [],
        haufeDocuments: [
          { id: 'acme-h1', app: 'hr-dokumente', kind: 'contract', title: 'Fixed-term contract — project accountant for Acme', createdAt: ago(3) },
          { id: 'acme-h2', app: 'zeugnismanager', kind: 'reference', title: 'Interim reference — S. Wagner (Acme account lead)', createdAt: ago(9) },
        ],
      },
      'space-alpha': {
        details: [
          { id: 'alpha-d1', label: 'Project lead', value: 'Mara Klein' },
          { id: 'alpha-d2', label: 'Deadline', value: '31 March 2027' },
          { id: 'alpha-d3', label: 'Cost centre', value: '4711' },
        ],
        guardrails: [
          { id: 'alpha-g1', text: 'Follow the company style guide for policy wording', enabled: true },
          { id: 'alpha-g2', text: 'Flag anything that needs works council consultation', enabled: true },
        ],
        bookmarks: [
          { id: 'alpha-b1', title: 'Policy handbook drafts', url: 'https://company.atlassian.net/wiki/spaces/POLICY', app: 'Confluence' },
          { id: 'alpha-b2', title: 'Project Alpha board', url: 'https://company.atlassian.net/jira/software/projects/ALPHA', app: 'Jira' },
        ],
        templates: [
          { id: 'alpha-t1', name: 'Policy document', app: 'Microsoft Word', description: 'House layout for every policy in the handbook' },
          { id: 'alpha-t2', name: 'Works council information letter', app: 'Personal Office', description: 'Informing the works council about a new or changed policy' },
        ],
        chats: [],
        haufeDocuments: [
          { id: 'alpha-h1', app: 'hr-dokumente', kind: 'contract', title: 'Remote work agreement — draft for the handbook', createdAt: ago(2) },
          { id: 'alpha-h2', app: 'hr-dokumente', kind: 'letter', title: 'Works council information — new travel policy', createdAt: ago(6) },
          { id: 'alpha-h3', app: 'zeugnismanager', kind: 'reference', title: 'Job reference — former project assistant', createdAt: ago(14) },
        ],
      },
      'space-hr': {
        details: [
          { id: 'hr-d1', label: 'Employees', value: 'about 400' },
          { id: 'hr-d2', label: 'Works council chair', value: 'Jonas Weber' },
          { id: 'hr-d3', label: 'HR contact', value: 'hr@company.example' },
        ],
        guardrails: [
          { id: 'hr-g1', text: 'Never include personal data such as salaries or health information', enabled: true },
          { id: 'hr-g2', text: 'Always cite the source for every statement', enabled: true },
          { id: 'hr-g3', text: 'Point to the relevant works agreement where one exists', enabled: true },
        ],
        bookmarks: [
          { id: 'hr-b1', title: 'HR SharePoint site', url: 'https://haufe.sharepoint.com/sites/hr', app: 'SharePoint' },
          { id: 'hr-b2', title: 'Personal Office — job references', url: 'https://products.haufe.de/personal-office/arbeitszeugnis', app: 'Personal Office' },
          { id: 'hr-b3', title: 'HR team channel', url: 'https://teams.microsoft.com/l/channel/hr-team', app: 'Microsoft Teams' },
        ],
        templates: [
          { id: 'hr-t1', name: 'Employment contract (permanent)', app: 'Personal Office', description: 'Standard contract for permanent employees' },
          { id: 'hr-t2', name: 'Warning letter', app: 'Personal Office', description: 'Formal warning with the facts and consequences' },
          { id: 'hr-t3', name: 'Job reference letter', app: 'Other', description: 'Qualified reference, created in Haufe Zeugnismanager' },
        ],
        chats: [],
        haufeDocuments: [
          { id: 'hr-h1', app: 'zeugnismanager', kind: 'reference', title: 'Job reference letter — M. Schneider', createdAt: ago(1) },
          { id: 'hr-h2', app: 'hr-dokumente', kind: 'warning', title: 'Warning letter — repeated unexcused lateness', createdAt: ago(2) },
          { id: 'hr-h3', app: 'zeugnismanager', kind: 'reference', title: 'Interim reference — A. Koch', createdAt: ago(5) },
          { id: 'hr-h4', app: 'hr-dokumente', kind: 'contract', title: 'Fixed-term employment contract — J. Weber', createdAt: ago(8) },
        ],
      },
    },
    chats: [
      { id: 'seed-chat-acme-1', spaceId: 'space-acme', daysAgo: 0, title: 'VAT on Acme\'s deliveries to Austria',
        question: 'How should Acme treat VAT on its deliveries to business customers in Austria?',
        answer: 'Deliveries to VAT-registered business customers in another EU country are generally **tax-free intra-community supplies** (§ 4 Nr. 1b, § 6a UStG), provided Acme has the customer\'s valid VAT ID and proof that the goods left Germany. Acme must also report them in its recapitulative statement (Zusammenfassende Meldung).' },
      { id: 'seed-chat-acme-2', spaceId: 'space-acme', daysAgo: 4, title: 'Deadline for Acme\'s annual tax return',
        question: 'When is Acme\'s corporate tax return for the last fiscal year due?',
        answer: 'With a fiscal year ending 30 June and a tax adviser involved, the return is due by the **last day of the 14th month** after the end of the calendar year in which the fiscal year ended — so for FY ending June 2026, by **28 February 2028**.' },
      { id: 'seed-chat-alpha-1', spaceId: 'space-alpha', daysAgo: 1, title: 'What a remote work policy must cover',
        question: 'What does our remote work policy need to cover?',
        answer: 'At minimum: **who is eligible**, how many days, **working time recording**, availability, equipment and costs, **data protection and IT security**, occupational health and safety at home, and how to end the arrangement. Mobile work arrangements are subject to works council co-determination (§ 87 Abs. 1 Nr. 14 BetrVG).' },
      { id: 'seed-chat-alpha-2', spaceId: 'space-alpha', daysAgo: 6, title: 'Works council steps for a new policy',
        question: 'Which steps do we need with the works council before publishing a new policy?',
        answer: 'Inform the works council **early and in full**, check whether the topic is subject to **co-determination** (e.g. § 87 BetrVG), and if so agree it — ideally as a works agreement — before it takes effect. Keep a record of the consultation.' },
      { id: 'seed-chat-hr-1', spaceId: 'space-hr', daysAgo: 0, title: 'Can we extend the probation period?',
        question: 'Can we extend an employee\'s probation period if we\'re still unsure after six months?',
        answer: 'No — the probation period with the shortened notice period is capped at **six months** (§ 622 Abs. 3 BGB). If more time is genuinely needed, options are a fixed-term arrangement with its own review point, or deciding within the existing window.' },
      { id: 'seed-chat-hr-2', spaceId: 'space-hr', daysAgo: 1, title: 'Notice period for parental leave',
        question: 'How much notice does an employee need to give before parental leave?',
        answer: '**7 weeks** before the start for leave in the child\'s first three years, and **13 weeks** for leave between the 3rd and 8th birthday. The request must be in writing and state which periods are being claimed.' },
      { id: 'seed-chat-hr-3', spaceId: 'space-hr', daysAgo: 3, title: 'Warning letter for repeated lateness',
        question: 'Draft a warning letter for repeated unexcused lateness.',
        answer: '"Dear [Employee], on [dates] you started work after your scheduled start time without notice or an approved reason. This breaches your obligations under your employment contract. We formally warn you that any further unexcused lateness may lead to further steps, up to and including termination."' },
    ],
  },

  de: {
    backgroundBySpace: {
      'space-acme': 'Mittelständischer Fertigungsmandant seit 2021. Wir übernehmen Steuerberatung und Compliance für die deutsche Gesellschaft; das Wirtschaftsjahr endet am 30. Juni. Bevorzugt kurze schriftliche Zusammenfassungen statt Telefonaten – Hauptansprechpartnerin ist die CFO.',
      'space-alpha': 'Internes Projekt, das das Personalhandbuch bis Ende Q1 2027 neu fasst. Verantwortlich ist People Operations; jeder Entwurf geht vor der Veröffentlichung zur Prüfung an den Betriebsrat.',
      'space-hr': 'Arbeitsbereich des HR-Teams für Richtlinien, Compliance-Leitfäden und Mitarbeiterdokumentation. Rund 400 Beschäftigte in Deutschland, ein Betriebsrat ist gewählt.',
    },
    extrasBySpace: {
      'space-acme': {
        details: [
          { id: 'acme-d1', label: 'Mandantennummer', value: '10442' },
          { id: 'acme-d2', label: 'Ansprechpartnerin', value: 'Dr. Lena Hoffmann (CFO)' },
          { id: 'acme-d3', label: 'Ende des Wirtschaftsjahres', value: '30. Juni' },
          { id: 'acme-d4', label: 'Finanzamt', value: 'Finanzamt Freiburg-Stadt' },
        ],
        guardrails: [
          { id: 'acme-g1', text: 'Nur aus den Dokumenten dieses Arbeitsbereichs antworten', enabled: true },
          { id: 'acme-g2', text: 'Für jede Aussage immer die Quelle angeben', enabled: true },
          { id: 'acme-g3', text: 'Niemals Zahlen anderer Mandanten nennen', enabled: true },
          { id: 'acme-g4', text: 'Auf Englisch antworten', enabled: false },
        ],
        bookmarks: [
          { id: 'acme-b1', title: 'SharePoint-Website Steuern (Acme)', url: 'https://acmecorp.sharepoint.com/sites/tax', app: 'SharePoint' },
          { id: 'acme-b2', title: 'Compliance-Kalender', url: 'https://acme.atlassian.net/wiki/spaces/COMP', app: 'Confluence' },
          { id: 'acme-b3', title: 'Offene Steuerfragen', url: 'https://acme.atlassian.net/jira/software/projects/TAX', app: 'Jira' },
        ],
        templates: [
          { id: 'acme-t1', name: 'Auftragsbestätigung Steuerberatung', app: 'Microsoft Word', description: 'Umfang, Honorar und Pflichten für das jährliche Mandat' },
          { id: 'acme-t2', name: 'Monatlicher Compliance-Bericht', app: 'Personal Office', description: 'Offene Punkte, Fristen und Gesetzesänderungen' },
        ],
        chats: [],
        haufeDocuments: [
          { id: 'acme-h1', app: 'hr-dokumente', kind: 'contract', title: 'Befristeter Vertrag – Projektbuchhalter:in für Acme', createdAt: ago(3) },
          { id: 'acme-h2', app: 'zeugnismanager', kind: 'reference', title: 'Zwischenzeugnis – S. Wagner (Mandatsleitung Acme)', createdAt: ago(9) },
        ],
      },
      'space-alpha': {
        details: [
          { id: 'alpha-d1', label: 'Projektleitung', value: 'Mara Klein' },
          { id: 'alpha-d2', label: 'Frist', value: '31. März 2027' },
          { id: 'alpha-d3', label: 'Kostenstelle', value: '4711' },
        ],
        guardrails: [
          { id: 'alpha-g1', text: 'Formulierungen nach dem Styleguide des Unternehmens', enabled: true },
          { id: 'alpha-g2', text: 'Auf alles hinweisen, was eine Beteiligung des Betriebsrats erfordert', enabled: true },
        ],
        bookmarks: [
          { id: 'alpha-b1', title: 'Entwürfe Personalhandbuch', url: 'https://company.atlassian.net/wiki/spaces/POLICY', app: 'Confluence' },
          { id: 'alpha-b2', title: 'Projektboard Alpha', url: 'https://company.atlassian.net/jira/software/projects/ALPHA', app: 'Jira' },
        ],
        templates: [
          { id: 'alpha-t1', name: 'Richtliniendokument', app: 'Microsoft Word', description: 'Hauslayout für jede Richtlinie im Handbuch' },
          { id: 'alpha-t2', name: 'Information an den Betriebsrat', app: 'Personal Office', description: 'Den Betriebsrat über eine neue oder geänderte Richtlinie informieren' },
        ],
        chats: [],
        haufeDocuments: [
          { id: 'alpha-h1', app: 'hr-dokumente', kind: 'contract', title: 'Vereinbarung mobiles Arbeiten – Entwurf fürs Handbuch', createdAt: ago(2) },
          { id: 'alpha-h2', app: 'hr-dokumente', kind: 'letter', title: 'Information an den Betriebsrat – neue Reiserichtlinie', createdAt: ago(6) },
          { id: 'alpha-h3', app: 'zeugnismanager', kind: 'reference', title: 'Arbeitszeugnis – ehemalige Projektassistenz', createdAt: ago(14) },
        ],
      },
      'space-hr': {
        details: [
          { id: 'hr-d1', label: 'Beschäftigte', value: 'rund 400' },
          { id: 'hr-d2', label: 'Betriebsratsvorsitz', value: 'Jonas Weber' },
          { id: 'hr-d3', label: 'HR-Kontakt', value: 'hr@company.example' },
        ],
        guardrails: [
          { id: 'hr-g1', text: 'Niemals personenbezogene Daten wie Gehälter oder Gesundheitsdaten nennen', enabled: true },
          { id: 'hr-g2', text: 'Für jede Aussage immer die Quelle angeben', enabled: true },
          { id: 'hr-g3', text: 'Auf die passende Betriebsvereinbarung verweisen, wo es eine gibt', enabled: true },
        ],
        bookmarks: [
          { id: 'hr-b1', title: 'SharePoint-Website HR', url: 'https://haufe.sharepoint.com/sites/hr', app: 'SharePoint' },
          { id: 'hr-b2', title: 'Personal Office – Arbeitszeugnisse', url: 'https://products.haufe.de/personal-office/arbeitszeugnis', app: 'Personal Office' },
          { id: 'hr-b3', title: 'Teams-Kanal HR-Team', url: 'https://teams.microsoft.com/l/channel/hr-team', app: 'Microsoft Teams' },
        ],
        templates: [
          { id: 'hr-t1', name: 'Arbeitsvertrag (unbefristet)', app: 'Personal Office', description: 'Standardvertrag für unbefristet Beschäftigte' },
          { id: 'hr-t2', name: 'Abmahnung', app: 'Personal Office', description: 'Förmliche Abmahnung mit Sachverhalt und Konsequenzen' },
          { id: 'hr-t3', name: 'Arbeitszeugnis', app: 'Andere', description: 'Qualifiziertes Zeugnis, erstellt im Haufe Zeugnismanager' },
        ],
        chats: [],
        haufeDocuments: [
          { id: 'hr-h1', app: 'zeugnismanager', kind: 'reference', title: 'Arbeitszeugnis – M. Schneider', createdAt: ago(1) },
          { id: 'hr-h2', app: 'hr-dokumente', kind: 'warning', title: 'Abmahnung – wiederholte unentschuldigte Verspätung', createdAt: ago(2) },
          { id: 'hr-h3', app: 'zeugnismanager', kind: 'reference', title: 'Zwischenzeugnis – A. Koch', createdAt: ago(5) },
          { id: 'hr-h4', app: 'hr-dokumente', kind: 'contract', title: 'Befristeter Arbeitsvertrag – J. Weber', createdAt: ago(8) },
        ],
      },
    },
    chats: [
      { id: 'seed-chat-acme-1', spaceId: 'space-acme', daysAgo: 0, title: 'Umsatzsteuer auf Acmes Lieferungen nach Österreich',
        question: 'Wie behandelt Acme die Umsatzsteuer auf Lieferungen an Unternehmenskunden in Österreich?',
        answer: 'Lieferungen an Unternehmer mit gültiger USt-IdNr. in einem anderen EU-Staat sind in der Regel **steuerfreie innergemeinschaftliche Lieferungen** (§ 4 Nr. 1b, § 6a UStG) – vorausgesetzt, Acme liegt die USt-IdNr. des Kunden und ein Nachweis über die Warenbewegung ins Ausland vor. Die Lieferungen gehören außerdem in die Zusammenfassende Meldung.' },
      { id: 'seed-chat-acme-2', spaceId: 'space-acme', daysAgo: 4, title: 'Abgabefrist für Acmes Steuererklärung',
        question: 'Bis wann muss Acmes Körperschaftsteuererklärung für das letzte Wirtschaftsjahr abgegeben werden?',
        answer: 'Bei einem Wirtschaftsjahr bis 30. Juni und Beratung durch einen Steuerberater endet die Frist mit dem **letzten Tag des 14. Monats** nach Ablauf des Kalenderjahres, in dem das Wirtschaftsjahr endet – für das Wirtschaftsjahr bis Juni 2026 also am **28. Februar 2028**.' },
      { id: 'seed-chat-alpha-1', spaceId: 'space-alpha', daysAgo: 1, title: 'Was eine Richtlinie zum mobilen Arbeiten regeln muss',
        question: 'Was muss unsere Richtlinie zum mobilen Arbeiten abdecken?',
        answer: 'Mindestens: **wer teilnehmen darf**, wie viele Tage, **Arbeitszeiterfassung**, Erreichbarkeit, Ausstattung und Kosten, **Datenschutz und IT-Sicherheit**, Arbeitsschutz zu Hause und wie die Regelung endet. Mobiles Arbeiten unterliegt der Mitbestimmung des Betriebsrats (§ 87 Abs. 1 Nr. 14 BetrVG).' },
      { id: 'seed-chat-alpha-2', spaceId: 'space-alpha', daysAgo: 6, title: 'Schritte mit dem Betriebsrat bei neuer Richtlinie',
        question: 'Welche Schritte brauchen wir mit dem Betriebsrat, bevor wir eine neue Richtlinie veröffentlichen?',
        answer: 'Den Betriebsrat **frühzeitig und umfassend** informieren, prüfen, ob das Thema **mitbestimmungspflichtig** ist (z. B. § 87 BetrVG), und es dann – am besten als Betriebsvereinbarung – vor Inkrafttreten vereinbaren. Die Beteiligung dokumentieren.' },
      { id: 'seed-chat-hr-1', spaceId: 'space-hr', daysAgo: 0, title: 'Können wir die Probezeit verlängern?',
        question: 'Können wir die Probezeit verlängern, wenn wir nach sechs Monaten noch unsicher sind?',
        answer: 'Nein – die Probezeit mit verkürzter Kündigungsfrist ist auf **sechs Monate** begrenzt (§ 622 Abs. 3 BGB). Braucht es wirklich mehr Zeit, bleiben eine Befristung mit eigenem Prüfzeitpunkt oder eine Entscheidung innerhalb der bestehenden Frist.' },
      { id: 'seed-chat-hr-2', spaceId: 'space-hr', daysAgo: 1, title: 'Ankündigungsfrist für die Elternzeit',
        question: 'Mit welcher Frist muss die Elternzeit angekündigt werden?',
        answer: '**7 Wochen** vor Beginn bei Elternzeit in den ersten drei Lebensjahren, **13 Wochen** bei Elternzeit zwischen dem 3. und 8. Geburtstag. Das Verlangen muss schriftlich erfolgen und die Zeiträume benennen.' },
      { id: 'seed-chat-hr-3', spaceId: 'space-hr', daysAgo: 3, title: 'Abmahnung wegen wiederholter Verspätung',
        question: 'Entwirf eine Abmahnung wegen wiederholter unentschuldigter Verspätung.',
        answer: '„Sehr geehrte/r [Name], am [Daten] haben Sie Ihre Arbeit ohne Ankündigung oder genehmigten Grund nach Ihrem Arbeitsbeginn aufgenommen. Damit verletzen Sie Ihre arbeitsvertraglichen Pflichten. Wir mahnen Sie hiermit ab und weisen darauf hin, dass weitere unentschuldigte Verspätungen arbeitsrechtliche Konsequenzen bis hin zur Kündigung haben können.“' },
    ],
  },
}

/** My knowledge and Haufe knowledge for each prefilled workspace, with the chats listed under their workspace. */
export function seedExtras(lang: SeedLang): Record<string, WorkspaceExtras> {
  const content = CONTENT[lang]
  return Object.fromEntries(Object.entries(content.extrasBySpace).map(([spaceId, extras]) => [spaceId, {
    ...extras,
    chats: content.chats.filter(c => c.spaceId === spaceId).map(c => ({ id: c.id, title: c.title, createdAt: ago(c.daysAgo) })),
  }]))
}

export function seedBackground(lang: SeedLang, spaceId: string): string | undefined {
  return CONTENT[lang].backgroundBySpace[spaceId]
}

/** The prefilled chats as CoPilot conversations, for the page to build its sessions from. */
export function seedChats(lang: SeedLang) {
  return CONTENT[lang].chats.map(c => ({ ...c, answer: c.answer + SIMULATED[lang] }))
}
