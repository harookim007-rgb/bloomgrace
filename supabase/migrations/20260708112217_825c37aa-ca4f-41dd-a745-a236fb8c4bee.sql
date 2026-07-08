DROP POLICY IF EXISTS "Media public read products and banners" ON storage.objects;
DROP POLICY IF EXISTS "media reviews public read" ON storage.objects;

CREATE POLICY "Media public read allowed folders"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = ANY (ARRAY['products', 'banners', 'details', 'reviews'])
);