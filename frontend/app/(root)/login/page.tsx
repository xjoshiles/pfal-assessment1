'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // Prevent default form submission
    setError(null)         // Reset error state
    setIsDisabled(true)    // Disable the button upon form submission

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      setSuccess(`Login successful!`)
      // router.refresh()

      // Redirect to homepage after 1 second
      setTimeout(() => { router.push("/library") }, 1000)

    } else {
      const errorData = await response.json();
      setError(errorData.message || "An error occurred")
      setIsDisabled(false) // Re-enable the button if there's an error
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen-nonav bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Login</h1>

        {error && (<div className="form-error-text">{error}</div>)}
        {success && (<div className="form-success-text">{success}</div>)}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input type="username" name="username" placeholder="Username" required className="form-textbox-minimal" />
          </div>
          <div>
            <input type="password" name="password" placeholder="Password" required className="form-textbox-minimal" />
          </div>
          <button
            type="submit"
            className={`w-full ${isDisabled ? "form-button-disabled" : "form-button"}`}
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