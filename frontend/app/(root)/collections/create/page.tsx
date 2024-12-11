import CollectionForm from "@/components/CollectionForm"
import { getFlashcardSets } from "@/lib/api"

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