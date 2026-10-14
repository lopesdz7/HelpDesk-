import { Briefcase, ClipboardList, Plus, Users, Wrench, type LucideIcon } from 'lucide-react'
import type { UserRole } from '@/lib/types'

export type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean }

export const NAVIGATION: Record<UserRole, NavItem[]> = {
  admin: [
    { to: '/', label: 'Chamados', icon: ClipboardList, end: true },
    { to: '/technicians', label: 'Técnicos', icon: Users },
    { to: '/clients', label: 'Clientes', icon: Briefcase },
    { to: '/services', label: 'Serviços', icon: Wrench },
  ],
  technician: [{ to: '/', label: 'Meus chamados', icon: ClipboardList, end: true }],
  client: [
    { to: '/', label: 'Meus chamados', icon: ClipboardList, end: true },
    { to: '/tickets/new', label: 'Criar chamado', icon: Plus },
  ],
}

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  technician: 'Técnico',
  client: 'Cliente',
}
