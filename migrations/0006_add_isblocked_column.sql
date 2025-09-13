-- Add isBlocked column to users table
DO $$ 
BEGIN
    -- Add isBlocked column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_blocked') THEN
        ALTER TABLE users ADD COLUMN is_blocked boolean DEFAULT false NOT NULL;
        RAISE NOTICE 'Added is_blocked column';
    ELSE
        RAISE NOTICE 'is_blocked column already exists';
    END IF;
END $$;