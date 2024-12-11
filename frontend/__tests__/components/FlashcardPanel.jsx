import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { FlashcardPanel } from '@/components/FlashcardPanel'

describe('FlashcardPanel', () => {
  const mockCards = [
    { question: 'What is 2 + 2?', answer: '4', difficulty: 'easy' },
    { question: 'What is the capital of France?', answer: 'Paris', difficulty: 'medium' },
    { question: 'What is the capital of Australia?', answer: 'Canberra', difficulty: 'hard' }
  ]

  it('renders the first card with the question', () => {
    render(<FlashcardPanel cards={mockCards} />)

    // Check that the question of the first card is displayed
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
  })

  it('flips the card when clicked', () => {
    render(<FlashcardPanel cards={mockCards} />)

    // Click on the card to flip it
    fireEvent.click(screen.getByRole('button', { name: /flashcard question/i }))

    // Check that the answer is displayed after flipping
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('navigates to the next card when "Next" is clicked', () => {
    render(<FlashcardPanel cards={mockCards} />)

    // Click on the "Next" button
    fireEvent.click(screen.getByLabelText('Next Flashcard'))

    // Check that the second card's question is displayed
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()

  })

  it('navigates to the card of hard difficulty when "Next" is clicked twice', () => {
    render(<FlashcardPanel cards={mockCards} />)

    // Click on the "Next" button twice
    fireEvent.click(screen.getByLabelText('Next Flashcard'))
    fireEvent.click(screen.getByLabelText('Next Flashcard'))

    // Check that the third card's difficulty is displayed as 'hard'
    expect(screen.getByLabelText('Difficulty: hard')).toBeInTheDocument()

    // Check that the third card's question is displayed
    expect(screen.getByText('What is the capital of Australia?')).toBeInTheDocument()
  })

  it('navigates to the previous card when "Previous" is clicked', () => {
    render(<FlashcardPanel cards={mockCards} />)

    // First navigate to the second card
    fireEvent.click(screen.getByLabelText('Next Flashcard'))

    // Then click "Previous"
    fireEvent.click(screen.getByLabelText('Previous Flashcard'))

    // Check that we are back to the first card
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
  })

  it('navigates to the previous card when the left arrow key is pressed', () => {
    render(<FlashcardPanel cards={mockCards} />)

    // First navigate to the second card
    fireEvent.click(screen.getByLabelText('Next Flashcard'))

    // Simulate pressing the left arrow key to go back to the first card
    fireEvent.keyDown(document, { key: 'ArrowLeft' })

    // Check that we are back to the first card
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
  })

  it('navigates to the next card when the right arrow key is pressed', () => {
    render(<FlashcardPanel cards={mockCards} />)

    // Simulate pressing the right arrow key to go to the second card
    fireEvent.keyDown(document, { key: 'ArrowRight' })

    // Check that the second card's question is displayed
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
  })

  it('flips the card when Space or Enter key is pressed', () => {
    render(<FlashcardPanel cards={mockCards} />)

    // Simulate pressing Space key to flip the card
    fireEvent.keyDown(document, { key: ' ' })

    // Check that the answer is displayed after flipping
    expect(screen.getByText('4')).toBeInTheDocument()

    // Simulate pressing Enter key to flip the card back
    fireEvent.keyDown(document, { key: 'Enter' })

    // Check that the question is displayed after flipping back
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
  })

  it('does nothing when an unsupported key is pressed', () => {
    render(<FlashcardPanel cards={mockCards} />)

    // Press a key that's not handled (e.g., 'a')
    fireEvent.keyDown(window, { key: 'a' })

    // Ensure that no state changes (e.g., card doesn't change)
    expect(screen.getByText(mockCards[0].question)).toBeInTheDocument()
  })

  it('renders a card with an unknown difficulty without any specific color styling', () => {
    // Create a mock card with an unknown difficulty value
    const unknownDifficultyCard = [
      { question: 'What is the capital of X?', answer: 'Y', difficulty: 'unknown' },
    ]

    render(<FlashcardPanel cards={unknownDifficultyCard} />)

    // Check that the difficulty is displayed
    const difficultyElement = screen.getByLabelText('Difficulty: unknown')

    // Ensure no specific color styling is applied for the unknown difficulty
    expect(difficultyElement).toBeInTheDocument()
    expect(difficultyElement).not.toHaveClass('text-green-500')  // Should not have the 'easy' class
    expect(difficultyElement).not.toHaveClass('text-yellow-500') // Should not have the 'medium' class
    expect(difficultyElement).not.toHaveClass('text-red-500')    // Should not have the 'hard' class
  })

  it('has the correct ARIA labels for accessibility', () => {
    render(<FlashcardPanel cards={mockCards} />)

    // Check that the flashcard has the correct aria-labels
    const flashcard = screen.getByRole('button', { name: /flashcard question/i })
    expect(flashcard).toHaveAttribute('aria-label', 'Flashcard Question')

    const nextButton = screen.getByLabelText('Next Flashcard')
    expect(nextButton).toBeInTheDocument()

    const prevButton = screen.getByLabelText('Previous Flashcard')
    expect(prevButton).toBeInTheDocument()
  })
})
