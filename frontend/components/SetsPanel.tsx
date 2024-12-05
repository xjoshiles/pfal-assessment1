'use client'
import { FlashcardSetType } from '@/lib/types'
import Link from 'next/link'
import { useState } from 'react'
import SetPreview from './SetPreview'

const SetsPanel = ({ initialSets }: { initialSets: FlashcardSetType[] }) => {
  // Sort sets by latest on initial load
  initialSets.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
  const [sets, setSets] = useState(initialSets)
  const [sortBy, setSortBy] = useState('latest') // Default sorting

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

  return (
    <div>
      <div className="flex items-center justify-center items-center mt-8 gap-4">
        <Link href='/sets/create'>
          <button className='item_preview_btn'>Create Set</button>
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
        {sets?.length > 0 ? (
          sets.map((set: FlashcardSetType, index: number) => (
            <SetPreview key={set?.id} set={set} />
          ))
        ) : (
          <p className="no-results">No flashcard sets found</p>
        )}
      </ul>
    </div>
  )
}

export default SetsPanel