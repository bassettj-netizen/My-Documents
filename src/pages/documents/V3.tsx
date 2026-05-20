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
}

const initialDocuments: DocumentRecord[] = [
  { _id: '1', name: 'Unbedenklichkeitsbescheinigung_2024', uploadedAt: 'Heute', format: 'PDF' },
  { _id: '2', name: 'Bescheid_KSt_2024_Bundesfinanzamt', uploadedAt: 'Jan 21, 2026', format: 'XLSX' },
  { _id: '3', name: 'Berechnung_Körperschaftsteuer_Vorauszahlungen_2025', uploadedAt: 'Jan 6, 2026', format: 'PDF' },
  { _id: '4', name: 'Umsatzsteuer-Jahreserklärung_2024', uploadedAt: 'Sep 23, 2025', format: 'PDF' },
  { _id: '5', name: 'USt-Prüfung_Protokoll_2023', uploadedAt: 'Aug 11, 2025', format: 'TXT' },
  { _id: '6', name: 'Lohnsteuerbescheinigungen_2024', uploadedAt: 'Jun 8, 2025', format: 'DOCX' },
  { _id: '7', name: 'Bescheid_Gewerbesteuer_2024', uploadedAt: 'Jun 7, 2025', format: 'XLSX' },
  { _id: '8', name: 'Jahresabschluss_2024_ABC_GmbH', uploadedAt: 'Mai 28, 2025', format: 'PDF' },
  { _id: '9', name: 'Betriebsprüfungsbericht_2023', uploadedAt: 'Mär 8, 2025', format: 'PDF' },
  { _id: '10', name: 'Unbedenklichkeitsbescheinigung_2023', uploadedAt: 'Dez 8, 2024', format: 'TXT' },
  { _id: '11', name: 'Gewerbeanmeldung_2023', uploadedAt: 'Nov 15, 2024', format: 'PDF' },
  { _id: '12', name: 'Handelsregisterauszug_2023', uploadedAt: 'Okt 3, 2024', format: 'PDF' },
  { _id: '13', name: 'Körperschaftsteuer_2022', uploadedAt: 'Sep 12, 2024', format: 'XLSX' },
  { _id: '14', name: 'Umsatzsteuer_Voranmeldung_Q3_2024', uploadedAt: 'Aug 31, 2024', format: 'PDF' },
  { _id: '15', name: 'Lohnjournal_2024_Q1', uploadedAt: 'Jul 10, 2024', format: 'DOCX' },
  { _id: '16', name: 'Buchungsprotokoll_April_2024', uploadedAt: 'Jun 1, 2024', format: 'TXT' },
  { _id: '17', name: 'Inventarliste_2023', uploadedAt: 'Mai 20, 2024', format: 'XLSX' },
  { _id: '18', name: 'Reisekostenabrechnung_2024', uploadedAt: 'Apr 9, 2024', format: 'DOCX' },
  { _id: '19', name: 'Bilanzbericht_2023', uploadedAt: 'Mär 22, 2024', format: 'PDF' },
  { _id: '20', name: 'Steuerprüfung_Protokoll_2022', uploadedAt: 'Feb 14, 2024', format: 'PDF' },
  { _id: '21', name: 'USt_Jahreserklärung_2022', uploadedAt: 'Jan 28, 2024', format: 'PDF' },
  { _id: '22', name: 'Gewerbesteuer_Bescheid_2022', uploadedAt: 'Dez 5, 2023', format: 'PDF' },
  { _id: '23', name: 'Lohnsteuerbescheinigungen_2023', uploadedAt: 'Nov 17, 2023', format: 'DOCX' },
  { _id: '24', name: 'Kassenbuch_Oktober_2023', uploadedAt: 'Okt 31, 2023', format: 'XLSX' },
  { _id: '25', name: 'Jahresabschluss_2022_ABC_GmbH', uploadedAt: 'Sep 2, 2023', format: 'PDF' },
  { _id: '26', name: 'Handelsregister_Änderung_2023', uploadedAt: 'Aug 19, 2023', format: 'PDF' },
  { _id: '27', name: 'Betriebsprüfung_Bericht_2021', uploadedAt: 'Jul 6, 2023', format: 'PDF' },
  { _id: '28', name: 'Umsatzsteuer_Voranmeldung_Q1_2023', uploadedAt: 'Jun 15, 2023', format: 'PDF' },
  { _id: '29', name: 'Personalakte_Musterfrau_2023', uploadedAt: 'Mai 3, 2023', format: 'DOCX' },
  { _id: '30', name: 'Kontoauszug_Analyse_2022', uploadedAt: 'Apr 11, 2023', format: 'TXT' },
]

const PAGE_SIZE = 10

const FormatBadge = ({ format }: { format: string }) => (
  <Chip
    label={format}
    chipStyle={chipStyles.ACCENT_NEUTRAL}
    variant={chipVariants.SUBTLE}
  />
)

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
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

export default function DocumentsV3() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredDocs = useMemo(
    () =>
      initialDocuments.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery],
  )

  const pagedDocs = useMemo(
    () => filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredDocs, currentPage],
  )

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: colorPalette.white, minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography size="heading-lg" weight="bold">
          Meine Dokumente
        </Typography>
        <SearchBar placeholder="Dokumente durchsuchen" onChange={handleSearch} />
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
