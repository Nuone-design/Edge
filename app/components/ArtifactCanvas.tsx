'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTone } from '../contexts/ToneContext'

// ── Types ──────────────────────────────────────────────────────────────────
interface ArtifactContent {
  messages: { role: 'user' | 'assistant'; content: string }[]
  topic:    string
}

interface ColorSwatch { hex: string; name: string; role: string }
interface TypeSpec    { family: string; style: string; sample: string }

interface ArtifactData {
  frame:        string
  standard:     string
  moodKeywords: string[]
  colorPalette: ColorSwatch[]
  typography:   TypeSpec[]
  principles:   string[]
  referenceTerms:     string[]
  visionTerms:  string[]
  avoid:        string
}

// ── Fallback data ──────────────────────────────────────────────────────────
const FALLBACK: ArtifactData = {
  frame:        'The problem has not yet been named clearly enough to solve.',
  standard:     'We will not begin until we know what we are refusing.',
  moodKeywords: ['form', 'clarity', 'intention', 'craft', 'restraint'],
  colorPalette: [
    { hex: '#F7F4EF', name: 'Bone',      role: 'LIGHT'     },
    { hex: '#FAF8F5', name: 'Parchment', role: 'GROUND'    },
    { hex: '#9A9088', name: 'Stone',     role: 'SECONDARY' },
    { hex: '#2C2B28', name: 'Carbon',    role: 'PRIMARY'   },
    { hex: '#D4A853', name: 'Amber',     role: 'ACCENT'    },
    { hex: '#4A6B5A', name: 'Moss',      role: 'CONTRAST'  },
    { hex: '#1A1916', name: 'Tar',       role: 'DARK'      },
  ],
  typography: [
    { family: 'Playfair Display', style: 'Headlines — editorial authority',  sample: 'Truth in form.' },
    { family: 'Inter',            style: 'Body — functional and clear',       sample: 'The work begins.' },
  ],
  principles: [
    'Clarity over complexity — every element should survive the question "why is this here?"',
    'Material honesty — let each component be exactly what it is, without disguise.',
    'Restraint as strength — what is omitted is as considered as what remains.',
  ],
  referenceTerms:    ['minimal', 'material', 'space', 'craft', 'form', 'light'],
  visionTerms: ['architecture', 'atmosphere'],
  avoid:       'Avoid decoration for its own sake, trend-chasing, and complexity that performs intelligence without earning it. This work refuses to be impressive before it is true.',
}

