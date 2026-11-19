import type { AreaContent, AreaDocument } from './types'
import { syncFilesFor } from './types'
import { LAW_OFFICE } from './office/law'
import { MUSTERFIRMA } from './musterfirma'

/**
 * Law: in-house counsel (Syndikusrechtsanwältin) in the legal department of Brandner Maschinenbau GmbH, a
 * mid-sized machine builder in Stuttgart. Supplier and customer contracts, NDAs, GTCs, data protection, a UWG
 * cease-and-desist letter, a court case at the Landgericht Stuttgart and corporate housekeeping for the GmbH.
 * Both languages share one structure; `t(en, de)` picks the text.
 */

type Lang = 'en' | 'de'
type Extra = Pick<AreaDocument, 'matterReference' | 'summary' | 'parties' | 'dates'>

function build(lang: Lang): Omit<AreaContent, 'profile' | 'syncFiles'> {
  const t = (en: string, de: string) => (lang === 'en' ? en : de)
  const doc = (id: string, name: string, documentType: string, fileFormat: AreaDocument['fileFormat'], fileSize: string, age: number, extra: Extra = {}): AreaDocument =>
    ({ id, name, documentType, fileFormat, fileSize, age, ...extra })

  const KESSLER = t('Kessler – framework supply agreement 2027', 'Kessler – Rahmenliefervertrag 2027')
  const LINDNER = 'Lindner Logistik ./. Brandner – 14 O 233/26'
  const VORTEX = t('Vortex – UWG cease-and-desist', 'Vortex – Abmahnung UWG')

  const myDocuments: AreaDocument[] = [
    doc('p22', t('Draft cease-and-desist declaration - modified', 'Entwurf Unterlassungserklärung - modifiziert'), t('Draft', 'Entwurf'), 'DOCX', '19 KB', 0, {
      matterReference: VORTEX,
      summary: t('Modified declaration without admission of liability, with a contractual penalty under the “new Hamburg custom” instead of the fixed €10,000 demanded.',
        'Modifizierte Erklärung ohne Anerkennung einer Rechtspflicht, mit Vertragsstrafe nach „neuem Hamburger Brauch“ statt der geforderten festen 10.000 €.'),
    }),
    doc('p1', t('Framework supply agreement Kessler Antriebstechnik - draft v3', 'Rahmenliefervertrag Kessler Antriebstechnik - Entwurf v3'), t('Contract', 'Vertrag'), 'DOCX', '84 KB', 1, {
      matterReference: KESSLER,
      summary: t('Third draft of the framework supply agreement for drive units. The liability cap and the clause rejecting the supplier’s GTCs are still open.',
        'Dritter Entwurf des Rahmenliefervertrags für Antriebseinheiten. Haftungsbegrenzung und Abwehrklausel gegen die AGB des Lieferanten sind noch offen.'),
      parties: [['Kessler Antriebstechnik GmbH', t('Supplier', 'Lieferant')], ['Brandner Maschinenbau GmbH', t('Buyer', 'Besteller')]],
      dates: [[t('Comments to Purchasing', 'Rückmeldung an Einkauf'), 3, 'deadline']],
    }),
    doc('p2', t('Cease-and-desist letter - Vortex Industrietechnik', 'Abmahnung Vortex Industrietechnik'), t('Cease-and-Desist Letter', 'Abmahnung'), 'PDF', '412 KB', 1, {
      matterReference: VORTEX,
      summary: t('A competitor claims the “market leader” statement on our product pages is misleading (§ 5 UWG) and demands a cease-and-desist declaration with a penalty clause.',
        'Ein Wettbewerber hält die Aussage „Marktführer“ auf unseren Produktseiten für irreführend (§ 5 UWG) und fordert eine strafbewehrte Unterlassungserklärung.'),
      parties: [['Vortex Industrietechnik GmbH', t('Sender', 'Absender')], ['Weber Rechtsanwälte PartG mbB', t('Opposing counsel', 'Gegnerische Kanzlei')]],
      dates: [[t('Declaration due', 'Frist Unterlassungserklärung'), 6, 'deadline']],
    }),
    doc('p3', t('Call notes - Purchasing - liability cap', 'Notizen Call Einkauf - Haftungsbegrenzung'), t('Meeting Notes', 'Gesprächsnotiz'), 'DOCX', '11 KB', 2, {
      matterReference: KESSLER,
      summary: t('Purchasing would accept the supplier’s cap at the order value. Open question: does it hold for gross negligence?',
        'Der Einkauf würde die Haftungsgrenze des Lieferanten in Höhe des Auftragswerts akzeptieren. Offen: Gilt sie auch bei grober Fahrlässigkeit?'),
    }),
    doc('p4', t('NDA Novatec Software - counter-draft', 'NDA Novatec Software - Gegenentwurf'), 'NDA', 'DOCX', '36 KB', 2, {
      parties: [['Novatec Software GmbH', t('Counterparty', 'Vertragspartner')]],
      dates: [[t('Return to Novatec', 'Rücksendung an Novatec'), 4, 'deadline']],
    }),
    doc('p5', t('Screenshot - website claim market leader', 'Screenshot - Website Claim Marktführer'), 'Screenshot', 'PDF', '690 KB', 2),
    doc('p6', t('Litigation deadlines - November', 'Fristenliste Prozesse November'), t('Spreadsheet', 'Tabelle'), 'XLSX', '42 KB', 3, {
      dates: [[t('Next deadline', 'Nächste Frist'), 5, 'deadline']],
    }),
    doc('p7', t('DPA cloud HR provider - review notes', 'AVV Cloud-HR-Anbieter - Prüfnotizen'), t('Review Notes', 'Prüfvermerk'), 'DOCX', '18 KB', 3, {
      matterReference: t('GDPR – HR software', 'DSGVO – HR-Software'),
      summary: t('Review of the provider’s data processing agreement against Art. 28 GDPR. The list of sub-processors and the deletion clause are missing.',
        'Prüfung des Auftragsverarbeitungsvertrags gegen Art. 28 DSGVO. Es fehlen die Liste der Unterauftragsverarbeiter und die Löschklausel.'),
      parties: [['PeopleWorks GmbH', t('Processor', 'Auftragsverarbeiter')]],
    }),
    doc('p8', t('Untitled document', 'Unbenanntes Dokument'), t('Other', 'Sonstiges'), 'DOCX', '6 KB', 4),
    doc('p9', t('Opposing brief - LG Stuttgart 14 O 233-26', 'Schriftsatz Gegenseite - LG Stuttgart 14 O 233-26'), t('Court Correspondence', 'Gerichtspost'), 'PDF', '1.2 MB', 4, {
      matterReference: LINDNER,
      summary: t('The plaintiff’s reply in the dispute over late deliveries, with new evidence offered on the damages for delay.',
        'Replik der Klägerin im Streit um verspätete Lieferungen, mit neuem Beweisangebot zum Verzugsschaden.'),
      parties: [['Lindner Logistik GmbH & Co. KG', t('Plaintiff', 'Klägerin')], ['Landgericht Stuttgart', t('Court', 'Gericht')]],
      dates: [[t('Statement due', 'Stellungnahmefrist'), 18, 'deadline']],
    }),
    doc('p10', t('Purchasing GTCs 2027 - draft - do not send', 'AGB Einkauf 2027 - Entwurf - nicht versenden'), t('Draft', 'Entwurf'), 'DOCX', '58 KB', 5, {
      matterReference: t('GTC revision 2027', 'AGB-Überarbeitung 2027'),
      summary: t('Revised general terms of purchase. Warranty and retention-of-title clauses reworked after the latest BGH case law.',
        'Überarbeitete Allgemeine Einkaufsbedingungen. Gewährleistungs- und Eigentumsvorbehaltsklauseln nach aktueller BGH-Rechtsprechung angepasst.'),
    }),
    doc('p11', 'Scan_0117', 'Scan', 'PDF', '340 KB', 5),
    doc('p12', t('Sales enquiry - discount clause in dealer agreement', 'Anfrage Vertrieb - Rabattklausel Händlervertrag'), t('Internal Enquiry', 'Interne Anfrage'), 'PDF', '48 KB', 6, {
      summary: t('Sales asks whether a minimum resale price can be written into the dealer agreements.',
        'Der Vertrieb fragt, ob in die Händlerverträge ein Mindestwiederverkaufspreis aufgenommen werden kann.'),
      parties: [['Jonas Becker', t('Sender (Sales)', 'Absender (Vertrieb)')]],
    }),
    doc('p13', t('Power of attorney - authorised officer Schäfer - draft', 'Vollmacht Prokurist Schäfer - Entwurf'), t('Power of Attorney', 'Vollmacht'), 'DOCX', '14 KB', 7, {
      parties: [['Thomas Schäfer', t('Authorised officer', 'Prokurist')]],
    }),
    doc('p14', t('Shareholder resolution - appointment of managing director', 'Gesellschafterbeschluss Geschäftsführerbestellung'), t('Resolution', 'Beschluss'), 'DOCX', '22 KB', 8, {
      matterReference: t('Corporate – change of managing director 2027', 'Gesellschaftsrecht – GF-Wechsel 2027'),
      summary: t('Draft resolution appointing Dr. Katrin Vogel as managing director from 1 January 2027, to be filed with the commercial register.',
        'Entwurf des Beschlusses zur Bestellung von Dr. Katrin Vogel zur Geschäftsführerin ab 1. Januar 2027, anschließend Anmeldung zum Handelsregister.'),
      parties: [['Dr. Katrin Vogel', t('Managing director (designate)', 'Designierte Geschäftsführerin')]],
      dates: [[t('Register filing', 'Anmeldung Handelsregister'), 30, 'deadline']],
    }),
    doc('p15', t('Compliance checklist - Supply Chain Act', 'Compliance-Checkliste Lieferkettengesetz'), t('Checklist', 'Checkliste'), 'XLSX', '64 KB', 9),
    doc('p16', t('Email from data protection officer - forwarded', 'Mail Datenschutzbeauftragte - weitergeleitet'), t('Correspondence', 'Korrespondenz'), 'PDF', '39 KB', 10, {
      summary: t('Asks whether a data protection impact assessment is needed for the new video monitoring in the warehouse.',
        'Fragt, ob für die neue Videoüberwachung im Lager eine Datenschutz-Folgenabschätzung nötig ist.'),
      parties: [['Sabine Kraus', t('Data protection officer', 'Datenschutzbeauftragte')]],
    }),
    doc('p17', t('Termination - printer maintenance contract - draft', 'Kündigung Wartungsvertrag Druckerflotte - Entwurf'), t('Draft Letter', 'Briefentwurf'), 'DOCX', '12 KB', 11, {
      parties: [['Office Solutions Süd GmbH', t('Supplier', 'Dienstleister')]],
      dates: [[t('Notice period ends', 'Kündigungsfrist endet'), 19, 'deadline']],
    }),
    doc('p18', t('Court order - date of oral hearing', 'Verfügung LG Stuttgart - Termin mündliche Verhandlung'), t('Court Correspondence', 'Gerichtspost'), 'PDF', '156 KB', 12, {
      matterReference: LINDNER,
      parties: [['Landgericht Stuttgart', t('Court', 'Gericht')]],
      dates: [[t('Oral hearing', 'Mündliche Verhandlung'), 41, 'deadline']],
    }),
    doc('p19', t('Contract review notes - CAD licence agreement', 'Vertragsprüfung Notizen - Lizenzvertrag CAD'), t('Review Notes', 'Prüfvermerk'), 'DOCX', '17 KB', 13, {
      summary: t('The licence renews automatically for three years, and the vendor’s audit rights go too far.',
        'Die Lizenz verlängert sich automatisch um drei Jahre, die Audit-Rechte des Anbieters gehen zu weit.'),
    }),
    doc('p20', t('To-do - week 46', 'To-do KW 46'), t('Notes', 'Notizen'), 'DOCX', '4 KB', 14),
    doc('p21', t('Limitation - open receivables - overview', 'Verjährung offene Forderungen - Übersicht'), t('Spreadsheet', 'Tabelle'), 'XLSX', '51 KB', 16, {
      summary: t('Receivables from 2023 that become time-barred at the end of 31 December 2026 (§§ 195, 199 BGB).',
        'Forderungen aus 2023, die mit Ablauf des 31. Dezember 2026 verjähren (§§ 195, 199 BGB).'),
      dates: [[t('Limitation period ends', 'Verjährung tritt ein'), 44, 'deadline']],
    }),
    doc('p23', t('Copy of contract database export', 'Kopie von Vertragsdatenbank Export'), t('Spreadsheet', 'Tabelle'), 'XLSX', '230 KB', 19),
    doc('p24', t('Letter from customer - defect notice milling machine', 'Schreiben Kunde - Mängelrüge Fräsmaschine'), t('Notice of Defects', 'Mängelrüge'), 'PDF', '210 KB', 21, {
      summary: t('The customer reports defects in a delivered milling machine and demands subsequent performance (§ 439 BGB).',
        'Der Kunde rügt Mängel an einer gelieferten Fräsmaschine und verlangt Nacherfüllung (§ 439 BGB).'),
      parties: [['Hofmann Präzisionsteile GmbH', t('Customer', 'Kunde')]],
      dates: [[t('Deadline for cure', 'Frist zur Nacherfüllung'), 9, 'deadline']],
    }),
    doc('p25', t('Draft - do not send', 'Entwurf - nicht versenden'), t('Correspondence', 'Korrespondenz'), 'DOCX', '13 KB', 23),
    doc('p26', t('Memo to management - director liability', 'Vermerk Geschäftsführung - Haftung Geschäftsführer'), 'Memo', 'DOCX', '26 KB', 27, {
      summary: t('Overview of managing directors’ personal liability under § 43 GmbHG and what the D&O policy covers.',
        'Überblick über die persönliche Haftung der Geschäftsführer nach § 43 GmbHG und den Umfang der D&O-Versicherung.'),
    }),
    doc('p27', t('Fax LG Stuttgart (illegible)', 'Fax LG Stuttgart (unleserlich)'), 'Scan', 'PDF', '880 KB', 30, {
      parties: [['Landgericht Stuttgart', t('Sender', 'Absender')]],
    }),
    doc('p28', t('Data breach notification - template', 'Meldung Datenschutzvorfall - Vorlage'), t('Template', 'Vorlage'), 'DOCX', '21 KB', 35),
    doc('p29', t('Fee note Hartmann law firm Q3', 'Kostennote Kanzlei Hartmann Q3'), t('Invoice', 'Rechnung'), 'PDF', '96 KB', 41, {
      parties: [['Hartmann & Kollegen Rechtsanwälte', t('External counsel', 'Externe Kanzlei')]],
      dates: [[t('Paid', 'Bezahlt'), -20, 'action']],
    }),
    doc('p30', t('NDA template 2025', 'Vertraulichkeitsvereinbarung Muster 2025'), t('Template', 'Vorlage'), 'DOCX', '31 KB', 62),
    doc('p31', t('Training slides - competition law for Sales', 'Schulungsunterlagen Kartellrecht Vertrieb'), t('Presentation', 'Präsentation'), 'PPTX', '3.4 MB', 88),
    doc('p32', t('Commercial register extract - old', 'Handelsregisterauszug - alt'), t('Register Extract', 'Registerauszug'), 'PDF', '120 KB', 121),
    doc('p33', t('Untitled spreadsheet', 'Unbenannte Tabelle'), t('Spreadsheet', 'Tabelle'), 'XLSX', '8 KB', 146),
    doc('p34', 'Scan_0042', 'Scan', 'PDF', '390 KB', 198),
  ]

  return {
    areaLabel: t('Law', 'Recht'),
    product: { name: 'Haufe Deutsches Anwalt Office Premium', shortName: 'Anwalt Office', icon: '/user-testing-nov-26/product-icons/anwalt-office.png', mark: 'DA', nameSize: 16.8, publisher: 'DeutscherAnwaltVerlag' },
    myDocuments,

    workspaces: {
      createIntro: t(
        'Bring together the documents, context and guardrails for a contract, a dispute or a project. Your apps use them to give answers that fit the matter.',
        'Bündeln Sie Dokumente, Kontext und Leitplanken zu einem Vertrag, einem Verfahren oder einem Projekt. Ihre Apps nutzen sie für Antworten, die zum Vorgang passen.'),
      equation: {
        workspaceText: t('Contracts, correspondence and notes on one matter', 'Verträge, Korrespondenz und Notizen zu einem Vorgang'),
        haufeText: t('Commentaries, case law and work aids from Deutsches Anwalt Office', 'Kommentare, Rechtsprechung und Arbeitshilfen aus dem Deutschen Anwalt Office'),
        resultTitle: t('Advice that fits the matter', 'Einschätzungen, die zum Fall passen'),
        resultText: t('Grounded in the law and in your matter’s documents', 'Gestützt auf das Gesetz und die Unterlagen Ihres Vorgangs'),
      },
      guardrailExamples: [
        { category: t('Sources', 'Quellen'), icon: 'FolderOutlined', text: t('Only answer from the documents in this workspace', 'Nur aus den Dokumenten in diesem Arbeitsbereich antworten'), why: t('Keeps answers to the contract versions you have checked.', 'Hält Antworten bei den Vertragsständen, die Sie geprüft haben.') },
        { category: t('Citations', 'Zitate'), icon: 'QuotesOutlined', text: t('Cite the statute, ruling or clause for every statement', 'Für jede Aussage Norm, Urteil oder Klausel angeben'), why: t('Anyone can check where an answer came from.', 'Jede Aussage lässt sich nachprüfen.') },
        { category: t('Jurisdiction', 'Rechtsordnung'), icon: 'WorldOutlined', text: t('Apply German law unless the contract says otherwise', 'Deutsches Recht anwenden, sofern der Vertrag nichts anderes regelt'), why: t('Avoids answers based on the wrong legal system.', 'Vermeidet Antworten nach der falschen Rechtsordnung.') },
        { category: t('Confidentiality', 'Vertraulichkeit'), icon: 'LockOutlined', text: t('Never quote personal data of employees or customers', 'Keine personenbezogenen Daten von Beschäftigten oder Kunden zitieren'), why: t('Keeps answers in line with the GDPR.', 'Hält Antworten im Einklang mit der DSGVO.') },
        { category: t('Escalation', 'Eskalation'), icon: 'UsersOutlined', text: t('Refer antitrust questions to external counsel', 'Kartellrechtliche Fragen an die externe Kanzlei verweisen'), why: t('Hands specialist questions to the right people.', 'Gibt Spezialfragen an die richtigen Ansprechpartner.') },
        { category: t('Tone', 'Tonalität'), icon: 'CommentOutlined', text: t('Use a formal tone (Sie) in drafts for counterparties', 'In Entwürfen an Vertragspartner förmlich (Sie) formulieren'), why: t('Keeps every draft in your company’s voice.', 'Hält jeden Entwurf im Ton Ihres Unternehmens.') },
      ],
      previewGuardrails: [
        t('Only answer from this workspace’s documents', 'Nur aus den Dokumenten dieses Arbeitsbereichs antworten'),
        t('Cite the statute or ruling for every statement', 'Für jede Aussage Norm oder Urteil angeben'),
        t('Flag deadlines due in the next 14 days', 'Auf Fristen in den nächsten 14 Tagen hinweisen'),
      ],
      profileLabels: [
        t('Counterparty', 'Vertragspartner'),
        t('Contract type', 'Vertragsart'),
        t('Court & file number', 'Gericht & Aktenzeichen'),
        t('Value in dispute', 'Streitwert'),
        t('Responsible lawyer', 'Zuständige Juristin'),
        t('Governing law', 'Anwendbares Recht'),
      ],
      matterPlaceholder: t('e.g. Lindner Logistik ./. Brandner – 14 O 233/26', 'z. B. Lindner Logistik ./. Brandner – 14 O 233/26'),
      tryAsking: name => t(`What are the open risks in ${name}, and which deadlines are next?`, `Welche Risiken sind in ${name} offen, und welche Fristen stehen als Nächstes an?`),
    },

    copilot: {
      chats: [
        {
          id: 'law-today-1', day: 'today',
          title: t('Review a liability cap', 'Haftungsbegrenzung prüfen'),
          question: t('Can a supplier limit its liability to the order value in its general terms?', 'Kann ein Lieferant seine Haftung in seinen AGB auf den Auftragswert begrenzen?'),
          answer: t(
            'Only partly. In standard terms, liability for **intent and gross negligence** and for **injury to life, body or health** cannot be excluded or limited (§ 309 Nr. 7 BGB); between businesses the courts reach the same result through **§ 307 BGB**. A cap on simple negligence is possible, but not below the typical, foreseeable damage where **essential contractual obligations** are breached. If Purchasing wants a firm cap, negotiate it individually — individually agreed terms are not subject to the AGB control.',
            'Nur eingeschränkt. In AGB kann die Haftung für **Vorsatz und grobe Fahrlässigkeit** sowie für **Schäden an Leben, Körper und Gesundheit** nicht ausgeschlossen oder begrenzt werden (§ 309 Nr. 7 BGB); im unternehmerischen Verkehr gilt das über **§ 307 BGB** entsprechend. Eine Begrenzung bei einfacher Fahrlässigkeit ist möglich, bei Verletzung **wesentlicher Vertragspflichten** aber nicht unterhalb des vertragstypisch vorhersehbaren Schadens. Wenn der Einkauf eine feste Grenze möchte, verhandeln Sie sie individuell – Individualabreden unterliegen nicht der AGB-Kontrolle.'),
        },
        {
          id: 'law-today-2', day: 'today',
          title: t('Respond to a cease-and-desist letter', 'Auf eine Abmahnung reagieren'),
          question: t('We received a cease-and-desist letter for misleading advertising. What are our options?', 'Wir haben eine Abmahnung wegen irreführender Werbung erhalten. Welche Möglichkeiten haben wir?'),
          answer: t(
            'First check whether it is **justified**: is the statement actually misleading under **§ 5 UWG**, and is the sender a competitor entitled to the claim (§ 8 Abs. 3 UWG)? If it is, a **modified cease-and-desist declaration** — without admission of liability and with a penalty under the “new Hamburg custom” — usually avoids a preliminary injunction. If not, reject it in writing and consider filing a **protective letter** with the central register. Don’t let the deadline pass without a response.',
            'Prüfen Sie zuerst, ob sie **berechtigt** ist: Ist die Aussage tatsächlich irreführend im Sinne von **§ 5 UWG**, und ist der Absender als Mitbewerber anspruchsberechtigt (§ 8 Abs. 3 UWG)? Falls ja, vermeidet eine **modifizierte Unterlassungserklärung** – ohne Anerkennung einer Rechtspflicht und mit Vertragsstrafe nach „neuem Hamburger Brauch“ – in der Regel eine einstweilige Verfügung. Falls nein, weisen Sie die Abmahnung schriftlich zurück und erwägen Sie eine **Schutzschrift** beim zentralen Schutzschriftenregister. Lassen Sie die Frist keinesfalls ungenutzt verstreichen.'),
        },
        {
          id: 'law-yesterday-1', day: 'yesterday',
          title: t('Check a data processing agreement', 'Auftragsverarbeitungsvertrag prüfen'),
          question: t('What must a data processing agreement under Art. 28 GDPR contain?', 'Was muss ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO enthalten?'),
          answer: t(
            'Art. 28 Abs. 3 GDPR sets the minimum: **subject matter, duration, nature and purpose** of the processing, the types of data and data subjects, and the processor’s duties — acting **only on documented instructions**, confidentiality, technical and organisational measures (Art. 32), rules for **sub-processors**, support with data subjects’ rights, and **deletion or return** of the data at the end. Missing points are a fine risk for both sides, so ask the provider to add them before you sign.',
            'Art. 28 Abs. 3 DSGVO gibt den Mindestinhalt vor: **Gegenstand, Dauer, Art und Zweck** der Verarbeitung, Datenarten und Kategorien betroffener Personen sowie die Pflichten des Auftragsverarbeiters – Verarbeitung **nur auf dokumentierte Weisung**, Vertraulichkeit, technische und organisatorische Maßnahmen (Art. 32), Regeln für **Unterauftragsverarbeiter**, Unterstützung bei Betroffenenrechten und **Löschung oder Rückgabe** der Daten bei Vertragsende. Fehlende Punkte sind für beide Seiten ein Bußgeldrisiko – lassen Sie sie vor der Unterzeichnung ergänzen.'),
        },
        {
          id: 'law-yesterday-2', day: 'yesterday',
          title: t('Limitation of open receivables', 'Verjährung offener Forderungen'),
          question: t('When do our receivables from 2023 become time-barred?', 'Wann verjähren unsere Forderungen aus 2023?'),
          answer: t(
            'The regular limitation period is **three years** (§ 195 BGB) and starts at the **end of the year** in which the claim arose and you knew of it (§ 199 Abs. 1 BGB). Receivables from 2023 are therefore time-barred at the end of **31 December 2026**. A reminder letter doesn’t stop the clock — you need a **payment order** or a claim filed before then, or negotiations or a written agreement that suspends limitation (§ 203 BGB).',
            'Die regelmäßige Verjährungsfrist beträgt **drei Jahre** (§ 195 BGB) und beginnt mit dem **Schluss des Jahres**, in dem der Anspruch entstanden ist und Sie davon Kenntnis hatten (§ 199 Abs. 1 BGB). Forderungen aus 2023 verjähren also mit Ablauf des **31. Dezember 2026**. Eine Mahnung hemmt die Verjährung nicht – dafür brauchen Sie rechtzeitig einen **Mahnbescheid** oder eine Klage, oder Verhandlungen bzw. eine schriftliche Hemmungsvereinbarung (§ 203 BGB).'),
        },
        {
          id: 'law-yesterday-3', day: 'yesterday',
          title: t('Appoint a managing director', 'Geschäftsführer bestellen'),
          question: t('What do we need to appoint a new managing director of our GmbH?', 'Was brauchen wir, um einen neuen Geschäftsführer unserer GmbH zu bestellen?'),
          answer: t(
            'Unless the articles say otherwise, the **shareholders appoint** the managing director by resolution (§ 46 Nr. 5 GmbHG). The appointment must then be **filed with the commercial register** through a notarially certified application (§ 39 GmbHG), including the new director’s declaration that there are **no grounds for disqualification** (§ 6 Abs. 2 GmbHG). Agree the **service contract** separately — it is distinct from the appointment.',
            'Sofern die Satzung nichts anderes regelt, **bestellen die Gesellschafter** den Geschäftsführer per Beschluss (§ 46 Nr. 5 GmbHG). Die Bestellung ist anschließend mit notariell beglaubigter Anmeldung **zum Handelsregister anzumelden** (§ 39 GmbHG), einschließlich der Versicherung, dass **keine Bestellungshindernisse** bestehen (§ 6 Abs. 2 GmbHG). Den **Anstellungsvertrag** schließen Sie gesondert – er ist von der Organstellung zu trennen.'),
        },
      ],
      genericAdvice: t(
        'I’d check the relevant statutory provisions and current case law, then compare them with the contract wording and correspondence in your files before relying on anything.',
        'Ich würde die einschlägigen Vorschriften und die aktuelle Rechtsprechung prüfen und sie dann mit dem Vertragswortlaut und der Korrespondenz in Ihren Unterlagen abgleichen, bevor Sie sich darauf stützen.'),
      simulatedNote: t(
        'Simulated response for prototyping — connect a real assistant to answer from your actual contracts and case files.',
        'Simulierte Antwort für den Prototyp – verbinden Sie einen echten Assistenten, um aus Ihren tatsächlichen Verträgen und Akten zu antworten.'),
      articles: [
        {
          keywords: /(^|[^a-z])(agb|gtcs?)([^a-z]|$)|gesch(ä|ae|a)ftsbedingungen|general.?terms|standard.?terms|terms.?and.?conditions|haftung|liabil|§§?\s*30[5-9]/i,
          title: t('AGB control in B2B contracts (§§ 305 ff. BGB) | Commentary', 'AGB-Kontrolle im unternehmerischen Verkehr (§§ 305 ff. BGB) | Kommentar'),
          excerpt: t(
            'Standard terms between businesses are reviewed under § 307 BGB; the prohibited clauses of §§ 308, 309 BGB apply indirectly as a guide. Clauses that exclude liability for gross negligence or for essential obligations are generally invalid. Terms that were genuinely negotiated individually are not subject to the review (§ 305 Abs. 1 S. 3 BGB).',
            'AGB zwischen Unternehmern werden an § 307 BGB gemessen; die Klauselverbote der §§ 308, 309 BGB wirken mittelbar als Leitbild. Klauseln, die die Haftung für grobe Fahrlässigkeit oder für wesentliche Vertragspflichten ausschließen, sind in der Regel unwirksam. Tatsächlich ausgehandelte Individualabreden unterliegen der Inhaltskontrolle nicht (§ 305 Abs. 1 S. 3 BGB).'),
          general: true,
        },
        {
          keywords: /dsgvo|gdpr|(^|[^a-z])(avv|dpa)([^a-z]|$)|auftragsverarbeit|data.?processing|processor|datenschutz|data.?protection|personenbezogen|personal.?data/i,
          title: t('Art. 28 GDPR — data processing agreements | Commentary', 'Art. 28 DSGVO – Auftragsverarbeitung | Kommentar'),
          excerpt: t(
            'A controller may only use processors that provide sufficient guarantees. The agreement must cover the points listed in Art. 28 Abs. 3 GDPR, including instructions, confidentiality, sub-processors and deletion. It must be in writing, which includes electronic form.',
            'Der Verantwortliche darf nur Auftragsverarbeiter einsetzen, die hinreichende Garantien bieten. Der Vertrag muss die in Art. 28 Abs. 3 DSGVO genannten Punkte regeln, darunter Weisungsbindung, Vertraulichkeit, Unterauftragsverarbeiter und Löschung. Er bedarf der Schriftform, die auch elektronisch erfüllt werden kann.'),
        },
        {
          keywords: /verj(ä|ae|a)hr|limitation|time.?barred|forderung|receivabl|mahnbescheid|payment.?order|§\s*(195|199|203)/i,
          title: t('Limitation periods — §§ 195, 199 BGB | Lexicon', 'Verjährung – §§ 195, 199 BGB | Lexikon'),
          excerpt: t(
            'The regular limitation period is three years and starts at the end of the year in which the claim arose and the creditor knew or should have known the facts. Filing a claim or a payment order suspends it (§ 204 BGB); a simple reminder does not.',
            'Die regelmäßige Verjährungsfrist beträgt drei Jahre und beginnt mit dem Schluss des Jahres, in dem der Anspruch entstanden ist und der Gläubiger von den Umständen Kenntnis erlangt hat oder hätte erlangen müssen. Klage oder Mahnbescheid hemmen die Verjährung (§ 204 BGB), eine einfache Mahnung nicht.'),
        },
        {
          keywords: /gmbh|gesch(ä|ae|a)ftsf(ü|ue|u)hr|managing.?director|gesellschafter|shareholder|beschluss|resolution|handelsregister|commercial.?register|prokur|vollmacht|power.?of.?attorney/i,
          title: t('Appointing and dismissing a GmbH managing director | Article', 'Bestellung und Abberufung des GmbH-Geschäftsführers | Fachbeitrag'),
          excerpt: t(
            'The shareholders’ meeting appoints and dismisses managing directors (§ 46 Nr. 5 GmbHG); the appointment takes effect with the resolution and acceptance, the register entry is declaratory. Directors owe the company the care of a prudent businessperson and are personally liable for breaches (§ 43 GmbHG).',
            'Die Gesellschafterversammlung bestellt und beruft die Geschäftsführer ab (§ 46 Nr. 5 GmbHG); die Bestellung wird mit Beschluss und Annahme wirksam, die Eintragung im Handelsregister ist deklaratorisch. Geschäftsführer schulden die Sorgfalt eines ordentlichen Geschäftsmanns und haften bei Pflichtverletzungen persönlich (§ 43 GmbHG).'),
        },
        {
          keywords: /abmahnung|cease|desist|(^|[^a-z])uwg([^a-z]|$)|unterlassung|wettbewerb|competit|werbung|advertis|irref(ü|ue|u)hr|mislead/i,
          title: t('Cease-and-desist letters under the UWG: review and response | Work aid', 'Abmahnung nach UWG: Prüfung und Reaktion | Arbeitshilfe'),
          excerpt: t(
            'Check entitlement (§ 8 Abs. 3 UWG), the alleged infringement and the formal requirements of § 13 UWG. Where the claim is well founded, a modified declaration with a penalty under the “new Hamburg custom” removes the risk of repetition. Unjustified letters can trigger a counterclaim for the costs of defence (§ 13 Abs. 5 UWG).',
            'Prüfen Sie Anspruchsberechtigung (§ 8 Abs. 3 UWG), den behaupteten Verstoß und die Formerfordernisse des § 13 UWG. Ist die Abmahnung begründet, beseitigt eine modifizierte Unterlassungserklärung mit Vertragsstrafe nach „neuem Hamburger Brauch“ die Wiederholungsgefahr. Bei unberechtigter Abmahnung kommt ein Gegenanspruch auf Ersatz der Rechtsverteidigungskosten in Betracht (§ 13 Abs. 5 UWG).'),
        },
        {
          keywords: /(^|[^a-z])zpo([^a-z]|$)|frist|deadline|gericht|court|klage|lawsuit|claim|schriftsatz|pleading|verhandlung|hearing|berufung|appeal/i,
          title: t('Deadlines in civil proceedings (ZPO) | Lexicon', 'Fristen im Zivilprozess (ZPO) | Lexikon'),
          excerpt: t(
            'The time limit to give notice of intent to defend is two weeks from service of the claim (§ 276 ZPO); an appeal must be filed within one month of service of the judgment and reasoned within two months (§§ 517, 520 ZPO). Court-set deadlines can be extended on request if there are substantial reasons (§ 224 ZPO).',
            'Die Frist zur Verteidigungsanzeige beträgt zwei Wochen ab Zustellung der Klage (§ 276 ZPO); die Berufung ist binnen eines Monats ab Zustellung des Urteils einzulegen und binnen zwei Monaten zu begründen (§§ 517, 520 ZPO). Richterliche Fristen können auf Antrag bei erheblichen Gründen verlängert werden (§ 224 ZPO).'),
        },
        {
          keywords: /(^|[^a-z])nda([^a-z]|$)|vertraulich|geheimhaltung|confidential|non.?disclosure|gesch(ä|ae|a)ftsgeheim|trade.?secret/i,
          title: t('NDAs and the Trade Secrets Act (GeschGehG) | Article', 'Geheimhaltungsvereinbarungen und GeschGehG | Fachbeitrag'),
          excerpt: t(
            'Information is only protected as a trade secret if the owner takes appropriate confidentiality measures (§ 2 Nr. 1 GeschGehG) — an NDA is one of them. Define the confidential information precisely, limit its use to the purpose of the cooperation and agree what happens to it when talks end.',
            'Informationen sind nur dann als Geschäftsgeheimnis geschützt, wenn der Inhaber angemessene Geheimhaltungsmaßnahmen trifft (§ 2 Nr. 1 GeschGehG) – eine NDA gehört dazu. Definieren Sie die vertraulichen Informationen genau, begrenzen Sie die Nutzung auf den Zweck der Zusammenarbeit und regeln Sie, was nach Ende der Gespräche mit ihnen geschieht.'),
        },
        {
          keywords: /vertrag|contract|agreement|vereinbarung|klausel|clause|k(ü|ue|u)ndig|terminat|m(ä|ae|a)ngel|defect|gew(ä|ae|a)hrleist|warrant/i,
          title: t('Contract review checklist for in-house counsel | Work aid', 'Checkliste Vertragsprüfung für die Rechtsabteilung | Arbeitshilfe'),
          excerpt: t(
            'Work through parties and authority to sign, subject matter, prices and payment terms, warranty (§§ 434 ff. BGB), liability, term and termination, confidentiality, data protection, governing law and place of jurisdiction. Note every deviation from your company’s standard positions with a short reason.',
            'Prüfen Sie Vertragsparteien und Vertretungsbefugnis, Leistungsgegenstand, Preise und Zahlungsbedingungen, Gewährleistung (§§ 434 ff. BGB), Haftung, Laufzeit und Kündigung, Vertraulichkeit, Datenschutz sowie Rechtswahl und Gerichtsstand. Halten Sie jede Abweichung von Ihren Standardpositionen mit kurzer Begründung fest.'),
          general: true,
        },
        {
          keywords: /compliance|lieferkette|supply.?chain|lksg|richtlinie|policy|schulung|training|kartell|antitrust/i,
          title: t('The legal department in practice: managing contracts, deadlines and compliance | Article', 'Rechtsabteilung in der Praxis: Verträge, Fristen und Compliance im Griff | Fachbeitrag'),
          excerpt: t(
            'A central contract register with notice periods and owners, a deadline calendar kept under the four-eyes principle and clear sign-off rules prevent most avoidable risks. Document legal advice in writing so that decisions can be traced later.',
            'Ein zentrales Vertragsregister mit Kündigungsfristen und Verantwortlichen, ein im Vier-Augen-Prinzip geführter Fristenkalender und klare Freigaberegeln verhindern die meisten vermeidbaren Risiken. Dokumentieren Sie Rechtsrat schriftlich, damit Entscheidungen später nachvollziehbar bleiben.'),
          general: true,
        },
      ],
      fixedReply: MUSTERFIRMA.law[lang],
      fileExcerpts: [
        t('Clause 11.2 sets out the agreed liability cap and the cases it does not cover.', 'Ziffer 11.2 regelt die vereinbarte Haftungshöchstgrenze und die Fälle, für die sie nicht gilt.'),
        t('The relevant paragraph records the deadline set by the court and what has to be submitted by then.', 'Der einschlägige Absatz hält die vom Gericht gesetzte Frist fest und was bis dahin vorzutragen ist.'),
        t('Page 3 summarises the facts and the open points noted at the time of review.', 'Seite 3 fasst den Sachverhalt und die bei der Prüfung notierten offenen Punkte zusammen.'),
      ],
    },

    office: LAW_OFFICE[lang],

    uploads: {
      typeRules: [
        [/unterlassungserkl|cease.?and.?desist.?declaration|undertaking/i, t('Cease-and-Desist Declaration', 'Unterlassungserklärung')],
        [/abmahnung|cease.?and.?desist|warning.?letter/i, t('Cease-and-Desist Letter', 'Abmahnung')],
        [/auftragsverarbeitung|(^|[^a-z])(avv|dpa)([^a-z]|$)|data.?processing/i, t('Data Processing Agreement', 'Auftragsverarbeitungsvertrag')],
        [/(^|[^a-z])nda([^a-z]|$)|vertraulichkeit|geheimhaltung|non.?disclosure|confidentiality/i, 'NDA'],
        [/(^|[^a-z])(agb|gtcs?)([^a-z]|$)|gesch(ä|ae|a)ftsbedingungen|terms.?and.?conditions|general.?terms/i, t('General Terms and Conditions', 'AGB')],
        [/klageerwiderung|statement.?of.?defen[cs]e/i, t('Statement of Defence', 'Klageerwiderung')],
        [/klage|statement.?of.?claim|lawsuit/i, t('Statement of Claim', 'Klageschrift')],
        [/schriftsatz|pleading|court.?brief|opposing.?brief/i, t('Pleading', 'Schriftsatz')],
        [/urteil|judg(e)?ment|ruling/i, t('Judgment', 'Urteil')],
        [/ladung|verf(ü|ue|u)gung|gericht|(^|[^a-z])lg([^a-z]|$)|court|summons|hearing/i, t('Court Correspondence', 'Gerichtspost')],
        [/beschluss|resolution/i, t('Resolution', 'Beschluss')],
        [/vollmacht|power.?of.?attorney/i, t('Power of Attorney', 'Vollmacht')],
        [/handelsregister|commercial.?register|register.?extract/i, t('Register Extract', 'Registerauszug')],
        [/m(ä|ae|a)ngelr(ü|ue|u)ge|defect.?notice|notice.?of.?defects?/i, t('Notice of Defects', 'Mängelrüge')],
        [/k(ü|ue|u)ndigung|termination/i, t('Termination Letter', 'Kündigung')],
        [/lizenz|licen[cs]e/i, t('Licence Agreement', 'Lizenzvertrag')],
        [/rahmenvertrag|rahmenliefer|framework/i, t('Framework Agreement', 'Rahmenvertrag')],
        [/vertragspr(ü|ue|u)fung|pr(ü|ue|u)fnotiz|pr(ü|ue|u)fvermerk|contract.?review|review.?notes/i, t('Review Notes', 'Prüfvermerk')],
        [/compliance|checkliste|checklist/i, t('Checklist', 'Checkliste')],
        [/kostennote|rechnung|invoice|fee.?note/i, t('Invoice', 'Rechnung')],
        [/fristen|deadline/i, t('Deadline Overview', 'Fristenübersicht')],
        [/protokoll|minutes|meeting|call/i, t('Meeting Notes', 'Gesprächsnotiz')],
        [/memo|vermerk/i, 'Memo'],
        [/vorlage|muster|template/i, t('Template', 'Vorlage')],
        [/vertrag|contract|agreement|vereinbarung/i, t('Contract', 'Vertrag')],
        [/notiz|notes/i, t('Notes', 'Notizen')],
        [/brief|schreiben|letter/i, t('Letter', 'Schreiben')],
        [/screenshot/i, 'Screenshot'],
        [/(^|[^a-z])scan/i, 'Scan'],
        [/pr(ä|ae|a)sentation|presentation|slides|folien|schulungsunterlagen|training/i, t('Presentation', 'Präsentation')],
        [/(^|[^a-z])e?-?mail([^a-z]|$)|korrespondenz|correspondence/i, t('Correspondence', 'Korrespondenz')],
        [/policy|richtlinie/i, t('Policy', 'Richtlinie')],
      ],
      topics: [
        [/(^|[^a-z])(agb|gtcs?)([^a-z]|$)|gesch(ä|ae|a)ftsbedingungen|terms.?and.?conditions|haftung|liabil/i, t('AGB control and liability', 'AGB-Kontrolle und Haftung')],
        [/dsgvo|gdpr|(^|[^a-z])(avv|dpa)([^a-z]|$)|datenschutz|data.?protection|data.?processing/i, t('Data protection', 'Datenschutz')],
        [/abmahnung|(^|[^a-z])uwg([^a-z]|$)|unterlassung|cease|desist|wettbewerb|competition/i, t('Unfair competition', 'Wettbewerbsrecht')],
        [/verj(ä|ae|a)hr|limitation|forderung|receivabl/i, t('Limitation of claims', 'Verjährung')],
        [/gmbh|gesellschafter|shareholder|gesch(ä|ae|a)ftsf(ü|ue|u)hr|managing.?director|handelsregister|commercial.?register/i, t('Corporate law', 'Gesellschaftsrecht')],
        [/klage|schriftsatz|gericht|court|lawsuit|pleading|(^|[^a-z])lg([^a-z]|$)/i, t('Litigation', 'Prozessführung')],
        [/lieferkette|supply.?chain|lksg|compliance/i, t('Supply chain compliance', 'Lieferketten-Compliance')],
        [/(^|[^a-z])nda([^a-z]|$)|vertraulich|geheimhaltung|confidential|trade.?secret/i, t('Confidentiality', 'Geheimhaltung')],
        [/m(ä|ae|a)ngel|defect|gew(ä|ae|a)hrleist|warrant/i, t('Warranty', 'Gewährleistung')],
      ],
      parties: [
        [/kessler/i, { name: 'Kessler Antriebstechnik GmbH', role: t('Supplier', 'Lieferant') }],
        [/vortex/i, { name: 'Vortex Industrietechnik GmbH', role: t('Competitor', 'Wettbewerber') }],
        [/lindner/i, { name: 'Lindner Logistik GmbH & Co. KG', role: t('Plaintiff', 'Klägerin') }],
        [/novatec/i, { name: 'Novatec Software GmbH', role: t('Counterparty', 'Vertragspartner') }],
        [/hofmann/i, { name: 'Hofmann Präzisionsteile GmbH', role: t('Customer', 'Kunde') }],
        [/peopleworks/i, { name: 'PeopleWorks GmbH', role: t('Processor', 'Auftragsverarbeiter') }],
        [/hartmann/i, { name: 'Hartmann & Kollegen Rechtsanwälte', role: t('External counsel', 'Externe Kanzlei') }],
        [/landgericht|(^|[^a-z])lg([^a-z]|$)|regional.?court/i, { name: 'Landgericht Stuttgart', role: t('Court', 'Gericht') }],
        [/handelsregister|amtsgericht|commercial.?register/i, { name: 'Amtsgericht Stuttgart – Registergericht', role: t('Register court', 'Registergericht') }],
      ],
      matters: [KESSLER, LINDNER, VORTEX, t('GDPR – HR software', 'DSGVO – HR-Software'), t('GTC revision 2027', 'AGB-Überarbeitung 2027')],
      counterparties: [
        { name: 'Landgericht Stuttgart', role: t('Court', 'Gericht') },
        { name: 'Hartmann & Kollegen Rechtsanwälte', role: t('External counsel', 'Externe Kanzlei') },
        { name: 'Kessler Antriebstechnik GmbH', role: t('Supplier', 'Lieferant') },
        { name: 'Landesbeauftragte für den Datenschutz Baden-Württemberg', role: t('Supervisory authority', 'Aufsichtsbehörde') },
      ],
      primaryRole: t('Counterparty', 'Vertragspartner'),
      deadlineLabels: [t('Reply due', 'Antwortfrist'), t('Statement due', 'Stellungnahmefrist'), t('Notice period ends', 'Kündigungsfrist endet')],
      actionLabels: [t('Received', 'Eingegangen'), t('Signed', 'Unterzeichnet'), t('Served', 'Zugestellt')],
    },
  }
}

