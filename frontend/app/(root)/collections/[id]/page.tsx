import ReviewsSection from '@/components/ReviewsSection'
import SetsPanel from '@/components/SetsPanel'
import { getCollectionById } from '@/lib/api'

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

export default Collection