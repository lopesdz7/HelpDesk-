import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { signUpSchema, type SignUpData } from '@/lib/schemas'
import { authService } from '@/services'
import { AuthCardHeader, FormAlert } from './shared'

export function SignUp() {
  const { signIn } = useAuth()
  const [error, setError] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>({ resolver: zodResolver(signUpSchema) })

  async function onSubmit(data: SignUpData) {
    setError(undefined)
    try {
      await authService.signUp(data)
      // Entra direto após o cadastro — um passo a menos para abrir o primeiro chamado.
      await signIn({ email: data.email, password: data.password })
      toast.success('Conta criada. Boas-vindas!')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <>
      <Card>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          <AuthCardHeader title="Crie sua conta" description="Informe seu nome, e-mail e senha" />
          <div className="flex flex-col gap-4">
            <Input
              label="Nome"
              autoComplete="name"
              placeholder="Digite o nome completo"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="exemplo@mail.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="new-password"
              placeholder="Digite sua senha"
              hint="Mínimo de 6 caracteres"
              {...register('password')}
              error={errors.password?.message}
            />
          </div>
          {error && <FormAlert>{error}</FormAlert>}
          <Button type="submit" loading={isSubmitting}>
            Cadastrar
          </Button>
        </form>
      </Card>

      <Card className="flex flex-col gap-5">
        <AuthCardHeader title="Já tem uma conta?" description="Entre agora mesmo" small />
        <ButtonLink to="/" variant="secondary">
          Acessar conta
        </ButtonLink>
      </Card>
    </>
  )
}
