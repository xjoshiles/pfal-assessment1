'use client'

import { useState } from 'react'
import Link from 'next/link'
import CollectionPreview from '@/components/CollectionPreview'
import { CollectionType } from '@/lib/types'
import { useToast } from '@/context/ToastContext'
import { usePathname, useRouter } from 'next/navigation'

const CollectionsPanel = ({ initialCollections }: { initialCollections: CollectionType[] }) => {
  // Sort collections by latest on initial load
  const [collections, setCollections] = useState([...initialCollections].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ))
  const [sortBy, setSortBy] = useState('latest') // Default sorting
  const { showToast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

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

  async function handleDeleteCollection(id: number) {
    // Send the deletion request
    const response = await fetch(`/api/collections/${id}`, { method: 'DELETE' })

    if (response.status === 204) {
      // Update the collections state after successful deletion
      setCollections((prevCollections) => prevCollections.filter(
        (collection) => collection.id !== id))

      showToast('Collection deleted successfully', 'success')
      router.replace(pathname!)  // soft reload

    } else {
      const errorData = await response.json()
      showToast(errorData.message || 'An error occurred', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-center items-center mt-8 gap-4">
        <Link href='/collections/create' passHref tabIndex={-1}>
          <button className='item_preview_btn border-2 border-black-100' aria-label="Create a new collection">
            Create Collection
          </button>
        </Link>

        <div className="justify-center items-center sort">
          <label htmlFor="sort" className="text-gray-700 font-medium mr-1" id="sort-label">
            Sort by
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={handleSortChange}
            className="option-select"
            aria-labelledby="sort-label"
          >
            <option value="latest">Latest</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      <ul className="mt-8 card_grid" aria-label="List of collections">
        {collections?.length > 0 ? (
          collections.map((collection: CollectionType) => (
            <CollectionPreview
              key={collection?.id}
              collection={collection}
              onDeleteCollection={handleDeleteCollection}
            />
          ))
        ) : (
          <p className="no-results text-center">No collections found</p>
        )}
      </ul>
    </div>
  )
}

export default CollectionsPanel