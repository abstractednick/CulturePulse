# Safety & privacy

CulturePulse's bet: Gen Z will show up offline if the **map doesn't betray them**.

## Product rules (enforced in API, not just copy)

1. **Fuzzy pins** — `fuzzyRadiusMeters` jitter is computed server-side with a stable seed. The client never receives the true lat/lng until the viewer is `going` or is the host.
2. **Anonymous attendance** — RSVP status `anonymous` occupies capacity without publishing a name.
3. **Attendance visibility** — `showAttendancePublicly` on the profile. Off → the person appears as a scene-mate, not a byline.
4. **Reports** — any signed-in user can flag a pulse, scene, or person. Admins hide pulses (`status: cancelled`) from the moderation queue.
5. **Blocks** — stored as a pair; extend the search filter to drop blocked hosts in production.
6. **Host updates** — last-minute location changes notify RSVPs so people don't walk into a dark wrong corner.

## Guidelines we show in-app

See the web client's `/safety` route. Short version:

- Private homes and queer spaces should ship with a fuzzy radius.
- Capacity is a promise.
- Rain plan and lighting belong in `safetyNotes`.
- Commercial stadium shows are out of scope.

## What this is not

This repository is a **portfolio-grade implementation**. It uses demo passwords, an in-memory JSON store, and no encryption at rest. Do not point it at real users without:

- hashed passwords (Argon2id)
- signed short-lived access tokens + rotating refresh
- rate limits on auth and reports
- audit log for admin hide/ban
- a real push channel (FCM) instead of in-app JSON notifications
