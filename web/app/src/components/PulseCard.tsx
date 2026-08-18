import { Link } from "react-router-dom";
import { Heart, MapPin, Users } from "lucide-react";
import type { Pulse } from "../lib/types";
import { StatusBadge, when } from "./Chrome";

export function PulseCard({
  pulse,
  active,
  onClick,
}: {
  pulse: Pulse;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-3.5 text-left transition ${
        active ? "border-lime bg-lime/10 shadow-glow" : "border-white/10 bg-surface/90 hover:border-white/25"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <StatusBadge status={pulse.status} />
          <h3 className="mt-1.5 font-display text-[15px] font-bold leading-tight">{pulse.title}</h3>
        </div>
        {pulse.favorited && <Heart size={14} className="mt-1 fill-pink text-pink" />}
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-mute">{pulse.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-mute">
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {pulse.placeName}
        </span>
        <span>{when(pulse.startAt)}</span>
        {pulse.distanceKm != null && <span>{pulse.distanceKm} km</span>}
        <span className="flex items-center gap-1">
          <Users size={12} /> {pulse.attendeeCount}/{pulse.capacity}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {pulse.vibeTags.slice(0, 4).map((t) => (
          <span key={t} className="rounded-full bg-raised px-2 py-0.5 text-[10px] text-paper">
            {t}
          </span>
        ))}
        {!pulse.precise && pulse.fuzzyRadiusMeters > 0 && (
          <span className="rounded-full bg-violet/20 px-2 py-0.5 text-[10px] text-violet">fuzzy pin</span>
        )}
      </div>
    </button>
  );
}

export function PulsePeek({ pulse }: { pulse: Pulse }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-ink/90 p-4 backdrop-blur-xl">
      <StatusBadge status={pulse.status} />
      <h2 className="mt-2 font-display text-2xl font-extrabold leading-none">{pulse.title}</h2>
      {pulse.scene && (
        <Link to={`/scenes/${pulse.scene.slug}`} className="mt-1 inline-block text-sm text-lime">
          {pulse.scene.name} {pulse.scene.verified ? "✓" : ""}
        </Link>
      )}
      <p className="mt-3 text-sm text-mute">{pulse.description}</p>
      {pulse.lastMinuteUpdate && (
        <p className="mt-3 rounded-xl border border-pink/30 bg-pink/10 px-3 py-2 text-sm text-paper">
          Last-minute: {pulse.lastMinuteUpdate}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <Link
          to={`/pulses/${pulse.id}`}
          className="flex-1 rounded-full bg-lime py-2.5 text-center text-sm font-semibold text-ink"
        >
          Open pulse
        </Link>
      </div>
    </div>
  );
}
