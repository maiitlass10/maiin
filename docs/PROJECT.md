# MAIIN · Project guide

Online clothing store for a company in Syria, built sprint by sprint. See `docs/SPRINTS.md` for the plan and status.

## Decisions (agreed with the owner, don't change without asking)

- **Brand:** MAIIN (ماين). Wordmark in wide-spaced serif capitals with the Arabic name under it.
- **Colours (owner's request, Sprint 6): 60-30-10.** Off-white `--bg` #F7F6F2 (60%: page, cards), deep navy `--fg` #1E2447 (30%: text, announcement bar, and the `.band` sections: statement waves, sale tile, wardrobe banner, footer), orange `--accent` #FF6B1A (10%: main action buttons, "new" badges, bag count). Text on orange is white and bold (`text-accent-fg`), as in the reference. Buttons are pills (`rounded-full`), photos and cards have rounded corners (`rounded-2xl`/`rounded-3xl`). Sale prices, discounts and errors use the deeper orange `--sale` #C2410C so small text stays readable. Inside `.band` the tokens flip, so `bg-bg`/`text-fg`/`text-muted`/`border-line` work unchanged. Rest of the editorial style stays: serif headings via `font-display` (Playfair Display / El Messiri), body in Cairo/Inter, real lifestyle photos (`public/images/editorial/`), React Bits GradientWaves (now a navy sea with an orange horizon). Wordmark: MAIIN in wide-spaced serif capitals with ماين under it. Light theme only for now.
- **Homepage hero (owner's reference):** navy stage with a soft orange glow and a giant MAIIN wordmark (the two I's outlined). Three slides change on their own every 6.5 s (`src/components/home/HeroSlides.tsx`): each has a real model cut-out standing in front of the wordmark (`public/images/editorial/hero-1..3.webp`), its own headline and buttons; dots with a progress bar and a pause button, paused on hover/focus, no autoplay under reduced motion. The four service promises sit in a glass bar at the bottom.
- **Languages:** Arabic (default, RTL) and English, via `next-intl`. Every user-facing string lives in `messages/ar.json` and `messages/en.json`; never hard-code copy in components.
- **Currency:** prices stored and shown in USD, with the Syrian pound price next to them using an admin-editable rate (`src/lib/config.ts` until Sprint 3).
- **Payment:** cash on delivery and Sham Cash only (customer uploads the transfer receipt, staff confirm it in the admin panel). No card gateway.
- **3D rack:** taken off the homepage at the owner's request (Sprint 6). The code stays in `src/components/rack3d/` and the rack manager in admin still works, in case it comes back.
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS 4, Supabase (database, auth, storage), deployed on Vercel.
- **Data:** the catalogue, rack pieces and settings live in Supabase (`supabase/schema.sql`, `supabase/seed.sql`). `src/data/products.ts` is only a fallback. Read through `src/lib/data.ts`; write through the server actions in `src/app/[locale]/admin/actions.ts`, which call `revalidateTag("catalog")`.
- **Admin:** `/[locale]/admin`, Supabase email login, access limited to rows in `public.staff`. RLS is the real guard; the UI checks are for convenience.

## Conventions

- RTL first: use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `border-s`) and never `ml-`/`mr-`/`left-`/`right-` for layout. Directional icons get `flip-rtl` or `ltr:rotate-180`.
- Fonts come from `@fontsource-variable/*` packages (Cairo and El Messiri for Arabic, Inter and Playfair Display for Latin), not `next/font/google`, so builds work without network access to Google.
- Design tokens are CSS variables in `src/app/globals.css`, exposed to Tailwind as `bg`, `fg`, `muted`, `soft`, `sand`, `line`, `accent`, `accent-fg`, `sale`, `ok`, `star`; the display serif is `--font-display`.
- Touch targets at least 44px, visible focus, `prefers-reduced-motion` respected.
- Motion: Lenis smooth scrolling (`src/components/motion/SmoothScroll.tsx`, wheel only, stops while a dialog or menu is open) drives GSAP's ticker; scroll animations go through `Reveal` (`data-reveal` children fade up, `data-parallax` images drift). Above-the-fold intros use CSS (`.hero-in`) so the first paint never flashes. Everything is off under reduced motion. Pointer effects live in `src/components/motion/PointerFX.tsx` (mounted once in the store layout): `.btn-3d` / `.btn-3d-ghost` buttons have a raised edge, lift on hover, sink on press, a shine sweep and lean toward the pointer; `data-tilt` (optional max angle, e.g. `data-tilt="5"`) tilts a card in 3D with a glare; `data-depth-root` + `data-depth="n"` layers drift by depth (the hero). Mouse only, off under reduced motion. React Bits components are copied into `src/components/ui/` (licence allows use inside this site).
- Placeholder photos (hero models and products) come from Pexels; sources in `docs/PHOTOS.md`. Product photos are 1200×1600 (3:4).
- Prices go through `formatUsd` / `formatSyp` in `src/lib/format.ts`.
- Before merging, `npm run lint` and `npm run build` must pass (CI runs both).
- Commits are authored by the owner (`maiitlass10`).

## Supabase

- `.env` holds the public URL and publishable key (safe to commit). Never commit the secret key or database password.
- Schema changes: edit `supabase/schema.sql` (keep it re-runnable) and ask the owner to run it in the SQL Editor.
- Behind a corporate or sandbox proxy, Node's fetch needs `NODE_USE_ENV_PROXY=1` to reach Supabase (e.g. `NODE_USE_ENV_PROXY=1 npm run build`).
