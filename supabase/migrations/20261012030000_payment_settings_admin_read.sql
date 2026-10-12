-- The admin payment screen reads every column, but signed-in users only held column-level
-- SELECT, so the screen failed with a permission error. Row access stays admin-only through
-- the "payment_settings_admin_read" policy; customers keep using get_checkout_payment_info().
GRANT SELECT ON public.payment_settings TO authenticated;
