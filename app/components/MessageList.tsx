'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTone } from '../contexts/ToneContext'
import { Message } from './SessionView'
import EdgeMessage from './EdgeMessage'
import UserMessage from './UserMessage'
import { parseCommitResponse } from '../utils/parseEdgeResponse'

type Step = 'dump' | 'challenge' | 'provocation' | 'commit'

interface MessageListProps {
  messages:            Message[]
  streamingMessageId:  string | null
  streamingText:       string
  pendingTransition:   boolean
  commitComplete:      boolean
  step:                Step
  commitOptionsReady:  boolean
  commitOptions:       string[]
  commitMessageId:     string | null
  selectedCommitCard:  number | null
  showSkipLink:        boolean
  onAdvanceStep:       () => void
  onDismissTransition: () => void
  onGenerateArtifact:  () => void
  onCommitCardSelect:  (idx: number) => void
  onCommitConfirm:     () => void
  onSkipStep:          () => void
}

// ── Ghost button ───────────────────────────────────────────────────────────

function GhostButton({
  children,
  onClick,
  primary = false,
  wide    = false,
}: {
  children: React.ReactNode
  onClick:  () => void
  primary?: boolean
  wide?:    boolean
}) {
  const { tone } = useTone()
  return (
    <button
      onClick={onClick}
      style={{
        background:    'none',
        border:        `1px solid ${primary ? tone.hairline : tone.inputBorder}`,
        borderRadius:  20,
        paddingTop:    7,
        paddingBottom: 7,
        paddingLeft:   wide ? 28 : 16,
        paddingRight:  wide ? 28 : 16,
        fontSize:      13,
        fontWeight:    400,
        letterSpacing: '0.02em',
        color:         primary ? tone.textSecondary : tone.textMuted,
        cursor:        'pointer',
        fontFamily:    'inherit',
        transition:    'border-color 0.2s ease, color 0.2s ease, border-color 0.6s ease, color 0.6s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = primary ? tone.dotActive : tone.hairline
        el.style.color       = primary ? tone.textPrimary : tone.textSecondary
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = primary ? tone.hairline : tone.inputBorder
        el.style.color       = primary ? tone.textSecondary : tone.textMuted
      }}
    >
      {children}
    </button>
  )
}

// ── Commit confirm button — energy beam (mirrors ExportButton) ─────────────

const COMMIT_W     = 300
const COMMIT_H     = 44
const COMMIT_R     = 22
const COMMIT_PERIM = 2 * (COMMIT_W - 2 * COMMIT_R) + 2 * Math.PI * COMMIT_R
const COMMIT_BEAM  = COMMIT_PERIM * 0.22

function CommitConfirmButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const glowRef    = useRef<SVGRectElement>(null)
  const beamRef    = useRef<SVGRectElement>(null)
  const posRef     = useRef(0)
  const hoveredRef = useRef(false)

  useEffect(() => { hoveredRef.current = hovered }, [hovered])

  useEffect(() => {
    let prev = performance.now()
    let raf: number

    function tick(now: number) {
      const dt = (now - prev) / 1000
      prev = now
      const speed = hoveredRef.current ? COMMIT_PERIM / 1.5 : COMMIT_PERIM / 3
      posRef.current -= speed * dt
      if (posRef.current <= -COMMIT_PERIM) posRef.current += COMMIT_PERIM
      const offset = String(posRef.current)
      if (glowRef.current) glowRef.current.style.strokeDashoffset = offset
      if (beamRef.current) beamRef.current.style.strokeDashoffset = offset
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const beamColor = '#C8971E'
  const glowColor = '#E8B83A'

  return (
    <button
      style={{
        position:       'relative',
        width:          COMMIT_W,
        height:         COMMIT_H,
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
      onClick={onClick}
    >
      <svg
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        width={COMMIT_W}
        height={COMMIT_H}
      >
        {/* Base ring */}
        <rect
          rx={COMMIT_R} ry={COMMIT_R} x={0.5} y={0.5}
          width={COMMIT_W - 1} height={COMMIT_H - 1}
          fill="none" stroke="#2A3450" strokeWidth={1}
        />
        {/* Glow trail */}
        <rect
          ref={glowRef}
          rx={COMMIT_R} ry={COMMIT_R} x={0.5} y={0.5}
          width={COMMIT_W - 1} height={COMMIT_H - 1}
          fill="none"
          stroke={glowColor}
          strokeWidth={hovered ? 7 : 4}
          strokeDasharray={`${COMMIT_BEAM * 0.55} ${COMMIT_PERIM - COMMIT_BEAM * 0.55}`}
          strokeDashoffset={0}
          style={{ opacity: hovered ? 0.32 : 0.18, transition: 'opacity 0.2s, stroke-width 0.2s' }}
        />
        {/* Main beam */}
        <rect
          ref={beamRef}
          rx={COMMIT_R} ry={COMMIT_R} x={0.5} y={0.5}
          width={COMMIT_W - 1} height={COMMIT_H - 1}
          fill="none"
          stroke={beamColor}
          strokeWidth={hovered ? 2 : 1.5}
          strokeDasharray={`${COMMIT_BEAM} ${COMMIT_PERIM - COMMIT_BEAM}`}
          strokeDashoffset={0}
          style={{ transition: 'stroke-width 0.2s' }}
        />
      </svg>
      <span style={{
        position:      'relative',
        fontSize:      11,
        fontWeight:    500,
        letterSpacing: '0.08em',
        color:         hovered ? '#E8EAF0' : '#8890A0',
        transition:    'color 0.2s ease',
        userSelect:    'none',
      }}>
        Commit to this standard →
      </span>
    </button>
  )
}

// ── Commit card ────────────────────────────────────────────────────────────

function CommitCard({
  index,
  text,
  selected,
  anySelected,
  hoveredIdx,
  isMobile,
  onSelect,
  onHoverIn,
  onHoverOut,
}: {
  index:       number
  text:        string
  selected:    boolean
  anySelected: boolean
  hoveredIdx:  number | null
  isMobile:    boolean
  onSelect:    () => void
  onHoverIn:   () => void
  onHoverOut:  () => void
}) {
  const isThisHovered  = hoveredIdx === index
  const isOtherHovered = hoveredIdx !== null && hoveredIdx !== index
  const isOtherSelected = anySelected && !selected

  // Derived visual state — expansion/blur/fade disabled on mobile
  const flexGrow  = isMobile          ? 1
                  : selected          ? 1.8
                  : isOtherSelected   ? 0.5
                  : isThisHovered     ? 1.8
                  : isOtherHovered    ? 0.7
                  : 1

  const opacity   = isMobile          ? 1
                  : selected          ? 1
                  : isOtherSelected   ? 0.3
                  : isOtherHovered    ? 0.5
                  : 1

  const blurPx    = isMobile          ? 0
                  : selected          ? 0
                  : isOtherSelected   ? 1
                  : isOtherHovered    ? 0.5
                  : 0

  const borderColor = selected        ? '#8A9FC0'
                    : isThisHovered   ? '#4A6090'
                    : '#2A3450'

  const bg          = (selected || isThisHovered) ? '#1E2D42' : '#141C2A'

  const boxShadow   = selected
    ? 'inset 0 0 0 1px rgba(138, 159, 192, 0.15), 0 8px 32px rgba(0,0,0,0.3)'
    : isThisHovered
    ? '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(74,96,144,0.15)'
    : 'none'

  const watermarkSize  = (isThisHovered || selected) ? 64 : 48
  const watermarkColor = (isThisHovered || selected) ? '#3A5070' : '#2A3450'

  const numberLabel = String(index + 1).padStart(2, '0')
  const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity, scale: selected ? 1.02 : 1, y: (!isMobile && isThisHovered && !selected) ? -2 : 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        flexGrow,
        flexShrink:  1,
        flexBasis:   0,
        minWidth:    0,
        position:    'relative',
        border:      `1px solid ${borderColor}`,
        borderRadius: 10,
        padding:     24,
        background:  bg,
        cursor:      selected ? 'default' : 'pointer',
        boxShadow,
        overflow:    'hidden',
        filter:      blurPx > 0 ? `blur(${blurPx}px)` : 'none',
        transition:  `flex-grow 0.4s ${EASE}, filter 0.4s ${EASE}, border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease`,
      }}
      onClick={selected ? undefined : onSelect}
      onMouseEnter={selected ? undefined : onHoverIn}
      onMouseLeave={selected ? undefined : onHoverOut}
    >
      {/* Watermark number */}
      <span style={{
        position:      'absolute',
        top:           20,
        left:          24,
        fontSize:      watermarkSize,
        fontWeight:    100,
        lineHeight:    1,
        color:         watermarkColor,
        userSelect:    'none',
        pointerEvents: 'none',
        letterSpacing: '-0.02em',
        transition:    `font-size 0.4s ${EASE}, color 0.3s ease`,
      }}>
        {numberLabel}
      </span>

      {/* Selection dot */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="sel-dot"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{    scale: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position:     'absolute',
              top:          20,
              right:        20,
              width:        8,
              height:       8,
              borderRadius: '50%',
              background:   '#8A9FC0',
            }}
          />
        )}
      </AnimatePresence>

      {/* Card text — subtle scale on hover */}
      <div style={{
        position:  'relative',
        zIndex:    1,
        marginTop: 44,
        transform: isThisHovered ? 'scale(1.02)' : 'scale(1)',
        transformOrigin: 'top left',
        transition: `transform 0.4s ${EASE}`,
      }}>
        <p style={{
          fontSize:      17,
          fontWeight:    300,
          lineHeight:    1.6,
          letterSpacing: '-0.01em',
          color:         '#E8EAF0',
          margin:        0,
        }}>
          {text}
        </p>
      </div>

      {/* "Choose this direction →" — fades in after 0.3s delay */}
      <AnimatePresence>
        {isThisHovered && !selected && (
          <motion.button
            key="choose"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: 8 }}
            transition={{ duration: 0.2, delay: 0.3 }}
            onClick={e => { e.stopPropagation(); onSelect() }}
            style={{
              position:      'relative',
              zIndex:        1,
              display:       'block',
              width:         '100%',
              marginTop:     24,
              padding:       '10px 0',
              background:    '#4A6090',
              border:        'none',
              borderRadius:  6,
              fontSize:      12,
              fontWeight:    500,
              letterSpacing: '0.04em',
              color:         '#FFFFFF',
              cursor:        'pointer',
              fontFamily:    'inherit',
              textAlign:     'center',
            }}
          >
            Choose this direction →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Commit cards wrapper ────────────────────────────────────────────────────

function CommitCards({
  text,
  selected,
  onSelect,
  onConfirm,
}: {
  text:      string
  selected:  number | null
  onSelect:  (idx: number) => void
  onConfirm: () => void
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [isMobile,   setIsMobile]   = useState(false)

  // Disable expansion on narrow viewports
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const { intro, options, outro } = parseCommitResponse(text)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ paddingLeft: 28 }}
    >
      {intro && (
        <p style={{
          fontSize:      15,
          fontWeight:    300,
          lineHeight:    1.7,
          letterSpacing: '-0.01em',
          color:         '#8890A0',
          margin:        0,
          marginBottom:  32,
        }}>
          {intro}
        </p>
      )}

      <div className="commit-cards-grid">
        {options.map((option, idx) => (
          <CommitCard
            key={idx}
            index={idx}
            text={option}
            selected={selected === idx}
            anySelected={selected !== null}
            hoveredIdx={selected !== null ? null : hoveredIdx}
            isMobile={isMobile}
            onSelect={() => { setHoveredIdx(null); onSelect(idx) }}
            onHoverIn={() => setHoveredIdx(idx)}
            onHoverOut={() => setHoveredIdx(null)}
          />
        ))}
      </div>

      {outro && (
        <p style={{
          fontSize:   15,
          fontWeight: 300,
          lineHeight: 1.7,
          color:      '#8890A0',
          margin:     0,
          marginTop:  24,
        }}>
          {outro}
        </p>
      )}

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            key="confirm-btn"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}
          >
            <CommitConfirmButton onClick={onConfirm} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Step transition prompt ─────────────────────────────────────────────────

