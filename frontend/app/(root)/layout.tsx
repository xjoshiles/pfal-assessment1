import Sidebar from '@/components/Sidebar'
import { UserProvider } from '@/context/UserContext'
import { getCurrentUser } from '@/lib/session'

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser()

  return (
    <main className="font-work-sans h-screen">
      <UserProvider initialUser={user}>
          <div className="relative h-full flex flex-col w-full md:flex-row">
            {/* Sidebar */}
            <Sidebar />
            {/* Content */}
            <div
              className="flex flex-col flex-grow overflow-y-auto"
            >
              {children}
            </div>
          </div>
      </UserProvider>
    </main>
  )
}
