'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useSession } from '@/app/lib/session-context'
import { redirect } from 'next/navigation'

// Define the AdonisJS backend API endpoint for session validation
const AUTH_ME_ENDPOINT = 'http://localhost:3333/auth/me'

export default async function Navbar() {
  const { isAuth, userId, username, isAdmin, setSession } = useSession()

  useEffect(() => {
    const nullSession = {
      isAuth: false, userId: null, username: null, isAdmin: null
    }
    const checkSession = async () => {

      // If session exists in the cookie or session storage, update the session context.
      const sessionToken = localStorage.getItem('sessionToken');

      if (sessionToken) {
        // Make a POST request to the backend to validate the session
        const response = await fetch(AUTH_ME_ENDPOINT, {
          method: 'POST',
          headers: { Authorization: `Bearer ${sessionToken}` }
        })

        // If backend responds with an error, treat as unauthorised
        if (!response.ok) {
          setSession(nullSession)
        }

        const data = await response.json();
        setSession({
          isAuth: data.isAuth,
          userId: data.userId,
          username: data.username,
          isAdmin: data.isAdmin
        })
      }
    }
    checkSession()
  }, [setSession])


  return (
    <header className='px-5 py-3 bg-white shadow-sm font-work-sans'>
      <nav className='flex justify-between items-center'>
        <Link href='/'>
          <Image src="/logo.png" alt='logo' width={144} height={30} />
        </Link>

        <div className='flex items-center gap-5 text-black'>
          {isAuth ? (
            <>
              <Link href="/dashboard">
                <span>Dashboard</span>
              </Link>

              <Link href='/logout'>
                <button>Logout</button>
              </Link>

              <Link href={`/user/${userId}`}>
                <span>{username}</span>
              </Link>
            </>
          ) : (
            <Link href='/login'>
              <button>Login</button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
