'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SetPreview from '@/components/SetPreview'

const Dashboard = () => {
  const [sets, setSets] = useState([])
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('latest') // Default sorting
  // const router = useRouter()

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

      <div className="mt-6 flex justify-end">
        <label htmlFor="sort" className="text-gray-700 font-medium mr-2">
          Sort By:
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
