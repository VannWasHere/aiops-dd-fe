import { useState, useEffect } from 'react'

interface StreamingTextProps {
  text: string
  speed?: number // ms per character
  className?: string
  onComplete?: () => void
  showCursor?: boolean
}

export function StreamingText({
  text,
  speed = 10,
  className,
  onComplete,
  showCursor = true
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    setDisplayedText('')
    setIsDone(false)
    
    if (!text) return

    let currentLength = 0
    const interval = setInterval(() => {
      currentLength += 2 // Type 2 chars at a time to speed it up slightly while maintaining animation feel
      if (currentLength >= text.length) {
        setDisplayedText(text)
        setIsDone(true)
        clearInterval(interval)
        if (onComplete) onComplete()
      } else {
        setDisplayedText(text.slice(0, currentLength))
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span className={className}>
      {displayedText}
      {showCursor && !isDone && (
        <span className='inline-block w-1.5 h-3 bg-primary animate-pulse ml-0.5 align-middle' />
      )}
    </span>
  )
}
