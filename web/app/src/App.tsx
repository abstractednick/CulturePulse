import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { api, getToken, setToken } from "./lib/api";
import { SessionContext } from "./lib/session";
import type { User } from "./lib/types";
import MapHome from "./pages/MapHome";
import PulsePage from "./pages/PulsePage";
import AuthPage from "./pages/AuthPage";
import CreatePulse from "./pages/CreatePulse";
import ScenesPage from "./pages/ScenesPage";
import ScenePage from "./pages/ScenePage";
import ProfilePage from "./pages/ProfilePage";
import SafetyPage from "./pages/SafetyPage";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.me();
      setUser(me.user);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        refresh,
        logout: () => {
          setToken(null);
          setUser(null);
        },
      }}
    >
      <div className="noise min-h-full">
        <Routes>
          <Route path="/" element={<MapHome />} />
          <Route path="/pulses/:id" element={<PulsePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/host" element={loading ? null : user ? <CreatePulse /> : <Navigate to="/auth" />} />
          <Route path="/scenes" element={<ScenesPage />} />
          <Route path="/scenes/:slug" element={<ScenePage />} />
          <Route path="/me" element={loading ? null : user ? <ProfilePage /> : <Navigate to="/auth" />} />
          <Route path="/safety" element={<SafetyPage />} />
        </Routes>
      </div>
    </SessionContext.Provider>
  );
}
