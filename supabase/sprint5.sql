-- MAIIN Sprint 5: placing orders, Sham Cash receipts, and auto-cancelling unpaid
-- Sham Cash orders after 24 hours. Paste into the SQL Editor and Run.
-- Safe to run more than once. Also included at the end of schema.sql.

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
