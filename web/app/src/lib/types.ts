export type PulseStatus = "upcoming" | "live" | "finished" | "cancelled";

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
  precise?: boolean;
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
  distanceKm: number | null;
  spotsLeft: number;
  myRsvp: "going" | "interested" | "anonymous" | null;
  favorited: boolean;
  host: { id: string; displayName: string; avatarUrl: string; pronouns: string } | null;
  scene: { id: string; name: string; slug: string; verified: boolean } | null;
  attendees?: { id: string; displayName: string; avatarUrl?: string; anonymous: boolean }[];
  reflections?: {
    id: string;
    emoji: string;
    sentence: string;
    safetyRating: number;
    author: { displayName: string; avatarUrl: string } | null;
  }[];
}

export interface Scene {
  id: string;
  slug: string;
  name: string;
  description: string;
  vibeTags: string[];
  followerCount: number;
  verified: boolean;
  following?: boolean;
  upcoming?: number;
  host?: { displayName: string; avatarUrl: string } | null;
  coverUrl: string;
}

export interface Tag {
  slug: string;
  label: string;
  kind: "vibe" | "accessibility";
  color: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  pronouns: string;
  avatarUrl: string;
  bio: string;
  role: string;
  locationPrecision: "precise" | "fuzzy" | "hidden";
  showAttendancePublicly: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  kind: string;
  read: boolean;
  createdAt: string;
  pulseId?: string;
}
