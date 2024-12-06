import ReviewsSection from '@/components/ReviewsSection'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/session'
import SetsPanel from '@/components/SetsPanel'

interface CollectionProps {
  params: { id: string }
}

const Collection = async ({ params }: CollectionProps) => {
  const { id } = await params
  const collection = await getCollectionById(id)
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen-nonav bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">{collection.name}</h1>
      {!collection.flashcardSets || collection.flashcardSets.length === 0 ? (
        <div className='no-results'>No flashcard sets found for this collection</div>
      ) : (
        <>
          <SetsPanel initialSets={collection.flashcardSets} />
          <ReviewsSection
            setId={id}
            initialReviews={collection.reviews}
            currentUser={user}
            resourceType={'collections'}
          />
        </>
      )}
    </div>
  )
}

async function getCollectionById(id: string) {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/collections/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    },
  }
  )
  const data = await response.json()
  return data
}

export default Collection