-- Add reference_url field to products table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'reference_url'
    ) THEN
        ALTER TABLE products ADD COLUMN reference_url text;
    END IF;
END $$;

