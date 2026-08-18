import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, ShieldAlert, Users } from "lucide-react";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import type { Pulse } from "../lib/types";
import { Logo, StatusBadge, when } from "../components/Chrome";
import SceneMap from "../components/SceneMap";

export default function PulsePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useSession();
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [emoji, setEmoji] = useState("🫶");
  const [sentence, setSentence] = useState("");
  const [rating, setRating] = useState(5);
  const [update, setUpdate] = useState("");

  async function load() {
    if (!id) return;
    const { pulse: p } = await api.pulse(id);
    setPulse(p);
  }

  useEffect(() => {
    load().catch((e) => setMsg((e as Error).message));
  }, [id]);

  async function needAuth() {
    if (!user) {
      nav("/auth");
      return false;
    }
    return true;
  }

  async function rsvp(status: string) {
    if (!(await needAuth()) || !pulse) return;
    const { pulse: p } = await api.rsvp(pulse.id, status);
    setPulse(p);
  }

  if (!pulse) {
    return (
      <div className="grid min-h-dvh place-items-center bg-ink text-mute">
        {msg ?? "Loading pulse…"}
      </div>
    );
  }

  const isHost = user?.id === pulse.hostId;

  return (
    <div className="min-h-dvh bg-ink">
      <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative h-[42vh] lg:h-screen">
          <SceneMap pulses={[pulse]} selectedId={pulse.id} onSelect={() => {}} center={{ lat: pulse.lat, lng: pulse.lng }} />
          <Link
            to="/"
            className="absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-full border border-white/10 bg-ink/80 px-3 py-2 text-sm backdrop-blur-xl"
          >
            <ArrowLeft size={16} /> Map
          </Link>
          <div className="absolute right-4 top-4 z-[500]">
            <Logo compact />
          </div>
        </div>
        <article className="space-y-5 p-6 lg:max-h-screen lg:overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <StatusBadge status={pulse.status} />
              <h1 className="mt-2 font-display text-4xl font-extrabold leading-[0.95]">{pulse.title}</h1>
              {pulse.scene && (
                <Link to={`/scenes/${pulse.scene.slug}`} className="mt-2 inline-block text-lime">
                  {pulse.scene.name}
                </Link>
              )}
            </div>
            <button
              onClick={async () => {
                if (!(await needAuth())) return;
                await api.favorite(pulse.id);
                load();
              }}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10"
            >
              <Heart size={18} className={pulse.favorited ? "fill-pink text-pink" : ""} />
            </button>
          </div>
          <p className="text-mute">{pulse.description}</p>
          {pulse.lastMinuteUpdate && (
            <p className="rounded-2xl border border-pink/40 bg-pink/10 p-3 text-sm">
              Host update: {pulse.lastMinuteUpdate}
            </p>
          )}
          <ul className="grid grid-cols-2 gap-2 text-sm">
            <li className="rounded-2xl bg-surface p-3">
              <p className="text-[11px] uppercase text-mute">When</p>
              {when(pulse.startAt)}
            </li>
            <li className="rounded-2xl bg-surface p-3">
              <p className="text-[11px] uppercase text-mute">Capacity</p>
              <span className="inline-flex items-center gap-1">
                <Users size={14} /> {pulse.attendeeCount}/{pulse.capacity} · {pulse.spotsLeft} left
              </span>
            </li>
            <li className="col-span-2 rounded-2xl bg-surface p-3">
              <p className="text-[11px] uppercase text-mute">Where</p>
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} /> {pulse.placeName}
                {!pulse.precise && <em className="text-violet"> · approximate until you RSVP going</em>}
              </span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-1.5">
            {[...pulse.vibeTags, ...pulse.accessibilityTags].map((t) => (
              <span key={t} className="rounded-full bg-raised px-3 py-1 text-xs">
                {t}
              </span>
            ))}
          </div>
          {pulse.safetyNotes && (
            <p className="flex gap-2 rounded-2xl border border-white/10 p-3 text-sm text-mute">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-lime" /> {pulse.safetyNotes}
            </p>
          )}
          <div className="flex items-center gap-3">
            {pulse.host && (
              <>
                <img src={pulse.host.avatarUrl} alt="" className="h-10 w-10 rounded-full bg-raised" />
                <div>
                  <p className="text-sm font-semibold">{pulse.host.displayName}</p>
                  <p className="text-xs text-mute">{pulse.host.pronouns} · host</p>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => rsvp("going")} className="rounded-full bg-lime px-4 py-2.5 text-sm font-semibold text-ink">
              {pulse.myRsvp === "going" ? "You're going" : "RSVP going"}
            </button>
            <button onClick={() => rsvp("interested")} className="rounded-full border border-white/15 px-4 py-2.5 text-sm">
              Interested
            </button>
            <button onClick={() => rsvp("anonymous")} className="rounded-full border border-white/15 px-4 py-2.5 text-sm">
              Go anonymously
            </button>
          </div>
          {msg && <p className="text-sm text-pink">{msg}</p>}

          {isHost && (
            <div className="rounded-2xl border border-lime/30 bg-lime/5 p-4">
              <p className="font-display font-bold">Host tools</p>
              <textarea
                value={update}
                onChange={(e) => setUpdate(e.target.value)}
                placeholder="Last-minute update (moved inside, rain, new pin…)"
                className="mt-2 w-full rounded-xl bg-ink p-3 text-sm outline-none"
                rows={2}
              />
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded-full bg-lime px-3 py-1.5 text-xs font-semibold text-ink"
                  onClick={async () => {
                    const { pulse: p } = await api.patchPulse(pulse.id, { lastMinuteUpdate: update });
                    setPulse(p);
                  }}
                >
                  Send update
                </button>
                <button
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs"
                  onClick={async () => {
                    const { pulse: p } = await api.patchPulse(pulse.id, { status: "live" });
                    setPulse(p);
                  }}
                >
                  Mark live
                </button>
                <button
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs"
                  onClick={async () => {
                    const { pulse: p } = await api.patchPulse(pulse.id, { status: "finished" });
                    setPulse(p);
                  }}
                >
                  Mark finished
                </button>
              </div>
            </div>
          )}

          <section>
            <h3 className="font-display font-bold">Who's in</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {(pulse.attendees ?? []).map((a, i) => (
                <span key={a.id + i} className="rounded-full bg-surface px-3 py-1 text-xs">
                  {a.anonymous ? "Anonymous scene-mate" : a.displayName}
                </span>
              ))}
            </div>
          </section>

          {pulse.status === "finished" && (
            <form
              className="rounded-2xl bg-surface p-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!(await needAuth())) return;
                const { pulse: p } = await api.reflect(pulse.id, { emoji, sentence, safetyRating: rating });
                setPulse(p);
                setSentence("");
              }}
            >
              <p className="font-display font-bold">Leave a reflection</p>
              <div className="mt-2 flex gap-2 text-2xl">
                {["🫶", "✨", "🔥", "🤫", "💚"].map((em) => (
                  <button type="button" key={em} onClick={() => setEmoji(em)} className={emoji === em ? "scale-125" : "opacity-50"}>
                    {em}
                  </button>
                ))}
              </div>
              <input
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                maxLength={160}
                placeholder="One sentence on the vibe…"
                className="mt-3 w-full rounded-xl bg-ink p-3 text-sm outline-none"
              />
              <label className="mt-2 block text-xs text-mute">
                Safety / comfort {rating}/5
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="mt-1 w-full accent-lime"
                />
              </label>
              <button className="mt-3 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink">Post</button>
            </form>
          )}

          <section className="space-y-2">
            {(pulse.reflections ?? []).map((r) => (
              <div key={r.id} className="rounded-2xl bg-surface p-3 text-sm">
                <span className="text-lg">{r.emoji}</span> {r.sentence}
                <p className="mt-1 text-[11px] text-mute">
                  {r.author?.displayName} · safety {r.safetyRating}/5
                </p>
              </div>
            ))}
          </section>

          <button
            className="text-xs text-mute underline"
            onClick={async () => {
              if (!(await needAuth())) return;
              await api.report({ targetType: "pulse", targetId: pulse.id, reason: "safety", details: "Flagged from pulse page" });
              setMsg("Thanks — trust & safety has this in the queue.");
            }}
          >
            Report this pulse
          </button>
        </article>
      </div>
    </div>
  );
}
