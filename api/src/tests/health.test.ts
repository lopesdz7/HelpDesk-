import request from 'supertest'
import { app } from '@/app'

describe('GET /health', () => {
  it('responde com status ok', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('responde 404 padronizado para rota inexistente', async () => {
    const response = await request(app).get('/nao-existe')
    expect(response.status).toBe(404)
    expect(response.body).toEqual({ message: 'Rota não encontrada.' })
  })
})
