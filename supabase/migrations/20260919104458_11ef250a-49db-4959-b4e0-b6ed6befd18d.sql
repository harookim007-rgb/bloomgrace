ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS attachments text[] NOT NULL DEFAULT '{}';

CREATE POLICY "Users can upload inquiry attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'inquiries'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users and admins can view inquiry attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'inquiries'
  AND (
    (storage.foldername(name))[2] = auth.uid()::text
    OR private.has_role(auth.uid(), 'admin'::app_role)
    OR private.has_role(auth.uid(), 'master_admin'::app_role)
  )
);