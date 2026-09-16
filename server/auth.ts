import { randomUUID } from "crypto";
import { storage } from "./storage";
import type { Request, Response, NextFunction } from "express";

type Session = {
  token: string;
  userId: string;
  roles: string[];
  createdAt: string;
};

const sessions = new Map<string, Session>();

export async function createSessionForUser(userId: string) {
  const token = randomUUID();
  const roles = (await storage.getUserRoles(userId)).map(r => r.name);
  const s: Session = { token, userId, roles, createdAt: new Date().toISOString() };
  sessions.set(token, s);
  return s;
}

export function getSession(token: string) {
  return sessions.get(token);
}

export async function loginHandler(req: Request, res: Response) {
  const { username, password } = req.body ?? {};
  if (!username || !password) return res.status(400).json({ message: "username and password required" });

  const user = await storage.getUserByUsername(username);
  if (!user || (user as any).password !== password) {
    return res.status(401).json({ message: "invalid credentials" });
  }

  const session = await createSessionForUser(user.id);
  return res.json({ token: session.token, userId: user.id, roles: session.roles });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "missing token" });
    const token = auth.split(" ")[1];
    const s = getSession(token);
    if (!s) return res.status(401).json({ message: "invalid token" });
    (req as any).user = { id: s.userId, roles: s.roles };
    next();
  } catch (err) {
    return res.status(500).json({ message: "auth error" });
  }
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "not authenticated" });
    if (!Array.isArray(user.roles) || !user.roles.includes(role)) {
      return res.status(403).json({ message: "forbidden" });
    }
    next();
  };
}

export function debugSessions() {
  return Array.from(sessions.values());
}
