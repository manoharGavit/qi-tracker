import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email')),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const DEMO_CREDENTIALS: LoginFormValues = {
  email: 'supervisor@arvind.com',
  password: 'Password@123',
}
