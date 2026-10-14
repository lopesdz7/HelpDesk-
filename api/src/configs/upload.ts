import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import multer from 'multer'
import { env } from '@/env'
import { AppError } from '@/utils/AppError'

const UPLOADS_FOLDER = env.UPLOADS_DIR
  ? path.resolve(env.UPLOADS_DIR)
  : path.resolve(__dirname, '..', '..', 'uploads')
const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3 MB
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png']
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png']

const avatar = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => {
      fs.mkdir(UPLOADS_FOLDER, { recursive: true }).then(
        () => callback(null, UPLOADS_FOLDER),
        (error: Error) => callback(error, UPLOADS_FOLDER),
      )
    },
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase()
      callback(null, `${crypto.randomUUID()}${extension}`)
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    if (ACCEPTED_MIME_TYPES.includes(file.mimetype) && ACCEPTED_EXTENSIONS.includes(extension)) {
      callback(null, true)
      return
    }
    callback(new AppError('Formato inválido. Envie uma imagem .jpg ou .png.'))
  },
})

/** Remove um arquivo da pasta de uploads, ignorando se ele já não existir. */
async function deleteFile(filename: string) {
  await fs.rm(path.join(UPLOADS_FOLDER, path.basename(filename)), { force: true })
}

export const uploadConfig = { UPLOADS_FOLDER, MAX_FILE_SIZE, avatar, deleteFile }
