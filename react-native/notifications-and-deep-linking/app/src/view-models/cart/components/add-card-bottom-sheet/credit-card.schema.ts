import { z } from 'zod'

export const creditCardSchema = z
  .object({
    titularName: z
      .string({ error: 'Nome do titular é obrigatório' })
      .min(2, 'Nome deve ter pelo menos 2 caracteres'),

    number: z
      .string({ error: 'Número do cartão é obrigatório' })
      .transform((value) => value.replace(/\D/g, ''))
      .refine((value) => /^\d{16}$/.test(value), {
        message: 'Número do cartão inválido',
      }),

    expirationDate: z
      .string({ error: 'Data de vencimento é obrigatória' })
      .regex(/^\d{2}\/\d{2}$/, 'Data deve estar no formato MM/YY'),

    CVV: z
      .string({ error: 'CVV é obrigatório' })
      .regex(/^\d{3,4}$/, 'CVV inválido'),
  })
  .refine(
    (data) => {
      const [month, year] = data.expirationDate.split('/').map(Number)
      if (!month || !year) return false

      if (month < 1 || month > 12) return false

      const now = new Date()
      const currentYear = now.getFullYear() % 100
      const currentMonth = now.getMonth() + 1

      if (year < currentYear) return false
      if (year === currentYear && month < currentMonth) return false

      return true
    },
    {
      message: 'Cartão expirado',
      path: ['expirationDate'],
    },
  )

export type CreditCardFormData = z.infer<typeof creditCardSchema>
