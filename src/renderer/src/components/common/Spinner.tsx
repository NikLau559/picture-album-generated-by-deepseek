interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function Spinner({ size = 'md', color = 'blue' }: SpinnerProps): JSX.Element {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const colorMap: Record<string, string> = {
    blue: 'border-blue-400',
    purple: 'border-purple-400',
    amber: 'border-amber-400',
    white: 'border-white',
  }

  return (
    <div
      className={`${sizeMap[size]} border-2 ${colorMap[color] ?? colorMap.blue}
        border-t-transparent rounded-full animate-spin`}
    />
  )
}
