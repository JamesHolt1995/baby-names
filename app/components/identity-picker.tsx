'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './button'
import { Heading } from './heading'
import { Text } from './text'
import type { UserId } from '@/lib/db/schema'

export function IdentityPicker() {
  const router = useRouter()
  const [loading, setLoading] = useState<UserId | null>(null)

  async function pick(userId: UserId) {
    setLoading(userId)
    await fetch('/api/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    router.refresh()
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <Heading>Who&rsquo;s swiping?</Heading>
      <Text>Pick yourself once — we&rsquo;ll remember it on this device.</Text>
      <div className="flex gap-4">
        <Button color="dark/zinc" onClick={() => pick('james')} disabled={loading !== null}>
          {loading === 'james' ? 'One sec…' : "I'm James"}
        </Button>
        <Button color="pink" onClick={() => pick('emma')} disabled={loading !== null}>
          {loading === 'emma' ? 'One sec…' : "I'm Emma"}
        </Button>
      </div>
    </div>
  )
}
