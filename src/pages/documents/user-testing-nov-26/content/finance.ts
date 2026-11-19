import type { AreaArticle, AreaChat, AreaContent, AreaDocument, AreaGuardrailExample, AreaUploads } from './types'
import { syncFilesFor } from './types'
import { FINANCE_OFFICE } from './office/finance'
import { MUSTERFIRMA } from './musterfirma'

/**
 * Finance: a head of accounting / financial controller at Brenner Maschinenbau GmbH, a mid-sized machine builder in
 * Ulm, working with the external tax adviser (Hoffmann & Partner) and the auditor (Kessler Treuhand). The setting is
 * German in both languages; the English side is the same content translated.
 *
 * Shared rows hold both languages as [en, de] pairs, so ids, structure and counts can't drift apart.
 */

type Pair = [en: string, de: string]
type Lang = 0 | 1

// ─── Organisations and roles ──────────────────────────────────────────────────

const ROLE = {
  taxOffice: ['Tax authority', 'Finanzbehörde'],
  taxAdviser: ['Tax adviser', 'Steuerberater'],
  auditor: ['Auditor', 'Abschlussprüfer'],
  bank: ['Bank', 'Bank'],
  customer: ['Customer', 'Kunde'],
  supplier: ['Supplier', 'Lieferant'],
  sender: ['Sender', 'Absender'],
  taxpayer: ['Taxpayer', 'Steuerpflichtiger'],
  company: ['Company', 'Unternehmen'],
  colleague: ['Colleague', 'Kollegin'],
  provider: ['Software provider', 'Softwareanbieter'],
  customs: ['Customs authority', 'Zollbehörde'],
} satisfies Record<string, Pair>

const FA = 'Finanzamt Ulm'
const STB = 'Hoffmann & Partner Steuerberatung'
const WP = 'Kessler Treuhand GmbH Wirtschaftsprüfungsgesellschaft'
const BANK = 'Sparkasse Ulm'
const CO = 'Brenner Maschinenbau GmbH'

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

