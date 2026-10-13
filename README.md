# EventSphere — Full-Stack Event Discovery & Management Platform

EventSphere is a full-stack event discovery, registration, and management platform built with React 19, Vite, Node.js, Express, and MySQL. It features a curated violet, lavender, and mint design system, role-based access control (Attendee, Organizer, Admin), and database-driven transaction safety.

---

## 1. Project Architecture

The repository is organized into distinct, clean workspaces:

```
DonorConnect/
├── frontend/               # React 19 + Vite Frontend
│   ├── public/             # Static assets & favicons
│   ├── src/
│   │   ├── components/     # Reusable layout & UI cards (violet sidebar, white cards)
│   │   ├── context/        # AuthContext (HTTP-only session) & ToastContext
│   │   ├── pages/          # Public, Attendee, Organizer, Admin, & Utility pages
│   │   ├── services/       # Centralized apiClient, authService, eventService, etc.
│   │   ├── App.jsx         # Complete client-side routing
│   │   └── index.css       # Core design tokens, gradients, and typography
│   ├── .env.example        # Frontend environment template
│   └── package.json        # Frontend scripts and dependencies
│
├── backend/                # Node.js + Express REST API
│   ├── src/
│   │   ├── config/         # Environment variables and MySQL connection pooling
│   │   ├── controllers/    # Request handlers for auth, events, registrations, admin
│   │   ├── database/       # Migration and seed execution scripts
│   │   ├── middleware/     # JWT authentication, role authorization, rate limiter, errors
│   │   ├── routes/         # Modular Express routers mounted under /api
│   │   ├── services/       # Business logic with transaction locks & validation
│   │   ├── validators/     # Zod schema definitions
│   │   ├── app.js          # Express app with Helmet, CORS, and centralized errors
│   │   └── server.js       # HTTP server entrypoint
│   ├── migrations/         # Versioned SQL migrations (001_create_tables.sql)
│   ├── seeds/              # Demonstration data definitions
│   ├── tests/              # Vitest & Supertest automated test suite
│   ├── .env.example        # Backend environment template
│   └── package.json        # Backend scripts and dependencies
│
├── .env.example            # Workspace environment template
├── .gitignore              # Ignores .env, node_modules, dist, logs, and coverage
├── package.json            # Root workspace task runner
└── README.md               # Architecture, setup, API, and troubleshooting guide
```

---

## 2. Prerequisites

- **Node.js**: v18.0.0 or later (tested on Node v26)
- **npm**: v9.0.0 or later
- **MySQL**: 8.0+ or MySQL Community Server (e.g. 9.5) installed locally or reachable on Amazon RDS

---

## 3. Environment Variables

### Backend Configuration (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment (`development`, `production`) | `development` |
| `FRONTEND_URL` | Allowed client origin for CORS | `http://localhost:5173` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `eventsphere_db` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `your_mysql_password` |
| `JWT_SECRET` | Secret key for signing tokens | `secure_random_key_here` |
| `JWT_EXPIRES_IN` | Token duration | `7d` |
| `COOKIE_NAME` | HTTP-only session cookie name | `eventsphere_token` |
| `COOKIE_SECURE` | Set `true` in HTTPS production | `false` |
| `COOKIE_SAME_SITE` | Cookie SameSite policy | `lax` |

### Frontend Configuration (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Public endpoint for backend API | `http://localhost:5000/api` |

---

## 4. Database Setup & Migrations

### A. Creating the Database & Running Migrations

EventSphere uses automated migration scripts that automatically create the database if it doesn't already exist and apply all relational schema tables, constraints, foreign keys, and indexes.

From the `backend/` directory:

```bash
# Run migrations (creates eventsphere_db and all tables)
npm run migrate
```

Or from the workspace root:

```bash
npm --prefix backend run migrate
```

### B. Seeding Demonstration Data

Populate the database with categories, demo users, sample events, and registrations:

```bash
# Run seeder
npm run seed
```

Or from the workspace root:

```bash
npm --prefix backend run seed
```

The seeder is completely idempotent (`INSERT ... ON DUPLICATE KEY UPDATE`) and safe to re-run.

---

## 5. Starting the Platform

### Running Backend & Frontend Together

From the repository root:

```bash
# Start frontend
npm run dev:frontend

# Start backend (in another terminal)
npm run dev:backend
```

### Running the Backend Independently

```bash
cd backend
npm install
npm run dev     # Starts server with file watcher on port 5000
# or
npm start       # Production start command
```

The backend starts at `http://localhost:5000`.
Health-check: `http://localhost:5000/api/health`.

### Running the Frontend Independently

```bash
cd frontend
npm install
npm run dev     # Starts Vite dev server on http://localhost:5173
```

---

## 6. Seed Accounts for Evaluation

| Role | Email | Password | Pre-seeded Permissions |
|---|---|---|---|
| **Attendee** | `attendee@eventsphere.demo` | `EventSphere123!` | Explore events, register for free events, view tickets, cancel bookings |
| **Organizer** | `organizer@eventsphere.demo` | `EventSphere123!` | Create events, edit owned events, view attendees, export attendee CSV, analytics |
| **Admin** | `admin@eventsphere.demo` | `EventSphere123!` | Manage platform users (suspend/activate), moderate events, manage categories |

