import { useMemo, useState } from 'react'
import {
  Chip,
  chipStyles,
  chipVariants,
  constants,
  FileUploader,
  Icon,
  iconType,
  Pagination,
  SearchBar,
  Table,
  Typography,
} from '@goat-ui/goat-ui-core'

const { colorPalette } = constants

type DocumentFormat = 'PDF' | 'XLSX' | 'TXT' | 'DOCX'

interface DocumentRecord {
  _id: string
  name: string
  uploadedAt: string
  format: DocumentFormat
  content: string
}

const initialDocuments: DocumentRecord[] = [
  { _id: '1', name: 'Unbedenklichkeitsbescheinigung_2024', uploadedAt: 'Heute', format: 'PDF', content: 'Hiermit wird bestätigt, dass die ABC GmbH keine steuerlichen Rückstände beim Finanzamt hat. Die Gesellschaft ist ihren Zahlungsverpflichtungen vollständig nachgekommen.' },
  { _id: '2', name: 'Bescheid_KSt_2024_Bundesfinanzamt', uploadedAt: 'Jan 21, 2026', format: 'XLSX', content: 'Körperschaftsteuerbescheid für das Veranlagungsjahr 2024. Steuerbetrag: 48.320 EUR. Vorauszahlungen wurden berücksichtigt. Nachzahlung fällig bis 30.09.2025.' },
  { _id: '3', name: 'Berechnung_Körperschaftsteuer_Vorauszahlungen_2025', uploadedAt: 'Jan 6, 2026', format: 'PDF', content: 'Vorauszahlungsberechnung für Körperschaftsteuer 2025 gemäß §37 KStG. Vierteljährliche Rate: 12.080 EUR. Fälligkeitstermine: März, Juni, September, Dezember.' },
  { _id: '4', name: 'Umsatzsteuer-Jahreserklärung_2024', uploadedAt: 'Sep 23, 2025', format: 'PDF', content: 'Umsatzsteuerjahreserklärung 2024. Gesamtumsatz: 2.340.000 EUR. Vorsteuer: 187.450 EUR. Umsatzsteuerzahllast: 256.780 EUR. Abgabefrist: 31.07.2025.' },
  { _id: '5', name: 'USt-Prüfung_Protokoll_2023', uploadedAt: 'Aug 11, 2025', format: 'TXT', content: 'Prüfungsprotokoll Umsatzsteuer-Sonderprüfung 2023. Prüfungszeitraum: 01.01.2023–31.12.2023. Beanstandungen: keine. Erstattungsbetrag: 4.200 EUR wird angewiesen.' },
  { _id: '6', name: 'Lohnsteuerbescheinigungen_2024', uploadedAt: 'Jun 8, 2025', format: 'DOCX', content: 'Elektronische Lohnsteuerbescheinigungen für alle Mitarbeiter des Jahres 2024. Bruttolohnsumme gesamt: 1.240.000 EUR. Einbehaltene Lohnsteuer: 198.600 EUR. Kirchensteuer: 12.340 EUR.' },
  { _id: '7', name: 'Bescheid_Gewerbesteuer_2024', uploadedAt: 'Jun 7, 2025', format: 'XLSX', content: 'Gewerbesteuermessbescheid 2024. Gewerbeertrag: 380.000 EUR. Steuermessbetrag: 13.300 EUR. Hebesatz Gemeinde: 420 %. Gewerbesteuer: 55.860 EUR.' },
  { _id: '8', name: 'Jahresabschluss_2024_ABC_GmbH', uploadedAt: 'Mai 28, 2025', format: 'PDF', content: 'Jahresabschluss zum 31.12.2024. Bilanzsumme: 4.200.000 EUR. Eigenkapital: 1.850.000 EUR. Jahresüberschuss: 320.000 EUR. Geprüft und testiert durch Wirtschaftsprüfer Dr. Müller.' },
  { _id: '9', name: 'Betriebsprüfungsbericht_2023', uploadedAt: 'Mär 8, 2025', format: 'PDF', content: 'Abschlussbericht Betriebsprüfung für die Jahre 2020–2022. Nachforderung Körperschaftsteuer: 23.400 EUR. Nachforderung Umsatzsteuer: 8.760 EUR. Einspruchsfrist: 4 Wochen.' },
  { _id: '10', name: 'Unbedenklichkeitsbescheinigung_2023', uploadedAt: 'Dez 8, 2024', format: 'TXT', content: 'Unbedenklichkeitsbescheinigung ausgestellt am 05.12.2023. Steuerliche Verhältnisse wurden geprüft. Keine offenen Steuerverbindlichkeiten. Gültig für Ausschreibungsverfahren.' },
  { _id: '11', name: 'Gewerbeanmeldung_2023', uploadedAt: 'Nov 15, 2024', format: 'PDF', content: 'Gewerbeanmeldung gemäß §14 GewO. Betriebsart: Unternehmensberatung und IT-Dienstleistungen. Beginn der Tätigkeit: 01.03.2023. Betriebsstätte: Musterstraße 12, 60329 Frankfurt.' },
  { _id: '12', name: 'Handelsregisterauszug_2023', uploadedAt: 'Okt 3, 2024', format: 'PDF', content: 'Aktueller Handelsregisterauszug HRB 12345. Firma: ABC GmbH. Stammkapital: 25.000 EUR. Geschäftsführer: Max Mustermann. Eingetragen am Amtsgericht Frankfurt am Main.' },
  { _id: '13', name: 'Körperschaftsteuer_2022', uploadedAt: 'Sep 12, 2024', format: 'XLSX', content: 'Körperschaftsteuererklärung 2022. Steuerpflichtiges Einkommen: 290.000 EUR. KSt-Satz 15 %: 43.500 EUR. Solidaritätszuschlag: 2.392,50 EUR. Anrechnung Kapitalertragsteuer: 4.800 EUR.' },
  { _id: '14', name: 'Umsatzsteuer_Voranmeldung_Q3_2024', uploadedAt: 'Aug 31, 2024', format: 'PDF', content: 'Umsatzsteuer-Voranmeldung 3. Quartal 2024 (Juli–September). Umsätze 19 %: 540.000 EUR. Umsatzsteuer: 102.600 EUR. Vorsteuer: 78.340 EUR. Zahllast: 24.260 EUR.' },
  { _id: '15', name: 'Lohnjournal_2024_Q1', uploadedAt: 'Jul 10, 2024', format: 'DOCX', content: 'Lohnjournal erstes Quartal 2024. Mitarbeiteranzahl: 42. Bruttolohn gesamt: 312.500 EUR. Arbeitnehmeranteil Sozialversicherung: 62.100 EUR. Nettolohnauszahlungen: 218.400 EUR.' },
  { _id: '16', name: 'Buchungsprotokoll_April_2024', uploadedAt: 'Jun 1, 2024', format: 'TXT', content: 'Buchungsprotokoll April 2024. Gesamtbuchungen: 1.847. Einnahmen: 198.340 EUR. Ausgaben: 154.210 EUR. Offene Posten zum Monatsende: 12 Debitoren, 3 Kreditoren. Saldo: positiv.' },
  { _id: '17', name: 'Inventarliste_2023', uploadedAt: 'Mai 20, 2024', format: 'XLSX', content: 'Inventarliste zum 31.12.2023. Anlagevermögen gesamt: 890.000 EUR. Abschreibungen 2023: 112.000 EUR. Buchwert Maschinen: 340.000 EUR. Fuhrpark: 3 Fahrzeuge, Restwert 78.000 EUR.' },
  { _id: '18', name: 'Reisekostenabrechnung_2024', uploadedAt: 'Apr 9, 2024', format: 'DOCX', content: 'Reisekostenabrechnung Geschäftsjahr 2024. Dienstreisen gesamt: 87. Reisekosten gesamt: 34.560 EUR. Erstattungen an Mitarbeiter: 28.900 EUR. Bewirtungskosten: 5.660 EUR.' },
  { _id: '19', name: 'Bilanzbericht_2023', uploadedAt: 'Mär 22, 2024', format: 'PDF', content: 'Bilanzbericht zum 31.12.2023. Aktivseite: Anlagevermögen 890.000 EUR, Umlaufvermögen 1.240.000 EUR. Passivseite: Eigenkapital 1.560.000 EUR, Verbindlichkeiten 570.000 EUR.' },
  { _id: '20', name: 'Steuerprüfung_Protokoll_2022', uploadedAt: 'Feb 14, 2024', format: 'PDF', content: 'Protokoll der steuerlichen Außenprüfung 2022. Prüfer: Finanzamt Frankfurt, Sachgebiet IV. Keine wesentlichen Beanstandungen. Kleinere Korrekturen bei Bewirtungsbelegen anerkannt.' },
  { _id: '21', name: 'USt_Jahreserklärung_2022', uploadedAt: 'Jan 28, 2024', format: 'PDF', content: 'Umsatzsteuerjahreserklärung 2022. Steuerpflichtige Umsätze: 1.980.000 EUR. Vorsteuerabzug: 156.800 EUR. Erstattungsanspruch gegenüber Finanzamt: 12.300 EUR.' },
  { _id: '22', name: 'Gewerbesteuer_Bescheid_2022', uploadedAt: 'Dez 5, 2023', format: 'PDF', content: 'Gewerbesteuerbescheid 2022. Gewerbeertrag nach Hinzurechnungen und Kürzungen: 310.000 EUR. Gewerbesteuer: 45.570 EUR. Anrechnung auf Einkommensteuer: 35.175 EUR.' },
  { _id: '23', name: 'Lohnsteuerbescheinigungen_2023', uploadedAt: 'Nov 17, 2023', format: 'DOCX', content: 'Lohnsteuerbescheinigungen Kalenderjahr 2023. Anzahl Arbeitnehmer: 39. Gesamtbrutto: 1.140.000 EUR. Einbehaltene Lohnsteuer: 182.400 EUR. Übermittlung an Finanzbehörden erfolgt.' },
  { _id: '24', name: 'Kassenbuch_Oktober_2023', uploadedAt: 'Okt 31, 2023', format: 'XLSX', content: 'Kassenbuch Oktober 2023. Anfangsbestand: 2.340 EUR. Einnahmen: 18.760 EUR. Ausgaben: 17.890 EUR. Endbestand: 3.210 EUR. Kassensturz durchgeführt, Differenz: 0,00 EUR.' },
  { _id: '25', name: 'Jahresabschluss_2022_ABC_GmbH', uploadedAt: 'Sep 2, 2023', format: 'PDF', content: 'Jahresabschluss zum 31.12.2022. Bilanzsumme: 3.870.000 EUR. Eigenkapital: 1.530.000 EUR. Jahresüberschuss: 270.000 EUR. Gewinnvortrag aus Vorjahr: 180.000 EUR.' },
  { _id: '26', name: 'Handelsregister_Änderung_2023', uploadedAt: 'Aug 19, 2023', format: 'PDF', content: 'Eintragung einer Änderung im Handelsregister. Neuer Geschäftsführer: Erika Musterfrau ab 01.08.2023. Max Mustermann verbleibt als weiterer Geschäftsführer. HRB 12345 Frankfurt.' },
  { _id: '27', name: 'Betriebsprüfung_Bericht_2021', uploadedAt: 'Jul 6, 2023', format: 'PDF', content: 'Betriebsprüfungsbericht für das Jahr 2021. Schwerpunkte: Verrechnungspreise, Betriebsausgaben. Mehrwertsteuer-Nachforderung: 6.450 EUR. Zinsen: 387 EUR. Einspruch eingelegt.' },
  { _id: '28', name: 'Umsatzsteuer_Voranmeldung_Q1_2023', uploadedAt: 'Jun 15, 2023', format: 'PDF', content: 'Umsatzsteuer-Voranmeldung 1. Quartal 2023. Umsätze steuerfrei: 45.000 EUR. Umsätze 19 %: 420.000 EUR. Umsatzsteuer: 79.800 EUR. Vorsteuer: 61.200 EUR. Zahllast: 18.600 EUR.' },
  { _id: '29', name: 'Personalakte_Musterfrau_2023', uploadedAt: 'Mai 3, 2023', format: 'DOCX', content: 'Personalakte Erika Musterfrau. Einstellungsdatum: 01.09.2018. Position: Leiterin Rechnungswesen. Bruttogehalt: 72.000 EUR/Jahr. Sozialversicherungsnummer: 65 230987 E 003.' },
  { _id: '30', name: 'Kontoauszug_Analyse_2022', uploadedAt: 'Apr 11, 2023', format: 'TXT', content: 'Analyse der Kontoauszüge Geschäftsjahr 2022. Konto: DE89 3704 0044 0532 0130 00. Gesamteingänge: 2.140.000 EUR. Gesamtausgänge: 1.860.000 EUR. Auffälligkeiten: keine.' },
]