// Patchy on purpose: letters from the tax office, auditor and bank mostly have a sender and a date; notes and drafts
// often only a summary or a reference; screenshots, scans and untitled files nothing at all.
const DOCS: DocRow[] = [
  { id: 'p1', f: 'DOCX', size: '9 KB', age: 1,
    name: ['Call notes - tax adviser re VAT Q3', 'Gesprächsnotiz - Steuerberater zur USt Q3'], type: ['Meeting Notes', 'Gesprächsnotiz'],
    ref: ['VAT return Q3 2026', 'USt-Voranmeldung Q3 2026'],
    sum: ['Call with Hoffmann & Partner about the advance payment from Wagner and whether VAT was due in September already.', 'Telefonat mit Hoffmann & Partner zur Anzahlung von Wagner und ob die Umsatzsteuer schon im September entstanden ist.'],
    parties: [[STB, ROLE.taxAdviser]] },
  { id: 'p2', f: 'PDF', size: '312 KB', age: 1,
    name: ['Tax assessment 2024 corporate tax - Finanzamt Ulm', 'Steuerbescheid 2024 KSt - Finanzamt Ulm'], type: ['Tax Assessment', 'Steuerbescheid'],
    ref: ['Corporate tax 2024', 'Körperschaftsteuer 2024'],
    sum: ['Corporate tax assessment for 2024. The tax office did not accept part of the provision for warranty claims; the assessed amount is € 38,400 higher than filed. An objection is possible within one month.', 'Körperschaftsteuerbescheid für 2024. Das Finanzamt erkennt einen Teil der Gewährleistungsrückstellung nicht an; die festgesetzte Steuer liegt 38.400 € über der Erklärung. Ein Einspruch ist innerhalb eines Monats möglich.'],
    parties: [[FA, ROLE.sender], [CO, ROLE.taxpayer]], dates: [[['Objection deadline', 'Einspruchsfrist'], 27, 'deadline']] },
  { id: 'p3', f: 'XLSX', size: '38 KB', age: 2,
    name: ['Year-end closing checklist 2026 - draft', 'Checkliste Jahresabschluss 2026 - Entwurf'], type: ['Checklist', 'Checkliste'],
    ref: ['Year-end closing 2026', 'Jahresabschluss 2026'] },
  { id: 'p4', f: 'PDF', size: '188 KB', age: 2,
    name: ['Auditor request list - Kessler Treuhand', 'Anforderungsliste Abschlussprüfer - Kessler Treuhand'], type: ['Audit Correspondence', 'Prüfungskorrespondenz'],
    sum: ['The auditor lists what they need for the interim audit: bank confirmations, the inventory count plan and the contract register.', 'Der Abschlussprüfer listet die Unterlagen für die Vorprüfung auf: Bankbestätigungen, Inventurplanung und Vertragsübersicht.'],
    parties: [[WP, ROLE.auditor]], dates: [[['Documents due', 'Unterlagen bis'], 14, 'deadline']] },
  { id: 'p5', f: 'XLSX', size: '96 KB', age: 3,
    name: ['BWA October 2026', 'BWA Oktober 2026'], type: ['Business Analysis (BWA)', 'BWA'],
    sum: ['Monthly business analysis for October. Material costs are 4 points above plan; the operating result is down 12% on the prior year.', 'Betriebswirtschaftliche Auswertung für Oktober. Die Materialquote liegt 4 Prozentpunkte über Plan, das Betriebsergebnis 12 % unter Vorjahr.'] },
  { id: 'p6', f: 'PDF', size: '780 KB', age: 3,
    name: ['Screenshot - XRechnung validation error', 'Screenshot - Fehlermeldung XRechnung-Validierung'], type: ['Screenshot', 'Screenshot'] },
  { id: 'p7', f: 'DOCX', size: '4 KB', age: 3,
    name: ['To-do - week 47', 'To-do - KW 47'], type: ['Notes', 'Notiz'] },
  { id: 'p8', f: 'XLSX', size: '54 KB', age: 4,
    name: ['Cash-flow plan Q1 2027 - v3', 'Liquiditätsplanung Q1 2027 - v3'], type: ['Cash-Flow Plan', 'Liquiditätsplanung'],
    sum: ['Thirteen-week cash-flow plan. Liquidity is tightest in mid-February, when the VAT special prepayment and the machine purchase fall due.', 'Rollierende 13-Wochen-Liquiditätsplanung. Am engsten wird es Mitte Februar, wenn Sondervorauszahlung und Maschinenkauf fällig werden.'] },
  { id: 'p9', f: 'PDF', size: '61 KB', age: 4,
    name: ['Dispute - Wagner invoice 2026-1184', 'Reklamation - Rechnung 2026-1184 Wagner'], type: ['Invoice Dispute', 'Rechnungsreklamation'],
    ref: ['Wagner Konsumgüter – invoice 2026-1184', 'Wagner Konsumgüter – Rechnung 2026-1184'],
    sum: ['The customer disputes € 14,200 of the invoice because two spare parts were delivered late and withholds payment of that amount.', 'Der Kunde beanstandet 14.200 € der Rechnung wegen verspätet gelieferter Ersatzteile und behält den Betrag ein.'],
    parties: [['Wagner Konsumgüter AG', ROLE.customer]], dates: [[['Reply due', 'Antwort bis'], 5, 'deadline']] },
  { id: 'p10', f: 'DOCX', size: '21 KB', age: 5,
    name: ['Dunning letter level 2 - Meier Fahrzeugtechnik - draft', 'Mahnung Stufe 2 - Meier Fahrzeugtechnik - Entwurf'], type: ['Dunning Letter', 'Mahnung'],
    sum: ['Second reminder for three overdue invoices totalling € 27,650. Default interest and the € 40 flat fee still to be added.', 'Zweite Mahnung für drei überfällige Rechnungen über insgesamt 27.650 €. Verzugszinsen und 40-€-Pauschale fehlen noch.'],
    parties: [['Meier Fahrzeugtechnik GmbH', ROLE.customer]] },
  { id: 'p11', f: 'DOCX', size: '11 KB', age: 6,
    name: ['Notes - e-invoicing migration kick-off', 'Notizen - Kick-off E-Rechnung'], type: ['Meeting Notes', 'Gesprächsnotiz'],
    ref: ['E-invoicing migration', 'Umstellung E-Rechnung'],
    sum: ['Kick-off with IT: outgoing invoices move to ZUGFeRD by mid-2027; open question whether the ERP can send XRechnung to public-sector customers.', 'Kick-off mit der IT: Ausgangsrechnungen bis Mitte 2027 auf ZUGFeRD umstellen; offen ist, ob das ERP XRechnung an öffentliche Auftraggeber senden kann.'] },
  { id: 'p12', f: 'PDF', size: '640 KB', age: 6,
    name: ['Scan - supplier invoice Fischer (credit note?)', 'Scan - Lieferantenrechnung Fischer (Gutschrift?)'], type: ['Scan', 'Scan'] },
  { id: 'p13', f: 'PDF', size: '54 KB', age: 7,
    name: ['Email from tax adviser - forwarded - fiscal unity question', 'Mail Steuerberater - weitergeleitet - Frage Organschaft'], type: ['Correspondence', 'Korrespondenz'],
    sum: ['The tax adviser asks whether the profit transfer agreement with Brenner Service GmbH was actually carried out for 2025.', 'Der Steuerberater fragt, ob der Gewinnabführungsvertrag mit der Brenner Service GmbH für 2025 tatsächlich durchgeführt wurde.'],
    parties: [[STB, ROLE.sender]] },
  { id: 'p14', f: 'DOCX', size: '3 KB', age: 7,
    name: ['Reminder - call Sparkasse about covenant', 'Erinnerung - Sparkasse wg. Covenant anrufen'], type: ['Reminder', 'Erinnerung'] },
  { id: 'p15', f: 'PDF', size: '140 KB', age: 7,
    name: ['Late-payment surcharge - VAT September', 'Säumniszuschlag - USt-VA September'], type: ['Tax Notice', 'Steuerbescheid'],
    sum: ['Late-payment surcharge because the September VAT payment arrived four days late.', 'Säumniszuschlag, weil die Umsatzsteuer-Zahlung für September vier Tage zu spät einging.'],
    parties: [[FA, ROLE.sender]], dates: [[['Payment due', 'Zahlbar bis'], 9, 'deadline']] },
  { id: 'p16', f: 'XLSX', size: '112 KB', age: 8,
    name: ['Fixed-asset register 2026 - working draft', 'Anlagenverzeichnis 2026 - Arbeitsstand'], type: ['Fixed Asset Register', 'Anlagenverzeichnis'],
    sum: ['Straight-line depreciation for 2026 — the new CNC machine and two company cars still missing.', 'Lineare AfA für 2026 — die neue CNC-Maschine und zwei Firmenwagen fehlen noch.'] },
  { id: 'p17', f: 'DOCX', size: '12 KB', age: 8,
    name: ['Untitled document', 'Unbenanntes Dokument'], type: ['Other', 'Sonstiges'] },
  { id: 'p18', f: 'XLSX', size: '210 KB', age: 9,
    name: ['Budget 2027 - sales department input', 'Budget 2027 - Input Vertrieb'], type: ['Budget', 'Budget'],
    ref: ['Budget 2027', 'Budget 2027'] },
  { id: 'p19', f: 'PDF', size: '295 KB', age: 9,
    name: ['Audit order - tax audit 2022–2024', 'Prüfungsanordnung - Betriebsprüfung 2022–2024'], type: ['Tax Audit Notice', 'Prüfungsanordnung'],
    ref: ['Tax audit 2022–2024', 'Betriebsprüfung 2022–2024'],
    sum: ['Audit order covering corporate tax, trade tax and VAT for 2022 to 2024. Data access under the GoBD is requested.', 'Prüfungsanordnung für Körperschaftsteuer, Gewerbesteuer und Umsatzsteuer 2022 bis 2024. Datenzugriff nach GoBD wird angekündigt.'],
    parties: [[FA, ROLE.sender], [CO, ROLE.taxpayer]], dates: [[['Audit starts', 'Prüfungsbeginn'], 30, 'deadline']] },
  { id: 'p20', f: 'XLSX', size: '31 KB', age: 10,
    name: ['Trial balance Sept 2026 - DATEV export', 'Summen- und Saldenliste 09-2026 - DATEV-Export'], type: ['Trial Balance', 'Summen- und Saldenliste'],
    ref: ['Monthly close September', 'Monatsabschluss September'] },
  { id: 'p21', f: 'DOCX', size: '13 KB', age: 10,
    name: ['Draft - do not send', 'Entwurf - nicht versenden'], type: ['Correspondence', 'Korrespondenz'] },
  { id: 'p22', f: 'PDF', size: '1.4 MB', age: 13,
    name: ['Travel expense receipts - scanned', 'Reisekostenbelege - gescannt'], type: ['Scan', 'Scan'] },
  { id: 'p23', f: 'PDF', size: '520 KB', age: 12,
    name: ['Loan agreement Sparkasse - covenant annex', 'Darlehensvertrag Sparkasse - Anlage Covenants'], type: ['Loan Agreement', 'Darlehensvertrag'],
    sum: ['Financial covenants for the € 4m investment loan: equity ratio of at least 30% and net debt no more than 3.0 × EBITDA, tested on the annual accounts.', 'Financial Covenants zum Investitionsdarlehen über 4 Mio. €: Eigenkapitalquote mindestens 30 %, Nettoverschuldung höchstens 3,0 × EBITDA, geprüft am Jahresabschluss.'],
    parties: [[BANK, ROLE.bank], [CO, ROLE.company]], dates: [[['Covenant report due', 'Covenant-Nachweis bis'], 45, 'deadline']] },
  { id: 'p24', f: 'PDF', size: '44 KB', age: 14,
    name: ['ELSTER filing confirmation - VAT October', 'Übermittlungsprotokoll ELSTER - USt-VA Oktober'], type: ['Confirmation', 'Bestätigung'],
    parties: [[FA, ROLE.sender]], dates: [[['Filed', 'Übermittelt'], -14, 'action']] },
  { id: 'p25', f: 'PDF', size: '160 KB', age: 15,
    name: ['Letter from tax office - unread', 'Schreiben Finanzamt - ungelesen'], type: ['Tax Notice', 'Schreiben Finanzamt'],
    parties: [[FA, ROLE.sender]] },
  { id: 'p26', f: 'XLSX', size: '2.1 MB', age: 16,
    name: ['Open items list - receivables (copy)', 'OP-Liste Debitoren (Kopie)'], type: ['Spreadsheet', 'Tabelle'] },
  { id: 'p27', f: 'PDF', size: '102 KB', age: 18,
    name: ['Information request - input VAT from invoices', 'Auskunftsersuchen - Vorsteuer aus Rechnungen'], type: ['Information Request', 'Auskunftsersuchen'],
    sum: ['The tax office asks for the original invoices behind € 61,000 of input VAT claimed in Q2.', 'Das Finanzamt bittet um die Rechnungen zu 61.000 € Vorsteuer aus dem zweiten Quartal.'],
    parties: [[FA, ROLE.sender]], dates: [[['Reply due', 'Antwort bis'], 4, 'deadline']] },
  { id: 'p28', f: 'DOCX', size: '27 KB', age: 17,
    name: ['Engagement letter audit 2026 - draft - unsigned', 'Auftragsbestätigung Abschlussprüfung 2026 - Entwurf - nicht unterschrieben'], type: ['Draft Letter', 'Briefentwurf'],
    parties: [[WP, ROLE.auditor]] },
  { id: 'p29', f: 'XLSX', size: '112 KB', age: 20,
    name: ['Forecast 2026 - copy - do not edit', 'Forecast 2026 - Kopie - nicht bearbeiten'], type: ['Spreadsheet', 'Tabelle'] },
  { id: 'p30', f: 'DOCX', size: '8 KB', age: 22,
    name: ['Working notes - provisions year-end', 'Arbeitsnotizen - Rückstellungen Jahresabschluss'], type: ['Notes', 'Notiz'],
    ref: ['Year-end closing 2026', 'Jahresabschluss 2026'] },
  { id: 'p31', f: 'PDF', size: '98 KB', age: 24,
    name: ['Correspondence auditor - thread export', 'Korrespondenz Abschlussprüfer - Verlauf exportiert'], type: ['Correspondence', 'Korrespondenz'],
    ref: ['Annual audit 2025', 'Abschlussprüfung 2025'], parties: [[WP, ROLE.auditor]] },
  { id: 'p32', f: 'DOCX', size: '15 KB', age: 29,
    name: ['Draft memo - GoBD procedure documentation', 'Entwurf Memo - GoBD-Verfahrensdokumentation'], type: ['Memo', 'Memo'],
    sum: ['Open question: does the procedure documentation need updating once incoming invoices are archived in the new DMS?', 'Offene Frage: Muss die Verfahrensdokumentation angepasst werden, wenn Eingangsrechnungen künftig im neuen DMS archiviert werden?'] },
  { id: 'p33', f: 'PDF', size: '1.8 MB', age: 34,
    name: ['Copy of copy of annual financial statements 2025', 'Kopie von Kopie Jahresabschluss 2025'], type: ['Scan', 'Scan'] },
  { id: 'p34', f: 'XLSX', size: '7 KB', age: 38,
    name: ['Untitled spreadsheet', 'Unbenannte Tabelle'], type: ['Spreadsheet', 'Tabelle'] },
  { id: 'p35', f: 'PDF', size: '220 KB', age: 58,
    name: ['Certificate - IFRS refresher course', 'Teilnahmebestätigung - IFRS-Auffrischung'], type: ['Certificate', 'Zertifikat'],
    ref: ['Training 2026', 'Weiterbildung 2026'], dates: [[['Completed', 'Abgeschlossen'], -58, 'action']] },
  { id: 'p36', f: 'XLSX', size: '31 KB', age: 73,
    name: ['Tax deadline calendar 2026', 'Steuerterminkalender 2026'], type: ['Reference', 'Übersicht'] },
  { id: 'p37', f: 'XLSX', size: '18 KB', age: 147,
    name: ['Old supplier list - archive', 'Alte Lieferantenliste - Archiv'], type: ['Reference', 'Übersicht'] },
  { id: 'p38', f: 'PDF', size: '390 KB', age: 197,
    name: ['Scan_0042', 'Scan_0042'], type: ['Scan', 'Scan'] },
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
    why: ['Keeps answers to figures your team has checked.', 'Antworten stützen sich nur auf Zahlen, die Ihr Team geprüft hat.'] },
  { category: ['Citations', 'Belege'], icon: 'QuotesOutlined',
    text: ['Always cite the legal provision for every statement', 'Für jede Aussage die Rechtsgrundlage nennen'],
    why: ['Anyone can check an answer against the UStG, EStG or HGB.', 'Jede Antwort lässt sich an UStG, EStG oder HGB nachprüfen.'] },
  { category: ['Accounting framework', 'Rechnungslegung'], icon: 'OpenBookOutlined',
    text: ['Apply HGB, not IFRS, unless asked otherwise', 'HGB anwenden, nicht IFRS – außer auf ausdrückliche Nachfrage'],
    why: ['Matches the framework your annual accounts are prepared under.', 'Passt zu dem Standard, nach dem Ihr Jahresabschluss aufgestellt wird.'] },
  { category: ['Privacy', 'Datenschutz'], icon: 'LockOutlined',
    text: ['Never include salaries, bank details or personal data of employees', 'Keine Gehälter, Bankverbindungen oder personenbezogenen Daten von Beschäftigten nennen'],
    why: ['Keeps sensitive data out of answers and drafts.', 'Hält sensible Daten aus Antworten und Entwürfen heraus.'] },
  { category: ['Escalation', 'Eskalation'], icon: 'UsersOutlined',
    text: ['Refer binding tax questions to our tax adviser', 'Verbindliche Steuerfragen an unseren Steuerberater verweisen'],
    why: ['Hands questions with tax risk to the right people.', 'Gibt Fragen mit steuerlichem Risiko an die richtigen Ansprechpartner.'] },
  { category: ['Language', 'Sprache'], icon: 'WorldOutlined',
    text: ['Answer in German', 'Auf Deutsch antworten'],
    why: ['Matches the language you work and file in.', 'Passt zur Sprache, in der Sie arbeiten und Erklärungen abgeben.'] },
]

