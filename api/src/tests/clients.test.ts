import request from 'supertest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { createAuthenticated, createService, createUser, resetDatabase } from './helpers'

beforeEach(resetDatabase)
afterAll(() => prisma.$disconnect())

describe('/clients', () => {
  it('cliente não acessa /clients (403)', async () => {
    const { auth } = await createAuthenticated('client')
    expect((await request(app).get('/clients').set(auth)).status).toBe(403)
  })

  it('admin lista apenas clientes, paginados', async () => {
    const { auth } = await createAuthenticated('admin')
    await createUser('client', { name: 'Zeca' })
    await createUser('client', { name: 'Alice' })
    await createUser('technician')

    const response = await request(app).get('/clients').set(auth)

    expect(response.status).toBe(200)
    expect(response.body.data.map((c: { name: string }) => c.name)).toEqual(['Alice', 'Zeca'])
    expect(response.body.meta.total).toBe(2)
  })

  it('admin edita um cliente', async () => {
    const { auth } = await createAuthenticated('admin')
    const client = await createUser('client')

    const response = await request(app)
      .put(`/clients/${client.id}`)
      .set(auth)
      .send({ name: 'Cliente Editado', email: 'editado@test.com' })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ name: 'Cliente Editado', email: 'editado@test.com' })
  })

  it('admin exclui um cliente e os chamados dele', async () => {
    const { auth } = await createAuthenticated('admin')
    const client = await createUser('client')
    const technician = await createUser('technician')
    const service = await createService()
    await prisma.ticket.create({
      data: {
        title: 'Chamado',
        description: 'Descrição',
        servicePrice: service.price,
        clientId: client.id,
        technicianId: technician.id,
        serviceId: service.id,
      },
    })

    const response = await request(app).delete(`/clients/${client.id}`).set(auth)

    expect(response.status).toBe(204)
    expect(await prisma.user.findUnique({ where: { id: client.id } })).toBeNull()
    expect(await prisma.ticket.count()).toBe(0)
  })

  it('não exclui técnico pela rota de clientes (404)', async () => {
    const { auth } = await createAuthenticated('admin')
    const technician = await createUser('technician')

    const response = await request(app).delete(`/clients/${technician.id}`).set(auth)

    expect(response.status).toBe(404)
    expect(await prisma.user.findUnique({ where: { id: technician.id } })).not.toBeNull()
  })
})
