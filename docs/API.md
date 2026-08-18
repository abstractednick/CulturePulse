# HTTP API

Base URL (local): `http://localhost:4000`

All JSON. Authenticated routes send:

```http
Authorization: Bearer <jwt>
```

Tokens last 7 days. Demo secret is in `.env.example` — rotate it before any real deploy.

## Health

```http
GET /health
```

```json
{ "ok": true, "service": "culturepulse-api", "city": "Ahmedabad", "pulses": 8 }
```

## Auth

| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| POST | `/auth/register` | no | `{ email, password, displayName, pronouns? }` |
| POST | `/auth/login` | no | `{ email, password }` |
| GET | `/me` | yes | — |
| PATCH | `/me` | yes | profile + privacy fields |

Demo accounts (password `pulse123`):

| Email | Role |
| --- | --- |
| `maya@culturepulse.app` | member |
| `arjun@culturepulse.app` | host |
| `zara@culturepulse.app` | host |
| `admin@culturepulse.app` | admin |

## Discovery

```http
GET /pulses?lat=23.0225&lng=72.5714&radiusKm=12&vibe=chill,quiet&access=wheelchair-friendly&window=today&q=study
```

`window`: `all` | `now` | `today` | `weekend`

Response pulses include:

- `precise: false` and jittered `lat/lng` when `fuzzyRadiusMeters > 0` and the viewer is not going / not the host
- `distanceKm`, `spotsLeft`, `myRsvp`, `scene`, `host`

```http
GET /pulses/recommended?lat=&lng=
GET /pulses/:id
POST /pulses
PATCH /pulses/:id          # host or admin — status, lastMinuteUpdate
```

## RSVP & social

```http
POST   /pulses/:id/rsvp          { "status": "going" | "interested" | "anonymous" }
DELETE /pulses/:id/rsvp
POST   /pulses/:id/favorite
POST   /pulses/:id/reflections   { "emoji", "sentence", "safetyRating": 1-5 }
```

Anonymous RSVP still occupies a seat. The public attendee list shows “Someone in the scene”.

## Scenes

```http
GET  /scenes
GET  /scenes/:slug
POST /scenes/:id/follow
```

## Safety

```http
POST /reports    { targetType, targetId, reason, details }
POST /blocks     { blockedId }
GET  /notifications
POST /notifications/read
```

## Catalog

```http
GET /tags
GET /templates
GET /flags
```

## Admin (role = admin)

```http
GET   /admin/overview
GET   /admin/reports
PATCH /admin/reports/:id     { status, action?: "hide-pulse" }
GET   /admin/users
PATCH /admin/tags
DELETE /admin/tags/:slug
POST  /admin/templates
PATCH /admin/flags/:key
POST  /admin/reset
```

## Internal jobs

```http
POST /internal/jobs/expire
POST /internal/jobs/reminders
```

## Error shape

```json
{ "error": "Human-readable sentence." }
```

Validation uses Zod. Geo uses Haversine — swap in PostGIS `ST_DWithin` without changing query params.
