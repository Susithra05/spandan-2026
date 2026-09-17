-- 1. Create a table to store user registrations
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  year_of_study TEXT NOT NULL,
  tier TEXT NOT NULL,
  selected_events TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can view their own registrations
CREATE POLICY "Users can view own registrations" 
ON registrations FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Policy: Users can insert their own registration
CREATE POLICY "Users can insert their own registration" 
ON registrations FOR INSERT 
WITH CHECK (auth.uid() = user_id);