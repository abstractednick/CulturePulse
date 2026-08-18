# Demo script (5 minutes)

CulturePulse is designed so a recruiter can **feel the product**, not just clone it.

## 0. Boot

```bash
git clone https://github.com/abstractednick/CulturePulse.git
cd CulturePulse
npm install
npm run dev
```

Open:

| Surface | URL |
| --- | --- |
| Map client | http://localhost:5173 |
| Admin | http://localhost:5174 |
| API health | http://localhost:4000/health |

## 1. Discover like Maya (2 min)

1. Sign in as **maya@culturepulse.app** / `pulse123` (or click the Maya chip).
2. On the map, find the **pink live pin** — *Riverfront night roll*.
3. Open filters → **Live now**. The feed should collapse to what's actually happening.
4. Open the pulse. Read the last-minute update (“Moved 80m south”). That's host tooling, not a blog post.
5. RSVP **going**. If a pulse is fuzzy, the pin snaps to the real coordinate only after this.

## 2. Host like Arjun (1 min)

1. Sign in as **arjun@culturepulse.app**.
2. Open the live skate pulse. Use **Host tools** → send an update. Notifications fan out to RSVPs.
3. Hit **Host a pulse**, pick the **Study circle** template, publish. It appears on the map immediately.

## 3. Trust & safety (1 min)

1. Open http://localhost:5174 as **admin@culturepulse.app**.
2. Overview: tag mix, start-hour curve, retention cohorts.
3. Moderation: the seeded location-accuracy report. Dismiss or hide.
4. Feature flags: toggle `anonymous_rsvp` — that's how experiments ship without an app store wait.

## 4. Talking points if someone asks “why not Meetup?”

- Meetup optimizes for **organizations**. CulturePulse optimizes for **tonight**.
- Fuzzy pins + anonymous RSVP are first-class, not settings buried in a legal page.
- Reflections are one sentence, not a five-star review bomb.
- Scenes are followable crews, not Facebook groups with a map glued on.

## Reset

Admin console → People → **Restore demo seed**, or:

```bash
npm run seed
```
