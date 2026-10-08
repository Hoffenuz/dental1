-- Security and consistency migration for the dental CRM.
-- Apply this migration with a project administrator after linking the project.

begin;

-- The dashboard and bot now use this one vocabulary everywhere.
alter table public.appointments
  drop constraint if exists appointments_status_check;
alter table public.appointments
  add constraint appointments_status_check
  check (status in ('kutilmoqda', 'tasdiqlandi', 'qabulda', 'bajarildi', 'bekor_qilindi', 'kelmadi'));

-- A unique start time protects the common booking race condition. Existing
-- conflicting data is deliberately not deleted by this migration.
create unique index if not exists appointments_active_doctor_start_key
  on public.appointments (doctor_id, appointment_date, start_time)
  where status <> 'bekor_qilindi';

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Durable, server-only state for the multi-step Telegram booking flow.
create table if not exists public.telegram_booking_sessions (
  chat_id bigint primary key,
  session jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.is_clinic_admin(target_clinic_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
      and (target_clinic_id is null or au.clinic_id = target_clinic_id)
  );
$$;

revoke all on function public.is_clinic_admin(uuid) from public;
grant execute on function public.is_clinic_admin(uuid) to authenticated;

alter table public.clinics enable row level security;
alter table public.doctors enable row level security;
alter table public.services enable row level security;
alter table public.doctor_schedules enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.dental_records enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_users enable row level security;
alter table public.telegram_booking_sessions enable row level security;

-- Remove the old "FOR ALL USING (true)" policies. They exposed patient data
-- and gave anonymous visitors write access to the CRM.
do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'clinics', 'doctors', 'services', 'doctor_schedules', 'patients',
    'appointments', 'dental_records', 'notifications', 'admin_users',
    'telegram_booking_sessions'
  ] loop
    for policy_name in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = table_name
    loop
      execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    end loop;
  end loop;
end;
$$;

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
grant usage on schema public to anon, authenticated;

grant select on public.clinics, public.doctors, public.services to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

create policy "public can read clinic details"
  on public.clinics for select to anon, authenticated using (true);
create policy "public can read active doctors"
  on public.doctors for select to anon, authenticated using (is_active = true);
create policy "public can read active services"
  on public.services for select to anon, authenticated using (is_active = true);

create policy "admins manage clinics"
  on public.clinics for all to authenticated
  using ((select public.is_clinic_admin(id)))
  with check ((select public.is_clinic_admin(id)));
create policy "admins manage doctors"
  on public.doctors for all to authenticated
  using ((select public.is_clinic_admin(clinic_id)))
  with check ((select public.is_clinic_admin(clinic_id)));
create policy "admins manage services"
  on public.services for all to authenticated
  using ((select public.is_clinic_admin(clinic_id)))
  with check ((select public.is_clinic_admin(clinic_id)));
create policy "admins manage schedules"
  on public.doctor_schedules for all to authenticated
  using ((select public.is_clinic_admin()))
  with check ((select public.is_clinic_admin()));
create policy "admins manage patients"
  on public.patients for all to authenticated
  using ((select public.is_clinic_admin(clinic_id)))
  with check ((select public.is_clinic_admin(clinic_id)));
create policy "admins manage appointments"
  on public.appointments for all to authenticated
  using ((select public.is_clinic_admin(clinic_id)))
  with check ((select public.is_clinic_admin(clinic_id)));
create policy "admins manage dental records"
  on public.dental_records for all to authenticated
  using ((select public.is_clinic_admin()))
  with check ((select public.is_clinic_admin()));
create policy "admins manage notifications"
  on public.notifications for all to authenticated
  using ((select public.is_clinic_admin()))
  with check ((select public.is_clinic_admin()));
create policy "admins can read their own membership"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

-- The service-role key used by the Edge Function bypasses RLS; no browser
-- role receives access to booking sessions or patient data.
commit;

-- Bootstrap once after creating the first Supabase Auth account:
-- insert into public.admin_users (user_id, clinic_id)
-- values ('<auth.users.id>', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');
