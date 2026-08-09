interface Props {
  message: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ message, action }: Props) {
  return (
    <div className="text-center py-10 px-4">
      <p className="text-gray-500 text-sm font-medium">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 text-brand-600 text-sm font-medium hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
