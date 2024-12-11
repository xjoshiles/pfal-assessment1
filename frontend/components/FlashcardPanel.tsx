'use client'

import { useCallback, useEffect, useState } from 'react'

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

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
          nextCard()
          break
        case 'ArrowLeft':
          prevCard()
          break
        case 'Enter':
        case ' ':
          event.preventDefault() // Prevent scrolling when pressing Space
          handleFlipCard()
          break
        default:
          break
      }
    },
    [nextCard, prevCard, handleFlipCard]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const currentCard = cards[currentCardIndex]

  return (
    <div className="space-y-4 mt-3">
      <p
        className={`text-center text-3xl font-semibold
          ${currentCard.difficulty === 'easy'
            ? 'text-green-500'
            : currentCard.difficulty === 'medium'
              ? 'text-yellow-500'
              : currentCard.difficulty === 'hard'
                ? 'text-red-500'
                : ''
          }`}
          aria-label={`Difficulty: ${currentCard.difficulty}`}
      >
        {currentCard.difficulty}
      </p>

      {/* Gradient border wrapper */}
      <div className="flex justify-center items-center">
        <div className="gap-4 gradient-element shadow-md w-full h-52 mx-auto relative overflow-hidden">
          <div
            role="button"
            aria-label={isFlipped ? 'Flashcard Answer' : 'Flashcard Question'}
            className={`${isFlipped ? 'flashcard-flipped' : 'flashcard'
              } flex items-center justify-center shadow-inner w-full h-full`}
            onClick={handleFlipCard}
          >
            <p className="text-4xl text-center break-words w-full leading-snug overflow-auto scrollbar-hidden max-h-full">
              {isFlipped ? currentCard.answer : currentCard.question}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={prevCard}
          className="w-full text-base sm:text-xl item_preview_btn"
          aria-label="Previous Flashcard"
        >
          Previous
        </button>

        <div className="justify-center">
          <div className="text-xl px-4 py-2 bg-white rounded-md border border-gray-300 text-center text-sm font-medium text-gray-700 flex items-center justify-center gap-1 h-full mx-4">
            <span>{currentCardIndex + 1}</span>
            <span>/</span>
            <span>{cards.length}</span>
          </div>
        </div>

        <button
          onClick={nextCard}
          className="w-full text-base sm:text-xl item_preview_btn"
          aria-label="Next Flashcard"
        >
          Next
        </button>
      </div>
    </div>
  )
}
