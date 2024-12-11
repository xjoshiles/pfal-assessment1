'use client'

import { useToast } from '@/context/ToastContext'
import { useEffect, useState } from 'react'

type ToastNotificationProps = {
  id: number                        // Unique identifier for this toast
  message: string                   // Message to be displayed in the toast
  type: 'success' | 'error'         // Style the toast based on type
  removeToast: (id: number) => void // Callback to remove this toast
}

export function ToastNotification({ id, message, type, removeToast }: ToastNotificationProps) {
  const [fadeOut, setFadeOut] = useState(false)

  // Automatically trigger fade-out and removal
  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 3000)  // Start fade-out after 3 seconds
    const removeTimer = setTimeout(() => removeToast(id), 4000) // Remove toast after fade-out

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [id])

  return (
    <div
      className={`text-center ml-auto max-w-max p-4 rounded-md shadow-lg transition-opacity duration-1000 z-50
        ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
        ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {message}
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-20 right-2 z-50 flex flex-col-reverse gap-2 sm:right-8 sm:top-8 sm:transform-none sm:-translate-x-0 px-2">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          removeToast={removeToast}
        />
      ))}
    </div>
  )
}