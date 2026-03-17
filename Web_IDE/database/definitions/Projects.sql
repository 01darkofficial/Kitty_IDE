create table projects (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  
  template text not null default 'vanilla',
  language text not null default 'javascript',
  visibility text not null default 'private',

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);