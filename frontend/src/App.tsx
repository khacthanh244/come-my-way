import { useEffect } from 'react'
import { ChatWindow } from './components/ChatWindow'
import { InputBar } from './components/InputBar'
import { useChat } from './hooks/useChat'

export default function App() {
  const { messages, isLoading, sendMessage, clearHistory } = useChat()

  useEffect(() => {
    const handler = (e: Event) => {
      const question = (e as CustomEvent<string>).detail
      sendMessage(question)
    }
    window.addEventListener('suggest-question', handler)
    return () => window.removeEventListener('suggest-question', handler)
  }, [sendMessage])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            AI
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-800">Merchant Support AI</h1>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              Trực tuyến
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            Cuộc trò chuyện mới
          </button>
        )}
      </header>

      <ChatWindow messages={messages} isLoading={isLoading} />

      <InputBar onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}
