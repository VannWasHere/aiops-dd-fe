import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useInvestigations } from '@/hooks/use-investigations'
import { useServices } from '@/hooks/use-services'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
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
  const [diagnosticBootLog, setDiagnosticBootLog] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceId) {
      toast.error('Please select a service')
      return
    }

    setIsSubmitting(true)
    
    // Simulate diagnostic telemetry correlation boot logs prior to actual trigger
    const steps = [
      'BOOT_DIAG » Parsing incident symptom profile...',
      'BOOT_DIAG » Ingesting CloudWatch trace history...',
      'BOOT_DIAG » Fetching active Datadog metric frames...',
      'BOOT_DIAG » Calling AWS Bedrock reasoning model...',
      'SUCCESS   » Diagnostic package compiled. Redirecting...'
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setDiagnosticBootLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[i]}`])
    }

    try {
      const result = await createInvestigation({
        title,
        service_id: serviceId,
        question
      })
      toast.success('Incident analysis completed!')
      navigate({ to: '/investigations/$id', params: { id: result.id } })
    } catch {
      toast.error('Failed to trigger investigation')
      setDiagnosticBootLog([])
      setIsSubmitting(false)
    }
  }

  return (
    <div className='space-y-6 font-mono text-xs text-foreground'>
      {/* Navigation block */}
      <div className='border-b border-border/60 pb-4 mb-4'>
        <Button asChild variant='ghost' size='sm' className='mb-2 h-7 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer rounded-none pl-0'>
          <Link to='/investigations'>
            <ArrowLeft className='mr-1.5 h-3.5 w-3.5' />
            BACK TO REGISTRY
          </Link>
        </Button>
        <div className='flex items-center space-x-2 text-primary font-bold mb-1 text-sm'>
          <Activity className='h-4 w-4' />
          <span>TRIGGER ROOT CAUSE DIAGNOSIS</span>
        </div>
        <p className='text-muted-foreground text-[10px]'>
          Input symptoms, configure target service node, and let the AI reason across log indices.
        </p>
      </div>

      <div className='max-w-2xl'>
        <TerminalPanel title='AI Incident Analysis Console Profile'>
          <form onSubmit={handleSubmit} className='space-y-5 py-2 select-none'>
            <div className='grid gap-2'>
              <Label htmlFor='title' className='text-muted-foreground font-semibold'>Investigation Title</Label>
              <Input 
                id='title'
                required
                placeholder='e.g., Spike in checkout latency / Redis connection timeout'
                value={title}
                onChange={e => setTitle(e.target.value)}
                className='bg-[#161616] border-border focus:border-primary placeholder-muted-foreground'
                disabled={isSubmitting}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='service' className='text-muted-foreground font-semibold'>Monitored Target Node</Label>
              {loadingServices ? (
                <div className='h-10 w-full animate-pulse bg-muted/20 border border-border/40' />
              ) : (
                <Select value={serviceId} onValueChange={setServiceId} disabled={isSubmitting}>
                  <SelectTrigger id='service' className='bg-[#161616] border-border focus:border-primary'>
                    <SelectValue placeholder='Select a service node...' />
                  </SelectTrigger>
                  <SelectContent className='bg-[#161616] border-border text-foreground font-mono text-xs rounded-none'>
                    {services.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name.toUpperCase()} ({s.environment.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='question' className='text-muted-foreground font-semibold'>Incident Symptoms / Query</Label>
              <Textarea 
                id='question'
                required
                rows={5}
                placeholder='e.g., What caused the payment-api container crash? Or: Analyze why checkout-api requests are spikes above 5000ms.'
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className='bg-[#161616] border-border focus:border-primary placeholder-muted-foreground'
                disabled={isSubmitting}
              />
            </div>

            {/* Diagnostic Boot Logs display if submitting */}
            {isSubmitting && diagnosticBootLog.length > 0 && (
              <div className='border border-border/60 bg-[#090909] p-3 space-y-1 text-[#00FF88] text-[10px] select-text'>
                {diagnosticBootLog.map((line, idx) => (
                  <div key={idx} className='leading-normal'>{line}</div>
                ))}
              </div>
            )}

            <div className='flex justify-between items-center border-t border-border/30 pt-4 mt-6'>
              <Button asChild variant='outline' type='button' className='h-8 text-[10px] border-border/80 bg-[#161616] hover:bg-muted/10 rounded-none'>
                <Link to='/investigations'>CANCEL</Link>
              </Button>
              
              <button 
                type='submit' 
                disabled={isSubmitting || loadingServices}
                className='px-3 py-1.5 border border-primary/55 bg-primary/10 text-primary hover:bg-primary/25 cursor-pointer font-bold uppercase text-[10px] flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed'
              >
                {isSubmitting ? (
                  <span>RUNNING RCAS...</span>
                ) : (
                  <>
                    <Play className='h-3.5 w-3.5' />
                    <span>LAUNCH DIAGNOSTIC</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </TerminalPanel>
      </div>
    </div>
  )
}
