import {
  getBusinessHour,
  pickTechnician,
  type TechnicianCandidate,
} from '@/services/assignTechnician'

const candidate = (
  id: string,
  availability: string[],
  load = 0,
  createdAt = new Date('2026-01-01T00:00:00Z'),
): TechnicianCandidate => ({ id, availability, load, createdAt })

describe('getBusinessHour', () => {
  it('converte para o bloco de 1 hora no fuso de São Paulo', () => {
    // 13:45 UTC = 10:45 em São Paulo (UTC-3)
    expect(getBusinessHour(new Date('2026-10-14T13:45:00Z'), 'America/Sao_Paulo')).toBe('10:00')
    // 02:10 UTC = 23:10 do dia anterior
    expect(getBusinessHour(new Date('2026-10-14T02:10:00Z'), 'America/Sao_Paulo')).toBe('23:00')
    // meia-noite vira "00:00", não "24:00"
    expect(getBusinessHour(new Date('2026-10-14T03:00:00Z'), 'America/Sao_Paulo')).toBe('00:00')
  })
})

describe('pickTechnician', () => {
  it('escolhe quem está disponível no horário', () => {
    const chosen = pickTechnician(
      [candidate('manha', ['08:00', '09:00']), candidate('noite', ['20:00'])],
      '20:00',
    )
    expect(chosen?.id).toBe('noite')
  })

  it('entre vários disponíveis, escolhe o de menor carga', () => {
    const chosen = pickTechnician(
      [candidate('ocupado', ['10:00'], 5), candidate('livre', ['10:00'], 1)],
      '10:00',
    )
    expect(chosen?.id).toBe('livre')
  })

  it('prefere um disponível mesmo que outro indisponível tenha menos carga', () => {
    const chosen = pickTechnician(
      [candidate('indisponivel', ['08:00'], 0), candidate('disponivel', ['15:00'], 9)],
      '15:00',
    )
    expect(chosen?.id).toBe('disponivel')
  })

  it('sem ninguém disponível, escolhe o de menor carga entre todos', () => {
    const chosen = pickTechnician(
      [candidate('a', ['08:00'], 3), candidate('b', ['09:00'], 1), candidate('c', ['10:00'], 2)],
      '23:00',
    )
    expect(chosen?.id).toBe('b')
  })

  it('no empate de carga, escolhe o cadastrado há mais tempo', () => {
    const chosen = pickTechnician(
      [
        candidate('novo', ['10:00'], 1, new Date('2026-05-01')),
        candidate('antigo', ['10:00'], 1, new Date('2026-01-01')),
      ],
      '10:00',
    )
    expect(chosen?.id).toBe('antigo')
  })

  it('devolve undefined quando não há técnicos', () => {
    expect(pickTechnician([], '10:00')).toBeUndefined()
  })
})
