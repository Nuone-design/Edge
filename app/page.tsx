'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ToneProvider, useTone } from '@/app/contexts/ToneContext'
import AmbientCanvas  from '@/app/components/AmbientCanvas'
import GrainOverlay   from '@/app/components/GrainOverlay'
import EntryInput     from '@/app/components/EntryInput'
import Wordmark       from '@/app/components/Wordmark'
import SessionView    from '@/app/components/SessionView'
import ArtifactCanvas from '@/app/components/ArtifactCanvas'
import ToneSwitcher   from '@/app/components/ToneSwitcher'

type Screen = 'entry' | 'session' | 'artifact'

interface ArtifactContent {
  messages: { role: 'user' | 'assistant'; content: string }[]
  topic:    string
}

// ── Inner app (needs access to ToneContext) ────────────────────────────────

function App() {
  const { tone } = useTone()

  const [screen,          setScreen]          = useState<Screen>('entry')
  const [initialQuery,    setInitialQuery]    = useState('')
  const [thinking,        setThinking]        = useState(false)
  const [artifactContent, setArtifactContent] = useState<ArtifactContent | null>(null)

  function handleEntry(query: string) {
    setInitialQuery(query)
    setScreen('session')
  }

  function handleArtifactReady(content: ArtifactContent) {
    setArtifactContent(content)
    setScreen('artifact')
  }

  return (
    <main
      style={{
        position:        'relative',
        height:          '100dvh',
        width:           '100vw',
        backgroundColor: tone.bg,
        overflow:        'hidden',
        transition:      'background-color 0.6s ease',
        // Entry screen: center the input
        display:         screen === 'entry' ? 'flex'  : 'block',
        alignItems:      screen === 'entry' ? 'center' : undefined,
        justifyContent:  screen === 'entry' ? 'center' : undefined,
        paddingBottom:   screen === 'entry' ? '10vh'   : undefined,
      }}
    >
      <AmbientCanvas thinking={thinking} />
      <GrainOverlay />
      <Wordmark />
      <ToneSwitcher />

      <AnimatePresence mode="wait">
        {screen === 'entry' ? (
          <EntryInput key="entry" onSubmit={handleEntry} />
        ) : screen === 'session' ? (
          <SessionView
            key="session"
            initialQuery={initialQuery}
            onThinkingChange={setThinking}
            onArtifactReady={handleArtifactReady}
          />
        ) : artifactContent ? (
          <motion.div
            key="artifact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <ArtifactCanvas content={artifactContent} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  )
}

// ── Root export (provides tone context) ───────────────────────────────────

export default function Page() {
  return (
    <ToneProvider>
      <App />
    </ToneProvider>
  )
}
