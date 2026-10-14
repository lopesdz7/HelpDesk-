/**
 * Alternativa ao docker-compose para máquinas sem Docker: sobe um PostgreSQL 16
 * embutido (binários baixados pelo pacote `embedded-postgres`) em localhost:5432,
 * com os bancos `helpdesk` (dev) e `helpdesk_test` (testes). Ctrl+C encerra.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import EmbeddedPostgres from 'embedded-postgres'

const databaseDir = path.resolve(__dirname, '..', '.pgdata')
const databases = ['helpdesk', 'helpdesk_test']

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir,
    user: 'postgres',
    password: 'postgres',
    port: 5432,
    persistent: true,
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
  })

  if (!existsSync(databaseDir)) await pg.initialise()
  await pg.start()

  const client = pg.getPgClient()
  await client.connect()
  for (const name of databases) {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name])
    if (!rowCount) await pg.createDatabase(name)
  }
  await client.end()

  console.log(`PostgreSQL rodando em localhost:5432 (${databases.join(', ')})`)

  const stop = async () => {
    await pg.stop()
    process.exit(0)
  }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
