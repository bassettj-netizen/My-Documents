import type { FixedReply } from './types'

/**
 * The user-testing task, the same in every version: create a workspace for the subsidiary "Musterfirma", upload its
 * document (public/user-testing-nov-26/musterfirma/<area>/), enter two profile facts, then ask CoPilot the area's
 * question from that workspace. In a Musterfirma workspace with documents, every question gets the area's answer below,
 * citing the document (⟦F⟧) and Haufe articles (⟦1⟧…). The facts the tester enters are named in the answer's
 * opening line (CoPilotPage); the answer itself assumes the suggested ones.
 *
 * | Area        | Document                                        | Profile facts                                                   | Question |
 * |-------------|-------------------------------------------------|-----------------------------------------------------------------|----------|
 * | HR          | Firmentarifvertrag Musterfirma GmbH             | Mitarbeitende: 450 · Betriebsrat: vorhanden                     | Welche Regeln gelten für Sonderurlaub bei Heirat? |
 * | öD          | Firmentarifvertrag Musterfirma GmbH (TVöD)      | Beschäftigte: 450 · Betriebsrat: vorhanden                      | Welche Regeln gelten für Sonderurlaub bei Heirat? |
 * | Law         | Gesellschaftsvertrag Musterfirma GmbH           | Alleingesellschafterin: Brandner Maschinenbau GmbH · Mitarbeitende: 450 | Welche Geschäfte der Geschäftsführung brauchen die Zustimmung der Gesellschafterin? |
 * | Finance     | Ergebnisabführungsvertrag Musterfirma GmbH      | Rechtsform: GmbH, 100 % Tochter der Brenner Maschinenbau GmbH · Geschäftsjahr: Kalenderjahr | Welche Voraussetzungen gelten für die Organschaft mit der Musterfirma? |
 * | Real estate | Gewerbemietvertrag Musterfirma GmbH             | Objektadresse: Sülzgürtel 48, Köln (Gewerbeeinheit EG) · Verwaltungsart: Mietverwaltung | Welche Regeln gelten für eine Mieterhöhung bei der Musterfirma? |
 * | Tax         | Prüfungsanordnung Musterfirma GmbH              | Mandantennummer: 10452 · Größenklasse: Mittelbetrieb            | Was müssen wir bei der Betriebsprüfung der Musterfirma beachten? |
 */

const MATCH = /musterfirma/i
// A non-breaking space after § keeps it on the same line as its number.
const lines = (...l: string[]) => l.join('\n').replace(/§ /g, '§\u00a0')
const SOURCES_EN = (product: string) => lines(`**Sources from your ${product}**`, 'legally compliant and up-to-date')
const SOURCES_DE = (product: string) => lines(`**Quellen aus Ihrem ${product}**`, 'rechtssicher und aktuell')

type Both = { en: FixedReply; de: FixedReply }

// ─── HR: special leave for one's own wedding (company collective agreement) ───

