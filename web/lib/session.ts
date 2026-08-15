import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { db } from "@/db/drizzle";
import { sessions } from "@/db/schema";
import { cache } from "react";

const SESSION_COOKIE = "sliit_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getEncodedKey() {
  const secretKey = process.env.SESSION_SECRET;
  if (!secretKey) throw new Error("SESSION_SECRET env var is not set");
  return new TextEncoder().encode(secretKey);
}

async function encryptSessionId(sessionId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  return new SignJWT({ sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getEncodedKey());
}

async function decryptSessionId(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    return (payload as { sessionId: string }).sessionId ?? null;
  } catch {
    return null;
  }
}

export async function createSession(
  userId: string,
  accessToken: string,
  refreshToken?: string,
  displayName?: string,
) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

  const [existing] = await db
    .select({ id: sessions.id, displayName: sessions.displayName })
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .limit(1);

  let sessionId: string;

  if (existing) {
    sessionId = existing.id;
    await db
      .update(sessions)
      .set({
        accessToken,
        refreshToken: refreshToken ?? null,
        // Don't blank out a name captured previously if this login doesn't carry one.
        displayName: displayName ?? existing.displayName,
        expiresAt,
        lastLoginAt: now,
        loggedOutAt: null,
      })
      .where(eq(sessions.userId, userId));
  } else {
    sessionId = crypto.randomUUID();
    await db.insert(sessions).values({
      id: sessionId,
      userId,
      accessToken,
      refreshToken: refreshToken ?? null,
      displayName: displayName ?? null,
      expiresAt,
      lastLoginAt: now,
    });
  }

  const encrypted = await encryptSessionId(sessionId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export const getSession = cache(async function getSession() {
  await connection();

  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  const sessionId = await decryptSessionId(cookie);
  if (!sessionId) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), isNull(sessions.loggedOutAt)))
    .limit(1);

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db
      .update(sessions)
      .set({ loggedOutAt: new Date() })
      .where(eq(sessions.id, sessionId));
    return null;
  }

  return session;
});

export async function deleteSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE)?.value;

  if (cookie) {
    const sessionId = await decryptSessionId(cookie);
    if (sessionId) {
      await db
        .update(sessions)
        .set({ loggedOutAt: new Date() })
        .where(eq(sessions.id, sessionId));
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}
