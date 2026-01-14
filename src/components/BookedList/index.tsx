import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reservation } from "@/types";
import { ReservationsList } from "../ReservationsList";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface BookedListProps {
  reservations: Reservation[];
  limit?: number;
  onRefresh?: () => void;
}

export function BookedList({
  reservations,
  limit,
  onRefresh,
}: BookedListProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCancelClick = (id: number) => {
    setDeleteId(id);
  };

  const confirmCancel = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reservations/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'annulation");
      }

      toast.success("Réservation annulée avec succès");
      router.refresh();
      onRefresh?.();
    } catch (error) {
      console.error(error);
      toast.error("Impossible d'annuler la réservation");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <ReservationsList
        reservations={reservations}
        limit={limit}
        title="Mes Réservations"
        showRoomName={true}
        linkToRoom={true}
        footerAction={{
          label: `Voir tout (${reservations.length})`,
          href: "/reservations/upcoming",
        }}
        onCancel={handleCancelClick}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela annulera votre réservation
              définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmCancel();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Annulation..." : "Confirmer l'annulation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
