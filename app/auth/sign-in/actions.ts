"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function signInWithEmail(
  _prev: { error: string } | null,
  formData: FormData
) {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await auth.signIn.email({ email, password });

  if (error) {
    return { error: error.message ?? "Invalid email or password." };
  }

  redirect("/");
}

export async function signOutAction() {
  await auth.signOut();
  redirect("/auth/sign-in");
}
