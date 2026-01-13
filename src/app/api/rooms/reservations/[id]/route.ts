import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await createClient();
  const { data: reservations, error } = await supabase
    .from("reservations") // Assumed table name 'reservations'
    .select("*")
    .eq("id_room", id); // Filter by room_id

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reservationsWithOwnership = reservations?.map((res) => ({
    ...res,
    is_own_reservation: user ? res.id_user === user.id : false,
  }));

  return NextResponse.json(reservationsWithOwnership || [], { status: 200 });
}
