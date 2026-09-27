-- Contract check for public.sync_push. Safe to run against the live project:
-- everything happens inside one DO block that ends by raising, so Postgres rolls it all back
-- (the throwaway auth user included). Read the result from the error message:
--   RESULT PASS ...   -> contract holds
--   RESULT FAIL ...   -> something regressed; do not ship the migration
-- Run with the Supabase MCP `execute_sql` tool, then confirm cleanup with the query at the bottom.
do $$
declare
  uid uuid := '00000000-0000-0000-0000-00000000abcd';
  r1 record; r2 record; r3 record; bad text := 'none';
  snaps int; snap_name text; ws_rev bigint;
  problems text[] := '{}';
begin
  insert into auth.users (id, instance_id, aud, role, email)
  values (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'contract-test@lifeos.invalid');
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);

  select * into r1 from public.sync_push('{"version":2,"name":"a"}'::jsonb, 0, current_date, '2026-01-01T00:00:00Z');
  select * into r2 from public.sync_push('{"version":2,"name":"stale"}'::jsonb, 0, current_date, now());
  select * into r3 from public.sync_push('{"version":2,"name":"b"}'::jsonb, 1, current_date - 30, now());
  begin
    perform public.sync_push('"not-an-object"'::jsonb, 2, current_date, now());
  exception when others then
    bad := sqlerrm;
  end;

  select count(*) into snaps from public.workspace_snapshots where user_id = uid;
  select state->>'name' into snap_name from public.workspace_snapshots where user_id = uid and day = current_date;
  select revision into ws_rev from public.workspaces where user_id = uid;

  if r1.status <> 'ok' or r1.revision <> 1 then problems := problems || 'first push should be ok/rev1'; end if;
  if r2.status <> 'conflict' or r2.revision <> 1 or r2.state->>'name' <> 'a' or r2.client_edited_at is null then
    problems := problems || 'stale base should return conflict with current state and edit time'; end if;
  if r3.status <> 'ok' or r3.revision <> 2 then problems := problems || 'correct base should be ok/rev2'; end if;
  if bad not like '%JSON object%' then problems := problems || 'non-object state must be rejected'; end if;
  if snaps <> 1 or snap_name <> 'b' then problems := problems || 'expected one snapshot per day holding the latest state (day clamped)'; end if;
  if ws_rev <> 2 then problems := problems || 'workspace revision should be 2'; end if;

  if array_length(problems, 1) is null then
    raise exception 'RESULT PASS r1=% r2.status=% r3=% snapshots=%', r1.status, r2.status, r3.status, snaps;
  else
    raise exception 'RESULT FAIL %', array_to_string(problems, '; ');
  end if;
end $$;

-- Cleanup confirmation (should return 0):
-- select count(*) from auth.users where email = 'contract-test@lifeos.invalid';
