'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Modal from './Modal'
import Button from './ui/Button'
import PhoneInput from './PhoneInput'
import { addPerson, updatePerson, setPersonGroup } from '@/app/actions'

interface Props {
  sectionId: number
  groups?: { id: number; name: string }[]
  /** Pass person to edit, omit to add */
  person?: { id: number; name: string; groupId?: number | null; phone?: string | null }
  onClose: () => void
}

export default function PersonModal({ sectionId, groups = [], person, onClose }: Props) {
  const [name, setName] = useState(person?.name ?? '')
  const [phone, setPhone] = useState(person?.phone ?? '')
  const [groupId, setGroupId] = useState<string>(
    person?.groupId != null ? String(person.groupId) : '',
  )
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        if (person) {
          await updatePerson(person.id, name, phone)
          if (groups.length > 0) {
            await setPersonGroup(person.id, groupId ? Number(groupId) : null)
          }
        } else {
          await addPerson(sectionId, name, groupId ? Number(groupId) : null, phone)
        }
        router.refresh()
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      }
    })
  }

  return (
    <Modal title={person ? 'Persoon bewerken' : 'Persoon toevoegen'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="person-name" className="block text-sm font-medium text-ink-700 mb-1">
            Naam
          </label>
          <input
            id="person-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Naam van de persoon"
            required
            autoFocus
            className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
          />
        </div>
        <PhoneInput
          id="person-phone"
          label="Telefoonnummer (optioneel)"
          value={phone}
          onChange={setPhone}
        />
        {groups.length > 0 && (
          <div>
            <label htmlFor="person-group" className="block text-sm font-medium text-ink-700 mb-1">
              Groep
            </label>
            <select
              id="person-group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent bg-white"
            >
              <option value="">Geen groep</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}
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
