import { NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

    const { id } = await params;
    console.log("Updating event id:", id);
    const { start, kind, minutes, note } = await req.json();

    console.log("Received data:", { start, kind, minutes, note });

    if (!start || !kind || !minutes)
      return Response.json({ error: "missing fields" }, { status: 400 });

    const isoStart = new Date(start).toISOString();

    const { data, error } = await supabase
      .from("calendar_events")
      .update({
        start: isoStart,
        kind,
        minutes,
        note,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id) // zabezpieczenie – edytuje tylko swoje
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
