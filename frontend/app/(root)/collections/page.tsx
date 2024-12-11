import CollectionsPanel from '@/components/CollectionsPanel'
import { getCollections } from '@/lib/api'

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

export default Collections