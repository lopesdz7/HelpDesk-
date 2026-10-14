import type { RequestHandler } from 'express'
import { verify } from 'jsonwebtoken'
import { authConfig } from '@/configs/auth'
import type { UserRole } from '@/generated/prisma/enums'
import { AppError } from '@/utils/AppError'

type TokenPayload = { sub: string; role: UserRole }

export const ensureAuthenticated: RequestHandler = (request, _response, next) => {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? []

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Token de autenticação não informado.', 401)
  }

  try {
    const { sub, role } = verify(token, authConfig.jwt.secret) as TokenPayload
    request.user = { id: sub, role }
    next()
  } catch {
    throw new AppError('Token de autenticação inválido ou expirado.', 401)
  }
}
