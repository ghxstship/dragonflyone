-- Migration: Add first-class columns for equipment metadata
-- Replaces JSON metadata field with proper database columns for better indexing and querying
-- Complies with 3NF requirements

-- Add new columns to equipment table
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS serial_number TEXT,
ADD COLUMN IF NOT EXISTS last_maintenance DATE;

-- Migrate existing data from metadata JSON to new columns
UPDATE equipment
SET
  location = COALESCE(metadata->>'location', location),
  serial_number = COALESCE(metadata->>'serial_number', serial_number),
  last_maintenance = CASE
    WHEN metadata->>'last_maintenance' IS NOT NULL
    THEN (metadata->>'last_maintenance')::DATE
    ELSE last_maintenance
  END;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(location);
CREATE INDEX IF NOT EXISTS idx_equipment_serial_number ON equipment(serial_number);
CREATE INDEX IF NOT EXISTS idx_equipment_last_maintenance ON equipment(last_maintenance);

-- Add comments for documentation
COMMENT ON COLUMN equipment.location IS 'Physical location of the equipment item';
COMMENT ON COLUMN equipment.serial_number IS 'Manufacturer serial number for equipment tracking';
COMMENT ON COLUMN equipment.last_maintenance IS 'Date of last maintenance or inspection';
