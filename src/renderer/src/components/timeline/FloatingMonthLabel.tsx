import { useAppStore } from '../../store/useAppStore'

export function FloatingMonthLabel(): JSX.Element {
  const label = useAppStore(s => s.activeMonthLabel)

  if (!label) return <></>

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <span className="px-3 py-1 text-xs font-medium text-white/80 bg-black/40 backdrop-blur-md
                       rounded-full border border-white/10 shadow-sm transition-all duration-300">
        {label}
      </span>
    </div>
  )
}