const guardrailExamples = (l: Lang): AreaGuardrailExample[] =>
  GUARDRAILS.map(g => ({ category: g.category[l], icon: g.icon, text: g.text[l], why: g.why[l] }))

// ─── CoPilot ──────────────────────────────────────────────────────────────────

const CHATS: { id: string; day: AreaChat['day']; title: Pair; question: Pair; answer: Pair }[] = [
  { id: 'home-today-1', day: 'today',
    title: ['VAT on an advance payment', 'Umsatzsteuer auf eine Anzahlung'],
    question: [
      'A customer paid a 30% advance on a machine we deliver in March. When is the VAT due?',
      'Ein Kunde hat 30 % Anzahlung auf eine Maschine geleistet, die wir im März liefern. Wann entsteht die Umsatzsteuer?',
    ],
    answer: [
      'VAT on an advance payment arises **when the money is received**, not on delivery: it is due with the return for the period in which the payment came in (§ 13 Abs. 1 Nr. 1 a Satz 4 UStG). Your customer can deduct it once they hold an advance invoice and have paid. In the **final invoice** in March, deduct the advance and the VAT already charged on it (§ 14 Abs. 5 UStG) so the tax isn’t declared twice.',
      'Bei Anzahlungen entsteht die Umsatzsteuer **mit Vereinnahmung**, nicht erst bei Lieferung: Sie ist in der Voranmeldung für den Zeitraum anzumelden, in dem das Geld eingegangen ist (§ 13 Abs. 1 Nr. 1 a Satz 4 UStG). Ihr Kunde kann die Vorsteuer abziehen, sobald ihm eine Anzahlungsrechnung vorliegt und er gezahlt hat. In der **Schlussrechnung** im März ziehen Sie die Anzahlung und die darauf entfallende Steuer ab (§ 14 Abs. 5 UStG), damit die Steuer nicht doppelt angemeldet wird.',
    ] },
  { id: 'home-today-2', day: 'today',
    title: ['Objection to the corporate tax assessment', 'Einspruch gegen den KSt-Bescheid'],
    question: [
      'Our 2024 corporate tax assessment is higher than the return. How long do we have to object?',
      'Unser Körperschaftsteuerbescheid 2024 liegt über der Erklärung. Wie lange haben wir Zeit für einen Einspruch?',
    ],
    answer: [
      'You have **one month** from notification (§ 355 AO); a letter sent by post counts as notified on the **fourth day** after it was posted (§ 122 Abs. 2 Nr. 1 AO). An objection does not stop the payment falling due, so if you don’t want to pay the disputed amount, apply for **suspension of enforcement** at the same time (§ 361 AO). Agree the reasoning on the warranty provision with your tax adviser; it can follow after the deadline.',
      'Sie haben **einen Monat** ab Bekanntgabe Zeit (§ 355 AO); ein per Post versandter Bescheid gilt am **vierten Tag** nach Aufgabe zur Post als bekannt gegeben (§ 122 Abs. 2 Nr. 1 AO). Der Einspruch hemmt die Zahlung nicht – wenn Sie den strittigen Betrag nicht zahlen möchten, beantragen Sie gleichzeitig **Aussetzung der Vollziehung** (§ 361 AO). Die Begründung zur Gewährleistungsrückstellung stimmen Sie mit Ihrem Steuerberater ab; sie kann nach Fristablauf nachgereicht werden.',
    ] },
  { id: 'home-yesterday-1', day: 'yesterday',
    title: ['E-invoicing obligations from 2027', 'E-Rechnungspflicht ab 2027'],
    question: [
      'From when do we have to send e-invoices to business customers, and which formats count?',
      'Ab wann müssen wir an Geschäftskunden E-Rechnungen schicken, und welche Formate zählen?',
    ],
    answer: [
      'Since 1 January 2025 every business must be able to **receive** e-invoices. Sending them becomes mandatory from **1 January 2027** if your prior-year turnover was over **€ 800,000**, and for all businesses from 2028 (§ 27 Abs. 38 UStG). Valid formats follow EN 16931 — **XRechnung** or **ZUGFeRD** from version 2.0.1 (not the MINIMUM and BASIC WL profiles); a plain PDF no longer counts.',
      'Seit dem 1. Januar 2025 müssen alle Unternehmen E-Rechnungen **empfangen** können. Der **Versand** ist ab dem **1. Januar 2027** Pflicht, wenn der Vorjahresumsatz über **800.000 €** lag, ab 2028 für alle (§ 27 Abs. 38 UStG). Zulässig sind Formate nach EN 16931 – **XRechnung** oder **ZUGFeRD** ab Version 2.0.1 (nicht die Profile MINIMUM und BASIC WL); ein einfaches PDF genügt nicht mehr.',
    ] },
  { id: 'home-yesterday-2', day: 'yesterday',
    title: ['Retention periods for accounting records', 'Aufbewahrungsfristen für Buchhaltungsunterlagen'],
    question: [
      'How long do we have to keep invoices and booking vouchers now?',
      'Wie lange müssen wir Rechnungen und Buchungsbelege inzwischen aufbewahren?',
    ],
    answer: [
      'Since 2025, **booking vouchers** such as invoices only need to be kept for **8 years** (§ 147 Abs. 3 AO, § 257 Abs. 4 HGB). **Books, inventories and annual financial statements** stay at **10 years**, and business letters at 6. The period starts at the end of the calendar year in which the document was created — and keep anything relevant to an open tax audit until it has closed.',
      'Seit 2025 sind **Buchungsbelege** wie Rechnungen nur noch **8 Jahre** aufzubewahren (§ 147 Abs. 3 AO, § 257 Abs. 4 HGB). **Bücher, Inventare und Jahresabschlüsse** bleiben bei **10 Jahren**, Handels- und Geschäftsbriefe bei 6. Die Frist beginnt mit Ablauf des Kalenderjahres, in dem die Unterlage entstanden ist – und was für eine laufende Betriebsprüfung relevant ist, bewahren Sie bis zu deren Abschluss auf.',
    ] },
  { id: 'home-yesterday-3', day: 'yesterday',
    title: ['Provision for audit costs', 'Rückstellung für Prüfungskosten'],
    question: [
      'Can we recognise a provision for the cost of next year’s audit of the 2026 accounts?',
      'Dürfen wir für die Prüfung des Jahresabschlusses 2026 schon eine Rückstellung bilden?',
    ],
    answer: [
      'Yes — as a medium-sized GmbH you are **required to have your accounts audited** (§ 316 HGB), so the cost is an uncertain liability that relates to 2026 and **must** be provided for (§ 249 Abs. 1 HGB). The same applies to preparing the accounts and the 2026 tax returns. Measure it at the **expected settlement amount** under HGB (§ 253 Abs. 1 HGB); for tax purposes, include only direct costs and an appropriate share of overheads (§ 6 Abs. 1 Nr. 3a b EStG).',
      'Ja – als mittelgroße GmbH sind Sie **prüfungspflichtig** (§ 316 HGB). Die Kosten sind daher eine ungewisse Verbindlichkeit, die wirtschaftlich 2026 verursacht ist, und **müssen** zurückgestellt werden (§ 249 Abs. 1 HGB). Gleiches gilt für die Aufstellung des Abschlusses und die Steuererklärungen 2026. Handelsrechtlich bewerten Sie mit dem **Erfüllungsbetrag** (§ 253 Abs. 1 HGB), steuerlich nur mit Einzelkosten und angemessenen Gemeinkosten (§ 6 Abs. 1 Nr. 3a b EStG).',
    ] },
]

