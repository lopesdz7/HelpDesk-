import type { Request, Response } from 'express'
import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ensureEmailAvailable, hashPassword, userSelect } from '@/lib/users'
import type { signUpBodySchema } from '@/schemas/auth'

/** Cadastro público — sempre cria um cliente. */
export class UsersController {
  async create(request: Request, response: Response) {
    const { name, email, password } = request.body as z.infer<typeof signUpBodySchema>

    await ensureEmailAvailable(email)

    const user = await prisma.user.create({
      data: { name, email, password: await hashPassword(password), role: 'client' },
      select: userSelect,
    })

    response.status(201).json(user)
  }
}
