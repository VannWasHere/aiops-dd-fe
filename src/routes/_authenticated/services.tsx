import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServices, Service, ServiceCreate } from '@/hooks/use-services'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, Search, Edit2, Trash2, Server } from 'lucide-react'

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
      toast.success('Service created successfully!')
    } catch {
      toast.error('Failed to create service')
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService) return
    try {
      await updateService({ id: selectedService.id, data: formData })
      setIsEditOpen(false)
      toast.success('Service updated successfully!')
    } catch {
      toast.error('Failed to update service')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service? All related investigations will be removed.')) {
      try {
        await deleteService(id)
        toast.success('Service deleted successfully!')
      } catch {
        toast.error('Failed to delete service')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational': return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25'
      case 'degraded': return 'bg-amber-500/15 text-amber-500 border-amber-500/25'
      case 'outage': return 'bg-destructive/15 text-destructive border-destructive/25'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <>
      {/* ===== Header ===== */}
      <Header>
        <div className='flex items-center space-x-2'>
          <Server className='h-6 w-6 text-primary' />
          <span className='text-xl font-bold tracking-tight'>Cable3 Ops / Services</span>
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
            <h1 className='text-3xl font-bold tracking-tight'>Monitored Services</h1>
            <p className='text-muted-foreground'>
              Configure and track the status of applications in your system.
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className='mr-2 h-4 w-4' />
            Register Service
          </Button>
        </div>

        {/* Filters */}
        <div className='mb-6 flex items-center max-w-sm relative'>
          <Search className='absolute left-3 h-4 w-4 text-muted-foreground' />
          <Input 
            placeholder='Search services, owners, environment...' 
            className='pl-9'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Services List */}
        {isLoading ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3].map(i => (
              <div key={i} className='h-[200px] animate-pulse rounded bg-muted' />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className='flex h-[300px] flex-col items-center justify-center border border-dashed rounded-lg p-8 text-center'>
            <Server className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold'>No services found</h3>
            <p className='text-sm text-muted-foreground mt-2 max-w-md'>
              {searchTerm ? 'Try adjusting your search query.' : 'Register your first service to start incident investigations.'}
            </p>
            {!searchTerm && (
              <Button className='mt-4' onClick={handleOpenCreate}>
                Register Service
              </Button>
            )}
          </div>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredServices.map(service => (
              <Card key={service.id} className='flex flex-col justify-between'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='text-xl'>{service.name}</CardTitle>
                      <Badge variant='outline'>{service.environment}</Badge>
                    </div>
                    <Badge variant='outline' className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='flex-grow'>
                  <p className='text-sm text-muted-foreground line-clamp-3 mb-4'>
                    {service.description || 'No description provided.'}
                  </p>
                  <div className='text-xs text-muted-foreground space-y-1'>
                    <div><strong>Owner:</strong> {service.owner}</div>
                  </div>
                </CardContent>
                <CardFooter className='border-t pt-4 flex justify-between bg-muted/20'>
                  <Button variant='outline' size='sm' onClick={() => handleOpenEdit(service)}>
                    <Edit2 className='mr-2 h-3.5 w-3.5' />
                    Edit
                  </Button>
                  <Button variant='destructive' size='sm' onClick={() => handleDelete(service.id)}>
                    <Trash2 className='mr-2 h-3.5 w-3.5' />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Service</DialogTitle>
              <DialogDescription>Add a new microservice to Cable3 Ops incident tracking.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className='space-y-4 py-2'>
              <div className='grid gap-2'>
                <Label htmlFor='name'>Service Name</Label>
                <Input 
                  id='name' 
                  required 
                  placeholder='checkout-api'
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea 
                  id='description' 
                  placeholder='Handles checkouts and purchases.'
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='owner'>Owner / Team</Label>
                <Input 
                  id='owner' 
                  required 
                  placeholder='FinTech Squad'
                  value={formData.owner}
                  onChange={e => setFormData({ ...formData, owner: e.target.value })}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='environment'>Environment</Label>
                  <Select 
                    value={formData.environment}
                    onValueChange={val => setFormData({ ...formData, environment: val })}
                  >
                    <SelectTrigger id='environment'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='production'>Production</SelectItem>
                      <SelectItem value='staging'>Staging</SelectItem>
                      <SelectItem value='development'>Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='status'>Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={val => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger id='status'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='operational'>Operational</SelectItem>
                      <SelectItem value='degraded'>Degraded</SelectItem>
                      <SelectItem value='outage'>Outage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className='pt-4'>
                <Button type='button' variant='outline' onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type='submit'>Register</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>Modify service details or update its health status.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className='space-y-4 py-2'>
              <div className='grid gap-2'>
                <Label htmlFor='edit-name'>Service Name</Label>
                <Input 
                  id='edit-name' 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='edit-description'>Description</Label>
                <Textarea 
                  id='edit-description' 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='edit-owner'>Owner / Team</Label>
                <Input 
                  id='edit-owner' 
                  required 
                  value={formData.owner}
                  onChange={e => setFormData({ ...formData, owner: e.target.value })}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-environment'>Environment</Label>
                  <Select 
                    value={formData.environment}
                    onValueChange={val => setFormData({ ...formData, environment: val })}
                  >
                    <SelectTrigger id='edit-environment'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='production'>Production</SelectItem>
                      <SelectItem value='staging'>Staging</SelectItem>
                      <SelectItem value='development'>Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-status'>Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={val => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger id='edit-status'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='operational'>Operational</SelectItem>
                      <SelectItem value='degraded'>Degraded</SelectItem>
                      <SelectItem value='outage'>Outage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className='pt-4'>
                <Button type='button' variant='outline' onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type='submit'>Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
