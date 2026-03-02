'use client'

import { motion } from 'framer-motion'
import { useTone } from '../contexts/ToneContext'
import { Step } from './SessionView'

const STEPS: { key: Step; label: string }[] = [
  { key: 'dump',        label: 'DUMP' },
  { key: 'challenge',   label: 'CHALLENGE' },
  { key: 'provocation', label: 'PROVOCATION' },
  { key: 'commit',      label: 'COMMIT' },
]

interface StepIndicatorProps {
  step: Step
}

export default function StepIndicator({ step }: StepIndicatorProps) {
  const { tone }  = useTone()
  const activeIdx = STEPS.findIndex(s => s.key === step)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        right:         0,
        height:        80,
        zIndex:        30,
        pointerEvents: 'none',
        background:    `linear-gradient(to bottom, ${tone.headerBg} 0%, ${tone.headerBg} 58%, transparent 100%)`,
        transition:    'background 0.6s ease',
      }}
    >
      <div
        style={{
          display:        'flex',
          justifyContent: 'center',
          alignItems:     'flex-start',
          paddingTop:     22,
        }}
      >
        {STEPS.map((s, i) => {
          const isPast   = i < activeIdx
          const isActive = i === activeIdx

          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'flex-start' }}>

              {i > 0 && (
                <div
                  style={{
                    width:      28,
                    height:     1,
                    marginTop:  4,
                    background: isPast ? tone.lineActive : tone.lineInactive,
                    transition: 'background 600ms ease',
                  }}
                />
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div
                  style={{
                    width:        isActive ? 5 : 3,
                    height:       isActive ? 5 : 3,
                    borderRadius: '50%',
                    background:   isActive ? tone.dotActive : isPast ? tone.dotPast : tone.dotInactive,
                    boxShadow:    isActive ? '0 0 8px 4px rgba(175, 155, 130, 0.30)' : 'none',
                    transition:   'width 500ms ease, height 500ms ease, background 500ms ease, box-shadow 500ms ease',
                  }}
                />
                <span
                  style={{
                    fontSize:      9,
                    fontWeight:    500,
                    letterSpacing: '0.10em',
                    color:         isActive ? tone.dotActive : isPast ? tone.textSecondary : tone.lineInactive,
                    transition:    'color 500ms ease',
                    userSelect:    'none',
                  }}
                >
                  {s.label}
                </span>
              </div>

            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
