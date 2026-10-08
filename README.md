# 🧭 Trip Expense Tracker

A minimal full-stack workshop project built in 45 minutes to track trip expenses and split costs among friends, secured with WhatsApp-first OTP authentication using the **Minimoth API**.

---

## ⚡ Workshop Architecture Highlights

* **Frontend:** React + Vite (Vanilla CSS design system, responsive dark mode, zero bulky UI libraries).
  * **Page 1 (Auth View):** Phone number login & registration via Minimoth WhatsApp/SMS OTP.
  * **Page 2 (Trips View):** Create trips, view spending totals, and select an active trip.
  * **Page 3 (Trip Details View):** Log categorized expenses, view expense history, and use an instant cost-split calculator.
* **Backend:** Node.js + Express with native `node:sqlite` (zero native build tools required).
  * **Strictly 5 API Endpoints:**
    1. `POST /api/auth/send-otp` - Dispatch OTP using Minimoth API
    2. `POST /api/auth/verify-otp` - Verify OTP with Minimoth & authenticate user
    3. `GET /api/trips` - Fetch all trips with expenses for authenticated user
    4. `POST /api/trips` - Create a new trip
    5. `POST /api/expenses` - Log a new expense
  * **Strictly 3 Database Entities:**
    1. `users` (id, phone, name, created_at)
    2. `trips` (id, user_id, title, destination, currency, created_at)
    3. `expenses` (id, trip_id, title, amount, category, paid_by, created_at)
* **Auth Provider:** [Minimoth API](https://minimoth.dev) with automatic WhatsApp delivery, SMS fallback, and an included offline workshop test mode (`123456`).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ or v20+/v24+)
- npm

---

### 2. Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment
# Copy .env.example to .env
cp .env.example .env

# (Optional) Open .env and add your live Minimoth API key from https://minimoth.dev:
# MINIMOTH_API_KEY=mm_live_xxxxxxxxxxxxxxxx

# 3. Start the backend server (runs on port 5000)
npm run dev
```

> **Workshop Dev Mode:** If no `MINIMOTH_API_KEY` is provided or you use the default demo key, the server automatically enables **Workshop Dev Mode**, printing the code in the server terminal and accepting `123456` so you can test without an active key!

---

### 3. Frontend Setup

In a new terminal window:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment
# Copy .env.example to .env
cp .env.example .env

# 3. Start the Vite dev server (runs on port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | HTTP port for backend API | `5000` |
| `MINIMOTH_API_KEY` | Live API key from Minimoth dashboard | `mm_live_your_minimoth_api_key_here` |

### Frontend (`frontend/.env`)
| Variable | Description | Default / Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of backend server | `http://localhost:5000` |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/send-otp` | Sends OTP to phone number via Minimoth |
| `POST` | `/api/auth/verify-otp` | Validates OTP and registers/logs in user |
| `GET` | `/api/trips` | Returns user's trips with attached expenses |
| `POST` | `/api/trips` | Creates a new trip |
| `POST` | `/api/expenses` | Adds an expense to a specific trip |

---

## 📂 Project Structure

```text
trip-expense-tracker/
├── backend/
│   ├── src/
│   │   ├── db.js          # SQLite models (users, trips, expenses)
│   │   ├── minimoth.js    # Minimoth WhatsApp/SMS OTP client
│   │   └── server.js      # Express server with 5 endpoints
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tracker.db        # SQLite database (auto-created)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthView.jsx        # Page 1: OTP Auth
│   │   │   ├── TripsView.jsx       # Page 2: Trip Listing & Creation
│   │   │   └── TripDetailsView.jsx # Page 3: Expense Logging & Cost Split
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```
