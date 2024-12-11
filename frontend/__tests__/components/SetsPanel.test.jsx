import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import SetsPanel from '@/components/SetsPanel'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'

// Mocking necessary components and hooks
jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({ showToast: jest.fn() }))
}))

jest.mock('next/link', () => ({ children, href }) => (
  <a href={href}>{children}</a>
))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
  usePathname: jest.fn(() => '/sets')
}))

jest.mock('@/components/SetPreview', () => ({ set, onDeleteSet }) => (
  <li>
    <span>{set.name}</span> {/* Render set name */}
    <button onClick={() => onDeleteSet(set.id)}>Delete Set</button>
  </li>
))

describe('SetsPanel', () => {
  const mockSets = [
    // Set 1 has a lower rating and is newer
    { id: 1, name: 'Set 1', description: 'Description 1', averageRating: 4, updatedAt: '2024-12-02T12:00:00Z' },
    { id: 2, name: 'Set 2', description: 'Description 2', averageRating: 5, updatedAt: '2024-12-01T12:00:00Z' }
  ]

  it('navigates to create set page when button is clicked', () => {
    render(<SetsPanel initialSets={mockSets} />)

    // Get the link that the 'Create Set' button navigates to
    const link = screen.getByLabelText('Create a new flashcard set').closest('a')

    // Check if the URL being navigated to is the expected one
    expect(link).toHaveAttribute('href', '/sets/create')
  })

  it('renders sets', () => {
    render(<SetsPanel initialSets={mockSets} />)

    // Check that sets are rendered.
    expect(screen.getByText(mockSets[0].name)).toBeInTheDocument()
    expect(screen.getByText(mockSets[1].name)).toBeInTheDocument()
  })

  it('allows sorting of sets by rating', () => {
    render(<SetsPanel initialSets={mockSets} />)

    // Check that the sorting dropdown exists
    const sortSelect = screen.getByLabelText(/Sort by/i)
    expect(sortSelect).toBeInTheDocument()

    // Simulate sorting by rating
    fireEvent.change(sortSelect, { target: { value: 'rating' } })
    expect(sortSelect.value).toBe('rating')

    // Verify sets are sorted based on rating
    const sortedSets = screen.getAllByRole('listitem')
    expect(sortedSets[0]).toHaveTextContent(mockSets[1].name)
    expect(sortedSets[1]).toHaveTextContent(mockSets[0].name)
  })

  it('allows sorting of sets by latest', () => {
    render(<SetsPanel initialSets={mockSets} />)

    // Check that the sorting dropdown exists
    const sortSelect = screen.getByLabelText(/Sort by/i)
    expect(sortSelect).toBeInTheDocument()

    // Simulate sorting by rating
    fireEvent.change(sortSelect, { target: { value: 'rating' } })
    expect(sortSelect.value).toBe('rating')

    // Verify sets are sorted based on rating
    let sortedSets = screen.getAllByRole('listitem')
    expect(sortedSets[0]).toHaveTextContent(mockSets[1].name)
    expect(sortedSets[1]).toHaveTextContent(mockSets[0].name)

    // Simulate sorting by latest
    fireEvent.change(sortSelect, { target: { value: 'latest' } })
    expect(sortSelect.value).toBe('latest')

    // Verify sets are sorted based on latest update
    sortedSets = screen.getAllByRole('listitem')
    expect(sortedSets[0]).toHaveTextContent(mockSets[0].name)
    expect(sortedSets[1]).toHaveTextContent(mockSets[1].name)
  })

  it('shows empty state when no sets are passed', () => {
    render(<SetsPanel initialSets={[]} />)

    // Check for the no results message
    expect(screen.getByText('No flashcard sets found')).toBeInTheDocument()
  })

  it('calls delete correctly and updates the list', async () => {
    const showToastMock = jest.fn()
    const replaceMock = jest.fn()

    // Using the global mocks defined at the top of the file to store values
    useToast.mockReturnValueOnce({ showToast: showToastMock })
    useRouter.mockReturnValueOnce({ replace: replaceMock })

    // Mock the API response for delete request
    mockFetch({
      ok: true,
      status: 204,
      json: {}
    })

    render(<SetsPanel initialSets={mockSets} />)

    // Get the delete button for Set 1
    const setToDelete = screen.getByText('Set 1')
    const deleteButton = within(setToDelete.closest('li')).getByText('Delete Set')

    // Trigger the delete action
    fireEvent.click(deleteButton)

    // Wait for the toast message and check that the set was removed
    await waitFor(() => expect(showToastMock).toHaveBeenCalledWith('Set deleted successfully', 'success'))

    // Ensure that router.replace was called
    expect(replaceMock).toHaveBeenCalledWith('/sets')

    // Ensure the specific set is removed
    expect(screen.queryByText('Set 1')).not.toBeInTheDocument()

    // Ensure the other set still exists
    expect(screen.getByText('Set 2')).toBeInTheDocument()
  })

  it('shows error toast on failed deletion', async () => {
    const showToastMock = jest.fn()
    const replaceMock = jest.fn()

    // Using the global mocks defined at the top of the file to store values
    useToast.mockReturnValueOnce({ showToast: showToastMock })
    useRouter.mockReturnValueOnce({ replace: replaceMock })

    // Mock the API response for failed delete request
    mockFetch({
      ok: true,
      status: 500,
      json: { message: 'Deletion failed' }
    })

    render(<SetsPanel initialSets={mockSets} />)

    // Get the delete button for Set 1
    const setToDelete = screen.getByText('Set 1')
    const deleteButton = within(setToDelete.closest('li')).getByText('Delete Set')

    // Trigger the delete action
    fireEvent.click(deleteButton)

    // Wait for the toast message and check that the error toast was shown
    await waitFor(() => expect(showToastMock).toHaveBeenCalledWith('Deletion failed', 'error'))
  })

  it('shows fallback error toast when errorData.message is undefined on failed deletion', async () => {
    const showToastMock = jest.fn()
    const replaceMock = jest.fn()

    // Using the global mocks defined at the top of the file to store values
    useToast.mockReturnValueOnce({ showToast: showToastMock })
    useRouter.mockReturnValueOnce({ replace: replaceMock })

    // Mock the API response for failed delete request without message
    mockFetch({
      ok: true,
      status: 500,
      json: {}
    })

    render(<SetsPanel initialSets={mockSets} />)

    // Get the delete button for Set 1
    const setToDelete = screen.getByText('Set 1')
    const deleteButton = within(setToDelete.closest('li')).getByText('Delete Set')

    // Trigger the delete action
    fireEvent.click(deleteButton)

    // Wait for the toast message and check that the fallback error toast was shown
    await waitFor(() => expect(showToastMock).toHaveBeenCalledWith('An error occurred', 'error'))
  })
})
