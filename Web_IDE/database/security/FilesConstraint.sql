alter table files
add constraint files_type_check
check (type in ('file', 'folder'));

alter table files
add constraint files_name_length
check (char_length(name) >= 1 and char_length(name) <= 255);