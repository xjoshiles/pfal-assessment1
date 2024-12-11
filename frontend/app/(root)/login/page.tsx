'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/context/ToastContext'

export default function LoginPage() {
  const [isDisabled, setIsDisabled] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // Prevent default form submission
    setIsDisabled(true)    // Disable the button upon form submission

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    // Redirect to sets page if successfully logged in
    if (response.ok) {
      showToast(`Logged in successfully!`, 'success')
      router.push("/sets")

    } else {
      const errorData = await response.json()
      showToast(errorData.message || 'An error occurred', 'error')
      setIsDisabled(false) // Re-enable the button if there's an error
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Login</h1>
        <form role='form' onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input type="username" name="username" placeholder="Username" required className="form-textbox-minimal" />
          </div>
          <div>
            <input type="password" name="password" placeholder="Password" required className="form-textbox-minimal" />
          </div>
          <button
            type="submit"
            className={`w-full ${isDisabled ? "item_save_btn-disabled" : "item_save_btn"}`}
            disabled={isDisabled}>
            Login
          </button>
          <Link
            href="/register"
            className="flex justify-center text-primary hover:underline"
          >
            Click here to register
          </Link>
        </form>
      </div>
    </div>
  )
}