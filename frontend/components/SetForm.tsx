'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetFormType } from '@/lib/types'
import { useToast } from '@/context/ToastContext'

type SetFormProps =
  | { initialSet: SetFormType; setId: string }     // Both must be present
  | { initialSet?: undefined; setId?: undefined }  // Neither can be present

const newSetDefaults = {
  name: '',
  description: '',
  flashcards: [{ question: '', answer: '', difficulty: 'easy' }]
}

const SetForm = ({
  initialSet = newSetDefaults,
  setId
}: SetFormProps
) => {
  const [name, setName] = useState(initialSet.name)
  const [description, setDescription] = useState(initialSet.description)
  const [flashcards, setFlashcards] = useState(
    initialSet.flashcards.map((flashcard) => ({ ...flashcard, isOpen: true }))
  )
  const { showToast } = useToast()
  const router = useRouter()

  // These variables determine whether to send a create or update request
  const url = setId ? `/api/sets/${setId}` : '/api/sets'
  const method = setId ? 'PUT' : 'POST'

  const handleAddFlashcard = () => {
    setFlashcards((prev) => [
      ...prev,
      { question: '', answer: '', difficulty: 'easy', isOpen: true },
    ])
  }

  const handleRemoveFlashcard = (index: number) => {
    setFlashcards((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFlashcardChange = (index: number, field: string, value: string) => {
    const updatedFlashcards = [...flashcards]
    updatedFlashcards[index][field] = value
    setFlashcards(updatedFlashcards)
  }

  const toggleFlashcard = (index: number) => {
    setFlashcards((prev) =>
      prev.map((flashcard, i) =>
        i === index ? { ...flashcard, isOpen: !flashcard.isOpen } : flashcard
      )
    )
  }

  const validateFlashcards = () => {
    // Return false if there are no flashcards in the set
    if (flashcards.length === 0) {
      showToast('Please add at least one flashcard', 'error')
      return false
    }

    // Return false if any flashcards are missing question, answer, difficulty
    for (let i = 0; i < flashcards.length; i++) {
      const { question, answer } = flashcards[i]
      if (!question.trim()) {
        showToast(`The question field for Flashcard ${i + 1} must be filled`, 'error')
        return false
      }
      if (!answer.trim()) {
        showToast(`The answer field for Flashcard ${i + 1} must be filled`, 'error')
        return false
      }
    }

    // Else...
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateFlashcards()) return // Halt submission if validation fails

    const set = {
      name,
      description,
      flashcards: flashcards.map(({ isOpen, ...flashcard }) => flashcard) // Remove `isOpen` before submission
    }

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(set),
    })

    if (res.ok) {
      showToast('Set saved successfully!', 'success')
      router.push('/sets')
    } else {
      const errorData = await res.json()
      showToast(errorData.message || 'Failed to create flashcard set', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
      {/* Set Name */}
      <input
        type="text"
        placeholder="Set Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="form-textbox"
        required
      />

      {/* Set Description */}
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="form-textbox"
        required
      />

      {/* Flashcards */}
      {flashcards.map((flashcard, index) => (
        <div key={index} className="gradient-element">
          <div className="space-y-4 p-4 bg-white rounded-md shadow-md">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleFlashcard(index)}
            >
              <h2 className="text-lg font-bold text-gray-700">
                Flashcard {index + 1}
              </h2>
              <span className="text-gray-500">
                {flashcard.isOpen ? '▼' : '▶'}
              </span>
            </div>
            {flashcard.isOpen && (
              <div className="mt-4 space-y-4">
                <input
                  type="text"
                  placeholder="Question"
                  value={flashcard.question}
                  onChange={(e) =>
                    handleFlashcardChange(index, 'question', e.target.value)
                  }
                  className="form-textbox"
                  required
                />
                <input
                  type="text"
                  placeholder="Answer"
                  value={flashcard.answer}
                  onChange={(e) =>
                    handleFlashcardChange(index, 'answer', e.target.value)
                  }
                  className="form-textbox"
                  required
                />
                <select
                  title="difficulty-dropdown"
                  value={flashcard.difficulty}
                  onChange={(e) =>
                    handleFlashcardChange(index, 'difficulty', e.target.value)
                  }
                  className="form-textbox"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <div className='flex justify-end'>
                  <button
                    type="button"
                    onClick={() => handleRemoveFlashcard(index)}
                    className="item_delete_btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Form Buttons */}
      <div className="flex justify-between items-center mt-4 gap-4">
        <button
          type="button"
          onClick={handleAddFlashcard}
          className="w-full item_add_btn"
        >
          Add Flashcard
        </button>
        <button type="submit" className="w-full item_save_btn">
          Save Flashcard Set
        </button>
      </div>
    </form>
  )
}

export default SetForm
