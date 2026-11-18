import type { AreaArticle, AreaChat, AreaContent, AreaDocument, AreaGuardrailExample } from './types'
import { syncFilesFor } from './types'
import { OD_OFFICE } from './office/od'

/**
 * öD (öffentlicher Dienst, public sector): an HR officer (Personalsachbearbeiterin) in the Personalamt of the
 * Stadt Lindenfeld, a fictional town in North Rhine-Westphalia (about 1,150 employees). Employees are on the TVöD
 * (VKA), Kita staff on the TVöD SuE tables, firefighters and some administrative staff are Beamte under the state
 * civil-service law (LBG NRW). The Personalrat has co-determination rights under the LPVG NRW. Product: Haufe TVöD
 * Office Professional with CoPilot HR öD. Both languages share ids, counts and the German setting; names stay German.
 */

type Lang<T> = { en: T; de: T }
const pick = <T,>(items: Lang<T>[], lang: 'en' | 'de') => items.map(item => item[lang])

// ─── My Documents ─────────────────────────────────────────────────────────────

type DocText = Pick<AreaDocument, 'matterReference' | 'summary' | 'parties' | 'dates'> & { name: string; type: string }
const doc = (id: string, fileFormat: AreaDocument['fileFormat'], fileSize: string, age: number, en: DocText, de: DocText): Lang<AreaDocument> => {
  const build = ({ name, type, ...meta }: DocText): AreaDocument => ({ id, name, documentType: type, fileFormat, fileSize, age, ...meta })
  return { en: build(en), de: build(de) }
}

const PR = 'Personalrat der Stadt Lindenfeld'

