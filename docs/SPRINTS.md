# MAIIN sprint plan · خطة السبرنتات

Each sprint ends with a demo link, the owner's feedback, and fixes before the next one starts.

## ✅ Sprint 0 · Foundation · الأساس
- [x] Next.js 15 + TypeScript + Tailwind 4 project
- [x] Arabic (RTL, default) and English with a language switch
- [x] Style D tokens, Cairo and Inter fonts, MAIIN wordmark
- [x] Header: announcement bar, logo, search, account, wishlist, bag, category bar, mobile menu
- [x] Footer with links, social and payment methods
- [x] Store settings: USD with SYP conversion, free-shipping threshold, payment methods
- [x] CI: lint and build on every push
- [x] Owner: give the repo push access

## ✅ Sprint 1 · Homepage · الصفحة الرئيسية
- [x] Hero banner carousel: autoplay with pause button, swipe, dots, stops for reduced motion
- [x] Trust strip: delivery, cash on delivery / Sham Cash, exchanges
- [x] Category circles
- [x] Flash sale with a countdown to midnight
- [x] **3D rack showcase**: receding rail, front piece swings to face the viewer, scroll / swipe / arrow keys, details view with a styling photo
- [x] "Recommended for you" grid with tabs (all, women, men, kids) and "Show more"
- [x] Product cards: discount and new badges, rating, sold count, wishlist, quick add with size picker
- [x] Bag and wishlist saved in the browser, live bag count in the header
- [x] Mobile bottom navigation
- [x] Security: patched postcss; production dependencies report 0 vulnerabilities
- Placeholder photos from Unsplash; rack cut-outs made with automatic background removal

## ✅ Sprint 2 · Shop and product · المتجر والمنتج
- [x] Category pages for all 11 sections (`/c/women`, `/c/sale`, ...), pre-built for speed
- [x] Filters: size (hides sold-out), colour, price range, on-sale only; active filter chips; filters kept in the URL so pages can be shared
- [x] Sorting: recommended, newest, price both ways, best selling, top rated
- [x] Infinite scroll, empty state, mobile filter sheet
- [x] Product page: zoomable photo, colour and size pickers with sold-out sizes, size guide table, quantity, add to bag, wishlist
- [x] Delivery, payment and exchange info; description, care and shipping sections
- [x] Reviews summary (example reviews, clearly labelled, until Sprint 4) and related products
- [x] Search that tolerates Arabic spelling variants (أ/ا, ة/ه, ى/ي, diacritics), with best sellers when nothing matches
- [x] Product cards link to product pages; search box keeps the current query

## ✅ Sprint 3 · Database and admin · قاعدة البيانات ولوحة التحكم
- [x] Owner: Supabase project, schema and starter catalogue loaded, owner account on the staff list
- [x] Schema with row level security: shoppers read active products and settings, only staff can write (`supabase/schema.sql`)
- [x] Shop reads products, rack pieces and settings from Supabase; pages refresh within a minute, instantly after an admin save; falls back to the bundled catalogue if the database is unreachable
- [x] Admin panel at `/ar/admin`: staff login, dashboard, products list with search and show/hide, product editor (names, descriptions, prices, categories, colours, sizes and sold-out sizes, flags, order, photo upload with automatic resize to WebP, delete)
- [x] Rack manager with automatic background removal in the browser (U²-Netp model, served from this site) and a styling photo
- [x] Settings: dollar rate in Syrian pounds, free-shipping threshold, shipping fee, Sham Cash account

## ✅ Sprint 4 · Bag and accounts · السلة والحسابات
- [x] Bag page: quantities, remove, promo code, free-shipping bar, totals in USD and SYP
- [x] Wishlist page
- [x] Customer accounts with email and password, password reset
- [x] Address book with Syria's 14 governorates and mobile number check
- [x] "My orders" page (fills up in Sprint 5)
- [x] Bag and wishlist saved to the account and merged across devices
- [x] Promo codes in the admin panel (percent or fixed, minimum order, dates, usage limit)
- [x] Owner: ran `supabase/sprint4.sql`, turned off "Confirm email" until a mail service is set up
- [x] Tested sign-up, profile, bag sync and promo codes against the live database

## ✅ Sprint 5 · Checkout and orders · الدفع والطلبات
- [x] Checkout: choose a saved address (or add one and come back), cash on delivery or Sham Cash, notes, order summary
- [x] `place_order` database function: prices, sold-out sizes, promo code (and its usage count) and shipping are computed in the database, never trusted from the browser; the saved bag is cleared
- [x] Order page for the customer with a five-step status bar; Sham Cash orders show the account number, amount in USD and SYP, and a receipt upload (private storage)
- [x] "My orders" links to each order
- [x] Admin orders: filters (new, awaiting payment, each status), search by number, name or phone, order detail with items, customer contact (call, WhatsApp), receipt photo, confirm payment, change status, cancel
- [x] Dashboard shows new orders and receipts awaiting confirmation
- [x] Unpaid Sham Cash orders are cancelled after 24 hours (hourly job, and whenever staff open the orders page)
- [x] Owner: ran `supabase/sprint5.sql`, added the Sham Cash account number in Settings
- [x] Tested order 10001 (cash on delivery, status changes) and order 10002 (Sham Cash, receipt upload, payment confirmed)

