import type { AreaArticle, AreaChat, AreaContent, AreaDocument, AreaGuardrailExample, AreaUploads } from './types'
import { syncFilesFor } from './types'
import { TAX_OFFICE } from './office/tax'
import { MUSTERFIRMA } from './musterfirma'

/**
 * Tax: a tax adviser (Steuerberaterin) at Lang & Partner Steuerberatungsgesellschaft in Freiburg, advising
 * mid-sized companies and their owners. The setting is German in both languages; the English side is the same content
 * translated.
 *
 * Shared rows hold both languages as [en, de] pairs, so ids, structure and counts can't drift apart.
 */

type Pair = [en: string, de: string]
type Lang = 0 | 1

// ─── Organisations and roles ──────────────────────────────────────────────────

const ROLE = {
  taxOffice: ['Tax authority', 'Finanzbehörde'],
  client: ['Client', 'Mandant'],
  sender: ['Sender', 'Absender'],
  taxpayer: ['Taxpayer', 'Steuerpflichtiger'],
  colleague: ['Colleague', 'Kollegin'],
  auditor: ['Auditor', 'Abschlussprüfer'],
  court: ['Court', 'Gericht'],
  chamber: ['Chamber', 'Kammer'],
  provider: ['Software provider', 'Softwareanbieter'],
  bank: ['Bank', 'Bank'],
} satisfies Record<string, Pair>

const FA = 'Finanzamt Freiburg-Stadt'
const FG = 'Finanzgericht Baden-Württemberg'
const STBK = 'Steuerberaterkammer Südbaden'
const C1 = 'Kaiser Holzbau GmbH'
const C2 = 'Dr. Miriam Roth'
const C3 = 'Sommer & Vogt Gastro GbR'
const C4 = 'Albrecht Medizintechnik GmbH'

// ─── My Documents ─────────────────────────────────────────────────────────────

type DocRow = {
  id: string
  f: AreaDocument['fileFormat']
  size: string
  age: number
  name: Pair
  type: Pair
  ref?: Pair
  sum?: Pair
  parties?: [string, Pair][]
  dates?: [Pair, number, 'deadline' | 'action'][]
}