const chats = (l: Lang): AreaChat[] => CHATS.map(c => ({ id: c.id, day: c.day, title: c.title[l], question: c.question[l], answer: c.answer[l] }))

const ARTICLES: { keywords: RegExp; title: Pair; excerpt: Pair; general?: boolean }[] = [
  {
    keywords: /advance|anzahlung|vorauszahlung|(steuer)?entstehung|entsteh|when.{0,20}vat.{0,10}(due|aris)/i,
    title: ['§ 13 UStG — when VAT arises | Commentary', '§ 13 UStG – Entstehung der Steuer | Kommentar'],
    excerpt: [
      'Under taxation on agreed amounts, VAT arises at the end of the return period in which the supply was made. For advance payments it arises earlier, at the end of the period in which the payment was received (§ 13 Abs. 1 Nr. 1 a Satz 4 UStG), whether or not an invoice was issued.',
      'Bei der Sollbesteuerung entsteht die Steuer mit Ablauf des Voranmeldungszeitraums, in dem die Leistung ausgeführt wurde. Bei Anzahlungen entsteht sie früher, mit Ablauf des Zeitraums der Vereinnahmung (§ 13 Abs. 1 Nr. 1 a Satz 4 UStG) – unabhängig davon, ob eine Rechnung gestellt wurde.',
    ],
  },
  {
    keywords: /input.?vat|vorsteuer|invoice|rechnung|(^|[^a-z])(vat|ust)([^a-z]|$)|umsatzsteuer/i,
    title: ['Input VAT deduction: requirements and invoice details | Lexicon', 'Vorsteuerabzug: Voraussetzungen und Rechnungsangaben | Lexikon'],
    excerpt: [
      'Input VAT can be deducted once the supply has been received and a proper invoice is held (§ 15 Abs. 1 UStG). The invoice must contain all details required by § 14 Abs. 4 UStG — including the tax number or VAT ID, a sequential invoice number and the date of supply. Missing details can be corrected retrospectively.',
      'Der Vorsteuerabzug setzt voraus, dass die Leistung bezogen wurde und eine ordnungsgemäße Rechnung vorliegt (§ 15 Abs. 1 UStG). Die Rechnung muss alle Pflichtangaben nach § 14 Abs. 4 UStG enthalten – unter anderem Steuernummer oder USt-IdNr., fortlaufende Rechnungsnummer und Leistungszeitpunkt. Fehlende Angaben können rückwirkend berichtigt werden.',
    ],
    general: true,
  },
  {
    keywords: /objection|einspruch|assessment|bescheid|aussetzung|suspension|appeal/i,
    title: ['Objection procedure — deadlines and suspension of enforcement | Article', 'Einspruchsverfahren – Fristen und Aussetzung der Vollziehung | Fachbeitrag'],
    excerpt: [
      'An objection must be lodged in writing or electronically within one month of notification (§ 355 AO). It does not suspend payment; to avoid paying the disputed amount, apply for suspension of enforcement (§ 361 AO), which is granted where there are serious doubts about the assessment’s legality.',
      'Der Einspruch ist innerhalb eines Monats nach Bekanntgabe schriftlich oder elektronisch einzulegen (§ 355 AO). Er hemmt die Zahlung nicht; um den strittigen Betrag nicht zahlen zu müssen, ist Aussetzung der Vollziehung zu beantragen (§ 361 AO). Sie wird gewährt, wenn ernstliche Zweifel an der Rechtmäßigkeit des Bescheids bestehen.',
    ],
  },
  {
    keywords: /e.?invoic|e.?rechnung|xrechnung|zugferd|en.?16931/i,
    title: ['E-invoicing in B2B: obligations and transition periods | Lexicon', 'E-Rechnung im B2B-Bereich: Pflichten und Übergangsfristen | Lexikon'],
    excerpt: [
      'Since 1 January 2025 businesses must be able to receive e-invoices in a structured format under EN 16931. Paper and plain PDF invoices remain allowed for 2025 and 2026; from 2027 they are only allowed for businesses with prior-year turnover of up to € 800,000, and from 2028 not at all (§ 27 Abs. 38 UStG).',
      'Seit dem 1. Januar 2025 müssen Unternehmen E-Rechnungen in einem strukturierten Format nach EN 16931 empfangen können. Papier- und PDF-Rechnungen bleiben 2025 und 2026 zulässig, 2027 nur noch bei einem Vorjahresumsatz bis 800.000 € und ab 2028 gar nicht mehr (§ 27 Abs. 38 UStG).',
    ],
  },
  {
    keywords: /gobd|retention|aufbewahr|archiv|verfahrensdoku|procedure.?doc|bookkeeping|buchführung|buchhaltung/i,
    title: ['GoBD — proper bookkeeping and data access | Lexicon', 'GoBD – ordnungsmäßige Buchführung und Datenzugriff | Lexikon'],
    excerpt: [
      'Books and records must be complete, correct, timely, orderly and unalterable (§ 146 AO). Electronic documents must be kept in their original format for the full retention period, and the tax office may access the data during an audit (§ 147 Abs. 6 AO). A procedure documentation describes how documents flow through the company’s systems.',
      'Bücher und Aufzeichnungen sind vollständig, richtig, zeitgerecht, geordnet und unveränderbar zu führen (§ 146 AO). Elektronische Unterlagen sind im Ursprungsformat für die gesamte Aufbewahrungsfrist vorzuhalten; bei einer Außenprüfung hat das Finanzamt Datenzugriff (§ 147 Abs. 6 AO). Eine Verfahrensdokumentation beschreibt, wie Belege durch die Systeme des Unternehmens laufen.',
    ],
    general: true,
  },
  {
    keywords: /provision|rückstellung|ruckstellung|year.?end|jahresabschluss|closing|abschluss|accrual/i,
    title: ['§ 249 HGB — provisions for uncertain liabilities | Commentary', '§ 249 HGB – Rückstellungen für ungewisse Verbindlichkeiten | Kommentar'],
    excerpt: [
      'Provisions must be recognised for uncertain liabilities and for expected losses from executory contracts (§ 249 Abs. 1 HGB). They are measured at the settlement amount required by prudent business judgement; provisions with a term of more than one year are discounted (§ 253 Abs. 1 and 2 HGB).',
      'Rückstellungen sind für ungewisse Verbindlichkeiten und drohende Verluste aus schwebenden Geschäften zu bilden (§ 249 Abs. 1 HGB). Sie sind mit dem nach vernünftiger kaufmännischer Beurteilung notwendigen Erfüllungsbetrag anzusetzen; bei einer Restlaufzeit von mehr als einem Jahr wird abgezinst (§ 253 Abs. 1 und 2 HGB).',
    ],
    general: true,
  },
  {
    keywords: /tax.?audit|betriebspr(ü|ue|u)f|au(ß|ss)enpr(ü|ue|u)f|pr(ü|ue|u)fungsanordnung|audit.?order/i,
    title: ['Tax audit: preparation, rights and duties | Work aid', 'Betriebsprüfung: Vorbereitung, Rechte und Pflichten | Arbeitshilfe'],
    excerpt: [
      'The audit order sets out the taxes and years to be audited and must be sent a reasonable time in advance (§ 196, § 197 AO). The company must cooperate and provide documents and data access (§ 200 AO); repeated delays can lead to a penalty for late cooperation (§ 200a AO). A named contact person and a prepared document list shorten the audit.',
      'Die Prüfungsanordnung legt Steuerarten und Zeiträume fest und ist angemessene Zeit vor Prüfungsbeginn bekannt zu geben (§§ 196, 197 AO). Das Unternehmen muss mitwirken, Unterlagen vorlegen und Datenzugriff gewähren (§ 200 AO); bei Verzögerungen droht ein Mitwirkungsverzögerungsgeld (§ 200a AO). Ein fester Ansprechpartner und eine vorbereitete Unterlagenliste verkürzen die Prüfung.',
    ],
  },
  {
    keywords: /dunning|mahn|default|verzug|overdue|(ü|ue|u)berf(ä|ae|a)llig|receivable|forderung|dispute|reklamation/i,
    title: ['Dunning and default interest between businesses | Work aid', 'Mahnwesen und Verzugszinsen im B2B-Geschäft | Arbeitshilfe'],
    excerpt: [
      'A business customer is in default at the latest 30 days after receiving the invoice (§ 286 Abs. 3 BGB). From then on, default interest of 9 percentage points above the base rate applies, plus a flat fee of € 40 per invoice (§ 288 Abs. 2 and 5 BGB). Disputed amounts should be separated from undisputed ones so the rest can be collected.',
      'Ein Geschäftskunde gerät spätestens 30 Tage nach Zugang der Rechnung in Verzug (§ 286 Abs. 3 BGB). Ab dann fallen Verzugszinsen von 9 Prozentpunkten über dem Basiszinssatz an, zusätzlich eine Pauschale von 40 € je Rechnung (§ 288 Abs. 2 und 5 BGB). Strittige Beträge sollten vom unstrittigen Teil getrennt werden, damit dieser eingefordert werden kann.',
    ],
  },
  {
    keywords: /cash.?flow|liquidit|covenant|forecast|budget|bank|loan|darlehen|kredit|ebitda/i,
    title: ['Liquidity planning and covenant monitoring | Article', 'Liquiditätsplanung und Covenant-Monitoring | Fachbeitrag'],
    excerpt: [
      'A rolling 13-week cash-flow plan shows bottlenecks early and is the basis for talks with the bank. Financial covenants such as the equity ratio or net debt to EBITDA should be forecast alongside it, so a breach is visible before the annual accounts are tested. Banks may request financial statements for loans above € 750,000 (§ 18 KWG).',
      'Eine rollierende 13-Wochen-Liquiditätsplanung zeigt Engpässe früh und ist Grundlage für Bankgespräche. Financial Covenants wie Eigenkapitalquote oder Nettoverschuldung zu EBITDA sollten mitgeplant werden, damit ein Bruch sichtbar wird, bevor der Jahresabschluss geprüft wird. Bei Krediten über 750.000 € kann die Bank die Offenlegung der Abschlüsse verlangen (§ 18 KWG).',
    ],
  },
]

