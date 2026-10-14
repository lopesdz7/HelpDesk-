import cors from 'cors'
import express from 'express'
import { env } from '@/env'
import { errorHandling } from '@/middlewares/errorHandling'
import { routes } from '@/routes'

export const app = express()

app.use(cors({ origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',') }))
app.use(express.json())
app.use(routes)
app.use((_request, response) => {
  response.status(404).json({ message: 'Rota não encontrada.' })
})
app.use(errorHandling)
