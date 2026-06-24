import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useInvestigation } from '@/hooks/use-investigations'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, Activity, Server, Clock, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/investigations/$id')({
  component: InvestigationDetailsPage,
})

function InvestigationDetailsPage() {
  const { id } = useParams({ from: '/_authenticated/investigations/$id' })
  const { data: inv, isLoading, isError } = useInvestigation(id)

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-destructive/15 text-destructive border-destructive/25'
      case 'medium': return 'bg-amber-500/15 text-amber-500 border-amber-500/25'
      case 'low': return 'bg-blue-500/15 text-blue-500 border-blue-500/25'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  if (isLoading) {
    return (
      <Main className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center space-y-4'>
          <Activity className='h-12 w-12 text-primary animate-spin' />
          <p className='text-sm text-muted-foreground'>Running incident telemetry diagnosis...</p>
        </div>
      </Main>
    )
  }

  if (isError || !inv) {
    return (
      <Main className='flex items-center justify-center min-h-[400px]'>
        <Alert variant='destructive' className='max-w-md'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not fetch the investigation details. It may have been deleted or the backend is offline.
          </AlertDescription>
          <div className='mt-4'>
            <Button asChild size='sm' variant='outline'>
              <Link to='/investigations'>Back to Investigations</Link>
            </Button>
          </div>
        </Alert>
      </Main>
    )
  }

  return (
    <>
      {/* ===== Header ===== */}
      <Header>
        <div className='flex items-center space-x-2'>
          <Activity className='h-6 w-6 text-primary' />
          <span className='text-xl font-bold tracking-tight'>Cable3 Ops / RCA Details</span>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main Content ===== */}
      <Main>
        {/* Navigation and Actions */}
        <div className='mb-6'>
          <Button asChild variant='ghost' size='sm' className='mb-2'>
            <Link to='/investigations'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Investigations
            </Link>
          </Button>
          <div className='flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0'>
            <div>
              <div className='flex items-center space-x-3'>
                <h1 className='text-3xl font-bold tracking-tight'>{inv.title}</h1>
                <Badge variant={inv.status === 'resolved' ? 'default' : 'secondary'}>
                  {inv.status}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground mt-1'>
                Investigation ID: {inv.id}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='w-full justify-start border-b rounded-none h-11 bg-transparent p-0 space-x-6'>
            <TabsTrigger 
              value='overview' 
              className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2 text-sm font-medium'
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value='timeline'
              className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2 text-sm font-medium'
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger 
              value='root-cause'
              className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2 text-sm font-medium'
            >
              Root Cause
            </TabsTrigger>
            <TabsTrigger 
              value='recommendations'
              className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2 text-sm font-medium'
            >
              Recommendations
            </TabsTrigger>
            <TabsTrigger 
              value='evidence'
              className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2 text-sm font-medium'
            >
              Evidence
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-3'>
              {/* Question & Summary Cards */}
              <div className='md:col-span-2 space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center space-x-2'>
                      <FileText className='h-4 w-4 text-muted-foreground' />
                      <span>Investigation Inquiry</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm leading-relaxed whitespace-pre-wrap'>{inv.question}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center space-x-2'>
                      <CheckCircle2 className='h-4 w-4 text-emerald-500' />
                      <span>Diagnosis Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm leading-relaxed font-medium'>{inv.summary || 'Summary generating...'}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Service Metadata Card */}
              <div className='md:col-span-1'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Monitored Service</CardTitle>
                    <CardDescription>Associated telemetry details</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4 text-sm'>
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 bg-primary/10 rounded-md'>
                        <Server className='h-4 w-4 text-primary' />
                      </div>
                      <div>
                        <div className='font-semibold'>{inv.service?.name || 'Loading service...'}</div>
                        <div className='text-xs text-muted-foreground'>
                          {inv.service?.environment} • {inv.service?.owner}
                        </div>
                      </div>
                    </div>
                    <div className='border-t pt-4 space-y-2 text-xs'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Created:</span>
                        <span>{new Date(inv.created_at).toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Last Diagnostic:</span>
                        <span>{new Date(inv.updated_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TIMELINE TAB */}
          <TabsContent value='timeline'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Telemetry Incident Timeline</CardTitle>
                <CardDescription>Sequence of historical metrics, events, and alarms prior to fault triggering.</CardDescription>
              </CardHeader>
              <CardContent>
                {inv.timeline.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>No timeline events generated.</p>
                ) : (
                  <div className='relative border-l pl-6 space-y-8 py-2 ml-4'>
                    {inv.timeline.map((event) => (
                      <div key={event.id} className='relative'>
                        {/* Bullet */}
                        <div className='absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border bg-background text-primary-foreground'>
                          <Clock className='h-3 w-3 text-primary' />
                        </div>
                        <div>
                          <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-3'>
                            <span className='font-semibold text-sm text-foreground'>{event.title}</span>
                            <Badge variant='outline' className='w-fit text-[10px] mt-1 sm:mt-0'>
                              {new Date(event.event_time).toLocaleTimeString()}
                            </Badge>
                          </div>
                          <p className='text-xs text-muted-foreground mt-1'>{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROOT CAUSE TAB */}
          <TabsContent value='root-cause'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Root Cause Analysis (RCA)</CardTitle>
                <CardDescription>Determined system code path or infrastructure component failure triggers.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='rounded-lg bg-muted/40 p-5 border'>
                  <p className='text-sm leading-relaxed whitespace-pre-wrap font-medium'>
                    {inv.root_cause || 'Analyzing root cause triggers...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RECOMMENDATIONS TAB */}
          <TabsContent value='recommendations'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Actionable Incident Fixes</CardTitle>
                <CardDescription>Mitigation and long-term resolutions recommended by AI engine.</CardDescription>
              </CardHeader>
              <CardContent>
                {inv.recommendations.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>No recommendations generated.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[100px]'>Priority</TableHead>
                        <TableHead>Recommended Fix</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inv.recommendations.map((rec) => (
                        <TableRow key={rec.id}>
                          <TableCell>
                            <Badge variant='outline' className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className='font-semibold text-sm'>{rec.title}</TableCell>
                          <TableCell className='text-xs text-muted-foreground'>{rec.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* EVIDENCE TAB */}
          <TabsContent value='evidence'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Collected Diagnostics / Evidence</CardTitle>
                <CardDescription>Metrics, log traces, and external events collected during lookup.</CardDescription>
              </CardHeader>
              <CardContent>
                {inv.evidence.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>No diagnostic evidence cataloged.</p>
                ) : (
                  <div className='grid gap-4 md:grid-cols-2'>
                    {inv.evidence.map((item) => (
                      <Card key={item.id} className='bg-muted/10 border-l-4 border-l-primary/60'>
                        <CardHeader className='pb-2'>
                          <CardTitle className='text-sm flex items-center space-x-1.5'>
                            <Activity className='h-3.5 w-3.5 text-primary' />
                            <span>{item.source}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <code className='text-[11px] block bg-muted/60 p-3 rounded font-mono border text-foreground overflow-x-auto whitespace-pre-wrap'>
                            {item.details}
                          </code>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
