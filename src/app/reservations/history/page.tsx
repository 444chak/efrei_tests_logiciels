"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RoomReservationsHistory } from "@/components/RoomReservationsHistory";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUserReservations } from "@/hooks/useUserReservations";

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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

  const { reservations, loading, error } = useUserReservations("history");

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
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
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
