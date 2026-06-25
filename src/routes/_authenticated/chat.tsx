import { useState, useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useChatSessions, useChatMessages } from '@/hooks/use-chat'
import { StreamingText } from '@/components/terminal/StreamingText'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Terminal, Send, Plus, Bot, User, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/chat')({
  component: ChatPage,
})

function ChatPage() {
  const { sessions, isLoading: loadingSessions, createSession } = useChatSessions()
  const [activeSessionId, setActiveSessionId] = useState<string>('')
  const { messages, sendMessage, isLoading: loadingMessages } = useChatMessages(activeSessionId)

  const [inputMessage, setInputMessage] = useState('')
  const [pendingAutoSend, setPendingAutoSend] = useState<string | null>(null)
  const [localMessages, setLocalMessages] = useState<any[]>([])
  
  // Custom streaming simulation states
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [diagnosticSteps, setDiagnosticSteps] = useState<string[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Reset streaming state on session change
  useEffect(() => {
    setIsStreaming(false)
    setStreamingContent('')
    setDiagnosticSteps([])
  }, [activeSessionId])

  // Sync with API messages
  useEffect(() => {
    if (!isStreaming) {
      setLocalMessages(messages)
    }
  }, [messages, isStreaming])

  // Extract ?q= from URL on load
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const q = searchParams.get('q')
    if (q) {
      setPendingAutoSend(q)
      // Clear query param from history
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Select first session if none selected
  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

  const hasAutoSent = useRef(false)

  // Handle auto-submit of pending query once session is active
  useEffect(() => {
    if (activeSessionId && pendingAutoSend && !loadingMessages && !hasAutoSent.current) {
      const query = pendingAutoSend
      hasAutoSent.current = true
      setPendingAutoSend(null)
      triggerSendMessage(query)
    }
  }, [activeSessionId, pendingAutoSend, loadingMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages, diagnosticSteps, streamingContent])

  const handleCreateSession = async () => {
    try {
      const sessionCount = sessions.length + 1
      const newSession = await createSession({ title: `CONSOLE SESSION #${String(sessionCount).padStart(2, '0')}` })
      setActiveSessionId(newSession.id)
      toast.success('New diagnostic console session established!')
    } catch {
      toast.error('Failed to initialize session')
    }
  }

  const triggerSendMessage = async (text: string) => {
    if (!text.trim() || !activeSessionId) return

    // 1. Add User message to local display instantly
    const userMsg = {
      id: Math.random().toString(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    }
    setLocalMessages(prev => [...prev, userMsg])
    setIsStreaming(true)
    setStreamingContent('')

    // 2. Play boot diagnostic sequence animation
    const steps = [
      '» Routing query to AI reasoning copilot...',
      '» Fetching associated service logs...',
      '» Correlating error traces and latency indexes...',
      '» Executing Bedrock diagnostics reasoning model...'
    ]
    
    setDiagnosticSteps([])
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setDiagnosticSteps(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[i]}`])
    }

    try {
      // 3. Request answer from backend API
      const result = await sendMessage({ content: text })
      
      // 4. Stream response locally
      setStreamingContent(result.content)
    } catch {
      toast.error('Failed to communicate with console agent')
      setIsStreaming(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    const text = inputMessage
    setInputMessage('')
    triggerSendMessage(text)
  }

  return (
    <div className='flex h-[calc(100vh-100px)] border border-border bg-[#090909] font-mono text-xs overflow-hidden select-none'>
      {/* Left panel: Session Registry */}
      <div className='w-64 border-r border-border flex flex-col bg-[#111111]'>
        <div className='p-3 border-b border-border flex justify-between items-center bg-[#161616]'>
          <span className='font-bold text-primary uppercase tracking-wider'>Sessions Registry</span>
          <button
            onClick={handleCreateSession}
            className='px-2 py-1 border border-primary/40 bg-primary/5 text-primary hover:bg-primary/20 cursor-pointer flex items-center space-x-1 text-[10px]'
          >
            <Plus className='h-3 w-3' />
            <span>NEW</span>
          </button>
        </div>

        <ScrollArea className='flex-grow p-2 space-y-1.5'>
          {loadingSessions ? (
            [1, 2, 3].map(i => (
              <div key={i} className='h-10 animate-pulse bg-muted/20 border border-border/40 mb-2' />
            ))
          ) : sessions.length === 0 ? (
            <div className='text-center p-4 text-[10px] text-muted-foreground'>
              No diagnostic links. Click NEW to boot session.
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = activeSessionId === session.id
              return (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full text-left px-3 py-2 border transition-colors flex items-center space-x-2 text-[10px] cursor-pointer ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border/40 hover:bg-muted/10 text-muted-foreground'
                  }`}
                >
                  <Terminal className='h-3.5 w-3.5 text-muted-foreground flex-shrink-0' />
                  <span className='truncate'>{session.title.toUpperCase()}</span>
                </button>
              )
            })
          )}
        </ScrollArea>
      </div>

      {/* Right panel: Terminal Conversation Pane */}
      <div className='flex-grow flex flex-col bg-[#090909] relative h-full'>
        {activeSessionId ? (
          <>
            {/* Message buffer */}
            <div className='flex-grow p-4 md:p-6 overflow-y-auto space-y-4 max-h-[calc(100vh-170px)] select-text selection:bg-primary/30'>
              {loadingMessages ? (
                <div className='flex flex-col items-center justify-center h-full space-y-2 text-muted-foreground'>
                  <Bot className='h-8 w-8 text-primary animate-spin' />
                  <span>Loading telemetry log database...</span>
                </div>
              ) : localMessages.length === 0 && !isStreaming ? (
                <div className='flex h-[300px] flex-col items-center justify-center text-center p-6 border border-dashed border-border/60 max-w-md mx-auto mt-12 bg-[#111111]/30'>
                  <Sparkles className='h-8 w-8 text-primary mb-2 animate-pulse' />
                  <h3 className='font-bold text-primary uppercase tracking-wider'>AI Telemetry Copilot</h3>
                  <p className='text-[10px] text-muted-foreground mt-2 leading-relaxed'>
                    Type symptoms or queries to examine metrics, search database traces, or query cluster states.
                  </p>
                </div>
              ) : (
                <div className='space-y-4 max-w-3xl mx-auto'>
                  {localMessages.map((msg) => (
                    <div key={msg.id} className='space-y-1.5 leading-relaxed'>
                      {/* Message header */}
                      <div className='flex items-center space-x-1.5 text-[10px] select-none'>
                        {msg.role === 'user' ? (
                          <>
                            <User className='h-3 w-3 text-primary' />
                            <span className='text-primary font-bold'>[USER@CONSOLE]</span>
                          </>
                        ) : (
                          <>
                            <Bot className='h-3 w-3 text-[#00FF88]' />
                            <span className='text-[#00FF88] font-bold'>[AIOPS COPILOT REASONING AGENT]</span>
                          </>
                        )}
                        <span className='text-muted-foreground'>•</span>
                        <span className='text-muted-foreground'>{new Date(msg.created_at).toLocaleTimeString()}</span>
                      </div>

                      {/* Message text */}
                      <div className={`p-3 border font-mono whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-[#111111]/80 border-primary/20 text-[#E6EDF3]'
                          : 'bg-[#161616]/40 border-border text-[#00FF88]'
                      }`}>
                        {msg.role === 'user' ? '> ' : ''}{msg.content}
                      </div>
                    </div>
                  ))}

                  {/* Streaming logs sequence if active */}
                  {isStreaming && (
                    <div className='space-y-3'>
                      {/* Diagnostic boots */}
                      {diagnosticSteps.map((step, idx) => (
                        <div key={idx} className='text-muted-foreground text-[10px] font-mono leading-none'>
                          {step}
                        </div>
                      ))}

                      {/* Streaming AI text block */}
                      {streamingContent && (
                        <div className='space-y-1.5'>
                          <div className='flex items-center space-x-1.5 text-[10px] select-none'>
                            <Bot className='h-3 w-3 text-[#00FF88]' />
                            <span className='text-[#00FF88] font-bold'>[AIOPS COPILOT REASONING AGENT]</span>
                            <span className='text-muted-foreground'>•</span>
                            <span className='text-muted-foreground'>STREAMING</span>
                          </div>
                          <div className='p-3 border bg-[#161616]/40 border-border text-[#00FF88] font-mono whitespace-pre-wrap'>
                            <StreamingText 
                              text={streamingContent} 
                              onComplete={() => setIsStreaming(false)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className='p-3 border-t border-border bg-[#111111] sticky bottom-0 w-full'>
              <form onSubmit={handleSubmit} className='flex items-center space-x-2 max-w-3xl mx-auto'>
                <span className='text-primary font-bold select-none'>&gt;</span>
                <Input
                  placeholder='Type a command or describe symptoms...'
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className='flex-grow focus-visible:ring-1 border-border/80 focus:border-primary placeholder-muted-foreground bg-[#161616]'
                  disabled={isStreaming}
                  autoComplete='off'
                  spellCheck='false'
                />
                <button 
                  type='submit' 
                  disabled={!inputMessage.trim() || isStreaming}
                  className='p-2 border border-primary/40 bg-primary/5 text-primary hover:bg-primary/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center'
                >
                  <Send className='h-3.5 w-3.5' />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className='flex-grow flex flex-col items-center justify-center text-center p-8 bg-[#090909] text-muted-foreground'>
            <Terminal className='h-12 w-12 text-muted-foreground mb-4 animate-pulse' />
            <h3 className='text-primary font-bold uppercase tracking-wider'>No diagnostic session active</h3>
            <p className='text-[10px] mt-2 max-w-xs leading-normal'>
              Select an active debug session on the left console panel, or boot a new session to begin.
            </p>
            <button 
              onClick={handleCreateSession} 
              className='mt-4 px-3 py-1.5 border border-primary/55 bg-primary/10 text-primary hover:bg-primary/25 cursor-pointer font-bold uppercase'
            >
              Start Session
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
