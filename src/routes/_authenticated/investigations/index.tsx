import { createFileRoute, Link } from '@tanstack/react-router'
import { useInvestigations } from '@/hooks/use-investigations'
import { useServices } from '@/hooks/use-services'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
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

  // Helper to map service ID to service Name
  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    return service ? service.name : 'Unknown Service'
  }

  return (
    <>
      {/* ===== Header ===== */}
      <Header>
        <div className='flex items-center space-x-2'>
          <Activity className='h-6 w-6 text-primary' />
          <span className='text-xl font-bold tracking-tight'>Cable3 Ops / Investigations</span>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main Content ===== */}
      <Main>
        <div className='mb-6 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Investigations</h1>
            <p className='text-muted-foreground'>
              Analyze system faults, generate automatic RCA, and retrieve corrective actions.
            </p>
          </div>
          <Button asChild>
            <Link to='/investigations/new'>
              <Plus className='mr-2 h-4 w-4' />
              New Investigation
            </Link>
          </Button>
        </div>

        {/* Investigations List */}
        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map(i => (
              <div key={i} className='h-20 animate-pulse rounded bg-muted' />
            ))}
          </div>
        ) : investigations.length === 0 ? (
          <div className='flex h-[350px] flex-col items-center justify-center border border-dashed rounded-lg p-8 text-center'>
            <Activity className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold'>No investigations yet</h3>
            <p className='text-sm text-muted-foreground mt-2 max-w-md'>
              Initiate an incident investigation by describing a symptom or picking a service experiencing degradation.
            </p>
            <Button asChild className='mt-4'>
              <Link to='/investigations/new'>
                Start Investigation
              </Link>
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle>RCA Investigations Registry</CardTitle>
              <CardDescription>
                Track ongoing analyses and click View to view detailed charts, evidence, and recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident Title</TableHead>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investigations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className='font-medium max-w-xs truncate'>
                        {inv.title}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-1.5'>
                          <HardDrive className='h-3.5 w-3.5 text-muted-foreground' />
                          <span>{getServiceName(inv.service_id)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={inv.status === 'resolved' ? 'default' : 'secondary'}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-1.5 text-xs text-muted-foreground'>
                          <Calendar className='h-3.5 w-3.5' />
                          <span>{new Date(inv.created_at).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className='text-right space-x-2'>
                        <Button asChild size='sm' variant='outline'>
                          <Link to='/investigations/$id' params={{ id: inv.id }}>
                            <Eye className='mr-2 h-3.5 w-3.5' />
                            View RCA
                          </Link>
                        </Button>
                        <Button 
                          size='sm' 
                          variant='ghost' 
                          className='text-destructive hover:bg-destructive/10'
                          onClick={(e) => handleDelete(inv.id, e)}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
