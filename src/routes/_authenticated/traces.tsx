import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTraces, useTraceDetail, TraceSummary, TraceSpan } from '@/hooks/use-traces'
import { TerminalPanel } from '@/components/terminal/TerminalPanel'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ExternalLink, Terminal, AlertTriangle, Play, HelpCircle } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/traces')({
  component: TracesPage,
})

interface SpanNode extends TraceSpan {
  depth: number
  children: SpanNode[]
}

function buildSpanTree(spans: TraceSpan[]): SpanNode[] {
  const nodeMap: Record<string, SpanNode> = {}
  
  // Initialize nodes
  spans.forEach(span => {
    nodeMap[span.span_id] = {
      ...span,
      depth: 0,
      children: []
    }
  })
  
  const roots: SpanNode[] = []
  
  // Link children
  spans.forEach(span => {
    const node = nodeMap[span.span_id]
    const parentId = span.parent_id
    if (parentId && parentId !== '0' && nodeMap[parentId]) {
      nodeMap[parentId].children.push(node)
    } else {
      roots.push(node)
    }
  })
  
  // Recursively calculate depth
  function setDepth(node: SpanNode, currentDepth: number) {
    node.depth = currentDepth
    node.children.forEach(child => setDepth(child, currentDepth + 1))
  }
  
  roots.forEach(root => setDepth(root, 0))
  
  // Flatten tree hierarchically
  const flatList: SpanNode[] = []
  function traverse(node: SpanNode) {
    flatList.push(node)
    // Sort children by start time
    node.children.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    node.children.forEach(traverse)
  }
  
  roots.forEach(traverse)
  return flatList
}