const DOCUMENTS: Lang<AreaDocument>[] = [
  doc('o1', 'DOCX', '18 KB', 1,
    { name: 'Classification note - M. Kaiser, citizens’ office', type: 'Classification Note', matterReference: 'Job evaluation citizens’ office 2026', summary: 'Breakdown of the tasks in the new role. The share of work needing independent judgement points to EG 9a rather than EG 8.', parties: [['Melanie Kaiser', 'Employee']], dates: [['Request staff council consent', 6, 'deadline']] },
    { name: 'Eingruppierungsvermerk - M. Kaiser, Bürgerbüro', type: 'Eingruppierungsvermerk', matterReference: 'Stellenbewertung Bürgerbüro 2026', summary: 'Aufschlüsselung der Arbeitsvorgänge der neuen Stelle. Der Anteil selbständiger Leistungen spricht für EG 9a statt EG 8.', parties: [['Melanie Kaiser', 'Beschäftigte']], dates: [['Zustimmung Personalrat beantragen', 6, 'deadline']] }),
  doc('o2', 'PDF', '2.6 MB', 1,
    { name: 'Application for higher grade - D. Yilmaz (scan)', type: 'Application', summary: 'Handwritten request from a Bauhof employee: he has led the winter-service crew since March and asks for EG 6.', parties: [['Dennis Yilmaz', 'Employee']] },
    { name: 'Antrag Höhergruppierung - D. Yilmaz (Scan)', type: 'Antrag', summary: 'Handschriftlicher Antrag eines Bauhof-Mitarbeiters: Er leitet seit März die Winterdienstkolonne und beantragt EG 6.', parties: [['Dennis Yilmaz', 'Beschäftigter']] }),
  doc('o3', 'XLSX', '64 KB', 2,
    { name: 'Step placement new hires Q4', type: 'Spreadsheet', summary: 'Seven new hires. For two of them it’s still open whether earlier jobs count as relevant experience under § 16 TVöD.', dates: [['To payroll by', 4, 'deadline']] },
    { name: 'Stufenzuordnung Neueinstellungen Q4', type: 'Tabelle', summary: 'Sieben Neueinstellungen. Bei zweien ist noch offen, ob frühere Tätigkeiten als einschlägige Berufserfahrung nach § 16 TVöD zählen.', dates: [['An Entgeltabrechnung bis', 4, 'deadline']] }),
  doc('o4', 'DOCX', '31 KB', 2,
    { name: 'Job advert civil engineer EG 11 - draft 2', type: 'Job Advertisement', matterReference: 'Recruitment civil engineering 2026', summary: 'Public advert for the civil engineering department. The equal opportunities officer still has to sign off, and the note for severely disabled applicants is missing.', parties: [['Ulrike Hahn', 'Equal opportunities officer']], dates: [['Publication planned', 7, 'deadline']] },
    { name: 'Stellenausschreibung Bauingenieur:in EG 11 - Entwurf 2', type: 'Stellenausschreibung', matterReference: 'Stellenbesetzung Tiefbau 2026', summary: 'Öffentliche Ausschreibung für das Tiefbauamt. Die Gleichstellungsbeauftragte muss noch zustimmen, der Hinweis für schwerbehinderte Bewerbende fehlt.', parties: [['Ulrike Hahn', 'Gleichstellungsbeauftragte']], dates: [['Veröffentlichung geplant', 7, 'deadline']] }),
  doc('o5', 'PDF', '140 KB', 3,
    { name: 'Staff council - consent to hiring S. Möller', type: 'Correspondence', matterReference: 'Recruitment civil engineering 2026', summary: 'The staff council agrees to the hiring at EG 11 and asks for the reasons for counting his previous experience (step 3).', parties: [[PR, 'Staff council'], ['Thomas Brückner', 'Chair'], ['Stefan Möller', 'Applicant']], dates: [['Consent given', -3, 'action']] },
    { name: 'Personalrat - Zustimmung Einstellung S. Möller', type: 'Korrespondenz', matterReference: 'Stellenbesetzung Tiefbau 2026', summary: 'Der Personalrat stimmt der Einstellung in EG 11 zu und bittet um eine Begründung für die Anrechnung der Vorerfahrung (Stufe 3).', parties: [[PR, 'Personalrat'], ['Thomas Brückner', 'Vorsitzender'], ['Stefan Möller', 'Bewerber']], dates: [['Zugestimmt', -3, 'action']] }),
  doc('o6', 'DOCX', '22 KB', 3,
    { name: 'LOB service agreement - draft 2027', type: 'Service Agreement', matterReference: 'Performance pay 2027', summary: 'Draft service agreement on performance pay under § 18 TVöD (VKA): target agreements and systematic performance assessment. Members of the joint committee still to be named.', parties: [[PR, 'Staff council']], dates: [['Negotiation with staff council', 10, 'deadline']] },
    { name: 'Dienstvereinbarung LOB - Entwurf 2027', type: 'Dienstvereinbarung', matterReference: 'Leistungsentgelt 2027', summary: 'Entwurf einer Dienstvereinbarung zum Leistungsentgelt nach § 18 TVöD (VKA): Zielvereinbarung und systematische Leistungsbewertung. Mitglieder der betrieblichen Kommission noch offen.', parties: [[PR, 'Personalrat']], dates: [['Verhandlung mit Personalrat', 10, 'deadline']] }),
  doc('o7', 'PDF', '560 KB', 4,
    { name: 'Scan_0311', type: 'Scan' },
    { name: 'Scan_0311', type: 'Scan' }),
  doc('o8', 'PDF', '310 KB', 5,
    { name: 'Part-time retirement application - A. Lorenz', type: 'Application', matterReference: 'Part-time retirement 2027', summary: 'Request for part-time retirement in the block model from 1 April 2027 (age 61, Kita kitchen). Check whether the 2.5% quota under the TV FlexAZ has already been reached.', parties: [['Andrea Lorenz', 'Employee']], dates: [['Decision due', 14, 'deadline']] },
    { name: 'Antrag Altersteilzeit - A. Lorenz', type: 'Antrag', matterReference: 'Altersteilzeit 2027', summary: 'Antrag auf Altersteilzeit im Blockmodell ab 1. April 2027 (61 Jahre, Kita-Küche). Prüfen, ob die Quote von 2,5 % nach TV FlexAZ bereits erreicht ist.', parties: [['Andrea Lorenz', 'Beschäftigte']], dates: [['Entscheidung fällig', 14, 'deadline']] }),
  doc('o9', 'XLSX', '88 KB', 5,
    { name: 'Annual special payment 2026 - checklist', type: 'Spreadsheet', summary: 'Pro-rata reductions for employees on parental leave or long-term sick; 14 cases still to check before the November payroll.', dates: [['November payroll closing', 3, 'deadline']] },
    { name: 'Jahressonderzahlung 2026 - Prüfliste', type: 'Tabelle', summary: 'Kürzungen um Zwölftel bei Elternzeit oder langer Krankheit; 14 Fälle sind vor der Novemberabrechnung noch zu prüfen.', dates: [['Abrechnungsschluss November', 3, 'deadline']] }),
  doc('o10', 'DOCX', '16 KB', 6,
    { name: 'Fixed-term contract - parental leave cover N. Fuchs', type: 'Employment Contract', summary: 'Fixed-term contract with an objective reason (cover for parental leave, § 21 BEEG), EG 9a, until 31 August 2028.', parties: [['Nadine Fuchs', 'Employee']], dates: [['Start of employment', 15, 'deadline']] },
    { name: 'Befristeter Arbeitsvertrag - Elternzeitvertretung N. Fuchs', type: 'Arbeitsvertrag', summary: 'Befristung mit Sachgrund (Vertretung während der Elternzeit, § 21 BEEG), EG 9a, bis 31. August 2028.', parties: [['Nadine Fuchs', 'Beschäftigte']], dates: [['Beginn des Arbeitsverhältnisses', 15, 'deadline']] }),
  doc('o11', 'DOCX', '5 KB', 7,
    { name: 'Untitled document', type: 'Other' },
    { name: 'Unbenanntes Dokument', type: 'Sonstiges' }),
  doc('o12', 'DOCX', '9 KB', 7,
    { name: 'Phone note - Beihilfe query K. Haas', type: 'Meeting Notes', summary: 'A firefighter (civil servant) asks whether Beihilfe covers his daughter’s orthodontic treatment. Referred to the Beihilfe office; reply still open.', parties: [['Kevin Haas', 'Civil servant']] },
    { name: 'Telefonnotiz - Beihilfefrage K. Haas', type: 'Gesprächsnotiz', summary: 'Ein Feuerwehrbeamter fragt, ob die Beihilfe die kieferorthopädische Behandlung seiner Tochter übernimmt. An die Beihilfestelle verwiesen; Antwort noch offen.', parties: [['Kevin Haas', 'Beamter']] }),
  doc('o13', 'PDF', '1.9 MB', 8,
    { name: 'Warning letter M. Schulte - signed', type: 'Warning Letter', summary: 'Warning for twice leaving the Bauhof site during working hours without signing out. The employee was heard beforehand (§ 3 (6) TVöD).', parties: [['Marco Schulte', 'Employee']], dates: [['Handed over', -8, 'action']] },
    { name: 'Abmahnung M. Schulte - unterschrieben', type: 'Abmahnung', summary: 'Abmahnung, weil der Beschäftigte zweimal während der Arbeitszeit ohne Abmeldung den Bauhof verlassen hat. Er wurde vorher angehört (§ 3 Abs. 6 TVöD).', parties: [['Marco Schulte', 'Beschäftigter']], dates: [['Übergeben', -8, 'action']] }),
  doc('o14', 'PDF', '72 KB', 9,
    { name: 'Minutes monthly meeting staff council October', type: 'Meeting Minutes', matterReference: 'Performance pay 2027', summary: 'Monthly meeting with the staff council: LOB draft, mobile working and the 2027 staffing plan. The staff council wants a say in the new time-recording system.', parties: [[PR, 'Staff council'], ['Thomas Brückner', 'Chair']], dates: [['Next monthly meeting', 21, 'deadline']] },
    { name: 'Protokoll Monatsgespräch Personalrat Oktober', type: 'Protokoll', matterReference: 'Leistungsentgelt 2027', summary: 'Monatsgespräch mit dem Personalrat: LOB-Entwurf, mobiles Arbeiten und Stellenplan 2027. Der Personalrat will beim neuen Zeiterfassungssystem mitbestimmen.', parties: [[PR, 'Personalrat'], ['Thomas Brückner', 'Vorsitzender']], dates: [['Nächstes Monatsgespräch', 21, 'deadline']] }),
  doc('o15', 'DOCX', '12 KB', 10,
    { name: 'Draft - do not send', type: 'Correspondence' },
    { name: 'Entwurf - nicht versenden', type: 'Korrespondenz' }),
  doc('o16', 'DOCX', '26 KB', 11,
    { name: 'Reference B. Neumann - draft', type: 'Reference', summary: 'Final reference for a clerk leaving the treasury after 14 years. The head of department’s assessment of her performance is still missing.', parties: [['Birgit Neumann', 'Employee']], dates: [['Last working day', 19, 'deadline']] },
    { name: 'Arbeitszeugnis B. Neumann - Entwurf', type: 'Arbeitszeugnis', summary: 'Endzeugnis für eine Sachbearbeiterin, die die Kämmerei nach 14 Jahren verlässt. Die Leistungsbeurteilung der Fachbereichsleitung fehlt noch.', parties: [['Birgit Neumann', 'Beschäftigte']], dates: [['Letzter Arbeitstag', 19, 'deadline']] }),
  doc('o17', 'XLSX', '45 KB', 12,
    { name: 'Staffing plan 2027 - working copy', type: 'Staffing Plan', matterReference: 'Budget 2027' },
    { name: 'Stellenplan 2027 - Arbeitskopie', type: 'Stellenplan', matterReference: 'Haushalt 2027' }),
  doc('o18', 'PDF', '230 KB', 13,
    { name: 'Supplementary pension - ZVK registration', type: 'Form', summary: 'Registration of four new hires with the supplementary pension fund. For one of them, earlier insurance periods with the VBL have to be transferred.', parties: [['Zusatzversorgungskasse (ZVK)', 'Pension fund']], dates: [['Registered', -13, 'action']] },
    { name: 'Zusatzversorgung - Anmeldung ZVK', type: 'Formular', summary: 'Anmeldung von vier Neueinstellungen bei der Zusatzversorgungskasse. Bei einer Person müssen frühere Versicherungszeiten bei der VBL übergeleitet werden.', parties: [['Zusatzversorgungskasse (ZVK)', 'Versorgungskasse']], dates: [['Angemeldet', -13, 'action']] }),
  doc('o19', 'DOCX', '15 KB', 15,
    { name: 'Probation review T. Krause', type: 'Assessment', summary: 'Probation ends on 30 November. The head of IT recommends keeping him on; feedback on punctuality.', parties: [['Tim Krause', 'Employee']], dates: [['End of probation', 13, 'deadline']] },
    { name: 'Probezeitbeurteilung T. Krause', type: 'Beurteilung', summary: 'Die Probezeit endet am 30. November. Die IT-Leitung empfiehlt die Übernahme; Hinweis zur Pünktlichkeit.', parties: [['Tim Krause', 'Beschäftigter']], dates: [['Ende der Probezeit', 13, 'deadline']] }),
  doc('o20', 'XLSX', '98 KB', 16,
    { name: 'Overtime public order office Q3', type: 'Spreadsheet' },
    { name: 'Überstunden Ordnungsamt Q3', type: 'Tabelle' }),
  doc('o21', 'DOCX', '14 KB', 18,
    { name: 'Notes - Kita staff S 8b', type: 'Notes', matterReference: 'Classification childcare 2026', summary: 'Which educators regularly take on special tasks such as language support or inclusion that could justify S 8b instead of S 8a; 11 cases in three Kitas.' },
    { name: 'Notizen - Kita-Personal S 8b', type: 'Notizen', matterReference: 'Eingruppierung SuE 2026', summary: 'Welche Erzieher:innen regelmäßig besondere Aufgaben wie Sprachförderung oder Inklusion übernehmen, die S 8b statt S 8a rechtfertigen könnten; 11 Fälle in drei Kitas.' }),
  doc('o22', 'PDF', '520 KB', 20,
    { name: 'Screenshot - payroll error message', type: 'Screenshot' },
    { name: 'Screenshot - Fehlermeldung Entgeltabrechnung', type: 'Screenshot' }),
  doc('o23', 'DOCX', '33 KB', 22,
    { name: 'Job advert - template', type: 'Template' },
    { name: 'Stellenausschreibung - Vorlage', type: 'Vorlage' }),
  doc('o24', 'XLSX', '26 KB', 25,
    { name: 'Fixed-term contracts - overview', type: 'Spreadsheet', matterReference: 'Fixed-term contracts 2026', summary: '38 fixed-term contracts, 6 of which end by March 2027. Two posts in the city archive project are third-party funded; check whether the WissZeitVG applies at all.' },
    { name: 'Befristungen - Übersicht', type: 'Tabelle', matterReference: 'Befristungscontrolling 2026', summary: '38 befristete Verträge, davon enden 6 bis März 2027. Zwei Stellen im Projekt Stadtarchiv sind drittmittelfinanziert; prüfen, ob das WissZeitVG überhaupt anwendbar ist.' }),
  doc('o25', 'DOCX', '11 KB', 27,
    { name: 'Copy of copy of interview questions', type: 'Interview Guide' },
    { name: 'Kopie von Kopie Interviewfragen', type: 'Interviewleitfaden' }),
  doc('o26', 'DOCX', '41 KB', 30,
    { name: 'Mobile working - service agreement 2024', type: 'Service Agreement', summary: 'Up to two days a week of mobile working, core hours 9:00–12:00. To be reviewed by the end of 2026.', parties: [[PR, 'Staff council'], ['Stadt Lindenfeld', 'Employer']], dates: [['Review due', 44, 'deadline']] },
    { name: 'Dienstvereinbarung mobiles Arbeiten 2024', type: 'Dienstvereinbarung', summary: 'Bis zu zwei Tage mobiles Arbeiten pro Woche, Kernzeit 9 bis 12 Uhr. Evaluation bis Ende 2026 vereinbart.', parties: [[PR, 'Personalrat'], ['Stadt Lindenfeld', 'Dienstherr / Arbeitgeber']], dates: [['Evaluation fällig', 44, 'deadline']] }),
  doc('o27', 'XLSX', '47 KB', 34,
    { name: 'Leave carried over from 2025 - list', type: 'Spreadsheet', summary: '23 employees still had leave from 2025 after 31 March; for 19 of them, illness extended the deadline to 31 May (§ 26 TVöD).' },
    { name: 'Resturlaub 2025 - Liste', type: 'Tabelle', summary: '23 Beschäftigte hatten nach dem 31. März noch Urlaub aus 2025; bei 19 verlängerte sich die Frist wegen Krankheit bis 31. Mai (§ 26 TVöD).' }),
  doc('o28', 'PPTX', '4.8 MB', 41,
    { name: 'Main committee - personnel report 2025', type: 'Presentation', parties: [['Hauptausschuss Stadt Lindenfeld', 'Council committee']], dates: [['Presented', -41, 'action']] },
    { name: 'Vorlage Hauptausschuss - Personalbericht 2025', type: 'Präsentation', parties: [['Hauptausschuss Stadt Lindenfeld', 'Ratsausschuss']], dates: [['Präsentiert', -41, 'action']] }),
  doc('o29', 'PDF', '3.8 MB', 47,
    { name: 'Applications educators (scanned)', type: 'Scan' },
    { name: 'Bewerbungen Erzieher:innen (gescannt)', type: 'Scan' }),
  doc('o30', 'DOCX', '9 KB', 55,
    { name: 'Notes - successor head of treasury', type: 'Notes', matterReference: 'Succession planning 2027' },
    { name: 'Notizen - Nachfolge Leitung Kämmerei', type: 'Notizen', matterReference: 'Nachfolgeplanung 2027' }),
  doc('o31', 'PDF', '310 KB', 78,
    { name: 'Certificate - seminar classification under the TVöD', type: 'Certificate', dates: [['Completed', -80, 'action']] },
    { name: 'Teilnahmebescheinigung - Seminar Eingruppierung TVöD', type: 'Teilnahmebescheinigung', dates: [['Abgeschlossen', -80, 'action']] }),
  doc('o32', 'PDF', '180 KB', 102,
    { name: 'TVöD notice periods - cheat sheet', type: 'Reference' },
    { name: 'Spickzettel Kündigungsfristen TVöD', type: 'Nachschlagewerk' }),
  doc('o33', 'XLSX', '64 KB', 153,
    { name: 'Pay table TVöD VKA 2024 - archive', type: 'Reference' },
    { name: 'Entgelttabelle TVöD VKA 2024 - Archiv', type: 'Nachschlagewerk' }),
  doc('o34', 'PDF', '390 KB', 196,
    { name: 'Scan_0042', type: 'Scan' },
    { name: 'Scan_0042', type: 'Scan' }),
]

