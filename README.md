# Eventtee Server

A backend REST API for **Eventtee**, built with Node.js, Express, PostgreSQL, Prisma ORM, and Better Auth.

---

## 🚀 Tech Stack

- **Runtime & Framework:** Node.js, Express 5, TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM (v7)
- **Authentication:** Better Auth (Email & Password, JWT)
- **Development Tooling:** `tsx` for hot-reloading TypeScript

---

## 🛠️ Prerequisites

- **Node.js** (v18 or higher recommended)
- **PostgreSQL** running locally or via Docker/cloud instance

---

## ⚙️ Getting Started

### 1. Clone & Install Dependencies

```bash
cd eventtee-server
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/eventtee"
PORT=5000

# Better Auth Configuration
BETTER_AUTH_SECRET=your_super_secret_key
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000

# Client Application URL
CLIENT_URL=http://localhost:3000
```

### 3. Database Migration & Prisma Generation

Run Prisma migration and client generation:

```bash
# Push schema to database (or run migrations)
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

---

## 🏃 Running the Project

```bash
# Start development server with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

The server will be running at `http://localhost:5000`.

---

## 📡 API Endpoints Summary

- **Health Check:** `GET /`
- **Better Auth Endpoints:** `/api/auth/*` (e.g. `/api/auth/sign-up/email`, `/api/auth/sign-in/email`)
- **User Routes:** `/api/v1/users`
- **Category Routes:** `/api/v1/categories`

---

## 📁 Project Structure

```text
eventtee-server/
├── prisma/
│   └── schema.prisma      # Prisma schema definition
├── src/
│   ├── config/            # Database & App configurations
│   ├── controllers/       # Route request handlers
│   ├── generated/prisma/  # Generated Prisma Client
│   ├── lib/               # Utility libraries & Better Auth setup
│   ├── routes/            # Express API routes
│   ├── services/          # Business logic services
│   ├── app.ts             # Express app setup & middleware
│   └── server.ts          # Server entry point
├── .env                   # Environment variables
├── package.json
└── tsconfig.json
```
