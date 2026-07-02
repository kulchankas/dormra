-- One alert email per user per dorm per calendar week (UTC).
create unique index if not exists alert_log_user_dorm_week_uidx
  on public.alert_log (
    user_id,
    dorm_id,
    date_trunc('week', sent_at at time zone 'UTC')
  );
