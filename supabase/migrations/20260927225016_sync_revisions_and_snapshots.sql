alter table public.workspaces
  add column revision bigint not null default 1,
  add column client_edited_at timestamptz,
  add constraint workspaces_state_object check (jsonb_typeof(state) = 'object'),
  add constraint workspaces_state_size check (pg_column_size(state) < 5000000);

drop policy "insert own workspace" on public.workspaces;
drop policy "update own workspace" on public.workspaces;

create table public.workspace_snapshots (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  revision bigint not null,
  saved_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.workspace_snapshots enable row level security;

create policy "select own snapshots"
  on public.workspace_snapshots for select
  using ((select auth.uid()) = user_id);

drop policy "select own workspace" on public.workspaces;
create policy "select own workspace"
  on public.workspaces for select
  using ((select auth.uid()) = user_id);

create function public.sync_push(
  p_state jsonb,
  p_base_revision bigint,
  p_local_day date,
  p_client_edited_at timestamptz
)
returns table (status text, revision bigint, state jsonb)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_current public.workspaces%rowtype;
  v_revision bigint;
  v_day date;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_state is null or jsonb_typeof(p_state) <> 'object' then
    raise exception 'state must be a JSON object' using errcode = '22023';
  end if;

  v_day := case
    when p_local_day between current_date - 2 and current_date + 2 then p_local_day
    else current_date
  end;

  select * into v_current from public.workspaces w where w.user_id = v_uid for update;

  if not found then
    if p_base_revision <> 0 then
      return query select 'conflict'::text, 0::bigint, null::jsonb;
      return;
    end if;
    insert into public.workspaces (user_id, state, updated_at, revision, client_edited_at)
    values (v_uid, p_state, now(), 1, p_client_edited_at);
    v_revision := 1;
  else
    if v_current.revision <> p_base_revision then
      return query select 'conflict'::text, v_current.revision, v_current.state;
      return;
    end if;
    v_revision := v_current.revision + 1;
    update public.workspaces w
      set state = p_state,
          revision = v_revision,
          updated_at = now(),
          client_edited_at = p_client_edited_at
      where w.user_id = v_uid;
  end if;

  insert into public.workspace_snapshots as s (user_id, day, state, revision, saved_at)
  values (v_uid, v_day, p_state, v_revision, now())
  on conflict (user_id, day) do update
    set state = excluded.state, revision = excluded.revision, saved_at = excluded.saved_at;

  return query select 'ok'::text, v_revision, null::jsonb;
end;
$$;

revoke all on function public.sync_push(jsonb, bigint, date, timestamptz) from public, anon;
grant execute on function public.sync_push(jsonb, bigint, date, timestamptz) to authenticated;
