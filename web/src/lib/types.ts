export type UserRole = 'admin' | 'technician' | 'client'
export type TicketStatus = 'open' | 'in_progress' | 'closed'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string | null
  availability: string[]
  createdAt: string
  updatedAt: string
}

export type Person = Pick<User, 'id' | 'name' | 'email' | 'avatar'>

export type Service = {
  id: string
  title: string
  price: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type AdditionalService = {
  id: string
  title: string
  price: number
  ticketId: string
  createdAt: string
}

export type Ticket = {
  id: string
  code: number
  title: string
  description: string
  status: TicketStatus
  servicePrice: number
  additionalTotal: number
  total: number
  client: Person
  technician: Person
  service: Pick<Service, 'id' | 'title' | 'active'>
  additionalServices: AdditionalService[]
  createdAt: string
  updatedAt: string
}

export type Paginated<T> = {
  data: T[]
  meta: { page: number; perPage: number; total: number; totalPages: number }
}

export type ApiErrorBody = {
  message: string
  issues?: { path: string; message: string }[]
}
