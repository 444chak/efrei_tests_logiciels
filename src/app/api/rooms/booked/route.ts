import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "upcoming"; // 'upcoming' | 'history' | 'all'

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = supabase
    .from("reservations")
    .select("*, rooms(*)")
    .eq("id_user", user.id);

  // Apply filter
  const now = new Date().toISOString();
  if (filter === "upcoming") {
    query = query.gte("end_time", now).order("start_time", { ascending: true });
  } else if (filter === "history") {
    query = query.lt("end_time", now).order("start_time", { ascending: false });
  } else {
    // 'all'
    query = query.order("start_time", { ascending: false });
  }

  const { data: rooms, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rooms ?? [], { status: 200 });
}
