interface BrandIconProps {
  size?: number
  variant?: 'default' | 'inverse'
  className?: string
}

export function BrandIcon({ size = 34, variant = 'default', className }: BrandIconProps) {
  const bgFill = variant === 'inverse' ? 'white' : 'var(--theme-success-500)'
  const diamondFill = variant === 'inverse' ? 'var(--theme-success-500)' : 'white'

  return (
    <svg viewBox="0 0 34 34" fill="none" width={size} height={size} className={className}>
      <rect width="34" height="34" rx="8" fill={bgFill} />
      <path d="M10 17 L17 10 L24 17 L17 24 Z" fill={diamondFill} />
    </svg>
  )
}
