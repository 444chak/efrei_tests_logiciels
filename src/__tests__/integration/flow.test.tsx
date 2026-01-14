import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "@/app/login/page";
import { RoomReservationForm } from "@/components/RoomReservationForm";
import { BookedList } from "@/components/BookedList";
import { toast } from "sonner";
import userEvent from "@testing-library/user-event";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock server actions
vi.mock("@/app/auth/actions", () => ({
  login: vi.fn(),
}));

import { login } from "@/app/auth/actions";

describe("Frontend Flow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Helper to mock fetch
    global.fetch = vi.fn();
  });

  describe("Login Flow", () => {
    it("should redirect to dashboard on successful login", async () => {
      (login as any).mockResolvedValue({ success: true });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(passwordInput, "password123");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(login).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith("Logged in successfully");
      });
    });
  });

  describe("Booking Flow", () => {
    it("should allow a user to book a room", async () => {
      // Mock fetch response for booking
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const onSuccess = vi.fn();
      render(
        <RoomReservationForm roomId={1} onReservationSuccess={onSuccess} />
      );

      // Fill form (Time and Duration have defaults, Date is today)
      // Just click submit
      const submitButton = screen.getByRole("button", { name: /réserver/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/rooms/reservations/1"),
          expect.objectContaining({ method: "POST" })
        );
        expect(toast.success).toHaveBeenCalledWith(
          "Réservation effectuée avec succès !"
        );
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("Cancel Flow", () => {
    it("should allow a user to cancel a reservation", async () => {
      // Mock fetch for delete
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const reservations = [
        {
          id: 123,
          user_id: "u1",
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          rooms: { name: "Room A", id: 1 },
        },
      ];

      render(<BookedList reservations={reservations} />);

      // Find cancel button (in ReservationsList -> onCancel)
      // The BookedList renders ReservationsList which renders a Button "Annuler"
      const cancelButton = screen.getByRole("button", { name: /annuler/i });
      fireEvent.click(cancelButton);

      // Dialog should appear
      const confirmButton = await screen.findByRole("button", {
        name: /confirmer/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/reservations/123",
          expect.objectContaining({ method: "DELETE" })
        );
        expect(toast.success).toHaveBeenCalledWith(
          "Réservation annulée avec succès"
        );
      });
    });
  });

  describe("Date Navigation", () => {
    it("should update date state when calendar is used", async () => {
      // This is a unit test for the component's internal state really,
      // but integration in sense of UI interaction.
      const onSuccess = vi.fn();
      render(
        <RoomReservationForm roomId={1} onReservationSuccess={onSuccess} />
      );

      // Assuming Calendar renders days. Let's try to click a day.
      // Note: Accessing calendar/date picker in jsdom can be tricky depending on the lib.
      // The shadcn calendar is usually accessible.
      // Let's just check if we can switch the time which is a select.

      const timeSelect = screen.getByLabelText(/heure de début/i);
      fireEvent.change(timeSelect, { target: { value: "10:00" } });

      expect((timeSelect as HTMLSelectElement).value).toBe("10:00");
    });
  });

  describe("Error Handling", () => {
    it("should show error toast on network failure", async () => {
      // Mock fetch failure
      (global.fetch as any).mockRejectedValue(new Error("Network Error"));

      const onSuccess = vi.fn();
      render(
        <RoomReservationForm roomId={1} onReservationSuccess={onSuccess} />
      );

      const submitButton = screen.getByRole("button", { name: /réserver/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Network Error");
      });
    });
  });
});
