# Eventtee API Documentation

Complete REST API reference for **Eventtee Server**, built with Express 5, TypeScript, PostgreSQL, Prisma ORM, and Better Auth.

---

## 📌 Overview

The Eventtee API provides a comprehensive backend platform for managing event ticketing, category taxonomies, seat capacity reservations, attendee bookings, user reviews, and administrator oversight.

### Base URL
```text
http://localhost:5000
```
- **Auth Endpoint Prefix:** `/api/auth`
- **REST API v1 Prefix:** `/api/v1`

---

## 🔐 Authentication & Security

Authentication is managed via **Better Auth** with JWT session caching.

### Authentication Credentials
Requests to protected endpoints require authentication via one of two methods:
1. **HTTP Bearer Header:** `Authorization: Bearer <jwt_token>`
2. **HTTP Cookies:** Browser cookie containing `better-auth.session_data` or `better-auth.session_token`.

### Role-Based Access Control (RBAC)
The API enforces strict role permissions via custom authorization middleware (`authorize(...allowedRoles)`):

| Role | Access Description |
|---|---|
| **`USER`** | Default role. Can view active events, manage own user profile, create bookings, cancel own bookings, and submit reviews for completed events. |
| **`ORGANIZER`** | Can create and manage own events (`DRAFT`, `PUBLISHED`, `CANCELLED`), view event bookings, and confirm attendee bookings. |
| **`ADMIN`** | System superuser. Can view all users, manage user roles, manage categories, override event & review ownership, soft-delete, and restore system resources. |

---

## 📐 Response Conventions

### Success Response Format
All successful responses return HTTP `200 OK` or `201 Created` with a standardized JSON structure:

```json
{
  "success": true,
  "message": "Human-readable response message",
  "data": { ... }
}
```

### Error Response Format
All client or server errors return appropriate HTTP status codes (`400`, `401`, `403`, `404`, `409`, `500`) with a standardized JSON structure:

```json
{
  "success": false,
  "message": "Detailed explanation of the error"
}
```

---

## 🔑 1. Authentication Endpoints (`/api/auth`)

Managed directly by Better Auth engine.

### 1.1 Sign Up with Email
Registers a new user account. Role defaults to `USER`. Setting `role` to `ORGANIZER` is allowed during registration; all other values default to `USER`.

