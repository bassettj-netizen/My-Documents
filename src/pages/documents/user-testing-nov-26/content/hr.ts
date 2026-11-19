import type { AreaArticle, AreaChat, AreaContent, AreaDocument, AreaGuardrailExample } from './types'
import { syncFilesFor } from './types'
import { HR_OFFICE } from './office/hr'
import { MUSTERFIRMA } from './musterfirma'

/**
 * HR: an HR generalist / HR business partner at Brenner Maschinenbau GmbH, a mid-sized mechanical engineering
 * company in Stuttgart (about 650 employees, works council, metal-industry collective agreement). Product: Haufe
 * Personal Office Premium. Both languages share ids, counts and the German company setting; names stay German.
 */

type Lang<T> = { en: T; de: T }
const pick = <T,>(items: Lang<T>[], lang: 'en' | 'de') => items.map(item => item[lang])

// ─── My Documents ─────────────────────────────────────────────────────────────

type DocText = Pick<AreaDocument, 'matterReference' | 'summary' | 'parties' | 'dates'> & { name: string; type: string }
const doc = (id: string, fileFormat: AreaDocument['fileFormat'], fileSize: string, age: number, en: DocText, de: DocText): Lang<AreaDocument> => {
  const build = ({ name, type, ...meta }: DocText): AreaDocument => ({ id, name, documentType: type, fileFormat, fileSize, age, ...meta })
  return { en: build(en), de: build(de) }
}

