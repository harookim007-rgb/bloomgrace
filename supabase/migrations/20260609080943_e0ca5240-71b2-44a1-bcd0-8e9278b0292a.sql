
-- Add thumbnail_url column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Storage policies for 'media' bucket: admins can upload/update/delete, everyone can read
CREATE POLICY "Media public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Admins upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'::app_role));
