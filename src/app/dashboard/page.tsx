"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoomsList from "@/components/roomsList";
import { BookedList } from "@/components/bookedList";
import { Reservation } from "@/types";
import { RoomReservationsHistory } from "@/components/roomReservationsHistory";
import { useUserReservations } from "@/hooks/useUserReservations";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const { reservations, loading, error } = useUserReservations("upcoming");

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

  // To avoid flashing null user content if redirected
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You are logged in as {user.email}
              </p>
            </CardContent>
          </Card>

          {loading && reservations.length === 0 && !error ? (
            <p className="p-6 text-muted-foreground">
              Chargement des réservations...
            </p>
          ) : error ? (
            <p className="p-6 text-red-500">Erreur: {error}</p>
          ) : (
            <BookedList reservations={reservations} limit={2} />
          )}

          <div className="md:col-span-2 lg:col-span-3">
            <RoomReservationsHistory
              reservations={historicReservations}
              loading={historicLoading}
              error={historicError}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <h2 className="mb-4 text-xl font-semibold">Rooms disponibles</h2>
            <RoomsList />
          </div>
        </div>
      </div>
    </div>
  );
}
