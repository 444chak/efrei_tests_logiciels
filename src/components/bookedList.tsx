import React from "react";
import { Reservation } from "@/types";
import { ReservationsList } from "./reservations-list";

interface BookedListProps {
  reservations: Reservation[];
  limit?: number;
}

export function BookedList({ reservations, limit }: BookedListProps) {
  return (
    <ReservationsList
      reservations={reservations}
      limit={limit}
      title="Mes Réservations"
      showRoomName={true}
      linkToRoom={true}
      footerAction={{
        label: `Voir tout (${reservations.length})`,
        href: "/reservations/upcoming",
      }}
    />
  );
}
