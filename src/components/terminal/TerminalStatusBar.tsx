import { useServices } from '@/hooks/use-services'
import { useInvestigations } from '@/hooks/use-investigations'
import { Cpu, Wifi, Activity } from 'lucide-react'

export function TerminalStatusBar() {
  const { services } = useServices()
  const { investigations } = useInvestigations()

  const totalIncidents = services.filter(s => s.status !== 'operational').length
  const activeRCAs = investigations.filter(i => i.status !== 'resolved' && i.status !== 'closed').length

  return (
    <footer className='border-t border-border bg-[#090909] text-muted-foreground font-mono text-[10px] select-none py-1.5 px-4 flex items-center justify-between sticky bottom-0 z-40 w-full'>
      <div className='flex items-center space-x-4'>
        <div className='flex items-center space-x-1.5'>
          <Cpu className='h-3 w-3 text-primary' />
          <span>MODEL:</span>
          <span className='text-foreground font-semibold'>CLAUDE-3.5-SONNET</span>
        </div>

        <div className='hidden sm:flex items-center space-x-1.5'>
          <span className='text-[#00FF88]'>●</span>
          <span>AGENT:</span>
          <span className='text-foreground font-semibold'>ACTIVE</span>
        </div>

        <div className='hidden md:flex items-center space-x-1.5'>
          <Activity className='h-3 w-3 text-primary' />
          <span>RTT:</span>
          <span className='text-foreground font-semibold'>84ms</span>
        </div>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='flex items-center space-x-1.5'>
          <span>DEGRADED:</span>
          <span className={`font-bold ${totalIncidents > 0 ? 'text-[#FF5555]' : 'text-[#00FF88]'}`}>
            {totalIncidents}
          </span>
        </div>

        <div className='flex items-center space-x-1.5'>
          <span>ACTIVE RCA:</span>
          <span className={`font-bold ${activeRCAs > 0 ? 'text-[#FFB020]' : 'text-foreground'}`}>
            {activeRCAs}
          </span>
        </div>

        <div className='hidden sm:flex items-center space-x-1.5'>
          <Wifi className='h-3 w-3 text-[#00FF88]' />
          <span>MONITORING: CONNECTED</span>
        </div>
      </div>
    </footer>
  )
}
