-- Supabase setup for portfolio Admin sync (admin-only writes)
-- Run this in your Supabase project's SQL editor

-- 1) Content table
create table if not exists site_content (
  id int primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table site_content enable row level security;

-- Seed a single row that the app reads/writes
insert into site_content (id, data)
values (1, '{}')
on conflict (id) do nothing;

-- 2) Admin allowlist (by email)
create table if not exists app_admins (
  email text primary key,
  created_at timestamptz default now()
);

alter table app_admins enable row level security;

-- Manage admins with the service role only (via Dashboard or server scripts)
drop policy if exists "admins managed by service" on app_admins;
create policy "admins managed by service"
on app_admins
for all
to service_role
using (true)
with check (true);

-- Allow authenticated users to read their own admin row (so UI can check admin status)
drop policy if exists "admins see self" on app_admins;
create policy "admins see self"
on app_admins
for select to authenticated
using (lower(email) = lower((auth.jwt() ->> 'email')));

-- Example: seed your admin email (replace!)
-- replace the email below with your own
insert into app_admins (email) values ('tu-email@dominio.com')
on conflict (email) do nothing;

-- 3) Policies for site_content

-- Public read (optional: comment this out to require auth for reads)
drop policy if exists "site_content public read" on site_content;
create policy "site_content public read"
on site_content for select
using (true);

-- Only authenticated users listed in app_admins may write id = 1
drop policy if exists "site_content admin insert" on site_content;
create policy "site_content admin insert"
on site_content
for insert to authenticated
with check (
  id = 1
  and exists (
    select 1
    from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

drop policy if exists "site_content admin update" on site_content;
create policy "site_content admin update"
on site_content
for update to authenticated
using (
  id = 1
  and exists (
    select 1
    from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  id = 1
  and exists (
    select 1
    from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

-- Done. Magic Link auth users added to app_admins can write.
