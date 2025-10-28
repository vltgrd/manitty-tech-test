import { auth0 } from '@/lib/auth0'

export async function apiCall(path: string, options: RequestInit = {}) {
  // Retrieve the current session to get the access token
  const session = await auth0.getSession()

  if (!session?.accessToken) {
    throw new Error('No access token available')
  }

  // Construct the full backend URL
  const apiUrl = `http://localhost:5555${path}`

  const response = await fetch(apiUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
