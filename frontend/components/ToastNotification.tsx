import { useEffect, useState } from 'react'

type ToastNotificationProps = {
  message: string            // Message to be displayed in the toast
  type: 'success' | 'error'  // To style the toast differently based on type
  onFadeOut: () => void      // Callback for when the toast has faded out
}

// Alias type for the toast's internal state (message, type, and ID)
type ToastState = (Omit<ToastNotificationProps, 'onFadeOut'> & { id: number }) | null

// ToastNotification component
export function ToastNotification({ message, type, onFadeOut }: ToastNotificationProps) {
  const [fadeOut, setFadeOut] = useState(false)

  // Start fade-out after 3 seconds (toast will fade out after 3 seconds)
  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 3000)
    const removeTimer = setTimeout(() => onFadeOut(), 4000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  return (
    <div
      className={`fixed top-20 sm:top-8 right-8 p-4 rounded-md shadow-lg
        transition-opacity duration-1000 z-50
        ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
        ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {message}
    </div>
  )
}

// Hook to use and manage toast state
export function useToast() {
  const [toast, setToast] = useState<ToastState>(null)

  // These will update the toast state to trigger a
  // re-render of the component that uses this hook
  const showToast = (message: string, type: ToastNotificationProps['type']) => {
    // The ID should be used as a key to ensure a new Toast instance, else
    // new toast notifications may inherit the state of the previous toast
    const id = Date.now()
    setToast({ message, type, id })
  }
  const hideToast = () => setToast(null)

  return { toast, showToast, hideToast }
}
