import type { AreaContent, AreaDocument } from './types'
import { syncFilesFor } from './types'
import { REAL_ESTATE_OFFICE } from './office/realEstate'

/**
 * Real estate: a property manager at Rheinblick Hausverwaltung GmbH in Cologne, doing both owners' association
 * (WEG) and rental management. Two WEGs (Lindenallee 12, Am Stadtwald 5) and a rental building (Sülzgürtel 48):
 * service-charge statements, owners' meetings, a roof renovation, rent increases, tenant complaints, the GEG.
 * Both languages share one structure; `t(en, de)` picks the text.
 */

type Lang = 'en' | 'de'
type Extra = Pick<AreaDocument, 'matterReference' | 'summary' | 'parties' | 'dates'>

function build(lang: Lang): Omit<AreaContent, 'profile' | 'syncFiles'> {
  const t = (en: string, de: string) => (lang === 'en' ? en : de)
  const doc = (id: string, name: string, documentType: string, fileFormat: AreaDocument['fileFormat'], fileSize: string, age: number, extra: Extra = {}): AreaDocument =>
    ({ id, name, documentType, fileFormat, fileSize, age, ...extra })

  const LINDENALLEE = t('WEG Lindenallee 12 – service charges 2025', 'WEG Lindenallee 12 – BK-Abrechnung 2025')
  const STADTWALD = t('WEG Am Stadtwald 5 – roof renovation', 'WEG Am Stadtwald 5 – Dachsanierung')
  const SUELZ = t('Sülzgürtel 48 – rent increases 2027', 'Sülzgürtel 48 – Mieterhöhungen 2027')

  const myDocuments: AreaDocument[] = [
    doc('p1', t('Tenant complaint - mould - Sülzgürtel 48 - 2nd floor left', 'Mieterbeschwerde Schimmel Sülzgürtel 48 - 2. OG links'), t('Tenant Complaint', 'Mieterbeschwerde'), 'PDF', '1.1 MB', 1, {
      summary: t('The tenant reports mould in the bedroom and bathroom and announces a rent reduction (§ 536 BGB).',
        'Die Mieterin meldet Schimmel in Schlafzimmer und Bad und kündigt eine Mietminderung an (§ 536 BGB).'),
      parties: [['Elif Yılmaz', t('Tenant', 'Mieterin')]],
      dates: [[t('Inspection by', 'Besichtigung bis'), 3, 'deadline']],
    }),
    doc('p2', t('Service charge statement 2025 Lindenallee 12 - draft', 'Betriebskostenabrechnung 2025 Lindenallee 12 - Entwurf'), t('Service Charge Statement', 'Betriebskostenabrechnung'), 'XLSX', '148 KB', 1, {
      matterReference: LINDENALLEE,
      summary: t('Draft statement for the rented flats. Property tax and caretaker costs are still missing; it must reach tenants by 31 December 2026 (§ 556 Abs. 3 BGB).',
        'Entwurf für die vermieteten Einheiten. Grundsteuer und Hausmeisterkosten fehlen noch; Zugang bei den Mietern bis 31. Dezember 2026 (§ 556 Abs. 3 BGB).'),
      dates: [[t('Statement deadline', 'Abrechnungsfrist'), 44, 'deadline']],
    }),
    doc('p3', t('Quote roof renovation Hamacher', 'Angebot Dachsanierung Hamacher'), t('Quote', 'Angebot'), 'PDF', '620 KB', 2, {
      matterReference: STADTWALD,
      summary: t('€184,500 gross for a new roof including insulation. Needs a resolution of the owners’ meeting.',
        '184.500 € brutto für die Dachsanierung inklusive Dämmung. Erfordert einen Beschluss der Eigentümerversammlung.'),
      parties: [['Dachdecker Hamacher GmbH', t('Contractor', 'Auftragnehmer')]],
      dates: [[t('Quote valid until', 'Angebot gültig bis'), 28, 'deadline']],
    }),
    doc('p4', t('Call notes - advisory board - roof', 'Notizen Telefonat Beirat - Dach'), t('Meeting Notes', 'Gesprächsnotiz'), 'DOCX', '8 KB', 2, {
      matterReference: STADTWALD,
      summary: t('The board chair wants a second quote and an extraordinary owners’ meeting before the end of January.',
        'Der Beiratsvorsitzende wünscht ein zweites Angebot und eine außerordentliche Eigentümerversammlung bis Ende Januar.'),
      parties: [['Werner Albrecht', t('Advisory board chair', 'Beiratsvorsitzender')]],
    }),
    doc('p5', t('Photo - water damage - basement', 'Foto Wasserschaden Keller'), t('Photo', 'Foto'), 'PDF', '2.3 MB', 2),
    doc('p6', t('Rent increase Krüger - rent index 2026 - draft', 'Mieterhöhung Krüger Mietspiegel 2026 - Entwurf'), t('Rent Increase Letter', 'Mieterhöhungsverlangen'), 'DOCX', '24 KB', 3, {
      matterReference: SUELZ,
      summary: t('Increase from €9.80 to €10.90 per m² based on the Cologne rent index, within the 15% cap (§ 558 Abs. 3 BGB).',
        'Erhöhung von 9,80 € auf 10,90 € pro m² nach dem Kölner Mietspiegel, innerhalb der Kappungsgrenze von 15 % (§ 558 Abs. 3 BGB).'),
      parties: [['Michael Krüger', t('Tenant', 'Mieter')]],
    }),
    doc('p7', t('Minutes owners’ meeting 2026 Lindenallee 12', 'Protokoll ETV 2026 Lindenallee 12'), t('Meeting Minutes', 'Versammlungsprotokoll'), 'DOCX', '46 KB', 4, {
      matterReference: 'WEG Lindenallee 12',
      summary: t('Resolutions on the 2025 annual statement, the 2027 budget plan and EV charging points in the car park.',
        'Beschlüsse zur Jahresabrechnung 2025, zum Wirtschaftsplan 2027 und zu Ladestationen in der Tiefgarage.'),
      parties: [['WEG Lindenallee 12', t('Owners’ association', 'Eigentümergemeinschaft')]],
      dates: [[t('Challenge period ends', 'Anfechtungsfrist endet'), 22, 'deadline']],
    }),
    doc('p8', t('Untitled document', 'Unbenanntes Dokument'), t('Other', 'Sonstiges'), 'DOCX', '5 KB', 4),
    doc('p9', t('Insurance claim - burst pipe', 'Schadensmeldung Versicherung Leitungswasser'), t('Insurance Claim', 'Schadensmeldung'), 'PDF', '210 KB', 5, {
      parties: [['Domstadt Versicherung AG', t('Insurer', 'Versicherer')]],
      dates: [[t('Claim reported', 'Schaden gemeldet'), -5, 'action']],
    }),
    doc('p10', t('Handover protocol flat 4 Neumann - move-out', 'Übergabeprotokoll Wohnung 4 Neumann - Auszug'), t('Handover Protocol', 'Übergabeprotokoll'), 'PDF', '1.6 MB', 6, {
      summary: t('Move-out handover: scuffed parquet in the living room, two keys missing. Deposit still to be settled.',
        'Auszugsübergabe: Parkett im Wohnzimmer verkratzt, zwei Schlüssel fehlen. Kaution noch abzurechnen.'),
      parties: [['Sabine Neumann', t('Former tenant', 'Vormieterin')]],
      dates: [[t('Handed over', 'Übergeben'), -6, 'action']],
    }),
    doc('p11', 'Scan_0219', 'Scan', 'PDF', '470 KB', 6),
    doc('p12', t('House rules - new version draft', 'Hausordnung - neue Fassung Entwurf'), t('House Rules', 'Hausordnung'), 'DOCX', '19 KB', 7, {
      summary: t('Adds rules for e-bikes in the cellar and for quiet hours on Sundays.',
        'Ergänzt Regeln für E-Bikes im Keller und zur Ruhezeit an Sonntagen.'),
    }),
    doc('p13', t('Energy certificate Am Stadtwald 5 - expired?', 'Energieausweis Am Stadtwald 5 - abgelaufen?'), t('Energy Certificate', 'Energieausweis'), 'PDF', '380 KB', 8, {
      summary: t('Demand-based certificate from December 2016; valid for ten years (§ 79 GEG).',
        'Bedarfsausweis vom Dezember 2016; zehn Jahre gültig (§ 79 GEG).'),
      dates: [[t('Valid until', 'Gültig bis'), 30, 'deadline']],
    }),
    doc('p14', t('Heating cost statement Wärmedienst 2025', 'Heizkostenabrechnung Wärmedienst 2025'), t('Heating Cost Statement', 'Heizkostenabrechnung'), 'PDF', '520 KB', 9, {
      parties: [['Wärmedienst Rhein GmbH', t('Metering service', 'Messdienstleister')]],
    }),
    doc('p15', t('Email from owner Brandt - special levy', 'Mail Eigentümer Brandt - Sonderumlage'), t('Correspondence', 'Korrespondenz'), 'PDF', '41 KB', 10, {
      matterReference: STADTWALD,
      summary: t('The owner asks whether the special levy for the roof is valid although he voted against it.',
        'Der Eigentümer fragt, ob die Sonderumlage für das Dach wirksam ist, obwohl er dagegen gestimmt hat.'),
      parties: [['Dr. Peter Brandt', t('Owner', 'Eigentümer')]],
    }),
    doc('p16', t('Commercial leases - notice deadlines - overview', 'Fristen Kündigungen Gewerbe - Übersicht'), t('Spreadsheet', 'Tabelle'), 'XLSX', '33 KB', 11),
    doc('p17', t('Draft - do not send', 'Entwurf - nicht versenden'), t('Correspondence', 'Korrespondenz'), 'DOCX', '12 KB', 12),
    doc('p18', t('Lease flat 4 - new tenant Becker', 'Mietvertrag Wohnung 4 - Nachmieterin Becker'), t('Lease', 'Mietvertrag'), 'DOCX', '64 KB', 13, {
      parties: [['Laura Becker', t('Tenant', 'Mieterin')], ['Rheinische Wohnbau GmbH', t('Landlord', 'Vermieterin')]],
      dates: [[t('Tenancy starts', 'Mietbeginn'), 14, 'deadline']],
    }),
    doc('p19', t('Budget plan 2027 Lindenallee owners', 'Wirtschaftsplan 2027 WEG Lindenallee'), t('Budget Plan', 'Wirtschaftsplan'), 'XLSX', '88 KB', 14, {
      matterReference: 'WEG Lindenallee 12',
    }),
    doc('p20', t('To-do - week 47', 'To-do KW 47'), t('Notes', 'Notizen'), 'DOCX', '3 KB', 15),
    doc('p21', t('Noise complaint flat 7 - forwarded', 'Beschwerde Lärm Wohnung 7 - weitergeleitet'), t('Tenant Complaint', 'Mieterbeschwerde'), 'PDF', '58 KB', 16, {
      parties: [['Hans-Jürgen Weber', t('Tenant', 'Mieter')]],
    }),
    doc('p22', t('Quote heating replacement heat pump Schmitz', 'Angebot Heizungstausch Wärmepumpe Schmitz'), t('Quote', 'Angebot'), 'PDF', '740 KB', 18, {
      summary: t('Air-source heat pump to replace the 1998 gas boiler, meeting the 65% renewable energy requirement of the GEG.',
        'Luft-Wasser-Wärmepumpe als Ersatz für den Gaskessel von 1998, erfüllt die 65-%-Vorgabe des GEG.'),
      parties: [['Heizungsbau Schmitz & Söhne GmbH', t('Contractor', 'Auftragnehmer')]],
    }),
    doc('p23', t('Copy of tenant list Sülzgürtel', 'Kopie von Mieterliste Sülzgürtel'), t('Spreadsheet', 'Tabelle'), 'XLSX', '27 KB', 20),
    doc('p24', t('Reminder - service fee arrears flat 3', 'Mahnung Hausgeld Wohnung 3'), t('Payment Reminder', 'Mahnung'), 'DOCX', '14 KB', 22, {
      parties: [['Kemal Arslan', t('Owner', 'Eigentümer')]],
      dates: [[t('Payment due', 'Zahlungsfrist'), 7, 'deadline']],
    }),
    doc('p25', t('Note - challenge to EV charging resolution', 'Vermerk Beschlussanfechtung Ladesäulen'), 'Memo', 'DOCX', '17 KB', 24, {
      summary: t('An owner has filed a challenge at the Amtsgericht against the resolution on EV charging points.',
        'Ein Eigentümer hat beim Amtsgericht Anfechtungsklage gegen den Beschluss zu den Ladesäulen erhoben.'),
    }),
    doc('p26', t('Lift maintenance contract - check termination', 'Wartungsvertrag Aufzug - Kündigung prüfen'), t('Maintenance Contract', 'Wartungsvertrag'), 'PDF', '290 KB', 27, {
      parties: [['Aufzugsdienst Köln GmbH', t('Service provider', 'Dienstleister')]],
      dates: [[t('Notice period ends', 'Kündigungsfrist endet'), 35, 'deadline']],
    }),
    doc('p27', t('Smoke alarm inspection log 2026', 'Rauchwarnmelder Prüfprotokoll 2026'), t('Inspection Report', 'Prüfprotokoll'), 'PDF', '410 KB', 31),
    doc('p28', t('Management agreement Am Stadtwald - renewal', 'Verwaltervertrag WEG Am Stadtwald - Verlängerung'), t('Management Agreement', 'Verwaltervertrag'), 'DOCX', '38 KB', 36),
    doc('p29', t('Photos - stairwell inspection (scanned)', 'Fotos Begehung Treppenhaus (Scan)'), 'Scan', 'PDF', '3.1 MB', 42),
    doc('p30', t('Cologne rent index 2026 - extract', 'Mietspiegel Köln 2026 - Auszug'), t('Rent Index', 'Mietspiegel'), 'PDF', '1.2 MB', 55),
    doc('p31', t('Owners’ meeting slides Lindenallee 2026', 'Präsentation ETV Lindenallee 2026'), t('Presentation', 'Präsentation'), 'PPTX', '4.2 MB', 64),
    doc('p32', t('Untitled spreadsheet', 'Unbenannte Tabelle'), t('Spreadsheet', 'Tabelle'), 'XLSX', '7 KB', 92),
    doc('p33', t('Old owners list - archive', 'Alte Eigentümerliste - Archiv'), t('Reference', 'Referenz'), 'XLSX', '21 KB', 140),
    doc('p34', 'Scan_0042', 'Scan', 'PDF', '390 KB', 196),
  ]

  return {
    areaLabel: t('Real estate', 'Immobilien'),
    product: { name: 'Haufe VerwalterPraxis Gold', shortName: 'VerwalterPraxis', icon: '/user-testing-nov-26/product-icons/verwalterpraxis.png', mark: 'VPR' },
    myDocuments,

    workspaces: {
      createIntro: t(
        'Bring together the documents, context and guardrails for a property, an owners’ association or a tenancy. Your apps use them to give answers that fit the property.',
        'Bündeln Sie Dokumente, Kontext und Leitplanken zu einem Objekt, einer Eigentümergemeinschaft oder einem Mietverhältnis. Ihre Apps nutzen sie für Antworten, die zum Objekt passen.'),
      equation: {
        workspaceText: t('Leases, statements and minutes for one property', 'Mietverträge, Abrechnungen und Protokolle zu einem Objekt'),
        haufeText: t('Commentaries, case law and sample letters from Haufe VerwalterPraxis', 'Kommentare, Rechtsprechung und Musterschreiben aus Haufe VerwalterPraxis'),
        resultTitle: t('Advice that fits the property', 'Antworten, die zum Objekt passen'),
        resultText: t('Grounded in tenancy and WEG law and your property’s documents', 'Gestützt auf Miet- und WEG-Recht und die Unterlagen Ihres Objekts'),
      },
      guardrailExamples: [
        { category: t('Sources', 'Quellen'), icon: 'FolderOutlined', text: t('Only answer from the documents in this workspace', 'Nur aus den Dokumenten in diesem Arbeitsbereich antworten'), why: t('Keeps answers to this property’s leases and resolutions.', 'Hält Antworten bei den Verträgen und Beschlüssen dieses Objekts.') },
        { category: t('Citations', 'Zitate'), icon: 'QuotesOutlined', text: t('Cite the statute, ruling or resolution for every statement', 'Für jede Aussage Norm, Urteil oder Beschluss angeben'), why: t('Owners and tenants can check where an answer came from.', 'Eigentümer und Mieter können jede Aussage nachprüfen.') },
        { category: t('Language', 'Sprache'), icon: 'WorldOutlined', text: t('Answer in German', 'Auf Deutsch antworten'), why: t('Matches the language of your letters to tenants.', 'Passt zur Sprache Ihrer Schreiben an Mieter.') },
        { category: t('Privacy', 'Datenschutz'), icon: 'LockOutlined', text: t('Never name individual tenants or owners in drafts for the whole building', 'In Schreiben an alle Bewohner keine einzelnen Mieter oder Eigentümer namentlich nennen'), why: t('Keeps personal data out of notices and circulars.', 'Hält personenbezogene Daten aus Aushängen und Rundschreiben heraus.') },
        { category: t('Escalation', 'Eskalation'), icon: 'UsersOutlined', text: t('Refer challenges to resolutions to the company’s lawyer', 'Beschlussanfechtungen an die Rechtsanwältin der Verwaltung verweisen'), why: t('Hands court matters to the right people.', 'Gibt gerichtliche Fragen an die richtigen Ansprechpartner.') },
        { category: t('Tone', 'Tonalität'), icon: 'CommentOutlined', text: t('Use a friendly, formal tone (Sie) in letters to tenants', 'In Schreiben an Mieter freundlich und förmlich (Sie) formulieren'), why: t('Keeps every letter in your company’s voice.', 'Hält jedes Schreiben im Ton Ihrer Verwaltung.') },
      ],
      previewGuardrails: [
        t('Only answer from this workspace’s documents', 'Nur aus den Dokumenten dieses Arbeitsbereichs antworten'),
        t('Cite the statute or resolution for every statement', 'Für jede Aussage Norm oder Beschluss angeben'),
        t('Flag statement and notice deadlines', 'Auf Abrechnungs- und Kündigungsfristen hinweisen'),
      ],
      profileLabels: [
        t('Property address', 'Objektadresse'),
        t('Management type', 'Verwaltungsart'),
        t('Units', 'Einheiten'),
        t('Year built', 'Baujahr'),
        t('Advisory board', 'Verwaltungsbeirat'),
        t('Heating system', 'Heizungsanlage'),
      ],
      matterPlaceholder: t('e.g. WEG Lindenallee 12 – owners’ meeting 2027', 'z. B. WEG Lindenallee 12 – ETV 2027'),
      tryAsking: name => t(`Which costs in ${name} can be passed on to the tenants, and by when is the statement due?`, `Welche Kosten in ${name} sind auf die Mieter umlagefähig, und bis wann muss die Abrechnung raus?`),
    },

    copilot: {
      chats: [
        {
          id: 're-today-1', day: 'today',
          title: t('Mould and rent reduction', 'Schimmel und Mietminderung'),
          question: t('A tenant reports mould and wants to reduce the rent. What should I do first?', 'Eine Mieterin meldet Schimmel und will die Miete mindern. Was sollte ich zuerst tun?'),
          answer: t(
            'Arrange an **inspection promptly** and document it with photos and humidity readings. A defect reduces the rent **automatically by law** (§ 536 BGB), but only by an appropriate amount — and not if the tenant caused it, for example through **insufficient ventilation**. Have the cause established (building fault or use) before you agree on a reduction, and reply in writing so that no reduction is accepted **without reservation**.',
            'Vereinbaren Sie **zeitnah eine Besichtigung** und dokumentieren Sie sie mit Fotos und Feuchtigkeitsmessungen. Ein Mangel mindert die Miete **kraft Gesetzes** (§ 536 BGB), aber nur in angemessener Höhe – und nicht, wenn die Mieterin ihn selbst verursacht hat, etwa durch **unzureichendes Lüften**. Lassen Sie die Ursache (Bausubstanz oder Nutzung) klären, bevor Sie einer Minderung zustimmen, und antworten Sie schriftlich, damit keine Minderung **vorbehaltlos** hingenommen wird.'),
        },
        {
          id: 're-today-2', day: 'today',
          title: t('Service charge statement deadline', 'Frist für die Betriebskostenabrechnung'),
          question: t('By when must the 2025 service charge statement reach the tenants?', 'Bis wann muss die Betriebskostenabrechnung 2025 bei den Mietern sein?'),
          answer: t(
            'The statement must reach the tenant within **twelve months** of the end of the accounting period (§ 556 Abs. 3 BGB) — for calendar year 2025, by **31 December 2026**. After that you can no longer claim **back payments** unless you weren’t responsible for the delay; credits owed to the tenant still have to be paid. Plan delivery with **proof of receipt**, for example by messenger, rather than posting it on the last day.',
            'Die Abrechnung muss dem Mieter innerhalb von **zwölf Monaten** nach Ende des Abrechnungszeitraums zugehen (§ 556 Abs. 3 BGB) – für das Kalenderjahr 2025 also bis **31. Dezember 2026**. Danach können Sie **Nachforderungen** nicht mehr geltend machen, es sei denn, Sie haben die Verspätung nicht zu vertreten; Guthaben der Mieter sind trotzdem auszuzahlen. Planen Sie die Zustellung **mit Zugangsnachweis**, etwa per Bote, statt sie am letzten Tag einzuwerfen.'),
        },
        {
          id: 're-yesterday-1', day: 'yesterday',
          title: t('Rent increase using the rent index', 'Mieterhöhung nach Mietspiegel'),
          question: t('How much can I raise a rent using the local rent index?', 'Um wie viel kann ich die Miete nach dem Mietspiegel erhöhen?'),
          answer: t(
            'You can ask for consent up to the **local comparative rent** (§ 558 BGB) if the rent has been unchanged for **15 months**. Within three years the rent may rise by no more than **20%** — or **15%** where the state has designated a tight housing market, as in Cologne (§ 558 Abs. 3 BGB). The tenant has until the end of the **second month** after receiving the request to consent (§ 558b BGB); the higher rent applies from the third month.',
            'Sie können die Zustimmung bis zur **ortsüblichen Vergleichsmiete** verlangen (§ 558 BGB), wenn die Miete seit **15 Monaten** unverändert ist. Innerhalb von drei Jahren darf die Miete um höchstens **20 %** steigen – in Gebieten mit angespanntem Wohnungsmarkt wie Köln um höchstens **15 %** (§ 558 Abs. 3 BGB). Der Mieter hat bis zum Ende des **zweiten Monats** nach Zugang Zeit zuzustimmen (§ 558b BGB); die erhöhte Miete gilt ab dem dritten Monat.'),
        },
        {
          id: 're-yesterday-2', day: 'yesterday',
          title: t('Owners’ resolution on the roof', 'Beschluss zur Dachsanierung'),
          question: t('What majority do we need in the owners’ meeting to approve the roof renovation?', 'Welche Mehrheit brauchen wir in der Eigentümerversammlung für die Dachsanierung?'),
          answer: t(
            'Since the 2020 WEG reform, maintenance and repair are decided by a **simple majority of the votes cast** (§ 19 Abs. 2 Nr. 2, § 25 Abs. 1 WEG), with no quorum required. Costs are shared by **co-ownership shares** unless the owners resolve a different split (§ 16 Abs. 2 WEG). Send the invitation at least **three weeks** before the meeting (§ 24 Abs. 4 WEG) and attach comparable quotes — usually **three**.',
            'Seit der WEG-Reform 2020 wird über Erhaltungsmaßnahmen mit **einfacher Mehrheit der abgegebenen Stimmen** beschlossen (§ 19 Abs. 2 Nr. 2, § 25 Abs. 1 WEG), eine Beschlussfähigkeitsgrenze gibt es nicht mehr. Die Kosten werden nach **Miteigentumsanteilen** verteilt, sofern die Eigentümer keinen anderen Schlüssel beschließen (§ 16 Abs. 2 WEG). Laden Sie mindestens **drei Wochen** vorher ein (§ 24 Abs. 4 WEG) und legen Sie Vergleichsangebote bei – üblich sind **drei**.'),
        },
        {
          id: 're-yesterday-3', day: 'yesterday',
          title: t('Heating replacement under the GEG', 'Heizungstausch nach GEG'),
          question: t('The gas boiler in one of our buildings is failing. Do we have to install a heat pump?', 'Der Gaskessel in einem unserer Häuser fällt aus. Müssen wir eine Wärmepumpe einbauen?'),
          answer: t(
            'Not necessarily. A boiler that can be **repaired** may be repaired. If it has to be replaced, new heating systems in a large city like Cologne must now generally run on **65% renewable energy** (§ 71 GEG), since the heat-planning deadline of 30 June 2026 has passed — a heat pump is one option, district heating another. After a breakdown, **transition periods of up to five years** apply (§ 71i GEG), so a temporary replacement is possible while you plan.',
            'Nicht zwingend. Ein Kessel, der sich **reparieren** lässt, darf repariert werden. Muss er ersetzt werden, gilt für neue Heizungen in Großstädten wie Köln inzwischen grundsätzlich die **65-%-Vorgabe für erneuerbare Energien** (§ 71 GEG), weil die Frist für die Wärmeplanung am 30. Juni 2026 abgelaufen ist – eine Wärmepumpe ist eine Möglichkeit, Fernwärme eine andere. Nach einer Havarie gelten **Übergangsfristen von bis zu fünf Jahren** (§ 71i GEG), sodass eine Übergangslösung möglich ist, während Sie planen.'),
        },
      ],
      genericAdvice: t(
        'I’d check the relevant tenancy and WEG provisions and current case law, then compare them with the lease, the resolutions and the statements on file for the property before acting.',
        'Ich würde die einschlägigen miet- und WEG-rechtlichen Vorschriften und die aktuelle Rechtsprechung prüfen und sie dann mit Mietvertrag, Beschlüssen und Abrechnungen des Objekts abgleichen, bevor Sie handeln.'),
      simulatedNote: t(
        'Simulated response for prototyping — connect a real assistant to answer from your actual property files.',
        'Simulierte Antwort für den Prototyp – verbinden Sie einen echten Assistenten, um aus Ihren tatsächlichen Objektunterlagen zu antworten.'),
      articles: [
        {
          keywords: /betriebskost|nebenkost|service.?charge|operating.?cost|utilit|betrkv|umlag|pass(ed)?.?on|§\s*556/i,
          title: t('§ 556 BGB and the BetrKV — which operating costs can be passed on | Commentary', '§ 556 BGB und BetrKV – umlagefähige Betriebskosten | Kommentar'),
          excerpt: t(
            'Only the operating costs listed in § 2 BetrKV can be passed on, and only if the lease says so. Administration, repair and maintenance costs stay with the landlord. Advance payments must be reasonable and settled once a year.',
            'Umlagefähig sind nur die in § 2 BetrKV aufgeführten Betriebskosten, und nur, wenn der Mietvertrag dies vorsieht. Verwaltungs-, Instandhaltungs- und Instandsetzungskosten trägt der Vermieter. Vorauszahlungen müssen angemessen sein und jährlich abgerechnet werden.'),
          general: true,
        },
        {
          keywords: /abrechnung|statement|frist|deadline|einwend|objection|nachzahl|back.?pay/i,
          title: t('Service charge statement: deadlines, form and objections | Work aid', 'Betriebskostenabrechnung: Fristen, Form und Einwendungen | Arbeitshilfe'),
          excerpt: t(
            'The statement must reach the tenant within twelve months of the end of the period; later back payments are excluded (§ 556 Abs. 3 BGB). It needs total costs, the allocation key, the tenant’s share and the advance payments deducted. Tenants have twelve months from receipt to object.',
            'Die Abrechnung muss dem Mieter binnen zwölf Monaten nach Ende des Abrechnungszeitraums zugehen; spätere Nachforderungen sind ausgeschlossen (§ 556 Abs. 3 BGB). Sie braucht Gesamtkosten, Verteilerschlüssel, Mieteranteil und den Abzug der Vorauszahlungen. Mieter können binnen zwölf Monaten nach Zugang Einwendungen erheben.'),
        },
        {
          keywords: /mieterh(ö|oe|o)hung|rent.?increase|raise.*rent|mietspiegel|rent.?index|vergleichsmiete|comparative.?rent|kappung|§\s*558/i,
          title: t('§ 558 BGB — rent increases up to the local comparative rent | Commentary', '§ 558 BGB – Mieterhöhung bis zur ortsüblichen Vergleichsmiete | Kommentar'),
          excerpt: t(
            'The landlord can ask for consent to an increase up to the local comparative rent once the rent has been unchanged for 15 months. The cap is 20% in three years, or 15% in areas designated by state ordinance. The request must give reasons, usually by reference to the rent index.',
            'Der Vermieter kann die Zustimmung zur Erhöhung bis zur ortsüblichen Vergleichsmiete verlangen, wenn die Miete seit 15 Monaten unverändert ist. Die Kappungsgrenze liegt bei 20 % in drei Jahren, in per Landesverordnung bestimmten Gebieten bei 15 %. Das Verlangen ist zu begründen, meist mit dem Mietspiegel.'),
        },
        {
          keywords: /mangel|m(ä|ae)ngel|defect|minder|rent.?reduc|reduce.*rent|schimmel|mou?ld|feucht|damp|§\s*536/i,
          title: t('Rent reduction for defects (§ 536 BGB) | Lexicon', 'Mietminderung bei Mängeln (§ 536 BGB) | Lexikon'),
          excerpt: t(
            'If a defect significantly impairs the use of the flat, the rent is reduced by law for as long as it lasts. The tenant must report the defect without delay (§ 536c BGB). There is no reduction if the tenant caused the defect.',
            'Beeinträchtigt ein Mangel die Tauglichkeit der Wohnung erheblich, ist die Miete kraft Gesetzes für dessen Dauer gemindert. Der Mieter muss den Mangel unverzüglich anzeigen (§ 536c BGB). Hat er ihn selbst verursacht, scheidet eine Minderung aus.'),
        },
        {
          keywords: /eigent(ü|ue|u)merversammlung|owners.?meeting|(^|[^a-z])(etv|weg)([^a-z]|$)|beschluss|resolution|mehrheit|majority|einladung|invitation|anfecht|challeng|§\s*2[3-5]/i,
          title: t('Resolutions in the owners’ meeting (§§ 23–25 WEG) | Commentary', 'Beschlussfassung in der Eigentümerversammlung (§§ 23–25 WEG) | Kommentar'),
          excerpt: t(
            'Owners decide by resolution in the meeting (§ 23 WEG); since 2020 a simple majority of votes cast is enough for most matters and there is no quorum. The invitation period is three weeks. Resolutions can be challenged in court within one month (§ 45 WEG).',
            'Die Eigentümer entscheiden durch Beschluss in der Versammlung (§ 23 WEG); seit 2020 genügt für die meisten Angelegenheiten die einfache Mehrheit der abgegebenen Stimmen, eine Beschlussfähigkeit ist nicht mehr erforderlich. Die Einladungsfrist beträgt drei Wochen. Beschlüsse können binnen eines Monats gerichtlich angefochten werden (§ 45 WEG).'),
        },
        {
          keywords: /wirtschaftsplan|budget|jahresabrechnung|annual.?statement|hausgeld|service.?fee|sonderumlage|special.?levy|r(ü|ue|u)cklage|reserve|§\s*28/i,
          title: t('§ 28 WEG — budget plan, annual statement and special levies | Commentary', '§ 28 WEG – Wirtschaftsplan, Jahresabrechnung und Sonderumlage | Kommentar'),
          excerpt: t(
            'The owners resolve on advance payments based on the manager’s budget plan, and after the year on adjustment payments based on the annual statement. A special levy covers costs the budget did not foresee; it is binding on all owners once resolved.',
            'Die Eigentümer beschließen auf Grundlage des Wirtschaftsplans des Verwalters über die Vorschüsse und nach Ablauf des Jahres auf Grundlage der Jahresabrechnung über die Nachschüsse oder Anpassungen. Eine Sonderumlage deckt nicht eingeplante Kosten; einmal beschlossen, bindet sie alle Eigentümer.'),
        },
        {
          keywords: /heizkost|heating.?cost|heizkostenv|verbrauch|consumption|w(ä|ae|a)rmedienst|metering|ablesung|meter.?reading/i,
          title: t('Heating Costs Ordinance — consumption-based billing | Lexicon', 'Heizkostenverordnung – verbrauchsabhängige Abrechnung | Lexikon'),
          excerpt: t(
            'At least 50% and at most 70% of heating and hot water costs must be billed by consumption (§§ 7, 8 HeizkostenV). Without consumption-based billing the tenant may cut their share by 15% (§ 12 HeizkostenV). Remotely readable meters must provide monthly consumption information.',
            'Mindestens 50 % und höchstens 70 % der Kosten für Heizung und Warmwasser sind nach Verbrauch abzurechnen (§§ 7, 8 HeizkostenV). Ohne verbrauchsabhängige Abrechnung darf der Mieter seinen Anteil um 15 % kürzen (§ 12 HeizkostenV). Fernablesbare Geräte müssen monatliche Verbrauchsinformationen liefern.'),
        },
        {
          keywords: /(^|[^a-z])geg([^a-z]|$)|geb(ä|ae|a)udeenergie|building.?energy|heizung|heating|boiler|kessel|w(ä|ae|a)rmepumpe|heat.?pump|energieausweis|energy.?certificate/i,
          title: t('Building Energy Act (GEG): heating replacement and energy certificates | Article', 'Gebäudeenergiegesetz (GEG): Heizungstausch und Energieausweis | Fachbeitrag'),
          excerpt: t(
            'New heating systems must generally run on at least 65% renewable energy (§ 71 GEG); in existing buildings this applies once the municipal heat-planning deadlines have passed. Energy certificates are valid for ten years and must be shown to prospective tenants and buyers (§§ 79, 80 GEG).',
            'Neue Heizungen müssen grundsätzlich zu mindestens 65 % mit erneuerbaren Energien betrieben werden (§ 71 GEG); im Bestand gilt das nach Ablauf der Fristen der kommunalen Wärmeplanung. Energieausweise sind zehn Jahre gültig und Miet- und Kaufinteressenten vorzulegen (§§ 79, 80 GEG).'),
        },
        {
          keywords: /verwalter|manager|management|hausverwaltung|property|objekt|mieter|tenant|vermiet|landlord|eigent(ü|ue|u)mer|owner/i,
          title: t('Property management in practice: duties in WEG and rental management | Article', 'Verwalterpraxis: Pflichten in WEG- und Mietverwaltung | Fachbeitrag'),
          excerpt: t(
            'The WEG manager runs day-to-day business and urgent measures on their own authority (§ 27 WEG) and carries out the owners’ resolutions. In rental management, keeping deadlines for statements, notices and deposits is the core of avoiding liability.',
            'Der WEG-Verwalter erledigt laufende Angelegenheiten und dringende Maßnahmen in eigener Zuständigkeit (§ 27 WEG) und setzt die Beschlüsse der Eigentümer um. In der Mietverwaltung ist das Einhalten von Abrechnungs-, Kündigungs- und Kautionsfristen der Kern der Haftungsvermeidung.'),
          general: true,
        },
      ],
      fileExcerpts: [
        t('Section 4 of the lease lists the operating costs agreed to be passed on and the advance payment.', '§ 4 des Mietvertrags nennt die vereinbarten umlagefähigen Betriebskosten und die Vorauszahlung.'),
        t('Item 5 of the minutes records the resolution, the votes cast and the agreed cost split.', 'TOP 5 des Protokolls hält den Beschluss, die abgegebenen Stimmen und den vereinbarten Kostenschlüssel fest.'),
        t('Page 2 summarises the defects found and the deadlines noted at the inspection.', 'Seite 2 fasst die festgestellten Mängel und die bei der Begehung notierten Fristen zusammen.'),
      ],
    },

    office: REAL_ESTATE_OFFICE[lang],

    uploads: {
      typeRules: [
        [/betriebskostenabrechnung|nebenkostenabrechnung|service.?charge.?statement|utility.?statement/i, t('Service Charge Statement', 'Betriebskostenabrechnung')],
        [/heizkostenabrechnung|heating.?cost/i, t('Heating Cost Statement', 'Heizkostenabrechnung')],
        [/wirtschaftsplan|budget.?plan/i, t('Budget Plan', 'Wirtschaftsplan')],
        [/jahresabrechnung|annual.?statement/i, t('Annual Statement', 'Jahresabrechnung')],
        [/pr(ä|ae|a)sentation|presentation|slides|folien/i, t('Presentation', 'Präsentation')],
        [/(ü|ue|u)bergabe|hand.?over/i, t('Handover Protocol', 'Übergabeprotokoll')],
        [/pr(ü|ue|u)fprotokoll|wartungsprotokoll|inspection.?(log|report)/i, t('Inspection Report', 'Prüfprotokoll')],
        [/protokoll|minutes|eigent(ü|ue|u)merversammlung|(^|[^a-z])etv([^a-z]|$)|owners.?meeting/i, t('Meeting Minutes', 'Versammlungsprotokoll')],
        [/mieterh(ö|oe|o)hung|rent.?increase/i, t('Rent Increase Letter', 'Mieterhöhungsverlangen')],
        [/mietspiegel|rent.?index/i, t('Rent Index', 'Mietspiegel')],
        [/verwaltervertrag|management.?agreement/i, t('Management Agreement', 'Verwaltervertrag')],
        [/wartungsvertrag|maintenance.?contract|service.?contract/i, t('Maintenance Contract', 'Wartungsvertrag')],
        [/mietvertrag|lease|tenancy.?agreement|rental.?agreement/i, t('Lease', 'Mietvertrag')],
        [/energieausweis|energy.?(performance.?)?certificate/i, t('Energy Certificate', 'Energieausweis')],
        [/schadensmeldung|versicherung|insurance|claim/i, t('Insurance Claim', 'Schadensmeldung')],
        [/hausordnung|house.?rules/i, t('House Rules', 'Hausordnung')],
        [/angebot|kostenvoranschlag|quote|offer|estimate/i, t('Quote', 'Angebot')],
        [/beschwerde|reklamation|complaint/i, t('Tenant Complaint', 'Mieterbeschwerde')],
        [/mahnung|reminder|arrears/i, t('Payment Reminder', 'Mahnung')],
        [/k(ü|ue|u)ndigung|termination|notice.?to.?quit/i, t('Notice of Termination', 'Kündigung')],
        [/mieterliste|tenant.?list/i, t('Tenant List', 'Mieterliste')],
        [/eigent(ü|ue|u)merliste|owners?.?list/i, t('Owners List', 'Eigentümerliste')],
        [/rechnung|invoice/i, t('Invoice', 'Rechnung')],
        [/vollmacht|power.?of.?attorney/i, t('Power of Attorney', 'Vollmacht')],
        [/foto|photo|bild|image/i, t('Photo', 'Foto')],
        [/vertrag|contract|agreement/i, t('Contract', 'Vertrag')],
        [/checkliste|checklist/i, t('Checklist', 'Checkliste')],
        [/vermerk|memo/i, 'Memo'],
        [/notiz|notes/i, t('Notes', 'Notizen')],
        [/brief|schreiben|letter/i, t('Letter', 'Schreiben')],
        [/screenshot/i, 'Screenshot'],
        [/(^|[^a-z])scan/i, 'Scan'],
        [/(^|[^a-z])e?-?mail([^a-z]|$)|korrespondenz|correspondence/i, t('Correspondence', 'Korrespondenz')],
      ],
      topics: [
        [/betriebskost|nebenkost|service.?charge|utilit/i, t('Service charges', 'Betriebskosten')],
        [/heizkost|heating.?cost|w(ä|ae|a)rmedienst/i, t('Heating costs', 'Heizkosten')],
        [/mieterh(ö|oe|o)hung|rent.?increase|mietspiegel|rent.?index/i, t('Rent increase', 'Mieterhöhung')],
        [/schimmel|mou?ld|mangel|m(ä|ae)ngel|defect|minderung|rent.?reduction/i, t('Defects and rent reduction', 'Mängel und Mietminderung')],
        [/eigent(ü|ue|u)merversammlung|(^|[^a-z])etv([^a-z]|$)|owners.?meeting|beschluss|resolution|sonderumlage|special.?levy|hausgeld/i, t('Owners’ resolutions', 'Eigentümerbeschlüsse')],
        [/dach|roof|sanierung|renovation|instandhalt|maintenance|reparatur|repair/i, t('Maintenance and repairs', 'Erhaltung und Instandsetzung')],
        [/(^|[^a-z])geg([^a-z]|$)|energieausweis|energy.?certificate|w(ä|ae|a)rmepumpe|heat.?pump|heizung|heating/i, t('Building energy (GEG)', 'Gebäudeenergie (GEG)')],
        [/wasserschaden|water.?damage|leitungswasser|burst.?pipe|versicherung|insurance/i, t('Insurance damage', 'Versicherungsschaden')],
        [/k(ü|ue|u)ndigung|termination|auszug|move.?out|kaution|deposit/i, t('End of tenancy', 'Beendigung des Mietverhältnisses')],
      ],
      parties: [
        [/lindenallee/i, { name: 'WEG Lindenallee 12', role: t('Owners’ association', 'Eigentümergemeinschaft') }],
        [/stadtwald/i, { name: 'WEG Am Stadtwald 5', role: t('Owners’ association', 'Eigentümergemeinschaft') }],
        [/s(ü|ue|u)lzg(ü|ue|u)rtel/i, { name: 'Rheinische Wohnbau GmbH', role: t('Landlord', 'Vermieterin') }],
        [/hamacher/i, { name: 'Dachdecker Hamacher GmbH', role: t('Contractor', 'Auftragnehmer') }],
        [/schmitz/i, { name: 'Heizungsbau Schmitz & Söhne GmbH', role: t('Contractor', 'Auftragnehmer') }],
        [/w(ä|ae|a)rmedienst/i, { name: 'Wärmedienst Rhein GmbH', role: t('Metering service', 'Messdienstleister') }],
        [/kr(ü|ue|u)ger/i, { name: 'Michael Krüger', role: t('Tenant', 'Mieter') }],
        [/y(ı|i)lmaz/i, { name: 'Elif Yılmaz', role: t('Tenant', 'Mieterin') }],
        [/neumann/i, { name: 'Sabine Neumann', role: t('Former tenant', 'Vormieterin') }],
        [/domstadt|versicherung|insurance/i, { name: 'Domstadt Versicherung AG', role: t('Insurer', 'Versicherer') }],
        [/stadt.?k(ö|oe|o)ln|city.?of.?cologne|bauaufsicht|building.?authority/i, { name: 'Stadt Köln – Bauaufsichtsamt', role: t('Authority', 'Behörde') }],
      ],
      matters: [LINDENALLEE, STADTWALD, SUELZ, t('Sülzgürtel 48 – re-letting flat 4', 'Sülzgürtel 48 – Neuvermietung Wohnung 4'), t('WEG Lindenallee 12 – owners’ meeting 2027', 'WEG Lindenallee 12 – ETV 2027')],
      counterparties: [
        { name: 'Wärmedienst Rhein GmbH', role: t('Metering service', 'Messdienstleister') },
        { name: 'Domstadt Versicherung AG', role: t('Insurer', 'Versicherer') },
        { name: 'Rheinische Wohnbau GmbH', role: t('Landlord', 'Vermieterin') },
        { name: 'Stadt Köln – Amt für Wohnungswesen', role: t('Authority', 'Behörde') },
      ],
      primaryRole: t('Tenant', 'Mieter'),
      deadlineLabels: [t('Statement deadline', 'Abrechnungsfrist'), t('Reply due', 'Antwortfrist'), t('Notice period ends', 'Kündigungsfrist endet')],
      actionLabels: [t('Received', 'Eingegangen'), t('Sent', 'Versendet'), t('Inspected', 'Besichtigt')],
    },
  }
}

