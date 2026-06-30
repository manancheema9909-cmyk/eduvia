-- ============================================================
-- Migration 0002: Row Level Security (multi-tenant isolation)
-- ============================================================

-- Helper: get the institute_id of the currently authenticated user.
-- SECURITY DEFINER avoids recursive RLS evaluation when profiles
-- itself is also RLS-protected.
create or replace function current_institute_id()
returns uuid
language sql
security definer
stable
as $$
  select institute_id from profiles where id = auth.uid();
$$;

create or replace function current_role_name()
returns text
language sql
security definer
stable
as $$
  select role from profiles where id = auth.uid();
$$;

-- ---------- enable RLS ----------
alter table institutes enable row level security;
alter table profiles enable row level security;
alter table courses enable row level security;
alter table instructors enable row level security;
alter table students enable row level security;
alter table fees enable row level security;

-- ---------- institutes ----------
-- Users can only see their own institute row.
create policy institutes_select on institutes
  for select using (id = current_institute_id());

create policy institutes_update_owner on institutes
  for update using (id = current_institute_id() and current_role_name() = 'owner');

-- ---------- profiles ----------
create policy profiles_select on profiles
  for select using (institute_id = current_institute_id());

create policy profiles_update_self on profiles
  for update using (id = auth.uid());

create policy profiles_admin_manage on profiles
  for all using (
    institute_id = current_institute_id()
    and current_role_name() in ('owner', 'admin')
  );

-- ---------- courses ----------
create policy courses_select on courses
  for select using (institute_id = current_institute_id());

create policy courses_write on courses
  for insert with check (institute_id = current_institute_id() and current_role_name() in ('owner', 'admin'));

create policy courses_update on courses
  for update using (institute_id = current_institute_id() and current_role_name() in ('owner', 'admin'));

create policy courses_delete on courses
  for delete using (institute_id = current_institute_id() and current_role_name() in ('owner', 'admin'));

-- ---------- instructors ----------
create policy instructors_select on instructors
  for select using (institute_id = current_institute_id());

create policy instructors_write on instructors
  for insert with check (institute_id = current_institute_id() and current_role_name() in ('owner', 'admin'));

create policy instructors_update on instructors
  for update using (institute_id = current_institute_id() and current_role_name() in ('owner', 'admin'));

create policy instructors_delete on instructors
  for delete using (institute_id = current_institute_id() and current_role_name() in ('owner', 'admin'));

-- ---------- students ----------
create policy students_select on students
  for select using (institute_id = current_institute_id());

create policy students_write on students
  for insert with check (institute_id = current_institute_id() and current_role_name() in ('owner', 'admin', 'instructor'));

create policy students_update on students
  for update using (institute_id = current_institute_id() and current_role_name() in ('owner', 'admin', 'instructor'));

create policy students_delete on students
  for delete using (institute_id = current_institute_id() and current_role_name() in ('owner', 'admin'));

-- ---------- fees ----------
create policy fees_select on fees
  for select using (institute_id = current_institute_id());

create policy fees_write on fees
  for insert with check (institute_id = current_institute_id() and current_role_name() in ('owner', 'admin'));

create policy fees_update on fees
  for update using (institute_id = current_institute_id() and current_role_name() in ('owner', 'admin'));

create policy fees_delete on fees
  for delete using (institute_id = current_institute_id() and current_role_name() in ('owner', 'admin'));
