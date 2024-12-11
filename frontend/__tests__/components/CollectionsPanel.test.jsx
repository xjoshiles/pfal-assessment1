import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import CollectionsPanel from '@/components/CollectionsPanel'
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
  usePathname: jest.fn(() => '/collections')
}))

jest.mock('@/components/CollectionPreview', () => ({ collection, onDeleteCollection }) => (
  <li>
    <span>{collection.name}</span> {/* Render collection name */}
    <button onClick={() => onDeleteCollection(collection.id)}>Delete Collection</button>
  </li>
))

describe('CollectionsPanel', () => {
  const mockCollections = [
    // Collection 1 has a lower rating and is newer
    { id: 1, name: 'Collection 1', description: 'Description 1', averageRating: 4, updatedAt: '2024-12-02T12:00:00Z' },
    { id: 2, name: 'Collection 2', description: 'Description 2', averageRating: 5, updatedAt: '2024-12-01T12:00:00Z' }
  ]

  it('navigates to create collection page when button is clicked', () => {
    render(<CollectionsPanel initialCollections={mockCollections} />)

    // Get the link that the 'Create Collection' button navigates to
    const link = screen.getByLabelText('Create a new collection').closest('a')

    // Check if the URL being navigated to is the expected one
    expect(link).toHaveAttribute('href', '/collections/create')
  })

  it('renders collections', () => {
    render(<CollectionsPanel initialCollections={mockCollections} />)

    // Check that collections are rendered.
    expect(screen.getByText(mockCollections[0].name)).toBeInTheDocument()
    expect(screen.getByText(mockCollections[1].name)).toBeInTheDocument()
  })

  it('allows sorting of collections by rating', () => {
    render(<CollectionsPanel initialCollections={mockCollections} />)

    // Check that the sorting dropdown exists
    const sortSelect = screen.getByLabelText(/Sort by/i)
    expect(sortSelect).toBeInTheDocument()

    // Simulate sorting by rating
    fireEvent.change(sortSelect, { target: { value: 'rating' } })
    expect(sortSelect.value).toBe('rating')

    // Verify collections are sorted based on rating
    const sortedCollections = screen.getAllByRole('listitem')
    expect(sortedCollections[0]).toHaveTextContent(mockCollections[1].name)
    expect(sortedCollections[1]).toHaveTextContent(mockCollections[0].name)
  })

  it('allows sorting of collections by latest', () => {
    render(<CollectionsPanel initialCollections={mockCollections} />)

    // Check that the sorting dropdown exists
    const sortSelect = screen.getByLabelText(/Sort by/i)
    expect(sortSelect).toBeInTheDocument()

    // Simulate sorting by rating
    fireEvent.change(sortSelect, { target: { value: 'rating' } })
    expect(sortSelect.value).toBe('rating')

    // Verify collections are sorted based on rating
    var sortedCollections = screen.getAllByRole('listitem')
    expect(sortedCollections[0]).toHaveTextContent(mockCollections[1].name)
    expect(sortedCollections[1]).toHaveTextContent(mockCollections[0].name)

    // Simulate sorting by latest
    fireEvent.change(sortSelect, { target: { value: 'latest' } })
    expect(sortSelect.value).toBe('latest')

    // Verify collections are sorted based on rating
    var sortedCollections = screen.getAllByRole('listitem')
    expect(sortedCollections[0]).toHaveTextContent(mockCollections[0].name)
    expect(sortedCollections[1]).toHaveTextContent(mockCollections[1].name)
  })

  it('shows empty state when no collections are passed', () => {
    render(<CollectionsPanel initialCollections={[]} />)

    // Check for the no results message
    expect(screen.getByText('No collections found')).toBeInTheDocument()
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

    render(<CollectionsPanel initialCollections={mockCollections} />)

    // Get the delete button for Collection 1
    const collectionToDelete = screen.getByText('Collection 1')
    const deleteButton = within(collectionToDelete.closest('li')).getByText('Delete Collection')

    // Trigger the delete action
    fireEvent.click(deleteButton)

    // Wait for the toast message and check that the collection was removed
    await waitFor(() => expect(showToastMock).toHaveBeenCalledWith('Collection deleted successfully', 'success'))

    // Ensure that router.replace was called
    expect(replaceMock).toHaveBeenCalledWith('/collections')

    // Ensure the specific collection is removed
    expect(screen.queryByText('Collection 1')).not.toBeInTheDocument()

    // Ensure the other collection still exists
    expect(screen.getByText('Collection 2')).toBeInTheDocument()
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

    render(<CollectionsPanel initialCollections={mockCollections} />)

    // Get the delete button for Collection 1
    const collectionToDelete = screen.getByText('Collection 1')
    const deleteButton = within(collectionToDelete.closest('li')).getByText('Delete Collection')

    // Trigger the delete action
    fireEvent.click(deleteButton)

    // Wait for the toast message and check that the collection was removed
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

    render(<CollectionsPanel initialCollections={mockCollections} />)

    // Get the delete button for Collection 1
    const collectionToDelete = screen.getByText('Collection 1')
    const deleteButton = within(collectionToDelete.closest('li')).getByText('Delete Collection')

    // Trigger the delete action
    fireEvent.click(deleteButton)

    // Wait for the toast message and check that the collection was removed
    await waitFor(() => expect(showToastMock).toHaveBeenCalledWith('An error occurred', 'error'))
  })
})
