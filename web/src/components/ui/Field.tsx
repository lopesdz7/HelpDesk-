import { ChevronDown, CircleAlert } from 'lucide-react'
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'

type FieldShellProps = {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}

/** Rótulo xxs maiúsculo + controle sublinhado + mensagem — o padrão de campo do Figma. */
function FieldShell({ id, label, error, hint, children, className }: FieldShellProps) {
  return (
    <div className={cn('group flex flex-col gap-1', className)}>
      <label
        htmlFor={id}
        className={cn(
          'field-label transition-colors group-focus-within:text-blue-base',
          error ? 'text-danger group-focus-within:text-danger' : 'text-gray-300',
        )}
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1 text-xs text-danger">
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-gray-300 italic">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

const controlBase =
  'w-full border-b bg-transparent text-md text-gray-200 outline-none transition-colors placeholder:text-muted disabled:cursor-not-allowed disabled:text-gray-400 focus-visible:outline-none'

function controlState(error?: string) {
  return error ? 'border-danger' : 'border-gray-500 hover:border-gray-400 focus:border-blue-base'
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  if (error) return `${id}-error`
  return hint ? `${id}-hint` : undefined
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: ReactNode
  /** Prefixo fixo à esquerda (ex.: "R$"). */
  prefix?: string
  wrapperClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, prefix, className, wrapperClassName, id, ...props },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <div className={cn('flex items-center gap-2 border-b-0')}>
        {prefix && <span className="text-md font-bold text-gray-200">{prefix}</span>}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn(controlBase, controlState(error), 'h-10', className)}
          {...props}
        />
      </div>
    </FieldShell>
  )
})

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
  hint?: ReactNode
  wrapperClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, wrapperClassName, id, rows = 5, ...props },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={cn(controlBase, controlState(error), 'resize-y py-2', className)}
        {...props}
      />
    </FieldShell>
  )
})

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  hint?: ReactNode
  placeholder?: string
  wrapperClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, placeholder, className, wrapperClassName, id, children, ...props },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} className={wrapperClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn(
            controlBase,
            controlState(error),
            'h-10 cursor-pointer appearance-none pr-8 invalid:text-muted',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
      </div>
    </FieldShell>
  )
})
