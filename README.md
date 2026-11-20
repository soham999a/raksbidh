# Praner Pashe — Bidhannagar community health directory

A fast, bilingual (English / বাংলা) directory that helps people in Bidhannagar find nearby hospitals, blood banks, ambulances, doctors and blood donors. Built with React 19, TanStack Start, Tailwind CSS 4 and deployed on Vercel.

> Sample/demo data is bundled so every flow can be explored without a backend. Data is stored per browser in `localStorage` and stays in sync across open tabs.

## Features

- Emergency one-tap calling for blood, ambulances and hospitals
- Searchable directories with ward, blood-group and availability filters
- Doctor profiles with online status and appointment booking
- Blood donor registration and blood request board
- 24×7 helpline ticket flow, reports and a guided tour
- Health blog, key contacts, ward statistics and admin/doctor panels
- English / Bengali language switch, responsive mobile-first layout
- SEO metadata, custom 404/error pages and accessible controls

## Tech stack

| Area          | Choice                                              |
| ------------- | --------------------------------------------------- |
| Framework     | TanStack Start + React 19                           |
| Routing       | TanStack Router (file-based)                        |
| Styling       | Tailwind CSS 4 + Radix UI + shadcn-style components |
| Validation    | Zod + React Hook Form                               |
| Deploy target | Vercel (Nitro `vercel` preset, Build Output API)    |

## Local development

Requires Node.js 22+ and [Bun](https://bun.sh) 1.3+.

```bash
bun install
bun run dev
```

Open <http://localhost:3000>.

## Quality checks

```bash
bun run typecheck
bun run lint
bun test
bun run build
```

## Deploy to Vercel

1. Import this repository in Vercel.
2. Framework preset: **Other** (the Nitro plugin emits `.vercel/output` directly).
3. Build command: `bun run build`; Install command: `bun install --frozen-lockfile`.
4. Deploy — no environment variables are required.

The production build writes static assets to `.vercel/output/static` and the SSR function to `.vercel/output/functions/__server.func`. You can preview the same output locally with `bun run preview`.

## Project structure

```
src/
  components/ui/    reusable UI primitives
  components/site/  header, footer, tour, floating actions
  lib/              store, seed data, i18n, validation helpers, SEO
  routes/           file-based pages
  styles.css        Tailwind theme and global styles
  server.ts         SSR error-normalising server entry
  start.ts          request middleware configuration
```

# raksbidh
