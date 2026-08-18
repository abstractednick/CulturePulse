import type { Pulse, Scene, Tag, User, Notification } from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const tokenKey = "cp_token";

export function getToken() {
  return localStorage.getItem(tokenKey);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(tokenKey, token);
  else localStorage.removeItem(tokenKey);
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  health: () => req<{ ok: boolean; city: string }>("/health"),
  login: (email: string, password: string) =>
    req<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (body: { email: string; password: string; displayName: string; pronouns?: string }) =>
    req<{ token: string; user: User }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  me: () => req<{ user: User; follows: string[]; favorites: string[]; rsvps: unknown[] }>("/me"),
  patchMe: (body: Partial<User>) =>
    req<{ user: User }>("/me", { method: "PATCH", body: JSON.stringify(body) }),
  tags: () => req<{ tags: Tag[] }>("/tags"),
  pulses: (q: Record<string, string | number | undefined> = {}) => {
    const sp = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => {
      if (v !== undefined && v !== "") sp.set(k, String(v));
    });
    return req<{ pulses: Pulse[]; center: { lat: number; lng: number } }>(`/pulses?${sp}`);
  },
  recommended: (lat: number, lng: number) =>
    req<{ pulses: Pulse[] }>(`/pulses/recommended?lat=${lat}&lng=${lng}`),
  pulse: (id: string) => req<{ pulse: Pulse }>(`/pulses/${id}`),
  createPulse: (body: unknown) =>
    req<{ pulse: Pulse }>("/pulses", { method: "POST", body: JSON.stringify(body) }),
  patchPulse: (id: string, body: unknown) =>
    req<{ pulse: Pulse }>(`/pulses/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  rsvp: (id: string, status: string) =>
    req<{ pulse: Pulse }>(`/pulses/${id}/rsvp`, { method: "POST", body: JSON.stringify({ status }) }),
  unrsvp: (id: string) => req<{ pulse: Pulse }>(`/pulses/${id}/rsvp`, { method: "DELETE" }),
  favorite: (id: string) => req<{ favorited: boolean }>(`/pulses/${id}/favorite`, { method: "POST" }),
  reflect: (id: string, body: { emoji: string; sentence: string; safetyRating: number }) =>
    req<{ pulse: Pulse }>(`/pulses/${id}/reflections`, { method: "POST", body: JSON.stringify(body) }),
  scenes: () => req<{ scenes: Scene[] }>("/scenes"),
  scene: (slug: string) => req<{ scene: Scene; pulses: Pulse[] }>(`/scenes/${slug}`),
  follow: (id: string) =>
    req<{ following: boolean; followerCount: number }>(`/scenes/${id}/follow`, { method: "POST" }),
  notifications: () => req<{ notifications: Notification[] }>("/notifications"),
  readNotifications: () => req("/notifications/read", { method: "POST" }),
  report: (body: unknown) => req("/reports", { method: "POST", body: JSON.stringify(body) }),
  templates: () => req<{ templates: { id: string; name: string; title: string; description: string; vibeTags: string[]; accessibilityTags: string[]; defaultCapacity: number }[] }>("/templates"),
};

export const CITY = { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 };
