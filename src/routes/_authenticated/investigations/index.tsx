import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useInvestigations } from '@/hooks/use-investigations'
import { useServices } from '@/hooks/use-services'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Activity, Plus, Eye, Trash2, Calendar, HardDrive, Radar, AlertTriangle } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/investigations/')({
  component: InvestigationsPage,
})

function InvestigationsPage() {
  const { investigations, isLoading, deleteInvestigation } = useInvestigations()
  const { services } = useServices()
  const queryClient = useQueryClient()
  const [detectedErrors, setDetectedErrors] = useState<any[]>([])

  const autoDetect = useMutation({
    mutationFn: async () => {
      const resp = await api.post('/investigations/auto-detect')
      return resp.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['investigations'] })
      setDetectedErrors(data.errors || [])
      if (data.investigations_created.length > 0) {
        toast.success(`Created ${data.investigations_created.length} investigation(s) from ${data.errors_found} error traces`)
      } else {
        toast.info(`Found ${data.errors_found} error traces but no new investigations generated`)
      }
    },
    onError: () => toast.error('Auto-detection failed. Check MCP/Bedrock config.')
  })

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (confirm('Delete this investigation?')) {
      try {
        await deleteInvestigation(id)
        toast.success('Investigation deleted')
      } catch { toast.error('Failed to delete') }
    }
  }

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Unknown'
  }

  return (
    <div className='space-y-6 font-mono text-xs text-foreground'>
      {/* Header */}
      <div className='border-b border-border/60 pb-4 mb-4 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0'>
        <div>
          <div className='flex items-center space-x-2 text-primary font-bold mb-1 text-sm'>
            <Activity className='h-4 w-4' />
            <span>ROOT CAUSE ANALYSIS REGISTRY</span>
          </div>
          <p className='text-muted-foreground text-[10px]'>
            Auto-detect errors from Datadog traces, generate AI-powered investigations with remediation scripts.
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => autoDetect.mutate()}
            disabled={autoDetect.isPending}
            className='px-3 py-1.5 border border-[#FFB020]/55 bg-[#FFB020]/10 text-[#FFB020] hover:bg-[#FFB020]/25 cursor-pointer font-bold uppercase flex items-center space-x-1.5 text-[10px] disabled:opacity-40'
          >
            <Radar className={`h-3.5 w-3.5 ${autoDetect.isPending ? 'animate-spin' : ''}`} />
            <span>{autoDetect.isPending ? 'SCANNING...' : 'AUTO-DETECT ERRORS'}</span>
          </button>
          <Button asChild className='h-8 text-[10px] bg-primary/10 border border-primary/55 text-primary hover:bg-primary/25 rounded-none font-bold uppercase'>
            <Link to='/investigations/new'>
              <Plus className='mr-1.5 h-3.5 w-3.5' />
              MANUAL
            </Link>
          </Button>
        </div>
      </div>

      {/* Detected Errors Preview */}
      {detectedErrors.length > 0 && (
        <TerminalPanel title={`DETECTED ERRORS (${detectedErrors.length})`} collapsible>
          <div className='max-h-[150px] overflow-y-auto space-y-px'>
            {detectedErrors.slice(0, 10).map((err: any, i: number) => (
              <div key={i} className='flex items-center gap-3 px-2 py-1 border-l-2 border-l-red-400 hover:bg-muted/20'>
                <AlertTriangle className='h-3 w-3 text-red-400 shrink-0' />
                <span className='text-primary w-[80px] shrink-0 truncate'>{err.service}</span>
                <span className='flex-1 truncate text-muted-foreground'>{err.operation} — {err.error_message || err.resource}</span>
                <span className='text-muted-foreground w-[60px] text-right shrink-0 truncate'>{err.trace_id?.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        </TerminalPanel>
      )}

      {/* Investigations List */}
      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map(i => (
            <div key={i} className='h-16 animate-pulse bg-muted/20 border border-border/40' />
          ))}
        </div>
      ) : investigations.length === 0 ? (
        <div className='flex h-[300px] flex-col items-center justify-center border border-dashed border-border/60 p-8 text-center bg-[#111111]/10'>
          <Activity className='h-10 w-10 text-muted-foreground mb-3 animate-pulse' />
          <h3 className='font-bold text-primary uppercase tracking-wider'>RCA Registry Empty</h3>
          <p className='text-[10px] text-muted-foreground mt-2 max-w-xs'>
            Click "Auto-Detect Errors" to scan Datadog for error traces and auto-generate AI investigations with fix scripts.
          </p>
        </div>
      ) : (
        <TerminalPanel title='Incident Investigations Registry'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className='bg-muted/10 border-b border-border/40 select-none'>
                <TableRow className='hover:bg-transparent border-none'>
                  <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase'>Title</TableHead>
                  <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase'>Service</TableHead>
                  <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase'>Status</TableHead>
                  <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase'>Created</TableHead>
                  <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investigations.map((inv) => (
                  <TableRow key={inv.id} className='hover:bg-muted/10 border-b border-border/20 last:border-none'>
                    <TableCell className='py-2.5 font-semibold max-w-xs truncate text-[10px] text-foreground select-text'>
                      {inv.title}
                    </TableCell>
                    <TableCell className='py-2.5 select-text'>
                      <div className='flex items-center space-x-1.5'>
                        <HardDrive className='h-3.5 w-3.5 text-muted-foreground' />
                        <span className='uppercase'>{getServiceName(inv.service_id)}</span>
                      </div>
                    </TableCell>
                    <TableCell className='py-2.5'>
                      <span className={`px-1.5 py-0.5 border text-[9px] font-bold ${
                        inv.status === 'resolved' ? 'text-[#00FF88] border-[#00FF88]/20 bg-[#00FF88]/5' : 'text-[#FFB020] border-[#FFB020]/20 bg-[#FFB020]/5'
                      }`}>{inv.status.toUpperCase()}</span>
                    </TableCell>
                    <TableCell className='py-2.5 text-muted-foreground text-[10px]'>
                      <div className='flex items-center space-x-1.5'>
                        <Calendar className='h-3.5 w-3.5' />
                        <span>{new Date(inv.created_at).toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className='py-2.5 text-right space-x-2 select-none'>
                      <Button asChild size='sm' variant='outline' className='h-5 text-[9px] border-border/60 hover:bg-primary/20 hover:text-primary rounded-none'>
                        <Link to='/investigations/$id' params={{ id: inv.id }}>
                          <Eye className='mr-1 h-3 w-3' />VIEW RCA
                        </Link>
                      </Button>
                      <button className='p-1 border border-transparent hover:border-[#FF5555]/20 hover:bg-[#FF5555]/5 text-[#FF5555] cursor-pointer align-middle'
                        onClick={(e) => handleDelete(inv.id, e)}>
                        <Trash2 className='h-3.5 w-3.5' />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TerminalPanel>
      )}
    </div>
  )
}
