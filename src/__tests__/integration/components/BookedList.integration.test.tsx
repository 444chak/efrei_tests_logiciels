import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BookedList } from "@/components/BookedList";
import {
  mockToast,
  mockRouter,
  resetMockRouter,
} from "@/test/mocks";

vi.mock("next/navigation", async () => {
  const mocks = await import("@/test/mocks");
  return {
    useRouter: mocks.mockUseRouter,
  };
});

vi.mock("sonner", async () => {
  const mocks = await import("@/test/mocks");
  return {
    toast: mocks.mockToast,
  };
});

import { mockReservation } from "@/test/fixtures";

vi.mock("@/components/ReservationsList", () => ({
  ReservationsList: ({
    onCancel,
    reservations,
  }: {
    onCancel?: (id: number) => void;
    reservations: Array<{ id: number; rooms?: { name?: string } }>;
  }) => (
    <div data-testid="reservations-list">
      {reservations.map((res) => (
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
  const onRefreshPropMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetMockRouter();

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
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
    });

    render(
      <BookedList
        reservations={[mockReservation]}
        onRefresh={onRefreshPropMock}
      />
    );

    fireEvent.click(screen.getByTestId("cancel-btn-1"));

    const confirmButton = screen.getByText("Confirmer l'annulation");
    fireEvent.click(confirmButton);

    expect(screen.getByText("Annulation...")).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/reservations/1", {
        method: "DELETE",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      "Réservation annulée avec succès"
    );
    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(onRefreshPropMock).toHaveBeenCalled();
  });

  it("handles cancellation error", async () => {
    const originalConsoleError = console.error;
    const consoleErrorMock = vi.fn();
    console.error = consoleErrorMock;

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    try {
      render(<BookedList reservations={[mockReservation]} />);

      fireEvent.click(screen.getByTestId("cancel-btn-1"));

      const confirmButton = screen.getByText("Confirmer l'annulation");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          "Impossible d'annuler la réservation"
        );
      });

      expect(mockRouter.refresh).not.toHaveBeenCalled();

      expect(consoleErrorMock).toHaveBeenCalled();
    } finally {
      console.error = originalConsoleError;
    }
  });

  it("does nothing if cancel is aborted", async () => {
    render(<BookedList reservations={[mockReservation]} />);

    fireEvent.click(screen.getByTestId("cancel-btn-1"));

    const cancelButton = screen.getByText("Annuler");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText("Êtes-vous sûr ?")).not.toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
