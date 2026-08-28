import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ButtonGhost,
  ButtonTertiary,
  buttonShapes,
  Chat,
  chatRoles,
  Chip,
  chipStyles,
  chipVariants,
  Collapsible,
  collapsibleVariants,
  constants,
  iconType,
  PropertyItem,
  Skeleton,
  skeletonVariants,
  Typography,
  type ChatValue,
  type CollapsibleItem,
  commentTypes,
} from '@goat-ui/goat-ui-core'
import { documents } from './documents'
import { COPILOT_GREETING, getMockAiResponse, makeChatValue, QUICK_PROMPTS } from './_aiMocks'

const { colorPalette } = constants
const TOP_BAR_BG = '#1e1f2e'
const DOCK_HEIGHT_COLLAPSED = 52
const DOCK_HEIGHT_EXPANDED = 420

export default function PreviewScreenV4() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [activeKeys, setActiveKeys] = useState<string[]>([])
  const [chatValues, setChatValues] = useState<ChatValue[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  const doc = documents.find((d) => d._id === id)
  const isExpanded = activeKeys.includes('copilot')

  useEffect(() => {
    if (!doc) return
    setIsLoading(true)
    setChatValues([makeChatValue(COPILOT_GREETING(doc.name), 'receiver')])
    const t = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(t)
  }, [id])

  if (!doc) return <Navigate to="/projects/document-preview/version-4" replace />

  const handleQuickPrompt = async (prompt: string) => {
    if (!isExpanded) setActiveKeys(['copilot'])
    const userMsg = makeChatValue(prompt, 'sender')
    setChatValues((prev) => [...prev, userMsg])
    setChatLoading(true)
    await new Promise((r) => setTimeout(r, 1400))
    setChatValues((prev) => [...prev, makeChatValue(getMockAiResponse(prompt, doc.name, doc.summary), 'receiver')])
    setChatLoading(false)
  }

  const handleChatSubmit = async (newValue: { value: { type: string; content: string } }) => {
    const userMsg: ChatValue = {
      user: { avatar: { srcPlaceholder: 'AM' }, name: 'You', role: chatRoles.SENDER },
      sentAt: 'Just now',
      value: newValue.value as { type: (typeof commentTypes)[keyof typeof commentTypes]; content: string },
    }
    setChatValues((prev) => [...prev, userMsg])
    setChatLoading(true)
    await new Promise((r) => setTimeout(r, 1400))
    const reply = getMockAiResponse(newValue.value?.content ?? '', doc.name, doc.summary)
    setChatValues((prev) => [...prev, makeChatValue(reply, 'receiver')])
    setChatLoading(false)
  }

  const dockItems: CollapsibleItem[] = [
    {
      key: 'copilot',
      header: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
          <Typography weight="bold" color="white">CoPilot</Typography>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK_PROMPTS.map(({ label, prompt }) => (
              <Chip
                key={label}
                label={label}
                chipStyle={chipStyles.ACCENT_BLUE}
                variant={chipVariants.SUBTLE}
                onClick={() => handleQuickPrompt(prompt)}
              />
            ))}
          </div>
        </div>
      ),
      children: (
        <div style={{ padding: '0 16px 16px' }}>
          <Chat
            values={chatValues}
            loading={chatLoading}
            onSubmit={handleChatSubmit as never}
            maxHeight="300px"
            pressEnterToSend
            autoscroll
          />
        </div>
      ),
    },
  ]

  const bottomPadding = isExpanded ? DOCK_HEIGHT_EXPANDED : DOCK_HEIGHT_COLLAPSED

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: TOP_BAR_BG, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <ButtonGhost mode="contrast" leftIcon={iconType.ChevronLeftOutlined} onClick={() => navigate(-1)}>Back</ButtonGhost>
        <Typography weight="bold" color="white">{doc.name}.{doc.format.toLowerCase()}</Typography>
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonTertiary mode="contrast" rightIcon={iconType.ExternalLinkOutlined} onClick={() => setActiveKeys(isExpanded ? [] : ['copilot'])}>
            {isExpanded ? 'Close CoPilot' : 'Ask CoPilot'}
          </ButtonTertiary>
          <ButtonTertiary mode="contrast" leftIcon={iconType.ThreeDotsHorOutlined} shape={buttonShapes.SQUARE} />
        </div>
      </div>

      {/* Two-column content */}
      <div style={{ flex: 1, padding: 24, paddingBottom: bottomPadding + 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Document */}
        <div style={{ flex: '0 0 60%', backgroundColor: colorPalette.white, borderRadius: 8, padding: '32px 40px', minHeight: 640 }}>
          {isLoading
            ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '60%' }} paragraph={{ rows: 14 }} />
            : <MockDocumentBody name={doc.name} summary={doc.summary} uploadedAt={doc.uploadedAt} />}
        </div>

        {/* Metadata & summary */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div style={{ backgroundColor: colorPalette.white, borderRadius: 8, padding: 24 }}>
            {isLoading
              ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 6 }} />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Typography size="base-sm" color="neutral-darken2">DOCUMENT SUMMARY</Typography>
                  <Typography color="neutral-darken5">{doc.summary}</Typography>
                </div>
              )}
          </div>
          <div style={{ backgroundColor: colorPalette.white, borderRadius: 8, padding: 24 }}>
            {isLoading
              ? <Skeleton variant={skeletonVariants.TEXT} title={false} paragraph={{ rows: 4 }} />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <PropertyItem label="DOCUMENT NAME" value={doc.name} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
                  <PropertyItem label="UPLOADED" value={doc.uploadedAt} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
                  <PropertyItem
                    label="FORMAT"
                    value={<Chip label={doc.format} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />}
                    labelProps={{ size: 'base-sm', color: 'neutral-darken2' }}
                  />
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Docked CoPilot bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}>
        <Collapsible
          items={dockItems}
          activeKey={activeKeys}
          onChange={(key) => setActiveKeys(Array.isArray(key) ? key : key ? [key] : [])}
          variant={collapsibleVariants.CONTRAST}
        />
      </div>
    </div>
  )
}

