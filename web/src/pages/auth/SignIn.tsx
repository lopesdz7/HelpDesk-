import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { signInSchema, type SignInData } from '@/lib/schemas'
import { AuthCardHeader, FormAlert } from './shared'

export function SignIn() {
  const { signIn } = useAuth()
  const [error, setError] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({ resolver: zodResolver(signInSchema) })

  async function onSubmit(data: SignInData) {
    setError(undefined)
    try {
      await signIn(data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <>
      <Card>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          <AuthCardHeader
            title="Acesse o portal"
            description="Entre usando seu e-mail e senha cadastrados"
          />
          <div className="flex flex-col gap-4">
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
              autoComplete="current-password"
              placeholder="Digite sua senha"
              {...register('password')}
              error={errors.password?.message}
            />
          </div>
          {error && <FormAlert>{error}</FormAlert>}
          <Button type="submit" loading={isSubmitting}>
            Entrar
          </Button>
        </form>
      </Card>

      <Card className="flex flex-col gap-5">
        <AuthCardHeader
          title="Ainda não tem uma conta?"
          description="Cadastre-se agora mesmo"
          small
        />
        <ButtonLink to="/signup" variant="secondary">
          Criar conta
        </ButtonLink>
      </Card>
    </>
  )
}
