import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Service {
  id: string
  name: string
  description?: string
  environment: string
  owner: string
  status: string
  created_at: string
  updated_at: string
}

export type ServiceCreate = Omit<Service, 'id' | 'created_at' | 'updated_at'>
export type ServiceUpdate = Partial<ServiceCreate>

export function useServices() {
  const queryClient = useQueryClient()

  const servicesQuery = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await api.get('/services/')
      return response.data
    },
  })

  const createServiceMutation = useMutation<Service, Error, ServiceCreate>({
    mutationFn: async (newService) => {
      const response = await api.post('/services/', newService)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  const updateServiceMutation = useMutation<
    Service,
    Error,
    { id: string; data: ServiceUpdate }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/services/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['services', variables.id] })
    },
  })

  const deleteServiceMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/services/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })

  return {
    services: servicesQuery.data ?? [],
    isLoading: servicesQuery.isLoading,
    isError: servicesQuery.isError,
    error: servicesQuery.error,
    refetch: servicesQuery.refetch,
    createService: createServiceMutation.mutateAsync,
    isCreating: createServiceMutation.isPending,
    updateService: updateServiceMutation.mutateAsync,
    isUpdating: updateServiceMutation.isPending,
    deleteService: deleteServiceMutation.mutateAsync,
    isDeleting: deleteServiceMutation.isPending,
  }
}

export function useService(id: string) {
  return useQuery<Service>({
    queryKey: ['services', id],
    queryFn: async () => {
      const response = await api.get(`/services/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}
