# Dynamic location-based provider discovery

## Data model

A provider is a `User` with approved provider status. Every travel package is a `Listing` owned by one provider. Each Listing stores its own GeoJSON Point at `location.geo` (`[longitude, latitude]`) alongside city, state, address and package details. This intentionally supports one provider publishing packages in different cities.

MongoDB creates a `2dsphere` index on `Listing.location.geo`. Nearby discovery uses `$geoWithin` / `$centerSphere` against package coordinates and groups the matching package records by provider. The distance filter therefore answers: "Which providers have at least one published package within this radius?" Each map marker is an individual nearby package location.

## Provider workflow

1. An approved provider opens Provider Dashboard > Create experience.
2. They enter package title, category, description, city, state, meeting point, price, duration, guest limit, included items and highlights.
3. They click the map or drag the marker to set the package's exact meeting point. Latitude and longitude are stored in MongoDB with the package.
4. Editing a package updates that package's own location. A provider can publish many packages at unrelated locations.

## Traveler workflow

1. `/discover` fetches location suggestions from saved published package locations in MongoDB.
2. A selected search result sets the map center. Alternatively, the traveler clicks any point on the map.
3. The client calls `GET /api/listings/nearby/providers?lat=...&lng=...&radiusKm=...`.
4. The server finds published packages within the radius, computes distances, and groups packages by provider.
5. Clicking a provider fetches `GET /api/providers/:providerId/packages`, which returns every published package belonging to that provider, including packages in cities outside the current search radius.
6. Package details and booking continue through the existing listing and booking routes.

## API endpoints

- `GET /api/listings/locations/search?q=...` — database-backed saved location search.
- `GET /api/listings/nearby/providers?lat=...&lng=...&radiusKm=...` — geospatial provider discovery.
- `GET /api/providers/:providerId/packages` — complete public package catalogue for one approved provider.
- Existing `POST/PATCH /api/listings` — create/update package with `location.geo.coordinates`.

## Seed reset

`npm run seed` in `server/` intentionally deletes all documents from all GoWander collections before inserting the demo users, approved providers, pending application, packages, booking, review, favorite and notifications. This is destructive and should only be used with a development/demo database. It must not be run against production data.

## Search boundary without Google/other geocoding APIs

Location text search is backed by cities/areas attached to existing published package records. It does not geocode every arbitrary place name typed by a traveler. The map itself lets the traveler select any point on the real OpenStreetMap basemap, and the radius search then uses that coordinate against MongoDB package records. Map tiles require internet access and the OpenStreetMap tile usage policy applies.
