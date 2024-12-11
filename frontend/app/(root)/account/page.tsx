'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUserContext } from '@/context/UserContext'
import { useToast } from '@/context/ToastContext'

export default function UpdateAccountPage() {
  const [isDisabled, setIsDisabled] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false) // Modal visibility state
  const [currentPassword, setCurrentPassword] = useState('') // Current password state
  const user = useUserContext()
  const { showToast } = useToast()
  const modalRef = useRef<HTMLDivElement>(null) // Reference to the modal content
  const router = useRouter()

  // Close modal if user clicks outside of it
  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setShowDeleteModal(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsDisabled(true)

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')?.toString().trim()
    const newPassword = formData.get('newPassword')?.toString().trim()

    if (!password) {
      showToast('Please enter your current password', 'error')
      setIsDisabled(false)
      return
    }

    if (!newPassword) {
      showToast('Please enter a new password', 'error')
      setIsDisabled(false)
      return
    }

    if (newPassword == password) {
      showToast('Your new password must be different than your current password', 'error')
      setIsDisabled(false)
      return
    }

    // Prepare the payload
    const payload: Record<string, string> = { password, newPassword }

    // Send update request
    const response = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      showToast('Password updated successfully!', 'success')
      router.push(`/users/${user.id}`)
    } else {
      const errorData = await response.json()
      showToast(errorData.message || 'An error occurred', 'error')
      setIsDisabled(false)
    }
  }

  async function handleDeleteAccount() {
    setIsDisabled(true)

    const response = await fetch(`/api/users/${user.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: currentPassword }) // Send the current password
    })

    // Redirect to homepage if successfully deleted account
    if (response.status === 204) {

      // Clear cookies so middleware doesn't attempt to validate sessionToken
      await fetch("/api/logout", { method: 'POST' })

      showToast('Account deleted successfully', 'success')
      router.push("/")

    } else {
      const errorData = await response.json()
      showToast(errorData.message || 'An error occurred', 'error')
      setIsDisabled(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Change Your Password</h1>

        {/* Update form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              name="password"
              placeholder="Current Password"
              required
              className="form-textbox-minimal"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)} // Update password state
            />
          </div>
          <div>
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              required
              className="form-textbox-minimal"
            />
          </div>
          <button
            type="submit"
            className={`w-full ${isDisabled ? "item_save_btn-disabled" : "item_save_btn"}`}
            disabled={isDisabled}
          >
            Update Password
          </button>

          {/* Account deletion */}
          <div className='text-center pt-10'>
            <button
              className='text-sm item_delete_btn'
              type="button"
              onClick={() => {
                if (!currentPassword) {
                  showToast('Please confirm your current password', 'error')
                  return
                }
                setShowDeleteModal(true)
                document.addEventListener('mousedown', handleOutsideClick)
              }}
            >
              Delete Account
            </button>
          </div>
        </form>
      </div>

      {/* Modal for account deletion */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4"
          >
            <h2 className="text-lg font-bold text-red-600">Delete Account</h2>
            <p className="text-sm text-gray-600">
              Are you sure? This action can't be reversed, and all your sets, collections, and reviews will be deleted.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  document.removeEventListener('mousedown', handleOutsideClick)
                }}
                className="w-full form-button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteAccount()
                  setShowDeleteModal(false)
                  document.removeEventListener('mousedown', handleOutsideClick)
                }}
                className="w-full form-button-danger"
                disabled={isDisabled}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
