import { Router } from 'express'
import { SessionsController } from '@/controllers/SessionsController'
import { validate } from '@/middlewares/validate'
import { sessionBodySchema } from '@/schemas/auth'

export const sessionsRoutes = Router()
const sessionsController = new SessionsController()

sessionsRoutes.post('/', validate({ body: sessionBodySchema }), sessionsController.create)
