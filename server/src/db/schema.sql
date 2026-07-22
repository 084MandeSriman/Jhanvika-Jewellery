-- ============================================================
-- Jhanvika Jewelleries — Production Schema
-- Run with: npm run db:schema  (or paste into MySQL Workbench)
-- ============================================================

CREATE DATABASE IF NOT EXISTS jhanvika_jewelleries
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE jhanvika_jewelleries;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- CATEGORIES  (Necklaces, Earrings, Rings, ...)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id            VARCHAR(40)  PRIMARY KEY,          -- e.g. 'necklaces'
  name          VARCHAR(120) NOT NULL,
  tagline       VARCHAR(255),
  image_url     VARCHAR(500) NULL,
  art_type      VARCHAR(40)  NOT NULL,              -- necklace | earring | ring | bangle | mangalsutra | nosepin
  sort_order    INT DEFAULT 0,
  is_active     TINYINT(1) DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- COLLECTIONS  (Bridal Edit, Festive Ready, ...)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS collections (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(120) UNIQUE NOT NULL,
  name          VARCHAR(150) NOT NULL,
  description   TEXT,
  is_active     TINYINT(1) DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id              VARCHAR(40) PRIMARY KEY,           -- e.g. 'p1' (keeps existing dummy IDs stable)
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(220) UNIQUE NOT NULL,
  category_id     VARCHAR(40) NOT NULL,
  collection_id   INT NULL,
  metal           VARCHAR(120),
  gemstone        VARCHAR(120),
  theme           VARCHAR(40) NOT NULL,               -- gold | kundan | emerald | ruby | pearl | diamond | rosegold | polki
  price           DECIMAL(10,2) NOT NULL,
  mrp             DECIMAL(10,2) NOT NULL,
  rating          DECIMAL(2,1) DEFAULT 0,
  review_count    INT DEFAULT 0,
  badge           VARCHAR(20) NULL,                   -- New | Bestseller | Sale | NULL
  description     TEXT,
  stock_qty       INT DEFAULT 100,
  is_active       TINYINT(1) DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL,
  INDEX idx_products_category (category_id),
  INDEX idx_products_badge (badge),
  INDEX idx_products_price (price),
  FULLTEXT INDEX ft_products_search (name, gemstone, metal)
) ENGINE=InnoDB;

