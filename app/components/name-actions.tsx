'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './button'
import type { SwipeAction } from '@/lib/db/schema'

export function NameActions({ nameId, action }: { nameId: number; action: SwipeAction }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function setAction(newAction: SwipeAction) {
    if (submitting) return
    setSubmitting(true)
    try {
      await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameId, action: newAction }),
      })
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex justify-end gap-3">
      {action !== 'love' && (
        <Button plain disabled={submitting} onClick={() => setAction('love')}>
          Move to Loved
        </Button>
      )}
      {action !== 'shortlist' && (
        <Button plain disabled={submitting} onClick={() => setAction('shortlist')}>
          Move to Shortlist
        </Button>
      )}
      <Button plain disabled={submitting} onClick={() => setAction('veto')}>
        Veto
      </Button>
    </div>
  )
}
