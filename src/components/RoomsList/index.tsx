"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Room = {
  id: number;
  name?: string;
  description?: string;
  capacite?: number;
};

export default function RoomsList() {
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/rooms")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (mounted) setRooms(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message ?? String(err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement des rooms…</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Erreur: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucune room disponible.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <Link
          key={room.id}
          href={`/room/detail/${encodeURIComponent(String(room.id))}`}
          className="block h-full"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{room.name ?? `Room ${room.id}`}</CardTitle>
            </CardHeader>
            <CardContent>
              {room.description && (
                <p className="text-sm text-muted-foreground">
                  {room.description}
                </p>
              )}
              {room.capacite && (
                <p className="mt-2 text-sm">
                  Capacité : {room.capacite} personne(s)
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
