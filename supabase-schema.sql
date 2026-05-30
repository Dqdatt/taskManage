-- Copy and paste this script into the Supabase SQL Editor to create the required table
-- We use a single table to store the entire state as JSONB, which allows extremely fast drop-in 
-- compatibility with the current App Context without complex relational schema migrations.

CREATE TABLE IF NOT EXISTS public.app_data (
  id text PRIMARY KEY,
  tasks jsonb DEFAULT '[]'::jsonb,
  meeting_history jsonb DEFAULT '[]'::jsonb,
  ai_settings jsonb DEFAULT '{}'::jsonb
);

-- Insert the default global row
INSERT INTO public.app_data (id, tasks, meeting_history, ai_settings)
VALUES ('global', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) to allow public access (since there is no auth yet)
-- WARNING: This allows anyone with the anon key to read/write. Suitable for personal use.
ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to prevent errors on re-run
DROP POLICY IF EXISTS "Allow public all app_data" ON public.app_data;

CREATE POLICY "Allow public all app_data" ON public.app_data 
FOR ALL USING (true) WITH CHECK (true);
