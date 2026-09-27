create table public.workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

create policy "select own workspace"
  on public.workspaces for select
  using (auth.uid() = user_id);

create policy "insert own workspace"
  on public.workspaces for insert
  with check (auth.uid() = user_id);

create policy "update own workspace"
  on public.workspaces for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