const articles = (l: Lang): AreaArticle[] =>
  ARTICLES.map(a => ({ keywords: a.keywords, title: a.title[l], excerpt: a.excerpt[l], ...(a.general && { general: true }) }))

// ─── Product start page ──────────────────────────────────────────────────────

// ─── Uploads ──────────────────────────────────────────────────────────────────

const ue = '(ü|ue|u)'
const ae = '(ä|ae|a)'
const re = (source: string) => new RegExp(source, 'i')

// File name pattern → [en, de] type, most specific first.
const TYPE_RULES: [RegExp, Pair][] = [
  [/umsatzsteuer.?voranmeldung|ust.?va([^a-z]|$)|vat.?return/i, ['VAT Return', 'Umsatzsteuer-Voranmeldung']],
  [/gewerbesteuererkl|trade.?tax.?return/i, ['Trade Tax Return', 'Gewerbesteuererklärung']],
  [/s(ä|ae|a)umniszuschlag|late.?payment|verspätungszuschlag|late.?filing/i, ['Tax Notice', 'Steuerbescheid']],
  [/steuerbescheid|bescheid|assessment/i, ['Tax Assessment', 'Steuerbescheid']],
  [re(`betriebspr${ue}fungsbericht|tax.?audit.?report`), ['Tax Audit Report', 'Prüfungsbericht']],
  [re(`pr${ue}fungsanordnung|audit.?order`), ['Tax Audit Notice', 'Prüfungsanordnung']],
  [re(`betriebspr${ue}fung|au(ß|ss)enpr${ue}fung|tax.?audit`), ['Tax Audit Correspondence', 'Korrespondenz Betriebsprüfung']],
  [re(`abschlusspr${ue}f|wirtschaftspr${ue}f|auditor|annual.?audit|anforderungsliste|request.?list`), ['Audit Correspondence', 'Prüfungskorrespondenz']],
  [/auskunftsersuchen|information.?request/i, ['Information Request', 'Auskunftsersuchen']],
  [/jahresabschluss.?checkliste|checkliste.?jahresabschluss|year.?end.?(closing.?)?checklist|closing.?checklist/i, ['Checklist', 'Checkliste']],
  [/jahresabschluss|annual.?(accounts|financial.?statements?)/i, ['Annual Financial Statement', 'Jahresabschluss']],
  [/(^|[^a-z])bwa([^a-z]|$)|business.?analysis/i, ['Business Analysis (BWA)', 'BWA']],
  [/summen.{0,3}und.{0,2}saldenliste|(^|[^a-z])susa([^a-z]|$)|trial.?balance/i, ['Trial Balance', 'Summen- und Saldenliste']],
  [/anlagenverzeichnis|anlagenspiegel|(fixed.?)?asset.?register/i, ['Fixed Asset Register', 'Anlagenverzeichnis']],
  [/liquidit(ä|ae|a)t|cash.?flow/i, ['Cash-Flow Plan', 'Liquiditätsplanung']],
  [/forecast|hochrechnung|prognose/i, ['Forecast', 'Forecast']],
  [/budget|planung|plan.?20/i, ['Budget', 'Budget']],
  [/covenant|darlehen|kreditvertrag|loan/i, ['Loan Agreement', 'Darlehensvertrag']],
  [/xrechnung|zugferd|e.?rechnung|e.?invoic/i, ['E-Invoicing Notes', 'Notizen E-Rechnung']],
  [/mahnung|zahlungserinnerung|dunning|payment.?reminder/i, ['Dunning Letter', 'Mahnung']],
  [/reklamation|beanstandung|dispute|disputed/i, ['Invoice Dispute', 'Rechnungsreklamation']],
  [/gutschrift|credit.?note/i, ['Credit Note', 'Gutschrift']],
  [/(^|[^a-z])op.?liste|open.?items|offene.?posten/i, ['Open Items List', 'OP-Liste']],
  [/kassenbuch|cash.?book/i, ['Cash Book', 'Kassenbuch']],
  [/buchungsjournal|booking.?journal/i, ['Booking Journal', 'Buchungsjournal']],
  [/verfahrensdoku|procedure.?doc|gobd/i, ['Procedure Documentation', 'Verfahrensdokumentation']],
  [/vollmacht|power.?of.?attorney/i, ['Power of Attorney', 'Vollmacht']],
  [/protokoll|minutes|meeting|gespr(ä|ae|a)ch|call.?notes/i, ['Meeting Notes', 'Gesprächsnotiz']],
  [/checkliste|checklist/i, ['Checklist', 'Checkliste']],
  [/angebot|offer|quote|proposal/i, ['Offer', 'Angebot']],
  [/fristen|steuertermin|deadline/i, ['Deadline Overview', 'Fristenübersicht']],
  [/einspruch|objection/i, ['Objection', 'Einspruch']],
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
  [/policy|richtlinie/i, ['Policy', 'Richtlinie']],
]

