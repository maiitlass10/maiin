# Environment and deployment

## Environment variables

| Name | Where | Secret? | Value |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env` (committed), Vercel | No | `https://<project>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env` (committed), Vercel | No (public by design, RLS protects the data) | `sb_publishable_...` |
| `NEXT_PUBLIC_SITE_URL` | Vercel, production only | No | The final domain, e.g. `https://maiin.com`. Leave unset on previews: the Vercel URL is used. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Vercel, production only, **at launch** | No | `true` lets search engines index the site. Unset everywhere else: previews get `noindex` (robots.txt, meta tag and `X-Robots-Tag` header). |

Set automatically by Vercel, nothing to do: `VERCEL_ENV`, `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`.

Rules:

- Never commit the Supabase **secret** key (`sb_secret_...`) or the database password. The site does not need them.
- Local overrides go in `.env.local` (ignored by git).
- Behind a proxy (the cloud container), Node needs `NODE_USE_ENV_PROXY=1` to reach Supabase.

## Preview deployment on Vercel (not the commercial launch)

1. Sign in to vercel.com with GitHub and **Add New → Project → import `maiitlass10/maiin`**.
2. Framework: Next.js (detected). Build command and output: defaults.
3. Environment variables: add the two `NEXT_PUBLIC_SUPABASE_*` values from `.env` for **Production, Preview and Development**. Do **not** add `NEXT_PUBLIC_ALLOW_INDEXING`.
4. Settings → Git → **Production Branch**: set it to `main` (the default). The working branches (`sprint-6`, `sprint-7`, ...) then deploy as **Preview** deployments, each with its own URL.
5. Push a branch (or open the project's Deployments tab) and open the preview URL.
6. Settings → Deployment Protection: previews are protected by Vercel login by default. To show the company without a Vercel account, use **Shareable Links** (or turn protection off for previews while testing).
7. Supabase → Authentication → URL Configuration → **Redirect URLs**: add the exact branch preview URL followed by `/**` (for example `https://maiin-git-sprint-7-<team>.vercel.app/**`), so sign-up and password reset links come back to the preview. Use the branch URL (it stays the same across pushes), and never a wildcard for all of `vercel.app`: anyone can host a site there.

Checks after the first preview:

- `/robots.txt` shows `Disallow: /`, and the response headers include `X-Robots-Tag: noindex, nofollow`.
- Pages load products from Supabase (not the fallback catalogue): edit a product in admin and see it change within a minute.
- Sign up, log in, add to bag, place a cash-on-delivery order.
- Open the preview from a phone in Syria without a VPN.
