import { useId } from 'react'

interface SparklineProps {
  data: number[]
  className?: string
  stroke?: string
  fillFrom?: string
  height?: number
}

const Sparkline = ({
  data,
  className = 'h-14 w-full',
  stroke = '#6366f1',
  fillFrom = 'rgba(99,102,241,0.28)',
  height = 56,
}: SparklineProps) => {
  const gradientId = useId().replace(/:/g, '')
  const width = 160
  const values = data.length > 1 ? data : [0, ...(data.length ? data : [0, 0])]
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const step = width / (values.length - 1)

  const points = values.map((value, index) => {
    const x = index * step
    const y = height - ((value - min) / range) * (height - 8) - 4
    return [x, y] as const
  })

  const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      role="img"
      aria-label="Activity trend"
    >
      <defs>
        <linearGradient id={`spark-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillFrom} />
          <stop offset="100%" stopColor="rgba(99,102,241,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${gradientId})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export default Sparkline
