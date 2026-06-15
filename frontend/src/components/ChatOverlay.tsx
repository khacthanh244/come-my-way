import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Message, Persona } from '../hooks/useChat'
import { MessageBubble } from './MessageBubble'

interface Props {
  open: boolean
  messages: Message[]
  isLoading: boolean
  onSend: (text: string) => void
  onNewChat: () => void
  onClose: () => void
  persona?: Persona
}

const SUGGESTIONS_BY_PERSONA: Record<Persona, string[]> = {
  merchant: [
    'Tôi bán hàng online thì nên dùng giải pháp nào?',
    'Cửa hàng muốn nhận thanh toán tại quầy thì sao?',
    'Tôi muốn thu phí định kỳ cho gói hội viên?',
  ],
  developer: [
    'Flow tích hợp Agreement Pay như thế nào?',
    'API tạo order cần những tham số gì?',
    'Cách xử lý khi liên kết ví thất bại?',
  ],
}

export function ChatOverlay({ open, messages, isLoading, onSend, onNewChat, onClose, persona = 'merchant' }: Props) {
  const SUGGESTIONS = SUGGESTIONS_BY_PERSONA[persona]
  const [value, setValue] = useState('')
  const [width, setWidth] = useState(Math.round(window.innerWidth / 3))
  const lastUserRef = useRef<HTMLDivElement>(null)
  const prevLenRef = useRef(0)

  useEffect(() => {
    // On a new turn, bring the user's question to the TOP of the view so the
    // answer can be read from its beginning — don't yank the view to the bottom
    // as the (often long) answer streams in.
    if (messages.length > prevLenRef.current) {
      lastUserRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    prevLenRef.current = messages.length
  }, [messages.length])

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
  let lastUserIndex = -1
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') { lastUserIndex = i; break }
  }

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
          <div className="flex flex-col items-center text-center gap-2 mb-auto mt-12 px-2">
            <img src="/icon.png" alt="" className="w-12 h-12 opacity-90 mb-1" />
            <h2 className="text-xl font-extrabold text-dark-500 leading-snug">Welcome to Zalopay Sky Agent!</h2>
            <p className="text-sm text-dark-300 leading-relaxed">
              Trợ lý AI thế hệ mới – Hỗ trợ giải pháp thanh toán tối ưu cho doanh nghiệp của bạn
            </p>
          </div>
          <div className="text-sm text-gray-600 mb-3">
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
          {messages.map((msg, i) => (
            <div key={msg.id} ref={i === lastUserIndex ? lastUserRef : undefined} className="scroll-mt-3">
              <MessageBubble message={msg} />
            </div>
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
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-3 pb-3">
        <div className="flex items-center gap-1 rounded-full border border-gray-300 pl-4 pr-1.5 focus-within:border-blue-1000 focus-within:ring-1 focus-within:ring-blue-1000">
          <textarea
            rows={1}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Đặt câu hỏi cho Sky Agent"
            className="flex-1 resize-none bg-transparent py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !value.trim()}
            aria-label="Gửi"
            className="shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-1000 hover:text-white disabled:opacity-40 disabled:hover:bg-gray-100 disabled:hover:text-gray-500 flex items-center justify-center transition-colors"
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