const TOPICS: [RegExp, Pair][] = [
  [/umsatzsteuer|vorsteuer|(^|[^a-z])ust([^a-z]|$)|vat/i, ['VAT', 'Umsatzsteuer']],
  [re(`k(ö|oe|o)rperschaftsteuer|(^|[^a-z])kst([^a-z]|$)|corporate.?tax|organschaft|fiscal.?unity`), ['Corporate tax', 'Körperschaftsteuer']],
  [/gewerbesteuer|(^|[^a-z])gewst([^a-z]|$)|trade.?tax/i, ['Trade tax', 'Gewerbesteuer']],
  [/xrechnung|zugferd|e.?rechnung|e.?invoic/i, ['E-invoicing', 'E-Rechnung']],
  [/jahresabschluss|year.?end|closing|r(ü|ue|u)ckstellung|provision/i, ['Year-end closing', 'Jahresabschluss']],
  [re(`betriebspr${ue}fung|tax.?audit|pr${ue}fungsanordnung`), ['Tax audit', 'Betriebsprüfung']],
  [re(`abschlusspr${ue}f|auditor|annual.?audit`), ['Annual audit', 'Abschlussprüfung']],
  [/liquidit|cash.?flow|covenant|darlehen|loan/i, ['Liquidity and financing', 'Liquidität und Finanzierung']],
  [/budget|forecast|planung|hochrechnung/i, ['Planning', 'Planung']],
  [/mahn|dunning|reklamation|dispute|forderung|receivable|(^|[^a-z])op.?liste/i, ['Receivables', 'Forderungsmanagement']],
  [/abschreibung|(^|[^a-z])afa([^a-z]|$)|depreciat|anlagenverzeichnis|asset.?register/i, ['Fixed assets', 'Anlagevermögen']],
  [/gobd|aufbewahr|retention|archiv/i, ['GoBD and retention', 'GoBD und Aufbewahrung']],
  [/lohn|payroll|gehalt/i, ['Payroll', 'Lohn und Gehalt']],
]

