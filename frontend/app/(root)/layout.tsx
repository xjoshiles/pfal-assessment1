import Navbar from '@/components/Navbar'
import { UserProvider } from '@/context/UserContext'
import { getCurrentUser } from '@/lib/session'

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser()

  return (
    <main className="font-work-sans h-screen">
      <UserProvider initialUser={user}>
          <div className="relative h-full flex flex-col w-full md:flex-row overflow-hidden">
            {/* Sidebar */}
            <Navbar />
            {/* Content */}
            <div
              className="flex flex-col flex-grow overflow-y-auto mb-8"
            >
              {children}
            </div>
          </div>
      </UserProvider>
    </main>
  )
}
