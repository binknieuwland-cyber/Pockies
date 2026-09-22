'use client'

import { useRef, useState } from 'react'
import { normalizePhoneDigits } from '@/lib/phone'

interface Props {
  id: string
  label?: React.ReactNode
  value: string
  onChange: (value: string) => void
  required?: boolean
}

function splitTail(value: string) {
  const digits = normalizePhoneDigits(value)
  const tail = digits.startsWith('06') ? digits.slice(2) : digits
  return { part2: tail.slice(0, 4), part3: tail.slice(4, 8) }
}

const boxClass =
  'w-20 rounded-sm border px-3 py-3 text-center font-mono text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent'

export default function PhoneInput({ id, label, value, onChange, required }: Props) {
  const initial = splitTail(value)
  const [part2, setPart2] = useState(initial.part2)
  const [part3, setPart3] = useState(initial.part3)
  const [blurred, setBlurred] = useState(false)
  const part2Ref = useRef<HTMLInputElement>(null)
  const part3Ref = useRef<HTMLInputElement>(null)

  const touched = part2.length > 0 || part3.length > 0
  const complete = part2.length === 4 && part3.length === 4
  const invalid = blurred && touched && !complete

  const emit = (p2: string, p3: string) => {
    onChange(p2 || p3 ? `06${p2}${p3}` : '')
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '')
    const tail = pasted.startsWith('06') ? pasted.slice(2) : pasted
    if (tail.length > 4) {
      e.preventDefault()
      const p2 = tail.slice(0, 4)
      const p3 = tail.slice(4, 8)
      setPart2(p2)
      setPart3(p3)
      emit(p2, p3)
      part3Ref.current?.focus()
    }
  }

  return (
    <div>
      {label && (
        <label htmlFor={`${id}-1`} className="block text-sm font-medium text-ink-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value="06"
          disabled
          readOnly
          tabIndex={-1}
          aria-hidden
          className={`${boxClass} w-14 bg-ink-50 text-ink-500 border-ink-200`}
        />
        <input
          id={`${id}-1`}
          ref={part2Ref}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={part2}
          required={required}
          placeholder="1234"
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
            setPart2(digits)
            emit(digits, part3)
            if (digits.length === 4) part3Ref.current?.focus()
          }}
          onPaste={handlePaste}
          onBlur={() => setBlurred(true)}
          className={`${boxClass} ${invalid ? 'border-red-300' : 'border-ink-200'}`}
        />
        <input
          id={`${id}-2`}
          ref={part3Ref}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={part3}
          required={required}
          placeholder="5678"
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
            setPart3(digits)
            emit(part2, digits)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && part3 === '') part2Ref.current?.focus()
          }}
          onBlur={() => setBlurred(true)}
          className={`${boxClass} ${invalid ? 'border-red-300' : 'border-ink-200'}`}
        />
      </div>
      {invalid && <p className="mt-1 text-xs text-red-600">Vul een volledig 06-nummer in (8 cijfers)</p>}
    </div>
  )
}
