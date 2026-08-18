# Contributing to CulturePulse

This is a portfolio monorepo, but it is structured like something a small team could ship.

## Dev loop

```bash
npm install
npm run dev
```

- API: `services/api`
- Jobs: `services/jobs`
- Web map: `web/app`
- Admin: `web/admin-panel`
- Android: open `apps/android` in Android Studio

## Conventions

- **Domain words stay consistent** — pulse, scene, vibe, reflection. Don't rename them to “event” in new UI.
- **No secrets in git** — `.env` is gitignored. Copy `.env.example`.
- **API errors are sentences** — `{ "error": "This pulse is at capacity." }` not `{ "code": 409 }`.
- **Fuzzy location is server-side** — never send a raw home pin to an un-RSVP'd client.

## Adding a vibe tag

1. Seed it in `services/api/src/data/seed.ts` **or** add it live in the admin console.
2. Use the slug in pulse `vibeTags`.
3. The map filters and Android chips read from `/tags`.

## Tests worth adding next

- Haversine + fuzzy jitter unit tests
- RSVP capacity race
- Recommendation ranking snapshot

PRs that teach the product (a new scene, a better empty state, a real PostGIS adapter) beat drive-by refactors.
