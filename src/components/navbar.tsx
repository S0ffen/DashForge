"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [who, setWho] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then((r) => setWho(r.data.user?.email ?? null));
  }, []);

  async function onLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        {/* ⬇️ ważne: własny kontekst pozycjonowania i pełna struktura */}
        <NavigationMenu className="relative" viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Home</NavigationMenuTrigger>
              <NavigationMenuContent className="p-3">
                <ul className="grid gap-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/dashboard"
                        className="block rounded-md p-2 hover:bg-muted"
                      >
                        Dashboard
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/WeeklySummary"
                        className="block rounded-md p-2 hover:bg-muted"
                      >
                        Summary
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Entries</NavigationMenuTrigger>
              <NavigationMenuContent className="p-3">
                <ul className="grid gap-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/entries"
                        className="block rounded-md p-2 hover:bg-muted"
                      >
                        Entries
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* wskaźnik pozycji trigggera */}
            <NavigationMenuIndicator />
          </NavigationMenuList>

          {/* viewport MUSI być bezpośrednio pod rootem NavigationMenu */}
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {who ?? "—"}
          </span>
          <Button variant="outline" onClick={onLogout}>
            Wyloguj
          </Button>
        </div>
      </div>
    </header>
  );
}
