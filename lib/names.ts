import 'server-only'
import { and, eq, ilike } from 'drizzle-orm'
import { getDb } from './db/client'
import { names, type Gender } from './db/schema'
import { fetchRandomNames, lookupName } from './behindthename'
import { fetchNameMeaning } from './wikipedia'

function titleCase(raw: string) {
  return raw
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

async function findExisting(name: string, gender: Gender) {
  const db = getDb()
  const [existing] = await db
    .select()
    .from(names)
    .where(and(ilike(names.name, name), eq(names.gender, gender)))
    .limit(1)
  return existing ?? null
}

/**
 * Pulls fresh random names from BehindTheName until at least `targetCount`
 * new rows have been cached locally (or we give up after a few attempts —
 * every name we pull back has already been recognized by the API, so misses
 * should be rare). Enrichment (usages + best-effort Wikipedia meaning) is
 * fetched in parallel per name.
 */
export async function ensureNamesCached(targetCount = 6) {
  const db = getDb()
  let inserted = 0
  let attempts = 0

  while (inserted < targetCount && attempts < 4) {
    attempts += 1
    const candidates = await fetchRandomNames(6)

    for (const raw of candidates) {
      const details = await lookupName(raw)
      if (!details) continue

      const existing = await findExisting(details.name, details.gender)
      if (existing) continue

      const meaning = await fetchNameMeaning(details.name)

      await db
        .insert(names)
        .values({
          name: details.name,
          gender: details.gender,
          usages: details.usages,
          meaning: meaning?.meaning,
          meaningUrl: meaning?.url,
          source: 'api',
        })
        .onConflictDoNothing()

      inserted += 1
    }
  }

  return inserted
}

/**
 * Adds a name someone thought of outside the app. Reuses the cached row if
 * this name/gender combo already exists; otherwise best-effort enriches it
 * with BehindTheName usages and a Wikipedia meaning, same as swiped names.
 */
export async function addCustomName(rawName: string, gender: Gender) {
  const db = getDb()
  const name = titleCase(rawName)
  if (!name) throw new Error('Name is required')

  const existing = await findExisting(name, gender)
  if (existing) return existing

  const [details, meaning] = await Promise.all([lookupName(name), fetchNameMeaning(name)])

  const [row] = await db
    .insert(names)
    .values({
      name,
      gender,
      usages: details && details.gender === gender ? details.usages : [],
      meaning: meaning?.meaning,
      meaningUrl: meaning?.url,
      source: 'custom',
    })
    .onConflictDoUpdate({
      target: [names.name, names.gender],
      set: { name },
    })
    .returning()

  return row
}
