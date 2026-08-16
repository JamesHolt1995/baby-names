import 'server-only'

const BASE_URL = 'https://api.api-ninjas.com/v1/babynames'

function getApiKey() {
  const key = process.env.API_NINJAS_KEY
  if (!key) {
    throw new Error('API_NINJAS_KEY is not set — see .env.example.')
  }
  return key
}

/**
 * Pulls real-world-popular baby names from API Ninjas. Like BehindTheName's
 * random.json, this returns bare name strings only (no gender/usage info) —
 * lookupName() is still used to fill those in, and to filter out anything
 * BehindTheName itself doesn't recognize (so we always know a safe gender).
 */
export async function fetchPopularNames(): Promise<string[]> {
  const url = new URL(BASE_URL)
  url.searchParams.set('popular_only', 'true')

  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'X-Api-Key': getApiKey() },
  })
  if (!res.ok) {
    throw new Error(`API Ninjas babynames failed: ${res.status}`)
  }
  return (await res.json()) as string[]
}
