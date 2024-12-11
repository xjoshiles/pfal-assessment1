import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UpdateAccountPage from '@/app/(root)/account/page' // Adjust path accordingly
import { useUserContext } from '@/context/UserContext'
import { useToast } from '@/context/ToastContext'

// Mock user context hooks
jest.mock('@/context/UserContext', () => ({
  useUserContext: () => ({ id: 'user-123' }),
}))
// Mock useToast from the context
jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn().mockReturnValue({ showToast: jest.fn() }),
}))
// Mock useRouter from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
}))

describe('UpdateAccountPage', () => {
  it('shows error toast when current password is missing', async () => {
    const mockShowToast = jest.fn()
    useToast.mockReturnValue({ showToast: mockShowToast })

    render(<UpdateAccountPage />)

    // Submit form with missing current password
    fireEvent.submit(screen.getByRole('form'))

    // Check if the error toast is shown
    await waitFor(() => {
      expect(useToast().showToast).toHaveBeenCalledWith('Please enter your current password', 'error')
    })
  })

  it('shows error toast when new password is missing', async () => {
    const mockShowToast = jest.fn()
    useToast.mockReturnValue({ showToast: mockShowToast })

    render(<UpdateAccountPage />)

    // Enter only current password
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'current-password' },
    })

    fireEvent.submit(screen.getByRole('form'))

    // Check if the error toast is shown
    await waitFor(() => {
      expect(useToast().showToast).toHaveBeenCalledWith('Please enter a new password', 'error')
    })
  })

  it('shows error toast when new password matches current password', async () => {
    const mockShowToast = jest.fn()
    useToast.mockReturnValue({ showToast: mockShowToast })

    render(<UpdateAccountPage />)

    // Enter the same value for current and new password
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'password' },
    })
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'password' },
    })

    fireEvent.submit(screen.getByRole('form'))

    // Check if the error toast is shown
    await waitFor(() => {
      expect(useToast().showToast).toHaveBeenCalledWith(
        'Your new password must be different than your current password',
        'error'
      )
    })
  })

  it('updates the password successfully and redirects', async () => {
    // Mocking successful response from the API
    mockFetch({
      ok: true,
      json: {}
    })

    render(<UpdateAccountPage />)

    // Fill in form and submit
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'current-password' },
    })
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'new-password' },
    })

    fireEvent.submit(screen.getByRole('form'))

    // Check that the success toast is shown
    await waitFor(() => {
      expect(useToast().showToast).toHaveBeenCalledWith('Password updated successfully!', 'success')
    })
  })

  it('shows error toast when current password is not entered for account deletion', async () => {
    render(<UpdateAccountPage />)

    // Attempt to open delete modal without entering current password
    fireEvent.click(screen.getByText('Delete Account'))

    // Check if the error toast is shown
    await waitFor(() => {
      expect(useToast().showToast).toHaveBeenCalledWith('Please confirm your current password', 'error')
    })
  })

  it('shows error toast on failed password update request', async () => {
    // Mocking unsuccessful response from the API
    mockFetch({
      ok: false,
      json: { message: 'error test' }
    })

    render(<UpdateAccountPage />)

    // Fill in form and submit
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'current-password' },
    })
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'new-password' },
    })

    fireEvent.submit(screen.getByRole('form'))

    // Check that the error toast is shown
    await waitFor(() => {
      expect(useToast().showToast).toHaveBeenCalledWith('error test', 'error')
    })
  })

  it('shows fallback error toast when errorData.message is undefined on failed password update request', async () => {
    // Mocking unsuccessful response from the API without message
    mockFetch({
      ok: false,
      json: {}
    })

    render(<UpdateAccountPage />)

    // Fill in form and submit
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'current-password' },
    })
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'new-password' },
    })

    fireEvent.submit(screen.getByRole('form'))

    // Check that the error toast is shown
    await waitFor(() => {
      expect(useToast().showToast).toHaveBeenCalledWith('An error occurred', 'error')
    })
  })

  it('opens the delete account modal when current password is provided', async () => {
    render(<UpdateAccountPage />)

    // Enter the current password
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'current-password' },
    })

    // Click the "Delete Account" button
    fireEvent.click(screen.getByRole('button', { name: /delete your account/i }))

    // Check if the modal opens by looking for the dialog
    await waitFor(() => {
      // Modal should have a dialog role, ensuring it is opened
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Verify modal content like the header and confirmation message
      expect(screen.getByRole('heading', { level: 2, name: /delete account/i })).toBeInTheDocument()
      expect(screen.getByText(/are you sure\? this action can't be reversed/i)).toBeInTheDocument()
    })
  })

  it('deletes the account successfully when current password is provided', async () => {
    // Mocking successful account deletion response
    mockFetch({ status: 204 })

    render(<UpdateAccountPage />)

    // Provide the current password and click delete
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'password' },
    })

    // Click the "Delete Account" button
    fireEvent.click(screen.getByRole('button', { name: /delete your account/i }))

    // Open the modal and confirm deletion
    fireEvent.click(screen.getByText('Delete'))

    // Check if the success toast is shown
    await waitFor(() => {
      expect(useToast().showToast).toHaveBeenCalledWith('Account deleted successfully', 'success')
    })
  })

  it('shows error toast on failed account deletion request', async () => {
    // Mocking successful account deletion response
    mockFetch({
      status: 500,
      json: { message: 'error test' }
    })

    render(<UpdateAccountPage />)

    // Provide the current password and click delete
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'password' },
    })

    // Click the "Delete Account" button
    fireEvent.click(screen.getByRole('button', { name: /delete your account/i }))

    // Open the modal and confirm deletion
    fireEvent.click(screen.getByText('Delete'))

    // Check if the error toast is shown
    await waitFor(() => {
      expect(useToast().showToast).toHaveBeenCalledWith('error test', 'error')
    })
  })

  it('shows fallback error toast when errorData.message is undefined on failed account deletion request', async () => {
    // Mocking unsuccessful account deletion response without a message
    mockFetch({
      status: 500,
      json: {}
    })

    render(<UpdateAccountPage />)

    // Provide the current password and click delete
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'password' },
    })

    // Click the "Delete Account" button
    fireEvent.click(screen.getByRole('button', { name: /delete your account/i }))

    // Open the modal and confirm deletion
    fireEvent.click(screen.getByText('Delete'))

    // Check if the error toast is shown
    await waitFor(() => {
      expect(useToast().showToast).toHaveBeenCalledWith('An error occurred', 'error')
    })
  })

  it('closes the modal when cancel button is clicked', async () => {
    render(<UpdateAccountPage />)

    // Provide the current password and click delete
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'password' },
    })

    // Click the "Delete Account" button
    fireEvent.click(screen.getByRole('button', { name: /delete your account/i }))

    // Wait for the modal to appear
    const modal = await screen.findByRole('dialog')

    // Click cancel to close the modal
    fireEvent.click(screen.getByText('Cancel'))

    // Ensure the modal is closed
    await waitFor(() => expect(modal).not.toBeInTheDocument())
  })

  it('closes the modal when clicked outside', async () => {
    render(<UpdateAccountPage />)

    // Provide the current password and click delete
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'password' },
    })

    // Open the delete modal
    fireEvent.click(screen.getByRole('button', { name: /delete your account/i }))

    // Wait for the modal to appear
    const modal = await screen.findByRole('dialog')

    // Simulate clicking outside the modal
    fireEvent.mouseDown(document)

    // Check that the modal is not present anymore
    await waitFor(() => expect(modal).not.toBeInTheDocument())
  })
})
