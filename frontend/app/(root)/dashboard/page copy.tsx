import { verifySession } from '@/lib/session'

export default async function Dashboard() {
  const session = await verifySession()
  const isAdmin = session?.isAdmin

  if (isAdmin) {
    return <p>admin</p>
  }
  return <p>user</p>
}
