-- MAIIN Sprint 4: customer accounts, addresses, saved bag and wishlist, promo codes,
-- and the orders tables (filled in Sprint 5). Paste into the SQL Editor and Run.
-- Safe to run more than once. Also included at the end of schema.sql.

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
