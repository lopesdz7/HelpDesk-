import { cn } from '@/lib/cn'

export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type Size = 'md' | 'sm'

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-sm font-bold transition-colors duration-150 select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.125em] [&_svg]:shrink-0'

const variants: Record<Variant, string> = {
  primary: 'bg-gray-200 text-white hover:bg-gray-100 active:bg-gray-100',
  secondary: 'bg-gray-500 text-gray-200 hover:bg-gray-500/70 hover:text-gray-100',
  ghost: 'text-gray-300 hover:bg-gray-500 hover:text-gray-100',
  danger: 'bg-danger text-white hover:bg-danger/85',
}

const sizes: Record<Size, string> = {
  md: 'h-10 px-4 text-sm',
  sm: 'h-7 px-2 text-xs',
}

const iconSizes: Record<Size, string> = { md: 'size-10', sm: 'size-7' }

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  className,
}: { variant?: Variant; size?: Size; iconOnly?: boolean; className?: string } = {}) {
  return cn(base, variants[variant], iconOnly ? iconSizes[size] : sizes[size], className)
}
