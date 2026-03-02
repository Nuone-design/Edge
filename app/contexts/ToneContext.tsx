'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export type ToneId = 'warm' | 'sunset' | 'midnight' | 'forest'

export interface ToneColors {
  id: ToneId
  name: string
  // Page background
  bg: string
  // Blob backgrounds (radial gradient strings)
  blobA: string
  blobB: string
  blobC: string
  // Text
  textPrimary: string
  textSecondary: string
  textMuted: string
  // UI chrome
  hairline: string
  inputBg: string
  inputBorder: string
  inputBorderFocus: string
  glowColor: string
  // Step indicator dots/lines
  dotActive: string
  dotPast: string
  dotInactive: string
  lineActive: string
  lineInactive: string
  // Header gradient solid stop
  headerBg: string
  gradientStop: string
  // Artifact zone borders
  zoneBorder: string
  // Tone switcher swatch
  swatchColor: string
  // Cursor caret
  caretColor: string
  // Atmospheric glow behind input
  inputGlow: string
  // Response segment styles
  insightBg:            string  // DUMP: insight block background
  insightBorder:        string  // DUMP: insight left border
  challengeBorder:      string  // CHALLENGE: challenge statement left border
  challengeText:        string  // CHALLENGE: challenge paragraph text color
  challengeLabel:       string  // CHALLENGE: 'Here's my challenge:' label color
  provocationBg:        string  // PROVOCATION: reframe block background
  provocationBorder:    string  // PROVOCATION: reframe block border
  questionColor:        string  // All phases: closing question text color
  commitCardSelectedBg: string  // COMMIT: selected card background
  skipLinkColor:        string  // All phases: "Ready to move on →" link
}