const DOCUMENTS: Lang<AreaDocument>[] = [
  doc('h1', 'PDF', '410 KB', 1,
    { name: 'Sick note - T. Keller (scan)', type: 'Sick Note', summary: 'Certificate of incapacity for work from 12 to 21 November, marked as a follow-up certificate.', parties: [['Tobias Keller', 'Employee']] },
    { name: 'AU-Bescheinigung - T. Keller (Scan)', type: 'Arbeitsunfähigkeitsbescheinigung', summary: 'Arbeitsunfähigkeit vom 12. bis 21. November, als Folgebescheinigung gekennzeichnet.', parties: [['Tobias Keller', 'Mitarbeiter']] }),
  doc('h2', 'DOCX', '9 KB', 1,
    { name: 'Call notes - onboarding Lisa Brandt', type: 'Meeting Notes', matterReference: 'Onboarding Q4 2026', summary: 'Call with the hiring manager: laptop not ordered yet, buddy still to be named, start date 1 December.', parties: [['Lisa Brandt', 'New hire']], dates: [['First working day', 14, 'deadline']] },
    { name: 'Gesprächsnotiz - Onboarding Lisa Brandt', type: 'Gesprächsnotiz', matterReference: 'Onboarding Q4 2026', summary: 'Telefonat mit der Fachabteilung: Laptop noch nicht bestellt, Pate noch offen, Eintritt zum 1. Dezember.', parties: [['Lisa Brandt', 'Neue Mitarbeiterin']], dates: [['Erster Arbeitstag', 14, 'deadline']] }),
  doc('h3', 'XLSX', '42 KB', 2,
    { name: 'Leave requests December - Production', type: 'Spreadsheet', summary: 'Three of eight shift leads have asked for the same days between Christmas and New Year.', dates: [['Approve by', 5, 'deadline']] },
    { name: 'Urlaubsanträge Dezember - Produktion', type: 'Tabelle', summary: 'Drei von acht Schichtleitern wollen dieselben Tage zwischen Weihnachten und Neujahr freinehmen.', dates: [['Genehmigen bis', 5, 'deadline']] }),
  doc('h4', 'DOCX', '14 KB', 2,
    { name: 'Draft - warning letter - do not send', type: 'Warning Letter', summary: 'Draft warning for repeated lateness. Dates of two of the incidents are still missing.', parties: [['Jonas Weber', 'Employee']] },
    { name: 'Entwurf - Abmahnung - nicht versenden', type: 'Abmahnung', summary: 'Entwurf einer Abmahnung wegen wiederholter Verspätung. Bei zwei Vorfällen fehlt noch das Datum.', parties: [['Jonas Weber', 'Mitarbeiter']] }),
  doc('h5', 'PDF', '230 KB', 3,
    { name: 'Minutes works council meeting 11-2026', type: 'Meeting Minutes', matterReference: 'Works agreement mobile work', summary: 'The works council asks for changes to the draft works agreement on mobile working before it will agree.', parties: [['Betriebsrat Brenner Maschinenbau', 'Works council'], ['Peter Albrecht', 'Chair']], dates: [['Next meeting', 9, 'deadline']] },
    { name: 'Protokoll Betriebsratssitzung 11-2026', type: 'Protokoll', matterReference: 'BV mobiles Arbeiten', summary: 'Der Betriebsrat fordert Änderungen am Entwurf der Betriebsvereinbarung zum mobilen Arbeiten, bevor er zustimmt.', parties: [['Betriebsrat Brenner Maschinenbau', 'Betriebsrat'], ['Peter Albrecht', 'Vorsitzender']], dates: [['Nächste Sitzung', 9, 'deadline']] }),
  doc('h6', 'PDF', '58 KB', 3,
    { name: 'Payroll query - overtime October', type: 'Payroll Query', summary: 'Employee says 11 overtime hours from October are missing from the November payslip.', parties: [['Sandra Hofmann', 'Employee']] },
    { name: 'Rückfrage Lohnabrechnung - Überstunden Oktober', type: 'Rückfrage Entgeltabrechnung', summary: 'Mitarbeiterin meldet, dass 11 Überstunden aus Oktober in der Novemberabrechnung fehlen.', parties: [['Sandra Hofmann', 'Mitarbeiterin']] }),
  doc('h7', 'PDF', '520 KB', 4,
    { name: 'Scan_0117', type: 'Scan' },
    { name: 'Scan_0117', type: 'Scan' }),
  doc('h8', 'DOCX', '22 KB', 4,
    { name: 'Reference draft - Markus Vogel', type: 'Job Reference', matterReference: 'Leaver Markus Vogel', summary: 'Qualified reference for a team lead in logistics. The performance assessment section is not finished.', parties: [['Markus Vogel', 'Employee']], dates: [['Reference due', 10, 'deadline']] },
    { name: 'Zeugnisentwurf - Markus Vogel', type: 'Arbeitszeugnis', matterReference: 'Austritt Markus Vogel', summary: 'Qualifiziertes Zeugnis für einen Teamleiter Logistik. Die Leistungsbeurteilung ist noch nicht fertig.', parties: [['Markus Vogel', 'Mitarbeiter']], dates: [['Zeugnis fällig', 10, 'deadline']] }),
  doc('h9', 'DOCX', '18 KB', 5,
    { name: 'Job advert - payroll accountant (m-f-d)', type: 'Job Advert', matterReference: 'Recruiting payroll 2026', summary: 'Full-time payroll accountant in Stuttgart. Salary range still to be agreed with the head of finance.' },
    { name: 'Stellenanzeige - Entgeltabrechner (m-w-d)', type: 'Stellenanzeige', matterReference: 'Recruiting Entgeltabrechnung 2026', summary: 'Entgeltabrechner:in in Vollzeit, Stuttgart. Gehaltsspanne noch mit der kaufmännischen Leitung abzustimmen.' }),
  doc('h10', 'DOCX', '6 KB', 6,
    { name: 'Untitled document', type: 'Other' },
    { name: 'Unbenanntes Dokument', type: 'Sonstiges' }),
  doc('h11', 'DOCX', '31 KB', 6,
    { name: 'Onboarding checklist - production staff', type: 'Checklist', summary: 'Steps from contract signing to the end of probation, including safety briefing and handing out protective equipment.' },
    { name: 'Onboarding-Checkliste - gewerbliche Mitarbeitende', type: 'Checkliste', summary: 'Schritte von der Vertragsunterschrift bis zum Ende der Probezeit, inklusive Sicherheitsunterweisung und Ausgabe der Schutzausrüstung.' }),
  doc('h12', 'DOCX', '48 KB', 7,
    { name: 'Employment contract - Ayse Demir - draft v2', type: 'Employment Contract', matterReference: 'Onboarding Q1 2027', summary: 'Permanent contract, six-month probation, 35-hour week. The mobile working clause is still from the old template.', parties: [['Ayşe Demir', 'Employee'], ['Brenner Maschinenbau GmbH', 'Employer']], dates: [['Start date', 45, 'deadline']] },
    { name: 'Arbeitsvertrag - Ayse Demir - Entwurf v2', type: 'Arbeitsvertrag', matterReference: 'Onboarding Q1 2027', summary: 'Unbefristeter Vertrag, sechs Monate Probezeit, 35-Stunden-Woche. Die Klausel zum mobilen Arbeiten stammt noch aus der alten Vorlage.', parties: [['Ayşe Demir', 'Mitarbeiterin'], ['Brenner Maschinenbau GmbH', 'Arbeitgeber']], dates: [['Eintrittsdatum', 45, 'deadline']] }),
  doc('h13', 'PDF', '96 KB', 8,
    { name: 'Parental leave request - Felix Neumann', type: 'Parental Leave Request', summary: 'Requests parental leave from 1 February 2027 for twelve months, working 20 hours a week part-time.', parties: [['Felix Neumann', 'Employee']], dates: [['Parental leave starts', 76, 'deadline'], ['Received', -8, 'action']] },
    { name: 'Antrag Elternzeit - Felix Neumann', type: 'Elternzeitantrag', summary: 'Beantragt Elternzeit ab 1. Februar 2027 für zwölf Monate, mit 20 Wochenstunden Teilzeit.', parties: [['Felix Neumann', 'Mitarbeiter']], dates: [['Beginn Elternzeit', 76, 'deadline'], ['Eingegangen', -8, 'action']] }),
  doc('h14', 'DOCX', '17 KB', 9,
    { name: 'Appraisal notes - team Sales North', type: 'Appraisal Notes', matterReference: 'Appraisals 2026', summary: 'Notes from six annual reviews. Two people want to move into key account roles; one asks for part-time.' },
    { name: 'Notizen Mitarbeitergespräche - Team Vertrieb Nord', type: 'Gesprächsnotizen', matterReference: 'Mitarbeitergespräche 2026', summary: 'Notizen aus sechs Jahresgesprächen. Zwei wollen ins Key Account Management, eine Person fragt nach Teilzeit.' }),
  doc('h15', 'PDF', '44 KB', 10,
    { name: 'Email from AOK - forwarded', type: 'Correspondence', parties: [['AOK Baden-Württemberg', 'Health insurer']] },
    { name: 'Mail von der AOK - weitergeleitet', type: 'Korrespondenz', parties: [['AOK Baden-Württemberg', 'Krankenkasse']] }),
  doc('h16', 'DOCX', '12 KB', 11,
    { name: 'BEM invitation - old template', type: 'Template', summary: 'Invitation to an occupational integration management (BEM) meeting under § 167 SGB IX.' },
    { name: 'BEM-Einladung - alte Vorlage', type: 'Vorlage', summary: 'Einladung zum Gespräch im betrieblichen Eingliederungsmanagement nach § 167 SGB IX.' }),
  doc('h17', 'XLSX', '156 KB', 12,
    { name: 'Headcount planning 2027 - working copy', type: 'Spreadsheet', matterReference: 'Budget 2027' },
    { name: 'Personalplanung 2027 - Arbeitskopie', type: 'Tabelle', matterReference: 'Budget 2027' }),
  doc('h18', 'PDF', '81 KB', 13,
    { name: 'Resignation letter - Katharina Schulz', type: 'Resignation Letter', summary: 'Employee resigns with notice to 31 December 2026 and asks for a qualified reference.', parties: [['Katharina Schulz', 'Employee']], dates: [['Received', -13, 'action'], ['Last working day', 44, 'deadline']] },
    { name: 'Kündigungsschreiben - Katharina Schulz', type: 'Eigenkündigung', summary: 'Mitarbeiterin kündigt zum 31. Dezember 2026 und bittet um ein qualifiziertes Zeugnis.', parties: [['Katharina Schulz', 'Mitarbeiterin']], dates: [['Eingegangen', -13, 'action'], ['Letzter Arbeitstag', 44, 'deadline']] }),
  doc('h19', 'DOCX', '15 KB', 14,
    { name: 'Draft - reply to works council on overtime', type: 'Draft Letter', parties: [['Betriebsrat Brenner Maschinenbau', 'Works council']], dates: [['Reply due', 3, 'deadline']] },
    { name: 'Entwurf - Antwort Betriebsrat Mehrarbeit', type: 'Briefentwurf', parties: [['Betriebsrat Brenner Maschinenbau', 'Betriebsrat']], dates: [['Antwort fällig', 3, 'deadline']] }),
  doc('h20', 'PDF', '190 KB', 16,
    { name: 'Training certificate - first aider', type: 'Certificate', dates: [['Completed', -20, 'action']] },
    { name: 'Teilnahmebescheinigung Ersthelfer', type: 'Bescheinigung', dates: [['Abgeschlossen', -20, 'action']] }),
  doc('h21', 'DOCX', '7 KB', 18,
    { name: 'Notes - salary review Q4', type: 'Notes', matterReference: 'Salary review 2027' },
    { name: 'Notizen - Gehaltsrunde Q4', type: 'Notizen', matterReference: 'Gehaltsrunde 2027' }),
  doc('h22', 'XLSX', '64 KB', 19,
    { name: 'Copy of Overtime tracker (1)', type: 'Spreadsheet' },
    { name: 'Kopie von Überstundenliste (1)', type: 'Tabelle' }),
  doc('h23', 'PDF', '38 KB', 21,
    { name: 'Applicant email - question about remote work', type: 'Applicant Enquiry', summary: 'An applicant asks how many days a week can be worked from home in the controlling role.', parties: [['Elena Kowalski', 'Applicant']] },
    { name: 'Bewerbermail - Frage zu Homeoffice', type: 'Bewerberanfrage', summary: 'Eine Bewerberin fragt, wie viele Tage pro Woche im Controlling mobil gearbeitet werden kann.', parties: [['Elena Kowalski', 'Bewerberin']] }),
  doc('h24', 'DOCX', '26 KB', 23,
    { name: 'Fixed-term contract extension - Stefan Richter', type: 'Contract Amendment', summary: 'Extends the fixed-term contract by twelve months without objective reason (§ 14 (2) TzBfG). Must be signed before the current term ends.', parties: [['Stefan Richter', 'Employee']], dates: [['Current term ends', 39, 'deadline']] },
    { name: 'Befristungsverlängerung - Stefan Richter', type: 'Vertragsänderung', summary: 'Verlängert die sachgrundlose Befristung um zwölf Monate (§ 14 Abs. 2 TzBfG). Muss vor Ablauf der laufenden Befristung unterschrieben sein.', parties: [['Stefan Richter', 'Mitarbeiter']], dates: [['Befristung endet', 39, 'deadline']] }),
  doc('h25', 'PDF', '610 KB', 26,
    { name: 'Screenshot - DATEV payroll error', type: 'Screenshot' },
    { name: 'Screenshot - Fehlermeldung DATEV Lohn', type: 'Screenshot' }),
  doc('h26', 'DOCX', '54 KB', 28,
    { name: 'Works agreement mobile work - draft 3', type: 'Works Agreement', matterReference: 'Works agreement mobile work', parties: [['Betriebsrat Brenner Maschinenbau', 'Works council'], ['Brenner Maschinenbau GmbH', 'Employer']] },
    { name: 'Betriebsvereinbarung mobiles Arbeiten - Entwurf 3', type: 'Betriebsvereinbarung', matterReference: 'BV mobiles Arbeiten', parties: [['Betriebsrat Brenner Maschinenbau', 'Betriebsrat'], ['Brenner Maschinenbau GmbH', 'Arbeitgeber']] }),
  doc('h27', 'DOCX', '11 KB', 31,
    { name: 'Draft - do not send', type: 'Correspondence' },
    { name: 'Entwurf - nicht versenden', type: 'Korrespondenz' }),
  doc('h28', 'DOCX', '10 KB', 35,
    { name: 'Exit interview notes - M. Vogel', type: 'Meeting Notes', matterReference: 'Leaver Markus Vogel', parties: [['Markus Vogel', 'Employee']] },
    { name: 'Austrittsgespräch - Notizen M. Vogel', type: 'Gesprächsnotiz', matterReference: 'Austritt Markus Vogel', parties: [['Markus Vogel', 'Mitarbeiter']] }),
  doc('h29', 'PDF', '72 KB', 40,
    { name: 'Pay transparency - information request Miriam Lang', type: 'Information Request', summary: 'Employee asks for the median pay of her comparison group under § 10 EntgTranspG.', parties: [['Miriam Lang', 'Employee'], ['Betriebsrat Brenner Maschinenbau', 'Works council']], dates: [['Reply due', 50, 'deadline']] },
    { name: 'Auskunftsverlangen Entgelttransparenz - Miriam Lang', type: 'Auskunftsverlangen', summary: 'Mitarbeiterin verlangt Auskunft über das Vergleichsentgelt ihrer Vergleichsgruppe nach § 10 EntgTranspG.', parties: [['Miriam Lang', 'Mitarbeiterin'], ['Betriebsrat Brenner Maschinenbau', 'Betriebsrat']], dates: [['Antwort fällig', 50, 'deadline']] }),
  doc('h30', 'XLSX', '88 KB', 52,
    { name: 'Absence overview H1 2026', type: 'Report', summary: 'Sickness rate by department for January to June; highest in assembly at 7.8%.' },
    { name: 'Fehlzeitenübersicht 1. Halbjahr 2026', type: 'Auswertung', summary: 'Krankenquote nach Abteilungen von Januar bis Juni; am höchsten in der Montage mit 7,8 %.' }),
  doc('h31', 'PDF', '120 KB', 64,
    { name: 'Public holidays 2027 - Baden-Wuerttemberg', type: 'Reference' },
    { name: 'Feiertagskalender 2027 - Baden-Württemberg', type: 'Nachschlagewerk' }),
  doc('h32', 'DOCX', '240 KB', 96,
    { name: 'Old job descriptions - archive', type: 'Reference' },
    { name: 'Alte Stellenbeschreibungen - Archiv', type: 'Nachschlagewerk' }),
  doc('h33', 'PDF', '150 KB', 131,
    { name: 'Personnel file checklist - GDPR', type: 'Checklist', summary: 'What may be kept in a personnel file, for how long, and who may see it.' },
    { name: 'Checkliste Personalakte - DSGVO', type: 'Checkliste', summary: 'Was in die Personalakte darf, wie lange es aufbewahrt wird und wer Einsicht hat.' }),
  doc('h34', 'PDF', '390 KB', 198,
    { name: 'Scan_0042', type: 'Scan' },
    { name: 'Scan_0042', type: 'Scan' }),
]