function TracesPage() {
  const [searchQuery, setSearchQuery] = useState('service:*')
  const [activeQuery, setActiveQuery] = useState('service:*')
  const [timeRange, setTimeRange] = useState('now-1h')
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null)
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null)

  // Fetch traces list
  const { data: tracesData, isLoading: loadingList, isError: listError } = useTraces(activeQuery, timeRange)

  // Fetch trace detail
  const { data: detailData, isLoading: loadingDetail, isError: detailError } = useTraceDetail(selectedTraceId || '')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveQuery(searchQuery)
  }

  const getStatusColor = (status: string) => {
    return status === 'error' ? '#FF5555' : '#00FF88'
  }

  const getStatusBgClass = (status: string) => {
    return status === 'error' 
      ? 'text-[#FF5555] border-[#FF5555]/20 bg-[#FF5555]/5' 
      : 'text-[#00FF88] border-[#00FF88]/20 bg-[#00FF88]/5'
  }

  // Format ISO timestamp to hh:mm:ss.SSS
  const formatTime = (isoString: string) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      const pad = (n: number) => String(n).padStart(2, '0')
      const ms = String(d.getMilliseconds()).padStart(3, '0')
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`
    } catch {
      return isoString
    }
  }

  // Calculate timeline details for waterfall
  const spans = detailData?.spans || []
  let traceStartMs = 0
  let traceDurationMs = 0
  let spanNodes: SpanNode[] = []

  if (spans.length > 0) {
    spanNodes = buildSpanTree(spans)
    
    const times = spans.map(s => new Date(s.start_time).getTime())
    traceStartMs = Math.min(...times)
    
    const endTimes = spans.map(s => new Date(s.start_time).getTime() + s.duration_ms)
    const traceEndMs = Math.max(...endTimes)
    
    traceDurationMs = traceEndMs - traceStartMs
    if (traceDurationMs <= 0) traceDurationMs = 1
  }

  const selectedSpan = spans.find(s => s.span_id === selectedSpanId)

  return (
    <div className='space-y-6 font-mono text-xs text-foreground'>
      {/* Title block */}
      <div className='border-b border-border/60 pb-4 mb-4 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0'>
        <div>
          <div className='flex items-center space-x-2 text-primary font-bold mb-1 text-sm'>
            <Terminal className='h-4 w-4 text-primary animate-pulse' />
            <span>DATADOG APM TRACE MONITOR</span>
          </div>
          <p className='text-muted-foreground text-[10px]'>
            Inspect real-time service transaction traces, operations, parent-child span hierarchies, and latencies from Datadog APM.
          </p>
        </div>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleSearchSubmit} className='flex flex-wrap items-center gap-3 bg-[#111111] p-3 border border-border/40'>
        <div className='flex-1 min-w-[200px] flex items-center relative'>
          <Search className='absolute left-3 h-3.5 w-3.5 text-muted-foreground' />
          <Input 
            placeholder='Filter spans e.g. service:urllib3 status:error' 
            className='pl-9 border-border/85 focus:border-primary placeholder-muted-foreground bg-[#090909] text-xs h-8'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className='w-32'>
          <Select value={timeRange} onValueChange={(val) => setTimeRange(val)}>
            <SelectTrigger className='border-border/85 bg-[#090909] text-xs h-8'>
              <SelectValue placeholder='Time Range' />
            </SelectTrigger>
            <SelectContent className='bg-[#111111] border-border text-xs'>
              <SelectItem value='now-15m'>Last 15 min</SelectItem>
              <SelectItem value='now-1h'>Last 1 hour</SelectItem>
              <SelectItem value='now-4h'>Last 4 hours</SelectItem>
              <SelectItem value='now-24h'>Last 24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button 
          type='submit'
          className='px-4 py-1.5 border border-primary/55 bg-primary/10 text-primary hover:bg-primary/25 cursor-pointer font-bold uppercase flex items-center space-x-1.5 text-[10px] h-8'
        >
          <Play className='h-3 w-3 fill-current' />
          <span>QUERY MCP</span>
        </button>
      </form>

      {/* Main Split Interface */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
        {/* Left column: List of traces */}
        <div className='lg:col-span-5'>
          <TerminalPanel title='Trace Summaries' className='h-full min-h-[500px]'>
            {loadingList ? (
              <div className='h-[400px] flex flex-col items-center justify-center text-muted-foreground space-y-2'>
                <div className='animate-pulse text-primary font-bold'>INITIALIZING CONNECTION TO MCP...</div>
                <div className='text-[10px] text-muted-foreground'>Requesting spans matching '{activeQuery}'</div>
              </div>
            ) : listError ? (
              <div className='h-[400px] flex flex-col items-center justify-center text-[#FF5555] p-4 text-center border border-dashed border-[#FF5555]/30 bg-[#FF5555]/5'>
                <AlertTriangle className='h-8 w-8 mb-2' />
                <div className='font-bold uppercase'>MCP Query Failure</div>
                <p className='text-[10px] mt-2 max-w-xs text-muted-foreground'>
                  Ensure Datadog keys are correctly configured and the MCP gateway is online.
                </p>
              </div>
            ) : !tracesData?.traces || tracesData.traces.length === 0 ? (
              <div className='h-[400px] flex flex-col items-center justify-center text-muted-foreground text-center border border-dashed border-border/40 bg-[#111111]/10 p-8'>
                <HelpCircle className='h-8 w-8 mb-2 text-muted-foreground/60' />
                <h3 className='font-bold uppercase tracking-wider text-primary'>No trace data recorded</h3>
                <p className='text-[10px] text-muted-foreground mt-2 max-w-xs'>
                  No APM spans matched your query in the selected timeframe. Try modifying the query filters.
                </p>
              </div>
            ) : (
              <div className='space-y-2 max-h-[600px] overflow-y-auto pr-1 no-scrollbar'>
                {tracesData.traces.map((trace: TraceSummary) => {
                  const isSelected = trace.trace_id === selectedTraceId
                  const durationColor = trace.duration_ms > 500 ? 'text-[#FFB020]' : 'text-foreground'
                  const startStr = formatTime(trace.timestamp)

                  return (
                    <div 
                      key={trace.trace_id}
                      onClick={() => {
                        setSelectedTraceId(trace.trace_id)
                        setSelectedSpanId(null) // Reset span selection
                      }}
                      className={`p-2.5 border cursor-pointer transition-all duration-150 relative ${
                        isSelected 
                          ? 'border-primary bg-primary/5 text-foreground' 
                          : 'border-border/45 bg-[#111111] hover:border-border/80 hover:bg-[#161616]'
                      }`}
                    >
                      {/* Badge / Status Indicator */}
                      <div className='flex items-center justify-between mb-1.5'>
                        <span className='text-[9px] text-muted-foreground font-semibold uppercase tracking-wider'>
                          ID: {trace.trace_id.slice(0, 8)}...{trace.trace_id.slice(-8)}
                        </span>
                        <span className={`px-1.5 py-0.5 border text-[8px] font-bold ${getStatusBgClass(trace.status)}`}>
                          {trace.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Service / Operation */}
                      <div className='text-[11px] font-bold text-foreground mb-1 flex items-center gap-1.5'>
                        <span className='text-[#8B949E]'>[{trace.service}]</span>
                        <span className='truncate'>{trace.operation}</span>
                      </div>

                      {/* Resource / Resource Path */}
                      <div className='text-[9px] text-muted-foreground truncate mb-2 max-w-[95%]'>
                        {trace.resource}
                      </div>

                      {/* Footer: duration / timestamp */}
                      <div className='flex justify-between items-center text-[9px] border-t border-border/30 pt-1.5 mt-1.5 text-muted-foreground'>
                        <div>TIME: <span className='text-foreground'>{startStr}</span></div>
                        <div>
                          LAT: <span className={`font-semibold ${durationColor}`}>{trace.duration_ms.toFixed(1)}ms</span>
                          <span className='ml-2 text-muted-foreground/60'>({trace.span_count} spans)</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TerminalPanel>
        </div>

        {/* Right column: Trace Detail and Spans Waterfall */}
        <div className='lg:col-span-7'>
          <TerminalPanel 
            title={selectedTraceId ? `Trace Inspector: ${selectedTraceId.slice(0, 16)}...` : 'Trace Details'}
            className='h-full min-h-[500px]'
            rightElement={
              detailData?.deep_link_url && (
                <a 
                  href={detailData.deep_link_url} 
                  target='_blank' 
                  rel='noopener noreferrer'
                  className='px-2 py-0.5 border border-primary/45 bg-[#161616] text-[#58A6FF] hover:border-primary hover:text-primary text-[9px] font-bold flex items-center space-x-1 cursor-pointer transition-colors duration-150'
                >
                  <ExternalLink className='h-3 w-3' />
                  <span>OPEN IN DATADOG</span>
                </a>
              )
            }
          >
            {!selectedTraceId ? (
              <div className='h-[450px] flex flex-col items-center justify-center text-muted-foreground text-center p-8'>
                <Terminal className='h-10 w-10 text-muted-foreground/30 mb-3 animate-pulse' />
                <h3 className='font-bold uppercase tracking-wider text-muted-foreground/80'>Trace Inspector Idle</h3>
                <p className='text-[10px] text-muted-foreground mt-2 max-w-xs'>
                  Select a transaction trace from the left summary panel to decode span dependencies and timeline offsets.
                </p>
              </div>
            ) : loadingDetail ? (
              <div className='h-[450px] flex flex-col items-center justify-center text-muted-foreground space-y-2'>
                <div className='animate-pulse text-primary font-bold'>FETCHING TRACE FLAMEGRAPH...</div>
                <div className='text-[10px] text-muted-foreground'>Requesting trace {selectedTraceId} via Datadog MCP</div>
              </div>
            ) : detailError ? (
              <div className='h-[450px] flex flex-col items-center justify-center text-[#FF5555] p-4 text-center border border-dashed border-[#FF5555]/30 bg-[#FF5555]/5'>
                <AlertTriangle className='h-8 w-8 mb-2' />
                <div className='font-bold uppercase'>Detail Retrieval Failure</div>
                <p className='text-[10px] mt-2 max-w-xs text-muted-foreground'>
                  Failed to fetch full span tree from Datadog. The trace might have expired or the ID is invalid.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Waterfall Flamegraph Panel */}
                <div className='border border-border/40 bg-[#090909] p-3 rounded'>
                  <div className='flex justify-between items-center text-[10px] text-muted-foreground border-b border-border/20 pb-2 mb-3'>
                    <div>SPAN WATERFALL TIMELINE</div>
                    <div>TRACE DURATION: <span className='text-foreground font-semibold'>{traceDurationMs.toFixed(1)}ms</span></div>
                  </div>

                  {/* Flamegraph Spans */}
                  <div className='space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar'>
                    {spanNodes.map((node: SpanNode) => {
                      const isSelected = node.span_id === selectedSpanId
                      const nodeStartMs = new Date(node.start_time).getTime()
                      const offsetMs = nodeStartMs - traceStartMs
                      
                      // Percentages for timeline rendering
                      const leftPct = (offsetMs / traceDurationMs) * 100
                      const widthPct = (node.duration_ms / traceDurationMs) * 100
                      
                      // Clamped range
                      const safeLeft = Math.max(0, Math.min(99.5, leftPct))
                      const safeWidth = Math.max(0.5, Math.min(100 - safeLeft, widthPct))

                      // Status styles
                      const statusColor = getStatusColor(node.status)

                      // Tree lines
                      const treePrefix = '  '.repeat(node.depth) + (node.depth > 0 ? '└─ ' : '')

                      return (
                        <div 
                          key={node.span_id}
                          onClick={() => setSelectedSpanId(node.span_id)}
                          className={`grid grid-cols-12 gap-3 py-1 px-1.5 cursor-pointer rounded transition-all duration-150 ${
                            isSelected 
                              ? 'bg-primary/10 border border-primary/30' 
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          {/* Span labels */}
                          <div className='col-span-6 truncate font-mono text-[10px]'>
                            <div className='truncate flex items-center space-x-1'>
                              <span className='text-muted-foreground/60 whitespace-pre'>{treePrefix}</span>
                              <span className='font-bold text-foreground truncate'>
                                {node.service}
                              </span>
                              <span className='text-muted-foreground truncate'>
                                - {node.name}
                              </span>
                            </div>
                          </div>

                          {/* Span timeline bar */}
                          <div className='col-span-6 flex items-center relative h-4 bg-muted/10 border border-border/10'>
                            <div 
                              className='absolute h-2.5 opacity-85 hover:opacity-100 transition-opacity'
                              style={{ 
                                left: `${safeLeft}%`, 
                                width: `${safeWidth}%`,
                                backgroundColor: statusColor
                              }}
                            />
                            {/* Duration label overlaid if room, or next to it */}
                            <span 
                              className='absolute text-[8px] text-muted-foreground font-semibold select-none pointer-events-none'
                              style={{ 
                                left: `${safeLeft + safeWidth + 2}%`,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {node.duration_ms.toFixed(1)}ms
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Selected Span Metadata Panel */}
                <div className='border border-border/40 bg-[#111111] p-3'>
                  <div className='text-[10px] text-primary font-bold uppercase tracking-wider mb-2 pb-1.5 border-b border-border/20'>
                    {selectedSpan ? 'Selected Span Details' : 'Select a span in the waterfall to inspect tags'}
                  </div>

                  {selectedSpan ? (
                    <div className='space-y-2 text-[10px] leading-relaxed select-text'>
                      <div className='grid grid-cols-4 gap-2'>
                        <div className='col-span-1 text-muted-foreground'>SPAN ID:</div>
                        <div className='col-span-3 text-foreground font-bold'>{selectedSpan.span_id}</div>
                      </div>
                      <div className='grid grid-cols-4 gap-2'>
                        <div className='col-span-1 text-muted-foreground'>PARENT ID:</div>
                        <div className='col-span-3 text-foreground'>{selectedSpan.parent_id === '0' ? 'ROOT (0)' : selectedSpan.parent_id}</div>
                      </div>
                      <div className='grid grid-cols-4 gap-2'>
                        <div className='col-span-1 text-muted-foreground'>SERVICE:</div>
                        <div className='col-span-3 text-[#E6EDF3] font-bold'>{selectedSpan.service}</div>
                      </div>
                      <div className='grid grid-cols-4 gap-2'>
                        <div className='col-span-1 text-muted-foreground'>OPERATION:</div>
                        <div className='col-span-3 text-foreground'>{selectedSpan.name}</div>
                      </div>
                      <div className='grid grid-cols-4 gap-2'>
                        <div className='col-span-1 text-muted-foreground'>RESOURCE:</div>
                        <div className='col-span-3 text-muted-foreground truncate' title={selectedSpan.resource}>
                          {selectedSpan.resource}
                        </div>
                      </div>
                      <div className='grid grid-cols-4 gap-2'>
                        <div className='col-span-1 text-muted-foreground'>START TIME:</div>
                        <div className='col-span-3 text-foreground'>{formatTime(selectedSpan.start_time)}</div>
                      </div>
                      <div className='grid grid-cols-4 gap-2'>
                        <div className='col-span-1 text-muted-foreground'>DURATION:</div>
                        <div className='col-span-3 text-foreground font-semibold'>{selectedSpan.duration_ms.toFixed(3)} ms</div>
                      </div>
                      <div className='grid grid-cols-4 gap-2'>
                        <div className='col-span-1 text-muted-foreground'>STATUS:</div>
                        <div className='col-span-3'>
                          <span className={`px-1 py-0.5 border text-[8px] font-bold ${getStatusBgClass(selectedSpan.status)}`}>
                            {selectedSpan.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Meta Tags */}
                      {Object.keys(selectedSpan.meta).length > 0 && (
                        <div className='border-t border-border/30 pt-2 mt-2'>
                          <div className='text-muted-foreground font-semibold mb-1'>METADATA TAGS:</div>
                          <div className='bg-[#090909] p-2 max-h-[150px] overflow-y-auto border border-border/20 rounded no-scrollbar font-mono text-[9px] text-muted-foreground'>
                            {Object.entries(selectedSpan.meta).map(([key, val]) => (
                              <div key={key} className='flex py-0.5 hover:bg-white/5 px-1'>
                                <span className='text-primary font-semibold mr-1.5 min-w-[120px]'>{key}:</span>
                                <span className='text-[#E6EDF3] select-text break-all'>{String(val)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='text-muted-foreground text-[10px] py-4 text-center select-none'>
                      Click on any span row in the timeline waterfall chart above to inspect its HTTP tags, execution details, and resource endpoints.
                    </div>
                  )}
                </div>
              </div>
            )}
          </TerminalPanel>
        </div>
      </div>
    </div>
  )
}
