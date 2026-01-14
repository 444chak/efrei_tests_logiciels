import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RoomReservationForm } from "@/components/RoomReservationForm";
import { toast } from "sonner";

import { mockToast } from "@/test/mocks";

vi.mock("sonner", async () => {
  const mocks = await import("@/test/mocks");
  return {
    toast: mocks.mockToast,
  };
});

vi.mock("@/components/ui/calendar", () => {
  return {
    Calendar: ({ onSelect, selected, disabled }: any) => (
      <div data-testid="mock-calendar">
        <span data-testid="selected-date">
          {selected ? selected.toString() : "No Date"}
        </span>
        <button type="button" onClick={() => onSelect(undefined)}>
          Clear Date
        </button>
        <button type="button" onClick={() => onSelect(new Date(2023, 0, 2))}>
          Select Jan 2
        </button>
        <div data-testid="disabled-check">
          {disabled &&
          disabled(new Date(new Date().setHours(0, 0, 0, 0) - 86400000))
            ? "Yesterday Disabled"
            : "Yesterday Enabled"}
        </div>
      </div>
    ),
  };
});

global.fetch = vi.fn();

describe("RoomReservationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date(2023, 0, 1));
  });

  it("renders reservation form elements", () => {
    render(<RoomReservationForm roomId={1} onReservationSuccess={() => {}} />);
    expect(screen.getByText("Réserver un créneau")).toBeInTheDocument();
    expect(screen.getByText("Réserver")).toBeInTheDocument();
  });

  it("shows error if date is not selected", async () => {
    render(<RoomReservationForm roomId={1} onReservationSuccess={() => {}} />);

    const clearBtn = screen.getByText("Clear Date");
    fireEvent.click(clearBtn);

    const submitBtn = screen.getByText("Réserver");
    fireEvent.click(submitBtn);

    expect(mockToast.error).toHaveBeenCalledWith(
      "Veuillez sélectionner une date."
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("handles successful reservation", async () => {
    const onSuccess = vi.fn();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<RoomReservationForm roomId={1} onReservationSuccess={onSuccess} />);

    const submitBtn = screen.getByText("Réserver");
    fireEvent.click(submitBtn);

    expect(screen.getByText("Réservation en cours...")).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/rooms/reservations/1",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("2023-01-01"),
        })
      );
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      "Réservation effectuée avec succès !"
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it("handles API error", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Créneau indisponible" }),
    });

    render(<RoomReservationForm roomId={1} onReservationSuccess={() => {}} />);

    const submitBtn = screen.getByText("Réserver");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Créneau indisponible");
    });
  });

  it("handles API error with default message", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<RoomReservationForm roomId={1} onReservationSuccess={() => {}} />);

    const submitBtn = screen.getByText("Réserver");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Erreur lors de la réservation"
      );
    });
  });

  it("handles network error", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network Error"));

    render(<RoomReservationForm roomId={1} onReservationSuccess={() => {}} />);

    const submitBtn = screen.getByText("Réserver");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Network Error");
    });
  });
  it("includes selected time and duration in reservation", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<RoomReservationForm roomId={1} onReservationSuccess={() => {}} />);

    fireEvent.click(screen.getByText("Select Jan 2"));

    const timeSelect = screen.getByLabelText("Heure de début");
    fireEvent.change(timeSelect, { target: { value: "14:00" } });

    const durationSelect = screen.getByLabelText("Durée");
    fireEvent.change(durationSelect, { target: { value: "120" } });

    const submitBtn = screen.getByText("Réserver");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/rooms/reservations/1",
        expect.objectContaining({
          body: expect.stringContaining('"time":"14:00"'),
        })
      );
    });
  });
  it("disables past dates", () => {
    render(<RoomReservationForm roomId={1} onReservationSuccess={() => {}} />);
    expect(screen.getByText("Yesterday Disabled")).toBeInTheDocument();
  });
});
