import { getCurrentUser, getPreferPopular } from '@/lib/session'
import { getNextCardForUser } from '@/lib/queue'
import { IdentityPicker } from './components/identity-picker'
import { SwipeDeck } from './components/swipe-card'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const userId = await getCurrentUser()

  if (!userId) {
    return (
      <div className="flex flex-1 flex-col">
        <IdentityPicker />
      </div>
    )
  }

  const preferPopular = await getPreferPopular()
  const initialCard = await getNextCardForUser(userId, { preferPopular })

  return (
    <div className="flex flex-1 flex-col">
      <SwipeDeck initialCard={initialCard} initialPreferPopular={preferPopular} />
    </div>
  )
}