*Tip: The top Demo Bar allows instant one-click switching between these roles while generating genuine backend sessions.*

---

## 7. API Endpoint Summary

### System Health
- `GET /api/health` — Service uptime & database readiness check

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register Attendee or Organizer (admin registration forbidden)
- `POST /api/auth/login` — Log in and set HTTP-only cookie
- `POST /api/auth/logout` — Clear session cookie
- `GET /api/auth/me` — Authenticated profile (protected)
- `GET /api/auth/demo-accounts` — Demonstration account list

### Public & Management Events (`/api/events`)
- `GET /api/events` — Discover published events (supports search, category, city, date, sorting)
- `GET /api/events/:id` — Event details by ID or slug (drafts hidden from public)
- `POST /api/events` — Create event (Organizer & Admin only)
- `PUT /api/events/:id` — Update event (owner only; capacity cannot drop below bookings)
- `PATCH /api/events/:id/status` — Update event status (`published`, `draft`, `cancelled`)
- `DELETE /api/events/:id` — Remove event (blocked if registrations exist)

### Event Categories (`/api/categories`)
- `GET /api/categories` — List active categories
- `GET /api/categories/:slug` — Category details
- `GET /api/categories/:slug/events` — Published events within category
- `POST /api/categories` — Add category (Admin only)
- `PUT /api/categories/:id` — Update category (Admin only)
- `PATCH /api/categories/:id/toggle-active` — Toggle category status (Admin only)
- `DELETE /api/categories/:id` — Delete category (Admin only, checks event references)

### Registrations & Bookings (`/api/registrations`)
- `POST /api/registrations/events/:id/register` — Register for free event (transaction lock, overbooking & duplicate check)
- `GET /api/registrations/me` — Attendee booking history
- `DELETE /api/registrations/:id` — Cancel registration (attendee self-service)

### Organizer APIs (`/api/organizer`)
- `GET /api/organizer/dashboard` — Live dashboard metrics (computed from database)
- `GET /api/organizer/events` — Organizer's events
- `GET /api/organizer/events/:id/attendees` — Attendee list for event

### Admin APIs (`/api/admin`)
- `GET /api/admin/dashboard` — Platform-wide statistics
- `GET /api/admin/users` — User directory with role & status filters
- `PATCH /api/admin/users/:id/status` — Toggle user suspension (self-suspension prevented)
- `GET /api/admin/events` — All platform events
- `PATCH /api/admin/events/:id/status` — Moderate event status

### Notifications (`/api/notifications`)
- `GET /api/notifications` — User notifications
- `PATCH /api/notifications/:id/read` — Mark notification read
- `POST /api/notifications/read-all` — Mark all notifications read

### User Profile (`/api/users`)
- `PUT /api/users/profile` — Update user profile

---

## 8. Automated Testing

The automated test suite runs via Vitest and Supertest across 17 test categories:

```bash
# Run backend tests
cd backend
npm test

# Or from workspace root
npm run test:backend
```

### Test Coverage Checklist (17 Scenarios Verified)
1. ✅ `GET /api/health` returns 200 with service and DB status
2. ✅ `POST /api/auth/register` creates attendee without leaking password hash
3. ✅ `POST /api/auth/register` rejects duplicate email with 409 Conflict
4. ✅ `POST /api/auth/login` validates credentials and sets session
5. ✅ `POST /api/auth/login` rejects wrong password with 401 Unauthorized
6. ✅ `GET /api/auth/me` rejects unauthenticated callers with 401
7. ✅ Attendees are prohibited from creating events (403 Forbidden)
8. ✅ Organizers can create events
9. ✅ Organizers cannot edit events owned by others
10. ✅ `GET /api/events` supports filtering and pagination
11. ✅ Duplicate bookings by the same attendee are rejected
12. ✅ Capacity exhaustion prevents overbooking
13. ✅ Cancelled events reject registrations
14. ✅ Attendees can cancel their own bookings
15. ✅ Admin dashboard and moderation protected from non-admins
16. ✅ Request body schema validation rejects invalid data (400 Bad Request)
17. ✅ Centralized error handling returns clean JSON without stack traces

---

## 9. Frontend Build & Quality Checks

```bash
cd frontend
npm run build    # Validates production compilation
npm run lint     # Oxlint static analysis
```

---

## 10. Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| `Access denied for user 'root'@'localhost'` | MySQL password mismatch | Enter your local MySQL password in `backend/.env` under `DB_PASSWORD`. |
| `Cannot connect to MySQL server` | MySQL server not running | Start MySQL service via `brew services start mysql` or macOS System Settings. |
| `CORS Error in Browser` | Origin mismatch | Ensure `FRONTEND_URL=http://localhost:5173` matches the frontend port in `backend/.env`. |
| `sh: vite: command not found` | Dependencies not installed | Run `npm install` inside the `frontend/` folder. |
