import { Router } from 'express'
import { ServicesController } from '@/controllers/ServicesController'
import { validate } from '@/middlewares/validate'
import { verifyUserAuthorization } from '@/middlewares/verifyUserAuthorization'
import { serviceBodySchema, serviceListQuerySchema, serviceStatusBodySchema } from '@/schemas/admin'
import { idParamsSchema } from '@/schemas/common'

export const servicesRoutes = Router()
const servicesController = new ServicesController()
const onlyAdmin = verifyUserAuthorization(['admin'])

// Leitura para todos os autenticados (cliente vê só ativos); escrita só admin.
servicesRoutes.get('/', validate({ query: serviceListQuerySchema }), servicesController.index)
servicesRoutes.post(
  '/',
  onlyAdmin,
  validate({ body: serviceBodySchema }),
  servicesController.create,
)
servicesRoutes.put(
  '/:id',
  onlyAdmin,
  validate({ params: idParamsSchema, body: serviceBodySchema }),
  servicesController.update,
)
servicesRoutes.patch(
  '/:id/status',
  onlyAdmin,
  validate({ params: idParamsSchema, body: serviceStatusBodySchema }),
  servicesController.updateStatus,
)
