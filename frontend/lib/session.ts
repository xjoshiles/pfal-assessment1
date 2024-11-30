import 'server-only'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { UserType, defaultUser } from '@/lib/types'

export const getCurrentUser = cache(async () => {
  const userInfoCookie = (await cookies()).get('userInfo')?.value

  // If the userInfo cookie exists, parse it into a UserType and return
  if (userInfoCookie) {
    const user = JSON.parse(userInfoCookie) as UserType
    return user
  }

  // Else return the default user object
  return defaultUser
})
