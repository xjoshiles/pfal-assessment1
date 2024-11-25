import Navbar from '@/components/NavbarTest'
import { parseSession } from '@/lib/session'

export default async function NavbarWrapper() {
  const session = await parseSession()
  // const session = {
  //   isAuth: false,
  //   userId: null,
  //   username: null,
  //   isAdmin: null
  // }
  return (
      <Navbar
        isAuth={session.isAuth}
        userId={session.userId}
        username={session.username}
        isAdmin={session.isAdmin}
      />
  );
}

export const revalidate = 0; // Fetch new data on every request