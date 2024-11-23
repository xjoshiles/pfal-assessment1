import 'server-only'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { redirect } from 'next/navigation'

// Define the AdonisJS backend API endpoint for session validation
const AUTH_ME_ENDPOINT = 'http://localhost:3333/auth/me'

/**
 * Validate the session token by making a POST request to the backend.
 * @returns An object containing the authentication status and user info.
 */
export const verifySession = cache(async () => {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  // Redirect to login if no session token is present
  if (!sessionToken) {
    redirect('/login')
  }

  try {
    // Make a POST request to the backend to validate the session
    const response = await fetch(AUTH_ME_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionToken}` }
    })

    // If backend responds with an error, treat as unauthorised
    if (!response.ok) {
      redirect('/login')
    }

    const data = await response.json()

    // Return authentication status and user information
    return {
      isAuth: true,
      userId: data.id,
      username: data.username,
      isAdmin: data.admin
    }

  } catch (error) {
    // Handle network or other unexpected errors
    console.error('Error verifying session:', error)
    redirect('/login')
  }
})

export const parseSession = cache(async () => {
  const nullSession = {
    isAuth: false, userId: null, username: null, isAdmin: null
  }
  const sessionToken = (await cookies()).get('sessionToken')?.value

  // Redirect to login if no session token is present
  if (!sessionToken) {
    return nullSession
  }

  try {
    // Make a POST request to the backend to validate the session
    const response = await fetch(AUTH_ME_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionToken}` },
      cache: 'no-store', // Ensures fresh data on every request
    })

    // If backend responds with an error, treat as unauthorised
    if (!response.ok) {
      return nullSession
    }

    const data = await response.json()

    // Return authentication status and user information
    return {
      isAuth: true,
      userId: data.id,
      username: data.username,
      isAdmin: data.admin
    }

  } catch (error) {
    // Handle network or other unexpected errors
    console.error('Error verifying session:', error)
    return nullSession
  }
})

export const revalidate = 0; // Fetch new data on every request