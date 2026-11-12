# MAIIN · ماين

متجر ملابس أونلاين في سوريا، بالعربي والإنكليزي. الدفع عند الاستلام أو عبر شام كاش.

An online clothing store for Syria, in Arabic and English, with cash on delivery and Sham Cash.

## Run locally · التشغيل

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. The site redirects to `/ar`; the English version is at `/en`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Project layout

```
messages/            Arabic and English copy (ar.json, en.json)
src/app/[locale]/    Pages, one folder per route
src/components/      UI components (layout/ holds header, footer, menus)
src/i18n/            Locale routing and navigation helpers
src/lib/             Store settings, price formatting, categories
docs/SPRINTS.md      Sprint plan and progress
CLAUDE.md            Agreed decisions and coding conventions
```

## Stack

Next.js 15 · TypeScript · Tailwind CSS 4 · next-intl · Supabase (from Sprint 3) · Vercel
