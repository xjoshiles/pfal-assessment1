'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserType } from '@/lib/types'

export default function UpdateAccountPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDisabled, setIsDisabled] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false) // Modal visibility state
  const [currentPassword, setCurrentPassword] = useState('') // Current password state
  const [user, setUser] = useState<any>(null) // Store the user session
  const modalRef = useRef<HTMLDivElement>(null) // Reference to the modal content
  const router = useRouter()

  // Fetch user session on page load
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/get-session')
        if (response.ok) {
          const user = await response.json()
          setUser(user as UserType) // Set the user data
        } else {
          setError("Failed to fetch session. Please log in again.")
          router.push('/login') // Redirect if not authenticated
        }
      } catch (err) {
        setError("An error occurred while fetching session.")
        console.error(err)
      }
    }

    fetchSession()
  }, [router])

  // Close modal if user clicks outside of it
  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setShowDeleteModal(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsDisabled(true)

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')?.toString().trim()
    const newPassword = formData.get('newPassword')?.toString().trim()

    if (!password) {
      setError("Current password is required")
      setIsDisabled(false)
      return
    }

    if (!newPassword) {
      setError("New password is required")
      setIsDisabled(false)
      return
    }

    if (newPassword == password){
      setError("Your new password must be different than your current password")
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
      setSuccess("Password updated successfully!")
      setTimeout(() => { router.push("/dashboard") }, 1000)
    } else {
      const errorData = await response.json()
      setError(errorData.message || "An error occurred")
      setIsDisabled(false)
    }
  }

  async function handleDeleteAccount() {
    setError(null)
    setSuccess(null)
    setIsDisabled(true)

    const response = await fetch(`/api/users/${user.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: currentPassword }), // Send the current password
    })

    if (response.status === 204) {
      setSuccess("Account deleted successfully")
      setTimeout(() => { router.push("/") }, 1000)
    } else {
      const errorData = await response.json()
      console.log(errorData)
      setError(errorData.message || "An error occurred")
      setIsDisabled(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen-nonav bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Account</h1>

        {error && (<div className="form-error-text">{error}</div>)}
        {success && (<div className="form-success-text">{success}</div>)}

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
            className={`${isDisabled ? "form-button-disabled" : "form-button"}`}
            disabled={isDisabled}
          >
            Update Password
          </button>

          {/* Account deletion */}
          <div className='text-red-600 w-full text-center pt-10'>
            <button
              type="button"
              onClick={() => {
                if (!currentPassword) {
                  setError("Please confirm you current password")
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
                className="form-button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteAccount()
                  setShowDeleteModal(false)
                  document.removeEventListener('mousedown', handleOutsideClick)
                }}
                className="form-button-danger"
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