// Patchy on purpose: notices from the tax office mostly have a sender and a date; notes and drafts often only a
// summary or a client reference; scans, screenshots and untitled files nothing at all.
const DOCS: DocRow[] = [
  { id: 'p1', f: 'DOCX', size: '10 KB', age: 1,
    name: ['Call notes - Kaiser Holzbau re managing director salary', 'Gesprächsnotiz - Kaiser Holzbau zum GF-Gehalt'], type: ['Meeting Notes', 'Gesprächsnotiz'],
    ref: ['Kaiser Holzbau – annual accounts 2026', 'Kaiser Holzbau – Jahresabschluss 2026'],
    sum: ['The managing shareholder wants a € 40,000 bonus for 2026. Open question: is that still at arm’s length or a hidden profit distribution?', 'Der Gesellschafter-Geschäftsführer möchte für 2026 eine Tantieme von 40.000 €. Offen: Ist das noch fremdüblich oder eine vGA?'],
    parties: [[C1, ROLE.client]] },
  { id: 'p2', f: 'PDF', size: '286 KB', age: 1,
    name: ['Income tax assessment 2024 - Dr. Roth', 'ESt-Bescheid 2024 - Dr. Roth'], type: ['Tax Assessment', 'Steuerbescheid'],
    ref: ['Dr. Roth – income tax 2024', 'Dr. Roth – Einkommensteuer 2024'],
    sum: ['The tax office did not accept the home office costs of € 3,840 and only allowed the daily flat rate. The assessed tax is € 1,620 higher than filed.', 'Das Finanzamt erkennt die Kosten für das häusliche Arbeitszimmer von 3.840 € nicht an und setzt nur die Tagespauschale an. Die Steuer liegt 1.620 € über der Erklärung.'],
    parties: [[FA, ROLE.sender], [C2, ROLE.taxpayer]], dates: [[['Objection deadline', 'Einspruchsfrist'], 26, 'deadline']] },
  { id: 'p3', f: 'XLSX', size: '42 KB', age: 2,
    name: ['Deadline list - December 2026', 'Fristenliste - Dezember 2026'], type: ['Deadline Overview', 'Fristenübersicht'] },
  { id: 'p4', f: 'PDF', size: '198 KB', age: 2,
    name: ['Audit order - Albrecht Medizintechnik 2022–2024', 'Prüfungsanordnung - Albrecht Medizintechnik 2022–2024'], type: ['Tax Audit Notice', 'Prüfungsanordnung'],
    ref: ['Albrecht – tax audit 2022–2024', 'Albrecht – Betriebsprüfung 2022–2024'],
    sum: ['Audit of corporate tax, trade tax and VAT for 2022 to 2024. The tax office asks for data access and a contact person.', 'Prüfung von Körperschaftsteuer, Gewerbesteuer und Umsatzsteuer 2022 bis 2024. Das Finanzamt bittet um Datenzugriff und eine Auskunftsperson.'],
    parties: [[FA, ROLE.sender], [C4, ROLE.taxpayer]], dates: [[['Audit starts', 'Prüfungsbeginn'], 34, 'deadline']] },
  { id: 'p5', f: 'DOCX', size: '18 KB', age: 3,
    name: ['Objection draft - Dr. Roth home office', 'Einspruch Entwurf - Dr. Roth Arbeitszimmer'], type: ['Objection', 'Einspruch'],
    ref: ['Dr. Roth – income tax 2024', 'Dr. Roth – Einkommensteuer 2024'],
    parties: [[C2, ROLE.client]] },
  { id: 'p6', f: 'PDF', size: '720 KB', age: 3,
    name: ['Screenshot - ELSTER error message', 'Screenshot - ELSTER Fehlermeldung'], type: ['Screenshot', 'Screenshot'] },
  { id: 'p7', f: 'DOCX', size: '4 KB', age: 3,
    name: ['To-do - week 47', 'To-do - KW 47'], type: ['Notes', 'Notiz'] },
  { id: 'p8', f: 'XLSX', size: '64 KB', age: 4,
    name: ['Tax planning 2027 - Kaiser Holzbau - v2', 'Steuerplanung 2027 - Kaiser Holzbau - v2'], type: ['Tax Planning', 'Steuerplanung'],
    sum: ['Comparison of a pension commitment and a bonus for the managing shareholder, with the effect on corporate and trade tax.', 'Vergleich Pensionszusage und Tantieme für den Gesellschafter-Geschäftsführer mit Auswirkung auf Körperschaft- und Gewerbesteuer.'],
    parties: [[C1, ROLE.client]] },
  { id: 'p9', f: 'PDF', size: '74 KB', age: 4,
    name: ['Request for documents - Sommer & Vogt cash register', 'Anforderung Unterlagen - Sommer & Vogt Kasse'], type: ['Information Request', 'Auskunftsersuchen'],
    sum: ['After an unannounced cash inspection, the tax office asks for the cash register’s procedure documentation and the TSE export.', 'Nach einer Kassen-Nachschau fordert das Finanzamt die Verfahrensdokumentation der Kasse und den TSE-Export an.'],
    parties: [[FA, ROLE.sender], [C3, ROLE.taxpayer]], dates: [[['Reply due', 'Antwort bis'], 6, 'deadline']] },
  { id: 'p10', f: 'DOCX', size: '22 KB', age: 5,
    name: ['Engagement letter - Albrecht Medizintechnik - draft', 'Steuerberatungsvertrag - Albrecht Medizintechnik - Entwurf'], type: ['Engagement Letter', 'Mandatsvereinbarung'],
    sum: ['Engagement for bookkeeping, annual accounts and tax returns; fees under the StBVV plus a lump sum for tax audit support.', 'Mandat für Finanzbuchhaltung, Jahresabschluss und Steuererklärungen; Vergütung nach StBVV zuzüglich Pauschale für die Betriebsprüfungsbegleitung.'],
    parties: [[C4, ROLE.client]] },
  { id: 'p11', f: 'DOCX', size: '11 KB', age: 6,
    name: ['Notes - team meeting e-invoicing for clients', 'Notizen - Teambesprechung E-Rechnung Mandanten'], type: ['Meeting Notes', 'Gesprächsnotiz'],
    ref: ['E-invoicing 2027', 'E-Rechnung 2027'],
    sum: ['Which clients have to send e-invoices from 2027? List of clients with turnover over € 800,000 still to be checked.', 'Welche Mandanten müssen ab 2027 E-Rechnungen versenden? Liste der Mandanten mit Umsatz über 800.000 € noch prüfen.'] },
  { id: 'p12', f: 'PDF', size: '610 KB', age: 6,
    name: ['Scan - receipts Dr. Roth (incomplete?)', 'Scan - Belege Dr. Roth (unvollständig?)'], type: ['Scan', 'Scan'] },
  { id: 'p13', f: 'PDF', size: '58 KB', age: 7,
    name: ['Email client - forwarded - selling the company car', 'Mail Mandant - weitergeleitet - Verkauf Firmenwagen'], type: ['Correspondence', 'Korrespondenz'],
    sum: ['The client asks whether VAT is due if the company car is sold to his son.', 'Der Mandant fragt, ob Umsatzsteuer anfällt, wenn der Firmenwagen an seinen Sohn verkauft wird.'],
    parties: [[C1, ROLE.sender]] },
  { id: 'p14', f: 'DOCX', size: '3 KB', age: 7,
    name: ['Reminder - call Ms Vogt about cash book', 'Erinnerung - Frau Vogt wg. Kassenbuch anrufen'], type: ['Reminder', 'Erinnerung'] },
  { id: 'p15', f: 'PDF', size: '132 KB', age: 7,
    name: ['Late filing surcharge - VAT return 2025 Sommer & Vogt', 'Verspätungszuschlag - USt-Erklärung 2025 Sommer & Vogt'], type: ['Tax Notice', 'Steuerbescheid'],
    sum: ['Late filing surcharge of € 500 because the annual VAT return was filed after the deadline.', 'Verspätungszuschlag von 500 €, weil die Umsatzsteuer-Jahreserklärung nach Fristablauf abgegeben wurde.'],
    parties: [[FA, ROLE.sender], [C3, ROLE.taxpayer]], dates: [[['Payment due', 'Zahlbar bis'], 10, 'deadline']] },
  { id: 'p16', f: 'XLSX', size: '96 KB', age: 8,
    name: ['Fixed-asset register Kaiser Holzbau 2026 - working draft', 'Anlagenverzeichnis Kaiser Holzbau 2026 - Arbeitsstand'], type: ['Fixed Asset Register', 'Anlagenverzeichnis'],
    sum: ['Depreciation for 2026 — the new CNC joinery machine is still missing; check the declining-balance option.', 'AfA für 2026 – die neue CNC-Abbundanlage fehlt noch; degressive AfA prüfen.'] },
  { id: 'p17', f: 'DOCX', size: '12 KB', age: 8,
    name: ['Untitled document', 'Unbenanntes Dokument'], type: ['Other', 'Sonstiges'] },
  { id: 'p18', f: 'PDF', size: '340 KB', age: 9,
    name: ['Tax court ruling - home office flat rate', 'FG-Urteil - Homeoffice-Pauschale'], type: ['Court Decision', 'Urteil'],
    ref: ['Dr. Roth – income tax 2024', 'Dr. Roth – Einkommensteuer 2024'],
    parties: [[FG, ROLE.court]] },
  { id: 'p19', f: 'PDF', size: '260 KB', age: 9,
    name: ['Corporate tax assessment 2024 - Kaiser Holzbau', 'KSt-Bescheid 2024 - Kaiser Holzbau'], type: ['Tax Assessment', 'Steuerbescheid'],
    ref: ['Kaiser Holzbau – corporate tax 2024', 'Kaiser Holzbau – Körperschaftsteuer 2024'],
    sum: ['Assessed as filed, subject to review (§ 164 AO).', 'Erklärungsgemäß veranlagt, unter dem Vorbehalt der Nachprüfung (§ 164 AO).'],
    parties: [[FA, ROLE.sender], [C1, ROLE.taxpayer]], dates: [[['Received', 'Eingegangen'], -9, 'action']] },
  { id: 'p20', f: 'XLSX', size: '31 KB', age: 10,
    name: ['Trial balance Sept 2026 Albrecht - DATEV export', 'Summen- und Saldenliste 09-2026 Albrecht - DATEV-Export'], type: ['Trial Balance', 'Summen- und Saldenliste'],
    ref: ['Albrecht – monthly bookkeeping', 'Albrecht – laufende Buchhaltung'] },
  { id: 'p21', f: 'DOCX', size: '13 KB', age: 10,
    name: ['Draft - do not send', 'Entwurf - nicht versenden'], type: ['Correspondence', 'Korrespondenz'] },
  { id: 'p22', f: 'PDF', size: '1.3 MB', age: 13,
    name: ['Receipts Sommer & Vogt October - scanned', 'Belege Sommer & Vogt Oktober - gescannt'], type: ['Scan', 'Scan'] },
  { id: 'p23', f: 'PDF', size: '180 KB', age: 12,
    name: ['Advance ruling application - Albrecht restructuring', 'Antrag verbindliche Auskunft - Umstrukturierung Albrecht'], type: ['Ruling Application', 'Antrag verbindliche Auskunft'],
    sum: ['Application for a binding ruling on spinning off the service division tax-neutrally (§ 15 UmwStG).', 'Antrag auf verbindliche Auskunft zur steuerneutralen Abspaltung des Servicebereichs (§ 15 UmwStG).'],
    parties: [[C4, ROLE.client], [FA, ROLE.taxOffice]], dates: [[['Submitted', 'Eingereicht'], -12, 'action']] },
  { id: 'p24', f: 'PDF', size: '44 KB', age: 14,
    name: ['ELSTER filing confirmation - VAT October Albrecht', 'Übermittlungsprotokoll ELSTER - USt-VA Oktober Albrecht'], type: ['Confirmation', 'Bestätigung'],
    parties: [[FA, ROLE.sender]], dates: [[['Filed', 'Übermittelt'], -14, 'action']] },
  { id: 'p25', f: 'PDF', size: '150 KB', age: 15,
    name: ['Letter from tax office - unread', 'Schreiben Finanzamt - ungelesen'], type: ['Tax Notice', 'Schreiben Finanzamt'],
    parties: [[FA, ROLE.sender]] },
  { id: 'p26', f: 'XLSX', size: '1.9 MB', age: 16,
    name: ['Client list with turnover (copy)', 'Mandantenliste mit Umsätzen (Kopie)'], type: ['Spreadsheet', 'Tabelle'] },
  { id: 'p27', f: 'PDF', size: '96 KB', age: 18,
    name: ['Query - input VAT Kaiser Holzbau Q2', 'Rückfrage - Vorsteuer Kaiser Holzbau Q2'], type: ['Information Request', 'Auskunftsersuchen'],
    sum: ['The tax office asks for the invoices behind € 24,000 of input VAT from the purchase of a used truck.', 'Das Finanzamt bittet um die Rechnungen zu 24.000 € Vorsteuer aus dem Kauf eines gebrauchten Lkw.'],
    parties: [[FA, ROLE.sender], [C1, ROLE.taxpayer]], dates: [[['Reply due', 'Antwort bis'], 4, 'deadline']] },
  { id: 'p28', f: 'DOCX', size: '26 KB', age: 17,
    name: ['Power of attorney - Sommer & Vogt - unsigned', 'Vollmacht - Sommer & Vogt - nicht unterschrieben'], type: ['Power of Attorney', 'Vollmacht'],
    parties: [[C3, ROLE.client]] },
  { id: 'p29', f: 'XLSX', size: '108 KB', age: 20,
    name: ['Income tax calculation 2025 - copy - do not edit', 'ESt-Berechnung 2025 - Kopie - nicht bearbeiten'], type: ['Spreadsheet', 'Tabelle'] },
  { id: 'p30', f: 'DOCX', size: '8 KB', age: 22,
    name: ['Working notes - year-end letter to clients', 'Arbeitsnotizen - Mandantenrundschreiben Jahreswechsel'], type: ['Notes', 'Notiz'],
    ref: ['Year end 2026/2027', 'Jahreswechsel 2026/2027'] },
  { id: 'p31', f: 'PDF', size: '92 KB', age: 24,
    name: ['Correspondence auditor - Albrecht - thread export', 'Korrespondenz Abschlussprüfer - Albrecht - Verlauf exportiert'], type: ['Correspondence', 'Korrespondenz'],
    parties: [['Kessler Treuhand GmbH', ROLE.auditor]] },
  { id: 'p32', f: 'DOCX', size: '15 KB', age: 29,
    name: ['Draft memo - property tax objections', 'Entwurf Memo - Grundsteuer-Einsprüche'], type: ['Memo', 'Memo'],
    sum: ['Which clients’ property tax assessments are still open, and is an objection worthwhile after the latest BFH decisions?', 'Bei welchen Mandanten sind die Grundsteuerbescheide noch offen, und lohnt ein Einspruch nach den aktuellen BFH-Entscheidungen?'] },
  { id: 'p33', f: 'PDF', size: '1.7 MB', age: 34,
    name: ['Copy of copy of annual accounts 2025 Kaiser', 'Kopie von Kopie Jahresabschluss 2025 Kaiser'], type: ['Scan', 'Scan'] },
  { id: 'p34', f: 'XLSX', size: '7 KB', age: 38,
    name: ['Untitled spreadsheet', 'Unbenannte Tabelle'], type: ['Spreadsheet', 'Tabelle'] },
  { id: 'p35', f: 'PDF', size: '210 KB', age: 58,
    name: ['Certificate - CPD seminar international tax', 'Teilnahmebescheinigung - Fortbildung Internationales Steuerrecht'], type: ['Certificate', 'Zertifikat'],
    parties: [[STBK, ROLE.chamber]], dates: [[['Completed', 'Abgeschlossen'], -58, 'action']] },
  { id: 'p36', f: 'XLSX', size: '29 KB', age: 73,
    name: ['Tax deadline calendar 2026', 'Steuerterminkalender 2026'], type: ['Reference', 'Übersicht'] },
  { id: 'p37', f: 'XLSX', size: '17 KB', age: 147,
    name: ['Old client list - archive', 'Alte Mandantenliste - Archiv'], type: ['Reference', 'Übersicht'] },
  { id: 'p38', f: 'PDF', size: '380 KB', age: 197,
    name: ['Scan_0117', 'Scan_0117'], type: ['Scan', 'Scan'] },
]

