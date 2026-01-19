# Pingintrip Dashboard System

A complete travel management solution for Pingintrip, featuring a robust NestJS backend and a modern Next.js admin dashboard.

## 🚀 Features

### Backend (NestJS)
- **Authentication**: JWT-based login (Access + Refresh tokens) & Role-based Access Control (ADMIN, STAFF).
- **Booking Management**: Full CRUD with status workflow (Pending -> Confirmed -> On Trip -> Completed).
- **Vehicle Fleet**: Track availability, GPS integration, and maintenance status.
- **Driver Management**: Assign drivers/guides to bookings and track duty status.
- **Real-time Engine**: Socket.IO gateway emitting live updates for bookings and GPS locations.
- **GPS Integration**: Adapter-based GPS tracking system (Webhooks + Realtime).
- **Google Forms**: Webhook integration to auto-create bookings from GForm submissions.

### Frontend (Next.js 15 + Shadcn UI)
- **Modern UI**: Clean, responsive interface built with Tailwind CSS v4 and Shadcn.
- **🌙 Dark Mode**: System-aware theme switcher with smooth transitions and localStorage persistence.
- **Live Dashboard**: Real-time stats, revenue charts, and activity feed.
- **Interactive Map**: Live vehicle tracking using Leaflet with Lombok-centered view.
- **Data Tables**: Comprehensive filtering and sorting for operations.
- **Expanded Pages**:
  - 📊 Dashboard with revenue overview and activity feed
  - 📅 Booking Calendar with month view and event display
  - 🚗 Vehicle Fleet management with status badges
  - 👥 Customer management with search and filters
  - 📈 Reports & Analytics with charts
  - ⚙️ Settings page with profile, notifications, and security

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Backend Framework**: NestJS
- **Frontend Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **State Management**: Zustand (Frontend)
- **Real-time**: Socket.IO
- **Styling**: Tailwind CSS v4 + CSS Variables
- **Theme**: next-themes (Dark/Light mode)
- **Charts**: Recharts

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- Docker Desktop (for PostgreSQL)

### 1. Setup Backend & Database

```bash
# Install dependencies
npm install

# Start Database (Docker)
docker compose up -d

# Generate Prisma Client & Run Migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed Database
npx prisma db seed
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

## 🏃‍♂️ Running the Project

### Start Backend
```bash
# Development
npm run start:dev

# Or using the helper script (Windows)
.\start-server.ps1
```
API runs on: `http://localhost:3000`

### Start Frontend
```bash
cd frontend
npm run dev
```
Dashboard runs on: `http://localhost:3001`

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@pingintrip.com` | `admin123` |
| **Staff** | `staff@pingintrip.com` | `staff123` |

## 🎨 Theme System

The dashboard supports **Light** and **Dark** modes:
- Toggle via sun/moon button in the top navbar
- Respects system preference on first visit
- Persists choice in localStorage
- Smooth 150ms color transitions

## 📡 API Documentation

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh Token

### Dashboard & Core
- `GET /api/bookings` - List bookings
- `GET /api/bookings/stats` - Dashboard statistics
- `GET /api/vehicles` - List vehicles
- `GET /api/vehicles/available` - Available fleet count
- `GET /api/drivers` - List drivers
- `GET /api/gps/vehicles` - Last known locations

Ensure `api-key` is sent for GPS/GForm webhooks.

## 📝 License
Private - Pingintrip

