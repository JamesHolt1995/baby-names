import 'server-only'

export type NameMeaning = { meaning: string; url: string }

/**
 * Best-effort lookup of a name's real meaning/etymology via Wikipedia's public
 * summary API. Only trusts pages explicitly disambiguated as "<Name> (given
 * name)" so we never show a wrong meaning from an unrelated article (e.g. a
 * place, a brand, a TV show sharing the name). Returns null — never throws —
 * when there's no such article or the request fails for any reason, so this
 * is always safe to treat as optional enrichment.
 */
export async function fetchNameMeaning(name: string): Promise<NameMeaning | null> {
  const title = `${name}_(given_name)`
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'BabyNamer/1.0 (personal family project; contact via GitHub)',
        Accept: 'application/json',
      },
    })
    if (!res.ok) return null

    const data = (await res.json()) as { extract?: string; content_urls?: { desktop?: { page?: string } } }
    if (!data.extract) return null

    return {
      meaning: data.extract,
      url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    }
  } catch {
    return null
  }
}
