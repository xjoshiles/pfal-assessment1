import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { LimitSection, UserSection } from '@/components/AdminPanel'
import { cookies } from 'next/headers'

export default async function AdminPage() {
  // Redirect to the user's profile if they are not an admin
  const currentUser = await getCurrentUser()
  if (!currentUser.admin) {
    redirect(`/users/${currentUser.id}`)
  }

  const sessionToken = (await cookies()).get('sessionToken')?.value

  // Fetch the current limits
  const limitsRes = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/limits/sets`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    }
  })
  const limits = await limitsRes.json()

  // Fetch the current users
  const usersRes = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/users`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    }
  })
  const users = await usersRes.json()

  return (
    <div className="max-w-4xl mx-auto py-8 px-1 md:px-6 bg-gray-100">
      <div className="gap-4 gradient-element shadow-md w-full mx-auto">
        <div className='bg-white rounded-lg p-6 space-y-6'>
          <h1 className="text-3xl font-bold text-center text-gray-800">Admin Control Panel</h1>
          {/* Limit Management Section */}
          <LimitSection limits={limits} />
          {/* Horizontal divider */}
          <hr className="gradient-divider" />
          {/* User Management Section */}
          <UserSection users={users} />
        </div>
      </div>
    </div>
  )
}
