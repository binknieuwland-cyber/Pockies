import { IconLaurelSprig } from '@/components/icons'

/** Thin laurel-wreath rule, echoing the crest — used under major section headers */
export default function LaurelDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-gold-500 ${className}`}>
      <IconLaurelSprig className="w-10 h-3 scale-x-[-1] shrink-0" />
      <span className="w-1 h-1 rounded-full bg-gold-500 shrink-0" />
      <IconLaurelSprig className="w-10 h-3 shrink-0" />
    </div>
  )
}
