import request from 'supertest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { DEFAULT_AVAILABILITY } from '@/utils/availability'
import { createAuthenticated, createUser, resetDatabase } from './helpers'

beforeEach(resetDatabase)
afterAll(() => prisma.$disconnect())

describe('/technicians', () => {
  it.each(['client', 'technician'] as const)('%s não acessa /technicians (403)', async (role) => {
    const { auth } = await createAuthenticated(role)

    const response = await request(app).get('/technicians').set(auth)

    expect(response.status).toBe(403)
    expect(response.body).toEqual({ message: 'Você não tem permissão para acessar este recurso.' })
  })

  it('admin cria técnico com a disponibilidade padrão (08–12 e 14–18)', async () => {
    const { auth } = await createAuthenticated('admin')

    const response = await request(app)
      .post('/technicians')
      .set(auth)
      .send({ name: 'Técnico Novo', email: 'novo.tecnico@test.com', password: 'provisoria' })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({ role: 'technician', availability: DEFAULT_AVAILABILITY })
    expect(response.body).not.toHaveProperty('password')
    expect(DEFAULT_AVAILABILITY).toEqual([
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
    ])
  })

  it('ordena a disponibilidade informada', async () => {
    const { auth } = await createAuthenticated('admin')

    const response = await request(app)
      .post('/technicians')
      .set(auth)
      .send({
        name: 'Noturno',
        email: 'noturno@test.com',
        password: '123456',
        availability: ['22:00', '19:00', '07:00'],
      })

    expect(response.status).toBe(201)
    expect(response.body.availability).toEqual(['07:00', '19:00', '22:00'])
  })

  it.each([
    [['06:00'], 'antes das 07:00'],
    [['23:00'], 'bloco que terminaria depois das 23:00'],
    [['08:30'], 'fora do bloco de 1 hora'],
    [['08:00', '08:00'], 'repetido'],
  ])('recusa horário inválido: %j (%s)', async (availability) => {
    const { auth } = await createAuthenticated('admin')

    const response = await request(app)
      .post('/technicians')
      .set(auth)
      .send({ name: 'Técnico', email: 'tec@test.com', password: '123456', availability })

    expect(response.status).toBe(400)
  })

  it('recusa e-mail duplicado com 409', async () => {
    const { auth } = await createAuthenticated('admin')
    await createUser('client', { email: 'ja.existe@test.com' })

    const response = await request(app)
      .post('/technicians')
      .set(auth)
      .send({ name: 'Técnico', email: 'ja.existe@test.com', password: '123456' })

    expect(response.status).toBe(409)
  })

  it('lista técnicos paginados, sem incluir outros papéis', async () => {
    const { auth } = await createAuthenticated('admin')
    await createUser('technician', { name: 'Bruno' })
    await createUser('technician', { name: 'Ana' })
    await createUser('technician', { name: 'Carla' })
    await createUser('client')

    const response = await request(app).get('/technicians?page=1&perPage=2').set(auth)

    expect(response.status).toBe(200)
    expect(response.body.data.map((t: { name: string }) => t.name)).toEqual(['Ana', 'Bruno'])
    expect(response.body.meta).toEqual({ page: 1, perPage: 2, total: 3, totalPages: 2 })
  })

  it('mostra e edita um técnico (nome, e-mail e horários)', async () => {
    const { auth } = await createAuthenticated('admin')
    const technician = await createUser('technician', { availability: ['08:00'] })

    const show = await request(app).get(`/technicians/${technician.id}`).set(auth)
    expect(show.status).toBe(200)
    expect(show.body.id).toBe(technician.id)

    const response = await request(app)
      .put(`/technicians/${technician.id}`)
      .set(auth)
      .send({ name: 'Editado', email: 'editado@test.com', availability: ['18:00', '19:00'] })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      name: 'Editado',
      email: 'editado@test.com',
      availability: ['18:00', '19:00'],
    })
  })

  it('responde 404 para id que não é de técnico e 400 para id inválido', async () => {
    const { auth } = await createAuthenticated('admin')
    const client = await createUser('client')

    expect((await request(app).get(`/technicians/${client.id}`).set(auth)).status).toBe(404)
    expect((await request(app).get('/technicians/nao-e-uuid').set(auth)).status).toBe(400)
  })
})
