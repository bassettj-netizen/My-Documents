import { useEffect, useRef, type ReactNode } from 'react'
import { Icon, iconType, Typography } from '@goat-ui/goat-ui-core'
import { colorPalette, spacing } from '../workspaces/shared'

/**
 * Hackathon Oct '26 — Versions 10/11: the first view of a brand-new workspace, from
 * screenshots/Workspace — Empty State 1.html. Two streams — My knowledge (pink, left) and Haufe
 * knowledge (blue, right) — flow inward and join into one network, then "Your workspace is ready"
 * with the two ways to start.
 *
 * - Ported as-is: the canvas network (nodes streaming in from each side, then linking up), the dashed
 *   connector lines and the small decorative marks, with the same timing.
 * - Changed: the six icon images (not available) are DS icons in the same places, the colours are DS
 *   pink-base and blue-darken1, the labels match the summary below ("My knowledge"), and the buttons are
 *   passed in so they're the page's own DS buttons. The faint brain image is left out (asset missing).
 * - `animate={false}` shows the finished picture without the build-up — for repeat visits — and the
 *   system's reduced-motion setting does the same.
 */

const W = 480
const H = 340
const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
const PINK = hex(colorPalette.pink.base)
const BLUE = hex(colorPalette.blue.darken1)
const LAV: [number, number, number] = [160, 80, 220]

const TEXT = {
  en: {
    left: 'My knowledge', right: 'Haufe knowledge',
    title: 'Your workspace is ready',
    body: 'Add your documents, links and instructions. Haufe\'s expert content is already here — the workspace brings both together.',
  },
  de: {
    left: 'Mein Wissen', right: 'Haufe-Wissen',
    title: 'Ihr Arbeitsbereich ist bereit',
    body: 'Fügen Sie Ihre Dokumente, Links und Anweisungen hinzu. Das Expertenwissen von Haufe ist bereits da – der Arbeitsbereich führt beides zusammen.',
  },
}

// Icons in the original's places: files, link, checklist on the left; library, people, building on the right.
const LEFT_ICONS = [
  { icon: iconType.FolderOutlined, x: 8, y: 33 },
  { icon: iconType.LinkOutlined, x: 8, y: 153 },
  { icon: iconType.TaskOutlined, x: 8, y: 275 },
]
const RIGHT_ICONS = [
  { icon: iconType.OpenBookOutlined, x: 438, y: 33 },
  { icon: iconType.UsersOutlined, x: 438, y: 153 },
  { icon: iconType.CompanyOutlined, x: 438, y: 275 },
]

// ─── The network (canvas) ─────────────────────────────────────────────────────

type Node = {
  fx: number; fy: number; sx: number; sy: number; side: 'L' | 'R'; col: [number, number, number]; r: number; phase: number
  travelStart: number; connReady: number; prog: number; cx: number; cy: number; alive: boolean
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

function halton(i: number, b: number) {
  let f = 1, r = 0
  while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b) }
  return r
}
const inLeft = (x: number, y: number) => ((x - 161) ** 2 / 74 ** 2) + ((y - 166) ** 2 / 144 ** 2) <= 0.88 && x < 236
const inRight = (x: number, y: number) => ((x - 319) ** 2 / 74 ** 2) + ((y - 166) ** 2 / 144 ** 2) <= 0.88 && x > 244

const TRAVEL_DUR = 900
const SETTLE_DELAY = 500

