import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface NodeInfo {
  id: string
  label: string
  type: string // service, database, cache, external
  status: string // operational, degraded, offline
}

interface EdgeInfo {
  source: string
  target: string
}

interface DependencyGraphResponse {
  nodes: NodeInfo[]
  edges: EdgeInfo[]
  status_info: string
}

interface SpanEntry {
  id: string
  service: string
  operation: string
  status: string
  latency_ms: number
  http_status: string
}

interface SpansResponse {
  spans: SpanEntry[]
  status_info: string
}

export function TraceViewer() {
  const { data: graphData, isLoading: loadingGraph } = useQuery<DependencyGraphResponse>({
    queryKey: ['system_dependencies'],
    queryFn: async () => {
      const resp = await api.get('/test/dependencies')
      return resp.data
    },
    refetchInterval: 10000,
  })

  const { data: spansData, isLoading: loadingSpans } = useQuery<SpansResponse>({
    queryKey: ['transaction_spans'],
    queryFn: async () => {
      const resp = await api.get('/test/spans')
      return resp.data
    },
    refetchInterval: 5000,
  })

  const getCoords = (nodeId: string, idx: number) => {
    const coordsMap: Record<string, { x: number; y: number }> = {
      'gateway-api': { x: 50, y: 75 },
      'checkout-api': { x: 170, y: 35 },
      'payment-api': { x: 170, y: 115 },
      'inventory-api': { x: 290, y: 35 },
      'redis-cache': { x: 290, y: 115 },
      'postgres-db': { x: 410, y: 75 },
      'stripe-gateway': { x: 410, y: 145 },
    }
    return coordsMap[nodeId] || { x: 100 + (idx * 60) % 250, y: 40 + (idx * 30) % 110 }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return '#00FF88' // Green
      case 'degraded':
        return '#FFB020' // Orange/Yellow
      case 'offline':
        return '#FF5555' // Red
      default:
        return '#7D8590' // Gray
    }
  }

  const getStatusTextClass = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-[#00FF88]'
      case 'degraded':
        return 'text-[#FFB020] font-bold'
      case 'offline':
        return 'text-[#FF5555] font-extrabold animate-pulse'
      default:
        return 'text-muted-foreground'
    }
  }

  const nodes = graphData?.nodes || []
  const edges = graphData?.edges || []
  const spans = spansData?.spans || []

  return (
    <div className='font-mono text-[10px] bg-[#111111] p-3 border border-border/40 select-none'>
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-flow-line {
          stroke-dasharray: 4, 4;
          animation: dash 1.5s linear infinite;
        }
        .node-glow {
          filter: drop-shadow(0 0 4px currentColor);
        }
      `}</style>

      <div className='flex items-center justify-between mb-3'>
        <div className='text-primary font-bold uppercase tracking-wider'>System Dependency Graph</div>
        <div className='text-[8px] text-muted-foreground uppercase'>
          {graphData?.status_info ? `Mode: ${graphData.status_info}` : 'Loading...'}
        </div>
      </div>

      {/* SVG Architecture Flow Chart */}
      <div className='w-full bg-[#090909] border border-border/20 rounded relative py-1 overflow-x-auto no-scrollbar'>
        {loadingGraph ? (
          <div className='h-40 flex items-center justify-center text-muted-foreground'>
            <div className='animate-pulse'>Fetching system architecture topology...</div>
          </div>
        ) : (
          <svg viewBox='0 0 480 180' className='w-full min-w-[450px] h-40 block'>
            <defs>
              <marker
                id='arrow'
                viewBox='0 0 10 10'
                refX='8'
                refY='5'
                markerWidth='6'
                markerHeight='6'
                orient='auto-start-reverse'
              >
                <path d='M 0 1.5 L 8 5 L 0 8.5 z' fill='#333333' />
              </marker>
            </defs>

            {/* Connection Lines (Edges) */}
            {edges.map((edge, idx) => {
              const fromPt = getCoords(edge.source, idx)
              const toPt = getCoords(edge.target, idx)
              const targetNode = nodes.find(n => n.id === edge.target)
              const statusColor = getStatusColor(targetNode?.status || 'operational')
              
              return (
                <path
                  key={`edge-${idx}`}
                  d={`M ${fromPt.x} ${fromPt.y} L ${toPt.x} ${toPt.y}`}
                  stroke={targetNode?.status === 'degraded' || targetNode?.status === 'offline' ? statusColor : '#222222'}
                  strokeWidth='1.2'
                  fill='none'
                  markerEnd='url(#arrow)'
                  className={targetNode?.status === 'degraded' || targetNode?.status === 'offline' ? 'animate-flow-line' : ''}
                />
              )
            })}

            {/* Service Nodes */}
            {nodes.map((node, idx) => {
              const pt = getCoords(node.id, idx)
              const statusColor = getStatusColor(node.status)
              
              return (
                <g key={node.id} className='cursor-pointer group'>
                  {/* Node Background with glow */}
                  <rect
                    x={pt.x - 38}
                    y={pt.y - 12}
                    width='76'
                    height='24'
                    rx='4'
                    fill='#141414'
                    stroke={statusColor}
                    strokeWidth='1.2'
                    className='node-glow transition-all duration-300 group-hover:fill-[#1b1b1b]'
                    style={{ color: statusColor }}
                  />

                  {/* Service Label */}
                  <text
                    x={pt.x}
                    y={pt.y + 1}
                    textAnchor='middle'
                    fill='#E6EDF3'
                    fontSize='8'
                    fontFamily='monospace'
                    fontWeight='bold'
                    className='pointer-events-none'
                  >
                    {node.label}
                  </text>

                  {/* Status Indicator Dot */}
                  <circle
                    cx={pt.x - 30}
                    cy={pt.y}
                    r='2.5'
                    fill={statusColor}
                    className={node.status === 'offline' ? 'animate-ping' : ''}
                  />
                  {node.status === 'offline' && (
                    <circle cx={pt.x - 30} cy={pt.y} r='2.5' fill={statusColor} />
                  )}
                </g>
              )
            })}
          </svg>
        )}
      </div>

      <div className='border-t border-border/30 mt-3 pt-3'>
        <div className='flex items-center justify-between mb-2'>
          <div className='text-[9px] text-muted-foreground uppercase tracking-wider'>Active Transaction Spans</div>
          <div className='text-[8px] text-muted-foreground uppercase'>
            {spansData?.status_info ? `Telemetry: ${spansData.status_info}` : ''}
          </div>
        </div>
        
        {loadingSpans ? (
          <div className='space-y-1.5 py-2 animate-pulse'>
            <div className='h-4 bg-muted/10 rounded w-full' />
            <div className='h-4 bg-muted/10 rounded w-full' />
            <div className='h-4 bg-muted/10 rounded w-full' />
          </div>
        ) : spans.length === 0 ? (
          <div className='text-muted-foreground text-center py-2'>
            No active span pipelines recorded.
          </div>
        ) : (
          <div className='space-y-1.5'>
            {spans.map((span) => {
              const statusColor = getStatusColor(span.status)
              const textClass = getStatusTextClass(span.status)
              
              return (
                <div key={span.id} className='flex items-center justify-between text-foreground py-0.5 hover:bg-white/5 px-1 rounded transition-colors duration-150'>
                  <div className='flex items-center space-x-1.5'>
                    <span style={{ color: statusColor }}>●</span>
                    <span className='text-[#8B949E]'>[{span.service}]</span>
                    <span>{span.operation}</span>
                  </div>
                  <span className={`${textClass} font-semibold`}>
                    {span.http_status} ({span.latency_ms}ms)
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