function MockDocumentBody({ name, summary, uploadedAt }: { name: string; summary: string; uploadedAt: string }) {
  const title = name.replace(/_/g, ' ').toUpperCase()
  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", lineHeight: 1.8, color: '#1a1a1a', fontSize: 14 }}>
      <div style={{ marginBottom: 24 }}>
        <strong style={{ fontSize: 15 }}>{title}</strong>
        <div style={{ color: '#888', marginTop: 4, fontSize: 13 }}>(Musterdokument / Beispielinhalt)</div>
      </div>
      <section style={{ marginBottom: 20 }}><strong>1. Ausstellende Stelle</strong><div style={{ marginTop: 8 }}>Musterbehörde GmbH<br />Abteilung Verwaltungsservice<br />Musterstraße 25, 10115 Berlin<br />Telefon: +49 30 12345678</div></section>
      <section style={{ marginBottom: 20 }}><strong>2. Referenznummer</strong><div style={{ marginTop: 8 }}>UB-2026-{String(Math.abs(name.length * 1247) % 90000 + 10000)}</div></section>
      <section style={{ marginBottom: 20 }}><strong>3. Ausstellungsdatum</strong><div style={{ marginTop: 8 }}>{uploadedAt}</div></section>
      <section style={{ marginBottom: 20 }}><strong>4. Betreffende Organisation</strong><div style={{ marginTop: 8 }}>Musterunternehmen Verwaltungsservice GmbH<br />Beispielallee 14, 80331 München<br />HRB 123456 · Steuer-ID: DE123456789</div></section>
      <section style={{ marginBottom: 20 }}><strong>5. Gegenstand des Dokuments</strong><div style={{ marginTop: 8 }}>{summary}</div></section>
      <section style={{ marginBottom: 20 }}><strong>6. Gültigkeitsdauer</strong><div style={{ marginTop: 8 }}>Dieses Dokument ist ab Ausstellungsdatum drei Monate gültig.</div></section>
      <section><strong>7. Unterschrift und Stempel</strong><div style={{ marginTop: 8 }}>_________________________<br />Max Mustermann · Sachbearbeiter<br />Musterbehörde GmbH &nbsp; [Amtlicher Stempel]</div></section>
    </div>
  )
}
