# MAIIN · ماين

Online clothing store for a company in Syria. Built sprint by sprint with the owner; see `docs/SPRINTS.md` for the plan and status.

## Decisions (agreed with the owner, don't change without asking)

- **Brand:** MAIIN (ماين). Wordmark in heavy Latin capitals with the Arabic name under it.
- **Style D, white and black, commercial:** dense like large fashion marketplaces. Black for text and actions, red (`--sale`) only for discounts and sale prices. Square corners, no decorative gradients. Light theme only for now.
- **Languages:** Arabic (default, RTL) and English, via `next-intl`. Every user-facing string lives in `messages/ar.json` and `messages/en.json`; never hard-code copy in components.
- **Currency:** prices stored and shown in USD, with the Syrian pound price next to them using an admin-editable rate (`src/lib/config.ts` until Sprint 3).
- **Payment:** cash on delivery and Sham Cash only (customer uploads the transfer receipt, staff confirm it in the admin panel). No card gateway.
- **Signature feature:** a 3D perspective rack showcase (garments hang on a receding rail, the selected piece swings to face the viewer, details panel with on-model photos). Planned for Sprint 1.
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS 4, Supabase (database, auth, storage) from Sprint 3, deployed on Vercel.

## Conventions

- RTL first: use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `border-s`) and never `ml-`/`mr-`/`left-`/`right-` for layout. Directional icons get `flip-rtl` or `ltr:rotate-180`.
- Fonts come from `@fontsource-variable/*` packages (Cairo for Arabic, Inter for Latin), not `next/font/google`, so builds work without network access to Google.
- Design tokens are CSS variables in `src/app/globals.css`, exposed to Tailwind as `bg`, `fg`, `muted`, `soft`, `line`, `sale`, `ok`, `star`.
- Touch targets at least 44px, visible focus, `prefers-reduced-motion` respected.
- Prices go through `formatUsd` / `formatSyp` in `src/lib/format.ts`.
- Before merging, `npm run lint` and `npm run build` must pass (CI runs both).

## UI/UX skill

The `ui-ux-pro-max` skill is vendored in `.claude/skills/ui-ux-pro-max`. Run its search from the repo root:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack nextjs
```

Use it for UX rules and the pre-delivery checklist. Its palette and font suggestions do not override the decisions above.
