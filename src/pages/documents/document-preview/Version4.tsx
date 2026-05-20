import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { documents, type DocumentRecord } from './documents'

const { colorPalette } = constants
const PAGE_SIZE = 10

const FormatBadge = ({ format }: { format: string }) => (
  <Chip label={format} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />
)

export default function DocumentPreviewV4() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredDocs = useMemo(
    () => documents.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery],
  )
  const pagedDocs = useMemo(
    () => filteredDocs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredDocs, currentPage],
  )

  const onRowCell = (record: DocumentRecord) => ({
    onClick: () => navigate(`/my-documents/document-preview/version-4/${record._id}`),
    style: { cursor: 'pointer' },
  })

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', onCell: onRowCell },
    { title: 'Hochgeladen', dataIndex: 'uploadedAt', key: 'uploadedAt', onCell: onRowCell },
    {
      title: 'Format', dataIndex: 'format', key: 'format',
      render: (f: string) => <FormatBadge format={f} />, onCell: onRowCell,
    },
  ]

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: colorPalette.white, minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography size="heading-lg" weight="bold">Meine Dokumente</Typography>
        <SearchBar placeholder="Dokumente durchsuchen" onChange={(v) => { setSearchQuery(v); setCurrentPage(1) }} />
      </div>
      <FileUploader onUpload={(f) => console.log('Uploaded:', f)} accept={['.pdf', '.docx', '.xlsx', '.txt']}>
        <div style={{ border: '1.5px dashed #d0d0d0', borderRadius: 8, padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <Icon type={iconType.UploadOutlined} color="neutral-darken4" />
          <Typography color="neutral-darken5">Klicken Sie, um ein Dokument auszuwählen, oder ziehen Sie es hierher.</Typography>
          <Typography size="base-sm" color="neutral-darken2">PDF-, DOCX-, XLSX- und TXT-Formate, max. Größe 10 MB</Typography>
        </div>
      </FileUploader>
      <Table
        dataSource={pagedDocs} columns={columns} pagination={false}
        actions={(_row: DocumentRecord) => [
          { key: 'download', label: 'Herunterladen', props: { onClick: (r: DocumentRecord) => console.log('Download', r.name) } },
          { key: 'delete', label: 'Löschen', props: { onClick: (r: DocumentRecord) => console.log('Delete', r.name) } },
        ]}
      />
      <Pagination current={currentPage} total={filteredDocs.length} pageSize={PAGE_SIZE} onChange={setCurrentPage} />
    </div>
  )
}