const HR: Both = {
  en: {
    match: MATCH,
    text: lines(
      '**1. Legal basis in this case**',
      'For Musterfirma GmbH, the issue is governed by the company collective bargaining agreement, not (only) by Section 616 of the German Civil Code (BGB). The collective bargaining agreement contains an explicit, exhaustive provision regarding special leave.',
      '',
      'Relevant is Section 10 of the framework collective bargaining agreement, “Leave with Continued Pay”:',
      '',
      '“Employees are granted leave with continued pay for the duration of the unavoidably necessary absence from work in the following cases:',
      '1. In the event of their own marriage, 3 workdays …”⟦F⟧',
      '',
      'Thus, there is a collective bargaining entitlement to paid leave.',
      '',
      '**2. Content of the collective bargaining provision**',
      '• Occasion: one’s own marriage.',
      '• Duration: 3 working days.',
      '• Compensation: continued payment of wages (no deductions, no offset against annual leave pursuant to § 9 of the collective bargaining agreement).⟦F⟧',
      '• Purpose: “absolutely necessary absence,” i.e., the days must be taken in connection with the wedding ceremony (civil registry office/church, preparation/follow-up), not at any arbitrary time during the year.⟦3⟧',
      '',
      '**3. Relationship to Section 616 of the German Civil Code (BGB) and Other Provisions**',
      'Since the collective bargaining agreement provides for a specific, positively defined leave entitlement, this collective bargaining entitlement is decisive for marriage.⟦1⟧ Further claims under Section 616 of the German Civil Code (BGB) are typically specified or, to that extent, superseded by this provision; the documents provided do not indicate any additional days of special leave for marriage beyond this.⟦2⟧',
      '',
      '**4. Note for Musterfirma (450 employees, works council in place)**',
      'Under § 12 of the collective agreement, the details of how special leave is requested are set out in a works agreement.⟦F⟧ General rules on scheduling leave are subject to the works council’s co-determination (§ 87 (1) no. 5 BetrVG), so check whether such a works agreement exists.⟦4⟧',
      '',
      'In practice, this means: Employees at Musterfirma GmbH are entitled to 3 paid working days of special leave for marriage, the timing of which must be scheduled in accordance with company operations.',
      '',
      SOURCES_EN('Haufe Personal Office Gold'),
    ),
    articles: [
      { title: 'Special leave: occasions, duration and pay | Lexicon', excerpt: 'Employees keep their pay if, through no fault of their own, they are prevented from working for a relatively short time for a personal reason (§ 616 BGB), such as their own wedding. Collective agreements and employment contracts often list the occasions and the number of days conclusively.' },
      { title: '§ 616 BGB: temporary prevention from work | Commentary', excerpt: '§ 616 BGB is not mandatory: it can be restricted or excluded by collective agreement. Where a collective agreement lists the occasions for paid leave conclusively, employees cannot claim further days under § 616 BGB for the same occasion.' },
      { title: 'Leave for personal reasons: when the days are taken | Work aid', excerpt: 'Paid leave for a family event is tied to the occasion: the days must be taken in direct connection with it, for example on the wedding day itself. They cannot be saved up or added to annual leave, and they do not count against it.' },
      { title: 'Works council: co-determination on leave | Lexicon', excerpt: 'The works council has a right of co-determination on general leave principles and the leave schedule (§ 87 (1) no. 5 BetrVG). This includes rules on how and when leave and time off are requested and approved.' },
    ],
    fileExcerpt: '“§ 10 Leave with continued pay: (1) Employees are granted leave with continued pay for the duration of the unavoidably necessary absence from work in the following cases: 1. In the event of their own marriage, 3 workdays …”',
  },
  de: {
    match: MATCH,
    text: lines(
      '**1. Rechtsgrundlage in diesem Fall**',
      'Für die Musterfirma GmbH richtet sich die Frage nach dem Firmentarifvertrag und nicht (nur) nach § 616 BGB. Der Tarifvertrag enthält eine ausdrückliche, abschließende Regelung zur Arbeitsbefreiung.',
      '',
      'Maßgeblich ist § 10 des Tarifvertrags „Arbeitsbefreiung unter Fortzahlung des Entgelts“:',
      '',
      '„Beschäftigte werden unter Fortzahlung des Entgelts für die Dauer der unumgänglich notwendigen Abwesenheit von der Arbeit in folgenden Fällen freigestellt:',
      '1. bei eigener Eheschließung 3 Arbeitstage …“⟦F⟧',
      '',
      'Es besteht also ein tariflicher Anspruch auf bezahlte Freistellung.',
      '',
      '**2. Inhalt der tariflichen Regelung**',
      '• Anlass: eigene Eheschließung.',
      '• Dauer: 3 Arbeitstage.',
      '• Vergütung: Fortzahlung des Entgelts (keine Kürzung, keine Anrechnung auf den Erholungsurlaub nach § 9 des Tarifvertrags).⟦F⟧',
      '• Zweck: „unumgänglich notwendige Abwesenheit“, d. h. die Tage sind im Zusammenhang mit der Trauung (Standesamt/Kirche, Vor- und Nachbereitung) zu nehmen, nicht zu einem beliebigen Zeitpunkt im Jahr.⟦3⟧',
      '',
      '**3. Verhältnis zu § 616 BGB und anderen Regelungen**',
      'Da der Tarifvertrag einen konkreten, positiv geregelten Freistellungsanspruch vorsieht, ist für die Eheschließung dieser tarifliche Anspruch maßgeblich.⟦1⟧ Weitergehende Ansprüche aus § 616 BGB werden durch diese Regelung typischerweise konkretisiert bzw. insoweit verdrängt; den vorliegenden Unterlagen sind keine zusätzlichen Tage Sonderurlaub für die Eheschließung zu entnehmen.⟦2⟧',
      '',
      '**4. Hinweis für die Musterfirma (450 Mitarbeitende, Betriebsrat vorhanden)**',
      'Nach § 12 des Tarifvertrags regelt eine Betriebsvereinbarung, wie Arbeitsbefreiung beantragt wird.⟦F⟧ Allgemeine Urlaubsgrundsätze unterliegen der Mitbestimmung des Betriebsrats (§ 87 Abs. 1 Nr. 5 BetrVG) – prüfen Sie daher, ob eine solche Betriebsvereinbarung besteht.⟦4⟧',
      '',
      'In der Praxis bedeutet das: Beschäftigte der Musterfirma GmbH haben bei Eheschließung Anspruch auf 3 bezahlte Arbeitstage Sonderurlaub, deren Lage betriebsverträglich abzustimmen ist.',
      '',
      SOURCES_DE('Haufe Personal Office Gold'),
    ),
    articles: [
      { title: 'Sonderurlaub: Anlässe, Dauer und Vergütung | Lexikon', excerpt: 'Beschäftigte behalten ihren Entgeltanspruch, wenn sie für eine verhältnismäßig nicht erhebliche Zeit aus einem in ihrer Person liegenden Grund ohne Verschulden an der Arbeitsleistung verhindert sind (§ 616 BGB), etwa bei der eigenen Hochzeit. Tarifverträge und Arbeitsverträge legen die Anlässe und die Zahl der Tage oft abschließend fest.' },
      { title: '§ 616 BGB: Vorübergehende Verhinderung | Kommentar', excerpt: '§ 616 BGB ist dispositiv: Die Vorschrift kann durch Tarifvertrag eingeschränkt oder ausgeschlossen werden. Zählt ein Tarifvertrag die Anlässe für eine bezahlte Freistellung abschließend auf, können Beschäftigte für denselben Anlass keine weiteren Tage nach § 616 BGB verlangen.' },
      { title: 'Freistellung aus persönlichen Gründen: Lage der Tage | Arbeitshilfe', excerpt: 'Die bezahlte Freistellung für ein familiäres Ereignis ist an den Anlass gebunden: Die Tage sind in unmittelbarem Zusammenhang damit zu nehmen, etwa am Hochzeitstag selbst. Sie können nicht angespart oder an den Jahresurlaub angehängt werden und werden nicht auf ihn angerechnet.' },
      { title: 'Betriebsrat: Mitbestimmung beim Urlaub | Lexikon', excerpt: 'Der Betriebsrat bestimmt bei der Aufstellung allgemeiner Urlaubsgrundsätze und des Urlaubsplans mit (§ 87 Abs. 1 Nr. 5 BetrVG). Dazu gehören auch Regeln, wie und wann Urlaub und Arbeitsbefreiung beantragt und genehmigt werden.' },
    ],
    fileExcerpt: '„§ 10 Arbeitsbefreiung unter Fortzahlung des Entgelts: (1) Beschäftigte werden unter Fortzahlung des Entgelts für die Dauer der unumgänglich notwendigen Abwesenheit von der Arbeit in folgenden Fällen freigestellt: 1. bei eigener Eheschließung 3 Arbeitstage …“',
  },
}

// ─── öD: special leave for one's own wedding (TVöD plus company agreement) ────

