"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

export async function signUpWithEmail(
  _prev: { error: string } | null,
  formData: FormData
) {
  const name     = formData.get("name")     as string;
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;
  const confirm  = formData.get("confirm")  as string;

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const hdrs = await headers();

  const { error } = await auth.signUp.email(
    { name, email, password },
    { headers: hdrs }
  );

  if (error) {
    return { error: error.message ?? "Could not create account. Try a different email." };
  }

  redirect("/");
}
