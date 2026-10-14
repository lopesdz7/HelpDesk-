import type { Request, Response } from 'express'
import { uploadConfig } from '@/configs/upload'
import { prisma } from '@/lib/prisma'
import { findUserOrFail, userSelect } from '@/lib/users'
import { AppError } from '@/utils/AppError'

export class ProfileAvatarController {
  async update(request: Request, response: Response) {
    const file = request.file
    if (!file) throw new AppError('Envie uma imagem no campo "avatar".')

    try {
      const current = await findUserOrFail(request.user!.id)

      const user = await prisma.user.update({
        where: { id: current.id },
        data: { avatar: file.filename },
        select: userSelect,
      })

      if (current.avatar) await uploadConfig.deleteFile(current.avatar)
      response.json(user)
    } catch (error) {
      // Não deixa arquivo órfão na pasta de uploads se algo falhar.
      await uploadConfig.deleteFile(file.filename)
      throw error
    }
  }

  async delete(request: Request, response: Response) {
    const current = await findUserOrFail(request.user!.id)

    const user = await prisma.user.update({
      where: { id: current.id },
      data: { avatar: null },
      select: userSelect,
    })

    if (current.avatar) await uploadConfig.deleteFile(current.avatar)
    response.json(user)
  }
}
