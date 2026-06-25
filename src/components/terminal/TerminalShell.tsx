import React from 'react'
import { TerminalHeader } from './TerminalHeader'
import { TerminalStatusBar } from './TerminalStatusBar'

interface TerminalShellProps {
  children: React.ReactNode
}

export function TerminalShell({ children }: TerminalShellProps) {
  return (
    <div className='flex flex-col min-h-svh bg-[#090909] text-[#E6EDF3] font-mono selection:bg-primary/20 selection:text-foreground terminal-scanlines'>
      {/* Top sticky terminal header */}
      <TerminalHeader />

      {/* Main console content */}
      <main className='flex-grow p-4 md:p-6 w-full max-w-7xl mx-auto'>
        {children}
      </main>

      {/* Bottom sticky status bar */}
      <TerminalStatusBar />
    </div>
  )
}