-- Product detail bullet points (the `details: []` array from the dummy data)
CREATE TABLE IF NOT EXISTS product_details (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  product_id    VARCHAR(40) NOT NULL,
  detail_text   VARCHAR(255) NOT NULL,
  sort_order    INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Product images (future-ready for real photography / Cloudinary)
CREATE TABLE IF NOT EXISTS product_images (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  product_id    VARCHAR(40) NOT NULL,
  image_url     VARCHAR(500) NOT NULL,
  alt_text      VARCHAR(255),
  sort_order    INT DEFAULT 0,
  is_primary    TINYINT(1) DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- USERS  (storefront customers)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(190) UNIQUE NOT NULL,
  phone           VARCHAR(20),
  password_hash   VARCHAR(255) NOT NULL,
  is_verified     TINYINT(1) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS login_history (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  ip_address    VARCHAR(64),
  user_agent    VARCHAR(255),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ADMIN USERS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(190) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            ENUM('super_admin','manager','editor') DEFAULT 'editor',
  is_active       TINYINT(1) DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  admin_id      INT NULL,
  action        VARCHAR(120) NOT NULL,      -- e.g. 'product.update'
  entity_type   VARCHAR(60),
  entity_id     VARCHAR(60),
  details       JSON NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ADDRESSES
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  phone         VARCHAR(20) NOT NULL,
  line1         VARCHAR(255) NOT NULL,
  line2         VARCHAR(255),
  city          VARCHAR(120) NOT NULL,
  state         VARCHAR(120) NOT NULL,
  pincode       VARCHAR(12) NOT NULL,
  is_default    TINYINT(1) DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- WISHLIST (supports logged-in users; guest handled client-side)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  product_id    VARCHAR(40) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- CART
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NULL,                 -- NULL for guest carts
  guest_token   VARCHAR(64) NULL,         -- localStorage-generated id for guests
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_cart_guest (guest_token)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  cart_id       INT NOT NULL,
  product_id    VARCHAR(40) NOT NULL,
  quantity      INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_cart_product (cart_id, product_id),
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- COUPONS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  code              VARCHAR(40) UNIQUE NOT NULL,
  description       VARCHAR(255),
  discount_type     ENUM('percent','flat') DEFAULT 'percent',
  discount_value    DECIMAL(10,2) NOT NULL,
  min_order_value   DECIMAL(10,2) DEFAULT 0,
  max_uses          INT NULL,
  used_count        INT DEFAULT 0,
  valid_from        DATE NULL,
  valid_until       DATE NULL,
  is_active         TINYINT(1) DEFAULT 1,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  order_number      VARCHAR(30) UNIQUE NOT NULL,       -- e.g. JJ-20260713-0001
  user_id           INT NOT NULL,
  address_id        INT NOT NULL,
  coupon_id         INT NULL,
  subtotal          DECIMAL(10,2) NOT NULL,
  discount_amount   DECIMAL(10,2) DEFAULT 0,
  shipping_amount   DECIMAL(10,2) DEFAULT 0,
  tax_amount        DECIMAL(10,2) DEFAULT 0,
  total_amount      DECIMAL(10,2) NOT NULL,
  order_status      ENUM('pending','confirmed','processing','shipped','delivered','cancelled','returned') DEFAULT 'pending',
  payment_method    ENUM('cod','upi','card') DEFAULT 'cod',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (order_status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  product_id    VARCHAR(40) NOT NULL,
  product_name  VARCHAR(200) NOT NULL,     -- snapshot at time of order
  unit_price    DECIMAL(10,2) NOT NULL,    -- snapshot at time of order
  quantity      INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  order_id          INT NOT NULL,
  method            ENUM('cod','upi','card') NOT NULL,
  status            ENUM('pending','success','failed','refunded') DEFAULT 'pending',
  transaction_ref   VARCHAR(120) NULL,
  amount            DECIMAL(10,2) NOT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS return_requests (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_item_id INT NOT NULL,
  reason        VARCHAR(255),
  status        ENUM('requested','approved','rejected','completed') DEFAULT 'requested',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- INVENTORY / STOCK HISTORY
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_history (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  product_id    VARCHAR(40) NOT NULL,
  change_qty    INT NOT NULL,               -- positive = restock, negative = sale
  reason        VARCHAR(120),
  admin_id      INT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- REVIEWS & RATINGS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  product_id    VARCHAR(40) NOT NULL,
  user_id       INT NOT NULL,
  rating        TINYINT NOT NULL,           -- 1-5
  title         VARCHAR(150),
  comment       TEXT,
  is_approved   TINYINT(1) DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- TESTIMONIALS (homepage)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  location      VARCHAR(120),
  text_content  TEXT NOT NULL,
  rating        TINYINT DEFAULT 5,
  sort_order    INT DEFAULT 0,
  is_active     TINYINT(1) DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- HERO SLIDER / BANNERS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS hero_slides (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  eyebrow       VARCHAR(150),
  title         VARCHAR(255) NOT NULL,
  subtitle      VARCHAR(255),
  cta_text      VARCHAR(80),
  cta_link      VARCHAR(255),
  theme         VARCHAR(40) NOT NULL,
  art_type      VARCHAR(40) NOT NULL,
  sort_order    INT DEFAULT 0,
  is_active     TINYINT(1) DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS banners (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  placement     VARCHAR(60) NOT NULL,        -- e.g. 'homepage_promo', 'shop_top'
  image_url     VARCHAR(500),
  link_url      VARCHAR(255),
  is_active     TINYINT(1) DEFAULT 1,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- FAQ / BLOG / NEWSLETTER / CONTACT
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS faqs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  question      VARCHAR(255) NOT NULL,
  answer        TEXT NOT NULL,
  sort_order    INT DEFAULT 0,
  is_active     TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blog_posts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(220) UNIQUE NOT NULL,
  title         VARCHAR(255) NOT NULL,
  excerpt       VARCHAR(500),
  content       LONGTEXT,
  cover_image   VARCHAR(500),
  is_published  TINYINT(1) DEFAULT 0,
  published_at  TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(190) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active     TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_enquiries (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  message       TEXT NOT NULL,
  is_resolved   TINYINT(1) DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- SETTINGS / SOCIAL LINKS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  setting_key    VARCHAR(80) PRIMARY KEY,
  setting_value  TEXT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS social_links (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  platform      VARCHAR(60) NOT NULL,        -- instagram | facebook | youtube
  url           VARCHAR(255) NOT NULL,
  is_active     TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NULL,
  title         VARCHAR(200) NOT NULL,
  message       VARCHAR(500),
  is_read       TINYINT(1) DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