const OD: Both = {
  en: {
    match: MATCH,
    text: lines(
      '**1. Legal basis**',
      'Under § 2 of its company collective agreement, Musterfirma GmbH applies the TVöD (VKA) unless the agreement says otherwise.⟦F⟧ For special leave, the starting point is therefore § 29 TVöD (time off from work).',
      '',
      '**2. What the TVöD provides**',
      '§ 29 (1) TVöD lists conclusively the occasions for time off with continued pay – for example the birth of a child to one’s wife or partner, the death of a close relative or a move for work reasons. One’s own wedding is not among them.⟦1⟧',
      '',
      '**3. What the company agreement adds**',
      '§ 6 of the company collective agreement extends the list: “In derogation from § 29 (1) TVöD, employees are granted one working day off with continued pay on their own marriage or the formation of a registered partnership.”⟦F⟧',
      '• Occasion: one’s own marriage.',
      '• Duration: 1 working day.',
      '• Pay: continues; not counted against annual leave.',
      '• Timing: on the wedding day or in direct connection with it.⟦2⟧',
      'Further days can only be granted as annual leave or as unpaid special leave under § 28 TVöD.⟦3⟧',
      '',
      '**4. Note for Musterfirma (450 employees, works council in place)**',
      'Musterfirma GmbH is a company under private law. The Works Constitution Act (BetrVG) applies to it, not the LPVG NRW: its works council is responsible, not the city’s staff council.⟦4⟧ Under § 8 of the agreement, the works council and management agree on how time off is requested.⟦F⟧',
      '',
      'In practice, this means: Employees at Musterfirma GmbH get 1 paid working day off for their wedding – one day more than the TVöD alone provides.',
      '',
      SOURCES_EN('Haufe TVöD Office Professional'),
    ),
    articles: [
      { title: '§ 29 TVöD: time off from work | Commentary', excerpt: '§ 29 (1) TVöD lists conclusively when employees are released from work with continued pay: the birth of a child to their wife or partner (1 day), the death of a spouse, partner, child or parent (2 days), a move for work reasons (1 day), a 25th or 40th service anniversary (1 day), serious illness of a close relative and medical treatment during working hours. One’s own wedding is not included.' },
      { title: 'Time off for personal reasons: scheduling | Work aid', excerpt: 'Time off for a family event is tied to the occasion and must be taken on the day itself or in direct connection with it. It cannot be saved up and does not count against annual leave.' },
      { title: '§ 28 TVöD: unpaid special leave | Lexicon', excerpt: 'Employees can be granted special leave without pay if there is an important reason and operational circumstances allow it (§ 28 TVöD). Periods of unpaid leave do not count towards length of service unless the employer has recognised an operational or official interest in writing.' },
      { title: 'Municipal companies: BetrVG or personnel representation law? | Lexicon', excerpt: 'Whether the BetrVG or the state personnel representation law applies depends on the legal form, not on the owner. A GmbH owned by a municipality is a private-law company: it has a works council under the BetrVG, even if it applies the TVöD.' },
    ],
    fileExcerpt: '“§ 6 Time off from work: In derogation from § 29 (1) TVöD, employees are granted one working day off with continued pay on their own marriage or the formation of a registered partnership.”',
  },
  de: {
    match: MATCH,
    text: lines(
      '**1. Rechtsgrundlage**',
      'Die Musterfirma GmbH wendet nach § 2 ihres Firmentarifvertrags den TVöD (VKA) an, soweit der Firmentarifvertrag nichts anderes regelt.⟦F⟧ Ausgangspunkt für Sonderurlaub ist daher § 29 TVöD (Arbeitsbefreiung).',
      '',
      '**2. Was der TVöD regelt**',
      '§ 29 Abs. 1 TVöD zählt die Anlässe für eine Arbeitsbefreiung unter Fortzahlung des Entgelts abschließend auf – etwa die Niederkunft der Ehefrau oder Lebenspartnerin, den Tod naher Angehöriger oder einen Umzug aus dienstlichem Grund. Die eigene Eheschließung gehört nicht dazu.⟦1⟧',
      '',
      '**3. Was der Firmentarifvertrag ergänzt**',
      '§ 6 des Firmentarifvertrags erweitert den Katalog: „Abweichend von § 29 Abs. 1 TVöD erhalten Beschäftigte bei eigener Eheschließung oder Begründung einer eingetragenen Lebenspartnerschaft einen Arbeitstag Arbeitsbefreiung unter Fortzahlung des Entgelts.“⟦F⟧',
      '• Anlass: eigene Eheschließung.',
      '• Dauer: 1 Arbeitstag.',
      '• Entgelt: wird fortgezahlt; keine Anrechnung auf den Erholungsurlaub.',
      '• Lage: am Tag der Eheschließung oder in unmittelbarem Zusammenhang damit.⟦2⟧',
      'Weitere Tage können nur als Erholungsurlaub oder als Sonderurlaub ohne Entgelt nach § 28 TVöD gewährt werden.⟦3⟧',
      '',
      '**4. Hinweis für die Musterfirma (450 Beschäftigte, Betriebsrat vorhanden)**',
      'Die Musterfirma GmbH ist privatrechtlich organisiert. Für sie gilt das Betriebsverfassungsgesetz, nicht das LPVG NRW: Zuständig ist ihr Betriebsrat, nicht der Personalrat der Stadt.⟦4⟧ Wie Arbeitsbefreiung beantragt wird, vereinbaren Betriebsrat und Geschäftsführung nach § 8 des Firmentarifvertrags.⟦F⟧',
      '',
      'In der Praxis bedeutet das: Beschäftigte der Musterfirma GmbH erhalten für ihre Hochzeit 1 bezahlten Arbeitstag – einen Tag mehr, als der TVöD allein vorsieht.',
      '',
      SOURCES_DE('Haufe TVöD Office Professional'),
    ),
    articles: [
      { title: '§ 29 TVöD: Arbeitsbefreiung | Kommentar', excerpt: '§ 29 Abs. 1 TVöD regelt abschließend, wann Beschäftigte unter Fortzahlung des Entgelts von der Arbeit freigestellt werden: Niederkunft der Ehefrau oder Lebenspartnerin (1 Tag), Tod von Ehegatte, Lebenspartner, Kind oder Elternteil (2 Tage), Umzug aus dienstlichem Grund (1 Tag), 25- und 40-jähriges Jubiläum (1 Tag), schwere Erkrankung naher Angehöriger und ärztliche Behandlung während der Arbeitszeit. Die eigene Eheschließung ist nicht genannt.' },
      { title: 'Arbeitsbefreiung aus persönlichen Gründen: Lage | Arbeitshilfe', excerpt: 'Die Arbeitsbefreiung für ein familiäres Ereignis ist an den Anlass gebunden und am Tag selbst oder in unmittelbarem Zusammenhang damit zu nehmen. Sie kann nicht angespart werden und wird nicht auf den Erholungsurlaub angerechnet.' },
      { title: '§ 28 TVöD: Sonderurlaub ohne Entgelt | Lexikon', excerpt: 'Bei Vorliegen eines wichtigen Grundes kann Beschäftigten Sonderurlaub unter Verzicht auf die Fortzahlung des Entgelts gewährt werden, wenn die dienstlichen oder betrieblichen Verhältnisse es gestatten (§ 28 TVöD). Zeiten ohne Entgelt zählen nicht als Beschäftigungszeit, es sei denn, der Arbeitgeber hat vorher schriftlich ein dienstliches oder betriebliches Interesse anerkannt.' },
      { title: 'Kommunale Gesellschaften: BetrVG oder Personalvertretungsrecht? | Lexikon', excerpt: 'Ob das BetrVG oder das Landespersonalvertretungsgesetz gilt, hängt von der Rechtsform ab, nicht vom Eigentümer. Eine GmbH im Eigentum einer Kommune ist privatrechtlich organisiert: Sie hat einen Betriebsrat nach dem BetrVG, auch wenn sie den TVöD anwendet.' },
    ],
    fileExcerpt: '„§ 6 Arbeitsbefreiung: Abweichend von § 29 Abs. 1 TVöD erhalten Beschäftigte bei eigener Eheschließung oder Begründung einer eingetragenen Lebenspartnerschaft einen Arbeitstag Arbeitsbefreiung unter Fortzahlung des Entgelts.“',
  },
}

// ─── Law: transactions that need the shareholder's consent (articles) ─────────