// ─── Workspace profile wording and connected-app documents ───────────────────

const SYNC_ROWS: Parameters<typeof syncFilesFor>[0] = {
  sharepoint: [
    ['Owners meeting minutes 2026 Lindenallee 12', 'Protokoll Eigentümerversammlung 2026 Lindenallee 12', 'PDF'], ['Declaration of division Am Stadtwald 5', 'Teilungserklärung Am Stadtwald 5', 'PDF'], ['Business plan 2027 Lindenallee 12', 'Wirtschaftsplan 2027 Lindenallee 12', 'XLSX'],
    ['House rules Sülzgürtel 48', 'Hausordnung Sülzgürtel 48', 'DOCX'], ['Lease template residential', 'Mietvertrag Vorlage Wohnraum', 'DOCX'], ['Energy certificate Am Stadtwald 5', 'Energieausweis Am Stadtwald 5', 'PDF'],
    ['Maintenance plan 2027', 'Instandhaltungsplan 2027', 'XLSX'], ['Management agreement WEG Lindenallee', 'Verwaltervertrag WEG Lindenallee', 'PDF'], ['Resolution collection Am Stadtwald 5', 'Beschluss-Sammlung Am Stadtwald 5', 'DOCX'],
  ],
  googleDrive: [
    ['Handover protocol flat 4', 'Übergabeprotokoll Wohnung 4', 'DOCX'], ['Quote roof renovation Hamacher', 'Angebot Dachsanierung Hamacher', 'PDF'], ['Tenant list Sülzgürtel 48', 'Mieterliste Sülzgürtel 48', 'XLSX'],
    ['Viewing appointments flat 4', 'Besichtigungstermine Wohnung 4', 'XLSX'], ['Photos water damage cellar', 'Fotos Wasserschaden Keller', 'PDF'], ['Invitation owners meeting draft', 'Einladung Eigentümerversammlung Entwurf', 'DOCX'],
    ['Comparison quotes heating', 'Angebotsvergleich Heizung', 'XLSX'], ['Notes - site visit roof', 'Notizen - Begehung Dach', 'DOCX'], ['Rent index Cologne 2025', 'Mietspiegel Köln 2025', 'PDF'],
  ],
  datev: [
    ['Service charge statement 2025 Sülzgürtel 48', 'Betriebskostenabrechnung 2025 Sülzgürtel 48', 'PDF'], ['Rent arrears list 10 2026', 'Mietrückstandsliste 10 2026', 'XLSX'], ['House money statement 2025 Lindenallee 12', 'Hausgeldabrechnung 2025 Lindenallee 12', 'PDF'],
    ['Maintenance reserve Am Stadtwald 5', 'Erhaltungsrücklage Am Stadtwald 5', 'XLSX'], ['Heating cost statement 2025', 'Heizkostenabrechnung 2025', 'PDF'], ['Rent roll 2026', 'Mietenliste 2026', 'XLSX'],
    ['Deposit account overview', 'Übersicht Kautionskonten', 'XLSX'], ['Invoices caretaker service Q3', 'Rechnungen Hausmeisterdienst Q3', 'PDF'], ['Special levy roof - payments', 'Sonderumlage Dach - Zahlungseingänge', 'XLSX'],
  ],
}

