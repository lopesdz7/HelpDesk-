import request from 'supertest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { createUser, DEFAULT_PASSWORD, resetDatabase } from './helpers'

beforeEach(resetDatabase)
afterAll(() => prisma.$disconnect())

describe('POST /sessions', () => {
  it('autentica com credenciais válidas e devolve token + usuário sem senha', async () => {
    const user = await createUser('technician', { email: 'tecnico@test.com' })

    const response = await request(app)
      .post('/sessions')
      .send({ email: 'TECNICO@test.com', password: DEFAULT_PASSWORD })

    expect(response.status).toBe(200)
    expect(response.body.token).toEqual(expect.any(String))
    expect(response.body.user).toMatchObject({ id: user.id, role: 'technician' })
    expect(response.body.user).not.toHaveProperty('password')
  })

  it('recusa senha errada com 401', async () => {
    await createUser('client', { email: 'cliente@test.com' })

    const response = await request(app)
      .post('/sessions')
      .send({ email: 'cliente@test.com', password: 'senha-errada' })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: 'E-mail ou senha inválidos.' })
  })

  it('recusa usuário inexistente com 401 e a mesma mensagem', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({ email: 'ninguem@test.com', password: DEFAULT_PASSWORD })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: 'E-mail ou senha inválidos.' })
  })

  it('valida o body com Zod (400 com issues)', async () => {
    const response = await request(app).post('/sessions').send({ email: 'invalido' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Erro de validação.')
    expect(response.body.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'email' })]),
    )
  })
})

describe('Rotas protegidas', () => {
  it('exige token (401)', async () => {
    const response = await request(app).get('/profile')
    expect(response.status).toBe(401)
  })

  it('recusa token inválido (401)', async () => {
    const response = await request(app).get('/profile').set('Authorization', 'Bearer abc.def.ghi')
    expect(response.status).toBe(401)
  })

  it('aceita o token emitido pelo login', async () => {
    await createUser('client', { email: 'login@test.com' })
    const { body } = await request(app)
      .post('/sessions')
      .send({ email: 'login@test.com', password: DEFAULT_PASSWORD })

    const response = await request(app).get('/profile').set('Authorization', `Bearer ${body.token}`)

    expect(response.status).toBe(200)
    expect(response.body.email).toBe('login@test.com')
  })
})
