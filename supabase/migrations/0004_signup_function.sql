-- ============================================================
-- Migration 0004: Atomic signup (institute + owner profile)
-- ============================================================

-- Creates an institute and the calling user's owner profile in one
-- transaction, so we never end up with an orphaned institute (no owner)
-- or an orphaned profile (no institute). Called via RPC right after
-- Supabase Auth signUp() succeeds, using the new user's session.
create or replace function create_institute_with_owner(
  institute_name text,
  institute_slug text,
  owner_full_name text
)
returns table (institute_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_institute_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Must be authenticated to create an institute';
  end if;

  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'User already has a profile';
  end if;

  insert into institutes (name, slug)
  values (institute_name, institute_slug)
  returning id into new_institute_id;

  insert into profiles (id, institute_id, full_name, role)
  values (auth.uid(), new_institute_id, owner_full_name, 'owner');

  return query select new_institute_id;
end;
$$;

revoke execute on function create_institute_with_owner(text, text, text) from public;
revoke execute on function create_institute_with_owner(text, text, text) from anon;
grant execute on function create_institute_with_owner(text, text, text) to authenticated;
