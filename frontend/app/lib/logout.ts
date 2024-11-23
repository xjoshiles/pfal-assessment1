// 'use client'

import { useRouter } from 'next/navigation'

export function useLogout() {
  const router = useRouter()

  async function handleLogout() {
    try {
      const response = await fetch("/api/logout", { method: 'POST' })

      // Redirect to login page after 1 second if successfully logged out
      if (response.ok) {
        setTimeout(() => { router.push("/login") }, 1000)

      } else {
        const errorData = await response.json();
        console.error(errorData.message || "An error occurred when logging out")
      }
    } catch (err) {
      console.error("Failed to connect to the server. Please try again later")
    }
  }

  return { handleLogout }
}
