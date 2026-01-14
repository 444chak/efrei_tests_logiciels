import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime, cn } from "@/lib/utils";
import { Reservation } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface ReservationsListProps {
  reservations: Reservation[];
  loading?: boolean;
  error?: string | null;
  limit?: number;
  title?: string;
  emptyMessage?: string;
  showRoomName?: boolean;
  showDescription?: boolean;
  showStatus?: boolean; // ownership status
  linkToRoom?: boolean; // wrap item in link to room detail
  footerAction?: {
    label: string;
    href: string;
  };
  className?: string;
  onCancel?: (id: number) => void;
}

export function ReservationsList({
  reservations,
  loading = false,
  error = null,
  limit,
  title,
  emptyMessage = "Aucune réservation trouvée.",
  showRoomName = false,
  showDescription = false,
  showStatus = false,
  linkToRoom = false,
  footerAction,
  className,
  onCancel,
}: ReservationsListProps) {
  const displayedReservations = limit
    ? reservations.slice(0, limit)
    : reservations;

  return (
    <Card className={cn("w-full shadow-sm", className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
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
            <p>{emptyMessage}</p>
          </div>
        )}

        {!loading && !error && displayedReservations.length > 0 && (
          <div className="divide-y divide-border rounded-md border text-sm">
            {displayedReservations.map((res) => {
              const isInteractive = !!onCancel;

              const content = (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    {showRoomName && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">
                          {linkToRoom && isInteractive && res.rooms?.id ? (
                            <Link
                              href={`/room/detail/${encodeURIComponent(
                                String(res.rooms.id)
                              )}`}
                              className="hover:underline"
                            >
                              {res.rooms?.name ||
                                `Salle ${res.room_id || res.id_room}`}
                            </Link>
                          ) : (
                            res.rooms?.name ||
                            `Salle ${res.room_id || res.id_room}`
                          )}
                        </span>
                      </div>
                    )}

                    {showDescription && res.rooms?.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {res.rooms.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span
                        className={cn(
                          showRoomName ? "" : "font-medium text-foreground"
                        )}
                      >
                        {formatDate(res.start_time)}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>
                        {formatTime(res.start_time)}
                        {" - "}
                        {formatTime(res.end_time)}
                      </span>
                    </div>

                    {showStatus && res.is_own_reservation && (
                      <p className="text-xs text-primary font-medium">
                        ✨ Votre réservation
                      </p>
                    )}
                    {showStatus && !res.is_own_reservation && (
                      <p className="text-xs text-muted-foreground">
                        Réservé par un autre utilisateur
                      </p>
                    )}
                  </div>

                  {onCancel && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                      aria-label="Annuler la réservation"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onCancel(res.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );

              const wrapperClass = cn(
                "block p-4 transition-colors",
                linkToRoom && !isInteractive ? "hover:bg-muted/50" : "",
                showStatus && res.is_own_reservation && !linkToRoom
                  ? "bg-primary/5 hover:bg-primary/10"
                  : "",
                showStatus && !res.is_own_reservation && !linkToRoom
                  ? "hover:bg-muted/50"
                  : ""
              );

              if (linkToRoom && !isInteractive && res.rooms?.id) {
                return (
                  <Link
                    key={res.id}
                    href={`/room/detail/${encodeURIComponent(
                      String(res.rooms.id)
                    )}`}
                    className={wrapperClass}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div key={res.id} className={wrapperClass}>
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {!loading &&
        !error &&
        footerAction &&
        limit &&
        reservations.length > limit && (
          <div className="p-4 pt-0 border-t flex justify-end">
            <Link
              href={footerAction.href}
              className="text-sm text-primary hover:underline font-medium mt-4 inline-block"
            >
              {footerAction.label}
            </Link>
          </div>
        )}
    </Card>
  );
}
