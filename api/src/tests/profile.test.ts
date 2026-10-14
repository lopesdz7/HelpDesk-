import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import { app } from '@/app'
import { uploadConfig } from '@/configs/upload'
import { prisma } from '@/lib/prisma'
import {
  clearUploads,
  createAuthenticated,
  createService,
  createUser,
  DEFAULT_PASSWORD,
  resetDatabase,
} from './helpers'

// Arquivos mínimos: o multer valida extensão + mimetype, não o conteúdo.
const PNG = Buffer.from('89504e470d0a1a0a', 'hex')
const TXT = Buffer.from('não sou uma imagem')

beforeEach(async () => {
  await resetDatabase()
  clearUploads()
})
afterAll(async () => {
  clearUploads()
  await prisma.$disconnect()
})

describe('GET / PUT /profile', () => {
  it('devolve o próprio perfil sem senha', async () => {
    const { user, auth } = await createAuthenticated('technician', { availability: ['08:00'] })

    const response = await request(app).get('/profile').set(auth)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ id: user.id, availability: ['08:00'] })
    expect(response.body).not.toHaveProperty('password')
  })

  it('atualiza nome e e-mail', async () => {
    const { auth } = await createAuthenticated('client')

    const response = await request(app)
      .put('/profile')
      .set(auth)
      .send({ name: 'Novo Nome', email: 'novo@test.com' })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ name: 'Novo Nome', email: 'novo@test.com' })
  })

  it('não deixa o técnico alterar os próprios horários', async () => {
    const { user, auth } = await createAuthenticated('technician', { availability: ['08:00'] })

    await request(app)
      .put('/profile')
      .set(auth)
      .send({ name: 'Técnico', email: 'tec@test.com', availability: ['20:00'] })

    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(stored.availability).toEqual(['08:00'])
  })

  it('recusa e-mail de outro usuário com 409', async () => {
    await createUser('client', { email: 'ocupado@test.com' })
    const { auth } = await createAuthenticated('client')

    const response = await request(app)
      .put('/profile')
      .set(auth)
      .send({ name: 'Fulano', email: 'ocupado@test.com' })

    expect(response.status).toBe(409)
  })
})

describe('PATCH /profile/password', () => {
  it('troca a senha quando a atual confere', async () => {
    const { user, auth } = await createAuthenticated('client')

    const response = await request(app)
      .patch('/profile/password')
      .set(auth)
      .send({ currentPassword: DEFAULT_PASSWORD, newPassword: 'nova-senha' })

    expect(response.status).toBe(204)

    const login = await request(app)
      .post('/sessions')
      .send({ email: user.email, password: 'nova-senha' })
    expect(login.status).toBe(200)
  })

  it('recusa quando a senha atual está errada', async () => {
    const { auth } = await createAuthenticated('client')

    const response = await request(app)
      .patch('/profile/password')
      .set(auth)
      .send({ currentPassword: 'errada', newPassword: 'nova-senha' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('A senha atual está incorreta.')
  })
})

describe('PATCH / DELETE /profile/avatar', () => {
  it('envia avatar png e remove o antigo ao trocar', async () => {
    const { auth } = await createAuthenticated('client')

    const first = await request(app)
      .patch('/profile/avatar')
      .set(auth)
      .attach('avatar', PNG, 'foto.png')
    expect(first.status).toBe(200)
    const firstFile = path.join(uploadConfig.UPLOADS_FOLDER, first.body.avatar)
    expect(fs.existsSync(firstFile)).toBe(true)

    const second = await request(app)
      .patch('/profile/avatar')
      .set(auth)
      .attach('avatar', PNG, 'outra.png')
    expect(second.status).toBe(200)
    expect(fs.existsSync(firstFile)).toBe(false)
    expect(fs.existsSync(path.join(uploadConfig.UPLOADS_FOLDER, second.body.avatar))).toBe(true)

    const served = await request(app).get(`/uploads/${second.body.avatar}`)
    expect(served.status).toBe(200)
  })

  it('recusa arquivo que não seja jpg/png', async () => {
    const { auth } = await createAuthenticated('client')

    const response = await request(app)
      .patch('/profile/avatar')
      .set(auth)
      .attach('avatar', TXT, { filename: 'arquivo.txt', contentType: 'text/plain' })

    expect(response.status).toBe(400)
    expect(response.body.message).toMatch(/jpg ou \.png/)
  })

  it('recusa arquivo maior que 3 MB', async () => {
    const { auth } = await createAuthenticated('client')
    const big = Buffer.alloc(uploadConfig.MAX_FILE_SIZE + 1)

    const response = await request(app)
      .patch('/profile/avatar')
      .set(auth)
      .attach('avatar', big, 'grande.png')

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('O arquivo deve ter no máximo 3 MB.')
  })

  it('remove o avatar e apaga o arquivo', async () => {
    const { auth } = await createAuthenticated('client')
    const upload = await request(app)
      .patch('/profile/avatar')
      .set(auth)
      .attach('avatar', PNG, 'foto.png')
    const file = path.join(uploadConfig.UPLOADS_FOLDER, upload.body.avatar)

    const response = await request(app).delete('/profile/avatar').set(auth)

    expect(response.status).toBe(200)
    expect(response.body.avatar).toBeNull()
    expect(fs.existsSync(file)).toBe(false)
  })
})

describe('DELETE /profile', () => {
  it('cliente exclui a própria conta junto com os chamados', async () => {
    const { user, auth } = await createAuthenticated('client')
    const technician = await createUser('technician')
    const service = await createService()
    await prisma.ticket.create({
      data: {
        title: 'Chamado',
        description: 'Descrição',
        servicePrice: service.price,
        clientId: user.id,
        technicianId: technician.id,
        serviceId: service.id,
      },
    })

    const response = await request(app).delete('/profile').set(auth)

    expect(response.status).toBe(204)
    expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull()
    expect(await prisma.ticket.count()).toBe(0)
  })

  it.each(['technician', 'admin'] as const)('%s não pode excluir a própria conta (403)', async (role) => {
    const { auth } = await createAuthenticated(role)

    const response = await request(app).delete('/profile').set(auth)

    expect(response.status).toBe(403)
  })
})
