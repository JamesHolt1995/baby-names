import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null

/**
 * Lazily creates the Drizzle/Neon client on first use, so importing this
 * module doesn't blow up at build time when DATABASE_URL isn't set yet.
 */
export function getDb() {
  if (cached) return cached

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env.local and point it at a Neon connection string.'
    )
  }

  const sql = neon(connectionString)
  cached = drizzle(sql, { schema })
  return cached
}
