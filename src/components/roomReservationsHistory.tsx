import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { User } from "@supabase/supabase-js";
import { formatDate, formatTime } from "@/lib/utils";
import { Reservation } from "@/types";

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
        <CardTitle className="text-2xl md:text-3xl">
          Réservations passées
        </CardTitle>
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
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  res.is_own_reservation
                    ? "bg-primary/5 hover:bg-primary/10"
                    : "hover:bg-muted/50"
                }`}
              >
                <p>
                  <strong>Nom de la salle :</strong>{" "}
                  {res.rooms?.name || `Salle ${res.room_id}`}
                </p>
                <p>
                  <strong>Début:</strong> {formatDate(res.start_time)} •{" "}
                  {formatTime(res.start_time)}
                </p>
                <p>
                  <strong>Fin:</strong> {formatDate(res.end_time)} •{" "}
                  {formatTime(res.end_time)}
                </p>
              </div>
            ))}
            {showSeeAllLink && (
              <div className="p-4 text-center">
                <a
                  href="/reservations/history"
                  className="text-blue-600 hover:underline"
                >
                  Voir tout
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