// ─── Guardrails ───────────────────────────────────────────────────────────────

const GUARDRAILS: Lang<AreaGuardrailExample>[] = [
  { en: { category: 'Sources', icon: 'FolderOutlined', text: 'Only answer from the documents in this workspace', why: 'Keeps answers to what the personnel office has checked.' },
    de: { category: 'Quellen', icon: 'FolderOutlined', text: 'Nur aus den Dokumenten dieses Arbeitsbereichs antworten', why: 'Antworten stützen sich nur auf das, was das Personalamt geprüft hat.' } },
  { en: { category: 'Collective agreement', icon: 'ArticleOutlined', text: 'Always answer on the basis of the TVöD (VKA), not the TVöD (Bund) or the TV-L', why: 'The rules differ, for example on steps and regrading.' },
    de: { category: 'Tarifvertrag', icon: 'ArticleOutlined', text: 'Immer auf Grundlage des TVöD (VKA) antworten, nicht des TVöD (Bund) oder des TV-L', why: 'Die Regeln unterscheiden sich, etwa bei Stufen und Höhergruppierung.' } },
  { en: { category: 'Co-determination', icon: 'UsersOutlined', text: 'Point out when a measure needs the staff council’s consent (§ 72 LPVG NRW)', why: 'Nothing goes ahead without the Personalrat by mistake.' },
    de: { category: 'Mitbestimmung', icon: 'UsersOutlined', text: 'Darauf hinweisen, wenn eine Maßnahme der Zustimmung des Personalrats bedarf (§ 72 LPVG NRW)', why: 'Nichts wird versehentlich am Personalrat vorbei umgesetzt.' } },
  { en: { category: 'Civil servants', icon: 'UserOutlined', text: 'Flag questions about Beamte — the TVöD doesn’t apply to them', why: 'Civil servants fall under the state civil-service, pay and Beihilfe rules.' },
    de: { category: 'Beamte', icon: 'UserOutlined', text: 'Fragen zu Beamt:innen kennzeichnen – für sie gilt der TVöD nicht', why: 'Für Beamt:innen gelten Landesbeamten-, Besoldungs- und Beihilferecht.' } },
  { en: { category: 'Privacy', icon: 'LockOutlined', text: 'Never include health data or details from Beihilfe files', why: 'Beihilfe files are kept separate from the personnel file.' },
    de: { category: 'Datenschutz', icon: 'LockOutlined', text: 'Keine Gesundheitsdaten oder Angaben aus Beihilfeakten nennen', why: 'Beihilfeakten werden getrennt von der Personalakte geführt.' } },
  { en: { category: 'Citations', icon: 'QuotesOutlined', text: 'Cite the TVöD paragraph, law or service agreement behind every statement', why: 'Anyone can check where an answer came from.' },
    de: { category: 'Belege', icon: 'QuotesOutlined', text: 'Für jede Aussage den Paragrafen des TVöD, das Gesetz oder die Dienstvereinbarung nennen', why: 'Jede Antwort lässt sich nachprüfen.' } },
]

// ─── CoPilot ──────────────────────────────────────────────────────────────────

const chat = (id: string, day: AreaChat['day'], en: [string, string, string], de: [string, string, string]): Lang<AreaChat> => ({
  en: { id, day, title: en[0], question: en[1], answer: en[2] },
  de: { id, day, title: de[0], question: de[1], answer: de[2] },
})

