alter table projects
add constraint projects_name_length
check (char_length(name) >= 3 and char_length(name) <= 50);

alter table projects
add constraint projects_visibility_check
check (visibility in ('private', 'public'));

alter table projects
add constraint projects_environment_check
check (environment in ('browser', 'node', 'react', 'empty'));

alter table projects
add constraint projects_language_check
check (language in ('javascript', 'typescript'));