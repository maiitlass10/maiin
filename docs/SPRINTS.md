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
- [ ] Owner: install the Claude GitHub app on the repo so the session can push

## Sprint 1 · Homepage · الصفحة الرئيسية
- Hero banner carousel with offers
- Category circles
- Flash sale with countdown
- **3D rack showcase** (signature feature)
- "Recommended for you" product grid with cards (discount badge, rating, sold count, quick add)
- Mobile bottom navigation

## Sprint 2 · Shop and product · المتجر والمنتج
- Category pages: filters (size, colour, price), sorting, infinite scroll
- Product page: gallery with zoom, colours, sizes, size chart, reviews, related products
- Search results

## Sprint 3 · Database and admin · قاعدة البيانات ولوحة التحكم
- Owner: free Supabase account
- Products, categories, stock, sizes and offers in the database
- Admin panel with staff login, product editor with photo upload and automatic background removal
- Exchange rate and shipping settings editable by staff

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
