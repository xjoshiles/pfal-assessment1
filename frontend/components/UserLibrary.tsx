'use client'

import { useState } from 'react'
import SetsPanel from '@/components/SetsPanel'
import CollectionsPanel from '@/components/CollectionsPanel'
import { FlashcardSetType } from '@/lib/types'
import { CollectionType } from '@/lib/types'

type UserLibraryProps = {
  sets: FlashcardSetType[]
  collections: CollectionType[]
}

const UserLibrary: React.FC<UserLibraryProps> = ({ sets, collections }) => {
  const [activeTab, setActiveTab] = useState<'sets' | 'collections'>('sets')

  return (
    <div className="min-h-screen-nonav p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Your Library
      </h1>
      <div className="mt-6 flex justify-center">
        <button
          className={`px-4 py-2 mx-2 ${
            activeTab === 'sets' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          } rounded-md`}
          onClick={() => setActiveTab('sets')}
        >
          Flashcard Sets
        </button>
        <button
          className={`px-4 py-2 mx-2 ${
            activeTab === 'collections' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          } rounded-md`}
          onClick={() => setActiveTab('collections')}
        >
          Collections
        </button>
      </div>
      <div className="mt-8">
        {activeTab === 'sets' && (
          <>
            {!sets || sets.length === 0 ? (
              <div className="no-results text-center">No flashcard sets found</div>
            ) : (
              <SetsPanel initialSets={sets} />
            )}
          </>
        )}
        {activeTab === 'collections' && (
          <>
            {!collections || collections.length === 0 ? (
              <div className="no-results text-center">No collections found</div>
            ) : (
              <CollectionsPanel initialCollections={collections} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default UserLibrary
