import { cookies } from 'next/headers'
import CollectionsPanel from '@/components/CollectionsPanel'

const Collections = async () => {
  const collections = await getCollections()

  return (
    <div className="min-h-screen">
      <h1 className="title title-background">Flashcard Set Collections</h1>
      <div className='px-8'>
        <CollectionsPanel initialCollections={collections} />
      </div>
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
