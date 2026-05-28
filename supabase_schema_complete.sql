-- Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  destination text not null,
  country text not null,
  start_date text,
  end_date text,
  total_budget numeric,
  currency text,
  trip_style text,
  accommodation_type text,
  share_token text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Group Members Table (Includes new gender column)
CREATE TABLE IF NOT EXISTS public.group_members (
  id uuid primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  name text not null,
  age integer not null,
  gender text default 'Not Specified',
  interests jsonb default '[]'::jsonb,
  dietary_restrictions jsonb default '[]'::jsonb,
  accessibility_needs jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Itineraries Table
CREATE TABLE IF NOT EXISTS public.itineraries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade unique not null,
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  description text not null,
  amount numeric not null,
  currency text not null,
  category text not null,
  paid_by text not null,
  split_between jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policies for Trips
CREATE POLICY "Users can view own trips" ON public.trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trips" ON public.trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON public.trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON public.trips FOR DELETE USING (auth.uid() = user_id);

-- Policies for Group Members
CREATE POLICY "Users can view own group members" ON public.group_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = group_members.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can insert own group members" ON public.group_members FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = group_members.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can update own group members" ON public.group_members FOR UPDATE USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = group_members.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can delete own group members" ON public.group_members FOR DELETE USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = group_members.trip_id AND trips.user_id = auth.uid()));

-- Policies for Itineraries
CREATE POLICY "Users can view own itineraries" ON public.itineraries FOR SELECT USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can insert own itineraries" ON public.itineraries FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can update own itineraries" ON public.itineraries FOR UPDATE USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can delete own itineraries" ON public.itineraries FOR DELETE USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()));

-- Policies for Expenses
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()));

-- Add gender to existing group_members if table already existed before this script
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_members') THEN
    ALTER TABLE public.group_members ADD COLUMN IF NOT EXISTS gender text default 'Not Specified';
  END IF;
END
$$;
