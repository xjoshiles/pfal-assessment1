import { FlashcardPanel } from '@/components/FlashcardPanel'
import ReviewsSection from '@/components/ReviewsSection'
import { cookies } from 'next/headers'

interface FlashcardSetProps {
  params: { id: string }
}

const FlashcardSet = async ({ params }: FlashcardSetProps) => {
  const { id } = await params
  const set = await getFlashcardSetById(id)

  return (
    <div>
      <div className="min-h-screen-nonav p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">{set.name}</h1>
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
  )
}

async function getFlashcardSetById(id: string) {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/sets/${id}`, {
    // no method
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    },
  }
  )
  const data = await response.json()
  return data
}

export default FlashcardSet
