import type { NextApiRequest, NextApiResponse } from 'next'
import { defaultUser } from '@/lib/types'

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const userInfoCookie = req.cookies.userInfo

  // If the userInfo cookie exists, parse it into a JSON object and return
  if (userInfoCookie) {
    const user = JSON.parse(userInfoCookie)
    return res.status(200).json(user)
  }

  // Else return the default user object
  return res.status(200).json(defaultUser)
}
