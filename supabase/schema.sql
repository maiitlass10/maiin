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

-- ================= Sprint 4 additions =================

-- ---------- Customer profiles ----------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  full_name text check (length(full_name) <= 120),
  phone text check (length(phone) <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Every new sign-up gets a profile, with the name given at registration.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, full_name, phone)
  values (new.id, left(new.raw_user_meta_data ->> 'full_name', 120), left(new.raw_user_meta_data ->> 'phone', 30))
  on conflict (user_id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
-- Profiles for accounts that existed before this trigger.
insert into public.profiles (user_id) select id from auth.users on conflict do nothing;

-- ---------- Addresses ----------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  label text check (length(label) <= 40),
  full_name text not null check (length(full_name) between 1 and 120),
  phone text not null check (length(phone) between 6 and 30),
  governorate text not null check (length(governorate) <= 40),
  area text not null check (length(area) between 1 and 120),
  street text check (length(street) <= 200),
  details text check (length(details) <= 300),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses (user_id);

-- ---------- Saved bag and wishlist (synced from the browser when signed in) ----------
create table if not exists public.cart_items (
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  item_id text not null check (length(item_id) <= 40),
  size text not null check (length(size) <= 20),
  qty int not null check (qty between 1 and 9),
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id, size)
);

create table if not exists public.wishlist_items (
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  product_id text not null check (length(product_id) <= 40),
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------- Promo codes ----------
create table if not exists public.promo_codes (
  code text primary key check (code ~ '^[A-Z0-9_-]{3,30}$'),
  kind text not null check (kind in ('percent', 'fixed')),
  value numeric(10, 2) not null check (value > 0),
  min_subtotal numeric(10, 2) not null default 0 check (min_subtotal >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses int check (max_uses is null or max_uses > 0),
  uses int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (kind <> 'percent' or value <= 90)
);

-- Checks a code without exposing the list of codes. Returns the discount in USD,
-- or an error key: not_found, inactive, not_started, expired, used_up, min_subtotal.
create or replace function public.check_promo(p_code text, p_subtotal numeric)
returns table (code text, kind text, value numeric, min_subtotal numeric, discount numeric, error text)
language plpgsql stable security definer set search_path = '' as $$
declare r public.promo_codes;
begin
  select * into r from public.promo_codes pc where pc.code = upper(trim(p_code));
  if not found then return query select upper(trim(p_code)), null::text, null::numeric, null::numeric, 0::numeric, 'not_found'; return; end if;
  if not r.is_active then return query select r.code, r.kind, r.value, r.min_subtotal, 0::numeric, 'inactive'; return; end if;
  if r.starts_at is not null and now() < r.starts_at then return query select r.code, r.kind, r.value, r.min_subtotal, 0::numeric, 'not_started'; return; end if;
  if r.ends_at is not null and now() > r.ends_at then return query select r.code, r.kind, r.value, r.min_subtotal, 0::numeric, 'expired'; return; end if;
  if r.max_uses is not null and r.uses >= r.max_uses then return query select r.code, r.kind, r.value, r.min_subtotal, 0::numeric, 'used_up'; return; end if;
  if p_subtotal < r.min_subtotal then return query select r.code, r.kind, r.value, r.min_subtotal, 0::numeric, 'min_subtotal'; return; end if;
  return query select r.code, r.kind, r.value, r.min_subtotal,
    round(least(p_subtotal, case when r.kind = 'percent' then p_subtotal * r.value / 100 else r.value end), 2), null::text;
end $$;

-- ---------- Orders (created at checkout in Sprint 5) ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 10001),
  user_id uuid references auth.users on delete set null,
  status text not null default 'new' check (status in ('new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null check (payment_method in ('cod', 'shamcash')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'awaiting_confirmation', 'paid', 'refunded')),
  receipt_url text,
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  address jsonb not null,
  notes text check (length(notes) <= 500),
  subtotal numeric(10, 2) not null,
  discount numeric(10, 2) not null default 0,
  shipping numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  syp_rate numeric(12, 2) not null,
  promo_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders on delete cascade,
  item_id text not null,
  name_ar text not null,
  name_en text not null,
  image text,
  size text not null,
  qty int not null check (qty between 1 and 9),
  unit_price numeric(10, 2) not null
);
create index if not exists order_items_order_idx on public.order_items (order_id);

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

-- ---------- Row level security ----------
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.promo_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Customers manage only their own rows; staff can read customer details for orders.
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "staff read profiles" on public.profiles;
create policy "staff read profiles" on public.profiles for select to authenticated using (public.is_staff());

drop policy if exists "own addresses" on public.addresses;
create policy "own addresses" on public.addresses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own cart" on public.cart_items;
create policy "own cart" on public.cart_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own wishlist" on public.wishlist_items;
create policy "own wishlist" on public.wishlist_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "staff manage promos" on public.promo_codes;
create policy "staff manage promos" on public.promo_codes for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "own orders" on public.orders;
create policy "own orders" on public.orders for select to authenticated using (user_id = auth.uid());
drop policy if exists "staff read orders" on public.orders;
create policy "staff read orders" on public.orders for select to authenticated using (public.is_staff());
drop policy if exists "staff update orders" on public.orders;
create policy "staff update orders" on public.orders for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "own order items" on public.order_items;
create policy "own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));

grant select, insert, update, delete on public.profiles, public.addresses, public.cart_items, public.wishlist_items to authenticated;
grant select, insert, update, delete on public.promo_codes to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant execute on function public.check_promo(text, numeric) to anon, authenticated;

-- A starter code so the bag can be tried right away. Edit or remove it in the admin panel.
insert into public.promo_codes (code, kind, value, min_subtotal) values ('WELCOME10', 'percent', 10, 0) on conflict do nothing;

-- ================= Sprint 5 additions =================

-- Places an order for the signed-in customer. Prices, sold-out sizes, the promo
-- code and shipping are all worked out here from the database, never trusted
-- from the browser. Errors are raised with short codes the site translates.
create or replace function public.place_order(p_lines jsonb, p_address_id uuid, p_payment text, p_promo text default null, p_notes text default null)
returns table (order_id uuid, order_number bigint)
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  addr public.addresses;
  cfg public.settings;
  promo public.promo_codes;
  line jsonb;
  item_id text;
  item_size text;
  item_qty int;
  p public.products;
  r public.rack_pieces;
  items jsonb := '[]'::jsonb;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_shipping numeric := 0;
  v_code text := nullif(upper(trim(coalesce(p_promo, ''))), '');
  v_order uuid;
  v_number bigint;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if p_payment not in ('cod', 'shamcash') then raise exception 'bad_payment'; end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then raise exception 'empty_bag'; end if;
  if jsonb_array_length(p_lines) > 30 then raise exception 'too_many_items'; end if;

  select * into addr from public.addresses a where a.id = p_address_id and a.user_id = uid;
  if not found then raise exception 'address_not_found'; end if;
  select * into cfg from public.settings where id = 1;

  for line in select * from jsonb_array_elements(p_lines) loop
    item_id := line ->> 'id';
    item_size := coalesce(line ->> 'size', '—');
    item_qty := greatest(1, least(9, coalesce((line ->> 'qty')::int, 1)));
    select * into p from public.products pr where pr.id = item_id and pr.is_active;
    if found then
      if item_size = any (p.sold_out) then raise exception 'sold_out:%:%', item_id, item_size; end if;
      if cardinality(p.sizes) > 0 and not (item_size = any (p.sizes)) then raise exception 'bad_size:%:%', item_id, item_size; end if;
      items := items || jsonb_build_object('id', p.id, 'name_ar', p.name_ar, 'name_en', p.name_en, 'image', p.images[1], 'size', item_size, 'qty', item_qty, 'price', p.price);
      v_subtotal := v_subtotal + p.price * item_qty;
    else
      select * into r from public.rack_pieces rp where rp.id = item_id and rp.is_active;
      if not found then raise exception 'unavailable:%', item_id; end if;
      items := items || jsonb_build_object('id', r.id, 'name_ar', r.name_ar, 'name_en', r.name_en, 'image', r.cutout_url, 'size', item_size, 'qty', item_qty, 'price', r.price);
      v_subtotal := v_subtotal + r.price * item_qty;
    end if;
  end loop;

  if v_code is not null then
    select * into promo from public.promo_codes pc where pc.code = v_code for update;
    if not found or not promo.is_active
       or (promo.starts_at is not null and now() < promo.starts_at)
       or (promo.ends_at is not null and now() > promo.ends_at)
       or (promo.max_uses is not null and promo.uses >= promo.max_uses)
       or v_subtotal < promo.min_subtotal then
      raise exception 'promo_invalid';
    end if;
    v_discount := round(least(v_subtotal, case when promo.kind = 'percent' then v_subtotal * promo.value / 100 else promo.value end), 2);
    update public.promo_codes set uses = uses + 1 where code = v_code;
  end if;

  v_shipping := case when v_subtotal - v_discount >= cfg.free_shipping_from then 0 else cfg.shipping_fee end;

  insert into public.orders (user_id, payment_method, contact_name, contact_phone, contact_email, address, notes, subtotal, discount, shipping, total, syp_rate, promo_code)
  values (
    uid, p_payment, addr.full_name, addr.phone, (select email from auth.users where id = uid),
    jsonb_build_object('label', addr.label, 'governorate', addr.governorate, 'area', addr.area, 'street', addr.street, 'details', addr.details),
    nullif(left(trim(coalesce(p_notes, '')), 500), ''),
    round(v_subtotal, 2), v_discount, v_shipping, round(v_subtotal - v_discount + v_shipping, 2), cfg.syp_per_usd, v_code
  )
  returning id, number into v_order, v_number;

  insert into public.order_items (order_id, item_id, name_ar, name_en, image, size, qty, unit_price)
  select v_order, i ->> 'id', i ->> 'name_ar', i ->> 'name_en', i ->> 'image', i ->> 'size', (i ->> 'qty')::int, (i ->> 'price')::numeric
  from jsonb_array_elements(items) i;

  delete from public.cart_items where user_id = uid;
  return query select v_order, v_number;
end $$;

-- ---------- Sham Cash receipts (private bucket) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Customers upload into a folder named after their user id; staff can read all receipts.
drop policy if exists "customers upload own receipts" on storage.objects;
create policy "customers upload own receipts" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "read own or staff receipts" on storage.objects;
create policy "read own or staff receipts" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff()));