const CHATS: Lang<AreaChat>[] = [
  chat('od-today-1', 'today',
    ['Step placement for a new hire',
      'We’re hiring a civil engineer at EG 11 who has four years’ experience at a private engineering firm. Which step does he start in?',
      'If the earlier job was **equivalent to the new role**, it counts as relevant professional experience whatever the employer — public or private. With **at least three years** of relevant experience, he is placed in **step 3** as a rule (§ 16 (2) TVöD (VKA)). To win him over, you can also count earlier periods that are **useful for the role** in full or in part to cover staffing needs (§ 16 TVöD (VKA)) — document the reasons, as your Personalrat has already asked for them. Remember that the **hiring and classification need the Personalrat’s consent** (§ 72 LPVG NRW).'],
    ['Stufenzuordnung bei Neueinstellung',
      'Wir stellen einen Bauingenieur in EG 11 ein, der vier Jahre in einem privaten Ingenieurbüro gearbeitet hat. In welche Stufe kommt er?',
      'War die frühere Tätigkeit **gleichartig zur neuen Stelle**, zählt sie als einschlägige Berufserfahrung – unabhängig davon, ob der Arbeitgeber öffentlich oder privat war. Bei **mindestens drei Jahren** einschlägiger Berufserfahrung erfolgt in der Regel die Zuordnung zur **Stufe 3** (§ 16 Abs. 2 TVöD (VKA)). Um ihn zu gewinnen, können Sie zur Deckung des Personalbedarfs zusätzlich **förderliche Zeiten** ganz oder teilweise berücksichtigen (§ 16 TVöD (VKA)) – halten Sie die Gründe fest, da Ihr Personalrat bereits danach gefragt hat. Denken Sie daran, dass **Einstellung und Eingruppierung der Zustimmung des Personalrats** bedürfen (§ 72 LPVG NRW).']),
  chat('od-today-2', 'today',
    ['Regrading in the citizens’ office',
      'An employee in EG 8, step 4, is being regraded to EG 9a. Which step does she get, and does the step period start again?',
      'In the VKA area, regrading is **step for step**: she moves to **EG 9a, step 4** (§ 17 (4) TVöD (VKA)). The time in the step **starts again** on the day of the regrading, so her next step increase is counted from then. If she only covers the higher-value work **temporarily**, there is no regrading; instead she gets a **personal allowance** from the first day once it has lasted at least a month (§ 14 TVöD). Either way, the regrading needs the **Personalrat’s consent**.'],
    ['Höhergruppierung im Bürgerbüro',
      'Eine Beschäftigte in EG 8, Stufe 4, wird nach EG 9a höhergruppiert. In welche Stufe kommt sie, und beginnt die Stufenlaufzeit neu?',
      'Im Bereich der VKA erfolgt die Höhergruppierung **stufengleich**: Sie kommt in **EG 9a, Stufe 4** (§ 17 Abs. 4 TVöD (VKA)). Die **Stufenlaufzeit beginnt** mit dem Tag der Höhergruppierung **neu**, der nächste Stufenaufstieg wird also ab dann berechnet. Übt sie die höherwertige Tätigkeit nur **vorübergehend** aus, wird sie nicht höhergruppiert, sondern erhält eine **persönliche Zulage** rückwirkend ab dem ersten Tag, sobald die Übertragung mindestens einen Monat gedauert hat (§ 14 TVöD). In beiden Fällen ist die **Zustimmung des Personalrats** einzuholen.']),
  chat('od-yesterday-1', 'yesterday',
    ['Annual special payment and parental leave',
      'An employee was on parental leave from February to August. How much annual special payment does she get this year?',
      'She is entitled if she is **employed on 1 December** (§ 20 (1) TVöD). The payment is reduced by **one twelfth for each calendar month without pay** (§ 20 (4) TVöD) — but **not for months of parental leave** up to the end of the calendar year in which the child was born, provided she was entitled to pay the day before her parental leave started. Months of **maternity protection** don’t reduce it either. The basis is her average monthly pay in **July to September**, and it is paid with the **November** pay.'],
    ['Jahressonderzahlung bei Elternzeit',
      'Eine Beschäftigte war von Februar bis August in Elternzeit. Wie hoch ist ihre Jahressonderzahlung in diesem Jahr?',
      'Sie hat Anspruch, wenn sie **am 1. Dezember im Arbeitsverhältnis** steht (§ 20 Abs. 1 TVöD). Die Zahlung vermindert sich um **ein Zwölftel für jeden Kalendermonat ohne Entgeltanspruch** (§ 20 Abs. 4 TVöD) – **nicht aber für Monate der Elternzeit** bis zum Ende des Kalenderjahres, in dem das Kind geboren wurde, sofern am Tag vor Antritt der Elternzeit Anspruch auf Entgelt bestand. Auch Zeiten des **Mutterschutzes** führen nicht zur Kürzung. Bemessungsgrundlage ist das durchschnittliche Monatsentgelt aus **Juli bis September**, ausgezahlt wird mit dem Entgelt für **November**.']),
  chat('od-yesterday-2', 'yesterday',
    ['Part-time retirement request',
      'A 61-year-old Kita employee has applied for part-time retirement in the block model. Do we have to agree?',
      'No — under the **TV FlexAZ** there is **no legal entitlement**. Part-time retirement is possible from the **age of 60**, and the employer can refuse once **2.5% of employees** are already in part-time retirement. If you agree, pay is topped up by **20%** of the regular pay for the part-time work, and additional pension contributions are paid. In the **block model**, she works full time for the first half and is released for the second. Check your quota and any service agreement before deciding, and give reasons if you refuse.'],
    ['Antrag auf Altersteilzeit',
      'Eine 61-jährige Kita-Beschäftigte hat Altersteilzeit im Blockmodell beantragt. Müssen wir zustimmen?',
      'Nein – nach dem **TV FlexAZ** besteht **kein Rechtsanspruch**. Altersteilzeit ist ab **Vollendung des 60. Lebensjahres** möglich, und der Arbeitgeber kann ablehnen, wenn bereits **2,5 % der Beschäftigten** Altersteilzeit nutzen. Stimmen Sie zu, wird das Entgelt für die Teilzeitarbeit um **20 %** des Regelarbeitsentgelts aufgestockt, und es werden zusätzliche Rentenversicherungsbeiträge gezahlt. Im **Blockmodell** arbeitet sie in der ersten Hälfte voll und wird in der zweiten freigestellt. Prüfen Sie vor der Entscheidung Ihre Quote und eine etwaige Dienstvereinbarung und begründen Sie eine Ablehnung.']),
  chat('od-yesterday-3', 'yesterday',
    ['Notice after 16 years',
      'A Bauhof employee (52, with us for 16 years) has had two warnings. Could we dismiss him with notice?',
      'Probably not. Employees in the **West tariff area** who are **over 40** and have more than **15 years’ service** can only be dismissed by the employer **for an important reason** (§ 34 (2) TVöD) — ordinary dismissal is ruled out. What remains is **extraordinary dismissal** under § 626 BGB, which needs a serious breach of duty and must be declared **within two weeks** of learning of it. In every case, involve the **Personalrat** beforehand; without proper participation the dismissal is invalid. Have the case reviewed before you take any further steps.'],
    ['Kündigung nach 16 Jahren',
      'Ein Bauhof-Beschäftigter (52, seit 16 Jahren bei uns) hat zwei Abmahnungen erhalten. Können wir ihm ordentlich kündigen?',
      'Voraussichtlich nicht. Beschäftigte im **Tarifgebiet West**, die das **40. Lebensjahr vollendet** haben und mehr als **15 Jahre Beschäftigungszeit** aufweisen, können vom Arbeitgeber **nur aus wichtigem Grund** gekündigt werden (§ 34 Abs. 2 TVöD) – die ordentliche Kündigung ist ausgeschlossen. Möglich bleibt die **außerordentliche Kündigung** nach § 626 BGB; sie setzt eine schwere Pflichtverletzung voraus und muss **innerhalb von zwei Wochen** ab Kenntnis erklärt werden. Beteiligen Sie in jedem Fall vorher den **Personalrat**; ohne ordnungsgemäße Beteiligung ist die Kündigung unwirksam. Lassen Sie den Fall prüfen, bevor Sie weitere Schritte gehen.']),
]

