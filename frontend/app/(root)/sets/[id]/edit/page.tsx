import FlashcardSetForm from "@/components/FlashcardSetForm"
import { FlashcardSetType } from "@/lib/types"
import { cookies } from "next/headers"

interface EditSetProps {
  params: { id: string }
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

export default async function EditSet({ params }: EditSetProps) {
  const { id } = await params
  const set = await getFlashcardSetById(id)

  return (
    <section className="bg-gray-100">
      <div className="section_container min-h-screen-nonav bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Edit Flashcard Set
        </h1>
        <FlashcardSetForm initialSet={set} setId={id} />
      </div>
    </section>
  )
}
