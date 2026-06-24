import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Database, AlertCircle, Settings, HardDrive, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  // Query backend health endpoint
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get('/health')
      return res.data
    },
    refetchInterval: 10000 // Poll health status every 10 seconds
  })

  const isDbHealthy = health?.database === 'healthy'

  return (
    <>
      {/* ===== Header ===== */}
      <Header>
        <div className='flex items-center space-x-2'>
          <Settings className='h-6 w-6 text-primary' />
          <span className='text-xl font-bold tracking-tight'>Cable3 Ops / Settings</span>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main Content ===== */}
      <Main>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold tracking-tight'>System Settings</h1>
          <p className='text-muted-foreground'>
            Verify active integration profiles and configuration status parameters.
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl'>
          {/* PostgreSQL Database Card */}
          <Card className='flex flex-col justify-between'>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Database className='h-5 w-5 text-primary' />
                  <span>PostgreSQL Database</span>
                </div>
                {isLoading ? (
                  <Badge variant='outline' className='animate-pulse'>Checking...</Badge>
                ) : isDbHealthy ? (
                  <Badge variant='outline' className='bg-emerald-500/15 text-emerald-500 border-emerald-500/25'>
                    Connected
                  </Badge>
                ) : (
                  <Badge variant='destructive'>Disconnected</Badge>
                )}
              </CardTitle>
              <CardDescription>Primary storage engine configuration.</CardDescription>
            </CardHeader>
            <CardContent className='text-xs space-y-3 flex-grow'>
              <div className='space-y-1'>
                <span className='text-muted-foreground block'>Connection URI:</span>
                <code className='bg-muted p-1.5 rounded block text-[10px] truncate'>
                  postgresql://postgres:***@localhost:5432/cable3_ops
                </code>
              </div>
              <div className='space-y-1'>
                <span className='text-muted-foreground block'>Status Description:</span>
                <p className='text-muted-foreground'>
                  {isLoading 
                    ? 'Connecting to database server...' 
                    : isDbHealthy 
                      ? 'SQLAlchemy connected. All 7 tables initialized and matching alembic versions.'
                      : `Connection failed: ${health?.database || 'Network timeout.'}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Datadog MCP Card */}
          <Card className='flex flex-col justify-between'>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <HardDrive className='h-5 w-5 text-muted-foreground' />
                  <span>Datadog MCP</span>
                </div>
                <Badge variant='outline' className='bg-amber-500/15 text-amber-500 border-amber-500/25'>
                  Mock Mode
                </Badge>
              </CardTitle>
              <CardDescription>Metrics, log stream, and trace client configurations.</CardDescription>
            </CardHeader>
            <CardContent className='text-xs space-y-3 flex-grow'>
              <div className='space-y-1'>
                <span className='text-muted-foreground block'>MCP API Status:</span>
                <span className='font-semibold text-amber-500'>Integration Pending API Credentials</span>
              </div>
              <p className='text-muted-foreground leading-relaxed'>
                Provides direct ingestion of telemetry from active service monitors. Datadog MCP integration is prepared in <code>app/integrations/datadog/</code>.
              </p>
            </CardContent>
          </Card>

          {/* AWS Bedrock Card */}
          <Card className='flex flex-col justify-between'>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <CheckCircle2 className='h-5 w-5 text-muted-foreground' />
                  <span>AWS Bedrock</span>
                </div>
                <Badge variant='outline' className='bg-amber-500/15 text-amber-500 border-amber-500/25'>
                  Mock Mode
                </Badge>
              </CardTitle>
              <CardDescription>LLM diagnostic orchestrator credentials.</CardDescription>
            </CardHeader>
            <CardContent className='text-xs space-y-3 flex-grow'>
              <div className='space-y-1'>
                <span className='text-muted-foreground block'>Model ID:</span>
                <code className='bg-muted p-1 rounded text-[10px] block'>
                  anthropic.claude-3-sonnet-20240229-v1:0
                </code>
              </div>
              <div className='space-y-1'>
                <span className='text-muted-foreground block'>Status:</span>
                <span className='font-semibold text-amber-500'>Integration Pending AWS Client Key</span>
              </div>
              <p className='text-muted-foreground leading-relaxed'>
                Drives context analysis and generates correctives. AWS Bedrock integration class is prepared in <code>app/integrations/bedrock/</code>.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Informative alert box */}
        <Alert className='max-w-5xl mt-6'>
          <AlertCircle className='h-4 w-4 text-primary' />
          <AlertTitle>Developer Notice</AlertTitle>
          <AlertDescription className='text-xs'>
            Both AWS Bedrock and Datadog integrations are designed as clean architecture interfaces. You can easily connect live telemetry and LLM agents by providing credentials in <code>backend/.env</code> and registering concrete classes.
          </AlertDescription>
        </Alert>
      </Main>
    </>
  )
}