const myDocuments = (l: Lang): AreaDocument[] => DOCS.map(d => ({
  id: d.id,
  name: d.name[l],
  documentType: d.type[l],
  fileFormat: d.f,
  fileSize: l === 1 ? d.size.replace('.', ',') : d.size,
  age: d.age,
  ...(d.ref && { matterReference: d.ref[l] }),
  ...(d.sum && { summary: d.sum[l] }),
  ...(d.parties && { parties: d.parties.map(([name, role]): [string, string] => [name, role[l]]) }),
  ...(d.dates && { dates: d.dates.map(([label, days, kind]): [string, number, 'deadline' | 'action'] => [label[l], days, kind]) }),
}))

// ─── Workspaces ───────────────────────────────────────────────────────────────

const GUARDRAILS: { category: Pair; icon: string; text: Pair; why: Pair }[] = [
  { category: ['Sources', 'Quellen'], icon: 'FolderOutlined',
    text: ['Only answer from the documents in this workspace', 'Nur aus den Dokumenten in diesem Arbeitsbereich antworten'],
    why: ['Keeps answers to this client’s own records.', 'Antworten stützen sich nur auf die Unterlagen dieses Mandanten.'] },
  { category: ['Citations', 'Belege'], icon: 'QuotesOutlined',
    text: ['Always cite the legal provision and any BMF letter for every statement', 'Für jede Aussage Rechtsgrundlage und BMF-Schreiben nennen'],
    why: ['Anyone can check an answer against the law and the tax authorities’ view.', 'Jede Antwort lässt sich an Gesetz und Verwaltungsauffassung nachprüfen.'] },
  { category: ['Case law', 'Rechtsprechung'], icon: 'MuseumOutlined',
    text: ['Point out where BFH case law differs from the tax authorities’ view', 'Auf Abweichungen zwischen BFH-Rechtsprechung und Finanzverwaltung hinweisen'],
    why: ['Shows where an objection or appeal could be worthwhile.', 'Zeigt, wo sich ein Einspruch oder eine Klage lohnen könnte.'] },
  { category: ['Confidentiality', 'Verschwiegenheit'], icon: 'LockOutlined',
    text: ['Never name other clients or their figures', 'Keine anderen Mandanten oder deren Zahlen nennen'],
    why: ['Protects professional secrecy (§ 57 StBerG).', 'Schützt die Verschwiegenheitspflicht (§ 57 StBerG).'] },
  { category: ['Escalation', 'Eskalation'], icon: 'UsersOutlined',
    text: ['Flag questions with criminal tax risk for the partner', 'Fragen mit steuerstrafrechtlichem Risiko an die Partnerin weitergeben'],
    why: ['Hands sensitive cases to the right person early.', 'Gibt heikle Fälle früh an die richtige Person.'] },
  { category: ['Language', 'Sprache'], icon: 'WorldOutlined',
    text: ['Answer in German', 'Auf Deutsch antworten'],
    why: ['Matches the language you advise and file in.', 'Passt zur Sprache, in der Sie beraten und Erklärungen abgeben.'] },
]

const guardrailExamples = (l: Lang): AreaGuardrailExample[] =>
  GUARDRAILS.map(g => ({ category: g.category[l], icon: g.icon, text: g.text[l], why: g.why[l] }))

// ─── CoPilot ──────────────────────────────────────────────────────────────────

