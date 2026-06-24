import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useInvestigations } from '@/hooks/use-investigations'
import { useServices } from '@/hooks/use-services'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Activity, ArrowLeft, Play } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/investigations/new')({
  component: NewInvestigationPage,
})

function NewInvestigationPage() {
  const navigate = useNavigate()
  const { services, isLoading: loadingServices } = useServices()
  const { createInvestigation } = useInvestigations()

  // Form states
  const [title, setTitle] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [question, setQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceId) {
      toast.error('Please select a service')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createInvestigation({
        title,
        service_id: serviceId,
        question
      })
      toast.success('Investigation analysis triggered!')
      // Redirect to detailed RCA page
      navigate({ to: '/investigations/$id', params: { id: result.id } })
    } catch {
      toast.error('Failed to trigger investigation')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* ===== Header ===== */}
      <Header>
        <div className='flex items-center space-x-2'>
          <Activity className='h-6 w-6 text-primary' />
          <span className='text-xl font-bold tracking-tight'>Cable3 Ops / New Investigation</span>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main Content ===== */}
      <Main>
        <div className='mb-6'>
          <Button asChild variant='ghost' size='sm' className='mb-2'>
            <Link to='/investigations'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Investigations
            </Link>
          </Button>
          <h1 className='text-3xl font-bold tracking-tight'>Start Investigation</h1>
          <p className='text-muted-foreground'>
            Query telemetry profiles and generate an automated RCA timeline, recommendations, and evidence.
          </p>
        </div>

        <div className='max-w-2xl'>
          <Card>
            <CardHeader>
              <CardTitle>AI Incident Analysis request</CardTitle>
              <CardDescription>
                Define the incident symptoms. The Mock Investigator will extract corresponding traces and configure the details.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className='space-y-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='title'>Investigation Title</Label>
                  <Input 
                    id='title'
                    required
                    placeholder='e.g., Spike in Checkout Latency / Stripe Outage'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='service'>Monitored Service</Label>
                  {loadingServices ? (
                    <div className='h-10 w-full animate-pulse rounded bg-muted' />
                  ) : (
                    <Select value={serviceId} onValueChange={setServiceId}>
                      <SelectTrigger id='service'>
                        <SelectValue placeholder='Select a service...' />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} ({s.environment})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='question'>Investigation Question / Symptoms</Label>
                  <Textarea 
                    id='question'
                    required
                    rows={5}
                    placeholder='e.g., What is causing the payment-api timeouts? Or: Why did the checkout container crash with exit code 137?'
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                  />
                </div>
              </CardContent>

              <CardFooter className='border-t pt-4 flex justify-between bg-muted/10'>
                <Button asChild variant='outline' type='button'>
                  <Link to='/investigations'>Cancel</Link>
                </Button>
                <Button type='submit' disabled={isSubmitting || loadingServices}>
                  {isSubmitting ? (
                    'Generating RCA...'
                  ) : (
                    <>
                      <Play className='mr-2 h-4 w-4' />
                      Start Investigation
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </Main>
    </>
  )
}
