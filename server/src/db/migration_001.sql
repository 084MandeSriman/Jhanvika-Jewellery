-- ============================================================
-- Migration: Jewellery specs, images, reviews, OTP, services,
-- search tracking, inventory, notifications
-- Run this via the db-migrate npm script
--
-- NOTE: This migration is meant to run ONCE against the base schema.sql.
-- It does NOT use "IF NOT EXISTS" on ALTER TABLE ... ADD COLUMN because
-- that syntax was only added in MySQL 8.0.29+ and isn't supported on
-- older MySQL servers (it IS supported on MariaDB, but we target the
-- lowest common denominator here so this runs everywhere).
-- If this fails partway through, restore from db:reset and re-run
-- db:schema + db:migrate + db:seed from scratch rather than re-running
-- this file directly against a partially-migrated database.
-- ============================================================

USE jhanvika_jewelleries;

-- ---------- Jewellery specifications on products ----------
ALTER TABLE products
  ADD COLUMN sku VARCHAR(60) UNIQUE NULL AFTER id,
  ADD COLUMN hsn_code VARCHAR(20) NULL,
  ADD COLUMN gold_purity VARCHAR(20) NULL,          -- e.g. '22K', '18K', '14K'
  ADD COLUMN gold_weight DECIMAL(8,3) NULL,          -- grams
  ADD COLUMN net_weight DECIMAL(8,3) NULL,
  ADD COLUMN gross_weight DECIMAL(8,3) NULL,
  ADD COLUMN diamond_weight DECIMAL(8,3) NULL,       -- carats
  ADD COLUMN diamond_clarity VARCHAR(10) NULL,       -- e.g. 'VVS1', 'SI1'
  ADD COLUMN diamond_color VARCHAR(10) NULL,         -- e.g. 'D', 'F', 'G'
  ADD COLUMN stone_weight DECIMAL(8,3) NULL,
  ADD COLUMN hallmark_number VARCHAR(60) NULL,
  ADD COLUMN bis_hallmark TINYINT(1) DEFAULT 0,
  ADD COLUMN certificate_number VARCHAR(60) NULL,
  ADD COLUMN making_charges DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN gst_percent DECIMAL(5,2) DEFAULT 3.00,
  ADD COLUMN size_type ENUM('none','ring','chain','bracelet') DEFAULT 'none',
  ADD COLUMN available_sizes VARCHAR(255) NULL;      -- CSV e.g. '6,7,8,9,10' or '16in,18in,20in'

-- ---------- Reviews: add moderation + images ----------
ALTER TABLE reviews
  ADD COLUMN moderation_status ENUM('pending','approved','rejected') DEFAULT 'pending',
  ADD COLUMN admin_note VARCHAR(255) NULL;

CREATE TABLE IF NOT EXISTS review_images (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  review_id     INT NOT NULL,
  image_url     VARCHAR(500) NOT NULL,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- OTP verification ----------
CREATE TABLE IF NOT EXISTS otp_codes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  identifier    VARCHAR(190) NOT NULL,     -- email or phone
  channel       ENUM('email','sms') NOT NULL,
  purpose       ENUM('registration','login','password_reset') NOT NULL,
  code_hash     VARCHAR(255) NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  consumed      TINYINT(1) DEFAULT 0,
  attempts      INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otp_identifier (identifier, purpose)
) ENGINE=InnoDB;

ALTER TABLE users
  ADD COLUMN email_verified_at TIMESTAMP NULL,
  ADD COLUMN phone_verified_at TIMESTAMP NULL;

-- ---------- Refresh tokens & device sessions ----------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  token_hash    VARCHAR(255) NOT NULL,
  user_agent    VARCHAR(255),
  ip_address    VARCHAR(64),
  expires_at    TIMESTAMP NOT NULL,
  revoked       TINYINT(1) DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- Jewellery service requests (try-at-home, appointments, custom, repair, exchange, insurance) ----------
CREATE TABLE IF NOT EXISTS service_requests (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NULL,
  service_type    ENUM('try_at_home','appointment','video_shopping','custom_jewellery','engraving','repair','gold_exchange','insurance') NOT NULL,
  product_id      VARCHAR(40) NULL,
  full_name       VARCHAR(150) NOT NULL,
  phone           VARCHAR(20) NOT NULL,
  email           VARCHAR(190) NULL,
  preferred_date  DATE NULL,
  preferred_time  VARCHAR(20) NULL,
  notes           TEXT NULL,
  status          ENUM('new','contacted','scheduled','completed','cancelled') DEFAULT 'new',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- Recently viewed ----------
CREATE TABLE IF NOT EXISTS recently_viewed (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  product_id    VARCHAR(40) NOT NULL,
  viewed_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_recent (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- Search tracking ----------
CREATE TABLE IF NOT EXISTS search_queries (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NULL,
  query         VARCHAR(190) NOT NULL,
  result_count  INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_query (query)
) ENGINE=InnoDB;

-- ---------- Inventory: purchase entries & adjustments (stock_history already exists) ----------
CREATE TABLE IF NOT EXISTS purchase_entries (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  product_id      VARCHAR(40) NOT NULL,
  quantity        INT NOT NULL,
  cost_price      DECIMAL(10,2) NULL,
  supplier_name   VARCHAR(150) NULL,
  invoice_ref     VARCHAR(100) NULL,
  admin_id        INT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- Payment gateway fields ----------
ALTER TABLE payments
  ADD COLUMN gateway VARCHAR(30) NULL,           -- 'razorpay' | 'stripe'
  ADD COLUMN gateway_order_id VARCHAR(120) NULL,
  ADD COLUMN gateway_payment_id VARCHAR(120) NULL,
  ADD COLUMN gateway_signature VARCHAR(255) NULL,
  ADD COLUMN refund_id VARCHAR(120) NULL,
  ADD COLUMN refund_amount DECIMAL(10,2) NULL;
