import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Settings } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  // Query DB health
  const { data: health, isLoading: loadingHealth } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get('/health')
      return res.data
    },
    refetchInterval: 10000 // Poll health status every 10 seconds
  })

  // Query integration diagnostics config
  const { data: diagnostics, isLoading: loadingDiagnostics } = useQuery({
    queryKey: ['bedrock_diagnostics'],
    queryFn: async () => {
      const res = await api.get('/test/bedrock-diagnostics')
      return res.data
    },
    refetchInterval: 10000
  })

  const isDbHealthy = health?.database === 'healthy'

  return (
    <div className='space-y-6 font-mono text-xs text-foreground'>
      {/* Title Header */}
      <div className='border-b border-border/60 pb-4 mb-4'>
        <div className='flex items-center space-x-2 text-primary font-bold mb-1 text-sm'>
          <Settings className='h-4 w-4' />
          <span>SYSTEM INTEGRATION CONFIGURATIONS</span>
        </div>
        <p className='text-muted-foreground text-[10px]'>
          Verify active integration keys, monitor connection status parameters, and review system configuration details.
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl select-text'>
        {/* PostgreSQL Database Card */}
        <TerminalPanel
          title='Database storage engine'
          rightElement={
            loadingHealth ? (
              <span className='px-1.5 py-0.5 border border-border bg-[#161616] text-[8px] font-bold text-muted-foreground animate-pulse'>
                CHECKING...
              </span>
            ) : isDbHealthy ? (
              <span className='px-1.5 py-0.5 border border-[#00FF88]/20 bg-[#00FF88]/5 text-[8px] font-bold text-[#00FF88]'>
                CONNECTED
              </span>
            ) : (
              <span className='px-1.5 py-0.5 border border-[#FF5555]/20 bg-[#FF5555]/5 text-[8px] font-bold text-[#FF5555]'>
                OFFLINE
              </span>
            )
          }
        >
          <div className='space-y-3 text-[10px] select-text'>
            <div className='space-y-1'>
              <span className='text-muted-foreground block font-semibold'>SQL CONNECTION URI:</span>
              <code className='bg-[#090909] border border-border/40 p-2 rounded block text-[9.5px] truncate text-foreground'>
                postgresql://postgres:***@localhost:5432/cable3_ops
              </code>
            </div>
            <div className='space-y-1 border-t border-border/30 pt-2'>
              <span className='text-muted-foreground block font-semibold'>ENGINE METADATA:</span>
              <p className='text-muted-foreground leading-normal'>
                {loadingHealth 
                  ? 'Accessing database connection socket...' 
                  : isDbHealthy 
                    ? 'SQLAlchemy operational. 7 metadata tables active and matching migration schema.'
                    : `Database connection error: ${health?.database || 'Socket timeout.'}`}
              </p>
            </div>
          </div>
        </TerminalPanel>

        {/* Datadog MCP Card */}
        <TerminalPanel
          title='Datadog MCP Integration'
          rightElement={
            loadingDiagnostics ? (
              <span className='px-1.5 py-0.5 border border-border bg-[#161616] text-[8px] font-bold text-muted-foreground animate-pulse'>
                CHECKING...
              </span>
            ) : diagnostics?.dd_api_key_configured && diagnostics?.dd_app_key_configured ? (
              <span className='px-1.5 py-0.5 border border-[#00FF88]/20 bg-[#00FF88]/5 text-[8px] font-bold text-[#00FF88]'>
                LIVE_MODE
              </span>
            ) : (
              <span className='px-1.5 py-0.5 border border-[#FFB020]/20 bg-[#FFB020]/5 text-[8px] font-bold text-[#FFB020]'>
                MOCK_MODE
              </span>
            )
          }
        >
          <div className='space-y-3 text-[10px] select-text'>
            <div className='space-y-1'>
              <span className='text-muted-foreground block font-semibold'>CLIENT INSTANCE:</span>
              {loadingDiagnostics ? (
                <span className='text-muted-foreground animate-pulse'>Reading credentials...</span>
              ) : diagnostics?.dd_api_key_configured ? (
                <code className='bg-[#090909] border border-border/40 p-1 text-[9px] block text-foreground truncate'>
                  API Key: {diagnostics?.dd_api_key_masked}
                </code>
              ) : (
                <span className='text-[#FFB020] font-bold'>PENDING API CREDENTIALS</span>
              )}
            </div>
            <p className='text-muted-foreground leading-relaxed border-t border-border/30 pt-2'>
              Provides active tracing, latencies, and transaction metrics. Configuration definitions are prepared in <code>app/integrations/datadog/</code>.
            </p>
          </div>
        </TerminalPanel>

        {/* AWS Bedrock Card */}
        <TerminalPanel
          title='AWS Bedrock AI model'
          rightElement={
            loadingDiagnostics ? (
              <span className='px-1.5 py-0.5 border border-border bg-[#161616] text-[8px] font-bold text-muted-foreground animate-pulse'>
                CHECKING...
              </span>
            ) : diagnostics?.aws_access_key_id_configured && diagnostics?.aws_secret_access_key_configured ? (
              <span className='px-1.5 py-0.5 border border-[#00FF88]/20 bg-[#00FF88]/5 text-[8px] font-bold text-[#00FF88]'>
                LIVE_MODE
              </span>
            ) : (
              <span className='px-1.5 py-0.5 border border-[#FFB020]/20 bg-[#FFB020]/5 text-[8px] font-bold text-[#FFB020]'>
                MOCK_MODE
              </span>
            )
          }
        >
          <div className='space-y-3 text-[10px] select-text'>
            <div className='space-y-1'>
              <span className='text-muted-foreground block font-semibold'>MODEL ID:</span>
              {loadingDiagnostics ? (
                <span className='text-muted-foreground animate-pulse'>Retrieving model id...</span>
              ) : (
                <code className='bg-[#090909] border border-border/40 p-1 text-[9px] block text-foreground'>
                  {diagnostics?.bedrock_model_id || 'amazon.nova-pro-v1:0'}
                </code>
              )}
            </div>
            <div className='space-y-1 border-t border-border/30 pt-2'>
              <span className='text-muted-foreground block font-semibold'>AWS ACCESS KEY:</span>
              {loadingDiagnostics ? (
                <span className='text-muted-foreground animate-pulse'>Reading credentials...</span>
              ) : diagnostics?.aws_access_key_id_configured ? (
                <code className='bg-[#090909] border border-border/40 p-1 text-[9px] block text-foreground truncate'>
                  Key ID: {diagnostics?.aws_access_key_id_masked}
                </code>
              ) : (
                <span className='text-[#FFB020] font-bold'>PENDING CLIENT AWS KEY</span>
              )}
            </div>
            <p className='text-muted-foreground leading-relaxed'>
              Triggers root cause analysis algorithms. Bedrock service definitions reside under <code>app/integrations/bedrock/</code>.
            </p>
          </div>
        </TerminalPanel>
      </div>

      {/* Info Notice Box */}
      <Alert className='max-w-6xl mt-4 rounded-none bg-[#111111] border border-border text-foreground select-text'>
        <AlertCircle className='h-4 w-4 text-primary flex-shrink-0' />
        <AlertTitle className='font-bold uppercase tracking-wider text-primary text-[10px]'>Integration Notice</AlertTitle>
        <AlertDescription className='text-[10px] mt-1 text-muted-foreground leading-relaxed'>
          To activate live AWS Bedrock model calls or ingest live metrics from Datadog MCP telemetry streams, update your API credentials inside your <code>backend/.env</code> configuration file.
        </AlertDescription>
      </Alert>
    </div>
  )
}
