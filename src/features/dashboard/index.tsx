import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useServices } from '@/hooks/use-services'
import { useInvestigations } from '@/hooks/use-investigations'
import { TerminalInput } from '@/components/terminal/TerminalInput'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { TerminalChart } from '@/components/terminal/TerminalChart'
import { LogViewer } from '@/components/terminal/LogViewer'
import { TraceViewer } from '@/components/terminal/TraceViewer'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Terminal } from 'lucide-react'

export function Dashboard() {
  const navigate = useNavigate()
  const { services } = useServices()
  const { investigations, isLoading: loadingInvestigations } = useInvestigations()

  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const consoleEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll console output to bottom
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [consoleOutput])

  // CPU & Memory mock data for ASCII charts
  const [cpuData, setCpuData] = useState<number[]>([45, 52, 58, 62, 55, 48, 67, 85, 78, 83, 89, 92])
  const [memData, setMemData] = useState<number[]>([68, 68, 69, 70, 71, 70, 72, 74, 75, 74, 75, 76])

  // Periodic metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuData(prev => [...prev.slice(1), Math.floor(Math.random() * 40) + 50])
      setMemData(prev => [...prev.slice(1), Math.floor(Math.random() * 5) + 72])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Boot sequence simulation on mount
  useEffect(() => {
    const bootLines = [
      'SYSBOOT // Initializing AIOps Engine v2.1...',
      'SYSBOOT // Loading local telemetry modules...',
      'SYSBOOT // Establishing database connection pool: ACTIVE',
      'SYSBOOT // Ingesting telemetry metrics stream... SUCCESS',
      'SYSBOOT // AI Agents mapping system dependency tree... DONE',
      'READY // Safe SRE terminal session initialized.',
      'READY // Type /help to see all operational commands.'
    ]

    let currentLine = 0
    const timer = setInterval(() => {
      if (currentLine < bootLines.length) {
        setConsoleOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${bootLines[currentLine]}`])
        currentLine++
      } else {
        clearInterval(timer)
      }
    }, 400)

    return () => clearInterval(timer)
  }, [])

  // Command Interpreter
  const handleCommand = (cmd: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setConsoleOutput(prev => [...prev, `\n> ${cmd}`])

    const args = cmd.split(' ')
    const primaryCmd = args[0].toLowerCase()

    switch (primaryCmd) {
      case '/help':
        setConsoleOutput(prev => [
          ...prev,
          'AIOps Terminal Help Console:',
          '  /health       - Print full system telemetry states',
          '  /incidents     - List active incident RCAs',
          '  /logs         - Print log stream tail description',
          '  /metrics      - Report CPU/memory load vectors',
          '  /investigate  - Start a new root cause analysis',
          '  /deploy       - View active environment topologies',
          '  /clear        - Clear console buffer logs'
        ])
        break

      case '/clear':
        setConsoleOutput([])
        break

      case '/health':
        const degradedCount = services.filter(s => s.status !== 'operational').length
        setConsoleOutput(prev => [
          ...prev,
          `[${timestamp}] TELEMETRY HEALTH STATUS:`,
          `  Total services monitored: ${services.length}`,
          `  Degraded services: ${degradedCount}`,
          `  Status: ${degradedCount > 0 ? 'WARNING (Telemetry alerts triggered)' : 'HEALTHY (All systems green)'}`
        ])
        break

      case '/incidents':
        const active = investigations.filter(i => i.status !== 'resolved' && i.status !== 'closed')
        setConsoleOutput(prev => [
          ...prev,
          `[${timestamp}] ACTIVE INCIDENT RCAs (${active.length}):`,
          ...active.map(i => `  - INC-${i.id.slice(0,8)}: ${i.title} [Status: ${i.status}]`)
        ])
        break

      case '/logs':
        setConsoleOutput(prev => [
          ...prev,
          `[${timestamp}] Tail stream active. Live monitor displaying in log panel below.`
        ])
        break

      case '/metrics':
        setConsoleOutput(prev => [
          ...prev,
          `[${timestamp}] METRICS REPORT:`,
          `  Current CPU Load: ${cpuData[cpuData.length - 1]}%`,
          `  Current Memory Allocation: ${memData[memData.length - 1]}%`
        ])
        break

      case '/investigate':
        setConsoleOutput(prev => [...prev, `[${timestamp}] Redirecting to investigation console...`])
        setTimeout(() => navigate({ to: '/investigations/new' }), 800)
        break

      case '/deploy':
        setConsoleOutput(prev => [
          ...prev,
          `[${timestamp}] ENVIRONMENT REPOSITORIES:`,
          ...services.map(s => `  - ${s.name} [ENV: ${s.environment}] [OWNER: ${s.owner}]`)
        ])
        break

      default:
        // Natural language query -> redirect to AI Copilot Chat
        setConsoleOutput(prev => [
          ...prev,
          `[${timestamp}] Routing search query to AI Copilot reasoning engine...`
        ])
        setTimeout(() => {
          navigate({ 
            to: '/chat',
            // pass command as URL search param
            search: () => ({ q: cmd })
          })
        }, 1000)
        break
    }
  }

  // Slice last 5 investigations
  const recentInvestigations = investigations.slice(0, 5)

  return (
    <div className='space-y-6 font-mono text-xs text-foreground'>
      {/* Page Title Header */}
      <div className='border-b border-border/60 pb-4 mb-4'>
        <div className='flex items-center space-x-2 text-primary font-bold mb-1 text-sm'>
          <Terminal className='h-4 w-4' />
          <span>SRE INCIDENT OPERATIONS CENTER</span>
        </div>
        <p className='text-muted-foreground text-[10px]'>
          Active session: Console input acts as main driver. Type command or ask questions to route to AI Copilot.
        </p>
      </div>

      {/* Main Terminal Shell Grid */}
      <div className='grid gap-6 lg:grid-cols-12'>
        {/* Left Column: Command prompt and console log output */}
        <div className='lg:col-span-7 flex flex-col h-full'>
          <TerminalInput onCommand={handleCommand} />

          <TerminalPanel title='AI Diagnostic Console Output' className='flex-grow h-[350px] flex flex-col'>
            <div className='flex-grow overflow-y-auto font-mono text-[10px] text-[#00FF88] space-y-1.5 whitespace-pre-wrap select-text max-h-[320px]'>
              {consoleOutput.length === 0 ? (
                <span className='text-muted-foreground'>Console log buffer empty. Type commands above.</span>
              ) : (
                <>
                  {consoleOutput.map((line, idx) => (
                    <div key={idx} className={line.startsWith('>') ? 'text-primary font-bold' : ''}>
                      {line}
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </>
              )}
            </div>
          </TerminalPanel>
        </div>

        {/* Right Column: Telemetry Monitors */}
        <div className='lg:col-span-5 space-y-4'>
          {/* dependency diagram */}
          <TerminalPanel title='System Dependency Graph' collapsible>
            <TraceViewer />
          </TerminalPanel>

          {/* ASCII Metrics panel */}
          <TerminalPanel title='Telemetry metrics load' collapsible>
            <div className='grid grid-cols-2 gap-3'>
              <TerminalChart data={cpuData} height={5} label='CPU Utilization' />
              <TerminalChart data={memData} height={5} label='Memory Footprint' />
            </div>
          </TerminalPanel>
        </div>
      </div>

      {/* Bottom Row: Logs Monitor and Incident Registry */}
      <div className='grid gap-6 lg:grid-cols-12'>
        {/* Live log stream */}
        <div className='lg:col-span-7'>
          <TerminalPanel title='Telemetry Log Stream [Live tail]' collapsible>
            <LogViewer />
          </TerminalPanel>
        </div>

        {/* Active Incident Registry Table */}
        <div className='lg:col-span-5'>
          <TerminalPanel 
            title='Active incident registries' 
            collapsible
            rightElement={
              <Button asChild size='sm' className='h-5 text-[10px] border-primary/40' variant='outline'>
                <Link to='/investigations/new'>Trigger RCA</Link>
              </Button>
            }
          >
            {loadingInvestigations ? (
              <div className='space-y-2 py-4'>
                <div className='h-8 w-full animate-pulse bg-muted/20' />
                <div className='h-8 w-full animate-pulse bg-muted/20' />
              </div>
            ) : recentInvestigations.length === 0 ? (
              <div className='text-center py-6 text-muted-foreground'>
                No incidents on record. System healthy.
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader className='bg-muted/10 border-b border-border/40'>
                    <TableRow className='hover:bg-transparent border-none'>
                      <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase'>Incident ID</TableHead>
                      <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase'>Status</TableHead>
                      <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase text-right'>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvestigations.map((inv) => (
                      <TableRow key={inv.id} className='hover:bg-muted/10 border-b border-border/20 last:border-none'>
                        <TableCell className='py-2 font-medium max-w-[150px] truncate text-[10px]'>
                          {inv.title}
                        </TableCell>
                        <TableCell className='py-2'>
                          <span className={`px-1.5 py-0.5 border text-[9px] font-bold ${
                            inv.status === 'resolved' 
                              ? 'text-[#00FF88] border-[#00FF88]/20 bg-[#00FF88]/5' 
                              : 'text-[#FFB020] border-[#FFB020]/20 bg-[#FFB020]/5'
                          }`}>
                            {inv.status.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className='py-2 text-right'>
                          <Button asChild size='sm' variant='outline' className='h-5 text-[9px] border-border/60 hover:bg-primary/20 hover:text-primary'>
                            <Link to='/investigations/$id' params={{ id: inv.id }}>
                              <Eye className='h-3 w-3 mr-1' />
                              RCA
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TerminalPanel>
        </div>
      </div>
    </div>
  )
}
