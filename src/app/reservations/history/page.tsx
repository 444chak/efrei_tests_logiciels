"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RoomReservationsHistory, Reservation as HistoricReservation } from "@/components/roomReservationsHistory";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HistoryPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [reservations, setReservations] = useState<HistoricReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function checkUser() {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            if (mounted) setUser(user);
        }

        checkUser();

        // Fetch all historic reservations (no limit)
        fetch("/api/rooms/booked/historic/")
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (mounted) {
                    const formattedData = data.map((item: any) => ({
                        ...item,
                        is_own_reservation: true,
                    }));
                    setReservations(formattedData);
                }
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
    }, [router]);

    if (loading && !user) return <div className="p-8">Chargement...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mb-8">
                <Button
                variant="ghost"
                asChild
                className="pl-0 hover:bg-transparent hover:text-primary/80"
                >
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour au tableau de bord
                </Link>
                </Button>
            </div>
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-8 text-3xl font-bold text-gray-900">
                    Historique complet
                </h1>
                <RoomReservationsHistory
                    reservations={reservations}
                    loading={loading}
                    error={error}
                // No limit, no see all link
                />
            </div>
        </div>
    );
}
