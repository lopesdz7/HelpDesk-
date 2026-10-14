import { Router } from 'express'
import { ensureAuthenticated } from '@/middlewares/ensureAuthenticated'
import { profileRoutes } from './profileRoutes'
import { sessionsRoutes } from './sessionsRoutes'
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
