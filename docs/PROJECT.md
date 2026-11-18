# MAIIN · Project guide

Online clothing store for a company in Syria, built sprint by sprint. See `docs/SPRINTS.md` for the plan and status.

## Decisions (agreed with the owner, don't change without asking)

- **Brand:** MAIIN (ماين). Wordmark in wide-spaced serif capitals with the Arabic name under it.
- **Editorial style (Sprint 6, replaced Style D):** calm-luxury fashion look. Warm ivory background (`--bg`), soft stone surfaces (`--soft`, `--sand`), near-black ink for text and actions, red (`--sale`) only for discounts and sale prices. Serif headings via the `font-display` utility (Playfair Display for Latin, El Messiri for Arabic), body in Cairo/Inter. Real lifestyle photos (`public/images/editorial/`), square corners. Gradients only as photo scrims, plus the animated React Bits GradientWaves background (owner's request) in the warm palette. Wordmark: MAIIN in wide-spaced serif capitals with ماين under it. Light theme only for now.
- **Languages:** Arabic (default, RTL) and English, via `next-intl`. Every user-facing string lives in `messages/ar.json` and `messages/en.json`; never hard-code copy in components.
- **Currency:** prices stored and shown in USD, with the Syrian pound price next to them using an admin-editable rate (`src/lib/config.ts` until Sprint 3).
- **Payment:** cash on delivery and Sham Cash only (customer uploads the transfer receipt, staff confirm it in the admin panel). No card gateway.
- **Signature feature:** a real 3D clothing rack on the homepage (`src/components/rack3d/`, three.js via React Three Fiber, loaded only in the browser): metal rack in perspective, garments hang sideways on hooks with price tags, the chosen piece slides out, turns to face the viewer and swings; details panel with sizes and add-to-bag beside it, thumbnail buttons and arrow keys for keyboard and screen readers. Renders only while on screen; falls back to the flat 21st rail (`MaiinRail`) without WebGL.
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS 4, Supabase (database, auth, storage), deployed on Vercel.
- **Data:** the catalogue, rack pieces and settings live in Supabase (`supabase/schema.sql`, `supabase/seed.sql`). `src/data/products.ts` is only a fallback. Read through `src/lib/data.ts`; write through the server actions in `src/app/[locale]/admin/actions.ts`, which call `revalidateTag("catalog")`.
- **Admin:** `/[locale]/admin`, Supabase email login, access limited to rows in `public.staff`. RLS is the real guard; the UI checks are for convenience.

## Conventions

- RTL first: use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `border-s`) and never `ml-`/`mr-`/`left-`/`right-` for layout. Directional icons get `flip-rtl` or `ltr:rotate-180`.
- Fonts come from `@fontsource-variable/*` packages (Cairo and El Messiri for Arabic, Inter and Playfair Display for Latin), not `next/font/google`, so builds work without network access to Google.
- Design tokens are CSS variables in `src/app/globals.css`, exposed to Tailwind as `bg`, `fg`, `muted`, `soft`, `sand`, `line`, `sale`, `ok`, `star`; the display serif is `--font-display`.
- Touch targets at least 44px, visible focus, `prefers-reduced-motion` respected.
- Motion: Lenis smooth scrolling (`src/components/motion/SmoothScroll.tsx`, wheel only, stops while a dialog or menu is open) drives GSAP's ticker; scroll animations go through `Reveal` (`data-reveal` children fade up, `data-parallax` images drift). Above-the-fold intros use CSS (`.hero-in`) so the first paint never flashes. Everything is off under reduced motion. React Bits components are copied into `src/components/ui/` (licence allows use inside this site).
- Prices go through `formatUsd` / `formatSyp` in `src/lib/format.ts`.
- Before merging, `npm run lint` and `npm run build` must pass (CI runs both).
- Commits are authored by the owner (`maiitlass10`).

## Supabase

- `.env` holds the public URL and publishable key (safe to commit). Never commit the secret key or database password.
- Schema changes: edit `supabase/schema.sql` (keep it re-runnable) and ask the owner to run it in the SQL Editor.
- Behind a corporate or sandbox proxy, Node's fetch needs `NODE_USE_ENV_PROXY=1` to reach Supabase (e.g. `NODE_USE_ENV_PROXY=1 npm run build`).
