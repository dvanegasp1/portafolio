# Beiby Vanegaz — Data Analytics Portfolio

A modern, fast portfolio for a Data Analyst built with Vite, React 18 and Tailwind CSS. It includes an inline Admin overlay (no backend) to manage content and toggles, smooth in‑page navigation, and lightweight hash pages for resources like Blog/Careers.

## Highlights

- Data analytics focus: capabilities, projects, contact
- Admin overlay (localStorage); open `#admin` to edit
- Content‑driven Services and Projects (JSON editors)
- Smooth anchors for home sections; hash pages for resources
- Vite alias `@` → `src` for clean imports

## Tech Stack

- React 18 + Vite
- Tailwind CSS, tailwind-merge, class-variance-authority
- Framer Motion animations
- Radix Toast notifications

## Quick start

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build
```

## Structure

```
src/
  components/            # UI and sections
    Header.jsx           # top navigation
    Hero.jsx             # hero with overlay cards
    About.jsx            # about/skills
    Servicess.jsx        # services/capabilities (content‑driven)
    Projects.jsx         # case studies (content‑driven)
    Contact.jsx          # contact form + info
    Footer.jsx           # footer + newsletter
    AdminPanel.jsx       # inline admin (hash #admin)
    ui/                  # button, toast, toaster
  pages/SimplePage.jsx   # lightweight hash pages
  content/ContentContext.jsx  # content store (localStorage)
  App.jsx                # app shell + hash routing + anchors
  index.css              # tailwind layers + custom utilities
```

## Editing content (Admin)

Open `#admin` to launch the overlay. Tabs:

- General: name, role, SEO, contact email/location
- Hero: badge, title, subtitle, CTAs
- Visibilidad: toggle Services/Projects/Team/Testimonials
- Services JSON: `{ icon, title, description }`
- Projects JSON: `{ title, description, tags[], link }`
- Why Us JSON: overlay cards `{ icon, title, subtitle }`

Data persists to `localStorage`. Supported icons: `BarChart3`, `Database`, `LineChart`, `Workflow`, `Users`, `Target`.

## Navigation model

- Home sections (anchors): `#home`, `#about`, `#services`, `#projects`, `#contact`.
  Header links scroll to these. From a hash page, the app navigates home then scrolls.
- Hash pages rendered by the app: `#/resources`, `#/webinars`, `#/whitepapers`, `#/newsletter`, `#/help`, `#/blog`, `#/careers`.

## Customize

- Colors/utilities: `index.css`, `tailwind.config.js`
- Defaults (name, role, SEO, etc.): `content/ContentContext.jsx`
- Footer links/pages: `components/Footer.jsx`
- Section order: `App.jsx`

## Deploy

Any static host (Vercel/Netlify/GitHub Pages). Build with `npm run build` and deploy the `dist/` folder.

## Troubleshooting

- Admin not opening: URL must end with `#admin` and allow `localStorage`.
- Anchors from subpages: header changes `window.location.hash` then smooth‑scrolls.
- Ensure UTF‑8 encoding for accented characters.

## Supabase (optional)

You can sync Admin content to Supabase. LocalStorage remains as a fallback.

1) Install client

```
npm i @supabase/supabase-js
```

2) Env vars (copy `.env.example` to `.env.local`)

```
VITE_SUPABASE_URL=...       # https://PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=...  # anon public API key
```

3) Database schema (run in Supabase SQL editor)

```sql
create table if not exists site_content (
  id int primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table site_content enable row level security;

-- Seed one row
insert into site_content (id, data) values (1, '{}')
on conflict (id) do nothing;

-- Policies
-- Public read (optional)
create policy "public read" on site_content for select using (true);

-- Authenticated can write the single row (tighten as needed)
create policy "auth can upsert id1" on site_content
for insert to authenticated with check (id = 1);
create policy "auth can update id1" on site_content
for update to authenticated using (id = 1) with check (id = 1);
```

4) Sign in to save

- Open `#admin`. Use the sidebar Supabase box to sign in with an email/password user from your project. The Save button updates local state and will also upsert to Supabase when authenticated.

### Split Schema (normalized tables + storage)

If you prefer normalized tables instead of one JSON blob, run:

- `supabase/setup.sql` (base tables + policies) — already added
- `supabase/schema_content.sql` (hero, seo, about, services, projects, contact, visibility, why_us + Storage bucket policies)

This creates:
- `site_settings` (id=1), `seo`, `hero(image_path)`, `about` + `about_highlights`
- `services` (icon, title, description), `projects(cover_image_path)` + `project_tags`
- `contact`, `visibility`, `why_us`
- Storage bucket `portfolio-assets` with public read; only Admins can write

Upload images from the Admin (example code):

```js
import { supabase } from '@/lib/supabaseClient';

// file: a File from an <input type="file"/>
const bucket = 'portfolio-assets';
const key = `hero/${crypto.randomUUID()}-${file.name}`;
const { data, error } = await supabase.storage.from(bucket).upload(key, file, { upsert: true });
if (error) throw error;

// Save `key` into the table column, e.g. hero.image_path
await supabase.from('hero').upsert({ site_id: 1, image_path: key });

// Public URL (if bucket is public):
const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
const publicUrl = pub?.publicUrl;
```

Note: The current Admin UI still edits the JSON model by default. You can migrate the UI to read/write the normalized tables gradually. The included RLS policies allow public reads and Admin-only writes.

## Roadmap

- Rich editors for Services/Projects, multilingual support
- Contact provider integration (EmailJS/Formspree)

