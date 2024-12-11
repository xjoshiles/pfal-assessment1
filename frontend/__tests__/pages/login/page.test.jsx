import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(root)/login/page'
import { useToast } from '@/context/ToastContext'
import { useRouter } from 'next/navigation'

// Mock useToast from the context
jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn().mockReturnValue({ showToast: jest.fn() }),
}))

// Mock useRouter from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
}))

describe('Login Page', () => {
  it('renders the login form with username and password inputs and a submit button', () => {
    render(<LoginPage />)

    // Check that the inputs and button are in the document
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('disables the submit button during form submission', async () => {
    const mockShowToast = jest.fn()
    ;(useToast).mockReturnValue({ showToast: mockShowToast })

    // Mock fetch function for success response
    mockFetch({ ok: true, json: {} })

    render(<LoginPage />)
    const submitButton = screen.getByRole('button', { name: /login/i })

    // Simulate form submission
    fireEvent.submit(screen.getByRole('form'))

    // Check if submit button is disabled after submit
    expect(submitButton).toBeDisabled()

    // Check if fetch was called with the correct arguments
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/login',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('calls showToast and redirects on successful login', async () => {
    const mockShowToast = jest.fn()
    ;(useToast).mockReturnValue({ showToast: mockShowToast })

    // Mock fetch function for success response
    mockFetch({ ok: true, json: {} })

    render(<LoginPage />)
    fireEvent.submit(screen.getByRole('form'))

    // Wait for async operations
    await screen.findByRole('button', { name: /login/i })

    // Verify that showToast was called with success message
    expect(mockShowToast).toHaveBeenCalledWith('Logged in successfully!', 'success')

    // Verify that redirect was called with '/sets'
    expect(useRouter().push).toHaveBeenCalledWith('/sets')
  })

  it('shows error toast and re-enables the button on failed login', async () => {
    const mockShowToast = jest.fn()
    ;(useToast).mockReturnValue({ showToast: mockShowToast })

    // Mock fetch for a failed response
    mockFetch({ ok: false, json: { message: 'Login failed' } })

    render(<LoginPage />)

    // Trigger the form submission
    fireEvent.submit(screen.getByRole('form'))

    // Wait for async operations
    await waitFor(() => {
      // Wait for the button to be re-enabled after the failed login
      const submitButton = screen.getByRole('button', { name: /login/i })
      expect(submitButton).not.toBeDisabled()
    })

    // Verify that showToast was called with the error message
    expect(mockShowToast).toHaveBeenCalledWith('Login failed', 'error')
  })

  it('shows fallback error toast when errorData.message is undefined on failed login', async () => {
    const mockShowToast = jest.fn()
    ;(useToast).mockReturnValue({ showToast: mockShowToast })

    // Mock fetch for a failed response without message
    mockFetch({ ok: false, json: {} })

    render(<LoginPage />)

    // Trigger the form submission
    fireEvent.submit(screen.getByRole('form'))

    // Wait for async operations
    await waitFor(() => {
      // Wait for the button to be re-enabled after the failed login
      const submitButton = screen.getByRole('button', { name: /login/i })
      expect(submitButton).not.toBeDisabled()
    })

    // Verify that showToast was called with the fallback error message
    expect(mockShowToast).toHaveBeenCalledWith('An error occurred', 'error')
  })

  it('contains a link to the registration page', () => {
    render(<LoginPage />)

    // Check if the registration link is present
    expect(screen.getByRole('link', { name: /click here to register/i })).toBeInTheDocument()
  })
})
