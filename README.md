# LUXURY WATCH — Production-Grade Full-Stack E-Commerce Platform

> **TIMELESS WATCHES. EXCEPTIONAL VALUE.**

LUXURY WATCH is a full-stack horology e-commerce platform built with React/Vite, Node.js/Express, MongoDB/Mongoose, Cloudinary persistent media storage, and Razorpay payment gateway integration.

---

## 🌟 Architecture & Features

### 👤 Customer Experience
* **Prestige Brand Showcase**: Continuous, circular brand showcase featuring Rolex, Omega, Patek Philippe, Audemars Piguet, Cartier, TAG Heuer, Tissot, Breitling, Seiko, and Casio.
* **Masterpiece Catalog & PDP**: High-resolution image galleries, video playback, watch specifications (movement, case diameter, water resistance, crystal, power reserve), customer reviews, and stock indicators.
* **Backend Search & Multi-Filters**: Instant filter by brand, category, gender, price range, movement, dial color, strap material, and ratings.
* **Customer Authentication**: Secure direct email & password registration and login with bcrypt password hashing and JWT sessions.
* **Multi-Address Management**: Save, edit, delete, and set default shipping addresses.
* **Cart & Wishlist**: Server-side stock validation, price calculations, and item persistence.
* **VIP Promotions Engine**: Percentage and fixed discount codes with minimum order spend limits.
* **Razorpay Payment Integration**: Integrated checkout modal supporting UPI, Cards, Netbanking, with server-side HMAC-SHA256 signature verification.
* **Consignment Tracking**: Dedicated order timeline (`/track-order`) from confirmation through armoured courier transit to delivery.
* **Customer Returns & Exchanges**: Structured return workflow with reason tracking and courier pickup scheduling.

### 🛡️ Master Administrator Suite (`/admin`)
* **Strict Single Admin Account**: Zero public admin registration. Locked exclusively to the designated master account configured via environment variables.
* **Real-Time Financial Metrics**: Total revenue, today's revenue, monthly totals, order fulfillment status, customer counts, and low-stock alerts.
* **Product Catalog CRUD**: Add, edit, and delete timepieces with up to 5 media items (images and HD MP4/WebM videos), specifications, pricing, compare MRP, and feature badges.
* **Persistent Media Upload**: Cloudinary object storage integration for images and videos with CDN delivery.
* **Dynamic Brand Manager**: Add and manage prestige brands, logo URLs, hallmarks, display orders, and featured statuses.
* **Inventory Control**: Live stock adjustments (+1, +5, -1 or direct values) with low-stock warnings.
* **Order Fulfilment**: Update order statuses across 11 lifecycle states, manage waybill tracking numbers, and process refunds.
* **Homepage CMS**: Modify announcement bar text, cinematic hero headlines, subheadings, and CTA buttons directly from the admin panel.
* **Payment & Store Settings**: Toggle between Test and Live Razorpay gateway modes with masked secret storage and custom shipping thresholds.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Vanilla CSS Tokens, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express 5, Mongoose, JWT, bcryptjs, Helmet, CORS, Express Rate Limit |
| **Database** | MongoDB Atlas with Mongoose schema validation & indexes |
| **Media Storage** | Cloudinary (Persistent images & video CDN hosting) |
| **Payment Gateway** | Razorpay SDK + Server-Side Cryptographic Signature Verification |
| **Email Service** | Nodemailer SMTP (Order Confirmations) |
| **Deployment** | Vercel / Netlify (Frontend) • Render (Backend) • MongoDB Atlas (Database) |

---

## 📁 Directory Structure

```text
LuxuryWatch/
├── backend/
│   ├── config/
│   │   ├── env.js                # Environment loading & fail-fast validation
│   │   └── db.js                 # MongoDB Atlas connection manager
│   ├── models/                   # Mongoose schemas (User, Product, Order, Brand, etc.)
│   ├── middleware/
│   │   ├── auth.js               # JWT & single master admin authorization guard
│   │   ├── rateLimiter.js        # API & authentication rate limiting
│   │   └── errorHandler.js       # Centralized sanitized error handler
│   ├── services/
│   │   ├── mediaService.js       # Cloudinary persistent image/video streaming storage
│   │   ├── paymentService.js     # Razorpay order generation & HMAC-SHA256 verification
│   │   ├── paymentFinalizationService.js # Idempotent order finalization engine
│   │   └── emailService.js       # Order confirmation email dispatcher
│   ├── controllers/              # Modular REST endpoint controllers
│   ├── routes/
│   │   └── api.js                # Consolidated REST router
│   ├── index.js                  # Express server, Helmet, strict CORS, health check
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # UI Components, Modals, and Admin Dashboard
│   │   ├── context/              # StoreContext, UserAuthContext, AdminAuthContext
│   │   ├── services/             # api.js REST client & image URL resolver
│   │   ├── utils/                # Razorpay checkout & currency helpers
│   │   ├── App.jsx               # Main SPA router & navigation handler
│   │   └── index.css             # Horology design system tokens & responsive CSS
│   ├── netlify.toml              # Netlify SPA routing rules & build config
│   ├── vercel.json               # Vercel SPA routing rules & proxy
│   ├── vite.config.js
│   └── package.json
│
├── netlify.toml                  # Monorepo root Netlify configuration
├── vercel.json                   # Monorepo root Vercel configuration
├── .env.example                  # Environment configuration template
└── README.md
```

---

## 🔐 Master Administrator Configuration

