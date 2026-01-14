"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookedList } from "@/components/BookedList";
import { useUserReservations } from "@/hooks/useUserReservations";

export default function UpcomingReservationsPage() {
  const router = useRouter();
  const { reservations, loading, error, refresh } =
    useUserReservations("upcoming");

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Retour au tableau de bord</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Mes Réservations à venir
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-muted-foreground animate-pulse">
              Chargement des réservations...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-lg border border-red-100">
            Erreur: {error}
          </div>
        ) : (
          <div className="grid gap-6">
            <BookedList reservations={reservations} onRefresh={refresh} />
          </div>
        )}
      </div>
    </div>
  );
}
