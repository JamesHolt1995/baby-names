import { pgTable, serial, integer, text, jsonb, timestamp, unique } from 'drizzle-orm/pg-core'

export type NameUsage = { code: string; full: string }

export const USER_IDS = ['james', 'emma'] as const
export type UserId = (typeof USER_IDS)[number]

// BehindTheName only ever returns 'f' or 'm' for a looked-up name, but a
// manually-added name can be tagged 'unisex' too.
export const GENDERS = ['f', 'm', 'unisex'] as const
export type Gender = (typeof GENDERS)[number]

export const SWIPE_ACTIONS = ['veto', 'shortlist', 'love'] as const
export type SwipeAction = (typeof SWIPE_ACTIONS)[number]

export const names = pgTable(
  'names',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    gender: text('gender').$type<Gender>().notNull(),
    usages: jsonb('usages').$type<NameUsage[]>().notNull().default([]),
    meaning: text('meaning'),
    meaningUrl: text('meaning_url'),
    source: text('source').$type<'behindthename' | 'api_ninjas' | 'custom'>().notNull().default('behindthename'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [unique('names_name_gender_unique').on(table.name, table.gender)]
)

export const swipes = pgTable(
  'swipes',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').$type<UserId>().notNull(),
    nameId: integer('name_id')
      .notNull()
      .references(() => names.id, { onDelete: 'cascade' }),
    action: text('action').$type<SwipeAction>().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [unique('swipes_user_name_unique').on(table.userId, table.nameId)]
)
