import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useInvestigation } from '@/hooks/use-investigations'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, Activity, Server, Clock, AlertTriangle } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/investigations/$id')({
  component: InvestigationDetailsPage,
})

function InvestigationDetailsPage() {
  const { id } = useParams({ from: '/_authenticated/investigations/$id' })
  const { data: inv, isLoading, isError } = useInvestigation(id)

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-[#FF5555] border-[#FF5555]/20 bg-[#FF5555]/5'
      case 'medium': return 'text-[#FFB020] border-[#FFB020]/20 bg-[#FFB020]/5'
      case 'low': return 'text-[#58A6FF] border-[#58A6FF]/20 bg-[#58A6FF]/5'
      default: return 'text-muted-foreground border-border bg-[#161616]'
    }
  }

  const getStatusClass = (status: string) => {
    return status.toLowerCase() === 'resolved'
      ? 'text-[#00FF88] border-[#00FF88]/20 bg-[#00FF88]/5'
      : 'text-[#FFB020] border-[#FFB020]/20 bg-[#FFB020]/5'
  }

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] font-mono text-xs text-muted-foreground space-y-3'>
        <Activity className='h-8 w-8 text-primary animate-spin' />
        <span>Running incident telemetry diagnosis...</span>
      </div>
    )
  }

  if (isError || !inv) {
    return (
      <div className='max-w-md mx-auto py-12 font-mono text-xs'>
        <Alert variant='destructive' className='rounded-none bg-[#FF5555]/5 border-[#FF5555]/30 text-[#FF5555]'>
          <AlertTriangle className='h-4 w-4 text-[#FF5555]' />
          <AlertTitle className='font-bold uppercase tracking-wider'>Diagnostic Error</AlertTitle>
          <AlertDescription className='text-[10px] mt-1'>
            Could not fetch the investigation details. The database server may be offline or this record was removed.
          </AlertDescription>
          <div className='mt-4 select-none'>
            <Button asChild size='sm' className='h-6 text-[10px] border-[#FF5555]/30 bg-[#FF5555]/10 text-[#FF5555] hover:bg-[#FF5555]/20 rounded-none'>
              <Link to='/investigations'>Back to Registry</Link>
            </Button>
          </div>
        </Alert>
      </div>
    )
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
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-y-2'>
          <div>
            <div className='flex items-center space-x-3'>
              <h1 className='text-sm font-bold text-primary tracking-tight select-text'>{inv.title.toUpperCase()}</h1>
              <span className={`px-1.5 py-0.5 border text-[9px] font-bold ${getStatusClass(inv.status)}`}>
                {inv.status.toUpperCase()}
              </span>
            </div>
            <p className='text-muted-foreground text-[10px] mt-1 select-text'>
              TELEMETRY ID: {inv.id}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Selection */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='w-full justify-start border-b border-border rounded-none h-9 bg-transparent p-0 space-x-1.5 overflow-x-auto no-scrollbar'>
          <TabsTrigger 
            value='overview' 
            className='rounded-none border border-transparent data-[state=active]:border-border data-[state=active]:bg-[#111111] data-[state=active]:text-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider'
          >
            [01. Overview]
          </TabsTrigger>
          <TabsTrigger 
            value='timeline'
            className='rounded-none border border-transparent data-[state=active]:border-border data-[state=active]:bg-[#111111] data-[state=active]:text-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider'
          >
            [02. Timeline]
          </TabsTrigger>
          <TabsTrigger 
            value='root-cause'
            className='rounded-none border border-transparent data-[state=active]:border-border data-[state=active]:bg-[#111111] data-[state=active]:text-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider'
          >
            [03. Root Cause]
          </TabsTrigger>
          <TabsTrigger 
            value='recommendations'
            className='rounded-none border border-transparent data-[state=active]:border-border data-[state=active]:bg-[#111111] data-[state=active]:text-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider'
          >
            [04. Recommendations]
          </TabsTrigger>
          <TabsTrigger 
            value='evidence'
            className='rounded-none border border-transparent data-[state=active]:border-border data-[state=active]:bg-[#111111] data-[state=active]:text-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider'
          >
            [05. Evidence]
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-6 md:grid-cols-12'>
            <div className='md:col-span-8 space-y-4'>
              <TerminalPanel title='Investigation Inquiry Query'>
                <div className='bg-[#090909] p-3 border border-border/40 select-text leading-relaxed text-[11px] whitespace-pre-wrap text-[#E6EDF3]'>
                  {inv.question}
                </div>
              </TerminalPanel>

              <TerminalPanel title='Diagnostic Diagnosis Summary'>
                <div className='bg-[#090909] p-3 border border-border/40 select-text leading-relaxed text-[11px] text-[#00FF88]'>
                  {inv.summary || 'Executing summary diagnostics. Telemetry compiling...'}
                </div>
              </TerminalPanel>
            </div>

            <div className='md:col-span-4'>
              <TerminalPanel title='Service Node Metadata'>
                <div className='space-y-3 text-[10px] select-text'>
                  <div className='flex items-center space-x-3 p-2 bg-[#090909] border border-border/40'>
                    <Server className='h-4 w-4 text-primary flex-shrink-0' />
                    <div>
                      <div className='font-bold text-[#E6EDF3] uppercase'>{inv.service?.name || 'NODE'}</div>
                      <div className='text-[9px] text-muted-foreground'>
                        {inv.service?.environment.toUpperCase()} • {inv.service?.owner}
                      </div>
                    </div>
                  </div>
                  
                  <div className='border-t border-border/20 pt-2 space-y-1 text-muted-foreground'>
                    <div className='flex justify-between'>
                      <span>INGESTION  :</span>
                      <span className='text-foreground'>{new Date(inv.created_at).toLocaleString()}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>UPDATED    :</span>
                      <span className='text-foreground'>{new Date(inv.updated_at).toLocaleString()}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>OWNER TEAM :</span>
                      <span className='text-foreground'>{inv.service?.owner}</span>
                    </div>
                  </div>
                </div>
              </TerminalPanel>
            </div>
          </div>
        </TabsContent>

        {/* TIMELINE TAB */}
        <TabsContent value='timeline'>
          <TerminalPanel title='Telemetry Incident Timeline Log'>
            {inv.timeline.length === 0 ? (
              <p className='text-muted-foreground py-4'>No timeline events generated. Telemetry missing.</p>
            ) : (
              <div className='relative border-l border-border/60 pl-6 space-y-6 py-2 ml-4 select-text'>
                {inv.timeline.map((event) => (
                  <div key={event.id} className='relative leading-normal'>
                    {/* Circle Bullet */}
                    <div className='absolute -left-[31px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-border bg-[#090909] text-primary'>
                      <Clock className='h-2.5 w-2.5 text-primary' />
                    </div>
                    <div>
                      <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                        <span className='font-bold text-foreground text-[10px]'>{event.title.toUpperCase()}</span>
                        <span className='px-1 py-0.5 border border-border bg-[#161616] text-muted-foreground text-[8px]'>
                          {new Date(event.event_time).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className='text-[10px] text-muted-foreground mt-1 select-text leading-relaxed'>
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TerminalPanel>
        </TabsContent>

        {/* ROOT CAUSE TAB */}
        <TabsContent value='root-cause'>
          <TerminalPanel title='Root Cause Analysis (RCA) Output'>
            <div className='bg-[#090909] p-4 border border-border/40 select-text leading-relaxed text-[11px] whitespace-pre-wrap text-[#00FF88]'>
              {inv.root_cause || 'Executing root cause analysis model. Scanning active logs...'}
            </div>
          </TerminalPanel>
        </TabsContent>

        {/* RECOMMENDATIONS TAB */}
        <TabsContent value='recommendations'>
          <TerminalPanel title='Actionable Remediation fixes'>
            {inv.recommendations.length === 0 ? (
              <p className='text-muted-foreground py-4'>No remediation paths found.</p>
            ) : (
              <div className='overflow-x-auto select-text'>
                <Table>
                  <TableHeader className='bg-muted/10 border-b border-border/40 select-none'>
                    <TableRow className='hover:bg-transparent border-none'>
                      <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase w-[100px]'>Priority</TableHead>
                      <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase w-[220px]'>Remediation</TableHead>
                      <TableHead className='h-8 text-[9px] font-bold text-muted-foreground uppercase'>Description / Code script</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inv.recommendations.map((rec) => (
                      <TableRow key={rec.id} className='hover:bg-muted/10 border-b border-border/20 last:border-none'>
                        <TableCell className='py-2.5'>
                          <span className={`px-1.5 py-0.5 border text-[8px] font-bold ${getPriorityBadgeClass(rec.priority)}`}>
                            {rec.priority.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className='py-2.5 font-bold text-[10px] text-foreground'>
                          {rec.title.toUpperCase()}
                        </TableCell>
                        <TableCell className='py-2.5 text-[9.5px] text-muted-foreground leading-relaxed'>
                          {rec.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TerminalPanel>
        </TabsContent>

        {/* EVIDENCE TAB */}
        <TabsContent value='evidence'>
          <TerminalPanel title='Collected Diagnostics Trace Evidence'>
            {inv.evidence.length === 0 ? (
              <p className='text-muted-foreground py-4'>No log or metrics telemetry trace evidence indexed.</p>
            ) : (
              <div className='grid gap-4 md:grid-cols-2 select-text'>
                {inv.evidence.map((item) => (
                  <TerminalPanel 
                    key={item.id} 
                    title={`EVIDENCE SOURCE: ${item.source.toUpperCase()}`}
                    className='mb-0 border-primary/20 bg-[#111111]/30'
                  >
                    <pre className='text-[10px] block bg-[#090909] p-3 border border-border/60 text-foreground overflow-x-auto whitespace-pre-wrap leading-tight'>
                      {item.details}
                    </pre>
                  </TerminalPanel>
                ))}
              </div>
            )}
          </TerminalPanel>
        </TabsContent>
      </Tabs>
    </div>
  )
}
