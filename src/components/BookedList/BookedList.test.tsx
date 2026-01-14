import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookedList } from "./index";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("../ReservationsList", () => ({
  ReservationsList: ({ onCancel }: any) => (
    <div data-testid="reservations-list">
      <button onClick={() => onCancel(123)} data-testid="cancel-btn">
        Cancel 123
      </button>
    </div>
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("BookedList", () => {
  it("renders ReservationsList", () => {
    render(<BookedList reservations={[]} />);
    expect(screen.getByTestId("reservations-list")).toBeInTheDocument();
  });

  it("opens alert dialog when cancel is clicked", () => {
    render(<BookedList reservations={[]} />);

    // Simulate clicking cancel in the child component
    fireEvent.click(screen.getByTestId("cancel-btn"));

    // Look for Alert Dialog content (from shadcn ui/radix)
    // "Êtes-vous sûr ?" is in the title
    expect(screen.getByText("Êtes-vous sûr ?")).toBeInTheDocument();
  });
});
