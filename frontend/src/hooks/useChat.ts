import { useState, useRef } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  isStreaming?: boolean
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }

    const assistantId = crypto.randomUUID()
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      sources: [],
      isStreaming: true,
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setIsLoading(true)

    const history = messages.map(m => ({ role: m.role, content: m.content }))

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, stream: true }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error('API error')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let sources: string[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)

          if (data === '[DONE]') break

          const sourcesMatch = data.match(/^\[SOURCES\](.*)\[\/SOURCES\]$/)
          if (sourcesMatch) {
            sources = sourcesMatch[1].split(',').filter(Boolean)
            setMessages(prev =>
              prev.map(m => (m.id === assistantId ? { ...m, sources } : m))
            )
            continue
          }

          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId ? { ...m, content: m.content + data } : m
            )
          )
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: 'Có lỗi xảy ra. Vui lòng thử lại.', isStreaming: false }
              : m
          )
        )
      }
    } finally {
      setMessages(prev =>
        prev.map(m => (m.id === assistantId ? { ...m, isStreaming: false } : m))
      )
      setIsLoading(false)
    }
  }

  const clearHistory = () => setMessages([])

  return { messages, isLoading, sendMessage, clearHistory }
}