// ─── Workspace profile wording and connected-app documents ───────────────────

const SYNC_ROWS: Parameters<typeof syncFilesFor>[0] = {
  sharepoint: [
    ['Framework supply agreement Kessler - signed', 'Rahmenliefervertrag Kessler - unterzeichnet', 'PDF'], ['GTC sales 2026', 'AGB Verkauf 2026', 'DOCX'], ['Contract register 2026', 'Vertragsregister 2026', 'XLSX'],
    ['NDA template mutual', 'NDA Vorlage gegenseitig', 'DOCX'], ['Data processing agreement PeopleWorks', 'AVV PeopleWorks', 'PDF'], ['Shareholder resolution managing director', 'Gesellschafterbeschluss Geschäftsführer', 'PDF'],
    ['Compliance guideline gifts and invitations', 'Compliance-Richtlinie Geschenke und Einladungen', 'DOCX'], ['Power of attorney Hartmann & Kollegen', 'Vollmacht Hartmann & Kollegen', 'PDF'], ['Litigation overview 2026', 'Prozessübersicht 2026', 'XLSX'],
  ],
  googleDrive: [
    ['Notes - call with external counsel', 'Notizen - Telefonat externe Kanzlei', 'DOCX'], ['Statement of claim Lindner - draft', 'Klageerwiderung Lindner - Entwurf', 'DOCX'], ['Deadline calendar legal', 'Fristenkalender Recht', 'XLSX'],
    ['Cease-and-desist Vortex - reply draft', 'Abmahnung Vortex - Antwortentwurf', 'DOCX'], ['Limitation check receivables', 'Verjährungsprüfung Forderungen', 'XLSX'], ['Contract review checklist', 'Checkliste Vertragsprüfung', 'DOCX'],
    ['GDPR records of processing', 'Verzeichnis von Verarbeitungstätigkeiten', 'XLSX'], ['Board presentation legal risks', 'Vorstandsvorlage Rechtsrisiken', 'PDF'], ['Template letter debt collection', 'Musterschreiben Forderungsmanagement', 'DOCX'],
  ],
  datev: [
    ['Open items customers 2026', 'Offene Posten Debitoren 2026', 'XLSX'], ['Legal costs 2026', 'Rechtsberatungskosten 2026', 'PDF'], ['Provision for litigation risks', 'Rückstellung Prozessrisiken', 'XLSX'],
    ['Invoice Hartmann & Kollegen 10 2026', 'Rechnung Hartmann & Kollegen 10 2026', 'PDF'], ['Court fees overview', 'Übersicht Gerichtskosten', 'XLSX'], ['Dunning list Q3 2026', 'Mahnliste Q3 2026', 'XLSX'],
    ['Licence fees Novatec 2026', 'Lizenzgebühren Novatec 2026', 'PDF'], ['Contractual penalties booked', 'Gebuchte Vertragsstrafen', 'XLSX'], ['Receivables written off 2025', 'Ausgebuchte Forderungen 2025', 'PDF'],
  ],
}