// ─── Guardrails ───────────────────────────────────────────────────────────────

const GUARDRAILS: Lang<AreaGuardrailExample>[] = [
  { en: { category: 'Sources', icon: 'FolderOutlined', text: 'Only answer from the documents in this workspace', why: 'Keeps answers to what HR has checked.' },
    de: { category: 'Quellen', icon: 'FolderOutlined', text: 'Nur aus den Dokumenten dieses Arbeitsbereichs antworten', why: 'Antworten stützen sich nur auf das, was HR geprüft hat.' } },
  { en: { category: 'Privacy', icon: 'LockOutlined', text: 'Never include health data, diagnoses or salaries', why: 'Keeps sensitive employee data out of answers.' },
    de: { category: 'Datenschutz', icon: 'LockOutlined', text: 'Keine Gesundheitsdaten, Diagnosen oder Gehälter nennen', why: 'Hält sensible Mitarbeiterdaten aus den Antworten heraus.' } },
  { en: { category: 'Co-determination', icon: 'UsersOutlined', text: 'Point out when a measure needs the works council’s consent (§ 87 BetrVG)', why: 'Nothing goes ahead without the works council by mistake.' },
    de: { category: 'Mitbestimmung', icon: 'UsersOutlined', text: 'Darauf hinweisen, wenn eine Maßnahme der Zustimmung des Betriebsrats bedarf (§ 87 BetrVG)', why: 'Nichts wird versehentlich am Betriebsrat vorbei umgesetzt.' } },
  { en: { category: 'Citations', icon: 'QuotesOutlined', text: 'Always cite the law, collective agreement or policy behind a statement', why: 'Anyone can check where an answer came from.' },
    de: { category: 'Belege', icon: 'QuotesOutlined', text: 'Für jede Aussage Gesetz, Tarifvertrag oder Richtlinie nennen', why: 'Jede Antwort lässt sich nachprüfen.' } },
  { en: { category: 'Escalation', icon: 'UserArrowTROutlined', text: 'Refer dismissals and settlement agreements to the employment law team', why: 'Hands high-risk cases to the right people.' },
    de: { category: 'Eskalation', icon: 'UserArrowTROutlined', text: 'Kündigungen und Aufhebungsverträge an die Rechtsabteilung verweisen', why: 'Riskante Fälle landen bei den richtigen Leuten.' } },
  { en: { category: 'Tone', icon: 'CommentOutlined', text: 'Write letters to employees in a formal tone (Sie)', why: 'Keeps every draft in the company’s voice.' },
    de: { category: 'Tonalität', icon: 'CommentOutlined', text: 'Schreiben an Mitarbeitende immer in der Sie-Form', why: 'Jeder Entwurf klingt nach Ihrem Unternehmen.' } },
]

