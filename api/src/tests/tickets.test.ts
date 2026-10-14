import request from 'supertest'
import { app } from '@/app'
import type { TicketStatus } from '@/generated/prisma/enums'
import { prisma } from '@/lib/prisma'
import { hourRange } from '@/utils/availability'
import { createAuthenticated, createService, createUser, resetDatabase } from './helpers'

beforeEach(resetDatabase)
afterEach(() => jest.useRealTimers())
afterAll(() => prisma.$disconnect())

/** Simula só o relógio (Date); timers reais continuam funcionando para o driver do Postgres. */
function setNow(isoDate: string) {
  jest.useFakeTimers({
    doNotFake: [
      'hrtime',
      'nextTick',
      'performance',
      'queueMicrotask',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback',
      'setImmediate',
      'clearImmediate',
      'setInterval',
      'clearInterval',
      'setTimeout',
      'clearTimeout',
    ],
    now: new Date(isoDate),
  })
}

async function createTicket(
  overrides: {
    clientId?: string
    technicianId?: string
    status?: TicketStatus
    price?: string
  } = {},
) {
  const service = await createService({ price: overrides.price ?? '100.00' })
  const clientId = overrides.clientId ?? (await createUser('client')).id
  const technicianId = overrides.technicianId ?? (await createUser('technician')).id
  return prisma.ticket.create({
    data: {
      title: 'Chamado de teste',
      description: 'Descrição do chamado de teste',
      status: overrides.status ?? 'open',
      servicePrice: service.price,
      serviceId: service.id,
      clientId,
      technicianId,
    },
  })
}

describe('POST /tickets', () => {
  it('cliente cria chamado, grava o preço do serviço e atribui o técnico disponível no horário', async () => {
    // 10:30 em São Paulo
    setNow('2026-10-14T13:30:00Z')
    const { user: client, auth } = await createAuthenticated('client')
    await createUser('technician', { name: 'Manhã', availability: hourRange(8, 10) })
    const available = await createUser('technician', {
      name: 'Meio-dia',
      availability: hourRange(10, 14),
    })
    const service = await createService({ price: '150.00' })

    const response = await request(app)
      .post('/tickets')
      .set(auth)
      .send({
        title: 'PC lento',
        description: 'O computador está muito lento',
        serviceId: service.id,
      })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      code: 1,
      status: 'open',
      servicePrice: 150,
      total: 150,
      client: { id: client.id },
      technician: { id: available.id, name: 'Meio-dia' },
      service: { id: service.id },
    })
  })

  it('sem técnico disponível no horário, atribui ao de menor carga', async () => {
    // 23:30 em São Paulo — ninguém trabalha
    setNow('2026-10-15T02:30:00Z')
    const { auth } = await createAuthenticated('client')
    const busy = await createUser('technician', { availability: hourRange(8, 12) })
    const free = await createUser('technician', { availability: hourRange(14, 18) })
    await createTicket({ technicianId: busy.id, status: 'open' })
    await createTicket({ technicianId: busy.id, status: 'in_progress' })
    await createTicket({ technicianId: free.id, status: 'in_progress' })
    // Chamados encerrados não contam como carga.
    await createTicket({ technicianId: free.id, status: 'closed' })
    await createTicket({ technicianId: free.id, status: 'closed' })
    const service = await createService()

    const response = await request(app)
      .post('/tickets')
      .set(auth)
      .send({
        title: 'Sem internet',
        description: 'A rede caiu no escritório',
        serviceId: service.id,
      })

    expect(response.status).toBe(201)
    expect(response.body.technician.id).toBe(free.id)
  })

  it('recusa serviço desativado', async () => {
    const { auth } = await createAuthenticated('client')
    await createUser('technician')
    const service = await createService({ active: false })

    const response = await request(app)
      .post('/tickets')
      .set(auth)
      .send({ title: 'Chamado', description: 'Descrição suficiente', serviceId: service.id })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Este serviço não está mais disponível.')
  })

  it.each(['technician', 'admin'] as const)('%s não cria chamado (403)', async (role) => {
    const { auth } = await createAuthenticated(role)
    const service = await createService()

    const response = await request(app)
      .post('/tickets')
      .set(auth)
      .send({ title: 'Chamado', description: 'Descrição suficiente', serviceId: service.id })

    expect(response.status).toBe(403)
  })

  it('valida o body (400)', async () => {
    const { auth } = await createAuthenticated('client')

    const response = await request(app).post('/tickets').set(auth).send({ title: 'x' })

    expect(response.status).toBe(400)
    expect(response.body.issues.map((issue: { path: string }) => issue.path)).toEqual(
      expect.arrayContaining(['title', 'description', 'serviceId']),
    )
  })
})

