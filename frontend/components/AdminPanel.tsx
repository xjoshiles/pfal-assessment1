'use client'
import { useState } from 'react'
import { Toast, useToast } from '@/components/Toast'
import { UserType, LimitsInfoType } from '@/lib/types'

export function LimitSection({ limits }: { limits: LimitsInfoType }) {
  const [currentLimit, setCurrentLimit] = useState(limits.limit)
  const { toast, showToast, hideToast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const limitValue = formData.get('limit')
    const limit = parseInt(limitValue as string, 10)

    try {
      const res = await fetch('/api/limits/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit }),
      })

      if (!res.ok) throw new Error('Failed to update limit')

      // Update the local state to reflect the new daily creation limit
      setCurrentLimit(limit)
      showToast('Limit updated successfully!', 'success')

    } catch (error) {
      showToast((error as Error).message, 'error')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Daily Set Creation Limit</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:space-x-4">
        <div className="flex flex-col">
          {/* Daily set creation limit input and button */}
          <div className="flex flex-row">
            <input
              name="limit"
              aria-label="Daily set creation limit input"
              type="number"
              min="0"   // Ensures only non-negative values
              step="1"  // Ensures only integers
              defaultValue={limits.limit}
              required
              className="border border-gray-300 rounded px-3 py-2 mr-2"
            />
            <button
              type="submit"
              className="form-button"
            >
              Update Limit
            </button>
          </div>
          {/* Current limit and creation info */}
          <p className="text-sm text-gray-500 mt-2">
            Current limit: {currentLimit}, Created today: {limits.today}
          </p>
        </div>
        {/* Render toast notification if there is one */}
        {toast && (
          <div className='flex-grow text-center mt-2 md:mt-0 text-sm md:text-base'>
            <Toast
              key={toast.id} // Ensures new instance
              message={toast.message}
              type={toast.type}
              onFadeOut={hideToast}
            />
          </div>
        )}
      </form>
    </div>
  )
}

export function UserSection({ users: initialUsers }: { users: UserType[] }) {
  console.log(initialUsers)
  // Sort users by username initially
  const [users, setUsers] = useState(
    initialUsers.sort((a, b) => a.username.localeCompare(b.username))
  )
  const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' })
  const { toast, showToast, hideToast } = useToast()

  const toggleAdmin = async (userId: number, isAdmin: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}/admin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin: !isAdmin }),
      })

      if (res.status == 401) throw new Error((await res.json()).message)
      if (!res.ok) throw new Error('Failed to update user admin status')

      // Update the local state to reflect the new admin status
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, admin: !isAdmin } : user
        )
      )

      showToast('User admin status updated successfully!', 'success')

    } catch (error) {
      showToast((error as Error).message, 'error')
    }
  }

  const sortUsers = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc'
      ? 'desc'  // If the same column and currently in ascending order
      : 'asc'   // If a different column or currently in descending order
    setSortConfig({ key, direction })

    const sortedUsers = (() => {
      switch (key) {
        case 'username':
          return direction === 'asc'
            ? [...users].sort((a, b) => a.username.localeCompare(b.username))
            : [...users].sort((a, b) => b.username.localeCompare(a.username))

        case 'admin':
          return direction === 'asc'
            ? [...users].sort((a, b) => (a.admin ? 1 : 0) - (b.admin ? 1 : 0))
            : [...users].sort((a, b) => (b.admin ? 1 : 0) - (a.admin ? 1 : 0))

        case 'id':
          return direction === 'asc'
            ? [...users].sort((a, b) => a.id - b.id)
            : [...users].sort((a, b) => b.id - a.id)

        default:
          return [...users] // return users unchanged if unexpected key
      }
    })()

    setUsers(sortedUsers)
  }

  return (
    <div className="text-sm md:text-base">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse overflow-x-auto">
          <thead>
            <tr className="border-b">
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => sortUsers('id')}
              >
                ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => sortUsers('username')}
              >
                Username {sortConfig.key === 'username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => sortUsers('admin')}
              >
                Admin {sortConfig.key === 'admin' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-2">{user.id}</td>
                <td className="px-4 py-2">
                  <a href={`/users/${user.id}`} className="text-primary">
                    {user.username}
                  </a>
                </td>
                <td className="px-4 py-2">{user.admin ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleAdmin(user.id, user.admin)}
                    className={`w-full ${user.admin ? 'form-button-disable' : 'form-button-enable'}`}
                  >
                    {user.admin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Render toast notification if there is one */}
      {toast && (
        <div className='text-center mt-2'>
          <Toast
            key={toast.id} // Ensures new instance
            message={toast.message}
            type={toast.type}
            onFadeOut={hideToast}
          />
        </div>
      )}
    </div>
  )
}
