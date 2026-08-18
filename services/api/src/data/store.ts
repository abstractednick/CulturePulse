import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSeed } from "./seed.js";
import type { Db, Pulse, User } from "../types.js";
import { distanceKm, fuzzyCoordinate } from "../lib/geo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, "../../data/db.json");

function nid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function publicUser(u: User) {
  const { password: _pw, ...rest } = u;
  return rest;
}

class Store {
  db: Db;

  constructor() {
    this.db = this.load();
    this.tickStatuses();
  }

  load(): Db {
    try {
      if (fs.existsSync(DATA_PATH)) {
        return JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as Db;
      }
    } catch {
      /* fall through to seed */
    }
    const seeded = createSeed();
    this.persist(seeded);
    return seeded;
  }

  persist(db: Db = this.db) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2));
  }

  reset() {
    this.db = createSeed();
    this.persist();
    return this.db;
  }

  tickStatuses() {
    const now = Date.now();
    let dirty = false;
    for (const p of this.db.pulses) {
      if (p.status === "cancelled") continue;
      const start = Date.parse(p.startAt);
      const end = Date.parse(p.endAt);
      let next = p.status;
      if (now >= end) next = "finished";
      else if (now >= start) next = "live";
      else next = "upcoming";
      if (next !== p.status) {
        p.status = next;
        dirty = true;
      }
    }
    if (dirty) this.persist();
  }

  login(email: string, password: string) {
    const user = this.db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    return user ?? null;
  }

  register(input: {
    email: string;
    password: string;
    displayName: string;
    pronouns?: string;
  }) {
    if (this.db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("That email is already pulsing here.");
    }
    const user: User = {
      id: nid("u"),
      email: input.email,
      password: input.password,
      displayName: input.displayName,
      pronouns: input.pronouns || "they/them",
      avatarUrl: `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(input.displayName)}&backgroundColor=1c1c28`,
      bio: "",
      role: "member",
      locationPrecision: "fuzzy",
      showAttendancePublicly: true,
      createdAt: new Date().toISOString(),
    };
    this.db.users.push(user);
    this.persist();
    return user;
  }

  sanitizePulse(pulse: Pulse, viewerId?: string) {
    const host = this.db.users.find((u) => u.id === pulse.hostId);
    const scene = pulse.sceneId ? this.db.scenes.find((s) => s.id === pulse.sceneId) : null;
    const rsvp = viewerId
      ? this.db.rsvps.find((r) => r.pulseId === pulse.id && r.userId === viewerId)
      : undefined;
    const favorited = viewerId
      ? this.db.favorites.some((f) => f.pulseId === pulse.id && f.userId === viewerId)
      : false;

    const canSeeExact =
      pulse.fuzzyRadiusMeters === 0 ||
      rsvp?.status === "going" ||
      viewerId === pulse.hostId;

    const coords = canSeeExact
      ? { lat: pulse.lat, lng: pulse.lng, precise: true }
      : {
          ...fuzzyCoordinate(pulse.lat, pulse.lng, pulse.fuzzyRadiusMeters, pulse.id),
          precise: false,
        };

    const attendees = this.db.rsvps
      .filter((r) => r.pulseId === pulse.id && r.status === "going")
      .map((r) => {
        const u = this.db.users.find((x) => x.id === r.userId);
        if (!u) return null;
        if (r.status === "anonymous" || !u.showAttendancePublicly) {
          return { id: "anon", displayName: "Someone in the scene", anonymous: true };
        }
        return {
          id: u.id,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          pronouns: u.pronouns,
          anonymous: false,
        };
      })
      .filter(Boolean);

    const reflections = this.db.reflections
      .filter((r) => r.pulseId === pulse.id)
      .map((r) => {
        const u = this.db.users.find((x) => x.id === r.userId);
        return { ...r, author: u ? { displayName: u.displayName, avatarUrl: u.avatarUrl } : null };
      });

    return {
      ...pulse,
      ...coords,
      host: host ? publicUser(host) : null,
      scene: scene ?? null,
      myRsvp: rsvp?.status ?? null,
      favorited,
      attendees,
      reflections,
      spotsLeft: Math.max(0, pulse.capacity - pulse.attendeeCount),
    };
  }

  searchPulses(q: {
    lat?: number;
    lng?: number;
    radiusKm?: number;
    vibe?: string[];
    access?: string[];
    window?: "now" | "today" | "weekend" | "all";
    status?: string;
    q?: string;
    viewerId?: string;
  }) {
    this.tickStatuses();
    const now = Date.now();
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);
    const day = new Date().getDay();
    const daysUntilSat = (6 - day + 7) % 7;
    const weekendStart = new Date();
    weekendStart.setDate(weekendStart.getDate() + daysUntilSat);
    weekendStart.setHours(0, 0, 0, 0);
    const weekendEnd = new Date(weekendStart);
    weekendEnd.setDate(weekendEnd.getDate() + 2);

    return this.db.pulses
      .filter((p) => {
        if (q.status && p.status !== q.status) return false;
        if (q.window === "now" && p.status !== "live") return false;
        if (q.window === "today") {
          const s = Date.parse(p.startAt);
          if (s > endToday.getTime() || Date.parse(p.endAt) < now - 2 * 3600000) return false;
        }
        if (q.window === "weekend") {
          const s = Date.parse(p.startAt);
          if (s < weekendStart.getTime() || s > weekendEnd.getTime()) return false;
        }
        if (q.vibe?.length && !q.vibe.every((t) => p.vibeTags.includes(t))) return false;
        if (q.access?.length && !q.access.every((t) => p.accessibilityTags.includes(t))) return false;
        if (q.q) {
          const hay = `${p.title} ${p.description} ${p.placeName}`.toLowerCase();
          if (!hay.includes(q.q.toLowerCase())) return false;
        }
        return true;
      })
      .map((p) => {
        const dist =
          q.lat != null && q.lng != null ? distanceKm(q.lat, q.lng, p.lat, p.lng) : null;
        return { pulse: p, dist };
      })
      .filter((x) => (q.radiusKm != null && x.dist != null ? x.dist <= q.radiusKm : true))
      .sort((a, b) => {
        if (a.pulse.status === "live" && b.pulse.status !== "live") return -1;
        if (b.pulse.status === "live" && a.pulse.status !== "live") return 1;
        if (a.dist != null && b.dist != null) return a.dist - b.dist;
        return Date.parse(a.pulse.startAt) - Date.parse(b.pulse.startAt);
      })
      .map((x) => ({
        ...this.sanitizePulse(x.pulse, q.viewerId),
        distanceKm: x.dist != null ? Math.round(x.dist * 10) / 10 : null,
      }));
  }

  recommendations(userId: string, lat: number, lng: number) {
    const attended = this.db.rsvps.filter((r) => r.userId === userId);
    const tagScores = new Map<string, number>();
    for (const r of attended) {
      const p = this.db.pulses.find((x) => x.id === r.pulseId);
      p?.vibeTags.forEach((t) => tagScores.set(t, (tagScores.get(t) ?? 0) + (r.status === "going" ? 2 : 1)));
    }
    const followed = new Set(this.db.follows.filter((f) => f.userId === userId).map((f) => f.sceneId));

    return this.searchPulses({ lat, lng, radiusKm: 12, viewerId: userId, window: "all" })
      .filter((p) => p.status === "upcoming" || p.status === "live")
      .map((p) => {
        let score = 0;
        p.vibeTags.forEach((t) => (score += tagScores.get(t) ?? 0));
        if (p.sceneId && followed.has(p.sceneId)) score += 5;
        if (p.status === "live") score += 3;
        if (typeof p.distanceKm === "number") score += Math.max(0, 4 - p.distanceKm);
        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  analytics() {
    const byTag: Record<string, number> = {};
    const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
    for (const p of this.db.pulses) {
      p.vibeTags.forEach((t) => (byTag[t] = (byTag[t] ?? 0) + 1));
      byHour[new Date(p.startAt).getHours()].count += 1;
    }
    const rsvpTotal = this.db.rsvps.length;
    const going = this.db.rsvps.filter((r) => r.status === "going").length;
    return {
      users: this.db.users.length,
      scenes: this.db.scenes.length,
      pulses: this.db.pulses.length,
      live: this.db.pulses.filter((p) => p.status === "live").length,
      rsvps: rsvpTotal,
      going,
      conversion: rsvpTotal ? Math.round((going / rsvpTotal) * 100) : 0,
      followers: this.db.follows.length,
      reflections: this.db.reflections.length,
      openReports: this.db.reports.filter((r) => r.status === "open").length,
      byTag,
      byHour,
      retention: [
        { cohort: "Week -4", retained: 42, started: 60 },
        { cohort: "Week -3", retained: 51, started: 72 },
        { cohort: "Week -2", retained: 63, started: 80 },
        { cohort: "Week -1", retained: 71, started: 88 },
      ],
    };
  }
}

export const store = new Store();

if (process.argv[1]?.includes("seed.ts")) {
  store.reset();
  console.log("CulturePulse seed written → services/api/data/db.json");
}
