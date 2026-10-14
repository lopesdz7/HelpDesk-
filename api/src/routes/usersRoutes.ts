import { Router } from 'express'
import { UsersController } from '@/controllers/UsersController'
import { validate } from '@/middlewares/validate'
import { signUpBodySchema } from '@/schemas/auth'

export const usersRoutes = Router()
const usersController = new UsersController()

usersRoutes.post('/', validate({ body: signUpBodySchema }), usersController.create)
