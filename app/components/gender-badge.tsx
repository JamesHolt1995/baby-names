import { Badge } from './badge'
import type { Gender } from '@/lib/db/schema'

const LABELS: Record<Gender, string> = { f: 'Girl', m: 'Boy', unisex: 'Neutral' }
const COLORS: Record<Gender, 'pink' | 'blue' | 'violet'> = { f: 'pink', m: 'blue', unisex: 'violet' }

export function GenderBadge({ gender }: { gender: Gender }) {
  return <Badge color={COLORS[gender]}>{LABELS[gender]}</Badge>
}
