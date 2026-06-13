interface Props {
  /** Tailwind text-size class controlling the wordmark size, e.g. "text-[22px]". */
  className?: string
  /** Use the on-dark variant ("Zalo" turns white) for dark backgrounds. */
  onDark?: boolean
}

/**
 * Official ZaloPay wordmark — "Zalo" in brand blue, "pay" in wealth green.
 * Single source of truth for the logo; do not inline the wordmark elsewhere.
 * See DESIGN_SYSTEM.md §5.
 */
export function ZaloPayLogo({ className = 'text-[22px]', onDark = false }: Props) {
  return (
    <span className={`font-extrabold tracking-tight leading-none ${className}`}>
      <span className={onDark ? 'text-white' : 'text-blue-1000'}>Zalo</span>
      <span className="text-green-1300">pay</span>
    </span>
  )
}
