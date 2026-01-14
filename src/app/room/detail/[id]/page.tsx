"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RoomReservationsList } from "@/components/RoomReservationsList";
import { RoomDetailsInfo, Room } from "@/components/RoomDetailsInfo";
import { RoomReservationForm } from "@/components/RoomReservationForm";
import { Reservation } from "@/types";

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [reservationsError, setReservationsError] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    fetch(`/api/rooms/details/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
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

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    async function fetchReservations() {
      setReservationsLoading(true);
      try {
        const res = await fetch(`/api/rooms/reservations/${id}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (mounted) {
          setReservations(data);
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setReservationsError(error.message);
        }
      } finally {
        if (mounted) {
          setReservationsLoading(false);
        }
      }
    }

    fetchReservations();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Chargement...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Recherche des informations de la salle...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
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
      <div className="flex min-h-screen items-center justify-center p-4">
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
    <div className="container mx-auto max-w-7xl p-6 md:p-10">
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

      <div className="mb-10">
        <RoomDetailsInfo room={room} />
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4 xl:col-span-4">
          <div className="sticky top-6">
            <RoomReservationForm
              roomId={room.id}
              onReservationSuccess={async () => {
                if (!id) return;
                setReservationsLoading(true);
                try {
                  const res = await fetch(`/api/rooms/reservations/${id}`);
                  if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || `HTTP ${res.status}`);
                  }
                  const data = await res.json();
                  setReservations(data);
                } catch (err) {
                  const error = err instanceof Error ? err : new Error(String(err));
                  setReservationsError(error.message);
                } finally {
                  setReservationsLoading(false);
                }
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-8">
          <RoomReservationsList
            reservations={reservations}
            loading={reservationsLoading}
            error={reservationsError}
          />
        </div>
      </div>
    </div>
  );
}
