import { useMemo, useState } from 'react'
import { ChatOverlay } from './components/ChatOverlay'
import { DocContent } from './components/DocContent'
import { DocsHeader } from './components/DocsHeader'
import { DocsSidebar } from './components/DocsSidebar'
import { MerchantLanding } from './components/MerchantLanding'
import { MerchantDev } from './components/MerchantDev'
import { useChat } from './hooks/useChat'
import { docs } from './lib/docs'

const PAGE_TITLES: Record<string, string> = {
  '/mc': 'Zalopay Merchant — Giải pháp cho doanh nghiệp',
  '/dev': 'Zalopay Developer — Giải pháp tích hợp',
  '': 'Zalopay Merchant Docs — Tài liệu tích hợp',
}

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '')
  document.title = PAGE_TITLES[path] ?? 'Zalopay Merchant'
  if (path === '/mc') return <MerchantLanding />
  if (path === '/dev') return <MerchantDev />
  return <DocsApp />
}

function DocsApp() {
  const { messages, isLoading, sendMessage, clearHistory } = useChat('developer')
  const [chatOpen, setChatOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeSlug, setActiveSlug] = useState(docs[0]?.slug ?? '')

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return docs
    return docs.filter(
      d => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
    )
  }, [search])

  const activeDoc = docs.find(d => d.slug === activeSlug) ?? docs[0]

  return (
    <div className="flex flex-col h-screen bg-white">
      <DocsHeader search={search} onSearch={setSearch} onAskAI={() => setChatOpen(o => !o)} />

      <div className="flex flex-1 overflow-hidden">
        <DocsSidebar docs={filteredDocs} activeSlug={activeDoc?.slug ?? ''} onSelect={setActiveSlug} />
        {activeDoc && <DocContent doc={activeDoc} />}
        <ChatOverlay
          open={chatOpen}
          persona="developer"
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onNewChat={clearHistory}
          onClose={() => setChatOpen(false)}
        />
      </div>
    </div>
  )
}
