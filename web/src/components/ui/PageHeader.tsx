import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type PageHeaderProps = {
  title: string
  /** Mostra o link "Voltar" acima do título. */
  backTo?: string
  actions?: ReactNode
  children?: ReactNode
}

export function PageHeader({ title, backTo, actions, children }: PageHeaderProps) {
  return (
    <header className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1">
        {backTo && (
          <Link
            to={backTo}
            className="inline-flex w-fit items-center gap-1 rounded-xs text-xs font-bold text-gray-300 hover:text-gray-100"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Voltar
          </Link>
        )}
        <h1 className="text-lg font-bold text-blue-dark md:text-xl">{title}</h1>
        {children}
      </div>
      {actions && <div className="flex gap-2 max-md:[&>*]:flex-1">{actions}</div>}
    </header>
  )
}
