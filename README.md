# Eventtee Server

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-v5.0-blue.svg)](https://expressjs.com/)
[![Prisma Version](https://img.shields.io/badge/prisma-v7.0-indigo.svg)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue.svg)](https://www.typescriptlang.org/)

**Eventtee Server** is a production-grade backend REST API built with Express 5, TypeScript, PostgreSQL, Prisma ORM, and Better Auth. It handles event ticketing, category management, capacity reservation, attendee bookings, user reviews, and system administration.

---

## 📖 API Documentation

Detailed endpoint specifications, authentication requirements, role permissions, request/response formats, and JSON examples are documented in the API Reference:

👉 **[View Full API Reference Documentation (`docs/api.md`)](docs/api.md)**

---

## ✨ Key Features

- **🔐 Dual-Layer Authentication & RBAC:** Integrated with **Better Auth** supporting email/password authentication, JWT cookie caching, and role authorization (`USER`, `ORGANIZER`, `ADMIN`).
- **⚡ Race-Condition Safe Bookings:** Utilizes `prisma.$transaction` for atomic seat availability checks, price calculations, ticket bookings, and real-time seat increment/decrement.
- **🏷️ Category Safeguards:** Automatic slug generation with protection blocking category soft-deletions while active events exist.
- **⭐ Review Eligibility Control:** Restricts review submissions to attendees with `CONFIRMED` bookings for `COMPLETED` events, with a strict 1-review limit per user/event.
- **👑 Administrative Overrides & Soft-Deletes:** Uniform soft-deletion (`isDeleted`) and administrative restore mechanisms across Users, Categories, Events, and Reviews.

---

## 🛠️ Tech Stack

- **Runtime & Framework:** Node.js, Express 5, TypeScript (Strict Mode)
- **Database & ORM:** PostgreSQL, Prisma ORM (v7)
- **Authentication:** Better Auth (Email & Password, JWT Plugin, Cookie Cache)
- **Development Tooling:** `tsx` for hot-reloading development server

---

## 📂 Project Architecture

```text
eventtee-server/
├── prisma/
│   └── schema.prisma      # Database models, enums & indexes
├── src/
│   ├── config/            # Prisma Client database connection setup
│   ├── controllers/       # HTTP request handlers & input validation
│   ├── generated/prisma/  # Generated Prisma Client code
│   ├── lib/               # Better Auth engine configuration & hooks
│   ├── middlewares/       # JWT authentication & role authorization
│   ├── routes/            # Express route declarations
│   ├── services/          # Business logic & Prisma database transactions
│   ├── app.ts             # Express application & middleware setup
│   └── server.ts          # Server initialization & entry point
├── .env                   # Environment variable configuration
├── package.json
└── tsconfig.json
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `eventtee-server` root directory:

```env
# Database Connection
DATABASE_URL="postgresql://admin:localpa55word@localhost:5432/eventtee"

# Server Port
PORT=5000

# Better Auth Configuration
BETTER_AUTH_SECRET="your_super_secret_key_change_me_in_production"
BETTER_AUTH_URL="http://localhost:5000"

# Frontend Application Origin (CORS)
CLIENT_URL="http://localhost:3000"
```

| Variable             | Description                                  |
| -------------------- | -------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string                 |
| `PORT`               | HTTP server port (default: `5000`)           |
| `BETTER_AUTH_SECRET` | Secret key for signing auth tokens & cookies |
| `BETTER_AUTH_URL`    | Server public URL                            |
| `CLIENT_URL`         | Trusted frontend origin for CORS & cookies   |

---

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Migration & Prisma Generation

```bash
# Push Prisma schema to PostgreSQL database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

---

## 🏃 Development & Production Commands

| Command         | Description                                            |
| --------------- | ------------------------------------------------------ |
| `npm run dev`   | Starts development server with hot-reloading via `tsx` |
| `npm run build` | Compiles TypeScript into JavaScript (`tsc`)            |
| `npm start`     | Runs production build (`dist/server.js`)               |

---

## 🔗 Related Documentation

- 📘 [API Reference Guide (`docs/api.md`)](docs/api.md)
