'use client'

import { UserType } from "@/lib/types"
import { usePathname } from "next/navigation"
import { createContext, useContext, useEffect, useRef, useState } from "react"

export const UserContext = createContext<UserType | undefined>(undefined)

export function UserProvider({
  children,
  initialUser
}: {
  children: React.ReactNode,
  initialUser: UserType
}) {
  const [user, setUser] = useState<UserType>(initialUser)
  const pathname = usePathname()
  const isMounted = useRef(false)  // Track if the component has mounted

  // Fetch user data whenever the pathname changes
  // (whenever the user navigates to a new route)
  useEffect(() => {

    // Skip the effect on the first render
    if (!isMounted.current) {
      isMounted.current = true
      return
    }

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/get-session', {
          method: 'GET',
          headers: {
            accept: 'application/json'
          }
        })
        const user = await response.json()
        setUser(user)  // Update current user data with fetched data

      } catch (error) {
        console.error('Error fetching session:', error)
      }
    }
    fetchUser()

  }, [pathname])

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider')
  }

  return context
}
