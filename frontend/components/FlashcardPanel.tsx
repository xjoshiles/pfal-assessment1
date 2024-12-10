'use client'

import { useState } from 'react'

interface FlashcardProps {
  cards: { question: string, answer: string, difficulty: string }[]
}

export const FlashcardPanel = ({ cards }: FlashcardProps) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlipCard = () => {
    setIsFlipped((prev) => !prev)
  }

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % cards.length)
    setIsFlipped(false)  // Reset flip state when moving to the next card
  }

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length)
    setIsFlipped(false)  // Reset flip state when moving to the previous card
  }

  const currentCard = cards[currentCardIndex]

  return (
    <div className="space-y-4">
      {/* Gradient border wrapper */}
      <div className="flex justify-center items-center">
        <div className="gap-4 mt-8 gradient-element shadow-md w-full mx-auto">
          <div
            className={`${isFlipped ? 'flashcard-flipped' : 'flashcard'} flex items-center justify-center gap-4 shadow-inner w-full`}
            onClick={handleFlipCard}
          >
            <p className={'text-4xl p-6 text-center break-words w-full'}>
              {isFlipped ? currentCard.answer : currentCard.question}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button onClick={prevCard} className="w-full item_preview_btn text-xl">
          Previous
        </button>

        <div className="flex-grow flex justify-center">
          <div className="text-xl px-4 py-2 bg-white rounded-md border border-gray-300 text-center text-sm font-medium text-gray-700 flex items-center justify-center gap-1 h-full mx-4">
            <span>{currentCardIndex + 1}</span>
            <span>/</span>
            <span>{cards.length}</span>
          </div>
        </div>

        <button onClick={nextCard} className="w-full item_preview_btn text-xl">
          Next
        </button>
      </div>
    </div>
  )
}
