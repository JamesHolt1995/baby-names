import 'server-only'
import { cookies } from 'next/headers'
import { USER_IDS, type UserId } from './db/schema'

const USER_COOKIE = 'bn_user'

export async function getCurrentUser(): Promise<UserId | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(USER_COOKIE)?.value
  return USER_IDS.includes(value as UserId) ? (value as UserId) : null
}