const PROFILE_AND_SYNC: Record<'en' | 'de', Pick<AreaContent, 'profile' | 'syncFiles'>> = {
  en: {
    profile: {
      listDescription: 'Shared documents everyone with access can rely on, brought together with a property’s, owners’ association’s or tenancy’s context and rules — for accurate, in-context answers.',
      backgroundDescription: 'What your apps should know about this property, owners’ association or tenancy — who is involved, what matters, how you like to work.',
      backgroundPlaceholder: 'e.g. Owners’ association with 18 units, built 1972, roof renovation decided in 2026, chair of the advisory board prefers email…',
      detailsDescription: 'Facts about the workspace itself, such as property number, units or contact person.',
      detailLabelPlaceholder: 'e.g. Property number',
      detailValuePlaceholder: 'e.g. WEG-0412',
    },
    syncFiles: syncFilesFor(SYNC_ROWS, 'en'),
  },
  de: {
    profile: {
      listDescription: 'Gemeinsame Dokumente, auf die sich alle mit Zugriff verlassen können – zusammen mit dem Kontext und den Regeln zu einem Objekt, einer Eigentümergemeinschaft oder einem Mietverhältnis. Für genaue Antworten, die zum Fall passen.',
      backgroundDescription: 'Was Ihre Apps über dieses Objekt, diese Eigentümergemeinschaft oder dieses Mietverhältnis wissen sollten – wer beteiligt ist, worauf es ankommt, wie Sie arbeiten möchten.',
      backgroundPlaceholder: 'z. B. Eigentümergemeinschaft mit 18 Einheiten, Baujahr 1972, Dachsanierung 2026 beschlossen, Verwaltungsbeiratsvorsitzende bevorzugt E-Mail …',
      detailsDescription: 'Fakten zum Arbeitsbereich selbst, etwa Objektnummer, Einheiten oder Ansprechperson.',
      detailLabelPlaceholder: 'z. B. Objektnummer',
      detailValuePlaceholder: 'z. B. WEG-0412',
    },
    syncFiles: syncFilesFor(SYNC_ROWS, 'de'),
  },
}

export const REAL_ESTATE: { en: AreaContent; de: AreaContent } = {
  en: { ...build('en'), ...PROFILE_AND_SYNC.en },
  de: { ...build('de'), ...PROFILE_AND_SYNC.de },
}
