import React from "react";
import { Reservation } from "@/types";
import { ReservationsList } from "../ReservationsList";

interface RoomReservationsListProps {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
}

export function RoomReservationsList({
  reservations,
  loading,
  error,
}: RoomReservationsListProps) {
  return (
    <ReservationsList
      reservations={reservations}
      loading={loading}
      error={error}
      title="Réservations actuelles"
      emptyMessage="Aucune réservation pour le moment."
      showStatus={true}
    />
  );
}
