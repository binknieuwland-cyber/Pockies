'use client'

import { useEffect } from 'react'
import { IconClose } from './icons'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ title, onClose, children }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/60"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-md sm:rounded-md border-t-2 border-gold-500 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="font-serif text-lg font-semibold text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-300 hover:text-ink-600 p-1 -mr-1 rounded-sm"
            aria-label="Sluiten"
          >
            <IconClose className="w-6 h-6" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
