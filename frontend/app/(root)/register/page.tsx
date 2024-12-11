'use client'

import { FormEvent, useState } from 'react'
import { redirect } from 'next/navigation'
import { useToast } from '@/context/ToastContext'

export default function Register() {
  const [isDisabled, setIsDisabled] = useState(false)
  const { showToast } = useToast()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // Prevent default form submission
    setIsDisabled(true)    // Disable the button upon form submission

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

    const response = await fetch('api/users',
      { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

    // Redirect to login page if successfully registered
    if (response.ok) {
      showToast(`Registered successfully!`, 'success')
      redirect("/login")

    } else {
      const errorData = await response.json()
      showToast(errorData.message || 'An error occurred', 'error')
      setIsDisabled(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Register</h1>
        <form role="form" onSubmit={handleSubmit} className="space-y-4">
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
            Register
          </button>
        </form>
      </div>
    </div>
  )
}
