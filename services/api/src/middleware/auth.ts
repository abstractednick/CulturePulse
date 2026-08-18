import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";
import { store } from "../data/store.js";

export interface AuthedRequest extends Request {
  userId?: string;
  role?: string;
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyToken(header.slice(7));
      req.userId = String(payload.sub);
      req.role = String(payload.role);
    } catch {
      /* ignore invalid tokens on public routes */
    }
  }
  next();
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Sign in to continue." });
  }
  try {
    const payload = verifyToken(header.slice(7));
    const user = store.db.users.find((u) => u.id === payload.sub);
    if (!user) return res.status(401).json({ error: "Account no longer exists." });
    req.userId = user.id;
    req.role = user.role;
    next();
  } catch {
    return res.status(401).json({ error: "Session expired. Sign in again." });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.role !== "admin") {
    return res.status(403).json({ error: "Admin only." });
  }
  next();
}
