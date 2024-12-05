import CollectionForm from "@/components/CollectionForm"
import { cookies } from "next/headers"


export default async function CreateCollection() {
  const sets = await getFlashcardSets()

  return (
    <section className="bg-gray-100">
      <div className="section_container min-h-screen-nonav bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Create Flashcard Set Collection
        </h1>
        <div>
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
  }
  )
  const data = await response.json()
  return data
}