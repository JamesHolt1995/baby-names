'use client'

import { useState } from 'react'
import { Badge } from './badge'
import { Button } from './button'
import { GenderBadge } from './gender-badge'
import { NameActions } from './name-actions'
import { Text } from './text'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'
import type { NameRow } from '@/lib/results'
import type { SwipeAction, UserId } from '@/lib/db/schema'

const PAGE_SIZE = 5

function actionBadge(action: SwipeAction | null) {
  if (action === 'love') return <Badge color="pink">Loved</Badge>
  if (action === 'shortlist') return <Badge color="green">Shortlisted</Badge>
  if (action === 'veto') return <Badge color="red">Vetoed</Badge>
  return <Badge color="zinc">Not seen</Badge>
}

export function NameTable({
  rows,
  userId,
  showActions = false,
}: {
  rows: NameRow[]
  userId: UserId
  showActions?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const visibleRows = expanded ? rows : rows.slice(0, PAGE_SIZE)
  const remaining = rows.length - visibleRows.length

  return (
    <div className="flex flex-col gap-3">
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
          {visibleRows.map((row) => {
            const myAction = userId === 'james' ? row.jamesAction : row.emmaAction
            return (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      {row.name} <GenderBadge gender={row.gender} />
                    </span>
                    {row.meaning && <Text className="line-clamp-2 max-w-md text-xs">{row.meaning}</Text>}
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

      {rows.length > PAGE_SIZE && (
        <div className="flex justify-center">
          <Button plain onClick={() => setExpanded((e) => !e)}>
            {expanded ? 'Show less' : `Show ${remaining} more`}
          </Button>
        </div>
      )}
    </div>
  )
}
