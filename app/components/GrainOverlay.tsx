export default function GrainOverlay() {
  return (
    <>
      <svg
        aria-hidden="true"
        style={{ position: 'fixed', width: 0, height: 0, pointerEvents: 'none' }}
      >
        <defs>
          <filter
            id="grain"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
              result="noiseOut"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noiseOut"
              result="greyNoise"
            />
            <feBlend
              in="SourceGraphic"
              in2="greyNoise"
              mode="multiply"
              result="blended"
            />
            <feComponentTransfer in="blended">
              <feFuncA type="linear" slope="0.08" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 10,
          filter: 'url(#grain)',
        }}
      />
    </>
  )
}
