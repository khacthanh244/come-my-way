import { ZaloPayLogo } from './ZaloPayLogo'

interface Props {
  search: string
  onSearch: (q: string) => void
  onAskAI: () => void
}

export function DocsHeader({ search, onSearch, onAskAI }: Props) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 lg:px-6 h-14 flex items-center gap-6">
      <div className="flex items-center gap-2 shrink-0">
        <ZaloPayLogo className="text-[20px]" />
        <span className="font-semibold text-[15px] text-dark-300">Docs</span>
      </div>

      <nav className="hidden lg:flex items-center gap-5 text-sm text-gray-700">
        <a href="#" className="font-medium text-blue-1000">Hướng dẫn tích hợp</a>
        <a href="#" className="hover:text-blue-1000 transition-colors">API Reference</a>
        <a href="#" className="hover:text-blue-1000 transition-colors">SDK</a>
        <a href="#" className="hover:text-blue-1000 transition-colors">FAQ</a>
      </nav>

      <div className="flex-1 flex items-center justify-end gap-3">
        <div className="relative w-full max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Tìm kiếm"
            className="w-full rounded-full border border-gray-300 bg-gray-50 pl-9 pr-10 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-1000 focus:bg-white focus:ring-1 focus:ring-blue-1000"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5">
            /
          </kbd>
        </div>

        <button
          onClick={onAskAI}
          className="shrink-0 flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:border-blue-1000 hover:text-blue-1000 transition-colors"
        >
          Ask AI
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l1.8 5.7L19.5 9.5l-5.7 1.8L12 17l-1.8-5.7L4.5 9.5l5.7-1.8L12 2z" />
            <path d="M19 14l.9 2.6L22.5 17.5l-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" />
          </svg>
        </button>
      </div>
    </header>
  )
}
