import request from 'supertest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { resetDatabase } from './helpers'

beforeEach(resetDatabase)
afterAll(() => prisma.$disconnect())

describe('POST /users (cadastro de cliente)', () => {
  const body = { name: 'Maria Souza', email: 'maria@test.com', password: '123456' }

  it('cria um cliente e não devolve a senha', async () => {
    const response = await request(app).post('/users').send(body)

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      name: 'Maria Souza',
      email: 'maria@test.com',
      role: 'client',
    })
    expect(response.body).not.toHaveProperty('password')

    const stored = await prisma.user.findUniqueOrThrow({ where: { email: 'maria@test.com' } })
    expect(stored.password).not.toBe('123456')
  })

  it('ignora tentativa de escolher o papel no cadastro', async () => {
    const response = await request(app)
      .post('/users')
      .send({ ...body, role: 'admin' })

    expect(response.status).toBe(201)
    expect(response.body.role).toBe('client')
  })

  it('recusa e-mail duplicado com 409', async () => {
    await request(app).post('/users').send(body)

    const response = await request(app)
      .post('/users')
      .send({ ...body, email: 'MARIA@test.com' })

    expect(response.status).toBe(409)
    expect(response.body).toEqual({ message: 'Este e-mail já está em uso.' })
  })

  it('exige senha com pelo menos 6 caracteres', async () => {
    const response = await request(app)
      .post('/users')
      .send({ ...body, password: '123' })

    expect(response.status).toBe(400)
    expect(response.body.issues[0]).toMatchObject({ path: 'password' })
  })
})
