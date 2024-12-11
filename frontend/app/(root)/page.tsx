import { getCurrentUser } from '@/lib/session'
import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'

type FeatureCardProps = {
  icon: ReactNode     // Accepts any React component or JSX (like an SVG)
  title: string       // The title of the feature
  description: string // Description text
  linkText: string    // Text for the link
  href: string        // URL for the link
  bgColor: string     // Tailwindcss utility class for background color
}

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen text-gray-800 flex flex-col items-center px-6 py-8">
      {/* Logo Section */}
      <div className="flex flex-col items-center text-center space-y-4">
        <Image
          src="/logo.svg"
          alt="Flashcard App Logo"
          width={128}
          height={128}
          className="md:w-32 md:h-32"
        />
        <h1 className="text-4xl font-extrabold text-gray-900">TestVar</h1>
        <p className="text-lg text-gray-600">Learn smarter, one flashcard at a time.</p>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-7xl w-full">
        {/* Create Flashcard Sets */}
        <FeatureCard
          icon={
            <svg
              className="w-10 h-10 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
          title="Create Flashcard Sets"
          description="Easily create custom flashcard sets to master any topic."
          linkText="Get Started →"
          href="/sets/create"
          bgColor="bg-blue-100"
        />

        {/* Create Collections */}
        <FeatureCard
          icon={
            <svg
              className="w-10 h-10 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7v14" />
            </svg>
          }
          title="Organize Collections"
          description="Group your flashcard sets into collections for better organization."
          linkText="Start Organizing →"
          href="/collections/create"
          bgColor="bg-green-100"
        />

        {/* Leave Reviews */}
        <FeatureCard
          icon={
            <svg
              className="w-10 h-10 text-yellow-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.5l3.09 6.26L21 12l-5.91 1.24L12 19.5l-3.09-6.26L3 12l5.91-1.24L12 4.5z"
              />
            </svg>
          }
          title="Leave Reviews"
          description="Share your thoughts on flashcard sets and collections to help others."
          linkText="Browse Sets →"
          href="/sets"
          bgColor="bg-yellow-100"
        />
      </div>

      {/* Call to action if user is not logged in */}
      {!user.id && (
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Start Learning Today</h2>
          <p className="text-gray-600 mt-2">
            Join other users using TestVar to achieve their goals. It's completely free!
          </p>
          <Link href="/register" className="mt-6 inline-block text-2xl item_preview_btn !px-10 !py-4">
            Register
          </Link>
        </div>
      )}
    </div>
  )
}

const FeatureCard: React.FC<FeatureCardProps> = (
  { icon, title, description, linkText, href, bgColor }
) => {
  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center">
        <div className={`${bgColor} p-4 rounded-full`}>{icon}</div>
        <h2 className="text-xl font-semibold mt-4">{title}</h2>
        <p className="text-gray-600 mt-2">{description}</p>
        <Link href={href} className="mt-4 text-primary hover:underline font-medium">{linkText}</Link>
      </div>
    </>
  )
}
