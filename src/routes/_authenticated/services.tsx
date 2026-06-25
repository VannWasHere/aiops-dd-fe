import { createFileRoute } from '@tanstack/react-router'
import { useBedrockUsage } from '@/hooks/use-bedrock-usage'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { Cloud, AlertTriangle, Zap, Hash, Clock, ArrowUpDown } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/services')({
  component: ServicesPage,
})

function ServicesPage() {
  const { data, isLoading, isError } = useBedrockUsage()

  return (
    <div className='space-y-4 font-mono text-xs text-foreground'>
      {/* Header */}
      <div className='border-b border-border/60 pb-3'>
        <div className='flex items-center space-x-2 text-primary font-bold text-sm'>
          <Cloud className='h-4 w-4' />
          <span>AWS BEDROCK USAGE MONITOR</span>
        </div>
        <p className='text-muted-foreground text-[10px] mt-1'>
          Real-time AWS Bedrock model invocation metrics via Datadog MCP
        </p>
      </div>

      {/* Loading/Error states */}
      {isLoading && (
        <div className='border border-border/40 bg-[#111111] p-6 text-center animate-pulse text-muted-foreground'>
          Fetching AWS Bedrock usage from Datadog MCP...
        </div>
      )}
      {isError && (
        <div className='border border-[#FF5555]/30 bg-[#FF5555]/5 p-4 flex items-center gap-3'>
          <AlertTriangle className='h-5 w-5 text-[#FF5555]' />
          <div>
            <div className='text-[#FF5555] font-bold'>MCP Connection Error</div>
            <p className='text-[10px] text-muted-foreground'>Ensure Datadog API/APP keys are configured and MCP server is reachable.</p>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Summary Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            <div className='border border-border/40 bg-[#111111] p-3'>
              <div className='flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase mb-1'>
                <Zap className='h-3 w-3' /> Total Invocations
              </div>
              <div className='text-lg font-bold text-[#00FF88]'>{data.total_invocations.toLocaleString()}</div>
            </div>
            <div className='border border-border/40 bg-[#111111] p-3'>
              <div className='flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase mb-1'>
                <Hash className='h-3 w-3' /> Total Tokens
              </div>
              <div className='text-lg font-bold text-[#00FF88]'>{data.total_tokens.toLocaleString()}</div>
            </div>
            <div className='border border-border/40 bg-[#111111] p-3'>
              <div className='flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase mb-1'>
                <Clock className='h-3 w-3' /> Avg Latency
              </div>
              <div className={`text-lg font-bold ${data.avg_latency_ms > 2000 ? 'text-[#FFB020]' : 'text-[#00FF88]'}`}>
                {data.avg_latency_ms.toFixed(0)}ms
              </div>
            </div>
            <div className='border border-border/40 bg-[#111111] p-3'>
              <div className='flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase mb-1'>
                <AlertTriangle className='h-3 w-3' /> Error Rate
              </div>
              <div className={`text-lg font-bold ${data.error_rate > 0.05 ? 'text-[#FF5555]' : 'text-[#00FF88]'}`}>
                {(data.error_rate * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Models Breakdown */}
          <TerminalPanel title='MODEL USAGE BREAKDOWN' collapsible>
            {data.models.length === 0 ? (
              <div className='text-muted-foreground py-4 text-center'>No model data available.</div>
            ) : (
              <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
                {data.models.map((model) => (
                  <div key={model.model_id} className='border border-border/30 bg-[#090909] p-3 space-y-2'>
                    <div className='text-[11px] font-bold text-primary truncate'>{model.model_id}</div>
                    <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]'>
                      <div className='text-muted-foreground'>Invocations:</div>
                      <div className='text-right font-semibold'>{model.invocation_count}</div>
                      <div className='text-muted-foreground'>Avg Latency:</div>
                      <div className='text-right font-semibold'>{model.avg_latency_ms.toFixed(0)}ms</div>
                      <div className='text-muted-foreground'>Input Tokens:</div>
                      <div className='text-right font-semibold'>{model.total_input_tokens.toLocaleString()}</div>
                      <div className='text-muted-foreground'>Output Tokens:</div>
                      <div className='text-right font-semibold'>{model.total_output_tokens.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TerminalPanel>

          {/* Recent Invocations */}
          <TerminalPanel title='RECENT INVOCATIONS' collapsible>
            {data.recent_invocations.length === 0 ? (
              <div className='text-muted-foreground py-4 text-center'>No recent invocations.</div>
            ) : (
              <div className='overflow-x-auto'>
                {/* Header */}
                <div className='flex items-center gap-3 px-2 py-1 border-b border-border/30 text-[9px] text-muted-foreground uppercase font-bold'>
                  <span className='w-[130px] shrink-0'>Timestamp</span>
                  <span className='flex-1 min-w-[120px]'>Model</span>
                  <span className='w-[60px] text-right'>Latency</span>
                  <span className='w-[50px] text-right'>In Tok</span>
                  <span className='w-[50px] text-right'>Out Tok</span>
                  <span className='w-[45px] text-right'>Status</span>
                </div>
                {/* Rows */}
                <div className='max-h-[300px] overflow-y-auto space-y-px'>
                  {data.recent_invocations.map((inv, i) => (
                    <div key={i} className='flex items-center gap-3 px-2 py-1 hover:bg-muted/20 border-l-2 border-l-transparent hover:border-l-primary/40'>
                      <span className='text-muted-foreground w-[130px] shrink-0 truncate'>
                        {inv.timestamp ? new Date(inv.timestamp).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                      </span>
                      <span className='text-primary flex-1 min-w-[120px] truncate'>{inv.model_id}</span>
                      <span className={`w-[60px] text-right ${inv.latency_ms > 2000 ? 'text-[#FFB020]' : 'text-muted-foreground'}`}>
                        {inv.latency_ms.toFixed(0)}ms
                      </span>
                      <span className='w-[50px] text-right text-muted-foreground'>{inv.input_tokens}</span>
                      <span className='w-[50px] text-right text-muted-foreground'>{inv.output_tokens}</span>
                      <span className={`w-[45px] text-right font-bold text-[9px] ${inv.status === 'error' ? 'text-[#FF5555]' : 'text-[#00FF88]'}`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TerminalPanel>
        </>
      )}
    </div>
  )
}
