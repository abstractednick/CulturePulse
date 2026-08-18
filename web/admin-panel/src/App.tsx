import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Flag, LayoutDashboard, RefreshCw, ShieldAlert, Tags, Users } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type Tab = "overview" | "reports" | "tags" | "flags" | "users";

async function req(path: string, token: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("cp_admin_token") || "");
  const [email, setEmail] = useState("admin@culturepulse.app");
  const [password, setPassword] = useState("pulse123");
  const [tab, setTab] = useState<Tab>("overview");
  const [err, setErr] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const data = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).then((r) => r.json());
      if (!data.token) throw new Error(data.error || "Login failed");
      if (data.user.role !== "admin") throw new Error("This console is for Pulse Control (admin) only.");
      localStorage.setItem("cp_admin_token", data.token);
      setToken(data.token);
    } catch (e2) {
      setErr((e2 as Error).message);
    }
  }

  async function load() {
    if (!token) return;
    try {
      const o = await req("/admin/overview", token);
      setOverview(o.analytics);
      setFlags(o.flags);
      const r = await req("/admin/reports", token);
      setReports(r.reports);
      const t = await fetch(`${API}/tags`).then((x) => x.json());
      setTags(t.tags);
      const u = await req("/admin/users", token);
      setUsers(u.users);
      setErr(null);
    } catch (e2) {
      setErr((e2 as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  const tagChart = useMemo(() => {
    if (!overview?.byTag) return [];
    return Object.entries(overview.byTag).map(([name, count]) => ({ name, count }));
  }, [overview]);

  if (!token) {
    return (
      <div className="grid min-h-full place-items-center p-6">
        <form onSubmit={login} className="w-full max-w-sm space-y-3 rounded-3xl border border-white/10 bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-lime">Pulse Control</p>
          <h1 className="font-display text-3xl font-extrabold">CulturePulse admin</h1>
          <p className="text-sm text-mute">Moderation, taxonomy, flags, and the pulse of the city.</p>
          <input className="w-full rounded-xl bg-ink p-3 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full rounded-xl bg-ink p-3 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
          {err && <p className="text-sm text-pink">{err}</p>}
          <button className="w-full rounded-full bg-lime py-3 font-semibold text-ink">Enter console</button>
        </form>
      </div>
    );
  }

  const nav: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "reports", label: "Moderation", icon: ShieldAlert },
    { id: "tags", label: "Tags & templates", icon: Tags },
    { id: "flags", label: "Feature flags", icon: Flag },
    { id: "users", label: "People", icon: Users },
  ];

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-60 shrink-0 border-r border-white/10 p-5 md:block">
        <p className="font-display text-lg font-extrabold">
          Culture<span className="text-lime">Pulse</span>
        </p>
        <p className="text-[11px] uppercase tracking-widest text-mute">Admin · Ahmedabad</p>
        <nav className="mt-8 space-y-1">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                tab === n.id ? "bg-lime text-ink font-semibold" : "text-mute hover:bg-raised"
              }`}
            >
              <n.icon size={16} /> {n.label}
            </button>
          ))}
        </nav>
        <button
          className="mt-8 flex items-center gap-2 text-xs text-mute"
          onClick={() => {
            localStorage.removeItem("cp_admin_token");
            setToken("");
          }}
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-3xl font-extrabold capitalize">{tab === "reports" ? "Moderation queue" : tab}</h1>
          <button onClick={load} className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        {err && <p className="mb-4 text-sm text-pink">{err}</p>}

        {tab === "overview" && overview && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Users", overview.users],
                ["Scenes", overview.scenes],
                ["Pulses", overview.pulses],
                ["Live now", overview.live],
                ["RSVPs", overview.rsvps],
                ["Going", overview.going],
                ["RSVP→going", `${overview.conversion}%`],
                ["Open reports", overview.openReports],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-white/10 bg-surface p-4">
                  <p className="text-xs uppercase tracking-wider text-mute">{k}</p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-lime">{v}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-surface p-4">
                <h3 className="mb-3 font-display font-bold">Scene categories</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={tagChart}>
                    <CartesianGrid stroke="#222" />
                    <XAxis dataKey="name" stroke="#8B8798" fontSize={11} />
                    <YAxis stroke="#8B8798" fontSize={11} />
                    <Tooltip contentStyle={{ background: "#12121A", border: "1px solid #333" }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {tagChart.map((_, i) => (
                        <Cell key={i} fill={i % 2 ? "#D6FF3F" : "#9B8CFF"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface p-4">
                <h3 className="mb-3 font-display font-bold">Start hour distribution</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={overview.byHour}>
                    <CartesianGrid stroke="#222" />
                    <XAxis dataKey="hour" stroke="#8B8798" fontSize={11} />
                    <YAxis stroke="#8B8798" fontSize={11} />
                    <Tooltip contentStyle={{ background: "#12121A", border: "1px solid #333" }} />
                    <Line type="monotone" dataKey="count" stroke="#FF4F8B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-surface p-4">
              <h3 className="mb-3 font-display font-bold">Retention cohorts (demo)</h3>
              <div className="grid gap-2 md:grid-cols-4">
                {overview.retention.map((c: any) => (
                  <div key={c.cohort} className="rounded-xl bg-ink p-3">
                    <p className="text-xs text-mute">{c.cohort}</p>
                    <p className="font-display text-2xl font-bold">{Math.round((c.retained / c.started) * 100)}%</p>
                    <p className="text-xs text-mute">
                      {c.retained}/{c.started} still pulsing
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="rounded-2xl border border-white/10 bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-mute">
                      {r.targetType} · {r.reason} · {r.status}
                    </p>
                    <p className="mt-1 font-semibold">{r.details}</p>
                    <p className="text-xs text-mute">Reporter: {r.reporter?.displayName}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-full border border-white/15 px-3 py-1 text-xs"
                      onClick={() => req(`/admin/reports/${r.id}`, token, { method: "PATCH", body: JSON.stringify({ status: "dismissed" }) }).then(load)}
                    >
                      Dismiss
                    </button>
                    <button
                      className="rounded-full bg-pink px-3 py-1 text-xs font-semibold text-ink"
                      onClick={() =>
                        req(`/admin/reports/${r.id}`, token, {
                          method: "PATCH",
                          body: JSON.stringify({ status: "resolved", action: "hide-pulse" }),
                        }).then(load)
                      }
                    >
                      Hide pulse
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!reports.length && <p className="text-mute">Queue is clear.</p>}
          </div>
        )}

        {tab === "tags" && (
          <TagManager token={token} tags={tags} onDone={load} />
        )}

        {tab === "flags" && (
          <div className="space-y-2">
            {flags.map((f) => (
              <div key={f.key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-surface p-4">
                <div>
                  <p className="font-semibold">{f.label}</p>
                  <p className="text-xs text-mute">
                    {f.key} · region {f.region} · cohort {f.cohort}
                  </p>
                </div>
                <button
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${f.enabled ? "bg-lime text-ink" : "bg-raised text-mute"}`}
                  onClick={() =>
                    req(`/admin/flags/${f.key}`, token, {
                      method: "PATCH",
                      body: JSON.stringify({ enabled: !f.enabled }),
                    }).then(load)
                  }
                >
                  {f.enabled ? "On" : "Off"}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase text-mute">
                <tr>
                  <th className="p-3">Person</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Precision</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-white/10">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img src={u.avatarUrl} className="h-8 w-8 rounded-full bg-raised" alt="" />
                        <div>
                          <p>{u.displayName}</p>
                          <p className="text-xs text-mute">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3">{u.locationPrecision}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-white/10 p-3">
              <button
                className="text-xs text-mute underline"
                onClick={() => req("/admin/reset", token, { method: "POST" }).then(load)}
              >
                Restore demo seed
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TagManager({ token, tags, onDone }: { token: string; tags: any[]; onDone: () => void }) {
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState("vibe");
  const [color, setColor] = useState("#D6FF3F");
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t.kind + t.slug} className="rounded-full border border-white/10 px-3 py-1 text-sm" style={{ boxShadow: `inset 0 0 0 1px ${t.color}55` }}>
            {t.label}
            <span className="ml-2 text-[10px] text-mute">{t.kind}</span>
          </span>
        ))}
      </div>
      <form
        className="space-y-2 rounded-2xl border border-white/10 bg-surface p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await req("/admin/tags", token, {
            method: "PATCH",
            body: JSON.stringify({ slug, label, kind, color, icon: "tag", description: "" }),
          });
          onDone();
        }}
      >
        <p className="font-display font-bold">Add / update tag</p>
        <input className="w-full rounded-xl bg-ink p-2 text-sm" placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input className="w-full rounded-xl bg-ink p-2 text-sm" placeholder="label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <select className="w-full rounded-xl bg-ink p-2 text-sm" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="vibe">vibe</option>
          <option value="accessibility">accessibility</option>
        </select>
        <input type="color" className="h-10 w-full" value={color} onChange={(e) => setColor(e.target.value)} />
        <button className="w-full rounded-full bg-lime py-2 text-sm font-semibold text-ink">Save tag</button>
      </form>
    </div>
  );
}
