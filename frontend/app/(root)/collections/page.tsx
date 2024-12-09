import { cookies } from 'next/headers'
import CollectionsPanel from '@/components/CollectionsPanel'

const Collections = async () => {
  const collections = await getCollections()

  return (
    <div className="min-h-screen-nonav p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">Flashcard Set Collections</h1>
      {!collections || collections.length === 0 ? (
        <div className='no-results'>No collections found</div>
      ) : (
        <>
          <CollectionsPanel initialCollections={collections} />
        </>
      )}
    </div>
  )
}

async function getCollections() {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/collections`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    }
  })
  const data = await response.json()
  return data
}

export default Collections
