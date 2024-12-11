import SetsPanel from '@/components/SetsPanel'
import { getFlashcardSets } from '@/lib/api'

const Sets = async () => {
  const sets = await getFlashcardSets()

  return (
    <div className="min-h-screen">
      <h1 className="title title-background">Flashcard Sets</h1>
      <div className='px-8'>
        <SetsPanel initialSets={sets} />
      </div>
    </div>
  )
}

export default Sets