const CHATS: { id: string; day: AreaChat['day']; title: Pair; question: Pair; answer: Pair }[] = [
  { id: 'home-today-1', day: 'today',
    title: ['Bonus for a managing shareholder', 'Tantieme für den Gesellschafter-Geschäftsführer'],
    question: [
      'When is a bonus for a managing shareholder treated as a hidden profit distribution?',
      'Wann ist eine Tantieme für den Gesellschafter-Geschäftsführer eine verdeckte Gewinnausschüttung?',
    ],
    answer: [
      'A bonus is a **hidden profit distribution** (§ 8 Abs. 3 Satz 2 KStG) if it isn’t agreed **clearly and in advance** or isn’t at arm’s length. The tax authorities’ guidance: profit-related pay should be no more than **50% of the annual profit** before the bonus, and no more than **25% of total pay** (H 8.8 KStH). The amount above the limits is added back to income; agree the bonus in writing before the start of the year.',
      'Eine Tantieme ist eine **verdeckte Gewinnausschüttung** (§ 8 Abs. 3 Satz 2 KStG), wenn sie nicht **klar und im Voraus** vereinbart oder nicht fremdüblich ist. Die Finanzverwaltung orientiert sich daran, dass gewinnabhängige Vergütungen **50 % des Jahresüberschusses** vor Tantieme und **25 % der Gesamtbezüge** nicht übersteigen sollen (H 8.8 KStH). Der übersteigende Teil wird dem Einkommen hinzugerechnet; vereinbaren Sie die Tantieme schriftlich vor Beginn des Jahres.',
    ] },
  { id: 'home-today-2', day: 'today',
    title: ['Objection to an income tax assessment', 'Einspruch gegen einen ESt-Bescheid'],
    question: [
      'The tax office rejected my client’s home office. How long do we have to object?',
      'Das Finanzamt hat das Arbeitszimmer meiner Mandantin nicht anerkannt. Wie lange haben wir Zeit für den Einspruch?',
    ],
    answer: [
      'You have **one month** from notification (§ 355 AO). Since 2025, an assessment sent by post counts as notified on the **fourth day** after posting (§ 122 Abs. 2 Nr. 1 AO). If the home office is the **centre of her entire professional activity**, she can deduct the actual costs or the **€ 1,260 annual flat rate** (§ 4 Abs. 5 Satz 1 Nr. 6b EStG); otherwise only the daily flat rate of € 6 for up to 210 days applies.',
      'Sie haben **einen Monat** ab Bekanntgabe (§ 355 AO). Seit 2025 gilt ein per Post versandter Bescheid am **vierten Tag** nach Aufgabe zur Post als bekannt gegeben (§ 122 Abs. 2 Nr. 1 AO). Bildet das Arbeitszimmer den **Mittelpunkt der gesamten beruflichen Betätigung**, kann sie die tatsächlichen Kosten oder die **Jahrespauschale von 1.260 €** abziehen (§ 4 Abs. 5 Satz 1 Nr. 6b EStG); sonst bleibt nur die Tagespauschale von 6 € für bis zu 210 Tage.',
    ] },
  { id: 'home-yesterday-1', day: 'yesterday',
    title: ['Selling a company car to a family member', 'Firmenwagen an Angehörige verkaufen'],
    question: [
      'A client wants to sell his company car to his son. What should we watch out for?',
      'Ein Mandant will seinen Firmenwagen an seinen Sohn verkaufen. Worauf müssen wir achten?',
    ],
    answer: [
      'The sale is **subject to VAT** if input VAT was deducted on purchase (§ 1 Abs. 1 Nr. 1 UStG). Between related parties, the **minimum assessment basis** applies: if the price is below market value, VAT is charged on the market value (§ 10 Abs. 5 UStG). For income tax, a price below market value is a **withdrawal** at the difference (§ 6 Abs. 1 Nr. 4 EStG). Document the market value, e.g. with a used-car valuation.',
      'Der Verkauf ist **umsatzsteuerpflichtig**, wenn beim Kauf Vorsteuer gezogen wurde (§ 1 Abs. 1 Nr. 1 UStG). Bei nahestehenden Personen gilt die **Mindestbemessungsgrundlage**: Liegt der Preis unter dem Marktwert, wird die Steuer vom Marktwert berechnet (§ 10 Abs. 5 UStG). Ertragsteuerlich ist ein Preis unter Marktwert in Höhe der Differenz eine **Entnahme** (§ 6 Abs. 1 Nr. 4 EStG). Dokumentieren Sie den Marktwert, etwa mit einer Schwacke-Bewertung.',
    ] },
  { id: 'home-yesterday-2', day: 'yesterday',
    title: ['Late filing surcharge', 'Verspätungszuschlag'],
    question: [
      'Can the late filing surcharge on the annual VAT return be waived?',
      'Kann der Verspätungszuschlag zur USt-Jahreserklärung erlassen werden?',
    ],
    answer: [
      'If the return is filed more than **14 months** after the end of the year (**19 months** for returns prepared by a tax adviser), the surcharge is **mandatory** (§ 152 Abs. 2 AO) — at least **€ 25 per month** started, or 0.25% of the assessed tax. It can only be waived if the delay was **excusable** (§ 152 Abs. 1 Satz 2 AO), e.g. serious illness. Check whether the return counted as an adviser return under § 149 Abs. 3 AO.',
      'Wird die Erklärung mehr als **14 Monate** nach Ablauf des Jahres abgegeben (bei Beratererklärungen **19 Monate**), ist der Zuschlag **zwingend** festzusetzen (§ 152 Abs. 2 AO) – mindestens **25 € je angefangenen Monat** bzw. 0,25 % der festgesetzten Steuer. Abgesehen wird nur, wenn die Verspätung **entschuldbar** war (§ 152 Abs. 1 Satz 2 AO), etwa bei schwerer Krankheit. Prüfen Sie, ob die Erklärung als Beratererklärung nach § 149 Abs. 3 AO galt.',
    ] },
  { id: 'home-yesterday-3', day: 'yesterday',
    title: ['Declining-balance depreciation 2026', 'Degressive AfA 2026'],
    question: [
      'Can my client still use declining-balance depreciation for a machine bought in 2026?',
      'Kann mein Mandant für eine 2026 gekaufte Maschine noch degressiv abschreiben?',
    ],
    answer: [
      'Yes — for movable fixed assets acquired after **30 June 2025 and before 1 January 2028**, declining-balance depreciation is allowed again at up to **three times** the straight-line rate, capped at **30%** (§ 7 Abs. 2 EStG). In the year of purchase it is calculated pro rata by month. A later switch to straight-line depreciation is possible (§ 7 Abs. 3 EStG) and usually pays off towards the end of the useful life.',
      'Ja – für bewegliche Wirtschaftsgüter, die **nach dem 30. Juni 2025 und vor dem 1. Januar 2028** angeschafft werden, ist die degressive AfA wieder zulässig, mit höchstens dem **Dreifachen** des linearen Satzes und maximal **30 %** (§ 7 Abs. 2 EStG). Im Anschaffungsjahr wird zeitanteilig nach Monaten gerechnet. Ein späterer Wechsel zur linearen AfA ist möglich (§ 7 Abs. 3 EStG) und lohnt sich meist gegen Ende der Nutzungsdauer.',
    ] },
]