- **HTTP Method:** `POST`
- **Path:** `/api/auth/sign-up/email`
- **Authentication:** Public
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "Jane Doe",
    "role": "USER"
  }
  ```
- **Success Code:** `200 OK`
- **Success Response:**
  ```json
  {
    "user": {
      "id": "c1f7a63b-9a1d-4e42-990a-112233445566",
      "email": "user@example.com",
      "name": "Jane Doe",
      "role": "USER",
      "emailVerified": false,
      "createdAt": "2026-08-10T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 1.2 Sign In with Email
Authenticates an existing user and returns session data & JWT cookie/token.

- **HTTP Method:** `POST`
- **Path:** `/api/auth/sign-in/email`
- **Authentication:** Public
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Code:** `200 OK`

### 1.3 Sign Out
Revokes current user session and clears session cookies.

- **HTTP Method:** `POST`
- **Path:** `/api/auth/sign-out`
- **Authentication:** Required

### 1.4 Get Active Session
Retrieves the active session information and authenticated user profile.

- **HTTP Method:** `GET`
- **Path:** `/api/auth/get-session`
- **Authentication:** Required

---

## 👤 2. User Endpoints (`/api/v1/users`)

### 2.1 Get Current User Profile
Retrieves the authenticated user's own profile.

- **HTTP Method:** `GET`
- **Path:** `/api/v1/users/me`
- **Authentication:** Required
- **Roles:** `USER`, `ORGANIZER`, `ADMIN`
- **Success Code:** `200 OK`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Profile fetched successfully",
    "data": {
      "id": "c1f7a63b-9a1d-4e42-990a-112233445566",
      "name": "Jane Doe",
      "email": "user@example.com",
      "role": "USER",
      "image": null,
      "emailVerified": false,
      "isDeleted": false,
      "createdAt": "2026-08-10T00:00:00.000Z",
      "updatedAt": "2026-08-10T00:00:00.000Z"
    }
  }
  ```

### 2.2 Update User Profile
Updates user profile information (`name`, `image`). Users can update their own profile; `ADMIN` users can update any user profile.

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/users/:id`
- **Authentication:** Required
- **Roles:** `USER`, `ORGANIZER`, `ADMIN`
- **Path Parameters:**
  - `id` (string): User ID
- **Request Body:** (At least one field required)
  ```json
  {
    "name": "Jane Smith",
    "image": "https://example.com/avatar.jpg"
  }
  ```
- **Success Code:** `200 OK`
- **Error Codes:**
  - `400 Bad Request`: Neither `name` nor `image` provided.
  - `403 Forbidden`: Attempting to update another user's profile without `ADMIN` role.
  - `404 Not Found`: User not found.

### 2.3 Get All Users
Retrieves a paginated list of all users.

- **HTTP Method:** `GET`
- **Path:** `/api/v1/users`
- **Authentication:** Required
- **Roles:** `ADMIN`
- **Query Parameters:**
  - `page` (number, default: `1`): Page number
  - `limit` (number, default: `20`, max: `100`): Results per page
- **Success Code:** `200 OK`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Users fetched successfully",
    "data": {
      "users": [
        {
          "id": "c1f7a63b-9a1d-4e42-990a-112233445566",
          "name": "Jane Doe",
          "email": "user@example.com",
          "image": null,
          "isDeleted": false
        }
      ],
      "total": 1
    }
  }
  ```

### 2.4 Get Active Users
Retrieves a paginated list of active users (`isDeleted: false`).

- **HTTP Method:** `GET`
- **Path:** `/api/v1/users/active`
- **Authentication:** Required
- **Roles:** `ADMIN`
- **Query Parameters:** `page`, `limit`
- **Success Code:** `200 OK`

### 2.5 Soft-Delete User
Marks a user account as deleted (`isDeleted: true`).

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/users/soft-delete/:id`
- **Authentication:** Required
- **Roles:** `ADMIN`
- **Success Code:** `200 OK`
- **Error Codes:**
  - `400 Bad Request`: User is already deleted.
  - `404 Not Found`: User not found.

### 2.6 Restore User
Restores a soft-deleted user account (`isDeleted: false`).

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/users/restore/:id`
- **Authentication:** Required
- **Roles:** `ADMIN`
- **Success Code:** `200 OK`

---

## 🏷️ 3. Category Endpoints (`/api/v1/categories`)

### 3.1 Get All Categories
Retrieves all categories.

- **HTTP Method:** `GET`
- **Path:** `/api/v1/categories`
- **Authentication:** Public
- **Query Parameters:** `page`, `limit`
- **Success Code:** `200 OK`

### 3.2 Get Active Categories
Retrieves all active categories (`isDeleted: false`).

- **HTTP Method:** `GET`
- **Path:** `/api/v1/categories/active`
- **Authentication:** Public
- **Query Parameters:** `page`, `limit`
- **Success Code:** `200 OK`

### 3.3 Create Category
Creates a new event category. Auto-generates `slug` from `name` if omitted.

- **HTTP Method:** `POST`
- **Path:** `/api/v1/categories`
- **Authentication:** Required
- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "name": "Technology & AI",
    "slug": "technology-and-ai"
  }
  ```
- **Success Code:** `201 Created`
- **Error Codes:**
  - `400 Bad Request`: Category name missing.
  - `409 Conflict`: Category with this name or slug already exists (`P2002`).

### 3.4 Update Category
Updates category name or slug.

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/categories/:id`
- **Authentication:** Required
- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "name": "Tech & Web Development"
  }
  ```
- **Success Code:** `200 OK`
- **Error Codes:**
  - `400 Bad Request`: At least one field (name or slug) must be provided.
  - `404 Not Found`: Category not found.
  - `409 Conflict`: Category with this name or slug already exists (`P2002`).

