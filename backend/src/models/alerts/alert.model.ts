import { z } from 'zod'

export const AlertSchema = z.object({
  id: z.uuid(),
  subject: z.string().min(2).max(100),
  timestamp: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid ISO8601 date'
  }),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  title: z.string().min(2).max(100),
  message: z.string().min(2).max(500),
  metadata: z.record(z.string(), z.any())
})
export type Alert = z.infer<typeof AlertSchema>

export const AlertsNumberByMonthSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, {
    message: 'Month must be in YYYY-MM format'
  }),
  count: z.number().min(0)
})
export const AlertsNumberByMonthsSchema = z.array(AlertsNumberByMonthSchema)
export type AlertsNumberByMonth = z.infer<typeof AlertsNumberByMonthSchema>
export type AlertsNumberByMonths = z.infer<typeof AlertsNumberByMonthsSchema>

export const filterAlertsSchema = z.object({
  startDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid ISO8601 date'
    })
    .optional(),
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid ISO8601 date'
    })
    .optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  subject: z.string().min(2).max(100).optional()
})
export type FilterAlerts = z.infer<typeof filterAlertsSchema>
