import 'server-only'
import type { Gender, NameUsage } from './db/schema'

const BASE_URL = 'https://www.behindthename.com/api'

function getApiKey() {
  const key = process.env.BEHIND_THE_NAME_API_KEY
  if (!key) {
    throw new Error('BEHIND_THE_NAME_API_KEY is not set — see .env.example.')
  }
  return key
}

/**
 * Pulls a batch of random given names from BehindTheName. Note: this endpoint
 * returns bare name strings only (no gender/usage info) — call lookupName()
 * separately for details.
 */
export async function fetchRandomNames(count = 6): Promise<string[]> {
  const url = new URL(`${BASE_URL}/random.json`)
  url.searchParams.set('key', getApiKey())
  url.searchParams.set('number', String(Math.min(Math.max(count, 1), 6)))

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`BehindTheName random.json failed: ${res.status}`)
  }
  const data = (await res.json()) as { names: string[] }
  return data.names ?? []
}

export type NameLookupResult = { name: string; gender: Gender; usages: NameUsage[] }

/**
 * Looks up a single name's gender and the languages it's used in. Returns
 * null if BehindTheName doesn't recognize the name (e.g. a made-up nickname).
 */
export async function lookupName(name: string): Promise<NameLookupResult | null> {
  const url = new URL(`${BASE_URL}/lookup.json`)
  url.searchParams.set('key', getApiKey())
  url.searchParams.set('name', name)

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null

  const data = (await res.json()) as Array<{
    name: string
    gender: string
    usages?: Array<{ usage_code: string; usage_full: string }>
  }>
  const first = data?.[0]
  if (!first || (first.gender !== 'f' && first.gender !== 'm')) return null

  return {
    name: first.name,
    gender: first.gender,
    usages: (first.usages ?? []).map((u) => ({ code: u.usage_code, full: u.usage_full })),
  }
}
