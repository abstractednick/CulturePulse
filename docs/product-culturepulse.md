# CulturePulse: Local Micro-Scenes & Pop-Up Events for Gen Z

CulturePulse is a map-first Android app that surfaces small, youth-led events and "micro-scenes" around a user: pop-up gigs, skate meetups, study circles, open mics, creator collabs, and more.[web:153][web:156][web:158]

Instead of big, polished events, CulturePulse focuses on authentic, grassroots gatherings that help Gen Z find "their people" nearby.

This document is the high-level product, architecture, and directory layout spec so Cursor (and other tools) can scaffold the entire project—mobile app, backend, and admin panel—in a single monorepo root.

---

## 1. GitHub Description (≤ 350 characters)

CulturePulse is a map-first app for Gen Z that surfaces local micro-scenes and pop-up events—skate meetups, study circles, open mics, creator collabs—and makes it easy to discover, host, and attend authentic, youth-led gatherings in your city.

---

## 2. Concept & User Value

### 2.1 Problem

Gen Z spends lots of time in global feeds (TikTok, Reels), but still struggles to find **local, authentic communities**—small gigs, creative meetups, safe study spaces—without digging through scattered social posts.[web:145][web:148][web:153][web:156][web:158]

Existing event apps tend to:
- Highlight large, polished events or commercial venues.
- Require heavy setup and marketing.
- Feel formal, not like cozy micro-scenes.

### 2.2 CulturePulse concept

CulturePulse reframes local events as:
- "Micro-scenes": small gatherings anchored in specific vibes (e.g., chill skate, quiet study, improv jam).
- Easy-to-create pulses on a map (quick, light-weight posts).
- A way for Gen Z to find safe, relevant spaces offline.

Core idea: **"Find your scene, not just events"**.

---

## 3. Core Features

### 3.1 Map-First Scene Discovery

- Main screen is a map with pins representing upcoming or live micro-scenes.
- Each pin shows scene type (icon) and vibe tags (e.g., chill, loud, study, queer-friendly).

### 3.2 Pulses (Pop-Up Events)

- Hosts can create "pulses" with:
  - Title and short description.
  - Time range (start/end).
  - Location (precise or fuzzy, for privacy).
  - Capacity and accessibility details.
  - Vibe and safety tags.

### 3.3 Lightweight Host Tools

- Hosts can:
  - See RSVPs and "interested" counts.
  - Send last-minute updates (e.g., "moved inside due to rain").
  - Mark pulses as live, started, or finished.

### 3.4 Safe Discovery & Filters

- Users can filter scenes by:
  - Distance.
  - Time (today, this weekend).
  - Vibe tags and accessibility (e.g., quiet, wheelchair-friendly, sober space).

### 3.5 Micro-Communities & Profiles

- Scene hosts can create micro-community profiles (e.g., "Ahmedabad Night Skaters").
- Users can follow scenes to get notified on new pulses.

### 3.6 Reflections & Story Moments

- After attending, users can leave short vibe reviews (emoji + 1 sentence).
- Hosts see feedback to refine future pulses.

---

## 4. Architecture Overview

CulturePulse uses a **monorepo** with clearly separated modules:

```text
culturepulse/
  apps/
    android/          # Native Android app (Kotlin + Jetpack Compose)
  services/
    api/              # Backend API (events, communities, auth, feed)
    jobs/             # Background workers (reminders, expiry, recommendations)
  web/
    admin-panel/      # Web admin UI (moderation, analytics, content management)
  docs/
    product-culturepulse.md
```

### 4.1 Mobile app (Android)

- Kotlin + Jetpack Compose.
- Uses Jetpack architecture components (ViewModel, Room, Navigation).
- Integrates with backend via REST/JSON or GraphQL.
- Uses location APIs and maps (Google Maps or Mapbox) for scene display.

### 4.2 Backend API service

- Stateless HTTP API for:
  - User accounts & auth.
  - Communities & scenes.
  - Pulses (events).
  - RSVPs and attendance.
  - Recommendations and feeds.

Backend tech options:
- Kotlin Ktor.
- Node.js/Express or NestJS.

### 4.3 Background jobs service

- Scheduled tasks to:
  - Invalidate expired pulses.
  - Send reminders and last-minute updates.
  - Generate suggestion feeds.

### 4.4 Web admin panel

- Web app for:
  - Moderation (reports, abusive content, safety issues).
  - Analytics (usage, scene categories, retention).
  - Content management (global vibe tags, templates).
  - Feature flags (experiments, new surfaces).