const PROFILE_AND_SYNC: Record<'en' | 'de', Pick<AreaContent, 'profile' | 'syncFiles'>> = {
  en: {
    profile: {
      listDescription: 'Shared documents everyone with access can rely on, brought together with a contract’s, dispute’s or project’s context and rules — for accurate, in-context answers.',
      backgroundDescription: 'What your apps should know about this contract, dispute or project — who the parties are, what matters, how you like to work.',
      backgroundPlaceholder: 'e.g. Framework supply agreement with our main drive supplier, German law, liability cap under negotiation, management wants a decision by year end…',
      detailsDescription: 'Facts about the workspace itself, such as case number, court or contact person.',
      detailLabelPlaceholder: 'e.g. Case number',
      detailValuePlaceholder: 'e.g. 14 O 233/26',
    },
    syncFiles: syncFilesFor(SYNC_ROWS, 'en'),
  },
  de: {
    profile: {
      listDescription: 'Gemeinsame Dokumente, auf die sich alle mit Zugriff verlassen können – zusammen mit dem Kontext und den Regeln zu einem Vertrag, einem Verfahren oder einem Projekt. Für genaue Antworten, die zum Fall passen.',
      backgroundDescription: 'Was Ihre Apps über diesen Vertrag, dieses Verfahren oder dieses Projekt wissen sollten – wer die Parteien sind, worauf es ankommt, wie Sie arbeiten möchten.',
      backgroundPlaceholder: 'z. B. Rahmenliefervertrag mit unserem Hauptlieferanten für Antriebe, deutsches Recht, Haftungsbegrenzung in Verhandlung, Geschäftsführung erwartet Entscheidung bis Jahresende …',
      detailsDescription: 'Fakten zum Arbeitsbereich selbst, etwa Aktenzeichen, Gericht oder Ansprechperson.',
      detailLabelPlaceholder: 'z. B. Aktenzeichen',
      detailValuePlaceholder: 'z. B. 14 O 233/26',
    },
    syncFiles: syncFilesFor(SYNC_ROWS, 'de'),
  },
}

export const LAW: { en: AreaContent; de: AreaContent } = {
  en: { ...build('en'), ...PROFILE_AND_SYNC.en },
  de: { ...build('de'), ...PROFILE_AND_SYNC.de },
}
