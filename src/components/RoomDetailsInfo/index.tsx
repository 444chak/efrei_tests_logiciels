import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Room {
  id: number;
  name?: string;
  description?: string;
  capacite?: number;
}

interface RoomDetailsInfoProps {
  room: Room;
}

export function RoomDetailsInfo({ room }: RoomDetailsInfoProps) {
  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">
          {room.name ?? `Salle ${room.id}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {room.description ? (
          <div>
            <h3 className="font-semibold mb-1 text-lg">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {room.description}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground italic">
            Aucune description disponible.
          </p>
        )}

        {room.capacite !== undefined && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <span className="font-semibold">Capacité:</span>
            <span>
              {room.capacite} personne{room.capacite > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
