import { Router } from 'express'
import { uploadConfig } from '@/configs/upload'
import { ProfileAvatarController } from '@/controllers/ProfileAvatarController'
import { ProfileController } from '@/controllers/ProfileController'
import { ProfilePasswordController } from '@/controllers/ProfilePasswordController'
import { validate } from '@/middlewares/validate'
import { verifyUserAuthorization } from '@/middlewares/verifyUserAuthorization'
import { passwordBodySchema, profileBodySchema } from '@/schemas/auth'

export const profileRoutes = Router()
const profileController = new ProfileController()
const passwordController = new ProfilePasswordController()
const avatarController = new ProfileAvatarController()

profileRoutes.get('/', profileController.show)
profileRoutes.put('/', validate({ body: profileBodySchema }), profileController.update)
profileRoutes.delete('/', verifyUserAuthorization(['client']), profileController.delete)

profileRoutes.patch('/password', validate({ body: passwordBodySchema }), passwordController.update)

// O "body" do avatar é multipart; a validação de tipo e tamanho fica no multer (configs/upload).
profileRoutes.patch('/avatar', uploadConfig.avatar.single('avatar'), avatarController.update)
profileRoutes.delete('/avatar', avatarController.delete)
