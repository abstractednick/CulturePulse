import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { TopBar } from "../components/Chrome";
import { PulseCard } from "../components/PulseCard";
import type { Pulse, Scene } from "../lib/types";

export default function ScenePage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { user } = useSession();
  const [scene, setScene] = useState<Scene | null>(null);
  const [pulses, setPulses] = useState<Pulse[]>([]);

  async function load() {
    if (!slug) return;
    const data = await api.scene(slug);
    setScene(data.scene);
    setPulses(data.pulses);
  }

  useEffect(() => {
    load();
  }, [slug]);

  if (!scene) return <div className="grid min-h-dvh place-items-center bg-ink text-mute">Loading scene…</div>;

  return (
    <div className="min-h-dvh bg-ink">
      <div className="relative h-16">
        <TopBar />
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-lime">Scene profile</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 className="font-display text-4xl font-extrabold leading-none">{scene.name}</h1>
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold ${scene.following ? "border border-white/15" : "bg-lime text-ink"}`}
            onClick={async () => {
              if (!user) return nav("/auth");
              await api.follow(scene.id);
              load();
            }}
          >
            {scene.following ? "Following" : "Follow"}
          </button>
        </div>
        <p className="mt-4 text-mute">{scene.description}</p>
        <p className="mt-2 text-xs text-mute">{scene.followerCount} followers</p>
        <div className="mt-8 space-y-3">
          {pulses.map((p) => (
            <PulseCard key={p.id} pulse={p} onClick={() => nav(`/pulses/${p.id}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}
