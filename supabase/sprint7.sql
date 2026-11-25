-- MAIIN Sprint 7: owner and editor permissions.
-- Paste into Supabase: SQL Editor -> New query -> Run. Safe to run more than once.
--
--   Owner and editor: add and edit products, photos and rack pieces; follow
--                     orders, change their status and confirm payments.
--   Owner only:       delete products and rack pieces, change the settings
--                     (dollar rate, shipping, Sham Cash account, contact
--                     details) and manage promo codes.
--
-- Nothing changes for shoppers. Checkout keeps working: place_order and
-- check_promo run with their own rights and still read and count promo codes.

-- True when the signed-in user is on the staff list as owner.
create or replace function public.is_owner()
returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.staff where user_id = auth.uid() and role = 'owner') $$;
grant execute on function public.is_owner() to authenticated;

-- Settings: everyone reads, only the owner changes them.
drop policy if exists "staff update settings" on public.settings;
drop policy if exists "owner update settings" on public.settings;
create policy "owner update settings" on public.settings for update to authenticated using (public.is_owner()) with check (public.is_owner());

-- Products: staff add and edit, only the owner deletes.
drop policy if exists "staff write products" on public.products;
drop policy if exists "staff insert products" on public.products;
drop policy if exists "staff update products" on public.products;
drop policy if exists "owner delete products" on public.products;
create policy "staff insert products" on public.products for insert to authenticated with check (public.is_staff());
create policy "staff update products" on public.products for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "owner delete products" on public.products for delete to authenticated using (public.is_owner());

-- Rack pieces: same as products.
drop policy if exists "staff write rack" on public.rack_pieces;
drop policy if exists "staff insert rack" on public.rack_pieces;
drop policy if exists "staff update rack" on public.rack_pieces;
drop policy if exists "owner delete rack" on public.rack_pieces;
create policy "staff insert rack" on public.rack_pieces for insert to authenticated with check (public.is_staff());
create policy "staff update rack" on public.rack_pieces for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "owner delete rack" on public.rack_pieces for delete to authenticated using (public.is_owner());

-- Promo codes: owner only.
drop policy if exists "staff manage promos" on public.promo_codes;
drop policy if exists "owner manage promos" on public.promo_codes;
create policy "owner manage promos" on public.promo_codes for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Product photos: staff upload and replace, only the owner deletes files.
drop policy if exists "staff delete product photos" on storage.objects;
drop policy if exists "owner delete product photos" on storage.objects;
create policy "owner delete product photos" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and public.is_owner());

-- Check: who is on the staff list and with which role.
select s.role, u.email from public.staff s join auth.users u on u.id = s.user_id order by s.role, u.email;
