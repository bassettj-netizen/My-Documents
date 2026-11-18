import type { AreaContent } from '../types'

/** The Law product screen's pictures (copied from screenshots/). */
const IMG = '/user-testing-nov-26/law'

/** The Deutsches Anwalt Office Premium start page (screenshots/Screenshot 2026-11-18 at 08.03.05.png and 08.03.15.png), in English and German. */
function build(lang: 'en' | 'de'): AreaContent['office'] {
  const t = (en: string, de: string) => lang === 'en' ? en : de
  const watch = t('View now', 'Jetzt ansehen')
  const register = t('Find out more and register', 'Jetzt informieren und anmelden')
  // Cover colours of the books on the product screen.
  const RED = '#c8102e'
  const DARK = '#1c212d'
  return {
    search: { modes: false },
    navItems: [
      { label: t('Home', 'Startseite'), icon: 'HouseOutlined' },
      { label: 'CoPilot', icon: 'HouseOutlined', copilot: true },
      { label: t('My favourites', 'Meine Favoriten'), icon: 'StarOutlined', dividerAfter: true },
      { label: t('Library', 'Bibliothek'), icon: 'BarChartOutlined' },
      { label: t('Case law', 'Rechtsprechung'), icon: 'MuseumOutlined' },
      { label: t('Legal sources', 'Rechtsquellen'), icon: 'HashtagOutlined' },
      { label: t('Work aids', 'Arbeitshilfen'), icon: 'ClipboardOutlined' },
    ],
    columns: [
      [
        { kind: 'blocks', title: t('Library', 'Bibliothek'), blocks: [
          { kind: 'links', links: [
            t('AnwaltFormulare', 'AnwaltFormulare'),
            t('Commentaries', 'Kommentare'),
            t('Handbooks', 'Handbücher'),
            t('Journals', 'Zeitschriften'),
            t('Lexicons', 'Lexika'),
          ] },
        ] },
        { kind: 'blocks', title: t('Work aids', 'Arbeitshilfen'), blocks: [
          { kind: 'links', links: [t('Lawyer’s forms', 'Anwaltformulare'), 'Top 10', t('Work aids by area of law', 'Arbeitshilfen nach Rechtsgebieten')] },
        ] },
        { kind: 'blocks', title: t('Case law and legal sources', 'Rechtsprechung und Rechtsquellen'), blocks: [
          { kind: 'links', links: [t('Case law', 'Rechtsprechung'), t('Legal sources', 'Rechtsquellen')] },
        ] },
        { kind: 'blocks', title: t('Inside the firm', 'Kanzlei intern'), blocks: [
          { kind: 'links', links: [
            t('Paralegal workplace: the all-rounder, Bellmann/Benker/Kirchner', 'Arbeitsplatz ReFa: Der Allrounder, Bellmann/Benker/Kirchner'),
            t('anwaltbüro – newsletter for law firm staff', 'anwaltbüro – Infobrief für Kanzleimitarbeiter'),
            t('AI and digitalisation: the future of law', 'KI und Digitalisierung: Zur Zukunft des Rechts'),
            t('E-brochure: electronic legal transactions', 'eBroschüre Elektronischer Rechtsverkehr'),
            t('Legal English for law firms, Mustu, 1st ed. 2025 (Deutscher Anwaltverlag)', 'Kanzleienglisch, Mustu, 1. Aufl. 2025 (Deutscher Anwaltverlag)'),
          ] },
        ] },
      ],
      [
        { kind: 'blocks', title: t('CoPilot Law – your personal AI assistant', 'CoPilot Law – Ihr persönlicher KI-Assistent'), blocks: [
          { kind: 'copilot', image: `${IMG}/copilot.png`, text: t('Just ask your questions. Its answers are based on the extensive expertise of Deutsches Anwalt Office Premium.', 'Stellen Sie einfach Ihre Fragen. Seine Antworten basieren auf dem umfangreichen Fachwissen des Deutschen Anwalt Office Premium.'), cta: t('Chat now', 'Jetzt chatten') },
          { kind: 'links', links: [
            t('About CoPilot Law', 'Informationen zu CoPilot Law'),
            t('How to use your AI assistant in your firm', 'Wie Sie Ihren KI-Assistenten in Ihrer Kanzlei einsetzen'),
            t('Using CoPilot Law on mobile & by voice', 'CoPilot Law mobil & sprachgesteuert nutzen'),
          ] },
        ] },
        { kind: 'blocks', title: t('AI in the law firm', 'KI in der Anwaltskanzlei'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/legal-prompts.jpg`, plain: true }, title: t('Legal Prompts in brief', 'Legal Prompts kompakt'), cta: watch },
            { media: { book: 'KI', color: DARK }, title: t('AI in the law firm: a practical guide', 'KI in der Kanzlei: Praxisleitfaden'), cta: watch },
            { media: { book: 'AI Act', color: '#2b4c9b' }, title: t('The EU AI Act for lawyers', 'Die KI-Verordnung für Anwälte'), cta: watch },
            { media: { book: 'Legal Tech', color: '#4a5568' }, title: t('Legal tech in practice', 'Legal Tech in der Praxis'), cta: watch },
          ] },
        ] },
        { kind: 'blocks', title: t('Reference shelf', 'Handapparat'), blocks: [
          { kind: 'carousel', perPage: 4, teasers: [
            { media: { image: `${IMG}/bgb.png` }, title: t('BGB commentary, Prütting/Wegen/Weinreich, 20th ed. 2025 (Luchterhand)', 'BGB Kommentar, Prütting/Wegen/Weinreich, 20. Aufl. 2025 (Luchterhand)'), cta: watch },
            { media: { image: `${IMG}/zpo.png` }, title: t('ZPO commentary, Prütting/Gehrlein, 17th ed. 2025 (Luchterhand)', 'ZPO Kommentar, Prütting/Gehrlein, 17. Aufl. 2025 (Luchterhand)'), cta: watch },
            { media: { image: `${IMG}/anwaltformulare-arbeitsrecht.png` }, title: t('AnwaltFormulare, Heidel/Pauly (eds.), 11th ed. 2026 (Deutscher Anwaltverlag)', 'AnwaltFormulare, Heidel/Pauly (Hrsg.), 11. Aufl. 2026 (Deutscher Anwaltverlag)'), cta: watch },
            { media: { image: `${IMG}/schmerzensgeld.png` }, title: t('Pain and suffering awards, Hacks/Wellner/Häcker 2026 (Deutscher Anwaltverlag)', 'SchmerzensgeldBeträge Hacks/Wellner/Häcker 2026 (Deutscher Anwaltverlag)'), cta: watch },
            { media: { book: 'HGB', color: RED }, title: t('HGB commentary, Oetker, 8th ed. 2025 (C.H. Beck)', 'HGB Kommentar, Oetker, 8. Aufl. 2025 (C.H. Beck)'), cta: watch },
            { media: { book: 'StPO', color: DARK }, title: t('StPO commentary, 2026 (Luchterhand)', 'StPO Kommentar, 2026 (Luchterhand)'), cta: watch },
            { media: { book: 'Fami-lienrecht', color: '#2b4c9b' }, title: t('Family law forms, 7th ed. 2026 (Deutscher Anwaltverlag)', 'Formularbuch Familienrecht, 7. Aufl. 2026 (Deutscher Anwaltverlag)'), cta: watch },
            { media: { book: 'RVG', color: '#e8622a' }, title: t('RVG fee commentary, 2026 (Deutscher Anwaltverlag)', 'RVG Kommentar, 2026 (Deutscher Anwaltverlag)'), cta: watch },
          ] },
        ] },
      ],
      [
        { kind: 'blocks', title: t('Haufe online training', 'Haufe Onlinetraining'), subtitle: t('Live online seminars', 'Live-Online-Seminare'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/dorner.jpg`, position: 'center 20%' }, title: t('Professional confidentiality with CoPilot Law: what law firms need to know', 'Berufsrechtliche Verschwiegenheit beim CoPilot Law: Was Rechtsanwaltskanzleien wissen müssen'), text: 'Clemens Dorner', meta: t('Tuesday, 24 Nov 2026 | 10:00 am', 'Dienstag, 24.11.2026 | 10:00 Uhr'), cta: register },
            { media: { initials: 'AL' }, title: t('Drafting GTCs that hold up in court', 'AGB rechtssicher gestalten'), text: 'Dr. Andrea Lorenz', meta: t('Thursday, 3 Dec 2026 | 10:00 am', 'Donnerstag, 03.12.2026 | 10:00 Uhr'), cta: register },
          ] },
          { kind: 'note', text: t('More e-learning', 'Weitere e-Learning Angebote') },
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/mayer.jpg`, position: 'center 25%' }, title: t('EU Inc. – a new European company form', 'EU Inc. – eine neue europäische Gesellschaftsform'), text: 'Dr. iur. Barbara Mayer, Daniel Rombach', meta: t('approx. 120 min | Video', 'ca. 120 min. | Video'), cta: watch },
            { media: { initials: 'MR' }, title: t('The EU AI Act for law firms', 'Die KI-Verordnung für Kanzleien'), text: 'Martin Roth', meta: t('approx. 60 min | Video', 'ca. 60 min. | Video'), cta: watch },
          ] },
          { kind: 'more', label: t('Go to the media library', 'Zur Mediathek') },
        ] },
        { kind: 'blocks', title: t('Latest information', 'Aktuelle Informationen'), blocks: [
          { kind: 'links', links: [t('Law update', 'Recht aktuell'), t('Düsseldorf table 2026', 'Düsseldorfer Tabelle 2026'), t('New and changed documents', 'Neue und geänderte Dokumente')] },
        ] },
        { kind: 'blocks', title: 'News', blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/buerogebaeude.jpg` }, kicker: t('Frankfurt Higher Regional Court', 'OLG Frankfurt'), title: t('Not every advantage is an advantage: Frankfurt Higher Regional Court on competitive advantages in public procurement', 'Vorteil ist nicht gleich Vorteil: OLG Frankfurt zu Wettbewerbsvorteilen im Vergabeverfahren'), meta: t('18 Nov 2026', '18.11.2026'), cta: watch },
            { media: { icon: 'MuseumOutlined', tone: 'neutral' }, kicker: 'BGH', title: t('BGH on liability caps in supply contracts', 'BGH zu Haftungsbegrenzungen in Lieferverträgen'), meta: t('16 Nov 2026', '16.11.2026'), cta: watch },
          ] },
        ] },
      ],
    ],
  }
}

export const LAW_OFFICE: { en: AreaContent['office']; de: AreaContent['office'] } = { en: build('en'), de: build('de') }
