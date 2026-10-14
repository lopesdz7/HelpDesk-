import { Router } from 'express'
import { ensureAuthenticated } from '@/middlewares/ensureAuthenticated'
import { clientsRoutes } from './clientsRoutes'
import { profileRoutes } from './profileRoutes'
import { servicesRoutes } from './servicesRoutes'
import { sessionsRoutes } from './sessionsRoutes'
import { techniciansRoutes } from './techniciansRoutes'
import { ticketsRoutes } from './ticketsRoutes'
import { usersRoutes } from './usersRoutes'

export const routes = Router()

routes.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

// Rotas públicas
routes.use('/sessions', sessionsRoutes)
routes.use('/users', usersRoutes)

// Rotas autenticadas
routes.use('/profile', ensureAuthenticated, profileRoutes)
routes.use('/technicians', ensureAuthenticated, techniciansRoutes)
routes.use('/clients', ensureAuthenticated, clientsRoutes)
routes.use('/services', ensureAuthenticated, servicesRoutes)
routes.use('/tickets', ensureAuthenticated, ticketsRoutes)
