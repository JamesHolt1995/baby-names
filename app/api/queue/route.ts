import { NextResponse } from 'next/server'
import { getCurrentUser, getPreferPopular } from '@/lib/session'
import { getNextCardForUser } from '@/lib/queue'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getCurrentUser()
  if (!userId) {
    return NextResponse.json({ error: 'Not identified' }, { status: 401 })
  }

  const preferPopular = await getPreferPopular()
  const card = await getNextCardForUser(userId, { preferPopular })
  return NextResponse.json({ card })
}
