create policy "Users can view their project files"
on files
for select
using (
  exists (
    select 1 from projects
    where projects.id = files.project_id
    and projects.user_id = auth.uid()
  )
);

create policy "Users can insert into their project files"
on files
for insert
with check (
  exists (
    select 1 from projects
    where projects.id = files.project_id
    and projects.user_id = auth.uid()
  )
);

create policy "Users can update their project files"
on files
for update
using (
  exists (
    select 1 from projects
    where projects.id = files.project_id
    and projects.user_id = auth.uid()
  )
);

create policy "Users can delete their project files"
on files
for delete
using (
  exists (
    select 1 from projects
    where projects.id = files.project_id
    and projects.user_id = auth.uid()
  )
);