// ─── CoPilot ──────────────────────────────────────────────────────────────────

const chat = (id: string, day: AreaChat['day'], en: [string, string, string], de: [string, string, string]): Lang<AreaChat> => ({
  en: { id, day, title: en[0], question: en[1], answer: en[2] },
  de: { id, day, title: de[0], question: de[1], answer: de[2] },
})

const CHATS: Lang<AreaChat>[] = [
  chat('hr-today-1', 'today',
    ['Overlapping holiday requests',
      'Three shift leads want the same days off between Christmas and New Year. How do I decide?',
      'Holiday requests have to be granted unless **urgent operational needs** or the **requests of other employees who take priority on social grounds** stand against them (§ 7 (1) BUrlG). Social grounds include school-age children, a partner’s fixed holiday or how much leave each person has already had at popular times. If none of them has priority, agree a rota for the coming years and **record the reason** for your decision. If you have a works council, general holiday principles are subject to co-determination (§ 87 (1) no. 5 BetrVG).'],
    ['Überschneidende Urlaubsanträge',
      'Drei Schichtleiter wollen dieselben Tage zwischen Weihnachten und Neujahr freinehmen. Wie entscheide ich?',
      'Urlaub ist zu gewähren, sofern keine **dringenden betrieblichen Belange** oder **Urlaubswünsche anderer Arbeitnehmer, die unter sozialen Gesichtspunkten Vorrang verdienen**, entgegenstehen (§ 7 Abs. 1 BUrlG). Zu berücksichtigen sind etwa schulpflichtige Kinder, feste Urlaubszeiten des Partners oder wie oft jemand in den Vorjahren zu begehrten Zeiten Urlaub hatte. Hat niemand Vorrang, vereinbaren Sie am besten ein rollierendes Verfahren für die kommenden Jahre und **dokumentieren Sie die Begründung**. Allgemeine Urlaubsgrundsätze unterliegen der Mitbestimmung des Betriebsrats (§ 87 Abs. 1 Nr. 5 BetrVG).']),
  chat('hr-today-2', 'today',
    ['Sick during holiday',
      'An employee fell ill during his holiday and sent a sick note. Does he get those days back?',
      'Yes. Days of illness during holiday that are **confirmed by a medical certificate** are not counted as holiday (§ 9 BUrlG). The employee keeps those days and can take them later, but he **may not simply extend his holiday** — the new dates have to be requested and approved as usual. For statutory health insurance patients, retrieve the **electronic certificate (eAU)** from the health insurer.'],
    ['Krank im Urlaub',
      'Ein Mitarbeiter ist im Urlaub krank geworden und hat eine AU geschickt. Bekommt er die Tage zurück?',
      'Ja. Tage der Arbeitsunfähigkeit während des Urlaubs, die **durch ärztliches Zeugnis nachgewiesen** sind, werden nicht auf den Jahresurlaub angerechnet (§ 9 BUrlG). Der Mitarbeiter behält diese Tage, darf den Urlaub aber **nicht eigenmächtig verlängern** – die Nachholtage müssen wie üblich beantragt und genehmigt werden. Bei gesetzlich Versicherten rufen Sie die **elektronische AU (eAU)** bei der Krankenkasse ab.']),
  chat('hr-yesterday-1', 'yesterday',
    ['Reference for a team lead',
      'How do I word the performance assessment in a reference for a team lead who was good but not outstanding?',
      'A **good** overall rating is usually expressed as “**always to our full satisfaction**”. Back it up with two or three concrete results, for example how the team’s output or sickness rate developed, and describe leadership separately: how he motivated, developed and informed his team. Keep the wording **truthful and benevolent** (§ 109 GewO) and avoid coded phrases that read negatively on closer inspection.'],
    ['Zeugnis für einen Teamleiter',
      'Wie formuliere ich die Leistungsbeurteilung im Zeugnis eines Teamleiters, der gut, aber nicht herausragend war?',
      'Eine **gute** Gesamtbewertung wird üblicherweise mit „**stets zu unserer vollen Zufriedenheit**“ ausgedrückt. Belegen Sie sie mit zwei oder drei konkreten Ergebnissen, etwa zur Entwicklung von Leistung oder Krankenquote im Team, und beschreiben Sie das Führungsverhalten gesondert: wie er sein Team motiviert, entwickelt und informiert hat. Das Zeugnis muss **wahr und wohlwollend** sein (§ 109 GewO); verschlüsselte, bei genauem Lesen negative Formulierungen sind unzulässig.']),
  chat('hr-yesterday-2', 'yesterday',
    ['Extending a fixed-term contract',
      'Can I extend a fixed-term contract without objective reason for another year?',
      'Without an objective reason, a fixed-term contract may last **up to two years in total** and be **extended up to three times** within that period (§ 14 (2) TzBfG). The extension must be **agreed in writing before the current term ends** and may only change the end date — any other change at the same time counts as a new contract and makes the fixed term invalid. Also check that the employee **wasn’t employed by you before**.'],
    ['Befristung verlängern',
      'Kann ich eine sachgrundlose Befristung um ein weiteres Jahr verlängern?',
      'Ohne Sachgrund ist eine Befristung **bis zu zwei Jahren** zulässig und kann innerhalb dieses Zeitraums **höchstens dreimal verlängert** werden (§ 14 Abs. 2 TzBfG). Die Verlängerung muss **vor Ablauf der laufenden Befristung schriftlich vereinbart** werden und darf nur das Enddatum ändern – werden zugleich andere Bedingungen geändert, gilt das als Neuabschluss und die Befristung ist unwirksam. Prüfen Sie außerdem, ob **bereits zuvor ein Arbeitsverhältnis** mit Ihnen bestand.']),
  chat('hr-yesterday-3', 'yesterday',
    ['Mobile work and the works council',
      'Do we need the works council to agree to our new mobile working rules?',
      'Yes — the **design of mobile work carried out using information and communication technology** is subject to co-determination (§ 87 (1) no. 14 BetrVG). That covers things like availability, working-time recording and how equipment is provided; **whether** mobile work is offered at all remains the employer’s decision. In practice, a **works agreement** is the usual way to settle it, and related points such as time recording (no. 2) and technical monitoring (no. 6) are often agreed in the same document.'],
    ['Mobiles Arbeiten und Betriebsrat',
      'Muss der Betriebsrat unseren neuen Regeln zum mobilen Arbeiten zustimmen?',
      'Ja – die **Ausgestaltung mobiler Arbeit, die mittels Informations- und Kommunikationstechnik erbracht wird**, ist mitbestimmungspflichtig (§ 87 Abs. 1 Nr. 14 BetrVG). Dazu gehören etwa Erreichbarkeit, Arbeitszeiterfassung und die Bereitstellung von Arbeitsmitteln; **ob** mobiles Arbeiten überhaupt angeboten wird, entscheidet weiterhin der Arbeitgeber. In der Praxis wird das in einer **Betriebsvereinbarung** geregelt, oft zusammen mit Arbeitszeit (Nr. 2) und technischer Überwachung (Nr. 6).']),
]

