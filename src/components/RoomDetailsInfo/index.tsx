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
    <Card className="mx-auto max-w-7xl">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">
          {room.name ?? `Salle ${room.id}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {room.description ? (
          <div>
            <h3 className="mb-1 text-lg font-semibold">Description</h3>
            <p className="leading-relaxed text-muted-foreground">
              {room.description}
            </p>
          </div>
        ) : (
          <p className="italic text-muted-foreground">
            Aucune description disponible.
          </p>
        )}

        {room.capacite !== undefined && (
          <div className="mt-4 flex items-center gap-2 border-t pt-4">
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
