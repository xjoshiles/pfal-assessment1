'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLogout } from '@/lib/logout'
import { UserType } from '@/lib/types'

export default function Navbar({ user }: { user: UserType }) {
  const [session, setSession] = useState(user)
  const pathname = usePathname()
  const { handleLogout } = useLogout()

  // Fetch session data when the pathname changes
  // (whenever the user navigates to a new route)
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/get-session', {
          method: 'GET',
          headers: {
            accept: 'application/json'
          }
        })
        const user = await response.json()
        // console.log(data)
        setSession(user as UserType)  // Update session with fetched data

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
          <Image src='/logo.svg' alt='logo' width={144} height={36} />
        </Link>

        <div className='flex items-center gap-5 text-black'>
          {session.id ? (
            <>
              <Link href='/library'>
                <span>My Library</span>
              </Link>

              {/* Divider */}
              <span className="w-0.5 h-9 bg-gray-400"></span>

              <Link href='/sets'>
                <span>Sets</span>
              </Link>
              <Link href='/collections'>
                <span>Collections</span>
              </Link>

              {/* Divider */}
              <span className="w-0.5 h-9 bg-gray-400"></span>
              <button onClick={handleLogout}>Logout</button>

              <Link href='/account'>
                <span>Account</span>
              </Link>

              <Link href={`/users/${session.id}`}>
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
