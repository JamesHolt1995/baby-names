import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { getDb } from '@/lib/db/client'
import { swipes, GENDERS, type Gender } from '@/lib/db/schema'
import { addCustomName } from '@/lib/names'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const userId = await getCurrentUser()
  if (!userId) {
    return NextResponse.json({ error: 'Not identified' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const gender = body?.gender as Gender
  const action = body?.action === 'love' ? 'love' : 'shortlist'

  if (!name || !GENDERS.includes(gender)) {
    return NextResponse.json({ error: 'Invalid name or gender' }, { status: 400 })
  }

  const nameRow = await addCustomName(name, gender)

  const db = getDb()
  await db
    .insert(swipes)
    .values({ userId, nameId: nameRow.id, action })
    .onConflictDoUpdate({
      target: [swipes.userId, swipes.nameId],
      set: { action, updatedAt: new Date() },
    })

  return NextResponse.json({ ok: true, name: nameRow })
}
