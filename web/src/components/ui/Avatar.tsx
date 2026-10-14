import { useState } from 'react'
import { avatarUrl } from '@/lib/api'
import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'

const sizes = {
  xs: 'size-5 text-[0.5rem]',
  sm: 'size-7 text-xxs',
  md: 'size-8 text-xs',
  nav: 'size-10 text-sm',
  lg: 'size-12 text-md',
  xl: 'size-16 text-lg',
} as const

type AvatarProps = {
  name: string
  avatar?: string | null
  size?: keyof typeof sizes
  className?: string
}

export function Avatar({ name, avatar, size = 'md', className }: AvatarProps) {
  const src = avatarUrl(avatar)
  const [failedSrc, setFailedSrc] = useState<string>()

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-dark font-bold text-white select-none',
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {src && failedSrc !== src ? (
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        initials(name)
      )}
    </span>
  )
}
