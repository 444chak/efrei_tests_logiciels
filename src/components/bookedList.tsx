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

type Reservation = {
    id: number;
    created_at: string;
    start_time: string;
    end_time: string;
    rooms: Room;
};

export default function BookedList() {
    const [reservations, setReservations] = useState<Reservation[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        fetch("/api/rooms/booked")
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || `HTTP ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (mounted) setReservations(data);
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
                    <CardTitle>Mes Réservations</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Chargement des réservations…</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Mes Réservations</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600">Erreur: {error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!reservations || reservations.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Mes Réservations</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Aucune réservation trouvée.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6 p-6">
            {reservations.map((reservation) => (
                <Link
                    key={reservation.id}
                    href={`/room/detail/${encodeURIComponent(String(reservation.rooms.id))}`}
                    className="block h-full"
                >
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>{reservation.rooms.name ?? `Room ${reservation.rooms.id}`}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {reservation.rooms.description && (
                                <p className="text-sm text-muted-foreground">{reservation.rooms.description}</p>
                            )}
                            {reservation.rooms.capacite && (
                                <p className="mt-2 text-sm">Capacité : {reservation.rooms.capacite} personne(s)</p>
                            )}
                            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                                <p>Du : {new Date(reservation.start_time).toLocaleString()}</p>
                                <p>Au : {new Date(reservation.end_time).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
