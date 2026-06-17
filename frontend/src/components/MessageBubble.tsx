import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { StepperList } from './ChatStepper'
import type { Message } from '../hooks/useChat'

interface Props {
  message: Message
}

// The agent sometimes emits LaTeX-style symbols ($\rightarrow$, $\times$…) that
// react-markdown renders as raw text. Convert the common ones to Unicode and
// unwrap the inline-math delimiters so they read naturally.
const LATEX_SYMBOLS: Record<string, string> = {
  '\\rightarrow': '→', '\\Rightarrow': '⇒', '\\to': '→', '\\longrightarrow': '→',
  '\\leftarrow': '←', '\\Leftarrow': '⇐', '\\leftrightarrow': '↔',
  '\\times': '×', '\\cdot': '·', '\\div': '÷', '\\pm': '±',
  '\\leq': '≤', '\\le': '≤', '\\geq': '≥', '\\ge': '≥', '\\neq': '≠',
  '\\approx': '≈', '\\equiv': '≡', '\\infty': '∞', '\\sum': '∑', '\\Delta': 'Δ',
}

function normalizeMath(src: string): string {
  let out = src
  for (const [cmd, sym] of Object.entries(LATEX_SYMBOLS).sort((a, b) => b[0].length - a[0].length)) {
    out = out.split(cmd).join(sym)
  }
  // Unwrap inline math delimiters: \( … \) and single $ … $ (no newline inside)
  out = out.replace(/\\\(([^]*?)\\\)/g, '$1')
  out = out.replace(/\$([^$\n]+)\$/g, '$1')
  return out
}

// Render links so they open in a new tab (with safe rel).
function MdLink({ href, children, ...props }: React.ComponentProps<'a'>) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}

// One markdown chunk. `stepper` turns ordered lists into the collapsible
// timeline; without it, ordered lists render as a plain numbered list.
function MdChunk({ children, stepper }: { children: string; stepper?: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={stepper ? { ol: StepperList, a: MdLink } : { a: MdLink }}
    >
      {children}
    </ReactMarkdown>
  )
}

const STEPS_OPEN = ':::steps'
const STEPS_CLOSE = ':::'

// Split the answer on `:::steps … :::` markers (emitted by the agent only for
// complex Path-B technical flows). Marker blocks render as a collapsible
// stepper; everything else renders as ordinary markdown. An unclosed marker
// (mid-stream) renders its remainder as a stepper so it looks right as it streams.
function renderAssistant(raw: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let rest = normalizeMath(raw)
  let key = 0
  while (rest.length > 0) {
    const open = rest.indexOf(STEPS_OPEN)
    if (open === -1) {
      if (rest.trim()) nodes.push(<MdChunk key={key++}>{rest}</MdChunk>)
      break
    }
    const before = rest.slice(0, open)
    if (before.trim()) nodes.push(<MdChunk key={key++}>{before}</MdChunk>)

    const afterOpen = rest.slice(open + STEPS_OPEN.length).replace(/^[ \t]*\n?/, '')
    const close = afterOpen.indexOf(STEPS_CLOSE)
    if (close === -1) {
      if (afterOpen.trim()) nodes.push(<MdChunk key={key++} stepper>{afterOpen}</MdChunk>)
      break
    }
    const body = afterOpen.slice(0, close)
    if (body.trim()) nodes.push(<MdChunk key={key++} stepper>{body}</MdChunk>)
    rest = afterOpen.slice(close + STEPS_CLOSE.length)
  }
  return nodes
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end items-start mb-4">
        <div className="max-w-[78%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-blue-1000 text-white text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold ml-2 shrink-0">
          M
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start items-start mb-4">
      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-2 shrink-0 overflow-hidden">
        <img src="/icon.png" alt="AI" className="w-5 h-5 object-contain" />
      </div>

      <div className="max-w-[88%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white shadow-sm border border-divider">
        {message.content ? <div className="chat-md">{renderAssistant(message.content)}</div> : null}
        {message.isStreaming && (
          <span className="inline-flex gap-1 items-center align-middle mt-0.5">
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </div>
    </div>
  )
}
