import { Link, NavLink } from "react-router-dom";
import { Bell, MapPin, Plus, Shield, UserRound } from "lucide-react";
import { useSession } from "../lib/session";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink shadow-glow">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <path
            d="M6 18h4l2.2-7 3.2 14 3-9 2.2 2H26"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          Culture<span className="text-lime">Pulse</span>
        </span>
      )}
    </Link>
  );
}

const item =
  "flex items-center gap-2 rounded-full px-3 py-2 text-sm text-mute hover:text-paper hover:bg-raised transition";

export function TopBar({ onBell }: { onBell?: () => void }) {
  const { user } = useSession();
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between p-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-ink/80 px-3 py-2 backdrop-blur-xl">
        <Logo />
        <nav className="hidden md:flex items-center">
          <NavLink to="/" className={item}>
            <MapPin size={16} /> Map
          </NavLink>
          <NavLink to="/scenes" className={item}>
            Scenes
          </NavLink>
          <NavLink to="/safety" className={item}>
            <Shield size={16} /> Safety
          </NavLink>
        </nav>
      </div>
      <div className="pointer-events-auto flex items-center gap-2">
        <Link
          to="/host"
          className="flex items-center gap-1.5 rounded-full bg-lime px-4 py-2.5 text-sm font-semibold text-ink shadow-glow"
        >
          <Plus size={16} /> Host a pulse
        </Link>
        {onBell && (
          <button
            onClick={onBell}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-ink/80 text-paper backdrop-blur-xl"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
        )}
        <Link
          to={user ? "/me" : "/auth"}
          className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-white/10 bg-ink/80 backdrop-blur-xl"
        >
          {user ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={18} />
          )}
        </Link>
      </div>
    </header>
  );
}

export function TagChip({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-lime bg-lime text-ink"
          : "border-white/10 bg-raised/80 text-paper hover:border-white/30"
      }`}
      style={!active && color ? { boxShadow: `inset 0 0 0 1px ${color}33` } : undefined}
    >
      {label}
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    live: "bg-pink text-ink",
    upcoming: "bg-lime/20 text-lime border border-lime/40",
    finished: "bg-white/10 text-mute",
    cancelled: "bg-white/10 text-mute line-through",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status] ?? map.upcoming}`}>
      {status === "live" ? "● Live" : status}
    </span>
  );
}

export function when(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}
