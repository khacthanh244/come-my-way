import { Children, isValidElement, useState, type ReactElement, type ReactNode } from 'react'

/**
 * Renders an ordered list (markdown `ol`) as a collapsible numbered timeline,
 * matching the Zalopay step-flow design. Only the first step is open by default;
 * each step toggles independently. See DESIGN_SYSTEM.md.
 */
export function StepperList({ children }: { children?: ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{ children?: ReactNode }>[]
  return (
    <div className="my-2">
      {items.map((li, i) => (
        <Step key={i} index={i} isLast={i === items.length - 1} defaultOpen={i === 0}>
          {li.props.children}
        </Step>
      ))}
    </div>
  )
}

function notBlank(c: ReactNode): boolean {
  return !(typeof c === 'string' && c.trim() === '')
}

/** Split a list item into a clickable title and a collapsible body. */
function splitStep(children: ReactNode): { title: ReactNode; body: ReactNode[] } {
  const blocks = Children.toArray(children).filter(notBlank)

  // Multi-block item: first block is the title, the rest is the detail.
  if (blocks.length > 1) {
    return { title: blocks[0], body: blocks.slice(1) }
  }

  // Single paragraph that leads with a bold run: "**Title:** detail…"
  const only = blocks[0]
  if (isValidElement(only)) {
    const inner = Children.toArray((only as ReactElement<{ children?: ReactNode }>).props.children)
    if (inner.length > 0 && isValidElement(inner[0]) && (inner[0] as ReactElement).type === 'strong') {
      const title = (inner[0] as ReactElement<{ children?: ReactNode }>).props.children
      const rest = inner.slice(1).filter(notBlank)
      return { title, body: rest.length ? [<p key="d">{inner.slice(1)}</p>] : [] }
    }
  }

  return { title: only, body: [] }
}

function Step({
  index,
  isLast,
  defaultOpen,
  children,
}: {
  index: number
  isLast: boolean
  defaultOpen: boolean
  children?: ReactNode
}) {
  const { title, body } = splitStep(children)
  const hasBody = body.length > 0
  const [open, setOpen] = useState(defaultOpen)
  const toggle = () => hasBody && setOpen(o => !o)

  return (
    <div className="flex gap-3">
      {/* Left rail: number + connector line */}
      <div className="flex flex-col items-center shrink-0">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={hasBody ? open : undefined}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
            open && hasBody ? 'bg-blue-1000 text-white' : 'bg-blue-50 text-blue-1000'
          } ${hasBody ? 'cursor-pointer hover:bg-blue-1000 hover:text-white' : 'cursor-default'}`}
        >
          {index + 1}
        </button>
        {!isLast && <span className="w-px flex-1 bg-divider my-1" />}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
        <div
          onClick={toggle}
          className={`flex items-start gap-1.5 select-none ${hasBody ? 'cursor-pointer' : ''}`}
        >
          <span className="step-title font-semibold text-dark-500 text-[14px] leading-6">{title}</span>
          {hasBody && (
            <svg
              className={`w-4 h-4 mt-1 shrink-0 text-dark-300 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {hasBody && open && (
          <div className="step-body mt-2 rounded-lg border border-divider bg-app px-3.5 py-2.5 text-[13.5px] text-dark-500">
            {body}
          </div>
        )}
      </div>
    </div>
  )
}