// ── Strip markdown ─────────────────────────────────────────────────────────
function stripMarkdown(raw: string): string {
  return raw
    .replace(/\*{1,3}/g, '')
    .replace(/_{1,2}/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/`{1,3}/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── Canvas geometry ────────────────────────────────────────────────────────
const CANVAS_W = 3200
const CANVAS_H = 1150

// ── Shared type alias ──────────────────────────────────────────────────────
type ToneType = ReturnType<typeof useTone>['tone']

// ── Zone label ─────────────────────────────────────────────────────────────
function ZoneLabel({ text, tone, color }: { text: string; tone: ToneType; color?: string }) {
  return (
    <p style={{
      fontSize:      10,
      fontWeight:    500,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color:         color ?? tone.textMuted,
      margin:        '0 0 18px 0',
      transition:    'color 0.6s ease',
    }}>
      {text}
    </p>
  )
}

// ── THE STANDARD (hero) ────────────────────────────────────────────────────
function ZoneStandard({ text, tone, delay }: { text: string; tone: ToneType; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position:   'absolute',
        left:       1150,
        top:        80,
        width:      700,
        border:     `1px solid ${tone.zoneBorder}`,
        padding:    '44px 52px 50px',
        transition: 'border-color 0.6s ease',
      }}
    >
      <ZoneLabel text="The Standard" tone={tone} />
      <p style={{
        fontSize:      34,
        fontWeight:    300,
        lineHeight:    1.58,
        letterSpacing: '-0.02em',
        color:         tone.textPrimary,
        margin:        0,
        transition:    'color 0.6s ease',
      }}>
        {stripMarkdown(text)}
      </p>
    </motion.div>
  )
}

// ── THE FRAME ──────────────────────────────────────────────────────────────
function ZoneFrame({ text, tone, delay }: { text: string; tone: ToneType; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position:    'absolute',
        left:        80,
        top:         90,
        width:       240,
        paddingLeft: 18,
        borderLeft:  `1px solid ${tone.hairline}`,
        transition:  'border-color 0.6s ease',
      }}
    >
      <ZoneLabel text="The Frame" tone={tone} />
      <p style={{
        fontFamily:    'var(--font-playfair), Georgia, serif',
        fontSize:      16,
        fontWeight:    400,
        fontStyle:     'italic',
        lineHeight:    1.75,
        color:         tone.textPrimary,
        margin:        0,
        letterSpacing: '0.003em',
        transition:    'color 0.6s ease',
      }}>
        {text}
      </p>
    </motion.div>
  )
}

// ── THE TERRITORY (mood keywords) ─────────────────────────────────────────
function ZoneTerritory({ keywords, tone, delay }: { keywords: string[]; tone: ToneType; delay: number }) {
  const sizes   = [36, 24, 30, 20, 28, 22]
  const weights = [300, 400, 300, 400, 300, 400]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'absolute', left: 2030, top: 90, width: 380 }}
    >
      <ZoneLabel text="The Territory" tone={tone} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', alignItems: 'baseline' }}>
        {keywords.map((word, i) => (
          <span key={i} style={{
            fontSize:      sizes[i % sizes.length],
            fontWeight:    weights[i % weights.length],
            letterSpacing: '-0.02em',
            lineHeight:    1.1,
            color:         tone.textPrimary,
            transition:    'color 0.6s ease',
          }}>
            {word}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

// ── THE PALETTE ────────────────────────────────────────────────────────────
function ZonePalette({ palette, tone, delay }: { palette: ColorSwatch[]; tone: ToneType; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'absolute', left: 2030, top: 400, width: 460 }}
    >
      <ZoneLabel text="The Palette" tone={tone} />
      <div style={{ display: 'flex', gap: 8 }}>
        {palette.map((swatch, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span style={{
              fontSize:      7,
              fontWeight:    500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         tone.textMuted,
              marginBottom:  1,
              transition:    'color 0.6s ease',
            }}>
              {swatch.role}
            </span>
            <div style={{
              width:        50,
              height:       140,
              background:   swatch.hex,
              borderRadius: 2,
            }} />
            <span style={{
              fontSize:   9,
              fontWeight: 400,
              color:      tone.textMuted,
              lineHeight: 1.3,
              transition: 'color 0.6s ease',
            }}>
              {swatch.name}
            </span>
            <span style={{
              fontSize:   8,
              color:      tone.textMuted,
              opacity:    0.55,
              fontFamily: 'monospace',
            }}>
              {swatch.hex}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── THE VISION ─────────────────────────────────────────────────────────────
function ZoneVision({ terms, tone, delay }: { terms: string[]; tone: ToneType; delay: number }) {
  // 4 images in a 2×2 grid — use each vision term twice with different locks for variety
  const imgs = [
    { term: terms[0] ?? 'architecture', lock: 10 },
    { term: terms[1] ?? 'atmosphere',   lock: 11 },
    { term: terms[0] ?? 'architecture', lock: 22 },
    { term: terms[1] ?? 'atmosphere',   lock: 23 },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'absolute', left: 2600, top: 80, width: 560 }}
    >
      <ZoneLabel text="The Vision" tone={tone} />
      <div style={{
        display:             'grid',
        gridTemplateColumns: '280px 280px',
        gap:                 10,
      }}>
        {imgs.map((img, i) => (
          <img
            key={i}
            src={`https://loremflickr.com/280/200/${encodeURIComponent(img.term)}?lock=${img.lock}`}
            alt={img.term}
            width={280}
            height={200}
            style={{
              width:     280,
              height:    200,
              objectFit: 'cover',
              display:   'block',
              opacity:   0.88,
              filter:    'contrast(0.95) saturate(0.85)',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ── THE REFERENCES ─────────────────────────────────────────────────────────
function ZoneReferences({ terms, tone, delay }: { terms: string[]; tone: ToneType; delay: number }) {
  const imgs  = terms.slice(0, 6)
  const IMG_W = 160, IMG_H = 120

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'absolute', left: 80, top: 720, width: 520 }}
    >
      <ZoneLabel text="The References" tone={tone} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {imgs.map((term, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <img
              src={`https://loremflickr.com/${IMG_W}/${IMG_H}/${encodeURIComponent(term)}?lock=${i + 1}`}
              alt={term}
              width={IMG_W} height={IMG_H}
              style={{ width: '100%', height: IMG_H, objectFit: 'cover', display: 'block', opacity: 0.85, filter: 'contrast(0.95) saturate(0.88)' }}
            />
            <span style={{ fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', color: tone.textMuted, transition: 'color 0.6s ease' }}>
              {term}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── THE PRINCIPLES ─────────────────────────────────────────────────────────
function ZonePrinciples({ principles, tone, delay }: { principles: string[]; tone: ToneType; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'absolute', left: 760, top: 720, width: 420 }}
    >
      <ZoneLabel text="The Principles" tone={tone} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {principles.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <span style={{
              fontSize:   38,
              fontWeight: 200,
              lineHeight: 1,
              color:      tone.zoneBorder,
              flexShrink: 0,
              width:      24,
              textAlign:  'right',
              paddingTop:  2,
              transition: 'color 0.6s ease',
            }}>
              {i + 1}
            </span>
            <p style={{
              fontSize:   13,
              fontWeight: 300,
              lineHeight: 1.65,
              color:      tone.textPrimary,
              margin:     0,
              paddingTop: 5,
              transition: 'color 0.6s ease',
            }}>
              {p}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── WHAT THIS IS NOT ───────────────────────────────────────────────────────
function ZoneAvoid({ text, tone, delay }: { text: string; tone: ToneType; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'absolute', left: 1340, top: 760, width: 500 }}
    >
      <div style={{ borderTop: `1px solid ${tone.zoneBorder}`, paddingTop: 16, transition: 'border-color 0.6s ease' }}>
        <ZoneLabel text="What This Is Not" tone={tone} color="#A05050" />
        <p style={{
          fontSize:      13,
          fontWeight:    300,
          lineHeight:    1.75,
          color:         tone.textSecondary,
          margin:        0,
          fontStyle:     'italic',
          transition:    'color 0.6s ease',
        }}>
          {text}
        </p>
      </div>
    </motion.div>
  )
}

// ── THE TYPE ───────────────────────────────────────────────────────────────
function ZoneType({ typography, tone, delay }: { typography: TypeSpec[]; tone: ToneType; delay: number }) {
  // Inject Google Fonts for the suggested typefaces
  useEffect(() => {
    typography.forEach(t => {
      const param = t.family.replace(/\s+/g, '+')
      const id    = `gfont-${param}`
      if (!document.getElementById(id)) {
        const link = document.createElement('link')
        link.id   = id
        link.rel  = 'stylesheet'
        link.href = `https://fonts.googleapis.com/css2?family=${param}:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap`
        document.head.appendChild(link)
      }
    })
  }, [typography])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'absolute', left: 2030, top: 720, width: 560 }}
    >
      <ZoneLabel text="The Type" tone={tone} />
      <div style={{ display: 'flex', gap: 0 }}>
        {typography.map((spec, i) => (
          <div
            key={i}
            style={{
              flex:        1,
              borderLeft:  `1px solid ${tone.zoneBorder}`,
              paddingLeft: 22,
              paddingRight: i < typography.length - 1 ? 28 : 0,
              transition:  'border-color 0.6s ease',
            }}
          >
            <p style={{
              fontFamily:    `'${spec.family}', Georgia, serif`,
              fontSize:      44,
              fontWeight:    300,
              lineHeight:    1.1,
              letterSpacing: '-0.03em',
              color:         tone.textPrimary,
              margin:        '0 0 14px',
              transition:    'color 0.6s ease',
            }}>
              {spec.sample}
            </p>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', color: tone.textMuted, margin: '0 0 3px', transition: 'color 0.6s ease' }}>
              {spec.family}
            </p>
            <p style={{ fontSize: 11, color: tone.textMuted, margin: 0, opacity: 0.65, fontWeight: 300, transition: 'color 0.6s ease' }}>
              {spec.style}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── LOADING — generative blueprint animation ────────────────────────────────
const BLUEPRINT_COLOR = '#2A3450'

// Each path: animates pathLength + opacity [0→1→1→0] across an 8s loop
function BlueprintPath({ d, delay, strokeWidth = 0.8 }: { d: string; delay: number; strokeWidth?: number }) {
  return (
    <motion.path
      d={d}
      stroke={BLUEPRINT_COLOR}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.6, 0.6, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.28, 0.78, 1], delay }}
    />
  )
}

function BlueprintDot({ cx, cy, delay }: { cx: number; cy: number; delay: number }) {
  return (
    <motion.circle
      cx={cx} cy={cy} r={2.5}
      fill={BLUEPRINT_COLOR}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1, 1, 0], opacity: [0, 0.7, 0.7, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.06, 0.78, 1], delay }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    />
  )
}

function CanvasLoading({ tone }: { tone: ToneType }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 26 }}>
      {/* SVG blueprint — fills screen behind the text */}
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {/* 1. Main horizontal centerline — draws first, confident */}
        <BlueprintPath d="M80,300 L920,300" delay={0} strokeWidth={1} />
        {/* 2. Up-branch from x=340 */}
        <BlueprintPath d="M340,300 L340,160" delay={0.4} />
        {/* 3. Top horizontal */}
        <BlueprintPath d="M210,160 L500,160" delay={0.8} />
        {/* 4. Right vertical down from x=660 */}
        <BlueprintPath d="M660,300 L660,420" delay={0.6} />
        {/* 5. Vertical connector closing top box */}
        <BlueprintPath d="M500,160 L500,300" delay={1.1} />
        {/* 6. Bottom-right L-shape */}
        <BlueprintPath d="M660,420 L800,420 L800,330" delay={1.3} />
        {/* 7. Diagonal accent — a moment of pause then a quick dart */}
        <BlueprintPath d="M660,300 L590,240" delay={1.6} />
        {/* 8. Top-left accent mark */}
        <BlueprintPath d="M340,160 L400,105" delay={2.0} />

        {/* Dots at key junctions */}
        <BlueprintDot cx={340} cy={300} delay={1.0} />
        <BlueprintDot cx={340} cy={160} delay={1.4} />
        <BlueprintDot cx={500} cy={160} delay={1.2} />
        <BlueprintDot cx={660} cy={300} delay={1.8} />
      </svg>

      {/* Label — centered on top */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.span
          animate={{ opacity: [0.3, 0.75, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: tone.textMuted, userSelect: 'none' }}
        >
          Distilling session…
        </motion.span>
      </div>
    </div>
  )
}

// ── SESSION COMPLETE HEADER ────────────────────────────────────────────────
function SessionCompleteHeader({ tone }: { tone: ToneType }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 80, zIndex: 30,
        pointerEvents: 'none',
        background:    `linear-gradient(to bottom, ${tone.headerBg} 0%, ${tone.headerBg} 58%, transparent 100%)`,
        transition:    'background 0.6s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 22 }}>
        <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: tone.textMuted, transition: 'color 0.6s ease', userSelect: 'none' }}>
          Session Complete
        </span>
      </div>
    </motion.div>
  )
}