### 3.5 Soft-Delete Category
Soft-deletes a category. Guaranteed to fail if active published events reference this category.

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/categories/soft-delete/:id`
- **Authentication:** Required
- **Roles:** `ADMIN`
- **Success Code:** `200 OK`
- **Error Codes:**
  - `400 Bad Request`: Cannot delete category with active published events.
  - `404 Not Found`: Category not found.

### 3.6 Restore Category
Restores a soft-deleted category.

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/categories/restore/:id`
- **Authentication:** Required
- **Roles:** `ADMIN`
- **Success Code:** `200 OK`

---

## 📅 4. Event Endpoints (`/api/v1/events`)

### 4.1 Search & Filter Active Events
Retrieves active, published events sorted by `startDate: "asc"`, with keyword search, category filter, and calculated `remainingSeats`.

- **HTTP Method:** `GET`
- **Path:** `/api/v1/events/active`
- **Authentication:** Public
- **Query Parameters:**
  - `page` (number): Page index
  - `limit` (number): Items per page
  - `categoryId` (string): Filter by category ID
  - `search` (string): Search keyword in title or description (case-insensitive)
- **Success Code:** `200 OK`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Active events fetched successfully",
    "data": {
      "events": [
        {
          "id": "e9123456-789a-bcde-f012-34567890abcd",
          "title": "Tech Conference 2026",
          "description": "Annual developer summit",
          "price": "99.99",
          "capacity": 200,
          "bookedSeats": 45,
          "remainingSeats": 155,
          "startDate": "2026-09-15T09:00:00.000Z",
          "location": "Convention Center",
          "status": "PUBLISHED",
          "createdAt": "2026-08-10T00:00:00.000Z",
          "updatedAt": "2026-08-10T00:00:00.000Z",
          "categoryId": "cat-123",
          "organizerId": "usr-456",
          "category": {
            "id": "cat-123",
            "name": "Technology",
            "slug": "technology"
          }
        }
      ],
      "total": 1
    }
  }
  ```

### 4.2 Get Single Event Details
Retrieves detailed information for a specific event, including category, organizer profile, active reviews, `remainingSeats`, and calculated `averageRating`.

- **HTTP Method:** `GET`
- **Path:** `/api/v1/events/:id`
- **Authentication:** Public
- **Path Parameters:**
  - `id` (string): Event ID
- **Success Code:** `200 OK`
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Event details fetched successfully",
    "data": {
      "id": "e9123456-789a-bcde-f012-34567890abcd",
      "title": "Tech Conference 2026",
      "description": "Annual developer summit",
      "price": "99.99",
      "capacity": 200,
      "bookedSeats": 45,
      "remainingSeats": 155,
      "averageRating": 4.8,
      "totalReviews": 12,
      "category": { "id": "cat-123", "name": "Technology", "slug": "technology" },
      "organizer": { "id": "usr-456", "name": "Tech Corp", "email": "info@techcorp.com", "image": null },
      "reviews": [
        {
          "id": "rev-789",
          "rating": 5,
          "comment": "Outstanding event!",
          "createdAt": "2026-08-01T12:00:00.000Z",
          "user": { "id": "usr-777", "name": "Alice", "image": null }
        }
      ]
    }
  }
  ```

### 4.3 Get Event Reviews
Retrieves reviews for an event with `averageRating` and `totalReviews`.

- **HTTP Method:** `GET`
- **Path:** `/api/v1/events/:eventId/reviews`
- **Authentication:** Public
- **Path Parameters:** `eventId` (string)
- **Query Parameters:** `page`, `limit`
- **Success Code:** `200 OK`

### 4.4 Create Event
Creates a new event. The `organizerId` is automatically set to `req.user.id` and `status` defaults to `DRAFT`.

- **HTTP Method:** `POST`
- **Path:** `/api/v1/events`
- **Authentication:** Required
- **Roles:** `ORGANIZER`, `ADMIN`
- **Request Body:**
  ```json
  {
    "title": "AI Builders Workshop",
    "description": "Hands-on AI development session",
    "price": 49.99,
    "capacity": 50,
    "startDate": "2026-10-01T10:00:00.000Z",
    "location": "Innovation Hub",
    "categoryId": "cat-123"
  }
  ```
