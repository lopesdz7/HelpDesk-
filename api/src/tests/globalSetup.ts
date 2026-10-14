import { execSync } from 'node:child_process'

/**
 * Aplica as migrations no banco de teste (DATABASE_URL de .env.test).
 * Os dados são limpos por suíte com `resetDatabase()` (TRUNCATE).
 */
export default function globalSetup() {
  execSync('npx prisma migrate deploy', {
    stdio: 'ignore',
    env: { ...process.env, NODE_ENV: 'test' },
  })
}
