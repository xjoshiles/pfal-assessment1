'use client'

import FlashcardSetForm from "@/components/FlashcardSetForm"

const CreateSet = () => {
  return (
    <section className="bg-gray-100">
      <div className="section_container min-h-screen-nonav bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Create Flashcard Set
        </h1>
        <FlashcardSetForm
          initialSet={{
            name: '',
            description: '',
            flashcards: [{ question: '', answer: '', difficulty: 'easy' }],
          }}
        />
      </div>
    </section>
  )
}

export default CreateSet
