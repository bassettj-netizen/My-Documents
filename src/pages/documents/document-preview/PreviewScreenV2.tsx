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
  commentTypes,
  constants,
  iconType,
  PropertyItem,
  Skeleton,
  skeletonVariants,
  Tabs,
  type ChatValue,
  Typography,
} from '@goat-ui/goat-ui-core'
import { documents } from './documents'
import { COPILOT_GREETING, getMockAiResponse, makeChatValue, QUICK_PROMPTS } from './_aiMocks'

const { colorPalette } = constants
const TOP_BAR_BG = '#1e1f2e'

const MOCK_CITATIONS = [
  'Körperschaftsteuergesetz (KStG) § 8 Abs. 1',
  'Abgabenordnung (AO) § 233a — Verzinsung',
  'Umsatzsteuergesetz (UStG) § 15 — Vorsteuerabzug',
  'Bundessteuerblatt II 2024, Seite 412',
  'BFH-Urteil I R 12/21 vom 15.03.2023',
]

const KEY_FINDINGS = ['Steuerkonformität', 'Keine Rückstände', 'Fristgerecht', 'Geprüft']

export default function PreviewScreenV2() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('summary')
  const [chatValues, setChatValues] = useState<ChatValue[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  const doc = documents.find((d) => d._id === id)

  useEffect(() => {
    if (!doc) return
    setIsLoading(true)
    setChatValues([makeChatValue(COPILOT_GREETING(doc.name), 'receiver')])
    const t = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(t)
  }, [id])

  if (!doc) return <Navigate to="/my-documents/document-preview/version-2" replace />

  const handleQuickPrompt = async (prompt: string) => {
    setActiveTab('ask')
    const userMsg = makeChatValue(prompt, 'sender')
    setChatValues((prev) => [...prev, userMsg])
    setChatLoading(true)
    await new Promise((r) => setTimeout(r, 1400))
    setChatValues((prev) => [...prev, makeChatValue(getMockAiResponse(prompt, doc.name, doc.summary), 'receiver')])
    setChatLoading(false)
  }

  const handleChatSubmit = async (newValue: { value: { type: string; content: string } }) => {
    const userMsg: ChatValue = {
      ...newValue,
      user: { avatar: { srcPlaceholder: 'AM' }, name: 'You', role: chatRoles.SENDER },
      sentAt: 'Just now',
    }
    setChatValues((prev) => [...prev, userMsg])
    setChatLoading(true)
    await new Promise((r) => setTimeout(r, 1400))
    const reply = getMockAiResponse(newValue.value?.content ?? '', doc.name, doc.summary)
    setChatValues((prev) => [...prev, makeChatValue(reply, 'receiver')])
    setChatLoading(false)
  }

  const tabs = [
    {
      key: 'summary',
      label: 'Summary',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '20px 0' }}>
          {isLoading ? (
            <Skeleton variant={skeletonVariants.TEXT} title={{ width: '50%' }} paragraph={{ rows: 5 }} />
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Typography size="base-sm" color="neutral-darken2">AI SUMMARY</Typography>
                <Typography color="neutral-darken5">{doc.summary}</Typography>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Typography size="base-sm" color="neutral-darken2">KEY FINDINGS</Typography>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {KEY_FINDINGS.map((f) => (
                    <Chip key={f} label={f} chipStyle={chipStyles.SEMANTIC_SUCCESS} variant={chipVariants.SUBTLE} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Typography size="base-sm" color="neutral-darken2">QUICK ACTIONS</Typography>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {QUICK_PROMPTS.map(({ label, prompt }) => (
                    <Chip
                      key={label} label={label}
                      chipStyle={chipStyles.ACCENT_BLUE} variant={chipVariants.SUBTLE}
                      onClick={() => handleQuickPrompt(prompt)}
                    />
                  ))}
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <PropertyItem label="DOCUMENT NAME" value={doc.name} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
                <PropertyItem label="UPLOADED" value={doc.uploadedAt} labelProps={{ size: 'base-sm', color: 'neutral-darken2' }} />
                <PropertyItem
                  label="FORMAT"
                  value={<Chip label={doc.format} chipStyle={chipStyles.ACCENT_NEUTRAL} variant={chipVariants.SUBTLE} />}
                  labelProps={{ size: 'base-sm', color: 'neutral-darken2' }}
                />
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'citations',
      label: 'Citations',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 0' }}>
          {isLoading ? (
            <Skeleton variant={skeletonVariants.TEXT} title={{ width: '40%' }} paragraph={{ rows: 6 }} />
          ) : (
            <>
              <Typography size="base-sm" color="neutral-darken2">
                {MOCK_CITATIONS.length} REFERENCES IDENTIFIED
              </Typography>
              {MOCK_CITATIONS.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', borderRadius: 6, backgroundColor: '#fafafa', border: '1px solid #f0f0f0' }}>
                  <Chip label={String(i + 1)} chipStyle={chipStyles.ACCENT_BLUE} variant={chipVariants.SUBTLE} />
                  <Typography color="neutral-darken5">{c}</Typography>
                </div>
              ))}
              <ButtonTertiary leftIcon={iconType.ExternalLinkOutlined}>
                Export Citations
              </ButtonTertiary>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'ask',
      label: 'Ask CoPilot',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 0', height: '100%' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK_PROMPTS.map(({ label, prompt }) => (
              <Chip
                key={label} label={label}
                chipStyle={chipStyles.ACCENT_BLUE} variant={chipVariants.SUBTLE}
                onClick={() => handleQuickPrompt(prompt)}
              />
            ))}
          </div>
          <Chat
            values={chatValues}
            loading={chatLoading}
            onSubmit={handleChatSubmit as never}
            maxHeight="420px"
            pressEnterToSend
            autoscroll
          />
        </div>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: TOP_BAR_BG, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <ButtonGhost mode="contrast" leftIcon={iconType.ChevronLeftOutlined} onClick={() => navigate(-1)}>Back</ButtonGhost>
        <Typography weight="bold" color="white">{doc.name}.{doc.format.toLowerCase()}</Typography>
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonTertiary mode="contrast" rightIcon={iconType.ExternalLinkOutlined}>Ask CoPilot</ButtonTertiary>
          <ButtonTertiary mode="contrast" leftIcon={iconType.ThreeDotsHorOutlined} shape={buttonShapes.SQUARE} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Document */}
        <div style={{ flex: '0 0 58%', backgroundColor: colorPalette.white, borderRadius: 8, padding: '32px 40px', minHeight: 640 }}>
          {isLoading
            ? <Skeleton variant={skeletonVariants.TEXT} title={{ width: '60%' }} paragraph={{ rows: 14 }} />
            : <MockDocumentBody name={doc.name} summary={doc.summary} uploadedAt={doc.uploadedAt} />}
        </div>

        {/* AI Workspace */}
        <div style={{ flex: 1, backgroundColor: colorPalette.white, borderRadius: 8, padding: '0 20px 20px', minWidth: 0, minHeight: 640 }}>
          <Tabs options={tabs} activeKey={activeTab} onChange={setActiveTab} />
        </div>
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
