-- ============================================================
-- Eduvia: Multi-tenant Institute Management Platform
-- Migration 0001: Core schema
-- ============================================================

-- ---------- institutes (tenant root) ----------
create table institutes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  created_at timestamptz not null default now()
);

-- ---------- profiles (extends auth.users, carries tenant + role) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  institute_id uuid references institutes(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('owner', 'admin', 'instructor', 'student')),
  created_at timestamptz not null default now()
);

create index idx_profiles_institute on profiles(institute_id);

-- ---------- courses ----------
create table courses (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references institutes(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  duration_weeks int,
  fee_amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index idx_courses_institute on courses(institute_id);
create index idx_courses_normalized_name on courses(institute_id, normalized_name);

-- Course name normalization trigger (generalized from CCPD's casing/whitespace fix)
create or replace function normalize_course_name()
returns trigger
language plpgsql
as $$
begin
  new.normalized_name := lower(trim(regexp_replace(new.name, '\s+', ' ', 'g')));
  return new;
end;
$$;

create trigger trg_normalize_course_name
before insert or update on courses
for each row
execute function normalize_course_name();

-- ---------- instructors ----------
create table instructors (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references institutes(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  -- assignments: array of { course_id, shift } e.g. [{"course_id": "...", "shift": "morning"}]
  assignments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_instructors_institute on instructors(institute_id);
create index idx_instructors_assignments on instructors using gin (assignments);

-- ---------- students ----------
create table students (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references institutes(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  course_id uuid references courses(id) on delete set null,
  enrolled_at date not null default current_date,
  status text not null default 'active' check (status in ('active', 'completed', 'withdrawn')),
  created_at timestamptz not null default now()
);

create index idx_students_institute on students(institute_id);
create index idx_students_course on students(course_id);

-- ---------- fees ----------
create table fees (
  id uuid primary key default gen_random_uuid(),
  institute_id uuid not null references institutes(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  amount numeric(10, 2) not null,
  paid_amount numeric(10, 2) not null default 0,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'partial', 'paid', 'overdue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_fees_institute on fees(institute_id);
create index idx_fees_student on fees(student_id);
create index idx_fees_status on fees(institute_id, status);

-- Auto-sync fee status based on paid_amount vs amount (generalized from CCPD's fee-sync helper)
create or replace function sync_fee_status()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.paid_amount >= new.amount then
    new.status := 'paid';
  elsif new.paid_amount > 0 then
    new.status := 'partial';
  elsif new.due_date < current_date then
    new.status := 'overdue';
  else
    new.status := 'pending';
  end if;
  return new;
end;
$$;

create trigger trg_sync_fee_status
before insert or update on fees
for each row
execute function sync_fee_status();
