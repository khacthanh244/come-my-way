interface Props {
  /** Tailwind height class controlling the logo size, e.g. "h-7". */
  className?: string
  /** Use the on-dark variant (renders the logo in white) for dark backgrounds. */
  onDark?: boolean
}

/**
 * Official Zalopay logo (wordmark image). Single source of truth for the logo;
 * do not inline the wordmark elsewhere. See DESIGN_SYSTEM.md §5.
 */
export function ZaloPayLogo({ className = 'h-7', onDark = false }: Props) {
  return (
    <img
      src="/logo-zalopay-doanhnghiep.png"
      alt="Zalopay"
      draggable={false}
      className={`${className} w-auto select-none ${onDark ? 'brightness-0 invert' : ''}`}
    />
  )
}
