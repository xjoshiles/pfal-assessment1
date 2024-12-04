'use client'

import { useState, useEffect } from 'react'
import SetPreview from '@/components/SetPreview'
import { FlashcardSetType } from '@/lib/types'
import Link from 'next/link'

const Dashboard = () => {
  const [sets, setSets] = useState<FlashcardSetType[]>([])
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('latest') // Default sorting

  useEffect(() => {
    async function fetchSets() {
      const res = await fetch('/api/sets', { method: 'GET' })
      if (res.ok) {
        const data = await res.json()

        // Sort sets by latest on initial load
        data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

        setSets(data)
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
    const sortedSets = [...sets]
    if (value === 'latest') {
      sortedSets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } else if (value === 'rating') {
      sortedSets.sort((a, b) => b.averageRating - a.averageRating)
    }
    setSets(sortedSets)
  }

  return (
    <div className="min-h-screen-nonav bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">Flashcard Sets</h1>
      {error && <div className="form-error-text">{error}</div>}

      <div className="flex items-center justify-center items-center mt-8 gap-4">
        <Link href='/sets/create'>
          <button className='set_preview_btn'>Create Set</button>
        </Link>

        <div className="flex justify-center set_preview_date border">
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

export default Dashboard
