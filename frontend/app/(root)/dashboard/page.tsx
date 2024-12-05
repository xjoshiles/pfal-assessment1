import { cookies } from 'next/headers'
import SetsPanel from '@/components/SetsPanel'

const Dashboard = async () => {
  const sets = await getFlashcardSets()

  return (
    <div className="min-h-screen-nonav bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">Flashcard Sets</h1>
      {!sets || sets.length === 0 ? (
        <div className='no-results'>No flashcard sets found for this collection</div>
      ) : (
        <>
          <SetsPanel initialSets={sets} />
        </>
      )}
    </div>
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

export default Dashboard
