import { Router } from 'express'
import { AdditionalServicesController } from '@/controllers/AdditionalServicesController'
import { TicketsController } from '@/controllers/TicketsController'
import { TicketStatusController } from '@/controllers/TicketStatusController'
import { validate } from '@/middlewares/validate'
import { verifyUserAuthorization } from '@/middlewares/verifyUserAuthorization'
import { idParamsSchema } from '@/schemas/common'
import {
  additionalServiceBodySchema,
  additionalServiceParamsSchema,
  createTicketBodySchema,
  ticketListQuerySchema,
  ticketStatusBodySchema,
} from '@/schemas/tickets'

export const ticketsRoutes = Router()
const ticketsController = new TicketsController()
const statusController = new TicketStatusController()
const additionalServicesController = new AdditionalServicesController()

// Leitura: todos os papéis, com escopo aplicado no controller.
ticketsRoutes.get('/', validate({ query: ticketListQuerySchema }), ticketsController.index)
ticketsRoutes.get('/:id', validate({ params: idParamsSchema }), ticketsController.show)

ticketsRoutes.post(
  '/',
  verifyUserAuthorization(['client']),
  validate({ body: createTicketBodySchema }),
  ticketsController.create,
)

ticketsRoutes.patch(
  '/:id/status',
  verifyUserAuthorization(['technician', 'admin']),
  validate({ params: idParamsSchema, body: ticketStatusBodySchema }),
  statusController.update,
)

ticketsRoutes.post(
  '/:id/additional-services',
  verifyUserAuthorization(['technician']),
  validate({ params: idParamsSchema, body: additionalServiceBodySchema }),
  additionalServicesController.create,
)
ticketsRoutes.delete(
  '/:id/additional-services/:serviceId',
  verifyUserAuthorization(['technician']),
  validate({ params: additionalServiceParamsSchema }),
  additionalServicesController.delete,
)
