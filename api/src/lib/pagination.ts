import type { Pagination } from '@/schemas/common'

export function paginationArgs({ page, perPage }: Pagination) {
  return { skip: (page - 1) * perPage, take: perPage }
}

export function paginated<T>(data: T[], total: number, { page, perPage }: Pagination) {
  return {
    data,
    meta: { page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)) },
  }
}
