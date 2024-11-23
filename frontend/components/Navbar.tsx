import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { parseSession } from '@/app/lib/session'

export default async function Navbar() {
  const { isAuth, userId, username } = await parseSession()

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

export const revalidate = 0; // Fetch new data on every request