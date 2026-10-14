import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

export function AuthCardHeader({
  title,
  description,
  small = false,
}: {
  title: string
  description: string
  small?: boolean
}) {
  const Heading = small ? 'h2' : 'h1'
  return (
    <div className="flex flex-col gap-0.5">
      <Heading
        className={small ? 'text-lg font-bold text-gray-200' : 'text-xl font-bold text-gray-200'}
      >
        {title}
      </Heading>
      <p className="text-xs text-gray-300">{description}</p>
    </div>
  )
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-sm border border-danger/40 px-3 py-2.5 text-sm text-danger"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      {children}
    </p>
  )
}
