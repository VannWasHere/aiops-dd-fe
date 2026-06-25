import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServices, Service, ServiceCreate } from '@/hooks/use-services'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, Search, Server } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/services')({
  component: ServicesPage,
})

function ServicesPage() {
  const { services, isLoading, createService, updateService, deleteService } = useServices()
  const [searchTerm, setSearchTerm] = useState('')
  
  // Dialog Open States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  // Form State
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceCreate>({
    name: '',
    description: '',
    environment: 'production',
    owner: '',
    status: 'operational'
  })

  // Filter services by search term
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.environment.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      environment: 'production',
      owner: '',
      status: 'operational'
    })
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (service: Service) => {
    setSelectedService(service)
    setFormData({
      name: service.name,
      description: service.description ?? '',
      environment: service.environment,
      owner: service.owner,
      status: service.status
    })
    setIsEditOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createService(formData)
      setIsCreateOpen(false)
      toast.success('Service registered successfully!')
    } catch {
      toast.error('Failed to register service')
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService) return
    try {
      await updateService({ id: selectedService.id, data: formData })
      setIsEditOpen(false)
      toast.success('Service metadata updated successfully!')
    } catch {
      toast.error('Failed to update service')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service? All related investigations will be removed.')) {
      try {
        await deleteService(id)
        toast.success('Service deregistered successfully!')
      } catch {
        toast.error('Failed to delete service')
      }
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational': return 'text-[#00FF88] border-[#00FF88]/20 bg-[#00FF88]/5'
      case 'degraded': return 'text-[#FFB020] border-[#FFB020]/20 bg-[#FFB020]/5'
      case 'outage': return 'text-[#FF5555] border-[#FF5555]/20 bg-[#FF5555]/5'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className='space-y-6 font-mono text-xs text-foreground'>
      {/* Title block */}
      <div className='border-b border-border/60 pb-4 mb-4 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0'>
        <div>
          <div className='flex items-center space-x-2 text-primary font-bold mb-1 text-sm'>
            <Server className='h-4 w-4' />
            <span>SERVICE REPOSITORY INVENTORY</span>
          </div>
          <p className='text-muted-foreground text-[10px]'>
            Register, inspect telemetry status, and configure microservice profiles on the cluster.
          </p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className='px-3 py-1.5 border border-primary/55 bg-primary/10 text-primary hover:bg-primary/25 cursor-pointer font-bold uppercase flex items-center space-x-1.5 text-[10px] self-start md:self-auto'
        >
          <Plus className='h-3.5 w-3.5' />
          <span>REGISTER SERVICE</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className='flex items-center max-w-xs relative mb-6'>
        <Search className='absolute left-3 h-3.5 w-3.5 text-muted-foreground' />
        <Input 
          placeholder='Grep services, owners, env...' 
          className='pl-9 border-border/85 focus:border-primary placeholder-muted-foreground bg-[#111111]'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* High density listing */}
      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map(i => (
            <div key={i} className='h-24 animate-pulse bg-muted/20 border border-border/40' />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className='flex h-[250px] flex-col items-center justify-center border border-dashed border-border/60 p-8 text-center bg-[#111111]/10'>
          <Server className='h-10 w-10 text-muted-foreground mb-3' />
          <h3 className='font-bold text-primary uppercase tracking-wider'>No services reported</h3>
          <p className='text-[10px] text-muted-foreground mt-2 max-w-xs'>
            {searchTerm ? 'Try adjusting your search criteria.' : 'Create a monitored service registry profile to start.'}
          </p>
          {!searchTerm && (
            <button 
              onClick={handleOpenCreate}
              className='mt-4 px-3 py-1.5 border border-primary/55 bg-primary/10 text-primary hover:bg-primary/25 cursor-pointer font-bold uppercase text-[10px]'
            >
              Register Service
            </button>
          )}
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredServices.map(service => (
            <TerminalPanel
              key={service.id}
              title={`SERVICE: ${service.name.toUpperCase()}`}
              rightElement={
                <span className={`px-1.5 py-0.5 border text-[9px] font-bold ${getStatusBadgeClass(service.status)}`}>
                  {service.status.toUpperCase()}
                </span>
              }
            >
              <div className='space-y-2 text-[10px] text-foreground select-text'>
                <div>
                  <span className='text-muted-foreground font-semibold'>UUID :</span> {service.id}
                </div>
                <div>
                  <span className='text-muted-foreground font-semibold'>ENV  :</span>{' '}
                  <span className='border border-border bg-[#161616] px-1 py-0.5'>{service.environment.toUpperCase()}</span>
                </div>
                <div>
                  <span className='text-muted-foreground font-semibold'>OWNER:</span> {service.owner}
                </div>
                <div className='border-t border-border/30 pt-2 mt-2'>
                  <span className='text-muted-foreground font-semibold'>DESC :</span>{' '}
                  <p className='text-muted-foreground mt-1 select-text leading-relaxed'>
                    {service.description || 'No system description cataloged.'}
                  </p>
                </div>

                <div className='flex justify-between items-center border-t border-border/30 pt-3 mt-3 select-none'>
                  <button
                    onClick={() => handleOpenEdit(service)}
                    className='px-2.5 py-1 border border-border bg-[#161616] text-muted-foreground hover:text-foreground cursor-pointer hover:border-muted-foreground text-[9px]'
                  >
                    EDIT CONFIG
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className='px-2.5 py-1 border border-[#FF5555]/30 bg-[#FF5555]/5 text-[#FF5555] hover:bg-[#FF5555]/20 cursor-pointer text-[9px]'
                  >
                    DEREGISTER
                  </button>
                </div>
              </div>
            </TerminalPanel>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className='bg-[#111111] border border-border text-foreground font-mono text-xs p-5 rounded-none max-w-md'>
          <DialogHeader className='border-b border-border/60 pb-3 mb-4'>
            <DialogTitle className='text-primary font-bold uppercase tracking-wider text-sm'>Register Telemetry Service</DialogTitle>
            <DialogDescription className='text-muted-foreground text-[10px] mt-1'>
              Define a new microservice resource node for active RCA monitoring.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className='space-y-4 py-1'>
            <div className='grid gap-2'>
              <Label htmlFor='name' className='text-muted-foreground font-semibold'>Service Name</Label>
              <Input 
                id='name' 
                required 
                placeholder='checkout-api'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className='bg-[#161616] border-border focus:border-primary placeholder-muted-foreground'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='description' className='text-muted-foreground font-semibold'>Description</Label>
              <Textarea 
                id='description' 
                placeholder='Orchestrates credit card billing and verification steps.'
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className='bg-[#161616] border-border focus:border-primary placeholder-muted-foreground'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='owner' className='text-muted-foreground font-semibold'>Owner / SRE Team</Label>
              <Input 
                id='owner' 
                required 
                placeholder='FinTech Squad'
                value={formData.owner}
                onChange={e => setFormData({ ...formData, owner: e.target.value })}
                className='bg-[#161616] border-border focus:border-primary placeholder-muted-foreground'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='environment' className='text-muted-foreground font-semibold'>Environment</Label>
                <Select 
                  value={formData.environment}
                  onValueChange={val => setFormData({ ...formData, environment: val })}
                >
                  <SelectTrigger id='environment' className='bg-[#161616] border-border focus:border-primary'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-[#161616] border-border text-foreground font-mono text-xs rounded-none'>
                    <SelectItem value='production'>Production</SelectItem>
                    <SelectItem value='staging'>Staging</SelectItem>
                    <SelectItem value='development'>Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='status' className='text-muted-foreground font-semibold'>Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={val => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger id='status' className='bg-[#161616] border-border focus:border-primary'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-[#161616] border-border text-foreground font-mono text-xs rounded-none'>
                    <SelectItem value='operational'>Operational</SelectItem>
                    <SelectItem value='degraded'>Degraded</SelectItem>
                    <SelectItem value='outage'>Outage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className='pt-4 border-t border-border/30 mt-6'>
              <button 
                type='button' 
                onClick={() => setIsCreateOpen(false)}
                className='px-3 py-1.5 border border-border bg-[#161616] text-muted-foreground hover:text-foreground cursor-pointer text-[10px]'
              >
                CANCEL
              </button>
              <button 
                type='submit'
                className='px-3 py-1.5 border border-primary/55 bg-primary/10 text-primary hover:bg-primary/25 cursor-pointer font-bold uppercase text-[10px]'
              >
                REGISTER
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className='bg-[#111111] border border-border text-foreground font-mono text-xs p-5 rounded-none max-w-md'>
          <DialogHeader className='border-b border-border/60 pb-3 mb-4'>
            <DialogTitle className='text-primary font-bold uppercase tracking-wider text-sm'>Edit Service Configuration</DialogTitle>
            <DialogDescription className='text-muted-foreground text-[10px] mt-1'>
              Update operational parameters or modify telemetry state variables.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className='space-y-4 py-1'>
            <div className='grid gap-2'>
              <Label htmlFor='edit-name' className='text-muted-foreground font-semibold'>Service Name</Label>
              <Input 
                id='edit-name' 
                required 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className='bg-[#161616] border-border focus:border-primary'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-description' className='text-muted-foreground font-semibold'>Description</Label>
              <Textarea 
                id='edit-description' 
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className='bg-[#161616] border-border focus:border-primary'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-owner' className='text-muted-foreground font-semibold'>Owner / SRE Team</Label>
              <Input 
                id='edit-owner' 
                required 
                value={formData.owner}
                onChange={e => setFormData({ ...formData, owner: e.target.value })}
                className='bg-[#161616] border-border focus:border-primary'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='edit-environment' className='text-muted-foreground font-semibold'>Environment</Label>
                <Select 
                  value={formData.environment}
                  onValueChange={val => setFormData({ ...formData, environment: val })}
                >
                  <SelectTrigger id='edit-environment' className='bg-[#161616] border-border focus:border-primary'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-[#161616] border-border text-foreground font-mono text-xs rounded-none'>
                    <SelectItem value='production'>Production</SelectItem>
                    <SelectItem value='staging'>Staging</SelectItem>
                    <SelectItem value='development'>Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='edit-status' className='text-muted-foreground font-semibold'>Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={val => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger id='edit-status' className='bg-[#161616] border-border focus:border-primary'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-[#161616] border-border text-foreground font-mono text-xs rounded-none'>
                    <SelectItem value='operational'>Operational</SelectItem>
                    <SelectItem value='degraded'>Degraded</SelectItem>
                    <SelectItem value='outage'>Outage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className='pt-4 border-t border-border/30 mt-6'>
              <button 
                type='button' 
                onClick={() => setIsEditOpen(false)}
                className='px-3 py-1.5 border border-border bg-[#161616] text-muted-foreground hover:text-foreground cursor-pointer text-[10px]'
              >
                CANCEL
              </button>
              <button 
                type='submit'
                className='px-3 py-1.5 border border-primary/55 bg-primary/10 text-primary hover:bg-primary/25 cursor-pointer font-bold uppercase text-[10px]'
              >
                SAVE CHANGES
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
