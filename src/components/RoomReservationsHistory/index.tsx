import React from "react";
import { cn } from "@/lib/utils";
import { Reservation } from "@/types";
import { ReservationsList } from "../ReservationsList";

interface RoomReservationsListProps {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  limit?: number;
}

export function RoomReservationsHistory({
  reservations,
  loading,
  error,
  limit,
  showSeeAllLink = false,
  className,
}: RoomReservationsListProps & {
  showSeeAllLink?: boolean;
  className?: string;
}) {
  return (
    <ReservationsList
      reservations={reservations}
      loading={loading}
      error={error}
      limit={limit}
      title="Réservations passées"
      emptyMessage="Aucune réservation pour cette salle."
      showRoomName={true}
      footerAction={
        showSeeAllLink
          ? {
              label: `Voir tout (${reservations.length})`,
              href: "/reservations/history",
            }
          : undefined
      }
      className={cn("h-full", className)}
    />
  );
}
