'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Dashboard = () => {
  const [sets, setSets] = useState([])
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchSets() {
      const res = await fetch('/api/sets', { method: 'GET' })
      if (res.ok) {
        const data = await res.json()
        setSets(data);
      } else {
        setError('Failed to load sets')
      }
    }
    fetchSets()
  }, []);

  const handleClickSet = (setId: string) => {
    router.push(`/sets/${setId}`)
  };

  return (
    <div className="min-h-screen-nonav bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">Flashcard Sets</h1>
      {error && <div className="form-error-text">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {sets.map((set: any) => (
          <div key={set.id} className="set-card" onClick={() => handleClickSet(set.id)}>
            <h2 className="text-xl font-semibold">{set.name}</h2>
            <p>{set.creator}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard
