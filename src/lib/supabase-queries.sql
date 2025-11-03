-- =====================================================
-- DREAMTRACKER DATABASE SCHEMA
-- =====================================================
-- Run these queries in your Supabase SQL Editor
-- =====================================================

-- 1. Create user profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create dream entries table
CREATE TABLE IF NOT EXISTS public.dream_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sleep_hours DECIMAL(3,1) NOT NULL,
  caffeine_intake INTEGER NOT NULL DEFAULT 0,
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'bad')),
  stress_level INTEGER NOT NULL CHECK (stress_level >= 0 AND stress_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_entries ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for profiles table
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 5. Create RLS Policies for dream_entries table
-- Allow users to view their own entries
CREATE POLICY "Users can view own dream entries"
  ON public.dream_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own entries
CREATE POLICY "Users can insert own dream entries"
  ON public.dream_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own entries
CREATE POLICY "Users can update own dream entries"
  ON public.dream_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own entries
CREATE POLICY "Users can delete own dream entries"
  ON public.dream_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS dream_entries_user_id_idx ON public.dream_entries(user_id);
CREATE INDEX IF NOT EXISTS dream_entries_created_at_idx ON public.dream_entries(created_at DESC);

-- 7. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for updated_at on profiles
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create trigger for automatic profile creation on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- OPTIONAL: Insert test data (for testing purposes)
-- =====================================================
-- You can manually create a test user via Supabase Dashboard Auth
-- Email: test@dreamtracker.com
-- Password: testpass123
-- Then run the following to add sample entries:
-- 
-- INSERT INTO public.dream_entries (user_id, title, content, sleep_hours, caffeine_intake, sleep_quality, mood, stress_level)
-- VALUES 
--   ('YOUR_TEST_USER_ID', 'Flying Through Mountains', 'I was soaring through beautiful mountain ranges...', 8, 1, 9, 'great', 3),
--   ('YOUR_TEST_USER_ID', 'Lost in a Forest', 'Walking through a mysterious dark forest...', 6, 3, 5, 'neutral', 7);

-- =====================================================
-- QUERIES COMPLETE!
-- =====================================================
