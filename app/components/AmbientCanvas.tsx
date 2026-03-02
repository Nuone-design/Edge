'use client'

import { motion } from 'framer-motion'
import { useTone } from '../contexts/ToneContext'

// ── Orb motion paths (6-point closed-loop — first === last for seamless repeat) ──

const ORB_PATHS = [
  {
    // Warm ivory — upper-right. Primary light source.
    opacityNormal: 0.50,
    pulseMin:      0.32,
    pulseMax:      0.60,
    pulseDelay:    0,
    width:         600,
    height:        600,
    blur:          60,
    animateX:      ['16vw',  '12vw', '8vw',   '11vw', '18vw', '16vw'],
    animateY:      ['-10vh', '-6vh', '-3vh',   '-8vh', '-13vh', '-10vh'],
    duration:      25,
    delay:         0,
  },
  {
    // Cooler cream — lower-left. Secondary bounce.
    opacityNormal: 0.40,
    pulseMin:      0.24,
    pulseMax:      0.50,
    pulseDelay:    0.6,
    width:         400,
    height:        400,
    blur:          50,
    animateX:      ['-20vw', '-16vw', '-12vw', '-17vw', '-23vw', '-20vw'],
    animateY:      ['16vh',  '12vh',  '9vh',   '14vh',  '19vh',  '16vh'],
    duration:      35,
    delay:         8,
  },
  {
    // Warm grey — bottom-left. Third source: depth + asymmetry.
    opacityNormal: 0.28,
    pulseMin:      0.18,
    pulseMax:      0.36,
    pulseDelay:    1.2,
    width:         300,
    height:        300,
    blur:          40,
    animateX:      ['-30vw', '-26vw', '-34vw', '-28vw', '-24vw', '-30vw'],
    animateY:      ['30vh',  '26vh',  '34vh',  '32vh',  '28vh',  '30vh'],
    duration:      40,
    delay:         16,
  },
]

const ORB_BG_KEYS = ['blobA', 'blobB', 'blobC'] as const

interface AmbientCanvasProps {
  thinking?: boolean
}

export default function AmbientCanvas({ thinking = false }: AmbientCanvasProps) {
  const { tone } = useTone()

  return (
    <div
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:         0,
        pointerEvents: 'none',
        zIndex:        0,
        overflow:      'hidden',
      }}
    >
      {ORB_PATHS.map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position:    'absolute',
            top:         '50%',
            left:        '50%',
            width:       orb.width,
            height:      orb.height,
            marginLeft:  -orb.width  / 2,
            marginTop:   -orb.height / 2,
            background:  tone[ORB_BG_KEYS[i]],
            filter:      `blur(${orb.blur}px)`,
            willChange:  'transform, opacity',
          }}
          animate={{
            x: orb.animateX,
            y: orb.animateY,
            opacity: thinking
              ? [orb.pulseMin, orb.pulseMax]
              : orb.opacityNormal,
          }}
          transition={{
            x: {
              duration:    orb.duration,
              delay:       orb.delay,
              ease:        'easeInOut',
              repeat:      Infinity,
              repeatType:  'loop',
              repeatDelay: 0,
            },
            y: {
              duration:    orb.duration,
              delay:       orb.delay,
              ease:        'easeInOut',
              repeat:      Infinity,
              repeatType:  'loop',
              repeatDelay: 0,
            },
            opacity: thinking
              ? {
                  duration:   2.5,
                  delay:      orb.pulseDelay,
                  ease:       'easeInOut',
                  repeat:     Infinity,
                  repeatType: 'mirror',
                }
              : {
                  duration: 1.2,
                  ease:     'easeOut',
                },
          }}
        />
      ))}
    </div>
  )
}
