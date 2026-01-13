import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { User } from "@supabase/supabase-js";

export interface Reservation {
  id: number;
  room_id: number;
  user_id: string;
  start_time: string;
  end_time: string;
  status: string;
  is_own_reservation: boolean;
  rooms?: {
    id: number;
    name: string;
  };
}

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
}: RoomReservationsListProps & { showSeeAllLink?: boolean }) {
  const displayedReservations = limit
    ? reservations.slice(0, limit)
    : reservations;

  return (
    <Card className="max-w-3xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">Réservations passées</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <p className="text-muted-foreground">
            Chargement des réservations...
          </p>
        )}
        {error && <p className="text-red-500">Erreur: {error}</p>}

        {!loading && !error && reservations.length === 0 && (
          <p className="text-muted-foreground italic">
            Aucune réservation pour cette salle.
          </p>
        )}

        {!loading && !error && displayedReservations.length > 0 && (
          <div className="divide-y divide-border rounded-md border text-sm">
            {displayedReservations.map((res) => (
              <div
                key={res.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${res.is_own_reservation
                  ? "bg-primary/5 hover:bg-primary/10"
                  : "hover:bg-muted/50"
                  }`}
              >
                <p>
                  <strong>Nom de la salle :</strong>{" "}
                  {res.rooms?.name || `Salle ${res.room_id}`}
                </p>
                <p>
                  <strong>Début:</strong>{" "}
                  {new Date(res.start_time).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>
                  <strong>Fin:</strong>{" "}
                  {new Date(res.end_time).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
            {showSeeAllLink && (
              <div className="p-4 text-center">
                <a href="/reservations/history" className="text-blue-600 hover:underline">Voir tout</a>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
