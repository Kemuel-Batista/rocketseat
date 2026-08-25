import * as z from 'zod'

export const registerSchema = z
  .object({
    name: z
      .string('Nome é obrigatório')
      .min(4, 'Nome deve ter no mínimo 4 caracteres'),
    email: z.email('E-mail Inválido').trim(),
    password: z
      .string('Senha é obrigatória')
      .trim()
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z
      .string('Senha é obrigatória')
      .trim()
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),
    phone: z
      .string('Telefone é obrigatório')
      .trim()
      .regex(/^\d{11}$/, 'Telefone deve ter 11 dígitos (DDD + número)'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
