import { NextApiRequest, NextApiResponse } from 'next'
import { parse } from 'cookie'

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const nullSession = {
    isAuth: false, userId: null, username: null, isAdmin: null
  }

  try {
    const cookies = parse(req.headers.cookie || "")
    const token = cookies.sessionToken

    if (!token) {
      return res.status(200).json(nullSession)
    }

    const response = await fetch('http://localhost:3333/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!response.ok) {
      return res.status(200).json(nullSession)
    }

    const data = await response.json()

    return res.status(200).json({
      isAuth: true,
      userId: data.id,
      username: data.username,
      isAdmin: data.admin,
    })
  } catch (error) {
    console.error('Error getting session:', error)
    return res.status(500).json(nullSession)
  }
}