const article = (keywords: RegExp, en: [string, string], de: [string, string], general?: boolean): Lang<AreaArticle> => ({
  en: { keywords, title: en[0], excerpt: en[1], ...(general ? { general } : {}) },
  de: { keywords, title: de[0], excerpt: de[1], ...(general ? { general } : {}) },
})

const ARTICLES: Lang<AreaArticle>[] = [
  article(/holiday|vacation|annual leave|urlaub/i,
    ['Annual leave: scheduling, carry-over and expiry | Lexicon', 'Leave must be granted at the time the employee asks unless urgent operational needs or other employees’ requests with social priority stand against it (§ 7 (1) BUrlG). Leave not taken expires at the end of the year or, if carried over, on 31 March — but only if the employer has told the employee in good time and asked them to take it.'],
    ['Urlaub: Festlegung, Übertragung und Verfall | Lexikon', 'Urlaub ist zum gewünschten Zeitpunkt zu gewähren, sofern keine dringenden betrieblichen Belange oder sozial vorrangige Wünsche anderer Arbeitnehmer entgegenstehen (§ 7 Abs. 1 BUrlG). Nicht genommener Urlaub verfällt zum Jahresende bzw. bei Übertragung zum 31. März – aber nur, wenn der Arbeitgeber rechtzeitig darauf hingewiesen und zur Inanspruchnahme aufgefordert hat.']),
  article(/sick|ill(ness)?\b|incapacity|krank|arbeitsunf(ä|ae)hig|(^|[^a-z])e?au([^a-z]|$)/i,
    ['Incapacity for work: certificates, eAU and continued pay | Lexicon', 'Employees must report incapacity for work immediately and, if it lasts more than three calendar days, have it confirmed by a doctor (§ 5 EFZG). For people with statutory health insurance, the employer retrieves the electronic certificate (eAU) from the insurer. Pay continues for up to six weeks per illness (§ 3 EFZG).'],
    ['Arbeitsunfähigkeit: Nachweis, eAU und Entgeltfortzahlung | Lexikon', 'Arbeitnehmer müssen eine Arbeitsunfähigkeit unverzüglich melden und sie bei mehr als drei Kalendertagen ärztlich feststellen lassen (§ 5 EFZG). Bei gesetzlich Versicherten ruft der Arbeitgeber die elektronische AU (eAU) bei der Krankenkasse ab. Das Entgelt wird je Erkrankung bis zu sechs Wochen fortgezahlt (§ 3 EFZG).']),
  article(/reference|testimonial|zeugnis/i,
    ['Job reference: entitlement, form and wording | Article', 'Employees are entitled to a written reference when they leave (§ 109 GewO) and can ask for a qualified one covering performance and conduct. It must be truthful and benevolent; coded wording that is negative on closer reading is not allowed. An interim reference can be requested for good reason, such as a new manager.'],
    ['Arbeitszeugnis: Anspruch, Form und Formulierungen | Fachbeitrag', 'Beschäftigte haben beim Ausscheiden Anspruch auf ein schriftliches Zeugnis (§ 109 GewO) und können ein qualifiziertes Zeugnis über Leistung und Verhalten verlangen. Es muss wahr und wohlwollend sein; verschlüsselte, bei genauem Lesen negative Formulierungen sind unzulässig. Ein Zwischenzeugnis kann bei berechtigtem Interesse verlangt werden, etwa bei einem Vorgesetztenwechsel.']),
  article(/warning|abmahnung|late(ness)?|versp(ä|ae)t/i,
    ['Warning letter: requirements and template | Work aid', 'A valid warning names the specific breach with date and facts, asks the employee to comply in future and states that a repeat may lead to dismissal. A general complaint without these elements does not count as a warning. Keep a copy in the personnel file and note how it was delivered.'],
    ['Abmahnung: Voraussetzungen und Muster | Arbeitshilfe', 'Eine wirksame Abmahnung benennt den konkreten Pflichtverstoß mit Datum und Sachverhalt, fordert zu künftig vertragstreuem Verhalten auf und kündigt für den Wiederholungsfall arbeitsrechtliche Konsequenzen an. Eine allgemeine Beanstandung ohne diese Elemente ist keine Abmahnung. Legen Sie eine Kopie zur Personalakte und dokumentieren Sie den Zugang.']),
  article(/fixed.?term|temporary contract|extension|befrist|verl(ä|ae)ngerung/i,
    ['§ 14 TzBfG: fixed-term contracts with and without objective reason | Commentary', 'Without an objective reason, a fixed-term contract may run for up to two years and be extended up to three times within that period (§ 14 (2) TzBfG). It is not allowed if the employee has worked for the same employer before. The fixed term must be agreed in writing before work starts (§ 14 (4) TzBfG).'],
    ['§ 14 TzBfG: Befristung mit und ohne Sachgrund | Kommentar', 'Ohne Sachgrund ist eine Befristung bis zur Dauer von zwei Jahren zulässig und kann bis zu dieser Gesamtdauer höchstens dreimal verlängert werden (§ 14 Abs. 2 TzBfG). Sie ist unzulässig, wenn mit demselben Arbeitgeber bereits zuvor ein Arbeitsverhältnis bestanden hat. Die Befristung bedarf der Schriftform vor Arbeitsantritt (§ 14 Abs. 4 TzBfG).']),
  article(/works council|co.?determination|works agreement|mobile|remote|home.?office|betriebsrat|mitbestimm|betriebsvereinbarung|mobil/i,
    ['§ 87 BetrVG: the works council’s rights of co-determination | Commentary', 'The works council has a right of co-determination in social matters such as working hours, holiday principles, technical monitoring and the design of mobile work (§ 87 (1) nos. 2, 5, 6 and 14 BetrVG). Measures taken without its consent are invalid towards employees. If the parties cannot agree, the conciliation committee decides.'],
    ['§ 87 BetrVG: Mitbestimmungsrechte des Betriebsrats | Kommentar', 'Der Betriebsrat hat in sozialen Angelegenheiten mitzubestimmen, etwa bei Arbeitszeit, Urlaubsgrundsätzen, technischer Überwachung und der Ausgestaltung mobiler Arbeit (§ 87 Abs. 1 Nr. 2, 5, 6 und 14 BetrVG). Maßnahmen ohne seine Zustimmung sind gegenüber den Beschäftigten unwirksam. Kommt keine Einigung zustande, entscheidet die Einigungsstelle.']),
  article(/parental|paternity|maternity|eltern|mutterschutz/i,
    ['Parental leave: request, deadlines and protection against dismissal | Lexicon', 'Parental leave must be requested in writing seven weeks before it starts in the child’s first three years, and thirteen weeks before for later periods (§ 16 BEEG). From the request onwards, the employee is protected against dismissal. Part-time work of up to 32 hours a week is possible during parental leave.'],
    ['Elternzeit: Antrag, Fristen und Kündigungsschutz | Lexikon', 'Elternzeit muss für die ersten drei Lebensjahre sieben Wochen, für spätere Zeiträume dreizehn Wochen vor Beginn schriftlich verlangt werden (§ 16 BEEG). Ab dem Verlangen besteht Sonderkündigungsschutz. Während der Elternzeit ist Teilzeit bis zu 32 Wochenstunden möglich.']),
  article(/pay|salary|wage|transparen|entgelt|gehalt|lohn/i,
    ['Pay transparency: information requests and the new EU directive | Article', 'In companies with more than 200 employees, staff can ask for the median pay of a comparison group of the opposite sex (§ 10 EntgTranspG). The EU Pay Transparency Directive, to be transposed by June 2026, extends this to salary ranges in job adverts, a ban on asking about previous pay and regular gender pay gap reporting.'],
    ['Entgelttransparenz: Auskunftsanspruch und neue EU-Richtlinie | Fachbeitrag', 'In Betrieben mit mehr als 200 Beschäftigten können Mitarbeitende Auskunft über das Vergleichsentgelt der jeweils anderen Geschlechtsgruppe verlangen (§ 10 EntgTranspG). Die bis Juni 2026 umzusetzende EU-Entgelttransparenzrichtlinie erweitert das um Gehaltsspannen in Stellenanzeigen, ein Verbot der Frage nach dem bisherigen Gehalt und regelmäßige Berichte zum Gender Pay Gap.']),
  article(/contract|onboarding|new hire|probation|arbeitsvertrag|vertrag|einarbeitung|probezeit|nachweis/i,
    ['Employment contract: content, form and the Nachweisgesetz | Work aid', 'The essential terms of employment — start date, pay, working hours, holiday, notice periods and the probation period — must be given in writing by the first working day at the latest (§ 2 NachwG). A probation period of up to six months can be agreed; during it, either side may give two weeks’ notice (§ 622 (3) BGB).'],
    ['Arbeitsvertrag: Inhalt, Form und Nachweisgesetz | Arbeitshilfe', 'Die wesentlichen Arbeitsbedingungen – Beginn, Entgelt, Arbeitszeit, Urlaub, Kündigungsfristen und Probezeit – sind spätestens am ersten Arbeitstag schriftlich auszuhändigen (§ 2 NachwG). Eine Probezeit von bis zu sechs Monaten kann vereinbart werden; in dieser Zeit gilt eine Kündigungsfrist von zwei Wochen (§ 622 Abs. 3 BGB).'], true),
  article(/personnel file|gdpr|data protection|retention|personalakte|dsgvo|datenschutz|aufbewahrung/i,
    ['Personnel file: content, retention and data protection | Article', 'Only data needed for the employment relationship belongs in the personnel file (§ 26 BDSG). Employees may inspect their file at any time (§ 83 BetrVG). Health data such as diagnoses must be kept separately with restricted access, and most documents are deleted once retention periods have ended.'],
    ['Personalakte: Inhalt, Aufbewahrung und Datenschutz | Fachbeitrag', 'In die Personalakte gehören nur Daten, die für das Beschäftigungsverhältnis erforderlich sind (§ 26 BDSG). Beschäftigte können jederzeit Einsicht nehmen (§ 83 BetrVG). Gesundheitsdaten wie Diagnosen sind gesondert und mit eingeschränktem Zugriff aufzubewahren; die meisten Unterlagen werden nach Ablauf der Aufbewahrungsfristen gelöscht.'], true),
]

