-- ============================================================
-- SPANDAN 2026 — Set the real admin passcode
-- ============================================================
-- Replaces 'CHANGE_ME' with your real passcode across all 5 admin
-- functions in one go. Safe to re-run any time you want to change it
-- later — just edit the value below and run again.
-- ============================================================

create or replace function get_admin_purchases(admin_key text)
returns setof purchases
language plpgsql
security definer
as $$
begin
  if admin_key is distinct from 'SPANDAN2026ADMIN' then
    raise exception 'Unauthorized';
  end if;
  return query select * from purchases order by created_at desc;
end;
$$;

create or replace function get_admin_event_registrations(admin_key text)
returns setof event_registrations
language plpgsql
security definer
as $$
begin
  if admin_key is distinct from 'SPANDAN2026ADMIN' then
    raise exception 'Unauthorized';
  end if;
  return query select * from event_registrations order by created_at desc;
end;
$$;

create or replace function get_admin_team_members(admin_key text)
returns setof team_members
language plpgsql
security definer
as $$
begin
  if admin_key is distinct from 'SPANDAN2026ADMIN' then
    raise exception 'Unauthorized';
  end if;
  return query select * from team_members order by created_at desc;
end;
$$;

create or replace function admin_update_purchase_status(admin_key text, p_id uuid, p_status text)
returns void
language plpgsql
security definer
as $$
begin
  if admin_key is distinct from 'SPANDAN2026ADMIN' then
    raise exception 'Unauthorized';
  end if;
  if p_status not in ('PENDING_VERIFICATION', 'APPROVED', 'REJECTED') then
    raise exception 'Invalid status';
  end if;
  update purchases set payment_status = p_status where id = p_id;
end;
$$;

create or replace function get_admin_groups(admin_key text)
returns setof groups
language plpgsql
security definer
as $$
begin
  if admin_key is distinct from 'SPANDAN2026ADMIN' then
    raise exception 'Unauthorized';
  end if;
  return query select * from groups order by created_at desc;
end;
$$;
