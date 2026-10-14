import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ButtonGhost,
  ButtonPrimary,
  buttonShapes,
  buttonSizes,
  ButtonTertiary,
  Icon,
  iconType,
  Segmented,
  Typography,
} from '@goat-ui/goat-ui-core'
import { colorPalette, spacing } from '../workspaces/shared'

/**
 * Hackathon Oct '26 — Home (screenshots/Screenshot 2026-10-14 at 13.22.40.png): a greeting-led start page.
 *
 * - Large light greeting ("Guten Tag, Alex. Was möchten Sie klären?") and a line on what CoPilot HR answers from.
 * - Question box: field, then "+", a Chat / Work switch, Prompt-Vorlagen and the send button.
 * - Three suggestions under the box fill the field; the KI note sits at the bottom.
 * - Sending hands the question to the CoPilot page, which opens it as a new chat.
 */

const FIRST_NAME = 'Alex'
const SUGGESTIONS = ['Entgelttransparenz erklären', 'Kündigung rechtssicher prüfen', 'Arbeitszeugnis erstellen']
const PAGE_BACKGROUND = colorPalette.neutral.lighten5

type Mode = 'chat' | 'work'

export default function HackathonHomePage({ copilotPath }: { copilotPath: string }) {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState<Mode>('chat')
  const canSend = question.trim().length > 0
  const send = () => { if (canSend) navigate(copilotPath, { state: { initialQuestion: question.trim() } }) }

  return (
    <div style={{
      height: '100%', backgroundColor: PAGE_BACKGROUND, overflowY: 'auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: `${spacing(12)}px ${spacing(6)}px`,
    }}>
      {/* Auto margins centre the content vertically but let it scroll when the window is short. */}
      <div style={{ margin: 'auto 0', width: '100%', maxWidth: 820, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing(4) }}>
        <h1 style={{ margin: 0, maxWidth: 560, textAlign: 'center', fontSize: 56, lineHeight: 1.15, fontWeight: 300, color: '#141F29' }}>
          Guten Tag, {FIRST_NAME}. Was möchten Sie klären?
        </h1>
        <p style={{ margin: 0, maxWidth: 540, textAlign: 'center', fontSize: 18, lineHeight: 1.45, color: '#6B7A99' }}>
          CoPilot HR antwortet auf Basis des rechtssicheren Wissens aus Ihrem Personal Office Platin – mit Quellen.
        </p>

        <div style={{
          width: '100%', marginTop: spacing(8), backgroundColor: colorPalette.white, borderRadius: 16,
          border: `1px solid ${colorPalette.neutral.lighten2}`, boxShadow: '0 8px 24px rgba(0, 19, 68, 0.08)',
          padding: `${spacing(5)}px ${spacing(5)}px ${spacing(4)}px`, display: 'flex', flexDirection: 'column', gap: spacing(6),
        }}>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Stellen Sie Ihre Frage an CoPilot HR"
            rows={2}
            style={{
              border: 'none', outline: 'none', resize: 'none', padding: `0 ${spacing(1)}px`,
              fontFamily: 'inherit', fontSize: 16, lineHeight: '24px', color: colorPalette.neutral.darken5, background: 'transparent',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing(3) }}>
            <ButtonTertiary shape={buttonShapes.SQUARE} leftIcon={iconType.PlusOutlined} ariaLabel="Dokument hinzufügen" />
            <Segmented
              options={[
                { label: 'Chat', value: 'chat', icon: <Icon type={iconType.CommentOutlined} size={16} /> },
                { label: 'Work', value: 'work', icon: <Icon type={iconType.TaskOutlined} size={16} /> },
              ]}
              value={mode}
              onChange={v => setMode(v as Mode)}
            />
            <ButtonGhost>Prompt-Vorlagen</ButtonGhost>
            <div style={{ flex: 1 }} />
            <ButtonPrimary size={buttonSizes.LARGE} shape={buttonShapes.SQUARE} leftIcon={iconType.SendOutlined} onClick={send} disabled={!canSend} ariaLabel="Frage senden" />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: spacing(3), marginTop: spacing(2) }}>
          {SUGGESTIONS.map(s => (
            <ButtonTertiary key={s} onClick={() => setQuestion(s)}>{s}</ButtonTertiary>
          ))}
        </div>

        <div style={{ marginTop: spacing(2) }}>
          <Typography size="base-sm" color="neutral-darken2">Die KI kann sich irren. Prüfen Sie Antworten anhand der Quellen.</Typography>
        </div>
      </div>
    </div>
  )
}
