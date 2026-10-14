import type { Request, Response } from 'express'
import type { z } from 'zod'
import { uploadConfig } from '@/configs/upload'
import { prisma } from '@/lib/prisma'
import { ensureEmailAvailable, findUserOrFail, userSelect } from '@/lib/users'
import type { profileBodySchema } from '@/schemas/auth'

export class ProfileController {
  async show(request: Request, response: Response) {
    response.json(await findUserOrFail(request.user!.id))
  }

  async update(request: Request, response: Response) {
    const { name, email } = request.body as z.infer<typeof profileBodySchema>
    const { id } = request.user!

    await findUserOrFail(id)
    await ensureEmailAvailable(email, id)

    const user = await prisma.user.update({
      where: { id },
      data: { name, email },
      select: userSelect,
    })

    response.json(user)
  }

  /** Só clientes excluem a própria conta; os chamados dele vão junto (cascade). */
  async delete(request: Request, response: Response) {
    const user = await findUserOrFail(request.user!.id)

    await prisma.user.delete({ where: { id: user.id } })
    if (user.avatar) await uploadConfig.deleteFile(user.avatar)

    response.status(204).send()
  }
}
