'use client'

import { useState } from 'react'
import { Checkbox, CheckboxField } from './checkbox'
import { Description, Label } from './fieldset'

export function PopularToggle({ initialValue }: { initialValue: boolean }) {
  const [checked, setChecked] = useState(initialValue)
  const [pending, setPending] = useState(false)

  async function toggle(value: boolean) {
    setChecked(value)
    setPending(true)
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferPopular: value }),
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <CheckboxField className="max-w-xs">
      <Checkbox checked={checked} onChange={toggle} disabled={pending} />
      <Label>Prefer popular names</Label>
      <Description>Pull from real-world-popular names instead of fully random ones.</Description>
    </CheckboxField>
  )
}
