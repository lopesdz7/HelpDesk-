import { compare } from 'bcryptjs'
import type { Request, Response } from 'express'
import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/users'
import type { passwordBodySchema } from '@/schemas/auth'
import { AppError } from '@/utils/AppError'

export class ProfilePasswordController {
  async update(request: Request, response: Response) {
    const { currentPassword, newPassword } = request.body as z.infer<typeof passwordBodySchema>

    const user = await prisma.user.findUnique({ where: { id: request.user!.id } })
    if (!user) throw new AppError('Usuário não encontrado.', 404)

    if (!(await compare(currentPassword, user.password))) {
      throw new AppError('A senha atual está incorreta.')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(newPassword) },
    })

    response.status(204).send()
  }
}
