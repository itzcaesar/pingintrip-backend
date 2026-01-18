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
- **Modern UI**: Clean, responsive interface built with Tailwind CSS and Shadcn.
- **Live Dashboard**: Real-time stats and activity feed.
- **Interactive Map**: Live vehicle tracking using Leaflet (Coming Soon).
- **Data Tables**: comprehensive filtering and sorting for operations.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Backend Framework**: NestJS
- **Frontend Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **State Management**: Zustand (Frontend)
- **Real-time**: Socket.IO
- **Styling**: Tailwind CSS

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
Dashboard runs on: `http://localhost:3001` (or 3000 if backend not running)

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@pingintrip.com` | `admin123` |
| **Staff** | `staff@pingintrip.com` | `staff123` |

## 📡 API Documentation

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh Token

### Dashboard & Core
- `GET /api/bookings` - List bookings
- `GET /api/vehicles` - List vehicles
- `GET /api/drivers` - List drivers
- `GET /api/gps/vehicles` - Last known locations

Ensure `api-key` is sent for GPS/GForm webhooks.

## 📝 License
Private - Pingintrip
