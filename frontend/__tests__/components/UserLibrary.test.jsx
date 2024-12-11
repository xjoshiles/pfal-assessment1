import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import UserLibrary from '@/components/UserLibrary'

// Mock components
jest.mock('@/components/SetsPanel', () => () => <div>Sets Panel</div>)
jest.mock('@/components/CollectionsPanel', () => () => <div>Collections Panel</div>)

describe('UserLibrary', () => {
  const mockSets = [
    { id: 1, name: 'Set 1', description: 'Description 1', averageRating: 4, creator: { id: 1, username: 'user1' }, updatedAt: '2024-12-01T12:00:00Z' },
    { id: 2, name: 'Set 2', description: 'Description 2', averageRating: 5, creator: { id: 2, username: 'user2' }, updatedAt: '2024-12-02T12:00:00Z' }
  ]

  const mockCollections = [
    { id: 1, name: 'Collection 1', description: 'Description 1', creator: { id: 1, username: 'user1' }, updatedAt: '2024-12-01T12:00:00Z' },
    { id: 2, name: 'Collection 2', description: 'Description 2', creator: { id: 2, username: 'user2' }, updatedAt: '2024-12-02T12:00:00Z' }
  ]

  it('renders the username and sets tab by default', () => {
    render(<UserLibrary username="Test User" sets={mockSets} collections={mockCollections} />)

    // Check if the username is rendered
    expect(screen.getByText(/Test User's library/i)).toBeInTheDocument()

    // Verify that the "Sets" tab is active initially
    expect(screen.getByRole('tab', { name: /Sets/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /Collections/i })).toHaveAttribute('aria-selected', 'false')

    // Verify that Sets Panel is rendered
    expect(screen.getByText('Sets Panel')).toBeInTheDocument()
    expect(screen.queryByText('Collections Panel')).not.toBeInTheDocument()
  })

  it('renders the collections tab when clicked', () => {
    render(<UserLibrary username="Test User" sets={mockSets} collections={mockCollections} />)

    // Click on the "Collections" tab
    fireEvent.click(screen.getByRole('tab', { name: /Collections/i }))

    // Verify that the "Collections" tab is active
    expect(screen.getByRole('tab', { name: /Collections/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /Sets/i })).toHaveAttribute('aria-selected', 'false')

    // Verify that Collections Panel is rendered
    expect(screen.getByText('Collections Panel')).toBeInTheDocument()
    expect(screen.queryByText('Sets Panel')).not.toBeInTheDocument()
  })

  it('renders the sets panel when the sets tab is clicked again', () => {
    render(<UserLibrary username="Test User" sets={mockSets} collections={mockCollections} />)

    // Click on the "Collections" tab first
    fireEvent.click(screen.getByRole('tab', { name: /Collections/i }))

    // Click on the "Sets" tab again
    fireEvent.click(screen.getByRole('tab', { name: /Sets/i }))

    // Verify that the "Sets" tab is active again
    expect(screen.getByRole('tab', { name: /Sets/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /Collections/i })).toHaveAttribute('aria-selected', 'false')

    // Verify that Sets Panel is rendered
    expect(screen.getByText('Sets Panel')).toBeInTheDocument()
    expect(screen.queryByText('Collections Panel')).not.toBeInTheDocument()
  })
})
