import request from 'supertest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { createAuthenticated, createService, createUser, resetDatabase } from './helpers'

beforeEach(resetDatabase)
afterAll(() => prisma.$disconnect())

describe('/services', () => {
  it('admin cria serviço com preço numérico', async () => {
    const { auth } = await createAuthenticated('admin')

    const response = await request(app)
      .post('/services')
      .set(auth)
      .send({ title: 'Formatação', price: 149.9 })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({ title: 'Formatação', price: 149.9, active: true })
  })

  it('recusa preço zero ou negativo', async () => {
    const { auth } = await createAuthenticated('admin')

    const response = await request(app)
      .post('/services')
      .set(auth)
      .send({ title: 'Grátis', price: 0 })

    expect(response.status).toBe(400)
  })

  it.each(['client', 'technician'] as const)('%s não cria serviço (403)', async (role) => {
    const { auth } = await createAuthenticated(role)

    const response = await request(app)
      .post('/services')
      .set(auth)
      .send({ title: 'Serviço', price: 10 })

    expect(response.status).toBe(403)
  })

  it('admin edita título e preço', async () => {
    const { auth } = await createAuthenticated('admin')
    const service = await createService({ price: '100.00' })

    const response = await request(app)
      .put(`/services/${service.id}`)
      .set(auth)
      .send({ title: 'Renomeado', price: '250.50' })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ title: 'Renomeado', price: 250.5 })
  })

  it('serviço desativado some para o cliente, continua para o admin e não altera chamados antigos', async () => {
    const admin = await createAuthenticated('admin')
    const client = await createAuthenticated('client')
    const technician = await createUser('technician')
    const service = await createService({ title: 'Antigo', price: '80.00' })
    await createService({ title: 'Ativo' })

    const ticket = await prisma.ticket.create({
      data: {
        title: 'Chamado antigo',
        description: 'Aberto antes da desativação',
        servicePrice: service.price,
        clientId: client.user.id,
        technicianId: technician.id,
        serviceId: service.id,
      },
    })

    const deactivate = await request(app)
      .patch(`/services/${service.id}/status`)
      .set(admin.auth)
      .send({ active: false })
    expect(deactivate.status).toBe(200)
    expect(deactivate.body.active).toBe(false)

    const asClient = await request(app).get('/services').set(client.auth)
    expect(asClient.body.data.map((s: { title: string }) => s.title)).toEqual(['Ativo'])

    // Mesmo pedindo explicitamente os inativos, o cliente só vê os ativos.
    const asClientInactive = await request(app).get('/services?active=false').set(client.auth)
    expect(asClientInactive.body.data.map((s: { title: string }) => s.title)).toEqual(['Ativo'])

    const asAdmin = await request(app).get('/services').set(admin.auth)
    expect(asAdmin.body.meta.total).toBe(2)

    const inactiveOnly = await request(app).get('/services?active=false').set(admin.auth)
    expect(inactiveOnly.body.data.map((s: { title: string }) => s.title)).toEqual(['Antigo'])

    // O serviço não foi apagado e o chamado continua com o mesmo serviço e preço.
    const storedTicket = await prisma.ticket.findUniqueOrThrow({ where: { id: ticket.id } })
    expect(storedTicket.serviceId).toBe(service.id)
    expect(storedTicket.servicePrice.toNumber()).toBe(80)
    expect(await prisma.service.count()).toBe(2)
  })

  it('reativa um serviço', async () => {
    const { auth } = await createAuthenticated('admin')
    const service = await createService({ active: false })

    const response = await request(app)
      .patch(`/services/${service.id}/status`)
      .set(auth)
      .send({ active: true })

    expect(response.status).toBe(200)
    expect(response.body.active).toBe(true)
  })

  it('responde 404 para serviço inexistente', async () => {
    const { auth } = await createAuthenticated('admin')

    const response = await request(app)
      .put('/services/00000000-0000-4000-8000-000000000000')
      .set(auth)
      .send({ title: 'X serviço', price: 10 })

    expect(response.status).toBe(404)
  })
})