// ─── Uploads ──────────────────────────────────────────────────────────────────

const TYPE_RULES: [RegExp, string, string][] = [
  [/arbeitsunf(ä|ae)hig|(^|[^a-z])e?au([^a-z]|$)|sick.?note|krankmeldung|medical.?cert/i, 'Sick Note', 'Arbeitsunfähigkeitsbescheinigung'],
  [/befristungsverl(ä|ae)ngerung|contract.?extension|extension/i, 'Contract Amendment', 'Vertragsänderung'],
  [/arbeitsvertrag|employment.?contract/i, 'Employment Contract', 'Arbeitsvertrag'],
  [/aufhebungsvertrag|settlement.?agreement|termination.?agreement/i, 'Settlement Agreement', 'Aufhebungsvertrag'],
  [/betriebsvereinbarung|works.?agreement|(^|[^a-z])bv([^a-z]|$)/i, 'Works Agreement', 'Betriebsvereinbarung'],
  [/abmahnung|warning/i, 'Warning Letter', 'Abmahnung'],
  [/eigenk(ü|ue)ndigung|resignation/i, 'Resignation Letter', 'Eigenkündigung'],
  [/k(ü|ue)ndigung|dismissal|notice.?of.?termination/i, 'Notice of Dismissal', 'Kündigung'],
  [/zwischenzeugnis|interim.?reference/i, 'Interim Reference', 'Zwischenzeugnis'],
  [/zeugnis|reference|testimonial/i, 'Job Reference', 'Arbeitszeugnis'],
  [/elternzeit|parental.?leave/i, 'Parental Leave Request', 'Elternzeitantrag'],
  [/urlaubsantr|urlaub|leave.?request|holiday.?request/i, 'Leave Request', 'Urlaubsantrag'],
  [/feiertag|public.?holiday/i, 'Holiday Calendar', 'Feiertagskalender'],
  [/r(ü|ue)ckfrage|payroll.?query|pay.?query/i, 'Payroll Query', 'Rückfrage Entgeltabrechnung'],
  [/auskunft|information.?request|data.?request/i, 'Information Request', 'Auskunftsverlangen'],
  [/fehlzeit|absence|krankenquote|sickness.?rate/i, 'Absence Report', 'Fehlzeitenauswertung'],
  [/personalplanung|headcount|stellenplan/i, 'Headcount Plan', 'Personalplanung'],
  [/gehaltsabrechnung|lohnabrechnung|entgeltabrechnung|payslip|pay.?slip/i, 'Payslip', 'Entgeltabrechnung'],
  [/stellenanzeige|stellenausschreibung|job.?ad|vacancy/i, 'Job Advert', 'Stellenanzeige'],
  [/bewerbung|lebenslauf|application|(^|[^a-z])cv([^a-z]|$)|resume/i, 'Application', 'Bewerbung'],
  [/onboarding|einarbeitung/i, 'Onboarding Plan', 'Einarbeitungsplan'],
  [/mitarbeitergespr(ä|ae)ch|jahresgespr(ä|ae)ch|appraisal|performance.?review/i, 'Appraisal Notes', 'Gesprächsnotizen'],
  [/(^|[^a-z])bem([^a-z]|$)|eingliederung|reintegration/i, 'BEM Documentation', 'BEM-Dokumentation'],
  [/betriebsrat|works.?council/i, 'Works Council Correspondence', 'Schreiben Betriebsrat'],
  [/protokoll|minutes|meeting/i, 'Meeting Minutes', 'Protokoll'],
  [/stellenbeschreibung|job.?description/i, 'Job Description', 'Stellenbeschreibung'],
  [/personalakte|personnel.?file/i, 'Personnel File', 'Personalakte'],
  [/checkliste|checklist/i, 'Checklist', 'Checkliste'],
  [/richtlinie|policy|leitfaden|guideline/i, 'Policy', 'Richtlinie'],
  [/bescheinigung|zertifikat|certificate/i, 'Certificate', 'Bescheinigung'],
  [/vertrag|contract|agreement/i, 'Contract', 'Vertrag'],
  [/notiz|notes/i, 'Notes', 'Notizen'],
  [/brief|schreiben|letter|mail/i, 'Letter', 'Schreiben'],
  [/screenshot/i, 'Screenshot', 'Screenshot'],
  [/scan/i, 'Scan', 'Scan'],
]

