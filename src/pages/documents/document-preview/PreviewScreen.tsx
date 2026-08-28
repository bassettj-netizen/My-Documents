import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ButtonGhost,
  ButtonTertiary,
  buttonShapes,
  Chip,
  chipStyles,
  chipVariants,
  constants,
  iconType,
  PropertyItem,
  Skeleton,
  skeletonVariants,
  Typography,
} from '@goat-ui/goat-ui-core'
import { documents } from './documents'

const { colorPalette } = constants

const TOP_BAR_BG = '#1e1f2e'

export default function PreviewScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  const doc = documents.find((d) => d._id === id)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [id])

  if (!doc) return <Navigate to="/projects/document-preview/version-1" replace />

  const filename = `${doc.name}.${doc.format.toLowerCase()}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Sticky top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: TOP_BAR_BG,
          padding: '0 24px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <ButtonGhost
          mode="contrast"
          leftIcon={iconType.ChevronLeftOutlined}
          onClick={() => navigate(-1)}
        >
          Back
        </ButtonGhost>

        <Typography weight="bold" color="white">
          {filename}
        </Typography>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ButtonTertiary
            mode="contrast"
            rightIcon={iconType.ExternalLinkOutlined}
          >
            Ask CoPilot
          </ButtonTertiary>
          <ButtonTertiary
            mode="contrast"
            leftIcon={iconType.ThreeDotsHorOutlined}
            shape={buttonShapes.SQUARE}
          />
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          padding: 24,
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        {/* Left panel: document viewer */}
        <div
          style={{
            flex: '0 0 65%',
            backgroundColor: colorPalette.white,
            borderRadius: 8,
            padding: '32px 40px',
            minHeight: 640,
          }}
        >
          {isLoading ? (
            <Skeleton
              variant={skeletonVariants.TEXT}
              title={{ width: '60%' }}
              paragraph={{ rows: 14 }}
            />
          ) : (
            <MockDocumentBody name={doc.name} summary={doc.summary} uploadedAt={doc.uploadedAt} />
          )}
        </div>

        {/* Right panel */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minWidth: 0,
          }}
        >
          {/* Summary card */}
          <div
            style={{
              backgroundColor: colorPalette.white,
              borderRadius: 8,
              padding: 24,
            }}
          >
            {isLoading ? (
              <Skeleton
                variant={skeletonVariants.TEXT}
                title={{ width: '50%' }}
                paragraph={{ rows: 6 }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Typography size="base-sm" color="neutral-darken2">
                  DOCUMENT SUMMARY
                </Typography>
                <Typography color="neutral-darken5">
                  {doc.summary}
                </Typography>
              </div>
            )}
          </div>

          {/* Metadata card */}
          <div
            style={{
              backgroundColor: colorPalette.white,
              borderRadius: 8,
              padding: 24,
            }}
          >
            {isLoading ? (
              <Skeleton
                variant={skeletonVariants.TEXT}
                title={false}
                paragraph={{ rows: 4 }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <PropertyItem
                  label="DOCUMENT NAME"
                  value={doc.name}
                  labelProps={{ size: 'base-sm', color: 'neutral-darken2' }}
                />
                <PropertyItem
                  label="UPLOADED"
                  value={doc.uploadedAt}
                  labelProps={{ size: 'base-sm', color: 'neutral-darken2' }}
                />
                <PropertyItem
                  label="FORMAT"
                  value={
                    <Chip
                      label={doc.format}
                      chipStyle={chipStyles.ACCENT_NEUTRAL}
                      variant={chipVariants.SUBTLE}
                    />
                  }
                  labelProps={{ size: 'base-sm', color: 'neutral-darken2' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MockDocumentBody({
  name,
  summary,
  uploadedAt,
}: {
  name: string
  summary: string
  uploadedAt: string
}) {
  const title = name.replace(/_/g, ' ').toUpperCase()

  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", lineHeight: 1.8, color: '#1a1a1a', fontSize: 14 }}>
      <div style={{ marginBottom: 24 }}>
        <strong style={{ fontSize: 15 }}>{title}</strong>
        <div style={{ color: '#888', marginTop: 4, fontSize: 13 }}>(Musterdokument / Beispielinhalt)</div>
      </div>

      <section style={{ marginBottom: 20 }}>
        <strong>1. Ausstellende Stelle</strong>
        <div style={{ marginTop: 8 }}>
          Musterbehörde GmbH<br />
          Abteilung Verwaltungsservice<br />
          Musterstraße 25<br />
          10115 Berlin<br />
          Deutschland
        </div>
        <div style={{ marginTop: 12 }}>
          Telefon: +49 30 12345678<br />
          E-Mail: info@musterbehoerde.de
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <strong>2. Referenznummer</strong>
        <div style={{ marginTop: 8 }}>UB-2026-{String(Math.abs(name.length * 1247) % 90000 + 10000)}</div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <strong>3. Ausstellungsdatum</strong>
        <div style={{ marginTop: 8 }}>{uploadedAt}</div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <strong>4. Betreffende Person / Organisation</strong>
        <div style={{ marginTop: 8 }}>
          Name / Firmenbezeichnung:<br /><br />
          Musterunternehmen Verwaltungsservice GmbH<br />
          Anschrift:<br />
          Beispielallee 14<br />
          80331 München<br />
          Deutschland
        </div>
        <div style={{ marginTop: 12 }}>
          Registrierungsnummer: HRB 123456<br />
          Steuer-ID: DE123456789
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <strong>5. Gegenstand des Dokuments</strong>
        <div style={{ marginTop: 8 }}>{summary}</div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <strong>6. Gültigkeitsdauer</strong>
        <div style={{ marginTop: 8 }}>
          Dieses Dokument ist ab Ausstellungsdatum drei Monate gültig und verliert seine Gültigkeit mit Ablauf
          des angegebenen Zeitraums. Eine Verlängerung muss schriftlich beantragt werden.
        </div>
      </section>

      <section>
        <strong>7. Unterschrift und Stempel</strong>
        <div style={{ marginTop: 8 }}>
          _________________________<br />
          Max Mustermann<br />
          Sachbearbeiter, Verwaltungsservice<br />
          Musterbehörde GmbH<br /><br />
          [Amtlicher Stempel]
        </div>
      </section>
    </div>
  )
}