const chats = (l: Lang): AreaChat[] => CHATS.map(c => ({ id: c.id, day: c.day, title: c.title[l], question: c.question[l], answer: c.answer[l] }))

const ARTICLES: { keywords: RegExp; title: Pair; excerpt: Pair; general?: boolean }[] = [
  {
    keywords: /vga|hidden.?profit|verdeckte|tantieme|bonus|gesch(ä|ae|a)ftsf(ü|ue|u)hrer|managing.?(director|shareholder)|gehalt|salary/i,
    title: ['Hidden profit distributions to managing shareholders | Lexicon', 'Verdeckte Gewinnausschüttung an Gesellschafter-Geschäftsführer | Lexikon'],
    excerpt: [
      'A hidden profit distribution is a reduction in assets caused by the shareholder relationship that affects income and is not based on a proper profit distribution resolution (R 8.5 KStR). For managing shareholders, pay must be agreed clearly and in advance, actually paid and appropriate overall.',
      'Eine verdeckte Gewinnausschüttung ist eine durch das Gesellschaftsverhältnis veranlasste Vermögensminderung, die sich auf das Einkommen auswirkt und nicht auf einem ordnungsgemäßen Gewinnverteilungsbeschluss beruht (R 8.5 KStR). Bei Gesellschafter-Geschäftsführern muss die Vergütung klar und im Voraus vereinbart, tatsächlich durchgeführt und insgesamt angemessen sein.',
    ],
  },
  {
    keywords: /objection|einspruch|assessment|bescheid|aussetzung|suspension|appeal|frist/i,
    title: ['Objection procedure — deadlines and suspension of enforcement | Article', 'Einspruchsverfahren – Fristen und Aussetzung der Vollziehung | Fachbeitrag'],
    excerpt: [
      'An objection must be lodged within one month of notification (§ 355 AO). It does not suspend payment; to avoid paying the disputed amount, apply for suspension of enforcement (§ 361 AO). Where an issue is pending before the BFH, the objection procedure rests automatically (§ 363 Abs. 2 AO).',
      'Der Einspruch ist innerhalb eines Monats nach Bekanntgabe einzulegen (§ 355 AO). Er hemmt die Zahlung nicht; um den strittigen Betrag nicht zahlen zu müssen, ist Aussetzung der Vollziehung zu beantragen (§ 361 AO). Ist die Rechtsfrage beim BFH anhängig, ruht das Einspruchsverfahren kraft Gesetzes (§ 363 Abs. 2 AO).',
    ],
    general: true,
  },
  {
    keywords: /home.?office|arbeitszimmer|werbungskosten|homeoffice|pauschale/i,
    title: ['Home office and daily flat rate | Lexicon', 'Häusliches Arbeitszimmer und Tagespauschale | Lexikon'],
    excerpt: [
      'Costs for a home office are only deductible if it is the centre of the entire professional activity — either the actual costs or an annual flat rate of € 1,260. Otherwise, a daily flat rate of € 6 for each day worked mainly at home applies, up to € 1,260 a year (§ 4 Abs. 5 Satz 1 Nr. 6b and 6c EStG).',
      'Aufwendungen für ein häusliches Arbeitszimmer sind nur abziehbar, wenn es den Mittelpunkt der gesamten beruflichen Betätigung bildet – wahlweise in tatsächlicher Höhe oder mit einer Jahrespauschale von 1.260 €. Ansonsten gilt die Tagespauschale von 6 € je Tag mit überwiegender Tätigkeit zu Hause, höchstens 1.260 € im Jahr (§ 4 Abs. 5 Satz 1 Nr. 6b und 6c EStG).',
    ],
  },
  {
    keywords: /input.?vat|vorsteuer|invoice|rechnung|(^|[^a-z])(vat|ust)([^a-z]|$)|umsatzsteuer|e.?invoic|e.?rechnung/i,
    title: ['Input VAT deduction and e-invoicing | Lexicon', 'Vorsteuerabzug und E-Rechnung | Lexikon'],
    excerpt: [
      'Input VAT can be deducted once the supply has been received and a proper invoice is held (§ 15 Abs. 1 UStG). Between businesses, invoices must increasingly be issued as structured e-invoices under EN 16931; from 2027 this applies to all businesses with prior-year turnover over € 800,000 (§ 27 Abs. 38 UStG).',
      'Der Vorsteuerabzug setzt voraus, dass die Leistung bezogen wurde und eine ordnungsgemäße Rechnung vorliegt (§ 15 Abs. 1 UStG). Zwischen Unternehmen sind Rechnungen zunehmend als strukturierte E-Rechnung nach EN 16931 auszustellen; ab 2027 gilt das für alle Unternehmen mit einem Vorjahresumsatz über 800.000 € (§ 27 Abs. 38 UStG).',
    ],
    general: true,
  },
  {
    keywords: /tax.?audit|betriebspr(ü|ue|u)f|au(ß|ss)enpr(ü|ue|u)f|pr(ü|ue|u)fungsanordnung|audit.?order|nachschau|kasse|cash/i,
    title: ['Tax audit: preparation, rights and duties | Work aid', 'Betriebsprüfung: Vorbereitung, Rechte und Pflichten | Arbeitshilfe'],
    excerpt: [
      'The audit order sets out the taxes and years to be audited and must be sent a reasonable time in advance (§§ 196, 197 AO). The taxpayer must cooperate and provide documents and data access (§ 200 AO); since 2025, a cooperation delay penalty can be imposed after a request to cooperate (§ 200a AO).',
      'Die Prüfungsanordnung legt Steuerarten und Zeiträume fest und ist angemessene Zeit vor Prüfungsbeginn bekannt zu geben (§§ 196, 197 AO). Der Steuerpflichtige muss mitwirken, Unterlagen vorlegen und Datenzugriff gewähren (§ 200 AO); seit 2025 kann nach einem Mitwirkungsverlangen ein Mitwirkungsverzögerungsgeld festgesetzt werden (§ 200a AO).',
    ],
  },
  {
    keywords: /afa|abschreib|depreciat|degressiv|declining|anlage|asset/i,
    title: ['Declining-balance depreciation from July 2025 | Article', 'Degressive AfA ab Juli 2025 | Fachbeitrag'],
    excerpt: [
      'For movable fixed assets acquired after 30 June 2025 and before 1 January 2028, declining-balance depreciation of up to three times the straight-line rate, but no more than 30%, can be claimed (§ 7 Abs. 2 EStG). A switch to straight-line depreciation is allowed at any time.',
      'Für bewegliche Wirtschaftsgüter des Anlagevermögens, die nach dem 30. Juni 2025 und vor dem 1. Januar 2028 angeschafft werden, kann die AfA degressiv mit bis zum Dreifachen des linearen Satzes, höchstens 30 %, bemessen werden (§ 7 Abs. 2 EStG). Ein Wechsel zur linearen AfA ist jederzeit möglich.',
    ],
  },
  {
    keywords: /verspätung|late.?filing|surcharge|zuschlag|s(ä|ae|a)umnis|deadline|abgabefrist/i,
    title: ['Filing deadlines and late filing surcharges | Lexicon', 'Abgabefristen und Verspätungszuschlag | Lexikon'],
    excerpt: [
      'Returns prepared by a tax adviser are due at the end of February of the second following year (§ 149 Abs. 3 AO; longer transitional deadlines applied up to 2024). If a return is filed more than 14 months after the end of the year (19 months in adviser cases), a late filing surcharge must be set, at least € 25 per month started (§ 152 Abs. 2 and 5 AO).',
      'Erklärungen, die eine Steuerberaterin erstellt, sind bis Ende Februar des zweiten Folgejahres abzugeben (§ 149 Abs. 3 AO; bis 2024 galten verlängerte Übergangsfristen). Wird eine Erklärung mehr als 14 Monate nach Ablauf des Jahres abgegeben (in Beraterfällen 19 Monate), ist ein Verspätungszuschlag festzusetzen, mindestens 25 € je angefangenen Monat (§ 152 Abs. 2 und 5 AO).',
    ],
  },
  {
    keywords: /entnahme|withdrawal|firmenwagen|company.?car|n(ä|ae|a)hestehend|related|angeh(ö|oe|o)rig|family/i,
    title: ['Sales to related parties: minimum assessment basis | Commentary', 'Verkauf an nahestehende Personen: Mindestbemessungsgrundlage | Kommentar'],
    excerpt: [
      'For supplies to related parties, the VAT assessment basis is at least the market value if the agreed price is lower (§ 10 Abs. 5 UStG). For income tax, the difference between market value and price is a withdrawal (§ 4 Abs. 1 Satz 2, § 6 Abs. 1 Nr. 4 EStG).',
      'Bei Leistungen an nahestehende Personen ist Bemessungsgrundlage für die Umsatzsteuer mindestens der Marktwert, wenn das vereinbarte Entgelt darunter liegt (§ 10 Abs. 5 UStG). Ertragsteuerlich ist die Differenz zwischen Marktwert und Preis eine Entnahme (§ 4 Abs. 1 Satz 2, § 6 Abs. 1 Nr. 4 EStG).',
    ],
  },
  {
    keywords: /k(ö|oe|o)rperschaftsteuer|corporate.?tax|gewerbesteuer|trade.?tax|gmbh|jahresabschluss|annual.?accounts/i,
    title: ['Taxation of a GmbH: corporate and trade tax | Handbook', 'Besteuerung der GmbH: Körperschaft- und Gewerbesteuer | Handbuch'],
    excerpt: [
      'A GmbH pays corporate tax of 15% plus solidarity surcharge on its income (§ 23 KStG) and trade tax at the municipal multiplier. From 2028 the corporate tax rate falls by one percentage point a year until it reaches 10% in 2032.',
      'Eine GmbH zahlt auf ihr Einkommen 15 % Körperschaftsteuer zuzüglich Solidaritätszuschlag (§ 23 KStG) sowie Gewerbesteuer nach dem Hebesatz der Gemeinde. Ab 2028 sinkt der Körperschaftsteuersatz jährlich um einen Prozentpunkt, bis er 2032 bei 10 % liegt.',
    ],
    general: true,
  },
]

