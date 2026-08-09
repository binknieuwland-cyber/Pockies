interface Props {
  message: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ message, action }: Props) {
  return (
    <div className="text-center py-10 px-4">
      <p className="text-ink-500 text-sm font-medium">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 text-ink-700 text-sm font-medium hover:underline underline-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
