-- ================================================================
-- migration_v9.sql — run in the Supabase SQL editor (safe to re-run)
--
-- FIX: 'column reference "delegate_id" is ambiguous' when a person who
-- already owns a pass buys another one.
--
-- Cause: resolve_my_delegate_id() is declared
--     returns table(delegate_id text, changed boolean, previous_delegate_id text)
-- which makes `delegate_id` an OUTPUT VARIABLE inside the function body.
-- Its own queries then referred to the purchases COLUMN of the same
-- name without a table qualifier ("... where user_id = auth.uid() and
-- delegate_id is not null"), so Postgres couldn't tell the variable
-- from the column and aborted. It only ever fired for someone who
-- ALREADY had a purchase row (the first-ever purchase never reaches
-- those queries with a non-null match), which is why it showed up on
-- "buy another pass".
--
-- Fix: every reference to purchases.delegate_id now goes through a
-- table alias. Signature and behaviour are otherwise unchanged, so no
-- client change is needed for this one.
-- ================================================================

create or replace function resolve_my_delegate_id(p_new_pass_codes text[])
returns table(delegate_id text, changed boolean, previous_delegate_id text)
language plpgsql
security definer
as $$
declare
  v_group_id uuid;
  v_group_code text;
  v_base text;
  v_changed boolean;
  v_prev_base text;
  v_full text;
  v_prev_full text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select pu.group_id into v_group_id
  from purchases pu
  where pu.user_id = auth.uid() and pu.delegate_id is not null
  order by pu.created_at asc
  limit 1;

  select r.base_id, r.changed, r.previous_base into v_base, v_changed, v_prev_base
  from internal_resolve_base_id(auth.uid(), p_new_pass_codes) r;

  if v_base is null then
    raise exception 'No pass selected — cannot generate a Delegate ID';
  end if;

  if v_group_id is not null then
    select g.group_code into v_group_code from groups g where g.id = v_group_id;
    v_full := v_group_code || '-' || v_base;
    v_prev_full := case when v_prev_base is null then null else v_group_code || '-' || v_prev_base end;
  else
    v_full := v_base;
    v_prev_full := v_prev_base;
  end if;

  if v_changed then
    update purchases pu
       set delegate_id = v_full
     where pu.user_id = auth.uid() and pu.delegate_id is not null;
  end if;

  return query select v_full, v_changed, (case when v_changed then v_prev_full else null end);
end;
$$;

grant execute on function resolve_my_delegate_id(text[]) to authenticated;
