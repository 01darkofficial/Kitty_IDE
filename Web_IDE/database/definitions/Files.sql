create table files (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null references projects(id) on delete cascade,

  parent_id uuid references files(id) on delete cascade,

  name text not null,
  type text not null, -- 'file' or 'folder'

  content text, -- null for folders

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);