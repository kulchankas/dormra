-- Latest snapshot per dorm (efficient bulk read for directory pages).
create or replace function public.get_latest_snapshots(p_dorm_ids uuid[])
returns table (
  dorm_id uuid,
  available boolean,
  scrape_ok boolean,
  scraped_at timestamptz
)
language sql
stable
as $$
  select distinct on (s.dorm_id)
    s.dorm_id,
    s.available,
    s.scrape_ok,
    s.scraped_at
  from public.availability_snapshots s
  where s.dorm_id = any (p_dorm_ids)
  order by s.dorm_id, s.scraped_at desc;
$$;

-- Delete snapshots older than N days (called from cron). Keeps table bounded.
create or replace function public.prune_old_snapshots(p_keep_days int default 30)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted bigint;
begin
  delete from public.availability_snapshots
  where scraped_at < now() - (p_keep_days || ' days')::interval;

  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

grant execute on function public.get_latest_snapshots(uuid[]) to anon, authenticated, service_role;
grant execute on function public.prune_old_snapshots(int) to service_role;
