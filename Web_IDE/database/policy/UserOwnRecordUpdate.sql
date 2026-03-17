create policy "Users can update own profile"
on public.users
for update
using (auth.uid() = id);

create policy "Users can delete own profile"
on public.users
for delete
using (auth.uid() = id);

CREATE POLICY "Allow user to read own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);