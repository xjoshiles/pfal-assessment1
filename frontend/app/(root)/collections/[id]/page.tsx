import ReviewsSection from '@/components/ReviewsSection'
import { cookies } from 'next/headers'
import SetsPanel from '@/components/SetsPanel'

interface CollectionProps {
  params: { id: string }
}

const Collection = async ({ params }: CollectionProps) => {
  const { id } = await params
  const collection = await getCollectionById(id)

  return (
    <div className="min-h-screen">
      <h1 className="title title-background">{collection.name}</h1>
      <div className='px-8'>
        {!collection.flashcardSets || collection.flashcardSets.length === 0 ? (
          <div className='no-results'>No flashcard sets found for this collection</div>
        ) : (
          <>
            <SetsPanel initialSets={collection.flashcardSets} />
            <ReviewsSection
              setId={id}
              initialReviews={collection.reviews}
              resourceType={'collections'}
            />
          </>
        )}
      </div>
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