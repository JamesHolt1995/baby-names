import 'server-only'
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { getDb } from './db/client'
import { names, swipes, type Gender, type UserId } from './db/schema'
import { ensureNamesCached } from './names'

const otherUserOf: Record<UserId, UserId> = { james: 'emma', emma: 'james' }

// Deliberately has no field for the partner's action — seeing that they
// shortlisted/loved a name before forming your own opinion would bias the
// swipe, even though it's exactly what drives the priority ordering below.
export type QueueCard = {
  id: number
  name: string
  gender: Gender
  usages: { code: string; full: string }[]
  meaning: string | null
  meaningUrl: string | null
}

const cardColumns = {
  id: names.id,
  name: names.name,
  gender: names.gender,
  usages: names.usages,
  meaning: names.meaning,
  meaningUrl: names.meaningUrl,
}

/**
 * Picks the next name to show `userId`: names their partner has already
 * shortlisted/loved (and this user hasn't seen) take priority over anything
 * new, and "loved" outranks "shortlisted". Falls back to fresh names from the
 * local cache, then pulls more (from BehindTheName, or from API Ninjas'
 * popular names if `preferPopular` is set) if that cache is dry.
 */
export async function getNextCardForUser(
  userId: UserId,
  options: { preferPopular?: boolean } = {}
): Promise<QueueCard | null> {
  const db = getDb()
  const otherUser = otherUserOf[userId]

  const swipesSelf = alias(swipes, 'swipes_self')
  const swipesOther = alias(swipes, 'swipes_other')

  const [priorityCard] = await db
    .select(cardColumns)
    .from(names)
    .innerJoin(
      swipesOther,
      and(eq(swipesOther.nameId, names.id), eq(swipesOther.userId, otherUser), inArray(swipesOther.action, ['love', 'shortlist']))
    )
    .leftJoin(swipesSelf, and(eq(swipesSelf.nameId, names.id), eq(swipesSelf.userId, userId)))
    .where(isNull(swipesSelf.id))
    .orderBy(sql`case when ${swipesOther.action} = 'love' then 0 else 1 end`, asc(swipesOther.createdAt))
    .limit(1)

  if (priorityCard) return priorityCard as QueueCard

  const fetchFreshCard = async () => {
    const swipesSelfOnly = alias(swipes, 'swipes_self_only')
    const [freshCard] = await db
      .select(cardColumns)
      .from(names)
      .leftJoin(swipesSelfOnly, and(eq(swipesSelfOnly.nameId, names.id), eq(swipesSelfOnly.userId, userId)))
      .where(isNull(swipesSelfOnly.id))
      .orderBy(asc(names.createdAt))
      .limit(1)
    return (freshCard as QueueCard) ?? null
  }

  const freshCard = await fetchFreshCard()
  if (freshCard) return freshCard

  const insertedCount = await ensureNamesCached(6, { preferPopular: options.preferPopular })
  if (insertedCount === 0) return null

  return fetchFreshCard()
}
