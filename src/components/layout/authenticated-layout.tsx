import { Outlet } from '@tanstack/react-router'
import { TerminalShell } from '@/components/terminal/TerminalShell'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <TerminalShell>
      {children ?? <Outlet />}
    </TerminalShell>
  )
}
