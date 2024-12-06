'use client'

import { useState } from 'react'
import Link from 'next/link'
import CollectionPreview from '@/components/CollectionPreview'
import { CollectionType } from '@/lib/types'

const CollectionsPanel = ({ initialCollections }: { initialCollections: CollectionType[] }) => {
  // Sort collections by latest on initial load
  initialCollections.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
  const [collections, setCollections] = useState(initialCollections)
  const [sortBy, setSortBy] = useState('latest') // Default sorting

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSortBy(value)

    // Sort collections based on the selected option
    const sortedCollections = [...collections]
    if (value === 'latest') {
      sortedCollections.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } else if (value === 'rating') {
      sortedCollections.sort((a, b) => b.averageRating - a.averageRating)
    }
    setCollections(sortedCollections)
  }

  return (
    <div>
      <div className="flex items-center justify-center items-center mt-8 gap-4">
        <Link href='/collections/create'>
          <button className='item_preview_btn'>Create Collection</button>
        </Link>

        <div className="flex justify-center item_preview_date border">
          <label htmlFor="sort" className="text-gray-700 font-medium mr-2">
            Sort by
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={handleSortChange}
            className="form-select border-gray-300 rounded-md"
          >
            <option value="latest">Latest</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      <ul className="mt-8 card_grid">
        {collections?.length > 0 ? (
          collections.map((collection: CollectionType, index: number) => (
            <CollectionPreview key={collection?.id} collection={collection} />
          ))
        ) : (
          <p className="no-results">No flashcard set collections found</p>
        )}
      </ul>
    </div>
  )
}

export default CollectionsPanel