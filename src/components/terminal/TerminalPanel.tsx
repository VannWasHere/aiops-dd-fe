import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface TerminalPanelProps {
  title: string
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultOpen?: boolean
  rightElement?: React.ReactNode
}

export function TerminalPanel({
  title,
  children,
  className,
  collapsible = false,
  defaultOpen = true,
  rightElement,
}: TerminalPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('border border-border bg-card text-foreground font-mono mb-4 text-xs', className)}>
      {/* Panel Header */}
      <div
        className={cn(
          'flex items-center justify-between border-b border-border bg-muted/30 px-3 py-1.5 select-none',
          collapsible && 'cursor-pointer hover:bg-muted/50'
        )}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className='flex items-center space-x-2'>
          <span className='text-[#7D8590]'>[</span>
          <span className='text-primary font-bold uppercase tracking-wider'>{title}</span>
          <span className='text-[#7D8590]'>]</span>
        </div>
        
        <div className='flex items-center space-x-3' onClick={(e) => e.stopPropagation()}>
          {rightElement && <div>{rightElement}</div>}
          {collapsible && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='text-muted-foreground hover:text-foreground focus:outline-none'
            >
              {isOpen ? (
                <ChevronUp className='h-3.5 w-3.5' />
              ) : (
                <ChevronDown className='h-3.5 w-3.5' />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      {isOpen && (
        <div className='p-3 leading-relaxed overflow-auto max-h-[500px]'>
          {children}
        </div>
      )}
    </div>
  )
}
