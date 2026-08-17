import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { getResults, type NameRow } from '@/lib/results'
import { AddNameForm } from '../components/add-name-form'
import { NameTable } from '../components/name-table'
import { Heading, Subheading } from '../components/heading'
import { Text } from '../components/text'
import { Divider } from '../components/divider'

export const dynamic = 'force-dynamic'

export default async function ResultsPage() {
  const userId = await getCurrentUser()
  if (!userId) redirect('/')

  const { yours, disputed, agreed } = await getResults(userId)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 p-6">
      <div>
        <Heading>My Names</Heading>
        <Text>Everything you and your partner have reacted to so far.</Text>
      </div>

      <AddNameForm />

      <Divider soft />

      <Section
        title="Agreed"
        description="Names you both shortlisted and/or loved."
        empty="No matches yet — keep swiping!"
        rows={agreed}
      >
        <NameTable rows={agreed} userId={userId} />
      </Section>

      <Divider soft />

      <Section title="Your list" empty="Nothing shortlisted or loved yet — get swiping!" rows={yours}>
        <NameTable rows={yours} userId={userId} showActions />
      </Section>

      <Divider soft />

      <Section
        title="Disputed"
        description="One of you vetoed, the other shortlisted or loved it — worth a chat."
        empty="No disagreements right now."
        rows={disputed}
      >
        <NameTable rows={disputed} userId={userId} />
      </Section>
    </div>
  )
}

function Section({
  title,
  description,
  empty,
  rows,
  children,
}: {
  title: string
  description?: string
  empty: string
  rows: NameRow[]
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <Subheading>{title}</Subheading>
      {description && <Text>{description}</Text>}
      {rows.length === 0 ? <Text>{empty}</Text> : children}
    </section>
  )
}
