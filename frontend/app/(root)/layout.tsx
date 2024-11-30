import NavbarWrapper from '@/components/NavbarWrapper'

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="font-work-sans">
      <NavbarWrapper />
      {children}
    </main>
  )
}
