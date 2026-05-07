# Billiard Club Management System

A production-ready billiard club automation system built with NestJS, React, PostgreSQL and real-time WebSocket updates.

## Tech Stack

**Backend:** NestJS · TypeScript · PostgreSQL · Prisma ORM · JWT Auth · WebSocket (Socket.io) · Swagger  
**Frontend:** React · Vite · TypeScript · TailwindCSS · shadcn/ui · Zustand · React Query · React Router

## Prerequisites

- Node.js 18+ (LTS)
- PostgreSQL 14+ installed and running locally
- npm or yarn

---

## Setup Instructions

### 1. Clone and navigate

```bash
cd C:\Users\User\billiard-club
```

### 2. Create PostgreSQL database

Open psql or pgAdmin and run:

```sql
CREATE DATABASE billiard_club;
```

### 3. Configure server environment

```bash
cd server
copy .env.example .env
```

Edit `server/.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/billiard_club"
JWT_SECRET="some-random-secret-string-change-me"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
PORT=3000
```

### 4. Install server dependencies and run migrations

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
```

### 5. Seed the database

```bash
cd server
npx ts-node --project tsconfig.json ../prisma/seed.ts
```

This creates:
- **Admin:** `admin@billiard.com` / `admin123`
- **Staff:** `staff@billiard.com` / `staff123`
- 4 sample tables
- 2 categories (Drinks, Snacks) with 7 products

### 6. Configure client environment

```bash
cd ..\client
copy .env.example .env
```

`client/.env` (defaults work out of the box):
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

### 7. Install client dependencies

```bash
cd client
npm install
```

### 8. Start both servers

**Terminal 1 — Backend:**
```bash
cd server
npm run start:dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Default Credentials

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@billiard.com       | admin123   |
| Staff | staff@billiard.com       | staff123   |

---

## Features

### Table Management
- Add unlimited billiard tables with table name, number, day price, and night price
- Live status indicator (Available / Occupied) with animated pulsing dot
- Real-time updates via WebSocket — no page refresh needed

### Session System
- **Start Session** — Click "Start Session" on any available table
- **Live Timer** — Shows elapsed time for current round (updates every second)
- **Next Round** — Closes current round, starts a new one. Round history saved
- **Stop Session** — Calculates total play cost and opens payment dialog

### Pricing
- **Day rate** (06:00–18:00): uses `hourlyPrice`  
- **Night rate** (18:00–06:00): uses `nightPrice` if set, otherwise falls back to `hourlyPrice`
- Cost is calculated based on session start time within each round

### Menu / Orders
- Add items to active sessions from product categories
- Adjust quantity with + / − buttons
- Remove individual items from open sessions
- Order cost automatically added to final bill

### Billing & Payments
- Session stays **ACTIVE** until payment is confirmed — cancel the dialog and keep playing
- Shows play cost (with round breakdown), items cost, optional service fee, optional discount, and grand total
- Payment methods: **Cash** (with change calculation), **Card**, or **Mixed** (split cash + card)
- Notes field for VIP discounts, group bookings, etc.

### Receipt Printing
- 80mm thermal printer compatible (42 chars/line, Courier New)
- Auto-opens browser print dialog immediately after payment
- Manual reprint button in receipt modal
- Shows: business info, receipt number, cashier, table, session start/end/duration, round history with times and costs, itemized orders, subtotals, service fee, discount, total, payment breakdown, change amount

### Reports
- **Today:** total revenue, session count, active tables, cash vs card breakdown, top 5 products
- **History:** paginated session history with duration and payment amount

---

## API Documentation

Swagger UI available at: **http://localhost:3000/api**

All endpoints (except `POST /auth/login`) require a Bearer JWT token.

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | Login |
| GET | /tables | List all tables with active sessions |
| POST | /tables | Add table (Admin) |
| POST | /sessions/start/:tableId | Start session |
| POST | /sessions/:id/next-round | Next round |
| POST | /sessions/:id/stop-and-pay | Stop session + process payment (atomic) |
| POST | /orders | Add order to session |
| DELETE | /orders/:id | Remove order |
| GET | /reports/today | Today stats |
| GET | /reports/sessions | Session history (paginated) |

---

## Project Structure

```
billiard-club/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── server/
│   ├── src/
│   │   ├── auth/              # JWT authentication
│   │   ├── tables/            # Table CRUD
│   │   ├── sessions/          # Session + round logic
│   │   ├── products/          # Products & categories
│   │   ├── orders/            # Session orders
│   │   ├── payments/          # Payments & receipts
│   │   ├── reports/           # Analytics
│   │   ├── websocket/         # Socket.io gateway
│   │   └── prisma/            # Prisma service
│   └── package.json
└── client/
    ├── src/
    │   ├── api/               # API client functions
    │   ├── components/        # UI components
    │   ├── hooks/             # useTimer, useWebSocket
    │   ├── pages/             # Route pages
    │   ├── store/             # Zustand stores
    │   └── types/             # TypeScript types
    └── package.json
```

---

## Performance

- React Query caching with 30s stale time
- WebSocket for real-time table updates (avoids polling)
- Background refetch every 10s as fallback
- Lazy-loaded pages with suspense boundaries
- Optimistic UI patterns
- PostgreSQL indexes on hot query paths
- Production build with Rollup code splitting

---

## Production Build

```bash
# Build client
cd client && npm run build

# Build server
cd server && npm run build && npm start
```
