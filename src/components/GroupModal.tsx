'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Modal from './Modal'
import Button from './ui/Button'
import { addGroup, updateGroup } from '@/app/actions'

interface Props {
  sectionId: number
  /** Pass group to edit, omit to add */
  group?: { id: number; name: string }
  onClose: () => void
}

export default function GroupModal({ sectionId, group, onClose }: Props) {
  const [name, setName] = useState(group?.name ?? '')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        if (group) {
          await updateGroup(group.id, name)
        } else {
          await addGroup(sectionId, name)
        }
        router.refresh()
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      }
    })
  }

  return (
    <Modal title={group ? 'Groep bewerken' : 'Groep toevoegen'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="group-name" className="block text-sm font-medium text-ink-700 mb-1">
            Groepsnaam
          </label>
          <input
            id="group-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bijv. Atari"
            required
            autoFocus
            className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Annuleren
          </Button>
          <Button type="submit" variant="primary" disabled={isPending} className="flex-1">
            {isPending ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
