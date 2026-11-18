import type { AreaContent } from '../types'

/** The HR product screen's pictures (copied from screenshots/). */
const IMG = '/user-testing-nov-26/hr'

/** The Haufe Personal Office Premium start page (screenshots/HR.png), in English and German. */
function build(lang: 'en' | 'de'): AreaContent['office'] {
  const t = (en: string, de: string) => lang === 'en' ? en : de
  const watch = t('View now', 'Jetzt ansehen')
  const register = t('Find out more and register', 'Jetzt informieren und anmelden')
  return {
    search: { modes: true },
    navItems: [
      { label: t('Home', 'Startseite'), icon: 'HouseOutlined' },
      { label: 'CoPilot', icon: 'HouseOutlined', copilot: true },
      { label: t('My favourites', 'Meine Favoriten'), icon: 'StarOutlined', dividerAfter: true },
      { label: t('Latest information', 'Aktuelle Informationen'), icon: 'NoteOutlined' },
      { label: t('Topic pages', 'Themenseiten'), icon: 'TreeDiagramOutlined' },
      { label: t('Work aids', 'Arbeitshilfen'), icon: 'ClipboardOutlined' },
      { label: t('Smart applications', 'Smarte Anwendungen'), icon: 'SparksOutlined' },
      { label: t('Lexicon', 'Lexikon'), icon: 'OpenBookOutlined' },
      { label: t('Articles', 'Fachbeiträge'), icon: 'ArticleOutlined' },
      { label: t('Commentaries', 'Kommentare'), icon: 'OpenBookOutlined' },
      { label: t('Legal sources', 'Rechtsquellen'), icon: 'HashtagOutlined' },
      { label: t('Court decisions', 'Gerichtsentscheidungen'), icon: 'MuseumOutlined' },
      { label: 'Personalmagazin', icon: 'NoteOutlined' },
      { label: t('Market salary analyses', 'Marktgehaltsanalysen'), icon: 'BarChartOutlined' },
      { label: t('Online training & videos', 'Onlinetraining & Videos'), icon: 'VideoOutlined' },
    ],
    columns: [
      [
        { kind: 'blocks', title: t('Generators & checks', 'Generatoren & Checks'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/hr-dokumente-basic.png`, plain: true }, title: 'HR Dokumente Basic', text: t('Create documents easily and set up your own templates', 'Dokumente unkompliziert erstellen und eigene Vorlagen anlegen'), cta: watch },
            { media: { icon: 'BarChartOutlined' }, title: t('Gross-to-net calculator', 'Brutto-Netto-Rechner'), text: t('Calculate pay and deductions quickly', 'Entgelt und Abzüge schnell berechnen'), cta: watch },
            { media: { icon: 'ClipboardOutlined' }, title: t('Employment contract check', 'Arbeitsvertrag-Check'), text: t('Check contracts against current case law', 'Verträge auf aktuelle Rechtsprechung prüfen'), cta: watch },
          ] },
          { kind: 'links', links: [t('More applications and calculators', 'Weitere Anwendungen und Rechner'), t('All work aids A–Z', 'Alle Arbeitshilfen von A–Z')] },
        ] },
        { kind: 'blocks', title: t('Haufe online training', 'Haufe Onlinetraining'), subtitle: t('Live online seminars', 'Live-Online-Seminare'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/rambach.jpg`, position: 'center 20%' }, title: t('The AGG in HR work', 'AGG in der Personalarbeit'), text: 'Dr. Peter H. M. Rambach', meta: t('Wednesday, 25 Nov 2026 | 10:00 am', 'Mittwoch, 25.11.2026 | 10:00 Uhr'), cta: register },
            { media: { initials: 'SB' }, title: t('Payroll tax update: changes at year end', 'Lohnsteuer aktuell: Änderungen zum Jahreswechsel'), text: 'Sabine Brandt', meta: t('Tuesday, 1 Dec 2026 | 2:00 pm', 'Dienstag, 01.12.2026 | 14:00 Uhr'), cta: register },
            { media: { initials: 'MK' }, title: t('Implementing occupational integration management correctly', 'Betriebliches Eingliederungsmanagement rechtssicher umsetzen'), text: 'Markus Klein', meta: t('Wednesday, 9 Dec 2026 | 10:00 am', 'Mittwoch, 09.12.2026 | 10:00 Uhr'), cta: register },
          ] },
          { kind: 'links', links: [t('Go to the media library', 'Zur Mediathek')] },
        ] },
        { kind: 'blocks', title: t('Tips & tricks: Haufe Personal Office training', 'Tipps & Tricks: Schulungen zum Haufe Personal Office'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/tipps-und-tricks.png` }, title: t('Getting the year end right in payroll', 'So gelingt der Jahreswechsel in der Entgeltabrechnung'), meta: t('Wed, 2 Dec 2026, 10:00 – 10:30 am', 'Mi, 2.12.2026, 10:00 – 10:30 Uhr'), cta: watch },
            { media: { image: `${IMG}/tipps-und-tricks.png` }, title: t('Finding things faster with search', 'Schneller finden mit der Suche'), meta: t('Thu, 10 Dec 2026, 1:00 – 1:30 pm', 'Do, 10.12.2026, 13:00 – 13:30 Uhr'), cta: watch },
          ] },
          { kind: 'links', links: [t('All dates and recordings', 'Alle Termine und Aufzeichnungen')] },
        ] },
      ],
      [
        { kind: 'blocks', title: 'CoPilot HR', blocks: [
          { kind: 'copilot', image: `${IMG}/copilot.png`, text: t('Ask the AI chatbot your HR question. Its answers are based on the extensive expertise of Haufe Personal Office.', 'Stellen Sie dem KI-Chatbot Ihre HR-Frage. Seine Antworten basieren auf dem umfangreichen Fachwissen des Haufe Personal Office.'), cta: t('Chat now!', 'Jetzt chatten!') },
          { kind: 'links', links: [t('Getting started & FAQ', 'Tipps zum Einstieg & FAQ'), t('CoPilot HR training (video)', 'Schulung zum CoPilot HR (Video)')] },
        ] },
        { kind: 'blocks', title: t('Don’t miss', 'Nichts verpassen'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/gesetzesradar.png` }, title: t('Legislation radar', 'Gesetzesradar'), text: t('Current status of national and European legislative plans', 'Aktueller Stand nationaler und europäischer Gesetzesvorhaben'), cta: watch },
            { media: { icon: 'CalendarOutlined', tone: 'dark' }, title: t('Deadline calendar', 'Fristenkalender'), text: t('All key dates for HR and payroll', 'Alle wichtigen Termine für HR und Lohn'), cta: watch },
            { media: { icon: 'BarChartOutlined', tone: 'dark' }, title: t('Social security values 2027', 'Sozialversicherungswerte 2027'), text: t('Contribution rates and thresholds at a glance', 'Beitragssätze und Rechengrößen auf einen Blick'), cta: watch },
            { media: { icon: 'ClipboardOutlined', tone: 'dark' }, title: t('Year-end checklist', 'Checkliste Jahreswechsel'), text: t('What HR should do now', 'Was HR jetzt erledigen sollte'), cta: watch },
          ] },
        ] },
      ],
      [
        { kind: 'blocks', title: t('Focus: year end 2026/2027', 'Fokusthema: Jahreswechsel 2026/2027'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/kugeln.png` }, title: t('Payroll tax changes', 'Lohnsteuerliche Änderungen'), text: t('Overview article', 'Übersichtsbeitrag'), cta: watch },
            { media: { image: `${IMG}/kugeln.png` }, title: t('Minimum wage 2027', 'Mindestlohn 2027'), text: t('What changes for employers', 'Was sich für Arbeitgeber ändert'), cta: watch },
            { media: { image: `${IMG}/kugeln.png` }, title: t('Social security changes', 'Änderungen in der Sozialversicherung'), text: t('Overview article', 'Übersichtsbeitrag'), cta: watch },
          ] },
        ] },
        { kind: 'blocks', title: t('Current topics', 'Aktuelle Themen'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/kuendigung-afd-kandidatur.png` }, title: t('Dismissal over an AfD candidacy', 'Kündigung wegen AfD-Kandidatur'), text: t('"To the point" video', '"Auf den Punkt"-Video'), cta: watch },
            { media: { initials: 'NK' }, title: t('Pay transparency: what employers must prepare', 'Entgelttransparenz: Was Arbeitgeber vorbereiten müssen'), text: t('"To the point" video', '"Auf den Punkt"-Video'), cta: watch },
          ] },
          { kind: 'links', links: [t('New and changed documents in your product', 'Neue und geänderte Dokumente Ihres Produkts'), t('All "To the point" videos', 'Alle "Auf den Punkt"-Videos')] },
        ] },
        { kind: 'blocks', title: t('Today’s news', 'Tagesaktuelle News'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/kuenstliche-intelligenz.jpg` }, kicker: t('Pay rise', 'Gehaltssteigerung'), title: t('What an MBA or MiM does for your salary', 'Das bringen MBA und MiM fürs Gehalt'), meta: t('17 Nov 2026', '17.11.2026'), cta: watch },
            { media: { icon: 'MuseumOutlined', tone: 'neutral' }, kicker: t('Ruling', 'Urteil'), title: t('Federal Labour Court on recording working time', 'BAG zur Arbeitszeiterfassung'), meta: t('16 Nov 2026', '16.11.2026'), cta: watch },
          ] },
          { kind: 'links', links: [t('All news', 'Alle News')] },
        ] },
      ],
    ],
  }
}

export const HR_OFFICE: { en: AreaContent['office']; de: AreaContent['office'] } = { en: build('en'), de: build('de') }
