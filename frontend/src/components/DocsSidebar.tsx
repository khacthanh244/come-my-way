import type { Doc } from '../lib/docs'

interface Props {
  docs: Doc[]
  activeSlug: string
  onSelect: (slug: string) => void
}

export function DocsSidebar({ docs, activeSlug, onSelect }: Props) {
  const categories: string[] = []
  for (const d of docs) {
    if (!categories.includes(d.category)) categories.push(d.category)
  }

  return (
    <aside className="w-72 shrink-0 border-r border-gray-200 bg-white overflow-y-auto py-5 px-3 hidden md:block">
      {categories.map(cat => (
        <div key={cat} className="mb-5">
          <p className="px-3 mb-1.5 text-[13px] font-semibold text-gray-900">{cat}</p>
          <nav className="flex flex-col">
            {docs
              .filter(d => d.category === cat)
              .map(doc => (
                <button
                  key={doc.slug}
                  onClick={() => onSelect(doc.slug)}
                  className={`text-left text-sm rounded-md px-3 py-1.5 border-l-2 ml-2 transition-colors ${
                    doc.slug === activeSlug
                      ? 'border-blue-1000 bg-blue-50 text-blue-1000 font-medium'
                      : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {doc.title}
                </button>
              ))}
          </nav>
        </div>
      ))}
      {docs.length === 0 && (
        <p className="px-3 py-2 text-sm text-gray-400">Không tìm thấy tài liệu nào</p>
      )}
    </aside>
  )
}
