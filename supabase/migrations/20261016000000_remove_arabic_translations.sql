-- Arabic is no longer a storefront language; drop the stored Arabic translations.
UPDATE public.categories SET translations = translations - 'ar' WHERE translations ? 'ar';
UPDATE public.products SET translations = translations - 'ar' WHERE translations ? 'ar';
UPDATE public.banners SET translations = translations - 'ar' WHERE translations ? 'ar';
UPDATE public.menu_items SET translations = translations - 'ar' WHERE translations ? 'ar';