const article = (keywords: RegExp, en: [string, string], de: [string, string], general?: boolean): Lang<AreaArticle> => ({
  en: { keywords, title: en[0], excerpt: en[1], ...(general ? { general } : {}) },
  de: { keywords, title: de[0], excerpt: de[1], ...(general ? { general } : {}) },
})

const ARTICLES: Lang<AreaArticle>[] = [
  article(/eingruppier|entgeltordnung|entgeltgruppe|t(ä|ae)tigkeitsmerkmal|arbeitsvorg(ä|ae)ng|stellenbewertung|classif|pay.?group|pay.?grade|job.?evaluation|(^|[^a-z])(eg|s) ?\d|(^|[^0-9])1[23]([^0-9]|$)/i,
    ['§§ 12, 13 TVöD (VKA): classification under the pay scheme | Commentary', 'Employees are classified in the pay group whose job features their work meets in whole work processes making up at least half of their working time (§ 12 TVöD (VKA)). Classification follows automatically from the work actually done; the employer’s grouping only states it. The pay scheme for municipal employers (Annex 1 to the TVöD (VKA)) sets out the general features and special ones, for example for the social and childcare services.'],
    ['§§ 12, 13 TVöD (VKA): Eingruppierung nach der Entgeltordnung | Kommentar', 'Beschäftigte sind in der Entgeltgruppe eingruppiert, deren Tätigkeitsmerkmale die gesamte auszuübende Tätigkeit nicht nur vorübergehend erfüllt; maßgeblich sind Arbeitsvorgänge, die mindestens die Hälfte der Arbeitszeit ausmachen (§ 12 TVöD (VKA)). Die Eingruppierung folgt automatisch aus der Tätigkeit (Tarifautomatik); die Mitteilung des Arbeitgebers hat nur feststellende Wirkung. Die Entgeltordnung VKA (Anlage 1 zum TVöD (VKA)) enthält allgemeine und spezielle Tätigkeitsmerkmale, etwa für den Sozial- und Erziehungsdienst.'], true),
  article(/stufe|step|berufserfahrung|experience|h(ö|oe)hergrupp|regrad|higher.?grade|zulage|allowance|(^|[^0-9])1[4-7]([^0-9]|$)/i,
    ['§§ 14, 16, 17 TVöD (VKA): steps, regrading and allowances | Commentary', 'New hires start in step 1, in step 2 with at least one year and as a rule in step 3 with at least three years of relevant experience (§ 16 (2) TVöD (VKA)); useful earlier periods can also be counted to cover staffing needs. On regrading, employees keep their step in the higher pay group and the step period starts again (§ 17 (4) TVöD (VKA)). Higher-value work assigned temporarily for at least a month earns a personal allowance (§ 14 TVöD).'],
    ['§§ 14, 16, 17 TVöD (VKA): Stufen, Höhergruppierung und Zulage | Kommentar', 'Bei der Einstellung erfolgt die Zuordnung zur Stufe 1, bei mindestens einem Jahr einschlägiger Berufserfahrung zur Stufe 2 und bei mindestens drei Jahren in der Regel zur Stufe 3 (§ 16 Abs. 2 TVöD (VKA)); zur Deckung des Personalbedarfs können förderliche Zeiten berücksichtigt werden. Bei einer Höhergruppierung wird die Stufe stufengleich mitgenommen, die Stufenlaufzeit beginnt neu (§ 17 Abs. 4 TVöD (VKA)). Wird eine höherwertige Tätigkeit vorübergehend für mindestens einen Monat übertragen, besteht Anspruch auf eine persönliche Zulage (§ 14 TVöD).'], true),
  article(/jahressonderzahlung|sonderzahlung|weihnachtsgeld|special.?payment|christmas.?bonus|annual.?bonus|(^|[^0-9])20([^0-9]|$)/i,
    ['§ 20 TVöD: annual special payment | Commentary', 'Employees who are employed on 1 December receive an annual special payment, calculated as a percentage of their average monthly pay in July, August and September that is staggered by pay group. It is reduced by one twelfth for each calendar month without pay, with exceptions such as maternity protection and parental leave in the year of the child’s birth. It is paid with the November pay.'],
    ['§ 20 TVöD: Jahressonderzahlung | Kommentar', 'Beschäftigte, die am 1. Dezember im Arbeitsverhältnis stehen, erhalten eine Jahressonderzahlung. Sie bemisst sich nach einem nach Entgeltgruppen gestaffelten Prozentsatz des durchschnittlichen Entgelts der Monate Juli, August und September. Für jeden Kalendermonat ohne Entgeltanspruch vermindert sie sich um ein Zwölftel; Ausnahmen gelten etwa für Mutterschutz und Elternzeit im Geburtsjahr des Kindes. Ausgezahlt wird mit dem Entgelt für November.']),
  article(/leistungsentgelt|leistungsorientiert|leistungsbewertung|(^|[^a-z])lob([^a-z]|$)|performance.?(pay|related|assessment)|zielvereinbarung|target.?agreement|(^|[^0-9])18([^0-9]|$)/i,
    ['§ 18 TVöD (VKA): performance-related pay | Commentary', 'Municipal employers pay a performance-related bonus on top of the table pay, funded by a budget of 2% of the previous year’s regular monthly pay. How performance is measured — target agreements, systematic performance assessment or both — is set out in a service agreement with the Personalrat. A joint committee of employer and staff council handles complaints and monitors the system.'],
    ['§ 18 TVöD (VKA): Leistungsorientierte Bezahlung | Kommentar', 'Kommunale Arbeitgeber zahlen zusätzlich zum Tabellenentgelt ein Leistungsentgelt; das Gesamtvolumen beträgt 2 % der ständigen Monatsentgelte des Vorjahres. Wie Leistung festgestellt wird – durch Zielvereinbarung, systematische Leistungsbewertung oder beides –, regelt eine Dienstvereinbarung mit dem Personalrat. Eine paritätisch besetzte betriebliche Kommission berät über Beschwerden und begleitet das System.']),
  article(/k(ü|ue)ndig|unk(ü|ue)ndbar|notice|terminat|dismiss|abmahnung|warning|(^|[^0-9])34([^0-9]|$)/i,
    ['§ 34 TVöD: notice periods and protection from dismissal | Commentary', 'During probation the notice period is two weeks to the end of a month. After that it depends on the length of service: one month to the end of a month in the first year, then six weeks and rising to six months to the end of a quarter after twelve years. In the West tariff area, employees over 40 with more than 15 years’ service can only be dismissed for an important reason (§ 34 (2) TVöD).'],
    ['§ 34 TVöD: Kündigungsfristen und Unkündbarkeit | Kommentar', 'In der Probezeit beträgt die Kündigungsfrist zwei Wochen zum Monatsschluss. Danach richtet sie sich nach der Beschäftigungszeit: bis zu einem Jahr ein Monat zum Monatsschluss, danach sechs Wochen und ansteigend bis zu sechs Monaten zum Schluss eines Kalendervierteljahres nach zwölf Jahren. Im Tarifgebiet West können Beschäftigte nach Vollendung des 40. Lebensjahres und mehr als 15 Jahren Beschäftigungszeit nur aus wichtigem Grund gekündigt werden (§ 34 Abs. 2 TVöD).']),
  article(/urlaub|resturlaub|annual.?leave|leave.?entitlement|holiday|vacation|carr(y|ied).?over|(^|[^0-9])26([^0-9]|$)/i,
    ['§ 26 TVöD: annual leave | Commentary', 'Employees working a five-day week are entitled to 30 days’ leave a year; the 2025 pay settlement adds a 31st day from 2027. Leave not taken in the calendar year must be started by 31 March of the following year; if it couldn’t be taken because of illness or operational reasons, the deadline is 31 May (§ 26 (2) TVöD).'],
    ['§ 26 TVöD: Erholungsurlaub | Kommentar', 'Bei einer Fünftagewoche beträgt der Urlaubsanspruch 30 Arbeitstage im Kalenderjahr; die Tarifeinigung 2025 sieht ab 2027 einen 31. Urlaubstag vor. Nicht genommener Urlaub muss bis zum 31. März des Folgejahres angetreten werden; konnte er wegen Arbeitsunfähigkeit oder aus betrieblichen Gründen nicht genommen werden, bis zum 31. Mai (§ 26 Abs. 2 TVöD).']),
  article(/befrist|fixed.?term|tzbfg|wisszeitvg|probezeit|probation|elternzeitvertretung|(^|[^0-9])30([^0-9]|$)/i,
    ['§ 30 TVöD: fixed-term employment | Commentary', 'Fixed-term contracts are allowed under the TzBfG and other statutes such as the WissZeitVG, which only applies to research and higher-education institutions. For the West tariff area, the TVöD adds rules: contracts with an objective reason should not exceed five years, contracts without one should last at least twelve months and never less than six, and fixed-term staff are to be considered first when permanent posts are filled. The first six months count as probation (§ 2 (4) TVöD).'],
    ['§ 30 TVöD: Befristete Arbeitsverträge | Kommentar', 'Befristungen sind nach dem TzBfG und anderen gesetzlichen Vorschriften zulässig, etwa dem WissZeitVG, das nur für Hochschulen und Forschungseinrichtungen gilt. Für das Tarifgebiet West enthält der TVöD Zusatzregeln: Sachgrundbefristungen sollen fünf Jahre nicht übersteigen, sachgrundlose Befristungen sollen zwölf Monate nicht unter- und sechs Monate keinesfalls unterschreiten, und befristet Beschäftigte sind bei der Besetzung von Dauerarbeitsplätzen bevorzugt zu berücksichtigen. Die ersten sechs Monate gelten als Probezeit (§ 2 Abs. 4 TVöD).']),
  article(/altersteilzeit|part.?time.?retirement|flexaz|blockmodell|block.?model|retire|ruhestand|zusatzversorgung|(^|[^a-z])(zvk|vbl)([^a-z]|$)|pension/i,
    ['TV FlexAZ: part-time retirement in the public sector | Article', 'The collective agreement on flexible working time for older employees (TV FlexAZ) allows part-time retirement from the age of 60, either continuously or in the block model. There is no legal entitlement; employers can refuse once 2.5% of employees take part. Pay for the part-time work is topped up by 20%, and additional pension contributions are paid. The supplementary pension (ZVK or VBL) continues on the basis of the reduced pay plus top-up.'],
    ['TV FlexAZ: Altersteilzeit im öffentlichen Dienst | Fachbeitrag', 'Der Tarifvertrag zu flexiblen Arbeitszeitregelungen für ältere Beschäftigte (TV FlexAZ) ermöglicht Altersteilzeit ab Vollendung des 60. Lebensjahres, im Teilzeit- oder im Blockmodell. Einen Rechtsanspruch gibt es nicht; der Arbeitgeber kann ablehnen, sobald 2,5 % der Beschäftigten teilnehmen. Das Entgelt für die Teilzeitarbeit wird um 20 % aufgestockt, zusätzlich werden Rentenversicherungsbeiträge gezahlt. Die Zusatzversorgung (ZVK oder VBL) läuft auf Grundlage des verminderten Entgelts mit Aufstockung weiter.']),
  article(/personalrat|staff.?council|mitbestimm|co.?determination|lpvg|bpersvg|dienstvereinbarung|service.?agreement|ausschreibung|job.?advert|bestenauslese|schwerbehindert|disab/i,
    ['Co-determination of the Personalrat under the LPVG and BPersVG | Commentary', 'In municipal administrations the state staff representation act applies; the BPersVG only covers federal agencies. Hiring, classification, regrading and many organisational measures need the Personalrat’s consent (in North Rhine-Westphalia under § 72 LPVG NRW), and measures taken without it can be challenged. Public job adverts must follow the principle of selection by merit (Art. 33 (2) GG), and severely disabled applicants must be invited to interview unless they are clearly unsuitable (§ 165 SGB IX).'],
    ['Mitbestimmung des Personalrats nach LPVG und BPersVG | Kommentar', 'In Kommunalverwaltungen gilt das jeweilige Landespersonalvertretungsgesetz; das BPersVG gilt nur für Dienststellen des Bundes. Einstellung, Eingruppierung, Höhergruppierung und viele organisatorische Maßnahmen bedürfen der Zustimmung des Personalrats (in Nordrhein-Westfalen nach § 72 LPVG NRW); ohne sie getroffene Maßnahmen sind angreifbar. Öffentliche Stellenausschreibungen müssen dem Grundsatz der Bestenauslese folgen (Art. 33 Abs. 2 GG), und schwerbehinderte Bewerbende sind zum Vorstellungsgespräch einzuladen, sofern sie nicht offensichtlich ungeeignet sind (§ 165 SGB IX).'], true),
  article(/entgelttabelle|tabellenentgelt|pay.?table|salary.?table|tarifeinigung|tarifabschluss|pay.?(rise|increase|settlement)|gehalt|salary|beihilfe|beamt|civil.?servant/i,
    ['TVöD (VKA) pay tables 2026 | Work aid', 'Under the 2025 pay settlement, table pay rose by 3% (at least €110) from 1 April 2025 and by a further 2.8% from 1 May 2026; the agreement runs until 31 March 2027. Social and childcare services use their own S tables. Civil servants are not covered: their pay follows the state pay act, and they receive Beihilfe towards medical costs instead of being insured through the employer.'],
    ['Entgelttabellen TVöD (VKA) 2026 | Arbeitshilfe', 'Nach der Tarifeinigung 2025 stiegen die Tabellenentgelte zum 1. April 2025 um 3 % (mindestens 110 Euro) und zum 1. Mai 2026 um weitere 2,8 %; die Laufzeit endet am 31. März 2027. Für den Sozial- und Erziehungsdienst gelten eigene S-Tabellen. Beamt:innen sind nicht erfasst: Ihre Bezüge richten sich nach dem Landesbesoldungsgesetz, und statt über den Arbeitgeber versichert zu sein, erhalten sie Beihilfe zu Krankheitskosten.']),
]

