'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTone, TONES, TONE_ORDER } from '../contexts/ToneContext'

export default function ToneSwitcher() {
  const { tone, toneId, setTone } = useTone()
  const [open, setOpen]           = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div
      style={{
        position:      'fixed',
        top:           24,
        right:         28,
        zIndex:        30,
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           8,
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { setOpen(false); setHoveredId(null) }}
    >
      {/* ── Trigger: half-filled split circle ─────────────────────────── */}
      <div
        style={{
          width:      16,
          height:     16,
          cursor:     'pointer',
          opacity:    open ? 0.9 : 0.4,
          transition: 'opacity 0.3s ease',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          {/* Full circle outline */}
          <circle
            cx="8" cy="8" r="5.5"
            stroke={tone.textMuted}
            strokeWidth="1"
            fill="none"
          />
          {/* Right half filled */}
          <path
            d="M8 2.5 A5.5 5.5 0 0 1 8 13.5 Z"
            fill={tone.textMuted}
          />
        </svg>
      </div>

      {/* ── Swatch list ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: -4 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.88, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           8,
            }}
          >
            {TONE_ORDER.map(id => {
              const t         = TONES[id]
              const isActive  = toneId === id
              const isHovered = hoveredId === id

              return (
                <div
                  key={id}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setHoveredId(id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setTone(id)}
                >
                  {/* Tone name tooltip — floats left of swatch */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.span
                        initial={{ opacity: 0, x: 4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{    opacity: 0, x: 4 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{
                          position:       'absolute',
                          right:          'calc(100% + 8px)',
                          top:            '50%',
                          transform:      'translateY(-50%)',
                          fontSize:       9,
                          fontWeight:     500,
                          letterSpacing:  '0.10em',
                          textTransform:  'uppercase',
                          color:          tone.textMuted,
                          whiteSpace:     'nowrap',
                          pointerEvents:  'none',
                          userSelect:     'none',
                          transition:     'color 0.6s ease',
                        }}
                      >
                        {t.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Swatch circle */}
                  <div
                    style={{
                      width:        14,
                      height:       14,
                      borderRadius: '50%',
                      background:   t.swatchColor,
                      cursor:       'pointer',
                      transform:    isHovered ? 'scale(1.25)' : 'scale(1)',
                      // Active ring: double box-shadow creates the 2px gap + 1px ring
                      boxShadow: isActive
                        ? `0 0 0 2px ${tone.bg}, 0 0 0 3px ${t.swatchColor}`
                        : 'none',
                      transition:   'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  />
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
