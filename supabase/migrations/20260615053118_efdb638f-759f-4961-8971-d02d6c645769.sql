
CREATE POLICY "Users upload review photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'reviews');
CREATE POLICY "Users update own review photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'reviews' AND owner = auth.uid());
CREATE POLICY "Users delete own review photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'reviews' AND owner = auth.uid());
