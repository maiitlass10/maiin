# MAIIN · Project guide

Online clothing store for a company in Syria, built sprint by sprint. See `docs/SPRINTS.md` for the plan and status.

## Decisions (agreed with the owner, don't change without asking)

- **Brand:** MAIIN (ماين). Wordmark in heavy Latin capitals with the Arabic name under it.
- **Style D, white and black, commercial:** dense like large fashion marketplaces. Black for text and actions, red (`--sale`) only for discounts and sale prices. Square corners, no decorative gradients. Light theme only for now.
- **Languages:** Arabic (default, RTL) and English, via `next-intl`. Every user-facing string lives in `messages/ar.json` and `messages/en.json`; never hard-code copy in components.
- **Currency:** prices stored and shown in USD, with the Syrian pound price next to them using an admin-editable rate (`src/lib/config.ts` until Sprint 3).
- **Payment:** cash on delivery and Sham Cash only (customer uploads the transfer receipt, staff confirm it in the admin panel). No card gateway.
- **Signature feature:** a 3D perspective rack showcase (garments hang on a receding rail, the selected piece swings to face the viewer, details panel with on-model photos). Planned for Sprint 1.
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS 4, Supabase (database, auth, storage), deployed on Vercel.
- **Data:** the catalogue, rack pieces and settings live in Supabase (`supabase/schema.sql`, `supabase/seed.sql`). `src/data/products.ts` is only a fallback. Read through `src/lib/data.ts`; write through the server actions in `src/app/[locale]/admin/actions.ts`, which call `revalidateTag("catalog")`.
- **Admin:** `/[locale]/admin`, Supabase email login, access limited to rows in `public.staff`. RLS is the real guard; the UI checks are for convenience.

## Conventions

- RTL first: use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `border-s`) and never `ml-`/`mr-`/`left-`/`right-` for layout. Directional icons get `flip-rtl` or `ltr:rotate-180`.
- Fonts come from `@fontsource-variable/*` packages (Cairo for Arabic, Inter for Latin), not `next/font/google`, so builds work without network access to Google.
- Design tokens are CSS variables in `src/app/globals.css`, exposed to Tailwind as `bg`, `fg`, `muted`, `soft`, `line`, `sale`, `ok`, `star`.
- Touch targets at least 44px, visible focus, `prefers-reduced-motion` respected.
- Prices go through `formatUsd` / `formatSyp` in `src/lib/format.ts`.
- Before merging, `npm run lint` and `npm run build` must pass (CI runs both).
- Commits are authored by the owner (`maiitlass10`).

## Supabase

- `.env` holds the public URL and publishable key (safe to commit). Never commit the secret key or database password.
- Schema changes: edit `supabase/schema.sql` (keep it re-runnable) and ask the owner to run it in the SQL Editor.
- Behind a corporate or sandbox proxy, Node's fetch needs `NODE_USE_ENV_PROXY=1` to reach Supabase (e.g. `NODE_USE_ENV_PROXY=1 npm run build`).