// ── EXPORT BUTTON ──────────────────────────────────────────────────────────
// Animated rotating energy beam — pure imperative SVG DOM, no MotionValue on wrapper
const BTN_W  = 92, BTN_H = 32, BTN_R = 16
const PERIM  = 2 * (BTN_W - 2 * BTN_R) + 2 * Math.PI * BTN_R  // ≈ 220.5
const BEAM   = PERIM * 0.28                                      // ≈ 61.7

function ExportButton({ tone }: { tone: ToneType }) {
  const [hovered, setHovered] = useState(false)
  const [open,    setOpen]    = useState(false)
  const [copied,  setCopied]  = useState(false)
  const [visible, setVisible] = useState(false)

  // Fade in after mount — CSS transition avoids Framer Motion wrapper (v12 render-phase issue)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1800)
    return () => clearTimeout(timer)
  }, [])

  // Imperative animation refs — avoids MotionValue on SVG (Framer Motion v12 issue)
  const glowRef    = useRef<SVGRectElement>(null)
  const beamRef    = useRef<SVGRectElement>(null)
  const posRef     = useRef(0)
  const hoveredRef = useRef(false)

  // Keep hoveredRef current without restarting the RAF loop
  useEffect(() => {
    hoveredRef.current = hovered
  }, [hovered])

  // Single persistent RAF loop — reads hoveredRef for speed, writes directly to DOM
  useEffect(() => {
    let prev = performance.now()
    let raf: number

    function tick(now: number) {
      const dt = (now - prev) / 1000
      prev = now
      const speed = hoveredRef.current ? PERIM / 1.5 : PERIM / 3
      posRef.current -= speed * dt
      if (posRef.current <= -PERIM) posRef.current += PERIM
      const offset = String(posRef.current)
      if (glowRef.current) glowRef.current.style.strokeDashoffset = offset
      if (beamRef.current) beamRef.current.style.strokeDashoffset = offset
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Close on outside click
  const wrapRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handler)
    }
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch (_err) {
      // clipboard write failed — ignore
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setOpen(false)
  }

  function handlePDF() {
    setOpen(false)
    window.print()
  }

  function handlePNG() {
    setOpen(false)
    // html2canvas integration point
  }

  const beamColor = '#C8971E'
  const glowColor = '#E8B83A'

  return (
    <div
      ref={wrapRef}
      style={{
        position:   'fixed',
        top:        18,
        right:      60,
        zIndex:     30,
        opacity:    visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      <button
        style={{
          position:       'relative',
          width:          BTN_W,
          height:         BTN_H,
          background:     'none',
          border:         'none',
          cursor:         'pointer',
          fontFamily:     'inherit',
          padding:        0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setOpen(o => !o)}
      >
        {/* Animated SVG border — plain rects, animated imperatively */}
        <svg
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
          width={BTN_W}
          height={BTN_H}
        >
          {/* Base faint ring */}
          <rect
            rx={BTN_R} ry={BTN_R} x={0.5} y={0.5}
            width={BTN_W - 1} height={BTN_H - 1}
            fill="none" stroke={tone.zoneBorder} strokeWidth={1}
          />
          {/* Soft glow trail */}
          <rect
            ref={glowRef}
            rx={BTN_R} ry={BTN_R} x={0.5} y={0.5}
            width={BTN_W - 1} height={BTN_H - 1}
            fill="none"
            stroke={glowColor}
            strokeWidth={hovered ? 6 : 4}
            strokeDasharray={`${BEAM * 0.55} ${PERIM - BEAM * 0.55}`}
            strokeDashoffset={0}
            style={{ opacity: hovered ? 0.28 : 0.16, transition: 'opacity 0.2s, stroke-width 0.2s' }}
          />
          {/* Main sharp beam */}
          <rect
            ref={beamRef}
            rx={BTN_R} ry={BTN_R} x={0.5} y={0.5}
            width={BTN_W - 1} height={BTN_H - 1}
            fill="none"
            stroke={beamColor}
            strokeWidth={hovered ? 1.8 : 1.5}
            strokeDasharray={`${BEAM} ${PERIM - BEAM}`}
            strokeDashoffset={0}
            style={{ transition: 'stroke-width 0.2s' }}
          />
        </svg>

        {/* Label */}
        <span style={{
          position:      'relative',
          fontSize:      10,
          fontWeight:    500,
          letterSpacing: '0.10em',
          textTransform: 'uppercase' as const,
          color:         hovered ? tone.textSecondary : tone.textMuted,
          transition:    'color 0.2s ease',
          userSelect:    'none',
        }}>
          Export
        </span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: -5, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position:     'absolute',
              top:          BTN_H + 8,
              right:        0,
              background:   tone.inputBg,
              border:       `1px solid ${tone.zoneBorder}`,
              borderRadius: 8,
              overflow:     'hidden',
              minWidth:     176,
              boxShadow:    '0 6px 28px rgba(0,0,0,0.10)',
              zIndex:       31,
            }}
          >
            {[
              { label: 'Download PDF',                    action: handlePDF      },
              { label: 'Download PNG',                    action: handlePNG      },
              { label: copied ? 'Copied!' : 'Copy link', action: handleCopyLink },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                style={{
                  display:       'block',
                  width:         '100%',
                  padding:       '10px 16px',
                  textAlign:     'left',
                  background:    'none',
                  border:        'none',
                  borderTop:     i > 0 ? `1px solid ${tone.zoneBorder}` : 'none',
                  fontSize:      12,
                  fontWeight:    300,
                  letterSpacing: '0.02em',
                  color:         item.label === 'Copied!' ? '#4A8A4A' : tone.textPrimary,
                  cursor:        'pointer',
                  fontFamily:    'inherit',
                  transition:    'color 0.2s ease',
                }}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── MAIN CANVAS ────────────────────────────────────────────────────────────
export default function ArtifactCanvas({ content }: { content: ArtifactContent }) {
  const { tone } = useTone()

  // ── API data state ──
  const [data,  setData]  = useState<ArtifactData | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetch('/api/artifact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ messages: content.messages, topic: content.topic }),
    })
      .then(r => r.json())
      .then((d: Partial<ArtifactData> & { error?: string }) => {
        if (d.error) throw new Error(d.error)
        setData({
          frame:        d.frame        ?? FALLBACK.frame,
          standard:     d.standard     ?? FALLBACK.standard,
          moodKeywords: d.moodKeywords ?? FALLBACK.moodKeywords,
          colorPalette: d.colorPalette ?? FALLBACK.colorPalette,
          typography:   d.typography   ?? FALLBACK.typography,
          principles:   d.principles   ?? FALLBACK.principles,
          referenceTerms:     d.referenceTerms ?? FALLBACK.referenceTerms,
          visionTerms:  d.visionTerms  ?? FALLBACK.visionTerms,
          avoid:        d.avoid        ?? FALLBACK.avoid,
        })
        setReady(true)
      })
      .catch(() => { setData(FALLBACK); setReady(true) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Pan / Zoom ──
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging   = useRef(false)
  const lastPos      = useRef({ x: 0, y: 0 })

  const [pan,  setPan]  = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(() => {
    if (typeof window === 'undefined') return 0.65
    const fitW = (window.innerWidth  * 0.92) / CANVAS_W
    const fitH = (window.innerHeight * 0.85) / CANVAS_H
    return Math.min(0.72, Math.max(0.42, Math.min(fitW, fitH)))
  })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
  }, [])

  const onMouseUp = useCallback(() => {
    isDragging.current = false
    if (containerRef.current) containerRef.current.style.cursor = 'grab'
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(prev => Math.min(2.0, Math.max(0.3, prev + (-e.deltaY * 0.001))))
  }, [])

  useEffect(() => {
    const up = () => { isDragging.current = false }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ position: 'fixed', inset: 0, zIndex: 25 }}
    >
      <SessionCompleteHeader tone={tone} />
      <ExportButton tone={tone} />

      {!ready || !data ? (
        <CanvasLoading tone={tone} />
      ) : (
        <div
          ref={containerRef}
          style={{ position: 'absolute', inset: 0, overflow: 'hidden', cursor: 'grab', userSelect: 'none' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onWheel={onWheel}
        >
          <div
            style={{
              position:        'absolute',
              width:           CANVAS_W,
              height:          CANVAS_H,
              left:            '50%',
              top:             '50%',
              transform:       `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* ── Top band — staggered reveals ──────────────────────────── */}
            <ZoneStandard  text={data.standard}     tone={tone} delay={0}   />
            <ZoneFrame     text={data.frame}         tone={tone} delay={0.4} />
            <ZoneTerritory keywords={data.moodKeywords} tone={tone} delay={0.8} />
            <ZonePalette   palette={data.colorPalette}  tone={tone} delay={1.2} />
            <ZoneVision    terms={data.visionTerms}      tone={tone} delay={1.6} />

            {/* ── Bottom band ───────────────────────────────────────────── */}
            <ZoneReferences terms={data.referenceTerms}    tone={tone} delay={2.0} />
            <ZonePrinciples principles={data.principles} tone={tone} delay={2.4} />
            <ZoneAvoid     text={data.avoid}         tone={tone} delay={2.8} />
            <ZoneType      typography={data.typography} tone={tone} delay={3.2} />
          </div>
        </div>
      )}
    </motion.div>
  )
}
