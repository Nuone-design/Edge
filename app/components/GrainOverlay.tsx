'use client'

import { useEffect, useRef } from 'react'

const FRAME_COUNT = 3   // grain frames to cycle through
const FLICK_MS    = 110 // ~3 frames at 30fps — film grain cadence

function buildFrame(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)

  for (let i = 0; i < data.length; i += 4) {
    const lum   = Math.random() * 255 | 0
    data[i]     = Math.min(255, lum + 6)  // R: slightly warm
    data[i + 1] = lum                      // G: neutral
    data[i + 2] = Math.max(0,  lum - 8)   // B: slightly cool
    // Alpha: biased toward low end with pow() skew
    data[i + 3] = Math.pow(Math.random(), 1.5) * 46 | 0
  }

  return new ImageData(data, width, height)
}

export default function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width  = w
    canvas.height = h

    let frames   = Array.from({ length: FRAME_COUNT }, () => buildFrame(w, h))
    let frameIdx  = 0
    let lastFlick = 0
    let rafId: number

    ctx.putImageData(frames[0], 0, 0)

    const tick = (now: number) => {
      if (now - lastFlick >= FLICK_MS) {
        frameIdx = (frameIdx + 1) % FRAME_COUNT
        ctx.putImageData(frames[frameIdx], 0, 0)
        lastFlick = now
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    const handleResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width  = w
      canvas.height = h
      frames   = Array.from({ length: FRAME_COUNT }, () => buildFrame(w, h))
      frameIdx = 0
      ctx.putImageData(frames[0], 0, 0)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        10,
        mixBlendMode:  'multiply',
        opacity:       0.55,
      }}
    />
  )
}