-- Links an uploaded receipt to the customer's own Sham Cash order.
create or replace function public.attach_receipt(p_order uuid, p_path text)
returns void language plpgsql security definer set search_path = '' as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order and user_id = auth.uid();
  if not found then raise exception 'order_not_found'; end if;
  if o.payment_method <> 'shamcash' or o.status = 'cancelled' or o.payment_status = 'paid' then raise exception 'not_allowed'; end if;
  if split_part(p_path, '/', 1) <> auth.uid()::text then raise exception 'bad_path'; end if;
  update public.orders set receipt_url = p_path, payment_status = 'awaiting_confirmation' where id = p_order;
end $$;

-- Cancels Sham Cash orders with no receipt after 24 hours. Runs hourly (below)
-- and whenever staff open the orders page.
create or replace function public.cancel_stale_orders()
returns int language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if auth.uid() is not null and not public.is_staff() then raise exception 'not_allowed'; end if;
  update public.orders set status = 'cancelled'
  where payment_method = 'shamcash' and payment_status = 'unpaid' and status = 'new' and created_at < now() - interval '24 hours';
  get diagnostics n = row_count;
  return n;
end $$;

grant execute on function public.place_order(jsonb, uuid, text, text, text) to authenticated;
grant execute on function public.attach_receipt(uuid, text) to authenticated;
grant execute on function public.cancel_stale_orders() to authenticated;

-- Hourly schedule with pg_cron, when the extension is available on the project.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('maiin-cancel-stale-orders', '15 * * * *', 'select public.cancel_stale_orders()');
exception when others then
  raise notice 'pg_cron not available (%); stale orders are cancelled when staff open the orders page', sqlerrm;
end $$;
