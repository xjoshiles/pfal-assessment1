import FlashcardSetForm from "@/components/FlashcardSetForm"
import { cookies } from "next/headers"

async function canCreateSet(): Promise<boolean> {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/limits/sets`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch creation limitations')
  }

  const info = await response.json()
  return info.today < info.limit ? true : false
}

export default async function CreateSet() {
  return (
    <section className="bg-gray-100">
      <div className="section_container min-h-screen-nonav bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Create Flashcard Set
        </h1>

        {await canCreateSet() ? (
          <FlashcardSetForm
            initialSet={{
              name: '',
              description: '',
              flashcards: [{ question: '', answer: '', difficulty: 'easy' }],
            }}
          />
          ) : (
            <div className="form-error-text mt-8">
              Daily set creation limit reached, please try again tomorrow
            </div>
          )
        }
      </div>
    </section>
  )
}
