import React, { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ButtonGhost,
  ButtonPrimary,
  ButtonTertiary,
  buttonShapes,
  Chip,
  chipStyles,
  chipVariants,
  type ChipStyleValue,
  constants,
  Dropdown,
  dropdownPlacement,
  dropdownTriggers,
  Icon,
  iconType,
  Input,
  PropertyItem,
  propertyItemVariants,
  Select,
  selectModeVariants,
  Skeleton,
  skeletonVariants,
  TextArea,
  Typography,
} from '@goat-ui/goat-ui-core'
import { documents, DOCUMENT_SNIPPETS, type MetadataDocument } from './documents'
import { DocumentBody } from '../bulk-edit/PreviewScreen'

const { colorPalette, spacing } = constants
const TOP_BAR_BG = '#1e1f2e'
const SUMMARY_MAX = 500

function CopilotIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.00078 10.687C6.5133 10.687 5.31067 9.48436 5.31067 7.99687C5.31067 6.50939 6.5133 5.30677 8.00078 5.30677C9.48826 5.30677 10.6909 6.50939 10.6909 7.99687C10.6909 9.48436 9.48826 10.687 8.00078 10.687ZM8.00078 6.09797C6.9564 6.09797 6.10188 6.9525 6.10188 7.99687C6.10188 9.04125 6.9564 9.89578 8.00078 9.89578C9.04516 9.89578 9.89969 9.04125 9.89969 7.99687C9.89969 6.9525 9.04516 6.09797 8.00078 6.09797ZM8.01662 15.181C6.38673 15.181 5.24739 13.9151 5.24739 12.1111C5.19991 11.0035 4.47199 10.7661 3.87067 10.7661C2.92122 10.7661 2.08254 10.4496 1.51287 9.86414C1.03814 9.37359 0.800781 8.72479 0.800781 7.99687C0.83243 5.9872 2.41485 5.24348 3.8865 5.22764C4.55111 5.22764 5.24739 4.8637 5.24739 3.88259C5.23155 2.03116 6.35505 0.796875 8.00078 0.796875C9.64651 0.796875 10.6909 1.99951 10.77 3.86677C10.8175 5.03775 11.6403 5.22764 12.1151 5.22764C13.5076 5.22764 15.1533 5.97136 15.2008 7.99687C15.2008 8.72479 14.9634 9.37359 14.4729 9.86414C13.9032 10.4338 13.0487 10.7661 12.1151 10.7661C11.5296 10.7661 10.8175 11.0035 10.7859 12.1111C10.7067 13.9784 9.63067 15.181 8.01662 15.181ZM6.02275 3.88259C6.02275 4.94282 5.37396 6.00304 3.8865 6.01885C3.20605 6.01885 1.62364 6.22458 1.59199 7.99687C1.59199 8.50326 1.75023 8.96217 2.08254 9.29447C2.49397 9.72173 3.14276 9.95906 3.87067 9.95906C5.15242 9.95906 5.97527 10.7819 6.03859 12.0637C6.03859 13.2188 6.65571 14.374 8.01662 14.374C9.3775 14.374 9.93133 13.5037 9.99461 12.0637C10.0421 10.7661 10.8649 9.95906 12.1151 9.94326C12.843 9.94326 13.4918 9.70589 13.919 9.27863C14.2513 8.93049 14.4254 8.48742 14.4096 7.98103C14.3779 6.16125 12.6373 6.00304 12.1151 6.00304C11.1182 6.00304 10.0421 5.43337 9.97881 3.88259C9.91549 2.44259 9.18761 1.57226 8.00078 1.57226C6.81396 1.57226 6.02275 2.47424 6.02275 3.86677V3.88259Z" fill="currentColor" stroke="currentColor" strokeWidth="0.2"/>
    </svg>
  )
}

type Tag = { text: string; style: string; variant?: string }

function buildTagOptions(docs: MetadataDocument[]) {
  const set = new Set<string>()
  for (const doc of docs) {
    doc.tagList?.forEach(t => set.add(t.text))
    if (doc.namedEntity !== '—') set.add(doc.namedEntity)
    if (doc.namedEntityId !== '—') set.add(doc.namedEntityId)
    if (doc.jurisdiction !== '—') set.add(doc.jurisdiction)
    if (doc.lawType !== '—') set.add(doc.lawType)
    if (doc.citations !== '—') set.add(doc.citations)
    if (doc.monetaryAmounts > 0) set.add(`${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}`)
    if (doc.monetaryTypes !== 'None') set.add(doc.monetaryTypes)
  }
  return Array.from(set).sort().map(t => ({ label: t, value: t }))
}

const tagOptions = buildTagOptions(documents)

