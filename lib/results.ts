import 'server-only'
import { and, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { getDb } from './db/client'
import { names, swipes, type Gender, type SwipeAction, type UserId } from './db/schema'

export type NameRow = {
  id: number
  name: string
  gender: Gender
  usages: { code: string; full: string }[]
  meaning: string | null
  meaningUrl: string | null
  jamesAction: SwipeAction | null
  emmaAction: SwipeAction | null
}

const isPositive = (action: SwipeAction | null) => action === 'shortlist' || action === 'love'

export type Results = {
  yours: NameRow[]
  disputed: NameRow[]
  agreed: NameRow[]
}

export async function getResults(userId: UserId): Promise<Results> {
  const db = getDb()
  const swipesJames = alias(swipes, 'swipes_james')
  const swipesEmma = alias(swipes, 'swipes_emma')

  const rows = await db
    .select({
      id: names.id,
      name: names.name,
      gender: names.gender,
      usages: names.usages,
      meaning: names.meaning,
      meaningUrl: names.meaningUrl,
      jamesAction: swipesJames.action,
      emmaAction: swipesEmma.action,
    })
    .from(names)
    .leftJoin(swipesJames, and(eq(swipesJames.nameId, names.id), eq(swipesJames.userId, 'james')))
    .leftJoin(swipesEmma, and(eq(swipesEmma.nameId, names.id), eq(swipesEmma.userId, 'emma')))

  const yours: NameRow[] = []
  const disputed: NameRow[] = []
  const agreed: NameRow[] = []

  for (const row of rows) {
    const typed = row as NameRow
    const myAction = userId === 'james' ? typed.jamesAction : typed.emmaAction

    if (isPositive(myAction)) yours.push(typed)

    const oneVetoedOtherPositive =
      (typed.jamesAction === 'veto' && isPositive(typed.emmaAction)) ||
      (typed.emmaAction === 'veto' && isPositive(typed.jamesAction))
    if (oneVetoedOtherPositive) disputed.push(typed)

    if (isPositive(typed.jamesAction) && isPositive(typed.emmaAction)) agreed.push(typed)
  }

  return { yours, disputed, agreed }
}
