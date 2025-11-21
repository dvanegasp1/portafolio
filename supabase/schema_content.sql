-- Split content schema for the portfolio Admin
-- Run in Supabase SQL editor (after setup.sql or independently)

-- 0) Admin allowlist (if not already created)
create table if not exists app_admins (
  email text primary key,
  created_at timestamptz default now()
);
alter table app_admins enable row level security;
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

-- Helper predicate for admin check (inline in policies below)
-- exists (select 1 from app_admins a where lower(a.email) = lower((auth.jwt() ->> 'email')))

-- 1) Site settings (single site: id = 1)
create table if not exists site_settings (
  id int primary key,
  site_name text not null,
  role text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- optional column used by UI for logo stored in Storage
alter table site_settings add column if not exists logo_path text;
alter table site_settings enable row level security;
insert into site_settings (id, site_name, role)
values (1, 'Beiby Vanegaz', 'Data Analyst')
on conflict (id) do nothing;

drop policy if exists "site_settings public read" on site_settings;
create policy "site_settings public read" on site_settings for select using (true);

drop policy if exists "site_settings admin write" on site_settings;
create policy "site_settings admin write"
on site_settings for all to authenticated
using (
  id = 1 and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  id = 1 and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

-- 2) SEO
create table if not exists seo (
  site_id int primary key references site_settings(id) on delete cascade,
  title text,
  description text
);
alter table seo enable row level security;
insert into seo (site_id, title, description)
values (1, 'Beiby Vanegaz — Data Analytics Portfolio', 'Data analyst transforming raw data into clear, actionable insights.')
on conflict (site_id) do nothing;

drop policy if exists "seo public read" on seo;
create policy "seo public read" on seo for select using (true);

drop policy if exists "seo admin write" on seo;
create policy "seo admin write"
on seo for all to authenticated
using (
  site_id = 1 and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  site_id = 1 and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

-- 3) Hero
create table if not exists hero (
  site_id int primary key references site_settings(id) on delete cascade,
  badge text,
  title text,
  subtitle text,
  primary_cta_label text,
  primary_cta_href text,
  secondary_cta_label text,
  secondary_cta_href text,
  image_path text -- storage key like 'hero/cover.png'
);
alter table hero enable row level security;
insert into hero (site_id, badge, title, subtitle)
values (1, 'Data Analytics', 'Turning Data Into Decisions', 'Clean data, clear dashboards, and compelling stories.')
on conflict (site_id) do nothing;

drop policy if exists "hero public read" on hero;
create policy "hero public read" on hero for select using (true);

drop policy if exists "hero admin write" on hero;
create policy "hero admin write"
on hero for all to authenticated
using (
  site_id = 1 and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  site_id = 1 and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

-- 4) About
create table if not exists about (
  site_id int primary key references site_settings(id) on delete cascade,
  heading text,
  description text
);
-- allow storing an image_path for About section
alter table about add column if not exists image_path text;
alter table about enable row level security;
insert into about (site_id, heading, description)
values (1, 'Hi, I''m Beiby Vanegaz', 'Data Analyst focused on transforming data into outcomes.')
on conflict (site_id) do nothing;

drop policy if exists "about public read" on about;
create policy "about public read" on about for select using (true);

drop policy if exists "about admin write" on about;
create policy "about admin write"
on about for all to authenticated
using (
  site_id = 1 and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  site_id = 1 and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

create table if not exists about_highlights (
  id bigserial primary key,
  site_id int not null references site_settings(id) on delete cascade,
  value text not null,
  sort_order int default 0
);
alter table about_highlights enable row level security;
insert into about_highlights (site_id, value, sort_order)
values
  (1, 'kanime', 10),
  (1, 'Power BI, Tableau, Looker Studio', 20)
on conflict do nothing;

drop policy if exists "about_highlights public read" on about_highlights;
create policy "about_highlights public read" on about_highlights for select using (true);

drop policy if exists "about_highlights admin write" on about_highlights;
create policy "about_highlights admin write"
on about_highlights for all to authenticated
using (
  site_id = 1 and exists (
    select 1 from app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  site_id = 1 and exists (
    select 1 from app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

-- 5) Services
create table if not exists services (
  id bigserial primary key,
  site_id int not null references site_settings(id) on delete cascade,
  icon text check (icon in ('BarChart3','Database','LineChart','Workflow')),
  title text not null,
  description text,
  icon_path text,
  sort_order int default 0
);
-- Add icon_path column if it doesn't exist (for existing tables)
alter table services add column if not exists icon_path text;
alter table services enable row level security;
drop policy if exists "services public read" on services;
create policy "services public read" on services for select using (true);
drop policy if exists "services admin write" on services;
create policy "services admin write"
on services for all to authenticated
using (
  site_id = 1 and exists (
    select 1 from app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  site_id = 1 and exists (
    select 1 from app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

-- 6) Projects + tags
create table if not exists projects (
  id bigserial primary key,
  site_id int not null references site_settings(id) on delete cascade,
  title text not null,
  description text,
  link text,
  cover_image_path text,
  sort_order int default 0
);
alter table projects enable row level security;
drop policy if exists "projects public read" on projects;
create policy "projects public read" on projects for select using (true);
drop policy if exists "projects admin write" on projects;
create policy "projects admin write"
on projects for all to authenticated
using (
  site_id = 1 and exists (
    select 1 from app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  site_id = 1 and exists (
    select 1 from app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

create table if not exists project_tags (
  project_id bigint references projects(id) on delete cascade,
  tag text not null,
  primary key (project_id, tag)
);
alter table project_tags enable row level security;
drop policy if exists "project_tags public read" on project_tags;
create policy "project_tags public read" on project_tags for select using (true);
drop policy if exists "project_tags admin write" on project_tags;
create policy "project_tags admin write"
on project_tags for all to authenticated
using (
  exists (
    select 1 from projects p
    where p.id = project_id and p.site_id = 1
  ) and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  exists (
    select 1 from projects p
    where p.id = project_id and p.site_id = 1
  ) and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

-- 7) Contact
create table if not exists contact (
  site_id int primary key references site_settings(id) on delete cascade,
  email text,
  location text,
  schedule_url text
);
alter table contact enable row level security;
insert into contact (site_id, email, location)
values (1, 'hello@example.com', 'Remote / Worldwide')
on conflict (site_id) do nothing;

drop policy if exists "contact public read" on contact;
create policy "contact public read" on contact for select using (true);

drop policy if exists "contact admin write" on contact;
create policy "contact admin write"
on contact for all to authenticated
using (
  site_id = 1 and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  site_id = 1 and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

-- 8) Visibility toggles
create table if not exists visibility (
  site_id int primary key references site_settings(id) on delete cascade,
  services boolean default true,
  projects boolean default true,
  testimonials boolean default false,
  team boolean default false
);
-- add resume toggle used by front-end
alter table visibility add column if not exists resume boolean default true;
alter table visibility enable row level security;
insert into visibility (site_id) values (1)
on conflict (site_id) do nothing;

drop policy if exists "visibility public read" on visibility;
create policy "visibility public read" on visibility for select using (true);

drop policy if exists "visibility admin write" on visibility;
create policy "visibility admin write"
on visibility for all to authenticated
using (
  site_id = 1 and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  site_id = 1 and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

-- 9) Why Us blocks
create table if not exists why_us (
  id bigserial primary key,
  site_id int not null references site_settings(id) on delete cascade,
  icon text check (icon in ('Users','Target')),
  title text not null,
  subtitle text,
  sort_order int default 0
);
alter table why_us enable row level security;
drop policy if exists "why_us public read" on why_us;
create policy "why_us public read" on why_us for select using (true);
drop policy if exists "why_us admin write" on why_us;
create policy "why_us admin write"
on why_us for all to authenticated
using (
  site_id = 1 and exists (
    select 1 from app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  site_id = 1 and exists (
    select 1 from app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

-- 10) Storage bucket for images
insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

-- Public read for bucket assets
drop policy if exists "assets public read" on storage.objects;
create policy "assets public read"
on storage.objects for select
using (bucket_id = 'portfolio-assets');

-- Admin write for bucket assets
drop policy if exists "assets admin insert" on storage.objects;
create policy "assets admin insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'portfolio-assets' and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

drop policy if exists "assets admin update" on storage.objects;
create policy "assets admin update"
on storage.objects for update to authenticated
using (
  bucket_id = 'portfolio-assets' and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  bucket_id = 'portfolio-assets' and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

drop policy if exists "assets admin delete" on storage.objects;
create policy "assets admin delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'portfolio-assets' and exists (
    select 1 from public.app_admins a
    where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

-- End of split schema

-- 11) Resume: education and experience
create table if not exists education (
  id bigserial primary key,
  site_id int not null references site_settings(id) on delete cascade,
  institution text not null,
  program text,
  location text,
  start_year text,
  end_year text,
  description text,
  achievements text, -- pipe or newline separated, parsed by UI
  icon_path text,
  sort_order int default 0
);
alter table education enable row level security;
drop policy if exists "education public read" on education;
create policy "education public read" on education for select using (true);
drop policy if exists "education admin write" on education;
create policy "education admin write"
on education for all to authenticated
using (
  site_id = 1 and exists (
    select 1 from public.app_admins a where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  site_id = 1 and exists (
    select 1 from public.app_admins a where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

create table if not exists experience (
  id bigserial primary key,
  site_id int not null references site_settings(id) on delete cascade,
  company text not null,
  role text,
  location text,
  start_year text,
  end_year text,
  description text,
  achievements text,
  icon_path text,
  sort_order int default 0
);
alter table experience enable row level security;
drop policy if exists "experience public read" on experience;
create policy "experience public read" on experience for select using (true);
drop policy if exists "experience admin write" on experience;
create policy "experience admin write"
on experience for all to authenticated
using (
  site_id = 1 and exists (
    select 1 from public.app_admins a where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  site_id = 1 and exists (
    select 1 from public.app_admins a where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

-- 12) Resume meta (summary text shown above timeline)
create table if not exists resume_meta (
  site_id int primary key references site_settings(id) on delete cascade,
  summary text
);

-- 13) Blog posts
create table if not exists blog_posts (
  id bigserial primary key,
  site_id int not null references site_settings(id) on delete cascade,
  title text not null,
  slug text not null,
  excerpt text,
  content_md text,
  cover_image_path text,
  tags text, -- pipe-separated list
  published boolean default false,
  published_at timestamptz,
  sort_order int default 0,
  unique (site_id, slug)
);
alter table blog_posts enable row level security;

-- Public can read only published posts
drop policy if exists "blog_posts public read" on blog_posts;
create policy "blog_posts public read" on blog_posts for select using (
  site_id = 1 and published = true
);

-- Admins can read and write all
drop policy if exists "blog_posts admin read" on blog_posts;
create policy "blog_posts admin read" on blog_posts for select to authenticated using (
  site_id = 1 and exists (
    select 1 from public.app_admins a where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);

drop policy if exists "blog_posts admin write" on blog_posts;
create policy "blog_posts admin write" on blog_posts for all to authenticated using (
  site_id = 1 and exists (
    select 1 from public.app_admins a where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
) with check (
  site_id = 1 and exists (
    select 1 from public.app_admins a where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);
alter table resume_meta enable row level security;
insert into resume_meta (site_id, summary)
values (1, '')
on conflict (site_id) do nothing;

drop policy if exists "resume_meta public read" on resume_meta;
create policy "resume_meta public read" on resume_meta for select using (true);

drop policy if exists "resume_meta admin write" on resume_meta;
create policy "resume_meta admin write"
on resume_meta for all to authenticated
using (
  site_id = 1 and exists (
    select 1 from public.app_admins a where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
)
with check (
  site_id = 1 and exists (
    select 1 from public.app_admins a where lower(a.email) = lower((auth.jwt() ->> 'email'))
  )
);
