"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Możesz kontrolować domenę loginów przez ENV
const PSEUDO_DOMAIN = process.env.NEXT_PUBLIC_LOGIN_DOMAIN ?? "dashforge.com";

function toEmail(input: string) {
  const v = (input || "").trim();
  return v.includes("@")
    ? v.toLowerCase()
    : `${v}@${PSEUDO_DOMAIN}`.toLowerCase();
}

export default function LoginPage() {
  const [loginOrEmail, setLoginOrEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [who, setWho] = useState<string | null>(null);

  const router = useRouter();

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const email = toEmail(loginOrEmail);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      setMsg(`❌ Błąd: ${error.message}`);
    } else {
      const u = await supabase.auth.getUser();
      setWho(u.data.user?.email ?? null);
      setMsg("✅ Zalogowano");
      router.push("/dashboard");
    }
  }

  async function onLogout() {
    await supabase.auth.signOut();
    setWho(null);
    setMsg("👋 Wylogowano");
  }

  useEffect(() => {
    supabase.auth.getUser().then((r) => setWho(r.data.user?.email ?? null));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            Logowanie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Email lub login</Label>
              <Input
                id="login"
                value={loginOrEmail}
                onChange={(e) => setLoginOrEmail(e.target.value)}
                placeholder="np. Adrian"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="********"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Zaloguj
            </Button>
          </form>

          <Button
            variant="ghost"
            className="w-full mt-2 text-sm"
            type="button"
            onClick={onLogout}
          >
            Wyloguj
          </Button>

          {msg && (
            <Alert className="mt-4">
              <AlertDescription>{msg}</AlertDescription>
            </Alert>
          )}

          <p className="mt-4 text-sm text-gray-600 text-center">
            Zalogowany jako: {who ?? "—"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
