import { zodResolver } from '@hookform/resolvers/zod'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PenLine, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/Avatar'
import { Button, IconButton } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { QueryError } from '@/components/ui/QueryError'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { Table, Td, Th, Tr } from '@/components/ui/Table'
import { getErrorMessage } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { clientSchema, type ClientData } from '@/lib/schemas'
import type { User } from '@/lib/types'
import { clientsService } from '@/services'

export function Clients() {
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<User>()
  const [deleting, setDeleting] = useState<User>()
  const query = useQuery({
    queryKey: queryKeys.clientList(page),
    queryFn: () => clientsService.list({ page }),
    placeholderData: keepPreviousData,
  })

  return (
    <>
      <PageHeader title="Clientes" />

      {query.isPending ? (
        <div className="rounded-lg border border-gray-500">
          <TableSkeleton columns={3} />
        </div>
      ) : query.isError ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState
          title="Nenhum cliente ainda"
          description="Os clientes se cadastram pela tela de login e aparecem aqui."
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th className="max-md:hidden">E-mail</Th>
                <Th className="w-24">
                  <span className="sr-only">Ações</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {query.data.data.map((client) => (
                <Tr key={client.id}>
                  <Td>
                    <span className="flex items-center gap-3">
                      <Avatar name={client.name} avatar={client.avatar} size="md" />
                      <span className="min-w-0">
                        <span className="block font-bold">{client.name}</span>
                        <span className="block truncate text-xs text-gray-300 md:hidden">
                          {client.email}
                        </span>
                      </span>
                    </span>
                  </Td>
                  <Td className="text-gray-300 max-md:hidden">{client.email}</Td>
                  <Td>
                    <span className="flex justify-end gap-2">
                      <IconButton
                        label={`Excluir ${client.name}`}
                        size="sm"
                        className="text-danger hover:text-danger"
                        icon={<Trash2 />}
                        onClick={() => setDeleting(client)}
                      />
                      <IconButton
                        label={`Editar ${client.name}`}
                        size="sm"
                        icon={<PenLine />}
                        onClick={() => setEditing(client)}
                      />
                    </span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <Pagination meta={query.data.meta} onChange={setPage} />
        </>
      )}

      <EditClientModal client={editing} onClose={() => setEditing(undefined)} />
      <DeleteClientDialog client={deleting} onClose={() => setDeleting(undefined)} />
    </>
  )
}

function EditClientModal({ client, onClose }: { client?: User; onClose: () => void }) {
  const queryClient = useQueryClient()
  const formId = useId()
  const form = useForm<ClientData>({
    resolver: zodResolver(clientSchema),
    values: client ? { name: client.name, email: client.email } : undefined,
  })

  const save = useMutation({
    mutationFn: (data: ClientData) => clientsService.update(client!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets })
      toast.success('Cliente atualizado.')
      onClose()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Modal
      open={Boolean(client)}
      onClose={onClose}
      title="Cliente"
      footer={
        <Button type="submit" form={formId} loading={save.isPending}>
          Salvar
        </Button>
      }
    >
      {client && (
        <form
          id={formId}
          noValidate
          onSubmit={form.handleSubmit((data) => save.mutate(data))}
          className="flex flex-col gap-5"
        >
          <Avatar name={client.name} avatar={client.avatar} size="xl" />
          <Input
            label="Nome"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Input
            label="E-mail"
            type="email"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />
        </form>
      )}
    </Modal>
  )
}

function DeleteClientDialog({ client, onClose }: { client?: User; onClose: () => void }) {
  const queryClient = useQueryClient()
  const remove = useMutation({
    mutationFn: () => clientsService.remove(client!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets })
      toast.success('Cliente excluído.')
      onClose()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <ConfirmDialog
      open={Boolean(client)}
      onClose={onClose}
      title="Excluir cliente"
      confirmLabel="Sim, excluir"
      loading={remove.isPending}
      onConfirm={() => remove.mutate()}
    >
      <p>
        Deseja realmente excluir <strong>{client?.name}</strong>?
      </p>
      <p className="text-sm text-gray-300">
        Todos os chamados deste cliente também serão excluídos. Esta ação não pode ser desfeita.
      </p>
    </ConfirmDialog>
  )
}
