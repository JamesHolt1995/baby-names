'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './button'
import { Field, FieldGroup, Fieldset, Label } from './fieldset'
import { Input } from './input'
import { Select } from './select'
import { Subheading } from './heading'
import { Text } from './text'
import type { Gender } from '@/lib/db/schema'

export function AddNameForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender>('f')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submit(action: 'shortlist' | 'love') {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch('/api/names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, gender, action }),
      })
      if (!res.ok) throw new Error('failed')
      setMessage(`Added "${name.trim()}" to your ${action === 'love' ? 'loved' : 'shortlisted'} names.`)
      setName('')
      router.refresh()
    } catch {
      setMessage('Something went wrong adding that name — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Fieldset>
      <Subheading>Add a name</Subheading>
      <Text>Thought of one outside the app? Add it straight to your list.</Text>
      <FieldGroup>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Field className="flex-1">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Freya"
              autoComplete="off"
            />
          </Field>
          <Field>
            <Label>Gender</Label>
            <Select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
              <option value="f">Girl</option>
              <option value="m">Boy</option>
            </Select>
          </Field>
          <div className="flex gap-2">
            <Button outline disabled={submitting} onClick={() => submit('shortlist')}>
              ♡ Shortlist
            </Button>
            <Button color="pink" disabled={submitting} onClick={() => submit('love')}>
              ♥ Love
            </Button>
          </div>
        </div>
        {message && <Text>{message}</Text>}
      </FieldGroup>
    </Fieldset>
  )
}
