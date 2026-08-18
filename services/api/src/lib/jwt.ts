import jwt from "jsonwebtoken";
import type { User } from "../types.js";

const SECRET = process.env.JWT_SECRET ?? "culturepulse-dev-secret-change-in-production";

export function signToken(user: User): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.displayName },
    SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): jwt.JwtPayload {
  return jwt.verify(token, SECRET) as jwt.JwtPayload;
}