- **Success Code:** `201 Created`
- **Error Codes:**
  - `400 Bad Request`: Missing required fields, invalid price/capacity, or invalid `categoryId`.

### 4.5 Get All Events
Retrieves all events across all statuses.

- **HTTP Method:** `GET`
- **Path:** `/api/v1/events`
- **Authentication:** Required
- **Roles:** `USER`, `ORGANIZER`, `ADMIN`
- **Query Parameters:** `page`, `limit`
- **Success Code:** `200 OK`

### 4.6 Get Event Bookings (Organizer View)
Retrieves booking list for an event organized by the requesting user (or Admin).

- **HTTP Method:** `GET`
- **Path:** `/api/v1/events/:id/bookings`
- **Authentication:** Required
- **Roles:** `ORGANIZER`, `ADMIN`
- **Success Code:** `200 OK`
- **Error Codes:**
  - `403 Forbidden`: Requesting user is not the organizer of this event.

### 4.7 Update Event
Updates event properties. Requires event ownership (`organizerId === req.user.id`) or `ADMIN` role.

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/events/:id`
- **Authentication:** Required
- **Roles:** `ORGANIZER`, `ADMIN`

### 4.8 Publish Event
Transitions event status to `PUBLISHED`. Requires event ownership or `ADMIN`.

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/events/publish/:id`
- **Authentication:** Required
- **Roles:** `ORGANIZER`, `ADMIN`

### 4.9 Cancel Event
Transitions event status to `CANCELLED`. Requires event ownership or `ADMIN`.

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/events/cancel/:id`
- **Authentication:** Required
- **Roles:** `ORGANIZER`, `ADMIN`

### 4.10 Soft-Delete Event
Soft-deletes an event (`isDeleted: true`). Requires event ownership or `ADMIN`.

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/events/soft-delete/:id`
- **Authentication:** Required
- **Roles:** `ORGANIZER`, `ADMIN`

### 4.11 Restore Event
Restores a soft-deleted event (`isDeleted: false`). Requires event ownership or `ADMIN`.

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/events/restore/:id`
- **Authentication:** Required
- **Roles:** `ORGANIZER`, `ADMIN`

---

## 🎟️ 5. Booking Endpoints (`/api/v1/bookings`)

### 5.1 Create Booking
Creates a ticket booking using an atomic `prisma.$transaction`. Validates that the event is `PUBLISHED`, check capacity (`bookedSeats + seats <= capacity`), calculates `totalPrice = price * seats`, sets status to `PENDING`, and increments `bookedSeats`.

- **HTTP Method:** `POST`
- **Path:** `/api/v1/bookings`
- **Authentication:** Required
- **Roles:** `USER`, `ORGANIZER`, `ADMIN`
- **Request Body:**
  ```json
  {
    "eventId": "e9123456-789a-bcde-f012-34567890abcd",
    "seats": 2
  }
  ```
- **Success Code:** `201 Created`
- **Error Codes:**
  - `400 Bad Request`: Event not available, not `PUBLISHED`, or requested seats exceed available capacity.
  - `401 Unauthorized`: Authentication missing.

### 5.2 Get User Booking History
Retrieves booking history for a specific user. Users can only view their own history; `ADMIN` users can view any user's history. Includes event summary details.

- **HTTP Method:** `GET`
- **Path:** `/api/v1/bookings/user/:userId`
- **Authentication:** Required
- **Roles:** `USER`, `ORGANIZER`, `ADMIN`
- **Path Parameters:** `userId` (string)
- **Query Parameters:** `page`, `limit`
- **Success Code:** `200 OK`
- **Error Codes:**
  - `403 Forbidden`: Attempting to view another user's booking history without `ADMIN` role.

### 5.3 Cancel Booking
Cancels a booking in an atomic `prisma.$transaction`. Verifies booking ownership (`booking.userId === req.user.id`) or `ADMIN` role, updates status to `CANCELLED`, and releases seats back to the event (`decrement: booking.seats`).

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/bookings/cancel/:id`
- **Authentication:** Required
- **Roles:** `USER`, `ORGANIZER`, `ADMIN`
- **Path Parameters:** `id` (string): Booking ID
- **Success Code:** `200 OK`
- **Error Codes:**
  - `400 Bad Request`: Booking is already cancelled.
  - `403 Forbidden`: Attempting to cancel another user's booking.

