import { z } from 'zod'

const district = z.number().int().min(1).max(23)

export const alertPayloadSchema = z.object({
  price_max: z.number().int().min(0).max(5000).nullable(),
  districts: z.array(district).max(23),
  move_in_before: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .or(z.literal(null)),
  pets_required: z.boolean(),
  couples: z.boolean(),
  deposit_max: z.number().int().min(0).max(24).nullable(),
  notify_email: z.boolean().refine((v) => v === true, {
    message: 'Email notifications must stay on',
  }),
  notify_telegram: z.boolean(),
  telegram_chat_id: z.string().max(64).nullable(),
})

export type ValidatedAlertPayload = z.infer<typeof alertPayloadSchema>

export function parseAlertPayload(raw: unknown): ValidatedAlertPayload {
  return alertPayloadSchema.parse(raw)
}
