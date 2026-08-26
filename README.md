# LUXURY WATCH — Production-Grade Full-Stack E-Commerce Platform

> **TIMELESS WATCHES. EXCEPTIONAL VALUE.**

LUXURY WATCH is an industrial-level, full-stack branded watch e-commerce platform architected for production deployment on **Netlify** (Frontend), **Render** (Backend), **MongoDB Atlas** (Database), and **Razorpay** (Payments).

---

## 🌟 Key Architecture & Features

### 👤 Customer Experience
* **Prestige Brand Showcase**: Continuous, auto-scrolling circular brand showcase featuring Rolex, Omega, Patek Philippe, Audemars Piguet, Cartier, TAG Heuer, Tissot, Breitling, Seiko, and Casio.
* **Masterpiece Catalog & PDP**: High-resolution image galleries, watch specifications (movement, case diameter, water resistance, crystal, power reserve), customer reviews, stock indicators, and custom engraving options.
* **Real Backend Search & Multi-Filters**: Instant filter by brand, category, gender, price range, movement, dial color, strap material, and ratings.
* **Email OTP Authentication**: Passwordless Gmail/Email 6-digit OTP verification with short-lived tokens, resend cooldowns, and brute-force protection.
* **Multi-Address Management**: Save, edit, delete, and set default shipping addresses.
* **Full Cart & Wishlist**: Real-time server-side stock validation, price calculations, and item persistence.
* **VIP Promotions Engine**: Percentage and fixed discount codes with minimum order spend limits.
* **Razorpay Payment Integration**: Integrated checkout modal supporting UPI, Cards, Netbanking, with server-side HMAC-SHA256 signature verification.
* **Consignment Tracking**: Dedicated order timeline (`/track-order`) from confirmation through armoured courier transit to delivery.
* **Customer Returns & Exchanges**: Structured return workflow with reason tracking and courier pickup scheduling.

### 🛡️ Master Administrator Suite (`/admin`)
* **Strict Single Admin Account**: Zero public admin registration. Locked exclusively to the designated master account (`admin@luxurywatch.com`).
* **Real-Time Financial Metrics**: Total revenue, today's revenue, monthly totals, order fulfillment status, customer counts, and low-stock alerts.
* **Product Catalog CRUD**: Add, edit, and delete timepieces with multiple image URLs, specifications, pricing, compare MRP, and feature badges.
* **Dynamic Brand Manager**: Add and manage prestige brands, logo URLs, hallmarks, display orders, and featured statuses (live updates to the brand showcase).
* **Inventory Control**: Live stock adjustments (+1, +5, -1 or direct values) with low-stock warnings.
* **Order Fulfilment**: Update order statuses (`Confirmed`, `Processing`, `Packed`, `Shipped`, `Out for Delivery`, `Delivered`, `Cancelled`), manage waybill tracking numbers, and process refunds.
* **Homepage CMS**: Modify announcement bar text, cinematic hero headlines, subheadings, and CTA buttons directly from the admin panel without modifying React code.
* **Payment & Store Settings**: Toggle between Test and Live Razorpay gateway modes with masked secret storage and custom shipping thresholds.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS / Vanilla CSS Tokens, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express 5, Mongoose, JWT, bcryptjs, Helmet, CORS, Express Rate Limit |
| **Database** | MongoDB Atlas with high-performance persistent local JSON fallback & auto-sync |
| **Payment Gateway** | Razorpay SDK + Cryptographic Signature Verification Abstraction Layer |
| **Email & OTP** | Nodemailer SMTP with branded luxury HTML templates + Simulated preview fallback |
| **Deployment** | Netlify (Frontend) • Render (Backend) • MongoDB Atlas (Database) |

---

## 📁 Repository Directory Structure

