import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { TopBar } from "../components/Chrome";
import type { User } from "../lib/types";

export default function ProfilePage() {
  const { user, refresh, logout } = useSession();
  const [form, setForm] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-dvh bg-ink">
      <div className="relative h-16">
        <TopBar />
      </div>
      <div className="mx-auto max-w-lg space-y-4 px-4 py-10">
        <div className="flex items-center gap-4">
          <img src={user.avatarUrl} alt="" className="h-16 w-16 rounded-full bg-raised" />
          <div>
            <h1 className="font-display text-3xl font-extrabold">{user.displayName}</h1>
            <p className="text-sm text-mute">
              {user.pronouns} · {user.role}
            </p>
          </div>
        </div>
        <textarea
          className="w-full rounded-2xl bg-surface p-3 text-sm outline-none"
          rows={3}
          value={form.bio ?? ""}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
        <label className="block text-sm">
          Location precision
          <select
            className="mt-1 w-full rounded-2xl bg-surface p-3 outline-none"
            value={form.locationPrecision}
            onChange={(e) => setForm({ ...form, locationPrecision: e.target.value as User["locationPrecision"] })}
          >
            <option value="precise">Precise pin</option>
            <option value="fuzzy">Fuzzy radius</option>
            <option value="hidden">Hidden until RSVP</option>
          </select>
        </label>
        <label className="flex items-center justify-between rounded-2xl bg-surface p-3 text-sm">
          Show my attendance publicly
          <input
            type="checkbox"
            className="accent-lime"
            checked={!!form.showAttendancePublicly}
            onChange={(e) => setForm({ ...form, showAttendancePublicly: e.target.checked })}
          />
        </label>
        <button
          className="w-full rounded-full bg-lime py-3 font-semibold text-ink"
          onClick={async () => {
            await api.patchMe(form);
            await refresh();
          }}
        >
          Save privacy
        </button>
        <button className="w-full text-sm text-mute" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
