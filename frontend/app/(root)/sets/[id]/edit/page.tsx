import SetForm from "@/components/SetForm"
import { getFlashcardSetById } from "@/lib/api"
import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"

interface EditSetProps {
  params: { id: string }
}

export default async function EditSet({ params }: EditSetProps) {
  const { id } = await params
  const set = await getFlashcardSetById(id)
  const user = await getCurrentUser()

  // Redirect user to the set if they do not have permission to edit
  if (set.userId != user.id) {
    redirect(`/sets/${id}`)
  }

  return (
    <section>
      <div className="min-h-screen">
        <h1 className="title title-background">
          Edit a Flashcard Set
        </h1>
        <div className="section_container">
        <SetForm initialSet={set} setId={id} />
        </div>
      </div>
    </section>
  )
}