const articles = (l: Lang): AreaArticle[] =>
  ARTICLES.map(a => ({ keywords: a.keywords, title: a.title[l], excerpt: a.excerpt[l], ...(a.general && { general: true }) }))

// ─── Uploads ──────────────────────────────────────────────────────────────────

const ue = '(ü|ue|u)'
const ae = '(ä|ae|a)'
const re = (source: string) => new RegExp(source, 'i')

// File name pattern → [en, de] type, most specific first.
const TYPE_RULES: [RegExp, Pair][] = [
  [/umsatzsteuer.?voranmeldung|ust.?va([^a-z]|$)|vat.?return/i, ['VAT Return', 'Umsatzsteuer-Voranmeldung']],
  [/einkommensteuererkl|income.?tax.?return/i, ['Income Tax Return', 'Einkommensteuererklärung']],
  [/gewerbesteuererkl|trade.?tax.?return/i, ['Trade Tax Return', 'Gewerbesteuererklärung']],
  [/s(ä|ae|a)umniszuschlag|late.?payment|verspätungszuschlag|late.?filing/i, ['Tax Notice', 'Steuerbescheid']],
  [/steuerbescheid|bescheid|assessment/i, ['Tax Assessment', 'Steuerbescheid']],
  [re(`betriebspr${ue}fungsbericht|tax.?audit.?report`), ['Tax Audit Report', 'Prüfungsbericht']],
  [re(`pr${ue}fungsanordnung|audit.?order`), ['Tax Audit Notice', 'Prüfungsanordnung']],
  [re(`betriebspr${ue}fung|au(ß|ss)enpr${ue}fung|tax.?audit|nachschau`), ['Tax Audit Correspondence', 'Korrespondenz Betriebsprüfung']],
  [/verbindliche.?auskunft|advance.?ruling|binding.?ruling/i, ['Ruling Application', 'Antrag verbindliche Auskunft']],
  [/auskunftsersuchen|information.?request|r(ü|ue|u)ckfrage|query/i, ['Information Request', 'Auskunftsersuchen']],
  [/einspruch|objection/i, ['Objection', 'Einspruch']],
  [/urteil|beschluss|ruling|judgment|(^|[^a-z])(bfh|fg)([^a-z]|$)/i, ['Court Decision', 'Urteil']],
  [/mandatsvereinbarung|steuerberatungsvertrag|engagement.?letter/i, ['Engagement Letter', 'Mandatsvereinbarung']],
  [/vollmacht|power.?of.?attorney/i, ['Power of Attorney', 'Vollmacht']],
  [/jahresabschluss|annual.?(accounts|financial.?statements?)/i, ['Annual Financial Statement', 'Jahresabschluss']],
  [/(^|[^a-z])bwa([^a-z]|$)|business.?analysis/i, ['Business Analysis (BWA)', 'BWA']],
  [/summen.{0,3}und.{0,2}saldenliste|(^|[^a-z])susa([^a-z]|$)|trial.?balance/i, ['Trial Balance', 'Summen- und Saldenliste']],
  [/anlagenverzeichnis|anlagenspiegel|(fixed.?)?asset.?register/i, ['Fixed Asset Register', 'Anlagenverzeichnis']],
  [/steuerplanung|tax.?planning/i, ['Tax Planning', 'Steuerplanung']],
  [/rundschreiben|mandanteninfo|client.?(letter|newsletter)/i, ['Client Letter', 'Mandantenrundschreiben']],
  [/kassenbuch|cash.?book/i, ['Cash Book', 'Kassenbuch']],
  [/verfahrensdoku|procedure.?doc|gobd/i, ['Procedure Documentation', 'Verfahrensdokumentation']],
  [/protokoll|minutes|meeting|gespr(ä|ae|a)ch|call.?notes/i, ['Meeting Notes', 'Gesprächsnotiz']],
  [/fristen|steuertermin|deadline/i, ['Deadline Overview', 'Fristenübersicht']],
  [/checkliste|checklist/i, ['Checklist', 'Checkliste']],
  [/vertrag|contract|agreement/i, ['Contract', 'Vertrag']],
  [/rechnung|invoice/i, ['Invoice', 'Rechnung']],
  [/beleg|receipt|nachweis|proof|evidence/i, ['Supporting Evidence', 'Beleg']],
  [/antwort|reply|response/i, ['Reply Letter', 'Antwortschreiben']],
  [/anlage|appendix|annex/i, ['Appendix', 'Anlage']],
  [re(`erkl${ae}rung|tax.?return`), ['Tax Return', 'Steuererklärung']],
  [/memo|vermerk/i, ['Memo', 'Memo']],
  [/notiz|notes/i, ['Notes', 'Notiz']],
  [/brief|schreiben|letter/i, ['Letter', 'Schreiben']],
  [/bericht|report/i, ['Report', 'Bericht']],
  [/screenshot/i, ['Screenshot', 'Screenshot']],
]

