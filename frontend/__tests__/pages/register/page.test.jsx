import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Register from '@/app/(root)/register/page'
import { useToast } from '@/context/ToastContext'
import { redirect } from 'next/navigation'

// Mock useToast from the context
jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn().mockReturnValue({ showToast: jest.fn() }),
}))

// Mock redirect from next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('Register Page', () => {
  it('renders the form with username and password inputs and a submit button', () => {
    render(<Register />)

    // Check that the inputs and button are in the document
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('disables the submit button during form submission', async () => {
    // Mock the showToast function
    const mockShowToast = jest.fn()

      // Explicitly cast `useToast` to jest.Mock to allow mocking it
      ; (useToast).mockReturnValue({
        showToast: mockShowToast,
      })

    // Mock fetch function for success response
    mockFetch({ ok: true, json: {} })

    render(<Register />)
    const submitButton = screen.getByRole('button', { name: /register/i })

    // Simulate form submission
    fireEvent.submit(screen.getByRole('form'))

    // Check if submit button is disabled after submit
    expect(submitButton).toBeDisabled()

    // Check if fetch was called with the correct arguments
    expect(global.fetch).toHaveBeenCalledWith(
      'api/users',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('calls showToast and redirect on successful registration', async () => {
    // Mock the showToast function
    const mockShowToast = jest.fn()

      // Explicitly cast `useToast` to jest.Mock to allow mocking it
      ; (useToast).mockReturnValue({
        showToast: mockShowToast,
      })

    mockFetch({ ok: true, json: {} })

    render(<Register />)
    fireEvent.submit(screen.getByRole('form'))

    // Wait for async operations
    await screen.findByRole('button', { name: /register/i })

    // Verify that showToast was called with success message
    expect(mockShowToast).toHaveBeenCalledWith('Registered successfully!', 'success')

    // Verify that redirect was called with '/login'
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('shows error toast and re-enables the button on failed registration', async () => {
    const mockShowToast = jest.fn()
      ; (useToast).mockReturnValue({
        showToast: mockShowToast,
      })

    mockFetch({ ok: false, json: { message: 'Registration failed' } })

    render(<Register />)

    // Trigger the form submission
    fireEvent.submit(screen.getByRole('form'))

    // Wait for async operations
    await waitFor(() => {
      // Wait for the button to be re-enabled after the failed registration
      const submitButton = screen.getByRole('button', { name: /register/i })
      expect(submitButton).not.toBeDisabled()
    })

    // Verify that showToast was called with the error message
    expect(mockShowToast).toHaveBeenCalledWith('Registration failed', 'error')
  })

  it('shows fallback error toast when errorData.message is undefined on failed registration', async () => {
    const mockShowToast = jest.fn()
      ; (useToast).mockReturnValue({
        showToast: mockShowToast,
      })

    // Mock fetch for a failed response without message
    mockFetch({ ok: false, json: { } })

    render(<Register />)

    // Trigger the form submission
    fireEvent.submit(screen.getByRole('form'))

    // Wait for async operations
    await waitFor(() => {
      // Wait for the button to be re-enabled after the failed registration
      const submitButton = screen.getByRole('button', { name: /register/i })
      expect(submitButton).not.toBeDisabled()
    })

    // Verify that showToast was called with the fallback error message
    expect(mockShowToast).toHaveBeenCalledWith('An error occurred', 'error')
  })
})
