
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS skin_types text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS products_skin_types_gin ON public.products USING GIN (skin_types);

CREATE OR REPLACE FUNCTION public.get_top_selling_products(
  p_skin_type text DEFAULT NULL,
  p_days integer DEFAULT 7,
  p_limit integer DEFAULT 30
)
RETURNS TABLE (
  product_id uuid,
  sales_count bigint,
  rank bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH agg AS (
    SELECT
      oi.product_id,
      COALESCE(SUM(oi.quantity), 0)::bigint AS sales_count
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    JOIN public.products p ON p.id = oi.product_id
    WHERE o.status NOT IN ('cancelled', 'canceled', 'refunded', 'pending')
      AND o.created_at >= now() - make_interval(days => GREATEST(p_days, 1))
      AND p.is_active = true
      AND (
        p_skin_type IS NULL
        OR p_skin_type = ''
        OR p_skin_type = ANY (p.skin_types)
      )
    GROUP BY oi.product_id
  )
  SELECT
    product_id,
    sales_count,
    ROW_NUMBER() OVER (ORDER BY sales_count DESC, product_id) AS rank
  FROM agg
  ORDER BY sales_count DESC, product_id
  LIMIT GREATEST(p_limit, 1);
$$;

REVOKE ALL ON FUNCTION public.get_top_selling_products(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_top_selling_products(text, integer, integer) TO anon, authenticated, service_role;
