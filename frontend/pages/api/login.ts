import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

type LoginRequestBody = {
  username: string
  password: string
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { username, password } = req.body as LoginRequestBody

  try {
    // Forward the login request to the backend API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ADONIS_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      const data = await response.json()

      // Create the session token cookie
      const sessionTokenCookie = serialize('sessionToken', data.token.token, {
        httpOnly: true,                                // Secure against XSS
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        maxAge: 60 * 60 * 24 * 30,                     // 1 month in seconds
        path: '/',                                     // On all routes
        sameSite: 'strict'                             // Mitigate CSRF
      })

      // Create the user info cookie
      const userInfoCookie = serialize('userInfo', JSON.stringify(data.user), {
        httpOnly: true,                                // Secure against XSS
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        maxAge: 60 * 60 * 24 * 30,                     // 1 month in seconds
        path: '/',                                     // On all routes
        sameSite: 'strict'                             // Mitigate CSRF
      })

      // Set the cookies. Note that we must only make one call because
      // a second call to Set-Cookie will overwrite the previous one
      res.setHeader('Set-Cookie', [sessionTokenCookie, userInfoCookie])
      return res.status(200).json({ message: 'Login successful' })

    } else {
      const error = await response.json()
      return res.status(401).json({
        message: error.message || 'Invalid credentials'
      })
    }

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}
