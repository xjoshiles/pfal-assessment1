'use client'

import { createContext, useContext, useState } from 'react'

// Type for toast notification
type ToastState = {
  id: number
  message: string
  type: 'success' | 'error'
}

// Type for the context value
type ToastContextType = {
  toasts: ToastState[]
  showToast: (message: string, type: 'success' | 'error') => void
  removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([])

  // Show toast function
  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now()
    console.log('Show Toast:', message, type)
    setToasts((prevToasts) => [...prevToasts, { id, message, type }])
  }

  // Remove toast function
  const removeToast = (id: number) => {
    console.log('Remove Toast:', id)
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

// Hook to use the toast context
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
