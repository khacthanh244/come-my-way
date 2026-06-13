import ReactMarkdown from 'react-markdown'
import { headingsOf, slugify, type Doc } from '../lib/docs'

interface Props {
  doc: Doc
}

function textOf(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    return textOf((node as { props: { children?: React.ReactNode } }).props.children)
  }
  return ''
}

export function DocContent({ doc }: Props) {
  const headings = headingsOf(doc)

  return (
    <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto">
        <article className="doc-content max-w-3xl mx-auto px-8 py-8">
          <p className="text-xs text-gray-400 mb-4">
            Trang chủ <span className="mx-1">›</span> {doc.category}{' '}
            <span className="mx-1">›</span>
            <span className="text-gray-600">{doc.title}</span>
          </p>
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
              h3: ({ children }) => <h3 id={slugify(textOf(children))}>{children}</h3>,
            }}
          >
            {doc.content}
          </ReactMarkdown>
        </article>
      </main>

      {headings.length > 0 && (
        <aside className="w-56 shrink-0 border-l border-gray-100 py-8 px-4 overflow-y-auto hidden xl:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Trên trang này
          </p>
          <nav className="flex flex-col gap-1.5 text-[13px]">
            {headings.map(h => (
              <a
                key={h.id + h.text}
                href={`#${h.id}`}
                className={`text-gray-500 hover:text-blue-1000 transition-colors ${
                  h.level === 3 ? 'pl-3' : ''
                }`}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </aside>
      )}
    </div>
  )
}
