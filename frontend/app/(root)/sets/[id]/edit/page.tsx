import FlashcardSetForm from "@/components/FlashcardSetForm"
import { getCurrentUser } from "@/lib/session"
import { cookies } from "next/headers"
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
      <div className="section_container min-h-screen-nonav p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Edit Flashcard Set
        </h1>
        <FlashcardSetForm initialSet={set} setId={id} />
      </div>
    </section>
  )
}

async function getFlashcardSetById(id: string) { // : Promise<FlashcardSetType> {
  const sessionToken = (await cookies()).get('sessionToken')?.value
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/sets/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch flashcard set')
  }

  return response.json()
}