'use client'

import { motion } from 'framer-motion'
import { useTone } from '../contexts/ToneContext'

interface UserMessageProps {
  text: string
}

export default function UserMessage({ text }: UserMessageProps) {
  const { tone } = useTone()

  return (
    <motion.p
      style={{
        fontSize:   15,
        fontWeight: 300,
        lineHeight: 1.6,
        color:      tone.textSecondary,
        margin:     0,
        transition: 'color 0.6s ease',
      }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {text}
    </motion.p>
  )
}
