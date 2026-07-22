USE jhanvika_jewelleries;

-- Add category image support for existing databases.
ALTER TABLE categories
  ADD COLUMN image_url VARCHAR(500) NULL AFTER tagline;
