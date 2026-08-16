import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { getDb } from '@/lib/db/client'
import { swipes, SWIPE_ACTIONS, type SwipeAction } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const userId = await getCurrentUser()
  if (!userId) {
    return NextResponse.json({ error: 'Not identified' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const nameId = Number(body?.nameId)
  const action = body?.action as SwipeAction

  if (!Number.isInteger(nameId) || !SWIPE_ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'Invalid nameId or action' }, { status: 400 })
  }

  const db = getDb()
  await db
    .insert(swipes)
    .values({ userId, nameId, action })
    .onConflictDoUpdate({
      target: [swipes.userId, swipes.nameId],
      set: { action, updatedAt: new Date() },
    })

  return NextResponse.json({ ok: true })
}
