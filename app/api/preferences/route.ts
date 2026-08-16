import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const PREFER_POPULAR_COOKIE = 'bn_prefer_popular'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const preferPopular = body?.preferPopular === true

  const cookieStore = await cookies()
  cookieStore.set(PREFER_POPULAR_COOKIE, String(preferPopular), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