describe('GET /tickets e /tickets/:id', () => {
  it('aplica o escopo por papel e o filtro de status', async () => {
    const client = await createAuthenticated('client')
    const technician = await createAuthenticated('technician')
    const admin = await createAuthenticated('admin')
    await createTicket({ clientId: client.user.id, technicianId: technician.user.id })
    await createTicket({
      clientId: client.user.id,
      technicianId: technician.user.id,
      status: 'closed',
    })
    await createTicket() // de outro cliente e outro técnico

    const asClient = await request(app).get('/tickets').set(client.auth)
    const asTechnician = await request(app).get('/tickets').set(technician.auth)
    const asAdmin = await request(app).get('/tickets').set(admin.auth)
    const closedOnly = await request(app).get('/tickets?status=closed').set(technician.auth)

    expect(asClient.body.meta.total).toBe(2)
    expect(asTechnician.body.meta.total).toBe(2)
    expect(asAdmin.body.meta.total).toBe(3)
    expect(closedOnly.body.data).toHaveLength(1)
    expect(closedOnly.body.data[0].status).toBe('closed')
  })

  it('técnico não vê chamado de outro técnico (403)', async () => {
    const { auth } = await createAuthenticated('technician')
    const ticket = await createTicket()

    const response = await request(app).get(`/tickets/${ticket.id}`).set(auth)

    expect(response.status).toBe(403)
  })

  it('cliente não vê chamado de outro cliente (403)', async () => {
    const { auth } = await createAuthenticated('client')
    const ticket = await createTicket()

    expect((await request(app).get(`/tickets/${ticket.id}`).set(auth)).status).toBe(403)
  })

  it('dono, técnico atribuído e admin veem o detalhe', async () => {
    const client = await createAuthenticated('client')
    const technician = await createAuthenticated('technician')
    const admin = await createAuthenticated('admin')
    const ticket = await createTicket({
      clientId: client.user.id,
      technicianId: technician.user.id,
    })

    for (const { auth } of [client, technician, admin]) {
      const response = await request(app).get(`/tickets/${ticket.id}`).set(auth)
      expect(response.status).toBe(200)
      expect(response.body.id).toBe(ticket.id)
    }
  })

  it('responde 404 para chamado inexistente', async () => {
    const { auth } = await createAuthenticated('admin')
    const response = await request(app)
      .get('/tickets/00000000-0000-4000-8000-000000000000')
      .set(auth)
    expect(response.status).toBe(404)
  })
})

describe('PATCH /tickets/:id/status', () => {
  it('técnico atribuído avança aberto → em atendimento → encerrado', async () => {
    const { user, auth } = await createAuthenticated('technician')
    const ticket = await createTicket({ technicianId: user.id })

    const start = await request(app)
      .patch(`/tickets/${ticket.id}/status`)
      .set(auth)
      .send({ status: 'in_progress' })
    expect(start.status).toBe(200)
    expect(start.body.status).toBe('in_progress')

    const close = await request(app)
      .patch(`/tickets/${ticket.id}/status`)
      .set(auth)
      .send({ status: 'closed' })
    expect(close.status).toBe(200)
    expect(close.body.status).toBe('closed')
  })

  it.each([
    ['open', 'closed'],
    ['in_progress', 'open'],
    ['closed', 'in_progress'],
    ['open', 'open'],
  ] as const)('técnico não pode ir de %s para %s (400)', async (from, to) => {
    const { user, auth } = await createAuthenticated('technician')
    const ticket = await createTicket({ technicianId: user.id, status: from })

    const response = await request(app)
      .patch(`/tickets/${ticket.id}/status`)
      .set(auth)
      .send({ status: to })

    expect(response.status).toBe(400)
  })

  it('técnico não altera chamado de outro técnico (403)', async () => {
    const { auth } = await createAuthenticated('technician')
    const ticket = await createTicket()

    const response = await request(app)
      .patch(`/tickets/${ticket.id}/status`)
      .set(auth)
      .send({ status: 'in_progress' })

    expect(response.status).toBe(403)
  })

  it('admin pode definir qualquer status, inclusive reabrir', async () => {
    const { auth } = await createAuthenticated('admin')
    const ticket = await createTicket({ status: 'closed' })

    const response = await request(app)
      .patch(`/tickets/${ticket.id}/status`)
      .set(auth)
      .send({ status: 'open' })

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('open')
  })

  it('cliente não altera status (403)', async () => {
    const { user, auth } = await createAuthenticated('client')
    const ticket = await createTicket({ clientId: user.id })

    const response = await request(app)
      .patch(`/tickets/${ticket.id}/status`)
      .set(auth)
      .send({ status: 'closed' })

    expect(response.status).toBe(403)
  })
})

