import type { AreaContent } from '../types'

/** The oD product screen's pictures (copied from screenshots/). */
const IMG = '/user-testing-nov-26/od'

/** The Haufe TVöD Office Professional start page (screenshots/oD.png), in English and German. */
function build(lang: 'en' | 'de'): AreaContent['office'] {
  const t = (en: string, de: string) => lang === 'en' ? en : de
  const watch = t('View now', 'Jetzt ansehen')
  const overview = t('Full overview', 'Zur Gesamtübersicht')
  return {
    search: { modes: true },
    navItems: [
      { label: t('Home', 'Startseite'), icon: 'HouseOutlined' },
      { label: 'CoPilot', icon: 'HouseOutlined', copilot: true },
      { label: t('My favourites', 'Meine Favoriten'), icon: 'StarOutlined', dividerAfter: true },
      { label: t('Lexicon & articles', 'Lexikon & Fachbeiträge'), icon: 'OpenBookOutlined' },
      { label: t('Commentaries', 'Kommentare'), icon: 'OpenBookOutlined' },
      { label: t('Legal sources', 'Rechtsquellen'), icon: 'HashtagOutlined' },
      { label: t('Collective agreements', 'Tarifverträge'), icon: 'EditOutlined' },
      { label: t('Case law', 'Rechtsprechung'), icon: 'MuseumOutlined' },
      { label: t('Personalmagazin', 'Personalmagazin'), icon: 'NoteOutlined' },
      { label: t('Work aids', 'Arbeitshilfen'), icon: 'ClipboardOutlined' },
    ],
    columns: [
      [
        { kind: 'blocks', title: t('Latest', 'Aktuelles'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/kugeln.png` }, title: t('Year end 2026/2027', 'Jahreswechsel 2026/2027'), text: t('Figures, data, facts', 'Zahlen, Daten, Fakten'), cta: watch },
            { media: { icon: 'BarChartOutlined' }, title: t('TVöD pay tables 2027', 'Entgelttabellen TVöD 2027'), text: t('All pay groups and levels at a glance', 'Alle Entgeltgruppen und Stufen auf einen Blick'), cta: watch },
            { media: { icon: 'CalendarOutlined' }, title: t('Deadline calendar public sector', 'Fristenkalender öffentlicher Dienst'), text: t('Key dates for HR and payroll', 'Wichtige Termine für Personal und Entgelt'), cta: watch },
          ] },
          { kind: 'links', links: [
            t('Collective bargaining law / case law / legislation', 'Tarifrecht / Rechtsprechung / Gesetzgebung'),
            t('Case law overview 2026', 'Rechtsprechungsübersicht 2026'),
            t('New and changed documents', 'Neue und geänderte Dokumente'),
          ] },
        ] },
        { kind: 'blocks', title: t('Notes on recent case law', 'Anmerkungen zur aktuellen Rechtsprechung'), blocks: [
          { kind: 'links', links: [
            t('No damages for discrimination in the selection procedure', 'Kein Schadensersatz wegen Diskriminierung im Stellenbesetzungsverfahren'),
            t('Fixed term without objective reason despite employment 17 years earlier', 'Sachgrundlose Befristung trotz 17 Jahre zurückliegender Vorbeschäftigung'),
            t('New works council hearing when repeating a notice that was not received', 'Neue Betriebsratsanhörung bei Wiederholung einer nicht zugegangenen Kündigung'),
          ] },
          { kind: 'more', label: overview },
        ] },
      ],
      [
        { kind: 'blocks', title: 'CoPilot HR öD', blocks: [
          { kind: 'copilot', image: `${IMG}/copilot.png`, text: t('Ask the AI chatbot your HR questions. Its answers are based on the extensive expertise of Haufe TVöD Office Professional.', 'Stellen Sie dem KI-Chatbot Ihre HR-Fragen. Seine Antworten basieren auf dem umfangreichen Fachwissen des Haufe TVöD Office Professional.'), cta: t('Chat now!', 'Jetzt chatten!') },
          { kind: 'links', links: [t('Getting started & FAQ', 'Tipps zum Einstieg & FAQ'), t('CoPilot HR öD training', 'Schulung zum CoPilot HR öD')] },
        ] },
        { kind: 'blocks', title: t('TVöD articles', 'TVöD Fachbeiträge'), blocks: [
          { kind: 'alphabet', disabled: ['X', 'Y'] },
          { kind: 'more', label: overview },
        ] },
        { kind: 'blocks', title: t('Work aids', 'Arbeitshilfen'), blocks: [
          { kind: 'links', links: [t('TVöD pay tables', 'Entgelttabellen TVöD'), t('Warning letter (templates)', 'Abmahnung (Mustervorlagen)'), t('Template contracts', 'Musterverträge'), t('Calculators', 'Rechner')] },
          { kind: 'more', label: overview },
        ] },
      ],
      [
        { kind: 'blocks', title: t('Video series: To the point', 'Video-Reihe: Auf den Punkt'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/entgeltunterlagen.png` }, title: t('Obligation to keep electronic pay records', 'Pflicht zur Führung elektronischer Entgeltunterlagen'), text: t('BVV: digital pay records from 2027', 'BVV: Digitale Entgeltunterlagen ab 2027'), cta: watch },
            { media: { initials: 'MS' }, title: t('Annual special payment 2026', 'Jahressonderzahlung 2026'), text: t('Who gets how much under § 20 TVöD', 'Wer wie viel nach § 20 TVöD erhält'), cta: watch },
            { media: { initials: 'JH' }, title: t('Step allocation on hiring', 'Stufenzuordnung bei Einstellung'), text: t('Taking previous experience into account', 'Vorerfahrung richtig berücksichtigen'), cta: watch },
          ] },
        ] },
        { kind: 'blocks', title: t('Haufe online training', 'Haufe Onlinetraining'), subtitle: t('Live online seminars', 'Live-Online-Seminare'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/droste-klempp.jpg`, position: 'center 20%' }, title: t('Partial retirement in the public sector: what’s new', 'Aktuelles zur Altersteilzeit im öffentlichen Dienst'), text: 'Christiane Droste-Klempp, Jutta Schwerdle', meta: t('Wednesday, 18 Nov 2026 | 2:00 pm', 'Mittwoch, 18.11.2026 | 14:00 Uhr'), cta: t('Find out more and register', 'Jetzt informieren und anmelden') },
            { media: { initials: 'TB' }, title: t('Grouping under the TVöD in practice', 'Eingruppierung nach TVöD in der Praxis'), text: 'Thomas Brandt', meta: t('Tuesday, 1 Dec 2026 | 10:00 am', 'Dienstag, 01.12.2026 | 10:00 Uhr'), cta: t('Find out more and register', 'Jetzt informieren und anmelden') },
          ] },
          { kind: 'links', links: [t('Go to the media library', 'Zur Mediathek')] },
        ] },
        { kind: 'blocks', title: 'haufe.de/oeffentlicher-dienst', blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/polizei.jpg`, position: '30% center' }, kicker: t('Ruling', 'Urteil'), title: t('Police officers lose civil-servant status after leaving the scene', 'Polizistinnen verlieren Beamtenstatus nach Flucht vom Einsatzort'), meta: t('17 Nov 2026', '17.11.2026'), cta: watch },
            { media: { icon: 'ArticleOutlined', tone: 'neutral' }, kicker: t('Pay', 'Entgelt'), title: t('Pay round 2027: what municipal employers expect', 'Tarifrunde 2027: Was kommunale Arbeitgeber erwartet'), meta: t('16 Nov 2026', '16.11.2026'), cta: watch },
          ] },
        ] },
      ],
    ],
  }
}

export const OD_OFFICE: { en: AreaContent['office']; de: AreaContent['office'] } = { en: build('en'), de: build('de') }
