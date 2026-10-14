import type { ErrorRequestHandler } from 'express'
import { MulterError } from 'multer'
import { ZodError } from 'zod'
import { env } from '@/env'
import { AppError } from '@/utils/AppError'

export const errorHandling: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message })
    return
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Erro de validação.',
      issues: error.issues.map(({ path, message }) => ({ path: path.join('.'), message })),
    })
    return
  }

  if (error instanceof MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE' ? 'O arquivo deve ter no máximo 3 MB.' : error.message
    response.status(400).json({ message })
    return
  }

  // JSON malformado no body (body-parser)
  if (error?.type === 'entity.parse.failed') {
    response.status(400).json({ message: 'JSON inválido.' })
    return
  }

  if (env.NODE_ENV !== 'test') console.error(error)
  response.status(500).json({ message: 'Erro interno do servidor.' })
}
