import { useState, useEffect } from "react";
import { Reservation } from "@/types";

type ReservationFilter = "upcoming" | "history" | "all";

export function useUserReservations(filter: ReservationFilter = "upcoming") {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchReservations = async () => {
      try {
        const res = await fetch(`/api/rooms/booked?filter=${filter}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const data = await res.json();

        // For history, we might want to ensure is_own_reservation is set if the API doesn't
        // But the API just returns what Supabase returns.
        // In the original code, history added `is_own_reservation: true`.
        // We should probably handle that in the component or here.
        // Since this fetch is literally "User's bookings", they are all "own".
        // Let's add it for consistency with the UI components that expect it.
        const formattedData = data.map((item: any) => ({
          ...item,
          is_own_reservation: true,
        }));

        if (mounted) {
          setReservations(formattedData);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message ?? String(err));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchReservations();

    return () => {
      mounted = false;
    };
  }, [filter]);

  return { reservations, loading, error };
}
