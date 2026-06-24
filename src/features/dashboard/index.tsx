import { useServices } from '@/hooks/use-services'
import { useInvestigations } from '@/hooks/use-investigations'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Server, Activity, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react'

export function Dashboard() {
  const { services, isLoading: loadingServices } = useServices()
  const { investigations, isLoading: loadingInvestigations } = useInvestigations()

  // Calculate statistics from dynamic API data
  const totalServices = services.length
  const totalInvestigations = investigations.length
  const degradedServices = services.filter((s) => s.status !== 'operational').length
  const resolvedInvestigations = investigations.filter((i) => i.status === 'resolved' || i.status === 'closed').length

  // Get recent 5 investigations
  const recentInvestigations = investigations.slice(0, 5)

  return (
    <>
      {/* ===== Header ===== */}
      <Header>
        <div className='flex items-center space-x-2'>
          <Activity className='h-6 w-6 text-primary' />
          <span className='text-xl font-bold tracking-tight'>Cable3 Ops</span>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main Content ===== */}
      <Main>
        <div className='mb-6 flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
            <p className='text-muted-foreground'>
              Investigate and resolve system incidents using AI-powered telemetry analysis.
            </p>
          </div>
          <div>
            <Button asChild>
              <Link to='/investigations/new'>
                Start New Investigation
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Monitored Services</CardTitle>
              <Server className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {loadingServices ? (
                <div className='h-8 w-20 animate-pulse rounded bg-muted' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>{totalServices}</div>
                  <p className='text-xs text-muted-foreground'>
                    {degradedServices > 0
                      ? `${degradedServices} service(s) reporting issues`
                      : 'All services operational'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active Investigations</CardTitle>
              <Activity className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {loadingInvestigations ? (
                <div className='h-8 w-20 animate-pulse rounded bg-muted' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>{totalInvestigations}</div>
                  <p className='text-xs text-muted-foreground'>
                    {totalInvestigations - resolvedInvestigations} investigation(s) in progress
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Findings / Evidence</CardTitle>
              <AlertTriangle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {loadingInvestigations ? (
                <div className='h-8 w-20 animate-pulse rounded bg-muted' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>
                    {totalInvestigations * 3} {/* Mock count: 3 items of evidence per investigation */}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Observability indicators collected
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Recommendations</CardTitle>
              <Lightbulb className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {loadingInvestigations ? (
                <div className='h-8 w-20 animate-pulse rounded bg-muted' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>
                    {totalInvestigations * 3} {/* Mock count: 3 recommendations per investigation */}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Actionable incident fixes suggested
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Grid Details */}
        <div className='mt-6 grid gap-4 lg:grid-cols-7'>
          {/* Recent Investigations */}
          <Card className='col-span-1 lg:col-span-4'>
            <CardHeader>
              <CardTitle>Recent Investigations</CardTitle>
              <CardDescription>
                Overview of current and resolved incidents in your environment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInvestigations ? (
                <div className='space-y-2'>
                  <div className='h-10 w-full animate-pulse rounded bg-muted' />
                  <div className='h-10 w-full animate-pulse rounded bg-muted' />
                  <div className='h-10 w-full animate-pulse rounded bg-muted' />
                </div>
              ) : recentInvestigations.length === 0 ? (
                <div className='flex h-[200px] flex-col items-center justify-center border border-dashed rounded-lg p-4 text-center'>
                  <p className='text-sm text-muted-foreground'>No investigations found</p>
                  <Button asChild variant='link' className='mt-2'>
                    <Link to='/investigations/new'>Create one now</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Incident Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className='text-right'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvestigations.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className='font-medium'>{inv.title}</TableCell>
                        <TableCell>
                          <Badge variant={inv.status === 'resolved' ? 'default' : 'secondary'}>
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(inv.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button asChild size='sm' variant='outline'>
                            <Link to='/investigations/$id' params={{ id: inv.id }}>View RCA</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* System Architecture and Roadmap */}
          <div className='col-span-1 flex flex-col gap-4 lg:col-span-3'>
            {/* System Architecture */}
            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
                <CardDescription>Visual mapping of microservice flow.</CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col gap-4'>
                <div className='flex flex-col space-y-3 rounded-lg border bg-card p-4 text-sm'>
                  <div className='flex items-center justify-between border-b pb-2'>
                    <span className='font-semibold text-primary'>User Request</span>
                    <span className='text-xs text-muted-foreground'>Public API Gateways</span>
                  </div>
                  <div className='flex flex-col space-y-2 pl-2'>
                    <div className='flex items-center space-x-2 text-xs'>
                      <Badge variant='outline' className='bg-primary/10 text-primary'>checkout-api</Badge>
                      <span className='text-muted-foreground'>→ Orchestrates purchases</span>
                    </div>
                    <div className='flex items-center space-x-2 text-xs pl-4'>
                      <Badge variant='outline'>payment-api</Badge>
                      <span className='text-muted-foreground'>→ Processes Stripe/Adyen billing</span>
                    </div>
                    <div className='flex items-center space-x-2 text-xs pl-4'>
                      <Badge variant='outline'>inventory-api</Badge>
                      <span className='text-muted-foreground'>→ Reserves physical stocks</span>
                    </div>
                    <div className='flex items-center space-x-2 text-xs pl-4'>
                      <Badge variant='outline'>user-api</Badge>
                      <span className='text-muted-foreground'>→ Validates user tokens & profiles</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Future Roadmap */}
            <Card>
              <CardHeader>
                <CardTitle>Tomorrow's Roadmap</CardTitle>
                <CardDescription>Upcoming features and planned integrations.</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex flex-col space-y-2 border-l-2 border-primary pl-4'>
                  <div className='text-sm font-semibold'>1. Connect Datadog MCP</div>
                  <p className='text-xs text-muted-foreground'>
                    Fetch live APM traces, latency charts, and server memory metrics automatically.
                  </p>
                </div>
                <div className='flex flex-col space-y-2 border-l-2 border-primary pl-4'>
                  <div className='text-sm font-semibold'>2. Connect AWS Bedrock</div>
                  <p className='text-xs text-muted-foreground'>
                    Use Claude 3 Sonnet to analyze raw trace logs and run root-cause reasoning.
                  </p>
                </div>
                <div className='flex flex-col space-y-2 border-l-2 border-primary pl-4'>
                  <div className='text-sm font-semibold'>3. Live Incident Analysis</div>
                  <p className='text-xs text-muted-foreground'>
                    Automated slack commands to trigger investigation workflows from active alerts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
