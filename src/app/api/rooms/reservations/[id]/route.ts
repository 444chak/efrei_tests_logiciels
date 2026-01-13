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
    .eq("id_room", id)
    .gte("end_time", new Date().toISOString()) // Only show current/future reservations
    .order("start_time", { ascending: true }); // Order by start time

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
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { date, time, duration } = body;

    // Validation: Duration must be multiple of 30 minutes
    if (!duration || duration <= 0 || duration % 30 !== 0) {
      return NextResponse.json(
        { error: "La durée doit être un multiple de 30 minutes." },
        { status: 400 }
      );
    }

    // Parse date (YYYY-MM-DD) and time (HH:MM) to create UTC Timestamps
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);

    // Create UTC date (Month is 0-indexed in Date.UTC)
    const startTimestamp = Date.UTC(year, month - 1, day, hours, minutes, 0);
    const startDate = new Date(startTimestamp);

    // Validation: Date must be in the future
    // Allow a small grace period (e.g. 1 minute) for network latency
    if (startDate.getTime() < Date.now() - 60000) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas réserver dans le passé." },
        { status: 400 }
      );
    }

    const endDate = new Date(startTimestamp + duration * 60000);

    // Check for overlaps
    const { data: existingReservations, error: fetchError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id_room", id)
      .lt("start_time", endDate.toISOString())
      .gt("end_time", startDate.toISOString());

    if (fetchError) throw fetchError;

    if (existingReservations && existingReservations.length > 0) {
      return NextResponse.json(
        { error: "Ce créneau est déjà réservé par quelqu'un d'autre." },
        { status: 409 }
      );
    }

    // Insert reservation
    const { error } = await supabase.from("reservations").insert({
      id_room: id,
      id_user: user.id,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