const LAW: Both = {
  en: {
    match: MATCH,
    text: lines(
      '**1. Legal basis**',
      'The powers of Musterfirma GmbH’s management are governed by the GmbHG and the articles of association. Under § 37 (1) GmbHG, the managing directors are bound by the restrictions set out in the articles or in shareholder resolutions.⟦1⟧',
      '',
      '**2. Transactions requiring consent under § 8 of the articles**',
      'Management needs the prior consent of the shareholders’ meeting for:⟦F⟧',
      '• acquiring, selling or encumbering real estate;',
      '• acquiring or selling shareholdings and founding subsidiaries;',
      '• taking out loans or giving guarantees above € 500,000 in an individual case;',
      '• contracts with a term of more than two years or an annual value above € 250,000;',
      '• granting or revoking Prokura (statutory commercial power of attorney);',
      '• any transaction outside the ordinary course of business.',
      '',
      '**3. Effect towards third parties**',
      'These restrictions only apply internally: the managing directors’ power of representation cannot be limited towards third parties (§ 37 (2) GmbHG). A transaction concluded without consent is therefore usually valid, but can make the managing director liable under § 43 GmbHG.⟦2⟧',
      '',
      '**4. Points specific to Musterfirma**',
      '• The sole shareholder is Brandner Maschinenbau GmbH. It can give its consent without convening a meeting; under § 9 (3) of the articles, resolutions may also be passed in writing.⟦F⟧ The resolution must be recorded in writing and signed without delay (§ 48 (3) GmbHG).⟦3⟧',
      '• With 450 employees, Musterfirma is below the threshold of 500 employees in the One-Third Participation Act (DrittelbG). It does not need a supervisory board with employee representatives, so consent stays with the shareholder.⟦4⟧',
      '',
      'In practice, this means: For the transactions listed in § 8, obtain a written shareholder resolution from Brandner Maschinenbau GmbH in advance and file it with the contract documents.',
      '',
      SOURCES_EN('Haufe Deutsches Anwalt Office Premium'),
    ),
    articles: [
      { title: '§ 37 GmbHG: restrictions on the managing directors | Commentary', excerpt: 'Internally, the managing directors must observe the restrictions set by the articles of association or by shareholder resolutions (§ 37 (1) GmbHG). Catalogues of transactions requiring consent are common in subsidiaries and should be worded precisely, with thresholds.' },
      { title: 'Managing director liability for transactions without consent | Lexicon', excerpt: 'The power of representation of a GmbH’s managing directors is unlimited towards third parties (§ 37 (2) GmbHG). If a managing director concludes a transaction without the required consent, it remains valid, but the company can claim damages under § 43 (2) GmbHG.' },
      { title: 'Shareholder resolutions in a single-member GmbH | Work aid', excerpt: 'In a single-member GmbH, the sole shareholder can pass resolutions at any time without formalities. Under § 48 (3) GmbHG, it must record the resolution in writing and sign it without delay; a template helps to document consents consistently.' },
      { title: 'One-Third Participation Act: when a supervisory board is required | Lexicon', excerpt: 'A GmbH with usually more than 500 employees must form a supervisory board, one third of which consists of employee representatives (§ 1 (1) no. 3 DrittelbG). Below this threshold, there is no mandatory supervisory board.' },
    ],
    fileExcerpt: '“§ 8 Transactions requiring consent: (1) Management requires the prior consent of the shareholders’ meeting for the following transactions: a) the acquisition, sale or encumbrance of real estate; b) the acquisition or sale of shareholdings and the founding of subsidiaries; c) loans and guarantees exceeding € 500,000 in an individual case; d) contracts with a term of more than two years or an annual value exceeding € 250,000; e) the granting and revocation of Prokura; f) all transactions outside the ordinary course of business.”',
  },
  de: {
    match: MATCH,
    text: lines(
      '**1. Rechtsgrundlage**',
      'Die Befugnisse der Geschäftsführung der Musterfirma GmbH richten sich nach dem GmbHG und dem Gesellschaftsvertrag. Nach § 37 Abs. 1 GmbHG ist die Geschäftsführung an die Beschränkungen gebunden, die der Gesellschaftsvertrag oder Gesellschafterbeschlüsse festlegen.⟦1⟧',
      '',
      '**2. Zustimmungspflichtige Geschäfte nach § 8 des Gesellschaftsvertrags**',
      'Die Geschäftsführung braucht die vorherige Zustimmung der Gesellschafterversammlung für:⟦F⟧',
      '• Erwerb, Veräußerung und Belastung von Grundstücken;',
      '• Erwerb und Veräußerung von Beteiligungen sowie die Gründung von Tochtergesellschaften;',
      '• Kredite und Bürgschaften über 500.000 € im Einzelfall;',
      '• Verträge mit einer Laufzeit von mehr als zwei Jahren oder einem Jahreswert über 250.000 €;',
      '• Erteilung und Widerruf von Prokura;',
      '• alle Geschäfte außerhalb des gewöhnlichen Geschäftsbetriebs.',
      '',
      '**3. Wirkung nach außen**',
      'Die Zustimmungsvorbehalte wirken nur im Innenverhältnis: Die Vertretungsmacht der Geschäftsführung kann Dritten gegenüber nicht beschränkt werden (§ 37 Abs. 2 GmbHG). Ein Geschäft ohne Zustimmung ist daher in der Regel wirksam, kann aber eine Haftung der Geschäftsführung nach § 43 GmbHG auslösen.⟦2⟧',
      '',
      '**4. Besonderheiten bei der Musterfirma**',
      '• Alleingesellschafterin ist die Brandner Maschinenbau GmbH. Sie kann zustimmen, ohne eine Versammlung einzuberufen; nach § 9 Abs. 3 des Gesellschaftsvertrags sind auch schriftliche Beschlüsse zulässig.⟦F⟧ Der Beschluss ist unverzüglich niederzuschreiben und zu unterschreiben (§ 48 Abs. 3 GmbHG).⟦3⟧',
      '• Mit 450 Mitarbeitenden liegt die Musterfirma unter der Schwelle von 500 Arbeitnehmern des Drittelbeteiligungsgesetzes. Ein mitbestimmter Aufsichtsrat ist nicht zu bilden – die Zustimmung bleibt bei der Gesellschafterin.⟦4⟧',
      '',
      'In der Praxis bedeutet das: Holen Sie für die in § 8 genannten Geschäfte vorab einen schriftlichen Gesellschafterbeschluss der Brandner Maschinenbau GmbH ein und legen Sie ihn zu den Vertragsunterlagen.',
      '',
      SOURCES_DE('Haufe Deutsches Anwalt Office Premium'),
    ),
    articles: [
      { title: '§ 37 GmbHG: Beschränkungen der Geschäftsführung | Kommentar', excerpt: 'Im Innenverhältnis muss die Geschäftsführung die Beschränkungen beachten, die Gesellschaftsvertrag oder Gesellschafterbeschlüsse vorgeben (§ 37 Abs. 1 GmbHG). Kataloge zustimmungspflichtiger Geschäfte sind bei Tochtergesellschaften üblich und sollten mit Wertgrenzen klar formuliert sein.' },
      { title: 'Haftung der Geschäftsführung bei Geschäften ohne Zustimmung | Lexikon', excerpt: 'Die Vertretungsmacht der GmbH-Geschäftsführung ist Dritten gegenüber unbeschränkt (§ 37 Abs. 2 GmbHG). Schließt die Geschäftsführung ein Geschäft ohne die erforderliche Zustimmung, bleibt es wirksam; die Gesellschaft kann aber Schadensersatz nach § 43 Abs. 2 GmbHG verlangen.' },
      { title: 'Gesellschafterbeschlüsse in der Ein-Personen-GmbH | Arbeitshilfe', excerpt: 'In der Ein-Personen-GmbH kann die Alleingesellschafterin jederzeit formlos Beschlüsse fassen. Nach § 48 Abs. 3 GmbHG muss sie den Beschluss unverzüglich niederschreiben und unterschreiben; eine Vorlage hilft, Zustimmungen einheitlich zu dokumentieren.' },
      { title: 'Drittelbeteiligungsgesetz: Wann ein Aufsichtsrat Pflicht ist | Lexikon', excerpt: 'Eine GmbH mit in der Regel mehr als 500 Arbeitnehmern muss einen Aufsichtsrat bilden, der zu einem Drittel aus Arbeitnehmervertretern besteht (§ 1 Abs. 1 Nr. 3 DrittelbG). Unterhalb dieser Schwelle besteht keine Pflicht zu einem Aufsichtsrat.' },
    ],
    fileExcerpt: '„§ 8 Zustimmungspflichtige Geschäfte: (1) Die Geschäftsführung bedarf für folgende Geschäfte der vorherigen Zustimmung der Gesellschafterversammlung: a) Erwerb, Veräußerung und Belastung von Grundstücken; b) Erwerb und Veräußerung von Beteiligungen sowie Gründung von Tochtergesellschaften; c) Kredite und Bürgschaften über 500.000 € im Einzelfall; d) Verträge mit einer Laufzeit von mehr als zwei Jahren oder einem Jahreswert über 250.000 €; e) Erteilung und Widerruf von Prokura; f) alle Geschäfte außerhalb des gewöhnlichen Geschäftsbetriebs.“',
  },
}

