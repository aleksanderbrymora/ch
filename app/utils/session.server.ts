import { createCookieSessionStorage, redirect } from "remix";
import { db } from "./db.server";
import argon from "argon2";

interface LoginForm {
  username: string;
  password: string;
}

export const login = async ({ username, password }: LoginForm) => {
  const found = await db.user.findUnique({ where: { username } });
  if (!found) return null;
  const passwordMatch = await argon.verify(found.passwordHash, password);
  return !passwordMatch ? null : found;
};

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export const createUserSession = async (userId: string, redirectTo: string) => {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
};

export const getUserSession = (request: Request) =>
  storage.getSession(request.headers.get("Cookie"));

export const getUserId = async (request: Request) => {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
};

export const requireUserId = async (request: Request) => {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") throw redirect(`/login`);
  return userId;
};

export const getUser = async (request: Request) => {
  const userId = await getUserId(request);
  if (typeof userId !== "string") return null;
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });
    return user;
  } catch {
    throw logout(request);
  }
};

export const logout = async (request: Request) => {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
};

export const register = async ({ username, password }: LoginForm) => {
  const passwordHash = await argon.hash(password);
  return db.user.create({ data: { username, passwordHash } });
};
