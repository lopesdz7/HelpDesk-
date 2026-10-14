import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-lg border border-gray-500 p-5 md:p-7', className)} {...props} />
  )
}

/** Título pequeno de seção dentro de um card (ex.: "Técnico responsável"). */
export function CardLabel({
  children,
  className,
  as: Tag = 'h3',
}: {
  children: ReactNode
  className?: string
  /** "dt" dentro de listas de definição (<dl>). */
  as?: 'h3' | 'dt'
}) {
  return <Tag className={cn('text-xs font-bold text-muted', className)}>{children}</Tag>
}
