-- Allow update and delete on project_documents and space_images (for patching after upload and for deletion from UI)

-- project_documents: update and delete via project ownership
create policy "Users can update project documents"
  on project_documents for update
  using (exists (select 1 from projects where projects.id = project_documents.project_id and projects.user_id = auth.uid()));

create policy "Users can delete project documents"
  on project_documents for delete
  using (exists (select 1 from projects where projects.id = project_documents.project_id and projects.user_id = auth.uid()));

-- space_images: update and delete via space -> project ownership
create policy "Users can update space images"
  on space_images for update
  using (exists (select 1 from spaces join projects on spaces.project_id = projects.id where spaces.id = space_images.space_id and projects.user_id = auth.uid()));

create policy "Users can delete space images"
  on space_images for delete
  using (exists (select 1 from spaces join projects on spaces.project_id = projects.id where spaces.id = space_images.space_id and projects.user_id = auth.uid()));
