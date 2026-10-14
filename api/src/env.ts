import { config } from 'dotenv'
import { z } from 'zod'

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env', quiet: true })

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CORS_ORIGIN: z.string().default('*'),
  TZ_BUSINESS: z.string().default('America/Sao_Paulo'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:', z.treeifyError(parsed.error))
  throw new Error('Variáveis de ambiente inválidas.')
}

export const env = parsed.data
