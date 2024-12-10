import CollectionForm from "@/components/CollectionForm"
import { cookies } from "next/headers"


export default async function CreateCollection() {
  const sets = await getFlashcardSets()

  return (
    <section>
      <div className="min-h-screen">
        <h1 className="title title-background">
          Create a Flashcard Set Collection
        </h1>
        <div className="section_container">
          <CollectionForm sets={sets} />
        </div>
      </div>
    </section>
  )
}

async function getFlashcardSets() {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/sets/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    }
  })
  const data = await response.json()
  return data
}