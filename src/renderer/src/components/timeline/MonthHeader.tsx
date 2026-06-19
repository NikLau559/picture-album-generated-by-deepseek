interface MonthHeaderProps {
  label: string
  count: number
}

export function MonthHeader({ label, count }: MonthHeaderProps): JSX.Element {
  return (
    <div className="sticky top-0 z-10 px-4 py-3 bg-surface-950/95 backdrop-blur-sm border-b border-surface-700/50">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-white">{label}</h2>
        <span className="text-xs text-surface-200 bg-surface-700 px-2 py-0.5 rounded-full">
          {count} items
        </span>
      </div>
    </div>
  )
}
