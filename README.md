# Jhanvika Jewelleries — Complete Dynamic E-Commerce Platform 💎

The storefront **UI is unchanged** from the original static design. Everything else — catalogue,
cart, checkout, payments, auth, reviews, images, admin panel — is now real, backed by MySQL, and
was tested end-to-end against a live database and file system before being packaged.

## ⚠️ About the Razorpay keys shared earlier

A test-mode Razorpay key pair was pasted into this chat during development. **Please rotate/regenerate
those keys in your Razorpay dashboard before using this project** (Settings → API Keys). Pasting
credentials into any chat — with an AI or a person — exposes them in that conversation's history.
The correct place for real keys is your local `server/.env` file only, never a chat window.

## What's real vs. what needs your own accounts

| Feature | Status |
|---|---|
| Storefront UI | ✅ Unchanged |
| Products, categories, search, cart, wishlist, orders | ✅ MySQL-backed, tested live |
| Auth (register/login/JWT), forgot/reset password | ✅ Tested live |
| **OTP system** (email + mobile) | ✅ Code complete & tested. Email OTP actually sends (or logs in dev mode); mobile OTP uses a pluggable provider that logs to console until you add Twilio/MSG91 credentials |
| **Email system** (all 10 templates: registration, welcome, forgot-password, order confirmation, invoice, shipping/delivery updates, return status, contact ack, newsletter) | ✅ Tested live via dev transport (emails logged to server console with full rendered content). Add `SMTP_HOST` etc. in `.env` to send real emails — zero code changes needed |
| **Product image management** (multi-upload, compression, WebP conversion, reorder, primary, delete) | ✅ Fully tested — real 2000×2000 JPEG uploaded, resized, and compressed to WebP successfully |
| **Review system** (write/edit/delete, admin moderation, rating recompute) | ✅ Fully tested end-to-end including the moderation → approval → public visibility → rating recompute pipeline |
| **Jewellery specifications** (purity, weights, diamond grading, hallmark, HSN, GST, sizing) | ✅ Schema + API + admin form + storefront display, all tested |
| **Jewellery services** (try-at-home, appointments, video shopping, custom jewellery, engraving, repair, gold exchange, insurance) | ✅ Backend complete (unified `service_requests` API covering all 8 types) |
| **User dashboard** (orders w/ timeline, PDF invoice download, returns, notifications, recently viewed, addresses, profile) | ✅ Tested — real PDF invoices generated and downloaded successfully |
| **Search** (autocomplete, trending, popular products, history, tracking) | ✅ Tested live |
| **Admin analytics** (revenue charts, best sellers, category breakdown, monthly trends, profit estimate) | ✅ Tested with real order data |
| **Admin inventory** (purchase entries, stock adjustments, low/out-of-stock alerts, history) | ✅ Tested — verified stock math end-to-end |
| **Payment Gateway (Razorpay)** | ✅ Code complete: order creation, signature verification, refund API, webhook handler with correct raw-body HMAC verification. ⚠️ **Cannot be live-tested without your own (rotated) API keys** — confirmed it fails cleanly with a clear error when unconfigured, rather than crashing |
| WhatsApp/Push notifications, live SMS delivery | 🔲 Not built — needs WhatsApp Business API / SMS gateway account (Twilio/MSG91), which requires your own business verification |
| Full drag-and-drop CMS builder, 360°/video product media | 🔲 Not built — out of scope for this pass (real photography/video assets needed for the latter) |

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
```
Fill in `.env` with **your own** local values:
- `DB_USER` / `DB_PASSWORD` — your MySQL Workbench credentials
- `JWT_SECRET` — any long random string
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — your **rotated** Razorpay test keys (optional — COD works without them)
- `SMTP_*` — optional, leave blank to run in dev mode (emails logged to console)

```bash
npm run db:schema     # creates database + 30 base tables
npm run db:migrate    # adds jewellery specs, OTP, reviews, images, services, inventory tables
npm run db:seed       # loads products, admin user, coupon
npm run dev            # → http://localhost:5000
```

> **If `db:migrate` fails partway through** (e.g. you ran an older copy of this project, or it's
> being re-run against a database that already has these columns): drop the database and start
> clean — `DROP DATABASE jhanvika_jewelleries;` in MySQL Workbench, then re-run `db:schema` →
> `db:migrate` → `db:seed` in order. The migration is designed to run once against a fresh schema.

### 2. Frontend
```bash
cp .env.example .env
npm install
npm run dev             # → http://localhost:5173
```

### 3. Admin panel
`http://localhost:5173/admin/login` → `admin@jhanvika.in` / `Admin@123`

New admin sections: **Analytics** (charts), **Inventory** (purchase entries, stock adjustments),
plus image management (camera icon) on every product row, and a collapsible "Jewellery
Specifications" section in the product create/edit form.

## Dev-mode conveniences (so you can test without real accounts)

- **Emails**: without `SMTP_HOST` set, every email is logged to the server console with its full
  rendered HTML instead of being sent — you'll see `📧 [DEV EMAIL]` lines for every registration,
  order, status change, etc.
- **OTP**: without a configured SMS provider, `POST /api/otp/send` returns a `devOtp` field in the
  response so you can test the verify flow without reading server logs.
- **Payments**: without Razorpay keys, checkout still completes for COD orders. Selecting UPI/Card
  places the order and reports a clear "payment gateway not configured" message rather than failing
  silently or crashing.

## Everything verified live, not just written

Every feature listed as "✅ tested" above was run against a real MariaDB/MySQL instance with real
HTTP requests during development — including catching and fixing two genuine bugs along the way
(a route middleware ordering issue that silently blocked cart requests, and a webhook signature
verification bug from body-parsing order). Nothing in this list is "should work" — it's "confirmed
working," with the payment gateway being the one clearly-labeled exception since it needs your own
live credentials.
