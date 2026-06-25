import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface LogEntry {
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR'
  service: string
  message: string
}

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL')
  const [search, setSearch] = useState('')
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Fetch real logs from backend SRE diagnostics endpoint (polls every 5s)
  const { data: mcpLogs } = useQuery<LogEntry[]>({
    queryKey: ['mcp_logs'],
    queryFn: async () => {
      const response = await api.get('/test/logs')
      return response.data
    },
    refetchInterval: 5000,
  })

  // Sync with fetched logs
  useEffect(() => {
    if (mcpLogs) {
      setLogs(mcpLogs)
    }
  }, [mcpLogs])

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const filteredLogs = logs.filter(log => {
    const matchesSeverity = filter === 'ALL' || log.level === filter
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                          log.service.toLowerCase().includes(search.toLowerCase())
    return matchesSeverity && matchesSearch
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'text-[#58A6FF]'
      case 'WARN': return 'text-[#FFB020]'
      case 'ERROR': return 'text-[#FF5555]'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className='font-mono text-[10px] bg-[#090909] text-foreground flex flex-col h-60 border border-border/40'>
      {/* Control bar */}
      <div className='flex items-center justify-between border-b border-border/40 bg-[#111111] px-3 py-1.5 gap-2 flex-wrap'>
        <div className='flex items-center space-x-1.5'>
          {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-1.5 py-0.5 border cursor-pointer ${
                filter === sev
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
        
        <input
          type='text'
          placeholder='grep search...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='bg-[#161616] text-foreground outline-none border border-border/60 px-2 py-0.5 w-32 focus:border-primary placeholder-muted-foreground'
        />
      </div>

      {/* Logs printout */}
      <div className='flex-grow overflow-y-auto p-3 space-y-1 select-text selection:bg-primary/30'>
        {filteredLogs.length === 0 ? (
          <div className='text-muted-foreground text-center pt-8'>
            [EOF] No matching log entries found.
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} className='flex items-start space-x-1.5 leading-normal'>
              <span className='text-muted-foreground flex-shrink-0'>[{log.timestamp}]</span>
              <span className={`font-bold flex-shrink-0 w-10 ${getLevelColor(log.level)}`}>
                {log.level.padEnd(5, ' ')}
              </span>
              <span className='text-[#7D8590] flex-shrink-0'>[{log.service}]</span>
              <span className='text-[#E6EDF3] break-all'>{log.message}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}