const PARTIES: [RegExp, { name: string; role: Pair }][] = [
  [/bundeszentralamt|(^|[^a-z])bzst([^a-z]|$)/i, { name: 'Bundeszentralamt für Steuern', role: ROLE.taxOffice }],
  [/finanzamt|tax.?office/i, { name: FA, role: ROLE.taxOffice }],
  [/zoll|customs/i, { name: 'Hauptzollamt Ulm', role: ROLE.customs }],
  [/hoffmann|steuerberat|tax.?adviser/i, { name: STB, role: ROLE.taxAdviser }],
  [re(`kessler|wirtschaftspr${ue}f|abschlusspr${ue}f|auditor`), { name: WP, role: ROLE.auditor }],
  [/sparkasse/i, { name: BANK, role: ROLE.bank }],
  [/wagner/i, { name: 'Wagner Konsumgüter AG', role: ROLE.customer }],
  [/meier/i, { name: 'Meier Fahrzeugtechnik GmbH', role: ROLE.customer }],
  [/fischer/i, { name: 'Fischer Stahlhandel KG', role: ROLE.supplier }],
  [/datev/i, { name: 'DATEV eG', role: ROLE.provider }],
]

const uploads = (l: Lang): AreaUploads => ({
  typeRules: TYPE_RULES.map(([pattern, type]) => [pattern, type[l]]),
  topics: TOPICS.map(([pattern, topic]) => [pattern, topic[l]]),
  parties: PARTIES.map(([pattern, p]) => [pattern, { name: p.name, role: p.role[l] }]),
  matters: ([
    ['VAT return Q4 2026', 'USt-Voranmeldung Q4 2026'],
    ['Year-end closing 2026', 'Jahresabschluss 2026'],
    ['Annual audit 2026', 'Abschlussprüfung 2026'],
    ['Tax audit 2022–2024', 'Betriebsprüfung 2022–2024'],
    ['Budget 2027', 'Budget 2027'],
    ['E-invoicing migration', 'Umstellung E-Rechnung'],
  ] satisfies Pair[]).map(m => m[l]),
  counterparties: [
    { name: FA, role: ROLE.taxOffice[l] },
    { name: STB, role: ROLE.taxAdviser[l] },
    { name: WP, role: ROLE.auditor[l] },
    { name: BANK, role: ROLE.bank[l] },
  ],
  primaryRole: ROLE.company[l],
  deadlineLabels: ([['Reply due', 'Antwort bis'], ['Filing deadline', 'Abgabefrist'], ['Payment due', 'Zahlbar bis'], ['Review by', 'Prüfen bis']] satisfies Pair[]).map(p => p[l]),
  actionLabels: ([['Received', 'Eingegangen'], ['Booked', 'Gebucht'], ['Filed', 'Übermittelt'], ['Paid', 'Bezahlt']] satisfies Pair[]).map(p => p[l]),
})

// ─── Both languages ───────────────────────────────────────────────────────────

// ─── Workspace profile wording and connected-app documents ───────────────────

const SYNC_ROWS: Parameters<typeof syncFilesFor>[0] = {
  sharepoint: [
    ['VAT audit minutes 2026', 'USt-Prüfung Protokoll 2026', 'DOCX'], ['Corporate tax assessment 2025', 'Bescheid KSt 2025', 'PDF'], ['Proof of intra-community supplies', 'Nachweis innergemeinschaftliche Lieferungen', 'XLSX'],
    ['Accounting manual 2026', 'Bilanzierungshandbuch 2026', 'DOCX'], ['Annual financial statements 2025', 'Jahresabschluss 2025', 'PDF'], ['Reply to audit request', 'Antwort Prüfungsanforderung', 'DOCX'],
    ['Tax audit report 2024', 'Betriebsprüfungsbericht 2024', 'DOCX'], ['Trade tax return 2024', 'Gewerbesteuererklärung 2024', 'PDF'], ['Loan agreement Sparkasse Ulm', 'Darlehensvertrag Sparkasse Ulm', 'PDF'],
  ],
  googleDrive: [
    ['Budget 2027 draft', 'Budget 2027 Entwurf', 'XLSX'], ['Forecast Q4 2026', 'Forecast Q4 2026', 'XLSX'], ['Notes - call with tax adviser', 'Notizen - Gespräch Steuerberater', 'DOCX'],
    ['Year-end closing checklist', 'Checkliste Jahresabschluss', 'DOCX'], ['Covenant calculation Q3', 'Covenant-Berechnung Q3', 'XLSX'], ['E-invoicing migration plan', 'Umstellungsplan E-Rechnung', 'DOCX'],
    ['Deadline overview 2026', 'Fristenübersicht 2026', 'XLSX'], ['Liquidity plan 13 weeks', 'Liquiditätsplanung 13 Wochen', 'XLSX'], ['Power of attorney tax office signed', 'Vollmacht Finanzamt unterschrieben', 'PDF'],
  ],
  datev: [
    ['Payroll journal Q3 2026', 'Lohnjournal Q3 2026', 'XLSX'], ['Booking journal 09 2026', 'Buchungsjournal 09 2026', 'XLSX'], ['Business analysis September 2026', 'BWA September 2026', 'PDF'],
    ['Trial balance 2026', 'Summen- und Saldenliste 2026', 'XLSX'], ['VAT pre-registration 09 2026', 'Umsatzsteuer-Voranmeldung 09 2026', 'PDF'], ['Open items suppliers', 'Offene Posten Kreditoren', 'XLSX'],
    ['Cash book Q3 2026', 'Kassenbuch Q3 2026', 'XLSX'], ['Fixed asset register 2025', 'Anlagenverzeichnis 2025', 'PDF'], ['Payslip October 2026', 'Lohnabrechnung Oktober 2026', 'PDF'],
  ],
}

