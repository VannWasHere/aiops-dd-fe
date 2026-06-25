import React, { useState, useEffect, useRef } from 'react'
import { Terminal } from 'lucide-react'

interface TerminalInputProps {
  onCommand: (cmd: string) => void
  placeholder?: string
  initialValue?: string
}

const COMMAND_SUGGESTIONS = [
  { cmd: '/investigate', desc: 'Trigger service RCA diagnostic' },
  { cmd: '/health', desc: 'Inspect environment telemetry health' },
  { cmd: '/logs', desc: 'Display live microservice logs' },
  { cmd: '/metrics', desc: 'Show ASCII CPU/memory performance' },
  { cmd: '/incidents', desc: 'List active and resolved RCAs' },
  { cmd: '/remediate', desc: 'Apply suggested recovery scripts' },
  { cmd: '/deploy', desc: 'View deployments and service owners' },
  { cmd: '/help', desc: 'List all terminal console options' }
]

export function TerminalInput({
  onCommand,
  placeholder = 'Type /help or investigate service latency...',
  initialValue = ''
}: TerminalInputProps) {
  const [value, setValue] = useState(initialValue)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aiops_command_history')
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load command history', e)
    }

    // Keyboard shortcut to focus terminal input: '/'
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        // Prevent default browser search behavior
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filteredSuggestions = COMMAND_SUGGESTIONS.filter(item =>
    item.cmd.startsWith(value.trim())
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If suggestion popup is open
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveSuggestion((prev) => (prev + 1) % filteredSuggestions.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveSuggestion((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length)
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        selectSuggestion(filteredSuggestions[activeSuggestion].cmd)
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        selectSuggestion(filteredSuggestions[activeSuggestion].cmd)
        return
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false)
        return
      }
    }

    // Standard Terminal History cycling
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const nextIndex = historyIndex + 1
      if (nextIndex < history.length) {
        setHistoryIndex(nextIndex)
        setValue(history[history.length - 1 - nextIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = historyIndex - 1
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex)
        setValue(history[history.length - 1 - nextIndex])
      } else {
        setHistoryIndex(-1)
        setValue('')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue(val)
    setHistoryIndex(-1)
    
    // Open suggestions if starting with '/'
    if (val.startsWith('/')) {
      setShowSuggestions(true)
      setActiveSuggestion(0)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (cmd: string) => {
    setValue(cmd + ' ')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return

    // Save to history
    const updatedHistory = [...history.filter(h => h !== trimmed), trimmed].slice(-50)
    setHistory(updatedHistory)
    localStorage.setItem('aiops_command_history', JSON.stringify(updatedHistory))
    setHistoryIndex(-1)
    setValue('')
    setShowSuggestions(false)
    
    onCommand(trimmed)
  }

  return (
    <div className='relative w-full font-mono text-xs mb-4'>
      <form
        onSubmit={handleSubmit}
        className='flex items-center space-x-2 border border-primary/30 bg-[#111111] px-3 py-2 text-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20'
      >
        <Terminal className='h-4 w-4 text-primary animate-pulse flex-shrink-0' />
        <span className='text-primary font-bold flex-shrink-0'>&gt;</span>
        
        <input
          ref={inputRef}
          type='text'
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className='w-full bg-transparent text-foreground outline-none border-none placeholder-muted-foreground font-mono focus:ring-0 focus:outline-none'
          autoComplete='off'
          spellCheck='false'
        />

        <div className='flex items-center space-x-2 text-[10px] text-muted-foreground flex-shrink-0 select-none'>
          <span>Press</span>
          <kbd className='px-1 py-0.5 border border-border bg-muted/50 rounded'>/</kbd>
          <span>to focus</span>
        </div>
      </form>

      {/* Autocomplete Suggestions Box */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className='absolute z-50 left-0 right-0 mt-1 border border-border bg-[#161616] shadow-2xl max-h-48 overflow-y-auto'
        >
          {filteredSuggestions.map((item, idx) => (
            <div
              key={item.cmd}
              onClick={() => selectSuggestion(item.cmd)}
              className={`flex items-center justify-between px-3 py-1.5 cursor-pointer border-b border-border/40 last:border-none ${
                idx === activeSuggestion
                  ? 'bg-primary/20 text-primary font-bold'
                  : 'hover:bg-muted/40 text-muted-foreground'
              }`}
            >
              <span>{item.cmd}</span>
              <span className='text-[10px] text-muted-foreground opacity-80'>{item.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
