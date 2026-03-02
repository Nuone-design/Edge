'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MessageList   from './MessageList'
import SessionInput  from './SessionInput'
import StepIndicator from './StepIndicator'
import { useTone }   from '../contexts/ToneContext'
import { parseCommitResponse } from '../utils/parseEdgeResponse'

export type Step = 'dump' | 'challenge' | 'provocation' | 'commit'

export const STEP_ORDER: Step[] = ['dump', 'challenge', 'provocation', 'commit']

export interface Message {
  id:      string
  role:    'user' | 'assistant'
  content: string
}

type ThinkingState = 'thinking' | 'streaming' | 'idle'

interface ArtifactContent {
  messages: { role: 'user' | 'assistant'; content: string }[]
  topic:    string
}

interface SessionViewProps {
  initialQuery:      string
  onThinkingChange:  (thinking: boolean) => void
  onArtifactReady:   (content: ArtifactContent) => void
}

export default function SessionView({
  initialQuery,
  onThinkingChange,
  onArtifactReady,
}: SessionViewProps) {
  const { tone } = useTone()

  const [messages,           setMessages]           = useState<Message[]>([])
  const [thinkingState,      setThinkingState]      = useState<ThinkingState>('thinking')
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [streamingText,      setStreamingText]      = useState('')
  const [step,               setStep]               = useState<Step>('dump')
  const [pendingTransition,  setPendingTransition]  = useState(false)
  const [commitComplete,     setCommitComplete]     = useState(false)

  // Exchange counting per phase — for skip link (shown after 2nd exchange)
  const [phaseExchangeCount, setPhaseExchangeCount] = useState(0)

  // Commit card state
  const [commitOptionsReady,  setCommitOptionsReady]  = useState(false)
  const [commitOptions,       setCommitOptions]        = useState<string[]>([])
  const [commitMessageId,     setCommitMessageId]      = useState<string | null>(null)
  const [selectedCommitCard,  setSelectedCommitCard]   = useState<number | null>(null)

  const abortRef           = useRef<AbortController | null>(null)
  const lastEdgeContentRef = useRef<string>('')

  useEffect(() => {
    const userMsg: Message = { id: 'user-0', role: 'user', content: initialQuery }
    setMessages([userMsg])
    setThinkingState('thinking')
    onThinkingChange(true)
    sendToApi([{ role: 'user', content: initialQuery }], 'dump')
    return () => { abortRef.current?.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function sendToApi(
    apiMessages: { role: 'user' | 'assistant'; content: string }[],
    currentStep: Step,
  ) {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch('/api/session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: apiMessages, step: currentStep }),
        signal:  controller.signal,
      })

      if (!response.ok || !response.body) throw new Error(`API error: ${response.status}`)

      const edgeMsgId = `edge-${Date.now()}`
      let firstChunk  = true
      let buffer      = ''
      let accumulated = ''

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) { if (buffer) accumulated += buffer; break }

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        if (firstChunk) {
          firstChunk = false
          setMessages(prev => [...prev, { id: edgeMsgId, role: 'assistant', content: '' }])
          setStreamingMessageId(edgeMsgId)
          setThinkingState('streaming')
          onThinkingChange(false)
        }

        const lastSpace = buffer.lastIndexOf(' ')
        if (lastSpace !== -1) {
          const wordsToFlush = buffer.slice(0, lastSpace + 1)
          buffer = buffer.slice(lastSpace + 1)
          accumulated += wordsToFlush
          setStreamingText(accumulated.replace('[ADVANCE]', '').trimEnd())
        }
      }

      const hasAdvance = accumulated.includes('[ADVANCE]')
      const finalText  = hasAdvance ? accumulated.replace('[ADVANCE]', '').trimEnd() : accumulated

      lastEdgeContentRef.current = finalText

      setMessages(prev => prev.map(m => (m.id === edgeMsgId ? { ...m, content: finalText } : m)))
      setStreamingMessageId(null)
      setStreamingText('')
      setThinkingState('idle')

      // Increment phase exchange count after each Edge response
      setPhaseExchangeCount(prev => prev + 1)

      if (hasAdvance && currentStep !== 'commit') {
        setPendingTransition(true)
      } else if (currentStep === 'commit') {
        // Parse 3 card options from the commit response
        const parsed = parseCommitResponse(finalText)
        if (parsed.options.length >= 2) {
          setCommitMessageId(edgeMsgId)
          setCommitOptions(parsed.options)
          setCommitOptionsReady(true)
          // commitComplete stays false until the user picks a card
        } else {
          // Fallback: no parseable options — show artifact prompt directly
          setCommitComplete(true)
        }
      }

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Streaming error:', err)
      setThinkingState('idle')
      onThinkingChange(false)
    }
  }

  function handleFollowUp(query: string) {
    if (thinkingState !== 'idle') return
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: query }
    const updatedMessages  = [...messages, userMsg]
    setMessages(updatedMessages)
    setPendingTransition(false)
    setCommitOptionsReady(false)
    setSelectedCommitCard(null)
    setCommitComplete(false)
    setThinkingState('thinking')
    onThinkingChange(true)
    sendToApi(updatedMessages.map(m => ({ role: m.role, content: m.content })), step)
  }

  function handleAdvanceStep() {
    const currentIdx = STEP_ORDER.indexOf(step)
    if (currentIdx >= STEP_ORDER.length - 1) return
    const nextStep       = STEP_ORDER[currentIdx + 1]
    const transitionMsg  = { id: `user-advance-${Date.now()}`, role: 'user' as const, content: "Yes, let's go." }
    const updatedMessages = [...messages, transitionMsg]
    setMessages(updatedMessages)
    setStep(nextStep)
    setPendingTransition(false)
    setPhaseExchangeCount(0)
    setCommitOptionsReady(false)
    setSelectedCommitCard(null)
    setThinkingState('thinking')
    onThinkingChange(true)
    sendToApi(updatedMessages.map(m => ({ role: m.role, content: m.content })), nextStep)
  }

  function handleDismissTransition() { setPendingTransition(false) }

  // Skip link — injects synthetic messages and jumps to next phase
  function handleSkipStep() {
    const currentIdx = STEP_ORDER.indexOf(step)
    if (currentIdx >= STEP_ORDER.length - 1) return
    const nextStep = STEP_ORDER[currentIdx + 1]

    const skipUserMsg: Message = {
      id:      `user-skip-${Date.now()}`,
      role:    'user',
      content: 'Ready to move on.',
    }
    const skipEdgeMsg: Message = {
      id:      `edge-skip-${Date.now()}`,
      role:    'assistant',
      content: "Noted. Let's push forward.",
    }

    // Both synthetic messages appear in the UI
    const updatedMessages = [...messages, skipUserMsg, skipEdgeMsg]
    setMessages(updatedMessages)
    setStep(nextStep)
    setPendingTransition(false)
    setPhaseExchangeCount(0)
    setCommitOptionsReady(false)
    setSelectedCommitCard(null)
    setThinkingState('thinking')
    onThinkingChange(true)

    // API payload must end with a user message — exclude the synthetic Edge ack
    const apiMessages = [...messages, skipUserMsg].map(m => ({
      role:    m.role,
      content: m.content,
    }))
    sendToApi(apiMessages, nextStep)
  }

  // Commit card selection
  function handleCommitCardSelect(idx: number) {
    setSelectedCommitCard(idx)
  }

  // Commit confirmation — selected card locked in, show artifact prompt
  function handleCommitConfirm() {
    setCommitOptionsReady(false)
    setCommitComplete(true)
  }

  function handleGenerateArtifact() {
    onArtifactReady({
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      topic:    initialQuery,
    })
  }

  const showSkipLink = (
    phaseExchangeCount >= 2 &&
    thinkingState === 'idle' &&
    !pendingTransition &&
    !commitOptionsReady &&
    !commitComplete &&
    step !== 'commit'
  )

  return (
    <motion.div
      style={{ position: 'fixed', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <StepIndicator step={step} />

      <MessageList
        messages={messages}
        streamingMessageId={streamingMessageId}
        streamingText={streamingText}
        pendingTransition={pendingTransition}
        commitComplete={commitComplete}
        step={step}
        commitOptionsReady={commitOptionsReady}
        commitOptions={commitOptions}
        commitMessageId={commitMessageId}
        selectedCommitCard={selectedCommitCard}
        showSkipLink={showSkipLink}
        onAdvanceStep={handleAdvanceStep}
        onDismissTransition={handleDismissTransition}
        onGenerateArtifact={handleGenerateArtifact}
        onCommitCardSelect={handleCommitCardSelect}
        onCommitConfirm={handleCommitConfirm}
        onSkipStep={handleSkipStep}
      />

      {/* Fixed bottom glow — viewport-anchored, always behind input */}
      <div style={{
        position:      'fixed',
        bottom:        0,
        left:          0,
        right:         0,
        height:        '50vh',
        background:    `radial-gradient(ellipse 80% 60% at 50% 100%, ${tone.inputGlow} 0%, transparent 70%)`,
        pointerEvents: 'none',
        zIndex:        1,
      }} />

      <SessionInput thinkingState={thinkingState} onSubmit={handleFollowUp} />
    </motion.div>
  )
}
