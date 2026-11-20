import type { AreaContent } from '../types'

/** The Steuer Office product screen's pictures (copied from screenshots/). */
const IMG = '/user-testing-nov-26/tax'

/** The Haufe Steuer Office Premium start page (screenshots/Screenshot 2026-11-20 at 08.03.42.png), in English and German. */
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
      { label: t('Current topics in focus', 'Aktuelle Themen im Fokus'), icon: 'NoteOutlined' },
      { label: t('Lexicon & articles', 'Lexikon & Fachbeiträge'), icon: 'ArticleOutlined' },
      { label: t('Topic pages', 'Themenseiten'), icon: 'TreeDiagramOutlined' },
      { label: t('Commentaries', 'Kommentare'), icon: 'OpenBookOutlined' },
      { label: t('Handbooks', 'Handbücher'), icon: 'OpenBookOutlined' },
      { label: t('Journals', 'Fachmagazine'), icon: 'NoteOutlined' },
      { label: t('Work aids & tools', 'Arbeitshilfen & Tools'), icon: 'ClipboardOutlined' },
      { label: t('Legal sources', 'Rechtsquellen'), icon: 'HashtagOutlined' },
      { label: t('Case law', 'Rechtsprechung'), icon: 'MuseumOutlined' },
      { label: t('Administrative regulations', 'Verwaltungsvorschriften'), icon: 'FolderOutlined' },
      { label: t('Online training', 'Onlinetraining'), icon: 'VideoOutlined' },
    ],
    columns: [
      [
        { kind: 'blocks', title: t('Today’s news', 'Tagesaktuelle News'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/flaggen.jpg`, position: '60% center' }, kicker: t('BMF draft bill', 'BMF Referentenentwurf'), title: t('Amending the BEPS MLI Implementation Act', 'Anpassung des BEPS-MLI-Anwendungsgesetzes'), meta: t('20 Nov 2026', '20.11.2026'), cta: watch },
            { media: { icon: 'MuseumOutlined', tone: 'neutral' }, kicker: t('BFH ruling', 'BFH-Urteil'), title: t('Home office allowance: no deduction for a work corner', 'Homeoffice-Pauschale: Kein Abzug für die Arbeitsecke'), meta: t('19 Nov 2026', '19.11.2026'), cta: watch },
            { media: { icon: 'ArticleOutlined', tone: 'neutral' }, kicker: t('BMF letter', 'BMF-Schreiben'), title: t('E-invoicing: final version of the application letter', 'E-Rechnung: Endfassung des Anwendungsschreibens'), meta: t('18 Nov 2026', '18.11.2026'), cta: watch },
          ] },
          { kind: 'links', links: [t('All news', 'Zu allen News')] },
        ] },
        { kind: 'blocks', title: t('Current topics in focus', 'Aktuelle Themen im Fokus'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/reichstag.jpg`, position: '45% center' }, title: t('Income Tax Reform Act 2027', 'Einkommensteuerreformgesetz 2027'), cta: watch },
            { media: { icon: 'CalendarCheckOutlined' }, title: t('Year end 2026/2027: what tax advisers need to do now', 'Jahreswechsel 2026/2027: Was Steuerberater jetzt tun müssen'), cta: watch },
            { media: { icon: 'ClipboardOutlined' }, title: t('Property tax: objections to the new assessments', 'Grundsteuer: Einsprüche gegen die neuen Bescheide'), cta: watch },
          ] },
          { kind: 'links', links: [t('Our social media channels for tax advisers', 'Zu unseren Social Media-Kanälen für die Steuerberatung')] },
        ] },
      ],
      [
        { kind: 'blocks', title: t('CoPilot Tax – your personal AI assistant', 'CoPilot Tax – Ihr persönlicher KI-Assistent'), blocks: [
          { kind: 'copilot', image: `${IMG}/copilot.png`, text: t('Just ask your questions. Its answers are based on the extensive expertise of Haufe Steuer Office.', 'Stellen Sie einfach Ihre Fragen. Seine Antworten basieren auf dem umfangreichen Fachwissen des Haufe Steuer Office.'), cta: t('Chat now', 'Jetzt chatten') },
          { kind: 'links', links: [
            t('How to use your AI assistant effectively every day', 'Wie Sie Ihren KI-Assistenten effektiv im Alltag einsetzen'),
            t('Go to the FAQs', 'Zu den FAQs'),
            t('Using CoPilot Tax on mobile and by voice', 'CoPilot Tax mobile & sprachgesteuert nutzen'),
          ] },
        ] },
        { kind: 'blocks', title: t('Your key content', 'Ihre zentralen Inhalte'), blocks: [
          { kind: 'links', links: [
            t('Lexicon & articles', 'Lexikon & Fachbeiträge'),
            t('Topic pages', 'Themenseiten'),
            t('Commentaries', 'Kommentare'),
            t('Handbooks', 'Handbücher'),
            t('Journals', 'Fachmagazine'),
            t('Work aids & tools', 'Arbeitshilfen & Tools'),
            t('Legal sources, case law, administrative regulations', 'Rechtsquellen, Rechtsprechung, Verwaltungsvorschriften'),
            t('New and changed documents from the last 6 weeks', 'Neue und geänderte Dokumente der letzten 6 Wochen'),
          ] },
        ] },
        { kind: 'blocks', title: t('Most popular content', 'Besonders beliebte Inhalte'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/vga.jpg`, plain: true }, title: 'vGA Navigator', text: t('Setting managing directors’ salaries that stand up to a tax audit', 'Gestaltung prüfungssicherer Geschäftsführer-Gehälter'), cta: watch },
            { media: { icon: 'CalculatorOutlined', tone: 'dark' }, title: t('Tax calculators', 'Steuerrechner'), text: t('Income tax, trade tax and more at a glance', 'Einkommensteuer, Gewerbesteuer und mehr auf einen Blick'), cta: watch },
          ] },
        ] },
      ],
      [
        { kind: 'blocks', title: t('Haufe online training', 'Haufe Onlinetraining'), subtitle: t('Live online seminars', 'Live-Online-Seminare'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/fey.jpg`, position: 'center 20%' }, title: t('Sampling was yesterday: checking bookkeeping for errors and anomalies automatically', 'Stichprobe war gestern: Buchhaltungen automatisch auf Fehler und Auffälligkeiten prüfen'), text: 'Florian Fey', meta: t('Tuesday, 8 Dec 2026 | 10:00 am', 'Dienstag, 08.12.2026 | 10:00 Uhr'), cta: register },
            { media: { initials: 'AK' }, title: t('Annual Tax Act 2026: the changes for your clients', 'Jahressteuergesetz 2026: Die Änderungen für Ihre Mandanten'), text: 'Dr. Anja Küntscher', meta: t('Thursday, 10 Dec 2026 | 2:00 pm', 'Donnerstag, 10.12.2026 | 14:00 Uhr'), cta: register },
          ] },
          { kind: 'note', text: t('More e-learning', 'Weitere e-Learning Angebote') },
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/steinbrecher.jpg`, position: 'center 20%' }, title: t('Haufe SteuerBriefing: creating digital information for clients step by step (product training)', 'Haufe SteuerBriefing: Schritt für Schritt digitale Informationen für Mandanten erstellen (Produktschulung)'), text: 'Nora Steinbrecher, Nicola Trayer, Florian D. Weber', meta: t('approx. 60 min | Video', 'ca. 60 min. | Video'), cta: watch },
            { media: { play: true }, title: t('Tax audits: preparing clients properly', 'Betriebsprüfung: Mandanten richtig vorbereiten'), text: 'Robert Radloff', meta: t('approx. 45 min | Video', 'ca. 45 min. | Video'), cta: watch },
          ] },
          { kind: 'more', label: t('Go to the media library', 'Zur Mediathek') },
        ] },
        { kind: 'blocks', title: 'Podcasts', blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/verhoert.jpg` }, title: t('Verhör(t): Whodunnit?', 'Verhör(t): Wer wars?'), text: 'Florian D. Weber + Robert Radloff', cta: watch },
            { media: { image: `${IMG}/verhoert.jpg` }, title: t('Verhör(t): The case of the missing receipts', 'Verhör(t): Der Fall der fehlenden Belege'), text: 'Florian D. Weber + Robert Radloff', cta: watch },
          ] },
          { kind: 'links', links: [t('All Verhör(t) episodes', 'Zu allen Verhör(t) Episoden')] },
        ] },
      ],
    ],
  }
}

export const TAX_OFFICE: { en: AreaContent['office']; de: AreaContent['office'] } = { en: build('en'), de: build('de') }
