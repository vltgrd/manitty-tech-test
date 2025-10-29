import { auth0 } from '@/lib/auth0'
import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:5555'

export async function GET(request: Request) {
  const session = await auth0.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // Get search params from the incoming request
    const { searchParams } = new URL(request.url)

    // Build URL with search params
    const backendUrl = new URL(`${BACKEND_URL}/alerts`)
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value)
    })

    const response = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Bearer ${session.tokenSet.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}
