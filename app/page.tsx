import AmbientCanvas from '@/app/components/AmbientCanvas'
import GrainOverlay from '@/app/components/GrainOverlay'
import EntryInput from '@/app/components/EntryInput'

export default function Page() {
  return (
    <main className="relative h-screen w-screen bg-canvas overflow-hidden flex items-center justify-center">
      <AmbientCanvas />
      <GrainOverlay />
      <EntryInput />
    </main>
  )
}