// ─── Finance: requirements for a fiscal unity (profit and loss transfer agreement)

const FINANCE: Both = {
  en: {
    match: MATCH,
    text: lines(
      '**1. Legal basis**',
      'Brenner Maschinenbau GmbH (controlling company) and Musterfirma GmbH (controlled company) have concluded a profit and loss transfer agreement. A fiscal unity for corporate and trade tax is governed by §§ 14 and 17 KStG and § 2 (2) sentence 2 GewStG.⟦F⟧⟦1⟧',
      '',
      '**2. Requirements – and where Musterfirma stands**',
      '• Financial integration: the controlling company must hold the majority of voting rights from the start of the controlled company’s fiscal year. With 100% of the shares and a fiscal year that matches the calendar year, this is met from 1 January.⟦1⟧',
      '• Minimum term: the agreement must be concluded for at least five years. § 6 provides for a fixed term until 31 December 2030 – met.⟦F⟧',
      '• Loss absorption: for a GmbH, the agreement must refer to § 302 AktG “as amended from time to time” (§ 17 (1) sentence 2 no. 2 KStG). § 3 contains this dynamic reference – met.⟦F⟧⟦2⟧',
      '• Effectiveness: the agreement only takes effect when it is entered in the commercial register. For the fiscal unity to apply from 2026, it must be registered by 31 December 2026.⟦2⟧',
      '• Performance: the agreement must actually be carried out for its whole term – the full profit is transferred and any loss absorbed.⟦3⟧',
      '',
      '**3. VAT**',
      'A fiscal unity for VAT (§ 2 (2) no. 2 UStG) does not require a profit and loss transfer agreement, but financial, economic and organisational integration. It must be checked separately.⟦4⟧',
      '',
      'In practice, this means: Make sure the agreement is entered in the commercial register before 31 December 2026, and agree the 2026 profit transfer with the auditor as part of the annual financial statements.',
      '',
      SOURCES_EN('Haufe Finance Office Professional'),
    ),
    articles: [
      { title: 'Fiscal unity for corporate tax: requirements | Lexicon', excerpt: 'A corporate tax fiscal unity requires the controlling company to hold the majority of voting rights in the controlled company without interruption from the start of its fiscal year (financial integration) and a profit and loss transfer agreement concluded for at least five years and actually performed (§ 14 (1) KStG).' },
      { title: 'Profit and loss transfer agreement with a GmbH | Commentary', excerpt: 'For a GmbH as the controlled company, the loss absorption must be agreed by referring to § 302 AktG as amended from time to time (§ 17 (1) sentence 2 no. 2 KStG). The agreement takes effect under civil law when it is entered in the commercial register; for tax purposes it applies for the first time to the fiscal year in which it takes effect.' },
      { title: 'Performing the profit and loss transfer agreement | Work aid', excerpt: 'The agreement is only performed correctly if the profit is fully transferred and the loss fully absorbed, based on correct annual financial statements. Errors in the financial statements can be cured under certain conditions (§ 14 (1) sentence 1 no. 3 sentence 4 KStG).' },
      { title: 'Fiscal unity for VAT | Lexicon', excerpt: 'A VAT fiscal unity exists if a legal entity is financially, economically and organisationally integrated into the business of the controlling company (§ 2 (2) no. 2 UStG). No profit and loss transfer agreement is needed; the consequences apply automatically.' },
    ],
    fileExcerpt: '“§ 3 Loss absorption: Brenner Maschinenbau GmbH is obliged to absorb any annual deficit of the company. The provisions of § 302 AktG as amended from time to time apply accordingly. … § 6 Term: The agreement is concluded for a fixed term until 31 December 2030.”',
  },
  de: {
    match: MATCH,
    text: lines(
      '**1. Rechtsgrundlage**',
      'Zwischen der Brenner Maschinenbau GmbH (Organträgerin) und der Musterfirma GmbH (Organgesellschaft) besteht ein Ergebnisabführungsvertrag. Für die körperschaft- und gewerbesteuerliche Organschaft gelten §§ 14, 17 KStG und § 2 Abs. 2 Satz 2 GewStG.⟦F⟧⟦1⟧',
      '',
      '**2. Voraussetzungen – und der Stand bei der Musterfirma**',
      '• Finanzielle Eingliederung: Die Organträgerin muss vom Beginn des Wirtschaftsjahrs der Organgesellschaft an die Mehrheit der Stimmrechte halten. Mit 100 % der Anteile und einem Geschäftsjahr gleich Kalenderjahr ist das ab 1. Januar erfüllt.⟦1⟧',
      '• Mindestlaufzeit: Der Vertrag muss auf mindestens fünf Jahre abgeschlossen sein. § 6 sieht eine feste Laufzeit bis 31.12.2030 vor – erfüllt.⟦F⟧',
      '• Verlustübernahme: Bei einer GmbH muss der Vertrag auf § 302 AktG „in seiner jeweils gültigen Fassung“ verweisen (§ 17 Abs. 1 Satz 2 Nr. 2 KStG). § 3 enthält diesen dynamischen Verweis – erfüllt.⟦F⟧⟦2⟧',
      '• Wirksamkeit: Der Vertrag wird erst mit Eintragung ins Handelsregister wirksam. Damit die Organschaft schon für 2026 greift, muss die Eintragung bis 31.12.2026 erfolgen.⟦2⟧',
      '• Durchführung: Der Vertrag muss während der gesamten Laufzeit tatsächlich durchgeführt werden – der volle Gewinn wird abgeführt, ein Verlust ausgeglichen.⟦3⟧',
      '',
      '**3. Umsatzsteuer**',
      'Die umsatzsteuerliche Organschaft (§ 2 Abs. 2 Nr. 2 UStG) setzt keinen Ergebnisabführungsvertrag voraus, sondern finanzielle, wirtschaftliche und organisatorische Eingliederung. Sie ist gesondert zu prüfen.⟦4⟧',
      '',
      'In der Praxis bedeutet das: Achten Sie auf die Eintragung ins Handelsregister vor dem 31.12.2026 und stimmen Sie die Gewinnabführung für 2026 im Jahresabschluss mit dem Abschlussprüfer ab.',
      '',
      SOURCES_DE('Haufe Finance Office Professional'),
    ),
    articles: [
      { title: 'Körperschaftsteuerliche Organschaft: Voraussetzungen | Lexikon', excerpt: 'Die körperschaftsteuerliche Organschaft setzt voraus, dass die Organträgerin vom Beginn des Wirtschaftsjahrs der Organgesellschaft an ununterbrochen die Mehrheit der Stimmrechte hält (finanzielle Eingliederung) und ein Gewinnabführungsvertrag auf mindestens fünf Jahre abgeschlossen und tatsächlich durchgeführt wird (§ 14 Abs. 1 KStG).' },
      { title: 'Ergebnisabführungsvertrag mit einer GmbH | Kommentar', excerpt: 'Bei einer GmbH als Organgesellschaft muss die Verlustübernahme durch Verweis auf § 302 AktG in seiner jeweils gültigen Fassung vereinbart werden (§ 17 Abs. 1 Satz 2 Nr. 2 KStG). Zivilrechtlich wird der Vertrag mit Eintragung ins Handelsregister wirksam; steuerlich gilt er erstmals für das Wirtschaftsjahr, in dem er wirksam wird.' },
      { title: 'Durchführung des Ergebnisabführungsvertrags | Arbeitshilfe', excerpt: 'Der Vertrag ist nur dann ordnungsgemäß durchgeführt, wenn der Gewinn vollständig abgeführt und der Verlust vollständig ausgeglichen wird – auf Basis eines zutreffenden Jahresabschlusses. Fehler im Jahresabschluss können unter Voraussetzungen geheilt werden (§ 14 Abs. 1 Satz 1 Nr. 3 Satz 4 KStG).' },
      { title: 'Umsatzsteuerliche Organschaft | Lexikon', excerpt: 'Eine umsatzsteuerliche Organschaft liegt vor, wenn eine juristische Person finanziell, wirtschaftlich und organisatorisch in das Unternehmen der Organträgerin eingegliedert ist (§ 2 Abs. 2 Nr. 2 UStG). Ein Ergebnisabführungsvertrag ist nicht erforderlich; die Rechtsfolgen treten automatisch ein.' },
    ],
    fileExcerpt: '„§ 3 Verlustübernahme: Die Brenner Maschinenbau GmbH ist verpflichtet, jeden während der Vertragsdauer entstehenden Jahresfehlbetrag der Gesellschaft auszugleichen. Die Vorschriften des § 302 AktG in seiner jeweils gültigen Fassung gelten entsprechend. … § 6 Vertragsdauer: Der Vertrag wird fest bis zum 31. Dezember 2030 abgeschlossen.“',
  },
}