// ─── Uploads ──────────────────────────────────────────────────────────────────

const TYPE_RULES: [RegExp, string, string][] = [
  [/eingruppierungsvermerk|stellenbewertung|job.?evaluation|classification.?note/i, 'Classification Note', 'Eingruppierungsvermerk'],
  [/stufenzuordnung|step.?placement/i, 'Step Placement', 'Stufenzuordnung'],
  [/h(ö|oe)hergruppierung|regrading|higher.?grade/i, 'Regrading Application', 'Antrag Höhergruppierung'],
  [/altersteilzeit|part.?time.?retirement|flexaz/i, 'Part-time Retirement Application', 'Antrag Altersteilzeit'],
  [/stellenausschreibung|ausschreibung|job.?ad(vert)?|vacancy/i, 'Job Advertisement', 'Stellenausschreibung'],
  [/dienstvereinbarung|service.?agreement/i, 'Service Agreement', 'Dienstvereinbarung'],
  [/abmahnung|warning/i, 'Warning Letter', 'Abmahnung'],
  [/arbeitszeugnis|zwischenzeugnis|zeugnis|(^|[^a-z])reference([^a-z]|$)/i, 'Reference', 'Arbeitszeugnis'],
  [/probezeit|probation/i, 'Probation Review', 'Probezeitbeurteilung'],
  [/k(ü|ue)ndigung|termination|dismissal/i, 'Termination', 'Kündigung'],
  [/arbeitsvertrag|befrist|fixed.?term|contract/i, 'Employment Contract', 'Arbeitsvertrag'],
  [/beihilfe/i, 'Beihilfe Query', 'Beihilfeanfrage'],
  [/zusatzversorgung|(^|[^a-z])(zvk|vbl)([^a-z]|$)|supplementary.?pension/i, 'Supplementary Pension', 'Zusatzversorgung'],
  [/jahressonderzahlung|special.?payment|weihnachtsgeld/i, 'Annual Special Payment', 'Jahressonderzahlung'],
  [/leistungsentgelt|(^|[^a-z])lob([^a-z]|$)|performance.?pay/i, 'Performance Pay', 'Leistungsentgelt'],
  [/stellenplan|staffing.?plan/i, 'Staffing Plan', 'Stellenplan'],
  [/entgelttabelle|pay.?table/i, 'Pay Table', 'Entgelttabelle'],
  [/eingruppierung|classification/i, 'Classification Note', 'Eingruppierungsvermerk'],
  [/personalrat|staff.?council/i, 'Staff Council Correspondence', 'Schreiben Personalrat'],
  [/resturlaub|urlaub|holiday|annual.?leave/i, 'Leave Overview', 'Urlaubsübersicht'],
  [/(ü|ue)berstunden|overtime/i, 'Overtime Report', 'Überstundenauswertung'],
  [/interview|vorstellungsgespr(ä|ae)ch/i, 'Interview Guide', 'Interviewleitfaden'],
  [/bewerbung|application/i, 'Application', 'Bewerbung'],
  [/protokoll|minutes/i, 'Meeting Minutes', 'Protokoll'],
  [/antrag|request/i, 'Application', 'Antrag'],
  [/vorlage|template|muster/i, 'Template', 'Vorlage'],
  [/notiz|notes|vermerk/i, 'Notes', 'Notizen'],
  [/bescheinigung|certificate|nachweis/i, 'Certificate', 'Bescheinigung'],
  [/bericht|report|auswertung/i, 'Report', 'Bericht'],
  [/brief|schreiben|letter|mail/i, 'Letter', 'Schreiben'],
  [/screenshot/i, 'Screenshot', 'Screenshot'],
  [/scan/i, 'Scan', 'Scan'],
]

