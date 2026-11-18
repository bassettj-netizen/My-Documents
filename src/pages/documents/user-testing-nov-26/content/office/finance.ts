import type { AreaContent } from '../types'

/** The Finance product screen's pictures (copied from screenshots/). */
const IMG = '/user-testing-nov-26/finance'

/** The Haufe Finance Office Professional start page (screenshots/Finance.png), in English and German. */
function build(lang: 'en' | 'de'): AreaContent['office'] {
  const t = (en: string, de: string) => lang === 'en' ? en : de
  const watch = t('View now', 'Jetzt ansehen')
  return {
    search: { modes: true },
    navItems: [
      { label: t('Home', 'Startseite'), icon: 'HouseOutlined' },
      { label: 'CoPilot', icon: 'HouseOutlined', copilot: true },
      { label: t('My favourites', 'Meine Favoriten'), icon: 'StarOutlined', dividerAfter: true },
      { label: t('Editor’s recommendations', 'Aktuelle Empfehlungen der Redaktion'), icon: 'NoteOutlined' },
      { label: t('Contents A–Z', 'Inhalte von A–Z'), icon: 'OpenBookOutlined' },
      { label: t('Articles', 'Fachbeiträge'), icon: 'ArticleOutlined' },
      { label: t('Topic pages', 'Themenseiten'), icon: 'TreeDiagramOutlined' },
      { label: t('HGB balance sheet commentary', 'HGB Bilanz Kommentar'), icon: 'OpenBookOutlined' },
      { label: t('Work aids', 'Arbeitshilfen'), icon: 'ClipboardOutlined' },
      { label: t('Legal sources', 'Rechtsquellen'), icon: 'HashtagOutlined' },
      { label: t('Case law', 'Rechtsprechung'), icon: 'MuseumOutlined' },
      { label: t('Administrative regulations', 'Verwaltungsvorschriften'), icon: 'FolderOutlined' },
      { label: t('Online training', 'Onlinetraining'), icon: 'VideoOutlined' },
    ],
    columns: [
      [
        { kind: 'blocks', title: t('Editor’s latest recommendations', 'Aktuelle Empfehlungen der Redaktion'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/planung-forecasting.jpg` }, title: t('Planning & forecasting', 'Planung & Forecasting'), text: t('An eye on the future. Figures under control.', 'Zukunft im Blick. Zahlen im Griff.'), cta: watch },
            { media: { icon: 'ArticleOutlined' }, title: t('E-invoicing 2027', 'E-Rechnung 2027'), text: t('What changes for issuing invoices', 'Was sich beim Rechnungsausgang ändert'), cta: watch },
            { media: { icon: 'CalendarCheckOutlined' }, title: t('Year-end closing 2026', 'Jahresabschluss 2026'), text: t('Checklists and deadlines', 'Checklisten und Fristen'), cta: watch },
          ] },
          { kind: 'links', links: [
            t('All the editor’s latest recommendations', 'Alle aktuellen Empfehlungen der Redaktion'),
            t('Key product components at a glance', 'Zentrale Produktbestandteile im Überblick'),
            t('All new and changed documents', 'Alle neuen und geänderten Dokumente'),
          ] },
        ] },
        { kind: 'blocks', title: t('News overview', 'Nachrichtenüberblick'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/betriebsstaetten.jpg`, position: '55% center' }, kicker: t('Permanent establishments abroad', 'Betriebsstätten im Ausland'), title: t('The underestimated permanent-establishment risk: when business abroad becomes taxable', 'Das unterschätzte Betriebsstättenrisiko: Wann aus Auslandsgeschäft Steuerpflicht wird'), meta: t('17 Nov 2026', '17.11.2026'), cta: watch },
            { media: { icon: 'ArticleOutlined', tone: 'neutral' }, kicker: t('VAT', 'Umsatzsteuer'), title: t('BMF letter on e-invoicing: the key points', 'BMF-Schreiben zur E-Rechnung: Die wichtigsten Punkte'), meta: t('16 Nov 2026', '16.11.2026'), cta: watch },
          ] },
          { kind: 'links', links: [t('Go to the news overview', 'Zur News-Übersicht')] },
        ] },
      ],
      [
        { kind: 'blocks', title: t('CoPilot Finance – your personal AI assistant', 'CoPilot Finance – Ihr persönlicher KI-Assistent'), blocks: [
          { kind: 'copilot', image: `${IMG}/copilot.png`, text: t('Just ask your questions. I answer based on the extensive expertise of Haufe Finance Office.', 'Stellen Sie einfach Ihre Fragen. Ich antworte Ihnen basierend auf dem umfangreichen Fachwissen des Haufe Finance Office.'), cta: t('Chat now', 'Jetzt chatten') },
          { kind: 'links', links: [
            t('CoPilot Finance: using it effectively in practice', 'CoPilot Finance: Effektiver Einsatz in der Praxis'),
            t('CoPilot Finance: tip of the month', 'CoPilot Finance: Praxis-Tipp des Monats'),
            t('CoPilot Finance: FAQs', 'CoPilot Finance: Zu den FAQs'),
          ] },
        ] },
        { kind: 'blocks', title: t('Your key content', 'Ihre zentralen Inhalte'), blocks: [
          { kind: 'links', links: [
            t('Articles', 'Fachbeiträge'),
            t('Topic pages – the most important content at a glance', 'Themenseiten – die wichtigsten Inhalte im Überblick'),
            t('HGB balance sheet commentary', 'HGB Bilanz Kommentar'),
            t('Work aids', 'Arbeitshilfen'),
          ] },
        ] },
      ],
      [
        { kind: 'blocks', title: t('Haufe online training', 'Haufe Onlinetraining'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/kortlueke.jpg`, position: 'center 25%' }, title: t('CoPilot Finance in practice: tips', 'Praxis-Tipps CoPilot Finance'), text: 'Marian Kortlüke, Andrea Legath', meta: t('Thursday, 19 Nov 2026 | 10:00 am', 'Donnerstag, 19.11.2026 | 10:00 Uhr'), cta: t('Find out more and register', 'Jetzt informieren und anmelden') },
            { media: { initials: 'SR' }, title: t('Year-end closing 2026: what’s new', 'Jahresabschluss 2026: Das ist neu'), text: 'Sandra Reuter', meta: t('Wednesday, 2 Dec 2026 | 2:00 pm', 'Mittwoch, 02.12.2026 | 14:00 Uhr'), cta: t('Find out more and register', 'Jetzt informieren und anmelden') },
          ] },
          { kind: 'note', text: t('More e-learning', 'Weitere e-Learning Angebote') },
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/wandl.jpg`, position: 'center 15%' }, title: t('German e-invoicing obligation: readiness for companies', 'Deutsche E-Rechnungspflicht Readiness für Unternehmen'), text: 'Paul Wandl', meta: t('approx. 60 min | Video', 'ca. 60 min. | Video'), cta: watch },
            { media: { initials: 'KB' }, title: t('Cash-flow planning made simple', 'Liquiditätsplanung leicht gemacht'), text: 'Katrin Bauer', meta: t('approx. 45 min | Video', 'ca. 45 min. | Video'), cta: watch },
          ] },
          { kind: 'more', label: t('Go to the media library', 'Zur Mediathek') },
        ] },
      ],
    ],
  }
}

export const FINANCE_OFFICE: { en: AreaContent['office']; de: AreaContent['office'] } = { en: build('en'), de: build('de') }
