import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import SetSelect from '@/components/SetSelect'
import { formatDate } from '@/lib/utils'

// Mock the formatDate function
jest.mock('@/lib/utils', () => ({
  formatDate: jest.fn(),
}))

describe('SetSelect', () => {
  const mockOnRemove = jest.fn()

  const mockSet = {
    id: 1,
    name: 'Test Set',
    description: 'A sample flashcard set',
    averageRating: 4,
    creator: { id: 2, username: 'testuser' },
    updatedAt: '2024-12-10T12:34:56Z',
  }

  beforeEach(() => {
    // Mock the formatDate function to return a fixed string
    formatDate.mockReturnValue('December 01, 2024')
  })

  it('renders the set details correctly', () => {
    render(<SetSelect set={mockSet} onRemove={mockOnRemove} />)

    // Check if the set's name, description, and creator are rendered correctly
    expect(screen.getByText(/Test Set/i)).toBeInTheDocument()
    expect(screen.getByText(/A sample flashcard set/i)).toBeInTheDocument()
    expect(screen.getByText(/testuser/i)).toBeInTheDocument()

    // Check if the date is formatted correctly
    expect(screen.getByText(/December 01, 2024/i)).toBeInTheDocument()

    // Check if the "Remove" button is rendered
    expect(screen.getByText(/Remove/i)).toBeInTheDocument()
  })

  it('does not render the Remove button if onRemove is not passed', () => {
    render(<SetSelect set={mockSet} />)

    // Ensure the Remove button is not rendered if no onRemove is passed
    expect(screen.queryByText(/Remove/i)).not.toBeInTheDocument()
  })

  it('calls onRemove when the Remove button is clicked', () => {
    render(<SetSelect set={mockSet} onRemove={mockOnRemove} />)

    // Click on the Remove button
    fireEvent.click(screen.getByText(/Remove/i))

    // Ensure onRemove was called
    expect(mockOnRemove).toHaveBeenCalledTimes(1)
  })

  it('renders the selected state when isSelected is true', () => {
    render(<SetSelect set={mockSet} isSelected={true} />)

    // Check if the component has the selected styles
    expect(screen.getByRole('listitem')).toHaveClass('item_preview_selected')
  })

  it('renders the non-selected state when isSelected is false', () => {
    render(<SetSelect set={mockSet} isSelected={false} />)

    // Check if the component has the non-selected styles
    expect(screen.getByRole('listitem')).toHaveClass('item_preview_select')
  })
})
