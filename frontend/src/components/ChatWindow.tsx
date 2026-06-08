import { useEffect, useRef } from 'react'
import type { Message } from '../hooks/useChat'
import { MessageBubble } from './MessageBubble'

interface Props {
  messages: Message[]
  isLoading: boolean
}

export function ChatWindow({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 p-8">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
          💬
        </div>
        <p className="text-lg font-medium text-gray-500">Xin chào! Tôi có thể giúp gì cho bạn?</p>
        <p className="text-sm text-center max-w-sm">
          Hãy đặt câu hỏi về các tài liệu hướng dẫn merchant. Tôi sẽ tìm và trả lời dựa trên nội dung tài liệu.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 w-full max-w-lg">
          {[
            'Cách tạo sản phẩm mới?',
            'Quy trình xử lý đơn hàng?',
            'Chính sách hoàn tiền?',
            'Cách cấu hình thanh toán?',
          ].map(q => (
            <button
              key={q}
              className="text-left text-sm border border-gray-200 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-300 transition-colors text-gray-600"
              onClick={() => {
                // Trigger via custom event so ChatWindow stays dumb
                window.dispatchEvent(new CustomEvent('suggest-question', { detail: q }))
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="max-w-3xl mx-auto">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold mr-2 shrink-0">
              AI
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
