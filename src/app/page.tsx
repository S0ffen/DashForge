import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server"; // klient SSR

export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  // jeśli brak usera → na login
  if (!user) {
    redirect("/login");
  }

  // jeśli jest user → na dashboard
  redirect("/dashboard");
}
