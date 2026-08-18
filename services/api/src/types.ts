export type PulseStatus = "upcoming" | "live" | "finished" | "cancelled";
export type RsvpStatus = "going" | "interested" | "anonymous";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type UserRole = "member" | "host" | "admin";

export interface User {
  id: string;
  email: string;
  password: string;
  displayName: string;
  pronouns: string;
  avatarUrl: string;
  bio: string;
  role: UserRole;
  locationPrecision: "precise" | "fuzzy" | "hidden";
  showAttendancePublicly: boolean;
  createdAt: string;
}

export interface Scene {
  id: string;
  slug: string;
  name: string;
  description: string;
  hostId: string;
  vibeTags: string[];
  socialLinks: { label: string; url: string }[];
  followerCount: number;
  verified: boolean;
  coverUrl: string;
  createdAt: string;
}

export interface Pulse {
  id: string;
  sceneId: string | null;
  hostId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  lat: number;
  lng: number;
  placeName: string;
  fuzzyRadiusMeters: number;
  capacity: number;
  vibeTags: string[];
  accessibilityTags: string[];
  safetyNotes: string;
  status: PulseStatus;
  attendeeCount: number;
  interestedCount: number;
  lastMinuteUpdate: string | null;
  createdAt: string;
}

export interface Rsvp {
  id: string;
  pulseId: string;
  userId: string;
  status: RsvpStatus;
  createdAt: string;
}

export interface Reflection {
  id: string;
  pulseId: string;
  userId: string;
  emoji: string;
  sentence: string;
  safetyRating: number;
  createdAt: string;
}

export interface Follow {
  userId: string;
  sceneId: string;
  createdAt: string;
}

export interface Favorite {
  userId: string;
  pulseId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: "pulse" | "scene" | "user";
  targetId: string;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
}

export interface Tag {
  slug: string;
  label: string;
  kind: "vibe" | "accessibility";
  color: string;
  icon: string;
  description: string;
}

export interface PulseTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  vibeTags: string[];
  accessibilityTags: string[];
  defaultCapacity: number;
}

export interface FeatureFlag {
  key: string;
  label: string;
  enabled: boolean;
  region: string;
  cohort: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  kind: "reminder" | "update" | "follow" | "system";
  read: boolean;
  createdAt: string;
  pulseId?: string;
}

export interface Db {
  users: User[];
  scenes: Scene[];
  pulses: Pulse[];
  rsvps: Rsvp[];
  reflections: Reflection[];
  follows: Follow[];
  favorites: Favorite[];
  reports: Report[];
  tags: Tag[];
  templates: PulseTemplate[];
  flags: FeatureFlag[];
  notifications: Notification[];
  blocks: { blockerId: string; blockedId: string }[];
}
