-- ============================================================================
-- Seed: ÖJAB dorm hero images (from oejab.at listing thumbnails)
-- APPLY: psql $DATABASE_URL -f supabase/seeds/ojab_dorm_images.sql
-- Idempotent: upserts image_url on slug.
-- ============================================================================

update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/0/d/1/d/0d1dff0ddc0065ce14b6372e347fcf70570d0606/2026_en-770x351.jpeg' where slug = 'ojab-europahaus-buchwieser';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/3/e/2/0/3e20f6b08cc6637e0dfcdc93fb3837299ea3c0f4/IMG_9674-1000x667-770x351.webp' where slug = 'ojab-greenhouse';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/7/0/b/d/70bddea8b5bd8914a1df26241719318455dfa54e/Einzelzimmer_%C3%96JAB-Haus%20Burgenland1_IMG_8016-770x351.jpeg' where slug = 'ojab-haus-burgenland-1';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/3/7/c/2/37c2e65d75d42c23bc5b6cc40f6f9864fa9b062c/Doppelzimmer_%C3%96JAB-Haus%20Burgenland2_IMG_4505-770x351.jpeg' where slug = 'ojab-haus-burgenland-2';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/8/5/6/7/856722a9f30fabdcd2900c73117d1faa36b8c9aa/Doppelzimmer_%C3%96JAB-Haus%20Burgenland3__IMG_8756-770x351.webp' where slug = 'ojab-haus-burgenland-3';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/2/d/e/4/2de43f402074e665c025352924311feba97d3e8f/Einzelzimmer_%C3%96JAB-Haus%20Donaufeld_IMG_9963-770x351.jpeg' where slug = 'ojab-haus-donaufeld';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/9/7/6/0/9760811963b24ad01fcfd581a7b9cbbd5b0c5ee7/IMG_6644_w%C3%A4rmer-770x351.webp' where slug = 'ojab-haus-kirchschlaeger';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/3/5/6/b/356b79c85784a2b3d3e47817587f9f248d7baa52/Einzelzimmer_1_OEJAB-Haus%20Johannesgasse_IMG_5548ba-770x351.webp' where slug = 'ojab-haus-johannesgasse';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/4/8/f/8/48f8c9ea0f35ed4505b14431b9b0e44a26dfa244/Einzelzimmer_Garconniere_OEJAB-Haus%20Liesing_IMG_3002-770x351.webp' where slug = 'ojab-haus-liesing';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/3/2/b/6/32b6a5527112f32e6f1a666f38fb24e1e359d458/Meidling_en-770x351.webp' where slug = 'ojab-haus-meidling';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/1/b/8/7/1b87d7ff3623e9e2930cdca0b434e7392213a2ad/N%C3%B62_en-770x351.jpeg' where slug = 'ojab-haus-niederoesterreich-1';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/1/b/8/7/1b87d7ff3623e9e2930cdca0b434e7392213a2ad/N%C3%B62_en-770x351.jpeg' where slug = 'ojab-haus-niederoesterreich-2';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/5/7/0/8/5708333833c0b66c66e9614fc8bb1598710a9efe/Einzelzimmer%20OEJAB-Haus%20Peter%20Jordan_IMG_0464_ba1_72dpi-770x351.webp' where slug = 'ojab-haus-peter-jordan';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/2/5/5/c/255c8ecaf2eb2b6f650afb163423c27ef202c719/IMG_9182-770x351.webp' where slug = 'ojab-haus-remise';
update public.dorms set image_url = 'https://www.oejab.at/_Resources/Persistent/d/9/0/8/d908383cb422179736b9910e97e94dc59a16076c/Krems_en-770x351.webp' where slug = 'ojab-haus-salzburg-wien';
