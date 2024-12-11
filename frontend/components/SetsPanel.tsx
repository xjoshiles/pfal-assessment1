'use client'

import { useState } from 'react'
import Link from 'next/link'
import SetPreview from '@/components/SetPreview'
import { FlashcardSetType } from '@/lib/types'
import { useToast } from '@/context/ToastContext'
import { usePathname, useRouter } from 'next/navigation'

const SetsPanel = ({ initialSets }: { initialSets: FlashcardSetType[] }) => {
  // Sort sets by latest on initial load
  const [sets, setSets] = useState([...initialSets].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ))
  const [sortBy, setSortBy] = useState('latest') // Default sorting
  const { showToast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSortBy(value)

    // Sort sets based on the selected option
    const sortedSets = [...sets]
    if (value === 'latest') {
      sortedSets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } else if (value === 'rating') {
      sortedSets.sort((a, b) => b.averageRating - a.averageRating)
    }
    setSets(sortedSets)
  }

  async function handleDeleteSet(id: number) {
    // Send the deletion request
    const response = await fetch(`/api/sets/${id}`, { method: 'DELETE' })

    if (response.status === 204) {
      // Update the sets state after successful deletion
      setSets((prevSets) => prevSets.filter((set) => set.id !== id))

      showToast('Set deleted successfully', 'success')
      router.replace(pathname!)  // soft reload

    } else {
      const errorData = await response.json()
      showToast(errorData.message || 'An error occurred', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-center items-center mt-8 gap-4">
        <Link href='/sets/create' passHref tabIndex={-1}>
          <button className='item_preview_btn border-2 border-black-100' aria-label="Create a new flashcard set">
            Create Set
          </button>
        </Link>

        <div className="justify-center items-center sort">
          <label htmlFor="sort" className="text-black-200 font-medium mr-1" id="sort-label">
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

      <ul className="mt-8 card_grid" aria-label="List of flashcard sets">
        {sets?.length > 0 ? (
          sets.map((set: FlashcardSetType) => (
            <SetPreview
              key={set?.id}
              set={set}
              onDeleteSet={handleDeleteSet}
            />
          ))
        ) : (
          <p className="no-results text-center">No flashcard sets found</p>
        )}
      </ul>
    </div>
  )
}

export default SetsPanel