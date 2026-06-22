"use server";
import { auth }     from "@/lib/auth/server";
import { prisma }   from "@/lib/prisma";
import { redirect } from "next/navigation";

export interface SessionUser {
  id:    string;
  name:  string;
  email: string;
  image?: string | null;
}

const DEV_USER: SessionUser = {
  id:    "default",
  name:  "AYRA User",
  email: "me@ayra.local",
  image: null,
};

export async function getSession(): Promise<SessionUser | null> {
  if (!auth) return DEV_USER;          // no Neon Auth → dev mode
  try {
    const session = await auth.getSession();
    if (!session?.data?.user) return null;
    const u = session.data.user;
    return {
      id:    u.id,
      name:  u.name  ?? "AYRA User",
      email: u.email ?? "",
      image: u.image ?? null,
    };
  } catch {
    return null;
  }
}

export async function getOrCreateUser(authUser: SessionUser) {
  return prisma.user.upsert({
    where:  { id: authUser.id },
    update: { name: authUser.name, avatar: authUser.image ?? undefined },
    create: {
      id:       authUser.id,
      name:     authUser.name,
      email:    authUser.email,
      avatar:   authUser.image ?? undefined,
      password: "",
    },
  });
}

export async function requireSession(): Promise<SessionUser> {
  if (!auth) return DEV_USER;          // dev mode bypass
  const user = await getSession();
  if (!user) redirect("/auth/sign-in");
  await getOrCreateUser(user);
  return user;
}

export async function getUserIdFromRequest(req: Request): Promise<string> {
  if (!auth) {
    const { searchParams } = new URL(req.url);
    return searchParams.get("userId") ?? "default";
  }
  try {
    const session = await auth.getSession();
    if (!session?.data?.user?.id) return "default";
    const u = session.data.user;
    await getOrCreateUser({
      id:    u.id,
      name:  u.name  ?? "AYRA User",
      email: u.email ?? "",
      image: u.image ?? null,
    });
    return u.id;
  } catch {
    return "default";
  }
}