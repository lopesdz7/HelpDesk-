import { api } from '@/lib/api'
import { parseMoney } from '@/lib/schemas'
import type {
  ClientData,
  PasswordData,
  ProfileData,
  ServiceData,
  SignInData,
  SignUpData,
  TechnicianData,
  TicketData,
} from '@/lib/schemas'
import type { Paginated, Service, Ticket, TicketStatus, User } from '@/lib/types'

type ListParams = { page?: number; perPage?: number }

// ---------- auth & perfil ----------
export const authService = {
  signIn: (data: SignInData) =>
    api.post<{ token: string; user: User }>('/sessions', data).then((r) => r.data),
  signUp: (data: SignUpData) => api.post<User>('/users', data).then((r) => r.data),
}

export const profileService = {
  get: () => api.get<User>('/profile').then((r) => r.data),
  update: (data: ProfileData) => api.put<User>('/profile', data).then((r) => r.data),
  updatePassword: (data: PasswordData) => api.patch('/profile/password', data),
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.patch<User>('/profile/avatar', form).then((r) => r.data)
  },
  removeAvatar: () => api.delete<User>('/profile/avatar').then((r) => r.data),
  deleteAccount: () => api.delete('/profile'),
}

// ---------- chamados ----------
export const ticketsService = {
  list: (params: ListParams & { status?: TicketStatus }) =>
    api.get<Paginated<Ticket>>('/tickets', { params }).then((r) => r.data),
  get: (id: string) => api.get<Ticket>(`/tickets/${id}`).then((r) => r.data),
  create: (data: TicketData) => api.post<Ticket>('/tickets', data).then((r) => r.data),
  updateStatus: (id: string, status: TicketStatus) =>
    api.patch<Ticket>(`/tickets/${id}/status`, { status }).then((r) => r.data),
  addService: (id: string, data: ServiceData) =>
    api
      .post<Ticket>(`/tickets/${id}/additional-services`, {
        title: data.title,
        price: parseMoney(data.price),
      })
      .then((r) => r.data),
  removeService: (id: string, serviceId: string) =>
    api.delete<Ticket>(`/tickets/${id}/additional-services/${serviceId}`).then((r) => r.data),
}

// ---------- serviços ----------
export const servicesService = {
  list: (params: ListParams & { active?: boolean } = {}) =>
    api.get<Paginated<Service>>('/services', { params }).then((r) => r.data),
  create: (data: ServiceData) =>
    api
      .post<Service>('/services', { title: data.title, price: parseMoney(data.price) })
      .then((r) => r.data),
  update: (id: string, data: ServiceData) =>
    api
      .put<Service>(`/services/${id}`, { title: data.title, price: parseMoney(data.price) })
      .then((r) => r.data),
  setActive: (id: string, active: boolean) =>
    api.patch<Service>(`/services/${id}/status`, { active }).then((r) => r.data),
}

// ---------- técnicos ----------
export const techniciansService = {
  list: (params: ListParams) =>
    api.get<Paginated<User>>('/technicians', { params }).then((r) => r.data),
  get: (id: string) => api.get<User>(`/technicians/${id}`).then((r) => r.data),
  create: (data: TechnicianData) => api.post<User>('/technicians', data).then((r) => r.data),
  update: (id: string, { name, email, availability }: TechnicianData) =>
    api.put<User>(`/technicians/${id}`, { name, email, availability }).then((r) => r.data),
}

// ---------- clientes ----------
export const clientsService = {
  list: (params: ListParams) =>
    api.get<Paginated<User>>('/clients', { params }).then((r) => r.data),
  update: (id: string, data: ClientData) =>
    api.put<User>(`/clients/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/clients/${id}`),
}
