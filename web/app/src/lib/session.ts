import { createContext, useContext } from "react";
import type { User } from "./types";

export interface Session {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
}

export const SessionContext = createContext<Session>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: () => {},
});

export function useSession() {
  return useContext(SessionContext);
}
