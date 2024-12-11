import CollectionForm from "@/components/CollectionForm"
import { getCollectionById, getFlashcardSets } from "@/lib/api"
import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"

interface EditCollectionProps {
  params: { id: string }
}

export default async function EditCollection({ params }: EditCollectionProps) {
  const { id } = await params
  const collection = await getCollectionById(id)
  const user = await getCurrentUser()

  // Redirect user to the collection if they do not have permission to edit
  if (collection.userId != user.id) {
    redirect(`/collections/${id}`)
  }

  // Get the available sets to pass to the form component
  const sets = await getFlashcardSets()

  // Extract the flashcard set IDs to pass to the form component
  const flashcardSetIds = collection.flashcardSets.map(set => set.id)

  return (
    <section>
      <div className="min-h-screen">
        <h1 className="title title-background">
          Edit a Flashcard Set Collection
        </h1>
        <div className="section_container">
          <CollectionForm
            initialCollection={{
              name: collection.name,
              description: collection.description,
              flashcardSetIds: flashcardSetIds
            }}
            collectionId={id}
            sets={sets}
          />
        </div>
      </div>
    </section>
  )
}
