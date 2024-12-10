import FlashcardSetForm from "@/components/SetForm"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/session"

export default async function CreateSet() {
  const user = await getCurrentUser()
  const canCreate = user.admin ? true : await canCreateSet()

  return (
    <section>
      <div className="min-h-screen">
        <h1 className="title title-background">
          Create a Flashcard Set
        </h1>

        {canCreate ? (
          <>
            <div className="section_container">
              <FlashcardSetForm />
            </div>
          </>
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