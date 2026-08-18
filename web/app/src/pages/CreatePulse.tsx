import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, CITY } from "../lib/api";
import { TopBar, TagChip } from "../components/Chrome";
import type { Tag } from "../lib/types";

export default function CreatePulse() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [templates, setTemplates] = useState<
    { id: string; name: string; title: string; description: string; vibeTags: string[]; accessibilityTags: string[]; defaultCapacity: number }[]
  >([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [capacity, setCapacity] = useState(16);
  const [fuzzy, setFuzzy] = useState(false);
  const [vibe, setVibe] = useState<string[]>([]);
  const [access, setAccess] = useState<string[]>([]);
  const [safetyNotes, setSafetyNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  useEffect(() => {
    api.tags().then((t) => setTags(t.tags));
    api.templates().then((t) => setTemplates(t.templates));
  }, []);

  function toggle(list: string[], set: (v: string[]) => void, slug: string) {
    set(list.includes(slug) ? list.filter((x) => x !== slug) : [...list, slug]);
  }

  return (
    <div className="min-h-dvh bg-ink">
      <div className="relative h-16">
        <TopBar />
      </div>
      <form
        className="mx-auto max-w-2xl space-y-4 px-4 py-8"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg(null);
          try {
            const { pulse } = await api.createPulse({
              title,
              description,
              startAt: new Date(startAt).toISOString(),
              endAt: new Date(endAt).toISOString(),
              lat: CITY.lat + (Math.random() - 0.5) * 0.04,
              lng: CITY.lng + (Math.random() - 0.5) * 0.04,
              placeName,
              fuzzyRadiusMeters: fuzzy ? 180 : 0,
              capacity,
              vibeTags: vibe,
              accessibilityTags: access,
              safetyNotes,
            });
            setCreated(pulse.id);
          } catch (err) {
            setMsg((err as Error).message);
          }
        }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-lime">Lightweight host tools</p>
        <h1 className="font-display text-4xl font-extrabold">Drop a pulse on the map.</h1>
        <p className="text-mute">No ticketing stack. Title, time, vibe, and a pin — that's a scene.</p>

        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              type="button"
              key={t.id}
              className="rounded-full border border-white/10 px-3 py-1 text-xs hover:border-lime"
              onClick={() => {
                setTitle(t.title);
                setDescription(t.description);
                setCapacity(t.defaultCapacity);
                setVibe(t.vibeTags);
                setAccess(t.accessibilityTags);
              }}
            >
              Template: {t.name}
            </button>
          ))}
        </div>

        <input className="w-full rounded-2xl bg-surface px-4 py-3 outline-none" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="w-full rounded-2xl bg-surface px-4 py-3 outline-none" rows={4} placeholder="What's the vibe? Who is this for?" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="w-full rounded-2xl bg-surface px-4 py-3 outline-none" placeholder="Place name (keep it human)" value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs text-mute">
            Starts
            <input type="datetime-local" className="mt-1 w-full rounded-2xl bg-surface px-4 py-3 text-sm text-paper outline-none" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          </label>
          <label className="text-xs text-mute">
            Ends
            <input type="datetime-local" className="mt-1 w-full rounded-2xl bg-surface px-4 py-3 text-sm text-paper outline-none" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
          </label>
        </div>
        <label className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 text-sm">
          Capacity
          <input type="number" min={2} max={200} className="w-20 bg-transparent text-right outline-none" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
        </label>
        <label className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 text-sm">
          Fuzzy location (privacy)
          <input type="checkbox" checked={fuzzy} onChange={(e) => setFuzzy(e.target.checked)} className="accent-lime" />
        </label>
        <div>
          <p className="mb-2 text-xs uppercase text-mute">Vibe tags</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.filter((t) => t.kind === "vibe").map((t) => (
              <TagChip key={t.slug} label={t.label} active={vibe.includes(t.slug)} onClick={() => toggle(vibe, setVibe, t.slug)} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase text-mute">Accessibility</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.filter((t) => t.kind === "accessibility").map((t) => (
              <TagChip key={t.slug} label={t.label} active={access.includes(t.slug)} onClick={() => toggle(access, setAccess, t.slug)} />
            ))}
          </div>
        </div>
        <textarea className="w-full rounded-2xl bg-surface px-4 py-3 outline-none" rows={2} placeholder="Safety notes (lighting, rain plan, helmets…)" value={safetyNotes} onChange={(e) => setSafetyNotes(e.target.value)} />
        {msg && <p className="text-sm text-pink">{msg}</p>}
        {created && (
          <p className="text-sm text-lime">
            Pulse is on the map. <Link to={`/pulses/${created}`}>Open it →</Link>
          </p>
        )}
        <button className="w-full rounded-full bg-lime py-3 font-semibold text-ink">Publish pulse</button>
      </form>
    </div>
  );
}
