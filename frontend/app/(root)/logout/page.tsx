'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Logout() {
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const router = useRouter()

  async function handleSubmit() {
    setError(null)         // Reset error state
    setSuccess(null)       // Reset success state

    try {
      const response = await fetch("/api/logout", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(data.message)
        // router.refresh()

        // Redirect to login page after 1 second
        setTimeout(() => { router.push("/login") }, 1000)

      } else {
        const errorData = await response.json()
        setError(errorData.message || "An error occurred")
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Logout</h1>

        {error && (<div className="form-error-text">{error}</div>)}
        {success && (<div className="form-success-text">{success}</div>)}
        
        <button type="submit" className="w-full item_save_btn" onClick={handleSubmit}>Logout</button>
      </div>
    </div>
  )
}
