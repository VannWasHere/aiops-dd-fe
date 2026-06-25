import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface DashboardWidget {
  id: string
  title: string
  widget_type: string
  group: string
  queries: string[]
}

export interface DashboardSummaryResponse {
  dashboard_id: string
  title: string
  description: string
  url: string
  groups: string[]
  widgets: DashboardWidget[]
  ai_summary: string
}

export function useLLMDashboard() {
  return useQuery<DashboardSummaryResponse>({
    queryKey: ['dashboards', 'llm-dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboards/llm-dashboard')
      return response.data
    },
    staleTime: 60000,
  })
}
