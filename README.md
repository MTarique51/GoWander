# GoWander — Advanced Travel Listing & Experience Marketplace 

A full-stack MERN application based on the supplied GoWander SRS.

## Stack

- Frontend: React 18, Vite, React Router, Tailwind CSS, Axios, Recharts, Lucide React
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT access token, bcrypt password hashing, role/capability middleware
- Quality: Prettier, ESLint-ready structure, centralized error handling

## Included workflows

- Traveler registration/login, profile management, discovery, search, category/location/price filters, sorting and pagination
- Listing detail pages, availability dates, guest count and booking
- Booking history and booking status
- Provider application with document URL fields and admin approval/rejection
- Approved-provider listing CRUD, listing status, image gallery and availability
- Provider booking management and dashboard analytics
- Ratings/reviews restricted to eligible completed bookings; average rating aggregation
- Favorites/wishlist
- Admin dashboard with KPIs, booking/listing/user/provider moderation, reviews moderation
- In-app notifications, audit logs, seed data
- Responsive Tailwind UI and reusable layout/components

## SRS alignment and extensions

The SRS defines Traveler, Provider and Administrator roles; provider verification; listing discovery and management; booking; reviews; and centralized administration. This implementation preserves those core workflows. It extends the initial scope with favorites, in-app notifications, provider analytics, cancellation requests/status handling, availability dates, dashboard charts, pagination, sorting, and audit events. Payment gateway, live chat, Google Maps, AI itinerary generation, external email delivery, and mobile app are not implemented; payment is represented as `payAtVenue` / `offline` only.

## Requirements

- Node.js 20+
- MongoDB 7+ (local or Atlas)

## Setup

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

Edit `server/.env` and set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`.

### 2. Frontend

Open a second terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:5000/api  
Health: http://localhost:5000/api/health

## Demo accounts

The seed command creates:

- Admin: `admin@gowander.demo` / `Admin@123`
- Provider (approved): `provider@gowander.demo` / `Provider@123`
- Traveler: `traveler@gowander.demo` / `Traveler@123`
- Pending provider applicant: `pending@gowander.demo` / `Pending@123`

Seed is idempotent for the demo users and refreshes the demo catalog. Do not use these credentials in production.

## Useful commands

### Backend

```bash
npm run dev       # nodemon server
npm start         # production server
npm run seed      # insert demo users, listings, bookings and reviews
npm run format    # format backend source with Prettier
npm run format:check
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run format
npm run format:check
```

### Format the entire project from the repository root

```bash
npx prettier --write "**/*.{js,jsx,json,md,css,html}"
```

## API overview

All routes are prefixed with `/api`.

| Area          | Routes                                                                          |
| ------------- | ------------------------------------------------------------------------------- |
| Auth          | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`                       |
| Listings      | `GET /listings`, `GET /listings/:id`, provider CRUD under `/listings`           |
| Provider      | `GET/POST /providers/application`, admin review under `/providers/applications` |
| Bookings      | `POST /bookings`, `GET /bookings/my`, provider/admin booking routes             |
| Reviews       | `GET /reviews/listing/:listingId`, `POST /reviews`, admin moderation            |
| Favorites     | `GET /favorites`, `POST /favorites/:listingId`, `DELETE /favorites/:listingId`  |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`                           |
| Admin         | `GET /admin/overview`, users, listings, bookings, reviews                       |

See route files in `server/src/routes` for exact request/response shapes.

## Production checklist

- Use a strong unique JWT secret and HTTPS.
- Configure MongoDB network access and backups.
- Add rate limiting, CAPTCHA and email verification before public launch.
- Store uploaded media in object storage; current app accepts image URLs.
- Add a payment provider only after defining payment, refund and reconciliation rules.
- Review privacy, terms, moderation, tax and consumer-protection requirements.

## Expanded application pages (30+ screens)

The application includes the original core flows plus dedicated traveler, provider, administrator, discovery and public information workspaces. New workspace routes are listed below.

### Traveler workspace

`/traveler/dashboard`, `/trips`, `/trip-planner`, `/traveler/reviews`, `/traveler/preferences`, `/traveler/security`, `/traveler/support`, `/traveler/coupons`

### Discovery and public pages

`/discover/map`, `/experiences/categories`, `/about`, `/help`, `/contact`, `/safety`, `/legal/terms`, `/legal/privacy`

### Provider workspace

`/provider/listings`, `/provider/calendar`, `/provider/earnings`, `/provider/payouts`, `/provider/reviews`, `/provider/insights`, `/provider/promotions`, `/provider/profile`, `/provider/verification`, `/provider/support`

### Administrator workspace

`/admin/users`, `/admin/providers`, `/admin/listings`, `/admin/bookings`, `/admin/reviews`, `/admin/categories`, `/admin/analytics`, `/admin/reports`, `/admin/audit`, `/admin/support`, `/admin/content`, `/admin/settings`

**Important implementation boundary:** Existing SRS core workflows (authentication, listing CRUD, provider application review, bookings, reviews, favorites, notifications and admin core management) use the Express/MongoDB API. The expanded workspace screens provide searchable/filterable management interfaces and demo rows; their advanced domain operations are clearly marked for API integration and are not falsely represented as persisted backend features. Payment gateway, live maps, chat, AI itinerary generation and external email delivery require provider credentials and remain integration points.

### Format all files

Install the root-level formatter once, then format the complete repository from the project root:

```bash
npm install
npm run format:all
```

On Windows PowerShell, use `./format-all.ps1`. On macOS/Linux, use `bash ./format-all.sh`.

## Dynamic package-location discovery

The `/discover` page is backed by MongoDB, not a frontend dummy provider array. Providers create multiple travel packages; every package stores its own GeoJSON Point (`location.geo.coordinates` as `[longitude, latitude]`). A provider can publish packages at different meeting points in different cities.

Travelers can search cities/areas already represented by published package records, or click any point on the OpenStreetMap map. The backend uses MongoDB's `2dsphere` index to find packages inside the requested kilometer radius and groups those packages by provider. The map shows individual package meeting points, the result list shows each matching provider once, and opening a provider loads their complete published package catalogue (including packages outside the current search radius).

### Seed reset (destructive)

Run from `server/`:

```bash
npm run seed
```

The seed intentionally deletes all documents from all GoWander collections before inserting fresh demo users, providers, packages, bookings, reviews, favorites and notifications. Use only with a disposable development/demo database. **Never run this seed against production data.**

### Search limitation without a geocoding service

Text search resolves saved package locations from MongoDB. It cannot convert every arbitrary typed address into coordinates without a geocoding service. Travelers can still choose any arbitrary coordinate by clicking the map, then nearby search runs against database package coordinates. The basemap is OpenStreetMap and requires an internet connection; its public tile service has a usage policy and is not unlimited production tile hosting.
