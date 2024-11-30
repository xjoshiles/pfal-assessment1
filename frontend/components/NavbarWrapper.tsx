import Navbar from '@/components/Navbar'
import { getCurrentUser } from '@/lib/session'

export default async function NavbarWrapper() {
  const user = await getCurrentUser()

  return (
      <Navbar user={user}/>
  )
}