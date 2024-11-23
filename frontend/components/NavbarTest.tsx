'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLogout } from '@/app/lib/logout'

export default function NavbarTest({
  isAuth,
  userId,
  username,
  isAdmin,
}: {
  isAuth: boolean;
  userId: string | null;
  username: string | null;
  isAdmin: boolean | null;
}) {
  const [session, setSession] = useState({
    isAuth: isAuth, userId: userId, username: username, isAdmin: isAdmin
  })
  const pathname = usePathname()
  const { handleLogout } = useLogout()

  // Fetch session data when the pathname changes
  // (whenever the user navigates to a new route)
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/get-session', { method: 'POST' })
        const data = await response.json()
        setSession(data)  // Update session with fetched data

      } catch (error) {
        console.error('Error fetching session:', error)
      }
    }
    fetchSession()        // Fetch session data on route change
  }, [pathname])          // Ensure fetch whenever the user navigates

  return (
    <header className='h-15 px-5 py-3 bg-white shadow-sm font-work-sans'>
      <nav className='flex justify-between items-center'>
        <Link href='/'>
          <Image src='/logo.png' alt='logo' width={144} height={30} />
        </Link>

        <div className='flex items-center gap-5 text-black'>
          {session.isAuth ? (
            <>
              <Link href='/dashboard'>
                <span>Dashboard</span>
              </Link>

              <button onClick={handleLogout}>Logout</button>

              <Link href={`/user/${session.userId}`}>
                <span>{session.username}</span>
              </Link>
            </>
          ) : (
            <>
              <Link href='/register'>
                <button>Register</button>
              </Link>

              <Link href='/login'>
                <button>Login</button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}