"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoomsList from "@/components/RoomsList";
import { BookedList } from "@/components/BookedList";
import { RoomReservationsHistory } from "@/components/RoomReservationsHistory";
import { useUserReservations } from "@/hooks/useUserReservations";
import { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const { reservations, loading, error, refresh } =
    useUserReservations("upcoming");

  const {
    reservations: historicReservations,
    loading: historicLoading,
    error: historicError,
  } = useUserReservations("history");

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

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading && !user) {
    return <div className="p-8">Chargement...</div>;
  }

  // Avoid flash of null content on redirect
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Tableau de bord
        </h1>

        <Card className="col-span-full mb-6">
          <CardHeader>
            <CardTitle>Bon retour !</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {user.user_metadata?.username || "Utilisateur"} ({user.email})
            </p>
          </CardContent>
        </Card>
        <div className="col-span-full grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {loading && reservations.length === 0 && !error ? (
            <p className="p-6 text-muted-foreground">
              Chargement des réservations...
            </p>
          ) : error ? (
            <p className="p-6 text-red-500">Erreur: {error}</p>
          ) : (
            <BookedList
              reservations={reservations}
              limit={2}
              onRefresh={refresh}
            />
          )}

          <RoomReservationsHistory
            reservations={historicReservations}
            loading={historicLoading}
            error={historicError}
            limit={2}
            showSeeAllLink={true}
            className="lg:col-span-1"
          />

          <div className="col-span-full md:col-span-2 lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold">Rooms disponibles</h2>
            <RoomsList />
          </div>
        </div>
      </div>
    </div>
  );
}
