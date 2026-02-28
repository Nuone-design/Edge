'use client'

import { motion } from 'framer-motion'

const orbs = [
  {
    id: 'orb-a',
    background: 'radial-gradient(ellipse 900px 700px at center, #F5EDD8 0%, transparent 70%)',
    width: 900,
    height: 700,
    opacity: 0.55,
    initialX: '20vw',
    initialY: '-15vh',
    animateX: ['20vw', '14vw', '20vw'],
    animateY: ['-15vh', '-8vh', '-15vh'],
    duration: 22,
    delay: 0,
  },
  {
    id: 'orb-b',
    background: 'radial-gradient(ellipse 800px 600px at center, #F0EBE0 0%, transparent 70%)',
    width: 800,
    height: 600,
    opacity: 0.45,
    initialX: '-25vw',
    initialY: '20vh',
    animateX: ['-25vw', '-18vw', '-25vw'],
    animateY: ['20vh', '12vh', '20vh'],
    duration: 28,
    delay: 4,
  },
]

export default function AmbientCanvas() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: orb.width,
            height: orb.height,
            marginLeft: -orb.width / 2,
            marginTop: -orb.height / 2,
            background: orb.background,
            opacity: orb.opacity,
            filter: 'blur(80px)',
            willChange: 'transform',
          }}
          initial={{ x: orb.initialX, y: orb.initialY }}
          animate={{ x: orb.animateX, y: orb.animateY }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror',
          }}
        />
      ))}
    </div>
  )
}