### 5.4 Confirm Booking
Confirms a pending booking (`status = CONFIRMED`). Verifies that the requesting user is the organizer of the event (`event.organizerId === req.user.id`) or `ADMIN`.

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/bookings/confirm/:id`
- **Authentication:** Required
- **Roles:** `ORGANIZER`, `ADMIN`
- **Path Parameters:** `id` (string): Booking ID
- **Success Code:** `200 OK`

### 5.5 Get All Bookings
Retrieves a paginated list of all bookings.

- **HTTP Method:** `GET`
- **Path:** `/api/v1/bookings`
- **Authentication:** Required
- **Roles:** `USER`, `ORGANIZER`, `ADMIN`

### 5.6 Get Active Bookings
Retrieves active bookings (`isDeleted: false`).

- **HTTP Method:** `GET`
- **Path:** `/api/v1/bookings/active`
- **Authentication:** Required
- **Roles:** `USER`, `ORGANIZER`, `ADMIN`

---

## ⭐ 6. Review Endpoints (`/api/v1/reviews`)

### 6.1 Create Review
Submits a review for an event. Enforces eligibility rules:
1. Event status MUST be `COMPLETED`.
2. Requesting user MUST have a `CONFIRMED` booking for the event.
3. User can submit only ONE review per event (`@@unique([userId, eventId])`).

- **HTTP Method:** `POST`
- **Path:** `/api/v1/reviews`
- **Authentication:** Required
- **Roles:** `USER`, `ORGANIZER`, `ADMIN`
- **Request Body:**
  ```json
  {
    "eventId": "e9123456-789a-bcde-f012-34567890abcd",
    "rating": 5,
    "comment": "Phenomenal workshop and interactive session!"
  }
  ```
- **Success Code:** `201 Created`
- **Error Codes:**
  - `400 Bad Request`: Invalid rating range (must be 1–5), event not `COMPLETED`, or user already submitted a review.
  - `403 Forbidden`: User does not have a `CONFIRMED` booking for this event.

### 6.2 Update Review
Updates rating or comment for an existing review. Requires review ownership (`review.userId === req.user.id`) or `ADMIN`.

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/reviews/:id`
- **Authentication:** Required
- **Roles:** `USER`, `ORGANIZER`, `ADMIN`

### 6.3 Delete Review (Hard Delete)
Permanently deletes a review from the database. Requires review ownership or `ADMIN`.

- **HTTP Method:** `DELETE`
- **Path:** `/api/v1/reviews/:id`
- **Authentication:** Required
- **Roles:** `USER`, `ORGANIZER`, `ADMIN`

### 6.4 Soft-Delete Review
Marks a review as deleted (`isDeleted: true`). Requires review ownership or `ADMIN`.

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/reviews/soft-delete/:id`
- **Authentication:** Required
- **Roles:** `USER`, `ORGANIZER`, `ADMIN`

### 6.5 Restore Review
Restores a soft-deleted review (`isDeleted: false`).

- **HTTP Method:** `PATCH`
- **Path:** `/api/v1/reviews/restore/:id`
- **Authentication:** Required
- **Roles:** `ADMIN`

### 6.6 Get All Reviews
Retrieves all reviews.

- **HTTP Method:** `GET`
- **Path:** `/api/v1/reviews`
- **Authentication:** Public

### 6.7 Get Active Reviews
Retrieves active reviews (`isDeleted: false`).

- **HTTP Method:** `GET`
- **Path:** `/api/v1/reviews/active`
- **Authentication:** Public
