-- Create beta_waitlist table for managing beta tester applications
CREATE TABLE IF NOT EXISTS beta_waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_email ON beta_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_status ON beta_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_beta_waitlist_created_at ON beta_waitlist(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_beta_waitlist_updated_at
    BEFORE UPDATE ON beta_waitlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE beta_waitlist ENABLE ROW LEVEL SECURITY;

-- Policy for public to insert their own waitlist entries
CREATE POLICY "Anyone can submit to waitlist" ON beta_waitlist
    FOR INSERT
    WITH CHECK (true);

-- Policy for users to read their own waitlist entries
CREATE POLICY "Users can view their own waitlist entries" ON beta_waitlist
    FOR SELECT
    USING (auth.email() = email);

-- Policy for admins to view all waitlist entries
CREATE POLICY "Admins can view all waitlist entries" ON beta_waitlist
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Policy for admins to update waitlist entries
CREATE POLICY "Admins can update waitlist entries" ON beta_waitlist
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Add some helpful comments
COMMENT ON TABLE beta_waitlist IS 'Stores beta tester waitlist applications';
COMMENT ON COLUMN beta_waitlist.email IS 'Email address of the person applying for beta access';
COMMENT ON COLUMN beta_waitlist.status IS 'Current status of the application: pending, approved, or rejected';
COMMENT ON COLUMN beta_waitlist.approved_by IS 'User ID of the admin who approved/rejected the application';
COMMENT ON COLUMN beta_waitlist.notes IS 'Admin notes about the application';