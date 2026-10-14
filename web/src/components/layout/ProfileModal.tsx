import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Trash2, Upload } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { AvailabilityPills } from '@/components/AvailabilityPills'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useAuth, useCurrentUser } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { passwordSchema, profileSchema, type PasswordData, type ProfileData } from '@/lib/schemas'
import { profileService } from '@/services'

const MAX_AVATAR_SIZE = 3 * 1024 * 1024

type ProfileModalProps = { open: boolean; onClose: () => void }

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const [view, setView] = useState<'profile' | 'password' | 'delete'>('profile')

  function close() {
    onClose()
    setView('profile')
  }

  return (
    <>
      <ProfileForm
        open={open && view !== 'password'}
        onClose={close}
        onChangePassword={() => setView('password')}
        onDeleteAccount={() => setView('delete')}
      />
      <PasswordForm
        open={open && view === 'password'}
        onBack={() => setView('profile')}
        onClose={close}
      />
      <DeleteAccountDialog open={open && view === 'delete'} onClose={() => setView('profile')} />
    </>
  )
}

type ProfileFormProps = {
  open: boolean
  onClose: () => void
  onChangePassword: () => void
  onDeleteAccount: () => void
}

function ProfileForm({ open, onClose, onChangePassword, onDeleteAccount }: ProfileFormProps) {
  const user = useCurrentUser()
  const { updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formId = useId()

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    values: { name: user.name, email: user.email },
  })

  const save = useMutation({
    mutationFn: profileService.update,
    onSuccess: (updated) => {
      updateUser(updated)
      toast.success('Perfil atualizado.')
      onClose()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const upload = useMutation({
    mutationFn: profileService.uploadAvatar,
    onSuccess: (updated) => {
      updateUser(updated)
      toast.success('Foto atualizada.')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const removeAvatar = useMutation({
    mutationFn: profileService.removeAvatar,
    onSuccess: (updated) => {
      updateUser(updated)
      toast.success('Foto removida.')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  function handleFile(file: File | undefined) {
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Formato inválido. Envie uma imagem .jpg ou .png.')
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('O arquivo deve ter no máximo 3 MB.')
      return
    }
    upload.mutate(file)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Perfil"
      footer={
        <Button type="submit" form={formId} loading={save.isPending}>
          Salvar
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} avatar={user.avatar} size="xl" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              handleFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload />}
            loading={upload.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            Nova imagem
          </Button>
          {user.avatar && (
            <Button
              variant="secondary"
              size="sm"
              aria-label="Remover foto"
              title="Remover foto"
              className="text-danger hover:text-danger"
              icon={<Trash2 />}
              loading={removeAvatar.isPending}
              onClick={() => removeAvatar.mutate()}
            />
          )}
        </div>

        <form
          id={formId}
          noValidate
          onSubmit={form.handleSubmit((data) => save.mutate(data))}
          className="flex flex-col gap-4"
        >
          <Input
            label="Nome"
            autoComplete="name"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />
        </form>

        <div className="flex items-end gap-3">
          <Input
            label="Senha"
            type="password"
            value="••••••••"
            readOnly
            tabIndex={-1}
            aria-readonly
            wrapperClassName="flex-1"
            className="text-gray-300"
          />
          <Button variant="secondary" size="sm" onClick={onChangePassword}>
            Alterar
          </Button>
        </div>

        {user.role === 'technician' && (
          <section aria-labelledby={`${formId}-availability`} className="flex flex-col gap-2">
            <div>
              <h3 id={`${formId}-availability`} className="text-sm font-bold text-gray-200">
                Disponibilidade
              </h3>
              <p className="text-xs text-gray-300">Horários de atendimento definidos pelo admin.</p>
            </div>
            <AvailabilityPills hours={user.availability} />
          </section>
        )}

        {user.role === 'client' && (
          <button
            type="button"
            onClick={onDeleteAccount}
            className="w-fit rounded-xs text-xs font-bold text-danger underline-offset-2 hover:underline"
          >
            Excluir minha conta
          </button>
        )}
      </div>
    </Modal>
  )
}

type PasswordFormProps = { open: boolean; onBack: () => void; onClose: () => void }

function PasswordForm({ open, onBack, onClose }: PasswordFormProps) {
  const formId = useId()
  const form = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  })

  const save = useMutation({
    mutationFn: profileService.updatePassword,
    onSuccess: () => {
      toast.success('Senha alterada.')
      form.reset()
      onBack()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Modal
      open={open}
      onClose={() => {
        form.reset()
        onClose()
      }}
      title="Alterar senha"
      footer={
        <>
          <Button variant="secondary" onClick={onBack}>
            Voltar
          </Button>
          <Button type="submit" form={formId} loading={save.isPending}>
            Salvar
          </Button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={form.handleSubmit((data) => save.mutate(data))}
        className="flex flex-col gap-4"
      >
        <Input
          label="Senha atual"
          type="password"
          autoComplete="current-password"
          placeholder="Digite sua senha atual"
          {...form.register('currentPassword')}
          error={form.formState.errors.currentPassword?.message}
        />
        <Input
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          placeholder="Digite sua nova senha"
          hint="Mínimo de 6 caracteres"
          {...form.register('newPassword')}
          error={form.formState.errors.newPassword?.message}
        />
      </form>
    </Modal>
  )
}

function DeleteAccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signOut } = useAuth()
  const remove = useMutation({
    mutationFn: profileService.deleteAccount,
    onSuccess: () => {
      toast.success('Sua conta foi excluída.')
      signOut()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Excluir conta"
      confirmLabel="Sim, excluir"
      loading={remove.isPending}
      onConfirm={() => remove.mutate()}
    >
      <p>Deseja realmente excluir sua conta?</p>
      <p className="text-sm text-gray-300">
        Todos os seus chamados serão apagados junto. Esta ação não pode ser desfeita.
      </p>
    </ConfirmDialog>
  )
}
