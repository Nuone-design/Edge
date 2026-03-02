'use client'

import { motion } from 'framer-motion'
import { useTone } from '../contexts/ToneContext'

export default function Wordmark() {
  const { tone } = useTone()

  return (
    <motion.div
      aria-label="Edge"
      style={{
        position:      'fixed',
        top:           28,
        left:          32,
        zIndex:        30,
        fontFamily:    'var(--font-geist-sans), Inter, system-ui, sans-serif',
        fontSize:      11,
        fontWeight:    300,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color:         tone.textMuted,
        pointerEvents: 'none',
        userSelect:    'none',
        transition:    'color 0.6s ease',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, delay: 0.6, ease: 'easeOut' }}
    >
      Edge
    </motion.div>
  )
}
