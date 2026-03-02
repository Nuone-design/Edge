'use client'

import { useEffect, useRef, useState } from 'react'
import { useTone } from '../contexts/ToneContext'

type ThinkingState = 'thinking' | 'streaming' | 'idle'

interface SessionInputProps {
  thinkingState: ThinkingState
  onSubmit:      (query: string) => void
}

export default function SessionInput({ thinkingState, onSubmit }: SessionInputProps) {
  const { tone } = useTone()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value,     setValue]     = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const disabled = thinkingState !== 'idle'

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const capped = Math.min(el.scrollHeight, 200)
    el.style.height = capped + 'px'
    el.style.overflowY = el.scrollHeight > 200 ? 'auto' : 'hidden'
  }, [value])

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus()
  }, [disabled])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed && !disabled) { setValue(''); onSubmit(trimmed) }
    }
  }

  return (
    <div style={{ flexShrink: 0, position: 'relative', width: '100%', maxWidth: 640, margin: '0 auto', zIndex: 2 }}>

      <div
        style={{
          position:      'relative',
          zIndex:        1,
          maxWidth:      640,
          margin:        '0 auto',
          paddingLeft:   48,
          paddingRight:  48,
          paddingTop:    16,
          paddingBottom: 20,
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder="Continue…"
          aria-label="Continue the conversation"
          className="session-input"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          style={{
            width:         '100%',
            display:       'block',
            fontSize:      15,
            fontWeight:    300,
            lineHeight:    1.6,
            fontFamily:    'inherit',
            color:         tone.textPrimary,
            background:    tone.inputBg,
            border:        `1px solid ${isFocused ? tone.inputBorderFocus : tone.inputBorder}`,
            borderRadius:  8,
            boxShadow:     '0 2px 24px rgba(180, 165, 140, 0.15)',
            outline:       'none',
            resize:        'none',
            overflowY:     'hidden',
            paddingTop:    14,
            paddingBottom: 14,
            paddingLeft:   20,
            paddingRight:  20,
            opacity:       disabled ? 0.3 : 1,
            transition:    'opacity 300ms ease, border-color 300ms ease, color 0.6s ease, background-color 0.6s ease',
            caretColor:    tone.caretColor,
            ['--placeholder-color' as string]: tone.textMuted,
          }}
        />
      </div>
    </div>
  )
}
