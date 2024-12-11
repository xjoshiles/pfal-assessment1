import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import SetPreview from '@/components/SetPreview'
import { useUserContext } from '@/context/UserContext'
import { formatDate } from '@/lib/utils'

// Mock the useUserContext hook to return a user object
jest.mock('@/context/UserContext', () => ({
  useUserContext: jest.fn(),
}))

// Mock the formatDate function
jest.mock('@/lib/utils', () => ({
  formatDate: jest.fn(),
}))

describe('SetPreview', () => {
  const mockOnDeleteSet = jest.fn()

  const mockSet = {
    id: 1,
    name: 'Test Set',
    description: 'A sample flashcard set',
    averageRating: 4,
    creator: { id: 2, username: 'testuser' },
    updatedAt: '2024-12-10T12:34:56Z',
  }

  beforeEach(() => {
    // Mock the user context
    useUserContext.mockReturnValue({ id: 2, username: 'testuser' })
    // Mock the formatDate function to return a fixed string
    formatDate.mockReturnValue('December 01, 2024')
  })

  it('renders the set details correctly', () => {
    render(<SetPreview set={mockSet} onDeleteSet={mockOnDeleteSet} />)

    // Check if the set's name, description, and creator are rendered correctly
    expect(screen.getByText(/Test Set/i)).toBeInTheDocument()
    expect(screen.getByText(/A sample flashcard set/i)).toBeInTheDocument()
    expect(screen.getByText(/testuser/i)).toBeInTheDocument()

    // Check if the date is formatted correctly
    expect(screen.getByText(/December 01, 2024/i)).toBeInTheDocument()

    // Check if the "View" button is rendered
    expect(screen.getByText(/View/i)).toBeInTheDocument()

    // Check if the "Edit" and "Delete" buttons are shown for the correct user
    expect(screen.getByText(/Edit/i)).toBeInTheDocument()
    expect(screen.getByText(/Delete/i)).toBeInTheDocument()
  })

  it('does not show Edit or Delete buttons if the current user is not the creator', () => {
    // Mock the user context to simulate a different user
    (useUserContext).mockReturnValue({ id: 3, username: 'otheruser' })

    render(<SetPreview set={mockSet} onDeleteSet={mockOnDeleteSet} />)

    // Ensure the Edit and Delete buttons are not rendered
    expect(screen.queryByText(/Edit/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Delete/i)).not.toBeInTheDocument()
  })

  it('shows the delete modal when the delete button is clicked', async () => {
    render(<SetPreview set={mockSet} onDeleteSet={mockOnDeleteSet} />)

    // Click on the Delete button
    fireEvent.click(screen.getByText(/Delete/i))

    // Assert that the modal appears
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes the delete modal when the outside of the modal is clicked', async () => {
    render(<SetPreview set={mockSet} onDeleteSet={mockOnDeleteSet} />)

    // Click on the Delete button
    fireEvent.click(screen.getByText(/Delete/i))

    // Wait for the modal to appear
    const modal = await screen.findByText(/Delete Set/i)

    // Simulate clicking outside the modal
    fireEvent.mouseDown(document)

    // Check that the modal is not present anymore
    await waitFor(() => expect(modal).not.toBeInTheDocument())
  })

  it('calls onDeleteSet when the delete button in the modal is clicked', async () => {
    render(<SetPreview set={mockSet} onDeleteSet={mockOnDeleteSet} />)

    // Click on the Delete button
    fireEvent.click(screen.getByText(/Delete/i))

    // Wait for the modal to appear
    const modal = await screen.findByRole('dialog')

    // Find and click the "Delete" button inside the modal
    const deleteButton = within(modal).getByRole('button', { name: /Delete/i })
    fireEvent.click(deleteButton)

    // Ensure onDeleteSet was called with the correct ID
    expect(mockOnDeleteSet).toHaveBeenCalledWith(1)

    // Check that the modal closes
    expect(modal).not.toBeInTheDocument()
  })

  it('closes the modal when the cancel button is clicked', async () => {
    render(<SetPreview set={mockSet} onDeleteSet={mockOnDeleteSet} />)

    // Click on the Delete button
    fireEvent.click(screen.getByText(/Delete/i))

    // Wait for the modal to appear
    const modal = await screen.findByText(/Delete Set/i)

    // Click on the Cancel button inside the modal
    fireEvent.click(screen.getByText(/Cancel/i))

    // Ensure the modal is closed
    expect(modal).not.toBeInTheDocument()
  })
})
