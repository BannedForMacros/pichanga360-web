import { RedirectIfAuthed } from '@/components/auth/RedirectIfAuthed'
import { RegistroCard } from './RegistroCard'

export default function RegistroPage() {
  return (
    <RedirectIfAuthed>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-12">
        <RegistroCard />
      </div>
    </RedirectIfAuthed>
  )
}
