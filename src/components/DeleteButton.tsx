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
          className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg font-medium disabled:opacity-50"
        >
          {isPending ? '...' : 'Verwijder'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-100"
        >
          Nee
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      aria-label="Verwijderen"
      title="Verwijderen"
    >
      <IconTrash className="w-4 h-4" />
    </button>
  )
}
