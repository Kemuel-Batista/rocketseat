import * as z from 'zod'

export const loginSchema = z.object({
  email: z.email('E-mail Inválido').trim(),
  password: z
    .string('Senha é obrigatória')
    .trim()
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>
