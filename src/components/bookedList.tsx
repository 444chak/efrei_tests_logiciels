"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Room = {
  id: number;
  name?: string;
  description?: string;
  capacite?: number;
};

export interface Reservation {
  id: number;
  created_at: string;
  start_time: string;
  end_time: string;
  rooms: Room;
}

interface BookedListProps {
  reservations: Reservation[];
  limit?: number;
}

export function BookedList({ reservations, limit }: BookedListProps) {
  const displayedReservations = limit
    ? reservations.slice(0, limit)
    : reservations;

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Mes Réservations</CardTitle>
      </CardHeader>
      <CardContent>
        {!reservations || reservations.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg">
            <p>Aucune réservation trouvée.</p>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-md border text-sm">
            {displayedReservations.map((reservation) => (
              <Link
                key={reservation.id}
                href={`/room/detail/${encodeURIComponent(
                  String(reservation.rooms.id)
                )}`}
                className="block hover:bg-muted/50 transition-colors"
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">
                        {reservation.rooms.name ??
                          `Room ${reservation.rooms.id}`}
                      </span>
                    </div>
                    {reservation.rooms.description && (
                      <p className="text-xs text-muted-foreground">
                        {reservation.rooms.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>
                        {new Date(reservation.start_time).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>
                        {new Date(reservation.start_time).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                        {" - "}
                        {new Date(reservation.end_time).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
      {limit && reservations.length > limit && (
        <div className="p-4 pt-0 border-t flex justify-end">
          <Link
            href="/reservations/upcoming"
            className="text-sm text-primary hover:underline font-medium mt-4 inline-block"
          >
            Voir tout ({reservations.length})
          </Link>
        </div>
      )}
    </Card>
  );
}