const PAGE_SIZE = 10

function getExcerpt(content: string, query: string): string {
  const lower = content.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return ''
  const start = Math.max(0, idx - 45)
  const end = Math.min(content.length, idx + query.length + 45)
  return (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '')
}

function highlightMatch(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ backgroundColor: '#FFF8C5', padding: '0 1px', borderRadius: 2 }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

const FormatBadge = ({ format }: { format: string }) => (
  <Chip
    label={format}
    chipStyle={chipStyles.ACCENT_NEUTRAL}
    variant={chipVariants.SUBTLE}
  />
)

export default function DocumentsV2() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredDocs = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return initialDocuments
    return initialDocuments.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q),
    )
  }, [searchQuery])

  const pagedDocs = useMemo(
    () => filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredDocs, currentPage],
  )

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row: DocumentRecord) => {
        const q = searchQuery.trim()
        const nameMatches = q && name.toLowerCase().includes(q.toLowerCase())
        const contentMatches = q && !nameMatches && row.content.toLowerCase().includes(q.toLowerCase())
        const excerpt = contentMatches ? getExcerpt(row.content, q) : ''
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span>{nameMatches ? highlightMatch(name, q) : name}</span>
            {excerpt && (
              <Typography size="base-sm" color="neutral-darken2">
                {highlightMatch(excerpt, q)}
              </Typography>
            )}
          </div>
        )
      },
    },
    {
      title: 'Hochgeladen',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
    },
    {
      title: 'Format',
      dataIndex: 'format',
      key: 'format',
      render: (format: string) => <FormatBadge format={format} />,
    },
  ]

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: colorPalette.white, minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography size="heading-lg" weight="bold">
          Meine Dokumente
        </Typography>
        <SearchBar placeholder="Name oder Inhalt durchsuchen" onChange={handleSearch} />
      </div>

      <div className="file-uploader-full-width">
        <FileUploader
          onUpload={(file) => console.log('Uploaded:', file)}
          accept={['.pdf', '.docx', '.xlsx', '.txt']}
        >
          <div
            className="upload-zone"
            style={{
              border: '1.5px dashed #d0d0d0',
              borderRadius: 8,
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Icon type={iconType.UploadOutlined} color="neutral-darken4" />
            <Typography color="neutral-darken5">
              Klicken Sie, um ein Dokument auszuwählen, oder ziehen Sie es hierher.
            </Typography>
            <Typography size="base-sm" color="neutral-darken2">
              PDF-, DOCX-, XLSX- und TXT-Formate, max. Größe 10 MB
            </Typography>
          </div>
        </FileUploader>
      </div>

      <Table
        dataSource={pagedDocs}
        columns={columns}
        pagination={false}
        actions={(_row: DocumentRecord) => [
          {
            key: 'download',
            label: 'Herunterladen',
            props: { onClick: (r: DocumentRecord) => console.log('Download', r.name) },
          },
          {
            key: 'delete',
            label: 'Löschen',
            props: { onClick: (r: DocumentRecord) => console.log('Delete', r.name) },
          },
        ]}
      />

      <Pagination
        current={currentPage}
        total={filteredDocs.length}
        pageSize={PAGE_SIZE}
        onChange={(page) => setCurrentPage(page)}
      />
    </div>
  )
}