const TOPICS: [RegExp, string, string][] = [
  [/urlaub|holiday.?request|vacation|annual.?leave|leave.?request/i, 'annual leave', 'Urlaub'],
  [/krank|(^|[^a-z])e?au([^a-z]|$)|sick|fehlzeit|absence/i, 'sickness absence', 'Arbeitsunfähigkeit'],
  [/elternzeit|parental|mutterschutz|maternity/i, 'parental leave', 'Elternzeit'],
  [/(ü|ue)berstunden|mehrarbeit|overtime|arbeitszeit|working.?time/i, 'working time and overtime', 'Arbeitszeit und Überstunden'],
  [/lohn|gehalt|entgelt|payroll|salary|pay/i, 'pay and payroll', 'Entgelt und Abrechnung'],
  [/befrist|fixed.?term/i, 'fixed-term employment', 'Befristung'],
  [/mobil|homeoffice|home.?office|remote/i, 'mobile working', 'mobiles Arbeiten'],
  [/onboarding|einarbeitung|probezeit|probation/i, 'onboarding and probation', 'Einarbeitung und Probezeit'],
  [/k(ü|ue)ndigung|austritt|offboarding|dismissal|resignation|leaver/i, 'leaving the company', 'Austritt'],
  [/recruiting|bewerb|stellenanzeige|applicant|job.?ad/i, 'recruiting', 'Recruiting'],
]

const PARTIES: [RegExp, { name: string; role: Lang<string> }][] = [
  [/betriebsrat|works.?council/i, { name: 'Betriebsrat Brenner Maschinenbau', role: { en: 'Works council', de: 'Betriebsrat' } }],
  [/(^|[^a-z])aok([^a-z]|$)/i, { name: 'AOK Baden-Württemberg', role: { en: 'Health insurer', de: 'Krankenkasse' } }],
  [/(^|[^a-z])tk([^a-z]|$)|techniker/i, { name: 'Techniker Krankenkasse', role: { en: 'Health insurer', de: 'Krankenkasse' } }],
  [/rentenversicherung|(^|[^a-z])drv([^a-z]|$)|pension/i, { name: 'Deutsche Rentenversicherung', role: { en: 'Pension insurer', de: 'Rentenversicherungsträger' } }],
  [/arbeitsagentur|agentur.?f(ü|ue)r.?arbeit|employment.?agency/i, { name: 'Agentur für Arbeit Stuttgart', role: { en: 'Employment agency', de: 'Behörde' } }],
  [/datev/i, { name: 'DATEV eG', role: { en: 'Payroll software provider', de: 'Softwareanbieter' } }],
  [/keller/i, { name: 'Tobias Keller', role: { en: 'Employee', de: 'Mitarbeiter' } }],
  [/brandt/i, { name: 'Lisa Brandt', role: { en: 'New hire', de: 'Neue Mitarbeiterin' } }],
  [/vogel/i, { name: 'Markus Vogel', role: { en: 'Employee', de: 'Mitarbeiter' } }],
  [/demir/i, { name: 'Ayşe Demir', role: { en: 'Employee', de: 'Mitarbeiterin' } }],
  [/schulz/i, { name: 'Katharina Schulz', role: { en: 'Employee', de: 'Mitarbeiterin' } }],
]

// ─── Assemble ─────────────────────────────────────────────────────────────────

function build(lang: 'en' | 'de'): Omit<AreaContent, 'profile' | 'syncFiles'> {
  const en = lang === 'en'
  return {
    areaLabel: en ? 'HR' : 'Personal',
    product: { name: 'Haufe Personal Office Premium', shortName: 'Personal Office', icon: '/user-testing-nov-26/product-icons/personal-office.png' },
    myDocuments: pick(DOCUMENTS, lang),

    workspaces: {
      createIntro: en
        ? 'Bring together everything about one employee, team or HR project — documents, background and rules — so your apps can answer with the full picture.'
        : 'Bündeln Sie alles zu einem Mitarbeiter, einem Team oder einem HR-Projekt – Dokumente, Hintergrund und Regeln –, damit Ihre Apps mit dem ganzen Bild antworten.',
      equation: en
        ? { workspaceText: 'Contracts, notes and policies for one employee, team or project', haufeText: 'Haufe Personal Office expertise in employment law, payroll and HR practice', resultTitle: 'Advice that fits the case', resultText: 'Answers that fit your case, with sources you can check' }
        : { workspaceText: 'Verträge, Notizen und Richtlinien zu einem Mitarbeiter, Team oder Projekt', haufeText: 'Fachwissen aus dem Haufe Personal Office zu Arbeitsrecht, Entgelt und HR-Praxis', resultTitle: 'Rat, der zum Fall passt', resultText: 'Antworten, die zu Ihrem Fall passen – mit nachprüfbaren Quellen' },
      guardrailExamples: pick(GUARDRAILS, lang),
      previewGuardrails: en
        ? ['Never include health data or salaries', 'Point out when the works council must agree', 'Write to employees in a formal tone']
        : ['Keine Gesundheitsdaten oder Gehälter nennen', 'Auf Mitbestimmung des Betriebsrats hinweisen', 'Mitarbeitende immer siezen'],
      profileLabels: en
        ? ['Department', 'Employees', 'Location', 'Collective agreement', 'Works council', 'Contact person']
        : ['Abteilung', 'Mitarbeitende', 'Standort', 'Tarifvertrag', 'Betriebsrat', 'Ansprechpartner'],
      matterPlaceholder: en ? 'e.g. Onboarding Q1 2027' : 'z. B. Onboarding Q1 2027',
      tryAsking: name => en
        ? `Which deadlines are coming up in ${name}, and what do I need to prepare?`
        : `Welche Fristen stehen in „${name}“ an, und was muss ich vorbereiten?`,
    },

    copilot: {
      chats: pick(CHATS, lang),
      genericAdvice: en
        ? 'I’d check the relevant employment law provisions and any works agreement or internal policy on file, then confirm against the employee’s actual record before finalising anything.'
        : 'Ich würde die einschlägigen arbeitsrechtlichen Vorschriften sowie vorhandene Betriebsvereinbarungen und interne Richtlinien prüfen und das Ergebnis vor einer Entscheidung mit der Personalakte des Mitarbeiters abgleichen.',
      simulatedNote: en
        ? 'Simulated response for prototyping — connect a real assistant to answer from actual HR records.'
        : 'Simulierte Antwort für den Prototyp – für echte Antworten aus Ihren Personalunterlagen muss ein echter Assistent angebunden werden.',
      articles: pick(ARTICLES, lang),
      fileExcerpts: en
        ? [
            '“The probation period is six months. During this time, either party may terminate the employment relationship with two weeks’ notice.”',
            '“Mobile working is possible on up to two days a week by agreement with the line manager. Core hours of 9:00 to 15:00 apply.”',
            '“Holiday requests for the period from 22 December to 2 January must be submitted by 15 October.”',
          ]
        : [
            '„Die Probezeit beträgt sechs Monate. Während dieser Zeit kann das Arbeitsverhältnis von beiden Seiten mit einer Frist von zwei Wochen gekündigt werden.“',
            '„Mobiles Arbeiten ist nach Absprache mit der Führungskraft an bis zu zwei Tagen pro Woche möglich. Es gilt eine Kernarbeitszeit von 9:00 bis 15:00 Uhr.“',
            '„Urlaubsanträge für den Zeitraum vom 22. Dezember bis 2. Januar sind bis zum 15. Oktober einzureichen.“',
          ],
      fixedReply: MUSTERFIRMA.hr[lang],
    },

    office: HR_OFFICE[lang],

    uploads: {
      typeRules: TYPE_RULES.map(([re, e, d]) => [re, en ? e : d]),
      topics: TOPICS.map(([re, e, d]) => [re, en ? e : d]),
      parties: PARTIES.map(([re, p]) => [re, { name: p.name, role: p.role[lang] }]),
      matters: en
        ? ['Onboarding Q1 2027', 'Works agreement mobile work', 'Appraisals 2026', 'Salary review 2027', 'Leaver Markus Vogel']
        : ['Onboarding Q1 2027', 'BV mobiles Arbeiten', 'Mitarbeitergespräche 2026', 'Gehaltsrunde 2027', 'Austritt Markus Vogel'],
      counterparties: [
        { name: 'Betriebsrat Brenner Maschinenbau', role: en ? 'Works council' : 'Betriebsrat' },
        { name: 'AOK Baden-Württemberg', role: en ? 'Health insurer' : 'Krankenkasse' },
        { name: 'Deutsche Rentenversicherung', role: en ? 'Pension insurer' : 'Rentenversicherungsträger' },
        { name: 'Agentur für Arbeit Stuttgart', role: en ? 'Employment agency' : 'Behörde' },
      ],
      primaryRole: en ? 'Employee' : 'Mitarbeiter:in',
      deadlineLabels: en ? ['Reply due', 'Probation ends', 'Review by'] : ['Antwort fällig', 'Ende Probezeit', 'Prüfen bis'],
      actionLabels: en ? ['Received', 'Signed', 'Filed in personnel file'] : ['Eingegangen', 'Unterschrieben', 'Zur Personalakte genommen'],
    },
  }
}