const TOPICS: [RegExp, Pair][] = [
  [/umsatzsteuer|vorsteuer|(^|[^a-z])ust([^a-z]|$)|vat/i, ['VAT', 'Umsatzsteuer']],
  [/einkommensteuer|(^|[^a-z])est([^a-z]|$)|income.?tax|arbeitszimmer|home.?office/i, ['Income tax', 'Einkommensteuer']],
  [re(`k(ö|oe|o)rperschaftsteuer|(^|[^a-z])kst([^a-z]|$)|corporate.?tax|(^|[^a-z])vga([^a-z]|$)|tantieme`), ['Corporate tax', 'Körperschaftsteuer']],
  [/gewerbesteuer|(^|[^a-z])gewst([^a-z]|$)|trade.?tax/i, ['Trade tax', 'Gewerbesteuer']],
  [/grundsteuer|property.?tax/i, ['Property tax', 'Grundsteuer']],
  [/erbschaft|schenkung|inheritance|gift.?tax/i, ['Inheritance and gift tax', 'Erbschaft- und Schenkungsteuer']],
  [re(`betriebspr${ue}fung|tax.?audit|pr${ue}fungsanordnung|nachschau`), ['Tax audit', 'Betriebsprüfung']],
  [/einspruch|objection|urteil|ruling|(^|[^a-z])(bfh|fg)([^a-z]|$)/i, ['Objections and appeals', 'Einspruch und Klage']],
  [/xrechnung|zugferd|e.?rechnung|e.?invoic/i, ['E-invoicing', 'E-Rechnung']],
  [/jahresabschluss|year.?end|closing|annual.?accounts/i, ['Annual accounts', 'Jahresabschluss']],
  [/abschreibung|(^|[^a-z])afa([^a-z]|$)|depreciat|anlagenverzeichnis|asset.?register/i, ['Fixed assets', 'Anlagevermögen']],
  [/umwandlung|abspaltung|restructur|umstrukturierung|spin.?off/i, ['Restructuring', 'Umstrukturierung']],
  [/lohn|payroll|gehalt/i, ['Payroll', 'Lohn und Gehalt']],
]

const PARTIES: [RegExp, { name: string; role: Pair }][] = [
  [/bundeszentralamt|(^|[^a-z])bzst([^a-z]|$)/i, { name: 'Bundeszentralamt für Steuern', role: ROLE.taxOffice }],
  [/finanzamt|tax.?office/i, { name: FA, role: ROLE.taxOffice }],
  [/finanzgericht|tax.?court|(^|[^a-z])fg([^a-z]|$)/i, { name: FG, role: ROLE.court }],
  [/(^|[^a-z])bfh([^a-z]|$)|bundesfinanzhof/i, { name: 'Bundesfinanzhof', role: ROLE.court }],
  [/kammer|chamber/i, { name: STBK, role: ROLE.chamber }],
  [/kaiser/i, { name: C1, role: ROLE.client }],
  [/roth/i, { name: C2, role: ROLE.client }],
  [/sommer|vogt/i, { name: C3, role: ROLE.client }],
  [/albrecht/i, { name: C4, role: ROLE.client }],
  [/datev/i, { name: 'DATEV eG', role: ROLE.provider }],
]

const uploads = (l: Lang): AreaUploads => ({
  typeRules: TYPE_RULES.map(([pattern, type]) => [pattern, type[l]]),
  topics: TOPICS.map(([pattern, topic]) => [pattern, topic[l]]),
  parties: PARTIES.map(([pattern, p]) => [pattern, { name: p.name, role: p.role[l] }]),
  matters: ([
    ['Annual accounts 2026', 'Jahresabschluss 2026'],
    ['Income tax return 2025', 'Einkommensteuererklärung 2025'],
    ['Tax audit 2022–2024', 'Betriebsprüfung 2022–2024'],
    ['VAT return Q4 2026', 'USt-Voranmeldung Q4 2026'],
    ['Objection proceedings', 'Einspruchsverfahren'],
    ['Tax planning 2027', 'Steuerplanung 2027'],
  ] satisfies Pair[]).map(m => m[l]),
  counterparties: [
    { name: FA, role: ROLE.taxOffice[l] },
    { name: FG, role: ROLE.court[l] },
    { name: 'Bundeszentralamt für Steuern', role: ROLE.taxOffice[l] },
  ],
  primaryRole: ROLE.client[l],
  deadlineLabels: ([['Reply due', 'Antwort bis'], ['Filing deadline', 'Abgabefrist'], ['Objection deadline', 'Einspruchsfrist'], ['Payment due', 'Zahlbar bis']] satisfies Pair[]).map(p => p[l]),
  actionLabels: ([['Received', 'Eingegangen'], ['Filed', 'Übermittelt'], ['Sent to client', 'An Mandant versandt'], ['Paid', 'Bezahlt']] satisfies Pair[]).map(p => p[l]),
})

// ─── Workspace profile wording and connected-app documents ───────────────────

const SYNC_ROWS: Parameters<typeof syncFilesFor>[0] = {
  sharepoint: [
    ['Client letter year end 2026', 'Mandantenrundschreiben Jahreswechsel 2026', 'DOCX'], ['Income tax assessment 2024 Dr. Roth', 'ESt-Bescheid 2024 Dr. Roth', 'PDF'], ['Tax audit report 2023 Kaiser Holzbau', 'Betriebsprüfungsbericht 2023 Kaiser Holzbau', 'PDF'],
    ['Engagement letter template', 'Vorlage Mandatsvereinbarung', 'DOCX'], ['Annual accounts 2025 Albrecht', 'Jahresabschluss 2025 Albrecht', 'PDF'], ['Objection template', 'Mustereinspruch', 'DOCX'],
    ['Quality manual of the firm', 'Qualitätshandbuch der Kanzlei', 'DOCX'], ['Trade tax return 2024 Kaiser Holzbau', 'Gewerbesteuererklärung 2024 Kaiser Holzbau', 'PDF'], ['Fee calculation StBVV', 'Gebührenberechnung StBVV', 'XLSX'],
  ],
  googleDrive: [
    ['Tax planning 2027 draft', 'Steuerplanung 2027 Entwurf', 'XLSX'], ['Client list e-invoicing', 'Mandantenliste E-Rechnung', 'XLSX'], ['Notes - client meeting Kaiser', 'Notizen - Mandantengespräch Kaiser', 'DOCX'],
    ['Year-end checklist clients', 'Checkliste Jahreswechsel Mandanten', 'DOCX'], ['Property tax objections overview', 'Übersicht Grundsteuer-Einsprüche', 'XLSX'], ['Restructuring plan Albrecht', 'Umstrukturierungsplan Albrecht', 'DOCX'],
    ['Deadline overview 2026', 'Fristenübersicht 2026', 'XLSX'], ['Managing director salary comparison', 'Vergleich GF-Gehälter', 'XLSX'], ['Power of attorney Sommer & Vogt signed', 'Vollmacht Sommer & Vogt unterschrieben', 'PDF'],
  ],
  datev: [
    ['Payroll journal Q3 2026 Albrecht', 'Lohnjournal Q3 2026 Albrecht', 'XLSX'], ['Booking journal 09 2026 Kaiser', 'Buchungsjournal 09 2026 Kaiser', 'XLSX'], ['Business analysis September 2026', 'BWA September 2026', 'PDF'],
    ['Trial balance 2026 Albrecht', 'Summen- und Saldenliste 2026 Albrecht', 'XLSX'], ['VAT pre-registration 09 2026', 'Umsatzsteuer-Voranmeldung 09 2026', 'PDF'], ['Open items Sommer & Vogt', 'Offene Posten Sommer & Vogt', 'XLSX'],
    ['Cash book Q3 2026 Sommer & Vogt', 'Kassenbuch Q3 2026 Sommer & Vogt', 'XLSX'], ['Fixed asset register 2025 Kaiser', 'Anlagenverzeichnis 2025 Kaiser', 'PDF'], ['Income tax return 2025 Dr. Roth', 'Einkommensteuererklärung 2025 Dr. Roth', 'PDF'],
  ],
}

