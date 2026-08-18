import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { TopBar } from "../components/Chrome";
import type { Scene } from "../lib/types";

export default function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  useEffect(() => {
    api.scenes().then((s) => setScenes(s.scenes));
  }, []);

  return (
    <div className="min-h-dvh bg-ink">
      <div className="relative h-16">
        <TopBar />
      </div>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-lime">Micro-communities</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold">Follow a scene. Catch the next pulse.</h1>
        <p className="mt-3 max-w-xl text-mute">
          Scenes are the recurring crews — Night Skaters, study circles, open mics — not one-off listings.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {scenes.map((s) => (
            <Link
              key={s.id}
              to={`/scenes/${s.slug}`}
              className="rounded-3xl border border-white/10 bg-surface p-5 transition hover:border-lime/40"
            >
              <div className="flex items-start justify-between">
                <h2 className="font-display text-2xl font-bold leading-tight">{s.name}</h2>
                {s.verified && <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold text-ink">VERIFIED</span>}
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-mute">{s.description}</p>
              <p className="mt-4 text-xs text-mute">
                {s.followerCount} followers · {s.upcoming ?? 0} upcoming · hosted by {s.host?.displayName}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {s.vibeTags.map((t) => (
                  <span key={t} className="rounded-full bg-raised px-2 py-0.5 text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
