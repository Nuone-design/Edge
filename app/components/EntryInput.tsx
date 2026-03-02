'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTone } from '../contexts/ToneContext'

interface EntryInputProps {
  onSubmit: (query: string) => void
}

export default function EntryInput({ onSubmit }: EntryInputProps) {
  const { tone }    = useTone()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState('')

  function adjustHeight() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  useEffect(() => {
    textareaRef.current?.focus()
    adjustHeight()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    adjustHeight()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed) onSubmit(trimmed)
    }
  }

  return (
    <motion.div
      className="relative w-full max-w-lg px-8 sm:px-0"
      style={{ zIndex: 20 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.35, ease: 'easeIn' } }}
      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="What are you working on?"
        aria-label="What are you working on?"
        className="entry-input"
        rows={1}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        style={{
          width:         '100%',
          display:       'block',
          fontSize:      22,
          fontWeight:    300,
          letterSpacing: '-0.01em',
          lineHeight:    1.5,
          textAlign:     'center',
          color:         tone.textSecondary,
          background:    'transparent',
          border:        'none',
          outline:       'none',
          resize:        'none',
          overflow:      'hidden',
          paddingTop:    8,
          paddingBottom: 8,
          fontFamily:    'inherit',
          caretColor:    tone.caretColor,
          transition:    'color 0.6s ease',
          // CSS var drives ::placeholder color (can't set ::placeholder via inline style directly)
          ['--placeholder-color' as string]: tone.textMuted,
        }}
      />
    </motion.div>
  )
}