Tech stack options:
- React + TypeScript.
- Next.js.

---

## 5. Detailed Requirements

### 5.1 Android App Requirements

1. **Authentication & Identity**
   - Phone/email-based auth with optional social login.
   - Profiles with display name, avatar, pronouns.
   - Optional privacy controls for showing attendance publicly.

2. **Location & Map**
   - Permission flows for location access.
   - Map view with clusters and pins for pulses.
   - Fuzzy location options for safety (approximate radius).

3. **Pulse Creation & Management**
   - Host flow for creating pulses:
     - Title, description.
     - Date/time (start/end).
     - Location.
     - Capacity.
     - Vibe tags and accessibility.
   - Edit/cancel pulses.
   - Mark as live/finished.

4. **Discovery & Filters**
   - Home map with filter bar.
   - List view of pulses nearby.
   - Saved/followed scenes and favorites.

5. **RSVP & Attendance**
   - RSVP / "interested" actions.
   - Attendee count surfaced to host.
   - Option for anonymous attendance (for sensitive scenes).

6. **Scene Profiles**
   - Profiles representing recurring micro-scenes.
   - Host tools to manage description, tags, and social links.

7. **Notifications**
   - Push notifications via FCM:
     - Upcoming pulses.
     - Followed scenes posting new events.
     - Last-minute changes.

8. **Reflections & Feedback**
   - Post-event feedback flow (quick emojis + vibe sentence).
   - Simple rating on safety/comfort.

9. **Settings & Safety**
   - Location precision controls.
   - Block/report options.
   - Clear safety guidelines.

### 5.2 Backend API Requirements

1. **Auth & Accounts**
   - JWT-based auth.
   - OAuth for social login.

2. **Scenes & Pulses**
   - CRUD APIs for scenes and pulses.
   - Associations between scenes, pulses, and hosts.

3. **Geo & Search**
   - Geo-indexed queries (find pulses near a coordinate).
   - Filters by tags, time, accessibility.

4. **RSVP & Attendance**
   - Endpoints to create/update RSVPs.
   - Summaries for hosts.

5. **Recommendations**
   - Simple matching based on past attendance, tags, and proximity.[web:150][web:156][web:158]

6. **Notifications & Messaging**
   - Notification dispatch for reminders and updates.

7. **Moderation & Safety**
   - API for reporting content.
   - Tools to mark scenes/pulses as verified or flagged.

### 5.3 Admin Panel Requirements

1. **User & Scene Overview**
   - Dashboard showing counts, growth, active scenes.

2. **Pulse Moderation**
   - Queue of reported pulses and scenes.
   - Actions: warn host, hide pulse, ban user.

3. **Tag & Template Management**
   - Manage global vibe tags and accessibility labels.
   - Create templates for common pulse types (e.g., "study circle", "open mic").

4. **Feature Flags & Experiments**
   - Toggle features by region or cohort.

5. **Analytics**
   - Charts for scene categories, time-of-day distribution, retention cohorts.

---

## 6. Suggested Directory Layout for Cursor

```text
culturepulse/
  apps/
    android/
      app/
        src/
          main/
          debug/
      build.gradle.kts
  services/
    api/
      src/
        main/
        test/
      build.gradle.kts
    jobs/
      src/
        main/
        test/
      build.gradle.kts
  web/
    admin-panel/
      src/
      package.json
  docs/
    product-culturepulse.md
```

Cursor instructions:
- Generate Android app under `apps/android/app` using Kotlin + Jetpack Compose.
- Generate backend API under `services/api` using chosen stack.
- Generate jobs service under `services/jobs`.
- Generate admin panel under `web/admin-panel` using React or Next.js.

---

## 7. Tech Stack Summary

- **Mobile:** Kotlin + Jetpack Compose, Location APIs, Maps SDK, Jetpack (Room, WorkManager, Navigation), FCM for push.
- **Backend:** Kotlin Ktor or Node.js/Express with JWT, Geo queries (PostgreSQL + PostGIS or MongoDB with geo indices).
- **Admin Panel:** React/Next.js + a component library (Tailwind, Material UI, or custom).
- **Infra:** Docker-based dev setup, ready for cloud deployment (e.g., AWS, GCP).

---

CulturePulse is designed as a single-root monorepo project so mobile, backend, and admin panel can be maintained together while using different tech stacks.