```text
LuxuryWatch/
├── backend/
│   ├── config/
│   │   └── db.js                 # Dual Engine (MongoDB Atlas + Local JSON DB with instant sync)
│   ├── models/
│   │   ├── User.js               # Customer profile and multi-address schema
│   │   ├── Product.js            # Timepiece specifications schema
│   │   ├── Brand.js              # Brand showcase schema
│   │   ├── Category.js           # Category schema
│   │   ├── Order.js              # Consignment and tracking schema
│   │   ├── Review.js             # Customer review schema
│   │   ├── Coupon.js             # VIP promo code schema
│   │   ├── Payment.js            # Transaction ledger schema
│   │   ├── StoreSettings.js      # Store configuration schema
│   │   └── HomepageContent.js    # CMS editable hero and announcement schema
│   ├── middleware/
│   │   ├── auth.js               # JWT & single master admin authorization guard
│   │   ├── rateLimiter.js        # API & OTP rate limiting
│   │   └── errorHandler.js       # Centralized sanitized error handler
│   ├── services/
│   │   ├── paymentService.js     # Razorpay order generation & HMAC-SHA256 verification
│   │   ├── emailService.js       # Nodemailer transporter & luxury HTML email templates
│   │   └── otpService.js         # 6-digit OTP engine with rate limits & cooldowns
│   ├── controllers/              # REST endpoint business logic
│   ├── routes/
│   │   └── api.js                # Consolidated modular API router
│   ├── data/
│   │   └── store.json            # Seed catalog & persistent storage
│   ├── index.js                  # Express server, Helmet, CORS, static hosting
│   ├── test-api.js               # Automated API verification test suite
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── _redirects            # Netlify Single Page Application routing rules
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Navbar, AnnouncementBar, Footer
│   │   │   ├── home/             # HeroSection, LuxuryBrandsOrbital, Collections
│   │   │   ├── product/          # ProductCard, ProductDetailsPage, QuickView
│   │   │   ├── cart/             # CartDrawer
│   │   │   ├── checkout/         # Multi-Step CheckoutModal & Razorpay trigger
│   │   │   ├── auth/             # UserAuthModal with 6-digit OTP inputs
│   │   │   └── admin/            # AdminDashboard & AdminLogin
│   │   ├── context/              # StoreContext, UserAuthContext, AdminAuthContext
│   │   ├── services/             # api.js REST client
│   │   ├── utils/                # Currency formatter, Razorpay loader
│   │   ├── index.css             # Luxury Horology design tokens & typography
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── README.md
├── .env.example
└── package.json
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* **Node.js**: v18+ or v20+
* **npm**: v9+

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/LuffyDeveloper96/Luxury-Watch.git
cd Luxury-Watch

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Configure Environment Variables
Copy the template files:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### 4. Run Both Backend & Frontend Concurrently
```bash
npm run dev:all
```
* **Frontend Application**: `http://localhost:5173`
* **Haute Horlogerie REST API**: `http://localhost:5000/api`
* **API Health Check**: `http://localhost:5000/api/health`

---

## 🧪 Automated API Verification Test Suite

Run the end-to-end backend test suite to verify all REST endpoints, OTP auth, Razorpay order creation, payment signature verification, inventory stock decrement, and admin metrics:
```bash
# Run automated API tests (ensure server is running on port 5000)
npm run test:api
```

---

## 🔐 Master Administrator Credentials

* **Portal URL**: Click **Master Admin** in the footer or navigate to `/admin`
* **Designated Admin Email**: `admin@luxurywatch.com`
* **Master Password**: `LuxuryWatch2026!`
* **Security PIN**: `8888`

> ⚠️ **Security Notice**: Only this single seeded master email is authorized to access admin endpoints. Public signup for admin accounts is strictly forbidden and disabled.

---

## 🌐 Production Deployment Guide

### A. Database Deployment (MongoDB Atlas)
1. Create a free/production cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a Database User (e.g. `luxury_admin`) with read/write permissions.
3. In **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
4. Copy the connection string and set `MONGODB_URI` in Render environment variables.

### B. Backend Deployment (Render)
1. Go to [dashboard.render.com](https://dashboard.render.com) → **New Web Service**.
2. Connect your Git repository.
3. Configure settings:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Add Environment Variables:
   * `NODE_ENV`: `production`
   * `PORT`: `5000`
   * `MONGODB_URI`: `<Your MongoDB Atlas connection string>`
   * `JWT_SECRET`: `<A strong random 64-character secret>`
   * `AUTHORIZED_ADMIN_GMAIL`: `admin@luxurywatch.com`
   * `RAZORPAY_KEY_ID`: `<Your Razorpay Key ID>`
   * `RAZORPAY_KEY_SECRET`: `<Your Razorpay Secret Key>`
   * `FRONTEND_URL`: `https://luxury-watch.netlify.app`

### C. Frontend Deployment (Netlify)
1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
2. Select your Git repository.
3. Configure settings:
   * **Base directory**: `frontend`
   * **Build command**: `npm run build`
   * **Publish directory**: `frontend/dist`
4. Add Environment Variables:
   * `VITE_API_URL`: `https://<your-render-backend-subdomain>.onrender.com/api`
   * `VITE_RAZORPAY_KEY_ID`: `<Your Razorpay Key ID>`

> ℹ️ **SPA Redirection**: `frontend/public/_redirects` is pre-configured with `/* /index.html 200` to ensure direct link navigation works flawlessly on Netlify.

### D. Connecting a Custom Domain (e.g., `luxurywatch.in`)
* **Frontend**: In Netlify, go to **Domain management** → **Add custom domain** (e.g., `luxurywatch.in`). Point your registrar DNS A/CNAME records to Netlify.
* **Backend**: In Render, add custom domain `api.luxurywatch.in` and update `FRONTEND_URL` and `VITE_API_URL` accordingly.

---

## 🛡️ Payment Security Standard

* **Zero Card/UPI PIN Storage**: Sensitive card credentials, CVVs, and UPI PINs are processed directly by Razorpay's PCI-DSS compliant iframe modal.
* **Server-Side Verification**: Orders are confirmed **ONLY** after HMAC-SHA256 signature verification matches `crypto.createHmac('sha256', secret).update(orderId + "|" + paymentId).digest('hex')`.
* **Atomic Inventory Decrement**: Stock decreases strictly after verified payment. Failed or aborted transactions do not alter stock balances.

---

## 📜 License
Copyright © 2026 LUXURY WATCH (India) Private Limited. All rights reserved.
