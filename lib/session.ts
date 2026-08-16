import 'server-only'
import { cookies } from 'next/headers'
import { USER_IDS, type UserId } from './db/schema'

const USER_COOKIE = 'bn_user'
const PREFER_POPULAR_COOKIE = 'bn_prefer_popular'

export async function getCurrentUser(): Promise<UserId | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(USER_COOKIE)?.value
  return USER_IDS.includes(value as UserId) ? (value as UserId) : null
}

export async function getPreferPopular(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(PREFER_POPULAR_COOKIE)?.value === 'true'
}
