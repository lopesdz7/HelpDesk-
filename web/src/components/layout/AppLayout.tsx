import { Menu, X } from 'lucide-react'
import { useCallback, useId, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/useAuth'
import { useDismiss } from '@/hooks/useDismiss'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { NAVIGATION, ROLE_LABEL, type NavItem } from './navigation'
import { UserMenu } from './UserMenu'

function NavItems({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-3 rounded-md px-4 text-sm transition-colors focus-visible:outline-blue-light',
                isActive
                  ? 'bg-blue-dark text-gray-600'
                  : 'text-gray-400 hover:bg-gray-200 hover:text-gray-500',
              )
            }
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

/** Barra superior do mobile: hambúrguer com a navegação, logo e menu do usuário. */
function MobileTopBar({ items, roleLabel }: { items: NavItem[]; roleLabel: string }) {
  const { pathname } = useLocation()
  // Guarda a rota em que o menu foi aberto: ao navegar, ele fecha sozinho.
  const [openAt, setOpenAt] = useState<string | null>(null)
  const open = openAt === pathname
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const close = useCallback(() => setOpenAt(null), [])

  useDismiss(containerRef, open, close)

  return (
    <header className="flex items-center gap-4 px-6 py-5 md:hidden">
      <div ref={containerRef} className="relative">
        <button
          type="button"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpenAt(open ? null : pathname)}
          className="flex size-10 items-center justify-center rounded-sm bg-gray-200 text-gray-600 focus-visible:outline-blue-light"
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
        {open && (
          <nav
            id={menuId}
            aria-label="Navegação principal"
            className="absolute top-full left-0 z-30 mt-3 w-[calc(100vw-3rem)] rounded-lg bg-gray-100 px-4 py-5 shadow-lg ring-1 ring-gray-200"
          >
            <p className="field-label mb-3 px-1 text-gray-400">Menu</p>
            <NavItems items={items} onNavigate={close} />
          </nav>
        )}
      </div>
      <Logo subtitle={roleLabel} className="flex-1" />
      <UserMenu variant="topbar" />
    </header>
  )
}

export function AppLayout() {
  const user = useCurrentUser()
  const items = NAVIGATION[user.role]
  const roleLabel = ROLE_LABEL[user.role]

  return (
    <div className="flex min-h-dvh flex-col bg-gray-100 md:flex-row">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-sm bg-white px-4 py-2 text-sm font-bold text-gray-100 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>

      <aside className="sticky top-0 hidden h-dvh w-50 shrink-0 flex-col md:flex">
        <div className="border-b border-gray-200 px-5 py-6">
          <Logo subtitle={roleLabel} />
        </div>
        <nav aria-label="Navegação principal" className="flex-1 px-4 py-5">
          <NavItems items={items} />
        </nav>
        <div className="border-t border-gray-200 px-2 py-3">
          <UserMenu variant="sidebar" />
        </div>
      </aside>

      <MobileTopBar items={items} roleLabel={roleLabel} />

      <main
        id="conteudo"
        tabIndex={-1}
        className="min-w-0 flex-1 rounded-t-xl bg-gray-600 px-6 py-7 outline-none md:mt-3 md:rounded-t-none md:rounded-tl-xl md:px-12 md:py-13"
      >
        <div className="mx-auto w-full max-w-300">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
