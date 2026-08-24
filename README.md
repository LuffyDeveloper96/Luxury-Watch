# ⌚ LUXURY WATCH | Haute Horlogerie India

> Fullstack luxury watch e-commerce platform tailored for the Indian market, featuring authentic timepieces (Rolex, Omega, Patek Philippe, Audemars Piguet, Cartier, TAG Heuer, Breitling, Tissot), 360° circular orbital showcase, Pan-India insured delivery, and Indian payment gateways (UPI, RuPay, NetBanking).

---

## 🏗️ Project Architecture

```
LuxuaryWatch/
├── backend/                  # Express REST API Server
│   ├── config/               # Database & Auth Config
│   ├── controllers/          # Business logic for products, orders, auth & analytics
│   ├── routes/               # API routes (/api/products, /api/orders, /api/coupons, etc.)
│   ├── data/                 # JSON file persistent database (store.json)
│   ├── index.js              # Server entry point & static asset handler
│   └── test-api.js           # Automated API verification test suite
│
├── frontend/                 # React 19 + Vite 6 Client Application
│   ├── public/images/        # High-res authentic watch photography
│   ├── src/
│   │   ├── components/       # UI components & orbital showcase
│   │   ├── context/          # State management (StoreContext, AdminAuthContext)
│   │   ├── data/             # Catalog seeds & specs (~₹5k INR real brands)
│   │   ├── services/         # API client layer
│   │   ├── utils/            # Currency (INR) & date formatters
│   │   ├── App.jsx           # Main storefront coordinator
│   │   └── index.css         # Luxury horology design tokens
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── package.json              # Monorepo coordination & scripts
└── .gitignore
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

### 2. Run in Development Mode
```bash
npm run dev:all
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

### 3. Build for Production
```bash
npm run build
```

### 4. Start Production Server
```bash
npm run server
```

### 5. Run API Test Suite
```bash
npm run test:api
```

---

## 🔒 Master Administrator Access
- **Admin Portal Link**: Top header badge or footer link
- **Email**: `admin@luxurywatch.com`
- **Password**: `LuxuryWatch2026!`
- **Security PIN**: `8888`
