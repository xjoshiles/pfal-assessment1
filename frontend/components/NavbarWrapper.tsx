import Navbar from '@/components/NavbarTest'
import { parseSession } from '@/app/lib/session'

export default async function NavbarWrapper() {
  const session = await parseSession()

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