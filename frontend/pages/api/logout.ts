import { NextApiRequest, NextApiResponse } from 'next'
import { serialize, parse } from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const cookies = parse(req.headers.cookie || "")
    const token = cookies.sessionToken

    try {
      // Send logout request to the backend API
      await fetch('http://localhost:3333/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      // Clear the session token cookie regardless of server response
      const cookie = serialize('sessionToken', '', {
        httpOnly: true,                                // Secure against XSS
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        maxAge: 0,                                     // Clear immediately
        path: '/',                                     // On all routes
        sameSite: 'strict'                             // Mitigate CSRF
      })

      res.setHeader('Set-Cookie', cookie)
      return res.status(200).json({ message: 'Logout successful' })

    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
