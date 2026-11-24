# Sprint 7 audit · مراجعة الأساس

Review of the code as it is on `sprint-6` (commit `b722014`), before any Sprint 7 change. Goal: find what is already done, what is missing, and fix only what is safe without changing how the site works.

Status: ✅ already fine · 🔧 fixed in Sprint 7 · 👤 needs the owner · 📅 planned for a later sprint

## 1. Fix what is there

| Finding | Status |
|---|---|
| Language switch (AR ⇄ EN) did nothing: the client router fetched the other language but never showed it. Already broken on `sprint-6` before the design work, checked on a separate build of that commit. | 🔧 Now a plain link with a full page load; keeps the query string; works without JavaScript. |
| 404 page still used the old black button. | 🔧 Matches the new orange button. |
| Two lint warnings (an `<img>` in the 3D rack code, a ref in an effect). Not errors, the rack is no longer on the homepage. | 📅 Clean up if the rack comes back. |

## 2. Database audit

| Finding | Status |
|---|---|
| 12 tables, all with row level security on: `staff`, `settings`, `categories`, `products`, `rack_pieces`, `profiles`, `addresses`, `cart_items`, `wishlist_items`, `promo_codes`, `orders`, `order_items`. | ✅ |
| Orders are priced in the database (`place_order`): prices, sizes, sold-out sizes, promo and shipping are never trusted from the browser; quantity capped at 1–9, 30 lines max; address must belong to the customer. | ✅ |
| `supabase/schema.sql` repeats the Sprint 4 and 5 additions that also live in `sprint4.sql` / `sprint5.sql`. Re-runnable, so harmless, but two copies can drift. | 📅 Sprint 8, when the schema changes for variants and stock: one migration file per change. |
| Live data (row counts, unused columns, real indexes) not checked: the cloud container cannot reach Supabase. | 👤 Run the read-only queries in section 7 in the SQL Editor and send the results. |

## 3. Row level security

| Finding | Status |
|---|---|
| Shoppers can read only active products, categories and rack pieces; staff see everything. | ✅ |
| Customers can read and change only their own profile, addresses, bag and wishlist; read only their own orders and order items; cannot update orders. | ✅ |
| Receipts bucket is private; customers upload only into their own folder; staff read all. `attach_receipt` checks the order belongs to the customer and the path is theirs. | ✅ |
| Product photo bucket: only staff can upload, change or delete. | ✅ |
| `check_promo` can be called by anyone, so promo codes could be guessed by trying many codes. Low risk (it only says whether a code works). | 📅 Sprint 13 security audit: rate limit. |

## 4. Auth

| Finding | Status |
|---|---|
| Email and password sign-up, login, password reset; redirects use the current site address, so they work on previews too once the URL is allowed in Supabase. | ✅ |
| "Confirm email" is off until an email service is set up. | 👤 / 📅 Sprint 9 (notifications) brings the email service; then turn it back on. |
| Admin pages refresh the session in middleware; shop pages stay cacheable. | ✅ |

## 5. Roles

| Finding | Status |
|---|---|
| The `staff` table already has `owner` and `editor`, and every admin action checks the user is staff. But both roles can do everything, including the dollar rate, the Sham Cash account and deleting products. | 👤 Decide the permissions below; then the database rules and the admin screens follow (needs a SQL file the owner runs). |

Proposed permissions:

| Action | Owner | Editor |
|---|---|---|
| Products and photos: add, edit, hide | ✅ | ✅ |
| Delete a product | ✅ | ❌ |
| Orders: change status, confirm payment | ✅ | ✅ |
| Settings: dollar rate, shipping, Sham Cash account, contact details | ✅ | ❌ |
| Promo codes | ✅ | ❌ |
| Add or remove staff | ✅ (in Supabase for now) | ❌ |

## 6. Environment variables

| Finding | Status |
|---|---|
| Only public values in the repo (`.env`: Supabase URL and publishable key). No secret key or password anywhere in the code. | ✅ |
| `.env.local` and `.vercel` were not in `.gitignore`. | 🔧 Added, so a local secret can never be committed by mistake. |
| No single list of variables. | 🔧 `docs/ENVIRONMENT.md`, with the Vercel preview steps. |
| Previews could be indexed by Google. | 🔧 Indexing is off unless `NEXT_PUBLIC_ALLOW_INDEXING=true` (only at launch): robots.txt, meta tag and `X-Robots-Tag` header. |
| No security headers. | 🔧 `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`, no `X-Powered-By`. Full CSP in Sprint 13. |
| CI ran only on `main` and pull requests, not on the sprint branches. | 🔧 Also on `sprint-*` branches. |

## 7. Error handling

| Finding | Status |
|---|---|
| There was a 404 page but no error page: a crash showed Next.js's default screen. | 🔧 `error.tsx` (friendly message, try again, back home; header and footer stay) and `global-error.tsx` (if the whole layout fails, Arabic and English). |
| If Supabase is down, the shop falls back to the bundled catalogue and logs the error. | ✅ |
| Server actions return `{ ok, error }`; checkout errors are translated codes from the database. | ✅ |
| No error tracking service (errors only in Vercel logs). | 📅 Sprint 13. |

## Read-only queries for the owner (Supabase → SQL Editor)

```sql
-- Row counts
select 'products' t, count(*) from products union all
select 'orders', count(*) from orders union all
select 'profiles', count(*) from profiles union all
select 'staff', count(*) from staff;

-- Indexes on public tables
select tablename, indexname from pg_indexes where schemaname = 'public' order by 1, 2;

-- Tables without RLS (should return nothing)
select relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
```

## How to test this sprint

1. AR ⇄ EN on any page, also on a filtered category (`/ar/c/women?size=M`): the same page opens in the other language with the filter kept.
2. `/robots.txt` shows `Disallow: /`.
3. A missing page (`/ar/xyz`) shows the 404 page with the orange button.
4. Everything that worked before still works: home, categories, filters, search, product page, bag, wishlist, account, checkout, admin login.
