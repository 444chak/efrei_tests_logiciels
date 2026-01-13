import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export interface Reservation {
  id: number;
  id_room: number;
  user_id: string;
  start_time: string;
  end_time: string;
  is_own_reservation: boolean;
}

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
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Réservations actuelles
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground animate-pulse">Chargement...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
            Erreur: {error}
          </div>
        )}

        {!loading && !error && reservations.length === 0 && (
          <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg">
            <p>Aucune réservation pour le moment.</p>
          </div>
        )}

        {!loading && !error && reservations.length > 0 && (
          <div className="divide-y divide-border rounded-md border text-sm">
            {reservations.map((res) => (
              <div
                key={res.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  res.is_own_reservation
                    ? "bg-primary/5 hover:bg-primary/10"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {new Date(
                        res.start_time.endsWith("Z")
                          ? res.start_time
                          : res.start_time + "Z"
                      ).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                    <span className="text-muted-foreground hidden sm:inline">
                      •
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(
                        res.start_time.endsWith("Z")
                          ? res.start_time
                          : res.start_time + "Z"
                      ).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })}
                      {" - "}
                      {new Date(
                        res.end_time.endsWith("Z")
                          ? res.end_time
                          : res.end_time + "Z"
                      ).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })}
                    </span>
                  </div>
                  {res.is_own_reservation && (
                    <p className="text-xs text-primary font-medium">
                      ✨ Votre réservation
                    </p>
                  )}
                  {!res.is_own_reservation && (
                    <p className="text-xs text-muted-foreground">
                      Réservé par un autre utilisateur
                    </p>
                  )}
                </div>

                {/* Status Indicator (Optional Visual) */}
                <div className="flex items-center">
                  <span
                    className={`inline-flex h-2.5 w-2.5 rounded-full ${
                      res.is_own_reservation ? "bg-primary" : "bg-red-400"
                    }`}
                  ></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
