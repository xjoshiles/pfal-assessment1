import { FlashcardPanel } from '@/components/FlashcardPanel'
import ReviewsSection from '@/components/ReviewsSection'
import { getFlashcardSetById } from '@/lib/api'

interface FlashcardSetProps {
  params: { id: string }
}

const FlashcardSet = async ({ params }: FlashcardSetProps) => {
  const { id } = await params
  const set = await getFlashcardSetById(id)

  return (
    <div>
      <div className="min-h-screen">
        <h1 className="title title-background">{set.name}</h1>
        <div className='section_container px-8'>
          {!set.flashcards || set.flashcards.length === 0 ? (
            <div className='no-results'>No flashcards found for this set</div>
          ) : (
            <>
              <FlashcardPanel cards={set.flashcards} />
              <ReviewsSection
                setId={id}
                initialReviews={set.reviews}
                resourceType={'sets'}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlashcardSet