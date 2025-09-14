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

## Roadmap

- Optional CMS integration, contact provider (EmailJS/Formspree)
- Rich editors for Services/Projects, multilingual support

