import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/features/auth/context/authContext'
import {
  DEMO_CREDENTIALS,
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas'
import { FormInput } from '@/shared/components/form/FormInput'
import { FormRootError } from '@/shared/components/form/FormRootError'
import { Button } from '@/shared/components/ui/button'
import { applyServerErrors } from '@/shared/lib/applyServerErrors'

const LOGIN_FIELDS = ['email', 'password'] as const

export function LoginForm() {
  const { login } = useAuth()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const { isSubmitting, errors } = form.formState

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // On success GuestOnly redirects to the requested page.
      await login(values)
    } catch (error) {
      applyServerErrors(error, form.setError, LOGIN_FIELDS)
    }
  })

  const fillDemo = () => {
    form.reset(DEMO_CREDENTIALS)
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <FormInput
        control={form.control}
        name="email"
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        placeholder="you@arvind.com"
      />
      <FormInput
        control={form.control}
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
      />
      <FormRootError message={errors.root?.server?.message} />
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2Icon className="animate-spin" data-icon="inline-start" />
        ) : null}
        Sign in
      </Button>
      <div className="rounded-lg border border-dashed bg-secondary/50 p-3 text-sm">
        <p className="font-medium text-secondary-foreground">Demo account</p>
        <p className="mt-1 break-all text-muted-foreground">
          {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
        </p>
        <Button
          type="button"
          variant="link"
          className="mt-1 h-control-sm px-0"
          onClick={fillDemo}
        >
          Use demo credentials
        </Button>
      </div>
    </form>
  )
}
