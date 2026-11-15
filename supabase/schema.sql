-- MAIIN database schema. Paste into Supabase: SQL Editor -> New query -> Run.
-- Safe to run more than once.

create extension if not exists pgcrypto;

-- ---------- Staff and permissions ----------
create table if not exists public.staff (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

-- True when the signed-in user is a staff member. security definer so it can
-- read the staff table regardless of the caller's own permissions.
create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.staff where user_id = auth.uid()) $$;

-- ---------- Store settings (single row) ----------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  syp_per_usd numeric(12, 2) not null default 13000 check (syp_per_usd > 0),
  free_shipping_from numeric(10, 2) not null default 50 check (free_shipping_from >= 0),
  shipping_fee numeric(10, 2) not null default 3 check (shipping_fee >= 0),
  sham_cash_account text,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ---------- Catalogue ----------
create table if not exists public.categories (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  name_ar text not null,
  name_en text not null,
  image_url text,
  sort int not null default 0,
  is_active boolean not null default true
);

create table if not exists public.products (
  id text primary key default ('p' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  name_ar text not null check (length(name_ar) between 1 and 160),
  name_en text not null check (length(name_en) between 1 and 160),
  description_ar text,
  description_en text,
  price numeric(10, 2) not null check (price >= 0),
  old_price numeric(10, 2) check (old_price is null or old_price > price),
  images text[] not null default '{}',
  categories text[] not null default '{}',
  colors text[] not null default '{}',
  sizes text[] not null default '{}',
  sold_out text[] not null default '{}',
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  reviews int not null default 0,
  sold int not null default 0,
  is_new boolean not null default false,
  is_flash boolean not null default false,
  is_active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_categories_idx on public.products using gin (categories);

-- Pieces shown on the homepage 3D rack. Cut-out photo has a transparent background.
create table if not exists public.rack_pieces (
  id text primary key default ('r' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  product_id text references public.products on delete set null,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  material_ar text,
  material_en text,
  color_ar text,
  color_en text,
  price numeric(10, 2) not null check (price >= 0),
  sizes text[] not null default '{}',
  cutout_url text not null,
  look_url text,
  sort int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Keep updated_at current.
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
drop trigger if exists rack_touch on public.rack_pieces;
create trigger rack_touch before update on public.rack_pieces for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

-- ---------- Row level security ----------
alter table public.staff enable row level security;
alter table public.settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.rack_pieces enable row level security;

-- Shoppers see active catalogue rows and the settings; staff see and change everything.
drop policy if exists "read own staff row" on public.staff;
create policy "read own staff row" on public.staff for select to authenticated using (user_id = auth.uid());

drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings for select to anon, authenticated using (true);
drop policy if exists "staff update settings" on public.settings;
create policy "staff update settings" on public.settings for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select to anon, authenticated using (is_active or public.is_staff());
drop policy if exists "staff write categories" on public.categories;
create policy "staff write categories" on public.categories for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select to anon, authenticated using (is_active or public.is_staff());
drop policy if exists "staff write products" on public.products;
create policy "staff write products" on public.products for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "public read rack" on public.rack_pieces;
create policy "public read rack" on public.rack_pieces for select to anon, authenticated using (is_active or public.is_staff());
drop policy if exists "staff write rack" on public.rack_pieces;
create policy "staff write rack" on public.rack_pieces for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- New tables are not exposed automatically in this project, so grant explicitly.
grant usage on schema public to anon, authenticated;
grant select on public.settings, public.categories, public.products, public.rack_pieces to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.rack_pieces to authenticated;
grant update on public.settings to authenticated;
grant select on public.staff to authenticated;
grant execute on function public.is_staff() to anon, authenticated;

-- ---------- Photo storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "staff upload product photos" on storage.objects;
create policy "staff upload product photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and public.is_staff());
drop policy if exists "staff change product photos" on storage.objects;
create policy "staff change product photos" on storage.objects for update to authenticated
  using (bucket_id = 'products' and public.is_staff());
drop policy if exists "staff delete product photos" on storage.objects;
create policy "staff delete product photos" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and public.is_staff());