// ─── Real estate: rent increases in a commercial lease (index clause) ─────────

const REAL_ESTATE: Both = {
  en: {
    match: MATCH,
    text: lines(
      '**1. Legal basis**',
      'Musterfirma GmbH rents the commercial unit on the ground floor of Sülzgürtel 48. The rent-increase rules for residential space (§§ 557 ff. BGB, rent index, cap on increases) do not apply to commercial premises. The rent can only be increased if the lease provides for it.⟦1⟧',
      '',
      '**2. The index clause in § 5 of the lease**',
      '• Reference: the consumer price index for Germany (CPI, 2020 = 100).⟦F⟧',
      '• Threshold: if the index changes by more than 5% compared with the last adjustment, the rent changes by the same percentage – up or down.',
      '• Procedure: the new rent applies from the month after the tenant receives a written adjustment notice with the calculation.⟦F⟧',
      '',
      '**3. Is the clause valid?**',
      'Under § 3 (1) no. 1 (d) of the Price Clause Act (PrKG), index clauses in commercial leases are only permitted if the landlord is bound to the lease for at least ten years. § 3 of the lease provides for a fixed term of ten years (1 January 2022 to 31 December 2031) – the clause is valid.⟦2⟧',
      '',
      '**4. Written form**',
      'A lease for more than one year must be in writing (§ 550 BGB). Agree any rent change outside the index clause only in a signed addendum – otherwise the lease can be terminated early.⟦3⟧',
      '',
      '**5. Note for your rental management**',
      'As the property manager, you send the adjustment notice on the landlord’s behalf. Enclose the power of attorney, or the tenant can reject the notice (§ 174 BGB).⟦4⟧',
      '',
      'In practice, this means: Compare the current CPI with the level at the last adjustment (January 2022). If it has risen by more than 5%, send Musterfirma a written adjustment notice with the index values and the new rent.',
      '',
      SOURCES_EN('Haufe VerwalterPraxis Gold'),
    ),
    articles: [
      { title: 'Rent increases in commercial leases | Lexicon', excerpt: 'The statutory rules on rent increases (§§ 557–561 BGB) only apply to residential space. In commercial leases, the rent can only be increased by agreement – usually through a stepped rent or an index clause in the lease.' },
      { title: 'Index clauses and the Price Clause Act | Commentary', excerpt: 'Index clauses in commercial leases are permitted under § 3 (1) no. 1 (d) PrKG if the landlord waives ordinary termination for at least ten years or the tenant can extend the lease to at least ten years. The clause must refer to a price index of the Federal Statistical Office and work in both directions.' },
      { title: 'Written form of long-term leases (§ 550 BGB) | Work aid', excerpt: 'A lease concluded for more than one year without the written form is deemed to be concluded for an indefinite period and can be terminated with the statutory notice period. Every material change – especially to the rent – must therefore be recorded in a signed addendum that refers to the original lease.' },
      { title: 'Notices by the property manager: enclose a power of attorney | Lexicon', excerpt: 'If the property manager sends a unilateral declaration such as a rent adjustment on the landlord’s behalf without enclosing an original power of attorney, the tenant can reject it without delay (§ 174 BGB). The declaration is then ineffective and must be sent again.' },
    ],
    fileExcerpt: '“§ 5 Index clause: (1) If the consumer price index for Germany published by the Federal Statistical Office (2020 = 100) changes by more than 5% compared with the level at the start of the lease or the last adjustment, the net rent changes by the same percentage. (2) The change takes effect from the month following receipt of a written adjustment notice stating the calculation.”',
  },
  de: {
    match: MATCH,
    text: lines(
      '**1. Rechtsgrundlage**',
      'Die Musterfirma GmbH mietet die Gewerbeeinheit im Erdgeschoss Sülzgürtel 48. Die Mieterhöhungsregeln für Wohnraum (§§ 557 ff. BGB, Mietspiegel, Kappungsgrenze) gelten für Gewerberaum nicht. Eine Erhöhung ist nur möglich, wenn der Mietvertrag sie vorsieht.⟦1⟧',
      '',
      '**2. Die Wertsicherungsklausel in § 5 des Mietvertrags**',
      '• Bezugsgröße: Verbraucherpreisindex für Deutschland (VPI, 2020 = 100).⟦F⟧',
      '• Schwelle: Ändert sich der Index um mehr als 5 % gegenüber der letzten Anpassung, ändert sich die Miete im gleichen Verhältnis – nach oben wie nach unten.',
      '• Verfahren: Die neue Miete gilt ab dem Monat nach Zugang einer schriftlichen Anpassungserklärung mit Berechnung.⟦F⟧',
      '',
      '**3. Ist die Klausel wirksam?**',
      'Preisklauseln in Gewerbemietverträgen sind nach § 3 Abs. 1 Nr. 1 d PrKG nur zulässig, wenn der Vermieter mindestens zehn Jahre an den Vertrag gebunden ist. § 3 des Mietvertrags sieht eine feste Laufzeit von zehn Jahren vor (1.1.2022 bis 31.12.2031) – die Klausel ist wirksam.⟦2⟧',
      '',
      '**4. Schriftform**',
      'Ein Mietvertrag über mehr als ein Jahr bedarf der Schriftform (§ 550 BGB). Vereinbaren Sie Mietänderungen außerhalb der Indexklausel nur per unterschriebenem Nachtrag – sonst wird der Vertrag vorzeitig kündbar.⟦3⟧',
      '',
      '**5. Hinweis für Ihre Mietverwaltung**',
      'Als Verwaltung geben Sie die Anpassungserklärung im Namen des Vermieters ab. Legen Sie die Vollmacht im Original bei, sonst kann die Mieterin die Erklärung zurückweisen (§ 174 BGB).⟦4⟧',
      '',
      'In der Praxis bedeutet das: Vergleichen Sie den aktuellen VPI mit dem Stand der letzten Anpassung (Januar 2022). Ist er um mehr als 5 % gestiegen, senden Sie der Musterfirma eine schriftliche Anpassungserklärung mit Indexwerten und neuer Miete.',
      '',
      SOURCES_DE('Haufe VerwalterPraxis Gold'),
    ),
    articles: [
      { title: 'Mieterhöhung im Gewerbemietvertrag | Lexikon', excerpt: 'Die gesetzlichen Regeln zur Mieterhöhung (§§ 557–561 BGB) gelten nur für Wohnraum. Im Gewerbemietvertrag kann die Miete nur erhöht werden, wenn das vereinbart ist – meist über eine Staffelmiete oder eine Wertsicherungsklausel.' },
      { title: 'Wertsicherungsklauseln und Preisklauselgesetz | Kommentar', excerpt: 'Indexklauseln in Gewerbemietverträgen sind nach § 3 Abs. 1 Nr. 1 d PrKG zulässig, wenn der Vermieter für mindestens zehn Jahre auf die ordentliche Kündigung verzichtet oder der Mieter den Vertrag auf mindestens zehn Jahre verlängern kann. Die Klausel muss auf einen Preisindex des Statistischen Bundesamts verweisen und in beide Richtungen wirken.' },
      { title: 'Schriftform langfristiger Mietverträge (§ 550 BGB) | Arbeitshilfe', excerpt: 'Ein Mietvertrag über mehr als ein Jahr, der die Schriftform nicht wahrt, gilt als auf unbestimmte Zeit geschlossen und ist mit gesetzlicher Frist kündbar. Jede wesentliche Änderung – vor allem der Miete – gehört deshalb in einen unterschriebenen Nachtrag, der auf den Ursprungsvertrag Bezug nimmt.' },
      { title: 'Erklärungen der Hausverwaltung: Vollmacht beilegen | Lexikon', excerpt: 'Gibt die Verwaltung eine einseitige Erklärung wie eine Mietanpassung im Namen des Vermieters ab, ohne eine Originalvollmacht beizufügen, kann der Mieter sie unverzüglich zurückweisen (§ 174 BGB). Die Erklärung ist dann unwirksam und muss erneut zugestellt werden.' },
    ],
    fileExcerpt: '„§ 5 Wertsicherung: (1) Ändert sich der vom Statistischen Bundesamt veröffentlichte Verbraucherpreisindex für Deutschland (2020 = 100) gegenüber dem Stand bei Mietbeginn bzw. der letzten Anpassung um mehr als 5 %, ändert sich die Nettokaltmiete im gleichen prozentualen Verhältnis. (2) Die Änderung wird ab dem Monat wirksam, der auf den Zugang einer schriftlichen Anpassungserklärung mit Berechnung folgt.“',
  },
}

