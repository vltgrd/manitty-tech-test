import { auth0 } from '@/lib/auth0'
import { NextResponse } from 'next/server'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ months: string }> }
) {
  const session = await auth0.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { months } = await params
    const monthsValue = months || '12'
    const response = await fetch(
      `${BACKEND_URL}/alerts/numbers-by-months/${monthsValue}`,
      {
        headers: {
          Authorization: `Bearer ${session.tokenSet.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch month data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch month data' },
      { status: 500 }
    )
  }
}
