-- MAIIN permission tests. Run on a throwaway database only (see README.md).
\set ON_ERROR_STOP 0
insert into auth.users(id,email) values
 ('00000000-0000-0000-0000-00000000000a','owner@x'),('00000000-0000-0000-0000-00000000000b','editor@x'),('00000000-0000-0000-0000-00000000000c','cust@x');
insert into public.staff(user_id,role) values ('00000000-0000-0000-0000-00000000000a','owner'),('00000000-0000-0000-0000-00000000000b','editor');
insert into public.addresses(user_id, full_name, phone, governorate, area, street) values ('00000000-0000-0000-0000-00000000000c','C','0933000000','damascus','Mazzeh','x');
create or replace function pg_temp.as_user(u text) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', u, false); end $$;

\echo '== EDITOR =='
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
with u as (update public.products set sort = sort where id = (select id from public.products limit 1) returning 1) select 'editor update product rows='||count(*) from u;
with d as (delete from public.products where id = (select id from public.products limit 1) returning 1) select 'editor delete product rows='||count(*) from d;
with u as (update public.settings set shipping_fee = shipping_fee where id = 1 returning 1) select 'editor update settings rows='||count(*) from u;
select 'editor sees promos='||count(*) from public.promo_codes;
insert into public.promo_codes(code, kind, value) values ('EDIT10','percent',10);
select 'editor reads orders ok='||(count(*)>=0) from public.orders;
reset role;

\echo '== OWNER =='
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
with u as (update public.settings set shipping_fee = shipping_fee where id = 1 returning 1) select 'owner update settings rows='||count(*) from u;
insert into public.promo_codes(code, kind, value) values ('OWN10','percent',10);
select 'owner sees promos='||count(*) from public.promo_codes;
with d as (delete from public.products where id = (select id from public.products order by id desc limit 1) returning 1) select 'owner delete product rows='||count(*) from d;
reset role;

\echo '== CUSTOMER =='
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select 'customer check_promo='||(public.check_promo('OWN10', 100))::text;
select 'customer sees promos table='||count(*) from public.promo_codes;
with u as (update public.settings set shipping_fee = 0 where id = 1 returning 1) select 'customer update settings rows='||count(*) from u;
select 'customer place_order with promo -> order '||(public.place_order(jsonb_build_array(jsonb_build_object('id',(select id from public.products where cardinality(sizes)>0 and is_active limit 1),'size',(select sizes[1] from public.products where cardinality(sizes)>0 and is_active limit 1),'qty',1)), (select id from public.addresses limit 1), 'cod', 'OWN10', null))::text;
reset role;
select 'promo uses after order='||uses from public.promo_codes where code='OWN10';

\echo '== ANON =='
set role anon; select pg_temp.as_user('');
select 'anon reads products='||count(*) from public.products;
reset role;
