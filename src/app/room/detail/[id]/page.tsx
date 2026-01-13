"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Room = {
    id: number;
    name?: string;
    description?: string;
    capacite?: number;
};

export default function RoomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        let mounted = true;

        fetch(`/api/rooms/details?id=${id}`)
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    // Try to parse JSON error if possible
                    try {
                        const json = JSON.parse(text);
                        if (json.error) throw new Error(json.error);
                    } catch (e) {
                        // ignore json parse error
                    }
                    throw new Error(text || `HTTP ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (mounted) setRoom(data);
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
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Chargement...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Recherche des informations de la salle...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen p-4">
                <Card className="w-full max-w-lg border-red-500">
                    <CardHeader>
                        <CardTitle className="text-red-600">Erreur</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">{error}</p>
                        <Button onClick={() => router.back()}>Retour</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="flex justify-center items-center min-h-screen p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Introuvable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Aucune salle trouvée avec cet ID.</p>
                        <Button onClick={() => router.back()}>Retour</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="mb-6">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary/80">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Retour au tableau de bord
                    </Link>
                </Button>
            </div>

            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl">{room.name ?? `Salle ${room.id}`}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {room.description ? (
                        <div>
                            <h3 className="font-semibold mb-1 text-lg">Description</h3>
                            <p className="text-muted-foreground leading-relaxed">{room.description}</p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground italic">Aucune description disponible.</p>
                    )}

                    {room.capacite !== undefined && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                            <span className="font-semibold">Capacité:</span>
                            <span>{room.capacite} personne{room.capacite > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
