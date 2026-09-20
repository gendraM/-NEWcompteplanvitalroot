drop policy if exists "Authenticated upload" on storage.objects;
drop policy if exists "ideaux_images_insert_owner_folder" on storage.objects;

create policy "ideaux_images_insert_owner_folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'ideaux-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
