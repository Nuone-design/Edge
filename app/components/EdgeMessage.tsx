'use client'

import { motion } from 'framer-motion'
import { useTone } from '../contexts/ToneContext'
import {
  parseEdgeResponse,
  stripMarkdown,
  stripCommitOptions,
  Segment,
} from '../utils/parseEdgeResponse'

// Local Step type — structurally identical to SessionView's, avoids circular import
type Step = 'dump' | 'challenge' | 'provocation' | 'commit'

interface EdgeMessageProps {
  text:      string
  streaming: boolean
  step:      Step
}

// ── Base text style ────────────────────────────────────────────────────────

const BASE: React.CSSProperties = {
  fontSize:      19,
  fontWeight:    300,
  lineHeight:    1.8,
  letterSpacing: '-0.01em',
  margin:        0,
}

// ── Segment block components ───────────────────────────────────────────────

function ProseBlock({
  text,
  color,
  animate = false,
  delay   = 0,
}: {
  text:     string
  color:    string
  animate?: boolean
  delay?:   number
}) {
  const content = (
    <p style={{ ...BASE, color, minHeight: '1.8em', transition: 'color 0.6s ease' }}>
      {text}
    </p>
  )
  if (!animate) return content
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  )
}

function InsightBlock({
  text,
  bg,
  border,
  color,
  delay = 0,
}: {
  text:   string
  bg:     string
  border: string
  color:  string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      style={{
        background:   bg,
        borderLeft:   `2px solid ${border}`,
        borderRadius: 4,
        padding:      '12px 16px',
        transition:   'background 0.6s ease, border-color 0.6s ease',
      }}
    >
      <p style={{ ...BASE, color, margin: 0, transition: 'color 0.6s ease' }}>
        {text}
      </p>
    </motion.div>
  )
}

function QuestionBlock({
  text,
  color,
  delay     = 0,
  marginTop = 24,
  fontSize  = 21,
}: {
  text:       string
  color:      string
  delay?:     number
  marginTop?: number
  fontSize?:  number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      style={{ marginTop }}
    >
      <p
        style={{
          fontSize,
          fontWeight:    300,
          lineHeight:    1.7,
          letterSpacing: '-0.02em',
          color,
          margin: 0,
          transition: 'color 0.6s ease',
        }}
      >
        {text}
      </p>
    </motion.div>
  )
}

function ChallengeBlock({
  text,
  border,
  color,
  labelColor,
  delay = 0,
}: {
  text:       string
  border:     string
  color:      string
  labelColor: string
  delay?:     number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      style={{
        borderLeft:  `3px solid ${border}`,
        paddingLeft: 20,
        transition:  'border-color 0.6s ease',
      }}
    >
      <span
        style={{
          display:       'block',
          fontSize:      11,
          fontWeight:    400,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color:         labelColor,
          marginBottom:  8,
          transition:    'color 0.6s ease',
        }}
      >
        Here&apos;s my challenge:
      </span>
      <p
        style={{
          fontSize:      20,
          fontWeight:    300,
          lineHeight:    1.7,
          letterSpacing: '-0.01em',
          color,
          margin:        0,
          transition:    'color 0.6s ease',
        }}
      >
        {text}
      </p>
    </motion.div>
  )
}

