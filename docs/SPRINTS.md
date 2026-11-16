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

## Sprint 4 · Bag and accounts · السلة والحسابات
- Bag, wishlist, promo codes
- Customer sign-in (email or phone), address book
- "My orders" and order tracking

## Sprint 5 · Checkout and orders · الدفع والطلبات
- Checkout with cash on delivery or Sham Cash (receipt upload)
- Owner: Sham Cash account number or QR
- Admin order queue: new, awaiting payment confirmation, preparing, shipped, delivered
- Auto-cancel unpaid Sham Cash orders after 24 hours and return stock
- Order confirmation messages

## Sprint 6 · Launch · الإطلاق
- Owner: Vercel account and domain
- Deploy, performance, SEO, policy pages (privacy, returns, shipping)
- Full test on phone and desktop
