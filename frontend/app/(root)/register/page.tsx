'use client'

import { FormEvent, useState } from 'react'
import { redirect } from 'next/navigation'

export default function Register() {
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // Prevent default form submission
    setError(null)         // Reset error state
    setIsDisabled(true)    // Disable the button upon form submission

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

    const response = await fetch(`${process.env.NEXT_PUBLIC_ADONIS_API}/users`,
      { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }) })

    if (response.ok) {
      setSuccess(`User created successfully!`)

      // Redirect to login page after 1 second
      setTimeout(() => { redirect("/login") }, 1000)

    } else {
      const errorData = await response.json();
      setError(errorData.message || "An error occurred")
      setIsDisabled(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen-nonav">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Register</h1>

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
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
