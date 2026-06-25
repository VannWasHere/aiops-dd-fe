import { cn } from '@/lib/utils'

interface TerminalChartProps {
  data: number[]
  height?: number
  className?: string
  label?: string
  showLabels?: boolean
}

export function TerminalChart({
  data,
  height = 6,
  className,
  label,
  showLabels = true
}: TerminalChartProps) {
  const max = Math.max(...data, 100)
  
  // Render ASCII rows
  const rows: string[] = []
  
  for (let r = height - 1; r >= 0; r--) {
    const threshold = (r / height) * max
    const labelVal = Math.round((r / (height - 1)) * max)
    
    let rowText = ''
    if (showLabels) {
      rowText += `${String(labelVal).padStart(3, ' ')}% ┤ `
    }
    
    for (let c = 0; c < data.length; c++) {
      const val = data[c]
      if (val >= threshold && val > 0) {
        // Use full block for higher parts, half block for intermediate
        const diff = val - threshold
        const stepSize = max / height
        if (diff < stepSize * 0.5) {
          rowText += '▄ '
        } else {
          rowText += '█ '
        }
      } else {
        rowText += '  '
      }
    }
    rows.push(rowText)
  }
  
  // Render bottom axis
  let axisRow = ''
  if (showLabels) {
    axisRow += '     └─' + '─'.repeat(data.length * 2)
  } else {
    axisRow += '└─' + '─'.repeat(data.length * 2)
  }

  return (
    <div className={cn('font-mono text-[10px] text-foreground bg-[#111111] p-3 border border-border/40 select-none leading-tight', className)}>
      {label && <div className='text-primary font-bold mb-2 uppercase tracking-wider'>{label}</div>}
      <div className='whitespace-pre overflow-x-auto no-scrollbar'>
        {rows.map((row, idx) => (
          <div key={idx} className='text-foreground'>{row}</div>
        ))}
        <div className='text-muted-foreground'>{axisRow}</div>
      </div>
    </div>
  )
}
