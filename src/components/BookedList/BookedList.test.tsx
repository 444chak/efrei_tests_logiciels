import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BookedList } from "./index";
import { Reservation } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { mockReservation } from "@/test/fixtures";

vi.mock("../ReservationsList", () => ({
  ReservationsList: ({ onCancel, reservations }: any) => (
    <div data-testid="reservations-list">
      {reservations.map((res: any) => (
        <div key={res.id}>
          <span>{res.rooms?.name}</span>
          <button
            onClick={() => onCancel(res.id)}
            data-testid={`cancel-btn-${res.id}`}
          >
            Cancel {res.id}
          </button>
        </div>
      ))}
    </div>
  ),
}));

describe("BookedList", () => {
  const refreshMock = vi.fn();
  const onRefreshPropMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      refresh: refreshMock,
    });

    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the list via ReservationsList", () => {
    render(<BookedList reservations={[mockReservation]} />);
    expect(screen.getByTestId("reservations-list")).toBeInTheDocument();
    expect(screen.getByText("Salle Test")).toBeInTheDocument();
  });

  it("opens the confirmation dialog when cancel is clicked", () => {
    render(<BookedList reservations={[mockReservation]} />);

    fireEvent.click(screen.getByTestId("cancel-btn-1"));

    expect(screen.getByText("Êtes-vous sûr ?")).toBeInTheDocument();
    expect(
      screen.getByText(/Cette action est irréversible/i)
    ).toBeInTheDocument();
  });

  it("handles successful cancellation", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    render(
      <BookedList
        reservations={[mockReservation]}
        onRefresh={onRefreshPropMock}
      />
    );

    // Open dialog
    fireEvent.click(screen.getByTestId("cancel-btn-1"));

    // Click confirm in dialog
    const confirmButton = screen.getByText("Confirmer l'annulation");
    fireEvent.click(confirmButton);

    // Verify loading state if visible
    expect(screen.getByText("Annulation...")).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/reservations/1", {
        method: "DELETE",
      });
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Réservation annulée avec succès"
    );
    expect(refreshMock).toHaveBeenCalled();
    expect(onRefreshPropMock).toHaveBeenCalled();
  });

  it("handles cancellation error", async () => {
    const originalConsoleError = console.error;
    const consoleErrorMock = vi.fn();
    console.error = consoleErrorMock;

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    try {
      render(<BookedList reservations={[mockReservation]} />);

      fireEvent.click(screen.getByTestId("cancel-btn-1"));

      const confirmButton = screen.getByText("Confirmer l'annulation");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Impossible d'annuler la réservation"
        );
      });

      expect(refreshMock).not.toHaveBeenCalled();

      expect(consoleErrorMock).toHaveBeenCalled();
    } finally {
      console.error = originalConsoleError;
    }
  });

  it("does nothing if cancel is aborted", async () => {
    render(<BookedList reservations={[mockReservation]} />);

    // Open dialog
    fireEvent.click(screen.getByTestId("cancel-btn-1"));

    // Click cancel in dialog
    const cancelButton = screen.getByText("Annuler");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText("Êtes-vous sûr ?")).not.toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