const TOPICS: [RegExp, string, string][] = [
  [/h(ö|oe)hergrupp|regrad|higher.?grade/i, 'regrading', 'Höhergruppierung'],
  [/eingruppier|entgeltgruppe|stellenbewertung|classif|pay.?group/i, 'classification', 'Eingruppierung'],
  [/stufe|step/i, 'step placement', 'Stufenzuordnung'],
  [/personalrat|staff.?council|mitbestimm|dienstvereinbarung|service.?agreement/i, 'staff council participation', 'Beteiligung des Personalrats'],
  [/ausschreibung|bewerb|job.?ad|recruit|vacancy|einstellung|hiring/i, 'recruitment', 'Stellenbesetzung'],
  [/befrist|fixed.?term|probezeit|probation/i, 'fixed-term employment and probation', 'Befristung und Probezeit'],
  [/altersteilzeit|part.?time.?retirement|flexaz/i, 'part-time retirement', 'Altersteilzeit'],
  [/jahressonderzahlung|special.?payment/i, 'the annual special payment', 'Jahressonderzahlung'],
  [/leistungsentgelt|(^|[^a-z])lob([^a-z]|$)|performance/i, 'performance pay', 'Leistungsentgelt'],
  [/urlaub|holiday|annual.?leave/i, 'annual leave', 'Urlaub'],
  [/k(ü|ue)ndig|abmahn|termination|dismiss|warning/i, 'terminations and warnings', 'Kündigung und Abmahnung'],
  [/beihilfe|beamt|civil.?servant|feuerwehr|fire/i, 'civil servants', 'Beamtenrecht'],
  [/zusatzversorgung|(^|[^a-z])(zvk|vbl)([^a-z]|$)|pension/i, 'supplementary pension', 'Zusatzversorgung'],
]

const PARTIES: [RegExp, { name: string; role: Lang<string> }][] = [
  [/personalrat|staff.?council/i, { name: PR, role: { en: 'Staff council', de: 'Personalrat' } }],
  [/gleichstellung|equal.?opportunit/i, { name: 'Ulrike Hahn', role: { en: 'Equal opportunities officer', de: 'Gleichstellungsbeauftragte' } }],
  [/schwerbehindert|disab/i, { name: 'Kerstin Wolf', role: { en: 'Representative of severely disabled employees', de: 'Schwerbehindertenvertretung' } }],
  [/zusatzversorgung|(^|[^a-z])(zvk|vbl)([^a-z]|$)/i, { name: 'Zusatzversorgungskasse (ZVK)', role: { en: 'Pension fund', de: 'Versorgungskasse' } }],
  [/b(ü|ue)rgermeist|mayor|hauptausschuss|main.?committee/i, { name: 'Frank Hollmann', role: { en: 'Mayor', de: 'Bürgermeister' } }],
  [/kita|erzieh|childcare|educator/i, { name: 'Städtische Kitas Lindenfeld', role: { en: 'Department', de: 'Dienststelle' } }],
  [/bauhof|winterdienst|winter.?service/i, { name: 'Bauhof Stadt Lindenfeld', role: { en: 'Department', de: 'Dienststelle' } }],
  [/ordnungsamt|public.?order/i, { name: 'Ordnungsamt Stadt Lindenfeld', role: { en: 'Department', de: 'Dienststelle' } }],
]

// ─── Assemble ─────────────────────────────────────────────────────────────────

function build(lang: 'en' | 'de'): Omit<AreaContent, 'profile' | 'syncFiles'> {
  const en = lang === 'en'
  return {
    areaLabel: en ? 'Public sector' : 'Öffentlicher Dienst',
    product: { name: 'Haufe TVöD Office Professional', shortName: 'TVöD Office', icon: '/user-testing-nov-26/product-icons/tvoed-office.png', mark: 'TVÖD' },
    myDocuments: pick(DOCUMENTS, lang),

    workspaces: {
      createIntro: en
        ? 'Bring together everything about one personnel matter, post or procedure — documents, background and rules — so your apps can answer with the full picture.'
        : 'Bündeln Sie alles zu einer Personalangelegenheit, einer Stelle oder einem Verfahren – Dokumente, Hintergrund und Regeln –, damit Ihre Apps mit dem ganzen Bild antworten.',
      equation: en
        ? { workspaceText: 'Personnel documents, service agreements and notes for one matter or post', haufeText: 'TVöD commentary, pay tables and case law from Haufe TVöD Office', resultTitle: 'Answers that fit your administration', resultText: 'Answers based on the TVöD and your own rules, with sources you can check' }
        : { workspaceText: 'Personalunterlagen, Dienstvereinbarungen und Vermerke zu einem Vorgang oder einer Stelle', haufeText: 'TVöD-Kommentierung, Entgelttabellen und Rechtsprechung aus Haufe TVöD Office', resultTitle: 'Antworten, die zu Ihrer Verwaltung passen', resultText: 'Antworten auf Grundlage des TVöD und Ihrer eigenen Regeln – mit nachprüfbaren Quellen' },
      guardrailExamples: pick(GUARDRAILS, lang),
      previewGuardrails: en
        ? ['Answer on the basis of the TVöD (VKA)', 'Point out when the staff council has a say', 'Flag questions about civil servants']
        : ['Auf Grundlage des TVöD (VKA) antworten', 'Auf Beteiligung des Personalrats hinweisen', 'Fragen zu Beamt:innen kennzeichnen'],
      profileLabels: en
        ? ['Department', 'Pay group', 'Collective agreement', 'Staff council', 'Employees', 'Contact person']
        : ['Dienststelle', 'Entgeltgruppe', 'Tarifvertrag', 'Personalrat', 'Beschäftigte', 'Ansprechperson'],
      matterPlaceholder: en ? 'e.g. Performance pay 2027' : 'z. B. Leistungsentgelt 2027',
      tryAsking: name => en
        ? `Which steps and deadlines apply in ${name}, and when does the staff council need to be involved?`
        : `Welche Schritte und Fristen gelten in „${name}“, und wann ist der Personalrat zu beteiligen?`,
    },

    copilot: {
      chats: pick(CHATS, lang),
      genericAdvice: en
        ? 'I’d check whether the person is on the TVöD (VKA) or a civil servant, which TVöD provisions and service agreements apply, and whether the staff council has to be involved before anything is decided.'
        : 'Ich würde prüfen, ob die Person nach TVöD (VKA) beschäftigt oder verbeamtet ist, welche Regelungen des TVöD und welche Dienstvereinbarungen greifen und ob vor einer Entscheidung der Personalrat zu beteiligen ist.',
      simulatedNote: en
        ? 'Simulated response for prototyping — connect a real assistant to answer from actual TVöD content and personnel data.'
        : 'Simulierte Antwort für den Prototyp – für echte Antworten aus TVöD-Inhalten und Ihren Personaldaten muss ein echter Assistent angebunden werden.',
      articles: pick(ARTICLES, lang),
      fileExcerpts: en
        ? [
            '“The performance pay budget is distributed on the basis of target agreements and systematic performance assessment; a joint committee deals with complaints.”',
            '“In three Kitas, 11 educators regularly take on language support or inclusion tasks beyond their normal group work.”',
            '“Mobile working is possible on up to two days per week; core hours are 9:00 to 12:00.”',
          ]
        : [
            '„Das Leistungsentgelt wird auf Grundlage von Zielvereinbarungen und systematischer Leistungsbewertung verteilt; über Beschwerden berät die betriebliche Kommission.“',
            '„In drei Kitas übernehmen 11 Erzieher:innen regelmäßig Aufgaben der Sprachförderung oder Inklusion über die normale Gruppenarbeit hinaus.“',
            '„Mobiles Arbeiten ist an bis zu zwei Tagen pro Woche möglich; die Kernzeit liegt zwischen 9 und 12 Uhr.“',
          ],
    },

    office: OD_OFFICE[lang],

    uploads: {
      typeRules: TYPE_RULES.map(([re, e, d]) => [re, en ? e : d]),
      topics: TOPICS.map(([re, e, d]) => [re, en ? e : d]),
      parties: PARTIES.map(([re, p]) => [re, { name: p.name, role: p.role[lang] }]),
      matters: en
        ? ['Job evaluation citizens’ office 2026', 'Performance pay 2027', 'Part-time retirement 2027', 'Recruitment civil engineering 2026', 'Classification childcare 2026']
        : ['Stellenbewertung Bürgerbüro 2026', 'Leistungsentgelt 2027', 'Altersteilzeit 2027', 'Stellenbesetzung Tiefbau 2026', 'Eingruppierung SuE 2026'],
      counterparties: [
        { name: PR, role: en ? 'Staff council' : 'Personalrat' },
        { name: 'Ulrike Hahn', role: en ? 'Equal opportunities officer' : 'Gleichstellungsbeauftragte' },
        { name: 'Zusatzversorgungskasse (ZVK)', role: en ? 'Pension fund' : 'Versorgungskasse' },
        { name: 'Frank Hollmann', role: en ? 'Mayor' : 'Bürgermeister' },
      ],
      primaryRole: en ? 'Employee' : 'Beschäftigte:r',
      deadlineLabels: en ? ['Staff council consent by', 'Payroll closing', 'Reply due'] : ['Zustimmung Personalrat bis', 'Abrechnungsschluss', 'Antwort bis'],
      actionLabels: en ? ['Approved', 'Signed', 'Sent'] : ['Genehmigt', 'Unterzeichnet', 'Versandt'],
    },
  }
}

