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

## Admin panel · لوحة التحكم

Open http://localhost:3000/ar/admin and sign in with a staff account. To add a staff member:

1. Supabase → Authentication → Users → Add user (tick "Auto Confirm User").
2. SQL Editor → run:

```sql
insert into public.staff (user_id, role)
select id, 'editor' from auth.users where email = 'staff@example.com';
```

## Database

The schema and starter data are in `supabase/schema.sql` and `supabase/seed.sql`. Both can be pasted into the Supabase SQL Editor and are safe to run again.

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
docs/PROJECT.md      Agreed decisions and coding conventions
```

## Stack

Next.js 15 · TypeScript · Tailwind CSS 4 · next-intl · Supabase · onnxruntime-web (background removal) · Vercel
