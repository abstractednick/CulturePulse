import express from "express";
import cors from "cors";
import { z } from "zod";
import { store } from "./data/store.js";
import { signToken } from "./lib/jwt.js";
import { optionalAuth, requireAuth, requireAdmin, type AuthedRequest } from "./middleware/auth.js";
import type { Pulse, PulseStatus, RsvpStatus } from "./types.js";

function nid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function publicUser(id: string) {
  const u = store.db.users.find((x) => x.id === id);
  if (!u) return null;
  const { password: _p, ...rest } = u;
  return rest;
}

export function createApp() {
  const app = express();
  const origins = (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://localhost:5174")
    .split(",")
    .map((s) => s.trim());

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || origins.includes(origin) || origin.startsWith("http://localhost")) cb(null, true);
        else cb(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(optionalAuth);

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "culturepulse-api",
      city: process.env.CITY_NAME ?? "Ahmedabad",
      pulses: store.db.pulses.length,
      time: new Date().toISOString(),
    });
  });

  app.post("/auth/login", (req, res) => {
    const parsed = z.object({ email: z.string().email(), password: z.string().min(4) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Email and password required." });
    const user = store.login(parsed.data.email, parsed.data.password);
    if (!user) return res.status(401).json({ error: "Those credentials don't match a pulse." });
    res.json({ token: signToken(user), user: publicUser(user.id) });
  });

  app.post("/auth/register", (req, res) => {
    const parsed = z
      .object({
        email: z.string().email(),
        password: z.string().min(6),
        displayName: z.string().min(2),
        pronouns: z.string().optional(),
      })
      .safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Check name, email, and a 6+ character password." });
    try {
      const user = store.register(parsed.data);
      res.status(201).json({ token: signToken(user), user: publicUser(user.id) });
    } catch (e) {
      res.status(409).json({ error: (e as Error).message });
    }
  });

  app.get("/me", requireAuth, (req: AuthedRequest, res) => {
    res.json({
      user: publicUser(req.userId!),
      follows: store.db.follows.filter((f) => f.userId === req.userId).map((f) => f.sceneId),
      favorites: store.db.favorites.filter((f) => f.userId === req.userId).map((f) => f.pulseId),
      rsvps: store.db.rsvps.filter((r) => r.userId === req.userId),
    });
  });

  app.patch("/me", requireAuth, (req: AuthedRequest, res) => {
    const user = store.db.users.find((u) => u.id === req.userId);
    if (!user) return res.status(404).json({ error: "Not found" });
    const body = req.body as Partial<typeof user>;
    if (body.displayName) user.displayName = body.displayName;
    if (body.pronouns) user.pronouns = body.pronouns;
    if (body.bio !== undefined) user.bio = body.bio;
    if (body.locationPrecision) user.locationPrecision = body.locationPrecision;
    if (typeof body.showAttendancePublicly === "boolean") user.showAttendancePublicly = body.showAttendancePublicly;
    store.persist();
    res.json({ user: publicUser(user.id) });
  });

  app.get("/tags", (_req, res) => res.json({ tags: store.db.tags }));
  app.get("/templates", (_req, res) => res.json({ templates: store.db.templates }));
  app.get("/flags", (_req, res) => res.json({ flags: store.db.flags }));

  app.get("/pulses", (req: AuthedRequest, res) => {
    const vibe = typeof req.query.vibe === "string" ? req.query.vibe.split(",").filter(Boolean) : [];
    const access = typeof req.query.access === "string" ? req.query.access.split(",").filter(Boolean) : [];
    const lat = req.query.lat ? Number(req.query.lat) : 23.0225;
    const lng = req.query.lng ? Number(req.query.lng) : 72.5714;
    const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : 15;
    const pulses = store.searchPulses({
      lat,
      lng,
      radiusKm,
      vibe,
      access,
      window: (req.query.window as "now" | "today" | "weekend" | "all") || "all",
      status: req.query.status as string | undefined,
      q: req.query.q as string | undefined,
      viewerId: req.userId,
    });
    res.json({ pulses, center: { lat, lng } });
  });

  app.get("/pulses/recommended", requireAuth, (req: AuthedRequest, res) => {
    const lat = req.query.lat ? Number(req.query.lat) : 23.0225;
    const lng = req.query.lng ? Number(req.query.lng) : 72.5714;
    res.json({ pulses: store.recommendations(req.userId!, lat, lng) });
  });

  app.get("/pulses/:id", (req: AuthedRequest, res) => {
    const pulse = store.db.pulses.find((p) => p.id === req.params.id);
    if (!pulse) return res.status(404).json({ error: "Pulse not found." });
    res.json({ pulse: store.sanitizePulse(pulse, req.userId) });
  });

  app.post("/pulses", requireAuth, (req: AuthedRequest, res) => {
    const parsed = z
      .object({
        title: z.string().min(3),
        description: z.string().min(8),
        startAt: z.string(),
        endAt: z.string(),
        lat: z.number(),
        lng: z.number(),
        placeName: z.string().min(2),
        fuzzyRadiusMeters: z.number().min(0).default(0),
        capacity: z.number().min(2).max(200),
        vibeTags: z.array(z.string()).default([]),
        accessibilityTags: z.array(z.string()).default([]),
        safetyNotes: z.string().default(""),
        sceneId: z.string().nullable().optional(),
      })
      .safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Pulse is missing a required field.", issues: parsed.error.issues });
    const pulse: Pulse = {
      id: nid("p"),
      sceneId: parsed.data.sceneId ?? null,
      hostId: req.userId!,
      title: parsed.data.title,
      description: parsed.data.description,
      startAt: parsed.data.startAt,
      endAt: parsed.data.endAt,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      placeName: parsed.data.placeName,
      fuzzyRadiusMeters: parsed.data.fuzzyRadiusMeters,
      capacity: parsed.data.capacity,
      vibeTags: parsed.data.vibeTags,
      accessibilityTags: parsed.data.accessibilityTags,
      safetyNotes: parsed.data.safetyNotes,
      status: "upcoming",
      attendeeCount: 1,
      interestedCount: 0,
      lastMinuteUpdate: null,
      createdAt: new Date().toISOString(),
    };
    store.db.pulses.unshift(pulse);
    store.db.rsvps.push({
      id: nid("r"),
      pulseId: pulse.id,
      userId: req.userId!,
      status: "going",
      createdAt: pulse.createdAt,
    });
    const host = store.db.users.find((u) => u.id === req.userId);
    if (host && host.role === "member") host.role = "host";
    store.persist();
    res.status(201).json({ pulse: store.sanitizePulse(pulse, req.userId) });
  });

  app.patch("/pulses/:id", requireAuth, (req: AuthedRequest, res) => {
    const pulse = store.db.pulses.find((p) => p.id === req.params.id);
    if (!pulse) return res.status(404).json({ error: "Pulse not found." });
    if (pulse.hostId !== req.userId && req.role !== "admin") {
      return res.status(403).json({ error: "Only the host can edit this pulse." });
    }
    const body = req.body as Partial<Pulse>;
    if (body.title) pulse.title = body.title;
    if (body.description) pulse.description = body.description;
    if (body.status) pulse.status = body.status as PulseStatus;
    if (body.lastMinuteUpdate !== undefined) {
      pulse.lastMinuteUpdate = body.lastMinuteUpdate;
      store.db.rsvps
        .filter((r) => r.pulseId === pulse.id)
        .forEach((r) => {
          store.db.notifications.unshift({
            id: nid("n"),
            userId: r.userId,
            title: `Update · ${pulse.title}`,
            body: body.lastMinuteUpdate || "The host posted a last-minute update.",
            kind: "update",
            read: false,
            createdAt: new Date().toISOString(),
            pulseId: pulse.id,
          });
        });
    }
    store.persist();
    res.json({ pulse: store.sanitizePulse(pulse, req.userId) });
  });

  app.post("/pulses/:id/rsvp", requireAuth, (req: AuthedRequest, res) => {
    const pulse = store.db.pulses.find((p) => p.id === req.params.id);
    if (!pulse) return res.status(404).json({ error: "Pulse not found." });
    const status = (req.body?.status as RsvpStatus) || "going";
    if (!["going", "interested", "anonymous"].includes(status)) {
      return res.status(400).json({ error: "RSVP must be going, interested, or anonymous." });
    }
    if (status === "going" && pulse.attendeeCount >= pulse.capacity) {
      return res.status(409).json({ error: "This pulse is at capacity." });
    }
    const existing = store.db.rsvps.find((r) => r.pulseId === pulse.id && r.userId === req.userId);
    if (existing) {
      existing.status = status;
    } else {
      store.db.rsvps.push({
        id: nid("r"),
        pulseId: pulse.id,
        userId: req.userId!,
        status,
        createdAt: new Date().toISOString(),
      });
    }
    pulse.attendeeCount = store.db.rsvps.filter((r) => r.pulseId === pulse.id && (r.status === "going" || r.status === "anonymous")).length;
    pulse.interestedCount = store.db.rsvps.filter((r) => r.pulseId === pulse.id && r.status === "interested").length;
    store.persist();
    res.json({ pulse: store.sanitizePulse(pulse, req.userId) });
  });

  app.delete("/pulses/:id/rsvp", requireAuth, (req: AuthedRequest, res) => {
    const pulse = store.db.pulses.find((p) => p.id === req.params.id);
    if (!pulse) return res.status(404).json({ error: "Pulse not found." });
    store.db.rsvps = store.db.rsvps.filter((r) => !(r.pulseId === pulse.id && r.userId === req.userId));
    pulse.attendeeCount = store.db.rsvps.filter((r) => r.pulseId === pulse.id && (r.status === "going" || r.status === "anonymous")).length;
    pulse.interestedCount = store.db.rsvps.filter((r) => r.pulseId === pulse.id && r.status === "interested").length;
    store.persist();
    res.json({ pulse: store.sanitizePulse(pulse, req.userId) });
  });

  app.post("/pulses/:id/favorite", requireAuth, (req: AuthedRequest, res) => {
    const exists = store.db.favorites.find((f) => f.pulseId === req.params.id && f.userId === req.userId);
    if (exists) {
      store.db.favorites = store.db.favorites.filter((f) => f !== exists);
    } else {
      store.db.favorites.push({
        userId: req.userId!,
        pulseId: req.params.id,
        createdAt: new Date().toISOString(),
      });
    }
    store.persist();
    res.json({ favorited: !exists });
  });

  app.post("/pulses/:id/reflections", requireAuth, (req: AuthedRequest, res) => {
    const pulse = store.db.pulses.find((p) => p.id === req.params.id);
    if (!pulse) return res.status(404).json({ error: "Pulse not found." });
    const parsed = z
      .object({
        emoji: z.string().min(1),
        sentence: z.string().min(4).max(160),
        safetyRating: z.number().min(1).max(5),
      })
      .safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Leave an emoji, a short sentence, and a safety rating." });
    const reflection = {
      id: nid("rf"),
      pulseId: pulse.id,
      userId: req.userId!,
      ...parsed.data,
      createdAt: new Date().toISOString(),
    };
    store.db.reflections.unshift(reflection);
    store.persist();
    res.status(201).json({ pulse: store.sanitizePulse(pulse, req.userId) });
  });

  app.get("/scenes", (req: AuthedRequest, res) => {
    const scenes = store.db.scenes.map((s) => ({
      ...s,
      host: publicUser(s.hostId),
      following: req.userId ? store.db.follows.some((f) => f.userId === req.userId && f.sceneId === s.id) : false,
      upcoming: store.db.pulses.filter((p) => p.sceneId === s.id && p.status !== "finished" && p.status !== "cancelled").length,
    }));
    res.json({ scenes });
  });

  app.get("/scenes/:slug", (req: AuthedRequest, res) => {
    const scene = store.db.scenes.find((s) => s.slug === req.params.slug || s.id === req.params.slug);
    if (!scene) return res.status(404).json({ error: "Scene not found." });
    const pulses = store.db.pulses
      .filter((p) => p.sceneId === scene.id)
      .map((p) => store.sanitizePulse(p, req.userId));
    res.json({
      scene: {
        ...scene,
        host: publicUser(scene.hostId),
        following: req.userId
          ? store.db.follows.some((f) => f.userId === req.userId && f.sceneId === scene.id)
          : false,
      },
      pulses,
    });
  });

  app.post("/scenes/:id/follow", requireAuth, (req: AuthedRequest, res) => {
    const scene = store.db.scenes.find((s) => s.id === req.params.id || s.slug === req.params.id);
    if (!scene) return res.status(404).json({ error: "Scene not found." });
    const existing = store.db.follows.find((f) => f.userId === req.userId && f.sceneId === scene.id);
    if (existing) {
      store.db.follows = store.db.follows.filter((f) => f !== existing);
      scene.followerCount = Math.max(0, scene.followerCount - 1);
    } else {
      store.db.follows.push({ userId: req.userId!, sceneId: scene.id, createdAt: new Date().toISOString() });
      scene.followerCount += 1;
      store.db.notifications.unshift({
        id: nid("n"),
        userId: scene.hostId,
        title: `New follower on ${scene.name}`,
        body: `${publicUser(req.userId!)?.displayName} is following your scene.`,
        kind: "follow",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    store.persist();
    res.json({ following: !existing, followerCount: scene.followerCount });
  });

  app.get("/notifications", requireAuth, (req: AuthedRequest, res) => {
    const items = store.db.notifications.filter((n) => n.userId === req.userId);
    res.json({ notifications: items });
  });

  app.post("/notifications/read", requireAuth, (req: AuthedRequest, res) => {
    store.db.notifications
      .filter((n) => n.userId === req.userId)
      .forEach((n) => (n.read = true));
    store.persist();
    res.json({ ok: true });
  });

  app.post("/reports", requireAuth, (req: AuthedRequest, res) => {
    const parsed = z
      .object({
        targetType: z.enum(["pulse", "scene", "user"]),
        targetId: z.string(),
        reason: z.string().min(3),
        details: z.string().default(""),
      })
      .safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Tell us what to review." });
    const report = {
      id: nid("rp"),
      reporterId: req.userId!,
      status: "open" as const,
      createdAt: new Date().toISOString(),
      ...parsed.data,
    };
    store.db.reports.unshift(report);
    store.persist();
    res.status(201).json({ report });
  });

  app.post("/blocks", requireAuth, (req: AuthedRequest, res) => {
    const blockedId = String(req.body?.blockedId ?? "");
    if (!blockedId) return res.status(400).json({ error: "blockedId required" });
    store.db.blocks.push({ blockerId: req.userId!, blockedId });
    store.persist();
    res.json({ ok: true });
  });

  /* ── Admin ── */
  app.get("/admin/overview", requireAuth, requireAdmin, (_req, res) => {
    res.json({ analytics: store.analytics(), flags: store.db.flags });
  });

  app.get("/admin/reports", requireAuth, requireAdmin, (_req, res) => {
    const reports = store.db.reports.map((r) => ({
      ...r,
      reporter: publicUser(r.reporterId),
    }));
    res.json({ reports });
  });

  app.patch("/admin/reports/:id", requireAuth, requireAdmin, (req, res) => {
    const report = store.db.reports.find((r) => r.id === req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found." });
    if (req.body.status) report.status = req.body.status;
    if (req.body.action === "hide-pulse") {
      const p = store.db.pulses.find((x) => x.id === report.targetId);
      if (p) p.status = "cancelled";
    }
    store.persist();
    res.json({ report });
  });

  app.get("/admin/users", requireAuth, requireAdmin, (_req, res) => {
    res.json({ users: store.db.users.map((u) => publicUser(u.id)) });
  });

  app.patch("/admin/tags", requireAuth, requireAdmin, (req, res) => {
    const parsed = z
      .object({
        slug: z.string(),
        label: z.string(),
        kind: z.enum(["vibe", "accessibility"]),
        color: z.string(),
        icon: z.string().default("tag"),
        description: z.string().default(""),
      })
      .safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid tag" });
    const idx = store.db.tags.findIndex((t) => t.slug === parsed.data.slug);
    if (idx >= 0) store.db.tags[idx] = parsed.data;
    else store.db.tags.push(parsed.data);
    store.persist();
    res.json({ tags: store.db.tags });
  });

  app.delete("/admin/tags/:slug", requireAuth, requireAdmin, (req, res) => {
    store.db.tags = store.db.tags.filter((t) => t.slug !== req.params.slug);
    store.persist();
    res.json({ tags: store.db.tags });
  });

  app.post("/admin/templates", requireAuth, requireAdmin, (req, res) => {
    const t = { id: nid("t"), ...req.body };
    store.db.templates.push(t);
    store.persist();
    res.status(201).json({ templates: store.db.templates });
  });

  app.patch("/admin/flags/:key", requireAuth, requireAdmin, (req, res) => {
    const flag = store.db.flags.find((f) => f.key === req.params.key);
    if (!flag) return res.status(404).json({ error: "Flag not found" });
    if (typeof req.body.enabled === "boolean") flag.enabled = req.body.enabled;
    if (req.body.region) flag.region = req.body.region;
    if (req.body.cohort) flag.cohort = req.body.cohort;
    store.persist();
    res.json({ flags: store.db.flags });
  });

  app.post("/admin/reset", requireAuth, requireAdmin, (_req, res) => {
    store.reset();
    res.json({ ok: true, message: "Seed restored." });
  });

  /* ── Jobs internals ── */
  app.post("/internal/jobs/expire", (req, res) => {
    if (req.headers["x-jobs-key"] !== (process.env.JOBS_KEY ?? "local-jobs")) {
      /* allow local demo without a key */
    }
    store.tickStatuses();
    const expired = store.db.pulses.filter((p) => p.status === "finished").length;
    res.json({ ok: true, finished: expired });
  });

  app.post("/internal/jobs/reminders", (_req, res) => {
    const horizon = Date.now() + 2 * 60 * 60 * 1000;
    let sent = 0;
    for (const rsvp of store.db.rsvps) {
      const pulse = store.db.pulses.find((p) => p.id === rsvp.pulseId);
      if (!pulse || pulse.status !== "upcoming") continue;
      const start = Date.parse(pulse.startAt);
      if (start > Date.now() && start < horizon) {
        const already = store.db.notifications.some(
          (n) => n.userId === rsvp.userId && n.pulseId === pulse.id && n.kind === "reminder"
        );
        if (!already) {
          store.db.notifications.unshift({
            id: nid("n"),
            userId: rsvp.userId,
            title: `${pulse.title} starts soon`,
            body: `${pulse.placeName} · ${pulse.capacity - pulse.attendeeCount} spots left.`,
            kind: "reminder",
            read: false,
            createdAt: new Date().toISOString(),
            pulseId: pulse.id,
          });
          sent += 1;
        }
      }
    }
    store.persist();
    res.json({ ok: true, sent });
  });

  return app;
}
