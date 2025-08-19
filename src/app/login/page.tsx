"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client"; // lub "../lib/supabase/client"

// można sterować domeną z env, fallback na dashforge.com
const PSEUDO_DOMAIN = process.env.NEXT_PUBLIC_LOGIN_DOMAIN ?? "dashforge.com";

function toEmail(input: string) {
  const v = (input || "").trim();
  return v.includes("@")
    ? v.toLowerCase()
    : `${v}@${PSEUDO_DOMAIN}`.toLowerCase();
}

export default function LoginPage() {
  const [loginOrEmail, setLoginOrEmail] = useState("adrian");
  const [pass, setPass] = useState("Test4321!");
  const [msg, setMsg] = useState<string | null>(null);
  const [who, setWho] = useState<string | null>(null);

  const router = useRouter(); // ⬅️ do nawigacji

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const email = toEmail(loginOrEmail);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      setMsg(`Błąd: ${error.message}`);
    } else {
      setMsg("Zalogowano ✅");
      // pobierz usera
      const u = await supabase.auth.getUser();
      setWho(u.data.user?.email ?? null);
      // ⬅️ przekierowanie np. do /dashboard
      router.push("/dashboard");
    }
  }

  async function onLogout() {
    await supabase.auth.signOut();
    setWho(null);
    setMsg("Wylogowano");
  }

  useEffect(() => {
    supabase.auth.getUser().then((r) => setWho(r.data.user?.email ?? null));
  }, []);

  return (
    <main className="max-w-sm mx-auto p-6 space-y-3">
      <h1 className="text-xl font-semibold">Logowanie (email lub login)</h1>

      <form onSubmit={onLogin} className="flex flex-col gap-2">
        <input
          className="border p-2 rounded"
          value={loginOrEmail}
          onChange={(e) => setLoginOrEmail(e.target.value)}
          placeholder="Email lub login (np. Adrian)"
        />
        <input
          className="border p-2 rounded"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Hasło"
        />
        <button className="bg-black text-white rounded p-2">Zaloguj</button>
      </form>

      <button className="underline text-sm" onClick={onLogout}>
        Wyloguj
      </button>

      {msg && <p>{msg}</p>}
      <p className="text-sm text-gray-600">Zalogowany jako: {who ?? "—"}</p>
    </main>
  );
}
