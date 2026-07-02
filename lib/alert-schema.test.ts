import { describe, expect, it } from 'vitest'
import { parseAlertPayload } from './alert-schema'

describe('parseAlertPayload', () => {
  it('accepts a valid payload', () => {
    const result = parseAlertPayload({
      price_max: 600,
      districts: [9, 20],
      move_in_before: '2026-09-01',
      pets_required: false,
      couples: true,
      deposit_max: 2,
      notify_email: true,
      notify_telegram: false,
      telegram_chat_id: null,
    })
    expect(result.price_max).toBe(600)
    expect(result.districts).toEqual([9, 20])
  })

  it('rejects when email notifications are off', () => {
    expect(() =>
      parseAlertPayload({
        price_max: null,
        districts: [],
        move_in_before: null,
        pets_required: false,
        couples: false,
        deposit_max: null,
        notify_email: false,
        notify_telegram: false,
        telegram_chat_id: null,
      }),
    ).toThrow()
  })

  it('rejects invalid districts', () => {
    expect(() =>
      parseAlertPayload({
        price_max: null,
        districts: [99],
        move_in_before: null,
        pets_required: false,
        couples: false,
        deposit_max: null,
        notify_email: true,
        notify_telegram: false,
        telegram_chat_id: null,
      }),
    ).toThrow()
  })
})