// ─── Tax: a client's tax audit (audit order) ──────────────────────────────────

const TAX: Both = {
  en: {
    match: MATCH,
    text: lines(
      '**1. Legal basis**',
      'On 9 November 2026, Finanzamt Freiburg-Stadt issued an audit order for your client Musterfirma GmbH (§§ 193, 196 AO). It covers corporate tax, trade tax and VAT for 2022 to 2024.⟦F⟧⟦1⟧',
      '',
      '**2. What the audit order sets out**',
      '• Start: 12 January 2027, 9:00 am, at the company’s premises.⟦F⟧',
      '• Data access: the bookkeeping data for 2022–2024 must be provided on a data carrier in a machine-readable format (§ 147 (6) AO).⟦F⟧⟦2⟧',
      '• Contact person: the company must name a person to provide information by 15 December 2026.⟦F⟧',
      '• Focus areas: the managing director’s pay, provisions and intra-Community supplies.⟦F⟧',
      '',
      '**3. Rights and duties**',
      '• Postponement: the start can be postponed on request for important reasons, e.g. year-end work (§ 197 (2) AO).⟦1⟧',
      '• Cooperation: Musterfirma must provide documents and information (§ 200 AO). Since 2025, if it doesn’t respond to a request to cooperate in time, a cooperation delay penalty of € 75 per day can be imposed (§ 200a AO).⟦3⟧',
      '• Voluntary disclosure: now that the audit order has been issued, a voluntary disclosure for these taxes and years no longer gives immunity from prosecution (§ 371 (2) sentence 1 no. 1 (a) AO).⟦4⟧',
      '',
      '**4. Note for Musterfirma (client no. 10452, medium-sized business)**',
      'For a medium-sized business, the audit period should usually cover no more than three consecutive years (§ 4 (3) BpO) – the order is within that. Check the managing director’s pay against the 2022–2024 bonus agreements before the audit starts.⟦1⟧',
      '',
      'In practice, this means: Name the contact person by 15 December 2026, prepare the data export and go through the focus areas – especially the managing director’s pay – with the client before 12 January.',
      '',
      SOURCES_EN('Haufe Steuer Office Premium'),
    ),
    articles: [
      { title: 'Audit order: content, notification and postponement | Lexicon', excerpt: 'The audit order sets out the taxes, periods and start of the audit and must be notified a reasonable time in advance – two weeks for medium-sized businesses (§ 196, § 197 AO; § 5 (4) BpO). For medium-sized businesses, the audit period should not usually exceed three years (§ 4 (3) BpO).' },
      { title: 'Data access in a tax audit | Work aid', excerpt: 'During an audit, the tax office may inspect electronic records directly, have them evaluated or ask for them on a data carrier (§ 147 (6) AO). The data must be machine-readable and complete for the whole retention period under the GoBD.' },
      { title: 'Duty to cooperate and cooperation delay penalty | Commentary', excerpt: 'The taxpayer must provide information and documents and give access to data (§ 200 AO). Since 2025, if a request to cooperate is not met in time, the tax office can impose a cooperation delay penalty of € 75 for each day, for up to 150 days (§ 200a AO).' },
      { title: 'Voluntary disclosure: blocked by the audit order | Lexicon', excerpt: 'A voluntary disclosure does not give immunity from prosecution once an audit order has been notified to the taxpayer or their adviser – for the taxes and periods it covers (§ 371 (2) sentence 1 no. 1 (a) AO). Corrections should therefore be made before the order is issued.' },
    ],
    fileExcerpt: '“Audit order under §§ 193, 196 AO: Taxpayer: Musterfirma GmbH, Freiburg. Taxes and periods: corporate tax, trade tax and VAT 2022 to 2024. Start of the audit: 12 January 2027, 9:00 am, at your business premises. … Please name a person to provide information by 15 December 2026.”',
  },
  de: {
    match: MATCH,
    text: lines(
      '**1. Rechtsgrundlage**',
      'Das Finanzamt Freiburg-Stadt hat am 9.11.2026 für Ihre Mandantin Musterfirma GmbH eine Außenprüfung angeordnet (§§ 193, 196 AO). Geprüft werden Körperschaftsteuer, Gewerbesteuer und Umsatzsteuer 2022 bis 2024.⟦F⟧⟦1⟧',
      '',
      '**2. Was die Prüfungsanordnung vorgibt**',
      '• Beginn: 12. Januar 2027, 9:00 Uhr, in den Geschäftsräumen.⟦F⟧',
      '• Datenzugriff: Die Buchhaltungsdaten 2022–2024 sind auf einem Datenträger in maschinell auswertbarer Form bereitzustellen (§ 147 Abs. 6 AO).⟦F⟧⟦2⟧',
      '• Auskunftsperson: Sie ist bis 15. Dezember 2026 zu benennen.⟦F⟧',
      '• Prüfungsschwerpunkte: Geschäftsführervergütung, Rückstellungen und innergemeinschaftliche Lieferungen.⟦F⟧',
      '',
      '**3. Rechte und Pflichten**',
      '• Verlegung: Auf Antrag kann der Prüfungsbeginn aus wichtigen Gründen verschoben werden, etwa wegen Jahresabschlussarbeiten (§ 197 Abs. 2 AO).⟦1⟧',
      '• Mitwirkung: Die Musterfirma muss Unterlagen vorlegen und Auskünfte erteilen (§ 200 AO). Seit 2025 kann bei Verzug nach einem Mitwirkungsverlangen ein Mitwirkungsverzögerungsgeld von 75 € je Tag festgesetzt werden (§ 200a AO).⟦3⟧',
      '• Selbstanzeige: Mit Bekanntgabe der Prüfungsanordnung ist eine strafbefreiende Selbstanzeige für diese Steuern und Jahre gesperrt (§ 371 Abs. 2 Satz 1 Nr. 1 Buchst. a AO).⟦4⟧',
      '',
      '**4. Hinweis für die Musterfirma (Mandantennummer 10452, Mittelbetrieb)**',
      'Bei Mittelbetrieben soll der Prüfungszeitraum in der Regel nicht mehr als drei zusammenhängende Jahre umfassen (§ 4 Abs. 3 BpO) – die Anordnung hält das ein. Gleichen Sie die Geschäftsführervergütung vor Prüfungsbeginn mit den Tantiemevereinbarungen 2022–2024 ab.⟦1⟧',
      '',
      'In der Praxis bedeutet das: Benennen Sie bis 15.12.2026 die Auskunftsperson, bereiten Sie den Datenexport vor und gehen Sie die Prüfungsschwerpunkte – vor allem die Geschäftsführervergütung – vor dem 12. Januar mit der Mandantin durch.',
      '',
      SOURCES_DE('Haufe Steuer Office Premium'),
    ),
    articles: [
      { title: 'Prüfungsanordnung: Inhalt, Bekanntgabe und Verlegung | Lexikon', excerpt: 'Die Prüfungsanordnung legt Steuerarten, Zeiträume und Prüfungsbeginn fest und ist angemessene Zeit vorher bekannt zu geben – bei Mittelbetrieben zwei Wochen (§§ 196, 197 AO; § 5 Abs. 4 BpO). Bei Mittelbetrieben soll der Prüfungszeitraum in der Regel nicht über drei Jahre hinausgehen (§ 4 Abs. 3 BpO).' },
      { title: 'Datenzugriff in der Betriebsprüfung | Arbeitshilfe', excerpt: 'Das Finanzamt kann bei einer Außenprüfung elektronische Aufzeichnungen unmittelbar einsehen, auswerten lassen oder auf einem Datenträger anfordern (§ 147 Abs. 6 AO). Die Daten müssen nach den GoBD für die gesamte Aufbewahrungsfrist vollständig und maschinell auswertbar vorgehalten werden.' },
      { title: 'Mitwirkungspflichten und Mitwirkungsverzögerungsgeld | Kommentar', excerpt: 'Der Steuerpflichtige muss Auskünfte erteilen, Unterlagen vorlegen und Datenzugriff gewähren (§ 200 AO). Seit 2025 kann das Finanzamt nach einem nicht fristgerecht erfüllten Mitwirkungsverlangen ein Mitwirkungsverzögerungsgeld von 75 € je Tag festsetzen, höchstens für 150 Tage (§ 200a AO).' },
      { title: 'Selbstanzeige: Sperrwirkung der Prüfungsanordnung | Lexikon', excerpt: 'Eine strafbefreiende Selbstanzeige ist ausgeschlossen, sobald dem Steuerpflichtigen oder seiner Beraterin eine Prüfungsanordnung bekannt gegeben wurde – für die darin genannten Steuern und Zeiträume (§ 371 Abs. 2 Satz 1 Nr. 1 Buchst. a AO). Berichtigungen sollten daher vor der Anordnung erfolgen.' },
    ],
    fileExcerpt: '„Prüfungsanordnung nach §§ 193, 196 AO: Steuerpflichtige: Musterfirma GmbH, Freiburg. Steuerarten und Zeiträume: Körperschaftsteuer, Gewerbesteuer und Umsatzsteuer 2022 bis 2024. Beginn der Prüfung: 12. Januar 2027, 9:00 Uhr, in Ihren Geschäftsräumen. … Bitte benennen Sie bis zum 15. Dezember 2026 eine Auskunftsperson.“',
  },
}

export const MUSTERFIRMA = { hr: HR, od: OD, law: LAW, finance: FINANCE, realEstate: REAL_ESTATE, tax: TAX }
