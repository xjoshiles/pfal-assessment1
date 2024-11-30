import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.sessionToken

  try {
    // Send logout request to the backend API
    await fetch(`${process.env.NEXT_PUBLIC_ADONIS_API}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })

    // Clear the session token cookie regardless of server response
    const sessionTokenCookie = serialize('sessionToken', '', {
      httpOnly: true,                                // Secure against XSS
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      maxAge: 0,                                     // Clear immediately
      path: '/',                                     // On all routes
      sameSite: 'strict'                             // Mitigate CSRF
    })

    // Clear the user info cookie
    const userInfoCookie = serialize('userInfo', '', {
      httpOnly: true,                                // Secure against XSS
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      maxAge: 0,                                     // Clear immediately
      path: '/',                                     // On all routes
      sameSite: 'strict'                             // Mitigate CSRF
    })

    // Set the cookies. Note that we must only make one call because
    // a second call to Set-Cookie will overwrite the previous one
    res.setHeader('Set-Cookie', [sessionTokenCookie, userInfoCookie])
    return res.status(200).json({ message: 'Logout successful' })

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}
