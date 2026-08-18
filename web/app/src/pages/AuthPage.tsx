import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";
import { useSession } from "../lib/session";
import { Logo } from "../components/Chrome";

const DEMOS = [
  { email: "maya@culturepulse.app", label: "Maya · attendee", note: "RSVPs, reflections, fuzzy location" },
  { email: "arjun@culturepulse.app", label: "Arjun · host", note: "Night Skaters, live pulse updates" },
  { email: "admin@culturepulse.app", label: "Admin", note: "Open the admin panel at :5174" },
];

export default function AuthPage() {
  const nav = useNavigate();
  const { refresh } = useSession();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("maya@culturepulse.app");
  const [password, setPassword] = useState("pulse123");
  const [displayName, setDisplayName] = useState("");
  const [pronouns, setPronouns] = useState("they/them");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const res =
        mode === "login"
          ? await api.login(email, password)
          : await api.register({ email, password, displayName, pronouns });
      setToken(res.token);
      await refresh();
      nav("/");
    } catch (e2) {
      setErr((e2 as Error).message);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-surface p-6">
        <Logo />
        <h1 className="mt-6 font-display text-4xl font-extrabold leading-none">
          Find your scene, not just events.
        </h1>
        <p className="mt-3 text-sm text-mute">
          Demo accounts all use password <code className="text-lime">pulse123</code>.
        </p>
        <div className="mt-4 grid gap-2">
          {DEMOS.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => {
                setMode("login");
                setEmail(d.email);
                setPassword("pulse123");
              }}
              className="rounded-2xl border border-white/10 bg-raised px-3 py-2 text-left text-sm hover:border-lime/50"
            >
              <span className="font-semibold">{d.label}</span>
              <span className="block text-xs text-mute">{d.note}</span>
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-5 space-y-3">
          {mode === "register" && (
            <>
              <input
                className="w-full rounded-xl bg-ink px-3 py-3 text-sm outline-none"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <input
                className="w-full rounded-xl bg-ink px-3 py-3 text-sm outline-none"
                placeholder="Pronouns"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
              />
            </>
          )}
          <input
            className="w-full rounded-xl bg-ink px-3 py-3 text-sm outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-xl bg-ink px-3 py-3 text-sm outline-none"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err && <p className="text-sm text-pink">{err}</p>}
          <button className="w-full rounded-full bg-lime py-3 font-semibold text-ink">
            {mode === "login" ? "Enter the map" : "Create account"}
          </button>
        </form>
        <button
          className="mt-4 w-full text-sm text-mute"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "New here? Create an account" : "Already pulsing? Sign in"}
        </button>
      </div>
    </div>
  );
}