function ProvocationBlock({
  segments,
  bg,
  border,
  textPrimary,
  labelColor,
}: {
  segments:    Segment[]
  bg:          string
  border:      string
  textPrimary: string
  labelColor:  string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ marginTop: 40, marginBottom: 32 }}
    >
      <div
        style={{
          background:   bg,
          border:       `1px solid ${border}`,
          borderRadius: 4,
          padding:      36,
          transition:   'background 0.6s ease, border-color 0.6s ease',
        }}
      >
        {/* Stage-direction label */}
        <span
          style={{
            display:    'block',
            fontSize:   14,
            fontStyle:  'italic',
            fontFamily: 'var(--font-playfair)',
            color:      labelColor,
            marginBottom: 20,
            transition: 'color 0.6s ease',
          }}
        >
          Here&apos;s the provocation:
        </span>

        {segments.map((seg, i) => {
          // First segment = the money line — visual weight
          if (i === 0) {
            return (
              <p
                key={i}
                style={{
                  fontSize:      20,
                  fontWeight:    400,
                  lineHeight:    1.7,
                  letterSpacing: '-0.01em',
                  color:         textPrimary,
                  margin:        0,
                  marginTop:     12,
                  marginBottom:  segments.length > 1 ? 20 : 12,
                  transition:    'color 0.6s ease',
                }}
              >
                {seg.content}
              </p>
            )
          }
          // Subsequent paragraphs — body prose
          return (
            <p
              key={i}
              style={{
                fontSize:   18,
                fontWeight: 300,
                lineHeight: 1.9,
                color:      textPrimary,
                margin:     0,
                marginTop:  i > 1 ? 20 : 0,
                transition: 'color 0.6s ease',
              }}
            >
              {seg.content}
            </p>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Streaming cursor ───────────────────────────────────────────────────────

function StreamingCursor({ hairline }: { hairline: string }) {
  return (
    <motion.span
      style={{
        display:       'inline-block',
        width:         2,
        height:        '1em',
        background:    hairline,
        marginLeft:    2,
        verticalAlign: 'text-bottom',
        transition:    'background 0.6s ease',
      }}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ── Main EdgeMessage component ─────────────────────────────────────────────

export default function EdgeMessage({ text, streaming, step }: EdgeMessageProps) {
  const { tone } = useTone()

  // ── Streaming: flat rendering ──────────────────────────────────────────
  if (streaming) {
    const clean = stripMarkdown(text)
    return (
      <motion.div
        style={{ position: 'relative', paddingLeft: 28 }}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div
          style={{
            position:   'absolute',
            left:       4,
            top:        0,
            bottom:     0,
            width:      1,
            background: tone.hairline,
            transition: 'background 0.6s ease',
          }}
        />
        <p
          style={{
            ...BASE,
            color:     tone.textPrimary,
            minHeight: '1.8em',
            transition: 'color 0.6s ease',
          }}
        >
          {clean}
          <StreamingCursor hairline={tone.hairline} />
        </p>
      </motion.div>
    )
  }

  // ── Commit phase: always strip option lines (cards rendered separately) ─
  if (step === 'commit') {
    const displayText = stripCommitOptions(text)
    const clean       = stripMarkdown(displayText)
    const paragraphs  = clean.split(/\n\n+/).map(p => p.trim()).filter(Boolean)

    return (
      <motion.div
        style={{ position: 'relative', paddingLeft: 28 }}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div
          style={{
            position:   'absolute',
            left:       4,
            top:        0,
            bottom:     0,
            width:      1,
            background: tone.hairline,
            transition: 'background 0.6s ease',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {paragraphs.map((para, i) => (
            <ProseBlock key={i} text={para} color={tone.textPrimary} animate delay={i * 0.06} />
          ))}
        </div>
      </motion.div>
    )
  }

  // ── Parsed rendering for dump / challenge / provocation ────────────────
  const segments = parseEdgeResponse(text, step)

  // For provocation: collect non-question segments into a block, then render question
  if (step === 'provocation') {
    const provSegments = segments.filter(s => s.type !== 'question')
    const question     = segments.find(s => s.type === 'question')

    // Short ack messages (e.g. "Noted. Let's push forward.") → simple prose, no card
    const isAck = provSegments.length === 1 && provSegments[0].content.length < 80

    if (isAck) {
      return (
        <motion.div
          style={{ position: 'relative', paddingLeft: 28 }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div style={{
            position:   'absolute',
            left:       4, top: 0, bottom: 0, width: 1,
            background: tone.hairline,
            transition: 'background 0.6s ease',
          }} />
          <p style={{ ...BASE, color: tone.textPrimary, transition: 'color 0.6s ease' }}>
            {provSegments[0].content}
          </p>
        </motion.div>
      )
    }

    return (
      <motion.div
        style={{ position: 'relative' }}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {provSegments.length > 0 && (
          <ProvocationBlock
            segments={provSegments}
            bg={tone.provocationBg}
            border={tone.provocationBorder}
            textPrimary={tone.textPrimary}
            labelColor={tone.challengeLabel}
          />
        )}
        {question && (
          <div style={{ paddingLeft: 28, marginTop: 8 }}>
            <QuestionBlock text={question.content} color={tone.questionColor} delay={0.2} />
          </div>
        )}
      </motion.div>
    )
  }

  // For dump + challenge: standard segment rendering
  // Count non-question segments to decide whether to add gaps between them
  const nonQuestionCount = segments.filter(s => s.type !== 'question').length
  const gapBetweenBlocks =
    step === 'challenge' ? 24 :
    (step === 'dump' && nonQuestionCount > 2 ? 16 : 0)

  return (
    <motion.div
      style={{ position: 'relative', paddingLeft: 28 }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Hairline — editorial accent */}
      <div
        style={{
          position:   'absolute',
          left:       4,
          top:        0,
          bottom:     0,
          width:      1,
          background: tone.hairline,
          transition: 'background 0.6s ease',
        }}
      />

      <div
        style={{
          display:       'flex',
          flexDirection: 'column',
          gap:           gapBetweenBlocks > 0 ? gapBetweenBlocks : 20,
        }}
      >
        {segments.map((seg, i) => {
          const delay = i * 0.07

          if (seg.type === 'insight') {
            return (
              <InsightBlock
                key={i}
                text={seg.content}
                bg={tone.insightBg}
                border={tone.insightBorder}
                color={tone.textPrimary}
                delay={delay}
              />
            )
          }

          if (seg.type === 'question') {
            const isChallenge = step === 'challenge'
            return (
              <QuestionBlock
                key={i}
                text={seg.content}
                color={isChallenge ? tone.textPrimary : tone.questionColor}
                delay={delay}
                marginTop={isChallenge ? 32 : 24}
                fontSize={isChallenge ? 22 : 21}
              />
            )
          }

          if (seg.type === 'challenge') {
            return (
              <ChallengeBlock
                key={i}
                text={seg.content}
                border={tone.challengeBorder}
                color={tone.challengeText}
                labelColor={tone.challengeLabel}
                delay={delay}
              />
            )
          }

          // Default: prose
          return (
            <ProseBlock
              key={i}
              text={seg.content}
              color={tone.textPrimary}
              animate
              delay={delay}
            />
          )
        })}
      </div>
    </motion.div>
  )
}
