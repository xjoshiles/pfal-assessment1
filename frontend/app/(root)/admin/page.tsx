import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { LimitSection, UserSection } from '@/components/AdminPanel'
import { cookies } from 'next/headers'

export default async function AdminPage() {
  // Redirect to dashboard if the user is not an admin
  const currentUser = await getCurrentUser()
  if (!currentUser.admin) {
    redirect('/dashboard') // Redirect if the user is not an admin
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

  // Fetch the current USERS
  const usersRes = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/users`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    }
  })
  const users = await usersRes.json()

  // console.log(limits)
  // console.log(users)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 bg-gray-100 space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">Admin Panel</h1>

      {/* <div className="section_container min-h-screen-nonav bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Admin Panel
        </h1> */}

      {/* Limit Management Section */}
      <LimitSection limits={limits} />

      <hr className="border-t-2 border-gray-300"/>

      {/* User Management Section */}
      <UserSection users={users} />

    </div>
  )
}
