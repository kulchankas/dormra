'use client'

import { useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import DistrictGrid from '@/components/DistrictGrid'
import AlertMatchPreview from '@/components/AlertMatchPreview'
import { createAlert, updateAlert, type AlertPayload } from '@/app/dashboard/alerts/actions'

const schema = z.object({
  price_max: z.string().optional(),
  deposit_max: z.string().optional(),
  districts: z.array(z.number()),
  move_in_before: z.string().optional(),
  pets_required: z.boolean(),
  couples: z.boolean(),
  notify_email: z.boolean(),
  notify_telegram: z.boolean(),
  telegram_chat_id: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  mode: 'create' | 'edit'
  alertId?: string
  defaultValues?: AlertPayload
}

export default function AlertForm({ mode, alertId, defaultValues }: Props) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      price_max: defaultValues?.price_max != null ? String(defaultValues.price_max) : '',
      deposit_max: defaultValues?.deposit_max != null ? String(defaultValues.deposit_max) : '',
      districts: defaultValues?.districts ?? [],
      move_in_before: defaultValues?.move_in_before ?? '',
      pets_required: defaultValues?.pets_required ?? false,
      couples: defaultValues?.couples ?? false,
      notify_email: defaultValues?.notify_email ?? true,
      notify_telegram: defaultValues?.notify_telegram ?? false,
      telegram_chat_id: defaultValues?.telegram_chat_id ?? '',
    },
  })

  const priceMax = useWatch({ control: form.control, name: 'price_max' })
  const depositMax = useWatch({ control: form.control, name: 'deposit_max' })
  const selectedDistricts = useWatch({ control: form.control, name: 'districts' })
  const petsRequired = useWatch({ control: form.control, name: 'pets_required' })
  const couplesRequired = useWatch({ control: form.control, name: 'couples' })

  const criteria = {
    price_max: priceMax ? Number(priceMax) : null,
    districts: selectedDistricts ?? [],
    deposit_max: depositMax ? Number(depositMax) : null,
    pets_required: !!petsRequired,
    couples: !!couplesRequired,
  }

  function buildPayload(values: FormValues): AlertPayload {
    return {
      price_max: values.price_max ? Number(values.price_max) : null,
      deposit_max: values.deposit_max ? Number(values.deposit_max) : null,
      districts: values.districts,
      move_in_before: values.move_in_before || null,
      pets_required: values.pets_required,
      couples: values.couples,
      notify_email: values.notify_email,
      notify_telegram: false,
      telegram_chat_id: null,
    }
  }

  function onSubmit(values: FormValues) {
    if (!values.notify_email) {
      toast.error('Email notifications must stay on — Telegram is not available yet.')
      return
    }

    startTransition(async () => {
      const payload = buildPayload(values)
      const result = mode === 'edit' && alertId
        ? await updateAlert(alertId, payload)
        : await createAlert(payload)

      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

        <AlertMatchPreview criteria={criteria} />

        <section className="card-elevated rounded-2xl bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Budget</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="price_max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Max rent per month (€)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="e.g. 600"
                      className="h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deposit_max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Max deposit (months)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="e.g. 2"
                      className="h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="card-elevated rounded-2xl bg-surface p-5">
          <FormField
            control={form.control}
            name="districts"
            render={({ field }) => (
              <DistrictGrid
                selected={field.value}
                onChange={field.onChange}
                label="Districts"
              />
            )}
          />
        </section>

        <section className="card-elevated rounded-2xl bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Move-in date</h2>
          <FormField
            control={form.control}
            name="move_in_before"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  I need to move in by
                </FormLabel>
                <FormControl>
                  <Input type="date" className="h-9 w-48" {...field} />
                </FormControl>
                <p className="text-[11px] text-muted-foreground">
                  Saved for your reference — move-in filtering is coming soon.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="card-elevated rounded-2xl bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Requirements</h2>
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="pets_required"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-foreground">Pets allowed</p>
                    <p className="text-xs text-muted-foreground">Only show rooms that allow pets</p>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
            <div className="h-px bg-border" />
            <FormField
              control={form.control}
              name="couples"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-foreground">Couples allowed</p>
                    <p className="text-xs text-muted-foreground">Only show rooms that accept couples</p>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
          </div>
        </section>

        <section className="card-elevated rounded-2xl bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Notifications</h2>
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="notify_email"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-foreground">Email</p>
                    <p className="text-xs text-muted-foreground">Get notified by email</p>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between gap-3 opacity-60">
              <div>
                <p className="text-sm text-foreground">Telegram</p>
                <p className="text-xs text-muted-foreground">Coming soon — email alerts are active now</p>
              </div>
              <Switch checked={false} disabled aria-label="Telegram notifications coming soon" />
            </div>
          </div>
        </section>

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-11 rounded-full text-sm"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {mode === 'create' ? 'Create alert' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