// ─── Workspace profile wording and connected-app documents ───────────────────

const SYNC_ROWS: Parameters<typeof syncFilesFor>[0] = {
  sharepoint: [
    ['Works agreement mobile work 2026', 'Betriebsvereinbarung mobiles Arbeiten 2026', 'PDF'], ['Onboarding checklist production', 'Onboarding-Checkliste Produktion', 'DOCX'], ['Headcount plan 2027', 'Stellenplan 2027', 'XLSX'],
    ['Leave policy', 'Urlaubsrichtlinie', 'PDF'], ['Employment contract template full time', 'Arbeitsvertrag Vorlage Vollzeit', 'DOCX'], ['Works council minutes October 2026', 'Protokoll Betriebsratssitzung Oktober 2026', 'DOCX'],
    ['Travel expenses policy', 'Reisekostenrichtlinie', 'PDF'], ['Appraisal form 2026', 'Mitarbeitergespräch Formular 2026', 'DOCX'], ['Training budget 2027', 'Weiterbildungsbudget 2027', 'XLSX'],
  ],
  googleDrive: [
    ['Job advert payroll accountant', 'Stellenanzeige Lohnbuchhalter', 'DOCX'], ['Interview notes - Sarah Becker', 'Interviewnotizen - Sarah Becker', 'DOCX'], ['Applicant overview Q4', 'Bewerberübersicht Q4', 'XLSX'],
    ['Employer branding ideas', 'Ideen Employer Branding', 'DOCX'], ['Offer letter - Jonas Wolf', 'Angebotsschreiben - Jonas Wolf', 'PDF'], ['Holiday planner 2027', 'Urlaubsplaner 2027', 'XLSX'],
    ['Team event planning', 'Planung Teamevent', 'DOCX'], ['Exit interview template', 'Vorlage Austrittsgespräch', 'DOCX'], ['Onboarding schedule January', 'Einarbeitungsplan Januar', 'XLSX'],
  ],
  datev: [
    ['Payslip October 2026', 'Lohnabrechnung Oktober 2026', 'PDF'], ['Payroll journal Q3 2026', 'Lohnjournal Q3 2026', 'XLSX'], ['Social security report 09 2026', 'SV-Meldung 09 2026', 'PDF'],
    ['Payroll tax certificate 2025', 'Lohnsteuerbescheinigung 2025', 'PDF'], ['Wage type overview 2026', 'Lohnartenübersicht 2026', 'XLSX'], ['Contribution statement health insurer', 'Beitragsnachweis Krankenkasse', 'PDF'],
    ['Payroll tax return 10 2026', 'Lohnsteuer-Anmeldung 10 2026', 'PDF'], ['Holiday entitlement overview', 'Urlaubsanspruch Übersicht', 'XLSX'], ['Company pension list', 'bAV-Liste', 'XLSX'],
  ],
}

const PROFILE_AND_SYNC: Record<'en' | 'de', Pick<AreaContent, 'profile' | 'syncFiles'>> = {
  en: {
    profile: {
      listDescription: 'Shared documents everyone with access can rely on, brought together with an employee’s, team’s or HR project’s context and rules — for accurate, in-context answers.',
      backgroundDescription: 'What your apps should know about this employee, team or HR project — who it is, what matters, how you like to work.',
      backgroundPlaceholder: 'e.g. Production team of 40 in Stuttgart, shift work, works agreement on overtime applies, team lead prefers short written summaries…',
      detailsDescription: 'Facts about the workspace itself, such as personnel number, cost centre or contact person.',
      detailLabelPlaceholder: 'e.g. Cost centre',
      detailValuePlaceholder: 'e.g. 4120',
    },
    syncFiles: syncFilesFor(SYNC_ROWS, 'en'),
  },
  de: {
    profile: {
      listDescription: 'Gemeinsame Dokumente, auf die sich alle mit Zugriff verlassen können – zusammen mit dem Kontext und den Regeln zu einer Person, einem Team oder einem HR-Projekt. Für genaue Antworten, die zum Fall passen.',
      backgroundDescription: 'Was Ihre Apps über diese Person, dieses Team oder dieses HR-Projekt wissen sollten – wer es ist, worauf es ankommt, wie Sie arbeiten möchten.',
      backgroundPlaceholder: 'z. B. Produktionsteam mit 40 Beschäftigten in Stuttgart, Schichtbetrieb, Betriebsvereinbarung zu Überstunden gilt, Teamleitung bevorzugt kurze schriftliche Zusammenfassungen …',
      detailsDescription: 'Fakten zum Arbeitsbereich selbst, etwa Personalnummer, Kostenstelle oder Ansprechperson.',
      detailLabelPlaceholder: 'z. B. Kostenstelle',
      detailValuePlaceholder: 'z. B. 4120',
    },
    syncFiles: syncFilesFor(SYNC_ROWS, 'de'),
  },
}

export const HR: { en: AreaContent; de: AreaContent } = {
  en: { ...build('en'), ...PROFILE_AND_SYNC.en },
  de: { ...build('de'), ...PROFILE_AND_SYNC.de },
}
