import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { getResults, type NameRow } from '@/lib/results'
import type { SwipeAction, UserId } from '@/lib/db/schema'
import { AddNameForm } from '../components/add-name-form'
import { NameActions } from '../components/name-actions'
import { Heading, Subheading } from '../components/heading'
import { Badge } from '../components/badge'
import { Text } from '../components/text'
import { Divider } from '../components/divider'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table'

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

      <Divider soft />

      <Section
        title="Agreed"
        description="Names you both shortlisted and/or loved."
        empty="No matches yet — keep swiping!"
        rows={agreed}
      >
        <NameTable rows={agreed} userId={userId} />
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

function actionBadge(action: SwipeAction | null) {
  if (action === 'love') return <Badge color="pink">Loved</Badge>
  if (action === 'shortlist') return <Badge color="green">Shortlisted</Badge>
  if (action === 'veto') return <Badge color="red">Vetoed</Badge>
  return <Badge color="zinc">Not seen</Badge>
}

function NameTable({ rows, userId, showActions = false }: { rows: NameRow[]; userId: UserId; showActions?: boolean }) {
  return (
    <Table dense>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>James</TableHeader>
          <TableHeader>Emma</TableHeader>
          {showActions && <TableHeader />}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => {
          const myAction = userId === 'james' ? row.jamesAction : row.emmaAction
          return (
            <TableRow key={row.id}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">
                    {row.name} <Badge color={row.gender === 'f' ? 'pink' : 'blue'}>{row.gender === 'f' ? 'Girl' : 'Boy'}</Badge>
                  </span>
                  {row.meaning && <Text className="max-w-md text-xs">{row.meaning}</Text>}
                </div>
              </TableCell>
              <TableCell>{actionBadge(row.jamesAction)}</TableCell>
              <TableCell>{actionBadge(row.emmaAction)}</TableCell>
              {showActions && (
                <TableCell>
                  <NameActions nameId={row.id} action={myAction ?? 'shortlist'} />
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
