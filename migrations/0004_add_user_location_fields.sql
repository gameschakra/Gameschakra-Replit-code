-- Add city and country fields to users table
ALTER TABLE users ADD COLUMN city text;
ALTER TABLE users ADD COLUMN country text;