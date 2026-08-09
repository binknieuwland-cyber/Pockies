'use client'

import { useState } from 'react'
import { formatEuro, inclBtw } from '@/lib/utils'
import PersonModal from './PersonModal'
import OrderModal from './OrderModal'
import GroupModal from './GroupModal'
import DeleteButton from './DeleteButton'
import Button from './ui/Button'
import EmptyState from './ui/EmptyState'
import { IconChevronDown, IconEdit, IconPlus } from './icons'

interface Product {
  id: number
  name: string
  priceExclBtw: number
}

interface OrderData {
  id: number
  productId: number
  size: string
  quantity: number
  note: string | null
  product: Product
}

interface PersonData {
  id: number
  name: string
  locked: boolean
  groupId: number | null
  orders: OrderData[]
}

interface GroupData {
  id: number
  name: string
  sortOrder: number
}

interface Props {
  section: { id: number; name: string }
  persons: PersonData[]
  products: Product[]
  groups: GroupData[]
}

export default function SectionView({ section, persons, products, groups }: Props) {
  // Accordion: track which persons are expanded
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  // Modal state
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [editPerson, setEditPerson] = useState<{
    id: number
    name: string
    groupId: number | null
  } | null>(null)
  const [addOrderFor, setAddOrderFor] = useState<{ id: number; name: string } | null>(null)
  const [editOrder, setEditOrder] = useState<{
    order: OrderData
    personId: number
    personName: string
  } | null>(null)
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [editGroup, setEditGroup] = useState<{ id: number; name: string } | null>(null)

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allExpanded = persons.length > 0 && expanded.size === persons.length
  const toggleAll = () => {
    if (allExpanded) setExpanded(new Set())
    else setExpanded(new Set(persons.map((p) => p.id)))
  }

  const sectionTotal = persons.reduce(
    (s, p) => s + p.orders.reduce((ps, o) => ps + inclBtw(o.product.priceExclBtw) * o.quantity, 0),
    0,
  )
  const totalItems = persons.reduce(
    (s, p) => s + p.orders.reduce((ps, o) => ps + o.quantity, 0),
    0,
  )

  // Group persons by their group (only relevant if this section has groups)
  const ungroupedPersons = persons.filter((p) => p.groupId === null)
  const personsByGroup = groups.map((g) => ({
    group: g,
    persons: persons.filter((p) => p.groupId === g.id),
  }))

  function renderPersonCard(person: PersonData) {
    const isOpen = expanded.has(person.id)
    const personTotal = person.orders.reduce(
      (s, o) => s + inclBtw(o.product.priceExclBtw) * o.quantity,
      0,
    )
    const personItems = person.orders.reduce((s, o) => s + o.quantity, 0)

    return (
      <div
        key={person.id}
        className="bg-white rounded-md border border-ink-100 hover:border-gold-300 transition-colors overflow-hidden"
      >
        {/* Accordion header — always visible */}
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Expand toggle (takes most of the row) */}
          <button
            onClick={() => toggle(person.id)}
            className="flex-1 flex items-center gap-3 min-w-0 text-left"
            aria-expanded={isOpen}
          >
            <IconChevronDown open={isOpen} className="w-4 h-4 text-ink-300 shrink-0" />
            <div className="min-w-0">
              <span className="font-serif font-semibold text-ink-900">{person.name}</span>
              {!isOpen && personItems > 0 && (
                <p className="font-mono text-xs text-ink-400 mt-0.5 truncate">
                  {personItems} artikel{personItems !== 1 ? 'en' : ''} · {formatEuro(personTotal)}
                </p>
              )}
              {!isOpen && personItems === 0 && (
                <p className="font-mono text-xs text-ink-300 mt-0.5">Geen bestellingen</p>
              )}
            </div>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setAddOrderFor({ id: person.id, name: person.name })}
              className="p-2 rounded-sm text-ink-700 hover:bg-ink-50 transition-colors"
              aria-label="Bestelling toevoegen"
              title="Bestelling toevoegen"
            >
              <IconPlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditPerson({ id: person.id, name: person.name, groupId: person.groupId })}
              className="p-2 rounded-sm text-ink-300 hover:text-ink-700 hover:bg-ink-50 transition-colors"
              aria-label="Persoon bewerken"
              title="Bewerken"
            >
              <IconEdit className="w-4 h-4" />
            </button>
            {!person.locked && <DeleteButton kind="person" id={person.id} />}
          </div>
        </div>

        {/* Accordion body — only visible when expanded */}
        {isOpen && (
          <div className="border-t border-ink-100">
            {person.orders.length === 0 ? (
              <div className="px-4 py-4 text-center">
                <p className="text-sm text-ink-400">Nog geen bestellingen</p>
                <button
                  onClick={() => setAddOrderFor({ id: person.id, name: person.name })}
                  className="mt-2 text-ink-700 text-sm font-medium hover:underline underline-offset-2"
                >
                  + Bestelling toevoegen
                </button>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-ink-50">
                  {person.orders.map((order) => (
                    <li
                      key={order.id}
                      className="px-4 py-3 flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-ink-800">
                          <span className="font-medium">{order.product.name}</span>
                          <span className="font-mono text-ink-400"> · {order.size}</span>
                          {order.quantity > 1 && (
                            <span className="font-mono text-ink-400"> · {order.quantity}×</span>
                          )}
                        </p>
                        {order.note && (
                          <p className="text-xs text-ink-400 italic mt-0.5">"{order.note}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-sm font-semibold text-ink-900 tabular-nums">
                          {formatEuro(inclBtw(order.product.priceExclBtw) * order.quantity)}
                        </span>
                        <button
                          onClick={() =>
                            setEditOrder({
                              order,
                              personId: person.id,
                              personName: person.name,
                            })
                          }
                          className="p-1.5 rounded-sm text-ink-300 hover:text-ink-700 hover:bg-ink-50 transition-colors"
                          aria-label="Bewerken"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <DeleteButton kind="order" id={order.id} />
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Person subtotal */}
                <div className="px-4 py-3 flex items-center justify-between bg-paper-50 border-t border-ink-100">
                  <button
                    onClick={() => setAddOrderFor({ id: person.id, name: person.name })}
                    className="text-sm text-ink-700 font-medium hover:underline underline-offset-2 flex items-center gap-1"
                  >
                    <IconPlus className="w-4 h-4" />
                    Bestelling toevoegen
                  </button>
                  <span className="text-sm font-bold text-ink-800 tabular-nums">
                    {formatEuro(personTotal)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl lg:text-2xl font-semibold text-ink-900 leading-tight">
            {section.name}
          </h2>
          <p className="font-mono text-sm text-ink-500 mt-0.5">
            {persons.length} {persons.length === 1 ? 'persoon' : 'personen'}
            {totalItems > 0 && ` · ${totalItems} artikelen · ${formatEuro(sectionTotal)}`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" onClick={() => setShowAddGroup(true)}>
            <IconPlus className="w-4 h-4" />
            Groep
          </Button>
          <Button variant="primary" onClick={() => setShowAddPerson(true)}>
            <IconPlus className="w-4 h-4" />
            Persoon
          </Button>
        </div>
      </div>

      {/* Expand / collapse all toggle */}
      {persons.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={toggleAll}
            className="font-mono text-xs text-ink-600 font-medium hover:underline underline-offset-2"
          >
            {allExpanded ? 'Alles inklappen' : 'Alles uitklappen'}
          </button>
        </div>
      )}

      {/* People list */}
      {persons.length === 0 ? (
        <div className="bg-white rounded-md border border-ink-100">
          <EmptyState
            message="Nog niemand in deze sectie"
            action={{ label: 'Voeg de eerste persoon toe →', onClick: () => setShowAddPerson(true) }}
          />
        </div>
      ) : groups.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 lg:items-start">
          {persons.map(renderPersonCard)}
        </div>
      ) : (
        <div className="space-y-6 lg:space-y-8">
          {personsByGroup.map(({ group, persons: groupPersons }) => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-mono text-xs font-semibold text-ink-400 uppercase tracking-wider">
                  {group.name} · {groupPersons.length}
                </h3>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setEditGroup({ id: group.id, name: group.name })}
                    className="p-1.5 rounded-sm text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-colors"
                    aria-label="Groep bewerken"
                    title="Groep bewerken"
                  >
                    <IconEdit className="w-4 h-4" />
                  </button>
                  <DeleteButton kind="group" id={group.id} />
                </div>
              </div>
              {groupPersons.length === 0 ? (
                <p className="px-1 text-xs text-ink-300">Nog niemand in deze groep</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 lg:items-start">
                  {groupPersons.map(renderPersonCard)}
                </div>
              )}
            </div>
          ))}

          {ungroupedPersons.length > 0 && (
            <div className="space-y-3">
              <h3 className="px-1 font-mono text-xs font-semibold text-ink-400 uppercase tracking-wider">
                Overig · {ungroupedPersons.length}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 lg:items-start">
                {ungroupedPersons.map(renderPersonCard)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddPerson && (
        <PersonModal
          sectionId={section.id}
          groups={groups}
          onClose={() => setShowAddPerson(false)}
        />
      )}
      {editPerson && (
        <PersonModal
          sectionId={section.id}
          groups={groups}
          person={editPerson}
          onClose={() => setEditPerson(null)}
        />
      )}
      {showAddGroup && (
        <GroupModal sectionId={section.id} onClose={() => setShowAddGroup(false)} />
      )}
      {editGroup && (
        <GroupModal
          sectionId={section.id}
          group={editGroup}
          onClose={() => setEditGroup(null)}
        />
      )}
      {addOrderFor && (
        <OrderModal
          personId={addOrderFor.id}
          personName={addOrderFor.name}
          products={products}
          onClose={() => setAddOrderFor(null)}
        />
      )}
      {editOrder && (
        <OrderModal
          personId={editOrder.personId}
          personName={editOrder.personName}
          products={products}
          order={editOrder.order}
          onClose={() => setEditOrder(null)}
        />
      )}
    </div>
  )
}
