"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

export async function signInWithEmail(
  _prev: { error: string } | null,
  formData: FormData
) {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const hdrs = await headers();

  const { error } = await auth.signIn.email(
    { email, password },
    { headers: hdrs }
  );

  if (error) {
    return { error: error.message ?? "Invalid email or password." };
  }

  redirect("/");
}

export async function signOutAction() {
  const hdrs = await headers();
  await auth.signOut({ headers: hdrs });
  redirect("/auth/sign-in");
}