function TransitionPrompt({
  onAdvance,
  onDismiss,
}: {
  onAdvance: () => void
  onDismiss: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ display: 'flex', gap: 10, paddingLeft: 28, marginTop: 40 }}
    >
      <GhostButton onClick={onAdvance} primary>Yes, let&apos;s go</GhostButton>
      <GhostButton onClick={onDismiss}>One more thought</GhostButton>
    </motion.div>
  )
}

// ── Generate artifact button — full-width energy beam ─────────────────────

const GEN_H = 52
const GEN_R = 26

function GenerateArtifactButton({ onClick }: { onClick: () => void }) {
  const [hovered,  setHovered]  = useState(false)
  const [svgWidth, setSvgWidth] = useState(0)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const glowRef    = useRef<SVGRectElement>(null)
  const beamRef    = useRef<SVGRectElement>(null)
  const posRef     = useRef(0)
  const hoveredRef = useRef(false)
  const perimRef   = useRef(0)

  // Track width via ResizeObserver so the SVG scales with the column
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const w = Math.floor(entries[0].contentRect.width)
      setSvgWidth(w)
      perimRef.current = 2 * (w - 2 * GEN_R) + 2 * Math.PI * GEN_R
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => { hoveredRef.current = hovered }, [hovered])

  // RAF loop — imperatively drives the beam so there are no React re-renders per frame
  useEffect(() => {
    let prev = performance.now()
    let raf: number

    function tick(now: number) {
      const dt    = (now - prev) / 1000
      prev        = now
      const perim = perimRef.current
      if (perim > 0) {
        const beam  = perim * 0.22
        const speed = hoveredRef.current ? perim / 1.5 : perim / 3
        posRef.current -= speed * dt
        if (posRef.current <= -perim) posRef.current += perim
        const offset = String(posRef.current)
        if (glowRef.current) {
          glowRef.current.style.strokeDashoffset = offset
          glowRef.current.style.strokeDasharray  = `${beam * 0.55} ${perim - beam * 0.55}`
        }
        if (beamRef.current) {
          beamRef.current.style.strokeDashoffset = offset
          beamRef.current.style.strokeDasharray  = `${beam} ${perim - beam}`
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const beamColor = '#C8971E'
  const glowColor = '#E8B83A'

  return (
    <div ref={wrapperRef} style={{ width: '100%' }}>
      <button
        style={{
          position:       'relative',
          width:          '100%',
          height:         GEN_H,
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
        onClick={onClick}
      >
        {svgWidth > 0 && (
          <svg
            style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
            width={svgWidth}
            height={GEN_H}
          >
            {/* Base ring */}
            <rect
              rx={GEN_R} ry={GEN_R} x={0.5} y={0.5}
              width={svgWidth - 1} height={GEN_H - 1}
              fill="none" stroke="#2A3450" strokeWidth={1}
            />
            {/* Glow trail */}
            <rect
              ref={glowRef}
              rx={GEN_R} ry={GEN_R} x={0.5} y={0.5}
              width={svgWidth - 1} height={GEN_H - 1}
              fill="none"
              stroke={glowColor}
              strokeWidth={hovered ? 9 : 5}
              strokeDasharray="0 9999"
              strokeDashoffset={0}
              style={{ opacity: hovered ? 0.38 : 0.2, transition: 'opacity 0.25s, stroke-width 0.25s' }}
            />
            {/* Main beam */}
            <rect
              ref={beamRef}
              rx={GEN_R} ry={GEN_R} x={0.5} y={0.5}
              width={svgWidth - 1} height={GEN_H - 1}
              fill="none"
              stroke={beamColor}
              strokeWidth={hovered ? 2.5 : 1.5}
              strokeDasharray="0 9999"
              strokeDashoffset={0}
              style={{ transition: 'stroke-width 0.25s' }}
            />
          </svg>
        )}
        <span style={{
          position:      'relative',
          fontSize:      15,
          fontWeight:    400,
          letterSpacing: '0.06em',
          color:         hovered ? '#E8EAF0' : '#8890A0',
          transition:    'color 0.2s ease',
          userSelect:    'none',
        }}>
          Generate my artifact
        </span>
      </button>
    </div>
  )
}

// ── Artifact generation prompt ─────────────────────────────────────────────

function ArtifactPrompt({ onGenerate }: { onGenerate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      style={{ paddingLeft: 28 }}
    >
      <p style={{
        fontSize:      10,
        fontWeight:    500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color:         '#6A7A9A',
        margin:        0,
        marginBottom:  16,
      }}>
        Your standard is set
      </p>
      <GenerateArtifactButton onClick={onGenerate} />
    </motion.div>
  )
}

// ── Message list ───────────────────────────────────────────────────────────

export default function MessageList({
  messages,
  streamingMessageId,
  streamingText,
  pendingTransition,
  commitComplete,
  step,
  commitOptionsReady,
  commitOptions,
  commitMessageId,
  selectedCommitCard,
  showSkipLink,
  onAdvanceStep,
  onDismissTransition,
  onGenerateArtifact,
  onCommitCardSelect,
  onCommitConfirm,
  onSkipStep,
}: MessageListProps) {
  const { tone }  = useTone()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, pendingTransition, commitComplete, commitOptionsReady, showSkipLink])

  return (
    <div
      className="hide-scrollbar"
      style={{
        flex:          1,
        overflowY:     'auto',
        width:         '100%',
        maxWidth:      640,
        margin:        '0 auto',
        paddingTop:    96,
        paddingBottom: 200,
      }}
    >
      <div
        style={{
          paddingLeft:   48,
          paddingRight:  48,
          display:       'flex',
          flexDirection: 'column',
          gap:           48,
        }}
      >
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return <UserMessage key={msg.id} text={msg.content} />
          }

          const isStreaming = msg.id === streamingMessageId
          const displayText = isStreaming ? streamingText : msg.content

          // Commit message: render CommitCards instead of EdgeMessage when options are ready
          const isCommitMsg = msg.id === commitMessageId && !isStreaming && commitOptionsReady

          if (isCommitMsg) {
            return (
              <CommitCards
                key={msg.id}
                text={msg.content}
                selected={selectedCommitCard}
                onSelect={onCommitCardSelect}
                onConfirm={onCommitConfirm}
              />
            )
          }

          return (
            <EdgeMessage
              key={msg.id}
              text={displayText}
              streaming={isStreaming}
              step={step}
            />
          )
        })}

        {/* Step transition prompt */}
        {pendingTransition && !commitComplete && (
          <TransitionPrompt
            onAdvance={onAdvanceStep}
            onDismiss={onDismissTransition}
          />
        )}

        {/* Artifact generation prompt — appears after commit card confirmed */}
        {commitComplete && (
          <ArtifactPrompt onGenerate={onGenerateArtifact} />
        )}

        {/* Skip pill — inline, below last message */}
        <AnimatePresence>
          {showSkipLink && (
            <motion.button
              key="skip-pill"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              onClick={onSkipStep}
              style={{
                alignSelf:     'flex-start',
                marginLeft:    28,
                background:    'none',
                border:        `1px solid ${tone.hairline}`,
                borderRadius:  20,
                paddingTop:    6,
                paddingBottom: 6,
                paddingLeft:   10,
                paddingRight:  10,
                fontSize:      12,
                fontWeight:    400,
                letterSpacing: '0.03em',
                color:         tone.skipLinkColor,
                cursor:        'pointer',
                fontFamily:    'inherit',
                transition:    'border-color 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = tone.dotActive
                e.currentTarget.style.color       = tone.textSecondary
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = tone.hairline
                e.currentTarget.style.color       = tone.skipLinkColor
              }}
            >
              Move to next step →
            </motion.button>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
