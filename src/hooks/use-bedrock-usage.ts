import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface BedrockInvocation {
  timestamp: string
  model_id: string
  latency_ms: number
  input_tokens: number
  output_tokens: number
  status: string
}

export interface BedrockModelUsage {
  model_id: string
  invocation_count: number
  avg_latency_ms: number
  total_input_tokens: number
  total_output_tokens: number
}

export interface BedrockUsageResponse {
  total_invocations: number
  total_tokens: number
  avg_latency_ms: number
  error_rate: number
  models: BedrockModelUsage[]
  recent_invocations: BedrockInvocation[]
}

export function useBedrockUsage() {
  return useQuery<BedrockUsageResponse>({
    queryKey: ['bedrock-usage'],
    queryFn: async () => {
      const response = await api.get('/bedrock-usage/')
      return response.data
    },
    refetchInterval: 30000,
  })
}
