import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

type LoginRequestBody = {
  username: string
  password: string
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body as LoginRequestBody

    try {
      // Forward the login request to the backend API
      const response = await fetch('http://localhost:3333/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()

        // Create the session token cookie
        const cookie = serialize('sessionToken', data.token, {
          httpOnly: true,                                // Secure against XSS
          secure: process.env.NODE_ENV === 'production', // HTTPS in production
          maxAge: 60 * 60 * 24 * 30,                     // 1 month in seconds
          path: '/',                                     // On all routes
          sameSite: 'strict'                             // Mitigate CSRF
        })

        res.setHeader('Set-Cookie', cookie)
        return res.status(200).json({ message: 'Login successful' })
      } else {
        const error = await response.json()
        return res.status(401).json({ message: error.message || 'Invalid credentials' })
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