describe('Serviços adicionais e valor total', () => {
  it('calcula o total = serviço base + adicionais, ao adicionar e remover', async () => {
    const { user, auth } = await createAuthenticated('technician')
    const ticket = await createTicket({
      technicianId: user.id,
      status: 'in_progress',
      price: '200.00',
    })

    const first = await request(app)
      .post(`/tickets/${ticket.id}/additional-services`)
      .set(auth)
      .send({ title: 'Troca de memória RAM', price: 180.5 })
    expect(first.status).toBe(201)
    expect(first.body).toMatchObject({ servicePrice: 200, additionalTotal: 180.5, total: 380.5 })

    const second = await request(app)
      .post(`/tickets/${ticket.id}/additional-services`)
      .set(auth)
      .send({ title: 'Cabo de rede', price: '19.70' })
    expect(second.body.total).toBe(400.2)
    expect(second.body.additionalServices).toHaveLength(2)

    const removedId = second.body.additionalServices[0].id
    const removed = await request(app)
      .delete(`/tickets/${ticket.id}/additional-services/${removedId}`)
      .set(auth)
    expect(removed.status).toBe(200)
    expect(removed.body.additionalServices).toHaveLength(1)
    expect(removed.body.total).toBe(219.7)
  })

  it('o total usa o preço do momento da abertura, mesmo que o serviço mude depois', async () => {
    const admin = await createAuthenticated('admin')
    const ticket = await createTicket({ price: '100.00' })

    await request(app)
      .put(`/services/${ticket.serviceId}`)
      .set(admin.auth)
      .send({ title: 'Serviço reajustado', price: 999 })

    const response = await request(app).get(`/tickets/${ticket.id}`).set(admin.auth)
    expect(response.body.servicePrice).toBe(100)
    expect(response.body.total).toBe(100)
  })

  it.each(['open', 'closed'] as const)(
    'não permite alterar adicionais com o chamado %s (400)',
    async (status) => {
      const { user, auth } = await createAuthenticated('technician')
      const ticket = await createTicket({ technicianId: user.id, status })

      const response = await request(app)
        .post(`/tickets/${ticket.id}/additional-services`)
        .set(auth)
        .send({ title: 'Peça', price: 10 })

      expect(response.status).toBe(400)
    },
  )

  it('outro técnico não adiciona serviço (403) e admin/cliente também não', async () => {
    const other = await createAuthenticated('technician')
    const admin = await createAuthenticated('admin')
    const client = await createAuthenticated('client')
    const ticket = await createTicket({ clientId: client.user.id, status: 'in_progress' })

    for (const { auth } of [other, admin, client]) {
      const response = await request(app)
        .post(`/tickets/${ticket.id}/additional-services`)
        .set(auth)
        .send({ title: 'Peça', price: 10 })
      expect(response.status).toBe(403)
    }
  })

  it('responde 404 ao remover adicional que não pertence ao chamado', async () => {
    const { user, auth } = await createAuthenticated('technician')
    const ticket = await createTicket({ technicianId: user.id, status: 'in_progress' })

    const response = await request(app)
      .delete(`/tickets/${ticket.id}/additional-services/00000000-0000-4000-8000-000000000000`)
      .set(auth)

    expect(response.status).toBe(404)
  })
})
