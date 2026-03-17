create policy "Users can view own projects"
on projects
for select
using (auth.uid() = user_id);

create policy "Users can update own projects"
on projects
for update
using (auth.uid() = user_id);

create policy "Users can delete own projects"
on projects
for delete
using (auth.uid() = user_id);

create policy "Users can insert own projects"
on projects
for insert
with check (auth.uid() = user_id);