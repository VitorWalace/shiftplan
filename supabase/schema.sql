-- ShiftPlan database schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Every owned table carries an owner_id that defaults to the current user (auth.uid())
-- and is enforced by Row Level Security so each user only ever sees their own data.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null default 'Meu Comércio',
  created_at timestamptz not null default now(),
  unique (owner_id)
);

alter table public.businesses enable row level security;

create policy "businesses_select_own" on public.businesses
  for select using (owner_id = auth.uid());
create policy "businesses_insert_own" on public.businesses
  for insert with check (owner_id = auth.uid());
create policy "businesses_update_own" on public.businesses
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "businesses_delete_own" on public.businesses
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- employees
-- ---------------------------------------------------------------------------
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  role text not null,
  max_hours_per_week integer,
  created_at timestamptz not null default now()
);

alter table public.employees enable row level security;

create policy "employees_select_own" on public.employees
  for select using (owner_id = auth.uid());
create policy "employees_insert_own" on public.employees
  for insert with check (owner_id = auth.uid());
create policy "employees_update_own" on public.employees
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "employees_delete_own" on public.employees
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- availabilities (one row per declared window: a recurring unavailability or a day off)
-- ---------------------------------------------------------------------------
create table if not exists public.availabilities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  day_of_week text not null check (
    day_of_week in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
  ),
  kind text not null check (kind in ('unavailable', 'day_off')),
  start_time time,
  end_time time,
  created_at timestamptz not null default now(),
  constraint availabilities_time_required_for_unavailable check (
    (kind = 'unavailable' and start_time is not null and end_time is not null)
    or (kind = 'day_off' and start_time is null and end_time is null)
  )
);

create index if not exists availabilities_employee_id_idx on public.availabilities (employee_id);

alter table public.availabilities enable row level security;

create policy "availabilities_select_own" on public.availabilities
  for select using (owner_id = auth.uid());
create policy "availabilities_insert_own" on public.availabilities
  for insert with check (owner_id = auth.uid());
create policy "availabilities_update_own" on public.availabilities
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "availabilities_delete_own" on public.availabilities
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- shifts (the owner's default weekly shift templates, defined in Configurações)
-- ---------------------------------------------------------------------------
create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day_of_week text not null check (
    day_of_week in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
  ),
  start_time time not null,
  end_time time not null,
  min_staff integer not null default 1 check (min_staff >= 1),
  created_at timestamptz not null default now(),
  constraint shifts_end_after_start check (end_time > start_time)
);

alter table public.shifts enable row level security;

create policy "shifts_select_own" on public.shifts
  for select using (owner_id = auth.uid());
create policy "shifts_insert_own" on public.shifts
  for insert with check (owner_id = auth.uid());
create policy "shifts_update_own" on public.shifts
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "shifts_delete_own" on public.shifts
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- schedules (one row per week)
-- ---------------------------------------------------------------------------
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week_start date not null,
  created_at timestamptz not null default now(),
  unique (owner_id, week_start)
);

alter table public.schedules enable row level security;

create policy "schedules_select_own" on public.schedules
  for select using (owner_id = auth.uid());
create policy "schedules_insert_own" on public.schedules
  for insert with check (owner_id = auth.uid());
create policy "schedules_update_own" on public.schedules
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "schedules_delete_own" on public.schedules
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- assignments (links an employee to a shift within a schedule)
-- ---------------------------------------------------------------------------
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  shift_id uuid not null references public.shifts (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (schedule_id, employee_id, shift_id)
);

create index if not exists assignments_schedule_id_idx on public.assignments (schedule_id);

alter table public.assignments enable row level security;

create policy "assignments_select_own" on public.assignments
  for select using (owner_id = auth.uid());
create policy "assignments_insert_own" on public.assignments
  for insert with check (owner_id = auth.uid());
create policy "assignments_update_own" on public.assignments
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "assignments_delete_own" on public.assignments
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- subscriptions (billing state — written by the Asaas webhook via the
-- service role key in Phase 5, never directly by the client)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled')),
  asaas_customer_id text,
  asaas_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

alter table public.subscriptions enable row level security;

-- Clients may only read their own subscription. Writes happen server-side
-- (trigger below for the initial free row, Asaas webhook for upgrades),
-- using the service role key which bypasses RLS — so no client write policy
-- is defined here on purpose.
create policy "subscriptions_select_own" on public.subscriptions
  for select using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- New user bootstrap: create a default business + free subscription row
-- the moment someone signs up, so the rest of the app always has them.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.businesses (owner_id) values (new.id);
  insert into public.subscriptions (owner_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Plan limits (Free: up to 5 employees, 1 schedule; Pro: unlimited).
-- Enforced here, server-side, so the limits hold even if a client bypasses
-- the friendly frontend gate in usePlan(). The frontend checks proactively
-- for a good UX; these triggers are the real guarantee.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_employee_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_plan text;
  employee_count integer;
begin
  select plan into current_plan from public.subscriptions where owner_id = new.owner_id;
  if current_plan = 'pro' then
    return new;
  end if;

  select count(*) into employee_count from public.employees where owner_id = new.owner_id;
  if employee_count >= 5 then
    raise exception 'O plano Free permite até 5 funcionários. Faça upgrade para o plano Pro para cadastrar mais.';
  end if;

  return new;
end;
$$;

drop trigger if exists employees_enforce_limit on public.employees;
create trigger employees_enforce_limit
  before insert on public.employees
  for each row execute function public.enforce_employee_limit();

create or replace function public.enforce_schedule_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_plan text;
  schedule_count integer;
begin
  select plan into current_plan from public.subscriptions where owner_id = new.owner_id;
  if current_plan = 'pro' then
    return new;
  end if;

  select count(*) into schedule_count from public.schedules where owner_id = new.owner_id;
  if schedule_count >= 1 then
    raise exception 'O plano Free permite apenas 1 escala ativa. Faça upgrade para o plano Pro para ter histórico de escalas.';
  end if;

  return new;
end;
$$;

drop trigger if exists schedules_enforce_limit on public.schedules;
create trigger schedules_enforce_limit
  before insert on public.schedules
  for each row execute function public.enforce_schedule_limit();
