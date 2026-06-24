import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface ChatSession {
  id: string
  title: string
  created_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system' | string
  content: string
  created_at: string
}

export function useChatSessions() {
  const queryClient = useQueryClient()

  const sessionsQuery = useQuery<ChatSession[]>({
    queryKey: ['chat_sessions'],
    queryFn: async () => {
      const response = await api.get('/chat/sessions')
      return response.data
    },
  })

  const createSessionMutation = useMutation<ChatSession, Error, { title: string }>({
    mutationFn: async (data) => {
      const response = await api.post('/chat/sessions', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_sessions'] })
    },
  })

  return {
    sessions: sessionsQuery.data ?? [],
    isLoading: sessionsQuery.isLoading,
    isError: sessionsQuery.isError,
    createSession: createSessionMutation.mutateAsync,
    isCreating: createSessionMutation.isPending,
  }
}

export function useChatMessages(sessionId: string) {
  const queryClient = useQueryClient()

  const messagesQuery = useQuery<ChatMessage[]>({
    queryKey: ['chat_messages', sessionId],
    queryFn: async () => {
      const response = await api.get(`/chat/sessions/${sessionId}/messages`)
      return response.data
    },
    enabled: !!sessionId,
  })

  const sendMessageMutation = useMutation<ChatMessage, Error, { content: string }>({
    mutationFn: async (data) => {
      const response = await api.post(`/chat/sessions/${sessionId}/messages`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_messages', sessionId] })
    },
  })

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
  }
}
