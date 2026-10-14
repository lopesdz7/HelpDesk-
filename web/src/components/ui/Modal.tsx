import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { IconButton } from './Button'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Modal sobre <dialog> nativo: `showModal()` torna o resto da página inerte (focus trap),
 * Esc fecha e o foco volta para quem abriu.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        // Clique no backdrop (o próprio <dialog>, fora do conteúdo) fecha.
        if (event.target === event.currentTarget) onClose()
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] max-w-110 rounded-xl bg-gray-600 p-0 text-gray-200 shadow-lg backdrop:backdrop-blur-[2px] open:flex open:flex-col max-h-[calc(100dvh-2rem)]',
        className,
      )}
    >
      {open && (
        <>
          <header className="flex items-center justify-between gap-4 border-b border-gray-500 py-5 pr-4 pl-7">
            <div>
              <h2 id={titleId} className="text-md font-bold text-gray-200">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-0.5 text-xs text-gray-300">
                  {description}
                </p>
              )}
            </div>
            <IconButton label="Fechar" variant="ghost" size="sm" icon={<X />} onClick={onClose} />
          </header>
          <div className="overflow-y-auto px-7 py-7">{children}</div>
          {footer && (
            <footer className="flex gap-2 border-t border-gray-500 px-7 py-6 [&>*]:flex-1">
              {footer}
            </footer>
          )}
        </>
      )}
    </dialog>
  )
}
