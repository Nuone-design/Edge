import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are Edge — a world-class creative director synthesizing a design sparring session into a complete creative artifact.

Based on the conversation, generate a comprehensive creative brief as valid JSON with exactly these fields:

{
  "frame": "Two to three sentences that sharply frame the core design problem — the essential tension rendered as prose. Write like a great design critic would open an essay. No markdown. Always produce a concrete, opinionated frame synthesized from whatever was discussed — never say the problem is unclear or not yet named. If the session was exploratory, make your sharpest read of the underlying tension and commit to it.",
  "standard": "One powerful sentence capturing the creative commitment made in this session — distilled, direct, declarative. Not a summary. A statement of intent.",
  "moodKeywords": ["word1", "word2", "word3", "word4", "word5"],
  "colorPalette": [
    {"hex": "#XXXXXX", "name": "Poetic name", "role": "LIGHT"},
    {"hex": "#XXXXXX", "name": "Poetic name", "role": "GROUND"},
    {"hex": "#XXXXXX", "name": "Poetic name", "role": "SECONDARY"},
    {"hex": "#XXXXXX", "name": "Poetic name", "role": "PRIMARY"},
    {"hex": "#XXXXXX", "name": "Poetic name", "role": "ACCENT"},
    {"hex": "#XXXXXX", "name": "Poetic name", "role": "CONTRAST"},
    {"hex": "#XXXXXX", "name": "Poetic name", "role": "DARK"}
  ],
  "typography": [
    {"family": "Exact Google Font Name", "style": "Primary use — one short phrase", "sample": "3-5 word sample"},
    {"family": "Exact Google Font Name", "style": "Secondary use — one short phrase", "sample": "3-5 word sample"}
  ],
  "principles": [
    "Principle name — one sentence that is specific and actionable",
    "Principle name — one sentence that is specific and actionable",
    "Principle name — one sentence that is specific and actionable"
  ],
  "referenceTerms": ["word1", "word2", "word3", "word4", "word5", "word6"],
  "visionTerms": ["word1", "word2"],
  "avoid": "One paragraph (2-3 sentences) describing what this work should never look, feel, or sound like. Sharp and specific, not generic."
}

Rules — every element must be specific to this project, never generic:
- colorPalette: EXACTLY 7 swatches — the array must have 7 objects, one for each role in this order: LIGHT, GROUND, SECONDARY, PRIMARY, ACCENT, CONTRAST, DARK. Do not merge, skip, or rename any role. LIGHT is a near-white or pale tint (e.g. #F8F6F2); GROUND is the page/canvas background; SECONDARY is a mid-tone supporting colour; PRIMARY is the dominant brand colour; ACCENT is the boldest highlight; CONTRAST is a sharp opposing tone; DARK is the deepest anchor shade (e.g. near-black #1A1916). Span the full luminance range so the system feels complete. Name each poetically — "Bone", "Tar", "Dusk", "Threshold" not "Light Grey", "Dark Blue"
- typography: real typeface names available on Google Fonts that would work together
- moodKeywords: single words capturing the project's territory — material, spatial, cultural, emotional
- principles: start each with a strong noun or verb; make them feel like convictions not guidelines
- referenceTerms: 6 single English words for Flickr image search — visual, material, spatial references
- visionTerms: 2 single English words for aspirational mood imagery
- avoid: prose, not a list; end with the definitive thing this work refuses to be

Return ONLY valid JSON. No markdown code fences. No text outside the JSON object.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, topic } = body as {
      messages: { role: 'user' | 'assistant'; content: string }[]
      topic:    string
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages' }), {
        status:  400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const conversation = messages
      .map(m => `${m.role === 'user' ? 'Designer' : 'Edge'}: ${m.content}`)
      .join('\n\n')

    const prompt = `Design session topic: ${topic}\n\nFull conversation:\n${conversation}\n\nGenerate the complete creative artifact JSON.`

    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1600,
      system:     SYSTEM,
      messages:   [{ role: 'user', content: prompt }],
    })

    const raw  = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'
    const text = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
    const data = JSON.parse(text)

    // Guarantee 7 palette swatches — pad with neutral shades if model returned fewer
    const REQUIRED_ROLES = ['LIGHT', 'GROUND', 'SECONDARY', 'PRIMARY', 'ACCENT', 'CONTRAST', 'DARK']
    const ROLE_DEFAULTS: Record<string, { hex: string; name: string }> = {
      LIGHT:    { hex: '#F8F6F2', name: 'Bone'      },
      GROUND:   { hex: '#F2EFE8', name: 'Parchment' },
      SECONDARY:{ hex: '#9A9088', name: 'Stone'     },
      PRIMARY:  { hex: '#3A3530', name: 'Charcoal'  },
      ACCENT:   { hex: '#C8971E', name: 'Amber'     },
      CONTRAST: { hex: '#4A6B5A', name: 'Moss'      },
      DARK:     { hex: '#1A1916', name: 'Tar'       },
    }
    if (Array.isArray(data.colorPalette)) {
      const existingRoles = new Set(data.colorPalette.map((s: {role: string}) => s.role))
      for (const role of REQUIRED_ROLES) {
        if (!existingRoles.has(role)) {
          data.colorPalette.push({ ...ROLE_DEFAULTS[role], role })
        }
      }
      // Sort into canonical order
      data.colorPalette.sort((a: {role: string}, b: {role: string}) =>
        REQUIRED_ROLES.indexOf(a.role) - REQUIRED_ROLES.indexOf(b.role)
      )
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Artifact route error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status:  500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
