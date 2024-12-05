'use client'

import { useState, useEffect } from 'react'
import CollectionPreview from '@/components/CollectionPreview'
import { CollectionType } from '@/lib/types'
import Link from 'next/link'

const Dashboard = () => {
  const [collections, setCollections] = useState<CollectionType[]>([])
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('latest') // Default sorting

  useEffect(() => {
    async function fetchSets() {
      const res = await fetch('/api/collections', { method: 'GET' })
      if (res.ok) {
        const data = await res.json()

        // Sort sets by latest on initial load
        data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

        setCollections(data)
      } else {
        setError('Failed to load sets')
      }
    }
    fetchSets()
  }, [])

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSortBy(value)

    // Sort sets based on the selected option
    const sortedCollections = [...collections]
    if (value === 'latest') {
      sortedCollections.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } else if (value === 'rating') {
      sortedCollections.sort((a, b) => b.averageRating - a.averageRating)
    }
    setCollections(sortedCollections)
  }

  return (
    <div className="min-h-screen-nonav bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">Flashcard Set Collections</h1>
      {error && <div className="form-error-text">{error}</div>}

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

export default Dashboard
