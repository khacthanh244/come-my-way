import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Message } from '../hooks/useChat'
import { MessageBubble } from './MessageBubble'

interface Props {
  open: boolean
  messages: Message[]
  isLoading: boolean
  onSend: (text: string) => void
  onNewChat: () => void
  onClose: () => void
}

const SUGGESTIONS = [
  'Tích hợp Agreement Pay như thế nào?',
  'API tạo order cần những tham số gì?',
  'Cách xử lý khi liên kết ví thất bại?',
]

export function ChatOverlay({ open, messages, isLoading, onSend, onNewChat, onClose }: Props) {
  const [value, setValue] = useState('')
  const [width, setWidth] = useState(Math.round(window.innerWidth / 3))
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    const onMove = (ev: PointerEvent) => {
      const w = window.innerWidth - ev.clientX
      setWidth(Math.min(Math.max(w, 320), Math.round(window.innerWidth * 0.7)))
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  if (!open) return null

  const handleSend = (text?: string) => {
    const msg = (text ?? value).trim()
    if (!msg || isLoading) return
    onSend(msg)
    setValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const empty = messages.length === 0

  return (
    <div
      className="relative shrink-0 border-l border-gray-200 bg-white flex flex-col h-full"
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        onPointerDown={startResize}
        title="Kéo để thay đổi kích thước"
        className="absolute left-0 top-0 h-full w-1.5 -ml-0.5 cursor-col-resize z-10 hover:bg-blue-1000/30 active:bg-blue-1000/50 transition-colors"
      />
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <img src="/icon.png" alt="Sky Agent" className="w-5 h-5" />
          <span className="font-medium text-sm text-gray-800">Sky Agent</span>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <button onClick={onNewChat} title="Cuộc trò chuyện mới" className="hover:text-blue-1000 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
          <button onClick={onClose} title="Đóng" className="hover:text-blue-1000 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="px-4 py-2 text-[11px] text-gray-400 text-center border-b border-gray-50 shrink-0">
        Câu trả lời được tạo bởi AI và có thể có sai sót.
      </p>

      {/* Body */}
      {empty ? (
        <div className="flex-1 flex flex-col justify-end px-4 pb-3 overflow-hidden">
          <div className="flex flex-col items-center gap-2 mb-auto mt-16">
            <img src="/icon.png" alt="" className="w-10 h-10 opacity-90" />
            <p className="text-lg text-gray-700">Hỏi em đi</p>
          </div>
          <div className="text-sm text-gray-600 mb-3">
            <p className="mb-3">
              Hỏi về tài liệu tích hợp merchant và nhận hỗ trợ cho việc tích hợp của bạn.
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-left text-[13px] text-gray-700 border border-gray-200 rounded-lg px-3 py-2 hover:border-blue-1000 hover:text-blue-1000 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-3 pb-3">
        <div className="relative">
          <textarea
            rows={1}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Đặt câu hỏi về trang tài liệu"
            className="w-full resize-none rounded-full border border-gray-300 px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-1000 focus:ring-1 focus:ring-blue-1000 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !value.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-1000 hover:text-white disabled:opacity-40 disabled:hover:bg-gray-100 disabled:hover:text-gray-500 flex items-center justify-center transition-colors"
            title="Gửi"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
