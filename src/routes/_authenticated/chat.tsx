import { useState, useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useChatSessions, useChatMessages } from '@/hooks/use-chat'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { MessageSquare, Send, Plus, Bot, User, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/chat')({
  component: ChatPage,
})

function ChatPage() {
  const { sessions, isLoading: loadingSessions, createSession } = useChatSessions()
  const [activeSessionId, setActiveSessionId] = useState<string>('')
  const { messages, sendMessage, isLoading: loadingMessages } = useChatMessages(activeSessionId)

  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages load or update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Select first session if none is selected
  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

  const handleCreateSession = async () => {
    try {
      const sessionCount = sessions.length + 1
      const newSession = await createSession({ title: `Incident Session #${sessionCount}` })
      setActiveSessionId(newSession.id)
      toast.success('New debugging chat session created!')
    } catch {
      toast.error('Failed to create session')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !activeSessionId) return

    const msgText = inputMessage
    setInputMessage('')
    
    try {
      await sendMessage({ content: msgText })
    } catch {
      toast.error('Failed to send message')
    }
  }

  return (
    <>
      {/* ===== Header ===== */}
      <Header>
        <div className='flex items-center space-x-2'>
          <MessageSquare className='h-6 w-6 text-primary' />
          <span className='text-xl font-bold tracking-tight'>Cable3 Ops / AI Copilot</span>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main Chat UI ===== */}
      <Main fixed className='flex h-[calc(100vh-65px)] overflow-hidden p-0'>
        {/* Left Panel: Sessions */}
        <div className='w-80 border-r flex flex-col bg-muted/20'>
          <div className='p-4 border-b flex justify-between items-center'>
            <span className='font-semibold text-sm'>Debugging Sessions</span>
            <Button size='sm' variant='outline' onClick={handleCreateSession}>
              <Plus className='h-4 w-4 mr-1.5' />
              New
            </Button>
          </div>
          <ScrollArea className='flex-grow p-2 space-y-1.5'>
            {loadingSessions ? (
              [1, 2, 3].map(i => (
                <div key={i} className='h-12 animate-pulse bg-muted rounded-md mb-2' />
              ))
            ) : sessions.length === 0 ? (
              <div className='text-center p-6 text-xs text-muted-foreground'>
                No active sessions. Click 'New' to start.
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full text-left p-3 rounded-md text-sm transition-all duration-200 border flex items-center space-x-2.5 ${
                    activeSessionId === session.id
                      ? 'bg-primary/10 text-primary border-primary/25 font-semibold'
                      : 'hover:bg-muted/80 bg-card border-border/40 text-foreground/80'
                  }`}
                >
                  <MessageSquare className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                  <span className='truncate'>{session.title}</span>
                </button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Right Panel: Chat interface */}
        <div className='flex-grow flex flex-col bg-card relative'>
          {activeSessionId ? (
            <>
              {/* Messages Pane */}
              <ScrollArea className='flex-grow p-6 space-y-4 h-[calc(100vh-180px)]'>
                {loadingMessages ? (
                  <div className='flex items-center justify-center h-full'>
                    <Bot className='h-8 w-8 text-primary animate-bounce' />
                  </div>
                ) : messages.length === 0 ? (
                  <div className='flex h-[350px] flex-col items-center justify-center text-center p-6 border border-dashed rounded-lg max-w-lg mx-auto mt-12 bg-muted/10'>
                    <Sparkles className='h-10 w-10 text-primary mb-3 animate-pulse' />
                    <h3 className='font-semibold text-lg'>AI Incident Investigation Chat</h3>
                    <p className='text-xs text-muted-foreground mt-2 max-w-sm'>
                      Ask questions about recent service logs, connection pool issues, or deployment metadata.
                    </p>
                  </div>
                ) : (
                  <div className='space-y-4 max-w-3xl mx-auto'>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex space-x-3 text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* Avatar */}
                        {msg.role !== 'user' && (
                          <div className='h-8 w-8 rounded-full border bg-primary/10 flex items-center justify-center flex-shrink-0'>
                            <Bot className='h-4 w-4 text-primary' />
                          </div>
                        )}

                        <div className={`p-4 rounded-lg leading-relaxed whitespace-pre-wrap max-w-[85%] ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted border rounded-bl-none'
                        }`}>
                          {msg.content}
                        </div>

                        {msg.role === 'user' && (
                          <div className='h-8 w-8 rounded-full border bg-muted flex items-center justify-center flex-shrink-0'>
                            <User className='h-4 w-4' />
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Chat Input Bar */}
              <div className='p-4 border-t bg-background/90 sticky bottom-0 w-full'>
                <form onSubmit={handleSendMessage} className='flex items-center space-x-2 max-w-3xl mx-auto'>
                  <Input
                    placeholder='Type a message to debug with AI...'
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className='flex-grow focus-visible:ring-1'
                  />
                  <Button type='submit' size='icon' disabled={!inputMessage.trim()}>
                    <Send className='h-4 w-4' />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className='flex-grow flex flex-col items-center justify-center text-center p-8 bg-muted/5'>
              <MessageSquare className='h-12 w-12 text-muted-foreground mb-4 animate-bounce' />
              <h3 className='text-lg font-semibold'>No session active</h3>
              <p className='text-sm text-muted-foreground mt-2 max-w-md'>
                Select a debug session on the left panel, or spin up a new session to begin.
              </p>
              <Button onClick={handleCreateSession} className='mt-4'>
                Start Session
              </Button>
            </div>
          )}
        </div>
      </Main>
    </>
  )
}
