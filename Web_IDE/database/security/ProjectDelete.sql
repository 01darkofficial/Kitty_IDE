alter table projects
add constraint projects_user_fk
foreign key (user_id)
references auth.users(id)
on delete cascade;