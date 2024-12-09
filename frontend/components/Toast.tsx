import { useEffect, useRef, useState } from 'react'

// Props that the Toast component will receive
type ToastProps = {
  message: string            // Message to be displayed in the toast
  type: 'success' | 'error'  // To style the toast differently based on type
  onFadeOut: () => void      // Callback for when the toast has faded out
}

// Alias type for the toast's internal state (message, type, and ID)
type ToastState = (Omit<ToastProps, 'onFadeOut'> & { id: number }) | null

// Toast component
export function Toast({ message, type, onFadeOut }: ToastProps) {
  // Initial state of false to render the toast as fully visible
  const [fadeOut, setFadeOut] = useState(false)
  // Ref for the toast element
  const toastRef = useRef<HTMLDivElement | null>(null)

  // Runs when mounted (rendered for the first time. Re-renders within
  // this Toast component will not trigger the useEffect again unless
  // any of its dependencies change)
  useEffect(() => {
    // Automatically scroll the toast into view when it's rendered
    if (toastRef.current) {
      toastRef.current.scrollIntoView({ behavior: 'smooth' })
    }

    // Start fade-out after 3 seconds (re-render of Toast component)
    const fadeTimer = setTimeout(() => setFadeOut(true), 3000)

    // Remove toast notification completely after fade-out
    // (re-render of parent component as onFadeout modifies toast state)
    const removeTimer = setTimeout(() => onFadeOut(), 4000)

    // Clean up timers when the toast disappears
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  return (
    <div
      ref={toastRef}
      className={`${type === 'success' ? 'form-success-text' : 'form-error-text'}
      transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
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
  const showToast = (message: string, type: ToastProps['type']) => {
    // The ID should be used as a key to ensure a new Toast instance, else
    // new toast notifications may inherit the state of the previous toast
    const id = Date.now()
    setToast({ message, type, id })
  }
  const hideToast = () => setToast(null)

  return { toast, showToast, hideToast }
}
