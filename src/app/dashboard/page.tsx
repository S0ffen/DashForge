"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import Navbar from "@/components/navbar";
import { Calendar } from "@/components/ui/calendar";
export default function Dashboard() {
  const [who, setWho] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then((r) => setWho(r.data.user?.email ?? null));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl p-4"></main>
    </>
  );
}
