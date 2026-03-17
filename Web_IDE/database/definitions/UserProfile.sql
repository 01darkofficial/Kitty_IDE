CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);