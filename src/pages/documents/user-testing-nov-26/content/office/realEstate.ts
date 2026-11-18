import type { AreaContent } from '../types'

/** The VerwalterPraxis product screen's pictures (copied from screenshots/). */
const IMG = '/user-testing-nov-26/real-estate'

/**
 * The Haufe VerwalterPraxis Gold start page (screenshots/Screenshot 2026-11-18 at 08.40.16.png), in English and German.
 */
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
      { label: t('Lexicon', 'Lexikon'), icon: 'OpenBookOutlined' },
      { label: t('Handbooks', 'Handbücher'), icon: 'OpenBookOutlined' },
      { label: t('Commentary', 'Kommentar'), icon: 'OpenBookOutlined' },
      { label: t('Work aids', 'Arbeitshilfen'), icon: 'ClipboardOutlined' },
      { label: t('Case law report', 'Rechtsprechungs-Report'), icon: 'HashtagOutlined' },
      { label: 'Newsletter', icon: 'EmailOutlined' },
      { label: t('Calculators', 'Rechner'), icon: 'CalculatorOutlined' },
      { label: t('Legal sources', 'Rechtsquellen'), icon: 'HashtagOutlined' },
      { label: t('Decisions database', 'Entscheidungsdatenbank'), icon: 'MuseumOutlined' },
      { label: t('Online training', 'Onlinetraining'), icon: 'VideoOutlined' },
    ],
    columns: [
      [
        { kind: 'blocks', title: t('News ticker', 'News-Ticker'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/wohnungslosigkeit.jpg`, position: '45% center' }, kicker: t('A tenancy as a fresh start', 'Mietvertrag als Neustart'), title: t('How housing companies are tackling homelessness', 'Wie Wohnungsunternehmen Wohnungslosigkeit bekämpfen'), meta: t('18 Nov 2026', '18.11.2026'), cta: watch },
            { media: { icon: 'ArticleOutlined', tone: 'neutral' }, kicker: t('Rent index', 'Mietspiegel'), title: t('New qualified rent indices: what property managers need to know', 'Neue qualifizierte Mietspiegel: Was Verwalter wissen müssen'), meta: t('17 Nov 2026', '17.11.2026'), cta: watch },
          ] },
          { kind: 'links', links: [t('All news', 'Zu allen News')] },
        ] },
        { kind: 'blocks', title: t('In focus', 'Im Fokus'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/hausgeld.jpg`, position: '60% center' }, title: t('A unit owner doesn’t pay the service charge: who pays instead?', 'Wohnungseigentümer zahlt kein Hausgeld: Wer zahlt denn dann?'), cta: watch },
            { media: { image: `${IMG}/paragraf.jpg`, plain: true }, title: t('Owners’ meeting: valid resolutions in hybrid meetings', 'Eigentümerversammlung: Wirksame Beschlüsse in hybriden Versammlungen'), cta: watch },
          ] },
          { kind: 'more', label: t('Full overview', 'Zur Gesamtübersicht') },
        ] },
        { kind: 'blocks', title: t('New and changed documents', 'Neue und geänderte Dokumente'), blocks: [
          { kind: 'links', links: [t('Go to the documents', 'Zu den Dokumenten')] },
        ] },
        { kind: 'blocks', title: t('Leading people in property management', 'Personalführung in der Immobilienverwaltung'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/personalfuehrung.jpg`, position: '55% center' }, title: t('The most important tools', 'Die wichtigsten Tools'), cta: watch },
          ] },
        ] },
      ],
      [
        { kind: 'blocks', title: t('CoPilot RE – your AI assistant for property management', 'CoPilot RE – Ihr KI-Assistent für die Immobilienverwaltung'), blocks: [
          { kind: 'copilot', image: `${IMG}/copilot.png`, text: t('Just ask your questions. Its answers are based on the extensive expertise of Haufe VerwalterPraxis Gold.', 'Stellen Sie einfach Ihre Fragen. Seine Antworten basieren auf dem umfangreichen Fachwissen des Haufe VerwalterPraxis Gold.'), cta: t('Chat now!', 'Jetzt chatten!') },
          { kind: 'links', links: [t('More information', 'Weitere Informationen')] },
        ] },
        { kind: 'blocks', title: t('AI tips for property management', 'KI-Tipps für die Immobilienverwaltung'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/transparenzpflicht.jpg` }, title: t('Transparency obligations under the AI Act', 'Transparenzpflichten nach der KI-Verordnung'), cta: watch },
            { media: { icon: 'SparksOutlined' }, title: t('Writing owner letters with AI', 'Eigentümerschreiben mit KI formulieren'), cta: watch },
          ] },
        ] },
        { kind: 'blocks', title: t('Infographics', 'Infografiken'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/tkg-bildschirm.jpg`, plain: true }, title: t('TKG amendment and fibre roll-out', 'TKG-Novelle und Glasfaserausbau'), cta: watch },
            { media: { image: `${IMG}/jahreswechsel.jpg` }, title: t('Year-end infographic 2025/2026', 'Jahreswechsel-Infografik 2025/2026'), cta: watch },
          ] },
        ] },
      ],
      [
        { kind: 'blocks', title: t('Building Modernisation Act (GModG)', 'Gebäudemodernisierungsgesetz (GModG)'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/gmodg-fassade.jpg` }, title: t('GModG 2026 – building modernisation in practice: law, technology and funding', 'GModG 2026 – Gebäudemodernisierung in der Praxis: Recht, Technik und Förderung'), cta: watch },
            { media: { image: `${IMG}/gmodg.jpg` }, title: t('GModG: what changes for energy certificates', 'GModG: Was sich beim Energieausweis ändert'), cta: watch },
          ] },
        ] },
        { kind: 'blocks', title: t('Haufe online training', 'Haufe-Onlinetraining'), blocks: [
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/hannemann.jpg`, position: 'center 30%' }, title: t('Tenancy law reform – what’s coming for property managers? You ask, lawyer Hannemann answers', 'Mietrechtsreform – was kommt auf Verwalter zu? – Sie fragen, RA Hannemann antwortet'), text: 'Thomas Hannemann', meta: t('Wednesday, 25 Nov 2026 | 3:00 pm', 'Mittwoch, 25.11.2026 | 15:00 Uhr'), cta: register },
            { media: { image: `${IMG}/bolik.jpg`, position: 'center 20%' }, title: t('Tax changes 2026/27 – your personal tax check-up, part 1', 'Steueränderungen 2026/27 – Ihr persönlicher Steuer Check-up Teil 1'), text: 'Dr. Andreas Bolik, Dr. Anja Küntscher', meta: t('Wednesday, 2 Dec 2026 | 3:00 pm', 'Mittwoch, 02.12.2026 | 15:00 Uhr'), cta: register },
          ] },
          { kind: 'note', text: t('More e-learning', 'Weitere e-Learning Angebote') },
          { kind: 'carousel', teasers: [
            { media: { image: `${IMG}/oberndorfer.jpg`, position: 'center 25%' }, title: t('Damage vs. normal use: how to handle deterioration of the rented property?', 'Beschädigung vs. vertragsgemäßer Gebrauch: Wie umgehen mit einer Verschlechterung der Mietsache?'), text: 'Paula Oberndorfer', meta: t('approx. 90 min | Video', 'ca. 90 min. | Video'), cta: watch },
            { media: { image: `${IMG}/rambach.jpg`, position: 'center 20%' }, title: t('Part-time work in company practice', 'Teilzeitarbeit in der betrieblichen Praxis'), text: 'Dr. Peter H. M. Rambach', meta: t('approx. 90 min | Video', 'ca. 90 min. | Video'), cta: watch },
          ] },
          { kind: 'more', label: t('Go to the media library', 'Zur Mediathek') },
        ] },
      ],
    ],
  }
}

export const REAL_ESTATE_OFFICE: { en: AreaContent['office']; de: AreaContent['office'] } = { en: build('en'), de: build('de') }
