'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SetSelect from './SetSelect'
import { CollectionFormType, FlashcardSetType } from '@/lib/types'
import { Toast, useToast } from '@/components/Toast'

interface CollectionFormProps {
  initialCollection?: CollectionFormType
  collectionId?: string
  sets: FlashcardSetType[]
}

const newCollectionDefaults = {
  name: '',
  description: '',
  flashcardSetIds: []
}

const CollectionForm = ({
  initialCollection = newCollectionDefaults,
  collectionId,
  sets
}: CollectionFormProps
) => {
  const [name, setName] = useState(initialCollection.name)
  const [description, setDescription] = useState(initialCollection.description)
  const [selectedSetIds, setSelectedSetIds] = useState(initialCollection.flashcardSetIds)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast, showToast, hideToast } = useToast()
  const router = useRouter()

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  // These variables determine whether to send a create or update request
  const url = collectionId ? `/api/collections/${collectionId}` : '/api/collections'
  const method = collectionId ? 'PUT' : 'POST'

  const handleSetSelection = (set: FlashcardSetType) => {
    const setId = set.id
    if (selectedSetIds.includes(setId)) {
      // Deselect if already selected
      setSelectedSetIds((prev) => prev.filter((id) => id !== setId))
    } else {
      // Select set
      setSelectedSetIds((prev) => [...prev, setId])
    }
  }

  const handleRemoveSet = (setId: number) => {
    // Remove the set ID
    setSelectedSetIds((prev) => prev.filter((id) => id !== setId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !description.trim() || selectedSetIds.length === 0) {
      showToast('Please provide a name and description, and select at least one flashcard set', 'error')
      return
    }

    const collection = {
      name,
      description,
      flashcardSetIds: selectedSetIds
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collection)
      })

      if (res.ok) {
        router.push('/collections')

      } else {
        const errorData = await res.json()
        showToast(errorData.message || 'Failed to save the collection', 'error')
      }

    } catch (err) {
      showToast('An unexpected error occurred.', 'error')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        {/* Collection Name */}
        <input
          type="text"
          placeholder="Collection Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-textbox"
          required
        />

        {/* Collection Description */}
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-textbox"
          required
        />

        <div className="mt-4 space-y-2">
          {/* Selected Flashcard Sets */}
          <h3 className="text-lg font-semibold">Flashcard Sets</h3>
          <ul className='space-y-6'>
            {selectedSetIds.map((id) => {
              const set = sets.find((s) => s.id === id)
              return set ? <li
                key={id}>
                <SetSelect
                  key={set?.id}
                  set={set}
                  onRemove={() => handleRemoveSet(set.id)}
                />
              </li> : null
            })}
          </ul>

          {/* Form Buttons */}
          <div className="flex justify-between items-center pt-4 gap-4">
            <button
              type="button"
              onClick={openModal}
              className="w-full item_add_btn"
            >
              Select Sets
            </button>
            <button type="submit" className="w-full item_save_btn">
              Save Collection
            </button>
          </div>
        </div>
      </form>

      {/* Modal for selecting flashcard sets */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="gradient-element w-full sm:w-auto h-full sm:h-auto">
            <div className="bg-white p-4 md:py-6 rounded-md shadow-lg w-full sm:max-h-[90vh] h-full flex flex-col">

              <h2 className="text-xl text-center font-bold mb-4">Select Flashcard Sets</h2>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-grow p-0 md:p-6">
                <ul className="space-y-2">
                  {sets.map((set) => (
                    <li
                      key={set.id}
                      className="cursor-pointer p-2 rounded-md"
                      onClick={() => handleSetSelection(set)}
                    >
                      <SetSelect
                        set={set}
                        isSelected={selectedSetIds.includes(set.id)}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Button always at the bottom */}
              <button
                onClick={closeModal}
                className="w-full mt-4 item_preview_btn"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render toast notification if there is one */}
      {toast && (
        <div className='text-center mt-2'>
          <Toast
            key={toast.id} // Ensures new instance
            message={toast.message}
            type={toast.type}
            onFadeOut={hideToast}
          />
        </div>
      )}
    </div>
  )
}

export default CollectionForm
