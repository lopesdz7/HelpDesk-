import { hash } from 'bcryptjs'
import type { Service } from '../src/generated/prisma/client'
import { prisma } from '../src/lib/prisma'
import { hourRange } from '../src/utils/availability'

const PASSWORD = '123456'

const services = [
  { title: 'Instalação e atualização de softwares', price: '120.00' },
  { title: 'Instalação e atualização de hardwares', price: '180.00' },
  { title: 'Diagnóstico e remoção de vírus', price: '150.00' },
  { title: 'Suporte a impressoras', price: '90.00' },
  { title: 'Suporte a periféricos', price: '80.00' },
  { title: 'Solução de problemas de conectividade de internet', price: '110.00' },
  { title: 'Backup e recuperação de dados', price: '200.00' },
  { title: 'Otimização de desempenho do sistema operacional', price: '130.00' },
  { title: 'Configuração de VPN e Acesso Remoto', price: '160.00' },
]

const technicians = [
  {
    name: 'Carlos Silva',
    email: 'carlos.silva@test.com',
    availability: [...hourRange(8, 12), ...hourRange(14, 18)],
  },
  {
    name: 'Ana Oliveira',
    email: 'ana.oliveira@test.com',
    availability: [...hourRange(10, 14), ...hourRange(16, 20)],
  },
  {
    name: 'Lucas Martins',
    email: 'lucas.martins@test.com',
    availability: [...hourRange(12, 16), ...hourRange(18, 22)],
  },
]

const clients = [
  { name: 'André Costa', email: 'andre.costa@test.com' },
  { name: 'Julia Maria', email: 'julia.maria@test.com' },
]

async function main() {
  const alreadySeeded = await prisma.user.findUnique({ where: { email: 'admin@test.com' } })
  if (alreadySeeded) {
    console.log('Banco já populado (admin@test.com existe). Nada a fazer.')
    return
  }

  const password = await hash(PASSWORD, 8)

  await prisma.user.create({
    data: { name: 'Administrador', email: 'admin@test.com', password, role: 'admin' },
  })

  const [carlos, ana, lucas] = await Promise.all(
    technicians.map((technician) =>
      prisma.user.create({ data: { ...technician, password, role: 'technician' } }),
    ),
  )

  const [andre, julia] = await Promise.all(
    clients.map((client) => prisma.user.create({ data: { ...client, password, role: 'client' } })),
  )

  const createdServices: Service[] = []
  for (const service of services) {
    createdServices.push(await prisma.service.create({ data: service }))
  }
  const service = (title: string) => createdServices.find((item) => item.title === title)!

  // Chamados criados em sequência para que o `code` (#00001…) siga a ordem abaixo.
  const tickets = [
    {
      title: 'Computador não liga',
      description: 'O computador do escritório não liga desde ontem, nem a luz acende.',
      status: 'closed' as const,
      client: andre!,
      technician: carlos!,
      service: service('Instalação e atualização de hardwares'),
      additional: [{ title: 'Troca de fonte de alimentação', price: '220.00' }],
    },
    {
      title: 'Backup não está funcionando',
      description: 'O backup automático parou de rodar na última semana.',
      status: 'in_progress' as const,
      client: julia!,
      technician: ana!,
      service: service('Backup e recuperação de dados'),
      additional: [{ title: 'Assinatura de backup em nuvem (1 ano)', price: '120.00' }],
    },
    {
      title: 'Rede lenta',
      description: 'A internet fica muito lenta no período da tarde.',
      status: 'in_progress' as const,
      client: andre!,
      technician: lucas!,
      service: service('Solução de problemas de conectividade de internet'),
      additional: [],
    },
    {
      title: 'Impressora não imprime',
      description: 'A impressora aparece como offline para todos os computadores.',
      status: 'open' as const,
      client: julia!,
      technician: carlos!,
      service: service('Suporte a impressoras'),
      additional: [],
    },
    {
      title: 'Instalação de software de gestão',
      description: 'Preciso instalar o novo sistema de gestão em 3 máquinas.',
      status: 'open' as const,
      client: andre!,
      technician: ana!,
      service: service('Instalação e atualização de softwares'),
      additional: [],
    },
    {
      title: 'Acesso remoto ao escritório',
      description: 'Quero acessar os arquivos do escritório de casa com segurança.',
      status: 'open' as const,
      client: julia!,
      technician: lucas!,
      service: service('Configuração de VPN e Acesso Remoto'),
      additional: [],
    },
  ]

  for (const ticket of tickets) {
    await prisma.ticket.create({
      data: {
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        servicePrice: ticket.service.price,
        clientId: ticket.client.id,
        technicianId: ticket.technician.id,
        serviceId: ticket.service.id,
        additionalServices: { create: ticket.additional },
      },
    })
  }

  console.log(
    `Seed concluído: 1 admin, ${technicians.length} técnicos, ${clients.length} clientes, ` +
      `${services.length} serviços e ${tickets.length} chamados. Senha de todos: ${PASSWORD}`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
