// app/api/saveEvents/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

    const { start, kind, minutes, note } = await req.json();
    if (!start || !kind || !minutes)
      return Response.json({ error: "missing fields" }, { status: 400 });
    console.log("Received data:", { start, kind, minutes, note });
    const isoStart = new Date(start).toISOString(); // ważne

    const { data, error } = await supabase
      .from("calendar_events")
      .insert([{ start: isoStart, kind, minutes, note, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("DB error full:", error);
      return Response.json({ error }, { status: 400 });
    }

    return Response.json(data);
  } catch (e: any) {
    console.error("API error:", e);
    return Response.json({ error: e.message ?? "unknown" }, { status: 500 });
  }
}
