import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { LimitSection, UserSection } from '@/components/AdminPanel'
import { getDailyLimitInfo, getUsers } from '@/lib/api'

export default async function AdminPage() {
  // Redirect to the user's profile if they are not an admin
  const currentUser = await getCurrentUser()
  if (!currentUser.admin) {
    redirect(`/users/${currentUser.id}`)
  }

  // Fetch the current limits
  const limits = await getDailyLimitInfo()

  // Fetch the current users
  const users = await getUsers()

  return (
    <div className="flex justify-center items-center">
      <div className="container max-w-4xl w-full py-8 px-1 md:px-6">
        <div className="gap-4 gradient-element shadow-md w-full mx-auto">
          <div className="bg-white rounded-lg p-6 space-y-6">
            <h1 className="text-3xl font-bold text-center text-gray-800">Administrator Controls</h1>
            {/* Limit Management Section */}
            <LimitSection limits={limits} />
            {/* Horizontal divider */}
            <hr className="gradient-divider" />
            {/* User Management Section */}
            <UserSection users={users} />
          </div>
        </div>
      </div>
    </div>
  )
}