The application implements a strict single-administrator access model. Public admin signup is strictly prohibited.

Admin credentials are configured **ONLY** through environment variables:

1. **`ADMIN_EMAIL`**: The exact email address authorized for Master Administrator access (e.g. `admin@yourdomain.com`).
2. **`ADMIN_PASSWORD_HASH`**: The bcrypt hash of the Master Administrator password.

To generate a secure bcrypt password hash for your chosen admin password:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_SECRET_PASSWORD', 10).then(console.log);"
```
Copy the generated hash string into `ADMIN_PASSWORD_HASH`.

---

## ⚙️ Environment Variables Reference

| Variable Name | Required in Prod | Description | Example / Format |
|---|---|---|---|
| `NODE_ENV` | Yes | Environment mode | `production` or `development` |
| `PORT` | Yes (Render provides) | Port for backend server | `5000` |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Yes | Secret key for signing JWTs (min 32 chars) | Random 64-character hex/string |
| `ADMIN_EMAIL` | Yes | Designated Master Admin email | `admin@yourdomain.com` |
| `ADMIN_PASSWORD_HASH` | Yes | Bcrypt hash of Master Admin password | `$2b$10$...` |
| `RAZORPAY_KEY_ID` | Yes | Razorpay API Key ID | `rzp_live_...` or `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay API Secret Key | Private string |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Webhook secret for payment events | String |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account cloud name | String |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API Key | String |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API Secret | String |
| `FRONTEND_URL` | Yes | Allowed frontend origin for CORS | `https://your-frontend.vercel.app` |
| `FRONTEND_URLS` | Optional | Comma-separated list of allowed origins | `https://site1.vercel.app,https://site2.netlify.app` |
| `EMAIL_HOST` | Optional | SMTP server host (e.g. `smtp.gmail.com`) | `smtp.gmail.com` |
| `EMAIL_PORT` | Optional | SMTP port | `587` or `465` |
| `EMAIL_USER` | Optional | SMTP username / email address | `concierge@yourdomain.com` |
| `EMAIL_PASSWORD` | Optional | SMTP password or app-specific password | String |
| `EMAIL_FROM` | Optional | Sender display name and email address | `"LUXURY WATCH" <concierge@yourdomain.com>` |

---

## 🚀 Local Development Setup

### 1. Prerequisites
* **Node.js**: v18+ or v20+
* **npm**: v9+
* **MongoDB**: Local MongoDB instance or free MongoDB Atlas cluster

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Setup Environment Variables
Create `.env` files in the root and backend folders based on `.env.example`:
```bash
cp .env.example .env
cp .env.example backend/.env
```

### 4. Run Concurrently
```bash
npm run dev:all
```
* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000/api`
* **Health Check**: `http://localhost:5000/health`

---

## 🌐 Production Deployment Guide

### A. Database (MongoDB Atlas)
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a production cluster.
3. Under **Database Access**, create a user with read and write privileges.
4. Under **Network Access**, allow access from the backend's IP or `0.0.0.0/0` with strong user authentication.
5. Retrieve your connection string (SRV URI) and configure `MONGODB_URI` in your backend deployment platform.

### B. Persistent Media Storage (Cloudinary)
1. Create an account at [Cloudinary](https://cloudinary.com).
2. Retrieve your **Cloud Name**, **API Key**, and **API Secret** from the Cloudinary Dashboard.
3. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` on your backend hosting provider.

### C. Backend Deployment (Render)
1. Go to [Render Dashboard](https://dashboard.render.com) → **New Web Service**.
2. Connect your Git repository.
3. Settings:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install`
   * **Start Command**: `node index.js`
4. Configure all required Environment Variables listed in the table above.
5. Set **Health Check Path**: `/health`.

> 💡 **Production Tier Note**: Render Free instances spin down after inactivity. For production with continuous availability and immediate payment webhook handling, a paid Render Web Service tier is recommended.

### D. Frontend Deployment (Vercel or Netlify)

#### Option 1: Vercel
1. Connect repository on [Vercel](https://vercel.com).
2. Set **Root Directory**: `frontend`.
3. Set **Framework Preset**: `Vite`.
4. Environment Variables:
   * `VITE_API_URL`: `https://your-backend.onrender.com/api`
   * `VITE_RAZORPAY_KEY_ID`: `<Your Public Razorpay Key ID>`

#### Option 2: Netlify
1. Connect repository on [Netlify](https://app.netlify.com).
2. Build Settings:
   * **Base directory**: `frontend`
   * **Build command**: `npm run build`
   * **Publish directory**: `dist`
3. Environment Variables:
   * `VITE_API_URL`: `https://your-backend.onrender.com/api`
   * `VITE_RAZORPAY_KEY_ID`: `<Your Public Razorpay Key ID>`

---

## 🛡️ Security & Payment Standards

* **No Hardcoded Secrets**: Secrets and credentials exist solely in platform environment variables.
* **Server-Side Price Calculation**: Order pricing is recalculated directly from database records during checkout.
* **HMAC-SHA256 Signature Verification**: Payment confirmations require cryptographic HMAC verification using `crypto.timingSafeEqual`.
* **CORS Allowlist**: CORS accepts requests strictly from configured production frontend origins.
* **Persistent Media**: Images and videos persist to object storage and do not rely on ephemeral server filesystems.
* **Helmet Headers & Rate Limiting**: Security headers and brute-force protection guard all API routes.

---

## 📜 License
Copyright © 2026 LUXURY WATCH. All rights reserved.
