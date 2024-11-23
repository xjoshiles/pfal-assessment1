import type { NextApiRequest, NextApiResponse } from 'next'

// Base URL of the AdonisJS backend API
const ADONIS_API_URL = 'http://localhost:3333'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body, query } = req

  try {
    // Extract the path after '/api/adonis' from the request as a string
    const { path, ...queryParams } = query as {
      path: string[],
      [key: string]: unknown
    }
    const pathname = '/' + path.join('/')

    // Extract the query parameters as a string
    const queryString = new URLSearchParams(queryParams as Record<string, string>).toString()

    // Make the final URL for the request
    const url = `${ADONIS_API_URL}${pathname}${queryString ? `?${queryString}` : ''}`
    console.log(`Aonis.js api request: ${url}`)

    // Convert req.headers into a plain object of strings, filtering out non-strings
    const headers = Object.fromEntries(
      Object.entries(req.headers).filter(([key, value]) => typeof value === 'string')
    )

    // Forward the request to the AdonisJS backend
    const response = await fetch(url, {
      method: method,    // Forward the same HTTP method (GET, POST, PUT, etc.)
      headers: {
        'Content-Type': 'application/json',
        ...headers,      // Forward headers (needed for authenticated routes)
      },
      body: method === 'POST' || method === 'PUT' ? JSON.stringify(body) : undefined
    })

    // Parse the JSON response from AdonisJS backend
    const data = await response.json()

    // Return the response to the client
    return res.status(response.status).json(data)

  } catch (error) {
    console.error('Error proxying request:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