function buildNetwork() {
  const nodes: Node[] = []
  const make = (fx: number, fy: number, side: 'L' | 'R', r: number): Node => ({
    fx, fy, side, col: side === 'L' ? PINK : BLUE, r, phase: Math.random() * Math.PI * 2,
    sx: 0, sy: 0, travelStart: 0, connReady: 0, prog: 0, cx: 0, cy: 0, alive: false,
  })
  let hi = 1
  while (nodes.filter(n => n.side === 'L').length < 26) {
    const x = 82 + halton(hi, 2) * 155, y = 24 + halton(hi, 3) * 284
    if (inLeft(x, y)) nodes.push(make(x, y, 'L', 2 + Math.random() * 1.4))
    hi++
  }
  hi = 1
  while (nodes.filter(n => n.side === 'R').length < 26) {
    const x = 245 + halton(hi, 2) * 155, y = 24 + halton(hi, 3) * 284
    if (inRight(x, y)) nodes.push(make(x, y, 'R', 2 + Math.random() * 1.4))
    hi++
  }
  // Anchors where the connector lines meet the network.
  ;([[102, 78, 'L'], [79, 170, 'L'], [108, 272, 'L'], [378, 78, 'R'], [401, 170, 'R'], [372, 272, 'R']] as const)
    .forEach(([x, y, side]) => nodes.push(make(x, y, side, 3)))

  const leftCount = nodes.filter(n => n.side === 'L').length
  nodes.forEach((nd, i) => {
    const idx = nd.side === 'L' ? i : i - leftCount
    nd.sx = nd.side === 'L' ? 18 + Math.random() * 30 : 432 + Math.random() * 30
    nd.sy = 30 + Math.random() * 280
    nd.travelStart = 600 + (idx % 26) * 55
    nd.connReady = nd.travelStart + TRAVEL_DUR + SETTLE_DELAY * 0.4
  })

  const edges: { i: number; j: number; cross: boolean; edgeStart: number }[] = []
  for (let i = 0; i < nodes.length; i++) {
    const ni = nodes[i]
    const cands: { j: number; d: number; cross: boolean }[] = []
    for (let j = i + 1; j < nodes.length; j++) {
      const nj = nodes[j]
      const d = Math.hypot(ni.fx - nj.fx, ni.fy - nj.fy)
      if (d > 72) continue
      const cross = ni.side !== nj.side
      if (cross && (ni.fx < 218 || nj.fx > 262)) continue
      cands.push({ j, d, cross })
    }
    cands.sort((a, b) => a.d - b.d).slice(0, 4).forEach(({ j, cross }) => {
      edges.push({ i, j, cross, edgeStart: Math.max(ni.connReady, nodes[j].connReady) + Math.random() * 300 })
    })
  }
  return { nodes, edges }
}