export const TONES: Record<ToneId, ToneColors> = {
  warm: {
    id: 'warm',
    name: 'Warm',
    bg: '#FAF8F5',
    blobA: 'radial-gradient(circle 240px at center, #F5EDD8 0%, transparent 80%)',
    blobB: 'radial-gradient(circle 160px at center, #ECEAE4 0%, transparent 80%)',
    blobC: 'radial-gradient(circle 120px at center, #E8E2D9 0%, transparent 80%)',
    textPrimary:      '#4A4540',
    textSecondary:    '#9A9288',
    textMuted:        '#7A7268',
    hairline:         '#B5AFA8',
    inputBg:          '#F8F5F0',
    inputBorder:      '#E0D9CF',
    inputBorderFocus: '#C5BDB4',
    glowColor:        '#E8DDD0',
    dotActive:        '#6B6560',
    dotPast:          '#B5AFA8',
    dotInactive:      '#DDD7CF',
    lineActive:       '#C5BDB4',
    lineInactive:     '#E0D9CF',
    headerBg:         '#FAF8F5',
    gradientStop:     '#FAF8F5',
    zoneBorder:       '#E0D9CF',
    swatchColor:      '#F0EBE0',
    caretColor:       '#2C2B28',
    inputGlow:        'rgba(180, 160, 120, 0.15)',
    insightBg:            '#F0EBE0',
    insightBorder:        '#C5B9A8',
    challengeBorder:      '#8A7268',
    challengeText:        '#6A5848',
    challengeLabel:       '#9A8878',
    provocationBg:        '#EDE3D5',
    provocationBorder:    '#C5B9A8',
    questionColor:        '#3A3530',
    commitCardSelectedBg: '#F5EEE5',
    skipLinkColor:        '#A09890',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    bg: '#F2E8E0',
    blobA: 'radial-gradient(circle 240px at center, #E8C4A0 0%, transparent 80%)',
    blobB: 'radial-gradient(circle 160px at center, #F0D4A0 0%, transparent 80%)',
    blobC: 'radial-gradient(circle 120px at center, #E0C09A 0%, transparent 80%)',
    textPrimary:      '#3A2820',
    textSecondary:    '#8A6858',
    textMuted:        '#7A5848',
    hairline:         '#D4B090',
    inputBg:          '#EDE0D4',
    inputBorder:      '#D4B090',
    inputBorderFocus: '#C0987A',
    glowColor:        '#D4B090',
    dotActive:        '#6A4830',
    dotPast:          '#C0987A',
    dotInactive:      '#D4C0B0',
    lineActive:       '#C0987A',
    lineInactive:     '#D4C0B0',
    headerBg:         '#F2E8E0',
    gradientStop:     '#F2E8E0',
    zoneBorder:       '#D4B090',
    swatchColor:      '#E8C4A0',
    caretColor:       '#3A2820',
    inputGlow:        'rgba(150, 80, 40, 0.2)',
    insightBg:            '#E8D4C0',
    insightBorder:        '#B89070',
    challengeBorder:      '#7A4830',
    challengeText:        '#5A3828',
    challengeLabel:       '#9A6858',
    provocationBg:        '#E0C8A8',
    provocationBorder:    '#B07060',
    questionColor:        '#3A2820',
    commitCardSelectedBg: '#E8D4C0',
    skipLinkColor:        '#A07860',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    bg: '#0F1218',
    blobA: 'radial-gradient(circle 240px at center, #1A2440 0%, transparent 80%)',
    blobB: 'radial-gradient(circle 160px at center, #0D1830 0%, transparent 80%)',
    blobC: 'radial-gradient(circle 120px at center, #1A1E30 0%, transparent 80%)',
    textPrimary:      '#E8EAF0',
    textSecondary:    '#8890A0',
    textMuted:        '#6870A0',
    hairline:         '#2A3450',
    inputBg:          '#161C28',
    inputBorder:      '#2A3450',
    inputBorderFocus: '#3A4870',
    glowColor:        'rgba(100, 130, 200, 0.3)',
    dotActive:        '#8890C0',
    dotPast:          '#4A5880',
    dotInactive:      '#2A3450',
    lineActive:       '#4A5880',
    lineInactive:     '#2A3450',
    headerBg:         '#0F1218',
    gradientStop:     '#0F1218',
    zoneBorder:       '#2A3450',
    swatchColor:      '#1A2440',
    caretColor:       '#E8EAF0',
    inputGlow:        'rgba(60, 80, 150, 0.2)',
    insightBg:            '#1A2440',
    insightBorder:        '#3A4870',
    challengeBorder:      '#4A6090',
    challengeText:        '#C8D0E0',
    challengeLabel:       '#6A7A9A',
    provocationBg:        '#161E2E',
    provocationBorder:    '#2A3A5A',
    questionColor:        '#C8D0E8',
    commitCardSelectedBg: '#1E2C4A',
    skipLinkColor:        '#5A6880',
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    bg: '#0F1A14',
    blobA: 'radial-gradient(circle 240px at center, #1A3020 0%, transparent 80%)',
    blobB: 'radial-gradient(circle 160px at center, #2A4030 0%, transparent 80%)',
    blobC: 'radial-gradient(circle 120px at center, #1E3828 0%, transparent 80%)',
    textPrimary:      '#E8EDE8',
    textSecondary:    '#889890',
    textMuted:        '#688870',
    hairline:         '#2A4030',
    inputBg:          '#141F18',
    inputBorder:      '#2A4030',
    inputBorderFocus: '#3A5840',
    glowColor:        'rgba(80, 140, 100, 0.3)',
    dotActive:        '#88B890',
    dotPast:          '#486850',
    dotInactive:      '#2A4030',
    lineActive:       '#486850',
    lineInactive:     '#2A4030',
    headerBg:         '#0F1A14',
    gradientStop:     '#0F1A14',
    zoneBorder:       '#2A4030',
    swatchColor:      '#1A3020',
    caretColor:       '#E8EDE8',
    inputGlow:        'rgba(40, 90, 60, 0.2)',
    insightBg:            '#1A2E20',
    insightBorder:        '#3A5840',
    challengeBorder:      '#5A8060',
    challengeText:        '#A8C8A8',
    challengeLabel:       '#6A8870',
    provocationBg:        '#141E18',
    provocationBorder:    '#3A5840',
    questionColor:        '#C0DCC0',
    commitCardSelectedBg: '#1A3022',
    skipLinkColor:        '#5A7860',
  },
}

export const TONE_ORDER: ToneId[] = ['warm', 'sunset', 'midnight', 'forest']

interface ToneContextValue {
  tone: ToneColors
  toneId: ToneId
  setTone: (id: ToneId) => void
}

const ToneContext = createContext<ToneContextValue>({
  tone: TONES.midnight,
  toneId: 'midnight',
  setTone: () => {},
})

export function ToneProvider({ children }: { children: React.ReactNode }) {
  const [toneId, setToneId] = useState<ToneId>('midnight')

  // Sync body background so there's no flash on edges of the viewport
  useEffect(() => {
    document.body.style.backgroundColor = TONES[toneId].bg
    document.body.style.transition = 'background-color 0.6s ease'
  }, [toneId])

  return (
    <ToneContext.Provider value={{ tone: TONES[toneId], toneId, setTone: setToneId }}>
      {children}
    </ToneContext.Provider>
  )
}

export function useTone() {
  return useContext(ToneContext)
}
