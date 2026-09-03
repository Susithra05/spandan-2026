-- ============================================================
-- SPANDAN 2026 — Migration v4
-- ============================================================
-- Per-teammate validation now needs to check two things, not one:
--   1. Does this Delegate ID exist?
--   2. Does the person holding it own a pass/tier that actually
--      grants access to THIS specific event?
-- The old verify_delegate_id() only returned name/college, which
-- was enough for #1 but not #2. Postgres won't let you change a
-- function's return type with CREATE OR REPLACE, so this drops and
-- recreates it with pass_codes included.
-- ============================================================

drop function if exists verify_delegate_id(text);

create or replace function verify_delegate_id(p_delegate_id text)
returns table(full_name text, college text, pass_codes text[])
language plpgsql
security definer
as $$
begin
  return query
    select p.full_name, p.college, p.pass_codes
    from purchases p
    where p.delegate_id = p_delegate_id
      and p.payment_status = 'APPROVED';
end;
$$;

grant execute on function verify_delegate_id(text) to authenticated;
