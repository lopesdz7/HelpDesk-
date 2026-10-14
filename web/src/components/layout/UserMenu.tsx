import { CircleUser, LogOut } from 'lucide-react'
import { useCallback, useId, useRef, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth, useCurrentUser } from '@/hooks/useAuth'
import { useDismiss } from '@/hooks/useDismiss'
import { cn } from '@/lib/cn'
import { ProfileModal } from './ProfileModal'

type UserMenuProps = {
  /** "sidebar": card completo no rodapé; "topbar": só o avatar (mobile). */
  variant: 'sidebar' | 'topbar'
}

export function UserMenu({ variant }: UserMenuProps) {
  const user = useCurrentUser()
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const close = useCallback(() => setOpen(false), [])

  useDismiss(containerRef, open, close)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={variant === 'topbar' ? `Menu do usuário: ${user.name}` : undefined}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center gap-3 rounded-md text-left transition-colors focus-visible:outline-blue-light',
          variant === 'sidebar' ? 'w-full p-2 hover:bg-gray-200' : 'p-1',
        )}
      >
        <Avatar name={user.name} avatar={user.avatar} size={variant === 'sidebar' ? 'md' : 'nav'} />
        {variant === 'sidebar' && (
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm text-gray-600">{user.name}</span>
            <span className="truncate text-xs text-gray-400">{user.email}</span>
          </span>
        )}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Opções"
          className={cn(
            'absolute z-30 w-[min(calc(100vw-2rem),12.5rem)] rounded-lg bg-gray-100 px-5 py-4 shadow-lg ring-1 ring-gray-200',
            variant === 'sidebar'
              ? 'bottom-full left-full mb-0 ml-3 max-md:left-0'
              : 'top-full right-0 mt-2',
          )}
        >
          <p className="field-label mb-2 text-gray-400">Opções</p>
          <button
            type="button"
            role="menuitem"
            autoFocus
            onClick={() => {
              setOpen(false)
              setProfileOpen(true)
            }}
            className="flex w-full items-center gap-2 rounded-sm py-2 text-md text-gray-500 hover:text-white"
          >
            <CircleUser className="size-5" aria-hidden />
            Perfil
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-sm py-2 text-md text-danger hover:brightness-125"
          >
            <LogOut className="size-5" aria-hidden />
            Sair
          </button>
        </div>
      )}

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}
