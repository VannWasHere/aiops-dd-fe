import { Link, useLocation } from '@tanstack/react-router'
import { Shield, Terminal } from 'lucide-react'
import { useServices } from '@/hooks/use-services'
import { useTheme } from '@/context/theme-provider'
import { Sun, Moon } from 'lucide-react'

export function TerminalHeader() {
  const { services } = useServices()
  const { theme, setTheme } = useTheme()
  const location = useLocation()

  // Dynamic system health evaluation
  const hasOutage = services.some(s => s.status.toLowerCase() === 'outage')
  const hasDegraded = services.some(s => s.status.toLowerCase() === 'degraded')
  
  let healthText = 'HEALTHY'
  let healthColor = 'text-[#00FF88] border-[#00FF88]/30 bg-[#00FF88]/5'
  
  if (hasOutage) {
    healthText = 'CRITICAL OUTAGE'
    healthColor = 'text-[#FF5555] border-[#FF5555]/30 bg-[#FF5555]/5'
  } else if (hasDegraded) {
    healthText = 'DEGRADED METRICS'
    healthColor = 'text-[#FFB020] border-[#FFB020]/30 bg-[#FFB020]/5'
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const navLinks = [
    { label: '01. Overview', path: '/' },
    { label: '02. Services', path: '/services' },
    { label: '03. Investigations', path: '/investigations' },
    { label: '04. AI Copilot', path: '/chat' },
    { label: '05. Configuration', path: '/settings' },
  ]

  return (
    <header className='border-b border-border bg-[#090909] text-foreground font-mono text-xs select-none sticky top-0 z-40 w-full'>
      {/* Top Banner Row */}
      <div className='flex flex-wrap items-center justify-between px-4 py-2 border-b border-border/60 gap-y-2'>
        {/* Left Info: App ID */}
        <div className='flex items-center space-x-3'>
          <Terminal className='h-4 w-4 text-primary animate-pulse' />
          <span className='font-bold tracking-wider text-primary'>AIOPS COMMAND CENTER v2.1</span>
          <span className='text-[#7D8590]'>|</span>
          <div className='flex items-center space-x-1.5 text-[10px] text-muted-foreground'>
            <Shield className='h-3 w-3 text-primary/70' />
            <span>CONSOLE: ACTIVE</span>
          </div>
        </div>

        {/* Middle Info: Telemetries Status */}
        <div className='hidden md:flex items-center space-x-4 text-[10px]'>
          <div className='flex items-center space-x-1'>
            <span className='text-[#00FF88] text-[14px] leading-none'>●</span>
            <span className='text-muted-foreground'>MONITORING</span>
          </div>
          <div className='flex items-center space-x-1'>
            <span className='text-[#00FF88] text-[14px] leading-none'>●</span>
            <span className='text-muted-foreground'>LOGS</span>
          </div>
          <div className='flex items-center space-x-1'>
            <span className='text-[#00FF88] text-[14px] leading-none'>●</span>
            <span className='text-muted-foreground'>METRICS</span>
          </div>
          <div className='flex items-center space-x-1'>
            <span className='text-[#58A6FF] text-[14px] leading-none'>●</span>
            <span className='text-muted-foreground'>CLOUD</span>
          </div>
        </div>

        {/* Right Info: Environment, Health and Theme Toggle */}
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <span className='text-muted-foreground text-[10px]'>ENV:</span>
            <span className='border border-primary/20 bg-primary/5 text-primary px-1.5 py-0.5 font-semibold text-[10px]'>
              PRODUCTION
            </span>
          </div>

          <div className='flex items-center space-x-2'>
            <span className='text-muted-foreground text-[10px]'>SYSTEM:</span>
            <span className={`border px-1.5 py-0.5 font-bold text-[10px] ${healthColor}`}>
              {healthText}
            </span>
          </div>

          <button 
            onClick={toggleTheme}
            className='p-1 border border-border bg-muted/20 text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
            title='Toggle Console Aesthetics'
          >
            {theme === 'dark' ? <Sun className='h-3 w-3' /> : <Moon className='h-3 w-3' />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Row */}
      <div className='flex items-center justify-between px-2 py-1 bg-[#111111]/90'>
        <div className='flex flex-wrap items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5'>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || 
              (link.path !== '/' && location.pathname.startsWith(link.path))
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1 font-mono text-xs transition-colors flex items-center space-x-1 ${
                  isActive
                    ? 'text-primary font-bold bg-[#161616] border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                }`}
              >
                <span>{isActive ? '●' : ' '}</span>
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>

        <div className='hidden sm:flex items-center space-x-2 text-[10px] text-muted-foreground pr-3'>
          <span>SESSION: SECURE</span>
          <span className='h-2 w-2 rounded-full bg-[#00FF88] animate-ping' />
        </div>
      </div>
    </header>
  )
}
