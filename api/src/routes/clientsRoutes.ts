import { Router } from 'express'
import { ClientsController } from '@/controllers/ClientsController'
import { validate } from '@/middlewares/validate'
import { verifyUserAuthorization } from '@/middlewares/verifyUserAuthorization'
import { updateClientBodySchema, userListQuerySchema } from '@/schemas/admin'
import { idParamsSchema } from '@/schemas/common'

export const clientsRoutes = Router()
const clientsController = new ClientsController()

clientsRoutes.use(verifyUserAuthorization(['admin']))
clientsRoutes.get('/', validate({ query: userListQuerySchema }), clientsController.index)
clientsRoutes.put(
  '/:id',
  validate({ params: idParamsSchema, body: updateClientBodySchema }),
  clientsController.update,
)
clientsRoutes.delete('/:id', validate({ params: idParamsSchema }), clientsController.delete)
