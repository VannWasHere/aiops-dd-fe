import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface TraceSummary {
  trace_id: string
  service: string
  operation: string
  resource: string
  timestamp: string
  duration_ms: number
  status: 'ok' | 'error'
  span_count: number
}

export interface TracesListResponse {
  traces: TraceSummary[]
  status_info: string
}

export interface TraceSpan {
  span_id: string
  parent_id: string
  service: string
  name: string
  resource: string
  start_time: string
  end_time: string
  duration_ms: number
  status: 'ok' | 'error'
  meta: Record<string, any>
}

export interface TraceDetailResponse {
  trace_id: string
  deep_link_url?: string
  spans: TraceSpan[]
  status_info: string
}

export function useTraces(query = 'service:*', fromTime = 'now-1h') {
  return useQuery<TracesListResponse>({
    queryKey: ['traces', query, fromTime],
    queryFn: async () => {
      const response = await api.get('/traces/', {
        params: { query, from_time: fromTime },
      })
      return response.data
    },
    refetchInterval: 20000, // 20s auto-refresh
  })
}

export function useTraceDetail(traceId: string) {
  return useQuery<TraceDetailResponse>({
    queryKey: ['traces', 'detail', traceId],
    queryFn: async () => {
      const response = await api.get(`/traces/${traceId}`)
      return response.data
    },
    enabled: !!traceId,
  })
}
