import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { getNextCardForUser } from '@/lib/queue'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getCurrentUser()
  if (!userId) {
    return NextResponse.json({ error: 'Not identified' }, { status: 401 })
  }

  const card = await getNextCardForUser(userId)
  return NextResponse.json({ card })
}
