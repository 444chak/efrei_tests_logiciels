"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RoomReservationFormProps {
  roomId: number;
  onReservationSuccess: () => void;
}

export function RoomReservationForm({
  roomId,
  onReservationSuccess,
}: RoomReservationFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState("30");
  const [loading, setLoading] = useState(false);

  // Generate time slots every 30 mins
  const timeSlots = [];
  for (let i = 8; i < 20; i++) {
    timeSlots.push(`${i.toString().padStart(2, "0")}:00`);
    timeSlots.push(`${i.toString().padStart(2, "0")}:30`);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Veuillez sélectionner une date.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/rooms/reservations/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(date, "yyyy-MM-dd"), // Send date as text to avoid timezone shifts
          time,
          duration: parseInt(duration),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la réservation");
      }

      toast.success("Réservation effectuée avec succès !");
      onReservationSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Réserver un créneau</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label>Date</Label>
            <div className="border rounded-md p-2 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                fromDate={new Date()}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                locale={fr}
                weekStartsOn={1}
                className="rounded-md border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Heure de début</Label>
              <select
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {timeSlots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée</Label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="30">30 min</option>
                <option value="60">1h</option>
                <option value="90">1h 30</option>
                <option value="120">2h</option>
                <option value="180">3h</option>
                <option value="240">4h</option>
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Réservation en cours..." : "Réserver"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
