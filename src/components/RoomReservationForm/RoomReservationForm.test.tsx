import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoomReservationForm } from "./index";

// Mock sonner to avoid toast dependency
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Calendar component to avoid complex UI dependency
vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({
    selected,
    onSelect,
  }: {
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
  }) => (
    <div data-testid="mock-calendar">
      <span data-testid="selected-date">
        {selected ? selected.toISOString() : "No date selected"}
      </span>
      <button
        type="button"
        onClick={() => onSelect && onSelect(new Date())}
        data-testid="select-date-btn"
      >
        Select Date
      </button>
    </div>
  ),
}));

describe("RoomReservationForm - Unit Test (Smoke Test)", () => {
  const mockOnReservationSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(
      <RoomReservationForm
        roomId={1}
        onReservationSuccess={mockOnReservationSuccess}
      />
    );
    expect(screen.getByText("Réserver un créneau")).toBeInTheDocument();
  });

  it("should render form elements", () => {
    render(
      <RoomReservationForm
        roomId={1}
        onReservationSuccess={mockOnReservationSuccess}
      />
    );
    expect(screen.getByText("Réserver un créneau")).toBeInTheDocument();
    expect(screen.getByText("Réserver")).toBeInTheDocument();
    // Check for label text presence (not label-input association for smoke test)
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Heure de début")).toBeInTheDocument();
    expect(screen.getByText("Durée")).toBeInTheDocument();
  });

  it("should render Calendar component", () => {
    render(
      <RoomReservationForm
        roomId={1}
        onReservationSuccess={mockOnReservationSuccess}
      />
    );
    expect(screen.getByTestId("mock-calendar")).toBeInTheDocument();
  });

  it("should render submit button", () => {
    render(
      <RoomReservationForm
        roomId={1}
        onReservationSuccess={mockOnReservationSuccess}
      />
    );
    const submitButton = screen.getByText("Réserver");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute("type", "submit");
  });

  it("should render with different roomId", () => {
    render(
      <RoomReservationForm
        roomId={999}
        onReservationSuccess={mockOnReservationSuccess}
      />
    );
    expect(screen.getByText("Réserver un créneau")).toBeInTheDocument();
  });

  it("should render time and duration selects with default values", () => {
    render(
      <RoomReservationForm
        roomId={1}
        onReservationSuccess={mockOnReservationSuccess}
      />
    );
    const timeSelect = screen.getByLabelText(
      "Heure de début"
    ) as HTMLSelectElement;
    const durationSelect = screen.getByLabelText("Durée") as HTMLSelectElement;

    expect(timeSelect).toBeInTheDocument();
    expect(durationSelect).toBeInTheDocument();
    expect(timeSelect.value).toBe("09:00");
    expect(durationSelect.value).toBe("30");
  });
});