const PROFILE_AND_SYNC: Record<'en' | 'de', Pick<AreaContent, 'profile' | 'syncFiles'>> = {
  en: {
    profile: {
      listDescription: 'Shared documents everyone with access can rely on, brought together with a client’s context and rules — for accurate, in-context answers.',
      backgroundDescription: 'What your apps should know about this client — who they are, what matters, how you like to work.',
      backgroundPlaceholder: 'e.g. Family-owned GmbH, managing shareholder holds 100%, fiscal year ends in June, tax audit every four years…',
      detailsDescription: 'Facts about the workspace itself, such as client number, tax number or contact person.',
      detailLabelPlaceholder: 'e.g. Client number',
      detailValuePlaceholder: 'e.g. 10452',
    },
    syncFiles: syncFilesFor(SYNC_ROWS, 'en'),
  },
  de: {
    profile: {
      listDescription: 'Gemeinsame Dokumente, auf die sich alle mit Zugriff verlassen können – zusammen mit dem Kontext und den Regeln zu einem Mandanten. Für genaue Antworten, die zum Fall passen.',
      backgroundDescription: 'Was Ihre Apps über diesen Mandanten wissen sollten – wer er ist, worauf es ankommt, wie Sie arbeiten möchten.',
      backgroundPlaceholder: 'z. B. Familien-GmbH, Gesellschafter-Geschäftsführer hält 100 %, Geschäftsjahr endet im Juni, Betriebsprüfung alle vier Jahre …',
      detailsDescription: 'Fakten zum Arbeitsbereich selbst, etwa Mandantennummer, Steuernummer oder Ansprechperson.',
      detailLabelPlaceholder: 'z. B. Mandantennummer',
      detailValuePlaceholder: 'z. B. 10452',
    },
    syncFiles: syncFilesFor(SYNC_ROWS, 'de'),
  },
}

const PRODUCT: AreaContent['product'] = { name: 'Haufe Steuer Office Premium', shortName: 'Steuer Office', icon: '/user-testing-nov-26/product-icons/steuer-office.png', mark: 'ST' }

export const TAX: { en: AreaContent; de: AreaContent } = {
  en: {
    ...PROFILE_AND_SYNC.en,
    areaLabel: 'Tax',
    product: PRODUCT,
    myDocuments: myDocuments(0),
    workspaces: {
      createIntro: 'Bring a client’s documents and context together so answers always fit their situation.',
      equation: {
        workspaceText: 'Your clients’ assessments, returns and correspondence.',
        haufeText: 'Tax law, case law, BMF letters and expert guidance.',
        resultTitle: 'Answers that fit your client',
        resultText: 'Sourced responses, without re-explaining.',
      },
      guardrailExamples: guardrailExamples(0),
      previewGuardrails: ['Only answer from the documents in this workspace', 'Always cite the legal provision and any BMF letter for every statement', 'Never name other clients or their figures'],
      profileLabels: ['Client number', 'Legal form', 'Tax number', 'VAT ID', 'Fiscal year', 'Tax office'],
      matterPlaceholder: 'e.g. Annual accounts 2026',
      tryAsking: name => `Which deadlines are coming up next for ${name}?`,
    },
    copilot: {
      chats: chats(0),
      genericAdvice: 'I’d check the relevant provisions in the EStG, KStG, UStG or AO, any BMF letter and current BFH case law, then compare them with the client’s figures and assessments before you advise.',
      simulatedNote: 'Simulated response for prototyping — connect a real assistant to answer from your actual client files.',
      articles: articles(0),
      fixedReply: MUSTERFIRMA.tax.en,
      fileExcerpts: [
        'Section 2 lists the taxes and periods concerned and the amounts assessed.',
        'The relevant paragraph records what was agreed with the client and from which period it applies.',
        'Page 3 summarises the open points and the deadlines noted at the time.',
      ],
    },
    office: TAX_OFFICE.en,
    uploads: uploads(0),
  },
  de: {
    ...PROFILE_AND_SYNC.de,
    areaLabel: 'Steuern',
    product: PRODUCT,
    myDocuments: myDocuments(1),
    workspaces: {
      createIntro: 'Bündeln Sie Unterlagen und Kontext zu einem Mandanten, damit Antworten immer zu seiner Situation passen.',
      equation: {
        workspaceText: 'Bescheide, Erklärungen und Korrespondenz Ihrer Mandanten.',
        haufeText: 'Steuerrecht, Rechtsprechung, BMF-Schreiben und Expertenwissen.',
        resultTitle: 'Antworten, die zu Ihrem Mandanten passen',
        resultText: 'Mit Quellen belegt, ohne alles neu zu erklären.',
      },
      guardrailExamples: guardrailExamples(1),
      previewGuardrails: ['Nur aus den Dokumenten in diesem Arbeitsbereich antworten', 'Für jede Aussage Rechtsgrundlage und BMF-Schreiben nennen', 'Keine anderen Mandanten oder deren Zahlen nennen'],
      profileLabels: ['Mandantennummer', 'Rechtsform', 'Steuernummer', 'USt-IdNr.', 'Geschäftsjahr', 'Finanzamt'],
      matterPlaceholder: 'z. B. Jahresabschluss 2026',
      tryAsking: name => `Welche Fristen stehen bei „${name}“ als Nächstes an?`,
    },
    copilot: {
      chats: chats(1),
      genericAdvice: 'Ich würde die einschlägigen Vorschriften in EStG, KStG, UStG oder AO, etwaige BMF-Schreiben und die aktuelle BFH-Rechtsprechung prüfen und mit den Zahlen und Bescheiden des Mandanten abgleichen, bevor Sie beraten.',
      simulatedNote: 'Simulierte Antwort für den Prototyp – verbinden Sie einen echten Assistenten, um aus Ihren tatsächlichen Mandantenakten zu antworten.',
      articles: articles(1),
      fixedReply: MUSTERFIRMA.tax.de,
      fileExcerpts: [
        'Abschnitt 2 führt die betroffenen Steuerarten und Zeiträume sowie die festgesetzten Beträge auf.',
        'Der einschlägige Absatz hält fest, was mit dem Mandanten vereinbart wurde und ab welchem Zeitraum es gilt.',
        'Seite 3 fasst die offenen Punkte und die damals notierten Fristen zusammen.',
      ],
    },
    office: TAX_OFFICE.de,
    uploads: uploads(1),
  },
}
