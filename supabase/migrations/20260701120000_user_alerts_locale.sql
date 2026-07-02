-- Store the UI locale when a user creates an alert so notification emails match their language.
alter table public.user_alerts
  add column if not exists locale text not null default 'en';
