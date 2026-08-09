'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deletePerson, deleteOrder, deleteGroup } from '@/app/actions'
import { IconTrash } from './icons'

type Props =
  | { kind: 'person'; id: number }
  | { kind: 'order'; id: number }
  | { kind: 'group'; id: number }

export default function DeleteButton(props: Props) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      if (props.kind === 'person') {
        await deletePerson(props.id)
      } else if (props.kind === 'group') {
        await deleteGroup(props.id)
      } else {
        await deleteOrder(props.id)
      }
      router.refresh()
    })
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="font-mono text-xs uppercase bg-crimson-600 text-white px-2 py-1 rounded-sm font-medium disabled:opacity-50"
        >
          {isPending ? '...' : 'Verwijder'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="font-mono text-xs text-ink-500 px-2 py-1 rounded-sm hover:bg-paper-100"
        >
          Nee
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-sm text-ink-300 hover:text-crimson-600 hover:bg-crimson-600/10 transition-colors"
      aria-label="Verwijderen"
      title="Verwijderen"
    >
      <IconTrash className="w-4 h-4" />
    </button>
  )
}
