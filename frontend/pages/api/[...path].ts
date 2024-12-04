import type { NextApiRequest, NextApiResponse } from 'next'

// Base URL of the AdonisJS backend API
const ADONIS_API_URL = `${process.env.NEXT_PUBLIC_ADONIS_API}`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body, query } = req
  const token = req.cookies.sessionToken

  try {
    // Extract the path after '/api/adonis' from the request as a string
    const { path, ...queryParams } = query as {
      path: string[],
      [key: string]: unknown
    }
    const pathname = '/' + path.join('/')

    // Extract the query parameters as a string
    const queryString = Object.keys(queryParams).length
      ? `?${new URLSearchParams(queryParams as Record<string, string>)}` : ''

    // Make the final URL for the request
    const url = `${ADONIS_API_URL}${pathname}${queryString}`

    // Forward the request to the AdonisJS backend
    console.log(`Aonis.js api request: ${url}`)
    const response = await fetch(url, {
      method: method,    // Forward the same HTTP method (GET, POST, PUT, etc.)
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    })

    // Parse the JSON response from AdonisJS backend (if it exists)
    const text = await response.text()
    const data = text ? JSON.parse(text) : {}

    // Return the response to the client
    return res.status(response.status).json(data)

  } catch (error) {
    console.error('Error proxying request:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
