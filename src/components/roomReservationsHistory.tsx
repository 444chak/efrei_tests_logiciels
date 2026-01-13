import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { User } from "@supabase/supabase-js";

import { Reservation } from "@/types";

interface RoomReservationsListProps {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
}

export function RoomReservationsHistory({
  reservations,
  loading,
  error,
}: RoomReservationsListProps) {
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

        {!loading && !error && reservations.length > 0 && (
          <div className="grid gap-4">
            {reservations.map((res) => (
              <div
                key={res.id}
                className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm"
              >
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
                <strong>Statut: </strong>
                {res.is_own_reservation ? (
                  <span className="text-green-600 font-semibold mt-2">
                    Réservé par vous
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold mt-2">
                    Réservé par quelqu'un d'autre
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
