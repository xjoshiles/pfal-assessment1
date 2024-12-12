'use client'

import { useToast } from '@/context/ToastContext'
import { NoSymbolIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
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
    className={`text-center ml-auto max-w-max p-4 rounded-md transition-opacity duration-1000 z-50
      ${type === 'success' ? 'text-gray-300 bg-black-200 border-b-4 border-green-600' : 'text-gray-300 bg-black-200 border-b-4 border-red-600'}
      ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Icon */}
      <span className="flex flex-row gap-x-2 items-center">
        {type === 'success' ? (
          <CheckCircleIcon className="h-6 w-6 text-gray-300" />
        ) : (
          <NoSymbolIcon className="h-6 w-6 text-gray-300" />
        )}
        {/* Message */}
        {message}
      </span>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-2 right-2 z-50 flex flex-col gap-2 sm:right-8 sm:bottom-8 sm:transform-none sm:-translate-x-0 px-2">
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