function Network({ animate }: { animate: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const { nodes, edges } = buildNetwork()
    // Skipping the build-up just starts the clock where everything has settled.
    const offset = animate ? 0 : 5000
    let start: number | null = null
    let frame = 0

    const draw = (ts: number) => {
      if (start === null) start = ts
      const ms = ts - start + offset
      ctx.clearRect(0, 0, W, H)
      nodes.forEach(nd => {
        nd.prog = Math.min(1, Math.max(0, (ms - nd.travelStart) / TRAVEL_DUR))
        const t = easeOutCubic(nd.prog)
        nd.cx = nd.sx + (nd.fx - nd.sx) * t
        nd.cy = nd.sy + (nd.fy - nd.sy) * t
        nd.alive = ms > nd.travelStart
      })
      edges.forEach(e => {
        const prog = Math.min(1, Math.max(0, (ms - e.edgeStart) / 400))
        const ni = nodes[e.i], nj = nodes[e.j]
        if (prog <= 0 || !ni.alive || !nj.alive) return
        const [r, g, b] = e.cross ? LAV : ni.col
        ctx.beginPath()
        ctx.moveTo(ni.cx, ni.cy)
        ctx.lineTo(nj.cx, nj.cy)
        ctx.strokeStyle = `rgba(${r},${g},${b},${prog * Math.min(ni.prog, nj.prog) * (e.cross ? 0.24 : 0.18)})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      })
      nodes.forEach(nd => {
        if (!nd.alive) return
        const pulse = 0.75 + 0.25 * Math.sin(ms * 0.0018 + nd.phase)
        const alpha = nd.prog * (0.55 + 0.38 * pulse)
        const [r, g, b] = nd.col
        const rad = nd.r * (0.4 + 0.6 * nd.prog)
        const glow = ctx.createRadialGradient(nd.cx, nd.cy, 0, nd.cx, nd.cy, rad * 4.5)
        glow.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.26})`)
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.beginPath(); ctx.arc(nd.cx, nd.cy, rad * 4.5, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill()
        ctx.beginPath(); ctx.arc(nd.cx, nd.cy, rad, 0, Math.PI * 2); ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(0.9, alpha * 1.2)})`; ctx.fill()
      })
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [animate])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: W, height: H, pointerEvents: 'none' }} />
}

// ─── View ─────────────────────────────────────────────────────────────────────

const CSS = `
  .wr-conn { stroke-dasharray: 200; stroke-dashoffset: 200; animation: wr-draw .5s ease forwards; }
  .wr-fade { opacity: 0; animation: wr-up .4s ease forwards; }
  .wr-in { opacity: 0; animation: wr-fade .5s ease forwards; }
  .wr-static .wr-conn { stroke-dashoffset: 0; animation: none; }
  .wr-static .wr-fade, .wr-static .wr-in { opacity: 1; animation: none; }
  @keyframes wr-draw { to { stroke-dashoffset: 0 } }
  @keyframes wr-up { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
  @keyframes wr-fade { from { opacity: 0 } to { opacity: 1 } }
  @media (prefers-reduced-motion: reduce) {
    .wr-conn { stroke-dashoffset: 0; animation: none; }
    .wr-fade, .wr-in { opacity: 1; animation: none; }
  }
`

export function WorkspaceReady({ lang, animate, actions }: { lang: 'en' | 'de'; animate: boolean; actions: ReactNode }) {
  const t = TEXT[lang]
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const play = animate && !reducedMotion
  const delay = (s: number) => (play ? { animationDelay: `${s}s` } : undefined)
  const pink = colorPalette.pink.base
  const blue = colorPalette.blue.darken1

  return (
    <div className={play ? undefined : 'wr-static'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${spacing(8)}px ${spacing(4)}px` }}>
      <style>{CSS}</style>
      <div className="wr-fade" style={{ width: W, display: 'flex', justifyContent: 'space-between', paddingBottom: 10, ...delay(3.4) }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: colorPalette.pink.darken2 }}>{t.left}</span>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: blue }}>{t.right}</span>
      </div>

      <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden' }}>
        <Network animate={play} />
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
          <line className="wr-in" x1="240" y1="8" x2="240" y2="332" stroke="rgba(120,80,160,0.07)" strokeWidth="1" strokeDasharray="3 6" style={delay(1)} />
          {[[25, 50, 102, 78, 2.9], [25, 170, 79, 170, 3.05], [25, 292, 108, 272, 3.2]].map(([x1, y1, x2, y2, d]) => (
            <line key={`l${y1}`} className="wr-conn" x1={x1} y1={y1} x2={x2} y2={y2} stroke={`rgba(${PINK.join(',')},.5)`} strokeWidth="1.3" style={delay(d)} />
          ))}
          {[[455, 50, 378, 78, 2.9], [455, 170, 401, 170, 3.05], [455, 292, 372, 272, 3.2]].map(([x1, y1, x2, y2, d]) => (
            <line key={`r${y1}`} className="wr-conn" x1={x1} y1={y1} x2={x2} y2={y2} stroke={`rgba(${BLUE.join(',')},.35)`} strokeWidth="1.3" style={delay(d)} />
          ))}
          <g className="wr-in" fill="none" stroke={`rgba(${PINK.join(',')},.28)`} strokeWidth="1.4" strokeLinecap="round" style={delay(3.2)}>
            <line x1="62" y1="100" x2="70" y2="100" /><line x1="66" y1="96" x2="66" y2="104" />
            <line x1="48" y1="216" x2="56" y2="216" /><line x1="52" y1="212" x2="52" y2="220" />
            <circle cx="62" cy="126" r="3" />
          </g>
          <g className="wr-in" fill="none" stroke={`rgba(${BLUE.join(',')},.22)`} strokeWidth="1.4" strokeLinecap="round" style={delay(3.2)}>
            <line x1="410" y1="100" x2="418" y2="100" /><line x1="414" y1="96" x2="414" y2="104" />
            <line x1="424" y1="216" x2="432" y2="216" /><line x1="428" y1="212" x2="428" y2="220" />
            <circle cx="418" cy="126" r="3" />
          </g>
        </svg>
        {[...LEFT_ICONS.map((ic, i) => ({ ...ic, color: pink, d: 3.1 + i * 0.12 })), ...RIGHT_ICONS.map((ic, i) => ({ ...ic, color: blue, d: 3.1 + i * 0.12 }))].map(ic => (
          <div key={`${ic.x}-${ic.y}`} className="wr-fade" style={{ position: 'absolute', left: ic.x, top: ic.y, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ic.color, ...delay(ic.d) }}>
            <Icon type={ic.icon as never} size={32} color="inherit" />
          </div>
        ))}
      </div>

      <div className="wr-fade" style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 7, maxWidth: 420, ...delay(3.7) }}>
        <Typography size="base-lg" weight="semibold" color="neutral-darken5" align="center">{t.title}</Typography>
        <Typography size="base-sm" color="neutral-darken2" align="center">{t.body}</Typography>
      </div>
      <div className="wr-fade" style={{ marginTop: spacing(4), display: 'flex', gap: spacing(3), justifyContent: 'center', ...delay(4) }}>
        {actions}
      </div>
    </div>
  )
}
