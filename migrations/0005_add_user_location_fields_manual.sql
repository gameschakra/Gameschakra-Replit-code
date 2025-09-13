-- Manually add city and country fields to users table (avoiding enum conflicts)
DO $$ 
BEGIN
    -- Add city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='city') THEN
        ALTER TABLE users ADD COLUMN city text;
    END IF;
    
    -- Add country column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='country') THEN
        ALTER TABLE users ADD COLUMN country text;
    END IF;
END $$;