import { useState } from 'react'
import { useTraces, useTraceDetail } from '@/hooks/use-traces'
import { useLLMDashboard } from '@/hooks/use-dashboard'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Terminal, Play, AlertTriangle, ExternalLink, LayoutDashboard, Brain, BarChart3 } from 'lucide-react'

export function Dashboard() {
  const [query, setQuery] = useState('service:*')
  const [timeRange, setTimeRange] = useState('now-1h')
  const [selectedTraceId, setSelectedTraceId] = useState('')

  const { data: tracesData, isLoading: tracesLoading } = useTraces(query, timeRange)
  const { data: traceDetail } = useTraceDetail(selectedTraceId)
  const { data: dashboard, isLoading: dashLoading, isError: dashError } = useLLMDashboard()

  const traces = tracesData?.traces ?? []
  const errorCount = traces.filter(t => t.status === 'error').length
  const avgLatency = traces.length ? Math.round(traces.reduce((s, t) => s + t.duration_ms, 0) / traces.length) : 0

  return (
    <div className='space-y-4 font-mono text-xs text-foreground'>
      {/* Header */}
      <div className='border-b border-border/60 pb-3'>
        <div className='flex items-center space-x-2 text-primary font-bold text-sm'>
          <LayoutDashboard className='h-4 w-4' />
          <span>AI OPS OPERATIONS CENTER</span>
        </div>
        <p className='text-muted-foreground text-[10px] mt-1'>
          LLM Observability powered by Datadog MCP + Amazon Bedrock AI Summarization
        </p>
      </div>

      {/* LLM Sample Dashboard Section */}
      <TerminalPanel
        title={dashboard?.title || 'LLM SAMPLE DASHBOARD'}
        collapsible
        rightElement={
          dashboard?.url ? (
            <a href={dashboard.url} target='_blank' rel='noopener noreferrer'
              className='px-2 py-0.5 border border-primary/45 bg-[#161616] text-[#58A6FF] hover:border-primary hover:text-primary text-[9px] font-bold flex items-center space-x-1 cursor-pointer'>
              <ExternalLink className='h-3 w-3' /><span>OPEN IN DATADOG</span>
            </a>
          ) : undefined
        }
      >
        {dashLoading ? (
          <div className='py-8 text-center text-muted-foreground animate-pulse'>
            <BarChart3 className='h-6 w-6 mx-auto mb-2 text-primary/50' />
            Fetching LLM Sample Dashboard from Datadog MCP...
          </div>
        ) : dashError ? (
          <div className='py-6 text-center text-[#FF5555]'>
            <AlertTriangle className='h-5 w-5 mx-auto mb-2' />
            Failed to load dashboard. Check Datadog credentials.
          </div>
        ) : dashboard ? (
          <div className='space-y-4'>
            {dashboard.description && (
              <p className='text-[10px] text-muted-foreground'>{dashboard.description}</p>
            )}

            {/* Widget Groups Summary */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
              {dashboard.groups.map((group) => {
                const groupWidgets = dashboard.widgets.filter(w => w.group === group)
                return (
                  <div key={group} className='border border-border/40 bg-[#090909] p-2'>
                    <div className='text-[9px] text-primary font-bold uppercase truncate'>{group}</div>
                    <div className='text-[10px] text-muted-foreground mt-1'>{groupWidgets.length} widgets</div>
                    <div className='mt-1 space-y-0.5'>
                      {groupWidgets.slice(0, 3).map(w => (
                        <div key={w.id} className='text-[9px] text-foreground/70 truncate'>• {w.title}</div>
                      ))}
                      {groupWidgets.length > 3 && (
                        <div className='text-[9px] text-muted-foreground/50'>+{groupWidgets.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* AI Summary from Bedrock */}
            {dashboard.ai_summary && (
              <div className='border border-primary/30 bg-primary/5 p-3 space-y-2'>
                <div className='flex items-center gap-1.5 text-[10px] text-primary font-bold uppercase'>
                  <Brain className='h-3.5 w-3.5' />
                  AI ANALYSIS (Amazon Bedrock)
                </div>
                <div className='text-[10px] text-foreground/90 leading-relaxed whitespace-pre-wrap'>
                  {dashboard.ai_summary}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </TerminalPanel>

      {/* Traces Section */}
      <div className='border-t border-border/40 pt-4'>
        <div className='flex items-center space-x-2 text-primary font-bold text-xs mb-3'>
          <Terminal className='h-3.5 w-3.5' />
          <span>LIVE TRACES</span>
        </div>

        <div className='flex gap-2 items-center mb-3'>
          <div className='relative flex-1'>
            <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground' />
            <Input value={query} onChange={e => setQuery(e.target.value)}
              placeholder='service:* | resource:api/users | status:error'
              className='h-7 pl-7 text-xs font-mono bg-[#111111] border-border/60' />
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className='h-7 text-xs font-mono bg-[#111111] border-border/60 w-[100px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='now-15m'>15m</SelectItem>
              <SelectItem value='now-1h'>1h</SelectItem>
              <SelectItem value='now-6h'>6h</SelectItem>
              <SelectItem value='now-24h'>24h</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex gap-4 text-[10px] border border-border/40 bg-[#111111] px-3 py-1.5 mb-3'>
          <span className='text-muted-foreground'>TRACES: <span className='text-[#00FF88] font-bold'>{traces.length}</span></span>
          <span className='text-muted-foreground'>ERRORS: <span className={errorCount > 0 ? 'text-red-400 font-bold' : 'text-[#00FF88] font-bold'}>{errorCount}</span></span>
          <span className='text-muted-foreground'>AVG LATENCY: <span className='text-[#00FF88] font-bold'>{avgLatency}ms</span></span>
        </div>

        <TerminalPanel title='Trace Results'>
          {tracesLoading ? (
            <div className='text-muted-foreground py-4 animate-pulse'>Querying Datadog MCP...</div>
          ) : traces.length === 0 ? (
            <div className='text-muted-foreground py-4 text-center'>No traces found.</div>
          ) : (
            <div className='space-y-px max-h-[220px] overflow-y-auto'>
              {traces.map(t => (
                <div key={t.trace_id}
                  onClick={() => setSelectedTraceId(t.trace_id === selectedTraceId ? '' : t.trace_id)}
                  className={`flex items-center gap-3 px-2 py-1 cursor-pointer hover:bg-muted/20 border-l-2 ${
                    t.status === 'error' ? 'border-l-red-400' : 'border-l-[#00FF88]/40'
                  } ${selectedTraceId === t.trace_id ? 'bg-muted/20' : ''}`}>
                  {t.status === 'error' ? <AlertTriangle className='h-3 w-3 text-red-400 shrink-0' /> : <Play className='h-3 w-3 text-[#00FF88] shrink-0' />}
                  <span className='text-muted-foreground w-[60px] shrink-0 truncate'>{t.trace_id.slice(0, 8)}</span>
                  <span className='text-primary w-[80px] shrink-0 truncate'>{t.service}</span>
                  <span className='flex-1 truncate'>{t.operation}</span>
                  <span className={`w-[50px] text-right shrink-0 ${t.duration_ms > 500 ? 'text-[#FFB020]' : 'text-muted-foreground'}`}>{t.duration_ms}ms</span>
                  <span className='text-muted-foreground w-[55px] text-right shrink-0'>
                    {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TerminalPanel>
      </div>

      {/* Span Waterfall */}
      {selectedTraceId && traceDetail && (
        <TerminalPanel title={`Spans — ${selectedTraceId.slice(0, 12)}`} collapsible>
          <div className='space-y-px max-h-[180px] overflow-y-auto'>
            {traceDetail.spans.map(span => {
              const maxDur = Math.max(...traceDetail.spans.map(s => s.duration_ms), 1)
              const widthPct = Math.max((span.duration_ms / maxDur) * 100, 2)
              return (
                <div key={span.span_id} className='flex items-center gap-2 py-0.5'>
                  <span className='w-[90px] shrink-0 truncate text-muted-foreground'>{span.service}</span>
                  <span className='w-[100px] shrink-0 truncate'>{span.name}</span>
                  <div className='flex-1 h-3 bg-muted/10 relative'>
                    <div className={`h-full ${span.status === 'error' ? 'bg-red-400/60' : 'bg-[#00FF88]/30'}`}
                      style={{ width: `${widthPct}%` }} />
                  </div>
                  <span className='w-[45px] text-right text-muted-foreground shrink-0'>{span.duration_ms}ms</span>
                </div>
              )
            })}
          </div>
          {traceDetail.deep_link_url && (
            <a href={traceDetail.deep_link_url} target='_blank' rel='noopener' className='inline-flex items-center gap-1 mt-2 text-primary hover:underline text-[10px]'>
              <ExternalLink className='h-3 w-3' /> View in Datadog
            </a>
          )}
        </TerminalPanel>
      )}
    </div>
  )
}
