import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Service } from './use-services'

export interface InvestigationTimeline {
  id: string
  investigation_id: string
  event_time: string
  title: string
  description: string
}

export interface Recommendation {
  id: string
  investigation_id: string
  title: string
  description: string
  priority: 'High' | 'Medium' | 'Low' | string
}

export interface Evidence {
  id: string
  investigation_id: string
  source: string
  details: string
}

export interface Investigation {
  id: string
  service_id: string
  title: string
  question: string
  status: string
  summary?: string
  root_cause?: string
  created_at: string
  updated_at: string
}

export interface DetailedInvestigation extends Investigation {
  service?: Service
  timeline: InvestigationTimeline[]
  recommendations: Recommendation[]
  evidence: Evidence[]
}

export interface InvestigationCreate {
  title: string
  question: string
  service_id: string
}

export function useInvestigations() {
  const queryClient = useQueryClient()

  const investigationsQuery = useQuery<Investigation[]>({
    queryKey: ['investigations'],
    queryFn: async () => {
      const response = await api.get('/investigations/')
      return response.data
    },
  })

  const createInvestigationMutation = useMutation<DetailedInvestigation, Error, InvestigationCreate>({
    mutationFn: async (newInvestigation) => {
      const response = await api.post('/investigations/', newInvestigation)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investigations'] })
    },
  })

  const deleteInvestigationMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/investigations/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investigations'] })
    },
  })

  return {
    investigations: investigationsQuery.data ?? [],
    isLoading: investigationsQuery.isLoading,
    isError: investigationsQuery.isError,
    error: investigationsQuery.error,
    refetch: investigationsQuery.refetch,
    createInvestigation: createInvestigationMutation.mutateAsync,
    isCreating: createInvestigationMutation.isPending,
    deleteInvestigation: deleteInvestigationMutation.mutateAsync,
    isDeleting: deleteInvestigationMutation.isPending,
  }
}

export function useInvestigation(id: string) {
  return useQuery<DetailedInvestigation>({
    queryKey: ['investigations', id],
    queryFn: async () => {
      const response = await api.get(`/investigations/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}
