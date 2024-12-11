'use client'

import { useState } from 'react'
import SetsPanel from '@/components/SetsPanel'
import CollectionsPanel from '@/components/CollectionsPanel'
import { FlashcardSetType } from '@/lib/types'
import { CollectionType } from '@/lib/types'
import { RectangleStackIcon, WalletIcon } from '@heroicons/react/24/outline'

type UserLibraryProps = {
  username: string
  sets: FlashcardSetType[]
  collections: CollectionType[]
}

const UserLibrary: React.FC<UserLibraryProps> = ({ username, sets, collections }) => {
  const [activeTab, setActiveTab] = useState<'sets' | 'collections'>('sets')

  return (
    <div className="min-h-screen z-60">
      {/* Tab Controls */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-y-2 gap-x-4 md:gap-y-0 px-2 bg-black-200 py-2 mt-0.5 md:mt-0 overflow-x-hidden">
        {/* Tabs */}
        <div role="tablist" className="flex flex-row gap-x-2 items-center">
          <button
            role="tab"
            aria-selected={activeTab === 'sets'}
            aria-controls="sets-panel"
            className={`${activeTab === 'sets' ? 'tab-selected' : 'tab'}`}
            onClick={() => setActiveTab('sets')}
          >
            <RectangleStackIcon className="w-6 h-6 flex-shrink-0" />
            Sets
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'collections'}
            aria-controls="collections-panel"
            className={`${activeTab === 'collections' ? 'tab-selected' : 'tab'}`}
            onClick={() => setActiveTab('collections')}
          >
            <WalletIcon className="w-6 h-6 flex-shrink-0" />
            Collections
          </button>
        </div>

        {/* Header */}
        <div className='items-center'>
          <h1 className="title">
            {username}'s library
          </h1>
        </div>

        {/* Empty Flex div for Centering of Header */}
        <div className='flex min-w-[274px] hidden md:block'></div>
      </div>

      {/* Content */}
      <div className="mt-8 px-8">
        <div
          id="sets-panel"
          role="tabpanel"
          hidden={activeTab !== 'sets'}
        >
          {activeTab === 'sets' && <SetsPanel initialSets={sets} />}
        </div>
        <div
          id="collections-panel"
          role="tabpanel"
          hidden={activeTab !== 'collections'}
        >
          {activeTab === 'collections' && <CollectionsPanel initialCollections={collections} />}
        </div>
      </div>
    </div>
  )
}

export default UserLibrary
