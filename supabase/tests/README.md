# Database tests

Runs the real schema on a throwaway local PostgreSQL and checks the permissions
(owner, editor, customer, visitor) and that checkout with a promo code still works.
Never point these at the live Supabase project: the test inserts users and orders.

```bash
createdb maiin_test
psql -d maiin_test -f supabase/tests/supabase_stub.sql   # stand-in for Supabase's auth and storage
psql -d maiin_test -f supabase/schema.sql
psql -d maiin_test -f supabase/seed.sql
psql -d maiin_test -f supabase/sprint6.sql
psql -d maiin_test -f supabase/sprint7.sql
psql -d maiin_test -f supabase/tests/roles_test.sql
```

Expected:

| Line | Expected |
|---|---|
| editor update product rows | 1 |
| editor delete product rows | 0 |
| editor update settings rows | 0 |
| editor sees promos | 0, and inserting a promo fails with a row-level security error |
| owner update settings rows / owner delete product rows | 1 |
| customer check_promo | returns the discount |
| customer sees promos table / customer update settings rows | 0 |
| customer place_order with promo | returns an order number; promo uses goes up by 1 |
| anon reads products | the number of active products |
