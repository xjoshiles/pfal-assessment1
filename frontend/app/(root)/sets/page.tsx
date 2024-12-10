import { cookies } from 'next/headers'
import SetsPanel from '@/components/SetsPanel'

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

async function getFlashcardSets() {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/sets/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    }
  })
  const data = await response.json()
  return data
}

export default Sets
