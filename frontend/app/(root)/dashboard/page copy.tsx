import { getCurrentUser } from '@/lib/session'

export default async function Dashboard() {
  const user = await getCurrentUser()

  if (user.admin) {
    return <p>admin</p>
  }
  return <p>user</p>
}
