import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api, CITY } from "../lib/api";
import { useSession } from "../lib/session";
import type { Notification, Pulse, Tag } from "../lib/types";
import { TopBar, TagChip } from "../components/Chrome";
import SceneMap from "../components/SceneMap";
import { PulseCard, PulsePeek } from "../components/PulseCard";

const WINDOWS = [
  { id: "all", label: "Anytime" },
  { id: "now", label: "Live now" },
  { id: "today", label: "Today" },
  { id: "weekend", label: "This weekend" },
];

export default function MapHome() {
  const nav = useNavigate();
  const { user } = useSession();
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [vibe, setVibe] = useState<string[]>([]);
  const [access, setAccess] = useState<string[]>([]);
  const [timeWindow, setTimeWindow] = useState("all");
  const [q, setQ] = useState("");
  const [radiusKm, setRadiusKm] = useState(12);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [notes, setNotes] = useState<Notification[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selectedPulse = useMemo(() => pulses.find((p) => p.id === selected) ?? pulses[0], [pulses, selected]);

  async function load() {
    try {
      setErr(null);
      const data = await api.pulses({
        lat: CITY.lat,
        lng: CITY.lng,
        radiusKm,
        vibe: vibe.join(","),
        access: access.join(","),
        window: timeWindow,
        q,
      });
      setPulses(data.pulses);
      if (!selected && data.pulses[0]) setSelected(data.pulses[0].id);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  useEffect(() => {
    api.tags().then((t) => setTags(t.tags)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vibe, access, timeWindow, radiusKm]);

  useEffect(() => {
    const t = setTimeout(load, 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function openNotes() {
    if (!user) return nav("/auth");
    const n = await api.notifications();
    setNotes(n.notifications);
    setShowNotes(true);
  }

  function toggle(list: string[], set: (v: string[]) => void, slug: string) {
    set(list.includes(slug) ? list.filter((x) => x !== slug) : [...list, slug]);
  }

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-ink">
      <SceneMap pulses={pulses} selectedId={selected} onSelect={setSelected} />
      <TopBar onBell={openNotes} />

      <div className="pointer-events-none absolute inset-x-0 top-20 z-[400] flex justify-center px-4 md:justify-start md:pl-4">
        <div className="pointer-events-auto flex w-full max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-ink/80 p-2 backdrop-blur-xl md:max-w-md">
          <Search size={16} className="ml-2 text-mute" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search skate, study, open mic…"
            className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-mute"
          />
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="grid h-10 w-10 place-items-center rounded-xl bg-raised text-paper"
            aria-label="Filters"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="absolute left-4 top-40 z-[450] w-[min(92vw,380px)] rounded-2xl border border-white/10 bg-ink/95 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-sm font-bold">Filters</p>
            <button onClick={() => setShowFilters(false)}>
              <X size={16} />
            </button>
          </div>
          <p className="mb-2 text-[11px] uppercase tracking-wider text-mute">When</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {WINDOWS.map((w) => (
              <TagChip key={w.id} label={w.label} active={timeWindow === w.id} onClick={() => setTimeWindow(w.id)} />
            ))}
          </div>
          <p className="mb-2 text-[11px] uppercase tracking-wider text-mute">Vibe</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {tags
              .filter((t) => t.kind === "vibe")
              .map((t) => (
                <TagChip
                  key={t.slug}
                  label={t.label}
                  color={t.color}
                  active={vibe.includes(t.slug)}
                  onClick={() => toggle(vibe, setVibe, t.slug)}
                />
              ))}
          </div>
          <p className="mb-2 text-[11px] uppercase tracking-wider text-mute">Access</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {tags
              .filter((t) => t.kind === "accessibility")
              .map((t) => (
                <TagChip
                  key={`${t.kind}-${t.slug}`}
                  label={t.label}
                  active={access.includes(t.slug)}
                  onClick={() => toggle(access, setAccess, t.slug)}
                />
              ))}
          </div>
          <label className="flex items-center justify-between text-sm text-mute">
            Distance
            <span className="text-paper">{radiusKm} km</span>
          </label>
          <input
            type="range"
            min={2}
            max={25}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="mt-1 w-full accent-lime"
          />
        </div>
      )}

      <aside className="absolute bottom-0 right-0 z-[400] flex max-h-[58vh] w-full flex-col gap-3 p-3 md:bottom-4 md:right-4 md:max-h-[calc(100dvh-2rem)] md:w-[380px] md:p-0">
        {selectedPulse && (
          <div className="hidden md:block">
            <PulsePeek pulse={selectedPulse} />
          </div>
        )}
        <div className="scrollbar-thin overflow-y-auto rounded-3xl border border-white/10 bg-ink/85 p-3 backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="font-display text-sm font-bold">
              {pulses.length} scene{pulses.length === 1 ? "" : "s"} near {CITY.name}
            </p>
            <span className="text-[11px] text-mute">map-first</span>
          </div>
          {err && <p className="mb-2 rounded-xl bg-pink/15 px-3 py-2 text-xs text-pink">{err} — is the API running on :4000?</p>}
          <div className="space-y-2">
            {pulses.map((p) => (
              <PulseCard key={p.id} pulse={p} active={p.id === selected} onClick={() => setSelected(p.id)} />
            ))}
            {!pulses.length && !err && <p className="p-6 text-center text-sm text-mute">No pulses in this filter. Loosen the vibe.</p>}
          </div>
        </div>
      </aside>

      {showNotes && (
        <div className="absolute inset-0 z-[600] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Notifications</h2>
              <button
                onClick={async () => {
                  await api.readNotifications();
                  setShowNotes(false);
                }}
              >
                <X />
              </button>
            </div>
            <div className="space-y-2">
              {notes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => n.pulseId && nav(`/pulses/${n.pulseId}`)}
                  className="w-full rounded-2xl border border-white/10 bg-raised p-3 text-left"
                >
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-mute">{n.body}</p>
                </button>
              ))}
              {!notes.length && <p className="text-sm text-mute">You're caught up.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
