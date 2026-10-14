import { Router } from 'express'
import { TechniciansController } from '@/controllers/TechniciansController'
import { validate } from '@/middlewares/validate'
import { verifyUserAuthorization } from '@/middlewares/verifyUserAuthorization'
import {
  createTechnicianBodySchema,
  updateTechnicianBodySchema,
  userListQuerySchema,
} from '@/schemas/admin'
import { idParamsSchema } from '@/schemas/common'

export const techniciansRoutes = Router()
const techniciansController = new TechniciansController()

techniciansRoutes.use(verifyUserAuthorization(['admin']))
techniciansRoutes.get('/', validate({ query: userListQuerySchema }), techniciansController.index)
techniciansRoutes.post(
  '/',
  validate({ body: createTechnicianBodySchema }),
  techniciansController.create,
)
techniciansRoutes.get('/:id', validate({ params: idParamsSchema }), techniciansController.show)
techniciansRoutes.put(
  '/:id',
  validate({ params: idParamsSchema, body: updateTechnicianBodySchema }),
  techniciansController.update,
)
