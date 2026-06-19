interface EmptyStateProps {
  icon?: string
  title: string
  description: string
}

export function EmptyState({ icon = '📂', title, description }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">{icon}</div>
        <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
        <p className="text-sm text-surface-200">{description}</p>
      </div>
    </div>
  )
}
