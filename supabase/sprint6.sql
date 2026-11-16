-- MAIIN Sprint 6: store contact details and policy settings, edited from the
-- admin panel and shown in the footer and the information pages.
-- Paste into the SQL Editor and Run. Safe to run more than once.

alter table public.settings add column if not exists whatsapp text check (length(whatsapp) <= 30);
alter table public.settings add column if not exists phone text check (length(phone) <= 30);
alter table public.settings add column if not exists email text check (length(email) <= 120);
alter table public.settings add column if not exists address_ar text check (length(address_ar) <= 300);
alter table public.settings add column if not exists address_en text check (length(address_en) <= 300);
alter table public.settings add column if not exists hours_ar text check (length(hours_ar) <= 120);
alter table public.settings add column if not exists hours_en text check (length(hours_en) <= 120);
alter table public.settings add column if not exists instagram text check (length(instagram) <= 200);
alter table public.settings add column if not exists facebook text check (length(facebook) <= 200);
alter table public.settings add column if not exists tiktok text check (length(tiktok) <= 200);
alter table public.settings add column if not exists exchange_days int not null default 7 check (exchange_days between 0 and 60);
alter table public.settings add column if not exists delivery_days text not null default '2-5' check (length(delivery_days) <= 20);
