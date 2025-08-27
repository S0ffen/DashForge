import { NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .order("start", { ascending: false });
  console.log(data, error);
  return Response.json(data ?? []);
}
