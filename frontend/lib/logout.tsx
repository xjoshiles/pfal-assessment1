import { useToast } from '@/context/ToastContext'
import { useRouter } from 'next/navigation'

export function useLogout() {
  const { showToast } = useToast()
  const router = useRouter()

  async function handleLogout() {
    try {
      const response = await fetch("/api/logout", { method: 'POST' })

      // Redirect to login page if successfully logged out
      if (response.ok) {
        showToast('Logged out successfully!', 'success')
        router.push('/login')

      } else {
        const errorData = await response.json()
        showToast(errorData.message || 'An error occurred when logging out', 'error')
        console.error(errorData.message || 'An error occurred when logging out')
      }
    } catch (err) {
      showToast('Failed to connect to the server. Please try again later', 'error')
      console.error('Failed to connect to the server. Please try again later')
    }
  }

  return { handleLogout }
}