import { createFileRoute, Link } from '@tanstack/react-router'
import { useInvestigations } from '@/hooks/use-investigations'
import { useServices } from '@/hooks/use-services'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Activity, Plus, Eye, Trash2, Calendar, HardDrive } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/investigations/')({
  component: InvestigationsPage,
})

function InvestigationsPage() {
  const { investigations, isLoading, deleteInvestigation } = useInvestigations()
  const { services } = useServices()

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (confirm('Are you sure you want to delete this investigation?')) {
      try {
        await deleteInvestigation(id)
        toast.success('Investigation deleted successfully!')
      } catch {
        toast.error('Failed to delete investigation')
      }
    }
  }

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    return service ? service.name : 'Unknown Service'
  }

  return (
    <div className='space-y-6 font-mono text-xs text-foreground'>
      {/* Header Block */}
      <div className='border-b border-border/60 pb-4 mb-4 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0'>
        <div>
          <div className='flex items-center space-x-2 text-primary font-bold mb-1 text-sm'>
            <Activity className='h-4 w-4' />
            <span>ROOT CAUSE ANALYSIS REGISTRY</span>
          </div>
          <p className='text-muted-foreground text-[10px]'>
            Examine current telemetry incident investigations, retrieve diagnostic logs, and view recovery scripts.
          </p>
        </div>
        <Button asChild className='h-8 text-[10px] bg-primary/10 border border-primary/55 text-primary hover:bg-primary/25 rounded-none font-bold uppercase'>
          <Link to='/investigations/new'>
            <Plus className='mr-1.5 h-3.5 w-3.5' />
            START INVESTIGATION
          </Link>
        </Button>
      </div>

      {/* Investigations Registry Panel */}
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
            Initiate a diagnostic analysis by providing incident descriptions or specifying an active service degradation.
          </p>
          <Button asChild className='mt-4 h-8 text-[10px] bg-primary/10 border border-primary/55 text-primary hover:bg-primary/25 rounded-none font-bold uppercase'>
            <Link to='/investigations/new'>
              Trigger Investigation
            </Link>
          </Button>
        </div>
      ) : (
        <TerminalPanel title='Incident Investigations Registry'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className='bg-muted/10 border-b border-border/40 select-none'>
                <TableRow className='hover:bg-transparent border-none'>
                  <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase'>Title / Symptom</TableHead>
                  <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase'>Service Node</TableHead>
                  <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase'>Status</TableHead>
                  <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase'>Created At</TableHead>
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
                        inv.status === 'resolved' 
                          ? 'text-[#00FF88] border-[#00FF88]/20 bg-[#00FF88]/5' 
                          : 'text-[#FFB020] border-[#FFB020]/20 bg-[#FFB020]/5'
                      }`}>
                        {inv.status.toUpperCase()}
                      </span>
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
                          <Eye className='mr-1 h-3 w-3' />
                          VIEW RCA
                        </Link>
                      </Button>
                      <button 
                        className='p-1 border border-transparent hover:border-[#FF5555]/20 hover:bg-[#FF5555]/5 text-[#FF5555] cursor-pointer align-middle'
                        onClick={(e) => handleDelete(inv.id, e)}
                        title='Delete RCA record'
                      >
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
