import { z } from 'zod'

export const profileSchema = z
  .object({
    name: z
      .string({ error: 'Nome é obrigatório' })
      .min(4, { message: 'Nome deve ter pelo menos 4 caracteres' }),
    email: z.email({ error: 'Email inválido' }),
    phone: z
      .string({ error: 'Telefone é obrigatório' })
      .transform((val) => val.replace(/\D/g, ''))
      .refine((value) => /^\d{11}$/.test(value), {
        message: 'Telefone deve ter 11 dígitos (DDD + número)',
      }),
    password: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .refine((data) => {
    if (data.password || data.newPassword) {
      return data.password === data.newPassword
    }
    return true
  })

export type ProfileFormData = z.infer<typeof profileSchema>