const PROFILE_AND_SYNC: Record<'en' | 'de', Pick<AreaContent, 'profile' | 'syncFiles'>> = {
  en: {
    profile: {
      listDescription: 'Shared documents everyone with access can rely on, brought together with a company’s or project’s context and rules — for accurate, in-context answers.',
      backgroundDescription: 'What your apps should know about this company, entity or project — who it is, what matters, how you like to work.',
      backgroundPlaceholder: 'e.g. Subsidiary in Austria, fiscal year ends in June, HGB and local GAAP, auditor prefers short written summaries…',
      detailsDescription: 'Facts about the workspace itself, such as entity number, cost centre or contact person.',
      detailLabelPlaceholder: 'e.g. Entity number',
      detailValuePlaceholder: 'e.g. 1020',
    },
    syncFiles: syncFilesFor(SYNC_ROWS, 'en'),
  },
  de: {
    profile: {
      listDescription: 'Gemeinsame Dokumente, auf die sich alle mit Zugriff verlassen können – zusammen mit dem Kontext und den Regeln zu einer Gesellschaft oder einem Projekt. Für genaue Antworten, die zum Fall passen.',
      backgroundDescription: 'Was Ihre Apps über diese Gesellschaft, diese Einheit oder dieses Projekt wissen sollten – wer es ist, worauf es ankommt, wie Sie arbeiten möchten.',
      backgroundPlaceholder: 'z. B. Tochtergesellschaft in Österreich, Geschäftsjahr endet im Juni, HGB und UGB, Abschlussprüfer bevorzugt kurze schriftliche Zusammenfassungen …',
      detailsDescription: 'Fakten zum Arbeitsbereich selbst, etwa Gesellschaftsnummer, Kostenstelle oder Ansprechperson.',
      detailLabelPlaceholder: 'z. B. Gesellschaftsnummer',
      detailValuePlaceholder: 'z. B. 1020',
    },
    syncFiles: syncFilesFor(SYNC_ROWS, 'de'),
  },
}

export const FINANCE: { en: AreaContent; de: AreaContent } = {
  en: {
    ...PROFILE_AND_SYNC.en,
    areaLabel: 'Finance',
    product: { name: 'Haufe Finance Office Professional', shortName: 'Finance Office', icon: '/user-testing-nov-26/product-icons/finance-office.png', mark: 'FI' },
    myDocuments: myDocuments(0),
    workspaces: {
      createIntro: 'Bring a company’s or project’s documents and context together so answers always fit your figures.',
      equation: {
        workspaceText: 'Your entities, contracts and accounting policies.',
        haufeText: 'Tax law, accounting standards and expert guidance.',
        resultTitle: 'Answers that fit your books',
        resultText: 'Sourced responses, without re-explaining.',
      },
      guardrailExamples: guardrailExamples(0),
      previewGuardrails: ['Only answer from the documents in this workspace', 'Always cite the legal provision for every statement', 'Apply HGB, not IFRS, unless asked otherwise'],
      profileLabels: ['Legal form', 'Tax number', 'VAT ID', 'Fiscal year', 'Accounting framework', 'Auditor'],
      matterPlaceholder: 'e.g. Year-end closing 2026',
      tryAsking: name => `Which deadlines are coming up next in ${name}?`,
    },
    copilot: {
      chats: chats(0),
      genericAdvice: 'I’d check the relevant provisions in the UStG, EStG, KStG or HGB and any internal accounting policy on file, then confirm the figures against your bookkeeping before you finalise anything.',
      simulatedNote: 'Simulated response for prototyping — connect a real assistant to answer from your actual accounts.',
      articles: articles(0),
      fixedReply: MUSTERFIRMA.finance.en,
      fileExcerpts: [
        'Section 2 lists the accounts concerned and the amounts booked at the reporting date.',
        'The relevant paragraph records what was agreed with the tax adviser and from which period it applies.',
        'Page 3 summarises the open points and the deadlines noted at the time.',
      ],
    },
    office: FINANCE_OFFICE.en,
    uploads: uploads(0),
  },
  de: {
    ...PROFILE_AND_SYNC.de,
    areaLabel: 'Finanzen',
    product: { name: 'Haufe Finance Office Professional', shortName: 'Finance Office', icon: '/user-testing-nov-26/product-icons/finance-office.png', mark: 'FI' },
    myDocuments: myDocuments(1),
    workspaces: {
      createIntro: 'Bündeln Sie Unterlagen und Kontext zu einer Gesellschaft oder einem Projekt, damit Antworten immer zu Ihren Zahlen passen.',
      equation: {
        workspaceText: 'Ihre Gesellschaften, Verträge und Bilanzierungsrichtlinien.',
        haufeText: 'Steuerrecht, Rechnungslegung und Expertenwissen.',
        resultTitle: 'Antworten, die zu Ihren Büchern passen',
        resultText: 'Mit Quellen belegt, ohne alles neu zu erklären.',
      },
      guardrailExamples: guardrailExamples(1),
      previewGuardrails: ['Nur aus den Dokumenten in diesem Arbeitsbereich antworten', 'Für jede Aussage die Rechtsgrundlage nennen', 'HGB anwenden, nicht IFRS – außer auf ausdrückliche Nachfrage'],
      profileLabels: ['Rechtsform', 'Steuernummer', 'USt-IdNr.', 'Geschäftsjahr', 'Rechnungslegung', 'Abschlussprüfer'],
      matterPlaceholder: 'z. B. Jahresabschluss 2026',
      tryAsking: name => `Welche Fristen stehen in „${name}“ als Nächstes an?`,
    },
    copilot: {
      chats: chats(1),
      genericAdvice: 'Ich würde die einschlägigen Vorschriften in UStG, EStG, KStG oder HGB sowie Ihre internen Bilanzierungsrichtlinien prüfen und die Zahlen mit Ihrer Buchhaltung abgleichen, bevor Sie etwas abschließen.',
      simulatedNote: 'Simulierte Antwort für den Prototyp – verbinden Sie einen echten Assistenten, um aus Ihren tatsächlichen Buchhaltungsdaten zu antworten.',
      articles: articles(1),
      fixedReply: MUSTERFIRMA.finance.de,
      fileExcerpts: [
        'Abschnitt 2 führt die betroffenen Konten und die zum Stichtag gebuchten Beträge auf.',
        'Der einschlägige Absatz hält fest, was mit dem Steuerberater vereinbart wurde und ab welchem Zeitraum es gilt.',
        'Seite 3 fasst die offenen Punkte und die damals notierten Fristen zusammen.',
      ],
    },
    office: FINANCE_OFFICE.de,
    uploads: uploads(1),
  },
}
