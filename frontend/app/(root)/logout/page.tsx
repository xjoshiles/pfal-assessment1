'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'

export default function Logout() {
  const router = useRouter()
  const { showToast } = useToast()

  async function handleSubmit() {
    try {
      const response = await fetch("/api/logout", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        showToast(data.message, 'error')

        // Redirect to login page after 1 second
        setTimeout(() => { router.push("/login") }, 1000)

      } else {
        const errorData = await response.json()
        showToast(errorData.message || 'An error occurred', 'error')
      }
    } catch (err) {
      showToast('Failed to connect to the server. Please try again later', 'error')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Logout</h1>
        <button type="submit" className="w-full item_save_btn" onClick={handleSubmit}>Logout</button>
      </div>
    </div>
  )
}
