-- Link alert deliveries to the specific user_alerts row that triggered them.
alter table public.alert_log
  add column if not exists alert_id uuid references public.user_alerts (id) on delete set null;

drop index if exists public.alert_log_user_dorm_week_uidx;

-- Per-alert dedup: one availability email per alert + dorm per calendar week (UTC).
create unique index if not exists alert_log_alert_dorm_week_uidx
  on public.alert_log (
    alert_id,
    dorm_id,
    date_trunc('week', sent_at at time zone 'UTC')
  )
  where alert_id is not null and channel = 'email';

-- Legacy rows without alert_id keep user+dorm weekly dedup.
create unique index if not exists alert_log_user_dorm_week_legacy_uidx
  on public.alert_log (
    user_id,
    dorm_id,
    date_trunc('week', sent_at at time zone 'UTC')
  )
  where alert_id is null and channel = 'email';
