import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { USER_IDS } from '@/lib/db/schema'

const USER_COOKIE = 'bn_user'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const userId = body?.userId

  if (!USER_IDS.includes(userId)) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 400 })
  }

  const cookieStore = await cookies()
  cookieStore.set(USER_COOKIE, userId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
