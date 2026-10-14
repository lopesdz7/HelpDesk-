import { compare } from 'bcryptjs'
import type { Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import type { z } from 'zod'
import { authConfig } from '@/configs/auth'
import { prisma } from '@/lib/prisma'
import type { sessionBodySchema } from '@/schemas/auth'
import { AppError } from '@/utils/AppError'

export class SessionsController {
  async create(request: Request, response: Response) {
    const { email, password } = request.body as z.infer<typeof sessionBodySchema>

    const user = await prisma.user.findUnique({ where: { email } })
    // Mesma mensagem para e-mail inexistente e senha errada, para não revelar quais e-mails existem.
    const passwordMatches = user ? await compare(password, user.password) : false

    if (!user || !passwordMatches) {
      throw new AppError('E-mail ou senha inválidos.', 401)
    }

    const token = sign({ role: user.role }, authConfig.jwt.secret, {
      subject: user.id,
      expiresIn: authConfig.jwt.expiresIn,
    })

    const { password: _password, ...userWithoutPassword } = user
    response.json({ token, user: userWithoutPassword })
  }
}
