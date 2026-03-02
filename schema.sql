-- Create the users table
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_type TEXT NOT NULL,
    available_balance NUMERIC DEFAULT 0,
    bank_name TEXT,
    withdraw_account_number TEXT,
    withdrawal_fee NUMERIC DEFAULT 0,
    initial_deposit NUMERIC DEFAULT 0,
    transactions JSONB DEFAULT '[]'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read users (for login/admin checks - in a real app this should be more restricted, but matching existing logic)
CREATE POLICY "Enable read access for all users" ON public.users
    FOR SELECT USING (true);

-- Allow anyone to insert users (for admin creating users)
CREATE POLICY "Enable insert for all users" ON public.users
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update users (for admin editing users)
CREATE POLICY "Enable update for all users" ON public.users
    FOR UPDATE USING (true);

-- Allow anyone to delete users (for admin deleting users)
CREATE POLICY "Enable delete for all users" ON public.users
    FOR DELETE USING (true);

-- Create an index on user_id for faster lookups
CREATE INDEX users_user_id_idx ON public.users (user_id);