## 🟡 Sprint 6 · Launch · الإطلاق
- [x] Contact details, social links, exchange period and delivery time editable in admin Settings (`supabase/sprint6.sql`)
- [x] Information pages: about, contact (WhatsApp, phone, email, hours, address), privacy, terms, shipping, exchanges, size guide, order tracking
- [x] Footer social links from settings (hidden until filled in)
- [x] SEO: sitemap.xml, robots.txt, canonical and hreflang links, share preview image, product structured data (price, availability)
- [x] New editorial look: warm palette, serif headings, new header and footer, homepage rebuilt with lifestyle photos (hero, shop tiles, new arrivals with tabs, editor's picks, 3D rail, essentials, wardrobe banner)
- [x] Motion: Lenis smooth scroll, GSAP scroll reveals and parallax, React Bits GradientWaves brand section
- [x] Real 3D clothing rack (three.js) replaces the flat rail on the homepage (later removed at the owner's request)
- [x] Orange / navy / off-white colours, pill buttons, rounded cards
- [x] Hero slider: three real models in front of a giant MAIIN wordmark, glass service bar
- [x] Interactive 3D buttons, tilting cards, hero depth on pointer move
- [x] Higher-resolution placeholder product photos (1200×1600, Pexels)
- [ ] Owner: replace placeholder product photos with real ones in the same calm style
- [ ] Owner: run `supabase/sprint6.sql` and fill in contact details
- [ ] Owner: Vercel account, import the repo, first deploy
- [ ] Supabase: add the live URL to Auth redirect URLs
- [ ] Check the live site opens from Syria without a VPN
- [ ] Email service for account emails, then turn "Confirm email" back on
- [ ] Domain (optional), performance check, replace placeholder products with real ones

---

# Phase 2 · المرحلة التانية

Agreed with the owner after Sprint 6. Same rhythm: each sprint ends with a demo, the owner's feedback and fixes. Some items build on work that already exists; the note under each sprint says what is there today.

## ⬜ Sprint 7 · Foundation · الأساس
Today: Supabase schema with RLS, email login, `staff` table, `.env` with the public keys.
- [ ] Fix what is already there: review open bugs, warnings and rough edges
- [ ] Database audit: tables, indexes, constraints, unused columns, seed data
- [ ] RLS review: every table, every role, tested with real queries
- [ ] Auth: sign-up, login, reset, sessions, redirects, email confirmation
- [ ] Roles: owner, staff, customer, with clear permissions per role
- [ ] Environment variables: one documented list, separate values for local / preview / production, no secrets in the repo
- [ ] Error handling: friendly error pages, server action errors, logging

## ⬜ Sprint 8 · E-commerce core · أساس المتجر
Today: products have sizes, colours and sold-out sizes; orders have five statuses.
- [ ] Inventory: stock kept per product variant
- [ ] Sizes and colours as real variants (size × colour)
- [ ] SKU for every variant
- [ ] Stock: decreases on order, comes back on cancel, no overselling
- [ ] Order lifecycle: clear states and transitions, history of who changed what and when

## ⬜ Sprint 9 · Customer experience · تجربة الزبون
Today: order page with a status bar, wishlist, example reviews, product page.
- [ ] Order tracking: timeline with dates, tracking page without logging in
- [ ] Notifications: order placed, payment confirmed, shipped, delivered (email / WhatsApp)
- [ ] Reviews: real reviews from customers who bought the item, with photos and moderation
- [ ] Wishlist improvements: back-in-stock and price-drop alerts, share a list
- [ ] Better product page: photo gallery, zoom, size advice, delivery estimate
- [ ] Complete the Look: pieces that go with this item, add them together

## ⬜ Sprint 10 · Admin · لوحة التحكم
Today: dashboard with new orders and receipts awaiting confirmation.
- [ ] Dashboard redesign
- [ ] Revenue: per day / week / month, USD and SYP
- [ ] Orders analytics: counts, average order, cancellations, payment method split
- [ ] Product analytics: best sellers, most viewed, most wished
- [ ] Inventory alerts: low stock and sold-out variants
- [ ] Customer analytics: new vs returning, top governorates, top customers

## ⬜ Sprint 11 · Premium UX · تجربة فخمة
Today: new homepage, Arabic-tolerant search, filters in the URL, motion.
- [ ] Homepage redesign (refine what we have)
- [ ] Mobile optimisation: every page checked on small phones
- [ ] Search: suggestions while typing, recent searches, typo tolerance
- [ ] Filters: faster, clearer on mobile
- [ ] Loading, empty and error states on every page
- [ ] Light, purposeful animations (review what we have, keep only what helps)

## ⬜ Sprint 12 · AI · الذكاء الاصطناعي
- [ ] AI fashion assistant: chat that answers questions and suggests pieces from the catalogue
- [ ] Product recommendations
- [ ] Outfit generation from the catalogue
- [ ] "Add recommended outfit to bag" in one tap

## ⬜ Sprint 13 · Production · الإطلاق النهائي
- [ ] Tests: unit, integration, end-to-end for checkout
- [ ] Performance: Lighthouse, image sizes, bundle size
- [ ] Security audit
- [ ] CI/CD: tests and checks on every push, automatic deploys
- [ ] Deployment
- [ ] Professional README
- [ ] Architecture diagram
- [ ] Screenshots
- [ ] Demo account
