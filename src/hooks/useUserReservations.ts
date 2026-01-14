import { useState, useEffect } from "react";
import { Reservation } from "@/types";

type ReservationFilter = "upcoming" | "history" | "all";

export function useUserReservations(filter: ReservationFilter = "upcoming") {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

        const formattedData = (data as Reservation[]).map((item) => ({
          ...item,
          is_own_reservation: true,
        }));

        if (mounted) {
          setReservations(formattedData);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          const errorMessage =
            err instanceof Error ? err.message : String(err);
          setError(errorMessage);
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
  }, [filter, refreshTrigger]);

  const refresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return { reservations, loading, error, refresh };
}