// ─── Workspace profile wording and connected-app documents ───────────────────

const SYNC_ROWS: Parameters<typeof syncFilesFor>[0] = {
  sharepoint: [
    ['Staffing plan 2027', 'Stellenplan 2027', 'XLSX'], ['Service agreement working time', 'Dienstvereinbarung Arbeitszeit', 'PDF'], ['Org chart city administration', 'Organigramm Stadtverwaltung', 'PDF'],
    ['Allocation of duties personnel office', 'Geschäftsverteilungsplan Personalamt', 'DOCX'], ['Job advert template', 'Muster Stellenausschreibung', 'DOCX'], ['Minutes staff council meeting November', 'Protokoll Personalratssitzung November', 'DOCX'],
    ['Service agreement LOB 2027 - draft', 'Dienstvereinbarung LOB 2027 - Entwurf', 'DOCX'], ['Equal opportunities plan 2025-2029', 'Gleichstellungsplan 2025-2029', 'PDF'], ['Circular TVöD pay settlement 2025', 'Rundschreiben Tarifeinigung TVöD 2025', 'PDF'],
  ],
  googleDrive: [
    ['Interview guide educators', 'Interviewleitfaden Erzieher:innen', 'DOCX'], ['Selection matrix civil engineer', 'Bewertungsmatrix Auswahlverfahren Bauingenieur:in', 'XLSX'], ['Induction plan citizens’ office', 'Einarbeitungsplan Bürgerbüro', 'DOCX'],
    ['Checklist new hires', 'Checkliste Neueinstellung', 'DOCX'], ['Training plan 2027', 'Fortbildungsplan 2027', 'XLSX'], ['Notes monthly meeting staff council', 'Notizen Monatsgespräch Personalrat', 'DOCX'],
    ['Part-time retirement requests - overview', 'Übersicht Anträge Altersteilzeit', 'XLSX'], ['Staff meeting slides', 'Präsentation Personalversammlung', 'PDF'], ['Survey questions Bauhof', 'Fragen Mitarbeiterbefragung Bauhof', 'DOCX'],
  ],
  datev: [
    ['Payroll November 2026 - overview', 'Entgeltabrechnung November 2026 - Übersicht', 'PDF'], ['Annual special payment 2026 - evaluation', 'Jahressonderzahlung 2026 - Auswertung', 'XLSX'], ['Personnel costs by department Q3', 'Personalkosten nach Fachbereich Q3', 'PDF'],
    ['ZVK contributions 2026', 'ZVK-Umlagen 2026', 'XLSX'], ['Step increases December 2026', 'Stufenaufstiege Dezember 2026', 'XLSX'], ['Overtime evaluation Q3', 'Überstundenauswertung Q3', 'XLSX'],
    ['Sickness rate by department', 'Krankenstand nach Fachbereich', 'PDF'], ['Part-time ratio 2026', 'Teilzeitquote 2026', 'XLSX'], ['Cost centre list', 'Kostenstellenliste', 'XLSX'],
  ],
}

const PROFILE_AND_SYNC: Record<'en' | 'de', Pick<AreaContent, 'profile' | 'syncFiles'>> = {
  en: {
    profile: {
      listDescription: 'Shared documents everyone with access can rely on, brought together with a department’s, post’s or procedure’s context and rules — for accurate, in-context answers.',
      backgroundDescription: 'What your apps should know about this department, post or procedure — who is involved, which rules apply, how you like to work.',
      backgroundPlaceholder: 'e.g. Bauhof, 64 employees on the TVöD (VKA), mostly EG 3–6, on-call winter service, staff council involved in every change to working hours…',
      detailsDescription: 'Facts about the workspace itself, such as head of department, pay group or contact person.',
      detailLabelPlaceholder: 'e.g. Head of department',
      detailValuePlaceholder: 'e.g. Sabine Reuter, Personalamt',
    },
    syncFiles: syncFilesFor(SYNC_ROWS, 'en'),
  },
  de: {
    profile: {
      listDescription: 'Gemeinsame Dokumente, auf die sich alle mit Zugriff verlassen können – zusammen mit dem Kontext und den Regeln zu einer Dienststelle, einer Stelle oder einem Verfahren. Für genaue Antworten, die zum Fall passen.',
      backgroundDescription: 'Was Ihre Apps über diese Dienststelle, Stelle oder dieses Verfahren wissen sollten – wer beteiligt ist, welche Regeln gelten, wie Sie arbeiten möchten.',
      backgroundPlaceholder: 'z. B. Bauhof, 64 Beschäftigte im TVöD (VKA), überwiegend EG 3–6, Rufbereitschaft im Winterdienst, Personalrat bei jeder Änderung der Arbeitszeit beteiligt …',
      detailsDescription: 'Fakten zum Arbeitsbereich selbst, etwa Amtsleitung, Entgeltgruppe oder Ansprechperson.',
      detailLabelPlaceholder: 'z. B. Amtsleitung',
      detailValuePlaceholder: 'z. B. Sabine Reuter, Personalamt',
    },
    syncFiles: syncFilesFor(SYNC_ROWS, 'de'),
  },
}

export const OD: { en: AreaContent; de: AreaContent } = {
  en: { ...build('en'), ...PROFILE_AND_SYNC.en },
  de: { ...build('de'), ...PROFILE_AND_SYNC.de },
}
