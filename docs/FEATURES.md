# GoWander feature map

## SRS core

- Traveler: register/login, browse/search/filter, listing details, bookings, booking history, ratings/reviews, apply for provider.
- Provider: submit application; after approval create/edit/pause experiences; manage incoming bookings.
- Admin: review provider applications; manage users/listings/bookings/reviews; platform dashboard.
- Security: password hashing, JWT, protected routes, role checks.

## Advanced extensions in this scaffold

- Favorites / wishlist
- In-app notifications
- Provider dashboard and booking workflow
- Admin KPI cards and booking trend chart
- Booking cancellation and provider confirmation/completion
- Listing categories, city, price range, sort and pagination API
- Listing average rating and review count aggregation
- Audit events for key moderation actions
- Listing images, highlights, inclusions, guest limits and duration
- Profile editing
- Responsive Tailwind layout

## Intentionally not implemented

- Payment gateway and refunds (offline / pay-at-venue marker only)
- Google Maps / live geolocation
- Real-time messaging
- Email / SMS delivery
- AI itinerary generation
- Multi-language and multi-currency UI
- File upload pipeline (image URLs are accepted)
