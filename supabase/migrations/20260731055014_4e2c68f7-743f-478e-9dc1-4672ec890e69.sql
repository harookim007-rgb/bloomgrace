ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_reminder_sent_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS replied_at timestamptz;
GRANT SELECT, UPDATE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;