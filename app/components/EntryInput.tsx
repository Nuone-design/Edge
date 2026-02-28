'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function EntryInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <motion.div
      className="relative w-full max-w-xl px-6 sm:px-0"
      style={{ zIndex: 20 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="What are you working on?"
        aria-label="What are you working on?"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="
          w-full block
          text-2xl sm:text-3xl lg:text-4xl
          font-light
          tracking-[-0.02em]
          leading-snug
          text-ink
          placeholder:text-ash placeholder:font-light
          bg-transparent
          border-0 border-b border-rule
          focus:border-ash
          outline-none focus:outline-none
          transition-colors duration-300
          py-3 px-0
        "
      />
    </motion.div>
  )
}