function getDisplayTags(doc: MetadataDocument): Tag[] {
  const tags: Tag[] = []
  if (doc.tagList?.length) {
    tags.push(...doc.tagList.map(t => ({ text: t.text, style: t.style ?? chipStyles.ACCENT_NEUTRAL, variant: chipVariants.HIGHLIGHT })))
  }
  if (doc.namedEntity !== '—') tags.push({ text: doc.namedEntity, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.namedEntityId !== '—') tags.push({ text: doc.namedEntityId, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.jurisdiction !== '—') tags.push({ text: doc.jurisdiction, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.lawType !== '—') tags.push({ text: doc.lawType, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.citations !== '—') tags.push({ text: doc.citations, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.monetaryAmounts > 0) tags.push({ text: `${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}`, style: chipStyles.ACCENT_NEUTRAL })
  if (doc.monetaryTypes !== 'None') tags.push({ text: doc.monetaryTypes, style: chipStyles.ACCENT_NEUTRAL })
  return tags
}

function getInitialEditingTags(doc: MetadataDocument): string[] {
  const tags: string[] = []
  if (doc.tagList?.length) tags.push(...doc.tagList.map(t => t.text))
  if (doc.namedEntity !== '—') tags.push(doc.namedEntity)
  if (doc.namedEntityId !== '—') tags.push(doc.namedEntityId)
  if (doc.jurisdiction !== '—') tags.push(doc.jurisdiction)
  if (doc.lawType !== '—') tags.push(doc.lawType)
  if (doc.citations !== '—') tags.push(doc.citations)
  if (doc.monetaryAmounts > 0) tags.push(`${doc.monetaryAmounts.toLocaleString('de-DE')} ${doc.currency}`)
  if (doc.monetaryTypes !== 'None') tags.push(doc.monetaryTypes)
  return tags
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const PROP_LABEL = { size: 'base' as const, color: 'neutral-darken2' as const, width: '130px' }
const PROP_VALUE = { size: 'base' as const, color: 'neutral-darken5' as const }

function PropRow({ children }: { children: ReactNode }) {
  return <div style={{ padding: '6px 0' }}>{children}</div>
}

export default function MetadataPreviewV6() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [localDoc, setLocalDoc] = useState<MetadataDocument | null>(null)
  const [localSummary, setLocalSummary] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingDocumentType, setEditingDocumentType] = useState('')
  const [editingTags, setEditingTags] = useState<string[]>([])
  const [editingSummary, setEditingSummary] = useState('')

  const foundDoc = documents.find((d) => d._id === id)

  useEffect(() => {
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(t)
  }, [id])

  useEffect(() => {
    setLocalDoc(null)
    setLocalSummary(null)
    setIsEditing(false)
    setEditingDocumentType('')
    setEditingTags([])
    setEditingSummary('')
  }, [id])

  if (!foundDoc) return <Navigate to="/projects/metadata/version-6" replace />

  const displayDoc = (localDoc?._id === foundDoc._id ? localDoc : null) ?? foundDoc
  const displaySummary = localSummary ?? DOCUMENT_SNIPPETS[displayDoc._id] ?? `${displayDoc.documentType} — ${displayDoc.domain}`
  const filename = `${displayDoc.name}.${displayDoc.fileFormat.toLowerCase()}`

  const startEdit = () => {
    setEditingDocumentType(displayDoc.documentType)
    setEditingTags(getInitialEditingTags(displayDoc))
    setEditingSummary(displaySummary)
    setIsEditing(true)
  }

  const saveEdit = () => {
    setLocalDoc({
      ...displayDoc,
      documentType: editingDocumentType,
      tagList: editingTags.map(t => ({ text: t, style: chipStyles.ACCENT_NEUTRAL, variant: chipVariants.SUBTLE })),
      namedEntity: '—', namedEntityId: '—', jurisdiction: '—', lawType: '—', citations: '—',
      monetaryAmounts: 0, monetaryTypes: 'None',
    })
    setLocalSummary(editingSummary)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditingDocumentType('')
    setEditingTags([])
    setEditingSummary('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F5F9FF' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: TOP_BAR_BG, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <ButtonGhost mode="contrast" leftIcon={iconType.ChevronLeftOutlined} onClick={() => navigate(-1)}>Back</ButtonGhost>
        <Typography weight="bold" color="white">{filename}</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ButtonTertiary mode="contrast">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing(2) }}><CopilotIcon />Ask CoPilot<Icon type={iconType.ExternalLinkOutlined} size={16} /></span>
          </ButtonTertiary>
          <Dropdown
            items={[
              { key: 'download', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}><Icon type={iconType.DownloadOutlined} size={16} />Download</span>, onClick: () => console.log('Download') },
              { key: 'delete', label: <span style={{ display: 'flex', alignItems: 'center', gap: spacing(2), color: colorPalette.danger.darken2 }}><Icon type={iconType.TrashOutlined} size={16} color="danger-darken2" />Delete</span>, onClick: () => console.log('Delete') },
            ]}
            trigger={dropdownTriggers.CLICK}
            placement={dropdownPlacement.BOTTOM_RIGHT}
          >
            <ButtonTertiary mode="contrast" shape={buttonShapes.SQUARE} leftIcon={iconType.ThreeDotsHorFilled} />
          </Dropdown>
        </div>
      </div>

      <div style={{ flex: 1, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 62%', backgroundColor: colorPalette.white, borderRadius: 8, padding: '32px 40px', minHeight: 640 }}>
          {isLoading
            ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '60%' }} paragraph={{ rows: 16 }} />
            : <DocumentBody doc={displayDoc} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ backgroundColor: colorPalette.white, borderRadius: 8, padding: 24 }}>
            {isLoading ? (
              <Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 10 }} />
            ) : isEditing ? (
              <EditPanel
                displayDoc={displayDoc}
                editingDocumentType={editingDocumentType}
                setEditingDocumentType={setEditingDocumentType}
                editingTags={editingTags}
                setEditingTags={setEditingTags}
                editingSummary={editingSummary}
                setEditingSummary={setEditingSummary}
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
            ) : (
              <ViewPanel
                displayDoc={displayDoc}
                displaySummary={displaySummary}
                onEdit={startEdit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ViewPanel({ displayDoc, displaySummary, onEdit }: {
  displayDoc: MetadataDocument
  displaySummary: string
  onEdit: () => void
}) {
  const tags = getDisplayTags(displayDoc)
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">Document Details</Typography>
        <ButtonGhost shape={buttonShapes.SQUARE} leftIcon={iconType.EditOutlined} onClick={onEdit} />
      </div>
      <div style={{ marginBottom: spacing(4) }}>
        <Typography size="base" color="neutral-darken5">{displaySummary}</Typography>
      </div>
      <PropRow>
        <PropertyItem label="Name" value={displayDoc.name} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      <PropRow>
        <PropertyItem label="Type" value={displayDoc.documentType} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      <PropRow>
        <PropertyItem label="Uploaded" value={formatDate(displayDoc.uploadedDate)} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      <PropRow>
        <PropertyItem label="Format" value={displayDoc.fileFormat} variant={propertyItemVariants.HORIZONTAL} labelProps={PROP_LABEL} valueProps={PROP_VALUE} />
      </PropRow>
      {tags.length > 0 && (
        <PropRow>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ width: 130, flexShrink: 0 }}>
              <Typography size="base" color="neutral-darken2">Tags</Typography>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {tags.map((tag, i) => (
                <Chip
                  key={i}
                  label={tag.text}
                  chipStyle={tag.style as ChipStyleValue}
                  variant={(tag.variant as typeof chipVariants[keyof typeof chipVariants]) ?? chipVariants.SUBTLE}
                />
              ))}
            </div>
          </div>
        </PropRow>
      )}
    </>
  )
}

function EditPanel({
  displayDoc,
  editingDocumentType,
  setEditingDocumentType,
  editingTags,
  setEditingTags,
  editingSummary,
  setEditingSummary,
  onSave,
  onCancel,
}: {
  displayDoc: MetadataDocument
  editingDocumentType: string
  setEditingDocumentType: (v: string) => void
  editingTags: string[]
  setEditingTags: React.Dispatch<React.SetStateAction<string[]>>
  editingSummary: string
  setEditingSummary: (v: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography size="base" weight="semibold" color="neutral-darken5">Document Details</Typography>
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonTertiary onClick={onCancel}>Cancel</ButtonTertiary>
          <ButtonPrimary onClick={onSave}>Save</ButtonPrimary>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextArea
          label="Summary"
          value={editingSummary}
          maxLength={SUMMARY_MAX}
          hasCounter
          autoSize={{ minRows: 4, maxRows: 8 }}
          onChange={e => setEditingSummary(e.target.value)}
        />

        <Input
          label="Name"
          name="name"
          value={displayDoc.name}
          disabled
        />

        <Input
          label="Type"
          name="documentType"
          value={editingDocumentType}
          onChange={e => setEditingDocumentType(e.target.value)}
        />

        <Select
          label="Tags"
          name="tags"
          mode={selectModeVariants.TAGS}
          value={editingTags}
          options={tagOptions}
          onChange={vals => setEditingTags(vals as string[])}
          tagRender={props => (
            <span
              onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
              style={{ display: 'inline-flex', marginRight: 2 }}
            >
              <Chip
                label={String(props.label)}
                chipStyle={chipStyles.ACCENT_NEUTRAL}
                variant={chipVariants.HIGHLIGHT}
                closable
                onClose={() => setEditingTags(prev => prev.filter(t => t !== String(props.value)))}
              />
            </span>
          )}
        />
      </div>
    </>
  )
}
