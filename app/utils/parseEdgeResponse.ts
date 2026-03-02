export type Step = 'dump' | 'challenge' | 'provocation' | 'commit'

export type SegmentType = 'prose' | 'insight' | 'question' | 'challenge' | 'provocation'

export interface Segment {
  type:    SegmentType
  content: string
}

// ── Insight signal phrases ─────────────────────────────────────────────────

const INSIGHT_SIGNALS = [
  "what i'm hearing",
  "what you're really",
  "the real question",
  "what matters here",
  "at its core",
  "beneath this",
  "what's at stake",
  "the real issue",
  "what i hear",
  "the deeper",
  "under the surface",
  "what this is actually",
  "what this is really",
  "what you're after",
  "the tension",
]

function isInsight(text: string): boolean {
  const lower = text.toLowerCase()
  return INSIGHT_SIGNALS.some(s => lower.includes(s))
}

// ── Markdown stripper ──────────────────────────────────────────────────────

export function stripMarkdown(raw: string): string {
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

// Inline-only markdown stripper — preserves block structure, used for option content
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*{1,3}/g, '')
    .replace(/_{1,2}/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim()
}

// ── Commit option pattern — flexible, tested against RAW lines ─────────────
// Matches: "01 — text", "01. text", "1 — text", "1. text"
// Also handles bold markers: "**01** — text", "**01 —** text"

const COMMIT_OPT_RAW = /^(?:\*{1,3})?(?:0?[123])\s*[.—–\-]+\s*(?:\*{1,3})?\s*/

// Strip commit option lines (so EdgeMessage shows only intro/outro when cards are rendered separately)
export function stripCommitOptions(raw: string): string {
  return raw
    .split('\n')
    .filter(line => !COMMIT_OPT_RAW.test(line.trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── Commit response parser ─────────────────────────────────────────────────

export interface CommitParsed {
  intro:   string    // prose before the first option
  options: string[]  // the 3 option texts (prefix stripped)
  outro:   string    // prose after the last option
}

export function parseCommitResponse(raw: string): CommitParsed {
  // Parse option lines from RAW text — before stripMarkdown destroys "01." prefixes.
  // Only strip inline markdown from option content; strip full markdown from prose.
  const lines = raw.split('\n')

  const intro:   string[] = []
  const options: string[] = []
  const outro:   string[] = []
  let state: 'intro' | 'options' | 'outro' = 'intro'

  for (const line of lines) {
    const trimmed = line.trim()

    if (COMMIT_OPT_RAW.test(trimmed)) {
      state = 'options'
      const content = trimmed.replace(COMMIT_OPT_RAW, '').trim()
      options.push(stripInlineMarkdown(content))
      continue
    }

    // After 3 options, anything remaining is outro
    if (state === 'options' && options.length === 3 && trimmed) {
      state = 'outro'
    }

    // Strip full markdown from prose lines (intro / outro)
    const cleanLine = stripMarkdown(trimmed)
    if (state === 'intro') {
      if (cleanLine || intro.length > 0) intro.push(cleanLine)
    } else if (state === 'outro') {
      if (cleanLine || outro.length > 0) outro.push(cleanLine)
    }
  }

  return {
    intro:   intro.join('\n').trim(),
    options,
    outro:   outro.join('\n').trim(),
  }
}

// ── Main response parser (non-commit phases) ───────────────────────────────

export function parseEdgeResponse(raw: string, step: Step): Segment[] {
  const clean      = stripMarkdown(raw)
  const paragraphs = clean.split(/\n\n+/).map(p => p.trim()).filter(Boolean)

  if (paragraphs.length === 0) return []

  // Find closing question — last paragraph ending with "?"
  let questionIdx = -1
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    if (paragraphs[i].endsWith('?')) {
      questionIdx = i
      break
    }
  }

  const segments: Segment[] = []

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i]

    if (i === questionIdx) {
      segments.push({ type: 'question', content: para })
      continue
    }

    // DUMP: wrap insight paragraphs
    if (step === 'dump' && isInsight(para)) {
      segments.push({ type: 'insight', content: para })
      continue
    }

    // CHALLENGE: first substantial paragraph = the challenge statement
    if (step === 'challenge' && segments.length === 0 && para.length > 20) {
      segments.push({ type: 'challenge', content: para })
      continue
    }

    // PROVOCATION: first paragraph tagged so renderer can handle wrapping
    if (step === 'provocation' && segments.length === 0) {
      segments.push({ type: 'provocation', content: para })
      continue
    }

    segments.push({ type: 'prose', content: para })
  }

  return segments
}
