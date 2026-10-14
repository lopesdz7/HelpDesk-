import type { RequestHandler } from 'express'
import type { UserRole } from '@/generated/prisma/enums'
import { AppError } from '@/utils/AppError'

export function verifyUserAuthorization(roles: UserRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.user) throw new AppError('Não autenticado.', 401)
    if (!roles.includes(request.user.role)) {
      throw new AppError('Você não tem permissão para acessar este recurso.', 403)
    }
    next()
  }
}
