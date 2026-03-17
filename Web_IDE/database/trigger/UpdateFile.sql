create trigger update_files_updated_at
before update on files
for each row
execute function update_updated_at_column();