// app/(auth)/register/actions.ts
"use server";

import { createSupabaseServerClient } from "../../lib/supabase/server";

export async function register(username: string, password: string) {
  const supabase = createSupabaseServerClient();

  const fakeEmail = `${username}@login.local`;

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email: fakeEmail,
    password,
  });
  if (error) throw error;

  // powiązanie z tabelą profiles
  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    username,
  });
  if (profileError) throw profileError;

  return user;
}
